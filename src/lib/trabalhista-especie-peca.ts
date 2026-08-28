/**
 * Espécies na Justiça do Trabalho (CLT + rito trabalhista).
 * Não copiar contestação/apelação da justiça comum nem Juizado (9.099).
 */

export type EspeciePecaTrabalhista =
  | "reclamacao"
  | "defesa"
  | "manifestacao"
  | "embargos-declaracao"
  | "recurso-ordinario"
  | "agravo-instrumento"
  | "agravo-peticao"
  | "execucao-titulo";

export type MetaEspecieTrabalhista = {
  id: EspeciePecaTrabalhista;
  rotulo: string;
  descricao: string;
  nomePecaHint: string;
  exigeProcesso: boolean;
  conectivoPartes: string;
  prazoAviso: string;
};

const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"] as const;

export const ESPECIES_PECA_TRABALHISTA: MetaEspecieTrabalhista[] = [
  {
    id: "reclamacao",
    rotulo: "Reclamação trabalhista",
    descricao:
      "Petição inicial na Justiça do Trabalho (arts. 840 e 841 da CLT). Polos: reclamante e reclamado. Não é petição inicial cível nem do Juizado.",
    nomePecaHint: "Reclamação trabalhista",
    exigeProcesso: false,
    conectivoPartes: "pelos fatos e fundamentos jurídicos a seguir expostos.",
    prazoAviso:
      "Prescrição: em regra 5 anos, limitado a 2 anos após a extinção do contrato (art. 7º, XXIX, da CF e art. 11 da CLT).",
  },
  {
    id: "defesa",
    rotulo: "Defesa / contestação trabalhista",
    descricao:
      "Resposta do reclamado (art. 847 da CLT). Preliminares, mérito, impugnação de documentos e pedidos contrapostos se couberem.",
    nomePecaHint: "Defesa (contestação trabalhista)",
    exigeProcesso: true,
    conectivoPartes:
      "apresentando a presente defesa, pelos fundamentos a seguir.",
    prazoAviso:
      "Em regra até a audiência (art. 847 da CLT), salvo rito ou despacho específico.",
  },
  {
    id: "manifestacao",
    rotulo: "Manifestação / réplica",
    descricao:
      "Manifestação do reclamante sobre a defesa ou documentos (praxis da JT; não é réplica do art. 351 do CPC).",
    nomePecaHint: "Manifestação",
    exigeProcesso: true,
    conectivoPartes:
      "oferecendo a presente manifestação, pelos fundamentos a seguir.",
    prazoAviso: "Prazo do despacho ou da ata — o FACTO não conta o prazo.",
  },
  {
    id: "embargos-declaracao",
    rotulo: "Embargos de declaração",
    descricao:
      "Omissão, contradição ou obscuridade (art. 897-A da CLT). Não confundir com embargos à execução.",
    nomePecaHint: "Embargos de declaração",
    exigeProcesso: true,
    conectivoPartes:
      "opondo os presentes embargos de declaração, pelos fundamentos a seguir.",
    prazoAviso: "Prazo típico: 5 dias (art. 897-A da CLT).",
  },
  {
    id: "recurso-ordinario",
    rotulo: "Recurso ordinário",
    descricao:
      "Recurso contra decisão definitiva da Vara para o TRT (art. 895 da CLT). Não é apelação do CPC nem recurso inominado.",
    nomePecaHint: "Recurso ordinário",
    exigeProcesso: true,
    conectivoPartes:
      "interpondo o presente recurso ordinário, pelos fundamentos a seguir.",
    prazoAviso: "Prazo típico: 8 dias (art. 895 da CLT).",
  },
  {
    id: "agravo-instrumento",
    rotulo: "Agravo de instrumento",
    descricao:
      "Destrava recurso denegado (art. 897, b, da CLT). Não é o agravo de instrumento do art. 1.015 do CPC.",
    nomePecaHint: "Agravo de instrumento",
    exigeProcesso: true,
    conectivoPartes:
      "interpondo o presente agravo de instrumento, pelos fundamentos a seguir.",
    prazoAviso: "Prazo típico: 8 dias (art. 897 da CLT).",
  },
  {
    id: "agravo-peticao",
    rotulo: "Agravo de petição",
    descricao:
      "Recurso na fase de execução (art. 897, a, da CLT).",
    nomePecaHint: "Agravo de petição",
    exigeProcesso: true,
    conectivoPartes:
      "interpondo o presente agravo de petição, pelos fundamentos a seguir.",
    prazoAviso: "Prazo típico: 8 dias (art. 897 da CLT).",
  },
  {
    id: "execucao-titulo",
    rotulo: "Execução trabalhista",
    descricao:
      "Liquidação e execução de título judicial ou acordo (arts. 876 e seguintes da CLT). Não use execução de título do CPC da justiça comum.",
    nomePecaHint: "Execução trabalhista",
    exigeProcesso: false,
    conectivoPartes:
      "promovendo a presente execução, pelos fundamentos a seguir.",
    prazoAviso:
      "Prescrição intercorrente e prazos da execução: observe a CLT e a Súmula 114 do TST quando couber.",
  },
];

