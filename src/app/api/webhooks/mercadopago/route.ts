import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  marcarPagamentosLocaisRefunded,
  tentarEstornoCdc,
} from "@/lib/mercadopago/cancelar-assinatura";
import { buscarPagamentoInicialAprovado } from "@/lib/mercadopago/client";
import {
  cobrancaAssinaturaAprovada,
  extrairPaymentIdDeInvoice,
  extrairPaymentStatusDeInvoice,
  garantirConviteEEmailsPosCompra,
  normalizarTopicoWebhook,
} from "@/lib/mercadopago/pos-compra";
import { dentroPrazoArrependimentoCdc } from "@/lib/assinatura-format";
import {
  PRECO_CHEQUE_ANUAL,
  PRECO_CHEQUE_JEC,
  PRECO_CHEQUE_MENSAL,
  planoPorValor,
} from "@/lib/planos-facto";
import { processarPagamentoPacoteExtra } from "@/lib/mercadopago/pacotes-extras";
import { sincronizarAssinaturaPorEmail } from "@/lib/mercadopago/sincronizar-assinatura";

const MP_API = "https://api.mercadopago.com";
const VALOR_MENSAL = PRECO_CHEQUE_MENSAL;
const VALOR_ANUAL = PRECO_CHEQUE_ANUAL;
const VALOR_JEC = PRECO_CHEQUE_JEC;
const DIA_EM_MS = 24 * 60 * 60 * 1000;
const DURACAO_CICLO_DIAS: Record<"jec" | "mensal" | "anual", number> = {
  jec: 30,
  mensal: 30,
  anual: 365,
};

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Confere o cabeçalho x-signature enviado pelo Mercado Pago.
 * Sem secret configurado, aceita (dev). Com secret: valida HMAC.
 */
function assinaturaValida(request: Request, dataId: string | null): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.warn(
      "[webhook mercadopago] MERCADOPAGO_WEBHOOK_SECRET não configurada; pulando validação de assinatura."
    );
    return true;
  }

  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");
  if (!xSignature) return false;

  let ts = "";
  let v1 = "";
  for (const parte of xSignature.split(",")) {
    const [chave, valor] = parte.split("=");
    if (chave?.trim() === "ts") ts = valor?.trim() ?? "";
    if (chave?.trim() === "v1") v1 = valor?.trim() ?? "";
  }
  if (!ts || !v1) return false;

  let manifest = "";
  if (dataId) manifest += `id:${dataId.toLowerCase()};`;
  if (xRequestId) manifest += `request-id:${xRequestId};`;
  manifest += `ts:${ts};`;

  const hash = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  return hash === v1;
}

function inferirPlano(
  valor: number | null,
  frequencyType: string | undefined,
  frequency: number | undefined
): "jec" | "mensal" | "anual" | null {
  if (frequencyType === "months" && frequency === 12) return "anual";
  if (frequencyType === "months" && frequency === 1) {
    // Mensal JEC vs Completo: distingue pelo valor
    const porValor = planoPorValor(valor);
    if (porValor === "jec" || porValor === "mensal") return porValor;
    if (typeof valor === "number") {
      if (Math.abs(valor - VALOR_JEC) < 1) return "jec";
      if (Math.abs(valor - VALOR_MENSAL) < 1) return "mensal";
    }
    return "mensal";
  }
  return planoPorValor(valor);
}

