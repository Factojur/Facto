/**
 * Pós-compra: convite + e-mails financeiro/noreply.
 * Usado pelo webhook MP e pelo reenvio manual no admin.
 */

import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { enviarEmailConvite } from "@/lib/email/convite-pago";
import { enviarEmailsFinanceiroCompra } from "@/lib/email/pagamento-aprovado";
import { emailJaEnviadoParaPagamento } from "@/lib/email/eventos";
import { enviarSmsAlertaCompra } from "@/lib/sms/alerta-compra";

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Gera convite + e-mails (financeiro + boas-vindas) após cobrança aprovada.
 *
 * - financeiro@: sempre tenta (idempotente por destinatário + mp_payment_id)
 * - noreply@: só se o cliente ainda não tem perfil
 * - SMS admin: alerta para conferir /admin se o e-mail falhar
 */
export async function garantirConviteEEmailsPosCompra(
  admin: AdminClient,
  opcoes: {
    email: string;
    mpPaymentId: string;
    valor: number | null;
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

  let financeiroOk = false;
  try {
    await enviarEmailsFinanceiroCompra({
      emailCliente: email,
      valor: opcoes.valor,
      mpPaymentId: opcoes.mpPaymentId,
    });
    financeiroOk = true;
  } catch (erro) {
    console.error("[pos-compra] falha e-mails financeiro", erro);
  }

  // Alerta SMS independente do e-mail (não quebra o fluxo se falhar).
  try {
    await enviarSmsAlertaCompra({
      emailCliente: email,
      valor: opcoes.valor,
      mpPaymentId: opcoes.mpPaymentId,
      tipoCompra: "assinatura",
    });
  } catch (erro) {
    console.error("[pos-compra] falha SMS alerta", erro);
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

  const conviteJaEnviado = await emailJaEnviadoParaPagamento(
    "convite",
    opcoes.mpPaymentId
  );
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

  try {
    await enviarEmailConvite(email, token, {
      mpPaymentId: opcoes.mpPaymentId,
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

  // Alguns payloads trazem só o id numérico do payment + status processed.
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
