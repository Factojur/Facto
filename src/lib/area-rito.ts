/**
 * Copy de rito por área — prompts, foro e classificação.
 * Evita ternários gigantes em cada arquivo de IA.
 */

export type AreaRitoCopy = {
  ritoCurto: string;
  nomePeca: string;
  especieHint: string;
  ritoLinha: string;
  especialidade: string;
  foroAssistente: string;
  tipoAcaoDefault: string;
  classificador: string;
  nomenclaturaUser: string;
};

const JSON_FMT = [
  "Responda SOMENTE com JSON válido (sem markdown), neste formato:",
  "{",
  '  "tipoAcao": "<nome forense completo>",',
  '  "tutelaUrgencia": true|false,',
  '  "danosMorais": true|false,',
  '  "danosMateriais": true|false,',
  '  "justificativa": "<texto>"',
  "}",
].join("\n");

function classif(titulo: string, regras: string[]): string {
  return [titulo, "", "REGRAS DE NOMENCLATURA:", ...regras.map((r) => `- ${r}`), "", JSON_FMT].join(
    "\n"
  );
}

const TABELA: Record<string, AreaRitoCopy> = {
  jec: {
    ritoCurto: "juizados especiais cíveis brasileiros (Lei 9.099/95).",
    nomePeca:
      'Nome técnico da peça/ação cabível no JEC (SEM prefixo "Petição Inicial —"; só o nome forense)',
    especieHint:
      "5. Indique a espécie da peça (petição inicial, contestação, embargos, recurso, réplica ou execução);",
    ritoLinha:
      "Atue no Juizado Especial Cível brasileiro (Lei 9.099/95). Recurso da sentença: inominado (arts. 41–42, prazo de 10 dias — não acrescente “úteis” por conta própria). NÃO trate esta demanda como apelação do CPC. Julgado da base que for apelação da justiça comum: use só a tese, sem dizer que este processo é apelação.",
    especialidade: "contencioso cível e direito do consumidor",
    foroAssistente: "no Juizado Especial Cível",
    tipoAcaoDefault: "Ação de Indenização por Danos Materiais e Morais",
    nomenclaturaUser:
      "Com base nos fatos (e em busca geral sobre nomenclatura forense no JEC, se disponível),",
    classificador: classif(
      "Você é o Assistente Facto, paralegal especialista em Juizado Especial Cível brasileiro (Lei 9.099/95).",
      [
        'Use o formato: "Ação de [NOME] c/c [Cúmulos] (JEC)" — SEM prefixo "Petição Inicial".',
        "Golpe/fraude/PIX → indenização, NÃO execução de título.",
      ]
    ),
  },
  consumidor: {
    ritoCurto:
      "justiça comum consumerista (CDC e CPC). NÃO use Lei 9.099/95 nem recurso inominado.",
    nomePeca:
      "Nome técnico da peça na justiça comum (apelação, contestação, cumprimento etc. — NÃO recurso inominado)",
    especieHint:
      "5. Indique a espécie (petição inicial, contestação, réplica, apelação, agravo, cumprimento ou execução);",
    ritoLinha:
      "Atue na justiça comum brasileira em demanda de consumo (CDC + CPC). NÃO aplique Lei 9.099/95, teto do Juizado, recurso inominado nem Turma Recursal. Honorários: art. 85 do CPC.",
    especialidade: "direito do consumidor na justiça comum (CDC e CPC)",
    foroAssistente: "na justiça comum consumerista (CDC e CPC)",
    tipoAcaoDefault: "Ação de Indenização por Danos Materiais e Morais",
    nomenclaturaUser:
      "Com base nos fatos (nomenclatura consumerista na justiça comum / CDC+CPC, se disponível),",
    classificador: classif(
      "Você é o Assistente Facto, paralegal especialista em direito do consumidor na justiça comum (CDC e CPC).",
      ["SEM (JEC). NÃO use Lei 9.099/95 nem recurso inominado."]
    ),
  },
  civil: {
    ritoCurto:
      "justiça comum cível (Código Civil e CPC). NÃO use Lei 9.099/95, recurso inominado nem CDC como tese principal.",
    nomePeca:
      "Nome técnico da peça na justiça comum (apelação, contestação, cumprimento etc. — NÃO recurso inominado)",
    especieHint:
      "5. Indique a espécie (petição inicial, contestação, réplica, apelação, agravo, cumprimento ou execução);",
    ritoLinha:
      "Atue na justiça comum cível (Código Civil + CPC). NÃO aplique Lei 9.099/95 nem recurso inominado. NÃO fundamente em CDC como tese principal. Honorários: art. 85 do CPC.",
    especialidade:
      "contencioso cível (obrigações, responsabilidade civil, contratos entre particulares)",
    foroAssistente: "na justiça comum cível (Código Civil e CPC)",
    tipoAcaoDefault: "Ação de Indenização por Danos Materiais e Morais",
    nomenclaturaUser:
      "Com base nos fatos (nomenclatura da justiça comum cível / CPC, se disponível),",
    classificador: classif(
      "Você é o Assistente Facto, paralegal especialista em contencioso cível na justiça comum (Código Civil e CPC).",
      ["SEM (JEC). Sem CDC como tese principal — consumo é o módulo Consumidor."]
    ),
  },
  trabalhista: {
    ritoCurto: "Justiça do Trabalho (CLT). NÃO use Lei 9.099/95, apelação do CPC nem CDC.",
    nomePeca:
      "Nome técnico da peça na JT (reclamação, defesa, recurso ordinário, agravo de petição — NÃO apelação nem contestação cível)",
    especieHint:
      "5. Indique a espécie (reclamação, defesa, manifestação, embargos, recurso ordinário, agravo ou execução);",
    ritoLinha:
      "Atue na Justiça do Trabalho (CLT). Polos: reclamante e reclamado. Recurso da sentença: ordinário (art. 895 da CLT, 8 dias). Honorários: art. 791-A da CLT. Endereçamento: Juiz do Trabalho.",
    especialidade: "Direito do Trabalho e processo do trabalho (CLT, TST)",
    foroAssistente: "na Justiça do Trabalho (CLT)",
    tipoAcaoDefault: "Reclamação Trabalhista",
    nomenclaturaUser:
      "Com base nos fatos (nomenclatura da Justiça do Trabalho / CLT, se disponível),",
    classificador: classif(
      "Você é o Assistente Facto, paralegal especialista em Direito do Trabalho (CLT).",
      ["Reclamação trabalhista. SEM apelação/contestação cível. Polos: reclamante e reclamado."]
    ),
  },
  familia: {
    ritoCurto:
      "Vara de Família e Sucessões (CC, CPC, ECA, Lei 5.478/64). NÃO use 9.099 nem CLT. Segredo de justiça quando couber.",
    nomePeca:
      "Nome técnico da peça de família (divórcio, guarda, alimentos, inventário, apelação — NÃO recurso inominado)",
    especieHint:
      "5. Indique a espécie (inicial de família, contestação, apelação, cumprimento de alimentos ou inventário);",
    ritoLinha:
      "Atue na Vara de Família e Sucessões. Peça segredo de justiça (art. 189 do CPC) quando couber. Honorários: art. 85 do CPC.",
    especialidade: "Direito de Família e Sucessões",
    foroAssistente: "na Vara de Família e Sucessões",
    tipoAcaoDefault: "Ação de Alimentos",
    nomenclaturaUser:
      "Com base nos fatos (nomenclatura de família e sucessões, se disponível),",
    classificador: classif(
      "Você é o Assistente Facto, paralegal especialista em Direito de Família e Sucessões.",
      ["SEM (JEC). Segredo de justiça quando couber."]
    ),
  },
  imobiliario: {
    ritoCurto:
      "contencioso imobiliário (Lei 8.245/91, CC, condomínio, CPC). NÃO use 9.099 nem CLT.",
    nomePeca:
      "Nome técnico da peça imobiliária (despejo, usucapião, consignação, condomínio, apelação — NÃO recurso inominado)",
    especieHint:
      "5. Indique a espécie (despejo, usucapião, consignação, condomínio, contestação, apelação ou cumprimento);",
    ritoLinha:
      "Atue no contencioso imobiliário (Lei 8.245/91, CC, condomínio e CPC). Despejo ≠ cobrança cível. Honorários: art. 85 do CPC. Endereçamento: Vara Cível.",
    especialidade: "Direito Imobiliário (locação, usucapião, condomínio)",
    foroAssistente: "no contencioso imobiliário (Lei 8.245/91 e CC)",
    tipoAcaoDefault: "Ação de Despejo",
    nomenclaturaUser:
      "Com base nos fatos (nomenclatura imobiliária / locação / usucapião, se disponível),",
    classificador: classif(
      "Você é o Assistente Facto, paralegal especialista em Direito Imobiliário.",
      ["Não chame despejo de cobrança genérica. SEM 9.099."]
    ),
  },
  jecr: {
    ritoCurto:
      "Juizado Especial Criminal (Lei 9.099/95, arts. 60–92). NÃO use o rito cível do Juizado nem CPP do rito comum.",
    nomePeca:
      "Nome técnico da peça no JECRIM (queixa-crime, defesa, composição, transação penal, recurso inominado — NÃO contestação cível nem apelação)",
    especieHint:
      "5. Indique a espécie (queixa-crime, defesa, composição civil, transação penal, suspensão condicional, alegações finais ou recurso inominado);",
    ritoLinha:
      "Atue no Juizado Especial Criminal (Lei 9.099/95, arts. 60 a 92). Recurso da sentença: inominado (art. 82, 10 dias). Não use resposta à acusação do CPP.",
    especialidade: "Direito Penal no Juizado Especial Criminal (Lei 9.099/95)",
    foroAssistente: "no Juizado Especial Criminal (Lei 9.099/95)",
    tipoAcaoDefault: "Queixa-crime",
    nomenclaturaUser:
      "Com base nos fatos (nomenclatura do JECRIM / Lei 9.099 criminal, se disponível),",
    classificador: classif(
      "Você é o Assistente Facto, paralegal especialista em Juizado Especial Criminal.",
      ["Não use contestação cível, apelação nem habeas corpus neste módulo."]
    ),
  },
  criminal: {
    ritoCurto: "Justiça Penal comum (CP e CPP). NÃO use Lei 9.099/95 (JECRIM) nem contestação cível.",
    nomePeca:
      "Nome técnico da peça penal (habeas corpus, resposta à acusação, alegações finais, apelação, RSE, agravo em execução, revisão criminal)",
    especieHint:
      "5. Indique a espécie (habeas corpus, resposta à acusação, alegações finais, apelação, recurso em sentido estrito, agravo em execução ou revisão criminal);",
    ritoLinha:
      "Atue na Justiça Penal comum (CP e CPP). Resposta à acusação (arts. 396 e 396-A do CPP), NÃO contestação. Apelação criminal (art. 593 do CPP), NÃO recurso inominado. HC: art. 5º, LXVIII, da CF e arts. 647 e ss. do CPP. Endereçamento: Vara Criminal (ou Tribunal no HC).",
    especialidade: "Direito Penal e Processo Penal (rito comum)",
    foroAssistente: "na Justiça Penal comum (CP e CPP)",
    tipoAcaoDefault: "Resposta à acusação",
    nomenclaturaUser: "Com base nos fatos (nomenclatura penal / CPP, se disponível),",
    classificador: classif(
      "Você é o Assistente Facto, paralegal especialista em Direito Penal e Processo Penal (rito comum).",
      [
        "Habeas corpus, resposta à acusação, memoriais, apelação criminal. SEM contestação cível. SEM JECRIM (9.099).",
      ]
    ),
  },
  previdenciario: {
    ritoCurto:
      "contencioso previdenciário (Lei 8.213/91, JEF/Vara Federal). NÃO use 9.099 cível estadual nem CLT.",
    nomePeca:
      "Nome técnico da peça previdenciária (inicial de benefício, contestação, apelação, agravo, cumprimento)",
    especieHint:
      "5. Indique a espécie (inicial previdenciária, contestação, apelação, agravo ou cumprimento);",
    ritoLinha:
      "Atue no contencioso previdenciário contra o INSS (Lei 8.213/91 e rito do JEF/Justiça Federal quando couber). Não invente NB, DIP nem cálculo de RMI. Honorários: art. 85 do CPC / temas STJ de sucumbência previdenciária. Endereçamento: Juizado Especial Federal ou Vara Federal.",
    especialidade: "Direito Previdenciário (INSS / JEF)",
    foroAssistente: "no Juizado Especial Federal / Vara Federal previdenciária",
    tipoAcaoDefault: "Ação de Concessão de Benefício Previdenciário",
    nomenclaturaUser: "Com base nos fatos (nomenclatura previdenciária / INSS, se disponível),",
    classificador: classif(
      "Você é o Assistente Facto, paralegal especialista em Direito Previdenciário.",
      ["Nomeie o benefício (aposentadoria, BPC, auxílio). Não invente NB nem valores de RMI."]
    ),
  },
  tributario: {
    ritoCurto:
      "contencioso tributário (CTN, Lei 6.830/80). NÃO use 9.099 nem execução cível genérica.",
    nomePeca:
      "Nome técnico da peça tributária (embargos à execução fiscal, exceção de pré-executividade, anulatória, repetição de indébito, mandado de segurança)",
    especieHint:
      "5. Indique a espécie (embargos à execução fiscal, EPE, anulatória, repetição, MS, contestação ou apelação);",
    ritoLinha:
      "Atue no contencioso tributário (CTN e LEF — Lei 6.830/80). Embargos à execução fiscal ≠ embargos de declaração. Exceção de pré-executividade só com matéria de ordem pública e prova pré-constituída. Endereçamento: Vara da Fazenda Pública ou Vara Federal.",
    especialidade: "Direito Tributário (CTN / execução fiscal)",
    foroAssistente: "no contencioso tributário (CTN e LEF)",
    tipoAcaoDefault: "Embargos à Execução Fiscal",
    nomenclaturaUser: "Com base nos fatos (nomenclatura tributária / execução fiscal, se disponível),",
    classificador: classif(
      "Você é o Assistente Facto, paralegal especialista em Direito Tributário.",
      ["Embargos à execução fiscal, EPE, anulatória, repetição. SEM 9.099."]
    ),
  },
  administrativo: {
    ritoCurto:
      "contencioso administrativo e Fazenda Pública (Lei 12.016/09, CPC). NÃO use 9.099 nem CLT.",
    nomePeca:
      "Nome técnico da peça (mandado de segurança, inicial contra a Fazenda, contestação, apelação)",
    especieHint:
      "5. Indique a espécie (mandado de segurança, petição inicial, contestação, apelação ou agravo);",
    ritoLinha:
      "Atue no contencioso administrativo. Mandado de segurança: Lei 12.016/09, prazo de 120 dias, prova pré-constituída, autoridade coatora. Não invente ato administrativo. Endereçamento: Vara da Fazenda Pública ou Federal, conforme o ente.",
    especialidade: "Direito Administrativo e Mandado de Segurança",
    foroAssistente: "na Vara da Fazenda Pública / Justiça Federal",
    tipoAcaoDefault: "Mandado de Segurança",
    nomenclaturaUser: "Com base nos fatos (nomenclatura administrativa / MS, se disponível),",
    classificador: classif(
      "Você é o Assistente Facto, paralegal especialista em Direito Administrativo.",
      ["MS (120 dias). Não invente o ato coator."]
    ),
  },
  empresarial: {
    ritoCurto:
      "contencioso empresarial (CC, Lei 6.404/76, CPC). NÃO use 9.099 como rito padrão.",
    nomePeca:
      "Nome técnico da peça empresarial (notificação extrajudicial, dissolução, obrigação societária, contestação, apelação)",
    especieHint:
      "5. Indique a espécie (notificação extrajudicial, inicial societária, contestação, apelação ou cumprimento);",
    ritoLinha:
      "Atue no contencioso empresarial (Código Civil e Lei 6.404/76 quando S.A.). Distinga notificação extrajudicial de ação judicial. Endereçamento: Vara Empresarial ou Cível.",
    especialidade: "Direito Empresarial e societário",
    foroAssistente: "no juízo empresarial / cível",
    tipoAcaoDefault: "Ação de Obrigação de Fazer (societária)",
    nomenclaturaUser: "Com base nos fatos (nomenclatura empresarial / societária, se disponível),",
    classificador: classif(
      "Você é o Assistente Facto, paralegal especialista em Direito Empresarial.",
      ["Notificação vs. ação. Não invente contrato social nem quotas."]
    ),
  },
  digital: {
    ritoCurto: "Direito Digital e LGPD (Lei 13.709/18, CC, CPC). NÃO use 9.099 como tese principal.",
    nomePeca: "Nome técnico da peça digital/LGPD (inicial, contestação, apelação)",
    especieHint:
      "5. Indique a espécie (petição inicial, contestação, réplica, apelação, agravo ou cumprimento);",
    ritoLinha:
      "Atue em Direito Digital e proteção de dados (LGPD). Não invente incidente na ANPD. Crimes digitais graves podem ser Penal — este módulo é cível/LGPD. Honorários: art. 85 do CPC.",
    especialidade: "Direito Digital e LGPD",
    foroAssistente: "no contencioso digital / LGPD",
    tipoAcaoDefault: "Ação de Obrigação de Fazer c/c Tutela de Dados Pessoais",
    nomenclaturaUser: "Com base nos fatos (nomenclatura LGPD / digital, se disponível),",
    classificador: classif(
      "Você é o Assistente Facto, paralegal especialista em Direito Digital e LGPD.",
      ["Não invente base legal de tratamento. Crimes: módulo Penal."]
    ),
  },
  ambiental: {
    ritoCurto: "Direito Ambiental (Lei 6.938/81, CPC, ACP). NÃO use 9.099.",
    nomePeca: "Nome técnico da peça ambiental (ACP, defesa de infração, MS, TAC, apelação)",
    especieHint:
      "5. Indique a espécie (ACP ambiental, defesa de auto de infração, MS, inicial, contestação ou apelação);",
    ritoLinha:
      "Atue em Direito Ambiental. ACP: Lei 7.347/85. Não invente auto de infração, TAC nem licença. Endereçamento: Vara Ambiental, Federal ou Cível conforme o ente.",
    especialidade: "Direito Ambiental",
    foroAssistente: "no juízo ambiental / federal",
    tipoAcaoDefault: "Ação Civil Pública Ambiental",
    nomenclaturaUser: "Com base nos fatos (nomenclatura ambiental, se disponível),",
    classificador: classif(
      "Você é o Assistente Facto, paralegal especialista em Direito Ambiental.",
      ["ACP, TAC, defesa de auto. Não invente licença ambiental."]
    ),
  },
  "propriedade-intelectual": {
    ritoCurto: "Propriedade intelectual (LPI, LDA, CPC). NÃO use 9.099.",
    nomePeca: "Nome técnico da peça de PI (abstenção, nulidade de marca, indenização, contestação)",
    especieHint:
      "5. Indique a espécie (abstenção/contrafação, nulidade de marca, inicial, contestação ou apelação);",
    ritoLinha:
      "Atue em propriedade intelectual (Lei 9.279/96 e Lei 9.610/98). Não invente número de registro no INPI. Endereçamento: Vara Empresarial/Federal conforme a lide.",
    especialidade: "Propriedade Intelectual (marcas, patentes, direitos autorais)",
    foroAssistente: "no juízo de propriedade intelectual",
    tipoAcaoDefault: "Ação de Abstenção de Uso de Marca c/c Perdas e Danos",
    nomenclaturaUser: "Com base nos fatos (nomenclatura de PI / INPI, se disponível),",
    classificador: classif(
      "Você é o Assistente Facto, paralegal especialista em Propriedade Intelectual.",
      ["Não invente registro INPI."]
    ),
  },
  internacional: {
    ritoCurto:
      "cooperação e contratos internacionais (CPC, LINDB, homologação no STJ). NÃO use 9.099.",
    nomePeca:
      "Nome técnico (homologação de sentença estrangeira, carta rogatória, inicial contratual internacional)",
    especieHint:
      "5. Indique a espécie (homologação no STJ, carta rogatória, inicial, contestação ou apelação);",
    ritoLinha:
      "Atue em Direito Internacional privado. Homologação de sentença estrangeira: STJ (art. 105, I, i, da CF). Não invente tratado nem sentença estrangeira. Honorários: art. 85 do CPC quando judicial.",
    especialidade: "Direito Internacional privado e cooperação jurídica",
    foroAssistente: "no STJ (homologação) ou juízo cível internacional",
    tipoAcaoDefault: "Homologação de Sentença Estrangeira",
    nomenclaturaUser: "Com base nos fatos (nomenclatura de direito internacional, se disponível),",
    classificador: classif(
      "Você é o Assistente Facto, paralegal especialista em Direito Internacional privado.",
      ["Homologação no STJ. Não invente sentença estrangeira."]
    ),
  },
  medico: {
    ritoCurto:
      "Direito Médico (CC, CDC se plano/consumo, conselhos). Distinga erro médico de cobertura de plano.",
    nomePeca: "Nome técnico (erro médico, negativa de cobertura, defesa ética, contestação)",
    especieHint:
      "5. Indique a espécie (inicial de responsabilidade médica, cobertura de plano, contestação, apelação ou defesa ética);",
    ritoLinha:
      "Atue em Direito Médico. Erro médico: responsabilidade civil (CC); plano de saúde pode ser CDC (módulo irmão Consumidor se for só cobertura). Não invente prontuário nem laudo. Honorários: art. 85 do CPC.",
    especialidade: "Direito Médico e da Saúde",
    foroAssistente: "no juízo cível / consumerista da saúde",
    tipoAcaoDefault: "Ação de Indenização por Erro Médico",
    nomenclaturaUser: "Com base nos fatos (nomenclatura de direito médico, se disponível),",
    classificador: classif(
      "Você é o Assistente Facto, paralegal especialista em Direito Médico.",
      ["Não invente prontuário. Distinga erro médico de negativa de cobertura."]
    ),
  },
  agrario: {
    ritoCurto: "Direito Agrário (Estatuto da Terra, CC, CPC). NÃO use 9.099.",
    nomePeca: "Nome técnico agrário (contratos agrários, desapropriação, inicial, contestação)",
    especieHint:
      "5. Indique a espécie (inicial agrária, contestação, apelação, agravo ou cumprimento);",
    ritoLinha:
      "Atue em Direito Agrário (Lei 4.504/64 e CC). Não invente matrícula rural nem ITR. Endereçamento: Vara Agrária ou Cível.",
    especialidade: "Direito Agrário e do agronegócio",
    foroAssistente: "no juízo agrário / cível",
    tipoAcaoDefault: "Ação de Cumprimento de Contrato Agrário",
    nomenclaturaUser: "Com base nos fatos (nomenclatura agrária, se disponível),",
    classificador: classif(
      "Você é o Assistente Facto, paralegal especialista em Direito Agrário.",
      ["Não invente matrícula rural."]
    ),
  },
  eleitoral: {
    ritoCurto:
      "Direito Eleitoral (Código Eleitoral, Leis 9.504/97 e 9.096/95). Sem lastro TRE/TSE na API atual — não invente julgado.",
    nomePeca:
      "Nome técnico eleitoral (registro, representação de propaganda, AIJE, defesa, recurso)",
    especieHint:
      "5. Indique a espécie (registro de candidatura, representação, AIJE, defesa ou recurso eleitoral);",
    ritoLinha:
      "Atue na Justiça Eleitoral. Não invente número de protocolo TSE/TRE nem julgado (a base FACTO não tem TRE/TSE). Prazos eleitorais são próprios e fatais — avise, não conte. Endereçamento: Juiz Eleitoral da zona / TRE.",
    especialidade: "Direito Eleitoral",
    foroAssistente: "na Justiça Eleitoral",
    tipoAcaoDefault: "Representação por Propaganda Irregular",
    nomenclaturaUser: "Com base nos fatos (nomenclatura eleitoral, se disponível),",
    classificador: classif(
      "Você é o Assistente Facto, paralegal especialista em Direito Eleitoral.",
      ["Não invente julgado de TRE/TSE. AIJE, representação, registro."]
    ),
  },
};

export function ritoDaArea(areaId: string): AreaRitoCopy {
  return TABELA[areaId] ?? TABELA.jec!;
}
