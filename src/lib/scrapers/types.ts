/** Tipos compartilhados dos scrapers de tribunais. */

export type JulgadoScrape = {
  titulo: string;
  ementa: string;
  tribunal: string;
  data?: string;
  url?: string;
  numeroProcesso?: string;
  relator?: string;
  /** Score de afinidade com o caso (preenchido após o ranking). */
  scoreAfinidade?: number;
};

export type ResultadoScrape = {
  julgados: JulgadoScrape[];
  /** true se veio do cache (não abriu o navegador). */
  doCache: boolean;
  aviso?: string;
  erro?: string;
  /** ms gastos no scrape (0 se cache). */
  duracaoMs: number;
  /** Tamanho do pool antes do ranking por afinidade. */
  poolSize?: number;
  /** Origem do pool (quando não vazio / diagnóstico). */
  fonte?: "cache" | "live" | "worker" | "off" | "erro";
};

/** Janela temporal máxima dos julgados. */
export const ANOS_MAX_JULGADO = 4;

/** Quantos entram na peça / picker (os melhores do pool). */
export const MAX_RESULTADOS_SCRAPE = 5;

/** Pool bruto coletado no tribunal antes do ranking. */
export const POOL_SCRAPE_MAX = 40;
