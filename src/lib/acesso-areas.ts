/**
 * Quais áreas o usuário pode usar, conforme plano + tipo (advogado/leigo).
 *
 * - Plano JEC: só Juizado Especial Cível
 * - Plano Completo (mensal/anual):
 *   - advogado: todas as áreas liberadas no produto
 *   - leigo: só JEC (mesmo com cota elevada)
 */

import type { PlanoId } from "@/lib/planos-facto";

export type TipoUsuario = "advogado" | "leigo" | string | null | undefined;

export function areasPermitidas(opcoes: {
  plano: PlanoId | null;
  tipoUsuario?: TipoUsuario;
}): Set<string> | "todas" | "nenhuma" {
  if (!opcoes.plano) return "nenhuma";

  if (opcoes.plano === "jec") {
    return new Set(["jec"]);
  }

  // mensal / anual
  if (opcoes.tipoUsuario === "leigo") {
    return new Set(["jec"]);
  }

  return "todas";
}

export function areaEstaLiberada(
  areaId: string,
  opcoes: { plano: PlanoId | null; tipoUsuario?: TipoUsuario }
): boolean {
  const liberadas = areasPermitidas(opcoes);
  if (liberadas === "todas") return true;
  if (liberadas === "nenhuma") return false;
  return liberadas.has(areaId);
}
