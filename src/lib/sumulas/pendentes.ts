/**
 * Backlog operacional — o que ainda falta curar/publicar.
 * Não entra no seed da base_conhecimento.
 *
 * Já no código (não listar de novo):
 * - STF Vinculantes 1–29 e 31–64 (ativas); SV 30 só pendente de publicação
 * - STJ 1–676 (646 ativas; canceladas/revogadas nos lotes)
 * - STF não vinculantes 1–736 (727 ativas no RAG; fora: 2–3 superadas; 4, 5, 301, 394, 563, 584, 599 canceladas)
 */

/** Item de backlog (não entra no seed / RAG). */
export type SumulaPendenteItem = {
  numero: string;
  titulo: string;
  enunciado: string;
  tribunal: "STF" | "STJ";
  status: "pendente_publicacao";
  observacao: string;
};

/** Súmula Vinculante 30 — aprovada; aguarda publicação no DJe / site oficial. */
export const SUMULA_SV_30_PENDENTE = {
  numero: 30,
  titulo: "Súmula Vinculante 30",
  enunciado:
    "Aplica-se o art. 8º da Lei Complementar 118/2005 às ações ajuizadas a partir de sua vigência.",
  tribunal: "STF" as const,
  status: "pendente_publicacao" as const,
  observacao:
    "Aprovada em 03/02/2010. Texto conforme anotações oficiais; inserir em stf-vinculante-lote-04 e no seed após publicação no DJe / portal STF.",
};

export const SUMULAS_PENDENTES: SumulaPendenteItem[] = [
  {
    numero: "STF SV 30",
    titulo: "Súmula Vinculante 30 (pendente de publicação)",
    enunciado: SUMULA_SV_30_PENDENTE.enunciado,
    tribunal: "STF",
    status: "pendente_publicacao",
    observacao: SUMULA_SV_30_PENDENTE.observacao,
  },
  {
    numero: "STF SV 65+",
    titulo: "Súmulas Vinculantes 65 em diante",
    enunciado: "Aguardando novas súmulas vinculantes após a SV 64.",
    tribunal: "STF",
    status: "pendente_publicacao",
    observacao:
      "Placeholders em stf-vinculante-lote-08 e 09. Conferir portal STF periodicamente.",
  },
  {
    numero: "STF NV 737+",
    titulo: "Súmulas não vinculantes do STF a partir da 737",
    enunciado: "Aguardando novas súmulas após a STF 736 (snapshot tesesesumulas).",
    tribunal: "STF",
    status: "pendente_publicacao",
    observacao:
      "STF NV 1–736 curadas. Revisar periodicamente cancelamentos/superação no portal oficial.",
  },
  {
    numero: "STJ 677+",
    titulo: "Súmulas do STJ a partir da 677",
    enunciado: "Aguardando novas súmulas após a STJ 676 (última do snapshot VerbetesSTJ).",
    tribunal: "STJ",
    status: "pendente_publicacao",
    observacao:
      "STJ 1–676 já curadas. Conferir VerbetesSTJ / site STJ para novas edições.",
  },
];
