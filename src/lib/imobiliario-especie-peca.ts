/**
 * Espécies imobiliárias (Lei 8.245, CC, condomínio).
 * Módulo próprio — não misturar com cobrança cível genérica nem Família.
 */

export type EspeciePecaImobiliario =
  | "peticao-inicial"
  | "despejo"
  | "usucapiao"
  | "consignacao"
  | "condominio"
  | "contestacao"
  | "reconvencao"
  | "replica"
  | "embargos-declaracao"
  | "apelacao"
  | "agravo-instrumento"
  | "cumprimento-sentenca";

export type MetaEspecieImobiliario = {
  id: EspeciePecaImobiliario;
  rotulo: string;
  descricao: string;
  nomePecaHint: string;
  exigeProcesso: boolean;
  conectivoPartes: string;
  prazoAviso: string;
};

const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"] as const;

export const ESPECIES_PECA_IMOBILIARIO: MetaEspecieImobiliario[] = [
  {
    id: "peticao-inicial",
    rotulo: "Petição inicial imobiliária",
    descricao:
      "Compra e venda, adjudicação compulsória, obrigação de outorga de escritura, nulidade de registro. Não use para despejo, usucapião ou cotas de condomínio (há espécies próprias).",
    nomePecaHint: "Ação de… (imobiliário)",
    exigeProcesso: false,
    conectivoPartes: "pelos fatos e fundamentos jurídicos a seguir expostos.",
    prazoAviso: "Prescrição/ decadência conforme o direito material (CC).",
  },
  {
    id: "despejo",
    rotulo: "Ação de despejo",
    descricao:
      "Locação urbana (Lei 8.245/91): falta de pagamento, denúncia vazia, infração contratual. Não é cobrança cível genérica nem Juizado.",
    nomePecaHint: "Ação de despejo",
    exigeProcesso: false,
    conectivoPartes: "pelos fatos e fundamentos jurídicos a seguir expostos.",
    prazoAviso:
      "Purgação da mora e prazos da Lei 8.245/91 — o FACTO não conta o prazo.",
  },
  {
    id: "usucapiao",
    rotulo: "Usucapião",
    descricao:
      "Aquisição da propriedade pelo tempo (CC arts. 1.238 e ss.; extraordinária, ordinária, especial urbana/rural). Citação de confrontantes e registro.",
    nomePecaHint: "Ação de usucapião",
    exigeProcesso: false,
    conectivoPartes: "pelos fatos e fundamentos jurídicos a seguir expostos.",
    prazoAviso: "Prazo aquisitivo é de direito material (5, 10 ou 15 anos, conforme a modalidade).",
  },
  {
    id: "consignacao",
    rotulo: "Consignação de aluguéis",
    descricao:
      "Depósito de aluguéis e encargos quando o locador recusa ou há dúvida (Lei 8.245 e CPC). Não é consignação de dívida genérica do Civil.",
    nomePecaHint: "Ação de consignação de aluguéis",
    exigeProcesso: false,
    conectivoPartes: "pelos fatos e fundamentos jurídicos a seguir expostos.",
    prazoAviso: "Observe o vencimento dos aluguéis consignados — o FACTO não conta o prazo.",
  },
  {
    id: "condominio",
    rotulo: "Cobrança condominial",
    descricao:
      "Cotas, rateios e encargos (CC e convenção). Título executivo judicial após sentença; inicial de cobrança quando ainda não há título.",
    nomePecaHint: "Ação de cobrança de cotas condominiais",
    exigeProcesso: false,
    conectivoPartes: "pelos fatos e fundamentos jurídicos a seguir expostos.",
    prazoAviso: "Prescrição quinquenal das cotas, em regra (STJ).",
  },
  {
    id: "contestacao",
    rotulo: "Contestação",
    descricao: "Defesa no rito comum (art. 335 do CPC) em demanda imobiliária.",
    nomePecaHint: "Contestação",
    exigeProcesso: true,
    conectivoPartes:
      "apresentando a presente contestação, pelos fundamentos a seguir.",
    prazoAviso: "Prazo típico: 15 dias úteis (art. 335 do CPC), salvo rito da locação.",
  },
  {
    id: "reconvencao",
    rotulo: "Contestação com reconvenção",
    descricao:
      "Defesa com reconvenção (art. 343 do CPC) em demanda imobiliária — ex.: locatário reconvém por benfeitorias ou perdas e danos.",
    nomePecaHint: "Contestação com reconvenção",
    exigeProcesso: true,
    conectivoPartes:
      "apresentando a presente contestação com reconvenção, pelos fundamentos a seguir.",
    prazoAviso: "Prazo típico: o da contestação (art. 343 c/c art. 335 do CPC), salvo rito da locação.",
  },
  {
    id: "replica",
    rotulo: "Réplica",
    descricao: "Manifestação do autor sobre a contestação (art. 351 do CPC).",
    nomePecaHint: "Réplica",
    exigeProcesso: true,
    conectivoPartes:
      "oferecendo a presente réplica, pelos fundamentos a seguir.",
    prazoAviso: "Prazo típico: 15 dias úteis (art. 351 do CPC).",
  },
  {
    id: "embargos-declaracao",
    rotulo: "Embargos de declaração",
    descricao: "Art. 1.022 do CPC.",
    nomePecaHint: "Embargos de declaração",
    exigeProcesso: true,
    conectivoPartes:
      "opondo os presentes embargos de declaração, pelos fundamentos a seguir.",
    prazoAviso: "Prazo típico: 5 dias úteis (art. 1.023 do CPC).",
  },
  {
    id: "apelacao",
    rotulo: "Apelação",
    descricao: "Recurso contra sentença (art. 1.009 do CPC). Não é recurso inominado.",
    nomePecaHint: "Apelação",
    exigeProcesso: true,
    conectivoPartes:
      "interpondo a presente apelação, pelos fundamentos a seguir.",
    prazoAviso: "Prazo típico: 15 dias úteis (art. 1.003, §5º, do CPC).",
  },
  {
    id: "agravo-instrumento",
    rotulo: "Agravo de instrumento",
    descricao: "Tutela de urgência, liminar de despejo etc. (art. 1.015 do CPC).",
    nomePecaHint: "Agravo de instrumento",
    exigeProcesso: true,
    conectivoPartes:
      "interpondo o presente agravo de instrumento, pelos fundamentos a seguir.",
    prazoAviso: "Prazo típico: 15 dias úteis (art. 1.003, §5º, do CPC).",
  },
  {
    id: "cumprimento-sentenca",
    rotulo: "Cumprimento de sentença",
    descricao: "Execução do título judicial imobiliário (despejo, cotas, adjudicação).",
    nomePecaHint: "Cumprimento de sentença",
    exigeProcesso: true,
    conectivoPartes:
      "requerendo o cumprimento da sentença, pelos fundamentos a seguir.",
    prazoAviso: "Art. 523 do CPC, em regra.",
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
  { chave: "valor", titulo: "DO VALOR DA CAUSA", obrigatoria: true },
  { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
];

const ESQUELETOS: Record<EspeciePecaImobiliario, Secao[]> = {
  "peticao-inicial": INICIAL,
  despejo: INICIAL,
  usucapiao: INICIAL,
  consignacao: INICIAL,
  condominio: INICIAL,
  contestacao: [
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
  reconvencao: [
    { chave: "preliminares", titulo: "DAS PRELIMINARES", obrigatoria: true },
    {
      chave: "merito",
      titulo: "DO MÉRITO — DOS FATOS E DO DIREITO",
      obrigatoria: true,
    },
    {
      chave: "reconvencao",
      titulo: "DA RECONVENÇÃO — DOS FATOS E DO DIREITO",
      obrigatoria: true,
    },
    {
      chave: "provas",
      titulo: "DAS PROVAS E ANEXOS",
      obrigatoria: false,
      opcionalSistema: true,
    },
    { chave: "valor", titulo: "DO VALOR DA RECONVENÇÃO", obrigatoria: true },
    { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
  ],
  replica: [
    { chave: "tempestividade", titulo: "DA TEMPESTIVIDADE", obrigatoria: true },
    { chave: "impugnacao", titulo: "DA IMPUGNAÇÃO ESPECÍFICA", obrigatoria: true },
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
  apelacao: [
    {
      chave: "tempestividade",
      titulo: "DA TEMPESTIVIDADE E DO CABIMENTO",
      obrigatoria: true,
    },
    { chave: "historico", titulo: "DO HISTÓRICO PROCESSUAL", obrigatoria: true },
    { chave: "razoes", titulo: "DAS RAZÕES DE REFORMA", obrigatoria: true },
    { chave: "pedidos", titulo: "DOS PEDIDOS RECURSAIS", obrigatoria: true },
  ],
  "agravo-instrumento": [
    {
      chave: "tempestividade",
      titulo: "DA TEMPESTIVIDADE E DO CABIMENTO",
      obrigatoria: true,
    },
    { chave: "decisao", titulo: "DA DECISÃO AGRAVADA", obrigatoria: true },
    { chave: "razoes", titulo: "DAS RAZÕES DO AGRAVO", obrigatoria: true },
    { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
  ],
  "cumprimento-sentenca": [
    { chave: "titulo", titulo: "DO TÍTULO JUDICIAL", obrigatoria: true },
    { chave: "debito", titulo: "DO DÉBITO E DAS MEDIDAS", obrigatoria: true },
    {
      chave: "provas",
      titulo: "DAS PROVAS E ANEXOS",
      obrigatoria: false,
      opcionalSistema: true,
    },
    { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
  ],
};

export function metaEspecieImobiliario(id: string): MetaEspecieImobiliario {
  return (
    ESPECIES_PECA_IMOBILIARIO.find((e) => e.id === id) ??
    ESPECIES_PECA_IMOBILIARIO[0]!
  );
}

export function normalizarEspecieImobiliario(
  raw: string | null | undefined
): EspeciePecaImobiliario | null {
  if (!raw) return null;
  const id = raw.trim().toLowerCase().replace(/\s+/g, "-");
  const ids: EspeciePecaImobiliario[] = [
    "peticao-inicial",
    "despejo",
    "usucapiao",
    "consignacao",
    "condominio",
    "contestacao",
    "reconvencao",
    "replica",
    "embargos-declaracao",
    "apelacao",
    "agravo-instrumento",
    "cumprimento-sentenca",
  ];
  if (ids.includes(id as EspeciePecaImobiliario)) {
    return id as EspeciePecaImobiliario;
  }
  if (id.includes("despejo") || id.includes("locat")) return "despejo";
  if (id.includes("usucap")) return "usucapiao";
  if (id.includes("consigna")) return "consignacao";
  if (id.includes("condom")) return "condominio";
  if (id.includes("apela")) return "apelacao";
  if (id.includes("agravo")) return "agravo-instrumento";
  if (id.includes("declara")) return "embargos-declaracao";
  if (id.includes("replica") || id.includes("réplica")) return "replica";
  if (id.includes("reconven")) return "reconvencao";
  if (id.includes("contesta")) return "contestacao";
  if (id.includes("cumprimento")) return "cumprimento-sentenca";
  return null;
}

export function inferirEspecieImobiliario(
  tipoAcao: string,
  fatos?: string,
  especieExplicita?: string | null
): EspeciePecaImobiliario {
  const explicita = normalizarEspecieImobiliario(especieExplicita);
  if (explicita) return explicita;
  const t = `${tipoAcao ?? ""} ${fatos ?? ""}`.toLowerCase();
  if (/despejo|loca[cç][aã]o|inquilino|aluguel atras/.test(t)) return "despejo";
  if (/usucapi/.test(t)) return "usucapiao";
  if (/consigna/.test(t)) return "consignacao";
  if (/condom[ií]nio|cota condomin/.test(t)) return "condominio";
  if (/agravo de instrumento/.test(t)) return "agravo-instrumento";
  if (/apela[cç][aã]o/.test(t)) return "apelacao";
  if (/embargos de declara/.test(t)) return "embargos-declaracao";
  if (/r[eé]plica/.test(t)) return "replica";
  if (/reconven/.test(t)) return "reconvencao";
  if (/contesta[cç][aã]o/.test(t)) return "contestacao";
  if (/cumprimento de senten[cç]a/.test(t)) return "cumprimento-sentenca";
  return "peticao-inicial";
}

export function tituloPecaImobiliario(
  especie: EspeciePecaImobiliario,
  tipoSugerido?: string | null
): string {
  switch (especie) {
    case "despejo":
      return "Ação de Despejo";
    case "usucapiao":
      return "Ação de Usucapião";
    case "consignacao":
      return "Ação de Consignação de Aluguéis";
    case "condominio":
      return "Ação de Cobrança de Cotas Condominiais";
    case "contestacao":
      return "Contestação";
    case "reconvencao":
      return "Contestação com Reconvenção";
    case "replica":
      return "Réplica";
    case "embargos-declaracao":
      return "Embargos de Declaração";
    case "apelacao":
      return "Apelação";
    case "agravo-instrumento":
      return "Agravo de Instrumento";
    case "cumprimento-sentenca":
      return "Cumprimento de Sentença";
    default:
      return String(tipoSugerido ?? "").trim();
  }
}

export function blocoEstruturaPromptImobiliario(
  especie: EspeciePecaImobiliario
): string {
  const meta = metaEspecieImobiliario(especie);
  const secoes = ESQUELETOS[especie] ?? INICIAL;
  const linhas = secoes.map((secao, i) => {
    const opt = secao.opcionalSistema
      ? "  (inclua se houver documentos/mídias/link — senão omita e renumere)"
      : "";
    return `   ${ROMANOS[i] ?? i + 1} - ${secao.titulo}${opt}`;
  });
  const extras: string[] = [
    "   Rito: JUSTIÇA COMUM IMOBILIÁRIA (Vara Cível). NÃO aplique Lei 9.099/95, CLT nem CDC como tese principal (locação de imóvel urbano segue a Lei 8.245/91).",
    "   Honorários: art. 85 do CPC. Identifique o imóvel (matrícula, endereço) só com o que estiver nos FATOS — não invente número de matrícula.",
    "   Agravo: Tribunal de Justiça. Julgado contrário ao pedido: não cite como lastro favorável.",
  ];
  if (especie === "despejo") {
    extras.push(
      "   Fundamente na Lei 8.245/91 (motivo do despejo). Pedido de desocupação + aluguéis em atraso se os fatos autorizarem. Liminar só se a lei e os fatos couberem."
    );
  } else if (especie === "usucapiao") {
    extras.push(
      "   Modalidade (extraordinária, ordinária, especial urbana/rural) conforme o tempo e a posse narrados. Cite confrontantes se os fatos trouxerem. Pedido de registro."
    );
  } else if (especie === "consignacao") {
    extras.push(
      "   Demonstre recusa/dúvida quanto ao credor e o depósito dos aluguéis. Não transforme em despejo."
    );
  } else if (especie === "condominio") {
    extras.push(
      "   Convenção, assembleia e planilha de débito só se estiverem nos FATOS/provas. Não invente valores de cota."
    );
  } else if (especie === "reconvencao") {
    extras.push(
      "   Art. 343 do CPC. NÃO use pedido contraposto da Lei 9.099/95. Pedidos: improcedência da inicial + procedência da reconvenção + honorários (art. 85 do CPC)."
    );
  }

  return [
    `Espécie da peça: ${meta.rotulo} (${especie}).`,
    "Missão: redigir a peça completa desta espécie no contencioso imobiliário.",
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
