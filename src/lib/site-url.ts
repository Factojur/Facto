/**
 * URL canônica do site (links de e-mail, cadastro, etc.).
 * Em produção: NEXT_PUBLIC_SITE_URL=https://factoia.com.br
 */

const SITE_PRODUCAO = "https://factoia.com.br";

function eLocalhost(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

export function getSiteUrl(): string {
  const bruto = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (bruto) {
    const url = bruto.replace(/\/$/, "");
    // Em e-mail/produção, localhost no env quebra imagens e links externos.
    if (!eLocalhost(url)) return url;
  }

  if (process.env.VERCEL_ENV === "production") {
    return SITE_PRODUCAO;
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

/** URL pública estável para assets em e-mail (nunca localhost). */
export function getEmailAssetBaseUrl(): string {
  const site = getSiteUrl();
  if (eLocalhost(site)) return SITE_PRODUCAO;
  return site;
}
