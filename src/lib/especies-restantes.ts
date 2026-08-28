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

/** Petição inaugural sem valor econômico (remédios constitucionais, eleitoral, penal). */
const INICIAL_SEM_VALOR: Secao[] = [
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
      id: "defesa-preliminar",
      rotulo: "Defesa preliminar",
      descricao:
        "Art. 395 do CPP — rejeição da denúncia ou absolvição sumária. Anterior e distinta da resposta à acusação (arts. 396 e 396-A).",
      nomePecaHint: "Defesa preliminar",
      exigeProcesso: true,
      conectivoPartes:
        "apresentando a presente defesa preliminar, pelos fundamentos a seguir.",
      prazoAviso: "Prazo típico: 10 dias (art. 396 do CPP).",
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
    "   Rito: JUSTIÇA PENAL COMUM (CP + CPP). NÃO aplique Lei 9.099/95 (JECRIM), contestação cível, CLT nem CDC.",
    "   Não invente inquérito, denúncia, pena, tipificação nem coação além dos FATOS.",
    "   Resposta à acusação (arts. 396/396-A do CPP) ≠ contestação. Defesa preliminar (art. 395) ≠ resposta — só preliminares de rejeição/absolvição sumária.",
    "   Apelação: art. 593 do CPP (não inominado).",
    "   HC: art. 5º, LXVIII, da CF e arts. 647 e ss. do CPP — endereçamento ao Tribunal.",
    "   Agravo em execução: art. 197 da LEP (não agravo do CPC 1.015). Julgado contrário: não cite como lastro favorável.",
  ],
  (t) => {
    if (/habeas/.test(t)) return "habeas-corpus";
    if (/defesa preliminar|art\.?\s*395/.test(t)) return "defesa-preliminar";
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
    "defesa-preliminar": "Defesa Preliminar",
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
    "defesa-preliminar": [
      {
        chave: "tempestividade",
        titulo: "DA TEMPESTIVIDADE E DO CABIMENTO",
        obrigatoria: true,
      },
      {
        chave: "preliminares",
        titulo: "DAS PRELIMINARES (ART. 395 DO CPP)",
        obrigatoria: true,
      },
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
    "revisao-criminal": [
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
    "embargos-declaracao": ED,
  },
  "resposta-acusacao"
);

export const KIT_PREVIDENCIARIO = kit(
  [
    {
      id: "peticao-inicial",
      rotulo: "Petição inicial previdenciária",
      descricao:
        "Concessão, restabelecimento ou revisão de benefício (Lei 8.213/91). Polo: segurado × INSS.",
      nomePecaHint: "Ação previdenciária",
      exigeProcesso: false,
      conectivoPartes: "pelos fatos e fundamentos jurídicos a seguir expostos.",
      prazoAviso: "Prescrição/decadência previdenciária conforme o benefício dos FATOS.",
    },
    ...metaCpc(
      "Demanda previdenciária ordinária (Lei 8.213/91). Polo: segurado × INSS. JEF ou Vara Federal.",
      "Ação previdenciária"
    ).filter((e) => e.id !== "peticao-inicial"),
  ],
  [
    "   Rito: PREVIDENCIÁRIO (Lei 8.213/91). Polo: segurado/autor × INSS. JEF ou Vara Federal.",
    "   Não invente NB, DIP, RMI, tempo de contribuição, carência nem laudo médico.",
    "   NÃO aplique Lei 9.099 estadual cível, CLT, CDC nem Vara Cível estadual.",
    "   Agravo de instrumento: Tribunal Regional Federal (TRF), não TJ estadual.",
    "   Nomeie o benefício dos FATOS. Julgado contrário ao pedido: não cite como lastro favorável.",
  ],
  (t) => {
    if (/agravo/.test(t)) return "agravo-instrumento";
    if (/apela/.test(t)) return "apelacao";
    if (/contesta/.test(t)) return "contestacao";
    if (/cumprimento/.test(t)) return "cumprimento-sentenca";
    return null;
  },
  { "peticao-inicial": "Ação Previdenciária" },
  { "peticao-inicial": INICIAL },
  "peticao-inicial"
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
    {
      id: "informacoes-ms",
      rotulo: "Informações em mandado de segurança",
      descricao:
        "Resposta da autoridade / ente (art. 7º, I, da Lei 12.016/09). Peça do polo passivo.",
      nomePecaHint: "Informações em mandado de segurança",
      exigeProcesso: true,
      conectivoPartes: "prestando as presentes informações, pelos fundamentos a seguir.",
      prazoAviso: "Prazo do art. 7º da Lei 12.016/09 (em regra 10 dias).",
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
    "   Rito: ADMINISTRATIVO / FAZENDA. MS: Lei 12.016/09 (120 dias, prova pré-constituída). Não invente o ato coator.",
    "   Informações em MS: polo passivo (autoridade/ente). Endereçamento: Vara da Fazenda ou Justiça Federal.",
    "   NÃO aplique Lei 9.099, CLT nem CDC. Agravo federal: TRF. Julgado contrário: não cite como lastro favorável.",
  ],
  (t) => {
    if (/informa[cç].*manda(do)? de seguran|informa[cç][oõ]es em ms/.test(t)) {
      return "informacoes-ms";
    }
    if (/manda(do)? de seguran/.test(t)) return "mandado-seguranca";
    if (/apela/.test(t)) return "apelacao";
    if (/contesta/.test(t)) return "contestacao";
    if (/agravo/.test(t)) return "agravo-instrumento";
    return null;
  },
  {
    "mandado-seguranca": "Mandado de Segurança",
    "informacoes-ms": "Informações em Mandado de Segurança",
  },
  { "mandado-seguranca": INICIAL, "informacoes-ms": DEFESA },
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
    {
      id: "recuperacao-judicial",
      rotulo: "Recuperação judicial (petição)",
      descricao:
        "Lei 11.101/05 — pedido de recuperação judicial. Não invente plano aprovado nem assembleia.",
      nomePecaHint: "Pedido de recuperação judicial",
      exigeProcesso: false,
      conectivoPartes:
        "requerendo o processamento da recuperação judicial, pelos fundamentos a seguir.",
      prazoAviso: "Prazos e stay da Lei 11.101 — não invente datas de assembleia.",
    },
    {
      id: "falencia",
      rotulo: "Falência (pedido / habilitação)",
      descricao:
        "Lei 11.101/05 — pedido de falência ou habilitação de crédito. Não invente decreto de falência.",
      nomePecaHint: "Pedido de falência",
      exigeProcesso: false,
      conectivoPartes:
        "requerendo a decretação da falência / habilitação, pelos fundamentos a seguir.",
      prazoAviso: "Confira se já há processo falimentar instaurado antes de reabrir pedido.",
    },
    ...metaCpc(
      "Dissolução parcial, adimplemento societário, responsabilidade de administrador. Não use JEC.",
      "Ação societária / empresarial"
    ),
  ],
  [
    "   Rito: EMPRESARIAL (CC / Lei 6.404/76 / Lei 11.101/05). Distinga notificação, recuperação, falência e ação ordinária.",
    "   Não invente contrato social, CNPJ, percentual de quotas nem plano de recuperação. NÃO use Lei 9.099 nem CLT.",
    "   Julgado contrário ao pedido: não cite como lastro favorável.",
  ],
  (t) => {
    if (/notifica/.test(t)) return "notificacao-extrajudicial";
    if (/recupera/.test(t)) return "recuperacao-judicial";
    if (/fal[eê]nc/.test(t)) return "falencia";
    if (/apela/.test(t)) return "apelacao";
    if (/contesta/.test(t)) return "contestacao";
    return null;
  },
  {
    "notificacao-extrajudicial": "Notificação Extrajudicial",
    "recuperacao-judicial": "Recuperação Judicial",
    falencia: "Falência",
  },
  {
    "notificacao-extrajudicial": [
      { chave: "fatos", titulo: "DOS FATOS", obrigatoria: true },
      { chave: "objeto", titulo: "DO OBJETO DA NOTIFICAÇÃO", obrigatoria: true },
      { chave: "prazo", titulo: "DO PRAZO E DAS CONSEQUÊNCIAS", obrigatoria: true },
    ],
    "recuperacao-judicial": [
      { chave: "fatos", titulo: "DOS FATOS", obrigatoria: true },
      { chave: "direito", titulo: "DO DIREITO", obrigatoria: true },
      { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
    ],
    falencia: [
      { chave: "fatos", titulo: "DOS FATOS", obrigatoria: true },
      { chave: "direito", titulo: "DO DIREITO", obrigatoria: true },
      { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
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
    "   NÃO use Lei 9.099 nem CLT. Crimes digitais: módulo Penal. Julgado contrário: não cite como lastro favorável.",
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
      id: "mandado-seguranca",
      rotulo: "Mandado de segurança ambiental",
      descricao:
        "Lei 12.016/09 contra ato de autoridade ambiental (licença, embargo, multa). Prova pré-constituída.",
      nomePecaHint: "Mandado de segurança ambiental",
      exigeProcesso: false,
      conectivoPartes: "impetrando o presente mandado de segurança, pelos fundamentos a seguir.",
      prazoAviso: "120 dias (art. 23 da Lei 12.016/09).",
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
    "   MS ambiental: Lei 12.016/09 (120 dias, prova pré-constituída). NÃO use Lei 9.099 nem CLT.",
    "   Julgado contrário: não cite como lastro favorável.",
  ],
  (t) => {
    if (/a[cç][aã]o civil p[uú]blica|\bacp\b/.test(t)) return "acp-ambiental";
    if (/manda(do)? de seguran/.test(t)) return "mandado-seguranca";
    if (/auto de infra[cç]|multa ambiental/.test(t)) return "defesa-infracao";
    if (/apela/.test(t)) return "apelacao";
    return null;
  },
  {
    "acp-ambiental": "Ação Civil Pública Ambiental",
    "mandado-seguranca": "Mandado de Segurança Ambiental",
    "defesa-infracao": "Defesa de Auto de Infração Ambiental",
  },
  {
    "acp-ambiental": INICIAL,
    "mandado-seguranca": INICIAL,
    "defesa-infracao": DEFESA,
  },
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
  [
    "   Rito: PROPRIEDADE INTELECTUAL (LPI / LDA). Não invente registro no INPI.",
    "   NÃO use Lei 9.099 nem CLT. Julgado contrário: não cite como lastro favorável.",
  ],
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
    "   NÃO use Lei 9.099 nem CLT. Julgado contrário: não cite como lastro favorável.",
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
    "   Não invente prontuário, laudo nem conduta da equipe. NÃO use Lei 9.099 nem CLT.",
    "   Julgado contrário: não cite como lastro favorável.",
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
  [
    "   Rito: AGRÁRIO (Estatuto da Terra + CC). Não invente matrícula, área nem ITR.",
    "   NÃO use Lei 9.099 nem CLT. Julgado contrário: não cite como lastro favorável.",
  ],
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
    "   NÃO use Lei 9.099 cível, CLT nem CDC. Fundamente só com o que estiver nos FATOS e na lei.",
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
    representacao: INICIAL_SEM_VALOR,
    aije: INICIAL_SEM_VALOR,
    "registro-candidatura": INICIAL_SEM_VALOR,
    defesa: DEFESA,
    "recurso-eleitoral": RECURSO,
  },
  "representacao"
);

export const KIT_CONSTITUCIONAL = kit(
  [
    // ——— Polo ativo / impetrante / autor / recorrente ———
    {
      id: "mandado-seguranca",
      rotulo: "Mandado de segurança",
      descricao:
        "Polo ativo. CF art. 5º, LXIX + Lei 12.016/09. Direito líquido e certo; prova pré-constituída; autoridade coatora.",
      nomePecaHint: "Mandado de segurança",
      exigeProcesso: false,
      conectivoPartes:
        "impetrando o presente mandado de segurança, pelos fundamentos a seguir.",
      prazoAviso: "120 dias (art. 23 da Lei 12.016/09).",
    },
    {
      id: "habeas-corpus",
      rotulo: "Habeas corpus",
      descricao:
        "Polo ativo. CF art. 5º, LXVIII. Liberdade de locomoção. Distinga do HC tipicamente penal (módulo Penal).",
      nomePecaHint: "Habeas corpus",
      exigeProcesso: false,
      conectivoPartes: "impetrando o presente habeas corpus, pelos fundamentos a seguir.",
      prazoAviso: "Remédio constitucional — sem prazo decadencial típico.",
    },
    {
      id: "habeas-data",
      rotulo: "Habeas data",
      descricao:
        "Polo ativo. CF art. 5º, LXXII + Lei 9.507/97. Acesso ou retificação de dados.",
      nomePecaHint: "Habeas data",
      exigeProcesso: false,
      conectivoPartes: "impetrando o presente habeas data, pelos fundamentos a seguir.",
      prazoAviso: "Lei 9.507/97 — observe o rito e a competência nos FATOS.",
    },
    {
      id: "mandado-injuncao",
      rotulo: "Mandado de injunção",
      descricao:
        "Polo ativo. CF art. 5º, LXXI. Omissão normativa que inviabiliza o exercício de direito constitucional.",
      nomePecaHint: "Mandado de injunção",
      exigeProcesso: false,
      conectivoPartes:
        "impetrando o presente mandado de injunção, pelos fundamentos a seguir.",
      prazoAviso: "Competência conforme a omissão (STF/STJ/TJ) — nos FATOS.",
    },
    {
      id: "acao-popular",
      rotulo: "Ação popular",
      descricao:
        "Polo ativo. CF art. 5º, LXXIII + Lei 4.717/65. Cidadão contra ato lesivo ao patrimônio público / moralidade.",
      nomePecaHint: "Ação popular",
      exigeProcesso: false,
      conectivoPartes: "propondo a presente ação popular, pelos fundamentos a seguir.",
      prazoAviso: "Prescrição quinquenal em regra (Lei 4.717/65) — confira nos FATOS.",
    },
    {
      id: "reclamacao-constitucional",
      rotulo: "Reclamação constitucional",
      descricao:
        "Polo ativo. Preservar autoridade de decisão do STF/STJ ou competência do tribunal. Não invente paradigma.",
      nomePecaHint: "Reclamação",
      exigeProcesso: false,
      conectivoPartes: "oferecendo a presente reclamação, pelos fundamentos a seguir.",
      prazoAviso: "Regimento interno do tribunal — o FACTO não conta o prazo.",
    },
    {
      id: "recurso-extraordinario",
      rotulo: "Recurso extraordinário",
      descricao:
        "Polo ativo (recorrente). CF art. 102, III. Questão constitucional; repercussão geral. Não invente leading case.",
      nomePecaHint: "Recurso extraordinário",
      exigeProcesso: true,
      conectivoPartes:
        "interpondo o presente recurso extraordinário, pelos fundamentos a seguir.",
      prazoAviso: "15 dias úteis em regra (art. 1.003, §5º, do CPC) — confira a intimação.",
    },
    {
      id: "agravo-recurso-extraordinario",
      rotulo: "Agravo em recurso extraordinário",
      descricao:
        "Polo ativo. Agravo contra decisão que inadmite o RE. Endereçamento ao STF.",
      nomePecaHint: "Agravo em recurso extraordinário",
      exigeProcesso: true,
      conectivoPartes: "interpondo o presente agravo, pelos fundamentos a seguir.",
      prazoAviso: "Prazo do art. 1.042 do CPC, em regra.",
    },
    {
      id: "recurso-ordinario-constitucional",
      rotulo: "Recurso ordinário constitucional",
      descricao:
        "Polo ativo. CF arts. 102, II, ou 105, II (ROC ao STF/STJ). Não confundir com RE nem apelação.",
      nomePecaHint: "Recurso ordinário constitucional",
      exigeProcesso: true,
      conectivoPartes:
        "interpondo o presente recurso ordinário, pelos fundamentos a seguir.",
      prazoAviso: "Prazo do CPC/regimento — confira a intimação nos FATOS.",
    },
    {
      id: "adpf",
      rotulo: "ADPF",
      descricao:
        "Polo ativo. Lei 9.882/99. Competência do STF. Só com legitimidade e preceito nos FATOS.",
      nomePecaHint: "ADPF",
      exigeProcesso: false,
      conectivoPartes: "propor a presente ADPF, pelos fundamentos a seguir.",
      prazoAviso: "Controle concentrado — STF.",
    },
    {
      id: "adi",
      rotulo: "ADI",
      descricao:
        "Polo ativo. Lei 9.868/99. Competência do STF. Exige legitimidade ativa nos FATOS.",
      nomePecaHint: "ADI",
      exigeProcesso: false,
      conectivoPartes: "propor a presente ADI, pelos fundamentos a seguir.",
      prazoAviso: "Controle concentrado — STF.",
    },
    {
      id: "adc",
      rotulo: "ADC",
      descricao:
        "Polo ativo. Ação declaratória de constitucionalidade (Lei 9.868/99). Competência do STF.",
      nomePecaHint: "ADC",
      exigeProcesso: false,
      conectivoPartes: "propor a presente ADC, pelos fundamentos a seguir.",
      prazoAviso: "Controle concentrado — STF.",
    },
    {
      id: "ado",
      rotulo: "ADI por omissão (ADO)",
      descricao:
        "Polo ativo. CF art. 103, §2º + Lei 9.868/99. Omissão inconstitucional. Competência do STF.",
      nomePecaHint: "ADI por omissão",
      exigeProcesso: false,
      conectivoPartes: "propor a presente ADI por omissão, pelos fundamentos a seguir.",
      prazoAviso: "Controle concentrado — STF.",
    },
    {
      id: "apelacao",
      rotulo: "Apelação",
      descricao:
        "Polo ativo ou passivo. Apelação em MS (quando cabível) ou demanda constitucional difusa. Art. 1.009 do CPC.",
      nomePecaHint: "Apelação",
      exigeProcesso: true,
      conectivoPartes: "interpondo a presente apelação, pelos fundamentos a seguir.",
      prazoAviso: "15 dias úteis (art. 1.003, §5º, do CPC).",
    },
    {
      id: "agravo-instrumento",
      rotulo: "Agravo de instrumento",
      descricao:
        "Polo ativo ou passivo. Art. 1.015 do CPC em processo constitucional difuso / MS. Não é agravo em RE.",
      nomePecaHint: "Agravo de instrumento",
      exigeProcesso: true,
      conectivoPartes:
        "interpondo o presente agravo de instrumento, pelos fundamentos a seguir.",
      prazoAviso: "15 dias úteis (art. 1.003, §5º, do CPC).",
    },
    {
      id: "agravo-regimental",
      rotulo: "Agravo regimental / interno",
      descricao:
        "Polo ativo ou passivo. Agravo interno no STF/STJ (art. 1.021 do CPC / regimento).",
      nomePecaHint: "Agravo regimental",
      exigeProcesso: true,
      conectivoPartes: "interpondo o presente agravo interno, pelos fundamentos a seguir.",
      prazoAviso: "Prazo regimental / art. 1.021 do CPC — confira a intimação.",
    },
    {
      id: "embargos-declaracao",
      rotulo: "Embargos de declaração",
      descricao: "Polo ativo ou passivo. Art. 1.022 do CPC (ou regimento do tribunal).",
      nomePecaHint: "Embargos de declaração",
      exigeProcesso: true,
      conectivoPartes:
        "opondo os presentes embargos de declaração, pelos fundamentos a seguir.",
      prazoAviso: "5 dias úteis (art. 1.023 do CPC), salvo regimento.",
    },
    {
      id: "memorial",
      rotulo: "Memorial / razões",
      descricao:
        "Polo ativo ou passivo. Memorial ou razões finais em processo constitucional já em curso.",
      nomePecaHint: "Memorial",
      exigeProcesso: true,
      conectivoPartes: "apresentando o presente memorial, pelos fundamentos a seguir.",
      prazoAviso: "Prazo fixado pelo juízo/tribunal nos FATOS.",
    },

    // ——— Polo passivo / autoridade / recorrido / réu ———
    {
      id: "informacoes-ms",
      rotulo: "Informações em mandado de segurança",
      descricao:
        "Polo passivo (autoridade coatora). Art. 7º, I, da Lei 12.016/09. Prestação de informações.",
      nomePecaHint: "Informações em mandado de segurança",
      exigeProcesso: true,
      conectivoPartes:
        "prestando as presentes informações, pelos fundamentos a seguir.",
      prazoAviso: "10 dias em regra (art. 7º, I, da Lei 12.016/09).",
    },
    {
      id: "contestacao-ms",
      rotulo: "Contestação / defesa em MS",
      descricao:
        "Polo passivo (impetrado / litisconsorte). Defesa de mérito no mandado de segurança.",
      nomePecaHint: "Contestação em mandado de segurança",
      exigeProcesso: true,
      conectivoPartes: "apresentando a presente contestação, pelos fundamentos a seguir.",
      prazoAviso: "Prazo da intimação / Lei 12.016/09 — confira nos FATOS.",
    },
    {
      id: "contestacao-habeas-data",
      rotulo: "Contestação em habeas data",
      descricao: "Polo passivo. Defesa do órgão/detentor dos dados (Lei 9.507/97).",
      nomePecaHint: "Contestação em habeas data",
      exigeProcesso: true,
      conectivoPartes: "apresentando a presente contestação, pelos fundamentos a seguir.",
      prazoAviso: "Prazo da Lei 9.507/97 / intimação — nos FATOS.",
    },
    {
      id: "informacoes-mandado-injuncao",
      rotulo: "Informações em mandado de injunção",
      descricao: "Polo passivo. Informações / defesa do órgão omisso.",
      nomePecaHint: "Informações em mandado de injunção",
      exigeProcesso: true,
      conectivoPartes:
        "prestando as presentes informações, pelos fundamentos a seguir.",
      prazoAviso: "Prazo fixado pelo tribunal nos FATOS.",
    },
    {
      id: "contestacao-reclamacao",
      rotulo: "Contestação / impugnação à reclamação",
      descricao: "Polo passivo. Defesa na reclamação constitucional.",
      nomePecaHint: "Impugnação à reclamação",
      exigeProcesso: true,
      conectivoPartes:
        "apresentando a presente impugnação, pelos fundamentos a seguir.",
      prazoAviso: "Prazo regimental / intimação — nos FATOS.",
    },
    {
      id: "contrarrazoes-recurso-extraordinario",
      rotulo: "Contrarrazões ao recurso extraordinário",
      descricao: "Polo passivo (recorrido). Resposta ao RE.",
      nomePecaHint: "Contrarrazões ao RE",
      exigeProcesso: true,
      conectivoPartes:
        "oferecendo as presentes contrarrazões, pelos fundamentos a seguir.",
      prazoAviso: "15 dias úteis em regra (art. 1.003, §5º, do CPC).",
    },
    {
      id: "contestacao-adi",
      rotulo: "Contestação / informações em ADI",
      descricao:
        "Polo passivo / interessado. Informações ou contestação em ADI (Lei 9.868/99). Não invente legitimidade.",
      nomePecaHint: "Informações / contestação em ADI",
      exigeProcesso: true,
      conectivoPartes:
        "prestando as presentes informações, pelos fundamentos a seguir.",
      prazoAviso: "Prazo do STF / Lei 9.868/99 — nos FATOS.",
    },
    {
      id: "contestacao-adpf",
      rotulo: "Contestação / informações em ADPF",
      descricao: "Polo passivo / interessado. Informações ou contestação em ADPF (Lei 9.882/99).",
      nomePecaHint: "Informações / contestação em ADPF",
      exigeProcesso: true,
      conectivoPartes:
        "prestando as presentes informações, pelos fundamentos a seguir.",
      prazoAviso: "Prazo do STF / Lei 9.882/99 — nos FATOS.",
    },
    {
      id: "contestacao-adc",
      rotulo: "Contestação / informações em ADC",
      descricao:
        "Polo passivo / interessado. Informações ou contestação em ADC (Lei 9.868/99).",
      nomePecaHint: "Informações / contestação em ADC",
      exigeProcesso: true,
      conectivoPartes:
        "prestando as presentes informações, pelos fundamentos a seguir.",
      prazoAviso: "Prazo do STF / Lei 9.868/99 — nos FATOS.",
    },
    {
      id: "contestacao-ado",
      rotulo: "Contestação / informações em ADO",
      descricao:
        "Polo passivo / órgão omisso. Informações ou contestação em ADI por omissão (Lei 9.868/99).",
      nomePecaHint: "Informações / contestação em ADO",
      exigeProcesso: true,
      conectivoPartes:
        "prestando as presentes informações, pelos fundamentos a seguir.",
      prazoAviso: "Prazo do STF / Lei 9.868/99 — nos FATOS.",
    },
    {
      id: "contrarrazoes-recurso-ordinario",
      rotulo: "Contrarrazões ao recurso ordinário constitucional",
      descricao: "Polo passivo (recorrido). Resposta ao ROC (CF arts. 102, II / 105, II).",
      nomePecaHint: "Contrarrazões ao ROC",
      exigeProcesso: true,
      conectivoPartes:
        "oferecendo as presentes contrarrazões, pelos fundamentos a seguir.",
      prazoAviso: "15 dias úteis em regra (art. 1.003, §5º, do CPC).",
    },
    {
      id: "contestacao-acao-popular",
      rotulo: "Contestação em ação popular",
      descricao: "Polo passivo. Defesa do ato / agente na ação popular (Lei 4.717/65).",
      nomePecaHint: "Contestação em ação popular",
      exigeProcesso: true,
      conectivoPartes: "apresentando a presente contestação, pelos fundamentos a seguir.",
      prazoAviso: "Art. 335 do CPC, em regra.",
    },
  ],
  [
    "   Rito: CONSTITUCIONAL (CF/88). Remédios: MS (Lei 12.016/09), HC, HD (Lei 9.507/97), MI, ação popular (Lei 4.717/65).",
    "   Controle concentrado (ADI/ADC/ADO/ADPF): só STF; não invente legitimidade, preceito nem lei impugnada.",
    "   RE / agravo em RE / ROC / reclamação: não invente paradigma, tema de repercussão geral nem acórdão.",
    "   Polo passivo: informações em MS (art. 7º, I, Lei 12.016/09), contrarrazões ao RE/ROC, contestações e impugnações — use a espécie correta.",
    "   Distinga: MS de ato administrativo sem ênfase constitucional → módulo Administrativo; HC tipicamente penal → módulo Penal.",
    "   NÃO use Lei 9.099, CLT nem CDC como rito. Honorários: art. 85 do CPC quando couber.",
    "   Julgado da base contrário ao pedido: não cite como lastro favorável.",
  ],
  (t) => {
    if (
      /contrarraz.*ordin[aá]rio|ordin[aá]rio.*contrarraz|contrarraz.*\broc\b/.test(t)
    ) {
      return "contrarrazoes-recurso-ordinario";
    }
    if (/contrarraz|contra-raz|contrarrazo/.test(t)) {
      return "contrarrazoes-recurso-extraordinario";
    }
    if (/informa[cç].*manda(do)? de seguran|manda(do)? de seguran.*informa/.test(t)) {
      return "informacoes-ms";
    }
    if (/contesta.*manda(do)? de seguran|defesa.*manda(do)? de seguran/.test(t)) {
      return "contestacao-ms";
    }
    if (/contesta.*habeas.?data|habeas.?data.*contesta/.test(t)) {
      return "contestacao-habeas-data";
    }
    if (/informa[cç].*injun|injun.*informa/.test(t)) {
      return "informacoes-mandado-injuncao";
    }
    if (/impugna.*reclama|contesta.*reclama|reclama.*contesta/.test(t)) {
      return "contestacao-reclamacao";
    }
    if (/informa[cç].*\badi\b|contesta.*\badi\b|\badi\b.*informa/.test(t)) {
      return "contestacao-adi";
    }
    if (/informa[cç].*\badpf\b|contesta.*\badpf\b|\badpf\b.*informa/.test(t)) {
      return "contestacao-adpf";
    }
    if (/informa[cç].*\badc\b|contesta.*\badc\b|\badc\b.*informa/.test(t)) {
      return "contestacao-adc";
    }
    if (
      /informa[cç].*\bado\b|contesta.*\bado\b|\bado\b.*informa|informa[cç].*omiss|omiss.*informa/.test(
        t
      )
    ) {
      return "contestacao-ado";
    }
    if (/contesta.*a[cç][aã]o popular|a[cç][aã]o popular.*contesta/.test(t)) {
      return "contestacao-acao-popular";
    }
    if (/\bado\b|inconstitucionalidade por omiss|adi por omiss/.test(t)) return "ado";
    if (/\badc\b|declarat[oó]ria de constitucionalidade/.test(t)) return "adc";
    if (/\badi\b|a[cç][aã]o direta de inconstitucionalidade/.test(t)) return "adi";
    if (/\badpf\b|argui[cç][aã]o de descumprimento/.test(t)) return "adpf";
    if (/a[cç][aã]o popular|lei 4\.717/.test(t)) return "acao-popular";
    if (/habeas.?data|\bhd\b/.test(t)) return "habeas-data";
    if (/injun[cç][aã]o/.test(t)) return "mandado-injuncao";
    if (/reclama[cç][aã]o/.test(t)) return "reclamacao-constitucional";
    if (/agravo.*extraordin[aá]rio|extraordin[aá]rio.*agravo/.test(t)) {
      return "agravo-recurso-extraordinario";
    }
    if (/recurso ordin[aá]rio constitucional|\broc\b/.test(t)) {
      return "recurso-ordinario-constitucional";
    }
    if (/recurso extraordin[aá]rio|\bre\b/.test(t)) return "recurso-extraordinario";
    if (/agravo (regimental|interno)/.test(t)) return "agravo-regimental";
    if (/agravo de instrumento|agravo-instrumento/.test(t)) return "agravo-instrumento";
    if (/habeas.?corpus|\bhc\b/.test(t)) return "habeas-corpus";
    if (/manda(do)? de seguran/.test(t)) return "mandado-seguranca";
    if (/embargos? de declara/.test(t)) return "embargos-declaracao";
    if (/apela/.test(t)) return "apelacao";
    if (/memorial|raz[oõ]es finais/.test(t)) return "memorial";
    return null;
  },
  {
    "mandado-seguranca": "Mandado de Segurança",
    "habeas-corpus": "Habeas Corpus",
    "habeas-data": "Habeas Data",
    "mandado-injuncao": "Mandado de Injunção",
    "acao-popular": "Ação Popular",
    "reclamacao-constitucional": "Reclamação",
    "recurso-extraordinario": "Recurso Extraordinário",
    "agravo-recurso-extraordinario": "Agravo em Recurso Extraordinário",
    "recurso-ordinario-constitucional": "Recurso Ordinário Constitucional",
    adpf: "ADPF",
    adi: "ADI",
    adc: "ADC",
    ado: "ADI por Omissão",
    apelacao: "Apelação",
    "agravo-instrumento": "Agravo de Instrumento",
    "agravo-regimental": "Agravo Regimental",
    "embargos-declaracao": "Embargos de Declaração",
    memorial: "Memorial",
    "informacoes-ms": "Informações em Mandado de Segurança",
    "contestacao-ms": "Contestação em Mandado de Segurança",
    "contestacao-habeas-data": "Contestação em Habeas Data",
    "informacoes-mandado-injuncao": "Informações em Mandado de Injunção",
    "contestacao-reclamacao": "Impugnação à Reclamação",
    "contrarrazoes-recurso-extraordinario": "Contrarrazões ao RE",
    "contestacao-adi": "Informações / Contestação em ADI",
    "contestacao-adpf": "Informações / Contestação em ADPF",
    "contestacao-adc": "Informações / Contestação em ADC",
    "contestacao-ado": "Informações / Contestação em ADO",
    "contrarrazoes-recurso-ordinario": "Contrarrazões ao ROC",
    "contestacao-acao-popular": "Contestação em Ação Popular",
  },
  {
    "mandado-seguranca": INICIAL,
    "habeas-corpus": [
      { chave: "cabimento", titulo: "DO CABIMENTO", obrigatoria: true },
      { chave: "fatos", titulo: "DOS FATOS", obrigatoria: true },
      { chave: "direito", titulo: "DO DIREITO", obrigatoria: true },
      { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
    ],
    "habeas-data": INICIAL_SEM_VALOR,
    "mandado-injuncao": INICIAL_SEM_VALOR,
    "acao-popular": INICIAL_SEM_VALOR,
    "reclamacao-constitucional": INICIAL_SEM_VALOR,
    "recurso-extraordinario": RECURSO,
    "agravo-recurso-extraordinario": RECURSO,
    "recurso-ordinario-constitucional": RECURSO,
    adpf: INICIAL_SEM_VALOR,
    adi: INICIAL_SEM_VALOR,
    adc: INICIAL_SEM_VALOR,
    ado: INICIAL_SEM_VALOR,
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
    "agravo-regimental": RECURSO,
    "embargos-declaracao": ED,
    memorial: [
      { chave: "sintese", titulo: "DA SÍNTESE PROCESSUAL", obrigatoria: true },
      { chave: "direito", titulo: "DO DIREITO", obrigatoria: true },
      { chave: "pedidos", titulo: "DOS PEDIDOS", obrigatoria: true },
    ],
    "informacoes-ms": DEFESA,
    "contestacao-ms": DEFESA,
    "contestacao-habeas-data": DEFESA,
    "informacoes-mandado-injuncao": DEFESA,
    "contestacao-reclamacao": DEFESA,
    "contrarrazoes-recurso-extraordinario": RECURSO,
    "contestacao-adi": DEFESA,
    "contestacao-adpf": DEFESA,
    "contestacao-adc": DEFESA,
    "contestacao-ado": DEFESA,
    "contrarrazoes-recurso-ordinario": RECURSO,
    "contestacao-acao-popular": DEFESA,
  },
  "mandado-seguranca"
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
  constitucional: KIT_CONSTITUCIONAL,
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

export function esqueletoKit(areaId: string, especie: string): Secao[] {
  const k = kitDaArea(areaId);
  if (!k) return INICIAL;
  return k.esqueletos[especie] ?? INICIAL;
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
