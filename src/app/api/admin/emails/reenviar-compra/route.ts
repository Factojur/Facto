import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin-auth";
import { buscarPagamentoInicialAprovado } from "@/lib/mercadopago/client";
import { garantirConviteEEmailsPosCompra } from "@/lib/mercadopago/pos-compra";
import { sincronizarAssinaturaPorEmail } from "@/lib/mercadopago/sincronizar-assinatura";
import type { PlanoId } from "@/lib/planos-facto";

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

    // Garante assinatura local puxando do MP se o webhook nao criou a linha
    const sync = await sincronizarAssinaturaPorEmail(admin, email);

    const { data: assinatura, error } = await admin
      .from("assinaturas")
      .select("id, mp_preapproval_id, email, valor, status, plano")
      .ilike("email", email)
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    let mpPaymentId: string | null = sync?.mpPaymentId ?? null;
    let valor: number | null = sync?.valor ?? null;
    let emailEnvio = sync?.email || email;

    if (assinatura?.mp_preapproval_id) {
      emailEnvio = (assinatura.email as string | null)?.trim() || email;
      const valorAss =
        typeof assinatura.valor === "number"
          ? assinatura.valor
          : typeof assinatura.valor === "string"
            ? parseFloat(assinatura.valor)
            : null;
      if (typeof valorAss === "number" && !Number.isNaN(valorAss)) {
        valor = valorAss;
      } else if (valor == null) {
        valor = null;
      }

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

      if (!mpPaymentId) {
        mpPaymentId =
          (convite?.mp_payment_id as string | null) ??
          `manual:${email}:${Date.now()}`;
      }
    }

    if (valor == null && assinatura?.valor != null) {
      valor =
        typeof assinatura.valor === "number"
          ? assinatura.valor
          : parseFloat(String(assinatura.valor));
      if (Number.isNaN(valor)) valor = null;
    }

    const resultado = await garantirConviteEEmailsPosCompra(admin, {
      email: emailEnvio,
      mpPaymentId,
      valor,
      plano: (assinatura?.plano as PlanoId | null) ?? sync?.plano ?? null,
      atrasoConviteMinutos: 0,
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
