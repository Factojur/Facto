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
      "Termos circunstanciados, composição civil, transação penal e recursos no JECRIM, com base na Lei 9.099/95.",
    law: "Lei nº 9.099/95",
    available: false,
    icon: "⚖️",
  },
  {
    id: "trabalhista",
    title: "Direito Trabalhista",
    description:
      "Reclamações, recursos e acordos na Justiça do Trabalho, com fundamentação na CLT.",
    law: "CLT",
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
      "Ações de cobrança, indenização, obrigações e responsabilidade civil com base no Código Civil.",
    law: "Código Civil",
    available: false,
    icon: "📜",
  },
  {
    id: "familia",
    title: "Direito de Família e Sucessões",
    description:
      "Divórcio, guarda, pensão, inventário, partilha e demais peças do direito de família e sucessões.",
    law: "Código Civil · CPC",
    available: false,
    icon: "👨‍👩‍👧",
  },
  {
    id: "imobiliario",
    title: "Direito Imobiliário",
    description:
      "Compra e venda, usucapião, despejo, condomínio e regularização de imóveis.",
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
      "Reclamações, indenizações e defesas com base no Código de Defesa do Consumidor.",
    law: "CDC",
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
  if (area.href) return area.href;
  if (previewInterno) return `/dashboard/preview/${area.id}`;
  return undefined;
}

export function filtrarFavoritosValidos(favoritos: string[] | null | undefined): string[] {
  if (!favoritos?.length) return [];
  return favoritos.filter((id) => IDS_AREAS_VALIDAS.has(id));
}
