/**
 * Espécies em família e sucessões (CC + CPC).
 * Não copiar Juizado, CLT nem CDC. Segredo de justiça (art. 189 do CPC) quando couber.
 */

export type EspeciePecaFamilia =
  | "peticao-inicial"
  | "contestacao"
  | "reconvencao"
  | "replica"
  | "embargos-declaracao"
  | "apelacao"
  | "agravo-instrumento"
  | "cumprimento-alimentos"
  | "inventario";

export type MetaEspecieFamilia = {
  id: EspeciePecaFamilia;
  rotulo: string;
  descricao: string;
  nomePecaHint: string;
  exigeProcesso: boolean;
  conectivoPartes: string;
  prazoAviso: string;
};

const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"] as const;

export const ESPECIES_PECA_FAMILIA: MetaEspecieFamilia[] = [
  {
    id: "peticao-inicial",
    rotulo: "Petição inicial (família)",
    descricao:
      "Divórcio, dissolução de união, guarda, visitas, alimentos, reconhecimento de união estável. Vara de Família. Não use Juizado nem cobrança cível genérica (módulo Civil).",
    nomePecaHint: "Ação de divórcio / guarda / alimentos…",
    exigeProcesso: false,
    conectivoPartes: "pelos fatos e fundamentos jurídicos a seguir expostos.",
    prazoAviso:
      "Alimentos: Lei 5.478/64. Guarda: ECA e CC. Divórcio: CC arts. 1.571 e ss. O FACTO não conta prazo.",
  },
  {
    id: "contestacao",
    rotulo: "Contestação",
    descricao:
      "Defesa no rito comum (art. 335 do CPC) em demanda de família. Preliminares, mérito e alimentos/guarda se contrapostos.",
    nomePecaHint: "Contestação",
    exigeProcesso: true,
    conectivoPartes:
      "apresentando a presente contestação, pelos fundamentos a seguir.",
    prazoAviso: "Prazo típico: 15 dias úteis (art. 335 do CPC), salvo rito especial (ex.: alimentos).",
  },
  {
    id: "reconvencao",
    rotulo: "Contestação com reconvenção",
    descricao:
      "Defesa com reconvenção (art. 343 do CPC) em demanda de família — ex.: alimentos/guarda contrapostos. Réu = reconvinte; autor = reconvindo.",
    nomePecaHint: "Contestação com reconvenção",
    exigeProcesso: true,
    conectivoPartes:
      "apresentando a presente contestação com reconvenção, pelos fundamentos a seguir.",
    prazoAviso: "Prazo típico: o da contestação (art. 343 c/c art. 335 do CPC), salvo rito especial.",
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
    descricao: "Omissão, contradição, obscuridade ou erro material (art. 1.022 do CPC).",
    nomePecaHint: "Embargos de declaração",
    exigeProcesso: true,
    conectivoPartes:
      "opondo os presentes embargos de declaração, pelos fundamentos a seguir.",
    prazoAviso: "Prazo típico: 5 dias úteis (art. 1.023 do CPC).",
  },
  {
    id: "apelacao",
    rotulo: "Apelação",
    descricao:
      "Recurso contra sentença da Vara de Família (art. 1.009 do CPC). Não é recurso inominado.",
    nomePecaHint: "Apelação",
    exigeProcesso: true,
    conectivoPartes:
      "interpondo a presente apelação, pelos fundamentos a seguir.",
    prazoAviso: "Prazo típico: 15 dias úteis (art. 1.003, §5º, do CPC).",
  },
  {
    id: "agravo-instrumento",
    rotulo: "Agravo de instrumento",
    descricao:
      "Tutela de urgência, guarda provisória, alimentos provisionais (art. 1.015 do CPC).",
    nomePecaHint: "Agravo de instrumento",
    exigeProcesso: true,
    conectivoPartes:
      "interpondo o presente agravo de instrumento, pelos fundamentos a seguir.",
    prazoAviso: "Prazo típico: 15 dias úteis (art. 1.003, §5º, do CPC).",
  },
  {
    id: "cumprimento-alimentos",
    rotulo: "Cumprimento / execução de alimentos",
    descricao:
      "Cobrança de alimentos (rito da Lei 5.478/64 e CPC). Pode haver pedido de prisão civil do devedor. Não é execução de título cível genérica.",
    nomePecaHint: "Cumprimento de sentença de alimentos",
    exigeProcesso: true,
    conectivoPartes:
      "requerendo o cumprimento da obrigação alimentar, pelos fundamentos a seguir.",
    prazoAviso:
      "Intimação para pagar; rito da prisão civil se o pedido for nessa via. O FACTO não conta o prazo.",
  },
  {
    id: "inventario",
    rotulo: "Inventário / arrolamento",
    descricao:
      "Abertura de inventário ou arrolamento (CC e CPC). Inventariante, herdeiros, meeiro, quinhões. Não é petição inicial de cobrança.",
    nomePecaHint: "Inventário / arrolamento",
    exigeProcesso: false,
    conectivoPartes:
      "requerendo a abertura do inventário, pelos fundamentos a seguir.",
    prazoAviso: "Prazo de abertura: 2 meses da abertura da sucessão (art. 611 do CPC), em regra.",
  },
];

