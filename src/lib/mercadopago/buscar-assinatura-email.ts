/**
 * Busca a assinatura mais relevante do e-mail (ativa primeiro).
 */

import { createAdminClient } from "@/lib/supabase/admin";
import type { AssinaturaDb } from "@/lib/assinatura-format";

type AdminClient = ReturnType<typeof createAdminClient>;

const COLUNAS =
  "id, mp_preapproval_id, email, plano, status, data_inicio, acesso_valido_ate, motivo_encerramento, data_cancelamento";

const STATUS_ATIVOS = ["authorized", "paused", "pending"] as const;

/**
 * Prefere assinatura autorizada/pausada/pendente; se não houver, a mais recente.
 */
export async function buscarAssinaturaDoEmail(
  admin: AdminClient,
  email: string
): Promise<{ data: AssinaturaDb | null; error: string | null }> {
  const emailNorm = email.trim();
  if (!emailNorm) return { data: null, error: null };

  const { data: ativa, error: erroAtiva } = await admin
    .from("assinaturas")
    .select(COLUNAS)
    .ilike("email", emailNorm)
    .in("status", [...STATUS_ATIVOS])
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (erroAtiva) {
    return { data: null, error: erroAtiva.message };
  }
  if (ativa) {
    return { data: ativa as AssinaturaDb, error: null };
  }

  const { data: qualquer, error: erroQualquer } = await admin
    .from("assinaturas")
    .select(COLUNAS)
    .ilike("email", emailNorm)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (erroQualquer) {
    return { data: null, error: erroQualquer.message };
  }
  return { data: (qualquer as AssinaturaDb | null) ?? null, error: null };
}
