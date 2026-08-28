/**
 * FACTO Gestão — disponível só em desenvolvimento local por padrão.
 * Produção: rotas inativas até deploy explícito (NEXT_PUBLIC_FACTO_GESTAO=1).
 */
export function gestaoHabilitada(): boolean {
  if (process.env.NEXT_PUBLIC_FACTO_GESTAO === "1") return true;
  return process.env.NODE_ENV === "development";
}

export function destinoLoginGestao(
  destino: string | null | undefined
): boolean {
  return destino === "gestao" && gestaoHabilitada();
}
