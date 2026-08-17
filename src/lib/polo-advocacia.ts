/**
 * Polo em que o advogado (ou a parte em causa própria) atua no processo.
 * Usado para filtrar espécies no JEC e orientar a redação da IA.
 */

import type { MetaEspecieJec } from "@/lib/jec-especie-peca";
import { ESPECIES_PECA_JEC } from "@/lib/jec-especie-peca";

export type PoloAdvocacia = "ativo" | "passivo";

/** Espécies típicas de quem atua pelo polo ativo (autor/exequente/recorrente). */
const ESPECIES_JEC_ATIVO = new Set([
  "peticao-inicial",
  "replica",
  "recurso-inominado",
  "agravo-instrumento",
  "execucao",
]);

/** Espécies típicas de quem atua pelo polo passivo (réu/executado/recorrido). */
const ESPECIES_JEC_PASSIVO = new Set([
  "contestacao",
  "contrarrazoes-inominado",
  "agravo-instrumento",
]);

/** Embargos de declaração / à execução podem ser de ambos os polos. */
const ESPECIES_JEC_AMBOS = new Set(["embargos", "agravo-instrumento"]);

/** Alias legado → espécie canônica. */
export function normalizarEspecieJecCanonica(especie: string): string {
  const id = especie.trim().toLowerCase();
  if (id === "recurso") return "recurso-inominado";
  if (id === "contrarrazoes" || id === "contrarrazões") {
    return "contrarrazoes-inominado";
  }
  return id;
}

export function especieCompativelComPoloJec(
  especie: string,
  polo: PoloAdvocacia
): boolean {
  const id = normalizarEspecieJecCanonica(especie);
  if (ESPECIES_JEC_AMBOS.has(id)) return true;
  if (polo === "ativo") return ESPECIES_JEC_ATIVO.has(id);
  return ESPECIES_JEC_PASSIVO.has(id);
}

export function inferirPoloPorEspecieJec(
  especie: string
): PoloAdvocacia | null {
  const id = normalizarEspecieJecCanonica(especie);
  if (ESPECIES_JEC_AMBOS.has(id)) return null;
  if (ESPECIES_JEC_ATIVO.has(id)) return "ativo";
  if (ESPECIES_JEC_PASSIVO.has(id)) return "passivo";
  return null;
}

export function filtrarEspeciesJecPorPolo(
  especies: readonly MetaEspecieJec[],
  polo: PoloAdvocacia
): MetaEspecieJec[] {
  return especies.filter((e) => especieCompativelComPoloJec(e.id, polo));
}

export function listaEspeciesJecFiltradas(
  polo: PoloAdvocacia
): MetaEspecieJec[] {
  return filtrarEspeciesJecPorPolo(ESPECIES_PECA_JEC, polo);
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
