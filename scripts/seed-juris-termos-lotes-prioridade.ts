/**
 * Lotes 201+ (prefixo) — lacunas da base + reforço das áreas já no ar.
 *
 * Entram ANTES do volume 10 TJs × packs, para rodarem ~2 madrugadas após o 149.
 * Queries curtas (lei/número no termo costuma zerar a API).
 *
 * STF constitucional (kit do dashboard), TRF previdenciário, TST, CARF,
 * retomas 0-insert (LGPD, IPTU, conselhos, eleitoral STJ, marítimo).
 * Sem TSE/TRE/TRF1/2/5/6/TNU — a API não tem.
 */

export type TermoSeed = {
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

function pack(...pares: [string, string][]): TermoSeed[] {
  return pares.flatMap(([a, r]) => par(a, r));
}

export type PackTribunal = {
  rotulo: string;
  tribunal: string;
  termos: TermoSeed[];
};

/** 37 lotes a partir de 201 (+10 vitrine JEC/digital/médico/JECR/amb/trab/fam/prev). */
export const LACUNAS_PRIORIDADE: PackTribunal[] = [
  {
    rotulo: "STF · remédios constitucionais",
    tribunal: "stf",
    termos: pack(
      ["mandado de segurança direito líquido certo", "mandado de segurança decadência cento e vinte dias"],
      ["habeas corpus constrangimento ilegal", "habeas corpus substitutivo de recurso"],
      ["habeas data acesso a dados pessoais", "habeas data via administrativa prévia"],
      ["mandado de injunção omissão legislativa", "mandado de injunção omissão não caracterizada"],
      ["ação popular ato lesivo patrimônio", "ação popular ilegitimidade cidadão"],
      ["reclamação constitucional autoridade do STF", "reclamação ausência paradigma vinculante"]
    ),
  },
  {
    rotulo: "STF · RE e repercussão geral",
    tribunal: "stf",
    termos: pack(
      ["recurso extraordinário repercussão geral", "recurso extraordinário questão infraconstitucional"],
      ["agravo em recurso extraordinário", "agravo extraordinário ausência prequestionamento"],
      ["recurso ordinário constitucional STF", "recurso ordinário cabimento não demonstrado"],
      ["súmula vinculante descumprimento", "súmula vinculante distinção do caso"],
      ["tema de repercussão geral aplicação", "repercussão geral distinguishing"],
      ["embargos de declaração STF omissão", "embargos declaração caráter infringente"]
    ),
  },
  {
    rotulo: "STF · controle concentrado",
    tribunal: "stf",
    termos: pack(
      ["ação direta de inconstitucionalidade", "ADI ilegitimidade ativa"],
      ["arguição de descumprimento de preceito fundamental", "ADPF subsidiariedade"],
      ["ação declaratória de constitucionalidade", "ADC ausência controvérsia judicial"],
      ["ADI por omissão", "omissão inconstitucional não caracterizada"],
      ["medida cautelar em ADI", "cautelar ADI urgência não demonstrada"],
      ["controle de constitucionalidade lei estadual", "lei estadual competência concorrente"]
    ),
  },
  {
    rotulo: "STF · direitos fundamentais",
    tribunal: "stf",
    termos: pack(
      ["liberdade de expressão discurso de ódio", "liberdade de expressão honra personalidade"],
      ["privacidade dados pessoais interceptação", "quebra de sigilo proporcionalidade"],
      ["igualdade concurso público", "concurso público discricionariedade administrativa"],
      ["saúde medicamento STF reserva do possível", "fornecimento medicamento política pública"],
      ["educação vaga escola pública", "vaga escolar discricionariedade orçamentária"],
      ["prisão preventiva presunção de inocência", "prisão preventiva garantia da ordem pública"]
    ),
  },
  {
    rotulo: "STJ · MS ROC constitucional",
    tribunal: "stj",
    termos: pack(
      ["mandado de segurança STJ autoridade coatora", "mandado de segurança prova pré-constituída"],
      ["recurso ordinário constitucional STJ", "recurso ordinário matéria infraconstitucional"],
      ["reclamação STJ preservar competência", "reclamação STJ decisão não vinculante"],
      ["recurso especial prequestionamento", "recurso especial Súmula 7"],
      ["agravo em recurso especial", "agravo especial deficiência de fundamentação"],
      ["conflito de competência STJ", "conflito competência justiça comum trabalho"]
    ),
  },
  {
    rotulo: "STJ · LGPD digital (retoma 74)",
    tribunal: "stj",
    termos: pack(
      ["LGPD dano moral vazamento de dados", "vazamento de dados ausência dano"],
      ["eliminação de dados pessoais obrigação de fazer", "base legal legítimo interesse LGPD"],
      ["tratamento de dados sem consentimento", "tratamento de dados hipótese legal"],
      ["direito ao esquecimento internet", "esquecimento liberdade de informação"],
      ["marco civil da internet provedor", "provedor notificação judicial"],
      ["golpe aplicativo mensagem banco", "golpe culpa exclusiva da vítima"]
    ),
  },
  {
    rotulo: "STJ · eleitoral REsp (sem TSE)",
    tribunal: "stj",
    termos: pack(
      ["inelegibilidade condenação criminal", "inelegibilidade ausência trânsito em julgado"],
      ["recurso especial eleitoral inelegibilidade", "recurso especial eleitoral Súmula 7"],
      ["abuso de poder econômico cassação", "abuso de poder potencialidade não comprovada"],
      ["ficha limpa lei complementar 64", "ficha limpa distinção do caso"],
      ["perda de mandato parlamentar", "perda de mandato devido processo legal"],
      ["prestação de contas campanha irregular", "contas campanha irregularidade sanável"]
    ),
  },
  {
    rotulo: "STJ · conselhos profissionais (retoma 79)",
    tribunal: "stj",
    termos: pack(
      ["OAB processo disciplinar cerceamento de defesa", "OAB processo disciplinar contraditório"],
      ["CRM sanção ética proporcionalidade", "CRM infração ética comprovada"],
      ["CREA exercício irregular engenharia", "CREA atribuição profissional regular"],
      ["CRC exercício ilegal contabilidade", "CRC inscrição regular"],
      ["conselho profissional anuidade", "anuidade conselho cobrança devida"],
      ["mandado de segurança conselho profissional", "MS conselho discricionariedade ética"]
    ),
  },
  {
    rotulo: "STJ · internacional homologação",
    tribunal: "stj",
    termos: pack(
      ["homologação de sentença estrangeira", "sentença estrangeira ofensa à ordem pública"],
      ["alimentos sentença estrangeira homologação", "alimentos estrangeiros competência brasileira"],
      ["divórcio estrangeiro homologação STJ", "divórcio estrangeiro requisitos formais"],
      ["carta rogatória cumprimento", "carta rogatória ofensa soberania"],
      ["cooperação jurídica internacional", "cooperação internacional recusa"],
      ["contrato internacional lei aplicável", "lei aplicável ordem pública brasileira"]
    ),
  },
  {
    rotulo: "STJ · CDC banco Súmula 479",
    tribunal: "stj",
    termos: pack(
      ["Súmula 479 responsabilidade banco fraude", "fraude bancária culpa exclusiva da vítima"],
      ["golpe pix fortuito interno banco", "golpe pix fortuito externo"],
      ["negativação indevida dano moral", "negativação débito exigível"],
      ["juros remuneratórios taxa média de mercado", "juros contratuais liberdade de pactuação"],
      ["superendividamento CDC", "superendividamento plano de pagamento"],
      ["repetição de indébito dobra CDC", "repetição indébito engano justificável"]
    ),
  },
  {
    rotulo: "STJ · família alimentos",
    tribunal: "stj",
    termos: pack(
      ["alimentos binômio necessidade possibilidade", "alimentos valor excessivo"],
      ["alimentos avoengos obrigação subsidiária", "alimentos avoengos pai com capacidade"],
      ["guarda compartilhada melhor interesse", "guarda unilateral excepcionalidade"],
      ["exoneração de alimentos filho maior", "exoneração alimentos curso universitário"],
      ["união estável partilha", "união estável namoro"],
      ["alienação parental convivência", "alienação parental não caracterizada"]
    ),
  },
  {
    rotulo: "STJ · marítimo (retoma 41)",
    tribunal: "stj",
    termos: pack(
      ["transporte marítimo avaria da carga", "avaria marítima caso fortuito"],
      ["conhecimento de embarque título", "conhecimento de embarque vício"],
      ["responsabilidade do armador", "armador cláusula de não indenizar"],
      ["tarifa portuária ANTAQ", "tarifa portuária tabela regulada"],
      ["afretamento descumprimento", "afretamento caso fortuito"],
      ["prescrição marítima transporte de carga", "prescrição marítima prazo"]
    ),
  },
  {
    rotulo: "TRF3 · previdenciário tempo especial",
    tribunal: "trf3",
    termos: pack(
      ["aposentadoria tempo especial ruído", "tempo especial EPI eficaz"],
      ["conversão de tempo especial em comum", "conversão especial após reforma"],
      ["aposentadoria por tempo de contribuição", "tempo de contribuição vínculo não comprovado"],
      ["enquadramento atividade especial", "atividade especial categoria profissional"],
      ["laudo técnico condições ambientais", "PPP laudo divergente"],
      ["reafirmação da DER", "reafirmação DER fato posterior"]
    ),
  },
  {
    rotulo: "TRF3 · BPC auxílio incapacidade",
    tribunal: "trf3",
    termos: pack(
      ["benefício de prestação continuada deficiência", "BPC renda familiar superior"],
      ["auxílio por incapacidade temporária", "incapacidade temporária capacidade residual"],
      ["aposentadoria por incapacidade permanente", "incapacidade permanente reabilitação"],
      ["auxílio-acidente redução da capacidade", "auxílio-acidente sequela não comprovada"],
      ["pensão por morte qualidade de segurado", "pensão por morte união estável"],
      ["salário-maternidade qualidade de segurada", "salário-maternidade carência"]
    ),
  },
  {
    rotulo: "TRF4 · rural e segurado especial",
    tribunal: "trf4",
    termos: pack(
      ["aposentadoria rural início de prova material", "aposentadoria rural prova exclusivamente testemunhal"],
      ["segurado especial economia familiar", "segurado especial descaracterização"],
      ["tempo rural menor", "tempo rural idade mínima"],
      ["aposentadoria híbrida rural urbana", "aposentadoria híbrida qualidade de segurado"],
      ["BPC idoso grupo familiar", "BPC idoso renda per capita"],
      ["certidão de tempo de contribuição", "CTC vínculos concomitantes"]
    ),
  },
  {
    rotulo: "TRF4 · revisões e teto",
    tribunal: "trf4",
    termos: pack(
      ["revisão da vida toda", "revisão da vida toda tese superada"],
      ["revisão do teto previdenciário", "revisão teto decadência"],
      ["aposentadoria especial vinte e cinco anos", "aposentadoria especial agente não permanente"],
      ["NTEP nexo técnico epidemiológico", "NTEP presunção elidida"],
      ["auxílio-reclusão baixa renda", "auxílio-reclusão renda acima do limite"],
      ["desaposentação", "desaposentação impossibilidade jurídica"]
    ),
  },
  {
    rotulo: "TRF3 · administrativo federal",
    tribunal: "trf3",
    termos: pack(
      ["mandado de segurança servidor federal", "mandado de segurança direito líquido não comprovado"],
      ["anulação de ato administrativo", "ato administrativo presunção de legitimidade"],
      ["concurso público anulação de questão", "concurso público gabarito válido"],
      ["licitação inexigibilidade", "inexigibilidade hipótese legal"],
      ["improbidade administrativa dolo", "improbidade ausência dolo"],
      ["desapropriação indenização", "desapropriação valor suficiente"]
    ),
  },
  {
    rotulo: "TST · jornada horas extras",
    tribunal: "tst",
    termos: pack(
      ["horas extras ônus da prova cartão de ponto", "cartão de ponto jornada britânica"],
      ["intervalo intrajornada", "intervalo intrajornada concedido"],
      ["adicional noturno prorrogação", "adicional noturno horário diurno"],
      ["banco de horas acordo coletivo", "banco de horas acordo individual"],
      ["sobreaviso prontidão", "sobreaviso celular sem restrição"],
      ["horas in itinere reforma trabalhista", "tempo à disposição empregador"]
    ),
  },
  {
    rotulo: "TST · pejotização rescisão",
    tribunal: "tst",
    termos: pack(
      ["pejotização vínculo de emprego", "pejotização autonomia"],
      ["terceirização ilícita tomador", "terceirização lícita atividade-meio"],
      ["rescisão indireta falta grave", "rescisão indireta não caracterizada"],
      ["justa causa proporcionalidade", "justa causa abandono de emprego"],
      ["assédio moral indenização trabalho", "poder diretivo assédio não caracterizado"],
      ["equiparação salarial identidade de função", "equiparação diferença de tempo"]
    ),
  },
  {
    rotulo: "CARF · IRPJ CSLL (retoma 64)",
    tribunal: "carf",
    termos: pack(
      ["IRPJ omissão de receita", "omissão de receita presunção elidida"],
      ["CSLL despesa indedutível", "CSLL despesa operacional"],
      ["distribuição disfarçada de lucros", "DDL valor de mercado"],
      ["ágio interno substância econômica", "ágio com substância"],
      ["preço de transferência", "preços de transferência método"],
      ["prejuízo fiscal trava", "compensação prejuízo fiscal"]
    ),
  },
  {
    rotulo: "CARF · PIS COFINS IPI",
    tribunal: "carf",
    termos: pack(
      ["PIS COFINS crédito de insumo", "crédito PIS COFINS glosado"],
      ["PIS COFINS não cumulatividade", "regime cumulativo PIS"],
      ["IPI crédito industrialização", "IPI crédito produto acabado"],
      ["multa de ofício sonegação", "multa de ofício afastada"],
      ["compensação PERDCOMP", "crédito não homologado"],
      ["contribuição previdenciária verba indenizatória", "verba salarial incidência"]
    ),
  },
  {
    rotulo: "TJSP · IPTU ISS ICMS (retoma 77)",
    tribunal: "tjsp",
    termos: pack(
      ["embargos à execução fiscal IPTU", "execução fiscal CDA líquida"],
      ["IPTU progressividade", "IPTU alíquota legal"],
      ["ISS local da prestação", "ISS estabelecimento prestador"],
      ["ICMS crédito escritural", "ICMS glosa de crédito"],
      ["exceção de pré-executividade fiscal", "pré-executividade dilação de prova"],
      ["ITCMD doação", "ITCMD fato gerador"]
    ),
  },
  {
    rotulo: "TJMG · execução fiscal estadual",
    tribunal: "tjmg",
    termos: pack(
      ["embargos à execução fiscal IPTU", "execução fiscal CDA"],
      ["ISS município local da prestação", "ISS prestador"],
      ["ICMS substituição tributária", "substituição tributária base de cálculo"],
      ["taxa de coleta de lixo", "taxa lixo contraprestação"],
      ["redirecionamento execução fiscal sócio", "redirecionamento dissolução irregular"],
      ["prescrição intercorrente execução fiscal", "prescrição intercorrente não consumada"]
    ),
  },
  {
    rotulo: "TJRJ · execução fiscal municipal",
    tribunal: "tjrj",
    termos: pack(
      ["embargos à execução fiscal IPTU", "CDA certeza liquidez"],
      ["ISS construção civil", "ISS local da obra"],
      ["ITBI base de cálculo", "ITBI valor venal"],
      ["taxa de fiscalização", "taxa poder de polícia"],
      ["anulação de lançamento tributário", "lançamento presunção de legitimidade"],
      ["mandado de segurança tributário", "MS tributário dilação de prova"]
    ),
  },
  {
    rotulo: "TJSP · JEC temas quentes",
    tribunal: "tjsp",
    termos: pack(
      ["juizado especial cível dano moral negativação", "negativação débito exigível juizado"],
      ["juizado especial cível atraso de voo", "atraso de voo fortuito externo"],
      ["juizado especial cível golpe pix banco", "golpe pix culpa da vítima juizado"],
      ["juizado especial cível plano de saúde cobertura", "plano de saúde rol ANS juizado"],
      ["juizado especial cível vício de produto", "vício de produto mau uso"],
      ["juizado especial cível energia elétrica corte", "corte de energia inadimplência"]
    ),
  },
  {
    rotulo: "TJSP · imobiliário (queries curtas)",
    tribunal: "tjsp",
    termos: pack(
      ["despejo locação aluguel", "despejo mora purgada"],
      ["renovatória de locação comercial", "renovatória decadência"],
      ["consignação de aluguel", "consignação valor insuficiente"],
      ["bem de família impenhorabilidade", "penhora bem de família"],
      ["atraso na entrega do imóvel", "atraso de obra caso fortuito"],
      ["distrato imobiliário retenção", "distrato percentual de retenção"]
    ),
  },
  {
    rotulo: "TJSP · consumidor saúde",
    tribunal: "tjsp",
    termos: pack(
      ["plano de saúde negativa de cobertura", "negativa de cobertura contratual"],
      ["fornecimento de medicamento obrigação de fazer", "medicamento off label"],
      ["home care plano de saúde", "home care não prescrito"],
      ["reajuste de plano de saúde idoso", "reajuste faixa etária"],
      ["erro médico nexo causal", "erro médico evolução natural"],
      ["urgência emergência carência", "carência contratual"]
    ),
  },
  // —— Vitrine / lacunas (após lote ~227 no diário) ——
  {
    rotulo: "TJSP · JEC reforço vitrine",
    tribunal: "tjsp",
    termos: pack(
      ["juizado especial cível superendividamento", "superendividamento mínimo existencial"],
      ["juizado especial cível compra online atraso", "atraso entrega caso fortuito"],
      ["juizado especial cível telefonia cobrança indevida", "telefonia serviço prestado"],
      ["juizado especial cível inversão ônus prova", "inversão ônus prova indeferida"],
      ["juizado especial cível honorários sucumbência", "honorários juizado sucumbência recíproca"],
      ["juizado especial cível tutela de urgência", "tutela antecipada juizado indeferida"]
    ),
  },
  {
    rotulo: "TJMG · JEC reforço",
    tribunal: "tjmg",
    termos: pack(
      ["juizado especial cível golpe pix", "golpe pix culpa exclusiva vítima"],
      ["juizado especial cível negativação indevida", "negativação débito exigível"],
      ["juizado especial cível vício produto CDC", "vício produto mau uso"],
      ["juizado especial cível atraso voo", "atraso voo fortuito externo"],
      ["juizado especial cível corte energia", "corte energia inadimplência"],
      ["recurso inominado juizado", "recurso inominado deserção"]
    ),
  },
  {
    rotulo: "STJ · digital LGPD vitrine",
    tribunal: "stj",
    termos: pack(
      ["LGPD vazamento dados indenização", "vazamento dados ausência dano moral"],
      ["LGPD direito ao esquecimento", "direito ao esquecimento liberdade informação"],
      ["tratamento de dados sem consentimento", "base legal legítimo interesse"],
      ["responsabilidade controlador operador LGPD", "operador mera execução"],
      ["phishing banco responsabilidade", "phishing culpa exclusiva consumidor"],
      ["exclusão conteúdo internet", "conteúdo internet liberdade expressão"]
    ),
  },
  {
    rotulo: "TJSP · digital / golpes",
    tribunal: "tjsp",
    termos: pack(
      ["golpe whatsapp transferência", "golpe whatsapp culpa da vítima"],
      ["clonagem chip telefonia", "clonagem chip fortuito externo"],
      ["marketplace marketplace responsabilidade", "marketplace intermediação"],
      ["criptomoeda exchange falha", "exchange caso fortuito"],
      ["deepfake dano moral", "imagem uso indevido"],
      ["LGPD vazamento cadastro", "vazamento dados sem dano"]
    ),
  },
  {
    rotulo: "TJSP · erro médico",
    tribunal: "tjsp",
    termos: pack(
      ["erro médico nexo causal indenização", "erro médico complicação inerente"],
      ["responsabilidade hospital equipe", "hospital ato exclusivo médico particular"],
      ["prontuário médico sigilo prova", "prontuário recusa injustificada"],
      ["cirurgia bariátrica cobertura", "cirurgia bariátrica requisitos ANS"],
      ["infecção hospitalar nexo", "infecção hospitalar fato de terceiro"],
      ["obrigação de resultado cirurgia plástica", "cirurgia plástica obrigação de meio"]
    ),
  },
  {
    rotulo: "TJSP · JECRIM",
    tribunal: "tjsp",
    termos: pack(
      ["juizado especial criminal vias de fato", "vias de fato lesão corporal"],
      ["transação penal Juizado Criminal", "transação penal descumprimento"],
      ["lesão corporal leve JECRIM", "lesão corporal leve composição"],
      ["ameaça Juizado Criminal", "ameaça ausência prova"],
      ["injúria real JECRIM", "injúria composição civil"],
      ["recurso JECRIM tempestividade", "recurso JECRIM deserção"]
    ),
  },
  {
    rotulo: "TRF4 · ambiental",
    tribunal: "trf4",
    termos: pack(
      ["dano ambiental responsabilidade objetiva", "dano ambiental nexo causal"],
      ["licença ambiental anulação", "licença ambiental discricionariedade"],
      ["APP preservação permanente", "APP área consolidada"],
      ["auto de infração IBAMA", "auto IBAMA contraditório"],
      ["inversão ônus prova ambiental", "ônus prova ambiental não invertido"],
      ["ação civil pública ambiental", "ACP ambiental ilegitimidade"]
    ),
  },
  {
    rotulo: "TST · trabalhista reforço",
    tribunal: "tst",
    termos: pack(
      ["horas extras intervalo", "horas extras acordo coletivo"],
      ["assédio moral trabalhista", "assédio moral não configurado"],
      ["verbas rescisórias atraso", "verbas rescisórias quitação"],
      ["FGTS diferença depósito", "FGTS prescrição"],
      ["justa causa desídia", "justa causa não comprovada"],
      ["danos morais trabalhista", "danos morais mero aborrecimento"]
    ),
  },
  {
    rotulo: "TJSP · família reforço",
    tribunal: "tjsp",
    termos: pack(
      ["alimentos menor capacidade econômica", "alimentos exoneração"],
      ["guarda compartilhada interesse da criança", "guarda unilateral"],
      ["divórcio partilha de bens", "partilha bem particular"],
      ["união estável reconhecimento", "união estável não comprovada"],
      ["regulamentação de visitas", "visitas descumprimento"],
      ["pensão alimentícia execução", "alimentos prisão civil"]
    ),
  },
  {
    rotulo: "TRF3 · previdenciário reforço",
    tribunal: "trf3",
    termos: pack(
      ["aposentadoria por tempo de contribuição", "tempo especial não comprovado"],
      ["auxílio-doença incapacidade", "incapacidade não demonstrada"],
      ["BPC LOAS requisitos", "BPC renda per capita"],
      ["aposentadoria rural segurado especial", "rural ausência prova material"],
      ["revisão da vida toda", "revisão benefício decadência"],
      ["salário-maternidade", "salário-maternidade qualidade de segurada"]
    ),
  },
];

/** 6 cortes × 6 packs = 36 lotes (substitui o volume genérico A–F). */
export const FEDERAIS_POR_CORTE: Record<
  string,
  { rotulo: string; termos: TermoSeed[] }[]
> = {
  tst: [
    {
      rotulo: "intervalo adicional",
      termos: pack(
        ["intervalo interjornadas onze horas", "intervalo interjornadas reduzido"],
        ["adicional de insalubridade grau", "insalubridade laudo negativo"],
        ["adicional de periculosidade", "periculosidade tempo de exposição"],
        ["acúmulo de função plus salarial", "acúmulo de função contratado"],
        ["desvio de função diferenças", "desvio de função enquadramento"],
        ["equiparação salarial paradigma", "paradigma diferença de produtividade"]
      ),
    },
    {
      rotulo: "verbas rescisórias",
      termos: pack(
        ["multa do artigo 477 CLT", "verbas rescisórias tempestivas"],
        ["multa do artigo 467 CLT", "verbas incontroversas pagas"],
        ["aviso prévio proporcional", "aviso prévio indenizado"],
        ["FGTS saque rescisão", "FGTS prescrição"],
        ["seguro-desemprego guia", "pedido de demissão seguro-desemprego"],
        ["homologação rescisão sindicato", "homologação dispensada reforma"]
      ),
    },
    {
      rotulo: "dano moral trabalho",
      termos: pack(
        ["assédio sexual trabalho", "assédio sexual prova insuficiente"],
        ["revista íntima dano moral", "revista íntima sem contato físico"],
        ["dano existencial jornada excessiva", "jornada contratual dano existencial"],
        ["doença ocupacional nexo", "doença ocupacional concausa"],
        ["acidente de trabalho estabilidade", "estabilidade acidentária culpa da vítima"],
        ["discriminação no emprego", "dispensa imotivada poder potestativo"]
      ),
    },
    {
      rotulo: "estabilidade grupo",
      termos: pack(
        ["estabilidade gestante contrato determinado", "estabilidade gestante pedido de demissão"],
        ["cipeiro estabilidade provisória", "cipeiro mandato encerrado"],
        ["preposto estabilidade dirigente sindical", "dirigente sindical estabilidade"],
        ["grupo econômico solidariedade", "grupo econômico ausência comunhão"],
        ["sucessão trabalhista", "sucessão trabalhista grupo"],
        ["responsabilidade subsidiária tomador", "tomador fiscalização regular"]
      ),
    },
    {
      rotulo: "teletrabalho plataforma",
      termos: pack(
        ["teletrabalho controle de jornada", "teletrabalho atividade externa"],
        ["motorista de aplicativo vínculo", "aplicativo autonomia do prestador"],
        ["trabalho intermitente", "contrato intermitente validade"],
        ["contrato a prazo determinado", "contrato determinado sucessivos"],
        ["home office despesas", "home office acordo individual"],
        ["banco de horas eletrônico", "banco de horas compensação"]
      ),
    },
    {
      rotulo: "processo do trabalho",
      termos: pack(
        ["recurso ordinário tempestividade", "recurso ordinário deserção"],
        ["agravo de petição execução", "agravo de petição garantia do juízo"],
        ["embargos à execução trabalhista", "embargos execução excesso"],
        ["jus postulandi capacidade", "jus postulandi recurso"],
        ["honorários sucumbenciais reforma", "honorários sucumbenciais justiça gratuita"],
        ["execução provisória trabalhista", "execução provisória caução"]
      ),
    },
  ],
  trf3: [
    {
      rotulo: "aposentadoria urbana",
      termos: pack(
        ["aposentadoria por idade urbana", "carência aposentadoria por idade"],
        ["períodos concomitantes contribuição", "vínculos concomitantes CTC"],
        ["alíquota complementar facultativo", "facultativo recolhimento insuficiente"],
        ["tempo de serviço público CTC", "CTC recusa do INSS"],
        ["revisão do artigo 29", "revisão benefício decadência"],
        ["abono salarial PIS", "abono PIS requisito"]
      ),
    },
    {
      rotulo: "incapacidade perícia",
      termos: pack(
        ["perícia judicial incapacidade INSS", "perícia judicial capacidade laborativa"],
        ["auxílio-doença restabelecimento", "alta programada INSS"],
        ["isenção de carência doença grave", "carência doença não listada"],
        ["acidente de qualquer natureza", "acidente nexo não comprovado"],
        ["reabilitação profissional INSS", "reabilitação recusa do segurado"],
        ["pensão por morte filho inválido", "pensão morte dependente não comprovado"]
      ),
    },
    {
      rotulo: "servidor federal",
      termos: pack(
        ["adicional de insalubridade servidor", "adicional servidor laudo"],
        ["licença capacitação servidor", "licença capacitação interesse da administração"],
        ["remoção servidor federal", "remoção discricionariedade"],
        ["acumulação de cargos públicos", "acumulação cargos hipótese constitucional"],
        ["aposentadoria servidor RPPS", "proventos paridade"],
        ["PAD processo administrativo disciplinar", "PAD contraditório"]
      ),
    },
    {
      rotulo: "tributário federal",
      termos: pack(
        ["execução fiscal União redirecionamento", "redirecionamento sócio União"],
        ["embargos à execução fiscal federal", "CDA União liquidez"],
        ["compensação tributária federal", "compensação crédito não reconhecido"],
        ["IRPF dedução despesa médica", "IRPF glosa dedução"],
        ["ITR imposto territorial rural", "ITR área de preservação"],
        ["mandado de segurança tributário federal", "MS tributário via inadequada"]
      ),
    },
    {
      rotulo: "saúde SUS medicamento",
      termos: pack(
        ["fornecimento de medicamento SUS", "medicamento não incorporado CONITEC"],
        ["obrigação de fazer tratamento SUS", "tratamento experimental SUS"],
        ["fila de cirurgia SUS", "fila SUS reserva do possível"],
        ["home care SUS", "home care competência municipal"],
        ["insumo médico SUS", "insumo protocolo clínico"],
        ["transporte para tratamento de saúde", "transporte sanitário competência"]
      ),
    },
    {
      rotulo: "ambiental IBAMA",
      termos: pack(
        ["auto de infração IBAMA", "auto IBAMA contraditório"],
        ["embargo de atividade ambiental", "embargo atividade sem licença"],
        ["multa ambiental proporcionalidade", "multa ambiental dosimetria"],
        ["APP área de preservação permanente", "APP área consolidada"],
        ["CAR cadastro ambiental rural", "CAR sobreposição"],
        ["ação civil pública ambiental", "ACP ambiental nexo poluidor"]
      ),
    },
  ],
  trf4: [
    {
      rotulo: "especial ruído agente",
      termos: pack(
        ["ruído ocupacional aposentadoria especial", "ruído abaixo do limite"],
        ["agentes químicos tempo especial", "agente químico EPI eficaz"],
        ["eletricidade tempo especial", "eletricidade tensão inferior"],
        ["vigilante tempo especial", "vigilante arma de fogo"],
        ["frigorífico tempo especial", "câmara fria insalubridade"],
        ["motorista ônibus tempo especial", "motorista penosidade"]
      ),
    },
    {
      rotulo: "rural sul",
      termos: pack(
        ["boia-fria aposentadoria rural", "boia-fria ausência prova material"],
        ["pescador artesanal segurado especial", "pescador descaracterização"],
        ["outorga de terra INCRA", "módulo rural comprovação"],
        ["contrato de parceria agrícola INSS", "parceria descaracteriza segurado especial"],
        ["notas fiscais de produtor rural", "notas fiscais insuficientes"],
        ["união estável rural dependente", "dependente rural não comprovado"]
      ),
    },
    {
      rotulo: "benefícios assistenciais",
      termos: pack(
        ["BPC deficiência avaliação biopsicossocial", "BPC deficiência não caracterizada"],
        ["BPC idoso sessenta e cinco anos", "BPC idoso renda do cônjuge"],
        ["benefício assistencial menor", "BPC menor renda familiar"],
        ["auxílio-inclusão pessoa com deficiência", "auxílio-inclusão requisito"],
        ["isenção de imposto pessoa com deficiência", "isenção IPI deficiência"],
        ["passe livre interesse público", "passe livre requisito"]
      ),
    },
    {
      rotulo: "processo JEF",
      termos: pack(
        ["Juizado Especial Federal competência", "JEF valor da causa excedido"],
        ["recurso inominado JEF", "recurso inominado JEF intempestivo"],
        ["pedido de uniformização TNU", "uniformização TNU cabimento"],
        ["tutela de urgência previdenciária", "tutela antecipada INSS perigo"],
        ["execução contra a Fazenda INSS", "precatório RPV previdenciário"],
        ["honorários sucumbenciais INSS", "honorários fazenda pública"]
      ),
    },
    {
      rotulo: "aduaneiro comércio",
      termos: pack(
        ["lançamento aduaneiro", "lançamento aduaneiro presunção"],
        ["multa aduaneira proporcionalidade", "multa aduaneira descumprimento"],
        ["drawback regime aduaneiro", "drawback prazo"],
        ["classificação fiscal mercadoria", "classificação NCM divergente"],
        ["dumping direito antidumping", "antidumping circunscrição"],
        ["zona franca benefícios fiscais", "zona franca requisito"]
      ),
    },
    {
      rotulo: "improbidade federal",
      termos: pack(
        ["improbidade administrativa ato ímprobo", "improbidade dolo específico"],
        ["indisponibilidade de bens improbidade", "indisponibilidade proporcional"],
        ["licitação fraude federal", "licitação regularidade"],
        ["enriquecimento ilícito agente", "enriquecimento ilícito não comprovado"],
        ["lei de improbidade nova", "improbidade retroatividade benigna"],
        ["acordo de não persecução cível", "ANPC improbidade"]
      ),
    },
  ],
  carf: [
    {
      rotulo: "IRPJ lucro real",
      termos: pack(
        ["IRPJ lucro real glosa de despesa", "despesa necessária IRPJ"],
        ["subcapitalização juros", "thin cap juros dedutíveis"],
        ["variação cambial tributação", "variação cambial regime"],
        ["amortização de ágio", "ágio amortização substância"],
        ["lucro da exploração", "lucro exploração incentivo"],
        ["estimativa mensal IRPJ", "estimativa IRPJ saldo"]
      ),
    },
    {
      rotulo: "PIS COFINS insumo",
      termos: pack(
        ["conceito de insumo PIS COFINS", "insumo glosado"],
        ["crédito de ICMS na base PIS", "ICMS destacado PIS"],
        ["exclusão do ICMS da base PIS", "tema ICMS PIS"],
        ["frete crédito PIS COFINS", "frete glosa crédito"],
        ["energia elétrica crédito PIS", "energia crédito não cumulativo"],
        ["aluguel de prédio crédito PIS", "aluguel crédito glosado"]
      ),
    },
    {
      rotulo: "contribuições previdenciárias",
      termos: pack(
        ["contribuição previdenciária 13º salário", "13º incidência previdenciária"],
        ["pró-labore contribuição", "pró-labore mínimo"],
        ["verba indenizatória não incidência", "verba salarial disfarçada"],
        ["PLR participação nos lucros", "PLR requisitos lei"],
        ["auxílio-alimentação incidência", "alimentação salário in natura"],
        ["cooperado contribuição previdenciária", "cooperativa responsabilidade"]
      ),
    },
    {
      rotulo: "IPI IOF CIDE",
      termos: pack(
        ["IPI fato gerador saída", "IPI não incidência"],
        ["IOF operações de crédito", "IOF alíquota"],
        ["CIDE combustíveis", "CIDE fato gerador"],
        ["imposto de importação classificação", "imposto de importação NCM"],
        ["PIS COFINS importação", "PIS importação base de cálculo"],
        ["multa isolada ofício", "multa isolada afastada"]
      ),
    },
    {
      rotulo: "planejamento tributário",
      termos: pack(
        ["elisão fiscal planejamento", "elusão abuso de forma"],
        ["norma antielisiva", "propósito negocial"],
        ["reorganização societária ágio", "reorganização substância"],
        ["preço de transferência comparáveis", "método PRL"],
        ["paraíso fiscal operação", "jurisdição com tributação favorecida"],
        ["subcapitalização partes relacionadas", "endividamento excessivo"]
      ),
    },
    {
      rotulo: "processo administrativo fiscal",
      termos: pack(
        ["auto de infração nulidade", "auto de infração regular"],
        ["decadência lançamento tributário", "decadência cinco anos"],
        ["denúncia espontânea", "denúncia espontânea multa"],
        ["arbitramento de lucro", "arbitramento presunção elidida"],
        ["responsabilidade tributária sócio", "responsabilidade sócio dissolução"],
        ["depósito judicial suspensão", "depósito integral débito"]
      ),
    },
  ],
  stj: [
    {
      rotulo: "execução civil",
      termos: pack(
        ["penhora online SISBAJUD", "impenhorabilidade salário"],
        ["excesso de execução", "excesso de execução iliquidez"],
        ["embargos à execução título extrajudicial", "embargos rejeitados título líquido"],
        ["fraude à execução", "fraude à execução má-fé"],
        ["impugnação ao cumprimento de sentença", "impugnação excesso"],
        ["astreintes execução obrigação de fazer", "astreintes redução"]
      ),
    },
    {
      rotulo: "locação imobiliário",
      termos: pack(
        ["despejo por falta de pagamento", "purgação da mora locação"],
        ["garantia locatícia fiança", "exoneração de fiador"],
        ["benfeitorias locação indenização", "benfeitorias autorização"],
        ["ação renovatória prazo", "renovatória proposta incompatível"],
        ["condomínio despesas ordinárias", "despesa extraordinária condomínio"],
        ["usucapião extraordinária", "usucapião área pública"]
      ),
    },
    {
      rotulo: "penal recurso especial",
      termos: pack(
        ["habeas corpus STJ constrangimento", "habeas corpus substitutivo STJ"],
        ["tráfico privilegiado quantidade", "tráfico associação"],
        ["execução penal falta grave", "falta grave regressão"],
        ["prisão preventiva excesso de prazo", "prisão preventiva requisitos"],
        ["absolvição insuficiência de provas", "dúvida razoável condenação"],
        ["indulto comutação", "indulto requisito não preenchido"]
      ),
    },
    {
      rotulo: "empresarial falência",
      termos: pack(
        ["recuperação judicial convolação falência", "recuperação plano viável"],
        ["falência pedido credor", "falência impontualidade"],
        ["desconsideração da personalidade jurídica", "desconsideração ausência abuso"],
        ["sócio responsabilidade dívida", "sócio limitação de responsabilidade"],
        ["marca colidência", "marca uso descritivo"],
        ["trespasse estabelecimento", "trespasse sucessão de dívidas"]
      ),
    },
    {
      rotulo: "administrativo MS",
      termos: pack(
        ["mandado de segurança servidor estadual", "MS decadência"],
        ["concurso público eliminação", "eliminação concurso prevista no edital"],
        ["licitação pregão irregularidade", "pregão regularidade"],
        ["improbidade dano ao erário", "improbidade ausência prejuízo"],
        ["desapropriação justa indenização", "indenização valor venal"],
        ["processo administrativo sanção", "sanção administrativa proporcionalidade"]
      ),
    },
    {
      rotulo: "repetitivos CDC",
      termos: pack(
        ["recurso repetitivo CDC", "distinguishing repetitivo"],
        ["plano de saúde rol taxativo", "rol exemplificativo ANS"],
        ["prescrição ação indenizatória CDC", "prescrição quinquenal CDC"],
        ["cadastro de inadimplentes notificação", "notificação prévia SPC"],
        ["compra e venda veículo vício", "vício aparente decadência"],
        ["telefonia cobrança indevida", "cobrança serviço prestado"]
      ),
    },
  ],
  stf: [
    {
      rotulo: "HC penal constitucional",
      termos: pack(
        ["habeas corpus prisão preventiva STF", "prisão preventiva garantia da ordem"],
        ["execução provisória da pena", "presunção de inocência trânsito"],
        ["foro por prerrogativa de função", "foro crime alheio ao cargo"],
        ["delação premiada homologação", "delação voluntariedade"],
        ["interceptação telefônica prazo", "interceptação proporcionalidade"],
        ["prisão em segunda instância", "cumprimento provisório da pena"]
      ),
    },
    {
      rotulo: "federação competências",
      termos: pack(
        ["competência legislativa concorrente", "lei estadual usurpação"],
        ["isenção tributária convênio CONFAZ", "benefício fiscal sem convênio"],
        ["guerra fiscal ICMS", "incentivo fiscal ICMS inconstitucional"],
        ["município competência tributária", "taxa inconstitucional"],
        ["repartição de receitas", "repasse constitucional"],
        ["intervenção federal estado", "intervenção requisitos"]
      ),
    },
    {
      rotulo: "servidor e concursos",
      termos: pack(
        ["teto remuneratório constitucional", "teto teto do STF"],
        ["acumulação de cargos constituição", "acumulação hipótese permitida"],
        ["concurso público nomeação", "cadastro de reserva expectativa"],
        ["estabilidade servidor estágio", "estágio probatório exoneração"],
        ["greve servidor público", "greve serviço essencial"],
        ["previdência servidor reforma", "regra de transição servidor"]
      ),
    },
    {
      rotulo: "liberdades comunicação",
      termos: pack(
        ["censura liberdade de imprensa", "liberdade de imprensa honra"],
        ["direito de resposta ofensa", "direito de resposta proporcional"],
        ["fake news liberdade de expressão", "desinformação restrição"],
        ["redes sociais responsabilidade", "plataforma liberdade de expressão"],
        ["sigilo da fonte jornalística", "quebra de sigilo de fonte"],
        ["marcha liberdade de reunião", "reunião aviso prévio"]
      ),
    },
    {
      rotulo: "saúde educação mínimos",
      termos: pack(
        ["mínimo existencial saúde", "reserva do possível saúde"],
        ["medicamento de alto custo STF", "medicamento política pública"],
        ["vaga em creche", "creche discricionariedade"],
        ["piso nacional da educação", "piso salarial professor"],
        ["judicialização da saúde", "política pública judicialização"],
        ["transporte escolar", "transporte escolar competência"]
      ),
    },
    {
      rotulo: "processo constitucional",
      termos: pack(
        ["agravo interno STF", "agravo interno manifestamente infundado"],
        ["embargos de divergência STF", "divergência não demonstrada"],
        ["súmula vinculante edição", "súmula vinculante requisitos"],
        ["modulação de efeitos", "modulação segurança jurídica"],
        ["amicus curiae admissão", "amicus curiae representatividade"],
        ["informação processual sigilo", "publicidade dos atos processuais"]
      ),
    },
  ],
};
