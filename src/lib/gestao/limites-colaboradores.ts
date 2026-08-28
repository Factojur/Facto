import type { PlanoGestaoId } from "@/lib/gestao/gestao-types";

const LIMITES: Record<PlanoGestaoId, number> = {
  basico: 3,
  intermediario: 10,
  ilimitado: 999,
};

export function limiteColaboradores(plano: PlanoGestaoId): number {
  return LIMITES[plano];
}

export function rotuloPlanoGestao(plano: PlanoGestaoId): string {
  switch (plano) {
    case "basico":
      return "Básico (até 3 colaboradores)";
    case "intermediario":
      return "Intermediário (até 10 colaboradores)";
    case "ilimitado":
      return "Ilimitado";
  }
}
