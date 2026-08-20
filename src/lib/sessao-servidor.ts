import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { User } from "@supabase/supabase-js";
import type { PlanoId } from "@/lib/planos-facto";

const PLANOS_VALIDOS = new Set<PlanoId>([
  "jec",
  "mensal",
  "pro",
  "anual",
  "pro_anual",
  "trial",
  "escritorio_s",
  "escritorio_m",
  "escritorio_s_anual",
  "escritorio_m_anual",
]);

function planoDeAssinaturas(
  assinaturas: Array<{
    plano: string | null;
    status: string | null;
    acesso_valido_ate: string | null;
  }>
): PlanoId | null {
  const agora = Date.now();
  const ativa = assinaturas.find((a) => {
    const ate = a.acesso_valido_ate
      ? new Date(a.acesso_valido_ate).getTime()
      : null;
    if (a.status === "authorized" && ate === null) return true;
    return ate !== null && ate > agora;
  });
  if (ativa?.plano && PLANOS_VALIDOS.has(ativa.plano as PlanoId)) {
    return ativa.plano as PlanoId;
  }
  return null;
}

/** Usuário autenticado — deduplicado por request (layout + page). */
export const getUsuarioServidor = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** Perfil completo — deduplicado por request. */
export const getPerfilServidor = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return profile;
});

/** Plano ativo do e-mail — deduplicado por request. Inclui trial se sem assinatura. */
export const getPlanoAtivoServidor = cache(
  async (email: string | null | undefined): Promise<PlanoId | null> => {
    const emailNorm = email?.trim().toLowerCase();
    if (!emailNorm) return null;
    try {
      const admin = createAdminClient();
      const { data: ass } = await admin
        .from("assinaturas")
        .select("plano, status, acesso_valido_ate")
        .ilike("email", emailNorm)
        .order("criado_em", { ascending: false })
        .limit(5);
      const pago = planoDeAssinaturas(ass ?? []);
      if (pago) return pago;

      const { data: perfil } = await admin
        .from("profiles")
        .select("trial_ate")
        .ilike("email", emailNorm)
        .maybeSingle();
      if (
        perfil?.trial_ate &&
        new Date(perfil.trial_ate).getTime() > Date.now()
      ) {
        return "trial";
      }
      return null;
    } catch {
      return null;
    }
  }
);
