/**
 * Lotes 201–640 — inflar TJs/áreas até a última semana da assinatura.
 *
 * ~440 lotes × 12 termos. Com ~28 lotes/noite (cota real do pool), dá ~15–20
 * madrugadas. O diário para 7 dias antes de `vencimento` em seed-juris-estado.json.
 *
 * 201–380: 18 packs × 10 TJs (admin, médico, digital, ambiental, empresarial + volume)
 * 381–460: 8 packs × 10 TJs (fazenda, execução, plano, trânsito, agrário, PI…)
 * 461–640: 30 packs × 6 cortes federais (TST TRF3 TRF4 CARF STJ STF)
 */

type TermoSeed = {
  q: string;
  lado?: "autor" | "reu" | "neutro";
  tribunal?: string;
};

function par(a: string, r: string): TermoSeed[] {
  return [
    { lado: "autor", q: a },
    { lado: "reu", q: r },
  ];
}

function noTribunal(termos: TermoSeed[], tribunal: string): TermoSeed[] {
  return termos.map((t) => ({ ...t, tribunal }));
}

function pack(...pares: [string, string][]): TermoSeed[] {
  return pares.flatMap(([a, r]) => par(a, r));
}

const TJS = [
  "tjce",
  "tjgo",
  "tjma",
  "tjmt",
  "tjsc",
  "tjpr",
  "tjrs",
  "tjrj",
  "tjmg",
  "tjsp",
] as const;

const FED = ["tst", "trf3", "trf4", "carf", "stj", "stf"] as const;

