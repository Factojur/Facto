/**
 * Temas e fila portal SJUR (TSE + TREs um-a-um) → base_conhecimento.
 *
 * Modo seguro (Jefferson 10/09): **um TRE por vez** — só avança de UF
 * quando o ciclo de temas da UF atual termina. TSE segue em paralelo (2/noite).
 */
import type { UfTre } from "../src/lib/scrapers/tre";

export type TemaPortal = {
  q: string;
  /** Tags de área na base (opcional). */
  area_tags?: string[];
};

/** Temas eleitorais para lastro TSE. */
export const TEMAS_TSE_P0: TemaPortal[] = [
  { q: "inelegibilidade", area_tags: ["eleitoral"] },
  { q: "\"propaganda eleitoral\" antecipada", area_tags: ["eleitoral"] },
  { q: "AIJE \"abuso de poder\"", area_tags: ["eleitoral"] },
  { q: "representação eleitoral", area_tags: ["eleitoral"] },
  { q: "\"registro de candidatura\"", area_tags: ["eleitoral"] },
  { q: "\"prestação de contas\" partido", area_tags: ["eleitoral"] },
  { q: "\"pesquisa eleitoral\" irregular", area_tags: ["eleitoral"] },
  { q: "cassação diploma", area_tags: ["eleitoral"] },
  { q: "\"abuso de poder político\"", area_tags: ["eleitoral"] },
  { q: "\"abuso de poder econômico\"", area_tags: ["eleitoral"] },
  { q: "\"fake news\" eleitoral", area_tags: ["eleitoral"] },
  { q: "desincompatibilização", area_tags: ["eleitoral"] },
  { q: "doação \"acima do limite\"", area_tags: ["eleitoral"] },
  { q: "\"condutas vedadas\" agente público", area_tags: ["eleitoral"] },
  { q: "\"recurso contra expedição de diploma\"", area_tags: ["eleitoral"] },
  { q: "\"caixa dois\" eleitoral", area_tags: ["eleitoral"] },
  { q: "inelegibilidade \"rejeição de contas\"", area_tags: ["eleitoral"] },
  { q: "\"captação ilícita\" sufrágio", area_tags: ["eleitoral"] },
  { q: "\"direito de resposta\" eleitoral", area_tags: ["eleitoral"] },
  { q: "\"fidelidade partidária\"", area_tags: ["eleitoral"] },
];

/**
 * Temas por TRE (mesmo lote em todas as UFs).
 * Lote denso para inflar lastro — **não** limitado a 12 (piloto inicial).
 * Ritmo seguro: 2/noite → ceil(N/2) noites por UF.
 */
