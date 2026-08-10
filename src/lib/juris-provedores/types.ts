/**
 * Candidatos à janela A/B/C… — fontes pluggable (base local, upload, API externa).
 */

export type OrigemJurisCandidato =
  | "upload_usuario"
  | "base_conhecimento"
  | "jurisprudencias_ai"
  | "tribunal_scraper"
  | "sumula";

export type JurisCandidato = {
  id: string;
  /** Letra exibida (A, B, C…). */
  letra: string;
  origem: OrigemJurisCandidato;
  tribunal: string;
  titulo: string;
  /** Ementa / verbete / trecho citável. */
  ementa: string;
  numeroProcesso?: string;
  relator?: string;
  data?: string;
  /** Link oficial para conferência do acórdão. */
  url?: string;
  tipo: "acordao" | "sumula" | "decisao" | "outro";
};

export type RespostaSugestoesJuris = {
  candidatos: JurisCandidato[];
  aviso?: string;
  provedorExternoAtivo: boolean;
  /** Totais por origem (após dedupe) — útil na UI. */
  totais?: {
    julgados: number;
    sumulas: number;
    uploads: number;
  };
  /** Cota diária de buscas externas (Jurisprudências.ai). */
  cota?: {
    usadas: number;
    limite: number;
    restantes: number;
  };
  /** Diagnóstico do provedor secundário TJSP. */
  fonteTjsp?: "cache" | "live" | "worker" | "off" | "erro";
  usandoFallbackLocal?: boolean;
};

/** Normaliza título/ementa para colapsar duplicatas (ex.: Súmula 37 com/sem ATIVA). */
export function chaveDedupJuris(c: {
  titulo: string;
  ementa: string;
  tipo?: string;
  origem?: string;
  numeroProcesso?: string;
}): string {
  if (c.numeroProcesso?.trim()) {
    return `proc:${c.numeroProcesso.replace(/\D/g, "")}`;
  }

  const titulo = c.titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .trim();

  const mSumula = titulo.match(/sumula(?:\s+vinculante)?\s*(\d+)/);
  if (
    mSumula &&
    (c.tipo === "sumula" ||
      c.origem === "sumula" ||
      titulo.includes("sumula"))
  ) {
    const trib = titulo.includes("stj")
      ? "stj"
      : titulo.includes("stf")
        ? "stf"
        : "x";
    const vinc = titulo.includes("vinculante") ? "sv" : "s";
    return `${vinc}:${trib}:${mSumula[1]}`;
  }

  const ementa = c.ementa
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .replace(/\(ativa\)|\(cancelada\)|\(superada\)/g, "")
    .trim()
    .slice(0, 100);

  return `t:${titulo}|e:${ementa}`;
}