const ESTADUAIS: { rotulo: string; termos: TermoSeed[] }[] = [
  {
    rotulo: "administrativo",
    termos: pack(
      ["mandado de segurança ato de autoridade estadual", "mandado de segurança decadência 120 dias"],
      ["servidor público exoneração anulação", "exoneração servidor discricionariedade"],
      ["concurso público anulação questão", "concurso público gabarito válido"],
      ["licitação estadual inexigibilidade", "licitação inexigibilidade hipótese legal"],
      ["improbidade administrativa dano ao erário", "improbidade ausência dolo"],
      ["desapropriação indenização prévia", "desapropriação valor suficiente"]
    ),
  },
  {
    rotulo: "médico",
    termos: pack(
      ["erro médico indenização nexo", "erro médico evolução natural"],
      ["hospital responsabilidade objetiva", "hospital ato exclusivo equipe particular"],
      ["fornecimento medicamento obrigação de fazer", "medicamento off label recusa"],
      ["prontuário incompleto dano moral", "prontuário regular"],
      ["cirurgia plástica obrigação de resultado", "cirurgia plástica obrigação de meio"],
      ["infecção hospitalar nexo", "infecção hospitalar fato de terceiro"]
    ),
  },
  {
    rotulo: "digital",
    termos: pack(
      ["vazamento de dados pessoais indenização", "vazamento dados ausência dano"],
      ["exclusão de conteúdo internet obrigação de fazer", "conteúdo internet liberdade de expressão"],
      ["golpe whatsapp banco responsabilidade", "golpe whatsapp culpa da vítima"],
      ["deepfake ofensa honra indenização", "ofensa honra prova insuficiente"],
      ["cadastro indevido plataforma dano moral", "cadastro regular termo de uso"],
      ["LGPD eliminação de dados", "LGPD base legal legítimo interesse"]
    ),
  },
  {
    rotulo: "ambiental",
    termos: pack(
      ["ação civil pública dano ambiental", "ACP ambiental nexo não comprovado"],
      ["multa ambiental estadual anulação", "multa ambiental dosimetria"],
      ["licença ambiental embargo obra", "embargo ambiental atividade licenciada"],
      ["APP construção irregular", "APP área consolidada"],
      ["poluição sonora indenização", "poluição sonora limites municipais"],
      ["responsabilidade poluidor-pagador", "poluidor fato de terceiro"]
    ),
  },
  {
    rotulo: "empresarial",
    termos: pack(
      ["dissolução parcial sociedade haveres", "dissolução ausência justa causa"],
      ["exclusão de sócio falta grave", "exclusão sócio assembleia irregular"],
      ["título de crédito duplicata execução", "duplicata prescrição"],
      ["recuperação judicial credor", "recuperação judicial crédito extraconcursal"],
      ["concorrência desleal desvio de clientela", "concorrência desleal uso de marca comum"],
      ["contrato social interpretação cláusula", "contrato social autonomia da vontade"]
    ),
  },
  {
    rotulo: "JEC v3",
    termos: pack(
      ["juizado especial cível conta de luz cobrança indevida", "conta de luz consumo comprovado"],
      ["juizado especial cível água esgoto cobrança", "saneamento tarifa devida"],
      ["juizado especial cível estacionamento dano veículo", "estacionamento cláusula de não indenizar"],
      ["juizado especial cível academia mensalidade", "academia fidelidade contratual"],
      ["juizado especial cível curso EAD propaganda", "curso EAD serviço prestado"],
      ["juizado especial cível entrega encomenda extravio", "extravio caso fortuito transportadora"]
    ),
  },
  {
    rotulo: "CDC v3",
    termos: pack(
      ["cartão de crédito compra não reconhecida", "compra cartão senha utilizada"],
      ["empréstimo consignado desconto indevido", "consignado contrato válido"],
      ["financiamento veículo busca apreensão", "busca apreensão purgação mora"],
      ["seguro prestamista recusa", "seguro prestamista risco excluído"],
      ["telefonia fidelização multa", "fidelização multa proporcional"],
      ["e-commerce arrependimento 7 dias", "arrependimento prazo decadencial"]
    ),
  },
  {
    rotulo: "civil v2",
    termos: pack(
      ["indenização por dano estético", "dano estético não caracterizado"],
      ["lucros cessantes prova", "lucros cessantes hipotéticos"],
      ["cláusula penal redução art 413", "cláusula penal valor proporcional"],
      ["evicção responsabilidade do alienante", "evicção ciência do adquirente"],
      ["vício redibitório coisa usada", "vício redibitório desgaste"],
      ["gestão de negócios alheios", "gestão negócios ausência utilidade"]
    ),
  },
  {
    rotulo: "família v2",
    termos: pack(
      ["guarda unilateral melhor interesse", "guarda unilateral convívio viável compartilhada"],
      ["alimentos compensatórios divórcio", "alimentos compensatórios autonomia financeira"],
      ["reconhecimento de paternidade socioafetiva", "socioafetividade não comprovada"],
      ["adoção destituição poder familiar", "destituição poder familiar extrema"],
      ["investigação de paternidade alimentos", "investigação paternidade coisa julgada"],
      ["oversharing exposição de filho indenização", "exposição filho exercício do poder familiar"]
    ),
  },
  {
    rotulo: "imob v2",
    termos: pack(
      ["condomínio obras necessárias rateio", "obra suntuária assembleia"],
      ["vaga de garagem uso exclusivo", "vaga garagem área comum"],
      ["ruído condomínio multa", "ruído uso normal da unidade"],
      ["compra na planta atraso registro", "atraso registro cartório"],
      ["IPTU responsabilidade locatício", "IPTU obrigação do locador"],
      ["direito de laje regularização", "laje ausência registro"]
    ),
  },
  {
    rotulo: "JECRIM v2",
    termos: pack(
      ["juizado criminal peculato de uso", "peculato atipicidade"],
      ["juizado criminal vias de fato reiteradas", "vias de fato composição"],
      ["juizado criminal omissão de socorro", "omissão de socorro atipicidade"],
      ["juizado criminal perturbação do sossego", "perturbação sossego exercício regular"],
      ["juizado criminal dano simples", "dano simples rescisão civil"],
      ["juizado criminal exercício arbitrário", "exercício arbitrário atipicidade"]
    ),
  },
  {
    rotulo: "penal v2",
    termos: pack(
      ["roubo majorado concurso de agentes", "roubo tentado desistência"],
      ["receptação dolo", "receptação ausência dolo"],
      ["estelionato eletrónico", "estelionato golpe culpa da vítima"],
      ["falsidade ideológica documento", "falsidade atipicidade"],
      ["ameaça violência doméstica", "ameaça retratação representação"],
      ["progressão de regime requisito objetivo", "progressão falta grave"]
    ),
  },
  {
    rotulo: "LEF v2",
    termos: pack(
      ["execução fiscal ICMS CDA", "CDA ICMS liquidez"],
      ["execução fiscal ISS serviço", "ISS local da prestação"],
      ["execução fiscal taxa de coleta", "taxa coleta serviço específico"],
      ["execução fiscal honorários fazenda", "honorários execução fiscal sucumbência"],
      ["parcelamento fiscal adesão", "parcelamento quebra"],
      ["responsabilidade tributária sucessor", "sucessão tributária não caracterizada"]
    ),
  },
  {
    rotulo: "CDC banco",
    termos: pack(
      ["empréstimo consignado portabilidade", "portabilidade recusa justificada"],
      ["cheque especial juros abusivos", "cheque especial taxa contratual"],
      ["investimento perda orientação inadequada", "investimento risco assumido"],
      ["financiamento imobiliário revisão", "financiamento imobiliário SFH válido"],
      ["tarifas bancárias rol CMN", "tarifa serviço efetivo"],
      ["golpe motoboy conta corrente", "golpe motoboy fortuito interno"]
    ),
  },
  {
    rotulo: "JEC energia telecom",
    termos: pack(
      ["oscilação de energia dano aparelhos", "oscilação energia caso fortuito"],
      ["corte indevido energia dano moral", "corte energia inadimplência notificada"],
      ["internet banda larga queda serviço", "queda internet manutenção programada"],
      ["telefonia portabilidade número", "portabilidade recusa técnica"],
      ["TV por assinatura cobrança após cancelamento", "TV assinatura período aviso"],
      ["aplicativo transporte cancelamento", "cancelamento aplicativo cláusula"]
    ),
  },
  {
    rotulo: "civil contratos",
    termos: pack(
      ["revisão contratual onerosidade excessiva", "onerosidade álea normal"],
      ["contrato de prestação de serviços rescisão", "prestação serviços cumprimento substancial"],
      ["compra e venda imóvel evicção", "compra venda ciência do ônus"],
      ["fiança outorga uxória", "fiança validade cônjuge"],
      ["promessa de doação exigibilidade", "promessa doação liberalidade"],
      ["contrato preliminar execução específica", "contrato preliminar recusa justificada"]
    ),
  },
  {
    rotulo: "família sucessão",
    termos: pack(
      ["inventário negativo dívida", "inventário dívida do espólio"],
      ["overilato sonegados", "colação bem doado"],
      ["testamento nulidade vício de forma", "testamento forma válida"],
      ["herança jacente arrecadação", "herança jacente herdeiro habilitado"],
      ["meação companheiro união estável", "meação bem particular"],
      ["petição de herança decadência", "petição herança prazo"]
    ),
  },
  {
    rotulo: "imob condomínio",
    termos: pack(
      ["síndico prestação de contas", "prestação contas assembleia aprovada"],
      ["multa condominial reiteração", "multa condominial desproporcional"],
      ["animal em condomínio convenção", "animal convívio regular"],
      ["airbnb condomínio proibição", "locação temporada direito de propriedade"],
      ["infiltração unidade vizinha", "infiltração área comum condomínio"],
      ["alteração fachada unidade", "fachada convenção"]
    ),
  },
  {
    rotulo: "fazenda MS",
    termos: pack(
      ["mandado de segurança fazenda estadual", "MS fazenda dilação prova"],
      ["repetição de indébito tributário estadual", "repetição indébito prova recolhimento"],
      ["isenção fiscal lei específica", "isenção interpretação literal"],
      ["auto de infração estadual nulidade", "auto infração regular"],
      ["certidão positiva com efeito de negativa", "CND débitos em discussão"],
      ["refis adesão benefícios", "refis perda do parcelamento"]
    ),
  },
  {
    rotulo: "execução civil",
    termos: pack(
      ["cumprimento de sentença impugnação", "impugnação excesso de execução"],
      ["penhora de salário impenhorabilidade", "penhora salário excesso alimentar"],
      ["penhora de veículos restrição", "veículo ferramenta de trabalho"],
      ["fraude à execução alienação", "alienação boa-fé terceiro"],
      ["SISBAJUD bloqueio excessivo", "bloqueio proporcional"],
      ["embargos de terceiro propriedade", "embargos terceiro posse precária"]
    ),
  },
  {
    rotulo: "plano saúde",
    termos: pack(
      ["plano de saúde quimioterapia oral", "quimioterapia oral rol ANS"],
      ["plano de saúde órtese prótese", "órtese material especial"],
      ["urgência emergência cobertura 24h", "urgência carência"],
      ["reajuste por sinistralidade coletivo", "reajuste coletivo ANS"],
      ["doença preexistente cobertura", "doença preexistente CPT"],
      ["rescisão unilateral plano coletivo", "rescisão coletivo cláusula"]
    ),
  },
  {
    rotulo: "acidente trânsito",
    termos: pack(
      ["acidente trânsito DPVAT residual", "DPVAT indenização securitária"],
      ["acidente trânsito culpa concorrente", "culpa exclusiva da vítima"],
      ["atropelamento indenização", "atropelamento imprudência pedestre"],
      ["seguro DPVAT prescrição", "DPVAT prazo trienal"],
      ["danos materiais veículo conserto", "conserto orçamento excessivo"],
      ["pensão vitalícia acidente", "pensão vitalícia incapacidade parcial"]
    ),
  },
  {
    rotulo: "agrário",
    termos: pack(
      ["arrendamento rural rescisão", "arrendamento rural prazo"],
      ["parceria agrícola partilha", "parceria agrícola insumos"],
      ["CPR execução", "CPR exceção de contrato"],
      ["crédito rural anulação", "crédito rural garantia"],
      ["usucapião rural morada habitual", "usucapião rural terra pública"],
      ["benfeitorias indenização arrendatário", "benfeitorias voluptuárias"]
    ),
  },
  {
    rotulo: "PI estadual",
    termos: pack(
      ["marca uso indevido abstenção", "marca nome de fantasia comum"],
      ["concorrência desleal propaganda", "propaganda comparativa lícita"],
      ["direito autoral foto indenização", "foto uso autorizado"],
      ["software pirataria abstenção", "software licença"],
      ["nome empresarial colidência", "nome empresarial distinção"],
      ["design industrial contrafação", "design industrial domínio público"]
    ),
  },
  {
    rotulo: "eleitoral estadual",
    termos: pack(
      ["propaganda eleitoral irregular multa", "propaganda eleitoral exercício regular"],
      ["pesquisa eleitoral sem registro", "pesquisa registrada"],
      ["doação de campanha limite", "doação regular"],
      ["inelegibilidade condenação", "inelegibilidade não incidente"],
      ["abuso de poder político", "abuso político não caracterizado"],
      ["contas de campanha desaprovação", "contas irregularidade formal"]
    ),
  },
];

