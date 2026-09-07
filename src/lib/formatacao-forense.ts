/**
 * Padrão de formatação forense adotado pelo FACTO
 * (praxe forense + NBR 14724 / NBR 10520:2023 como guia).
 *
 * Página (NBR 14724):
 * - Papel A4 (21 × 29,7 cm); fonte preta
 * - Margens anverso: superior/esquerda 3 cm; inferior/direita 2 cm
 * - Corpo: fonte 12; entrelinhas 1,5
 *
 * Citação longa / ementa (NBR 10520:2023 §7.1.1):
 * - Recuo padronizado à esquerda (recomendado 4 cm)
 * - Fonte menor que o corpo (10 pt)
 * - Espaço simples; sem aspas; justificado
 *
 * Adaptações de praxe forense (não acadêmicas):
 * - Recuo de 1ª linha do corpo ≈ 2 cm (manuais ABNT variam 1,25–2 cm)
 * - Numeração da página só com o número, canto inferior direito
 */

export const FORMATACAO_FORENSE = {
  /** Largura A4 em mm (NBR 14724). */
  papelLarguraMm: 210,
  /** Altura A4 em mm. */
  papelAlturaMm: 297,
  fonte: "Times New Roman",
  tamanhoPt: 12,
  /** Espaçamento entre linhas do corpo (NBR 14724 — 1,5). */
  entrelinhas: 1.5,
  margemSuperiorCm: 3,
  margemEsquerdaCm: 3,
  margemInferiorCm: 2,
  margemDireitaCm: 2,
  /** Recuo 1ª linha do corpo — praxe forense (ABNT acadêmica costuma 1,25 cm). */
  recuoPrimeiraLinhaCm: 2,
  /**
   * Citação direta longa / ementa (NBR 10520:2023):
   * fonte menor, recuo ~4 cm, espaço simples.
   */
  tamanhoCitacaoPt: 10,
  recuoCitacaoCm: 4,
  /** Espaço simples na citação longa (NBR 14724 + 10520). */
  entrelinhasCitacao: 1,
  linhasAposEnderecamento: 6,
} as const;

/** Altura de uma linha do corpo em mm (pt × entrelinha ÷ 2,834). */
export function alturaLinhaCorpoMm(
  tamanhoPt: number = FORMATACAO_FORENSE.tamanhoPt,
  entrelinhas: number = FORMATACAO_FORENSE.entrelinhas
): number {
  return (tamanhoPt * entrelinhas) / 2.834;
}

/** Converte cm → twips (1 cm ≈ 567 twips) para docx. */
export function cmParaTwips(cm: number): number {
  return Math.round(cm * 567);
}

/** Dimensões A4 em twips (Word). */
export function tamanhoPapelA4Twips(): { width: number; height: number } {
  return {
    width: cmParaTwips(FORMATACAO_FORENSE.papelLarguraMm / 10),
    height: cmParaTwips(FORMATACAO_FORENSE.papelAlturaMm / 10),
  };
}

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

/**
 * Separa `[[ESPACO_…]]` colado a texto na mesma linha
 * (ex.: `Santos/SP.[[ESPACO_2_LINHAS]]` → duas linhas).
 * Evita o marcador literal no PDF/preview.
 */
export function separarMarcadoresEspacoEmbutidos(texto: string): string {
  return texto
    .replace(/\r\n/g, "\n")
    .split("\n")
    .flatMap((linha) => {
      if (!/\[\[ESPACO/i.test(linha)) return [linha];
      return linha
        .split(/(\[\[ESPACO_[^\]]+\]\])/i)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
    })
    .join("\n");
}

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

/**
 * Expande [[ESPACO_…]] em linhas (mesma ordem do PDF/DOCX/clipboard).
 * Epígrafe com ≥3 itens: linhas 2–4; só processo: linhas 4–6.
 */
export function expandirLinhasMarcadorEspaco(
  m: MarcadorEspacoParseado
): string[] {
  if (m.linhas !== 6) {
    return Array.from({ length: m.linhas }, () => "");
  }
  const extras =
    m.epigrafe && m.epigrafe.length > 0
      ? m.epigrafe
      : m.processo
        ? [m.processo]
        : [];
  const inicio = extras.length >= 3 ? 2 : 4;
  const linhas: string[] = [];
  for (let i = 1; i <= 6; i++) {
    const idx = i - inicio;
    linhas.push(idx >= 0 && idx < extras.length ? extras[idx]! : "");
  }
  return linhas;
}

/** Altura aproximada de N linhas do corpo em mm (PDF / preview). */
export function alturaLinhasMm(linhas: number): number {
  return linhas * alturaLinhaCorpoMm();
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
      const linhas = expandirLinhasMarcadorEspaco({
        linhas: 6,
        epigrafe: extras.length ? extras : undefined,
        processo: extras[0],
      });
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
