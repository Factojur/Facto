/**
 * Temas e fila P2b — TJs fora da Juris.ai (e-SAJ).
 * Cadência: a cada 3 h · 1 TJ · 2 temas · janela 3 anos (fase inflar).
 */
import type { UfTjEsaj } from "../src/lib/scrapers/esaj-tj";
import type { TemaPortal } from "./seed-juris-portal-temas";

/**
 * Ordem: e-SAJ que responde (MS/AC) + portais próprios (BA/RN/PE/ES).
 * Host override: AM → consultasaj.tjam.jus.br.
 * BA/RN/PE/ES: scrapers dedicados (não usar esaj.tjXX quando DNS/portal distinto).
 */
export const FILA_TJ_P2B_ESAJ: UfTjEsaj[] = [
  "ms",
  "ac",
  "ba",
  "rn",
  "am",
  "pe",
  "es",
  "pa",
  "pb",
  "al",
  "se",
  "pi",
  "to",
  "ro",
  "ap",
  "rr",
];

/** Se o TJ da vez falhar, tenta os próximos na mesma invocação (não atrasar o dia). */
export const TJ_PORTAL_MAX_UF_POR_RODADA = 4;

export const TJ_PORTAL_TEMAS_POR_RODADA = 2;
export const TJ_PORTAL_POR_TEMA = 12;
/** Fase inflar: últimos N anos de julgamento. */
export const TJ_PORTAL_ANOS = 3;

/** Temas transversais — e-SAJ: evitar aspas rígidas (zeram hit em vários TJs). */
export const TEMAS_TJ_P2B: TemaPortal[] = [
  { q: "dano moral consumidor", area_tags: ["civel", "consumidor"] },
  { q: "negativacao indevida", area_tags: ["civel", "consumidor"] },
  { q: "Codigo de Defesa do Consumidor", area_tags: ["consumidor"] },
  { q: "falha na prestacao de servico", area_tags: ["consumidor"] },
  { q: "atraso de voo", area_tags: ["consumidor"] },
  { q: "cancelamento de voo", area_tags: ["consumidor"] },
  { q: "plano de saude negativa", area_tags: ["consumidor", "saude"] },
  { q: "juros abusivos", area_tags: ["civel", "consumidor"] },
  { q: "revisao de contrato bancario", area_tags: ["civel"] },
  { q: "responsabilidade civil", area_tags: ["civel"] },
  { q: "obrigacao de fazer", area_tags: ["civel"] },
  { q: "tutela de urgencia", area_tags: ["civel"] },
  { q: "dano material", area_tags: ["civel"] },
  { q: "lucros cessantes", area_tags: ["civel"] },
  { q: "despesas condominiais", area_tags: ["civel"] },
  { q: "locacao despejo", area_tags: ["civel"] },
  { q: "relacao de consumo", area_tags: ["consumidor"] },
  { q: "vicio do produto", area_tags: ["consumidor"] },
  { q: "vicio do servico", area_tags: ["consumidor"] },
  { q: "cobranca indevida telefone", area_tags: ["consumidor"] },
  { q: "energia eletrica corte indevido", area_tags: ["consumidor"] },
  { q: "SPC Serasa banco de dados", area_tags: ["consumidor"] },
  { q: "acao de cobranca", area_tags: ["civel"] },
  { q: "execucao de titulo", area_tags: ["civel"] },
  { q: "embargos a execucao", area_tags: ["civel"] },
  { q: "honorarios advocaticios", area_tags: ["civel"] },
  { q: "justica gratuita", area_tags: ["civel"] },
  { q: "litigancia de ma-fe", area_tags: ["civel"] },
  { q: "prescricao consumo", area_tags: ["consumidor"] },
  { q: "decadencia CDC", area_tags: ["consumidor"] },
  { q: "inversao do onus da prova", area_tags: ["consumidor"] },
  { q: "pratica abusiva", area_tags: ["consumidor"] },
  { q: "publicidade enganosa", area_tags: ["consumidor"] },
  { q: "seguro indenizacao", area_tags: ["civel"] },
  { q: "acidente de transito", area_tags: ["civel"] },
  { q: "erro medico", area_tags: ["saude", "civel"] },
  { q: "direito a saude medicamento", area_tags: ["saude"] },
  { q: "Juizado Especial competencia", area_tags: ["civel"] },
  { q: "recurso inominado", area_tags: ["civel"] },
  { q: "agravo de instrumento", area_tags: ["civel"] },
];
