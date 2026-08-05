/**
 * Classificação tipográfica dos blocos da peça forense FACTO.
 *
 * Alinhamentos:
 * - centralizado + negrito: endereçamento, nome da ação
 * - centralizado: fechamento (Nestes termos, data, assinatura)
 * - esquerda + negrito: tópicos romanos e subtítulos a)/b)/c)
 * - justificado + recuo 1ª linha 2 cm: corpo
 * - justificado + recuo esquerdo 4 cm + 10 pt: citação de jurisprudência
 *
 * Inline: **negrito**; *"latim/inglês/citação"* = itálico com aspas.
 */

import {
  FORMATACAO_FORENSE,
  parseMarcadorEspaco,
  type MarcadorEspacoParseado,
} from "@/lib/formatacao-forense";

export type TipoBlocoPeca =
  | "marcador"
  | "enderecamento"
  | "nome-acao"
  | "secao-titulo"
  | "subtopico"
  | "item-pedido"
  | "citacao-juris"
  | "prova-item"
  | "fechamento"
  | "paragrafo";

export type BlocoPecaClassificado = {
  tipo: TipoBlocoPeca;
  /** Texto sem marcadores [[JURIS]] / [[/JURIS]]. */
  texto: string;
  marcador?: MarcadorEspacoParseado;
};

const RE_ENDEREÇAMENTO =
  /^(EXCELENT[IÍ]SSIMO|DA COMARCA|JU[IÍ]ZO\s+DA|EXCELENTISSIMO)/i;
const RE_SECAO = /^([IVXLCDM]+)\s*[-—–.]\s+\S/i;
const RE_SUB = /^(?:\*\*)?[a-z]\)\s+\S/i;
const RE_NOME_ACAO =
  /^(?:PETI[CÇ][AÃ]O\s+INICIAL\s*[—–-]?\s*)?(?:A[CÇ][AÃ]O\s+|EXECU[CÇ][AÃ]O\s+|EMBARGOS\s+|RECURSO\s+|CONTESTA)/i;
const RE_FECHAMENTO =
  /^(Nestes termos|Termos em que|Pede e espera deferimento|Pede deferimento|pede deferimento)/i;
const RE_JURIS_MARCA = /^\[\[JURIS\]\]\s*([\s\S]*?)(?:\s*\[\[\/JURIS\]\])?\s*$/i;

/** Termos latinos / estrangeiros frequentes a italicizar se a IA esquecer. */
const TERMOS_ITALICO = [
  "fumus boni iuris",
  "periculum in mora",
  "in re ipsa",
  "data venia",
  "ex officio",
  "habeas corpus",
  "modus operandi",
  "in casu",
  "a priori",
  "a posteriori",
  "mutatis mutandis",
  "ipso facto",
  "sine qua non",
  "ultra petita",
  "extra petita",
  "bis in idem",
  "res judicata",
  "pacta sunt servanda",
  "onus probandi",
  "quantum debeatur",
  "inaudita altera pars",
];

export function limparMarcadorJuris(texto: string): string {
  return texto
    .replace(/^\[\[JURIS\]\]\s*/i, "")
    .replace(/\s*\[\[\/JURIS\]\]\s*$/i, "")
    .trim();
}

export function ehCitacaoJurisprudencia(linha: string): boolean {
  const t = linha.trim();
  if (RE_JURIS_MARCA.test(t) || /^\[\[JURIS\]\]/i.test(t)) return true;
  if (t.length < 140) return false;

  const temTribunal = /\b(STJ|STF|TJ[A-Z]{2}|TRF\s*\d*|TST|TSE)\b/.test(t);
  const temClasse =
    /\b(REsp|AgRg|AgInt|ARE|RE|HC|MS|ADI|ADPF|AgR|EDcl|processo\s+n)/i.test(t);
  const temEmenta = /\b(EMENTA|Acórd[aã]o|Relator|Rel\.|julgado em|DJe)\b/i.test(
    t
  );
  return (temTribunal && temClasse) || (temEmenta && temTribunal);
}

/** Colapsa blocos [[JURIS]]…[[/JURIS]] em uma linha cada. */
export function normalizarBlocosJuris(texto: string): string {
  return texto.replace(
    /\[\[JURIS\]\]\s*([\s\S]*?)\s*\[\[\/JURIS\]\]/gi,
    (_m, corpo: string) =>
      `[[JURIS]]${String(corpo).replace(/\s+/g, " ").trim()}[[/JURIS]]`
  );
}

