import { createAdminClient } from "@/lib/supabase/admin";
import type { PlanoId } from "@/lib/planos-facto";

export type ConvitePago = {
  email: string;
  plano: PlanoId | null;
};

/**
 * Confere se um token de convite (gerado após pagamento aprovado) existe e
 * ainda está pendente de uso. Usa a service role key porque a tabela
 * `convites_pagos` não tem policy de leitura pública — só o servidor acessa.
 */
export async function validarConvite(
  token: string | undefined
): Promise<ConvitePago | null> {
  if (!token) return null;

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("convites_pagos")
      .select("email, status")
      .eq("token", token)
      .maybeSingle();

    if (!data || data.status !== "pendente") return null;

    let plano: PlanoId | null = null;
    try {
      const { data: assinatura } = await admin
        .from("assinaturas")
        .select("plano")
        .ilike("email", data.email)
        .order("criado_em", { ascending: false })
        .limit(1)
        .maybeSingle();
      const p = String(assinatura?.plano ?? "");
      if (
        p === "jec" ||
        p === "mensal" ||
        p === "pro" ||
        p === "anual" ||
        p === "pro_anual"
      ) {
        plano = p;
      }
    } catch {
      plano = null;
    }

    return { email: data.email, plano };
  } catch {
    // SUPABASE_SERVICE_ROLE_KEY ausente ou tabela ainda não criada: trata
    // como convite inválido em vez de derrubar a página de cadastro.
    return null;
  }
}
