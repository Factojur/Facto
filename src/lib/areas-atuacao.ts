export type AreaAtuacao = {
  id: string;
  title: string;
  description: string;
  law?: string;
  href?: string;
  available: boolean;
  icon: string;
};

export const AREAS_ATUACAO: AreaAtuacao[] = [
  {
    id: "jec",
    title: "Juizado Especial Cível",
    description:
      "Petições iniciais, execuções, embargos e recursos com base na Lei 9.099/95 e jurisprudência dos Juizados.",
    law: "Lei nº 9.099/95",
    href: "/dashboard/jec",
    available: true,
    icon: "⚖️",
  },
  {
    id: "jecr",
    title: "Juizado Especial Criminal",
    description:
      "Queixa-crime, composição civil, transação penal, defesa e recurso inominado no JECRIM (Lei 9.099/95) — distinto do JEC cível e do Penal comum.",
    law: "Lei nº 9.099/95",
    href: "/dashboard/jecr",
    available: false,
    icon: "⚖️",
  },
  {
    id: "trabalhista",
    title: "Direito Trabalhista",
    description:
      "Reclamações, defesa e recurso ordinário na Justiça do Trabalho (CLT) — distinto da justiça comum e do Juizado.",
    law: "CLT",
    href: "/dashboard/trabalhista",
    available: false,
    icon: "👷",
  },
  {
    id: "criminal",
    title: "Direito Penal",
    description:
      "Habeas corpus, resposta à acusação, memoriais e recursos na Justiça Penal comum.",
    law: "CP · CPP",
    available: false,
    icon: "🛡️",
  },
  {
    id: "empresarial",
    title: "Direito Empresarial",
    description:
      "Contratos, notificações extrajudiciais e ações societárias para pessoas jurídicas.",
    available: false,
    icon: "🏢",
  },
  {
    id: "civil",
    title: "Direito Civil",
    description:
      "Cobrança, indenização e obrigações na justiça comum (Código Civil e CPC) — distinto do Juizado e do módulo Consumidor.",
    law: "Código Civil · CPC",
    href: "/dashboard/civil",
    available: false,
    icon: "📜",
  },
  {
    id: "familia",
    title: "Direito de Família e Sucessões",
    description:
      "Divórcio, guarda, alimentos, inventário e partilha na Vara de Família (Código Civil e CPC) — distinto do Civil genérico e do Juizado.",
    law: "Código Civil · CPC",
    href: "/dashboard/familia",
    available: false,
    icon: "👨‍👩‍👧",
  },
  {
    id: "imobiliario",
    title: "Direito Imobiliário",
    description:
      "Despejo (Lei 8.245/91), usucapião, consignação de aluguéis e cotas de condomínio — distinto do Civil genérico e do Juizado.",
    law: "Lei 8.245 · CC",
    href: "/dashboard/imobiliario",
    available: false,
    icon: "🏠",
  },
  {
    id: "contratual",
    title: "Direito Contratual",
    description:
      "Elaboração, revisão e litígios envolvendo contratos civis e empresariais.",
    law: "Código Civil",
    available: false,
    icon: "📝",
  },
  {
    id: "tributario",
    title: "Direito Tributário",
    description:
      "Defesas administrativas e judiciais, execuções fiscais e planejamento tributário.",
    law: "CTN",
    available: false,
    icon: "💰",
  },
  {
    id: "administrativo",
    title: "Direito Administrativo",
    description:
      "Licitações, contratos públicos, mandado de segurança e contencioso administrativo.",
    law: "Lei nº 14.133/21",
    available: false,
    icon: "🏛️",
  },
  {
    id: "previdenciario",
    title: "Direito Previdenciário",
    description:
      "Aposentadorias, benefícios, revisões e contencioso junto ao INSS e Justiça Federal.",
    law: "Lei nº 8.213/91",
    available: false,
    icon: "🧓",
  },
  {
    id: "consumidor",
    title: "Direito do Consumidor",
    description:
      "Ações, defesas e recursos consumeristas na justiça comum (CDC e CPC) — distinto do Juizado Especial Cível.",
    law: "CDC · CPC",
    href: "/dashboard/consumidor",
    available: false,
    icon: "🛒",
  },
  {
    id: "digital",
    title: "Direito Digital e Tecnologia",
    description:
      "LGPD, crimes digitais, contratos de tecnologia e proteção de dados.",
    law: "LGPD",
    available: false,
    icon: "💻",
  },
  {
    id: "ambiental",
    title: "Direito Ambiental",
    description:
      "Licenciamento, infrações ambientais, TAC e ações civis públicas ambientais.",
    law: "Lei nº 6.938/81",
    available: false,
    icon: "🌿",
  },
  {
    id: "propriedade-intelectual",
    title: "Direito da Propriedade Intelectual",
    description:
      "Marcas, patentes, direitos autorais e contratos de licenciamento.",
    law: "LPI · LDA",
    available: false,
    icon: "©️",
  },
  {
    id: "internacional",
    title: "Direito Internacional",
    description:
      "Contratos internacionais, homologação de sentenças e cooperação jurídica.",
    available: false,
    icon: "🌍",
  },
  {
    id: "medico",
    title: "Direito Médico e da Saúde",
    description:
      "Erro médico, planos de saúde, responsabilidade civil e defesas perante conselhos.",
    law: "CDC · Código Civil",
    available: false,
    icon: "🩺",
  },
  {
    id: "agrario",
    title: "Direito do Agronegócio (Agrário)",
    description:
      "Contratos agrários, crédito rural, regularização fundiária e contencioso do agronegócio.",
    law: "Estatuto da Terra",
    available: false,
    icon: "🌾",
  },
  {
    id: "eleitoral",
    title: "Direito Eleitoral",
    description:
      "Registro de candidatura, propaganda, prestações de contas e ações eleitorais.",
    law: "Código Eleitoral",
    available: false,
    icon: "🗳️",
  },
];

export const IDS_AREAS_VALIDAS = new Set(AREAS_ATUACAO.map((a) => a.id));

export function getAreaById(id: string): AreaAtuacao | undefined {
  return AREAS_ATUACAO.find((a) => a.id === id);
}

/** Rota do módulo: catálogo público ou preview interno (admins). */
export function hrefModuloArea(
  area: AreaAtuacao,
  previewInterno: boolean
): string | undefined {
  if (area.available && area.href) return area.href;
  if (previewInterno && area.href) return area.href;
  if (previewInterno) return `/dashboard/preview/${area.id}`;
  return undefined;
}

export function filtrarFavoritosValidos(favoritos: string[] | null | undefined): string[] {
  if (!favoritos?.length) return [];
  return favoritos.filter((id) => IDS_AREAS_VALIDAS.has(id));
}