const FEDERAIS: { rotulo: string; termos: TermoSeed[] }[] = [
  {
    rotulo: "volume A",
    termos: pack(
      ["horas extras intervalo", "jornada cartão ponto"],
      ["aposentadoria tempo especial", "EPI eficaz"],
      ["IRPJ glosa despesa", "despesa comprovada"],
      ["recurso repetitivo", "distinguishing"],
      ["repercussão geral", "questão infraconstitucional"],
      ["mandado de segurança federal", "direito líquido"]
    ),
  },
  {
    rotulo: "volume B",
    termos: pack(
      ["rescisão indireta", "justa causa proporcional"],
      ["BPC miserabilidade", "renda familiar"],
      ["PIS COFINS insumo", "crédito glosado"],
      ["dano moral in re ipsa", "mero aborrecimento"],
      ["habeas corpus", "prisão preventiva"],
      ["licitação federal", "inexigibilidade"]
    ),
  },
  {
    rotulo: "volume C",
    termos: pack(
      ["equiparação salarial", "diferença de tempo"],
      ["auxílio-acidente", "redução capacidade"],
      ["multa de ofício", "sonegação não comprovada"],
      ["CDC instituições financeiras", "relação de consumo"],
      ["execução penal", "falta grave"],
      ["improbidade federal", "dolo específico"]
    ),
  },
  {
    rotulo: "volume D",
    termos: pack(
      ["terceirização vínculo", "atividade-meio"],
      ["pensão por morte INSS", "união estável"],
      ["compensação PERDCOMP", "crédito não homologado"],
      ["plano de saúde rol ANS", "rol taxativo"],
      ["prisão em flagrante", "liberdade provisória"],
      ["servidor federal adicional", "adicional indevido"]
    ),
  },
  {
    rotulo: "volume E",
    termos: pack(
      ["assédio moral trabalho", "poder diretivo"],
      ["revisão da vida toda", "tese superada"],
      ["ágio interno", "substância econômica"],
      ["Súmula 479 STJ", "culpa exclusiva"],
      ["foro por prerrogativa", "crime alheio ao cargo"],
      ["desapropriação federal", "indenização"]
    ),
  },
  {
    rotulo: "volume F",
    termos: pack(
      ["FGTS diferenças", "prescrição"],
      ["segurado especial rural", "prova material"],
      ["CSLL trava 30 por cento", "prejuízo fiscal"],
      ["homologação sentença estrangeira", "ordem pública"],
      ["ADPF saúde", "reserva do possível"],
      ["auto de infração IBAMA", "contraditório"]
    ),
  },
];

