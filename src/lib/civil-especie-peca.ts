/**
 * Espécies na justiça comum cível (Código Civil + CPC).
 * Não copiar Juizado (9.099) nem inverter ônus do CDC — isso é o módulo Consumidor.
 */

export type EspeciePecaCivil =
  | "peticao-inicial"
  | "contestacao"
  | "replica"
  | "embargos-declaracao"
  | "apelacao"
  | "agravo-instrumento"
  | "cumprimento-sentenca"
  | "execucao-titulo";

export type MetaEspecieCivil = {
  id: EspeciePecaCivil;
  rotulo: string;
  descricao: string;
  nomePecaHint: string;
  exigeProcesso: boolean;
  conectivoPartes: string;
  /** Aviso de prazo típico — o FACTO não conta prazo. */
  prazoAviso: string;
};

const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"] as const;

export const ESPECIES_PECA_CIVIL: MetaEspecieCivil[] = [
  {
    id: "peticao-inicial",
    rotulo: "Petição inicial",
    descricao:
      "Demanda nova na justiça comum (Código Civil + CPC): cobrança, indenização, obrigação de fazer/não fazer. Não use este módulo para Juizado nem para relação de consumo (CDC).",
    nomePecaHint: "Ação de… (Código Civil)",
    exigeProcesso: false,
    conectivoPartes: "pelos fatos e fundamentos jurídicos a seguir expostos.",
    prazoAviso: "Observe a prescrição do Código Civil (em regra arts. 205 e 206).",
  },
  {
    id: "contestacao",
    rotulo: "Contestação",
    descricao:
      "Defesa do réu no rito comum (art. 335 do CPC). Preliminares, mérito e honorários sucumbenciais.",
    nomePecaHint: "Contestação",
    exigeProcesso: true,
    conectivoPartes:
      "apresentando a presente contestação, pelos fundamentos a seguir.",
    prazoAviso: "Prazo típico: 15 dias úteis (art. 335 do CPC), salvo regra especial.",
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
    descricao:
      "Omissão, contradição, obscuridade ou erro material (art. 1.022 do CPC). Não confundir com embargos à execução.",
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
      "Recurso contra sentença na justiça comum (art. 1.009 do CPC). Não é recurso inominado do Juizado.",
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
      "Recurso contra decisão interlocutória nas hipóteses do art. 1.015 do CPC (ex.: tutela).",
    nomePecaHint: "Agravo de instrumento",
    exigeProcesso: true,
    conectivoPartes:
      "interpondo o presente agravo de instrumento, pelos fundamentos a seguir.",
    prazoAviso: "Prazo típico: 15 dias úteis (art. 1.003, §5º, do CPC).",
  },
  {
    id: "cumprimento-sentenca",
    rotulo: "Cumprimento de sentença",
    descricao:
      "Execução de título judicial (arts. 513 e seguintes do CPC).",
    nomePecaHint: "Cumprimento de sentença",
    exigeProcesso: true,
    conectivoPartes:
      "requerendo o cumprimento da sentença, pelos fundamentos a seguir.",
    prazoAviso: "Intimação para pagar em 15 dias (art. 523 do CPC), em regra.",
  },
  {
    id: "execucao-titulo",
    rotulo: "Execução de título extrajudicial",
    descricao:
      "Cobrança de título do art. 784 do CPC na justiça comum (não é execução do Juizado).",
    nomePecaHint: "Execução de título extrajudicial",
    exigeProcesso: false,
    conectivoPartes:
      "promovendo a presente execução, pelos fundamentos a seguir.",
    prazoAviso: "Prescrição da pretensão executiva conforme o título.",
  },
];

type Secao = {
  chave: string;
  titulo: string;
  obrigatoria: boolean;
  opcionalSistema?: boolean;
};

