/**
 * Heurística de paginação A4 para preview folha a folha (≈11pt, margens forenses).
 * Não precisa ser pixel-perfect — objetivo é conferência visual antes do export.
 */

const CHARS_POR_PAGINA = 2400;

/** Divide a peça em blocos de parágrafo por página. */
export function dividirPecaEmPaginas(
  peca: string,
  maxChars = CHARS_POR_PAGINA
): string[][] {
  const texto = peca.trim();
  if (!texto) return [];

  const blocos = texto.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const paginas: string[][] = [];
  let atual: string[] = [];
  let chars = 0;

  for (const bloco of blocos) {
    const add = bloco.length + 2;
    if (chars + add > maxChars && atual.length > 0) {
      paginas.push(atual);
      atual = [];
      chars = 0;
    }
    atual.push(bloco);
    chars += add;
  }

  if (atual.length > 0) {
    paginas.push(atual);
  }

  return paginas.length ? paginas : [[texto]];
}
