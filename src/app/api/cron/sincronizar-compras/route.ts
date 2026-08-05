import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buscarPagamentoInicialAprovado } from "@/lib/mercadopago/client";
import { garantirConviteEEmailsPosCompra } from "@/lib/mercadopago/pos-compra";
import { sincronizarPreapprovalsRecentesDoMp } from "@/lib/mercadopago/sincronizar-assinatura";

/**
 * Cron (Vercel): a cada 5 min, sincroniza MP→DB e garante e-mails pós-compra para assinaturas
 * autorizadas recentes — rede de segurança se o webhook do MP falhar/atrasar.
 *
 * Auth: Authorization Bearer CRON_SECRET (Vercel injeta automaticamente)
 * ou header x-cron-secret.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization") ?? "";
  const headerSecret = request.headers.get("x-cron-secret") ?? "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";

  if (secret && bearer !== secret && headerSecret !== secret) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Sem CRON_SECRET em preview local: permite para facilitar teste manual.
  if (!secret && process.env.NODE_ENV === "production") {
    console.warn(
      "[cron sincronizar-compras] CRON_SECRET não configurada na Vercel."
    );
  }

  const admin = createAdminClient();

  // 1) Puxa do MP assinaturas authorized/canceladas que o webhook pode ter perdido
  let syncMp: Awaited<ReturnType<typeof sincronizarPreapprovalsRecentesDoMp>> = [];
  try {
    syncMp = await sincronizarPreapprovalsRecentesDoMp(admin);
  } catch (erro) {
    console.error("[cron sincronizar-compras] sync MP", erro);
  }

  const desde = new Date();
  desde.setDate(desde.getDate() - 14);

  const { data: assinaturas, error } = await admin
    .from("assinaturas")
    .select("id, mp_preapproval_id, email, valor, status, criado_em")
    .in("status", ["authorized", "pending"])
    .gte("criado_em", desde.toISOString())
    .order("criado_em", { ascending: false })
    .limit(40);

  if (error) {
    console.error("[cron sincronizar-compras]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const resultados: Array<Record<string, unknown>> = [];

  for (const row of assinaturas ?? []) {
    const preapprovalId = row.mp_preapproval_id as string;
    let email = (row.email as string | null)?.trim() || null;
    const valor =
      typeof row.valor === "number"
        ? row.valor
        : typeof row.valor === "string"
          ? parseFloat(row.valor)
          : null;

    if (!email) {
      try {
        const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
        if (token) {
          const resp = await fetch(
            `https://api.mercadopago.com/preapproval/${preapprovalId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (resp.ok) {
            const pre = (await resp.json()) as {
              payer_email?: string;
            };
            email = pre.payer_email?.trim() || null;
            if (email) {
              await admin
                .from("assinaturas")
                .update({ email })
                .eq("id", row.id);
            }
          }
        }
      } catch (erro) {
        console.warn(
          "[cron sincronizar-compras] falha ao buscar e-mail",
          preapprovalId,
          erro
        );
      }
    }

    if (!email) {
      resultados.push({
        preapprovalId,
        status: "sem_email",
      });
      continue;
    }

    let mpPaymentId: string | null = null;
    try {
      const pagamento = await buscarPagamentoInicialAprovado(preapprovalId);
      mpPaymentId = pagamento?.paymentId ?? null;
    } catch (erro) {
      console.warn(
        "[cron sincronizar-compras] fatura",
        preapprovalId,
        erro
      );
    }

    if (!mpPaymentId) {
      // Ainda assim dispara com chave estável — cobre o caso em que a
      // autorização existe e o cliente precisa do convite imediatamente.
      mpPaymentId = `preapproval:${preapprovalId}`;
    }

    try {
      const envio = await garantirConviteEEmailsPosCompra(admin, {
        email,
        mpPaymentId,
        valor: typeof valor === "number" && !Number.isNaN(valor) ? valor : null,
      });
      resultados.push({
        preapprovalId,
        email,
        mpPaymentId,
        ...envio,
      });
    } catch (erro) {
      resultados.push({
        preapprovalId,
        email,
        erro: erro instanceof Error ? erro.message : String(erro),
      });
    }
  }

  return NextResponse.json({
    ok: true,
    syncMp: syncMp.length,
    syncMpDetalhe: syncMp,
    analisadas: (assinaturas ?? []).length,
    resultados,
  });
}
