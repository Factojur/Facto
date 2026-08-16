/**
 * Espécies das áreas abertas após o JECRIM.
 * Cada área tem extras de rito; o CPC compartilhado não vira contestação no Penal.
 */

export type MetaEspecieLivre = {
  id: string;
  rotulo: string;
  descricao: string;
  nomePecaHint: string;
  exigeProcesso: boolean;
  conectivoPartes: string;
  prazoAviso: string;
};

const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"] as const;

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

const DEFESA: Secao[] = [
  { chave: "preliminares", titulo: "DAS PRELIMINARES", obrigatoria: true },
  { chave: "merito", titulo: "DO MÉRITO — DOS FATOS E DO DIREITO", obrigatoria: true },
  {
    chave: "provas",
    titulo: "DAS PROVAS E ANEXOS",
    obrigatoria: false,
    opcionalSistema: true,
  },
  { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
];

const RECURSO: Secao[] = [
  {
    chave: "tempestividade",
    titulo: "DA TEMPESTIVIDADE E DO CABIMENTO",
    obrigatoria: true,
  },
  { chave: "historico", titulo: "DO HISTÓRICO PROCESSUAL", obrigatoria: true },
  { chave: "razoes", titulo: "DAS RAZÕES DE REFORMA", obrigatoria: true },
  { chave: "pedidos", titulo: "DOS PEDIDOS RECURSAIS", obrigatoria: true },
];

const ED: Secao[] = [
  {
    chave: "tempestividade",
    titulo: "DA TEMPESTIVIDADE E DO CABIMENTO",
    obrigatoria: true,
  },
  { chave: "omissao", titulo: "DOS VÍCIOS DO JULGADO", obrigatoria: true },
  { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
];

function metaCpc(
  inicialDesc: string,
  hint: string,
  extras: MetaEspecieLivre[] = []
): MetaEspecieLivre[] {
  return [
    {
      id: "peticao-inicial",
      rotulo: "Petição inicial",
      descricao: inicialDesc,
      nomePecaHint: hint,
      exigeProcesso: false,
      conectivoPartes: "pelos fatos e fundamentos jurídicos a seguir expostos.",
      prazoAviso: "Prescrição/decadência do direito material — o FACTO não conta o prazo.",
    },
    {
      id: "contestacao",
      rotulo: "Contestação",
      descricao: "Defesa no rito comum (art. 335 do CPC), adaptada ao direito material da área.",
      nomePecaHint: "Contestação",
      exigeProcesso: true,
      conectivoPartes: "apresentando a presente contestação, pelos fundamentos a seguir.",
      prazoAviso: "Prazo típico: 15 dias úteis (art. 335 do CPC), salvo regra especial.",
    },
    {
      id: "replica",
      rotulo: "Réplica",
      descricao: "Art. 351 do CPC.",
      nomePecaHint: "Réplica",
      exigeProcesso: true,
      conectivoPartes: "oferecendo a presente réplica, pelos fundamentos a seguir.",
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
      descricao: "Art. 1.009 do CPC. Não é recurso inominado.",
      nomePecaHint: "Apelação",
      exigeProcesso: true,
      conectivoPartes: "interpondo a presente apelação, pelos fundamentos a seguir.",
      prazoAviso: "Prazo típico: 15 dias úteis (art. 1.003, §5º, do CPC).",
    },
    {
      id: "agravo-instrumento",
      rotulo: "Agravo de instrumento",
      descricao: "Art. 1.015 do CPC.",
      nomePecaHint: "Agravo de instrumento",
      exigeProcesso: true,
      conectivoPartes:
        "interpondo o presente agravo de instrumento, pelos fundamentos a seguir.",
      prazoAviso: "Prazo típico: 15 dias úteis (art. 1.003, §5º, do CPC).",
    },
    {
      id: "cumprimento-sentenca",
      rotulo: "Cumprimento de sentença",
      descricao: "Arts. 513 e seguintes do CPC.",
      nomePecaHint: "Cumprimento de sentença",
      exigeProcesso: true,
      conectivoPartes: "requerendo o cumprimento da sentença, pelos fundamentos a seguir.",
      prazoAviso: "Art. 523 do CPC, em regra.",
    },
    ...extras,
  ];
}

export type KitArea = {
  especies: MetaEspecieLivre[];
  esqueletos: Record<string, Secao[]>;
  extrasBloco: string[];
  defaultId: string;
  inferir: (t: string) => string | null;
  titulos: Record<string, string>;
};

function kit(
  especies: MetaEspecieLivre[],
  extrasBloco: string[],
  inferir: (t: string) => string | null,
  titulos: Record<string, string>,
  esqExtra: Record<string, Secao[]> = {},
  defaultId?: string
): KitArea {
  const esqueletos: Record<string, Secao[]> = {
    "peticao-inicial": INICIAL,
    contestacao: DEFESA,
    replica: [
      { chave: "tempestividade", titulo: "DA TEMPESTIVIDADE", obrigatoria: true },
      { chave: "impugnacao", titulo: "DA IMPUGNAÇÃO ESPECÍFICA", obrigatoria: true },
      { chave: "direito", titulo: "DO DIREITO", obrigatoria: true },
      { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
    ],
    "embargos-declaracao": ED,
    apelacao: RECURSO,
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
    ...esqExtra,
  };
  return {
    especies,
    esqueletos,
    extrasBloco,
    defaultId: defaultId ?? especies[0]!.id,
    inferir,
    titulos,
  };
}

export const KIT_CRIMINAL = kit(
  [
    {
      id: "habeas-corpus",
      rotulo: "Habeas corpus",
      descricao:
        "Remédio constitucional (art. 5º, LXVIII, da CF; arts. 647 e ss. do CPP). Não é mandado de segurança nem JECRIM.",
      nomePecaHint: "Habeas corpus",
      exigeProcesso: false,
      conectivoPartes: "impetrando o presente habeas corpus, pelos fundamentos a seguir.",
      prazoAviso: "Não há prazo decadencial típico — a coação deve estar nos FATOS.",
    },
    {
      id: "resposta-acusacao",
      rotulo: "Resposta à acusação",
      descricao:
        "Arts. 396 e 396-A do CPP. NÃO é contestação cível nem defesa do JECRIM.",
      nomePecaHint: "Resposta à acusação",
      exigeProcesso: true,
      conectivoPartes: "oferecendo a resposta à acusação, pelos fundamentos a seguir.",
      prazoAviso: "Prazo típico: 10 dias (art. 396 do CPP).",
    },
    {
      id: "alegacoes-finais",
      rotulo: "Alegações finais / memoriais",
      descricao: "Memoriais no rito comum (art. 403, §3º, do CPP) ou debates.",
      nomePecaHint: "Alegações finais",
      exigeProcesso: true,
      conectivoPartes: "oferecendo as presentes alegações finais, pelos fundamentos a seguir.",
      prazoAviso: "Prazo do despacho ou da audiência — o FACTO não conta o prazo.",
    },
    {
      id: "apelacao",
      rotulo: "Apelação criminal",
      descricao: "Art. 593 do CPP. Não é apelação cível nem recurso inominado.",
      nomePecaHint: "Apelação criminal",
      exigeProcesso: true,
      conectivoPartes: "interpondo a presente apelação, pelos fundamentos a seguir.",
      prazoAviso: "Prazo típico: 5 dias (art. 593 do CPP), salvo regra especial.",
    },
    {
      id: "recurso-sentido-estrito",
      rotulo: "Recurso em sentido estrito",
      descricao: "Art. 581 do CPP (hipóteses taxativas).",
      nomePecaHint: "Recurso em sentido estrito",
      exigeProcesso: true,
      conectivoPartes:
        "interpondo o presente recurso em sentido estrito, pelos fundamentos a seguir.",
      prazoAviso: "Prazo típico: 5 dias (art. 586 do CPP).",
    },
    {
      id: "agravo-execucao",
      rotulo: "Agravo em execução",
      descricao: "Art. 197 da LEP. Não é agravo de instrumento do CPC.",
      nomePecaHint: "Agravo em execução",
      exigeProcesso: true,
      conectivoPartes: "interpondo o presente agravo em execução, pelos fundamentos a seguir.",
      prazoAviso: "Prazo típico: 5 dias (art. 197 da LEP).",
    },
    {
      id: "revisao-criminal",
      rotulo: "Revisão criminal",
      descricao: "Arts. 621 e ss. do CPP. Não é apelação.",
      nomePecaHint: "Revisão criminal",
      exigeProcesso: false,
      conectivoPartes: "requerendo a revisão criminal, pelos fundamentos a seguir.",
      prazoAviso: "Cabimento do art. 621 do CPP — o FACTO não rejulga prova inexistente nos FATOS.",
    },
    {
      id: "embargos-declaracao",
      rotulo: "Embargos de declaração",
      descricao: "Art. 619 do CPP / art. 382 no júri, conforme o caso.",
      nomePecaHint: "Embargos de declaração",
      exigeProcesso: true,
      conectivoPartes:
        "opondo os presentes embargos de declaração, pelos fundamentos a seguir.",
      prazoAviso: "Prazo típico: 2 dias no CPP, salvo regra especial.",
    },
  ],
  [
    "   Rito: JUSTIÇA PENAL COMUM (CP + CPP). NÃO aplique Lei 9.099/95, contestação cível nem CLT.",
    "   Não invente inquérito, denúncia, pena nem tipificação além dos FATOS.",
  ],
  (t) => {
    if (/habeas/.test(t)) return "habeas-corpus";
    if (/resposta [aà] acusa|396-a/.test(t)) return "resposta-acusacao";
    if (/revis[aã]o criminal/.test(t)) return "revisao-criminal";
    if (/agravo em execu/.test(t) || /l\.?e\.?p/.test(t)) return "agravo-execucao";
    if (/sentido estrito|\brse\b/.test(t)) return "recurso-sentido-estrito";
    if (/apela/.test(t)) return "apelacao";
    if (/alega[cç]|memorial/.test(t)) return "alegacoes-finais";
    if (/declara/.test(t)) return "embargos-declaracao";
    return null;
  },
  {
    "habeas-corpus": "Habeas Corpus",
    "resposta-acusacao": "Resposta à Acusação",
    "alegacoes-finais": "Alegações Finais",
    apelacao: "Apelação Criminal",
    "recurso-sentido-estrito": "Recurso em Sentido Estrito",
    "agravo-execucao": "Agravo em Execução",
    "revisao-criminal": "Revisão Criminal",
    "embargos-declaracao": "Embargos de Declaração",
  },
  {
    "habeas-corpus": [
      { chave: "paciente", titulo: "DO PACIENTE E DA AUTORIDADE COATORA", obrigatoria: true },
      { chave: "coacao", titulo: "DA COAÇÃO ILEGAL", obrigatoria: true },
      { chave: "direito", titulo: "DO DIREITO", obrigatoria: true },
      { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
    ],
    "resposta-acusacao": DEFESA,
    "alegacoes-finais": [
      { chave: "historico", titulo: "DO HISTÓRICO PROCESSUAL", obrigatoria: true },
      { chave: "prova", titulo: "DA PROVA", obrigatoria: true },
      { chave: "direito", titulo: "DO DIREITO", obrigatoria: true },
      { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
    ],
    apelacao: RECURSO,
    "recurso-sentido-estrito": RECURSO,
    "agravo-execucao": RECURSO,
    "revisao-criminal": INICIAL,
    "embargos-declaracao": ED,
  },
  "resposta-acusacao"
);

export const KIT_PREVIDENCIARIO = kit(
  metaCpc(
    "Concessão, restabelecimento ou revisão de benefício (Lei 8.213/91). Polo: segurado × INSS. JEF ou Vara Federal.",
    "Ação previdenciária"
  ),
  [
    "   Rito: PREVIDENCIÁRIO (Lei 8.213/91). Não invente NB, DIP, RMI nem tempo de contribuição.",
    "   Endereçamento: Juizado Especial Federal ou Vara Federal. NÃO use Lei 9.099 estadual cível.",
  ],
  (t) => {
    if (/agravo/.test(t)) return "agravo-instrumento";
    if (/apela/.test(t)) return "apelacao";
    if (/contesta/.test(t)) return "contestacao";
    if (/cumprimento/.test(t)) return "cumprimento-sentenca";
    return null;
  },
  {}
);

export const KIT_TRIBUTARIO = kit(
  [
    {
      id: "embargos-execucao-fiscal",
      rotulo: "Embargos à execução fiscal",
      descricao: "Art. 16 da Lei 6.830/80. Não são embargos de declaração nem embargos à execução cível genérica.",
      nomePecaHint: "Embargos à execução fiscal",
      exigeProcesso: true,
      conectivoPartes: "opondo os presentes embargos à execução fiscal, pelos fundamentos a seguir.",
      prazoAviso: "Prazo típico: 30 dias (art. 16 da LEF), após garantia.",
    },
    {
      id: "excecao-pre-executividade",
      rotulo: "Exceção de pré-executividade",
      descricao: "Matéria de ordem pública com prova pré-constituída, sem garantia da penhora.",
      nomePecaHint: "Exceção de pré-executividade",
      exigeProcesso: true,
      conectivoPartes: "oferecendo a exceção de pré-executividade, pelos fundamentos a seguir.",
      prazoAviso: "Não substitui embargos quando a matéria exige dilação probatória.",
    },
    {
      id: "peticao-inicial",
      rotulo: "Ação anulatória / repetição de indébito",
      descricao: "Anulação de lançamento ou repetição (CTN). Distinta da execução fiscal.",
      nomePecaHint: "Ação anulatória / repetição",
      exigeProcesso: false,
      conectivoPartes: "pelos fatos e fundamentos jurídicos a seguir expostos.",
      prazoAviso: "Decadência/prescrição tributária (CTN) — o FACTO não conta o prazo.",
    },
    {
      id: "mandado-seguranca",
      rotulo: "Mandado de segurança tributário",
      descricao: "Lei 12.016/09 em matéria tributária. Prova pré-constituída.",
      nomePecaHint: "Mandado de segurança",
      exigeProcesso: false,
      conectivoPartes: "impetrando o presente mandado de segurança, pelos fundamentos a seguir.",
      prazoAviso: "120 dias (art. 23 da Lei 12.016/09).",
    },
    {
      id: "contestacao",
      rotulo: "Contestação",
      descricao: "Defesa em ação tributária (rito CPC).",
      nomePecaHint: "Contestação",
      exigeProcesso: true,
      conectivoPartes: "apresentando a presente contestação, pelos fundamentos a seguir.",
      prazoAviso: "Art. 335 do CPC, em regra.",
    },
    {
      id: "apelacao",
      rotulo: "Apelação",
      descricao: "Art. 1.009 do CPC.",
      nomePecaHint: "Apelação",
      exigeProcesso: true,
      conectivoPartes: "interpondo a presente apelação, pelos fundamentos a seguir.",
      prazoAviso: "15 dias úteis (art. 1.003, §5º, do CPC).",
    },
    {
      id: "embargos-declaracao",
      rotulo: "Embargos de declaração",
      descricao: "Art. 1.022 do CPC. Não confundir com embargos à execução fiscal.",
      nomePecaHint: "Embargos de declaração",
      exigeProcesso: true,
      conectivoPartes: "opondo os presentes embargos de declaração, pelos fundamentos a seguir.",
      prazoAviso: "5 dias úteis (art. 1.023 do CPC).",
    },
  ],
  [
    "   Rito: TRIBUTÁRIO (CTN + LEF). Embargos à execução fiscal ≠ embargos de declaração.",
    "   NÃO aplique Lei 9.099, CDC, CLT nem execução de título entre particulares.",
    "   Embargos à EF: art. 16 da LEF (prazo e garantia). EPE: só ordem pública + prova pré-constituída.",
    "   MS: Lei 12.016/09, 120 dias; não transforme MS em embargos à execução.",
    "   Honorários: art. 85 do CPC. Julgado da base contrário ao pedido: não cite como lastro favorável.",
    "   Não troque o ente credor dos FATOS (Município ≠ Estado ≠ União / PGFN). Não invente CDA, valor, prescrição quinquenal nem efeito suspensivo se os FATOS não trouxerem.",
  ],
  (t) => {
    if (/pr[eé]-executividade|pr[eé] executividade|\bepe\b/.test(t)) {
      return "excecao-pre-executividade";
    }
    if (/embargos [aà] execu[cç][aã]o fiscal|lei 6\.830/.test(t)) {
      return "embargos-execucao-fiscal";
    }
    if (/manda(do)? de seguran/.test(t)) return "mandado-seguranca";
    if (/apela/.test(t)) return "apelacao";
    if (/declara/.test(t)) return "embargos-declaracao";
    if (/contesta/.test(t)) return "contestacao";
    return null;
  },
  {
    "embargos-execucao-fiscal": "Embargos à Execução Fiscal",
    "excecao-pre-executividade": "Exceção de Pré-Executividade",
    "mandado-seguranca": "Mandado de Segurança",
    apelacao: "Apelação",
    contestacao: "Contestação",
    "embargos-declaracao": "Embargos de Declaração",
  },
  {
    "embargos-execucao-fiscal": DEFESA,
    "excecao-pre-executividade": DEFESA,
    "mandado-seguranca": INICIAL,
    "peticao-inicial": INICIAL,
    contestacao: DEFESA,
    apelacao: RECURSO,
    "embargos-declaracao": ED,
  },
  "embargos-execucao-fiscal"
);

export const KIT_ADMINISTRATIVO = kit(
  [
    {
      id: "mandado-seguranca",
      rotulo: "Mandado de segurança",
      descricao: "Lei 12.016/09. Direito líquido e certo, prova pré-constituída, autoridade coatora.",
      nomePecaHint: "Mandado de segurança",
      exigeProcesso: false,
      conectivoPartes: "impetrando o presente mandado de segurança, pelos fundamentos a seguir.",
      prazoAviso: "120 dias (art. 23 da Lei 12.016/09).",
    },
    ...metaCpc(
      "Ação contra a Fazenda (anulação de ato, licitação, servidor). Não use para MS (há espécie própria).",
      "Ação contra a Fazenda"
    ).filter((e) => e.id !== "peticao-inicial"),
    {
      id: "peticao-inicial",
      rotulo: "Petição inicial (Fazenda)",
      descricao: "Demanda ordinária contra a Administração, quando não couber MS.",
      nomePecaHint: "Ação anulatória / ordinária",
      exigeProcesso: false,
      conectivoPartes: "pelos fatos e fundamentos jurídicos a seguir expostos.",
      prazoAviso: "Prazos de prescrição contra a Fazenda (Decreto 20.910/32 em regra).",
    },
  ],
  [
    "   Rito: ADMINISTRATIVO / FAZENDA. MS: Lei 12.016/09. Não invente o ato coator.",
    "   Endereçamento: Vara da Fazenda Pública ou Justiça Federal, conforme o ente.",
  ],
  (t) => {
    if (/manda(do)? de seguran/.test(t)) return "mandado-seguranca";
    if (/apela/.test(t)) return "apelacao";
    if (/contesta/.test(t)) return "contestacao";
    if (/agravo/.test(t)) return "agravo-instrumento";
    return null;
  },
  { "mandado-seguranca": "Mandado de Segurança" },
  { "mandado-seguranca": INICIAL },
  "mandado-seguranca"
);

export const KIT_EMPRESARIAL = kit(
  [
    {
      id: "notificacao-extrajudicial",
      rotulo: "Notificação extrajudicial",
      descricao: "Constituição em mora / ciência, sem ação. Não é petição inicial.",
      nomePecaHint: "Notificação extrajudicial",
      exigeProcesso: false,
      conectivoPartes: "pelo que NOTIFICA, nos termos a seguir.",
      prazoAviso: "Prazo da notificação é o que as partes/FATOS fixarem.",
    },
    ...metaCpc(
      "Dissolução parcial, adimplemento societário, responsabilidade de administrador. Não use JEC.",
      "Ação societária / empresarial"
    ),
  ],
  [
    "   Rito: EMPRESARIAL (CC / Lei 6.404/76). Distinga notificação de ação judicial.",
    "   Não invente contrato social, CNPJ nem percentual de quotas.",
  ],
  (t) => {
    if (/notifica/.test(t)) return "notificacao-extrajudicial";
    if (/apela/.test(t)) return "apelacao";
    if (/contesta/.test(t)) return "contestacao";
    return null;
  },
  { "notificacao-extrajudicial": "Notificação Extrajudicial" },
  {
    "notificacao-extrajudicial": [
      { chave: "fatos", titulo: "DOS FATOS", obrigatoria: true },
      { chave: "objeto", titulo: "DO OBJETO DA NOTIFICAÇÃO", obrigatoria: true },
      { chave: "prazo", titulo: "DO PRAZO E DAS CONSEQUÊNCIAS", obrigatoria: true },
    ],
  },
  "peticao-inicial"
);

export const KIT_DIGITAL = kit(
  metaCpc(
    "LGPD, exclusão de dados, tutelas digitais cíveis. Crimes digitais graves: módulo Penal.",
    "Ação (LGPD / digital)"
  ),
  [
    "   Rito: DIGITAL / LGPD (Lei 13.709/18 + CPC). Não invente incidente na ANPD.",
    "   Não use este módulo para tipificar crime (CP) — isso é Penal.",
  ],
  (t) => {
    if (/apela/.test(t)) return "apelacao";
    if (/contesta/.test(t)) return "contestacao";
    return null;
  },
  {}
);

export const KIT_AMBIENTAL = kit(
  [
    {
      id: "acp-ambiental",
      rotulo: "Ação civil pública ambiental",
      descricao: "Lei 7.347/85 e Lei 6.938/81. Polo ativo típico: MP, associação, ente público.",
      nomePecaHint: "Ação civil pública ambiental",
      exigeProcesso: false,
      conectivoPartes: "pelos fatos e fundamentos jurídicos a seguir expostos.",
      prazoAviso: "Imprescritibilidade do dano ambiental permanente, conforme a tese aplicável.",
    },
    {
      id: "defesa-infracao",
      rotulo: "Defesa de auto de infração ambiental",
      descricao: "Impugnação administrativa ou judicial do auto. Não invente o auto.",
      nomePecaHint: "Defesa de auto de infração",
      exigeProcesso: false,
      conectivoPartes: "apresentando a presente defesa, pelos fundamentos a seguir.",
      prazoAviso: "Prazo do auto ou da lei do ente — o FACTO não conta o prazo.",
    },
    ...metaCpc("Demanda ambiental ordinária (obrigação de fazer, TAC judicializado).", "Ação ambiental"),
  ],
  [
    "   Rito: AMBIENTAL. Não invente auto de infração, TAC, licença nem área degradada.",
  ],
  (t) => {
    if (/a[cç][aã]o civil p[uú]blica|\bacp\b/.test(t)) return "acp-ambiental";
    if (/auto de infra[cç]|multa ambiental/.test(t)) return "defesa-infracao";
    if (/apela/.test(t)) return "apelacao";
    return null;
  },
  {
    "acp-ambiental": "Ação Civil Pública Ambiental",
    "defesa-infracao": "Defesa de Auto de Infração Ambiental",
  },
  { "acp-ambiental": INICIAL, "defesa-infracao": DEFESA },
  "acp-ambiental"
);

export const KIT_PI = kit(
  [
    {
      id: "abstencao-marca",
      rotulo: "Abstenção / contrafação",
      descricao: "Cessação de uso de marca/patente/obra + perdas e danos (LPI / LDA).",
      nomePecaHint: "Ação de abstenção de uso",
      exigeProcesso: false,
      conectivoPartes: "pelos fatos e fundamentos jurídicos a seguir expostos.",
      prazoAviso: "Prescrição do art. 225 da LPI, quando marca/patente.",
    },
    ...metaCpc(
      "Nulidade de registro, indenização autoral. Não invente número INPI.",
      "Ação de propriedade intelectual"
    ),
  ],
  ["   Rito: PROPRIEDADE INTELECTUAL (LPI / LDA). Não invente registro no INPI."],
  (t) => {
    if (/absten|contrafa[cç]|marca/.test(t)) return "abstencao-marca";
    if (/apela/.test(t)) return "apelacao";
    return null;
  },
  { "abstencao-marca": "Ação de Abstenção de Uso c/c Perdas e Danos" },
  { "abstencao-marca": INICIAL },
  "abstencao-marca"
);

export const KIT_INTERNACIONAL = kit(
  [
    {
      id: "homologacao",
      rotulo: "Homologação de sentença estrangeira",
      descricao: "Competência do STJ (art. 105, I, i, da CF). Não é ação cível estadual.",
      nomePecaHint: "Homologação de sentença estrangeira",
      exigeProcesso: false,
      conectivoPartes: "requerendo a homologação, pelos fundamentos a seguir.",
      prazoAviso: "Requisitos da Resolução STJ n. 9/2005 e do CPC — não invente a sentença.",
    },
    ...metaCpc(
      "Contrato internacional ou cooperação, quando não for homologação no STJ.",
      "Ação (internacional)"
    ),
  ],
  [
    "   Homologação: enderece ao STJ. Não invente tratado, apostila nem teor da sentença estrangeira.",
  ],
  (t) => {
    if (/homologa|senten[cç]a estrangeira/.test(t)) return "homologacao";
    if (/apela/.test(t)) return "apelacao";
    return null;
  },
  { homologacao: "Homologação de Sentença Estrangeira" },
  { homologacao: INICIAL },
  "homologacao"
);

export const KIT_MEDICO = kit(
  metaCpc(
    "Erro médico (CC) ou, se for só cobertura de plano, indique CDC nos FATOS. Não invente prontuário.",
    "Ação de responsabilidade médica / saúde"
  ),
  [
    "   Rito: MÉDICO. Distinga erro médico (CC) de negativa de cobertura (CDC).",
    "   Não invente prontuário, laudo nem conduta da equipe.",
  ],
  (t) => {
    if (/apela/.test(t)) return "apelacao";
    if (/contesta/.test(t)) return "contestacao";
    return null;
  },
  {}
);

export const KIT_AGRARIO = kit(
  metaCpc(
    "Contratos agrários, crédito rural, regularização. Não invente matrícula rural nem ITR.",
    "Ação agrária"
  ),
  ["   Rito: AGRÁRIO (Estatuto da Terra + CC). Não invente matrícula, área nem ITR."],
  (t) => {
    if (/apela/.test(t)) return "apelacao";
    if (/contesta/.test(t)) return "contestacao";
    return null;
  },
  {}
);

export const KIT_ELEITORAL = kit(
  [
    {
      id: "representacao",
      rotulo: "Representação eleitoral",
      descricao: "Propaganda, condutas vedadas etc. (Lei 9.504/97). Não invente zona/TRE.",
      nomePecaHint: "Representação eleitoral",
      exigeProcesso: false,
      conectivoPartes: "oferecendo a presente representação, pelos fundamentos a seguir.",
      prazoAviso: "Prazos eleitorais são fatais — o FACTO não conta o prazo.",
    },
    {
      id: "aije",
      rotulo: "AIJE",
      descricao: "Ação de investigação judicial eleitoral (abuso de poder).",
      nomePecaHint: "AIJE",
      exigeProcesso: false,
      conectivoPartes: "propondo a presente AIJE, pelos fundamentos a seguir.",
      prazoAviso: "Prazos da legislação eleitoral — o FACTO não conta o prazo.",
    },
    {
      id: "registro-candidatura",
      rotulo: "Impugnação / pedido de registro",
      descricao: "Registro de candidatura (Lei 9.504/97).",
      nomePecaHint: "Registro / impugnação de candidatura",
      exigeProcesso: false,
      conectivoPartes: "pelo que requer, nos termos a seguir.",
      prazoAviso: "Calendário eleitoral do TSE — o FACTO não conta o prazo.",
    },
    {
      id: "defesa",
      rotulo: "Defesa eleitoral",
      descricao: "Resposta em representação, AIJE ou impugnação de registro.",
      nomePecaHint: "Defesa",
      exigeProcesso: true,
      conectivoPartes: "apresentando a presente defesa, pelos fundamentos a seguir.",
      prazoAviso: "Prazo da citação/notificação eleitoral — o FACTO não conta o prazo.",
    },
    {
      id: "recurso-eleitoral",
      rotulo: "Recurso eleitoral",
      descricao: "Recurso ao TRE/TSE conforme a decisão. Não invente julgado (API sem TRE/TSE).",
      nomePecaHint: "Recurso eleitoral",
      exigeProcesso: true,
      conectivoPartes: "interpondo o presente recurso, pelos fundamentos a seguir.",
      prazoAviso: "Prazos próprios da legislação eleitoral (em regra 3 dias em várias hipóteses).",
    },
  ],
  [
    "   Rito: ELEITORAL. NÃO invente acórdão de TRE/TSE (a base FACTO não indexa esses tribunais).",
    "   Endereçamento: Juiz Eleitoral da zona ou Tribunal Regional Eleitoral, conforme a espécie.",
  ],
  (t) => {
    if (/\baije\b|investiga[cç][aã]o judicial eleitoral/.test(t)) return "aije";
    if (/registro|candidat/.test(t)) return "registro-candidatura";
    if (/recurso/.test(t)) return "recurso-eleitoral";
    if (/defesa/.test(t)) return "defesa";
    if (/representa|propaganda/.test(t)) return "representacao";
    return null;
  },
  {
    representacao: "Representação Eleitoral",
    aije: "Ação de Investigação Judicial Eleitoral",
    "registro-candidatura": "Registro / Impugnação de Candidatura",
    defesa: "Defesa",
    "recurso-eleitoral": "Recurso Eleitoral",
  },
  {
    representacao: INICIAL,
    aije: INICIAL,
    "registro-candidatura": INICIAL,
    defesa: DEFESA,
    "recurso-eleitoral": RECURSO,
  },
  "representacao"
);

export const KITS_AREA: Record<string, KitArea> = {
  criminal: KIT_CRIMINAL,
  previdenciario: KIT_PREVIDENCIARIO,
  tributario: KIT_TRIBUTARIO,
  administrativo: KIT_ADMINISTRATIVO,
  empresarial: KIT_EMPRESARIAL,
  digital: KIT_DIGITAL,
  ambiental: KIT_AMBIENTAL,
  "propriedade-intelectual": KIT_PI,
  internacional: KIT_INTERNACIONAL,
  medico: KIT_MEDICO,
  agrario: KIT_AGRARIO,
  eleitoral: KIT_ELEITORAL,
};

export function kitDaArea(areaId: string): KitArea | null {
  return KITS_AREA[areaId] ?? null;
}

export function metaEspecieKit(areaId: string, id: string): MetaEspecieLivre {
  const k = kitDaArea(areaId);
  if (!k) {
    return {
      id: "peticao-inicial",
      rotulo: "Petição",
      descricao: "",
      nomePecaHint: "",
      exigeProcesso: false,
      conectivoPartes: "",
      prazoAviso: "",
    };
  }
  return k.especies.find((e) => e.id === id) ?? k.especies[0]!;
}

export function inferirEspecieKit(
  areaId: string,
  tipoAcao: string,
  fatos?: string,
  especieExplicita?: string | null
): string {
  const k = kitDaArea(areaId);
  if (!k) return "peticao-inicial";
  const raw = String(especieExplicita ?? "").trim().toLowerCase().replace(/\s+/g, "-");
  if (raw && k.especies.some((e) => e.id === raw)) return raw;
  const t = `${tipoAcao ?? ""} ${fatos ?? ""}`.toLowerCase();
  return k.inferir(t) ?? k.defaultId;
}

export function tituloPecaKit(
  areaId: string,
  especie: string,
  tipoSugerido?: string | null
): string {
  const k = kitDaArea(areaId);
  if (!k) return String(tipoSugerido ?? "").trim();
  if (k.titulos[especie]) return k.titulos[especie]!;
  const meta = k.especies.find((e) => e.id === especie);
  if (especie === "peticao-inicial") return String(tipoSugerido ?? "").trim();
  return meta?.rotulo ?? String(tipoSugerido ?? "").trim();
}

export function blocoEstruturaKit(areaId: string, especie: string): string {
  const k = kitDaArea(areaId);
  if (!k) return "";
  const meta = metaEspecieKit(areaId, especie);
  const secoes = k.esqueletos[especie] ?? INICIAL;
  const linhas = secoes.map((secao, i) => {
    const opt = secao.opcionalSistema
      ? "  (inclua se houver documentos/mídias/link — senão omita e renumere)"
      : "";
    return `   ${ROMANOS[i] ?? i + 1} - ${secao.titulo}${opt}`;
  });
  return [
    `Espécie da peça: ${meta.rotulo} (${especie}).`,
    "Missão: redigir a peça completa desta espécie no rito da área.",
    "",
    "ESTRUTURA OBRIGATÓRIA (algarismos romanos):",
    "",
    ...linhas,
    "",
    ...k.extrasBloco,
    "",
    "REGRA: NÃO invente tópicos romanos fora dessa lista. NÃO use títulos Markdown (#, ##).",
    "Deixe linha em branco (\\n\\n) APENAS ao iniciar tópico romano ou subtópico a)/b)/c).",
  ].join("\n");
}
