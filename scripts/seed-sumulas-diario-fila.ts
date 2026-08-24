/**
 * Fila do seed diário de súmulas / OJs / PNs (03h).
 * Ordem: completar TST (OJs/PNs) → refresh TSE → TJs com fonte → reindex final.
 * Cada noite, após upsert, já roda reindex (só sem vetor; fail-open em 429).
 * TRE: sem súmula nacional (lastro = TSE) — unidade informativa, não busca.
 */

export type FaseSumulaId =
  | "upsert_codigo_tst_tse"
  | "tst_oj_sdi1"
  | "tst_oj_sdi1t"
  | "tst_oj_sdi2"
  | "tst_oj_tp"
  | "tst_oj_sdc"
  | "tst_pn"
  | "tse_portal"
  | "tjsp_arquivo"
  | "tre_skip"
  | "reindex_embeddings";

export type FaseSumula = {
  id: FaseSumulaId;
  rotulo: string;
  /** Itens por noite nesta fase (paginação). */
  porDia: number;
};

/** Ordem fixa até zerar a fila. */
export const FILA_SUMULAS_DIARIO: FaseSumula[] = [
  {
    id: "upsert_codigo_tst_tse",
    rotulo: "Upsert súmulas TST/TSE já no código",
    porDia: 200,
  },
  {
    id: "tst_oj_sdi1",
    rotulo: "TST — Orientações Jurisprudenciais SBDI-I",
    porDia: 40,
  },
  {
    id: "tst_oj_sdi1t",
    rotulo: "TST — OJs SBDI-I Transitórias",
    porDia: 40,
  },
  {
    id: "tst_oj_sdi2",
    rotulo: "TST — Orientações Jurisprudenciais SBDI-II",
    porDia: 40,
  },
  {
    id: "tst_oj_tp",
    rotulo: "TST — OJs Tribunal Pleno / Órgão Especial",
    porDia: 40,
  },
  {
    id: "tst_oj_sdc",
    rotulo: "TST — OJs SDC",
    porDia: 40,
  },
  {
    id: "tst_pn",
    rotulo: "TST — Precedentes Normativos",
    porDia: 40,
  },
  {
    id: "tse_portal",
    rotulo: "TSE — refresh portal (novas súmulas)",
    porDia: 100,
  },
  {
    id: "tjsp_arquivo",
    rotulo: "TJSP — súmulas do arquivo oficial",
    porDia: 80,
  },
  {
    id: "tre_skip",
    rotulo: "TRE — sem súmula nacional (usa TSE)",
    porDia: 1,
  },
  {
    id: "reindex_embeddings",
    rotulo: "Reindex embeddings (só sem vetor)",
    porDia: 400,
  },
];

export type EstadoSumulasDiario = {
  faseIndice: number;
  /** Offset dentro da fase atual (paginação). */
  offset: number;
  concluido: boolean;
  ultimaRodada: string | null;
  /** Contagem de inserts/updates da última noite. */
  ultimoResultado?: {
    fase: string;
    ok: number;
    falha: number;
    avanco: number;
  };
};

export const ESTADO_SUMULAS_INICIAL: EstadoSumulasDiario = {
  faseIndice: 0,
  offset: 0,
  concluido: false,
  ultimaRodada: null,
};
