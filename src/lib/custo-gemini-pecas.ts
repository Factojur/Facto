/**
 * Estimativa operacional de custo Gemini por peça FACTO.
 *
 * Workflow agentic (2 chamadas):
 * - Etapa 1 (Flash-Lite): triagem ~2–4k tokens in / ~1–2k out
 * - Etapa 2 (Flash): redação ~8–12k in / ~4–8k out
 *
 * Valores USD por 1M tokens (ordem de grandeza Google AI Studio, 2026).
 * Atualize quando a tabela oficial mudar — não há medição por request ainda.
 */

export const CUSTO_GEMINI_USD_POR_1M = {
  flashLiteInput: 0.1,
  flashLiteOutput: 0.4,
  flashInput: 0.3,
  flashOutput: 2.5,
} as const;

/** Tokens médios assumidos por peça (triagem + redação). */
export const TOKENS_MEDIOS_POR_PECA = {
  triagemIn: 3_000,
  triagemOut: 1_500,
  redacaoIn: 10_000,
  redacaoOut: 6_000,
} as const;

/** Tokens médios por análise de processo (1 chamada Flash estruturada). */
export const TOKENS_MEDIOS_POR_ANALISE = {
  input: 18_000,
  output: 2_500,
} as const;

/** Câmbio aproximado para exibição em BRL (atualize periodicamente). */
export const CAMBIO_USD_BRL_APROX = 5.7;

export function custoEstimadoUsdPorPeca(): number {
  const t = TOKENS_MEDIOS_POR_PECA;
  const p = CUSTO_GEMINI_USD_POR_1M;
  const usd =
    (t.triagemIn / 1_000_000) * p.flashLiteInput +
    (t.triagemOut / 1_000_000) * p.flashLiteOutput +
    (t.redacaoIn / 1_000_000) * p.flashInput +
    (t.redacaoOut / 1_000_000) * p.flashOutput;
  return Math.round(usd * 10_000) / 10_000;
}

export function custoEstimadoUsdPorAnalise(): number {
  const t = TOKENS_MEDIOS_POR_ANALISE;
  const p = CUSTO_GEMINI_USD_POR_1M;
  const usd =
    (t.input / 1_000_000) * p.flashInput +
    (t.output / 1_000_000) * p.flashOutput;
  return Math.round(usd * 10_000) / 10_000;
}

export function estimarCustoGemini(pecas: number): {
  pecas: number;
  usd: number;
  brl: number;
  usdPorPeca: number;
  cambio: number;
} {
  const n = Math.max(0, Math.floor(pecas));
  const usdPorPeca = custoEstimadoUsdPorPeca();
  const usd = Math.round(n * usdPorPeca * 100) / 100;
  const brl = Math.round(usd * CAMBIO_USD_BRL_APROX * 100) / 100;
  return {
    pecas: n,
    usd,
    brl,
    usdPorPeca,
    cambio: CAMBIO_USD_BRL_APROX,
  };
}

export function estimarCustoAnalises(analises: number): {
  analises: number;
  usd: number;
  brl: number;
  usdPorAnalise: number;
  cambio: number;
} {
  const n = Math.max(0, Math.floor(analises));
  const usdPorAnalise = custoEstimadoUsdPorAnalise();
  const usd = Math.round(n * usdPorAnalise * 100) / 100;
  const brl = Math.round(usd * CAMBIO_USD_BRL_APROX * 100) / 100;
  return {
    analises: n,
    usd,
    brl,
    usdPorAnalise,
    cambio: CAMBIO_USD_BRL_APROX,
  };
}

export function formatarUsd(valor: number): string {
  return valor.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatarBrl(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Lista YYYY-MM de fromInclusive até toInclusive (mês atual se omitido). */
export function listarCiclosMensais(
  desdeIso: string | Date,
  ate: Date = new Date()
): string[] {
  const inicio = new Date(desdeIso);
  if (Number.isNaN(inicio.getTime())) return [];

  let y = inicio.getFullYear();
  let m = inicio.getMonth(); // 0-11
  const fimY = ate.getFullYear();
  const fimM = ate.getMonth();

  const out: string[] = [];
  // teto de segurança (~20 anos)
  for (let i = 0; i < 240; i++) {
    out.push(`${y}-${String(m + 1).padStart(2, "0")}`);
    if (y === fimY && m === fimM) break;
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
    if (y > fimY || (y === fimY && m > fimM)) break;
  }
  return out;
}

export function cicloAtualLocal(agora = new Date()): string {
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
}

export function rotuloCiclo(ciclo: string): string {
  const [y, m] = ciclo.split("-");
  if (!y || !m) return ciclo;
  const nomes = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  const mi = Number(m) - 1;
  return `${nomes[mi] ?? m}/${y}`;
}
