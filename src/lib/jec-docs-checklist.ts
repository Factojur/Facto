import { ASSISTENTE_FACTO } from "@/lib/assistente-facto";

export type DocChecklistItem = {
  id: string;
  label: string;
  essencial: boolean;
};

/** Documentos sugeridos por tipo de ação (orientação — não bloqueia gerar). */
export function docsSugeridosPorTipo(tipoAcao: string): DocChecklistItem[] {
  const base: DocChecklistItem[] = [
    {
      id: "rg_cpf",
      label: "RG/CPF (ou CNH) da parte autora",
      essencial: true,
    },
    {
      id: "comprovante_residencia",
      label: "Comprovante de residência",
      essencial: true,
    },
  ];

  if (!tipoAcao || tipoAcao === ASSISTENTE_FACTO) {
    return [
      ...base,
      {
        id: "provas_gerais",
        label: "Provas do fato (contratos, prints, notas, fotos)",
        essencial: true,
      },
    ];
  }

  const t = tipoAcao.toLowerCase();
  const extras: DocChecklistItem[] = [];

  if (t.includes("cobrança") || t.includes("cobranca") || t.includes("execução") || t.includes("execucao")) {
    extras.push(
      { id: "titulo", label: "Título / contrato / nota promissória", essencial: true },
      { id: "notificacao", label: "Notificação ou comprovante de cobrança", essencial: false }
    );
  } else if (t.includes("indeniza")) {
    extras.push(
      { id: "comprovantes_dano", label: "Comprovantes do dano (notas, laudos, prints)", essencial: true },
      { id: "relato", label: "Registros da ocorrência (B.O., protocolos)", essencial: false }
    );
  } else if (t.includes("despejo") || t.includes("locação") || t.includes("locacao")) {
    extras.push(
      { id: "contrato_locacao", label: "Contrato de locação", essencial: true },
      { id: "inadimplencia", label: "Extrato de aluguéis / notificação", essencial: true }
    );
  } else if (t.includes("obrigação") || t.includes("obrigacao")) {
    extras.push({
      id: "prova_obrigacao",
      label: "Prova da obrigação (contrato, mensagem, proposta)",
      essencial: true,
    });
  } else {
    extras.push({
      id: "provas_gerais",
      label: "Provas essenciais do pedido",
      essencial: true,
    });
  }

  return [...base, ...extras];
}
