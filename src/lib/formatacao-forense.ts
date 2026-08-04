/**
 * Padrão de formatação forense adotado pelo FACTO (praxe + ABNT como guia):
 * - Papel A4
 * - Margens: superior/esquerda 3 cm; inferior/direita 2 cm
 * - Fonte: Times New Roman 12 pt, preto
 * - Entrelinhas: 1,5
 * - Corpo justificado; recuo de 1ª linha ≈ 2 cm
 * - Após endereçamento: 6 linhas (Processo nº na 4ª, se houver)
 * - Após autor: 1 linha → nome da ação → 1 linha → réu → 2 linhas → seções
 */

export const FORMATACAO_FORENSE = {
  fonte: "Times New Roman",
  tamanhoPt: 12,
  entrelinhas: 1.5,
  margemSuperiorCm: 3,
  margemEsquerdaCm: 3,
  margemInferiorCm: 2,
  margemDireitaCm: 2,
  recuoPrimeiraLinhaCm: 2,
  linhasAposEnderecamento: 6,
} as const;

/** Marcadores internos expandidos no HTML / PDF / Word. */
export const MARCADOR_ESPACO_6 = "[[ESPACO_6_LINHAS]]";
export const MARCADOR_ESPACO_1 = "[[ESPACO_1_LINHA]]";
export const MARCADOR_ESPACO_2 = "[[ESPACO_2_LINHAS]]";

/** @deprecated use MARCADOR_ESPACO_6 / montarMarcadorEspaco6 */
export const MARCADOR_ESPACO_ENDEREÇAMENTO = MARCADOR_ESPACO_6;

const MARCADORES_LEGADOS = new Set([
  MARCADOR_ESPACO_6,
  "[[ESPACO_6_LINHAS_APOS_ENDEREÇAMENTO]]",
  "[[ESPACO_10_LINHAS_APOS_ENDEREÇAMENTO]]",
]);

export function montarMarcadorEspaco6(numeroProcesso?: string | null): string {
  const n = numeroProcesso?.trim();
  if (n) {
    const rotulo = /^processo/i.test(n) ? n : `Processo nº ${n}`;
    return `[[ESPACO_6_LINHAS|${rotulo}]]`;
  }
  return MARCADOR_ESPACO_6;
}

export type MarcadorEspacoParseado = {
  linhas: 1 | 2 | 6;
  processo?: string;
};

export function parseMarcadorEspaco(
  texto: string
): MarcadorEspacoParseado | null {
  const t = texto.trim();
  if (t === MARCADOR_ESPACO_1) return { linhas: 1 };
  if (t === MARCADOR_ESPACO_2) return { linhas: 2 };

  const comProc = /^\[\[ESPACO_6_LINHAS\|(.+?)\]\]$/.exec(t);
  if (comProc) return { linhas: 6, processo: comProc[1]!.trim() };

  if (MARCADORES_LEGADOS.has(t) || t.startsWith("[[ESPACO_6_LINHAS")) {
    return { linhas: 6 };
  }
  return null;
}

export function ehMarcadorEspacoEnderecamento(texto: string): boolean {
  return parseMarcadorEspaco(texto) !== null;
}

/** Converte cm → twips (1 cm ≈ 567 twips) para docx. */
export function cmParaTwips(cm: number): number {
  return Math.round(cm * 567);
}

/** Altura aproximada de N linhas com entrelinha 1,5 em mm (PDF). */
export function alturaLinhasMm(linhas: number): number {
  return linhas * 6.35;
}

/**
 * Divide a peça em blocos de linha (1 linha = 1 parágrafo).
 */
export function dividirBlocosPeca(texto: string): string[] {
  return texto
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l.length > 0);
}
