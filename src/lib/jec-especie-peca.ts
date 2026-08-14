/**
 * JEC-1 — Espécies de peça no Juizado Especial Cível.
 * Cada espécie define esqueleto romano (títulos) usado no scaffold,
 * no prompt do Redator e na tipografia.
 */

export type EspeciePecaJec =
  | "peticao-inicial"
  | "contestacao"
  | "embargos"
  | "recurso"
  | "replica"
  | "execucao";

export type ChaveSecaoJec =
  | "fatos"
  | "preliminares"
  | "tempestividade"
  | "historico"
  | "direito"
  | "merito"
  | "razoes"
  | "impugnacao"
  | "titulo"
  | "debito"
  | "medidas"
  | "provas"
  | "valor"
  | "pedidos";

export type SecaoEsqueletoJec = {
  chave: ChaveSecaoJec;
  /** Título sem romano, ex.: "DOS FATOS" */
  titulo: string;
  obrigatoria: boolean;
  /** Se true, o sistema pode injetar/omitir (provas). */
  opcionalSistema?: boolean;
};

export type MetaEspecieJec = {
  id: EspeciePecaJec;
  rotulo: string;
  descricao: string;
  /** Nome forense típico no cabeçalho da peça (pista). */
  nomePecaHint: string;
  exigeProcesso: boolean;
  /** Frase após qualificação do polo passivo. */
  conectivoPartes: string;
};

const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"] as const;

export const ESPECIES_PECA_JEC: MetaEspecieJec[] = [
  {
    id: "peticao-inicial",
    rotulo: "Petição inicial",
    descricao: "Demanda nova no JEC (fatos, direito, valor e pedidos).",
    nomePecaHint: "Ação…",
    exigeProcesso: false,
    conectivoPartes:
      "pelos fatos e fundamentos jurídicos a seguir expostos.",
  },
  {
    id: "contestacao",
    rotulo: "Contestação",
    descricao: "Defesa do réu — preliminares, mérito e pedidos.",
    nomePecaHint: "Contestação",
    exigeProcesso: true,
    conectivoPartes:
      "apresentando a presente contestação, pelos fundamentos a seguir.",
  },
  {
    id: "embargos",
    rotulo: "Embargos",
    descricao: "Embargos à execução / embargos de declaração (estrutura JEC).",
    nomePecaHint: "Embargos…",
    exigeProcesso: true,
    conectivoPartes:
      "opondo os presentes embargos, pelos fundamentos a seguir.",
  },
  {
    id: "recurso",
    rotulo: "Recurso",
    descricao: "Recurso inominado, agravo ou contrarrazões.",
    nomePecaHint: "Recurso inominado…",
    exigeProcesso: true,
    conectivoPartes:
      "interpondo o presente recurso, pelos fundamentos a seguir.",
  },
  {
    id: "replica",
    rotulo: "Réplica",
    descricao: "Impugnação específica à contestação.",
    nomePecaHint: "Réplica",
    exigeProcesso: true,
    conectivoPartes:
      "oferecendo a presente réplica, pelos fundamentos a seguir.",
  },
  {
    id: "execucao",
    rotulo: "Execução / cumprimento",
    descricao: "Cumprimento de sentença ou execução de título no JEC.",
    nomePecaHint: "Cumprimento de sentença / Execução…",
    exigeProcesso: true,
    conectivoPartes:
      "requerendo as medidas executivas cabíveis, pelos fundamentos a seguir.",
  },
];

