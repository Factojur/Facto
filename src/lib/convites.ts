import { createAdminClient } from "@/lib/supabase/admin";

export type ConvitePago = {
  email: string;
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

    return { email: data.email };
  } catch {
    // SUPABASE_SERVICE_ROLE_KEY ausente ou tabela ainda não criada: trata
    // como convite inválido em vez de derrubar a página de cadastro.
    return null;
  }
}
