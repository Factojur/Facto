import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { enviarEmailConvite } from "@/lib/email/convite-pago";

const MP_API = "https://api.mercadopago.com";
const VALOR_MENSAL = 49.9;
const VALOR_ANUAL = 478.8;
const DIA_EM_MS = 24 * 60 * 60 * 1000;
// Art. 49 do CDC: direito de arrependimento em até 7 dias da contratação.
const PRAZO_ARREPENDIMENTO_CDC_DIAS = 7;
const DURACAO_CICLO_DIAS: Record<"mensal" | "anual", number> = {
  mensal: 30,
  anual: 365,
};

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Confere o cabeçalho x-signature enviado pelo Mercado Pago, seguindo o
 * algoritmo oficial: HMAC-SHA256 de "id:{data.id};request-id:{x-request-id};ts:{ts};"
 * usando a chave secreta configurada no painel de Webhooks.
 *
 * Sem a chave configurada (ex.: ambiente local, sem URL pública ainda),
 * deixamos passar mas avisamos no log — configure antes de ir para produção.
 */
function assinaturaValida(request: Request, dataId: string | null): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
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
): "mensal" | "anual" | null {
  if (frequencyType === "months" && frequency === 12) return "anual";
  if (frequencyType === "months" && frequency === 1) return "mensal";
  if (typeof valor === "number") {
    if (Math.abs(valor - VALOR_ANUAL) < 1) return "anual";
    if (Math.abs(valor - VALOR_MENSAL) < 1) return "mensal";
  }
  return null;
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
  const valor = preapproval.auto_recurring?.transaction_amount ?? null;
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
      .eq("email", email)
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

  // Assinatura recém-autorizada e ainda sem nenhum pagamento confirmado:
  // libera acesso por um ciclo, como estimativa inicial. O webhook de
  // pagamento aprovado (processarAuthorizedPayment) substitui esse valor
  // pela data real assim que a primeira cobrança é confirmada.
  if (status === "authorized" && !existente?.acesso_valido_ate && dataInicio && plano) {
    dados.acesso_valido_ate = new Date(
      new Date(dataInicio).getTime() + DURACAO_CICLO_DIAS[plano] * DIA_EM_MS
    ).toISOString();
  }

  // "canceled" é um cancelamento explícito e irreversível no Mercado Pago.
  if (status === "canceled" && existente?.status !== "canceled") {
    dados.data_cancelamento = new Date().toISOString();

    const diasDesdeContratacao = dataInicio
      ? (Date.now() - new Date(dataInicio).getTime()) / DIA_EM_MS
      : Infinity;

    if (diasDesdeContratacao <= PRAZO_ARREPENDIMENTO_CDC_DIAS) {
      // Direito de arrependimento (art. 49, CDC): corte imediato de acesso.
      dados.motivo_encerramento = existente?.motivo_encerramento ?? "arrependimento_cdc";
      dados.acesso_valido_ate = new Date().toISOString();
    } else if (!existente?.motivo_encerramento) {
      // Cancelamento fora do prazo do CDC: mantém acesso_valido_ate como já
      // calculado pelo último pagamento aprovado — o acesso segue até o fim
      // do ciclo já pago, não é cortado na hora.
      dados.motivo_encerramento = "cancelado_pelo_cliente";
    }
  }

  await admin.from("assinaturas").upsert(dados, { onConflict: "mp_preapproval_id" });
}

async function processarAuthorizedPayment(admin: AdminClient, id: string) {
  const invoice = await chamarApiMercadoPago(`/authorized_payments/${id}`);

  const preapprovalId = invoice.preapproval_id as string | undefined;
  const statusPagamento: string | undefined =
    invoice.payment?.status ?? invoice.status ?? undefined;
  const valor =
    typeof invoice.transaction_amount === "string"
      ? parseFloat(invoice.transaction_amount)
      : (invoice.transaction_amount as number | null);

  let assinaturaId: string | null = null;
  if (preapprovalId) {
    const { data: assinatura } = await admin
      .from("assinaturas")
      .select("id, plano")
      .eq("mp_preapproval_id", preapprovalId)
      .maybeSingle();
    assinaturaId = assinatura?.id ?? null;

    if (assinaturaId && statusPagamento === "approved") {
      // Cada pagamento aprovado estende o acesso por um ciclo do plano a
      // partir da data da cobrança — é assim que "não renovou" se resolve
      // sozinho: sem um novo pagamento aprovado, essa data para de avançar
      // e o acesso expira naturalmente quando ela é ultrapassada.
      const plano = (assinatura?.plano as "mensal" | "anual" | null) ?? "mensal";
      const dataPagamento = invoice.debit_date ? new Date(invoice.debit_date) : new Date();
      const acessoValidoAte = new Date(
        dataPagamento.getTime() + DURACAO_CICLO_DIAS[plano] * DIA_EM_MS
      ).toISOString();

      await admin
        .from("assinaturas")
        .update({ acesso_valido_ate: acessoValidoAte })
        .eq("id", assinaturaId);
    } else if (assinaturaId && statusPagamento && statusPagamento !== "approved") {
      // Cobrança recorrente falhou/foi recusada numa assinatura que ainda
      // não tinha motivo de encerramento registrado: marcamos como "não
      // renovou" (diferente de um cancelamento explícito pelo cliente). O
      // acesso_valido_ate não é alterado aqui — continua valendo até o fim
      // do último ciclo que foi de fato pago.
      await admin
        .from("assinaturas")
        .update({ motivo_encerramento: "pagamento_recusado" })
        .eq("id", assinaturaId)
        .is("motivo_encerramento", null);
    }
  }

  await admin.from("pagamentos").upsert(
    {
      mp_payment_id: String(id),
      assinatura_id: assinaturaId,
      valor,
      status: statusPagamento ?? null,
      pago_em: invoice.debit_date ?? null,
    },
    { onConflict: "mp_payment_id" }
  );
}

