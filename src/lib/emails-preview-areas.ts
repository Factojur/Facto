/**
 * Preview interno dos módulos ainda fechados no catálogo (`available: false`).
 * Só o admin — as contas de teste (jec@ / assessoria) veem o produto como o cliente.
 */
import { EMAIL_ADMIN } from "@/lib/admin-auth";

export const EMAILS_PREVIEW_AREAS = [EMAIL_ADMIN] as const;

export function isEmailPreviewAreas(
  email: string | null | undefined
): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === EMAIL_ADMIN.toLowerCase();
}
