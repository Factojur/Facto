/**
 * Cliente mínimo da API Mercado Pago (server-only).
 */

const MP_API = "https://api.mercadopago.com";

export type FaturaAssinaturaMp = {
  id: number | string;
  preapproval_id?: string;
  debit_date?: string | null;
  date_created?: string | null;
  status?: string | null;
  transaction_amount?: number | string | null;
  payment?: {
    id?: number | string | null;
    status?: string | null;
    status_detail?: string | null;
  } | null;
};

export type PagamentoInicialAssinatura = {
  invoiceId: string;
  paymentId: string;
  debitDate: string | null;
  status: string;
};

export type EstornoMp = {
  id: number | string;
  payment_id: number | string;
  amount?: number;
  status?: string;
};

export async function chamarMercadoPago(
  caminho: string,
  init?: RequestInit
): Promise<unknown> {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  if (!token) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado.");
  }

  const resposta = await fetch(`${MP_API}${caminho}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!resposta.ok) {
    const corpo = await resposta.text();
    throw new Error(
      `Mercado Pago respondeu ${resposta.status} em ${caminho}: ${corpo}`
    );
  }

  if (resposta.status === 204) return null;
  return resposta.json();
}

/** Cancela uma assinatura (preapproval) de forma irreversível. */
export async function cancelarPreapprovalMercadoPago(
  mpPreapprovalId: string
): Promise<void> {
  await chamarMercadoPago(`/preapproval/${mpPreapprovalId}`, {
    method: "PUT",
    body: JSON.stringify({ status: "canceled" }),
  });
}

type PaymentCampo =
  | FaturaAssinaturaMp["payment"]
  | number
  | string
  | null
  | undefined;

function extrairPaymentId(payment: PaymentCampo): string | null {
  if (payment == null) return null;
  if (typeof payment === "number" || typeof payment === "string") {
    const id = String(payment).trim();
    return id || null;
  }
  if (typeof payment === "object" && payment.id != null) {
    const id = String(payment.id).trim();
    return id || null;
  }
  return null;
}

function extrairPaymentStatus(payment: PaymentCampo): string | null {
  if (payment == null || typeof payment !== "object") return null;
  return typeof payment.status === "string" ? payment.status : null;
}

/** Status de fatura/pagamento que permitem estorno total. */
function pagamentoEstornavel(status: string | null | undefined): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  return s === "approved" || s === "processed" || s === "accredited";
}

/**
 * Lista faturas (authorized_payments) de uma assinatura.
 * GET /authorized_payments/search?preapproval_id=...
 */
export async function buscarFaturasDaAssinatura(
  mpPreapprovalId: string
): Promise<FaturaAssinaturaMp[]> {
  const qs = new URLSearchParams({
    preapproval_id: mpPreapprovalId,
    limit: "12",
    offset: "0",
  });
  const data = (await chamarMercadoPago(
    `/authorized_payments/search?${qs.toString()}`
  )) as { results?: FaturaAssinaturaMp[] };

  return Array.isArray(data?.results) ? data.results : [];
}

async function detalharFatura(
  invoiceId: string | number
): Promise<FaturaAssinaturaMp | null> {
  try {
    return (await chamarMercadoPago(
      `/authorized_payments/${invoiceId}`
    )) as FaturaAssinaturaMp;
  } catch (erro) {
    console.warn(
      "[mercadopago] falha ao detalhar authorized_payment",
      invoiceId,
      erro
    );
    return null;
  }
}

function faturaParaPagamentoInicial(
  fatura: FaturaAssinaturaMp
): PagamentoInicialAssinatura | null {
  const paymentId = extrairPaymentId(fatura.payment as PaymentCampo);
  if (!paymentId) return null;

  const statusPagamento =
    extrairPaymentStatus(fatura.payment as PaymentCampo) ??
    (typeof fatura.status === "string" ? fatura.status : null);

  if (!pagamentoEstornavel(statusPagamento)) return null;

  return {
    invoiceId: String(fatura.id),
    paymentId,
    debitDate: fatura.debit_date ?? fatura.date_created ?? null,
    status: statusPagamento ?? "approved",
  };
}

/**
 * Localiza o primeiro pagamento aprovado/processado da assinatura.
 * Preferimos debit_date; se ausente, date_created.
 * Se o search vier incompleto, busca o detalhe de cada fatura candidata.
 */
export async function buscarPagamentoInicialAprovado(
  mpPreapprovalId: string
): Promise<PagamentoInicialAssinatura | null> {
  const faturas = await buscarFaturasDaAssinatura(mpPreapprovalId);
  if (faturas.length === 0) return null;

  const ordenadas = [...faturas].sort((a, b) => {
    const ta = new Date(a.debit_date ?? a.date_created ?? 0).getTime();
    const tb = new Date(b.debit_date ?? b.date_created ?? 0).getTime();
    return ta - tb;
  });

  for (const fatura of ordenadas) {
    const direto = faturaParaPagamentoInicial(fatura);
    if (direto) return direto;

    // Search às vezes omite payment.id/status — detalhe resolve.
    const temSinalDeCobranca =
      Boolean(extrairPaymentId(fatura.payment as PaymentCampo)) ||
      pagamentoEstornavel(fatura.status) ||
      fatura.status === "processed";

    if (!temSinalDeCobranca) continue;

    const detalhe = await detalharFatura(fatura.id);
    if (!detalhe) continue;
    const completo = faturaParaPagamentoInicial(detalhe);
    if (completo) return completo;
  }

  return null;
}

/**
 * E-mail do pagador: preapproval.payer_email costuma vir vazio após cancelar.
 * Fallback: payment vinculado à fatura (authorized_payments → /v1/payments).
 */
export async function buscarEmailPagadorPreapproval(
  mpPreapprovalId: string,
  payerEmailHint?: string | null
): Promise<string | null> {
  const hint = payerEmailHint?.trim().toLowerCase() || null;
  if (hint && hint.includes("@")) return hint;

  try {
    const pag = await buscarPagamentoInicialAprovado(mpPreapprovalId);
    // Mesmo refunded/approved: o payment guarda o e-mail do pagador.
    if (pag?.paymentId) {
      const payment = (await chamarMercadoPago(
        `/v1/payments/${pag.paymentId}`
      )) as {
        payer?: { email?: string | null };
        additional_info?: { payer?: { email?: string | null } };
      };
      const email =
        payment.payer?.email?.trim() ||
        payment.additional_info?.payer?.email?.trim() ||
        null;
      if (email && email.includes("@")) return email.toLowerCase();
    }
  } catch (erro) {
    console.warn(
      "[mercadopago] e-mail via payment inicial",
      mpPreapprovalId,
      erro
    );
  }

  // Qualquer fatura → payment (inclusive refunded).
  try {
    const faturas = await buscarFaturasDaAssinatura(mpPreapprovalId);
    for (const fatura of faturas) {
      let paymentId = extrairPaymentId(fatura.payment as PaymentCampo);
      if (!paymentId) {
        const detalhe = await detalharFatura(fatura.id);
        paymentId = extrairPaymentId(detalhe?.payment as PaymentCampo);
      }
      if (!paymentId) continue;
      const payment = (await chamarMercadoPago(
        `/v1/payments/${paymentId}`
      )) as { payer?: { email?: string | null } };
      const email = payment.payer?.email?.trim();
      if (email && email.includes("@")) return email.toLowerCase();
    }
  } catch (erro) {
    console.warn(
      "[mercadopago] e-mail via faturas",
      mpPreapprovalId,
      erro
    );
  }

  // Último recurso: payments recentes cujo subscription_id = preapproval.
  try {
    const data = (await chamarMercadoPago(
      `/v1/payments/search?sort=date_created&criteria=desc&range=date_created&begin_date=NOW-7DAYS&end_date=NOW`
    )) as {
      results?: Array<{
        id?: number | string;
        payer?: { email?: string | null };
        point_of_interaction?: {
          transaction_data?: { subscription_id?: string | null };
        };
      }>;
    };
    for (const r of data.results ?? []) {
      const sub =
        r.point_of_interaction?.transaction_data?.subscription_id ?? null;
      if (sub && String(sub) === String(mpPreapprovalId)) {
        const email = r.payer?.email?.trim();
        if (email && email.includes("@")) return email.toLowerCase();
      }
    }
  } catch (erro) {
    console.warn(
      "[mercadopago] e-mail via payments/search",
      mpPreapprovalId,
      erro
    );
  }

  return null;
}

/**
 * Estorno total de um pagamento.
 * POST /v1/payments/{id}/refunds — sem amount = full refund.
 * Idempotency-Key estável evita estorno duplicado (API + webhook).
 */
export async function estornarPagamentoMercadoPago(
  paymentId: string,
  opcoes?: { idempotencyKey?: string }
): Promise<EstornoMp> {
  const resultado = await chamarMercadoPago(
    `/v1/payments/${paymentId}/refunds`,
    {
      method: "POST",
      headers: {
        "X-Idempotency-Key":
          opcoes?.idempotencyKey ?? `facto-cdc-refund-${paymentId}`,
      },
      // Corpo vazio: estorno integral (não enviar amount).
      body: "{}",
    }
  );

  return resultado as EstornoMp;
}

/** Chave idempotente compartilhada entre cancelamento via app e via webhook. */
export function chaveIdempotenciaEstornoCdc(paymentId: string): string {
  return `facto-cdc-refund-${paymentId}`;
}

/**
 * Aceita payment.id ou authorized_payment.id e devolve o payment.id estornável.
 */
export async function resolverIdPagamentoParaEstorno(
  possivelId: string
): Promise<string> {
  const id = possivelId.trim();
  if (!id) return id;

  try {
    const payment = (await chamarMercadoPago(`/v1/payments/${id}`)) as {
      id?: number | string;
    };
    if (payment?.id != null) return String(payment.id);
  } catch {
    // Pode ser id de fatura (authorized_payment), não de payment.
  }

  const fatura = await detalharFatura(id);
  const paymentId = extrairPaymentId(fatura?.payment as PaymentCampo);
  if (paymentId) return paymentId;

  return id;
}