/**
 * Pagamento avulso aprovado (ex.: link de pagamento do Checkout Pro): gera
 * um convite de acesso com token único e dispara o e-mail de boas-vindas
 * com o link de cadastro. Idempotente por mp_payment_id — se o Mercado Pago
 * reenviar a mesma notificação, não duplica o convite nem reenvia o e-mail.
 */
async function processarPayment(admin: AdminClient, id: string) {
  const payment = await chamarApiMercadoPago(`/v1/payments/${id}`);

  if (payment.status !== "approved") return;

  const email = (payment.payer?.email as string | undefined) ?? null;
  if (!email) return;

  const { data: existente } = await admin
    .from("convites_pagos")
    .select("id")
    .eq("mp_payment_id", String(id))
    .maybeSingle();
  if (existente) return;

  const token = crypto.randomBytes(32).toString("hex");

  const { error: erroInsercao } = await admin.from("convites_pagos").insert({
    email,
    token,
    status: "pendente",
    mp_payment_id: String(id),
  });
  if (erroInsercao) throw erroInsercao;

  await enviarEmailConvite(email, token);
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const dataIdQuery = url.searchParams.get("data.id") ?? url.searchParams.get("id");
  const topicoQuery = url.searchParams.get("type") ?? url.searchParams.get("topic");

  let body: Record<string, unknown> | null = null;
  try {
    body = await request.json();
  } catch {
    // Corpo vazio é normal em pings de verificação do Mercado Pago.
  }

  const dataObj = body?.data as Record<string, unknown> | undefined;
  const idFinal = dataIdQuery ?? (dataObj?.id as string | number | undefined)?.toString() ?? null;
  const topicoFinal =
    topicoQuery ?? (body?.type as string | undefined) ?? (body?.topic as string | undefined) ?? "desconhecido";

  if (!assinaturaValida(request, idFinal)) {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  }

  let admin: AdminClient;
  try {
    admin = createAdminClient();
  } catch (erro) {
    // SUPABASE_SERVICE_ROLE_KEY ainda não configurada (ex.: setup inicial).
    // Respondemos 200 mesmo assim: um 5xx faria o Mercado Pago reenviar a
    // notificação repetidamente sem necessidade.
    console.error("[webhook mercadopago]", erro instanceof Error ? erro.message : erro);
    return NextResponse.json({ recebido: true, aviso: "Serviço não configurado ainda." });
  }

  const { data: eventoLog } = await admin
    .from("webhook_eventos_mp")
    .insert({ topico: topicoFinal, mp_id: idFinal, payload: body ?? {} })
    .select("id")
    .maybeSingle();

  // Sempre respondemos 200 no final: se o processamento falhar, guardamos o
  // erro no log do evento (o Mercado Pago reenvia notificações não
  // confirmadas, mas um 4xx/5xx pode causar reenvios excessivos e ruído).
  try {
    if (idFinal && topicoFinal === "subscription_preapproval") {
      await processarPreapproval(admin, idFinal);
    } else if (idFinal && topicoFinal === "subscription_authorized_payment") {
      await processarAuthorizedPayment(admin, idFinal);
    } else if (idFinal && topicoFinal === "payment") {
      await processarPayment(admin, idFinal);
    }

    if (eventoLog) {
      await admin.from("webhook_eventos_mp").update({ processado: true }).eq("id", eventoLog.id);
    }
  } catch (erro) {
    console.error("[webhook mercadopago] erro ao processar evento", erro);
    if (eventoLog) {
      await admin
        .from("webhook_eventos_mp")
        .update({ erro: erro instanceof Error ? erro.message : String(erro) })
        .eq("id", eventoLog.id);
    }
  }

  return NextResponse.json({ recebido: true });
}

export async function GET() {
  // O Mercado Pago faz uma checagem simples ao salvar a URL do webhook no
  // painel de integrações; um 200 aqui confirma que a URL está ativa.
  return NextResponse.json({ ok: true });
}
