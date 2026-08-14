/**
 * Contas administrativas / internas: acesso à plataforma sem assinatura
 * e sem cota mensal (peças, análises e buscas externas de juris).
 * Inclua novos e-mails aqui, um de cada vez, quando o usuário pedir.
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
