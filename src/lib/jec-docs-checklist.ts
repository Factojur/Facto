/**
 * Conferência de protocolo no JEC — base compartilhada + notas da 9.099.
 */

import {
  DOCS_CONFERENCIA_PROTOCOLO_BASE,
  mesclarNotasConferencia,
  type DocConferenciaItem,
} from "@/lib/docs-conferencia-protocolo";

export type { DocConferenciaItem };

export const DOCS_CONFERENCIA_PROTOCOLO: DocConferenciaItem[] =
  mesclarNotasConferencia(DOCS_CONFERENCIA_PROTOCOLO_BASE, {
    procuracao:
      "No JEC, a parte pode atuar sozinha em hipóteses da Lei 9.099/95.",
  });

/** @deprecated — use DOCS_CONFERENCIA_PROTOCOLO */
export function docsProtocoloPorEspecie() {
  return DOCS_CONFERENCIA_PROTOCOLO.map((d) => ({
    id: d.id,
    label: d.label,
    essencial: true,
    canais: ["todos"] as const,
    nota: d.nota,
  }));
}

/** @deprecated */
export function docsSugeridosPorTipo(_tipoAcao: string) {
  return DOCS_CONFERENCIA_PROTOCOLO.map((d) => ({
    id: d.id,
    label: d.label,
    essencial: true,
  }));
}

export type DocChecklistItem = {
  id: string;
  label: string;
  essencial: boolean;
};
