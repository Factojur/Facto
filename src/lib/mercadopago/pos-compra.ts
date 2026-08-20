/**
 * Pós-compra: convite + e-mails financeiro/noreply.
 * Usado pelo webhook MP e pelo reenvio manual no admin.
 *
 * - financeiro@: imediato (junto ao webhook de compra aprovada)
 * - noreply@ (convite): imediato no automático e no reenvio admin
 */

import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { enviarEmailConvite } from "@/lib/email/convite-pago";
import { enviarEmailsFinanceiroCompra } from "@/lib/email/pagamento-aprovado";
import { emailJaEnviadoParaPagamento } from "@/lib/email/eventos";
import { enviarSmsAlertaCompra } from "@/lib/sms/alerta-compra";
import type { PlanoId } from "@/lib/planos-facto";

type AdminClient = ReturnType<typeof createAdminClient>;

/** Atraso padrão do e-mail de boas-vindas após o financeiro (fluxo automático).
 * 0 = imediato (mais confiável que schedule do Resend). */
export const ATRASO_CONVITE_MINUTOS = 0;

/**
 * Gera convite + e-mails (financeiro + boas-vindas) após cobrança aprovada.
 *
 * - financeiro@: sempre tenta (idempotente por destinatário + mp_payment_id)
 * - noreply@: só se o cliente ainda não tem perfil
 * - Push ntfy admin: alerta para conferir /admin se o e-mail falhar
 */
