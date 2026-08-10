/**
 * Job de sincronizacao MP -> assinaturas + e-mails pos-compra.
 * Usado pelo cron Vercel e pelo botao admin.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import {
  buscarEmailPagadorPreapproval,
  buscarPagamentoInicialAprovado,
} from "@/lib/mercadopago/client";
import { garantirConviteEEmailsPosCompra } from "@/lib/mercadopago/pos-compra";
import { sincronizarPreapprovalsRecentesDoMp } from "@/lib/mercadopago/sincronizar-assinatura";
import type { PlanoId } from "@/lib/planos-facto";

export async function executarSincronizarCompras() {
  const admin = createAdminClient();

  let syncMp: Awaited<ReturnType<typeof sincronizarPreapprovalsRecentesDoMp>> = [];
  try {
    syncMp = await sincronizarPreapprovalsRecentesDoMp(admin);
  } catch (erro) {
    console.error("[sincronizar-compras] sync MP", erro);
  }

  const desde = new Date();
  desde.setDate(desde.getDate() - 14);

  const { data: assinaturas, error } = await admin
    .from("assinaturas")
    .select("id, mp_preapproval_id, email, valor, status, plano, criado_em")
    .in("status", ["authorized", "pending"])
    .gte("criado_em", desde.toISOString())
    .order("criado_em", { ascending: false })
    .limit(40);

  if (error) {
    throw new Error(error.message);
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
        email = await buscarEmailPagadorPreapproval(preapprovalId);
        if (email) {
          await admin.from("assinaturas").update({ email }).eq("id", row.id);
        }
      } catch (erro) {
        console.warn("[sincronizar-compras] e-mail", preapprovalId, erro);
      }
    }

    if (!email) {
      resultados.push({ preapprovalId, status: "sem_email" });
      continue;
    }

    let mpPaymentId: string | null = null;
    try {
      const pagamento = await buscarPagamentoInicialAprovado(preapprovalId);
      mpPaymentId = pagamento?.paymentId ?? null;
    } catch (erro) {
      console.warn("[sincronizar-compras] fatura", preapprovalId, erro);
    }

    if (!mpPaymentId) mpPaymentId = `preapproval:${preapprovalId}`;

    try {
      const envio = await garantirConviteEEmailsPosCompra(admin, {
        email,
        mpPaymentId,
        valor: typeof valor === "number" && !Number.isNaN(valor) ? valor : null,
        plano: (row.plano as PlanoId | null) ?? null,
      });
      resultados.push({ preapprovalId, email, mpPaymentId, ...envio });
    } catch (erro) {
      resultados.push({
        preapprovalId,
        email,
        erro: erro instanceof Error ? erro.message : String(erro),
      });
    }
  }

  return {
    ok: true as const,
    syncMp: syncMp.length,
    syncMpDetalhe: syncMp,
    analisadas: (assinaturas ?? []).length,
    resultados,
  };
}
