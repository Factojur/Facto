/**
 * Preview interno dos módulos ainda fechados no catálogo.
 * Clientes não entram — só estes e-mails (não confundir com acesso livre / jec@).
 */
export const EMAILS_PREVIEW_AREAS = [
  "admin@facto.com",
  "factoassessoria.jur@gmail.com",
] as const;

export function isEmailPreviewAreas(
  email: string | null | undefined
): boolean {
  if (!email) return false;
  const normalizado = email.trim().toLowerCase();
  return EMAILS_PREVIEW_AREAS.some((e) => e.toLowerCase() === normalizado);
}
