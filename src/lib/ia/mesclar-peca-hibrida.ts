/**
 * Hibridiza peça da IA com fundamentação-reserva quando o DO DIREITO
 * vem genérico: preserva DOS FATOS (e o restante) da IA e injeta
 * II - DO DIREITO do template forense.
 */

import { montarFundamentosDireitoJec } from "@/lib/peca-do-direito-jec";
import { dividirEmParagrafosRetoricos } from "@/lib/peca-paragrafos";

const RE_TITULO_DIREITO =
  /^[IVXLCDM]+\s*[-—–.]\s*(?:DO DIREITO|DO MÉRITO|DAS RAZÕES DE REFORMA|DO REFORÇO DA INICIAL)/i;
const RE_PROXIMO_ROMANO =
  /^[IVXLCDM]+\s*[-—–.]\s*(?:DO VALOR|DA TUTELA|DAS PROVAS|DOS PEDIDOS|DAS MEDIDAS|DO DÉBITO|DA TEMPESTIVIDADE|DO HISTÓRICO|DA IMPUGNAÇÃO|DAS PRELIMINARES|DO TÍTULO)/i;

/** Extrai o corpo de DOS FATOS (sem o título). */
export function extrairCorpoDosFatos(peca: string): string | null {
  const m = peca.match(
    /I\s*[-—–.]\s*DOS FATOS\n+([\s\S]*?)(?=\n+II\s*[-—–.]\s*DO DIREITO)/i
  );
  return m?.[1]?.trim() ? m[1].trim() : null;
}

function indiceLinha(linhas: string[], predicado: (l: string) => boolean): number {
  return linhas.findIndex((l) => predicado(l.trim()));
}

/**
 * Substitui II - DO DIREITO até o próximo tópico romano conhecido.
 */
export function substituirSecaoDoDireito(
  peca: string,
  novoDireito: string
): string {
  const linhas = peca.replace(/\r\n/g, "\n").split("\n");
  const iDir = indiceLinha(linhas, (l) => RE_TITULO_DIREITO.test(l));
  const direito = novoDireito.trim();

  if (iDir < 0) {
    const iAncora = indiceLinha(linhas, (l) => RE_PROXIMO_ROMANO.test(l));
    if (iAncora >= 0) {
      return [...linhas.slice(0, iAncora), direito, ...linhas.slice(iAncora)].join(
        "\n"
      );
    }
    return `${peca.trim()}\n\n${direito}`;
  }

  let iFim = linhas.findIndex(
    (l, idx) => idx > iDir && RE_PROXIMO_ROMANO.test(l.trim())
  );
  if (iFim < 0) {
    iFim = linhas.findIndex(
      (l, idx) =>
        idx > iDir &&
        (/^DOS PEDIDOS\b/i.test(l.trim()) ||
          /^Nestes termos,/i.test(l.trim()) ||
          /^Termos em que,/i.test(l.trim()) ||
          /^[IVXLCDM]+\s*[-—–.]\s*DOS PEDIDOS/i.test(l.trim()))
    );
  }
  if (iFim < 0) iFim = linhas.length;

  return [
    ...linhas.slice(0, iDir),
    direito,
    ...linhas.slice(iFim),
  ].join("\n");
}

