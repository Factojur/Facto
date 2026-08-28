/**
 * Sessão única — vale só para o módulo de PEÇAS (/dashboard, geração).
 * FACTO Gestão (/gestao) usa apenas auth Supabase; várias máquinas simultâneas.
 */

import { createClient } from "@/lib/supabase/server";
import {
  COOKIE_SESSAO,
  criarIdSessao,
  obterCookieSessao,
  opcoesCookieSessao,
} from "@/lib/sessao-unica";

export type ResultadoSessaoPecas =
  | { ok: true }
  | { ok: false; status: 401 | 403; erro: string };

/** Valida cookie facto_sessao vs profiles.sessao_ativa_id (módulo peças). */
export async function validarSessaoPecasAtiva(
  userId: string
): Promise<ResultadoSessaoPecas> {
  const cookieSessao = await obterCookieSessao();
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("sessao_ativa_id")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return { ok: false, status: 403, erro: error.message };
  }

  if (!profile?.sessao_ativa_id) {
    return { ok: true };
  }

  if (!cookieSessao || cookieSessao !== profile.sessao_ativa_id) {
    return {
      ok: false,
      status: 401,
      erro:
        "Sessão de peças encerrada — esta conta está ativa em outro dispositivo.",
    };
  }

  return { ok: true };
}

/** Registra nova sessão ativa de peças (invalida outras máquinas no dashboard). */
export async function registrarSessaoPecasAtiva(userId: string) {
  const supabase = await createClient();
  const sessaoId = criarIdSessao();
  const { error } = await supabase
    .from("profiles")
    .update({ sessao_ativa_id: sessaoId })
    .eq("id", userId);

  if (error) {
    return { ok: false as const, erro: error.message };
  }

  return { ok: true as const, sessaoId };
}

export { COOKIE_SESSAO, opcoesCookieSessao };