async function chamarApiMercadoPago(caminho: string) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado.");
  }
  const resposta = await fetch(`${MP_API}${caminho}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resposta.ok) {
    throw new Error(
      `Mercado Pago respondeu ${resposta.status} em ${caminho}: ${await resposta.text()}`
    );
  }
  return resposta.json();
}

async function processarPreapproval(admin: AdminClient, id: string) {
  const preapproval = await chamarApiMercadoPago(`/preapproval/${id}`);

  const status = preapproval.status as string | undefined;
  if (!status) return;

  const email = (preapproval.payer_email as string | undefined) ?? null;
  const valorRaw = preapproval.auto_recurring?.transaction_amount ?? null;
  const valor =
    typeof valorRaw === "number"
      ? valorRaw
      : typeof valorRaw === "string"
        ? parseFloat(valorRaw)
        : null;
  const plano = inferirPlano(
    valor,
    preapproval.auto_recurring?.frequency_type,
    preapproval.auto_recurring?.frequency
  );

  let profileId: string | null = null;
  if (email) {
    const { data: perfil } = await admin
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .maybeSingle();
    profileId = perfil?.id ?? null;
  }

  const { data: existente } = await admin
    .from("assinaturas")
    .select("id, status, motivo_encerramento, data_inicio, acesso_valido_ate")
    .eq("mp_preapproval_id", id)
    .maybeSingle();

  const dataInicio = preapproval.date_created ?? existente?.data_inicio ?? null;

  const dados: Record<string, unknown> = {
    mp_preapproval_id: id,
    profile_id: profileId,
    email,
    plano,
    valor,
    status,
    data_inicio: dataInicio,
    atualizado_em: new Date().toISOString(),
  };

  if (status === "authorized" && !existente?.acesso_valido_ate && dataInicio && plano) {
    dados.acesso_valido_ate = new Date(
      new Date(dataInicio).getTime() + DURACAO_CICLO_DIAS[plano] * DIA_EM_MS
    ).toISOString();
  }

  if (status === "canceled") {
    let pagamentoInicial = null as Awaited<
      ReturnType<typeof buscarPagamentoInicialAprovado>
    >;
    try {
      pagamentoInicial = await buscarPagamentoInicialAprovado(id);
    } catch (erro) {
      console.warn(
        "[webhook mercadopago] não foi possível buscar pagamento p/ CDC",
        erro
      );
    }

    const dentroPrazoCdc = dentroPrazoArrependimentoCdc(
      pagamentoInicial?.debitDate ?? dataInicio
    );

    if (existente?.status !== "canceled") {
      dados.data_cancelamento = new Date().toISOString();

      if (dentroPrazoCdc) {
        dados.motivo_encerramento =
          existente?.motivo_encerramento ?? "arrependimento_cdc";
        dados.acesso_valido_ate = new Date(Date.now() - 1000).toISOString();
      } else if (!existente?.motivo_encerramento) {
        dados.motivo_encerramento = "cancelado_pelo_cliente";
      }
    }

    if (dentroPrazoCdc) {
      const { estorno } = await tentarEstornoCdc({
        mpPreapprovalId: id,
        pagamentoFallback: pagamentoInicial,
      });
      if (estorno.sucesso) {
        await marcarPagamentosLocaisRefunded(admin, {
          paymentId: estorno.paymentId,
          invoiceId: estorno.invoiceId,
        });
      } else if (estorno.aviso) {
        console.error(
          "[webhook mercadopago] CDC sem estorno automático:",
          estorno.aviso
        );
      }
    }
  }

  await admin.from("assinaturas").upsert(dados, { onConflict: "mp_preapproval_id" });

  // Caminho complementar: se o tópico authorized_payment não chegar (ou
  // chegar com tópico alias), ainda assim disparamos pós-compra quando a
  // assinatura autoriza e já existe cobrança aprovada (ou usamos chave
  // estável da preapproval).
  if (status === "authorized" && email) {
    let mpPaymentId: string | null = null;
    let valorPago: number | null =
      typeof valor === "number" && !Number.isNaN(valor) ? valor : null;

    try {
      const pagamento = await buscarPagamentoInicialAprovado(id);
      if (pagamento?.paymentId) {
        mpPaymentId = pagamento.paymentId;
      }
    } catch (erro) {
      console.warn(
        "[webhook mercadopago] preapproval authorized sem fatura ainda",
        erro
      );
    }

    if (!mpPaymentId) {
      mpPaymentId = `preapproval:${id}`;
    }

    console.info("[webhook mercadopago] pós-compra via preapproval authorized", {
      email,
      mpPaymentId,
    });
    await garantirConviteEEmailsPosCompra(admin, {
      email,
      mpPaymentId,
      valor: valorPago,
    });
  }
}

async function processarAuthorizedPayment(admin: AdminClient, id: string) {
  const invoice = await chamarApiMercadoPago(`/authorized_payments/${id}`);

  const preapprovalId = invoice.preapproval_id as string | undefined;
  const paymentId = extrairPaymentIdDeInvoice(invoice.payment);
  const paymentStatus = extrairPaymentStatusDeInvoice(invoice.payment);
  const statusPagamento: string | undefined =
    paymentStatus ?? (invoice.status as string | undefined) ?? undefined;
  const cobrancaAprovada = cobrancaAssinaturaAprovada(invoice);
  const valor =
    typeof invoice.transaction_amount === "string"
      ? parseFloat(invoice.transaction_amount)
      : (invoice.transaction_amount as number | null);
  const mpPaymentId = paymentId ?? String(id);

  let assinaturaId: string | null = null;
  let emailCliente: string | null = null;

  if (preapprovalId) {
    const { data: assinatura } = await admin
      .from("assinaturas")
      .select("id, plano, email")
      .eq("mp_preapproval_id", preapprovalId)
      .maybeSingle();
    assinaturaId = assinatura?.id ?? null;
    emailCliente = (assinatura?.email as string | undefined) ?? null;

    if (!emailCliente) {
      try {
        const preapproval = await chamarApiMercadoPago(
          `/preapproval/${preapprovalId}`
        );
        emailCliente =
          (preapproval.payer_email as string | undefined) ?? null;
      } catch (erro) {
        console.warn(
          "[webhook mercadopago] não foi possível obter e-mail do preapproval",
          erro
        );
      }
    }

    if (assinaturaId && cobrancaAprovada) {
      const plano =
        (assinatura?.plano as "jec" | "mensal" | "anual" | null) ?? "mensal";
      const dataPagamento = invoice.debit_date
        ? new Date(invoice.debit_date)
        : new Date();
      const acessoValidoAte = new Date(
        dataPagamento.getTime() + DURACAO_CICLO_DIAS[plano] * DIA_EM_MS
      ).toISOString();

      await admin
        .from("assinaturas")
        .update({
          acesso_valido_ate: acessoValidoAte,
          ...(emailCliente ? { email: emailCliente } : {}),
        })
        .eq("id", assinaturaId);
    } else if (
      assinaturaId &&
      (statusPagamento === "rejected" ||
        statusPagamento === "cancelled" ||
        statusPagamento === "canceled" ||
        statusPagamento === "refunded" ||
        statusPagamento === "charged_back")
    ) {
      const corteImediato =
        statusPagamento === "refunded" ||
        statusPagamento === "charged_back" ||
        statusPagamento === "cancelled" ||
        statusPagamento === "canceled";
      await admin
        .from("assinaturas")
        .update({
          motivo_encerramento:
            statusPagamento === "refunded" || statusPagamento === "charged_back"
              ? "arrependimento_cdc"
              : "pagamento_recusado",
          ...(corteImediato
            ? {
                status: "canceled",
                acesso_valido_ate: new Date(Date.now() - 1000).toISOString(),
                data_cancelamento: new Date().toISOString(),
              }
            : {}),
        })
        .eq("id", assinaturaId);
    }
  }

  if (!emailCliente && paymentId) {
    try {
      const payment = await chamarApiMercadoPago(`/v1/payments/${paymentId}`);
      emailCliente =
        (payment.payer?.email as string | undefined) ??
        (payment.additional_info?.payer?.email as string | undefined) ??
        null;
    } catch (erro) {
      console.warn(
        "[webhook mercadopago] não foi possível obter e-mail do payment",
        erro
      );
    }
  }

  if (assinaturaId && emailCliente) {
    await admin
      .from("assinaturas")
      .update({ email: emailCliente })
      .eq("id", assinaturaId);
  }

  await admin.from("pagamentos").upsert(
    {
      mp_payment_id: mpPaymentId,
      assinatura_id: assinaturaId,
      valor,
      status: statusPagamento ?? null,
      pago_em: invoice.debit_date ?? null,
    },
    { onConflict: "mp_payment_id" }
  );

  if (cobrancaAprovada) {
    if (!emailCliente) {
      console.error(
        "[webhook mercadopago] cobrança aprovada sem e-mail do pagador; mp_payment_id=",
        mpPaymentId,
        "preapproval=",
        preapprovalId,
        "invoice_status=",
        invoice.status,
        "payment_status=",
        paymentStatus
      );
      return;
    }
    console.info("[webhook mercadopago] pós-compra via authorized_payment", {
      email: emailCliente,
      mpPaymentId,
    });
    await garantirConviteEEmailsPosCompra(admin, {
      email: emailCliente,
      mpPaymentId,
      valor: typeof valor === "number" && !Number.isNaN(valor) ? valor : null,
    });
  } else {
    console.info(
      "[webhook mercadopago] authorized_payment sem e-mails (não aprovado)",
      {
        id,
        mpPaymentId,
        invoiceStatus: invoice.status,
        paymentStatus,
      }
    );
  }
}

async function processarPayment(admin: AdminClient, id: string) {
  const payment = await chamarApiMercadoPago(`/v1/payments/${id}`);

  if (payment.status !== "approved") return;

  const email = (payment.payer?.email as string | undefined) ?? null;
  if (!email) {
    console.error(
      "[webhook mercadopago] payment aprovado sem payer.email; id=",
      id
    );
    return;
  }

  const valor =
    typeof payment.transaction_amount === "number"
      ? payment.transaction_amount
      : typeof payment.transaction_amount === "string"
        ? parseFloat(payment.transaction_amount)
        : null;

  const externalReference =
    typeof payment.external_reference === "string"
      ? payment.external_reference
      : null;
  const metadata =
    payment.metadata && typeof payment.metadata === "object"
      ? (payment.metadata as Record<string, unknown>)
      : null;

  // Compra avulsa (+50 / +100) — não gera convite de assinatura.
  const extra = await processarPagamentoPacoteExtra({
    mpPaymentId: String(id),
    email,
    valor,
    externalReference,
    metadata,
  });
  if (extra.ok) {
    console.info("[webhook mercadopago] pacote extra creditado", {
      email,
      mpPaymentId: String(id),
      pacoteId: extra.pacoteId,
      pecas: extra.pecas,
      jaProcessado: extra.jaProcessado ?? false,
    });
    if (!extra.jaProcessado) {
      const { enviarEmailsFinanceiroPacoteExtra } = await import(
        "@/lib/email/pacote-extra"
      );
      const { pacoteExtraPorId } = await import("@/lib/planos-facto");
      const pacote = pacoteExtraPorId(extra.pacoteId);
      await enviarEmailsFinanceiroPacoteExtra({
        emailCliente: email,
        valor,
        mpPaymentId: String(id),
        pecas: extra.pecas,
        pacoteRotulo: pacote?.rotulo ?? extra.pacoteId,
      });
    }
    return;
  }
  // Tentativa de pacote extra que falhou (ex.: e-mail diferente da conta) —
  // não cair no fluxo de convite de assinatura.
  if (extra.motivo !== "nao_e_pacote_extra") {
    console.error(
      "[webhook mercadopago] pacote extra não creditado",
      { id, email, valor, motivo: extra.motivo }
    );
    return;
  }

  // Tenta materializar assinatura local se o tópico preapproval nao chegou
  try {
    await sincronizarAssinaturaPorEmail(admin, email);
  } catch (erro) {
    console.warn("[webhook mercadopago] sync assinatura via payment", erro);
  }

  console.info("[webhook mercadopago] pós-compra via payment", {
    email,
    mpPaymentId: String(id),
  });
  await garantirConviteEEmailsPosCompra(admin, {
    email,
    mpPaymentId: String(id),
    valor,
  });
}

function extrairIdRecurso(valor: unknown): string | null {
  if (valor == null) return null;
  if (typeof valor === "number") return String(valor);
  if (typeof valor !== "string") return null;
  const t = valor.trim();
  if (!t) return null;
  // IPN antigo: "https://api.mercadopago.com/authorized_payments/123"
  const m = t.match(/\/(authorized_payments|preapproval|payments|v1\/payments)\/([^/?#]+)/i);
  if (m?.[2]) return m[2];
  // Só o id
  if (/^[A-Za-z0-9_-]+$/.test(t)) return t;
  return null;
}

/** IDs de simulação do painel "Testear" do Mercado Pago — não são cobranças reais. */
function ehIdSimulacaoMp(id: string | null): boolean {
  if (!id) return false;
  return /^(123456|123456789|1234567890|1234567|999999)$/.test(id);
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const dataIdQuery =
    url.searchParams.get("data.id") ?? url.searchParams.get("id");
  const topicoQuery =
    url.searchParams.get("type") ?? url.searchParams.get("topic");

  let body: Record<string, unknown> | null = null;
  try {
    body = await request.json();
  } catch {
    // Corpo vazio é normal em pings de verificação do Mercado Pago.
  }

  const dataObj = body?.data as Record<string, unknown> | undefined;
  const idFinal =
    dataIdQuery ??
    extrairIdRecurso(dataObj?.id) ??
    extrairIdRecurso(body?.id) ??
    extrairIdRecurso(body?.resource) ??
    null;
  const topicoBruto =
    topicoQuery ??
    (body?.type as string | undefined) ??
    (body?.topic as string | undefined) ??
    null;
  const topicoFinal = normalizarTopicoWebhook(topicoBruto ?? "desconhecido");

  let admin: AdminClient;
  try {
    admin = createAdminClient();
  } catch (erro) {
    console.error(
      "[webhook mercadopago]",
      erro instanceof Error ? erro.message : erro
    );
    return NextResponse.json({
      recebido: true,
      aviso: "Serviço não configurado ainda.",
    });
  }

  // Ping de verificação / corpo vazio — só confirma URL.
  if (!idFinal && topicoFinal === "desconhecido") {
    return NextResponse.json({ ok: true, ping: true });
  }

  if (ehIdSimulacaoMp(idFinal)) {
    await admin.from("webhook_eventos_mp").insert({
      topico: topicoFinal,
      mp_id: idFinal,
      payload: { ...(body ?? {}), _simulacao: true },
      processado: true,
      erro: "Simulação do painel Mercado Pago (ID de teste) — ignorado",
    });
    return NextResponse.json({
      recebido: true,
      aviso: "Simulação ignorada",
    });
  }

  const assinaturaOk = assinaturaValida(request, idFinal);

  const { data: eventoLog } = await admin
    .from("webhook_eventos_mp")
    .insert({
      topico: topicoFinal,
      mp_id: idFinal,
      payload: {
        ...(body ?? {}),
        _query: Object.fromEntries(url.searchParams.entries()),
        _topico_bruto: topicoBruto,
        _assinatura_ok: assinaturaOk,
      },
    })
    .select("id")
    .maybeSingle();

  if (!assinaturaOk) {
    console.warn(
      "[webhook mercadopago] assinatura HMAC inválida ou ausente — processando mesmo assim. Confira MERCADOPAGO_WEBHOOK_SECRET."
    );
    if (eventoLog) {
      await admin
        .from("webhook_eventos_mp")
        .update({
          erro: "assinatura HMAC inválida/ausente (processado com aviso)",
        })
        .eq("id", eventoLog.id);
    }
  }

  try {
    if (idFinal && topicoFinal === "subscription_preapproval") {
      await processarPreapproval(admin, idFinal);
    } else if (idFinal && topicoFinal === "subscription_authorized_payment") {
      await processarAuthorizedPayment(admin, idFinal);
    } else if (idFinal && topicoFinal === "payment") {
      await processarPayment(admin, idFinal);
    } else {
      console.warn("[webhook mercadopago] tópico não tratado", {
        topicoBruto,
        topicoFinal,
        idFinal,
      });
      if (eventoLog) {
        await admin
          .from("webhook_eventos_mp")
          .update({
            erro: `tópico não tratado: ${topicoBruto ?? "?"} → ${topicoFinal}`,
          })
          .eq("id", eventoLog.id);
      }
    }

    if (eventoLog) {
      await admin
        .from("webhook_eventos_mp")
        .update({ processado: true })
        .eq("id", eventoLog.id);
    }
  } catch (erro) {
    console.error("[webhook mercadopago] erro ao processar evento", erro);
    if (eventoLog) {
      await admin
        .from("webhook_eventos_mp")
        .update({
          erro: erro instanceof Error ? erro.message : String(erro),
        })
        .eq("id", eventoLog.id);
    }
  }

  return NextResponse.json({ recebido: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
