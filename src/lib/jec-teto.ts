/**
 * Teto do Juizado Especial Cível (orientação / bloqueio conforme perfil).
 * Partes sem advogado (leigo): até 20 SM (Lei 9.099/95, art. 9º).
 * Com advogado: até 40 SM.
 * Valores atualizados periodicamente — use SALARIO_MINIMO_BRL_APROX como referência.
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

export function ultrapassaTetoJec(
  totalCentavos: number,
  comAdvogado = true
): boolean {
  return totalCentavos > tetoJecCentavos(comAdvogado);
}

export function mensagemAlertaTetoJec(
  totalCentavos: number,
  comAdvogado = true
): string {
  const total = (totalCentavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const sm = comAdvogado
    ? TETO_JEC_COM_ADVOGADO_SM
    : TETO_JEC_SEM_ADVOGADO_SM;
  const tetoFmt = formatarTetoJec(comAdvogado);

  if (!comAdvogado) {
    return `Atenção: o total (${total}) ultrapassa o teto aproximado do JEC sem advogado (${tetoFmt} ≈ ${sm} salários mínimos nacionais). Sem verificação da OAB, o FACTO só gera peças no Juizado Especial Cível até esse limite (Lei nº 9.099/95). Reduza o valor da causa ou cadastre-se com OAB para causas maiores (até ≈ ${formatarTetoJec(true)} / ${TETO_JEC_COM_ADVOGADO_SM} SM).`;
  }

  return `Atenção: o total (${total}) parece ultrapassar o teto aproximado do JEC com advogado (${tetoFmt} ≈ ${sm} SM). Confira se a competência do Juizado Especial ainda é adequada; valores são orientação, não cálculo oficial.`;
}

/** Mensagem curta para bloquear geração (API / botão). */
export function mensagemBloqueioTetoLeigo(totalCentavos: number): string {
  const total = (totalCentavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  return `Valor da causa (${total}) acima o teto de ${TETO_JEC_SEM_ADVOGADO_SM} salários mínimos (${formatarTetoJec(false)}) para usuários sem OAB no Juizado Especial Cível. Ajuste o valor ou verifique a OAB no cadastro.`;
}
