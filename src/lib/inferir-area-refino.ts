/**
 * Refino de área — quando regex local é ambíguo, IA (Flash-Lite) desempata.
 */

import type { AreaIdMinuta } from "@/lib/minuta-modulo";
import type { InferenciaAreaDetalhada } from "@/lib/chat-minuta";

/** IA só quando confiança baixa ou top-2 empatados (diferença ≤ 1 ponto). */
export function precisaRefinoAreaIa(det: InferenciaAreaDetalhada): boolean {
  const { inferencia, ordenado } = det;
  if (inferencia.confianca === "baixa") return true;
  if (ordenado.length >= 2) {
    const top = ordenado[0]!.score;
    const segundo = ordenado[1]!.score;
    if (top > 0 && top - segundo <= 1) return true;
  }
  return false;
}

export function candidatasParaRefinoArea(
  det: InferenciaAreaDetalhada,
  max = 5
): AreaIdMinuta[] {
  const ids = det.ordenado.map((o) => o.areaId);
  const alt = det.inferencia.alternativas ?? [];
  return [...new Set([...ids, ...alt, det.inferencia.areaId])].slice(0, max);
}

export function motivoAreaAposOrganizacao(params: {
  areaInferida: AreaIdMinuta;
  areaResolvida: AreaIdMinuta;
  especiePeca?: string;
  ultimoAto?: string | null;
}): string | null {
  if (params.areaInferida === params.areaResolvida) return null;
  const esp = params.especiePeca?.replace(/-/g, " ") ?? "peça cabível";
  if (params.ultimoAto?.trim()) {
    return `Área ajustada pelo remédio (${esp}) e pelo último ato processual.`;
  }
  return `Área ajustada pelo remédio cabível (${esp}).`;
}
