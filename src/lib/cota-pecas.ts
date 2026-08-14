/**
 * Cota mensal de peças e análises FACTO (plano + extras do ciclo).
 */

import {
  PLANO_ANUAL,
  PLANO_JEC,
  PLANO_MENSAL,
  PLANO_PRO,
  PLANO_PRO_ANUAL,
} from "@/lib/planos-facto";

export type PlanoCota =
  | "jec"
  | "mensal"
  | "pro"
  | "anual"
  | "pro_anual"
  | null;

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
  limiteAnalisesPlano: number | null;
  analisesUsadas: number;
  extrasAnalises: number;
  limiteAnalisesTotal: number | null;
  restanteAnalises: number | null;
  esgotadaAnalises: boolean;
  percentualAnalisesUsado: number | null;
  usoLabelAnalises: string;
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
  if (plano === "pro_anual") return PLANO_PRO_ANUAL.pecasPorMes;
  if (plano === "anual") return PLANO_ANUAL.pecasPorMes;
  if (plano === "pro") return PLANO_PRO.pecasPorMes;
  if (plano === "mensal") return PLANO_MENSAL.pecasPorMes;
  if (plano === "jec") return PLANO_JEC.pecasPorMes;
  return null;
}

export function limiteAnalisesDoPlano(plano: PlanoCota): number | null {
  if (plano === "pro_anual") return PLANO_PRO_ANUAL.analisesPorMes;
  if (plano === "anual") return PLANO_ANUAL.analisesPorMes;
  if (plano === "pro") return PLANO_PRO.analisesPorMes;
  if (plano === "mensal") return PLANO_MENSAL.analisesPorMes;
  if (plano === "jec") return PLANO_JEC.analisesPorMes;
  return null;
}

export function montarResumoCota(opcoes: {
  plano: PlanoCota;
  usadas: number;
  extras: number;
  analisesUsadas?: number;
  extrasAnalises?: number;
  ciclo?: string;
  trackingAtivo?: boolean;
}): ResumoCota {
  const ciclo = opcoes.ciclo ?? cicloAtualSaoPaulo();
  const limitePlano = limiteDoPlano(opcoes.plano);
  const limiteAnalisesPlano = limiteAnalisesDoPlano(opcoes.plano);
  const trackingAtivo = opcoes.trackingAtivo ?? limitePlano != null;
  const usadas = Math.max(0, opcoes.usadas);
  const extras = Math.max(0, opcoes.extras);
  const analisesUsadas = Math.max(0, opcoes.analisesUsadas ?? 0);
  const extrasAnalises = Math.max(0, opcoes.extrasAnalises ?? 0);

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
      limiteAnalisesPlano: null,
      analisesUsadas,
      extrasAnalises,
      limiteAnalisesTotal: null,
      restanteAnalises: null,
      esgotadaAnalises: false,
      percentualAnalisesUsado: null,
      usoLabelAnalises: "Análises ilimitadas neste perfil",
    };
  }

  const limiteTotal = limitePlano + extras;
  const restante = Math.max(0, limiteTotal - usadas);
  const percentualUsado =
    limiteTotal > 0 ? Math.min(100, Math.round((usadas / limiteTotal) * 100)) : 0;

  const limiteAnalisesTotal = (limiteAnalisesPlano ?? 0) + extrasAnalises;
  const restanteAnalises = Math.max(0, limiteAnalisesTotal - analisesUsadas);
  const percentualAnalisesUsado =
    limiteAnalisesTotal > 0
      ? Math.min(
          100,
          Math.round((analisesUsadas / limiteAnalisesTotal) * 100)
        )
      : 0;

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
    limiteAnalisesPlano,
    analisesUsadas,
    extrasAnalises,
    limiteAnalisesTotal,
    restanteAnalises,
    esgotadaAnalises: restanteAnalises <= 0,
    percentualAnalisesUsado,
    usoLabelAnalises: `${analisesUsadas} de ${limiteAnalisesTotal} análises neste mês${
      extrasAnalises > 0 ? ` (inclui +${extrasAnalises} extras)` : ""
    }`,
  };
}
