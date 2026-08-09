/**
 * Contas em que casos JEC podem ser gravados na nuvem (Supabase) para QA.
 * Clientes finais: responsabilidade de salvar PDF/Word / pasta local ou nuvem própria.
 */
export const EMAILS_PERSISTENCIA_CASOS = [
  "admin@facto.com",
  "jec@facto.com",
  "factoassessoria.jur@gmail.com",
] as const;

export function podePersistirCasosNaNuvem(
  email: string | null | undefined
): boolean {
  if (!email) return false;
  const n = email.trim().toLowerCase();
  return EMAILS_PERSISTENCIA_CASOS.some((e) => e.toLowerCase() === n);
}
