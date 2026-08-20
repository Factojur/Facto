/**
 * Planos Escritório S/M — assentos (não máquinas), cota em pool, OAB do admin.
 */

import {
  PLANO_ESCRITORIO_M,
  PLANO_ESCRITORIO_M_ANUAL,
  PLANO_ESCRITORIO_S,
  PLANO_ESCRITORIO_S_ANUAL,
  type PlanoId,
} from "@/lib/planos-facto";

export type PlanoEscritorio =
  | "escritorio_s"
  | "escritorio_m"
  | "escritorio_s_anual"
  | "escritorio_m_anual";

export function ehPlanoEscritorio(
  plano: PlanoId | null | undefined
): plano is PlanoEscritorio {
  return (
    plano === "escritorio_s" ||
    plano === "escritorio_m" ||
    plano === "escritorio_s_anual" ||
    plano === "escritorio_m_anual"
  );
}

export function seatsDoPlano(plano: PlanoEscritorio): number {
  if (plano === "escritorio_m" || plano === "escritorio_m_anual") {
    return PLANO_ESCRITORIO_M.seats;
  }
  return PLANO_ESCRITORIO_S.seats;
}

export function rotuloEscritorio(plano: PlanoEscritorio): string {
  if (plano === "escritorio_m_anual") return PLANO_ESCRITORIO_M_ANUAL.rotulo;
  if (plano === "escritorio_s_anual") return PLANO_ESCRITORIO_S_ANUAL.rotulo;
  if (plano === "escritorio_m") return PLANO_ESCRITORIO_M.rotulo;
  return PLANO_ESCRITORIO_S.rotulo;
}

/** Papéis permitidos em `escritorio_membros`. */
export const PAPEIS_ESCRITORIO = ["admin", "advogado", "membro"] as const;
export type PapelEscritorio = (typeof PAPEIS_ESCRITORIO)[number];
