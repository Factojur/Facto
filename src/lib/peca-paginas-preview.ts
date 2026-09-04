/**
 * Heurística de paginação A4 para preview folha a folha.
 * Alinhada a FORMATACAO_FORENSE (Times 12, entrelinha 1,5, margens 3/2 cm).
 * Não precisa ser pixel-perfect — conferência visual antes do export PDF.
 */

import {
  FORMATACAO_FORENSE,
  parseMarcadorEspaco,
} from "@/lib/formatacao-forense";
import { classificarPeca } from "@/lib/tipografia-peca";

/** Altura útil da folha (mm) após margens superior/inferior. */
const ALTURA_UTIL_MM =
  297 -
  FORMATACAO_FORENSE.margemSuperiorCm * 10 -
  FORMATACAO_FORENSE.margemInferiorCm * 10;

/** Largura útil (mm) após margens esquerda/direita. */
const LARGURA_UTIL_MM =
  210 -
  FORMATACAO_FORENSE.margemEsquerdaCm * 10 -
  FORMATACAO_FORENSE.margemDireitaCm * 10;

/** mm por linha (pt → mm ≈ /2.834) com entrelinha. */
const MM_POR_LINHA =
  (FORMATACAO_FORENSE.tamanhoPt * FORMATACAO_FORENSE.entrelinhas) / 2.834;

/** Linhas úteis (~36) — deixa respiro para rodapé “Folha X de Y”. */
export const LINHAS_POR_PAGINA = Math.max(
  28,
  Math.floor(ALTURA_UTIL_MM / MM_POR_LINHA) - 2
);

/** Chars por linha no corpo (Times 12 ≈ 2,3–2,5 mm/char em pt-BR). */
const CHARS_POR_LINHA_CORPO = Math.max(
  55,
  Math.floor(LARGURA_UTIL_MM / 2.45)
);

/** Citação 10 pt com recuo 4 cm — linhas um pouco mais curtas. */
const CHARS_POR_LINHA_CITACAO = Math.max(
  40,
  Math.floor(
    (LARGURA_UTIL_MM - FORMATACAO_FORENSE.recuoCitacaoCm * 10) / 2.1
  )
);

/** @deprecated prefer LINHAS_POR_PAGINA; mantido para callers antigos. */
export const CHARS_POR_PAGINA =
  LINHAS_POR_PAGINA * CHARS_POR_LINHA_CORPO;

const RE_SECAO = /^([IVXLCDM]+)\s*[-—–.]\s+\S/i;

function linhasDeTexto(texto: string, charsPorLinha: number): number {
  const t = texto.replace(/\s+/g, " ").trim();
  if (!t) return 0;
  return Math.max(1, Math.ceil(t.length / charsPorLinha));
}

/** Estima linhas tipográficas de um bloco classificado (inclui marcadores de espaço). */
export function estimarLinhasBloco(bloco: string): number {
  const trim = bloco.trim();
  if (!trim) return 0;

  const marcador = parseMarcadorEspaco(trim);
  if (marcador) {
    let n = marcador.linhas;
    if (marcador.epigrafe?.length) n += marcador.epigrafe.length;
    else if (marcador.processo) n += 1;
    return n;
  }

  const tipo = classificarPeca(trim)[0]?.tipo ?? "paragrafo";
  if (tipo === "citacao-juris") {
    return linhasDeTexto(trim, CHARS_POR_LINHA_CITACAO);
  }
  if (
    tipo === "enderecamento" ||
    tipo === "nome-acao" ||
    tipo === "secao-titulo" ||
    tipo === "fechamento"
  ) {
    // Centralizados / títulos: 1–2 linhas tipográficas
    return Math.max(1, linhasDeTexto(trim, CHARS_POR_LINHA_CORPO + 10));
  }
  return linhasDeTexto(trim, CHARS_POR_LINHA_CORPO);
}

function ehTituloSecao(bloco: string): boolean {
  const t = bloco.trim();
  if (parseMarcadorEspaco(t)) return false;
  const tipo = classificarPeca(t)[0]?.tipo;
  return tipo === "secao-titulo" || RE_SECAO.test(t);
}

/**
 * Divide a peça em blocos de parágrafo por página.
 * Evita título de seção órfão no rodapé (leva o próximo bloco junto).
 */
export function dividirPecaEmPaginas(
  peca: string,
  maxLinhas = LINHAS_POR_PAGINA
): string[][] {
  const texto = peca.trim();
  if (!texto) return [];

  const blocos = texto
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  const paginas: string[][] = [];
  let atual: string[] = [];
  let linhas = 0;

  const flush = () => {
    if (atual.length > 0) {
      paginas.push(atual);
      atual = [];
      linhas = 0;
    }
  };

  for (let i = 0; i < blocos.length; i++) {
    const bloco = blocos[i]!;
    let custo = estimarLinhasBloco(bloco);

    // Título de seção: reserva o próximo bloco para não órfão
    let anexos: string[] = [];
    if (ehTituloSecao(bloco) && i + 1 < blocos.length) {
      const prox = blocos[i + 1]!;
      if (!ehTituloSecao(prox)) {
        anexos = [prox];
        custo += estimarLinhasBloco(prox);
      }
    }

    if (linhas + custo > maxLinhas && atual.length > 0) {
      flush();
    }

    atual.push(bloco);
    linhas += estimarLinhasBloco(bloco);
    for (const a of anexos) {
      atual.push(a);
      linhas += estimarLinhasBloco(a);
      i++;
    }
  }

  flush();
  return paginas.length ? paginas : [[texto]];
}
