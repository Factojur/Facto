/**
 * Planos Escritório S/M — assentos (não máquinas), cota em pool, OAB do admin.
 */

import {
  PLANO_ESCRITORIO_M,
  PLANO_ESCRITORIO_S,
  type PlanoId,
} from "@/lib/planos-facto";

export type PlanoEscritorio = "escritorio_s" | "escritorio_m";

export function ehPlanoEscritorio(plano: PlanoId | null | undefined): plano is PlanoEscritorio {
  return plano === "escritorio_s" || plano === "escritorio_m";
}

export function seatsDoPlano(plano: PlanoEscritorio): number {
  return plano === "escritorio_m"
    ? PLANO_ESCRITORIO_M.seats
    : PLANO_ESCRITORIO_S.seats;
}

export function rotuloEscritorio(plano: PlanoEscritorio): string {
  return plano === "escritorio_m"
    ? PLANO_ESCRITORIO_M.rotulo
    : PLANO_ESCRITORIO_S.rotulo;
}

/** Papéis permitidos em `escritorio_membros`. */
export const PAPEIS_ESCRITORIO = ["admin", "advogado", "membro"] as const;
export type PapelEscritorio = (typeof PAPEIS_ESCRITORIO)[number];