/** Volume extra para ~20 madrugadas até 05/09 (pausa 06/09; vence 13/09). */
const ESTADUAIS_2: { rotulo: string; termos: TermoSeed[] }[] = [
  {
    rotulo: "JEC v5",
    termos: pack(
      ["juizado especial cível dentista tratamento indenização", "tratamento odontológico complicação inerente"],
      ["juizado especial cível hotel overbooking", "overbooking reacomodação"],
      ["juizado especial cível supermercado queda", "queda supermercado culpa da vítima"],
      ["juizado especial cível estacionamento rotativo", "estacionamento tarifa devida"],
      ["juizado especial cível pet shop animal", "pet shop cláusula de risco"],
      ["juizado especial cível autoescola CNH", "autoescola serviço prestado"]
    ),
  },
  {
    rotulo: "CDC v4",
    termos: pack(
      ["superendividamento plano de pagamento", "superendividamento má-fé do consumidor"],
      ["compra de celular vício", "celular mau uso"],
      ["garantia estendida CDC", "garantia estendida recusa válida"],
      ["marketplace marketplace responsabilidade", "marketplace intermediário"],
      ["delivery atraso alimento", "atraso delivery caso fortuito"],
      ["clube de assinatura cancelamento", "assinatura período mínimo"]
    ),
  },
  {
    rotulo: "civil v3",
    termos: pack(
      ["responsabilidade civil do Estado omissão", "omissão estatal discricionariedade"],
      ["acidente em via pública buraco", "buraco culpa exclusiva"],
      ["queda em calçada indenização", "calçada manutenção municipal"],
      ["ofensa à honra redes sociais", "honra crítica jornalística"],
      ["abuso de direito vizinho", "uso normal da propriedade"],
      ["perda do tempo útil indenização", "tempo útil mero aborrecimento"]
    ),
  },
  {
    rotulo: "família v3",
    termos: pack(
      ["alimentos transitórios ex-cônjuge", "alimentos transitórios autosuficiência"],
      ["guarda de animal de estimação", "animal bem semovente partilha"],
      ["violência doméstica medidas protetivas cível", "medidas protetivas revogação"],
      ["nome afetivo retificação", "retificação nome ausência prova"],
      ["curatela interdição proporcional", "curatela tomada de decisão apoiada"],
      ["pacto antenupcial incomunicabilidade", "pacto antenupcial cláusula nula"]
    ),
  },
  {
    rotulo: "imob v3",
    termos: pack(
      ["usucapião urbana especial", "usucapião urbana área pública"],
      ["adjudicação compulsória registro", "adjudicação falta de pagamento"],
      ["compromisso de compra distrato lei 13786", "distrato retenção 50 por cento"],
      ["vizinhança construções perigosas", "construção regular alvará"],
      ["servidão de passagem", "servidão não caracterizada"],
      ["condomínio de lotes convenção", "loteamento obrigação de fazer"]
    ),
  },
  {
    rotulo: "penal v3",
    termos: pack(
      ["tráfico privilegiado quantidade", "tráfico associação"],
      ["furto de energia elétrica", "furto energia atipicidade"],
      ["estelionato sentimental", "estelionato ausência dolo"],
      ["violência doméstica lesão", "lesão corporal retratação"],
      ["execução penal remição estudo", "remição falta grave"],
      ["liberdade provisória fiança", "fiança valor excessivo"]
    ),
  },
  {
    rotulo: "JECRIM v3",
    termos: pack(
      ["juizado criminal difamação", "difamação atipicidade crítica"],
      ["juizado criminal desobediência", "desobediência ordem ilegal"],
      ["juizado criminal rixa", "rixa composição civil"],
      ["juizado criminal receptação culposa", "receptação ausência culpa"],
      ["juizado criminal vias de fato doméstica", "vias de fato transação"],
      ["juizado criminal ameaça WhatsApp", "ameaça retratação"]
    ),
  },
  {
    rotulo: "LEF v3",
    termos: pack(
      ["execução fiscal ITBI CDA", "ITBI base de cálculo"],
      ["execução fiscal contribuição melhoria", "contribuição melhoria requisito"],
      ["execução fiscal multa trânsito", "multa trânsito prescrição"],
      ["redirecionamento sócio execução fiscal", "redirecionamento dissolução irregular"],
      ["exceção de pré-executividade prescrição", "pré-executividade matéria de prova"],
      ["penhora de faturamento execução fiscal", "penhora faturamento proporcional"]
    ),
  },
  {
    rotulo: "admin v2",
    termos: pack(
      ["concurso público eliminação investigação social", "investigação social motivação"],
      ["servidor adicional insalubridade", "insalubridade laudo negativo"],
      ["licença prêmio servidor", "licença prêmio não implementada"],
      ["processo administrativo disciplinar nulidade", "PAD contraditório observado"],
      ["contrato administrativo inexecução", "inexecução caso fortuito"],
      ["tombamento indenização", "tombamento restrição proporcional"]
    ),
  },
  {
    rotulo: "médico v2",
    termos: pack(
      ["erro de diagnóstico indenização", "diagnóstico diferencial razoável"],
      ["parto cesárea dano", "parto evolução natural"],
      ["negativa de UTI plano", "UTI leito indisponível"],
      ["fornecimento de dieta enteral", "dieta enteral não prescrita"],
      ["cirurgia bariátrica complicação", "bariátrica termo de consentimento"],
      ["equipe multidisciplinar responsabilidade", "ato exclusivo de um profissional"]
    ),
  },
  {
    rotulo: "digital v2",
    termos: pack(
      ["golpe do falso sequestro PIX", "PIX culpa exclusiva"],
      ["conta invadida rede social", "invasão ausência falha da plataforma"],
      ["review falso dano moral", "review exercício da crítica"],
      ["cookies consentimento LGPD", "cookies legítimo interesse"],
      ["biometria tratamento de dados", "biometria base legal"],
      ["direito ao esquecimento", "esquecimento liberdade de informação"]
    ),
  },
  {
    rotulo: "ambiental v2",
    termos: pack(
      ["queimada indenização vizinho", "queimada fato de terceiro"],
      ["desmatamento multa estadual", "desmatamento área consolidada"],
      ["licenciamento simplificado", "licenciamento exigido"],
      ["unidade de conservação buffer", "zona de amortecimento"],
      ["fauna silvestre apreensão", "apreensão regular"],
      ["ressarcimento dano coletivo ambiental", "dano coletivo não comprovado"]
    ),
  },
  {
    rotulo: "empresarial v2",
    termos: pack(
      ["trespasse estabelecimento dívida", "trespasse sucessão"],
      ["nota promissória aval", "aval prescrição cambiária"],
      ["acordo de sócios tag along", "tag along não previsto"],
      ["marca notória proteção", "marca notória não caracterizada"],
      ["recuperação extrajudicial", "recuperação extrajudicial credor"],
      ["administrador judicial verba", "verba administrador excessiva"]
    ),
  },
  {
    rotulo: "trabalho na justiça comum",
    termos: pack(
      ["acidente de trabalho ação regressiva INSS", "ação regressiva culpa exclusiva"],
      ["dano moral empregador justiça comum", "competência justiça do trabalho"],
      ["acidente trajeto indenização", "trajeto culpa da vítima"],
      ["seguro de vida em grupo recusa", "seguro grupo risco excluído"],
      ["responsabilidade tomador de serviço", "tomador ausência subordinação"],
      ["doença ocupacional nexo civil", "nexo ocupacional não comprovado"]
    ),
  },
  {
    rotulo: "previdência estadual",
    termos: pack(
      ["pensão servidor estadual", "pensão estadual dependente"],
      ["aposentadoria servidor tempo especial", "tempo especial servidor"],
      ["revisão proventos paridade", "paridade regra de transição"],
      ["auxílio-doença servidor", "capacidade laborativa"],
      ["abono permanência", "abono permanência requisito"],
      ["contribuição previdenciária servidor", "contribuição alíquota legal"]
    ),
  },
  {
    rotulo: "consumidor saúde v2",
    termos: pack(
      ["plano de saúde TEA cobertura", "TEA rol ANS"],
      ["plano de saúde home care 24h", "home care não prescrito"],
      ["reajuste idoso estatuto", "reajuste faixa etária ANS"],
      ["carência urgência 24 horas", "carência contrato"],
      ["network credenciamento médico", "descredenciamento justificado"],
      ["coparticipação abusiva", "coparticipação contratual"]
    ),
  },
];

