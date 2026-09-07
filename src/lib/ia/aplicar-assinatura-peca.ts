/**
 * Preenche ou corrige o bloco de assinatura forense após "pede deferimento.".
 * Usa perfil (instrucoes), fatos/relato e o próprio corpo da peça — nunca deixa
 * [Cidade/UF] / [Nome do Advogado] / OAB/[UF] [Número] quando houver dado real.
 */

import { MARCADOR_ESPACO_1 } from "@/lib/formatacao-forense";
import { formatarOabAssinatura } from "@/lib/formatar-oab";

export type DadosAssinaturaPeca = {
  autorNome?: string | null;
  autorOab?: string | null;
  localFechamento?: string | null;
  /** Relato / fatos — fallback se a peça omitiu nome/OAB. */
  fatos?: string | null;
};

const UF_POR_ESTADO: Record<string, string> = {
  acre: "AC",
  alagoas: "AL",
  amapa: "AP",
  amapá: "AP",
  amazonas: "AM",
  bahia: "BA",
  ceara: "CE",
  ceará: "CE",
  df: "DF",
  "distrito federal": "DF",
  "espirito santo": "ES",
  "espírito santo": "ES",
  goias: "GO",
  goiás: "GO",
  maranhao: "MA",
  maranhão: "MA",
  "mato grosso": "MT",
  "mato grosso do sul": "MS",
  "minas gerais": "MG",
  para: "PA",
  pará: "PA",
  paraiba: "PB",
  paraíba: "PB",
  parana: "PR",
  paraná: "PR",
  pernambuco: "PE",
  piaui: "PI",
  piauí: "PI",
  "rio de janeiro": "RJ",
  "rio grande do norte": "RN",
  "rio grande do sul": "RS",
  rondonia: "RO",
  rondônia: "RO",
  roraima: "RR",
  "santa catarina": "SC",
  "sao paulo": "SP",
  "são paulo": "SP",
  sergipe: "SE",
  tocantins: "TO",
};

const RE_DATA =
  /(\d{1,2}\s+de\s+(?:janeiro|fevereiro|mar[cç]o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+\d{4})\.?/i;

function ehPlaceholder(s: string | null | undefined): boolean {
  if (!s?.trim()) return true;
  return /[\[\]]|Nome do Advogado|Cidade\s*\/\s*UF|N[uú]mero|NOME DO\(A\)/i.test(
    s
  );
}

function pickReal(
  ...cands: (string | null | undefined)[]
): string | undefined {
  for (const c of cands) {
    const t = c?.trim();
    if (t && !ehPlaceholder(t)) return t;
  }
  return undefined;
}

function normalizarLocal(raw: string): string {
  return raw
    .replace(/\s*[-–]\s*/g, "/")
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s+/g, " ")
    .trim();
}

function tituloCidade(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/(^|\s|')([a-záàâãéêíóôõúç])/g, (_, p, c: string) =>
      `${p}${c.toUpperCase()}`
    );
}

function ufDoEstado(nome: string): string | undefined {
  const key = nome.trim().toLowerCase();
  const ascii = key.normalize("NFD").replace(/\p{M}/gu, "");
  return UF_POR_ESTADO[key] ?? UF_POR_ESTADO[ascii];
}

