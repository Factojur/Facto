/**
 * Busca a assinatura mais relevante do usuário (e-mail e/ou profile_id).
 */

import { createAdminClient } from "@/lib/supabase/admin";
import type { AssinaturaDb } from "@/lib/assinatura-format";

type AdminClient = ReturnType<typeof createAdminClient>;

const COLUNAS =
  "id, mp_preapproval_id, email, plano, status, data_inicio, acesso_valido_ate, motivo_encerramento, data_cancelamento, profile_id";

const STATUS_ATIVOS = ["authorized", "paused", "pending"] as const;

async function preferirAtiva(
  admin: AdminClient,
  filtro: { email?: string; profileId?: string }
): Promise<{ data: AssinaturaDb | null; error: string | null }> {
  let qAtiva = admin
    .from("assinaturas")
    .select(COLUNAS)
    .in("status", [...STATUS_ATIVOS])
    .order("criado_em", { ascending: false })
    .limit(1);

  if (filtro.profileId) qAtiva = qAtiva.eq("profile_id", filtro.profileId);
  else if (filtro.email) qAtiva = qAtiva.ilike("email", filtro.email);

  const { data: ativa, error: erroAtiva } = await qAtiva.maybeSingle();
  if (erroAtiva) return { data: null, error: erroAtiva.message };
  if (ativa) return { data: ativa as AssinaturaDb, error: null };

  let qQualquer = admin
    .from("assinaturas")
    .select(COLUNAS)
    .order("criado_em", { ascending: false })
    .limit(1);
  if (filtro.profileId) qQualquer = qQualquer.eq("profile_id", filtro.profileId);
  else if (filtro.email) qQualquer = qQualquer.ilike("email", filtro.email);

  const { data: qualquer, error: erroQualquer } = await qQualquer.maybeSingle();
  if (erroQualquer) return { data: null, error: erroQualquer.message };
  return { data: (qualquer as AssinaturaDb | null) ?? null, error: null };
}

/**
 * Prefere assinatura autorizada/pausada/pendente; se não houver, a mais recente.
 * Ordem: profile_id → e-mail.
 */
export async function buscarAssinaturaDoUsuario(
  admin: AdminClient,
  opcoes: { email?: string | null; userId?: string | null }
): Promise<{ data: AssinaturaDb | null; error: string | null }> {
  const emailNorm = opcoes.email?.trim() || null;
  const uid = opcoes.userId?.trim() || null;

  if (uid) {
    const porPerfil = await preferirAtiva(admin, { profileId: uid });
    if (porPerfil.error) return porPerfil;
    if (porPerfil.data) return porPerfil;
  }

  if (emailNorm) {
    return preferirAtiva(admin, { email: emailNorm });
  }

  return { data: null, error: null };
}

/** @deprecated use buscarAssinaturaDoUsuario */
export async function buscarAssinaturaDoEmail(
  admin: AdminClient,
  email: string
): Promise<{ data: AssinaturaDb | null; error: string | null }> {
  return buscarAssinaturaDoUsuario(admin, { email });
}
