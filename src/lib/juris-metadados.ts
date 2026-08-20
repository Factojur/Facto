/**
 * Extrai tribunal e áreas FACTO de título/texto de jurisprudência.
 */

export const TRIBUNAIS_CONHECIDOS = [
  "STF",
  "STJ",
  "TST",
  "TSE",
  "STM",
  "TRF1",
  "TRF2",
  "TRF3",
  "TRF4",
  "TRF5",
  "TRF6",
  "TJAC",
  "TJAL",
  "TJAM",
  "TJAP",
  "TJBA",
  "TJCE",
  "TJDFT",
  "TJES",
  "TJGO",
  "TJMA",
  "TJMG",
  "TJMS",
  "TJMT",
  "TJPA",
  "TJPB",
  "TJPE",
  "TJPI",
  "TJPR",
  "TJRJ",
  "TJRN",
  "TJRO",
  "TJRR",
  "TJRS",
  "TJSC",
  "TJSE",
  "TJSP",
  "TJTO",
  "CARF",
  "TNU",
] as const;

export type AreaTagFacto =
  | "jec"
  | "consumidor"
  | "civil"
  | "trabalhista"
  | "familia"
  | "imobiliario"
  | "previdenciario"
  | "criminal"
  | "jecr"
  | "tributario"
  | "administrativo"
  | "empresarial"
  | "ambiental"
  | "constitucional"
  | "medico"
  | "digital"
  | "agrario"
  | "eleitoral";

const AREA_TERMOS: { area: AreaTagFacto; termos: string[] }[] = [
  {
    area: "jec",
    termos: [
      "juizado especial cível",
      "juizado especial civel",
      "recurso inominado",
      "lei 9.099",
      "lei nº 9.099",
    ],
  },
  {
    area: "consumidor",
    termos: [
      "consumidor",
      " código de defesa",
      "cdc ",
      "fornecedor",
      "plano de saúde",
      "golpe pix",
      "negativação",
      "vício do produto",
      "vicio do produto",
    ],
  },
  {
    area: "trabalhista",
    termos: [
      "reclamante",
      "reclamada",
      " clt",
      "horas extras",
      "verbas rescisórias",
      "justiça do trabalho",
      " fgts",
    ],
  },
  {
    area: "familia",
    termos: [
      "alimentos",
      "guarda compartilhada",
      "divórcio",
      "divorcio",
      "união estável",
      "uniao estavel",
      "pensão alimentícia",
    ],
  },
  {
    area: "imobiliario",
    termos: [
      "despejo",
      "locação",
      "locacao",
      "condomínio",
      "condominio",
      "usucapião",
      "usucapiao",
      "alienação fiduciária",
    ],
  },
  {
    area: "previdenciario",
    termos: [
      "aposentadoria",
      "benefício previdenciário",
      " inss",
      "auxílio-doença",
      "auxilio-doenca",
      " bpc",
      " loas",
    ],
  },
  {
    area: "criminal",
    termos: [
      "habeas corpus",
      "tráfico de drogas",
      "código penal",
      " prisão preventiva",
      " cpp",
    ],
  },
  {
    area: "jecr",
    termos: [
      "juizado especial criminal",
      "jecrim",
      "transação penal",
      "transacao penal",
      "vias de fato",
    ],
  },
  {
    area: "tributario",
    termos: [
      " icms",
      " execução fiscal",
      " carf",
      " iptu",
      " itbi",
      "tributário",
      "tributario",
    ],
  },
  {
    area: "administrativo",
    termos: [
      "improbidade",
      "licitação",
      "licitacao",
      "servidor público",
      "mandado de segurança",
    ],
  },
  {
    area: "empresarial",
    termos: [
      "recuperação judicial",
      "recuperacao judicial",
      "falência",
      "falencia",
      "sociedade limitada",
    ],
  },
  {
    area: "ambiental",
    termos: [
      "ambiental",
      "licença ambiental",
      " ibama",
      "degradação ambiental",
      "degradacao ambiental",
    ],
  },
  {
    area: "constitucional",
    termos: [
      " ação direta de inconstitucionalidade",
      " adpf",
      "recurso extraordinário",
      "recurso extraordinario",
      "mandado de injunção",
    ],
  },
  {
    area: "medico",
    termos: [
      "erro médico",
      "erro medico",
      "prontuário",
      "prontuario",
      "home care",
      "cirurgia bariátrica",
    ],
  },
  {
    area: "digital",
    termos: [
      " lgpd",
      "dados pessoais",
      "vazamento de dados",
      "phishing",
      "criptomoeda",
    ],
  },
  {
    area: "agrario",
    termos: [
      "arrendamento rural",
      "crédito rural",
      "credito rural",
      "parceria agrícola",
      "usucapião rural",
    ],
  },
  {
    area: "eleitoral",
    termos: ["eleitoral", "propaganda eleitoral", "aije", "registro de candidatura"],
  },
];

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

export function detectarTribunalDoTexto(blob: string): string | null {
  const u = blob.toUpperCase();
  const ordem = [...TRIBUNAIS_CONHECIDOS].sort((a, b) => b.length - a.length);
  for (const t of ordem) {
    if (new RegExp(`\\b${t}\\b`).test(u)) return t;
  }
  if (/\bSUPREMO TRIBUNAL FEDERAL\b/.test(u)) return "STF";
  if (/\bSUPERIOR TRIBUNAL DE JUSTI[ÇC]A\b/.test(u)) return "STJ";
  return null;
}

export function detectarAreasDoTexto(blob: string): AreaTagFacto[] {
  const n = ` ${norm(blob)} `;
  const hit: AreaTagFacto[] = [];
  for (const { area, termos } of AREA_TERMOS) {
    if (termos.some((t) => n.includes(norm(t)))) hit.push(area);
  }
  return hit;
}

export function metadadosJurisDoTexto(
  titulo: string,
  texto: string,
  tribunalHint?: string | null
): { tribunal: string | null; area_tags: AreaTagFacto[] } {
  const blob = `${titulo}\n${texto.slice(0, 2_000)}`;
  const tribunal =
    (tribunalHint?.trim().toUpperCase() || null) ??
    detectarTribunalDoTexto(blob);
  return {
    tribunal,
    area_tags: detectarAreasDoTexto(blob),
  };
}
