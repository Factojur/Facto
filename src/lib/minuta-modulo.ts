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
  idsPeticaoInicial: readonly string[];
  copyCabecalho: string;
  fundamentoQualificacao: string;
  rotuloPoloAtivo: string;
  rotuloPoloPassivo: string;
};

export const MODULO_JEC: AreaModuloConfig = {
  id: "jec",
  tituloDashboard: "Geração de Peça — Juizado Especial Cível",
  leiResumo: "Lei nº 9.099/95",
  href: "/dashboard/jec",
  hrefCasos: "/dashboard/jec/casos",
  idsPeticaoInicial: ["peticao-inicial"],
  copyCabecalho:
    "Peças para o Juizado Especial Cível (Lei nº 9.099/95). Três etapas: identificação, fatos e pedidos. Revise sempre antes de protocolar.",
  fundamentoQualificacao: "na Lei nº 9.099/95",
  rotuloPoloAtivo: "autor",
  rotuloPoloPassivo: "réu",
};

export const MODULO_CIVIL: AreaModuloConfig = {
  id: "civil",
  tituloDashboard: "Geração de Peça — Direito Civil (justiça comum)",
  leiResumo: "Código Civil · CPC",
  href: "/dashboard/civil",
  idsPeticaoInicial: ["peticao-inicial", "execucao-titulo"],
  copyCabecalho:
    "Peças cíveis na justiça comum (Código Civil e CPC): cobrança, indenização, obrigações. Não use para Juizado (9.099) nem para relação de consumo (módulo Consumidor). Três etapas: identificação, fatos e pedidos. Revise sempre antes de protocolar.",
  fundamentoQualificacao: "no Código Civil e no CPC",
  rotuloPoloAtivo: "autor",
  rotuloPoloPassivo: "réu",
};

export const MODULO_CONSUMIDOR: AreaModuloConfig = {
  id: "consumidor",
  tituloDashboard: "Geração de Peça — Direito do Consumidor (justiça comum)",
  leiResumo: "CDC · CPC",
  href: "/dashboard/consumidor",
  idsPeticaoInicial: ["peticao-inicial", "execucao-titulo"],
  copyCabecalho:
    "Peças consumeristas na justiça comum (CDC e CPC). Não use este módulo para o Juizado — lá o rito é a Lei 9.099/95. Três etapas: identificação, fatos e pedidos. Revise sempre antes de protocolar.",
  fundamentoQualificacao: "no CDC e no CPC",
  rotuloPoloAtivo: "autor",
  rotuloPoloPassivo: "réu",
};

export const MODULO_TRABALHISTA: AreaModuloConfig = {
  id: "trabalhista",
  tituloDashboard: "Geração de Peça — Justiça do Trabalho",
  leiResumo: "CLT · rito trabalhista",
  href: "/dashboard/trabalhista",
  idsPeticaoInicial: ["reclamacao", "execucao-titulo"],
  copyCabecalho:
    "Peças na Justiça do Trabalho (CLT): reclamação, defesa, recurso ordinário. Não use CPC de justiça comum nem Lei 9.099. Polos: reclamante e reclamado. Três etapas: identificação, fatos e pedidos. Revise sempre antes de protocolar.",
  fundamentoQualificacao: "na CLT e na legislação processual trabalhista",
  rotuloPoloAtivo: "reclamante",
  rotuloPoloPassivo: "reclamado",
};

export type AreaIdMinuta = "jec" | "consumidor" | "civil" | "trabalhista";

export function normalizarAreaIdMinuta(raw?: string | null): AreaIdMinuta {
  if (raw === "consumidor" || raw === "civil" || raw === "trabalhista") {
    return raw;
  }
  return "jec";
}

export function moduloDaArea(areaId: string): AreaModuloConfig {
  switch (areaId) {
    case "consumidor":
      return MODULO_CONSUMIDOR;
    case "civil":
      return MODULO_CIVIL;
    case "trabalhista":
      return MODULO_TRABALHISTA;
    default:
      return MODULO_JEC;
  }
}
