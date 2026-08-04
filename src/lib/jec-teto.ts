/**
 * Teto do Juizado Especial Cível (orientação ao usuário).
 * Advogados: até 40 SM; partes sem advogado: até 20 SM (Lei 9.099/95).
 * Valores atualizados periodicamente — use como aviso, não como cálculo fiscal.
 */

/** Aproximação operacional em BRL (atualize quando o SM mudar). */
export const SALARIO_MINIMO_BRL_APROX = 1518;

export const TETO_JEC_SEM_ADVOGADO_SM = 20;
export const TETO_JEC_COM_ADVOGADO_SM = 40;

export function tetoJecCentavos(comAdvogado: boolean): number {
  const sm = comAdvogado
    ? TETO_JEC_COM_ADVOGADO_SM
    : TETO_JEC_SEM_ADVOGADO_SM;
  return Math.round(SALARIO_MINIMO_BRL_APROX * sm * 100);
}

export function formatarTetoJec(comAdvogado = true): string {
  const centavos = tetoJecCentavos(comAdvogado);
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Assumimos causa com advogado (teto 40 SM) no dashboard FACTO. */
export function ultrapassaTetoJec(totalCentavos: number): boolean {
  return totalCentavos > tetoJecCentavos(true);
}

export function mensagemAlertaTetoJec(totalCentavos: number): string {
  const total = (totalCentavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  return `Atenção: o total (${total}) parece acima o teto aproximado do JEC com advogado (${formatarTetoJec(true)} ≈ ${TETO_JEC_COM_ADVOGADO_SM} SM). Confira se a competência do Juizado Especial ainda é adequada; valores são orientação, não cálculo oficial.`;
}
