import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin-auth";
import { buscarPagamentoInicialAprovado } from "@/lib/mercadopago/client";
import { garantirConviteEEmailsPosCompra } from "@/lib/mercadopago/pos-compra";

/**
 * POST /api/admin/emails/reenviar-compra
 * Body: { email: string }
 *
 * Força o fluxo pós-compra (financeiro@ + noreply@) para uma assinatura
 * já paga cujo webhook não disparou os e-mails.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: { email?: string };
  try {
    body = (await request.json()) as { email?: string };
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json(
      { error: "Informe o e-mail do comprador." },
      { status: 400 }
    );
  }

  try {
    const admin = createAdminClient();

    const { data: assinatura, error } = await admin
      .from("assinaturas")
      .select("id, mp_preapproval_id, email, valor, status")
      .ilike("email", email)
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    let mpPaymentId: string | null = null;
    let valor: number | null = null;
    let emailEnvio = email;

    if (assinatura?.mp_preapproval_id) {
      emailEnvio = (assinatura.email as string | null)?.trim() || email;
      valor =
        typeof assinatura.valor === "number"
          ? assinatura.valor
          : typeof assinatura.valor === "string"
            ? parseFloat(assinatura.valor)
            : null;

      const { data: pagLocal } = await admin
        .from("pagamentos")
        .select("mp_payment_id, valor, status")
        .eq("assinatura_id", assinatura.id)
        .order("pago_em", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (pagLocal?.mp_payment_id) {
        mpPaymentId = String(pagLocal.mp_payment_id);
        if (typeof pagLocal.valor === "number") valor = pagLocal.valor;
      }

      if (!mpPaymentId) {
        const pagamentoMp = await buscarPagamentoInicialAprovado(
          assinatura.mp_preapproval_id
        );
        if (pagamentoMp?.paymentId) {
          mpPaymentId = pagamentoMp.paymentId;
        }
      }

      if (!mpPaymentId) {
        mpPaymentId = `preapproval:${assinatura.mp_preapproval_id}`;
      }
    } else {
      // Sem assinatura local: tenta convite/pagamento solto ou força com chave do e-mail.
      const { data: convite } = await admin
        .from("convites_pagos")
        .select("mp_payment_id")
        .ilike("email", email)
        .order("criado_em", { ascending: false })
        .limit(1)
        .maybeSingle();

      mpPaymentId =
        (convite?.mp_payment_id as string | null) ??
        `manual:${email}:${Date.now()}`;
    }

    const resultado = await garantirConviteEEmailsPosCompra(admin, {
      email: emailEnvio,
      mpPaymentId,
      valor,
    });

    return NextResponse.json({
      ok: true,
      email: emailEnvio,
      mpPaymentId,
      assinaturaId: assinatura?.id ?? null,
      ...resultado,
    });
  } catch (erro) {
    console.error("[admin/emails/reenviar-compra]", erro);
    return NextResponse.json(
      {
        error:
          erro instanceof Error
            ? erro.message
            : "Falha ao reenviar e-mails da compra.",
      },
      { status: 500 }
    );
  }
}
