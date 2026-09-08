/**
 * Quais áreas o usuário pode usar conforme o plano.
 *
 * Qualquer plano ativo (Essencial/`jec`, Completo, Pro, trial, escritório)
 * libera todas as áreas `available` do catálogo. Diferenças entre planos =
 * cota de peças, fração Sonnet e export (trial).
 *
 * Sem plano: nenhuma área (pagar ou conta interna com persona).
 */

import type { PlanoId } from "@/lib/planos-facto";
import { getAreaById } from "@/lib/areas-atuacao";

export type TipoUsuario = "advogado" | "leigo" | string | null | undefined;

export function areasPermitidas(opcoes: {
  plano: PlanoId | null;
  tipoUsuario?: TipoUsuario;
  trialAreaId?: string | null;
}): Set<string> | "todas" | "nenhuma" {
  if (!opcoes.plano) return "nenhuma";
  return "todas";
}

export function areaEstaLiberada(
  areaId: string,
  opcoes: {
    plano: PlanoId | null;
    tipoUsuario?: TipoUsuario;
    trialAreaId?: string | null;
  }
): boolean {
  const liberadas = areasPermitidas(opcoes);
  if (liberadas === "todas") return true;
  if (liberadas === "nenhuma") return false;
  return liberadas.has(areaId);
}

/** Catálogo `available` + plano ativo (todas as áreas abertas ao cliente). */
export function areaAbertaParaCliente(
  areaId: string,
  opcoes: {
    plano: PlanoId | null;
    tipoUsuario?: TipoUsuario;
    trialAreaId?: string | null;
  }
): boolean {
  if (!areaEstaLiberada(areaId, opcoes)) return false;
  const area = getAreaById(areaId);
  return Boolean(area?.available && area.href);
}
