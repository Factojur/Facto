/** E-mail do administrador do FACTO (acesso a /admin). */
export const EMAIL_ADMIN = "admin@facto.com";

export function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email && email.toLowerCase() === EMAIL_ADMIN.toLowerCase());
}