export const TEMAS_TRE_P1A: TemaPortal[] = [
  // — lote piloto (ordem preservada; estado treTemaIndice continua válido) —
  { q: "inelegibilidade", area_tags: ["eleitoral"] },
  { q: "\"registro de candidatura\"", area_tags: ["eleitoral"] },
  { q: "\"propaganda eleitoral\"", area_tags: ["eleitoral"] },
  { q: "AIJE", area_tags: ["eleitoral"] },
  { q: "desincompatibilização", area_tags: ["eleitoral"] },
  { q: "\"prestação de contas\"", area_tags: ["eleitoral"] },
  { q: "\"abuso de poder\"", area_tags: ["eleitoral"] },
  { q: "\"condutas vedadas\"", area_tags: ["eleitoral"] },
  { q: "\"captação ilícita\"", area_tags: ["eleitoral"] },
  { q: "cassação", area_tags: ["eleitoral"] },
  { q: "\"direito de resposta\"", area_tags: ["eleitoral"] },
  { q: "\"pesquisa eleitoral\"", area_tags: ["eleitoral"] },
  // — expansão densificação (10/09) —
  { q: "\"propaganda eleitoral\" antecipada", area_tags: ["eleitoral"] },
  { q: "\"abuso de poder político\"", area_tags: ["eleitoral"] },
  { q: "\"abuso de poder econômico\"", area_tags: ["eleitoral"] },
  { q: "AIJE \"abuso de poder\"", area_tags: ["eleitoral"] },
  { q: "representação eleitoral", area_tags: ["eleitoral"] },
  { q: "\"prestação de contas\" partido", area_tags: ["eleitoral"] },
  { q: "\"prestação de contas\" campanha", area_tags: ["eleitoral"] },
  { q: "\"pesquisa eleitoral\" irregular", area_tags: ["eleitoral"] },
  { q: "cassação diploma", area_tags: ["eleitoral"] },
  { q: "\"fake news\" eleitoral", area_tags: ["eleitoral"] },
  { q: "doação \"acima do limite\"", area_tags: ["eleitoral"] },
  { q: "\"condutas vedadas\" agente público", area_tags: ["eleitoral"] },
  { q: "\"recurso contra expedição de diploma\"", area_tags: ["eleitoral"] },
  { q: "RCED", area_tags: ["eleitoral"] },
  { q: "\"caixa dois\" eleitoral", area_tags: ["eleitoral"] },
  { q: "inelegibilidade \"rejeição de contas\"", area_tags: ["eleitoral"] },
  { q: "inelegibilidade \"condenação criminal\"", area_tags: ["eleitoral"] },
  { q: "\"captação ilícita\" sufrágio", area_tags: ["eleitoral"] },
  { q: "\"direito de resposta\" eleitoral", area_tags: ["eleitoral"] },
  { q: "\"fidelidade partidária\"", area_tags: ["eleitoral"] },
  { q: "\"cota de gênero\"", area_tags: ["eleitoral"] },
  { q: "fraude \"cota de gênero\"", area_tags: ["eleitoral"] },
  { q: "AIME \"impugnação de mandato\"", area_tags: ["eleitoral"] },
  { q: "\"ação de impugnação\" mandato", area_tags: ["eleitoral"] },
  { q: "\"registro de candidatura\" indeferimento", area_tags: ["eleitoral"] },
  { q: "DRAP \"demonstrativo\"", area_tags: ["eleitoral"] },
  { q: "\"propaganda na internet\"", area_tags: ["eleitoral"] },
  { q: "\"impulsionamento\" propaganda", area_tags: ["eleitoral"] },
  { q: "\"uso da máquina\" pública", area_tags: ["eleitoral"] },
  { q: "\"bens públicos\" propaganda", area_tags: ["eleitoral"] },
  { q: "\"horário eleitoral\" gratuito", area_tags: ["eleitoral"] },
  { q: "\"debate eleitoral\"", area_tags: ["eleitoral"] },
  { q: "\"pesquisa eleitoral\" registro", area_tags: ["eleitoral"] },
  { q: "\"multa\" propaganda irregular", area_tags: ["eleitoral"] },
  { q: "\"representação\" art. 96", area_tags: ["eleitoral"] },
  { q: "\"art. 41-A\"", area_tags: ["eleitoral"] },
  { q: "\"art. 30-A\" arrecadação", area_tags: ["eleitoral"] },
  { q: "\"art. 73\" condutas vedadas", area_tags: ["eleitoral"] },
  { q: "\"convenção partidária\"", area_tags: ["eleitoral"] },
  { q: "\"substituição de candidato\"", area_tags: ["eleitoral"] },
  { q: "\"inelegibilidade reflexa\"", area_tags: ["eleitoral"] },
  { q: "\"vida pregressa\"", area_tags: ["eleitoral"] },
  { q: "\"quitação eleitoral\"", area_tags: ["eleitoral"] },
  { q: "\"domicílio eleitoral\"", area_tags: ["eleitoral"] },
  { q: "\"filiação partidária\"", area_tags: ["eleitoral"] },
  { q: "\"perda de cargo\" eletivo", area_tags: ["eleitoral"] },
  { q: "\"diplomação\"", area_tags: ["eleitoral"] },
  { q: "\"recurso eleitoral\"", area_tags: ["eleitoral"] },
  { q: "\"embargos de declaração\" eleitoral", area_tags: ["eleitoral"] },
  { q: "\"agravo regimental\" eleitoral", area_tags: ["eleitoral"] },
  { q: "\"tutela de urgência\" eleitoral", area_tags: ["eleitoral"] },
  { q: "\"liminar\" propaganda", area_tags: ["eleitoral"] },
  { q: "\"partido político\" sanção", area_tags: ["eleitoral"] },
  { q: "\"fundo eleitoral\"", area_tags: ["eleitoral"] },
  { q: "\"fundo partidário\"", area_tags: ["eleitoral"] },
  { q: "\"prestação de contas\" desaprovação", area_tags: ["eleitoral"] },
  { q: "\"doação\" pessoa jurídica", area_tags: ["eleitoral"] },
  { q: "\"caixa 2\"", area_tags: ["eleitoral"] },
  { q: "\"corrupção\" eleitoral", area_tags: ["eleitoral"] },
  { q: "\"abuso de autoridade\" eleitoral", area_tags: ["eleitoral"] },
  { q: "\"servidor público\" campanha", area_tags: ["eleitoral"] },
  { q: "\"prefeito\" reeleição", area_tags: ["eleitoral"] },
  { q: "\"vereador\" cassação", area_tags: ["eleitoral"] },
  { q: "\"deputado estadual\" registro", area_tags: ["eleitoral"] },
  { q: "\"coligação\" partidária", area_tags: ["eleitoral"] },
  { q: "\"federação\" partidária", area_tags: ["eleitoral"] },
];

/** @deprecated use TEMAS_TRE_P1A */
export const TEMAS_TRE_SP_P1A = TEMAS_TRE_P1A;

/**
 * Fila P1a — **um TRE por vez**.
 * Ordem: SP (piloto) → volume/clientes → demais UFs.
 * Não misturar UFs na mesma noite.
 */
export const FILA_TRE_P1A: UfTre[] = [
  "sp",
  "mg",
  "rj",
  "rs",
  "pr",
  "ba",
  "pe",
  "df",
  "ce",
  "go",
  "sc",
  "es",
  "mt",
  "ms",
  "pa",
  "am",
  "ma",
  "pb",
  "rn",
  "al",
  "pi",
  "se",
  "to",
  "ro",
  "ac",
  "ap",
  "rr",
];

/** Quantos temas por noite no diário 02h (referência total). */
export const PORTAL_TEMAS_POR_NOITE = 4;

/** Fatia TSE por noite (paralelo seguro ao TRE atual). */
export const PORTAL_TEMAS_TSE_POR_NOITE = 2;

/** Fatia do TRE **atual** por noite (só uma UF). */
export const PORTAL_TEMAS_TRE_POR_NOITE = 2;

/** @deprecated */
export const PORTAL_TEMAS_TRE_SP_POR_NOITE = PORTAL_TEMAS_TRE_POR_NOITE;

/** Decisões por tema (após validação). */
export const PORTAL_POR_TEMA = 12;

/** Noites estimadas por TRE (temas ÷ 2/noite). */
export const NOITES_POR_TRE = Math.ceil(
  TEMAS_TRE_P1A.length / PORTAL_TEMAS_TRE_POR_NOITE
);
