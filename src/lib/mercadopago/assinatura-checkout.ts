/**
 * Checkout de assinatura (preapproval MP) com token FACTO → userId.
 * Renovação automática segue no MP; o token só vincula a 1ª compra à conta.
 */

import { chamarMercadoPago } from "@/lib/mercadopago/client";
import { getSiteUrl } from "@/lib/site-url";
import {
  catalogoPlanoCheckout,
  frequenciaCheckout,
  montarExternalReferenceUpgrade,
  rotuloPlano,
  type PlanoCheckoutId,
} from "@/lib/planos-facto";

type PreapprovalCriada = {
  id?: string;
  init_point?: string;
  sandbox_init_point?: string;
};

export async function criarPreapprovalAssinatura(opcoes: {
  planoId: PlanoCheckoutId;
  userId: string;
  email: string;
}): Promise<{ initPoint: string; preapprovalId: string }> {
  const catalogo = catalogoPlanoCheckout(opcoes.planoId);
  const freq = frequenciaCheckout(opcoes.planoId);
  const site = getSiteUrl();
  const externalReference = montarExternalReferenceUpgrade(
    opcoes.planoId,
    opcoes.userId
  );

  const body = {
    reason: `FACTO — ${rotuloPlano(opcoes.planoId)}`,
    external_reference: externalReference,
    payer_email: opcoes.email.trim().toLowerCase(),
    auto_recurring: {
      frequency: freq.frequency,
      frequency_type: freq.frequency_type,
      transaction_amount: catalogo.preco,
      currency_id: "BRL",
    },
    back_url: `${site}/dashboard/perfil?upgrade=ok`,
    status: "pending",
  };

  const preapproval = (await chamarMercadoPago("/preapproval", {
    method: "POST",
    body: JSON.stringify(body),
  })) as PreapprovalCriada;

  const initPoint =
    preapproval.init_point?.trim() ||
    preapproval.sandbox_init_point?.trim() ||
    "";
  if (!initPoint || !preapproval.id) {
    throw new Error("Mercado Pago não retornou init_point da assinatura.");
  }

  return { initPoint, preapprovalId: String(preapproval.id) };
}
