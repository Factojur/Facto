/**
 * Padrão de formatação forense adotado pelo FACTO (praxe + ABNT como guia):
 * - Papel A4
 * - Margens: superior/esquerda 3 cm; inferior/direita 2 cm
 * - Fonte: Times New Roman 12 pt, preto
 * - Entrelinhas: 1,5
 * - Corpo justificado; recuo de 1ª linha ≈ 2 cm
 * - Citação de jurisprudência: Times 10 pt, justificado, recuo esquerdo 4 cm
 * - Entre parágrafos do corpo: sem espaço adicional (só a entrelinha 1,5)
 * - Centralizado: endereçamento, nome da ação, fechamento
 * - Negrito: endereçamento, nome da ação; tópicos/subtítulos só se Markdown da IA (**…**)
 * - Itálico: latim, inglês e demais línguas estrangeiras; citações entre aspas
 * - Fechamento: Nestes termos / pede deferimento / localidade+data / nome / OAB (centralizado)
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
  /** Citação de jurisprudência / ementa. */
  tamanhoCitacaoPt: 10,
  recuoCitacaoCm: 4,
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

export function montarMarcadorEspaco6(
  numeroProcesso?: string | null,
  epigrafe?: string[] | null
): string {
  const extras = (epigrafe ?? []).map((l) => l.trim()).filter(Boolean);
  if (extras.length) {
    return `[[ESPACO_6_LINHAS|${extras.join(";;")}]]`;
  }
  const n = numeroProcesso?.trim();
  if (n) {
    const rotulo = /^processo/i.test(n) ? n : `Processo nº: ${n}`;
    return `[[ESPACO_6_LINHAS|${rotulo}]]`;
  }
  return MARCADOR_ESPACO_6;
}

export type MarcadorEspacoParseado = {
  linhas: 1 | 2 | 6;
  processo?: string;
  epigrafe?: string[];
};

export function parseMarcadorEspaco(
  texto: string
): MarcadorEspacoParseado | null {
  const t = texto.trim();
  if (t === MARCADOR_ESPACO_1) return { linhas: 1 };
  if (t === MARCADOR_ESPACO_2) return { linhas: 2 };

  const comProc = /^\[\[ESPACO_6_LINHAS\|(.+?)\]\]$/.exec(t);
  if (comProc) {
    const epigrafe = comProc[1]!
      .split(";;")
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      linhas: 6,
      processo: epigrafe[0],
      epigrafe: epigrafe.length ? epigrafe : undefined,
    };
  }

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
 * Texto para Copiar / clipboard: expande espaços e remove marcadores internos.
 * Word/PDF continuam usando o texto com [[ESPACO_…]] / [[JURIS]].
 */
export function textoPecaParaClipboard(texto: string): string {
  return texto
    .replace(/\r\n/g, "\n")
    .replace(/\[\[JURIS\]\]\s*/gi, "")
    .replace(/\s*\[\[\/JURIS\]\]/gi, "")
    .replace(/\[\[ESPACO_6_LINHAS\|([^\]]+)\]\]/gi, (_m, ep: string) => {
      const extras = String(ep)
        .split(";;")
        .map((s) => s.trim())
        .filter(Boolean);
      const inicio = extras.length >= 3 ? 2 : 4;
      const linhas: string[] = [];
      for (let i = 1; i <= 6; i++) {
        const idx = i - inicio;
        linhas.push(idx >= 0 && idx < extras.length ? extras[idx]! : "");
      }
      return `\n${linhas.join("\n")}\n`;
    })
    .replace(/\[\[ESPACO_6_LINHAS\]\]/gi, "\n\n\n\n\n\n")
    .replace(/\[\[ESPACO_2_LINHAS\]\]/gi, "\n\n")
    .replace(/\[\[ESPACO_1_LINHA\]\]/gi, "\n")
    .replace(/\[\[ESPACO_6_LINHAS_APOS_ENDERE[CÇ]AMENTO\]\]/gi, "\n\n\n\n\n\n")
    .replace(/\[\[ESPACO_10_LINHAS_APOS_ENDERE[CÇ]AMENTO\]\]/gi, "\n\n\n\n\n\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
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
