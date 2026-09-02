/**
 * Calibração área × espécie — todas as áreas do chat FACTO.
 * Garante que remédio/rito correto não fique preso à área inferida inicialmente.
 */

import type { AreaIdMinuta } from "@/lib/minuta-modulo";

/** Espécie → área canônica do dashboard (quando diferente da inferida). */
const AREA_CANONICA_POR_ESPECIE: Partial<Record<string, AreaIdMinuta>> = {
  "mandado-seguranca": "constitucional",
  "habeas-data": "constitucional",
  adi: "constitucional",
  adpf: "constitucional",
  adc: "constitucional",
  ado: "constitucional",
  acp: "constitucional",
  "acao-popular": "constitucional",
  "reclamacao-constitucional": "constitucional",
  "recurso-ordinario-constitucional": "constitucional",
  "habeas-corpus": "criminal",
  "resposta-acusacao": "criminal",
  "revisao-criminal": "criminal",
  "queixa-crime": "jecr",
  "defesa-jecrim": "jecr",
  reclamacao: "trabalhista",
  defesa: "trabalhista",
  "recurso-ordinario": "trabalhista",
  "agravo-peticao": "trabalhista",
  "execucao-titulo": "trabalhista",
  "peticao-inicial-previdenciaria": "previdenciario",
  "recurso-administrativo-previdenciario": "previdenciario",
};

export function areaIdParaEspecieCabivel(
  areaId: string,
  especie: string
): string {
  const e = especie.trim().toLowerCase();
  return AREA_CANONICA_POR_ESPECIE[e] ?? areaId;
}

function norm(t: string): string {
  return t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Detecta espécie explícita no relato (prioridade sobre inferência genérica).
 * Cobre comandos típicos em todas as áreas — não só MS.
 */
export function especieExplicitaNoRelato(
  texto: string,
  areaId?: string
): string | null {
  const t = norm(texto);
  if (!t) return null;

  if (/habeas\s+corpus|\bhc\b/.test(t) && !/contesta.*habeas/.test(t)) {
    return "habeas-corpus";
  }
  if (/habeas\s+data|\bhd\b/.test(t)) return "habeas-data";
  if (/mandado\s+de\s+seguranca|\bms\b(?!\s+office)/.test(t)) {
    return "mandado-seguranca";
  }
  if (/\badi\b|acao direta de inconstitucionalidade/.test(t)) return "adi";
  if (/\badpf\b/.test(t)) return "adpf";
  if (/\badc\b|declaratoria de constitucionalidade/.test(t)) return "adc";
  if (/\bacp\b|acao civil publica/.test(t)) return "acp";

  if (/reclamacao trabalhista|reclamante.*verbas|justica do trabalho/.test(t)) {
    return "reclamacao";
  }
  if (/agravo de peticao/.test(t)) return "agravo-peticao";
  if (/recurso ordinario/.test(t) && areaId === "trabalhista") {
    return "recurso-ordinario";
  }

  if (/resposta a acusacao|defesa preliminar|alegacoes finais.*acusad/.test(t)) {
    return "resposta-acusacao";
  }
  if (/queixa[- ]?crime/.test(t)) return "queixa-crime";

  if (/replica a contestacao|replica.{0,40}contestacao/.test(t)) {
    return "replica";
  }
  if (
    /contestacao/.test(t) &&
    /intimad|prazo|apresentar|opor/.test(t) &&
    !/replica/.test(t)
  ) {
    if (areaId === "trabalhista") return "defesa";
    if (areaId === "jec" || areaId === "jecr") return "contestacao";
    return "contestacao";
  }

  if (/recurso inominado/.test(t)) return "recurso-inominado";
  if (/embargos de declaracao/.test(t) && /opor|cabivel|omissao/.test(t)) {
    if (areaId === "jec" || areaId === "jecr") return "embargos";
    return "embargos-declaracao";
  }
  if (/agravo de instrumento/.test(t) && /interpor|cabivel|recorrer/.test(t)) {
    return "agravo-instrumento";
  }

  if (/beneficio|aposentadoria|bpc|loas|inss/.test(t)) {
    if (/recurso administrativo|crps|indeferimento/.test(t)) {
      return "recurso-administrativo-previdenciario";
    }
    if (/inicial|peticao|ajuizar|propor acao/.test(t)) {
      return "peticao-inicial-previdenciaria";
    }
  }

  if (/cumprimento de sentenca|fase de cumprimento|fase de execucao/.test(t)) {
    if (/alimentos/.test(t)) return "cumprimento-alimentos";
    if (areaId === "trabalhista") return "execucao-titulo";
    if (areaId === "jec" || areaId === "jecr") return "execucao";
    return "cumprimento-sentenca";
  }

  return null;
}
