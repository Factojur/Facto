/**
 * Mensagens de erro de IA/API para o cliente — sem nomes de provedor/modelo.
 */
export function mensagemErroIaParaCliente(
  bruto: string | null | undefined,
  fallback = "Não foi possível concluir agora. Tente novamente em instantes."
): string {
  const t = String(bruto ?? "").trim();
  if (!t) return fallback;
  const n = t.toLowerCase();

  if (
    n.includes("rate limit") ||
    n.includes("429") ||
    n.includes("cota") ||
    n.includes("quota") ||
    n.includes("too many")
  ) {
    return "Muitas solicitações neste momento. Aguarde um minuto e tente de novo.";
  }
  if (
    n.includes("sobrecarga") ||
    n.includes("high demand") ||
    n.includes("overloaded") ||
    n.includes("temporariamente") ||
    n.includes("todos os modelos")
  ) {
    return "O serviço de redação está temporariamente ocupado. Aguarde cerca de um minuto e tente novamente.";
  }
  if (
    n.includes("api key") ||
    n.includes("anthropic") ||
    n.includes("gemini") ||
    n.includes("claude") ||
    n.includes("não configurada") ||
    n.includes("auth")
  ) {
    return "Serviço de geração indisponível no momento. Tente novamente em breve.";
  }
  if (n.includes("arquivo") && (n.includes("grande") || n.includes("mb"))) {
    return t; // já é copy de produto
  }
  if (n.includes("relato") || n.includes("caracteres") || n.includes("mín")) {
    return t;
  }
  // Evita vazar stack / nomes de modelo
  if (
    /gemini|claude|anthropic|openai|sonnet|flash-lite|sk-ant|AIza/i.test(t) ||
    t.length > 220
  ) {
    return fallback;
  }
  return t;
}
