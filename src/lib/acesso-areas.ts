/**
 * Quais áreas o usuário pode usar, conforme plano + tipo (advogado/leigo).
 *
 * - Qualquer plano ativo (JEC, Completo, Anual): Juizado Especial Cível liberado
 * - Plano JEC: só JEC
 * - Plano Completo (mensal/anual) + advogado (OAB): todas as áreas disponíveis
 * - Plano Completo + leigo (sem OAB): só JEC; demais áreas exigem verificação OAB
 * - Sem plano: nenhuma área (exceto contas de acesso livre)
 *
 * O teto de 20 SM para leigos no JEC é validado na geração da peça (jec-teto),
 * não neste gate de área.
 */

import type { PlanoId } from "@/lib/planos-facto";

export type TipoUsuario = "advogado" | "leigo" | string | null | undefined;

export function areasPermitidas(opcoes: {
  plano: PlanoId | null;
  tipoUsuario?: TipoUsuario;
  acessoLivre?: boolean;
}): Set<string> | "todas" | "nenhuma" {
  if (opcoes.acessoLivre) return "todas";

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
    acessoLivre?: boolean;
  }
): boolean {
  const liberadas = areasPermitidas(opcoes);
  if (liberadas === "todas") return true;
  if (liberadas === "nenhuma") return false;
  return liberadas.has(areaId);
}
