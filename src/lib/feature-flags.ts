/**
 * Flags de produto — ligar/desligar sem apagar código.
 * Escritório: catálogo e schema permanecem; venda/UI desligadas até gateway + seats.
 */
export const ESCRITORIO_VENDA_ATIVA = false;

/**
 * O8 / Fc2 — auto-crítica Flash do DO DIREITO após o Redator.
 * Custo ~R$ 0,01–0,05/peça; fail-open. Ligada em prod com ok Jefferson (09/09).
 */
export const AUTOCRITICA_DIREITO_ATIVA = true;
