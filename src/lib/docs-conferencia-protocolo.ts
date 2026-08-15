/**
 * Conferência orientativa para protocolar (todas as áreas).
 * Lista de leitura — não valida protocolo e não entra na redação.
 * Notas de rito (ex.: parte sozinha no JEC) ficam no overlay da área.
 */

export type DocConferenciaItem = {
  id: string;
  label: string;
  nota?: string;
};

export const DOCS_CONFERENCIA_PROTOCOLO_BASE: DocConferenciaItem[] = [
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

export function mesclarNotasConferencia(
  base: DocConferenciaItem[],
  notasPorId: Record<string, string>
): DocConferenciaItem[] {
  return base.map((item) =>
    notasPorId[item.id]
      ? { ...item, nota: notasPorId[item.id] }
      : item
  );
}
