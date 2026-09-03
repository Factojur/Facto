/** Riscos para o rodapé da peça — sem linhas internas LASTRO/ENCAIXE do plano. */
export function filtrarRiscosParaRodape(
  riscos?: string[] | null
): string[] {
  if (!riscos?.length) return [];
  return riscos
    .map((r) => r.trim())
    .filter((r) => r.length > 4)
    .filter(
      (r) =>
        !/^\s*LASTRO\s*:/i.test(r) &&
        !/^\s*ENCAIXE\s*:/i.test(r) &&
        !/\bLASTRO\s*:\s*relato\s*\|/i.test(r)
    )
    .slice(0, 6);
}
