/**
 * Contas com acesso livre à plataforma (sem plano/pacote).
 * Admin/gestor + contas de teste usadas no desenvolvimento e QA.
 */
export const EMAILS_ACESSO_LIVRE = [
  "admin@facto.com",
  "jec@facto.com",
  "factoassessoria.jur@gmail.com",
] as const;

export function isEmailAcessoLivre(
  email: string | null | undefined
): boolean {
  if (!email) return false;
  const normalizado = email.trim().toLowerCase();
  return EMAILS_ACESSO_LIVRE.some((e) => e.toLowerCase() === normalizado);
}
