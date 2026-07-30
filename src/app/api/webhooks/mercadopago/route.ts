import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

const MP_API = "https://api.mercadopago.com";
const VALOR_MENSAL = 49.9;
const VALOR_ANUAL = 478.8;

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
    .select("id, status, motivo_encerramento")
    .eq("mp_preapproval_id", id)
    .maybeSingle();

  const dados: Record<string, unknown> = {
    mp_preapproval_id: id,
    profile_id: profileId,
    email,
    plano,
    valor,
    status,
    data_inicio: preapproval.date_created ?? null,
    atualizado_em: new Date().toISOString(),
  };

  // "canceled" é um cancelamento explícito e irreversível no Mercado Pago —
  // diferencia de "pagamento_recusado", que é marcado à parte quando uma
  // cobrança recorrente falha (ver processarAuthorizedPayment).
  if (status === "canceled" && existente?.status !== "canceled") {
    dados.data_cancelamento = new Date().toISOString();
    if (!existente?.motivo_encerramento) {
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
      .select("id")
      .eq("mp_preapproval_id", preapprovalId)
      .maybeSingle();
    assinaturaId = assinatura?.id ?? null;

    // Cobrança recorrente falhou/foi recusada numa assinatura que ainda não
    // tinha motivo de encerramento registrado: marcamos como "não renovou"
    // (diferente de um cancelamento explícito pelo cliente).
    if (assinaturaId && statusPagamento && statusPagamento !== "approved") {
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