const ESQUELETOS: Record<EspeciePecaCivil, Secao[]> = {
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
  replica: [
    { chave: "tempestividade", titulo: "DA TEMPESTIVIDADE", obrigatoria: true },
    {
      chave: "impugnacao",
      titulo: "DA IMPUGNAÇÃO ESPECÍFICA",
      obrigatoria: true,
    },
    {
      chave: "direito",
      titulo: "DO REFORÇO DA INICIAL E DO DIREITO",
      obrigatoria: true,
    },
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
      titulo: "DA DECISÃO AGRAVADA",
      obrigatoria: true,
    },
    {
      chave: "razoes",
      titulo: "DAS RAZÕES DO AGRAVO",
      obrigatoria: true,
    },
    { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
  ],
  "cumprimento-sentenca": [
    { chave: "titulo", titulo: "DO TÍTULO JUDICIAL", obrigatoria: true },
    { chave: "debito", titulo: "DO DÉBITO E DO CÁLCULO", obrigatoria: true },
    { chave: "medidas", titulo: "DAS MEDIDAS EXECUTIVAS", obrigatoria: true },
    {
      chave: "provas",
      titulo: "DAS PROVAS E ANEXOS",
      obrigatoria: false,
      opcionalSistema: true,
    },
    { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
  ],
  "execucao-titulo": [
    { chave: "titulo", titulo: "DO TÍTULO EXTRAJUDICIAL", obrigatoria: true },
    { chave: "debito", titulo: "DO DÉBITO E DO CÁLCULO", obrigatoria: true },
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

export function metaEspecieCivil(
  id: string
): MetaEspecieCivil {
  return (
    ESPECIES_PECA_CIVIL.find((e) => e.id === id) ??
    ESPECIES_PECA_CIVIL[0]!
  );
}

export function normalizarEspecieCivil(
  raw: string | null | undefined
): EspeciePecaCivil | null {
  if (!raw) return null;
  const id = raw.trim().toLowerCase().replace(/\s+/g, "-");
  const ids: EspeciePecaCivil[] = [
    "peticao-inicial",
    "contestacao",
    "replica",
    "embargos-declaracao",
    "apelacao",
    "agravo-instrumento",
    "cumprimento-sentenca",
    "execucao-titulo",
  ];
  if (ids.includes(id as EspeciePecaCivil)) {
    return id as EspeciePecaCivil;
  }
  if (id === "inicial" || id === "peticao") return "peticao-inicial";
  if (id === "contestação") return "contestacao";
  if (id === "réplica") return "replica";
  if (id === "embargos" || id.includes("declara")) return "embargos-declaracao";
  if (id === "recurso" || id.includes("apela")) return "apelacao";
  if (id.includes("agravo")) return "agravo-instrumento";
  if (id.includes("cumprimento")) return "cumprimento-sentenca";
  if (id.includes("execu")) return "execucao-titulo";
  return null;
}

export function inferirEspecieCivil(
  tipoAcao: string,
  fatos?: string,
  especieExplicita?: string | null
): EspeciePecaCivil {
  const explicita = normalizarEspecieCivil(especieExplicita);
  if (explicita) return explicita;
  const t = `${tipoAcao ?? ""} ${fatos ?? ""}`.toLowerCase();
  if (/agravo de instrumento|\bagravo\b/.test(t)) return "agravo-instrumento";
  if (/apela[cç][aã]o/.test(t)) return "apelacao";
  if (/embargos de declara/.test(t)) return "embargos-declaracao";
  if (/r[eé]plica/.test(t)) return "replica";
  if (/contesta[cç][aã]o/.test(t)) return "contestacao";
  if (/cumprimento de senten[cç]a/.test(t)) return "cumprimento-sentenca";
  if (/execu[cç][aã]o/.test(t)) return "execucao-titulo";
  return "peticao-inicial";
}

export function tituloPecaCivil(
  especie: EspeciePecaCivil,
  tipoSugerido?: string | null
): string {
  switch (especie) {
    case "contestacao":
      return "Contestação";
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
    case "execucao-titulo":
      return "Execução de Título Extrajudicial";
    default:
      return String(tipoSugerido ?? "").trim();
  }
}

export function blocoEstruturaPromptCivil(
  especie: EspeciePecaCivil
): string {
  const meta = metaEspecieCivil(especie);
  const secoes = (ESQUELETOS[especie] ?? ESQUELETOS["peticao-inicial"]).filter(
    (s) => true
  );
  const linhas = secoes.map((secao, i) => {
    const opt = secao.opcionalSistema
      ? "  (inclua se houver documentos/mídias/link — senão omita e renumere)"
      : "";
    return `   ${ROMANOS[i] ?? i + 1} - ${secao.titulo}${opt}`;
  });

  const extras: string[] = [
    "   Rito: JUSTIÇA COMUM (CPC). NÃO aplique Lei 9.099/95, teto de 40/20 SM, recurso inominado nem Turma Recursal.",
    "   Fundamentação: Código Civil (obrigações, responsabilidade, contratos entre particulares) + CPC. Honorários: art. 85 do CPC.",
    "   NÃO trate como relação de consumo (CDC, inversão do art. 6º, VIII) — se o caso for consumerista, o módulo correto é Direito do Consumidor.",
    "   Ônus da prova: regra geral do art. 373 do CPC (autor quanto ao fato constitutivo), salvo inversão pontual do §1º se os fatos autorizarem — não invente hipossuficiência de consumo.",
  ];

  if (especie === "peticao-inicial") {
    extras.push(
      "   Tutela de urgência (art. 300 do CPC) = subtópico de DO DIREITO.",
      "   Pedidos: pretensão principal (cobrança, indenização CC arts. 186/927, obrigação de fazer etc.) + honorários sucumbenciais (CPC) + custas. Sem artigos do CDC."
    );
  } else if (especie === "contestacao") {
    extras.push(
      "   Preliminares só se cabíveis (inépcia, ilegitimidade, incompetência, falta de interesse…). Não invente.",
      "   Pedidos: improcedência + honorários sucumbenciais na forma do art. 85 do CPC (não cite 9.099)."
    );
  } else if (especie === "apelacao") {
    extras.push(
      "   Cabimento e tempestividade: arts. 1.009 e 1.003, §5º, do CPC (15 dias úteis).",
      "   Não chame de recurso inominado. Turma Recursal não é o órgão ad quem."
    );
  } else if (especie === "agravo-instrumento") {
    extras.push(
      "   Cabimento: art. 1.015 do CPC. Indique a decisão interlocutória e o prejuízo."
    );
  } else if (especie === "embargos-declaracao") {
    extras.push(
      "   Arts. 1.022 e 1.023 do CPC. Não transforme em apelação disfarçada."
    );
  } else if (especie === "cumprimento-sentenca") {
    extras.push(
      "   Arts. 513 e 523 do CPC. Multa de 10% e honorários do cumprimento se cabíveis."
    );
  } else if (especie === "execucao-titulo") {
    extras.push(
      "   Título do art. 784 do CPC; certeza, liquidez e exigibilidade."
    );
  }

  return [
    `Espécie da peça: ${meta.rotulo} (${especie}).`,
    "Missão: redigir a peça completa desta espécie no rito da justiça comum cível (Código Civil + CPC).",
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
