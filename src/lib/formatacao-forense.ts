/**
 * Padrão de formatação forense adotado pelo FACTO (praxe + ABNT como guia):
 * - Papel A4
 * - Margens: superior/esquerda 3 cm; inferior/direita 2 cm
 * - Fonte: Times New Roman 12 pt, preto
 * - Entrelinhas: 1,5
 * - Texto justificado; recuo de 1ª linha ≈ 2 cm nos parágrafos do corpo
 * - Exatamente 6 quebras de linha (\n\n\n\n\n\n) entre o endereçamento
 *   e a qualificação das partes
 *
 * Refs. de praxe: manuais de peça processual; margens ABNT 3/2 cm;
 * Times 12; espaçamento 1,5.
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
  /** Quebras de linha entre endereçamento e qualificação. */
  linhasAposEnderecamento: 6,
} as const;

/** Marcador interno expandido no HTML / PDF / Word. */
export const MARCADOR_ESPACO_ENDEREÇAMENTO =
  "[[ESPACO_6_LINHAS_APOS_ENDEREÇAMENTO]]";

/** Aceita marcador antigo (10 linhas) por compatibilidade. */
const MARCADORES_ESPACO_LEGADOS = new Set([
  MARCADOR_ESPACO_ENDEREÇAMENTO,
  "[[ESPACO_10_LINHAS_APOS_ENDEREÇAMENTO]]",
]);

/** Converte cm → twips (1 cm ≈ 567 twips) para docx. */
export function cmParaTwips(cm: number): number {
  return Math.round(cm * 567);
}

/** Altura aproximada de N linhas com entrelinha 1,5 em mm (PDF). */
export function alturaLinhasMm(linhas: number): number {
  // 12pt * 1.5 ≈ 18pt ≈ 6.35 mm por linha
  return linhas * 6.35;
}

export function ehMarcadorEspacoEnderecamento(texto: string): boolean {
  return MARCADORES_ESPACO_LEGADOS.has(texto.trim());
}

/**
 * Divide a peça em blocos de linha (1 linha = 1 parágrafo).
 * Linhas em branco do texto-fonte são descartadas — o espaçamento
 * visual entre tópicos fica a cargo do HTML/PDF/DOCX (margem do título).
 */
export function dividirBlocosPeca(texto: string): string[] {
  return texto
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l.length > 0);
}
