import { createAdminClient } from "@/lib/supabase/admin";
import { isEmailAcessoLivre } from "@/lib/emails-acesso-livre";

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

/**
 * Acesso ao dashboard: e-mails livres (admin/teste) ou assinatura vigente.
 * Sem linha em `assinaturas` = sem acesso (não vale cadastro avulso).
 * Convite pago para o mesmo e-mail libera enquanto o webhook/sync do MP
 * ainda não gravou a assinatura — prova de pagamento, não de “conta grátis”.
 */
export async function acessoAssinaturaLiberado(
  email: string | null | undefined
): Promise<boolean> {
  if (!email) return false;
  if (isEmailAcessoLivre(email)) return true;

  try {
    const admin = createAdminClient();
    const emailNorm = email.trim().toLowerCase();
    const { data, error } = await admin
      .from("assinaturas")
      .select("status, acesso_valido_ate")
      .ilike("email", emailNorm)
      .order("criado_em", { ascending: false });

    if (error) {
      return true;
    }

    if (data?.length) {
      return data.some((assinatura) => {
        const acessoValidoAte = assinatura.acesso_valido_ate
          ? new Date(assinatura.acesso_valido_ate).getTime()
          : null;
        return assinaturaAindaVale(String(assinatura.status ?? ""), acessoValidoAte);
      });
    }

    const { data: convite } = await admin
      .from("convites_pagos")
      .select("id")
      .ilike("email", emailNorm)
      .limit(1)
      .maybeSingle();

    return Boolean(convite?.id);
  } catch {
    // Infra indisponível: não derruba o site inteiro.
    return true;
  }
}