const ESQUELETOS: Record<EspeciePecaJec, SecaoEsqueletoJec[]> = {
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
  embargos: [
    {
      chave: "tempestividade",
      titulo: "DA TEMPESTIVIDADE E DO CABIMENTO",
      obrigatoria: true,
    },
    { chave: "fatos", titulo: "DOS FATOS", obrigatoria: true },
    { chave: "direito", titulo: "DO DIREITO", obrigatoria: true },
    {
      chave: "provas",
      titulo: "DAS PROVAS E ANEXOS",
      obrigatoria: false,
      opcionalSistema: true,
    },
    { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
  ],
  recurso: [
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
  replica: [
    {
      chave: "tempestividade",
      titulo: "DA TEMPESTIVIDADE",
      obrigatoria: true,
    },
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
  execucao: [
    {
      chave: "titulo",
      titulo: "DO TÍTULO EXECUTIVO",
      obrigatoria: true,
    },
    {
      chave: "debito",
      titulo: "DO DÉBITO E DO CÁLCULO",
      obrigatoria: true,
    },
    {
      chave: "medidas",
      titulo: "DAS MEDIDAS EXECUTIVAS",
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
};

export function metaEspecie(id: EspeciePecaJec): MetaEspecieJec {
  return (
    ESPECIES_PECA_JEC.find((e) => e.id === id) ?? ESPECIES_PECA_JEC[0]!
  );
}

export function esqueletoPorEspecie(id: EspeciePecaJec): SecaoEsqueletoJec[] {
  return ESQUELETOS[id] ?? ESQUELETOS["peticao-inicial"];
}

/** Seções numeradas (pula provas opcionais do sistema — injetadas depois). */
export function secoesNumeradas(
  id: EspeciePecaJec,
  opcoes?: { incluirProvas?: boolean }
): { romano: string; secao: SecaoEsqueletoJec }[] {
  const incluirProvas = opcoes?.incluirProvas ?? false;
  const base = esqueletoPorEspecie(id).filter(
    (s) => incluirProvas || !s.opcionalSistema
  );
  return base.map((secao, i) => ({
    romano: ROMANOS[i] ?? String(i + 1),
    secao,
  }));
}

export function tituloRomano(romano: string, titulo: string): string {
  return `${romano} - ${titulo}`;
}

export function normalizarEspeciePeca(
  raw: string | null | undefined
): EspeciePecaJec | null {
  if (!raw) return null;
  const id = raw.trim().toLowerCase().replace(/\s+/g, "-");
  if (
    id === "peticao-inicial" ||
    id === "contestacao" ||
    id === "embargos" ||
    id === "recurso" ||
    id === "replica" ||
    id === "execucao"
  ) {
    return id;
  }
  // aliases
  if (id === "inicial" || id === "peticao") return "peticao-inicial";
  if (id === "contestação") return "contestacao";
  if (id === "réplica" || id === "replica") return "replica";
  if (id === "execução" || id === "cumprimento") return "execucao";
  return null;
}

/**
 * Nome da peça a protocolar agora — não o nome da ação originária
 * nem o rótulo do arquivo enviado.
 */
export function tituloPecaCabivel(
  especie: EspeciePecaJec,
  tipoSugerido?: string | null,
  contexto?: string | null
): string {
  const blob = `${tipoSugerido ?? ""} ${contexto ?? ""}`.toLowerCase();
  switch (especie) {
    case "embargos":
      if (/à execu|a execu|embargos do devedor/.test(blob)) {
        return "Embargos à Execução";
      }
      return "Embargos de Declaração";
    case "recurso":
      if (/agravo de instrumento/.test(blob)) return "Agravo de Instrumento";
      if (/\bagravo\b/.test(blob)) return "Agravo de Instrumento";
      if (/contrarraz/.test(blob)) return "Contrarrazões ao Recurso Inominado";
      return "Recurso Inominado";
    case "contestacao":
      return "Contestação";
    case "replica":
      return "Réplica";
    case "execucao":
      if (/cumprimento/.test(blob)) return "Cumprimento de Sentença";
      return "Execução de Título Extrajudicial";
    default:
      return String(tipoSugerido ?? "").trim();
  }
}

/**
 * Infere a espécie a partir do nome da ação / fatos.
 * Preferir `especieExplicita` quando o usuário escolheu no formulário.
 */
export function inferirEspeciePeca(
  tipoAcao: string,
  fatos?: string,
  especieExplicita?: string | null
): EspeciePecaJec {
  const explicita = normalizarEspeciePeca(especieExplicita);
  if (explicita) return explicita;

  const t = `${tipoAcao ?? ""} ${fatos ?? ""}`.toLowerCase();

  if (/contrarraz|contrarraz[oõ]es/.test(t) || /recurso inominado|agravo|recurso\b/.test(t)) {
    if (/embargos de declara/.test(t)) return "embargos";
    return "recurso";
  }
  if (/embargos/.test(t)) return "embargos";
  if (/r[eé]plica/.test(t)) return "replica";
  if (/contesta[cç][aã]o/.test(t)) return "contestacao";
  if (
    /cumprimento de senten[cç]a|execu[cç][aã]o de t[ií]tulo|pedido de penhora|\bexecu[cç][aã]o\b/.test(
      t
    )
  ) {
    return "execucao";
  }
  return "peticao-inicial";
}

export function ehPeticaoInicialPorEspecie(especie: EspeciePecaJec): boolean {
  return especie === "peticao-inicial";
}

/** Bloco textual do esqueleto para o system prompt do Redator. */
export function blocoEstruturaPrompt(especie: EspeciePecaJec): string {
  const meta = metaEspecie(especie);
  const secoes = secoesNumeradas(especie, { incluirProvas: true });
  const linhas = secoes.map(({ romano, secao }) => {
    const opt = secao.opcionalSistema
      ? "  (inclua se houver documentos/mídias/link — senão omita e renumere)"
      : "";
    return `   ${romano} - ${secao.titulo}${opt}`;
  });

  const extras: string[] = [];
  if (especie === "peticao-inicial") {
    extras.push(
      "   Em DO DIREITO: subtópicos a)/b)/c) em negrito, cada um em linha própria.",
      "   Em DOS PEDIDOS: a)/b)/c) sem negrito.",
      "   Tutela de urgência e inversão do ônus = subtópicos de DO DIREITO (não romanos separados).",
      "   Sequência: Fatos → Direito → Provas (se houver) → Valor → Pedidos."
    );
  } else if (especie === "contestacao") {
    extras.push(
      "   Em DAS PRELIMINARES: a)/b)/… (inépcia, ilegitimidade, incompetência, etc.) só se cabíveis — não invente.",
      "   No MÉRITO: reescreva a versão fática do réu e rebata o direito do autor com subtópicos.",
      "   Pedidos típicos: acolhimento de preliminares (se houver), improcedência, ônus da sucumbência na forma da Lei 9.099/95."
    );
  } else if (especie === "embargos") {
    extras.push(
      "   Tempestividade/cabimento: arts. aplicáveis (Lei 9.099/95 e/ou CPC conforme a espécie de embargos).",
      "   Não invente número de processo nem datas de intimação — use só o que estiver nos fatos/formulário."
    );
  } else if (especie === "recurso") {
    extras.push(
      "   Abertura: partes já qualificadas nos autos (só nomes); não invente CPF/CNPJ/endereço.",
      "   Histórico: sentença/acórdão recorrido em síntese objetiva.",
      "   Razões: erros de fato/direito com subsunção; pedidos = reforma/anulação + eventual efeito."
    );
  } else if (especie === "replica") {
    extras.push(
      "   Impugnação específica ponto a ponto da contestação; reforce a inicial sem mera repetição integral."
    );
  } else if (especie === "execucao") {
    extras.push(
      "   Título líquido/certo/exigível; discrimine o débito com base nos fatos (sem inventar valores).",
      "   Medidas: penhora, bloqueio, intimação — conforme cabível no JEC."
    );
  }

  return [
    `Espécie da peça: ${meta.rotulo} (${especie}).`,
    `Missão: redigir a peça completa desta espécie (NÃO force estrutura de petição inicial se a espécie for outra).`,
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

/** Textos curtos de reserva para seções que não são “fatos crus”. */
export function paragrafoReservaSecao(
  chave: ChaveSecaoJec,
  fatos: string
): string[] {
  const trecho =
    fatos.trim().slice(0, 400) ||
    "[Descrever conforme os autos e os fatos informados.]";

  switch (chave) {
    case "preliminares":
      return [
        "O(A) contestante impugna, em preliminar, tão somente as matérias efetivamente cabíveis à luz dos autos e da Lei nº 9.099/95, sem criar óbices artificiais.",
        "Caso não haja preliminar relevante nos fatos narrados, passa-se diretamente ao mérito — a análise concreta deve ater-se ao caso.",
      ];
    case "tempestividade":
      return [
        "A presente manifestação é tempestiva e cabível na forma da Lei nº 9.099/95 e da legislação processual pertinente, observando-se o prazo legal a partir da intimação/ciência nos autos.",
        "Requer-se o conhecimento da peça para, ao final, o provimento do pedido.",
      ];
    case "historico":
      return [
        "Em síntese do histórico processual relevante:",
        trecho,
      ];
    case "titulo":
      return [
        "O título executivo que embasa a presente cobrança encontra-se caracterizado nos autos, com os requisitos de certeza, liquidez e exigibilidade, na forma da legislação aplicável ao Juizado Especial Cível.",
      ];
    case "debito":
      return [
        "O débito exequendo corresponde ao quantum descrito nos fatos e documentos, devidamente atualizado, sem prejuízo de planilha complementar a ser juntada quando necessária.",
        trecho,
      ];
    case "medidas":
      return [
        "Requer-se a adoção das medidas executivas cabíveis no rito do Juizado Especial Cível, inclusive intimação para pagamento e, frustrado o adimplemento espontâneo, as constrições patrimoniais pertinentes.",
      ];
    case "impugnacao":
      return [
        "Impugna-se, de forma específica, a contestação apresentada, rebatendo as alegações que divergem da narrativa e dos documentos da inicial:",
        trecho,
      ];
    default:
      return [];
  }
}
