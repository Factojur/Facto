/**
 * Skins da equipe FACTO (Pacote A).
 * Na prática: 6 papéis visíveis; chamadas LLM enxutas (Analista+Estrategista juntos;
 * Pesquisa+Súmulas = recuperação; Maestro/Auditor = regras). Plano real: `skins-facto.ts`.
 */

export const AGENTES_FACTO = [
  {
    id: "maestro",
    skin: "Maestro",
    titulo: "Orquestração",
    descricao:
      "Fixa o plano operacional: peça confirmada, polo, teses, JG/MLE e último ato — sem LLM.",
    visivel: true,
  },
  {
    id: "analista",
    skin: "Analista Facto",
    titulo: "Análise do caso",
    descricao:
      "Lê o dossiê: ação, cúmulos, tutela, riscos/lacunas e plano de tópicos (triagem).",
    visivel: true,
  },
  {
    id: "pesquisa_sumulas",
    skin: "Pesquisa & súmulas",
    titulo: "Fundamentos encontrados",
    descricao:
      "RAG na base FACTO + súmulas + juris do caso; só favoráveis ao polo da peça.",
    visivel: true,
  },
  {
    id: "estrategista",
    skin: "Estrategista",
    titulo: "Tese e DO DIREITO",
    descricao:
      "Injeta vínculos (fato→tese→pedido, JG/MLE, pedidos) na estratégia do Redator.",
    visivel: true,
  },
  {
    id: "redator",
    skin: "Redator forense",
    titulo: "Redação da peça",
    descricao:
      "Redige a minuta completa com persuasão forense e higiene leve pós-texto.",
    visivel: true,
  },
  {
    id: "auditor",
    skin: "Auditor",
    titulo: "Conferência da minuta",
    descricao:
      "Confere espécie×autos, endereçamento, epígrafe, lacunas, pedidos e citações (0 tokens).",
    visivel: true,
  },
  {
    id: "pesquisador",
    skin: "Pesquisador",
    titulo: "Jurisprudência",
    descricao: "Papel interno (junto com Sumulista na UI).",
    visivel: false,
  },
  {
    id: "sumulista",
    skin: "Sumulista",
    titulo: "Súmulas",
    descricao: "Papel interno (junto com Pesquisador na UI).",
    visivel: false,
  },
] as const;

export type AgenteFactoId = (typeof AGENTES_FACTO)[number]["id"];

export type EtapaEquipeFacto = {
  id: AgenteFactoId | "pesquisa_sumulas" | "formatador";
  skin: string;
  titulo: string;
  status: "ok" | "parcial" | "pulado" | "erro";
  detalhe?: string;
  modelo?: string;
};

/** Plano genérico (antes de haver espécie/teses). Preferir `montarEtapaMaestro`. */
export function planoMaestroEquipe(): EtapaEquipeFacto[] {
  return [
    {
      id: "maestro",
      skin: "Maestro",
      titulo: "Orquestração",
      status: "ok",
      detalhe: "Plano: Analista → Pesquisa & súmulas → Estrategista → Redator → Auditor",
    },
  ];
}
