import { createAdminClient } from "@/lib/supabase/admin";
import { isEmailAcessoLivre } from "@/lib/emails-acesso-livre";

/**
 * Verifica se o e-mail tem acesso liberado ao FACTO com base no histórico de
 * assinaturas. Contas de acesso livre (admin/teste) passam sempre. Quem nunca
 * teve nenhuma assinatura registrada (convites avulsos) continua liberado —
 * o bloqueio só entra em ação para quem já teve uma assinatura registrada e
 * ela expirou ou foi cancelada.
 */
export async function acessoAssinaturaLiberado(
  email: string | null | undefined
): Promise<boolean> {
  if (!email) return true;
  if (isEmailAcessoLivre(email)) return true;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("assinaturas")
      .select("status, acesso_valido_ate")
      .eq("email", email)
      .order("criado_em", { ascending: false });

    if (error || !data || data.length === 0) return true;

    const agora = Date.now();

    return data.some((assinatura) => {
      const acessoValidoAte = assinatura.acesso_valido_ate
        ? new Date(assinatura.acesso_valido_ate).getTime()
        : null;

      // Assinatura ativa mas ainda sem nenhum ciclo confirmado (ex.: primeira
      // cobrança processando) — não bloqueia por segurança.
      if (assinatura.status === "authorized" && acessoValidoAte === null) {
        return true;
      }

      return acessoValidoAte !== null && acessoValidoAte > agora;
    });
  } catch {
    // Tabela ainda não existe ou serviço indisponível: não bloqueia por
    // segurança, para não derrubar o acesso de todo mundo por um problema
    // de infraestrutura.
    return true;
  }
}
