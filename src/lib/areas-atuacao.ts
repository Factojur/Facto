export type AreaAtuacao = {
  id: string;
  title: string;
  description: string;
  law?: string;
  href?: string;
  available: boolean;
  icon: string;
  /** Uma linha: quando usar este card e não o vizinho. */
  dicaEscolha?: string;
  /** Fora da grade de áreas (ex.: Contratual → teaser Contratos). */
  listarNoCatalogo?: boolean;
};

/**
 * Ordem do catálogo: volume no Judiciário brasileiro (CNJ Justiça em Números
 * 2024/2025 — Justiça Estadual ~68% dos casos novos; execução fiscal com o
 * maior acervo; Trabalho e Federal/JEF em seguida; Eleitoral por último).
 * JEC permanece primeiro porque é o módulo vivo e concentra o rito dos Juizados.
 */
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
    dicaEscolha:
      "Teto e rito 9.099. Consumo na Vara Cível: Consumidor. Particular sem CDC: Civil.",
  },
  {
    id: "civil",
    title: "Direito Civil",
    description:
      "Cobrança, indenização e obrigações na justiça comum (Código Civil e CPC) — distinto do Juizado e do módulo Consumidor.",
    law: "Código Civil · CPC",
    href: "/dashboard/civil",
    available: true,
    icon: "📜",
    dicaEscolha:
      "Particulares (CC/CPC). Consumo: Consumidor ou JEC. Locação: Imobiliário. Erro médico: Médico.",
  },
  {
    id: "consumidor",
    title: "Direito do Consumidor",
    description:
      "Ações, defesas e recursos consumeristas na justiça comum (CDC e CPC) — distinto do Juizado Especial Cível.",
    law: "CDC · CPC",
    href: "/dashboard/consumidor",
    available: true,
    icon: "🛒",
    dicaEscolha:
      "CDC na Vara Cível. No Juizado (teto 9.099): JEC. Só erro médico: Médico.",
  },
  {
    id: "tributario",
    title: "Direito Tributário",
    description:
      "Embargos à execução fiscal (Lei 6.830/80), exceção de pré-executividade, anulatória, repetição e MS tributário.",
    law: "CTN · LEF",
    href: "/dashboard/tributario",
    available: true,
    icon: "💰",
    dicaEscolha: "Fazenda / LEF. Não é cobrança entre particulares (Civil).",
  },
  {
    id: "familia",
    title: "Direito de Família e Sucessões",
    description:
      "Divórcio, guarda, alimentos, inventário e partilha na Vara de Família (Código Civil e CPC) — distinto do Civil genérico e do Juizado.",
    law: "Código Civil · CPC",
    href: "/dashboard/familia",
    available: true,
    icon: "👨‍👩‍👧",
    dicaEscolha: "Vara de Família — não use o Civil genérico nem o JEC.",
  },
  {
    id: "trabalhista",
    title: "Direito Trabalhista",
    description:
      "Reclamações, defesa e recurso ordinário na Justiça do Trabalho (CLT) — distinto da justiça comum e do Juizado.",
    law: "CLT",
    href: "/dashboard/trabalhista",
    available: true,
    icon: "👷",
    dicaEscolha: "CLT e Justiça do Trabalho. Não use JEC nem Civil.",
  },
  {
    id: "previdenciario",
    title: "Direito Previdenciário",
    description:
      "Concessão, restabelecimento e revisão de benefícios contra o INSS no JEF ou na Vara Federal.",
    law: "Lei nº 8.213/91",
    href: "/dashboard/previdenciario",
    available: true,
    icon: "🧓",
    dicaEscolha: "INSS / JEF. Não é acidentário trabalhista (Trabalhista).",
  },
  {
    id: "criminal",
    title: "Direito Penal",
    description:
      "Habeas corpus, resposta à acusação, memoriais, apelação criminal e agravo em execução (CP e CPP) — distinto do JECRIM.",
    law: "CP · CPP",
    href: "/dashboard/criminal",
    available: true,
    icon: "🛡️",
    dicaEscolha: "Rito comum (CPP). Contravenção / 9.099 criminal: JECRIM.",
  },
  {
    id: "jecr",
    title: "Juizado Especial Criminal",
    description:
      "Queixa-crime, composição civil, transação penal, defesa e recurso inominado no JECRIM (Lei 9.099/95) — distinto do JEC cível e do Penal comum.",
    law: "Lei nº 9.099/95",
    href: "/dashboard/jecr",
    available: true,
    icon: "⚖️",
    dicaEscolha: "Só JECRIM. JEC é cível; Penal comum é CPP.",
  },
  {
    id: "imobiliario",
    title: "Direito Imobiliário",
    description:
      "Despejo (Lei 8.245/91), usucapião, consignação de aluguéis e cotas de condomínio — distinto do Civil genérico e do Juizado.",
    law: "Lei 8.245 · CC",
    href: "/dashboard/imobiliario",
    available: true,
    icon: "🏠",
    dicaEscolha: "Despejo e usucapião. Cobrança sem locação: Civil.",
  },
  {
    id: "empresarial",
    title: "Direito Empresarial",
    description:
      "Notificação extrajudicial, dissolução e obrigações societárias (CC e Lei 6.404/76).",
    law: "CC · Lei 6.404/76",
    href: "/dashboard/empresarial",
    available: true,
    icon: "🏢",
    dicaEscolha:
      "Sociedade (Lei 6.404). Contrato entre particulares sem sociedade: Civil.",
  },
  {
    id: "contratual",
    title: "Direito Contratual",
    description:
      "Litígio de contrato: use Civil. Minutas de contrato (modelos) ficam para um canal à parte.",
    law: "Código Civil",
    available: false,
    icon: "📝",
    listarNoCatalogo: false,
    dicaEscolha: "Fora da grade — litígio no Civil; contratos em breve.",
  },
  {
    id: "administrativo",
    title: "Direito Administrativo",
    description:
      "Mandado de segurança (Lei 12.016/09, 120 dias), anulação de ato e contencioso da Fazenda Pública.",
    law: "Lei nº 12.016/09",
    href: "/dashboard/administrativo",
    available: true,
    icon: "🏛️",
    dicaEscolha: "MS e ato da Administração. Tributo: Tributário.",
  },
  {
    id: "medico",
    title: "Direito Médico e da Saúde",
    description:
      "Erro médico e demandas da saúde — distinto de cobertura pura de plano (Consumidor) e do Penal.",
    law: "CDC · Código Civil",
    href: "/dashboard/medico",
    available: true,
    icon: "🩺",
    dicaEscolha:
      "Erro médico / saúde. Só recusa de cobertura de plano, sem erro: Consumidor.",
  },
  {
    id: "digital",
    title: "Direito Digital e Tecnologia",
    description:
      "LGPD e tutelas digitais cíveis. Crimes digitais: módulo Penal.",
    law: "LGPD",
    href: "/dashboard/digital",
    available: true,
    icon: "💻",
    dicaEscolha: "LGPD e tutelas cíveis. Crime digital: Penal.",
  },
  {
    id: "ambiental",
    title: "Direito Ambiental",
    description:
      "Ação civil pública ambiental, defesa de auto de infração e obrigação de fazer ambiental.",
    law: "Lei nº 6.938/81",
    href: "/dashboard/ambiental",
    available: true,
    icon: "🌿",
  },
  {
    id: "propriedade-intelectual",
    title: "Direito da Propriedade Intelectual",
    description:
      "Abstenção de marca, contrafação, nulidade de registro e direitos autorais (LPI e LDA).",
    law: "LPI · LDA",
    href: "/dashboard/propriedade-intelectual",
    available: true,
    icon: "©️",
  },
  {
    id: "agrario",
    title: "Direito do Agronegócio (Agrário)",
    description:
      "Contratos agrários, crédito rural e regularização fundiária.",
    law: "Estatuto da Terra",
    href: "/dashboard/agrario",
    available: true,
    icon: "🌾",
  },
  {
    id: "internacional",
    title: "Direito Internacional",
    description:
      "Homologação de sentença estrangeira no STJ e contencioso contratual internacional.",
    href: "/dashboard/internacional",
    available: true,
    icon: "🌍",
  },
  {
    id: "eleitoral",
    title: "Direito Eleitoral",
    description:
      "Representação, AIJE, registro de candidatura e defesa. A base FACTO não indexa TRE/TSE.",
    law: "Código Eleitoral",
    href: "/dashboard/eleitoral",
    available: true,
    icon: "🗳️",
  },
];

export const IDS_AREAS_VALIDAS = new Set(AREAS_ATUACAO.map((a) => a.id));

export function areasDoCatalogo(): AreaAtuacao[] {
  return AREAS_ATUACAO.filter((a) => a.listarNoCatalogo !== false);
}

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
