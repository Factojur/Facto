/**
 * Espécies na justiça comum consumerista (CDC + CPC).
 * Não copiar recurso inominado nem sucumbência da Lei 9.099/95.
 */

export type EspeciePecaConsumidor =
  | "peticao-inicial"
  | "contestacao"
  | "reconvencao"
  | "replica"
  | "embargos-declaracao"
  | "apelacao"
  | "agravo-instrumento"
  | "cumprimento-sentenca"
  | "execucao-titulo";

export type MetaEspecieConsumidor = {
  id: EspeciePecaConsumidor;
  rotulo: string;
  descricao: string;
  nomePecaHint: string;
  exigeProcesso: boolean;
  conectivoPartes: string;
  /** Aviso de prazo típico — o FACTO não conta prazo. */
  prazoAviso: string;
};

const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"] as const;

export const ESPECIES_PECA_CONSUMIDOR: MetaEspecieConsumidor[] = [
  {
    id: "peticao-inicial",
    rotulo: "Petição inicial",
    descricao:
      "Demanda nova na justiça comum (CDC + CPC). Honorários e recursos pelo CPC — não use este módulo para Juizado.",
    nomePecaHint: "Ação de… (CDC)",
    exigeProcesso: false,
    conectivoPartes: "pelos fatos e fundamentos jurídicos a seguir expostos.",
    prazoAviso: "Não há prazo de ajuizamento único; observe prescrição do CDC/CC.",
  },
  {
    id: "contestacao",
    rotulo: "Contestação",
    descricao:
      "Defesa do réu no rito comum (art. 335 do CPC). Preliminares, mérito e honorários sucumbenciais. Reconvenção (art. 343) é checkbox na aba Pedidos, não espécie à parte.",
    nomePecaHint: "Contestação",
    exigeProcesso: true,
    conectivoPartes:
      "apresentando a presente contestação, pelos fundamentos a seguir.",
    prazoAviso: "Prazo típico: 15 dias úteis (art. 335 do CPC), salvo regra especial.",
  },
  {
    id: "reconvencao",
    rotulo: "Contestação com reconvenção",
    descricao:
      "Defesa do réu com reconvenção na mesma peça (art. 343 do CPC) em demanda consumerista. O réu (reconvinte) formula pedido próprio contra o autor (reconvindo).",
    nomePecaHint: "Contestação com reconvenção",
    exigeProcesso: true,
    conectivoPartes:
      "apresentando a presente contestação com reconvenção, pelos fundamentos a seguir.",
    prazoAviso: "Prazo típico: o da contestação (art. 343 c/c art. 335 do CPC).",
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

const ESQUELETOS: Record<EspeciePecaConsumidor, Secao[]> = {
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

export function metaEspecieConsumidor(
  id: string
): MetaEspecieConsumidor {
  return (
    ESPECIES_PECA_CONSUMIDOR.find((e) => e.id === id) ??
    ESPECIES_PECA_CONSUMIDOR[0]!
  );
}

export function normalizarEspecieConsumidor(
  raw: string | null | undefined
): EspeciePecaConsumidor | null {
  if (!raw) return null;
  const id = raw.trim().toLowerCase().replace(/\s+/g, "-");
  const ids: EspeciePecaConsumidor[] = [
    "peticao-inicial",
    "contestacao",
    "reconvencao",
    "replica",
    "embargos-declaracao",
    "apelacao",
    "agravo-instrumento",
    "cumprimento-sentenca",
    "execucao-titulo",
  ];
  if (ids.includes(id as EspeciePecaConsumidor)) {
    return id as EspeciePecaConsumidor;
  }
  if (id === "inicial" || id === "peticao") return "peticao-inicial";
  if (id === "contestação") return "contestacao";
  if (id.includes("reconven")) return "reconvencao";
  if (id === "réplica") return "replica";
  if (id === "embargos" || id.includes("declara")) return "embargos-declaracao";
  if (id === "recurso" || id.includes("apela")) return "apelacao";
  if (id.includes("agravo")) return "agravo-instrumento";
  if (id.includes("cumprimento")) return "cumprimento-sentenca";
  if (id.includes("execu")) return "execucao-titulo";
  return null;
}

export function inferirEspecieConsumidor(
  tipoAcao: string,
  fatos?: string,
  especieExplicita?: string | null
): EspeciePecaConsumidor {
  const explicita = normalizarEspecieConsumidor(especieExplicita);
  if (explicita) return explicita;
  const t = `${tipoAcao ?? ""} ${fatos ?? ""}`.toLowerCase();
  if (/agravo de instrumento|\bagravo\b/.test(t)) return "agravo-instrumento";
  if (/apela[cç][aã]o/.test(t)) return "apelacao";
  if (/embargos de declara/.test(t)) return "embargos-declaracao";
  if (/r[eé]plica/.test(t)) return "replica";
  if (/reconven/.test(t)) return "reconvencao";
  if (/contesta[cç][aã]o/.test(t)) return "contestacao";
  if (/cumprimento de senten[cç]a/.test(t)) return "cumprimento-sentenca";
  if (/execu[cç][aã]o/.test(t)) return "execucao-titulo";
  return "peticao-inicial";
}

export function tituloPecaConsumidor(
  especie: EspeciePecaConsumidor,
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
    case "cumprimento-sentenca":
      return "Cumprimento de Sentença";
    case "execucao-titulo":
      return "Execução de Título Extrajudicial";
    default:
      return String(tipoSugerido ?? "").trim();
  }
}

export function blocoEstruturaPromptConsumidor(
  especie: EspeciePecaConsumidor
): string {
  const meta = metaEspecieConsumidor(especie);
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
    "   Rito: JUSTIÇA COMUM (CPC). NÃO aplique Lei 9.099/95, teto de 40/20 SM, recurso inominado nem isenção genérica de sucumbência do Juizado.",
    "   Fundamentação: CDC (relação de consumo) + CPC + Código Civil subsidiário. Honorários: art. 85 do CPC.",
    "   Inversão do ônus da prova: art. 6º, VIII, do CDC — subtópico de DO DIREITO, se cabível.",
    "   Julgado da base cuja ementa contrarie o pedido: não cite como lastro favorável. Não use Lei 9.099 nem Turma Recursal.",
    "   Nomes das partes: copie os FATOS (ex.: BANCO ALFA). Nunca use “instituição financeira” no polo. Não invente CEP (00000-000), CNPJ, endereço da ré, multa diária nem prazo de 10 dias se os FATOS não trouxerem.",
  ];

  if (especie === "peticao-inicial") {
    extras.push(
      "   Tutela de urgência (art. 300 do CPC) = subtópico de DO DIREITO.",
      "   Pedidos: incluem honorários advocatícios sucumbenciais (CPC), custas e CDC (art. 6º, 14, 42, 51 etc. só se o fato autorizar)."
    );
  } else if (especie === "contestacao") {
    extras.push(
      "   Preliminares só se cabíveis (inépcia, ilegitimidade, incompetência, falta de interesse…). Não invente.",
      "   Pedidos: improcedência + honorários sucumbenciais na forma do art. 85 do CPC (não cite 9.099)."
    );
  } else if (especie === "reconvencao") {
    extras.push(
      "   Art. 343 do CPC: reconvenção no prazo da contestação. NÃO use pedido contraposto da Lei 9.099/95 nem Turma Recursal.",
      "   Pedidos: improcedência da inicial (CDC/CPC conforme os fatos) + procedência da reconvenção + honorários (art. 85 do CPC)."
    );
  } else if (especie === "replica") {
    extras.push(
      "   Impugne a contestação com CDC e CPC. Mantenha a relação de consumo e os nomes dos polos dos FATOS (não generalize para “instituição financeira”). Não cite ementa de furto de cartão se os FATOS forem conta/contrato inexistentes."
    );
  } else if (especie === "apelacao") {
    extras.push(
      "   Cabimento e tempestividade: arts. 1.009 e 1.003, §5º, do CPC (15 dias úteis).",
      "   Não chame de recurso inominado. Turma Recursal não é o órgão ad quem."
    );
  } else if (especie === "agravo-instrumento") {
    extras.push(
      "   Cabimento: art. 1.015 do CPC. Protocolo e endereçamento: Tribunal de Justiça (arts. 1.016 e 1.017) — NÃO o juiz da vara.",
      "   Indique a decisão interlocutória e o prejuízo. Não cite acórdão que indeferiu a mesma medida como se apoiasse o agravo."
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
      "   Título do art. 784 do CPC; certeza, liquidez e exigibilidade. Não chame o crédito de alimentar. Não invente SISBAJUD/“teimosinha”. Prazo de pagamento: art. 829 do CPC (3 dias), sem dígitos-emoji."
    );
  }

  return [
    `Espécie da peça: ${meta.rotulo} (${especie}).`,
    "Missão: redigir a peça completa desta espécie no rito da justiça comum consumerista.",
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
