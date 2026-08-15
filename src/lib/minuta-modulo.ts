/**
 * Contrato da dashboard de minuta (todas as áreas).
 * O JEC é a base de desenvolvimento: o que for genérico vive aqui;
 * o que for rito/espécie/endereçamento fica no módulo da área (`jec-*`).
 */

export type GuiaMinuta = "identificacao" | "fatos" | "pedidos";

/** Três etapas do formulário — iguais em todas as áreas. */
export const GUIAS_MINUTA: { id: GuiaMinuta; label: string }[] = [
  { id: "identificacao", label: "Identificação" },
  { id: "fatos", label: "Fatos e fundamentos" },
  { id: "pedidos", label: "Pedidos" },
];

/** Timbre e botão Gerar só na última etapa. */
export const GUIA_GERAR_PECA: GuiaMinuta = "pedidos";

export const LOADING_STAGES_GERACAO = [
  "Maestro: montando o plano…",
  "Analista Facto: estudando o caso…",
  "Pesquisa & súmulas: buscando fundamentos…",
  "Estrategista: definindo a tese…",
  "Redator forense: escrevendo a peça…",
  "Auditor: conferindo citações…",
] as const;

/**
 * O que a área deve especializar. Não basta `available` no catálogo.
 */
export type AreaModuloConfig = {
  id: string;
  tituloDashboard: string;
  leiResumo: string;
  href: string;
  hrefCasos?: string;
  /** IDs de espécie que exigem qualificação completa (não “já qualificado”). */
  idsPeticaoInicial: readonly string[];
};

export const MODULO_JEC: AreaModuloConfig = {
  id: "jec",
  tituloDashboard: "Geração de Peça — Juizado Especial Cível",
  leiResumo: "Lei nº 9.099/95",
  href: "/dashboard/jec",
  hrefCasos: "/dashboard/jec/casos",
  idsPeticaoInicial: ["peticao-inicial"],
};

export const MODULO_CIVIL: AreaModuloConfig = {
  id: "civil",
  tituloDashboard: "Geração de Peça — Direito Civil (justiça comum)",
  leiResumo: "Código Civil · CPC",
  href: "/dashboard/civil",
  idsPeticaoInicial: ["peticao-inicial", "execucao-titulo"],
};

export const MODULO_CONSUMIDOR: AreaModuloConfig = {
  id: "consumidor",
  tituloDashboard: "Geração de Peça — Direito do Consumidor (justiça comum)",
  leiResumo: "CDC · CPC",
  href: "/dashboard/consumidor",
  idsPeticaoInicial: ["peticao-inicial", "execucao-titulo"],
};