type Secao = {
  chave: string;
  titulo: string;
  obrigatoria: boolean;
  opcionalSistema?: boolean;
};

const ESQUELETOS: Record<EspeciePecaTrabalhista, Secao[]> = {
  reclamacao: [
    { chave: "fatos", titulo: "DOS FATOS", obrigatoria: true },
    { chave: "direito", titulo: "DO DIREITO", obrigatoria: true },
    {
      chave: "provas",
      titulo: "DAS PROVAS E ANEXOS",
      obrigatoria: false,
      opcionalSistema: true,
    },
    { chave: "valor", titulo: "DO VALOR DA CAUSA", obrigatoria: true },
    { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
  ],
  defesa: [
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
  manifestacao: [
    { chave: "tempestividade", titulo: "DA TEMPESTIVIDADE", obrigatoria: true },
    {
      chave: "impugnacao",
      titulo: "DA IMPUGNAÇÃO ESPECÍFICA",
      obrigatoria: true,
    },
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
  "recurso-ordinario": [
    {
      chave: "tempestividade",
      titulo: "DA TEMPESTIVIDADE E DO CABIMENTO",
      obrigatoria: true,
    },
    {
      chave: "historico",
      titulo: "DO HISTÓRICO PROCESSUAL",
      obrigatoria: true,
    },
    {
      chave: "razoes",
      titulo: "DAS RAZÕES DE REFORMA",
      obrigatoria: true,
    },
    { chave: "pedidos", titulo: "DOS PEDIDOS RECURSAIS", obrigatoria: true },
  ],
  "agravo-instrumento": [
    {
      chave: "tempestividade",
      titulo: "DA TEMPESTIVIDADE E DO CABIMENTO",
      obrigatoria: true,
    },
    {
      chave: "decisao",
      titulo: "DA DECISÃO DENEGATÓRIA",
      obrigatoria: true,
    },
    {
      chave: "razoes",
      titulo: "DAS RAZÕES DO AGRAVO",
      obrigatoria: true,
    },
    { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
  ],
  "agravo-peticao": [
    {
      chave: "tempestividade",
      titulo: "DA TEMPESTIVIDADE E DO CABIMENTO",
      obrigatoria: true,
    },
    {
      chave: "execucao",
      titulo: "DA EXECUÇÃO E DA DECISÃO AGRAVADA",
      obrigatoria: true,
    },
    {
      chave: "razoes",
      titulo: "DAS RAZÕES DO AGRAVO",
      obrigatoria: true,
    },
    { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
  ],
  "execucao-titulo": [
    { chave: "titulo", titulo: "DO TÍTULO EXECUTIVO", obrigatoria: true },
    { chave: "debito", titulo: "DO DÉBITO E DA LIQUIDAÇÃO", obrigatoria: true },
    { chave: "medidas", titulo: "DAS MEDIDAS EXECUTIVAS", obrigatoria: true },
    {
      chave: "provas",
      titulo: "DAS PROVAS E ANEXOS",
      obrigatoria: false,
      opcionalSistema: true,
    },
    { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
  ],
};

export function metaEspecieTrabalhista(id: string): MetaEspecieTrabalhista {
  return (
    ESPECIES_PECA_TRABALHISTA.find((e) => e.id === id) ??
    ESPECIES_PECA_TRABALHISTA[0]!
  );
}

export function normalizarEspecieTrabalhista(
  raw: string | null | undefined
): EspeciePecaTrabalhista | null {
  if (!raw) return null;
  const id = raw.trim().toLowerCase().replace(/\s+/g, "-");
  const ids: EspeciePecaTrabalhista[] = [
    "reclamacao",
    "defesa",
    "manifestacao",
    "embargos-declaracao",
    "recurso-ordinario",
    "agravo-instrumento",
    "agravo-peticao",
    "execucao-titulo",
  ];
  if (ids.includes(id as EspeciePecaTrabalhista)) {
    return id as EspeciePecaTrabalhista;
  }
  if (id === "peticao-inicial" || id.includes("reclama")) return "reclamacao";
  if (id.includes("contesta") || id === "defesa-reclamada") return "defesa";
  if (id.includes("réplica") || id.includes("replica") || id.includes("manifesta")) {
    return "manifestacao";
  }
  if (id.includes("declara")) return "embargos-declaracao";
  if (id.includes("ordinario") || id.includes("ordinário") || id === "recurso") {
    return "recurso-ordinario";
  }
  if (id.includes("peticao") || id.includes("petição")) return "agravo-peticao";
  if (id.includes("agravo")) return "agravo-instrumento";
  if (id.includes("execu") || id.includes("cumprimento")) return "execucao-titulo";
  return null;
}

export function inferirEspecieTrabalhista(
  tipoAcao: string,
  fatos?: string,
  especieExplicita?: string | null
): EspeciePecaTrabalhista {
  const explicita = normalizarEspecieTrabalhista(especieExplicita);
  if (explicita) return explicita;
  const t = `${tipoAcao ?? ""} ${fatos ?? ""}`.toLowerCase();
  if (/agravo de peti/.test(t)) return "agravo-peticao";
  if (/agravo de instrumento/.test(t)) return "agravo-instrumento";
  if (/recurso ordin[aá]rio/.test(t)) return "recurso-ordinario";
  if (/embargos de declara/.test(t)) return "embargos-declaracao";
  if (/manifesta[cç]|r[eé]plica/.test(t)) return "manifestacao";
  if (/defesa|contesta[cç][aã]o/.test(t)) return "defesa";
  if (/execu[cç][aã]o|liquida[cç][aã]o/.test(t)) return "execucao-titulo";
  return "reclamacao";
}

export function tituloPecaTrabalhista(
  especie: EspeciePecaTrabalhista,
  tipoSugerido?: string | null
): string {
  switch (especie) {
    case "defesa":
      return "Defesa";
    case "manifestacao":
      return "Manifestação";
    case "embargos-declaracao":
      return "Embargos de Declaração";
    case "recurso-ordinario":
      return "Recurso Ordinário";
    case "agravo-instrumento":
      return "Agravo de Instrumento";
    case "agravo-peticao":
      return "Agravo de Petição";
    case "execucao-titulo":
      return "Execução Trabalhista";
    default:
      return String(tipoSugerido ?? "Reclamação Trabalhista").trim();
  }
}

export function esqueletoPorEspecieTrabalhista(especie: string): Secao[] {
  return ESQUELETOS[especie as EspeciePecaTrabalhista] ?? ESQUELETOS.reclamacao;
}

export function blocoEstruturaPromptTrabalhista(
  especie: EspeciePecaTrabalhista
): string {
  const meta = metaEspecieTrabalhista(especie);
  const secoes = ESQUELETOS[especie] ?? ESQUELETOS.reclamacao;
  const linhas = secoes.map((secao, i) => {
    const opt = secao.opcionalSistema
      ? "  (inclua se houver documentos/mídias/link — senão omita e renumere)"
      : "";
    return `   ${ROMANOS[i] ?? i + 1} - ${secao.titulo}${opt}`;
  });

  const extras: string[] = [
    "   Rito: JUSTIÇA DO TRABALHO (CLT). NÃO aplique Lei 9.099/95, recurso inominado, apelação do CPC nem Vara Cível.",
    "   Polos: RECLAMANTE e RECLAMADO (nunca autor/réu da justiça comum).",
    "   Honorários sucumbenciais: art. 791-A da CLT (não use o art. 85 do CPC como base principal).",
    "   Endereçamento: Juiz do Trabalho da Vara do Trabalho (não Juiz de Direito).",
    "   Súmulas e OJs do TST quando pertinentes; não invente número de processo nem OAB.",
    "   Não invente salário, CTPS, horas extras, FGTS nem data de rescisão se os FATOS não trouxerem. Julgado contrário ao pedido: não cite como lastro favorável.",
    "   Preferir lastro TST/TRT. Não cite TJSP/justiça comum sem vínculo trabalhista. Aviso prévio: art. 7º, XXI, da CF (não inciso II) + art. 487 da CLT.",
    "   Nomes: use RECLAMANTE/RECLAMADO dos FATOS — nunca “autor”, “réu”, “empregador” genérico no polo.",
  ];

  if (especie === "reclamacao") {
    extras.push(
      "   Pedidos: articule as verbas dos FATOS. Só liquíde valores se os FATOS trouxerem cifra ou base clara; senão peça “a liquidar em execução”. Não invente R$ de FGTS/férias.",
      "   Temas típicos: verbas rescisórias, horas extras, FGTS, adicional, reconhecimento de vínculo — só se os FATOS autorizarem.",
      "   Não fundamente em CDC salvo se a causa de pedir for realmente consumerista (não é este módulo)."
    );
  } else if (especie === "defesa") {
    extras.push(
      "   Preliminares só se cabíveis (inépcia, ilegitimidade, incompetência da JT, prescrição…). Não invente.",
      "   Impugne documentos. Pedidos: improcedência + honorários 791-A se cabíveis. Diga reclamante/reclamado, não autor/réu."
    );
  } else if (especie === "recurso-ordinario") {
    extras.push(
      "   Cabimento e tempestividade: art. 895 da CLT (8 dias). Órgão ad quem: TRT. NÃO chame de apelação. Nas razões, nomeie o recorrido pelos FATOS (não “EMPREGADOR”)."
    );
  } else if (especie === "agravo-instrumento") {
    extras.push(
      "   Art. 897, b, da CLT: destrava recurso denegado. Endereçamento: TRT, NÃO o Tribunal de Justiça. Não use o rol do art. 1.015 do CPC."
    );
  } else if (especie === "agravo-peticao") {
    extras.push(
      "   Art. 897, a, da CLT — fase de execução. Endereçamento: TRT, não a Vara e não o TJ."
    );
  } else if (especie === "embargos-declaracao") {
    extras.push("   Art. 897-A da CLT. Não transforme em recurso ordinário disfarçado.");
  } else if (especie === "execucao-titulo") {
    extras.push(
      "   Arts. 876 e seguintes da CLT. Liquidação e medidas típicas da execução trabalhista (penhora, SISBAJUD etc. só se os fatos pedirem)."
    );
  }

  return [
    `Espécie da peça: ${meta.rotulo} (${especie}).`,
    "Missão: redigir a peça completa desta espécie no rito da Justiça do Trabalho (CLT).",
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
