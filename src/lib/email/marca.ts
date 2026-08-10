/**
 * Marca visual compartilhada nos e-mails HTML (Resend).
 * Logo com fundo transparente + traços em #908b6a (facto-gold).
 */

import { getEmailAssetBaseUrl } from "@/lib/site-url";

/** Cor da marca nos e-mails (mesmo tom do wordmark antigo). */
export const EMAIL_FACTO_GOLD = "#908b6a";

export function urlLogoEmail(): string {
  return `${getEmailAssetBaseUrl()}/brand/facto-logo-email.png`;
}

/**
 * Bloco HTML da logo (para e-mails escuros ou claros — fundo transparente).
 * height ~56px no cliente; ícone + wordmark empilhados.
 */
export function htmlLogoEmail(opcoes?: {
  heightPx?: number;
  alt?: string;
}): string {
  const h = opcoes?.heightPx ?? 56;
  const alt = opcoes?.alt ?? "FACTO";
  const src = urlLogoEmail();
  const w = Math.round(h * (204 / 160));
  return `<img src="${src}" alt="${alt}" width="${w}" height="${h}" style="display:inline-block;height:${h}px;width:auto;max-width:200px;border:0;outline:none;text-decoration:none;" />`;
}
