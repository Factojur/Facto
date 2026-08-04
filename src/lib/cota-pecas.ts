/**
 * Cota mensal de peças FACTO (plano + extras do ciclo).
 */

import { PLANO_ANUAL, PLANO_MENSAL } from "@/lib/planos-facto";

export type PlanoCota = "mensal" | "anual" | null;

export type ResumoCota = {
  ciclo: string;
  plano: PlanoCota;
  limitePlano: number | null;
  usadas: number;
  extras: number;
  /** limitePlano + extras (null = ilimitado / sem tracking rígido) */
  limiteTotal: number | null;
  restante: number | null;
  esgotada: boolean;
  percentualUsado: number | null;
  trackingAtivo: boolean;
  usoLabel: string;
};

export function cicloAtualSaoPaulo(agora = new Date()): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
  });
  // en-CA → YYYY-MM-DD; pegamos YYYY-MM
  return fmt.format(agora).slice(0, 7);
}

export function limiteDoPlano(plano: PlanoCota): number | null {
  if (plano === "anual") return PLANO_ANUAL.pecasPorMes;
  if (plano === "mensal") return PLANO_MENSAL.pecasPorMes;
  return null;
}

export function montarResumoCota(opcoes: {
  plano: PlanoCota;
  usadas: number;
  extras: number;
  ciclo?: string;
  trackingAtivo?: boolean;
}): ResumoCota {
  const ciclo = opcoes.ciclo ?? cicloAtualSaoPaulo();
  const limitePlano = limiteDoPlano(opcoes.plano);
  const trackingAtivo = opcoes.trackingAtivo ?? limitePlano != null;
  const usadas = Math.max(0, opcoes.usadas);
  const extras = Math.max(0, opcoes.extras);

  if (!trackingAtivo || limitePlano == null) {
    return {
      ciclo,
      plano: opcoes.plano,
      limitePlano: null,
      usadas,
      extras,
      limiteTotal: null,
      restante: null,
      esgotada: false,
      percentualUsado: null,
      trackingAtivo: false,
      usoLabel: "Cota ilimitada neste perfil",
    };
  }

  const limiteTotal = limitePlano + extras;
  const restante = Math.max(0, limiteTotal - usadas);
  const percentualUsado =
    limiteTotal > 0 ? Math.min(100, Math.round((usadas / limiteTotal) * 100)) : 0;

  return {
    ciclo,
    plano: opcoes.plano,
    limitePlano,
    usadas,
    extras,
    limiteTotal,
    restante,
    esgotada: restante <= 0,
    percentualUsado,
    trackingAtivo: true,
    usoLabel: `${usadas} de ${limiteTotal} peças neste mês${
      extras > 0 ? ` (inclui +${extras} extras)` : ""
    }`,
  };
}
