/**
 * Log operacional de uso de IA (tokens) — custo na carteira.
 * Saída em stdout para Vercel Logs / análise posterior.
 * Não persiste PII nem prompts.
 */

export type RegistroCustoIa = {
  provedor: "gemini" | "anthropic";
  modelo: string;
  etapa?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

export function registrarUsoIa(registro: RegistroCustoIa): void {
  const payload = {
    ts: new Date().toISOString(),
    ...registro,
  };
  console.log("[custo-ia]", JSON.stringify(payload));
}