/** Italiciza termos latinos comuns ainda sem marcação Markdown. */
export function aplicarItalicoTermosEstrangeiros(texto: string): string {
  let t = texto;
  for (const termo of TERMOS_ITALICO) {
    const escapado = termo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\b(${escapado})\\b`, "gi");
    t = t.replace(re, (m, _g, offset: number, whole: string) => {
      const antes = whole.slice(Math.max(0, offset - 2), offset);
      const depois = whole.slice(offset + m.length, offset + m.length + 2);
      if (antes.includes("*") || depois.startsWith("*")) return m;
      if (antes.endsWith('"') || depois.startsWith('"')) return m;
      return `*"${m}"*`;
    });
  }
  return t;
}

export function classificarBlocoPeca(
  linha: string,
  estado: { emFechamento: boolean; emPedidos: boolean }
): BlocoPecaClassificado {
  const t = linha.replace(/\s+/g, " ").trim();
  const marcador = parseMarcadorEspaco(t);
  if (marcador) {
    return { tipo: "marcador", texto: t, marcador };
  }

  if (RE_FECHAMENTO.test(t)) {
    estado.emFechamento = true;
    estado.emPedidos = false;
  }

  if (ehCitacaoJurisprudencia(t)) {
    return { tipo: "citacao-juris", texto: limparMarcadorJuris(t) };
  }

  if (RE_SECAO.test(t)) {
    estado.emPedidos = /DOS PEDIDOS\b/i.test(t);
    return { tipo: "secao-titulo", texto: t };
  }

  if (RE_ENDEREÇAMENTO.test(t)) {
    return { tipo: "enderecamento", texto: t };
  }

  if (RE_NOME_ACAO.test(t) && (t === t.toUpperCase() || t.length < 180)) {
    return { tipo: "nome-acao", texto: t };
  }

  if (
    !estado.emFechamento &&
    t === t.toUpperCase() &&
    t.length < 100 &&
    !t.startsWith("-") &&
    !t.startsWith("[") &&
    !RE_SECAO.test(t) &&
    !/^ADVOGADO$/i.test(t)
  ) {
    return { tipo: "enderecamento", texto: t };
  }

  if (
    estado.emFechamento ||
    t.startsWith("OAB/") ||
    /^Advogado$/i.test(t) ||
    /^[A-Za-zÀ-ÿ' .]+\/\s*[A-Z]{2},\s+\d/i.test(t)
  ) {
    return { tipo: "fechamento", texto: t };
  }

  if (RE_SUB.test(t)) {
    // Em DOS PEDIDOS: a)/b)/c) em peso normal (não negrito)
    if (estado.emPedidos) {
      return {
        tipo: "item-pedido",
        texto: t.replace(/^\*\*/, "").replace(/\*\*$/, "").trim(),
      };
    }
    return { tipo: "subtopico", texto: t };
  }

  if (t.startsWith("- ")) {
    return { tipo: "prova-item", texto: t };
  }

  return { tipo: "paragrafo", texto: t };
}

export function classificarPeca(texto: string): BlocoPecaClassificado[] {
  const linhas = texto
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l.length > 0);

  const estado = { emFechamento: false, emPedidos: false };
  return linhas.map((l) => classificarBlocoPeca(l, estado));
}

export type RunMarkdown = {
  text: string;
  bold?: boolean;
  italic?: boolean;
};

/** Extrai runs de **negrito** e *itálico* (inclui *"citação"*). */
export function parseMarkdownRuns(texto: string): RunMarkdown[] {
  const partes = texto
    .split(/(\*\*[^*]+?\*\*|\*[^*]+?\*)/g)
    .filter((p) => p.length > 0);

  return partes.map((parte) => {
    const negrito = /^\*\*([^*]+?)\*\*$/.exec(parte);
    if (negrito) return { text: negrito[1]!, bold: true };
    const italico = /^\*([^*]+?)\*$/.exec(parte);
    if (italico) return { text: italico[1]!, italic: true };
    return { text: parte };
  });
}

export function textoSemMarkdown(texto: string): string {
  return parseMarkdownRuns(texto)
    .map((r) => r.text)
    .join("");
}

export const TIPOGRAFIA_PECA = FORMATACAO_FORENSE;
