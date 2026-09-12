import { createAdminClient } from "@/lib/supabase/admin";
import { isEmailAcessoLivre } from "@/lib/emails-acesso-livre";
import { trialAindaValido } from "@/lib/trial";

const CONVITE_PENDENTE_MAX_DIAS = 14;
const DIA_EM_MS = 24 * 60 * 60 * 1000;

function assinaturaAindaVale(status: string, acessoValidoAte: number | null): boolean {
  const agora = Date.now();
  const st = status.toLowerCase();

  if (st === "canceled" || st === "cancelled") {
    return acessoValidoAte !== null && acessoValidoAte > agora;
  }

  // Primeira cobrança ainda processando.
  if (st === "authorized" && acessoValidoAte === null) {
    return true;
  }

  return acessoValidoAte !== null && acessoValidoAte > agora;
}

function algumaAssinaturaVale(
  rows: Array<{ status?: string | null; acesso_valido_ate?: string | null }> | null
): boolean {
  if (!rows?.length) return false;
  return rows.some((assinatura) => {
    const acessoValidoAte = assinatura.acesso_valido_ate
      ? new Date(assinatura.acesso_valido_ate).getTime()
      : null;
    return assinaturaAindaVale(String(assinatura.status ?? ""), acessoValidoAte);
  });
}

/**
 * Acesso ao dashboard: e-mails livres, assinatura vigente (e-mail **ou** profile_id),
 * convite **pendente** recente (janela pré-cadastro), ou trial.
 *
 * Trial→pago: o webhook grava `profile_id` mesmo se o e-mail do cartão divergir —
 * por isso o userId é obrigatório no middleware para liberação imediata.
 *
 * Convite usado/histórico NÃO libera acesso (senão cancelamento CDC falha).
 */
export async function acessoAssinaturaLiberado(
  email: string | null | undefined,
  userId?: string | null
): Promise<boolean> {
  if (!email && !userId) return false;
  if (email && isEmailAcessoLivre(email)) return true;

  try {
    const admin = createAdminClient();
    const emailNorm = email?.trim().toLowerCase() || null;
    const uid = userId?.trim() || null;

    if (uid) {
      const { data: porPerfil } = await admin
        .from("assinaturas")
        .select("status, acesso_valido_ate")
        .eq("profile_id", uid)
        .order("criado_em", { ascending: false });
      if (algumaAssinaturaVale(porPerfil)) return true;
    }

    if (emailNorm) {
      const { data, error } = await admin
        .from("assinaturas")
        .select("status, acesso_valido_ate")
        .ilike("email", emailNorm)
        .order("criado_em", { ascending: false });

      if (error) {
        return true;
      }
      if (algumaAssinaturaVale(data)) return true;

      // Só convite ainda não usado (compra → cadastro). Usado/antigo não conta.
      const { data: convite } = await admin
        .from("convites_pagos")
        .select("id, criado_em")
        .ilike("email", emailNorm)
        .eq("status", "pendente")
        .order("criado_em", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (convite?.id) {
        const criado = convite.criado_em
          ? new Date(convite.criado_em).getTime()
          : Date.now();
        if (Date.now() - criado <= CONVITE_PENDENTE_MAX_DIAS * DIA_EM_MS) {
          return true;
        }
      }

      const { data: perfil } = await admin
        .from("profiles")
        .select("trial_ate, trial_area_id, trial_pecas_usadas")
        .ilike("email", emailNorm)
        .maybeSingle();

      return trialAindaValido(perfil);
    }

    if (uid) {
      const { data: perfil } = await admin
        .from("profiles")
        .select("trial_ate, trial_area_id, trial_pecas_usadas")
        .eq("id", uid)
        .maybeSingle();
      return trialAindaValido(perfil);
    }

    return false;
  } catch {
    // Infra indisponível: não derruba o site inteiro.
    return true;
  }
}
