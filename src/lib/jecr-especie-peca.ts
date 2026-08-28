/**
 * Espécies no Juizado Especial Criminal (Lei 9.099/95, arts. 60–92).
 * Não copiar contestação, apelação nem petição inicial do JEC cível.
 * Penal comum (HC, resposta à acusação, CPP) fica no módulo criminal.
 */

export type EspeciePecaJecr =
  | "queixa-crime"
  | "defesa-jecrim"
  | "composicao-civil"
  | "transacao-penal"
  | "suspensao-condicional"
  | "alegacoes-finais"
  | "embargos-declaracao"
  | "recurso-inominado";

export type MetaEspecieJecr = {
  id: EspeciePecaJecr;
  rotulo: string;
  descricao: string;
  nomePecaHint: string;
  exigeProcesso: boolean;
  conectivoPartes: string;
  prazoAviso: string;
};

const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"] as const;

export const ESPECIES_PECA_JECR: MetaEspecieJecr[] = [
  {
    id: "queixa-crime",
    rotulo: "Queixa-crime",
    descricao:
      "Ação penal de iniciativa privada no JECRIM (injúria, difamação etc.). Polos: querelante e querelado. Não é petição inicial cível nem denúncia do MP.",
    nomePecaHint: "Queixa-crime",
    exigeProcesso: false,
    conectivoPartes: "pelos fatos e fundamentos jurídicos a seguir expostos.",
    prazoAviso:
      "Decadência da queixa: em regra 6 meses (art. 38 do CPP / art. 103 do CP) — o FACTO não conta o prazo.",
  },
  {
    id: "defesa-jecrim",
    rotulo: "Defesa no JECRIM",
    descricao:
      "Defesa do autor do fato após TCO ou oferecimento da denúncia/queixa no rito sumaríssimo (arts. 77–81 da Lei 9.099/95). Não é contestação cível nem resposta à acusação do CPP (rito comum).",
    nomePecaHint: "Defesa (JECRIM)",
    exigeProcesso: true,
    conectivoPartes:
      "apresentando a presente defesa, pelos fundamentos a seguir.",
    prazoAviso:
      "Prazo da audiência ou do despacho no rito sumaríssimo — o FACTO não conta o prazo.",
  },
  {
    id: "composicao-civil",
    rotulo: "Composição civil dos danos",
    descricao:
      "Acordo sobre o dano (arts. 72 e 74 da Lei 9.099/95). Homologação gera título executivo. Não extingue a punibilidade sozinha se o crime for de ação pública incondicionada.",
    nomePecaHint: "Pedido de composição civil dos danos",
    exigeProcesso: false,
    conectivoPartes:
      "requerendo a homologação da composição civil, pelos fundamentos a seguir.",
    prazoAviso: "Em regra na audiência preliminar (art. 72 da Lei 9.099/95).",
  },
  {
    id: "transacao-penal",
    rotulo: "Transação penal",
    descricao:
      "Proposta ou manifestação sobre transação penal (art. 76 da Lei 9.099/95) em infração de menor potencial ofensivo. Não é acordo cível nem transação do CPC.",
    nomePecaHint: "Transação penal",
    exigeProcesso: false,
    conectivoPartes:
      "manifestando-se sobre a transação penal, pelos fundamentos a seguir.",
    prazoAviso:
      "Cabível nas infrações de menor potencial ofensivo, se preenchidos os requisitos do art. 76.",
  },
  {
    id: "suspensao-condicional",
    rotulo: "Suspensão condicional do processo",
    descricao:
      "Art. 89 da Lei 9.099/95 (pena mínima igual ou inferior a 1 ano). Não confundir com sursis da condenação (art. 77 do CP).",
    nomePecaHint: "Pedido de suspensão condicional do processo",
    exigeProcesso: true,
    conectivoPartes:
      "requerendo a suspensão condicional do processo, pelos fundamentos a seguir.",
    prazoAviso:
      "Requisitos do art. 89 da Lei 9.099/95 — o FACTO não verifica a pena em abstrato sozinho.",
  },
  {
    id: "alegacoes-finais",
    rotulo: "Alegações finais",
    descricao:
      "Memoriais no rito sumaríssimo (art. 81 da Lei 9.099/95). Não são memoriais do rito ordinário do CPP.",
    nomePecaHint: "Alegações finais",
    exigeProcesso: true,
    conectivoPartes:
      "oferecendo as presentes alegações finais, pelos fundamentos a seguir.",
    prazoAviso: "Prazo da audiência ou do despacho — o FACTO não conta o prazo.",
  },
  {
    id: "embargos-declaracao",
    rotulo: "Embargos de declaração",
    descricao:
      "Omissão, contradição ou obscuridade (art. 83 da Lei 9.099/95 no Juizado).",
    nomePecaHint: "Embargos de declaração",
    exigeProcesso: true,
    conectivoPartes:
      "opondo os presentes embargos de declaração, pelos fundamentos a seguir.",
    prazoAviso: "Prazo típico: 5 dias (art. 83 da Lei 9.099/95).",
  },
  {
    id: "recurso-inominado",
    rotulo: "Recurso inominado",
    descricao:
      "Recurso da sentença do JECRIM à Turma Recursal (art. 82 da Lei 9.099/95). Aqui o inominado é o recurso certo — não use apelação do CPP.",
    nomePecaHint: "Recurso inominado",
    exigeProcesso: true,
    conectivoPartes:
      "interpondo o presente recurso inominado, pelos fundamentos a seguir.",
    prazoAviso: "Prazo típico: 10 dias (art. 82 da Lei 9.099/95).",
  },
];

