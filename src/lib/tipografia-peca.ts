/**
 * Classificação tipográfica dos blocos da peça forense FACTO.
 *
 * Alinhamentos:
 * - centralizado + negrito: endereçamento, nome da ação
 * - centralizado: fechamento (Nestes termos, data, assinatura)
 * - esquerda + negrito: tópicos romanos e subtítulos a)/b)/c) do DIREITO
 * - justificado + peso normal: itens a)/b) em DOS PEDIDOS e 1)/2) em DAS PROVAS
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
const RE_ITEM_NUM = /^(?:\*\*)?\d+\)\s+\S/;
const RE_NOME_ACAO =
  /^(?:PETI[CÇ][AÃ]O\s+INICIAL\s*[—–-]?\s*)?(?:A[CÇ][AÃ]O\s+|EXECU[CÇ][AÃ]O\s+|EMBARGOS\s+|RECURSO\s+|CONTESTA)/i;
const RE_FECHAMENTO =
  /^(Nestes termos|Termos em que|Pede e espera deferimento|Pede deferimento|pede deferimento)/i;
const RE_JURIS_MARCA = /^\[\[JURIS\]\]\s*([\s\S]*?)(?:\s*\[\[\/JURIS\]\])?\s*$/i;

/** Termos latinos / estrangeiros a italicizar em qualquer trecho da peça. */
const TERMOS_ITALICO = [
  // Locuções latinas (mais longas primeiro — ordem aplicada em runtime)
  "exceptio non adimpleti contractus",
  "venire contra factum proprium",
  "inaudita altera pars",
  "pacta sunt servanda",
  "rebus sic stantibus",
  "fumus boni iuris",
  "periculum in mora",
  "non bis in idem",
  "culpa in contrahendo",
  "culpa in vigilando",
  "culpa in eligendo",
  "error in procedendo",
  "error in judicando",
  "quantum debeatur",
  "quantum meruit",
  "damnum emergens",
  "lucrum cessans",
  "solutio indebiti",
  "modus operandi",
  "mutatis mutandis",
  "obiter dictum",
  "ratio decidendi",
  "stare decisis",
  "habeas corpus",
  "habeas data",
  "in re ipsa",
  "data venia",
  "ex officio",
  "ex professo",
  "ex positis",
  "ipso facto",
  "ipso iure",
  "ipso jure",
  "sine qua non",
  "ultra petita",
  "extra petita",
  "citra petita",
  "bis in idem",
  "res judicata",
  "res nullius",
  "onus probandi",
  "onus provisandi",
  "prima facie",
  "stricto sensu",
  "lato sensu",
  "sensu stricto",
  "sensu lato",
  "sui generis",
  "status quo",
  "erga omnes",
  "inter partes",
  "in limine",
  "in personam",
  "in rem",
  "in casu",
  "in fine",
  "in totum",
  "ad cautelam",
  "ad judicia",
  "ad hoc",
  "ad absurdum",
  "a priori",
  "a posteriori",
  "de facto",
  "de jure",
  "de iure",
  "ex nunc",
  "ex tunc",
  "ex vi",
  "pro bono",
  "pro rata",
  "pro labore",
  "bona fide",
  "bona fides",
  "mala fide",
  "contra legem",
  "secundum legem",
  "praeter legem",
  "vacatio legis",
  "locus standi",
  "animus nocendi",
  "ictu oculi",
  "per se",
  "ab initio",
  "in limine litis",
  "lis pendens",
  "res litigiosa",
  "dies a quo",
  "dies ad quem",
  "nulla poena sine lege",
  "nullum crimen sine lege",
  "nemo tenetur se detegere",
  "pacta tertiis nec nocent nec prosunt",
  // Inglês jurídico / técnico (evitar loanwords já naturalizados: site, link, e-mail…)
  "due diligence",
  "leading case",
  "leading cases",
  "joint venture",
  "know-how",
  "know how",
  "compliance",
  "phishing",
  "spoofing",
  "malware",
  "ransomware",
  "deepfake",
  "cyberbullying",
  "bullying",
  "stalking",
  "gaslighting",
  "fake news",
  "goodwill",
  "disclaimer",
  "benchmark",
  "turnover",
  "leasing",
  "factoring",
  "overruling",
  "distinguishing",
  "framework",
  "streaming",
];

