/**
 * Temas P0/P1a — abastecimento portal SJUR (TSE + TRE-SP) → base_conhecimento.
 * Ajuste fino com Jefferson; porDia no diário pagina estes arrays.
 */
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

/** Temas P1a TRE-SP (host jurisprudencia.tre-sp.jus.br). */
export const TEMAS_TRE_SP_P1A: TemaPortal[] = [
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
];

/** Quantos temas por noite no diário 02h (referência total). */
export const PORTAL_TEMAS_POR_NOITE = 4;

/** Fatia TSE por noite. */
export const PORTAL_TEMAS_TSE_POR_NOITE = 2;

/** Fatia TRE-SP por noite. */
export const PORTAL_TEMAS_TRE_SP_POR_NOITE = 2;

/** Decisões por tema (após validação). */
export const PORTAL_POR_TEMA = 12;