type Secao = {
  chave: string;
  titulo: string;
  obrigatoria: boolean;
  opcionalSistema?: boolean;
};

const INICIAL: Secao[] = [
  { chave: "fatos", titulo: "DOS FATOS", obrigatoria: true },
  { chave: "direito", titulo: "DO DIREITO", obrigatoria: true },
  {
    chave: "provas",
    titulo: "DAS PROVAS E ANEXOS",
    obrigatoria: false,
    opcionalSistema: true,
  },
  { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
];

const ESQUELETOS: Record<EspeciePecaJecr, Secao[]> = {
  "queixa-crime": [
    { chave: "fatos", titulo: "DOS FATOS", obrigatoria: true },
    {
      chave: "tipicidade",
      titulo: "DA TIPICIDADE E DA AÇÃO PENAL PRIVADA",
      obrigatoria: true,
    },
    {
      chave: "provas",
      titulo: "DAS PROVAS E ANEXOS",
      obrigatoria: false,
      opcionalSistema: true,
    },
    { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
  ],
  "defesa-jecrim": [
    { chave: "preliminares", titulo: "DAS PRELIMINARES", obrigatoria: true },
    {
      chave: "merito",
      titulo: "DO MÉRITO — DOS FATOS E DO DIREITO",
      obrigatoria: true,
    },
    {
      chave: "provas",
      titulo: "DAS PROVAS E ANEXOS",
      obrigatoria: false,
      opcionalSistema: true,
    },
    { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
  ],
  "composicao-civil": [
    { chave: "fatos", titulo: "DOS FATOS", obrigatoria: true },
    { chave: "direito", titulo: "DO DIREITO", obrigatoria: true },
    {
      chave: "provas",
      titulo: "DAS PROVAS E ANEXOS",
      obrigatoria: false,
      opcionalSistema: true,
    },
    { chave: "valor", titulo: "DO VALOR DA REPARAÇÃO", obrigatoria: true },
    { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
  ],
  "transacao-penal": INICIAL,
  "suspensao-condicional": [
    { chave: "cabimento", titulo: "DO CABIMENTO (ART. 89)", obrigatoria: true },
    { chave: "requisitos", titulo: "DOS REQUISITOS", obrigatoria: true },
    { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
  ],
  "alegacoes-finais": [
    { chave: "historico", titulo: "DO HISTÓRICO PROCESSUAL", obrigatoria: true },
    { chave: "provas", titulo: "DA PROVA PRODUZIDA", obrigatoria: true },
    { chave: "direito", titulo: "DO DIREITO", obrigatoria: true },
    { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
  ],
  "embargos-declaracao": [
    {
      chave: "tempestividade",
      titulo: "DA TEMPESTIVIDADE E DO CABIMENTO",
      obrigatoria: true,
    },
    { chave: "omissao", titulo: "DOS VÍCIOS DO JULGADO", obrigatoria: true },
    { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
  ],
  "recurso-inominado": [
    {
      chave: "tempestividade",
      titulo: "DA TEMPESTIVIDADE E DO CABIMENTO",
      obrigatoria: true,
    },
    { chave: "historico", titulo: "DO HISTÓRICO PROCESSUAL", obrigatoria: true },
    { chave: "razoes", titulo: "DAS RAZÕES DE REFORMA", obrigatoria: true },
    { chave: "pedidos", titulo: "DOS PEDIDOS RECURSAIS", obrigatoria: true },
  ],
};

export function metaEspecieJecr(id: string): MetaEspecieJecr {
  return ESPECIES_PECA_JECR.find((e) => e.id === id) ?? ESPECIES_PECA_JECR[0]!;
}

export function normalizarEspecieJecr(
  raw: string | null | undefined
): EspeciePecaJecr | null {
  if (!raw) return null;
  const id = raw.trim().toLowerCase().replace(/\s+/g, "-");
  const ids: EspeciePecaJecr[] = [
    "queixa-crime",
    "defesa-jecrim",
    "composicao-civil",
    "transacao-penal",
    "suspensao-condicional",
    "alegacoes-finais",
    "embargos-declaracao",
    "recurso-inominado",
  ];
  if (ids.includes(id as EspeciePecaJecr)) return id as EspeciePecaJecr;
  if (id.includes("queixa")) return "queixa-crime";
  if (id.includes("transac")) return "transacao-penal";
  if (id.includes("composi")) return "composicao-civil";
  if (id.includes("suspens") || id.includes("sursis processual")) {
    return "suspensao-condicional";
  }
  if (id.includes("alegac") || id.includes("memorial")) return "alegacoes-finais";
  if (id.includes("inominado")) return "recurso-inominado";
  if (id.includes("declara")) return "embargos-declaracao";
  if (id.includes("defesa") || id.includes("tco")) return "defesa-jecrim";
  return null;
}

export function inferirEspecieJecr(
  tipoAcao: string,
  fatos?: string,
  especieExplicita?: string | null
): EspeciePecaJecr {
  const explicita = normalizarEspecieJecr(especieExplicita);
  if (explicita) return explicita;
  const t = `${tipoAcao ?? ""} ${fatos ?? ""}`.toLowerCase();
  if (/recurso inominado|turma recursal/.test(t)) return "recurso-inominado";
  if (/embargos de declara/.test(t)) return "embargos-declaracao";
  if (/alega[cç][oõ]es finais|memoriais/.test(t)) return "alegacoes-finais";
  if (/suspens[aã]o condicional|art\.?\s*89/.test(t)) {
    return "suspensao-condicional";
  }
  if (/transa[cç][aã]o penal|art\.?\s*76/.test(t)) return "transacao-penal";
  if (/composi[cç][aã]o civil|art\.?\s*74/.test(t)) return "composicao-civil";
  if (/queixa|querelante|querelado|inj[uú]ria|difama[cç][aã]o/.test(t)) {
    return "queixa-crime";
  }
  if (/defesa|autor do fato|tco|termo circunstanciado|den[uú]ncia/.test(t)) {
    return "defesa-jecrim";
  }
  return "queixa-crime";
}

export function tituloPecaJecr(
  especie: EspeciePecaJecr,
  tipoSugerido?: string | null
): string {
  switch (especie) {
    case "queixa-crime":
      return String(tipoSugerido ?? "Queixa-crime").trim() || "Queixa-crime";
    case "defesa-jecrim":
      return "Defesa";
    case "composicao-civil":
      return "Composição Civil dos Danos";
    case "transacao-penal":
      return "Transação Penal";
    case "suspensao-condicional":
      return "Suspensão Condicional do Processo";
    case "alegacoes-finais":
      return "Alegações Finais";
    case "embargos-declaracao":
      return "Embargos de Declaração";
    case "recurso-inominado":
      return "Recurso Inominado";
    default:
      return String(tipoSugerido ?? "").trim();
  }
}

export function esqueletoPorEspecieJecr(especie: string): Secao[] {
  return ESQUELETOS[especie as EspeciePecaJecr] ?? INICIAL;
}

export function blocoEstruturaPromptJecr(especie: EspeciePecaJecr): string {
  const meta = metaEspecieJecr(especie);
  const secoes = ESQUELETOS[especie] ?? INICIAL;
  const linhas = secoes.map((secao, i) => {
    const opt = secao.opcionalSistema
      ? "  (inclua se houver documentos/mídias/link — senão omita e renumere)"
      : "";
    return `   ${ROMANOS[i] ?? i + 1} - ${secao.titulo}${opt}`;
  });
  const extras: string[] = [
    "   Rito: JUIZADO ESPECIAL CRIMINAL (Lei 9.099/95, arts. 60 a 92). NÃO aplique o rito cível do Juizado (cobrança, indenização, teto 20 SM).",
    "   NÃO use contestação, apelação do CPC/CPP, resposta à acusação (art. 396-A do CPP) nem habeas corpus neste módulo — HC e rito comum ficam no Penal.",
    "   Infrações de menor potencial ofensivo (art. 61). Não invente tipificação, pena, TCO nem número de inquérito.",
    "   Honorários advocatícios na esfera penal só se os FATOS e a espécie autorizarem; não copie art. 85 do CPC como regra.",
    "   Julgado contrário ao pedido: não cite como lastro favorável. Não invente tipificação além dos FATOS.",
  ];
  if (especie === "queixa-crime") {
    extras.push(
      "   Polos: querelante e querelado. Demonstre legitimidade da ação penal privada e a representação/queixa tempestiva só com o que estiver nos FATOS.",
      "   Não transforme em ação indenizatória cível."
    );
  } else if (especie === "defesa-jecrim") {
    extras.push(
      "   Autor do fato (não 'réu cível'). Preliminares do rito 9.099 (incompetência, decadência, falta de representação) só se os fatos autorizarem.",
      "   Não chame a peça de contestação."
    );
  } else if (especie === "composicao-civil") {
    extras.push(
      "   Arts. 72 e 74 da Lei 9.099/95. Homologação = título executivo. Distinga composição (civil) de transação penal (art. 76)."
    );
  } else if (especie === "transacao-penal") {
    extras.push(
      "   Art. 76 da Lei 9.099/95. Não confunda com composição civil nem com suspensão condicional (art. 89)."
    );
  } else if (especie === "suspensao-condicional") {
    extras.push(
      "   Art. 89 da Lei 9.099/95. Não chame de sursis da condenação (art. 77 do CP)."
    );
  } else if (especie === "recurso-inominado") {
    extras.push(
      "   Art. 82 da Lei 9.099/95, 10 dias, Turma Recursal. Neste módulo o recurso inominado É o cabível — não use apelação."
    );
  }

  return [
    `Espécie da peça: ${meta.rotulo} (${especie}).`,
    "Missão: redigir a peça completa desta espécie no JECRIM.",
    "",
    "ESTRUTURA OBRIGATÓRIA (algarismos romanos):",
    "",
    ...linhas,
    "",
    ...extras,
    "",
    "REGRA: NÃO invente tópicos romanos fora dessa lista. NÃO use títulos Markdown (#, ##).",
    "Deixe linha em branco (\\n\\n) APENAS ao iniciar tópico romano ou subtópico a)/b)/c).",
  ].join("\n");
}
