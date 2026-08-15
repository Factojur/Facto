/**
 * Ordem de implementação das áreas (além do JEC, já aberto).
 * Preview interno ≠ available no catálogo.
 */

export type ItemAberturaArea = {
  id: string;
  ordem: number;
  titulo: string;
  porQue: string;
  especifico: string[];
};

export const SEQUENCIA_ABERTURA_AREAS: ItemAberturaArea[] = [
  {
    id: "consumidor",
    ordem: 1,
    titulo: "Consumidor (justiça comum)",
    porQue: "Sobreposição com JEC; mesma tese (CDC), rito CPC.",
    especifico: [
      "Rota /dashboard/consumidor e AreaModuloConfig",
      "Espécies CPC: inicial, contestação, réplica, apelação, cumprimento",
      "Endereçamento à justiça comum (não Juizado)",
      "Copy de valor, honorários e recurso — sem teto 20 SM",
      "Distinção no card: quando ir ao JEC vs. comum",
      "Lastro CDC + TJ/STJ; gate Completo/Pro + OAB",
      "Casos-ouro com endereçamento real",
    ],
  },
  {
    id: "civil",
    ordem: 2,
    titulo: "Direito Civil",
    porQue: "Cobrança e indenização na justiça comum.",
    especifico: [
      "Espécies CPC + prazos típicos (aviso: contestação 15d, apelação 15d)",
      "Endereçamento Vara Cível",
      "Copy separando civil × consumidor × JEC",
    ],
  },
  {
    id: "trabalhista",
    ordem: 3,
    titulo: "Direito Trabalhista",
    porQue: "Demanda alta; rito CLT/JT.",
    especifico: [
      "Endereçamento Justiça do Trabalho",
      "Reclamação, defesa, recurso ordinário (8d)",
      "Polos reclamante / reclamado",
      "Lastro CLT; seed TST ajuda, não bloqueia o esqueleto",
    ],
  },
  {
    id: "familia",
    ordem: 4,
    titulo: "Família e sucessões",
    porQue: "Peças e polos distintos.",
    especifico: [
      "Guarda, divórcio, alimentos, inventário",
      "Prazos CPC; atenção a sigilo",
      "Polos do rito (alimentante etc.)",
    ],
  },
  {
    id: "imobiliario",
    ordem: 5,
    titulo: "Imobiliário",
    porQue: "Cruzado com civil — decidir módulo vs. tema.",
    especifico: [
      "Decisão de produto: módulo próprio ou tema em civil",
      "Se módulo: despejo, usucapião, condomínio",
    ],
  },
  {
    id: "contratual",
    ordem: 5,
    titulo: "Contratual",
    porQue: "Cruzado com civil e empresarial.",
    especifico: [
      "Decisão de produto: módulo próprio ou tema em civil",
      "Se módulo: revisão e litígio contratual",
    ],
  },
  {
    id: "jecr",
    ordem: 6,
    titulo: "JECRIM",
    porQue: "Lei 9.099 criminal — não copiar JEC cível.",
    especifico: [
      "TCO, composição civil, transação penal",
      "Endereçamento e polos do JECRIM",
    ],
  },
  {
    id: "criminal",
    ordem: 7,
    titulo: "Penal comum",
    porQue: "Depois do JECRIM.",
    especifico: [
      "Habeas corpus, resposta à acusação, memoriais",
      "Prazos CPP",
    ],
  },
  {
    id: "previdenciario",
    ordem: 8,
    titulo: "Previdenciário",
    porQue: "JEF / INSS.",
    especifico: [
      "Petição inicial previdenciária",
      "Endereçamento JEF; lastro TRF ajuda",
    ],
  },
  {
    id: "tributario",
    ordem: 9,
    titulo: "Tributário",
    porQue: "Execução fiscal e defesa.",
    especifico: ["CARF/TRF", "Execução fiscal; prazos típicos"],
  },
  {
    id: "administrativo",
    ordem: 9,
    titulo: "Administrativo",
    porQue: "MS e contencioso público.",
    especifico: ["Mandado de segurança (120d)", "Licitações / PAD"],
  },
  {
    id: "empresarial",
    ordem: 10,
    titulo: "Empresarial",
    porQue: "Extrajudicial vs. judicial.",
    especifico: [
      "Notificação extrajudicial vs. ação",
      "Polos e endereçamento societário",
    ],
  },
  {
    id: "digital",
    ordem: 11,
    titulo: "Digital e tecnologia",
    porQue: "Depois do núcleo cível.",
    especifico: ["LGPD; contratos de tecnologia"],
  },
  {
    id: "ambiental",
    ordem: 11,
    titulo: "Ambiental",
    porQue: "Depois do núcleo cível.",
    especifico: ["Licenciamento, TAC, ACP ambiental"],
  },
  {
    id: "propriedade-intelectual",
    ordem: 11,
    titulo: "Propriedade intelectual",
    porQue: "Depois do núcleo cível.",
    especifico: ["Marcas, patentes, direitos autorais"],
  },
  {
    id: "internacional",
    ordem: 11,
    titulo: "Internacional",
    porQue: "Depois do núcleo cível.",
    especifico: ["Contratos internacionais; homologação"],
  },
  {
    id: "medico",
    ordem: 11,
    titulo: "Médico e da saúde",
    porQue: "Cruza CDC e civil.",
    especifico: ["Erro médico; planos de saúde; conselhos"],
  },
  {
    id: "agrario",
    ordem: 11,
    titulo: "Agrário",
    porQue: "Depois do núcleo cível.",
    especifico: ["Contratos agrários; crédito rural"],
  },
  {
    id: "eleitoral",
    ordem: 12,
    titulo: "Eleitoral",
    porQue: "Por último: API sem TRE/TSE.",
    especifico: [
      "Não ligar lastro de juris eleitoral na API atual",
      "Registro, propaganda, contas — só com fonte própria",
    ],
  },
];

export function aberturaPorAreaId(id: string): ItemAberturaArea | undefined {
  return SEQUENCIA_ABERTURA_AREAS.find((a) => a.id === id);
}
