/**
 * Roteador do Redator: Flash (padrão) vs Claude Sonnet (exceção).
 *
 * Tetos mensais (sobre a cota de peças do plano, sem extras):
 * - JEC / trial: 0%
 * - Completo (mensal/anual): 12%
 * - Pro (mensal/anual) + escritórios: 22%
 *
 * Gatilhos (precisa de ≥1 + saldo do teto + ANTHROPIC_API_KEY):
 * - espécie complexa (recurso, agravo, embargos, remédios etc.)
 * - relato longo (≥ 8.000 chars)
 * - tutela de urgência (Pro / escritório)
 */

import type { PlanoCota } from "@/lib/cota-pecas";
import { limiteDoPlano } from "@/lib/cota-pecas";
import { anthropicConfigurado } from "@/lib/ia/anthropic-client";

export const TETO_SONNET_COMPLETO = 0.12;
export const TETO_SONNET_PRO = 0.22;
export const LIMITE_CHARS_RELATO_SONNET = 8_000;

export type MotivoSonnet =
  | "especie_complexa"
  | "relato_longo"
  | "tutela_pro"
  | null;

export type DecisaoRedator = {
  usarSonnet: boolean;
  motivo: MotivoSonnet;
  tetoMes: number;
  sonnetUsadas: number;
  detalhe: string;
};

export function fracaoTetoSonnet(plano: PlanoCota): number {
  if (plano === "mensal" || plano === "anual") return TETO_SONNET_COMPLETO;
  if (
    plano === "pro" ||
    plano === "pro_anual" ||
    plano === "escritorio_s" ||
    plano === "escritorio_m" ||
    plano === "escritorio_s_anual" ||
    plano === "escritorio_m_anual"
  ) {
    return TETO_SONNET_PRO;
  }
  return 0;
}

export function tetoSonnetDoPlano(plano: PlanoCota): number {
  const limite = limiteDoPlano(plano);
  const frac = fracaoTetoSonnet(plano);
  if (limite == null || frac <= 0) return 0;
  return Math.max(0, Math.floor(limite * frac));
}

/** Espécies / ids que justificam Sonnet no Redator. */
export function especieExigeSonnet(especie: string | null | undefined): boolean {
  if (!especie?.trim()) return false;
  const e = especie
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  return (
    /recurso|agravo|apelac|embargo|contrarra|mandado|habeas|revisao|especial|extraordin|reclamacao-constitucional|adpf|adi\b|ms\b|seguranca|remedio|contestacao-especial|embargos-de-divergencia/.test(
      e
    ) ||
    e.includes("instrumento") ||
    e.includes("inominado")
  );
}

export function decidirRedatorSonnet(opcoes: {
  plano: PlanoCota;
  especie?: string | null;
  charsRelato?: number;
  tutelaUrgencia?: boolean;
  sonnetUsadas: number;
}): DecisaoRedator {
  const tetoMes = tetoSonnetDoPlano(opcoes.plano);
  const sonnetUsadas = Math.max(0, opcoes.sonnetUsadas);

  if (!anthropicConfigurado()) {
    return {
      usarSonnet: false,
      motivo: null,
      tetoMes,
      sonnetUsadas,
      detalhe: "Anthropic não configurada — Redator em Flash.",
    };
  }

  if (tetoMes <= 0) {
    return {
      usarSonnet: false,
      motivo: null,
      tetoMes,
      sonnetUsadas,
      detalhe: "Plano sem Sonnet (JEC/trial).",
    };
  }

  if (sonnetUsadas >= tetoMes) {
    return {
      usarSonnet: false,
      motivo: null,
      tetoMes,
      sonnetUsadas,
      detalhe: `Teto Sonnet do mês atingido (${sonnetUsadas}/${tetoMes}).`,
    };
  }

  let motivo: MotivoSonnet = null;
  if (especieExigeSonnet(opcoes.especie)) {
    motivo = "especie_complexa";
  } else if ((opcoes.charsRelato ?? 0) >= LIMITE_CHARS_RELATO_SONNET) {
    motivo = "relato_longo";
  } else if (
    opcoes.tutelaUrgencia &&
    fracaoTetoSonnet(opcoes.plano) >= TETO_SONNET_PRO
  ) {
    motivo = "tutela_pro";
  }

  if (!motivo) {
    return {
      usarSonnet: false,
      motivo: null,
      tetoMes,
      sonnetUsadas,
      detalhe: "Sem gatilho — Redator em Flash.",
    };
  }

  return {
    usarSonnet: true,
    motivo,
    tetoMes,
    sonnetUsadas,
    detalhe: `Sonnet (${motivo}) · ${sonnetUsadas + 1}/${tetoMes} no mês.`,
  };
}
