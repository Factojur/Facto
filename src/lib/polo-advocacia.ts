/**
 * Polo em que o advogado (ou a parte em causa própria) atua no processo.
 * Matriz espécie × polo: `polo-especies-por-area.ts`.
 */

import type { MetaEspecieJec } from "@/lib/jec-especie-peca";
import { ESPECIES_PECA_JEC } from "@/lib/jec-especie-peca";
import {
  areaUsaPoloAdvocacia,
  especieCompativelComPolo,
  filtrarEspeciesPorPolo,
  inferirPoloPorEspecie,
  ladoPoloDaEspecie,
  normalizarEspeciePoloArea,
  type PoloAdvocacia,
} from "@/lib/polo-especies-por-area";

export type { PoloAdvocacia } from "@/lib/polo-especies-por-area";

export {
  areaUsaPoloAdvocacia,
  AREAS_COM_POLO_ADVOCACIA,
  MATRIZ_POLO_POR_AREA,
  especieCompativelComPolo,
  filtrarEspeciesPorPolo,
  inferirPoloPorEspecie,
  normalizarEspeciePoloArea,
  ladoPoloDaEspecie,
  agruparEspeciesPorPolo,
  type AreaComPoloAdvocacia,
  type MatrizPoloArea,
  type LadoPoloEspecie,
} from "@/lib/polo-especies-por-area";

/** @deprecated use normalizarEspeciePoloArea("jec", especie) */
export function normalizarEspecieJecCanonica(especie: string): string {
  return normalizarEspeciePoloArea("jec", especie);
}

/** @deprecated use especieCompativelComPolo("jec", …) */
export function especieCompativelComPoloJec(
  especie: string,
  polo: PoloAdvocacia
): boolean {
  return especieCompativelComPolo("jec", especie, polo);
}

/** @deprecated use inferirPoloPorEspecie("jec", …) */
export function inferirPoloPorEspecieJec(
  especie: string
): PoloAdvocacia | null {
  return inferirPoloPorEspecie("jec", especie);
}

/** @deprecated use filtrarEspeciesPorPolo("jec", …) */
export function filtrarEspeciesJecPorPolo(
  especies: readonly MetaEspecieJec[],
  polo: PoloAdvocacia
): MetaEspecieJec[] {
  return filtrarEspeciesPorPolo("jec", especies, polo);
}

export function listaEspeciesJecFiltradas(
  polo: PoloAdvocacia
): MetaEspecieJec[] {
  return filtrarEspeciesPorPolo("jec", ESPECIES_PECA_JEC, polo);
}

export function normalizarPoloAdvocacia(
  raw: string | null | undefined
): PoloAdvocacia {
  const v = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (v === "passivo" || v === "reu" || v === "réu") return "passivo";
  return "ativo";
}

export function rotuloPoloAdvocacia(
  polo: PoloAdvocacia,
  rotuloAtivo: string,
  rotuloPassivo: string
): string {
  return polo === "ativo" ? rotuloAtivo : rotuloPassivo;
}

/** Bloco para system prompt — orienta a IA a favorecer o polo escolhido. */
export function blocoPromptPoloAdvocacia(opcoes: {
  polo: PoloAdvocacia;
  rotuloAtivo: string;
  rotuloPassivo: string;
  /** JEC leigo: causa própria — sem mandato/procuração partidária de advogado. */
  atuarLeigo?: boolean;
  areaId?: string;
}): string {
  const lado = rotuloPoloAdvocacia(
    opcoes.polo,
    opcoes.rotuloAtivo,
    opcoes.rotuloPassivo
  );
  const linhas = [
    "================================================================================",
    "POLO PROCESSUAL (OBRIGATÓRIO)",
    "================================================================================",
  ];

  if (opcoes.atuarLeigo && opcoes.areaId === "jec") {
    linhas.push(
      `A parte atua em CAUSA PRÓPRIA pelo polo ${opcoes.polo === "ativo" ? "ATIVO" : "PASSIVO"} (${lado}).`,
      "Redija em favor desta parte. Não use linguagem de mandato, procuração ou \"cliente do advogado\".",
      "A argumentação deve beneficiar o polo escolhido e rebater a tese adversária quando cabível.",
      "Não invente fatos favoráveis ao polo contrário."
    );
  } else {
    linhas.push(
      `Estou atuando pelo polo ${opcoes.polo === "ativo" ? "ATIVO" : "PASSIVO"} (${lado}).`,
      "Toda a peça deve ser redigida em favor deste polo: teses, pedidos e subsunção devem beneficiar quem você representa.",
      "Rebata implicitamente ou explicitamente a posição adversária quando os fatos permitirem.",
      "Não apresente argumentos que favoreçam o polo contrário nem neutralize a tese do cliente."
    );
  }

  return linhas.join("\n");
}

/** Indica se o polo ativo/passivo foi informado quando a espécie exige escolha. */
export function mensagemPoloObrigatorioGeracao(
  areaId: string,
  especie: string,
  polo: PoloAdvocacia | null | undefined
): string | null {
  if (!areaUsaPoloAdvocacia(areaId)) return null;
  if (ladoPoloDaEspecie(areaId, especie) !== "ambos") return null;
  if (polo === "ativo" || polo === "passivo") return null;
  return "Esta peça cabe nos dois polos — confirme se você representa o polo ativo ou passivo antes de gerar.";
}

/** Resolve polo para geração: inferido pela espécie ou explícito quando ambíguo. */
export function resolverPoloGeracao(
  areaId: string,
  especie: string,
  polo: PoloAdvocacia | null | undefined
): PoloAdvocacia | null {
  if (!areaUsaPoloAdvocacia(areaId)) {
    return polo === "ativo" || polo === "passivo" ? polo : null;
  }
  const inferido = inferirPoloPorEspecie(areaId, especie);
  if (inferido) return inferido;
  return polo === "ativo" || polo === "passivo" ? polo : null;
}

/** Sugere polo a partir do relato (Entrada do caso) — só quando ambíguo. */
export function inferirPoloDoRelato(texto: string): PoloAdvocacia | null {
  const t = texto.toLowerCase();
  if (
    /\b(sou o r[eé]u|represento o r[eé]u|polo passivo|intimad[oa] para contestar|contesta[cç][aã]o|contrarraz|embargos de devedor|acusad[oa])\b/i.test(
      t
    ) ||
    /\b(executad[oa]s?|parte executada|advogad[oa]\s+(da|do)\s+executad[oa]|represento\s+(a|o)\s+executad[oa]|sou\s+advogad[oa]\s+(da|do)\s+executad[oa])\b/i.test(
      t
    )
  ) {
    return "passivo";
  }
  if (
    /\b(sou o autor|represento o autor|polo ativo|autor da a[cç][aã]o|reclamante|impetrante|querelante|vitima|v[ií]tima)\b/i.test(
      t
    ) ||
    /\b(exequente?s?|parte exequente|credor da execu[cç][aã]o|advogad[oa]\s+(da|do)\s+exequente|represento\s+(a|o)\s+exequente|sou\s+advogad[oa]\s+(da|do)\s+exequente)\b/i.test(
      t
    ) ||
    /\b(meu cliente|constitu[íi]|represento)\s+(é\s+)?(o|a)\s+exequente\b/i.test(
      t
    ) ||
    /\badvogad[oa]\s+da\s+parte\s+exequente\b/i.test(t)
  ) {
    return "ativo";
  }
  return null;
}
