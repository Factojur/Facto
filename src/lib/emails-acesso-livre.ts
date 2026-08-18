/**
 * Contas internas de teste / administração.
 *
 * Cotas (peças, análises, juris externa): as três são ilimitadas e entram
 * sem assinatura Mercado Pago.
 *
 * O que cada uma *vê* no produto:
 * - jec@facto.com → cliente Plano JEC / leigo (só Juizado)
 * - factoassessoria.jur@gmail.com → cliente Plano Completo / advogado
 * - admin@facto.com → Completo / advogado + painel /admin
 */
import { EMAIL_ADMIN } from "@/lib/admin-auth";
import type { PlanoId } from "@/lib/planos-facto";

export const EMAIL_JEC_TESTE = "jec@facto.com";
export const EMAIL_COMPLETO_TESTE = "factoassessoria.jur@gmail.com";

export const EMAILS_ACESSO_LIVRE = [
  EMAIL_ADMIN,
  EMAIL_JEC_TESTE,
  EMAIL_COMPLETO_TESTE,
] as const;

export type AcessoContaResolvido = {
  plano: PlanoId | null;
  tipoUsuario: "leigo" | "advogado";
  leigo: boolean;
  cotasIlimitadas: boolean;
};

export function normalizarEmail(
  email: string | null | undefined
): string {
  return (email ?? "").trim().toLowerCase();
}

export function isEmailAcessoLivre(
  email: string | null | undefined
): boolean {
  if (!email) return false;
  const normalizado = normalizarEmail(email);
  return EMAILS_ACESSO_LIVRE.some((e) => e.toLowerCase() === normalizado);
}

export function isEmailJecTeste(email: string | null | undefined): boolean {
  return normalizarEmail(email) === EMAIL_JEC_TESTE;
}

/**
 * Persona de produto (áreas + copy leigo/advogado).
 * Cotas ilimitadas continuam em `isEmailAcessoLivre` / `cotasIlimitadas`.
 */
export function resolverAcessoConta(
  email: string | null | undefined,
  planoDb: PlanoId | null,
  tipoDb: string | null | undefined
): AcessoContaResolvido {
  const n = normalizarEmail(email);

  if (n === EMAIL_JEC_TESTE) {
    return {
      plano: "jec",
      tipoUsuario: "leigo",
      leigo: true,
      cotasIlimitadas: true,
    };
  }

  if (n === EMAIL_COMPLETO_TESTE || n === EMAIL_ADMIN.toLowerCase()) {
    return {
      plano: planoDb && planoDb !== "jec" ? planoDb : "mensal",
      tipoUsuario: "advogado",
      leigo: false,
      cotasIlimitadas: true,
    };
  }

  const tipoUsuario = tipoDb === "leigo" ? "leigo" : "advogado";
  return {
    plano: planoDb,
    tipoUsuario,
    leigo: tipoUsuario === "leigo",
    cotasIlimitadas: false,
  };
}