export async function garantirConviteEEmailsPosCompra(
  admin: AdminClient,
  opcoes: {
    email: string;
    mpPaymentId: string;
    valor: number | null;
    plano?: PlanoId | null;
    /** 0 = envia convite na hora (admin/teste). Default 10 no automático. */
    atrasoConviteMinutos?: number;
    /** Reenvio admin: ignora “já enviado” se o e-mail não chegou. */
    forcarEmails?: boolean;
  }
): Promise<{ financeiroOk: boolean; conviteOk: boolean; motivoConvite?: string }> {
  const email = opcoes.email.trim();
  if (!email) {
    console.warn(
      "[pos-compra] sem e-mail; mp_payment_id=",
      opcoes.mpPaymentId
    );
    return { financeiroOk: false, conviteOk: false, motivoConvite: "sem_email" };
  }

  let plano: PlanoId | null = opcoes.plano ?? null;
  if (!plano) {
    const { data: ass } = await admin
      .from("assinaturas")
      .select("plano")
      .ilike("email", email)
      .order("atualizado_em", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (ass?.plano) plano = ass.plano as PlanoId;
  }

  let financeiroOk = false;
  try {
    const r = await enviarEmailsFinanceiroCompra({
      emailCliente: email,
      valor: opcoes.valor,
      mpPaymentId: opcoes.mpPaymentId,
      plano,
      forcar: opcoes.forcarEmails,
    });
    financeiroOk = r.admin !== "falha" && r.cliente !== "falha";
  } catch (erro) {
    console.error("[pos-compra] falha e-mails financeiro", erro);
  }

  try {
    await enviarSmsAlertaCompra({
      emailCliente: email,
      valor: opcoes.valor,
      mpPaymentId: opcoes.mpPaymentId,
      tipoCompra: "assinatura",
    });
  } catch (erro) {
    console.error("[pos-compra] falha alerta ntfy", erro);
  }

  const { data: perfil } = await admin
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle();
  if (perfil) {
    return {
      financeiroOk,
      conviteOk: false,
      motivoConvite: "ja_tem_perfil",
    };
  }

  // Assinatura já vinculada a um profile_id (checkout com token).
  const { data: assComPerfil } = await admin
    .from("assinaturas")
    .select("id, profile_id")
    .ilike("email", email)
    .not("profile_id", "is", null)
    .order("atualizado_em", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (assComPerfil?.profile_id) {
    return {
      financeiroOk,
      conviteOk: false,
      motivoConvite: "ja_tem_perfil",
    };
  }

  const conviteJaEnviado =
    !opcoes.forcarEmails &&
    (await emailJaEnviadoParaPagamento("convite", opcoes.mpPaymentId));
  if (conviteJaEnviado) {
    return { financeiroOk, conviteOk: true, motivoConvite: "ja_enviado" };
  }

  let token: string | null = null;

  const { data: porPagamento } = await admin
    .from("convites_pagos")
    .select("id, token, status")
    .eq("mp_payment_id", opcoes.mpPaymentId)
    .maybeSingle();

  if (porPagamento?.token) {
    token = porPagamento.token as string;
  } else {
    const { data: convitePendente } = await admin
      .from("convites_pagos")
      .select("id, token, status, mp_payment_id")
      .ilike("email", email)
      .eq("status", "pendente")
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (convitePendente?.token) {
      token = convitePendente.token as string;
      if (!convitePendente.mp_payment_id) {
        await admin
          .from("convites_pagos")
          .update({ mp_payment_id: opcoes.mpPaymentId })
          .eq("id", convitePendente.id);
      }
    } else {
      token = crypto.randomBytes(32).toString("hex");
      const { error: erroInsercao } = await admin.from("convites_pagos").insert({
        email,
        token,
        status: "pendente",
        mp_payment_id: opcoes.mpPaymentId,
      });
      if (erroInsercao) {
        const { data: existente } = await admin
          .from("convites_pagos")
          .select("token")
          .eq("mp_payment_id", opcoes.mpPaymentId)
          .maybeSingle();
        if (existente?.token) {
          token = existente.token as string;
        } else {
          throw erroInsercao;
        }
      }
    }
  }

  if (!token) {
    return { financeiroOk, conviteOk: false, motivoConvite: "sem_token" };
  }

  const atrasoMin =
    typeof opcoes.atrasoConviteMinutos === "number"
      ? opcoes.atrasoConviteMinutos
      : ATRASO_CONVITE_MINUTOS;

  try {
    await enviarEmailConvite(email, token, {
      mpPaymentId: opcoes.mpPaymentId,
      atrasoMinutos: atrasoMin,
    });
    return { financeiroOk, conviteOk: true };
  } catch (erro) {
    console.error("[pos-compra] falha e-mail convite", erro);
    return { financeiroOk, conviteOk: false, motivoConvite: "falha_envio" };
  }
}

/** Extrai payment.id seja objeto, número ou string. */
export function extrairPaymentIdDeInvoice(payment: unknown): string | null {
  if (payment == null) return null;
  if (typeof payment === "number" || typeof payment === "string") {
    const id = String(payment).trim();
    return id || null;
  }
  if (typeof payment === "object" && "id" in payment) {
    const id = (payment as { id?: unknown }).id;
    if (id == null) return null;
    const s = String(id).trim();
    return s || null;
  }
  return null;
}

export function extrairPaymentStatusDeInvoice(payment: unknown): string | null {
  if (payment == null || typeof payment !== "object") return null;
  const status = (payment as { status?: unknown }).status;
  return typeof status === "string" ? status.toLowerCase() : null;
}

export function cobrancaAssinaturaAprovada(invoice: {
  status?: string | null;
  payment?: unknown;
}): boolean {
  const paymentStatus = extrairPaymentStatusDeInvoice(invoice.payment);
  if (paymentStatus === "approved") return true;
  if (
    paymentStatus === "refunded" ||
    paymentStatus === "charged_back" ||
    paymentStatus === "rejected" ||
    paymentStatus === "cancelled" ||
    paymentStatus === "canceled"
  ) {
    return false;
  }

  const invoiceStatus = invoice.status?.toLowerCase() ?? null;
  const paymentId = extrairPaymentIdDeInvoice(invoice.payment);
  if (
    (invoiceStatus === "processed" || invoiceStatus === "approved") &&
    paymentId
  ) {
    return true;
  }

  if (invoiceStatus === "processed" || invoiceStatus === "approved") {
    return true;
  }

  return false;
}

export function normalizarTopicoWebhook(raw: string | null | undefined): string {
  const t = (raw ?? "").toLowerCase().trim();
  if (!t || t === "desconhecido") return "desconhecido";

  if (
    t === "preapproval" ||
    t === "subscription_preapproval" ||
    t === "subscription_preapprovals"
  ) {
    return "subscription_preapproval";
  }

  if (
    t === "authorized_payment" ||
    t === "authorized_payments" ||
    t === "subscription_authorized_payment" ||
    t === "subscription_authorized_payments"
  ) {
    return "subscription_authorized_payment";
  }

  if (t === "payment" || t === "payments") return "payment";

  return t;
}
