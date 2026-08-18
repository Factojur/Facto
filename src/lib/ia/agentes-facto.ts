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
      "Monta o plano real: espécie, polo, teses, JG/MLE e último ato — sem LLM.",
    visivel: true,
  },
  {
    id: "analista",
    skin: "Analista Facto",
    titulo: "Análise do caso",
    descricao:
      "Define tipo de ação, cúmulos, tutela, riscos e lacunas (evolução do Assistente Facto).",
    visivel: true,
  },
  {
    id: "pesquisa_sumulas",
    skin: "Pesquisa & súmulas",
    titulo: "Fundamentos encontrados",
    descricao:
      "Busca leis/súmulas curadas e jurisprudência enviada no caso (API externa depois).",
    visivel: true,
  },
  {
    id: "estrategista",
    skin: "Estrategista",
    titulo: "Tese e DO DIREITO",
    descricao: "Monta a estratégia jurídica e pedidos essenciais.",
    visivel: true,
  },
  {
    id: "redator",
    skin: "Redator forense",
    titulo: "Redação da peça",
    descricao: "Escreve a minuta no padrão FACTO.",
    visivel: true,
  },
  {
    id: "auditor",
    skin: "Auditor",
    titulo: "Conferência da minuta",
    descricao: "Confere espécie, endereçamento, epígrafe, lacunas, pedidos e citações.",
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
  id: AgenteFactoId | "pesquisa_sumulas";
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
