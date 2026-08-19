/**
 * Teses canônicas (código, não skills editáveis).
 * JEC + Consumidor primeiro — as que mais geram peça.
 * O cliente vê chips; a redação recebe artigos obrigatórios.
 * Julgado continua só da base / anexo do caso.
 */

export type TeseCanonica = {
  id: string;
  areas: readonly string[];
  rotulo: string;
  artigos: string;
  /** Palavras no relato que ligam a tese (sem analogia). */
  pistas: readonly string[];
};

export const TESES_CANONICAS: readonly TeseCanonica[] = [
  {
    id: "cdc-49-arrependimento",
    areas: ["jec", "consumidor"],
    rotulo: "Arrependimento (CDC 49)",
    artigos: "art. 49 do CDC (7 dias; desfazimento do contrato a distância)",
    pistas: [
      "arrepend",
      "direito de desistir",
      "comprei pela internet",
      "compra online",
      "prazo de 7 dias",
      "sete dias",
      "site",
      "marketplace",
      "entrega em casa",
    ],
  },
  {
    id: "cdc-14-falha-servico",
    areas: ["jec", "consumidor"],
    rotulo: "Falha do serviço (CDC 14)",
    artigos: "art. 14 do CDC (responsabilidade objetiva do fornecedor)",
    pistas: [
      "falha",
      "mau serviço",
      "não funcionou",
      "prestadora",
      "fornecedor",
      "vício do serviço",
    ],
  },
  {
    id: "cdc-18-vicio-produto",
    areas: ["jec", "consumidor"],
    rotulo: "Vício do produto (CDC 18)",
    artigos: "arts. 18 e 19 do CDC (vício de qualidade/quantidade)",
    pistas: [
      "produto com defeito",
      "vício",
      "não liga",
      "quebrado",
      "garantia",
      "troca do produto",
    ],
  },
  {
    id: "negativacao-indevida",
    areas: ["jec", "consumidor", "civil"],
    rotulo: "Negativação indevida",
    artigos:
      "CDC e Súmula 385 do STJ quando couber; dano moral conforme a prova do caso",
    pistas: [
      "negativ",
      "spc",
      "serasa",
      "scpc",
      "nome sujo",
      "cadastro de inadimplentes",
      "restrição cadastral",
    ],
  },
  {
    id: "dano-moral-consumo",
    areas: ["jec", "consumidor"],
    rotulo: "Dano moral consumerista",
    artigos: "arts. 6º, VI, e 14 do CDC; dano moral in re ipsa só se os fatos sustentarem",
    pistas: [
      "dano moral",
      "constrangimento",
      "humilhação",
      "aborrecimento",
      "transtorno",
    ],
  },
  {
    id: "inexigibilidade-debito",
    areas: ["jec", "consumidor", "civil"],
    rotulo: "Inexigibilidade de débito",
    artigos: "inexigibilidade / inexistência da dívida; CDC se relação de consumo",
    pistas: [
      "débito indevido",
      "cobrança indevida",
      "não contratei",
      "inexigibilidade",
      "conta que não reconheço",
    ],
  },
  {
    id: "promessa-nao-cumprida",
    areas: ["jec", "consumidor"],
    rotulo: "Oferta vincula (CDC 30/35)",
    artigos: "arts. 30 e 35 do CDC (oferta vincula o fornecedor)",
    pistas: [
      "propaganda enganosa",
      "oferta",
      "prometeram",
      "anúncio",
      "publicidade",
      "não cumpriram o que anunciaram",
    ],
  },
  {
    id: "juizado-9099",
    areas: ["jec"],
    rotulo: "Rito do Juizado (9.099)",
    artigos:
      "Lei 9.099/95 (competência, informalidade, sucumbência na forma da lei — não art. 85 do CPC na origem)",
    pistas: ["juizado", "jec", "pequenas causas", "9.099"],
  },
  {
    id: "clt-horas-extras",
    areas: ["trabalhista"],
    rotulo: "Horas extras (CLT)",
    artigos:
      "arts. 58, 59 e 71 da CLT; Súmula 437 do TST (intervalo — quando os FATOS tiverem supressão)",
    pistas: [
      "hora extra",
      "horas extras",
      "hora extraordinária",
      "intervalo intrajornada",
      "art. 71",
      "banco de horas",
      "sobreaviso",
    ],
  },
  {
    id: "clt-pejotizacao",
    areas: ["trabalhista"],
    rotulo: "Pejotização / vínculo",
    artigos:
      "arts. 2º, 3º e 9º da CLT (pessoalidade, onerosidade, subordinação, habitualidade; fraude à lei)",
    pistas: [
      "pejotiza",
      "pessoa jurídica",
      "sem carteira",
      "vínculo de emprego",
      "contratado como pj",
      "nota fiscal de serviços",
    ],
  },
  {
    id: "familia-alimentos",
    areas: ["familia"],
    rotulo: "Alimentos (CC 1.694)",
    artigos:
      "arts. 1.694 a 1.710 do CC (necessidade, possibilidade, proporcionalidade)",
    pistas: [
      "alimento",
      "pensão",
      "guarda",
      "binômio",
      "necessidade e possibilidade",
      "alimentos provisionais",
    ],
  },
  {
    id: "imobiliario-atraso-obra",
    areas: ["imobiliario"],
    rotulo: "Atraso na entrega da obra",
    artigos:
      "CC (inadimplemento / perdas e danos); CDC se relação de consumo com a incorporadora",
    pistas: [
      "atraso na entrega",
      "atraso da obra",
      "habite-se",
      "incorporadora",
      "prazo de entrega do imóvel",
      "distrato",
      "chaves",
    ],
  },
  {
    id: "prev-tempo-especial",
    areas: ["previdenciario"],
    rotulo: "Tempo especial (8.213)",
    artigos:
      "Lei 8.213/91 (tempo especial / conversão); ruído e agentes nocivos conforme o laudo dos FATOS",
    pistas: [
      "tempo especial",
      "aposentadoria especial",
      "ruído",
      "agente nocivo",
      "ppp",
      "ltcat",
      "insalubridade previdenci",
    ],
  },
];

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function tesesDaArea(areaId: string): TeseCanonica[] {
  return TESES_CANONICAS.filter((t) => t.areas.includes(areaId));
}

