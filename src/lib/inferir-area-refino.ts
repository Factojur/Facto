/**
 * Interpretação IA — área + espécie (MinutaIA-style).
 * Heurística local = pista fraca; não substitui interpretação do caso.
 */

import type { AreaIdMinuta } from "@/lib/minuta-modulo";
import { CHAT_MINUTA_AREAS_FASE1, type InferenciaAreaDetalhada } from "@/lib/chat-minuta";

/**
 * Preferir IA na organização do caso (advogado).
 * Só pula se a área foi travada manualmente (tratado no caller).
 */
export function precisaInterpretacaoCasoIa(det: InferenciaAreaDetalhada): boolean {
  // Sempre interpreta: área “alta” por regex ainda pode errar o remédio (ex.: cumprimento × MS).
  return det.inferencia.confianca !== "alta" || det.ordenado.length >= 1;
}

/** @deprecated use precisaInterpretacaoCasoIa */
export function precisaRefinoAreaIa(det: InferenciaAreaDetalhada): boolean {
  return precisaInterpretacaoCasoIa(det);
}

export function candidatasParaRefinoArea(
  det: InferenciaAreaDetalhada,
  max = 8
): AreaIdMinuta[] {
  const ids = det.ordenado.map((o) => o.areaId);
  const alt = det.inferencia.alternativas ?? [];
  return [
    ...new Set([
      ...ids,
      ...alt,
      det.inferencia.areaId,
      ...CHAT_MINUTA_AREAS_FASE1,
    ]),
  ].slice(0, max);
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
