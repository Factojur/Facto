/**
 * Padrão de formatação forense adotado pelo FACTO (praxe + ABNT como guia):
 * - Papel A4
 * - Margens: superior/esquerda 3 cm; inferior/direita 2 cm
 * - Fonte: Times New Roman 12 pt, preto
 * - Entrelinhas: 1,5
 * - Texto justificado; recuo de 1ª linha ≈ 2 cm nos parágrafos do corpo
 * - ~10 linhas em branco entre o endereçamento e a qualificação das partes
 *   (espaço clássico para despacho / autuação — ~8 cm / ~10 linhas)
 *
 * Refs. de praxe: manuais de peça processual (ex.: ~10 linhas após
 * endereçamento); margens ABNT 3/2 cm; Times 12; espaçamento 1,5.
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
  /** Linhas em branco entre endereçamento e qualificação. */
  linhasAposEnderecamento: 10,
} as const;

/** Marcador interno expandido no HTML / PDF / Word. */
export const MARCADOR_ESPACO_ENDEREÇAMENTO = "[[ESPACO_10_LINHAS_APOS_ENDEREÇAMENTO]]";

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
  return texto.trim() === MARCADOR_ESPACO_ENDEREÇAMENTO;
}
