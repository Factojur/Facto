/**
 * URL canônica do site (links de e-mail, cadastro, etc.).
 * Em produção: NEXT_PUBLIC_SITE_URL=https://factoia.com.br
 */
export function getSiteUrl(): string {
  const bruto = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (bruto) return bruto.replace(/\/$/, "");
  return "http://localhost:3000";
}
