/**
 * Roteador do Redator: Flash (padrão) vs Claude Sonnet (exceção).
 *
 * Tetos mensais (sobre a cota de peças do plano, sem extras):
 * - trial: 0%
 * - Essencial (jec): 10%
 * - Completo (mensal/anual): 20%
 * - Pro (mensal/anual) + escritórios: 26%
 *
 * O5b (09/09): Expressa/Equilíbrio/Detalhada saem do header.
 * - Padrão (padrao/agil) = sempre Flash.
 * - Sonnet só com esforço `fundo` (função detalhada aceita no chat) + teto + API.
 * - Pergunta no chat quando `recomendaFuncaoDetalhada` (gatilhos + teto).
 */

import type { PlanoCota } from "@/lib/cota-pecas";
import { limiteDoPlano } from "@/lib/cota-pecas";
import { anthropicConfigurado } from "@/lib/ia/anthropic-client";

export const TETO_SONNET_ESSENCIAL = 0.1;
export const TETO_SONNET_COMPLETO = 0.2;
export const TETO_SONNET_PRO = 0.26;
export const LIMITE_CHARS_RELATO_SONNET = 5_500;
export const LIMITE_CHARS_RELATO_SONNET_AREA_DENSA = 3_500;

export type MotivoSonnet =
  | "especie_complexa"
  | "relato_longo"
  | "area_densa"
  | "tutela_pro"
  | "esforco_fundo"
  | null;

export type DecisaoRedator = {
  usarSonnet: boolean;
  motivo: MotivoSonnet;
  tetoMes: number;
  sonnetUsadas: number;
  detalhe: string;
};

export function fracaoTetoSonnet(plano: PlanoCota): number {
  if (plano === "jec") return TETO_SONNET_ESSENCIAL;
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

/** Áreas em que peça densa justifica Sonnet com relato médio ou esforço Fundo. */
export function areaDensaSonnet(areaId: string | null | undefined): boolean {
  const a = String(areaId ?? "")
    .toLowerCase()
    .trim();
  return (
    a === "familia" ||
    a === "constitucional" ||
    a === "previdenciario" ||
    a === "criminal" ||
    a === "trabalhista" ||
    a === "tributario"
  );
}

/** Espécies / ids que justificam Sonnet no Redator. */
export function especieExigeSonnet(especie: string | null | undefined): boolean {
  if (!especie?.trim()) return false;
  const e = especie
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  return (
    /recurso|agravo|apelac|embargo|contrarra|mandado|habeas|revisao|especial|extraordin|reclamacao-constitucional|adpf|adi\b|ms\b|seguranca|remedio|contestacao-especial|embargos-de-divergencia|cumprimento-alimentos|inventario|resposta-acusacao|peticao-inicial-previdenciaria|recurso-ordinario|recurso-administrativo/.test(
      e
    ) ||
    e.includes("instrumento") ||
    e.includes("inominado")
  );
}

/** Gatilho de mérito para Sonnet / pergunta detalhada. */
export function motivoGatilhoSonnet(opcoes: {
  especie?: string | null;
  areaId?: string | null;
  charsRelato?: number;
  tutelaUrgencia?: boolean;
  plano?: PlanoCota;
  /** Se true, área densa sozinha conta (uso com esforço fundo). */
  incluirAreaDensa?: boolean;
}): MotivoSonnet {
  const densa = areaDensaSonnet(opcoes.areaId);
  const limRelato = densa
    ? LIMITE_CHARS_RELATO_SONNET_AREA_DENSA
    : LIMITE_CHARS_RELATO_SONNET;

  if (especieExigeSonnet(opcoes.especie)) return "especie_complexa";
  if ((opcoes.charsRelato ?? 0) >= limRelato) return "relato_longo";
  if (
    opcoes.tutelaUrgencia &&
    fracaoTetoSonnet(opcoes.plano ?? null) >= TETO_SONNET_PRO
  ) {
    return "tutela_pro";
  }
  if (opcoes.incluirAreaDensa && densa) return "area_densa";
  return null;
}

/**
 * O5b — vale perguntar “função detalhada?” no chat.
 * Gatilhos = o que antes disparava Sonnet no padrão (espécie/relato/tutela).
 * Sem teto / Anthropic → não pergunta (Flash silencioso).
 */
export function recomendaFuncaoDetalhada(opcoes: {
  plano: PlanoCota;
  especie?: string | null;
  areaId?: string | null;
  charsRelato?: number;
  tutelaUrgencia?: boolean;
  sonnetUsadas: number;
  /** Se omitido, usa anthropicConfigurado() (só no servidor). */
  anthropicOk?: boolean;
}): boolean {
  const anthropicOk = opcoes.anthropicOk ?? anthropicConfigurado();
  if (!anthropicOk) return false;
  const tetoMes = tetoSonnetDoPlano(opcoes.plano);
  if (tetoMes <= 0) return false;
  if (opcoes.sonnetUsadas >= tetoMes) return false;
  return (
    motivoGatilhoSonnet({
      ...opcoes,
      incluirAreaDensa: false,
    }) != null
  );
}

export const COPY_PERGUNTA_FUNCAO_DETALHADA =
  "Para esta peça, é recomendável utilizar a função detalhada.";

export function decidirRedatorSonnet(opcoes: {
  plano: PlanoCota;
  especie?: string | null;
  areaId?: string | null;
  charsRelato?: number;
  tutelaUrgencia?: boolean;
  sonnetUsadas: number;
  /** O5b: só `fundo` (detalhada aceita) usa Sonnet; padrao/agil = Flash. */
  esforco?: "agil" | "padrao" | "fundo";
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

  if (opcoes.esforco !== "fundo") {
    return {
      usarSonnet: false,
      motivo: null,
      tetoMes,
      sonnetUsadas,
      detalhe:
        opcoes.esforco === "agil"
          ? "Esforço Expressa — Redator em Flash."
          : "Padrão (Flash) — Sonnet só com função detalhada aceita.",
    };
  }

  if (tetoMes <= 0) {
    return {
      usarSonnet: false,
      motivo: null,
      tetoMes,
      sonnetUsadas,
      detalhe: "Plano sem Sonnet (trial).",
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

  const motivo =
    motivoGatilhoSonnet({ ...opcoes, incluirAreaDensa: true }) ??
    ("esforco_fundo" as MotivoSonnet);

  return {
    usarSonnet: true,
    motivo,
    tetoMes,
    sonnetUsadas,
    detalhe: `Sonnet (${motivo}) · ${sonnetUsadas + 1}/${tetoMes} no mês.`,
  };
}
