/**
 * Cliente mínimo da API Mercado Pago (server-only).
 */

const MP_API = "https://api.mercadopago.com";

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
