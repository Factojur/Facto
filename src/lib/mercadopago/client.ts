/**
 * Cliente mínimo da API Mercado Pago (server-only).
 */

import { randomUUID } from "node:crypto";

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

/**
 * Lista faturas (authorized_payments) de uma assinatura.
 * GET /authorized_payments/search?preapproval_id=...
 */
export async function buscarFaturasDaAssinatura(
  mpPreapprovalId: string
): Promise<FaturaAssinaturaMp[]> {
  const qs = new URLSearchParams({
    preapproval_id: mpPreapprovalId,
    limit: "50",
    offset: "0",
  });
  const data = (await chamarMercadoPago(
    `/authorized_payments/search?${qs.toString()}`
  )) as { results?: FaturaAssinaturaMp[] };

  return Array.isArray(data?.results) ? data.results : [];
}

/**
 * Localiza o primeiro pagamento aprovado da assinatura (pagamento inicial).
 * Preferimos debit_date; se ausente, date_created.
 */
export async function buscarPagamentoInicialAprovado(
  mpPreapprovalId: string
): Promise<PagamentoInicialAssinatura | null> {
  const faturas = await buscarFaturasDaAssinatura(mpPreapprovalId);

  const aprovadas = faturas
    .filter((f) => {
      const statusPagamento = f.payment?.status ?? f.status;
      const paymentId = f.payment?.id;
      return Boolean(paymentId) && statusPagamento === "approved";
    })
    .sort((a, b) => {
      const ta = new Date(a.debit_date ?? a.date_created ?? 0).getTime();
      const tb = new Date(b.debit_date ?? b.date_created ?? 0).getTime();
      return ta - tb;
    });

  const primeira = aprovadas[0];
  if (!primeira?.payment?.id) return null;

  return {
    invoiceId: String(primeira.id),
    paymentId: String(primeira.payment.id),
    debitDate: primeira.debit_date ?? primeira.date_created ?? null,
    status: primeira.payment.status ?? "approved",
  };
}

/**
 * Estorno total de um pagamento.
 * POST /v1/payments/{id}/refunds (corpo vazio = full refund).
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
          opcoes?.idempotencyKey ?? `facto-refund-${paymentId}-${randomUUID()}`,
      },
      body: JSON.stringify({}),
    }
  );

  return resultado as EstornoMp;
}
