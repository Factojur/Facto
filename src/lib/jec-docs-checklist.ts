/**
 * Conferência orientativa de documentos para protocolar.
 * Lista de leitura — não valida protocolo e não entra na redação da peça.
 */

export type DocConferenciaItem = {
  id: string;
  label: string;
  nota?: string;
};

/** Documentos comumente necessários (guia único, sem canal e-proc/ESAJ). */
export const DOCS_CONFERENCIA_PROTOCOLO: DocConferenciaItem[] = [
  {
    id: "peca",
    label: "Peça / petição em PDF (gerada no FACTO e revisada)",
  },
  {
    id: "identidade",
    label: "Documento de identidade e CPF (ou CNH) da parte",
  },
  {
    id: "residencia",
    label: "Comprovante de residência",
    nota: "Algumas unidades aceitam declaração — confira o juízo.",
  },
  {
    id: "procuracao",
    label: "Procuração ad judicia / substabelecimento (se houver advogado)",
    nota: "No JEC, a parte pode atuar sozinha em hipóteses da Lei 9.099/95.",
  },
  {
    id: "provas",
    label: "Provas do fato (contratos, prints, notas, laudos, fotos, B.O.)",
  },
  {
    id: "docs_citados",
    label: "Documentos citados na peça e que serão juntados",
  },
  {
    id: "hipossuficiencia",
    label: "Declaração de hipossuficiência",
    nota: "Somente se pediu justiça gratuita na peça.",
  },
  {
    id: "mle",
    label: "Documentos do Mandado de Levantamento Eletrônico (MLE)",
    nota: "Somente se houver valores a levantar / pedido de MLE.",
  },
  {
    id: "titulo_calculo",
    label: "Título, sentença, acordo ou planilha de cálculo",
    nota: "Quando a espécie exigir (execução, embargos, cumprimento).",
  },
  {
    id: "decisao_recorrida",
    label: "Cópia da decisão / sentença recorrida",
    nota: "Em recurso, se o sistema digital não trouxer automaticamente.",
  },
];

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