function montar(): {
  lotes: Record<number, TermoSeed[]>;
  rotulos: Record<number, string>;
} {
  const lotes: Record<number, TermoSeed[]> = {};
  const rotulos: Record<number, string> = {};
  let n = 201;

  for (const p of ESTADUAIS) {
    for (const tj of TJS) {
      lotes[n] = noTribunal(p.termos, tj);
      rotulos[n] = `${tj.toUpperCase()} · ${p.rotulo}`;
      n++;
    }
  }

  for (const p of FEDERAIS) {
    for (const trib of FED) {
      lotes[n] = noTribunal(p.termos, trib);
      rotulos[n] = `${trib.toUpperCase()} · ${p.rotulo}`;
      n++;
    }
  }

  for (const p of ESTADUAIS_2) {
    for (const tj of TJS) {
      lotes[n] = noTribunal(p.termos, tj);
      rotulos[n] = `${tj.toUpperCase()} · ${p.rotulo}`;
      n++;
    }
  }

  return { lotes, rotulos };
}

const m = montar();
export const LOTES_201_A_640 = m.lotes;
export const ROTULO_LOTE_201_640 = m.rotulos;
export const LOTE_MAX_EXPANDIDO = Math.max(
  ...Object.keys(m.lotes).map((k) => Number(k))
);