/** Extrai nome, OAB e cidade/UF de um texto livre (peça ou relato). */
export function extrairAssinaturaDoTexto(texto: string): {
  nome?: string;
  oab?: string;
  local?: string;
} {
  if (!texto?.trim()) return {};

  let oab: string | undefined;
  for (const m of texto.matchAll(/\bOAB\/([A-Z]{2})\s*(\d[\d.]*)\b/gi)) {
    const linha = `OAB/${m[1]!.toUpperCase()} ${m[2]!.replace(/\./g, "")}`;
    if (!ehPlaceholder(linha)) {
      oab = linha;
      break;
    }
  }

  const nomeMatch =
    texto.match(
      /(?:Advogad[oa]\s*:?\s*)((?:Dra?\.?a?\.?\s+)?[A-ZÀ-Ÿ][A-Za-zÀ-ÿ']+(?:\s+(?:de|da|do|dos|das)?\s*[A-ZÀ-Ÿ][A-Za-zÀ-ÿ']+){1,4})/i
    ) ||
    texto.match(
      /((?:Dra?\.?a?\.?\s+)[A-ZÀ-Ÿ][A-Za-zÀ-ÿ']+(?:\s+(?:de|da|do|dos|das)?\s*[A-ZÀ-Ÿ][A-Za-zÀ-ÿ']+){1,3}),?\s*(?:inscrit[oa]|OAB\/)/i
    );
  const nome = nomeMatch?.[1]?.trim();

  let local: string | undefined;

  const comarcaEstado =
    /COMARCA\s+DE\s+([A-ZÀ-Ÿ][A-Za-zÀ-ÿ' ]+?)\s*[-–,]\s*ESTADO\s+DE\s+([A-ZÀ-Ÿ][A-Za-zÀ-ÿ ]+)/i.exec(
      texto
    );
  if (comarcaEstado) {
    const cidade = tituloCidade(comarcaEstado[1]!);
    const uf = ufDoEstado(comarcaEstado[2]!);
    if (uf) local = `${cidade}/${uf}`;
  }

  if (!local) {
    const cidadeUf =
      /\b([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+(?:de|da|do|dos|das)\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)*(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)*)\s*\/\s*([A-Z]{2})\b/.exec(
        texto
      );
    if (cidadeUf && !/\[/.test(cidadeUf[0]!)) {
      local = `${tituloCidade(cidadeUf[1]!)}/${cidadeUf[2]!.toUpperCase()}`;
    }
  }

  if (!local) {
    const comarcaUf =
      /(?:Comarca|Vara|Foro)\s+(?:de\s+)?([A-ZÀ-Ÿ][A-Za-zÀ-ÿ' ]+?)\s*[\/–-]\s*([A-Z]{2})\b/i.exec(
        texto
      );
    if (comarcaUf) {
      local = `${tituloCidade(comarcaUf[1]!)}/${comarcaUf[2]!.toUpperCase()}`;
    }
  }

  return {
    nome: nome && !ehPlaceholder(nome) ? nome : undefined,
    oab,
    local: local ? normalizarLocal(local) : undefined,
  };
}

export function temPlaceholderAssinatura(texto: string): boolean {
  return /\[Cidade\s*\/\s*UF\]|\[Nome do Advogado\]|OAB\/\[UF\]|\[N[uú]mero\]/i.test(
    texto
  );
}

function dataFechamentoAtual(): string {
  return new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function extrairDataDaCauda(cauda: string): string {
  return RE_DATA.exec(cauda)?.[1] ?? dataFechamentoAtual();
}

/**
 * Substitui placeholders ou reescreve o fechamento quando há dados reais.
 */
export function aplicarAssinaturaPeca(
  texto: string,
  dados?: DadosAssinaturaPeca
): string {
  const daPeca = extrairAssinaturaDoTexto(texto);
  const dosFatos = dados?.fatos
    ? extrairAssinaturaDoTexto(dados.fatos)
    : {};

  const nome = pickReal(dados?.autorNome, dosFatos.nome, daPeca.nome);
  const oabBruta = pickReal(dados?.autorOab, dosFatos.oab, daPeca.oab);
  const local = pickReal(
    dados?.localFechamento
      ? normalizarLocal(dados.localFechamento)
      : undefined,
    dosFatos.local,
    daPeca.local
  );

  const ufFallback = local?.includes("/")
    ? local.split("/").pop()?.trim().toUpperCase()
    : undefined;
  const oabLinha = oabBruta
    ? formatarOabAssinatura(
        oabBruta.replace(/^OAB\s*\/?\s*/i, ""),
        ufFallback
      )
    : undefined;
  const oabReal =
    oabLinha && !ehPlaceholder(oabLinha) ? oabLinha : undefined;

  const temDados = Boolean(nome || local || oabReal);
  const temPh = temPlaceholderAssinatura(texto);
  if (!temDados && !temPh) return texto;

  const idx = texto.toLowerCase().lastIndexOf("pede deferimento.");
  if (idx < 0) {
    if (!temPh) return texto;
    return texto
      .replace(/\[Cidade\s*\/\s*UF\]/gi, local ?? "[Cidade/UF]")
      .replace(/\[Nome do Advogado\]/gi, nome ?? "[Nome do Advogado]")
      .replace(
        /OAB\/\[UF\]\s*\[N[uú]mero\]/gi,
        oabReal ?? "OAB/[UF] [Número]"
      );
  }

  const antes = texto.slice(0, idx + "pede deferimento.".length);
  const cauda = texto.slice(idx + "pede deferimento.".length);
  const data = extrairDataDaCauda(cauda);

  const localFinal = local ?? "[Cidade/UF]";
  const nomeFinal = nome ?? "[Nome do Advogado]";
  const oabFinal = oabReal ?? "OAB/[UF] [Número]";

  // Só reescreve o bloco se melhoramos algo (ou ainda há placeholder).
  const melhora =
    (local && /\[Cidade\s*\/\s*UF\]/i.test(cauda)) ||
    (nome && /\[Nome do Advogado\]/i.test(cauda)) ||
    (oabReal && /OAB\/\[UF\]|\[N[uú]mero\]/i.test(cauda)) ||
    (Boolean(dados?.autorNome && !ehPlaceholder(dados.autorNome)) &&
      temPh) ||
    (Boolean(dados?.localFechamento && !ehPlaceholder(dados.localFechamento)) &&
      temPh) ||
    (Boolean(dados?.autorOab && !ehPlaceholder(dados.autorOab)) && temPh);

  if (!melhora && !temPh) return texto;

  if (!temDados && temPh) {
    return `${antes}${cauda}`;
  }

  const bloco = [
    "",
    MARCADOR_ESPACO_1,
    `${localFinal}, ${data}.`,
    MARCADOR_ESPACO_1,
    nomeFinal,
    oabFinal,
  ].join("\n");

  return `${antes}${bloco}`;
}
