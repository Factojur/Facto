/**
 * Agrupamento visual da home do dashboard — não altera módulos nem rotas.
 */

export type GrupoAreaDashboard = {
  id: string;
  titulo: string;
  descricao: string;
  areaIds: readonly string[];
};

export const GRUPOS_AREAS_DASHBOARD: GrupoAreaDashboard[] = [
  {
    id: "juizado-especial",
    titulo: "Juizado Especial Cível",
    descricao: "Demandas no rito da Lei 9.099 — teto de 20 salários mínimos.",
    areaIds: ["jec"],
  },
  {
    id: "justica-comum",
    titulo: "Justiça Comum",
    descricao: "Cível, consumidor, família e imóveis — vara comum (CPC).",
    areaIds: ["civil", "consumidor", "familia", "imobiliario"],
  },
  {
    id: "trabalho",
    titulo: "Trabalho",
    descricao: "Reclamações, defesas e recursos na Justiça do Trabalho.",
    areaIds: ["trabalhista"],
  },
  {
    id: "penal",
    titulo: "Penal",
    descricao: "Crimes no rito comum (CPP) e no Juizado Criminal (JECRIM).",
    areaIds: ["criminal", "jecr"],
  },
  {
    id: "publico",
    titulo: "Fazenda e público",
    descricao: "Tributário, administrativo e remédios constitucionais.",
    areaIds: ["tributario", "administrativo", "constitucional"],
  },
  {
    id: "previdenciario",
    titulo: "Previdenciário",
    descricao: "Benefícios, revisões e demandas contra o INSS.",
    areaIds: ["previdenciario"],
  },
  {
    id: "empresarial",
    titulo: "Empresarial",
    descricao: "Sociedades, dissolução e obrigações societárias.",
    areaIds: ["empresarial"],
  },
  {
    id: "especialidades",
    titulo: "Especialidades",
    descricao: "Digital, ambiental, saúde, agrário, eleitoral e outras.",
    areaIds: [
      "digital",
      "ambiental",
      "propriedade-intelectual",
      "medico",
      "agrario",
      "internacional",
      "eleitoral",
    ],
  },
];

/** Garante que todo id do catálogo aparece em exatamente um grupo. */
export function validarCoberturaGrupos(idsCatalogo: readonly string[]): string[] {
  const vistos = new Set<string>();
  const faltando: string[] = [];
  const duplicados: string[] = [];
  for (const g of GRUPOS_AREAS_DASHBOARD) {
    for (const id of g.areaIds) {
      if (vistos.has(id)) duplicados.push(id);
      vistos.add(id);
    }
  }
  for (const id of idsCatalogo) {
    if (!vistos.has(id)) faltando.push(id);
  }
  return [
    ...faltando.map((id) => `falta:${id}`),
    ...duplicados.map((id) => `dup:${id}`),
  ];
}

export type SugestaoWizardArea = {
  areaId: string;
  motivo: string;
};

/** Assistente curto — sugere área; usuário confirma antes de entrar. */
export function sugerirAreaPorWizard(respostas: {
  assunto: string;
  juizado?: "sim" | "nao" | "nao_sei";
  consumo?: "sim" | "nao";
}): SugestaoWizardArea {
  const a = respostas.assunto;

  if (a === "trabalho") {
    return {
      areaId: "trabalhista",
      motivo: "Demandas trabalhistas usam o módulo Trabalhista (CLT).",
    };
  }
  if (a === "previdencia") {
    return {
      areaId: "previdenciario",
      motivo: "Benefícios e revisões contra o INSS ficam no Previdenciário.",
    };
  }
  if (a === "familia") {
    return {
      areaId: "familia",
      motivo: "Divórcio, guarda, alimentos e inventário — Vara de Família.",
    };
  }
  if (a === "imobiliario") {
    return {
      areaId: "imobiliario",
      motivo: "Despejo, usucapião e locação — módulo Imobiliário.",
    };
  }
  if (a === "tributario") {
    return {
      areaId: "tributario",
      motivo: "Execução fiscal e tributos — módulo Tributário.",
    };
  }
  if (a === "administrativo") {
    return {
      areaId: "administrativo",
      motivo: "Mandado de segurança e atos da Administração.",
    };
  }
  if (a === "constitucional") {
    return {
      areaId: "constitucional",
      motivo: "MS, RE, ADI e remédios constitucionais.",
    };
  }
  if (a === "empresarial") {
    return {
      areaId: "empresarial",
      motivo: "Sociedades e obrigações empresariais.",
    };
  }
  if (a === "eleitoral") {
    return {
      areaId: "eleitoral",
      motivo: "Representações, registros e defesas eleitorais.",
    };
  }
  if (a === "digital") {
    return { areaId: "digital", motivo: "LGPD e tutelas digitais cíveis." };
  }
  if (a === "ambiental") {
    return { areaId: "ambiental", motivo: "Demandas ambientais e autos de infração." };
  }
  if (a === "saude") {
    return { areaId: "medico", motivo: "Erro médico e responsabilidade na saúde." };
  }
  if (a === "penal") {
    if (respostas.juizado === "sim") {
      return {
        areaId: "jecr",
        motivo: "Crimes de menor potencial no Juizado Criminal (JECRIM).",
      };
    }
    return {
      areaId: "criminal",
      motivo: "Crimes no rito comum (CPP) — Penal.",
    };
  }
  if (a === "consumo") {
    if (respostas.juizado === "sim") {
      return {
        areaId: "jec",
        motivo: "Relação de consumo no teto do Juizado (Lei 9.099).",
      };
    }
    return {
      areaId: "consumidor",
      motivo: "CDC na justiça comum — módulo Consumidor.",
    };
  }

  if (respostas.juizado === "sim") {
    return {
      areaId: "jec",
      motivo: "Causas dentro do teto do Juizado Especial Cível.",
    };
  }
  return {
    areaId: "civil",
    motivo: "Demandas cíveis gerais entre particulares — módulo Civil.",
  };
}