import { RE_TITULO_SECAO_VALOR } from "@/lib/secao-valor-peca";
export function garantirSecaoValorCausa(
  peca: string,
  blocoValor: string,
  opcoes?: { tituloSecao?: string; romano?: string }
): string {
  const tituloSecao = (opcoes?.tituloSecao ?? "DO VALOR DA CAUSA").trim();
  const romano = opcoes?.romano ?? "III";
  const tituloRegex = tituloSecao.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  if (new RegExp(tituloRegex, "i").test(peca) || RE_TITULO_SECAO_VALOR.test(peca)) {
    if (
      /R\$\s*\[VALOR DA (?:CAUSA|RECONVENÇÃO|REPARAÇÃO)|\[VALOR DO PEDIDO(?: CONTRAPOSTO)?\]/i.test(
        peca
      ) &&
      blocoValor.trim() &&
      !/\[VALOR DA (?:CAUSA|RECONVENÇÃO|REPARAÇÃO)|\[VALOR DO PEDIDO(?: CONTRAPOSTO)?\]/i.test(
        blocoValor
      )
    ) {
      return peca.replace(
        /Dá-se à (?:causa|reconvenção|pedido contraposto|reparação civil dos danos|pedido) o valor de R\$ \[[^\]]+\][^\n]*/i,
        blocoValor.trim()
      );
    }
    return peca;
  }
  const valor = blocoValor.trim();
  if (!valor) return peca;

  const secao = `${romano} - ${tituloSecao}\n${valor}`;
  const texto = peca.replace(/\r\n/g, "\n");

  // Após DAS PROVAS → antes dos PEDIDOS
  if (/\n[IVXLCDM]+\s*[-—–.]\s*DAS PROVAS/i.test(texto)) {
    return texto.replace(
      /(\n[IVXLCDM]+\s*[-—–.]\s*DAS PROVAS[^\n]*\n[\s\S]*?)(?=\n+[IVXLCDM]+\s*[-—–.]\s*DOS PEDIDOS)/i,
      `$1\n\n${secao}\n`
    );
  }
  if (/\n[IVXLCDM]+\s*[-—–.]\s*DOS PEDIDOS/i.test(texto)) {
    return texto.replace(
      /\n([IVXLCDM]+)\s*[-—–.]\s*DOS PEDIDOS/i,
      `\n${secao}\n\n$1 - DOS PEDIDOS`
    );
  }
  return `${texto.trim()}\n\n${secao}`;
}

/**
 * Divide parágrafos longos do DO DIREITO (mantém títulos a)/b) intactos).
 */
export function normalizarParagrafosDoDireito(peca: string): string {
  const linhas = peca.replace(/\r\n/g, "\n").split("\n");
  const iDir = indiceLinha(linhas, (l) => RE_TITULO_DIREITO.test(l));
  if (iDir < 0) return peca;

  let iFim = linhas.findIndex(
    (l, idx) => idx > iDir && RE_PROXIMO_ROMANO.test(l.trim())
  );
  if (iFim < 0) {
    iFim = linhas.findIndex(
      (l, idx) =>
        idx > iDir &&
        /^(Nestes termos|Termos em que),/i.test(l.trim())
      );
  }
  if (iFim < 0) iFim = linhas.length;

  const out: string[] = [];
  for (let i = iDir; i < iFim; i++) {
    const t = linhas[i]!.trim();
    if (!t) continue;
    if (RE_TITULO_DIREITO.test(t) || /^[a-z]\)\s+/i.test(t)) {
      out.push(t);
      continue;
    }
    out.push(...dividirEmParagrafosRetoricos(t, 900));
  }

  return [
    ...linhas.slice(0, iDir),
    ...out,
    ...linhas.slice(iFim),
  ].join("\n");
}

/**
 * Peça híbrida: fatos (e envelope) da IA + DO DIREITO do template reserva.
 */
export function mesclarFatosIaComDireitoReserva(opcoes: {
  pecaIa: string;
  tipoAcao: string;
  fatos: string;
  tutelaUrgencia: boolean;
  pedirJusticaGratuita?: boolean;
  trechosBase?: { titulo: string; categoria: string; texto: string }[];
  blocoValorCausa?: string;
  tituloSecaoValor?: string;
  romanoSecaoValor?: string;
}): string {
  const direito = montarFundamentosDireitoJec({
    tipoAcao: opcoes.tipoAcao,
    fatos: opcoes.fatos,
    tutelaUrgencia: opcoes.tutelaUrgencia,
    pedirJusticaGratuita: opcoes.pedirJusticaGratuita,
    trechosBase: opcoes.trechosBase,
  }).join("\n");

  let peca = substituirSecaoDoDireito(opcoes.pecaIa, direito);
  if (opcoes.blocoValorCausa?.trim()) {
    peca = garantirSecaoValorCausa(peca, opcoes.blocoValorCausa, {
      tituloSecao: opcoes.tituloSecaoValor,
      romano: opcoes.romanoSecaoValor,
    });
  }
  return normalizarParagrafosDoDireito(peca);
}
