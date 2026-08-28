import type { PlanoGestaoId } from "@/lib/gestao/gestao-types";

/** Titular + até 9 convidados (10 pessoas no escritório). */
export const LIMITE_MEMBROS_ESCRITORIO_GRATUITO = 10;

export function limiteColaboradores(_plano?: PlanoGestaoId): number {
  return LIMITE_MEMBROS_ESCRITORIO_GRATUITO;
}

export function rotuloPlanoGestao(_plano?: PlanoGestaoId): string {
  return `Gratuito (até ${LIMITE_MEMBROS_ESCRITORIO_GRATUITO} pessoas)`;
}
