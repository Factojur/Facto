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
  /** Item do menu lateral (nunca “JEC” fora do Juizado). */
  rotuloNav: string;
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
  rotuloNav: "Gerar peça JEC",
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
  rotuloNav: "Gerar peça Civil",
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
  rotuloNav: "Gerar peça Consumidor",
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
  rotuloNav: "Gerar peça Trabalhista",
};

export const MODULO_FAMILIA: AreaModuloConfig = {
  id: "familia",
  tituloDashboard: "Geração de Peça — Família e Sucessões",
  leiResumo: "CC · CPC · rito de família",
  href: "/dashboard/familia",
  idsPeticaoInicial: ["peticao-inicial", "inventario"],
  copyCabecalho:
    "Peças de família e sucessões (Código Civil e CPC): divórcio, guarda, alimentos, inventário. Tramitação em segredo de justiça (art. 189 do CPC) quando couber. Não use Juizado nem CLT. Três etapas: identificação, fatos e pedidos. Revise sempre antes de protocolar.",
  fundamentoQualificacao: "no Código Civil, no CPC e na legislação de família",
  rotuloPoloAtivo: "autor",
  rotuloPoloPassivo: "réu",
  rotuloNav: "Gerar peça Família",
};

export type AreaIdMinuta =
  | "jec"
  | "consumidor"
  | "civil"
  | "trabalhista"
  | "familia";

const IDS_MINUTA = new Set<string>([
  "jec",
  "consumidor",
  "civil",
  "trabalhista",
  "familia",
]);

export function normalizarAreaIdMinuta(raw?: string | null): AreaIdMinuta {
  const id = String(raw ?? "").trim();
  if (IDS_MINUTA.has(id) && id !== "jec") return id as AreaIdMinuta;
  return "jec";
}

export function areaIdFromPathname(pathname: string): AreaIdMinuta {
  const partes = pathname.split("/").filter(Boolean);
  const i = partes.indexOf("dashboard");
  if (i < 0) return "jec";
  const prox = partes[i + 1];
  if (prox === "preview") return normalizarAreaIdMinuta(partes[i + 2]);
  return normalizarAreaIdMinuta(prox);
}

export function moduloDaArea(areaId: string): AreaModuloConfig {
  switch (areaId) {
    case "consumidor":
      return MODULO_CONSUMIDOR;
    case "civil":
      return MODULO_CIVIL;
    case "trabalhista":
      return MODULO_TRABALHISTA;
    case "familia":
      return MODULO_FAMILIA;
    default:
      return MODULO_JEC;
  }
}