type Secao = {
  chave: string;
  titulo: string;
  obrigatoria: boolean;
  opcionalSistema?: boolean;
};

const ESQUELETOS: Record<EspeciePecaFamilia, Secao[]> = {
  "peticao-inicial": [
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
  "cumprimento-alimentos": [
    { chave: "titulo", titulo: "DO TÍTULO E DO DÉBITO ALIMENTAR", obrigatoria: true },
    { chave: "calculo", titulo: "DO CÁLCULO E DA VIA ELEITA", obrigatoria: true },
    {
      chave: "provas",
      titulo: "DAS PROVAS E ANEXOS",
      obrigatoria: false,
      opcionalSistema: true,
    },
    { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
  ],
  inventario: [
    { chave: "obito", titulo: "DO FALECIMENTO E DA ABERTURA DA SUCESSÃO", obrigatoria: true },
    { chave: "herdeiros", titulo: "DOS HERDEIROS, MEEIRO E INVENTARIANTE", obrigatoria: true },
    { chave: "bens", titulo: "DOS BENS E DIREITOS", obrigatoria: true },
    {
      chave: "provas",
      titulo: "DAS PROVAS E ANEXOS",
      obrigatoria: false,
      opcionalSistema: true,
    },
    { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
  ],
};

export function metaEspecieFamilia(id: string): MetaEspecieFamilia {
  return (
    ESPECIES_PECA_FAMILIA.find((e) => e.id === id) ?? ESPECIES_PECA_FAMILIA[0]!
  );
}

export function normalizarEspecieFamilia(
  raw: string | null | undefined
): EspeciePecaFamilia | null {
  if (!raw) return null;
  const id = raw.trim().toLowerCase().replace(/\s+/g, "-");
  const ids: EspeciePecaFamilia[] = [
    "peticao-inicial",
    "contestacao",
    "reconvencao",
    "replica",
    "embargos-declaracao",
    "apelacao",
    "agravo-instrumento",
    "cumprimento-alimentos",
    "inventario",
  ];
  if (ids.includes(id as EspeciePecaFamilia)) return id as EspeciePecaFamilia;
  if (id.includes("invent") || id.includes("arrola")) return "inventario";
  if (id.includes("alimento") || id.includes("cumprimento")) {
    return "cumprimento-alimentos";
  }
  if (id.includes("apela")) return "apelacao";
  if (id.includes("agravo")) return "agravo-instrumento";
  if (id.includes("declara")) return "embargos-declaracao";
  if (id.includes("réplica") || id.includes("replica")) return "replica";
  if (id.includes("reconven")) return "reconvencao";
  if (id.includes("contesta")) return "contestacao";
  if (id.includes("divor") || id.includes("guarda") || id.includes("visita")) {
    return "peticao-inicial";
  }
  return null;
}

export function inferirEspecieFamilia(
  tipoAcao: string,
  fatos?: string,
  especieExplicita?: string | null
): EspeciePecaFamilia {
  const explicita = normalizarEspecieFamilia(especieExplicita);
  if (explicita) return explicita;
  const t = `${tipoAcao ?? ""} ${fatos ?? ""}`.toLowerCase();
  if (/\binvent[aá]rio\b|arrolamento|\bpartilha\b|esp[oó]lio/.test(t)) return "inventario";
  if (/agravo de instrumento/.test(t)) return "agravo-instrumento";
  if (/apela[cç][aã]o/.test(t)) return "apelacao";
  if (/embargos de declara/.test(t)) return "embargos-declaracao";
  if (/r[eé]plica/.test(t)) return "replica";
  if (/reconven/.test(t)) return "reconvencao";
  if (/contesta[cç][aã]o/.test(t)) return "contestacao";
  if (/cumprimento|execu[cç][aã]o.*alimento|pris[aã]o civil/.test(t)) {
    return "cumprimento-alimentos";
  }
  return "peticao-inicial";
}

export function tituloPecaFamilia(
  especie: EspeciePecaFamilia,
  tipoSugerido?: string | null
): string {
  switch (especie) {
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
    case "cumprimento-alimentos":
      return "Cumprimento de Sentença de Alimentos";
    case "inventario":
      return String(tipoSugerido ?? "Inventário").trim() || "Inventário";
    default:
      return String(tipoSugerido ?? "").trim();
  }
}

export function esqueletoPorEspecieFamilia(especie: string): Secao[] {
  return (
    ESQUELETOS[especie as EspeciePecaFamilia] ?? ESQUELETOS["peticao-inicial"]
  );
}

export function blocoEstruturaPromptFamilia(especie: EspeciePecaFamilia): string {
  const meta = metaEspecieFamilia(especie);
  const secoes = ESQUELETOS[especie] ?? ESQUELETOS["peticao-inicial"];
  const linhas = secoes.map((secao, i) => {
    const opt = secao.opcionalSistema
      ? "  (inclua se houver documentos/mídias/link — senão omita e renumere)"
      : "";
    return `   ${ROMANOS[i] ?? i + 1} - ${secao.titulo}${opt}`;
  });

  const extras: string[] = [
    "   Rito: VARA DE FAMÍLIA E SUCESSÕES (CC + CPC). NÃO aplique Lei 9.099/95, CLT nem CDC.",
    "   Segredo de justiça: art. 189, II, do CPC quando a demanda versar sobre casamento, filiação, alimentos, guarda ou similar — peça o segredo no texto se os fatos autorizarem.",
    "   Em alimentos, use alimentante/alimentado no mérito quando couber (além de autor/réu no cabeçalho).",
    "   Honorários: art. 85 do CPC. Interesse de incapaz: Ministério Público (art. 178 do CPC / ECA) se os fatos envolverem criança ou adolescente.",
    "   Não exponha dados sensíveis além do necessário (endereço de criança, dados de saúde).",
    "   Julgado da base contrário ao pedido: não cite como lastro favorável.",
    "   Não invente estado civil, renda extra, horas extras, percentual sobre salário-mínimo nem pagamentos parciais se isso não estiver nos FATOS.",
  ];

  if (especie === "peticao-inicial") {
    extras.push(
      "   Nomeie a ação pelos FATOS: divórcio (consensual ou litigioso), guarda (unilateral/compartilhada), visitas, alimentos, união estável.",
      "   Guarda e visitas: melhor interesse da criança (ECA e CC). Alimentos: necessidade × possibilidade (Lei 5.478/64 e CC)."
    );
  } else if (especie === "cumprimento-alimentos") {
    extras.push(
      "   Distinga via de cobrança (expropriação vs. rito da prisão civil). Só peça prisão se os FATOS e o título autorizarem.",
      "   Não trate como execução de título extrajudicial do módulo Civil."
    );
  } else if (especie === "inventario") {
    extras.push(
      "   Qualifique inventariante, cônjuge/companheiro meeiro e herdeiros. Não invente bens, quinhões nem testamento.",
      "   Arrolamento sumário só se os fatos indicarem acordo e partes capazes."
    );
  } else if (especie === "agravo-instrumento") {
    extras.push(
      "   Cabimento: art. 1.015 do CPC. Endereçamento: Tribunal (Desembargador Presidente), NÃO o juiz da vara.",
      "   Não cite acórdão que indeferiu a mesma medida como se apoiasse o agravo."
    );
  } else if (especie === "apelacao") {
    extras.push("   Arts. 1.009 e 1.003, §5º, do CPC. Não chame de recurso inominado.");
  } else if (especie === "reconvencao") {
    extras.push(
      "   Art. 343 do CPC. Em família, reconvenção é o veículo correto para alimentos/guarda contrapostos — não use pedido contraposto da Lei 9.099/95.",
      "   Pedidos: improcedência da inicial (ou procedência parcial) + procedência da reconvenção + honorários (art. 85 do CPC)."
    );
  }

  return [
    `Espécie da peça: ${meta.rotulo} (${especie}).`,
    "Missão: redigir a peça completa desta espécie no rito de família e sucessões.",
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
