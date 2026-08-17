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

export function docsConferenciaDaArea(areaId: string): DocConferenciaItem[] {
  const semMle =
    areaId === "criminal" ||
    areaId === "jecr" ||
    areaId === "eleitoral" ||
    areaId === "constitucional";
  let itens = DOCS_CONFERENCIA_PROTOCOLO_BASE.filter(
    (d) => !(semMle && d.id === "mle")
  );
  if (areaId === "jec") {
    itens = mesclarNotasConferencia(itens, {
      procuracao:
        "No JEC, a parte pode atuar sozinha em hipóteses da Lei 9.099/95.",
    });
  }
  if (areaId === "trabalhista") {
    itens = mesclarNotasConferencia(itens, {
      procuracao: "Na JT o advogado atua com procuração; jus postulandi tem hipóteses próprias.",
      titulo_calculo: "Planilha de liquidação / sentença, quando a espécie exigir.",
    });
  }
  if (areaId === "familia") {
    itens = mesclarNotasConferencia(itens, {
      identidade: "Documentos das partes e, se houver, das crianças/adolescentes.",
      provas: "Certidões, comprovantes de renda, laudos — o que a peça alega.",
    });
  }
  if (areaId === "previdenciario") {
    itens = mesclarNotasConferencia(itens, {
      provas: "CNIS, cartas INSS, laudos e comprovante do pedido administrativo, se houver.",
    });
  }
  if (areaId === "criminal" || areaId === "jecr") {
    itens = mesclarNotasConferencia(itens, {
      provas: "Peças do inquérito/processo, certidões e o que a defesa ou a queixa alega.",
      titulo_calculo: "Não se aplica a levantamento cível — ignore se a peça for penal.",
    });
  }
  if (areaId === "constitucional") {
    itens = mesclarNotasConferencia(itens, {
      provas:
        "Prova pré-constituída (MS), decisão paradigma (reclamação/RE), lei impugnada (ADI/ADPF) — o que a peça alega.",
      titulo_calculo: "Em regra não há levantamento cível — ignore se inaplicável.",
    });
  }
  return itens;
}
