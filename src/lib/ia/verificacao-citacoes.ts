/**
 * Verificação de citações jurídicas geradas por IA — sem nenhuma chamada de
 * modelo adicional. Compara cada citação do texto gerado contra o contexto
 * realmente injetado no prompt (base + juris do caso + lei municipal).
 */

export type TipoCitacao = "lei" | "jurisprudencia";

const PADROES_CITACAO: { tipo: TipoCitacao; regex: RegExp }[] = [
  {
    tipo: "lei",
    regex: /súmula\s+(?:vinculante\s+)?n?[ºo°.]?\s*\d+(?:\s+d[oa]\s+\w+)?/gi,
  },
  { tipo: "lei", regex: /lei\s+n?[ºo°.]?\s*[\d.]+(?:\/\d{2,4})?/gi },
  {
    tipo: "lei",
    regex: /decreto(?:-lei)?\s+n?[ºo°.]?\s*[\d.]+(?:\/\d{2,4})?/gi,
  },
  {
    tipo: "lei",
    regex:
      /art(?:igo)?\.?\s*\d+[º°]?(?:[,-]?\s*(?:§\s*\d+[º°]?|inciso\s+[ivxlcdm]+|caput))?/gi,
  },
  {
    tipo: "jurisprudencia",
    regex:
      /\b(?:re|resp|agrg|agint|aresp|edcl|hc|adi|adpf|rext)\s*n?[ºo°.]?\s*\d[\d.\/]*/gi,
  },
  {
    tipo: "jurisprudencia",
    regex:
      /(?:apelação|apelacao|agravo de instrumento|agravo interno)\s*n?[ºo°.]?\s*[\d.\-\/]+/gi,
  },
  {
    tipo: "jurisprudencia",
    regex: /processo\s+n?[ºo°.]?\s*[\d.\-\/]+/gi,
  },
  // Número CNJ completo (comum em ementas TJSP)
  {
    tipo: "jurisprudencia",
    regex: /\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/g,
  },
];

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function soDigitos(s: string): string {
  return s.replace(/\D/g, "");
}

const CNJ_RE = /\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/g;
const NUMERO_JULGADO_RE =
  /\b(?:re|resp|agrg|agint|aresp|edcl|hc|adi|adpf|rext|apelação|apelacao|agravo de instrumento|agravo interno|processo)\s*n?[ºo°.]?\s*\d[\d.\/]*/gi;

function extrairNumerosDoContexto(contexto: string): {
  cnjs: Set<string>;
  outros: Set<string>;
} {
  const cnjs = new Set<string>();
  const outros = new Set<string>();
  for (const m of contexto.matchAll(new RegExp(CNJ_RE.source, "g"))) {
    const d = soDigitos(m[0]);
    if (d.length === 20) cnjs.add(d);
  }
  for (const m of contexto.matchAll(new RegExp(NUMERO_JULGADO_RE.source, "gi"))) {
    const d = soDigitos(m[0]);
    if (d.length >= 6 && d.length < 20) outros.add(d);
  }
  return { cnjs, outros };
}

export type CitacaoVerificada = {
  trecho: string;
  tipo: TipoCitacao;
  verificada: boolean;
};

/** Checa lastro no contexto (string normalizada ou número extraído, sem “sopa” de dígitos). */
function temLastro(
  trecho: string,
  contextoNorm: string,
  tipo: TipoCitacao,
  numeros: { cnjs: Set<string>; outros: Set<string> }
): boolean {
  const chave = normalizar(trecho);
  const digitos = soDigitos(trecho);
  const ehCnj =
    digitos.length === 20 ||
    /\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/.test(trecho);

  if (tipo === "jurisprudencia") {
    if (ehCnj) return numeros.cnjs.has(digitos);
    if (digitos.length >= 6) return numeros.outros.has(digitos);
    if (chave && contextoNorm.includes(chave)) return true;
    return false;
  }

  if (chave && contextoNorm.includes(chave)) return true;

  // Súmula: "sumula 37" ≈ "sumula n 37" / "sumula vinculante 37"
  if (tipo === "lei") {
    const m = chave.match(/sumula(?:\s+vinculante)?\s*(?:n[oº°.]?\s*)?(\d+)/);
    if (m?.[1]) {
      const n = m[1];
      if (
        contextoNorm.includes(`sumula ${n}`) ||
        contextoNorm.includes(`sumula n ${n}`) ||
        contextoNorm.includes(`sumula vinculante ${n}`) ||
        contextoNorm.includes(`sumula vinculante n ${n}`)
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Extrai citações e confere lastro no contexto injetado.
 * Jurisprudência sem lastro = alerta real (possível invenção).
 */
export function verificarCitacoes(
  textoGerado: string,
  contextoFornecido: string
): CitacaoVerificada[] {
  const contextoNormalizado = normalizar(contextoFornecido);
  const numeros = extrairNumerosDoContexto(contextoFornecido);
  const encontradas = new Map<string, CitacaoVerificada>();

  for (const { tipo, regex } of PADROES_CITACAO) {
    const matches = textoGerado.matchAll(regex);
    for (const match of matches) {
      const trecho = match[0].trim();
      const chave = normalizar(trecho);
      if (encontradas.has(chave)) continue;

      encontradas.set(chave, {
        trecho,
        tipo,
        verificada: temLastro(trecho, contextoNormalizado, tipo, numeros),
      });
    }
  }

  return Array.from(encontradas.values());
}

export const MARCADOR_NAO_ENCONTRADO = "[NÃO ENCONTRADO NA BASE]";

export function contarMarcadoresNaoEncontrado(texto: string): number {
  return texto.split(MARCADOR_NAO_ENCONTRADO).length - 1;
}

/**
 * Insere o marcador após jurisprudências citadas sem lastro no contexto
 * (não altera leis/códigos — só alertas de acórdão/processo inventável).
 */
export function anotarJurisprudenciasSemLastro(
  texto: string,
  citacoes: CitacaoVerificada[]
): string {
  let out = texto;
  const semLastro = citacoes.filter(
    (c) => c.tipo === "jurisprudencia" && !c.verificada
  );

  for (const c of semLastro) {
    const trecho = c.trecho;
    if (!trecho || out.includes(`${trecho} ${MARCADOR_NAO_ENCONTRADO}`)) {
      continue;
    }
    // Substitui só a primeira ocorrência não marcada
    const idx = out.indexOf(trecho);
    if (idx < 0) continue;
    const depois = out.slice(idx + trecho.length);
    if (depois.trimStart().startsWith(MARCADOR_NAO_ENCONTRADO)) continue;
    out =
      out.slice(0, idx + trecho.length) +
      ` ${MARCADOR_NAO_ENCONTRADO}` +
      out.slice(idx + trecho.length);
  }

  return out;
}
