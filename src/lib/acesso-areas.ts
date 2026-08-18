/**
 * Quais áreas o usuário pode usar, conforme plano + tipo (advogado/leigo).
 *
 * - Qualquer plano ativo (JEC, Completo, Anual): Juizado Especial Cível liberado
 * - Plano JEC: só JEC
 * - Plano Completo (mensal/anual) + advogado (OAB): todas as áreas disponíveis
 * - Plano Completo + leigo (sem OAB): só JEC; demais áreas exigem verificação OAB
 * - Sem plano: nenhuma área (pagar ou conta interna com persona)
 * - Contas internas: `resolverAcessoConta` define plano/tipo (jec@ = só JEC;
 *   admin/assessoria = Completo). Acesso livre ≠ todas as áreas.
 *
 * O teto de 20 SM para leigos no JEC é validado na geração da peça (jec-teto),
 * não neste gate de área.
 */

import type { PlanoId } from "@/lib/planos-facto";
import { getAreaById } from "@/lib/areas-atuacao";

export type TipoUsuario = "advogado" | "leigo" | string | null | undefined;

export function areasPermitidas(opcoes: {
  plano: PlanoId | null;
  tipoUsuario?: TipoUsuario;
}): Set<string> | "todas" | "nenhuma" {
  if (!opcoes.plano) return "nenhuma";

  // Todo plano pago inclui JEC; o plano JEC fica restrito a essa área.
  if (opcoes.plano === "jec") {
    return new Set(["jec"]);
  }

  // mensal / pro / anual / pro_anual — demais áreas exigem OAB
  if (opcoes.tipoUsuario === "leigo") {
    return new Set(["jec"]);
  }

  return "todas";
}

export function areaEstaLiberada(
  areaId: string,
  opcoes: {
    plano: PlanoId | null;
    tipoUsuario?: TipoUsuario;
  }
): boolean {
  const liberadas = areasPermitidas(opcoes);
  if (liberadas === "todas") return true;
  if (liberadas === "nenhuma") return false;
  return liberadas.has(areaId);
}

/** Catálogo `available` + plano (JEC para leigo/plano JEC; demais para Completo+OAB). */
export function areaAbertaParaCliente(
  areaId: string,
  opcoes: {
    plano: PlanoId | null;
    tipoUsuario?: TipoUsuario;
  }
): boolean {
  if (!areaEstaLiberada(areaId, opcoes)) return false;
  if (areaId === "jec") return true;
  const area = getAreaById(areaId);
  return Boolean(area?.available && area.href);
}