export function tesePorId(id: string): TeseCanonica | undefined {
  return TESES_CANONICAS.find((t) => t.id === id);
}

/** Cruza o relato com pistas do código. Não inventa tese. */
export function detectarTesesCanonicas(
  areaId: string,
  relato: string,
  idsExtra: string[] = []
): TeseCanonica[] {
  const n = normalizar(relato);
  const vistos = new Set<string>();
  const out: TeseCanonica[] = [];

  for (const id of idsExtra) {
    const t = tesePorId(id);
    if (t && t.areas.includes(areaId) && !vistos.has(t.id)) {
      vistos.add(t.id);
      out.push(t);
    }
  }

  for (const t of tesesDaArea(areaId)) {
    if (vistos.has(t.id)) continue;
    if (t.pistas.some((p) => n.includes(normalizar(p)))) {
      vistos.add(t.id);
      out.push(t);
    }
  }

  if (areaId === "jec" && !vistos.has("juizado-9099")) {
    const jec = tesePorId("juizado-9099");
    if (jec) out.push(jec);
  }

  return out.slice(0, 6);
}

export function blocoPromptTesesCanonicas(teses: TeseCanonica[]): string {
  if (teses.length === 0) return "";
  return [
    "<TESES_CANONICAS_DO_CODIGO>",
    "Fundamente com estes artigos se os FATOS baterem. Não troque por analogia de outro instituto.",
    "Não invente julgado para 'ilustrar' a tese — acórdão só da BASE ou do anexo do caso.",
    ...teses.map((t) => `- ${t.rotulo}: ${t.artigos}`),
    "</TESES_CANONICAS_DO_CODIGO>",
  ].join("\n");
}