function escaparRegexTermo(termo: string): string {
  return termo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Termos ordenados do mais longo ao mais curto (evita match parcial). */
function termosItalicoOrdenados(): string[] {
  return [...TERMOS_ITALICO].sort((a, b) => b.length - a.length);
}

/**
 * Aspas curtas com morfologia latina típica (ex.: "culpa in vigilando")
 * que ainda não estejam em *"…"*.
 */
function italicizarAspasComAparenciaLatina(texto: string): string {
  return texto.replace(/(?<!\*)"([^"\n]{2,80})"(?!\*)/g, (m, inner: string) => {
    const palavras = inner.trim().split(/\s+/);
    if (palavras.length === 0 || palavras.length > 8) return m;
    // Não italicizar citações legais em português
    if (
      /\b(art\.?|arts\.?|par[aá]grafo|inciso|al[ií]nea|s[uú]mula|lei|c[oó]digo|cdc|cpc|cf|cc)\b/i.test(
        inner
      )
    ) {
      return m;
    }
    const latinas = palavras.filter((p) =>
      /^(?:(?:in|ex|ad|de|pro|per|sine|ultra|extra|inter|erga|non|bis|res|ius|lex|quod|quia|et|vel|nec|sed|cum|sub|ob|ab|contra|secundum|praeter|nulla|nullum|nemo|dies|lis|ictu|animus|modus|status|ratio|bona|mala|culpa|error|quantum|damnum|lucrum|pacta|habeas|data|venia|ipso|stricto|lato|sui|prima|facie)(?:que)?|[a-z]*(?:um|us|ae|is|em|am|orum|arum|ibus|iter|atio|iones))$/i.test(
        p.replace(/[.,;:!?]$/, "")
      )
    );
    if (latinas.length >= Math.ceil(palavras.length * 0.6)) {
      return `*"${inner}"*`;
    }
    return m;
  });
}

/** Italiciza termos latinos/estrangeiros em qualquer parte: *"termo"*. */
export function aplicarItalicoTermosEstrangeiros(texto: string): string {
  let t = texto;
  for (const termo of termosItalicoOrdenados()) {
    const escapado = escaparRegexTermo(termo);

    // Já entre aspas: "in re ipsa" → *"in re ipsa"*
    const comAspas = new RegExp(`(?<!\\*)"(${escapado})"(?!\\*)`, "gi");
    t = t.replace(comAspas, (_m, inner: string) => `*"${inner}"*`);

    // Sem aspas: in re ipsa → *"in re ipsa"*
    const re = new RegExp(`\\b(${escapado})\\b`, "gi");
    t = t.replace(re, (m, _g, offset: number, whole: string) => {
      const antes = whole.slice(Math.max(0, offset - 2), offset);
      const depois = whole.slice(offset + m.length, offset + m.length + 2);
      if (antes.includes("*") || depois.startsWith("*")) return m;
      if (antes.endsWith('"') || depois.startsWith('"')) return m;
      return `*"${m}"*`;
    });
  }

  t = italicizarAspasComAparenciaLatina(t);
  return t;
}

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

export function classificarBlocoPeca(
  linha: string,
  estado: { emFechamento: boolean; emPedidos: boolean; emProvas: boolean }
): BlocoPecaClassificado {
  const t = linha.replace(/\s+/g, " ").trim();
  const marcador = parseMarcadorEspaco(t);
  if (marcador) {
    return { tipo: "marcador", texto: t, marcador };
  }

  if (RE_FECHAMENTO.test(t)) {
    estado.emFechamento = true;
    estado.emPedidos = false;
    estado.emProvas = false;
  }

  if (ehCitacaoJurisprudencia(t)) {
    return { tipo: "citacao-juris", texto: limparMarcadorJuris(t) };
  }

  if (RE_SECAO.test(t)) {
    estado.emPedidos = /DOS PEDIDOS\b/i.test(t);
    estado.emProvas = /DAS PROVAS\b/i.test(t);
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

  const limparMarcacaoItem = (s: string) =>
    s.replace(/^\*\*/, "").replace(/\*\*$/, "").trim();

  if (RE_SUB.test(t)) {
    // DOS PEDIDOS e DAS PROVAS: peso normal (não negrito)
    if (estado.emPedidos || estado.emProvas) {
      return { tipo: "item-pedido", texto: limparMarcacaoItem(t) };
    }
    return { tipo: "subtopico", texto: t };
  }

  // Em DAS PROVAS: itens numerados 1)/2)/3) também em peso normal
  if (estado.emProvas && RE_ITEM_NUM.test(t)) {
    return { tipo: "item-pedido", texto: limparMarcacaoItem(t) };
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

  const estado = { emFechamento: false, emPedidos: false, emProvas: false };
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
