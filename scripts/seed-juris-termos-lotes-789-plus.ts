/**
 * Lotes 789–1500 — reforço de lacunas (789–824, pub 2021) + volume multiárea
 * até LOTE_MAX_FASE4 (pub 2023). Tribunais só da API Juris.ai
 * (stf stj tst trf3 trf4 tjce tjgo tjma tjmg tjmt tjpr tjrj tjrs tjsc tjsp carf).
 */

import type { PackTribunal } from "./seed-juris-termos-lotes-prioridade";

type TermoSeed = {
  q: string;
  lado?: "autor" | "reu" | "neutro";
  tribunal?: string;
  /** Janela de publicação (YYYY-MM-DD). Reforço 2021; volume 2023. */
  pubFrom?: string;
};

const PUB_REFORCO = "2021-01-01";
const PUB_VOLUME = "2023-01-01";
export const LOTE_MAX_FASE4 = 1500;

function par(a: string, r: string): TermoSeed[] {
  return [
    { lado: "autor", q: a },
    { lado: "reu", q: r },
  ];
}

function pack(...pares: [string, string][]): TermoSeed[] {
  return pares.flatMap(([a, r]) => par(a, r));
}

function noTribunal(termos: TermoSeed[], tribunal: string): TermoSeed[] {
  return termos.map((t) => ({ ...t, tribunal }));
}

function comPub(termos: TermoSeed[], pubFrom: string): TermoSeed[] {
  return termos.map((t) => ({ ...t, pubFrom }));
}

/** Packs prioritários — um lote por pack. */
const LACUNAS_789: PackTribunal[] = [
  {
    rotulo: "STF · remédios constitucionais III",
    tribunal: "stf",
    termos: pack(
      ["mandado de segurança líquido certo STF", "mandado de segurança decadência"],
      ["habeas corpus constrangimento ilegal STF", "habeas corpus substitutivo"],
      ["habeas data dados pessoais STF", "habeas data via administrativa"],
      ["mandado de injunção omissão legislativa", "mandado de injunção não cabível"],
      ["reclamação constitucional descumprimento", "reclamação ausência paradigma"]
    ),
  },
  {
    rotulo: "STF · ADI ADPF ADC III",
    tribunal: "stf",
    termos: pack(
      ["ação direta inconstitucionalidade lei federal", "ADI ilegitimidade ativa"],
      ["ADPF preceito fundamental", "ADPF subsidiariedade"],
      ["ação declaratória constitucionalidade", "ADC controvérsia judicial"],
      ["modulação efeitos controle concentrado", "modulação efeitos rejeitada"],
      ["medida cautelar ADI urgência", "cautelar ADI indeferida"]
    ),
  },
  {
    rotulo: "STF · direitos fundamentais saúde",
    tribunal: "stf",
    termos: pack(
      ["fornecimento medicamento excepcional STF", "medicamento política pública"],
      ["tratamento fora do SUS judicialização", "tratamento SUS indeferimento"],
      ["mínimo existencial saúde", "reserva do possível saúde pública"],
      ["internação hospitalar urgência", "internação discricionariedade médica"]
    ),
  },
  {
    rotulo: "STJ · eleitoral espelho II",
    tribunal: "stj",
    termos: pack(
      ["inelegibilidade Lei Complementar 64", "inelegibilidade afastada STJ"],
      ["abuso poder econômico eleitoral", "abuso poder não configurado"],
      ["propaganda eleitoral antecipada", "propaganda eleitoral liberdade"],
      ["cassação diploma eleitoral", "cassação diploma prova insuficiente"],
      ["compra de votos crime eleitoral", "compra votos inexistência"]
    ),
  },
  {
    rotulo: "STJ · eleitoral REsp III",
    tribunal: "stj",
    termos: pack(
      ["recurso especial eleitoral STJ", "REsp eleitoral não conhecido"],
      ["prestação de contas campanha", "prestação contas irregularidade"],
      ["pesquisa eleitoral irregular", "pesquisa eleitoral liberdade"],
      ["captação ilícita sufrágio", "captação ilícita não comprovada"]
    ),
  },
  {
    rotulo: "TRF3 · BPC LOAS III",
    tribunal: "trf3",
    termos: pack(
      ["BPC deficiência longa duração", "BPC deficiência não comprovada"],
      ["BPC idoso miserabilidade", "BPC renda per capita superior"],
      ["LOAS critério socioeconômico", "LOAS indeferimento administrativo"],
      ["benefício assistencial revisão", "benefício assistencial decadência"]
    ),
  },
  {
    rotulo: "TRF3 · aposentadoria tempo",
    tribunal: "trf3",
    termos: pack(
      ["aposentadoria tempo contribuição TRF3", "aposentadoria carência insuficiente"],
      ["tempo especial conversão comum", "tempo especial PPP inválido"],
      ["atividade rural segurado especial", "rural ausência início de prova"],
      ["revisão da vida toda TRF3", "revisão vida toda decadência"]
    ),
  },
  {
    rotulo: "TRF4 · especial incapacidade II",
    tribunal: "trf4",
    termos: pack(
      ["aposentadoria especial agente nocivo", "especial laudo insuficiente"],
      ["auxílio doença incapacidade", "auxílio doença alta médica"],
      ["aposentadoria invalidez acidentária", "invalidez nexo não comprovado"],
      ["auxílio acidente sequela permanente", "auxílio acidente sequela mínima"]
    ),
  },
  {
    rotulo: "TRF4 · pensão e salário maternidade",
    tribunal: "trf4",
    termos: pack(
      ["pensão por morte qualidade segurado", "pensão morte dependente não comprovado"],
      ["salário maternidade segurada", "salário maternidade carência"],
      ["auxílio reclusão dependentes", "auxílio reclusão requisitos"],
      ["desconto consignado benefício indevido", "consignado autorização válida"]
    ),
  },
  {
    rotulo: "STJ · previdenciário reforço",
    tribunal: "stj",
    termos: pack(
      ["revisão teto benefício previdenciário", "revisão teto prescrita"],
      ["desaposentação STJ", "desaposentação vedada"],
      ["contribuição previdenciária autônomo", "contribuição autônomo isenção"],
      ["indenização dano moral INSS demora", "demora administrativa não indenizável"]
    ),
  },
  {
    rotulo: "TST · pejotização e vínculo",
    tribunal: "tst",
    termos: pack(
      ["pejotização vínculo empregatício", "pejotização autonomia contratual"],
      ["uberização trabalhador plataforma", "plataforma autonomia motorista"],
      ["terceirização atividade-fim", "terceirização lícita"],
      ["grupo econômico trabalhista", "grupo econômico não configurado"]
    ),
  },
  {
    rotulo: "TST · horas extras III",
    tribunal: "tst",
    termos: pack(
      ["horas extras cartão ponto inválido", "horas extras prova unilateral"],
      ["intervalo interjornada", "intervalo interjornada negociado"],
      ["adicional noturno prorrogação", "adicional noturno não devido"],
      ["sobreaviso escala 12x36", "sobreaviso regime compensado"]
    ),
  },
  {
    rotulo: "TST · rescisão justa causa",
    tribunal: "tst",
    termos: pack(
      ["justa causa desídia", "justa causa não comprovada"],
      ["rescisão indireta empregador", "rescisão indireta requisitos"],
      ["aviso prévio proporcional", "aviso prévio não devido"],
      ["FGTS multa 40 por cento", "FGTS multa não cabível"]
    ),
  },
  {
    rotulo: "CARF · tributário II",
    tribunal: "carf",
    termos: pack(
      ["IRPJ glosa despesa CARF", "IRPJ despesa necessária"],
      ["CSLL base cálculo CARF", "CSLL lançamento regular"],
      ["PIS COFINS não cumulativo", "PIS COFINS crédito indevido"],
      ["multa isolada CARF", "multa isolada proporcionalidade"]
    ),
  },
  {
    rotulo: "CARF · planejamento fiscal",
    tribunal: "carf",
    termos: pack(
      ["planejamento tributário abuso forma", "planejamento tributário lícito"],
      ["ágio amortização fiscal", "ágio amortização glosa"],
      ["preço transferência", "preço transferência ajuste"],
      ["omissão receita CARF", "omissão receita não comprovada"]
    ),
  },
  {
    rotulo: "TJSP · IPTU LEF reforço",
    tribunal: "tjsp",
    termos: pack(
      ["IPTU lançamento ilegal progressividade", "IPTU lançamento regular"],
      ["execução fiscal CDA nula", "execução fiscal CDA válida"],
      ["exceção pré-executividade fiscal", "pré-executividade rejeitada"],
      ["embargos execução fiscal IPTU", "embargos execução improcedentes"]
    ),
  },
  {
    rotulo: "TJMG · IPTU ISS",
    tribunal: "tjmg",
    termos: pack(
      ["IPTU isenção imunidade", "IPTU isenção indevida"],
      ["ISS construção civil", "ISS local prestação"],
      ["execução fiscal municipal", "execução fiscal prescrição"],
      ["ITBI base cálculo venal", "ITBI base valor declarado"]
    ),
  },
  {
    rotulo: "TJRJ · tributário municipal",
    tribunal: "tjrj",
    termos: pack(
      ["IPTU zona oeste Rio", "IPTU lançamento legal"],
      ["ISS sociedade profissionais", "ISS tabela fixa"],
      ["taxa lixo municipal", "taxa lixo serviço específico"],
      ["execução fiscal protesto", "protesto CDA válido"]
    ),
  },
  {
    rotulo: "STJ · LGPD digital II",
    tribunal: "stj",
    termos: pack(
      ["LGPD dano moral vazamento dados", "LGPD dano moral não comprovado"],
      ["tratamento dados consentimento", "tratamento dados base legal"],
      ["golpe pix banco responsabilidade", "golpe pix culpa exclusiva cliente"],
      ["fraude bancária engenharia social", "fraude fortuito externo banco"]
    ),
  },
  {
    rotulo: "STJ · conselhos profissionais",
    tribunal: "stj",
    termos: pack(
      ["anuidade conselho profissional", "anuidade conselho proporcional"],
      ["processo ético disciplinar OAB", "processo ético nulidade"],
      ["CREA registro profissional", "CREA competência"],
      ["CRM exercício ilegal medicina", "CRM sanção proporcional"]
    ),
  },
  {
    rotulo: "STJ · marítimo portuário",
    tribunal: "stj",
    termos: pack(
      ["contrato transporte marítimo avaria", "transporte marítimo fortuito"],
      ["demurrage sobrestadia", "demurrage cláusula válida"],
      ["responsabilidade operador portuário", "operador portuário excludente"],
      ["seguro casco máquina", "seguro marítimo cobertura"]
    ),
  },
  {
    rotulo: "STJ · homologação internacional",
    tribunal: "stj",
    termos: pack(
      ["homologação sentença estrangeira STJ", "homologação ordem pública"],
      ["alimentos sentença estrangeira", "alimentos competência brasileira"],
      ["guarda criança convenção Haia", "guarda Haia retorno"],
      ["apostila Haia documento", "apostila requisito formal"]
    ),
  },
  {
    rotulo: "STJ · erro médico saúde",
    tribunal: "stj",
    termos: pack(
      ["erro médico responsabilidade civil", "erro médico culpa não comprovada"],
      ["obrigação de meio médico", "obrigação resultado estético"],
      ["plano saúde cobertura rol ANS", "plano saúde exclusão contratual"],
      ["negativa cobertura home care", "home care não obrigatório"]
    ),
  },
  {
    rotulo: "TJSP · família alimentos",
    tribunal: "tjsp",
    termos: pack(
      ["alimentos provisórios minoração", "alimentos majoração necessidade"],
      ["guarda compartilhada residência", "guarda unilateral interesse menor"],
      ["alienação parental", "alienação parental não comprovada"],
      ["exoneração alimentos maioridade", "alimentos filhos maiores"]
    ),
  },
  {
    rotulo: "TJSP · criminal processo",
    tribunal: "tjsp",
    termos: pack(
      ["habeas corpus prisão preventiva", "prisão preventiva requisitos"],
      ["relaxamento flagrante ilegal", "flagrante legal"],
      ["absolvição art 386 CPP", "condenação prova suficiente"],
      ["progressão regime prisional", "progressão requisitos"],
    ),
  },
  {
    rotulo: "STJ · administrativo improbidade",
    tribunal: "stj",
    termos: pack(
      ["improbidade administrativa dolo", "improbidade dolo ausente"],
      ["licitação dispensa ilegal", "dispensa licitação cabível"],
      ["servidor público remoção", "remoção interesse público"],
      ["pad processo administrativo", "pad nulidade ampla defesa"]
    ),
  },
  {
    rotulo: "STJ · ambiental ACP",
    tribunal: "stj",
    termos: pack(
      ["ação civil pública ambiental", "ACP ambiental ilegitimidade"],
      ["dano ambiental solidariedade", "dano ambiental nexo causal"],
      ["licença ambiental prévia", "licença indeferimento motivado"],
      ["multa IBAMA proporcionalidade", "multa ambiental legal"]
    ),
  },
  {
    rotulo: "TJSP · consumidor bancário",
    tribunal: "tjsp",
    termos: pack(
      ["revisão contrato bancário juros", "juros remuneratórios livres"],
      ["negativação indevida dano moral", "negativação dívida legítima"],
      ["superendividamento CDC", "superendividamento requisitos"],
      ["cartão crédito limite automático", "cartão crédito contratação"]
    ),
  },
  {
    rotulo: "TJMG · consumidor serviço",
    tribunal: "tjmg",
    termos: pack(
      ["corte energia irregular", "corte energia inadimplência"],
      ["falha prestação serviço telefonia", "telefonia caso fortuito"],
      ["atraso voo dano moral", "atraso voo força maior"],
      ["vício produto CDC", "vício produto decadência"]
    ),
  },
  {
    rotulo: "TJRS · imobiliário",
    tribunal: "tjrs",
    termos: pack(
      ["atraso entrega imóvel construtora", "atraso entrega caso fortuito"],
      ["despejo falta pagamento", "despejo purgação mora"],
      ["usucapião extraordinária", "usucapião requisitos"],
      ["condomínio cobrança taxa", "condomínio taxa indevida"]
    ),
  },
  {
    rotulo: "TJPR · família sucessões",
    tribunal: "tjpr",
    termos: pack(
      ["inventário partilha bens", "inventário sobrepartilha"],
      ["união estável reconhecimento", "união estável não comprovada"],
      ["alimentos avós", "alimentos avós subsidiários"],
      ["regulamentação visitas", "visitas interesse menor"]
    ),
  },
  {
    rotulo: "TST · dano moral trabalhista",
    tribunal: "tst",
    termos: pack(
      ["assédio moral ambiente trabalho", "assédio moral prova frágil"],
      ["assédio sexual trabalhista", "assédio sexual não comprovado"],
      ["doença ocupacional nexo", "doença ocupacional concausa"],
      ["acidente trabalho indenização", "acidente culpa exclusiva vítima"]
    ),
  },
  {
    rotulo: "STF · liberdade expressão",
    tribunal: "stf",
    termos: pack(
      ["liberdade de expressão discurso ódio", "liberdade expressão honra"],
      ["fake news responsabilização", "fake news liberdade informação"],
      ["censura prévia vedação", "restrição proporcional expressão"],
      ["direito de resposta imprensa", "resposta proporcionalidade"]
    ),
  },
  {
    rotulo: "STJ · propriedade intelectual",
    tribunal: "stj",
    termos: pack(
      ["marca registrada contrafação", "marca uso descritivo"],
      ["direito autoral plágio", "direito autoral uso justo"],
      ["patente nulidade INPI", "patente validade"],
      ["concorrência desleal confusão", "concorrência desleal não configurada"]
    ),
  },
  {
    rotulo: "TRF3 · execução fiscal federal",
    tribunal: "trf3",
    termos: pack(
      ["execução fiscal federal CDA", "execução fiscal CDA nula"],
      ["embargos execução fiscal União", "embargos improcedentes"],
      ["penhora bem de família fiscal", "bem de família impenhorável"],
      ["parcelamento débito fiscal", "parcelamento rompido"]
    ),
  },
  {
    rotulo: "TRF4 · servidor público federal",
    tribunal: "trf4",
    termos: pack(
      ["servidor federal adicional", "adicional não devido"],
      ["aposentadoria servidor federal", "aposentadoria requisitos"],
      ["remoção servidor interesse", "remoção discricionariedade"],
      ["PAD federal nulidade", "PAD ampla defesa observada"]
    ),
  },
];

/** TJs da API — ciclo de volume estadual. */
const TJS_API = [
  "tjce",
  "tjgo",
  "tjma",
  "tjmg",
  "tjmt",
  "tjpr",
  "tjrj",
  "tjrs",
  "tjsc",
  "tjsp",
] as const;

/** Temas de volume (pub 2023) — áreas do produto × TJs. */
const TEMAS_VOLUME_TJ: { rotulo: string; termos: TermoSeed[] }[] = [
  {
    rotulo: "civil contratos",
    termos: pack(
      ["revisão contratual onerosidade excessiva", "onerosidade álea normal"],
      ["cláusula penal redução judicial", "cláusula penal proporcional"],
      ["inadimplemento rescisão contratual", "rescisão cumprimento substancial"],
      ["lucros cessantes prova", "lucros cessantes hipotéticos"]
    ),
  },
  {
    rotulo: "civil responsabilidade",
    termos: pack(
      ["dano moral indenização", "dano moral mero aborrecimento"],
      ["dano estético nexo", "dano estético não caracterizado"],
      ["perda do tempo útil", "tempo útil aborrecimento"],
      ["responsabilidade civil omissão", "omissão nexo não comprovado"]
    ),
  },
  {
    rotulo: "consumidor CDC",
    termos: pack(
      ["vício produto CDC", "vício produto decadência"],
      ["propaganda enganosa indenização", "propaganda enganosa não configurada"],
      ["prática abusiva fornecedor", "prática comercial lícita"],
      ["arrependimento compra distância", "arrependimento prazo decadencial"]
    ),
  },
  {
    rotulo: "consumidor bancário",
    termos: pack(
      ["revisão juros bancários", "juros remuneratórios livres"],
      ["negativação indevida dano moral", "negativação dívida legítima"],
      ["golpe pix responsabilidade banco", "golpe pix culpa exclusiva cliente"],
      ["superendividamento CDC", "superendividamento requisitos"]
    ),
  },
  {
    rotulo: "JEC serviços",
    termos: pack(
      ["juizado especial energia cobrança indevida", "energia consumo comprovado"],
      ["juizado especial telefonia falha", "telefonia caso fortuito"],
      ["juizado especial atraso entrega", "atraso entrega fortuito"],
      ["juizado especial estacionamento dano", "estacionamento cláusula"]
    ),
  },
  {
    rotulo: "JEC viagem saúde",
    termos: pack(
      ["atraso voo dano moral JEC", "atraso voo força maior"],
      ["cancelamento passagem reembolso", "cancelamento tarifa não reembolsável"],
      ["plano saúde negativa cobertura JEC", "plano exclusão contratual"],
      ["overbooking hotel indenização", "overbooking reacomodação"]
    ),
  },
  {
    rotulo: "família alimentos",
    termos: pack(
      ["alimentos provisórios minoração", "alimentos majoração necessidade"],
      ["guarda compartilhada residência", "guarda unilateral interesse menor"],
      ["exoneração alimentos maioridade", "alimentos filhos maiores"],
      ["alimentos avós subsidiários", "alimentos avós não cabíveis"]
    ),
  },
  {
    rotulo: "família sucessões",
    termos: pack(
      ["inventário partilha bens", "inventário sobrepartilha"],
      ["união estável reconhecimento", "união estável não comprovada"],
      ["testamento nulidade forma", "testamento forma válida"],
      ["petição de herança", "petição herança decadência"]
    ),
  },
  {
    rotulo: "imobiliário locação",
    termos: pack(
      ["despejo falta pagamento", "despejo purgação mora"],
      ["revisão aluguel valor de mercado", "aluguel valor contratual"],
      ["benfeitorias locatício indenização", "benfeitorias voluptuárias"],
      ["garantia locatícia fiador", "fiador exoneração"]
    ),
  },
  {
    rotulo: "imobiliário condomínio",
    termos: pack(
      ["condomínio cobrança taxa", "condomínio taxa indevida"],
      ["atraso entrega imóvel construtora", "atraso entrega caso fortuito"],
      ["usucapião extraordinária", "usucapião requisitos"],
      ["infiltração unidade vizinha", "infiltração área comum"]
    ),
  },
  {
    rotulo: "trabalhista residual",
    termos: pack(
      ["acidente trabalho indenização civil", "acidente culpa exclusiva vítima"],
      ["assédio moral justiça comum", "assédio moral prova frágil"],
      ["equiparação salarial residual", "equiparação diferença função"],
      ["doença ocupacional nexo civil", "nexo ocupacional não comprovado"]
    ),
  },
  {
    rotulo: "previdência local",
    termos: pack(
      ["benefício previdenciário negado", "benefício indeferimento legal"],
      ["aposentadoria tempo contribuição", "aposentadoria carência"],
      ["auxílio doença perícia", "auxílio doença capacidade"],
      ["revisão benefício prescrita", "revisão benefício cabível"]
    ),
  },
  {
    rotulo: "tributário municipal",
    termos: pack(
      ["IPTU lançamento ilegal", "IPTU lançamento regular"],
      ["ISS serviço municipal", "ISS local prestação"],
      ["ITBI base cálculo venal", "ITBI valor declarado"],
      ["execução fiscal CDA nula", "execução fiscal CDA válida"]
    ),
  },
  {
    rotulo: "LEF execução",
    termos: pack(
      ["exceção pré-executividade fiscal", "pré-executividade rejeitada"],
      ["embargos execução fiscal", "embargos improcedentes"],
      ["penhora bem de família fiscal", "bem de família impenhorável"],
      ["parcelamento débito fiscal", "parcelamento rompido"]
    ),
  },
  {
    rotulo: "administrativo",
    termos: pack(
      ["mandado segurança servidor estadual", "mandado segurança decadência"],
      ["concurso público anulação", "concurso público discricionariedade"],
      ["improbidade administrativa dolo", "improbidade dolo ausente"],
      ["licitação dispensa ilegal", "dispensa licitação cabível"]
    ),
  },
  {
    rotulo: "criminal processo",
    termos: pack(
      ["habeas corpus prisão preventiva", "prisão preventiva requisitos"],
      ["relaxamento flagrante ilegal", "flagrante legal"],
      ["absolvição art 386 CPP", "condenação prova suficiente"],
      ["progressão regime prisional", "progressão requisitos"]
    ),
  },
  {
    rotulo: "criminal material",
    termos: pack(
      ["roubo majorado concurso", "roubo tentado desistência"],
      ["estelionato eletrônico", "estelionato culpa da vítima"],
      ["tráfico privilegiado", "tráfico associação"],
      ["violência doméstica medidas", "medidas protetivas revogação"]
    ),
  },
  {
    rotulo: "JECRIM",
    termos: pack(
      ["juizado criminal vias de fato", "vias de fato composição"],
      ["juizado criminal ameaça", "ameaça retratação"],
      ["juizado criminal dano simples", "dano simples composição"],
      ["juizado criminal difamação", "difamação crítica atípica"]
    ),
  },
  {
    rotulo: "constitucional estadual",
    termos: pack(
      ["mandado segurança ato autoridade", "mandado segurança dilação prova"],
      ["direitos fundamentais saúde estado", "reserva do possível saúde"],
      ["liberdade expressão honra", "crítica jornalística lícita"],
      ["acesso informação pública", "sigilo interesse público"]
    ),
  },
  {
    rotulo: "digital LGPD",
    termos: pack(
      ["LGPD dano moral vazamento", "LGPD dano não comprovado"],
      ["golpe whatsapp banco", "golpe whatsapp culpa vítima"],
      ["exclusão conteúdo internet", "conteúdo liberdade expressão"],
      ["cadastro indevido plataforma", "cadastro termo de uso"]
    ),
  },
  {
    rotulo: "ambiental",
    termos: pack(
      ["ação civil pública ambiental", "ACP ambiental ilegitimidade"],
      ["multa ambiental estadual", "multa ambiental proporcional"],
      ["licença ambiental negada", "licença indeferimento motivado"],
      ["APP construção irregular", "APP área consolidada"]
    ),
  },
  {
    rotulo: "médico saúde",
    termos: pack(
      ["erro médico responsabilidade", "erro médico culpa não comprovada"],
      ["plano saúde cobertura rol", "plano exclusão contratual"],
      ["infecção hospitalar nexo", "infecção fato de terceiro"],
      ["cirurgia plástica resultado", "cirurgia obrigação de meio"]
    ),
  },
  {
    rotulo: "empresarial",
    termos: pack(
      ["dissolução parcial sociedade", "dissolução ausência justa causa"],
      ["recuperação judicial credor", "recuperação crédito extraconcursal"],
      ["concorrência desleal confusão", "concorrência desleal não configurada"],
      ["marca uso indevido", "marca uso descritivo"]
    ),
  },
  {
    rotulo: "execução civil",
    termos: pack(
      ["penhora salário impenhorabilidade", "penhora salário excesso"],
      ["SISBAJUD bloqueio excessivo", "bloqueio proporcional"],
      ["fraude à execução alienação", "alienação boa-fé terceiro"],
      ["embargos de terceiro", "embargos terceiro posse precária"]
    ),
  },
  {
    rotulo: "acidente trânsito",
    termos: pack(
      ["acidente trânsito culpa concorrente", "culpa exclusiva da vítima"],
      ["atropelamento indenização", "atropelamento imprudência pedestre"],
      ["danos materiais veículo", "conserto orçamento excessivo"],
      ["seguro DPVAT residual", "DPVAT indenização securitária"]
    ),
  },
  {
    rotulo: "agrário",
    termos: pack(
      ["arrendamento rural rescisão", "arrendamento rural prazo"],
      ["usucapião rural morada", "usucapião rural terra pública"],
      ["CPR execução", "CPR exceção contrato"],
      ["benfeitorias arrendatário", "benfeitorias voluptuárias"]
    ),
  },
  {
    rotulo: "eleitoral espelho",
    termos: pack(
      ["propaganda eleitoral irregular", "propaganda eleitoral liberdade"],
      ["inelegibilidade condenação", "inelegibilidade afastada"],
      ["abuso poder político", "abuso poder não configurado"],
      ["prestação contas campanha", "contas irregularidade formal"]
    ),
  },
  {
    rotulo: "plano saúde avançado",
    termos: pack(
      ["plano saúde home care", "home care não prescrito"],
      ["quimioterapia oral cobertura", "quimioterapia rol ANS"],
      ["reajuste idoso estatuto", "reajuste faixa etária ANS"],
      ["TEA cobertura plano", "TEA rol ANS"]
    ),
  },
  {
    rotulo: "CDC telecom energia",
    termos: pack(
      ["corte energia irregular", "corte energia inadimplência"],
      ["internet banda larga queda", "queda manutenção programada"],
      ["TV assinatura cobrança indevida", "TV período aviso"],
      ["portabilidade número telefonia", "portabilidade recusa técnica"]
    ),
  },
  {
    rotulo: "civil vizinhança",
    termos: pack(
      ["ruído vizinho indenização", "ruído uso normal"],
      ["água chuva escoamento", "escoamento fato natural"],
      ["árvore vizinha dano", "árvore exercício propriedade"],
      ["construção irregular vizinho", "construção alvará válido"]
    ),
  },
  {
    rotulo: "família violência",
    termos: pack(
      ["medidas protetivas Maria Penha", "medidas protetivas revogação"],
      ["alienação parental", "alienação parental não comprovada"],
      ["regulamentação visitas", "visitas interesse menor"],
      ["nome afetivo retificação", "retificação nome ausência prova"]
    ),
  },
  {
    rotulo: "imob compromisso",
    termos: pack(
      ["compromisso compra distrato", "distrato retenção proporcional"],
      ["adjudicação compulsória", "adjudicação falta pagamento"],
      ["compra na planta atraso registro", "atraso registro cartório"],
      ["loteamento obrigação fazer", "loteamento cláusula válida"]
    ),
  },
  {
    rotulo: "fazenda pública",
    termos: pack(
      ["repetição indébito tributário", "repetição prova recolhimento"],
      ["auto infração estadual nulidade", "auto infração regular"],
      ["servidor adicional insalubridade", "insalubridade laudo negativo"],
      ["PAD nulidade ampla defesa", "PAD contraditório observado"]
    ),
  },
  {
    rotulo: "PI estadual",
    termos: pack(
      ["direito autoral plágio", "direito autoral uso justo"],
      ["nome empresarial colidência", "nome empresarial distinção"],
      ["software pirataria abstenção", "software licença válida"],
      ["design industrial contrafação", "design domínio público"]
    ),
  },
  {
    rotulo: "consumidor e-commerce",
    termos: pack(
      ["marketplace responsabilidade", "marketplace intermediário"],
      ["delivery atraso alimento", "atraso delivery fortuito"],
      ["clube assinatura cancelamento", "assinatura período mínimo"],
      ["garantia estendida CDC", "garantia estendida recusa válida"]
    ),
  },
  {
    rotulo: "JEC v2",
    termos: pack(
      ["juizado especial dentista indenização", "tratamento odontológico complicação"],
      ["juizado especial academia mensalidade", "academia fidelidade contratual"],
      ["juizado especial curso EAD", "curso EAD serviço prestado"],
      ["juizado especial extravio encomenda", "extravio fortuito transportadora"]
    ),
  },
  {
    rotulo: "civil seguros",
    termos: pack(
      ["seguro recusa cobertura", "seguro risco excluído"],
      ["seguro prestamista recusa", "seguro prestamista risco"],
      ["seguro vida grupo recusa", "seguro grupo cláusula"],
      ["sinistro indenização securitária", "sinistro má-fé segurado"]
    ),
  },
  {
    rotulo: "penal execução",
    termos: pack(
      ["execução penal remição estudo", "remição falta grave"],
      ["liberdade provisória fiança", "fiança valor excessivo"],
      ["livramento condicional", "livramento requisitos"],
      ["indulto requisitos", "indulto indeferimento"]
    ),
  },
  {
    rotulo: "admin licitação",
    termos: pack(
      ["licitação inexigibilidade ilegal", "inexigibilidade hipótese legal"],
      ["contrato administrativo inexecução", "inexecução caso fortuito"],
      ["desapropriação indenização", "desapropriação valor suficiente"],
      ["tombamento indenização", "tombamento restrição proporcional"]
    ),
  },
  {
    rotulo: "ambiental v2",
    termos: pack(
      ["queimada indenização vizinho", "queimada fato de terceiro"],
      ["desmatamento multa estadual", "desmatamento área consolidada"],
      ["poluição sonora indenização", "poluição sonora limites"],
      ["fauna silvestre apreensão", "apreensão regular"]
    ),
  },
  {
    rotulo: "médico v2",
    termos: pack(
      ["erro diagnóstico indenização", "diagnóstico diferencial razoável"],
      ["parto cesárea dano", "parto evolução natural"],
      ["cirurgia bariátrica complicação", "bariátrica consentimento"],
      ["fornecimento medicamento judicial", "medicamento política pública"]
    ),
  },
  {
    rotulo: "digital v2",
    termos: pack(
      ["deepfake ofensa honra", "ofensa honra prova insuficiente"],
      ["review falso dano moral", "review exercício crítica"],
      ["biometria tratamento dados", "biometria base legal"],
      ["direito ao esquecimento", "esquecimento liberdade informação"]
    ),
  },
  {
    rotulo: "empresarial v2",
    termos: pack(
      ["trespasse estabelecimento dívida", "trespasse sucessão"],
      ["nota promissória aval", "aval prescrição cambiária"],
      ["acordo sócios tag along", "tag along não previsto"],
      ["administrador judicial verba", "verba administrador excessiva"]
    ),
  },
  {
    rotulo: "previdência RPPS",
    termos: pack(
      ["pensão servidor estadual", "pensão dependente não comprovado"],
      ["aposentadoria servidor especial", "tempo especial servidor"],
      ["revisão proventos paridade", "paridade regra transição"],
      ["abono permanência", "abono permanência requisito"]
    ),
  },
  {
    rotulo: "LEF v2",
    termos: pack(
      ["execução fiscal ITBI", "ITBI base de cálculo"],
      ["execução fiscal multa trânsito", "multa trânsito prescrição"],
      ["redirecionamento sócio fiscal", "redirecionamento dissolução irregular"],
      ["penhora faturamento fiscal", "penhora faturamento proporcional"]
    ),
  },
  {
    rotulo: "civil contratos v2",
    termos: pack(
      ["fiança outorga uxória", "fiança validade cônjuge"],
      ["promessa doação exigibilidade", "promessa doação liberalidade"],
      ["contrato preliminar execução", "contrato preliminar recusa"],
      ["evicção responsabilidade alienante", "evicção ciência adquirente"]
    ),
  },
  {
    rotulo: "consumidor banco v2",
    termos: pack(
      ["empréstimo consignado desconto", "consignado contrato válido"],
      ["cheque especial juros", "cheque especial taxa contratual"],
      ["financiamento veículo apreensão", "busca apreensão purgação mora"],
      ["tarifas bancárias abusivas", "tarifa serviço efetivo"]
    ),
  },
  {
    rotulo: "família sucessão v2",
    termos: pack(
      ["colação bem doado", "colação dispensa"],
      ["herança jacente arrecadação", "herança herdeiro habilitado"],
      ["meação companheiro união", "meação bem particular"],
      ["inventário negativo dívida", "inventário dívida espólio"]
    ),
  },
  {
    rotulo: "imob condomínio v2",
    termos: pack(
      ["síndico prestação contas", "prestação contas aprovada"],
      ["multa condominial reiteração", "multa condominial desproporcional"],
      ["animal condomínio convenção", "animal convívio regular"],
      ["airbnb condomínio proibição", "locação temporada propriedade"]
    ),
  },
  {
    rotulo: "JEC energia telecom",
    termos: pack(
      ["oscilação energia dano aparelhos", "oscilação energia fortuito"],
      ["corte indevido energia moral", "corte energia inadimplência"],
      ["aplicativo transporte cancelamento", "cancelamento aplicativo cláusula"],
      ["água esgoto cobrança indevida", "saneamento tarifa devida"]
    ),
  },
  {
    rotulo: "criminal v2",
    termos: pack(
      ["receptação dolo", "receptação ausência dolo"],
      ["falsidade ideológica", "falsidade atipicidade"],
      ["furto energia elétrica", "furto energia atipicidade"],
      ["ameaça violência doméstica", "ameaça retratação representação"]
    ),
  },
  {
    rotulo: "admin servidor",
    termos: pack(
      ["servidor público remoção", "remoção interesse público"],
      ["exoneração servidor anulação", "exoneração discricionariedade"],
      ["licença prêmio servidor", "licença prêmio não implementada"],
      ["adicional noturno servidor", "adicional noturno não devido"]
    ),
  },
  {
    rotulo: "constitucional remédios",
    termos: pack(
      ["habeas data dados pessoais", "habeas data via administrativa"],
      ["mandado injunção omissão", "mandado injunção não cabível"],
      ["reclamação constitucional", "reclamação ausência paradigma"],
      ["habeas corpus constrangimento", "habeas corpus substitutivo"]
    ),
  },
  {
    rotulo: "trabalho comum v2",
    termos: pack(
      ["ação regressiva INSS acidente", "ação regressiva culpa exclusiva"],
      ["seguro vida grupo trabalho", "seguro grupo risco excluído"],
      ["tomador serviço responsabilidade", "tomador ausência subordinação"],
      ["acidente trajeto indenização", "trajeto culpa da vítima"]
    ),
  },
  {
    rotulo: "consumidor saúde",
    termos: pack(
      ["negativa UTI plano", "UTI leito indisponível"],
      ["coparticipação abusiva", "coparticipação contratual"],
      ["network descredenciamento", "descredenciamento justificado"],
      ["carência urgência 24h", "carência contrato"]
    ),
  },
  {
    rotulo: "civil dano moral v2",
    termos: pack(
      ["ofensa honra redes sociais", "honra crítica jornalística"],
      ["negativação indevida in re ipsa", "negativação exercício regular"],
      ["abandono afetivo indenização", "abandono afetivo não indenizável"],
      ["assédio moral vizinho", "conflito vizinhança não assédio"]
    ),
  },
  {
    rotulo: "imob usucapião",
    termos: pack(
      ["usucapião urbana especial", "usucapião urbana área pública"],
      ["usucapião familiar abandono", "usucapião familiar requisitos"],
      ["direito de laje regularização", "laje ausência registro"],
      ["servidão passagem", "servidão não caracterizada"]
    ),
  },
  {
    rotulo: "tributário ISS IPTU",
    termos: pack(
      ["ISS construção civil", "ISS local prestação"],
      ["ISS sociedade profissionais", "ISS tabela fixa"],
      ["IPTU progressividade", "IPTU progressividade legal"],
      ["taxa lixo municipal", "taxa lixo serviço específico"]
    ),
  },
  {
    rotulo: "JECRIM v2",
    termos: pack(
      ["juizado criminal desobediência", "desobediência ordem ilegal"],
      ["juizado criminal rixa", "rixa composição civil"],
      ["juizado criminal perturbação sossego", "perturbação exercício regular"],
      ["juizado criminal omissão socorro", "omissão socorro atipicidade"]
    ),
  },
  {
    rotulo: "empresarial crédito",
    termos: pack(
      ["duplicata execução", "duplicata prescrição"],
      ["cheque prescrito execução", "cheque causa debendi"],
      ["cédula crédito bancário", "cédula crédito revisão"],
      ["título extrajudicial iliquidez", "título liquidez certeza"]
    ),
  },
  {
    rotulo: "família guarda",
    termos: pack(
      ["guarda unilateral melhor interesse", "guarda compartilhada viável"],
      ["guarda animal estimação", "animal bem partilha"],
      ["destituição poder familiar", "destituição extrema"],
      ["adoção consentimento", "adoção consentimento dispensado"]
    ),
  },
  {
    rotulo: "digital pix fraude",
    termos: pack(
      ["golpe falso sequestro PIX", "PIX culpa exclusiva"],
      ["fraude engenharia social banco", "fraude fortuito externo"],
      ["transferência TED não autorizada", "TED senha utilizada"],
      ["conta corrente invasão", "invasão ausência falha banco"]
    ),
  },
  {
    rotulo: "ambiental ACP",
    termos: pack(
      ["dano ambiental solidariedade", "dano ambiental nexo causal"],
      ["licenciamento simplificado", "licenciamento exigido"],
      ["unidade conservação buffer", "zona amortecimento"],
      ["ressarcimento dano coletivo", "dano coletivo não comprovado"]
    ),
  },
  {
    rotulo: "médico hospital",
    termos: pack(
      ["hospital responsabilidade objetiva", "hospital ato exclusivo particular"],
      ["prontuário incompleto dano", "prontuário regular"],
      ["equipe multidisciplinar", "ato exclusivo profissional"],
      ["negativa leito hospitalar", "leito indisponibilidade"]
    ),
  },
  {
    rotulo: "admin concurso",
    termos: pack(
      ["concurso eliminação investigação social", "investigação social motivação"],
      ["concurso anulação questão", "concurso gabarito válido"],
      ["nomeação concurso preterição", "nomeação discricionariedade"],
      ["taxa inscrição concurso", "taxa inscrição legal"]
    ),
  },
  {
    rotulo: "civil evicção vícios",
    termos: pack(
      ["vício redibitório coisa usada", "vício desgaste natural"],
      ["gestão negócios alheios", "gestão ausência utilidade"],
      ["enriquecimento sem causa", "enriquecimento causa lícita"],
      ["abuso direito contratual", "exercício regular direito"]
    ),
  },
  {
    rotulo: "consumidor financiamento",
    termos: pack(
      ["financiamento imobiliário revisão", "financiamento SFH válido"],
      ["portabilidade consignado", "portabilidade recusa justificada"],
      ["investimento perda orientação", "investimento risco assumido"],
      ["cartão crédito compra não reconhecida", "compra senha utilizada"]
    ),
  },
  {
    rotulo: "penal tráfico furto",
    termos: pack(
      ["tráfico quantidade privilegiado", "tráfico associação criminosa"],
      ["furto qualificado rompimento", "furto tentativa desistência"],
      ["estelionato sentimental", "estelionato ausência dolo"],
      ["associação criminosa", "associação não configurada"]
    ),
  },
  {
    rotulo: "JEC CDC v3",
    termos: pack(
      ["juizado especial hotel overbooking", "overbooking reacomodação"],
      ["juizado especial supermercado queda", "queda culpa da vítima"],
      ["juizado especial pet shop", "pet shop cláusula risco"],
      ["juizado especial autoescola CNH", "autoescola serviço prestado"]
    ),
  },
  {
    rotulo: "fazenda MS",
    termos: pack(
      ["mandado segurança fazenda", "MS fazenda dilação prova"],
      ["certidão positiva efeito negativa", "CND débitos discussão"],
      ["refis adesão benefícios", "refis perda parcelamento"],
      ["isenção fiscal lei específica", "isenção interpretação literal"]
    ),
  },
];

/** Volume em cortes federais / superiores / CARF (pub 2023). */
const TEMAS_VOLUME_FED: PackTribunal[] = [
  {
    rotulo: "TST · horas extras volume",
    tribunal: "tst",
    termos: pack(
      ["horas extras cartão ponto", "horas extras prova unilateral"],
      ["intervalo interjornada", "intervalo negociado"],
      ["adicional noturno", "adicional noturno não devido"],
      ["banco de horas inválido", "banco de horas acordo"]
    ),
  },
  {
    rotulo: "TST · vínculo pejotização",
    tribunal: "tst",
    termos: pack(
      ["pejotização vínculo", "pejotização autonomia"],
      ["uberização plataforma", "plataforma autonomia"],
      ["terceirização atividade-fim", "terceirização lícita"],
      ["grupo econômico trabalhista", "grupo econômico não configurado"]
    ),
  },
  {
    rotulo: "TST · rescisão verbas",
    tribunal: "tst",
    termos: pack(
      ["justa causa desídia", "justa causa não comprovada"],
      ["rescisão indireta", "rescisão indireta requisitos"],
      ["FGTS multa 40", "FGTS multa não cabível"],
      ["aviso prévio proporcional", "aviso prévio não devido"]
    ),
  },
  {
    rotulo: "TST · dano moral trab",
    tribunal: "tst",
    termos: pack(
      ["assédio moral trabalho", "assédio moral prova frágil"],
      ["assédio sexual trabalhista", "assédio sexual não comprovado"],
      ["doença ocupacional nexo", "doença ocupacional concausa"],
      ["acidente trabalho indenização", "acidente culpa exclusiva"]
    ),
  },
  {
    rotulo: "TST · adicional equiparação",
    tribunal: "tst",
    termos: pack(
      ["equiparação salarial", "equiparação diferença função"],
      ["adicional insalubridade", "insalubridade laudo negativo"],
      ["adicional periculosidade", "periculosidade não caracterizada"],
      ["desvio função diferenças", "desvio função não comprovado"]
    ),
  },
  {
    rotulo: "TRF3 · BPC aposentadoria",
    tribunal: "trf3",
    termos: pack(
      ["BPC deficiência longa duração", "BPC deficiência não comprovada"],
      ["BPC idoso miserabilidade", "BPC renda superior"],
      ["aposentadoria tempo TRF3", "aposentadoria carência"],
      ["tempo especial conversão", "tempo especial PPP inválido"]
    ),
  },
  {
    rotulo: "TRF3 · rural revisão",
    tribunal: "trf3",
    termos: pack(
      ["atividade rural segurado especial", "rural ausência início prova"],
      ["revisão da vida toda", "revisão vida toda decadência"],
      ["benefício assistencial revisão", "benefício assistencial decadência"],
      ["LOAS critério socioeconômico", "LOAS indeferimento"]
    ),
  },
  {
    rotulo: "TRF3 · execução fiscal",
    tribunal: "trf3",
    termos: pack(
      ["execução fiscal federal CDA", "execução fiscal CDA nula"],
      ["embargos execução União", "embargos improcedentes"],
      ["penhora bem família fiscal", "bem família impenhorável"],
      ["parcelamento débito federal", "parcelamento rompido"]
    ),
  },
  {
    rotulo: "TRF4 · incapacidade",
    tribunal: "trf4",
    termos: pack(
      ["aposentadoria especial nocivo", "especial laudo insuficiente"],
      ["auxílio doença incapacidade", "auxílio doença alta médica"],
      ["aposentadoria invalidez", "invalidez nexo não comprovado"],
      ["auxílio acidente sequela", "auxílio acidente sequela mínima"]
    ),
  },
  {
    rotulo: "TRF4 · pensão maternidade",
    tribunal: "trf4",
    termos: pack(
      ["pensão morte qualidade segurado", "pensão dependente não comprovado"],
      ["salário maternidade", "salário maternidade carência"],
      ["auxílio reclusão", "auxílio reclusão requisitos"],
      ["desconto consignado benefício", "consignado autorização válida"]
    ),
  },
  {
    rotulo: "TRF4 · servidor federal",
    tribunal: "trf4",
    termos: pack(
      ["servidor federal adicional", "adicional não devido"],
      ["aposentadoria servidor federal", "aposentadoria requisitos"],
      ["remoção servidor federal", "remoção discricionariedade"],
      ["PAD federal nulidade", "PAD ampla defesa"]
    ),
  },
  {
    rotulo: "STJ · prev reforço vol",
    tribunal: "stj",
    termos: pack(
      ["revisão teto previdenciário", "revisão teto prescrita"],
      ["desaposentação STJ", "desaposentação vedada"],
      ["contribuição autônomo", "contribuição autônomo isenção"],
      ["dano moral demora INSS", "demora administrativa não indenizável"]
    ),
  },
  {
    rotulo: "STJ · LGPD digital vol",
    tribunal: "stj",
    termos: pack(
      ["LGPD vazamento dados", "LGPD dano não comprovado"],
      ["tratamento dados consentimento", "tratamento base legal"],
      ["golpe pix STJ", "golpe pix culpa cliente"],
      ["fraude bancária engenharia", "fraude fortuito externo"]
    ),
  },
  {
    rotulo: "STJ · erro médico vol",
    tribunal: "stj",
    termos: pack(
      ["erro médico responsabilidade civil", "erro médico culpa não comprovada"],
      ["plano saúde rol ANS", "plano exclusão contratual"],
      ["obrigação meio médico", "obrigação resultado estético"],
      ["home care cobertura", "home care não obrigatório"]
    ),
  },
  {
    rotulo: "STJ · administrativo vol",
    tribunal: "stj",
    termos: pack(
      ["improbidade dolo", "improbidade dolo ausente"],
      ["licitação dispensa", "dispensa licitação cabível"],
      ["servidor remoção STJ", "remoção interesse público"],
      ["PAD processo administrativo", "PAD nulidade defesa"]
    ),
  },
  {
    rotulo: "STJ · ambiental vol",
    tribunal: "stj",
    termos: pack(
      ["ACP ambiental STJ", "ACP ilegitimidade"],
      ["dano ambiental solidariedade", "dano ambiental nexo"],
      ["multa IBAMA", "multa ambiental legal"],
      ["licença ambiental prévia", "licença indeferimento"]
    ),
  },
  {
    rotulo: "STJ · eleitoral vol",
    tribunal: "stj",
    termos: pack(
      ["inelegibilidade LC 64", "inelegibilidade afastada"],
      ["abuso poder econômico", "abuso poder não configurado"],
      ["cassação diploma", "cassação prova insuficiente"],
      ["compra votos eleitoral", "compra votos inexistência"]
    ),
  },
  {
    rotulo: "STJ · PI internacional",
    tribunal: "stj",
    termos: pack(
      ["marca contrafação STJ", "marca uso descritivo"],
      ["homologação sentença estrangeira", "homologação ordem pública"],
      ["patente nulidade INPI", "patente validade"],
      ["guarda Haia retorno", "guarda Haia interesse menor"]
    ),
  },
  {
    rotulo: "STJ · conselhos marítimo",
    tribunal: "stj",
    termos: pack(
      ["anuidade conselho profissional", "anuidade proporcional"],
      ["demurrage sobrestadia", "demurrage cláusula válida"],
      ["processo ético OAB", "processo ético nulidade"],
      ["transporte marítimo avaria", "transporte marítimo fortuito"]
    ),
  },
  {
    rotulo: "STF · remédios vol",
    tribunal: "stf",
    termos: pack(
      ["mandado segurança líquido certo", "mandado segurança decadência"],
      ["habeas corpus STF", "habeas corpus substitutivo"],
      ["ADI inconstitucionalidade", "ADI ilegitimidade"],
      ["ADPF preceito fundamental", "ADPF subsidiariedade"]
    ),
  },
  {
    rotulo: "STF · saúde fundamentais",
    tribunal: "stf",
    termos: pack(
      ["fornecimento medicamento STF", "medicamento política pública"],
      ["mínimo existencial saúde", "reserva do possível"],
      ["tratamento fora SUS", "tratamento indeferimento"],
      ["internação urgência judicial", "internação discricionariedade"]
    ),
  },
  {
    rotulo: "STF · liberdade expressão",
    tribunal: "stf",
    termos: pack(
      ["liberdade expressão discurso ódio", "liberdade expressão honra"],
      ["fake news responsabilização", "fake news liberdade"],
      ["censura prévia vedação", "restrição proporcional"],
      ["direito resposta imprensa", "resposta proporcionalidade"]
    ),
  },
  {
    rotulo: "CARF · IRPJ PIS",
    tribunal: "carf",
    termos: pack(
      ["IRPJ glosa despesa", "IRPJ despesa necessária"],
      ["PIS COFINS não cumulativo", "PIS COFINS crédito indevido"],
      ["CSLL base cálculo", "CSLL lançamento regular"],
      ["multa isolada CARF", "multa isolada proporcionalidade"]
    ),
  },
  {
    rotulo: "CARF · planejamento",
    tribunal: "carf",
    termos: pack(
      ["planejamento tributário abuso", "planejamento tributário lícito"],
      ["ágio amortização", "ágio amortização glosa"],
      ["preço transferência", "preço transferência ajuste"],
      ["omissão receita CARF", "omissão receita não comprovada"]
    ),
  },
  {
    rotulo: "CARF · contribuições",
    tribunal: "carf",
    termos: pack(
      ["contribuição previdenciária empresa", "contribuição base legal"],
      ["ITR lançamento", "ITR lançamento regular"],
      ["IPI crédito", "IPI crédito indevido"],
      ["drawback regime especial", "drawback requisitos"]
    ),
  },
  {
    rotulo: "TST · jornada escala",
    tribunal: "tst",
    termos: pack(
      ["sobreaviso escala 12x36", "sobreaviso regime compensado"],
      ["hora extra habitual integração", "hora extra eventual"],
      ["trabalho intermitente", "intermitente autonomia"],
      ["teletrabalho controle jornada", "teletrabalho sem controle"]
    ),
  },
  {
    rotulo: "TRF3 · pensão federal",
    tribunal: "trf3",
    termos: pack(
      ["pensão morte união estável", "pensão união não comprovada"],
      ["auxílio acidente TRF3", "auxílio acidente sequela mínima"],
      ["aposentadoria invalidez federal", "invalidez capacidade residual"],
      ["reabilitação profissional INSS", "reabilitação indeferimento"]
    ),
  },
  {
    rotulo: "TRF4 · especial PPP",
    tribunal: "trf4",
    termos: pack(
      ["PPP laudo técnico", "PPP inconsistente"],
      ["agente químico especial", "agente químico EPI eficaz"],
      ["ruído especial conversão", "ruído abaixo limite"],
      ["vigilante especial", "vigilante não especial"]
    ),
  },
  {
    rotulo: "STJ · consumidor banco",
    tribunal: "stj",
    termos: pack(
      ["CDC banco responsabilidade", "CDC fortuito externo"],
      ["negativação indevida STJ", "negativação dívida legítima"],
      ["juros abusivos STJ", "juros taxa média mercado"],
      ["desconsideração personalidade CDC", "desconsideração requisitos"]
    ),
  },
  {
    rotulo: "STJ · família alimentos",
    tribunal: "stj",
    termos: pack(
      ["alimentos internacionais STJ", "alimentos competência"],
      ["guarda compartilhada STJ", "guarda unilateral interesse"],
      ["exoneração alimentos STJ", "alimentos filhos maiores"],
      ["paternidade socioafetiva", "socioafetividade não comprovada"]
    ),
  },
  {
    rotulo: "STF · controle concentrado",
    tribunal: "stf",
    termos: pack(
      ["ADC controvérsia judicial", "ADC ilegitimidade"],
      ["modulação efeitos STF", "modulação rejeitada"],
      ["medida cautelar ADI", "cautelar ADI indeferida"],
      ["súmula vinculante descumprimento", "reclamação súmula"]
    ),
  },
  {
    rotulo: "CARF · multa lançamento",
    tribunal: "carf",
    termos: pack(
      ["lançamento de ofício", "lançamento regular"],
      ["multa de ofício qualificada", "multa qualificada afastada"],
      ["decadência lançamento tributário", "decadência não consumada"],
      ["denúncia espontânea", "denúncia espontânea requisitos"]
    ),
  },
  {
    rotulo: "TST · estabilidade",
    tribunal: "tst",
    termos: pack(
      ["estabilidade gestante", "estabilidade gestante não devida"],
      ["estabilidade acidente trabalho", "estabilidade não configurada"],
      ["estabilidade cipeiro", "cipeiro estabilidade"],
      ["reintegração estabilidade", "reintegração indevida"]
    ),
  },
  {
    rotulo: "TRF3 · tempo especial",
    tribunal: "trf3",
    termos: pack(
      ["enquadramento especial categoria", "enquadramento não cabível"],
      ["conversão tempo especial comum", "conversão fator indevido"],
      ["aposentadoria professor federal", "professor requisitos"],
      ["atividade especial eletricista", "eletricista EPI eficaz"]
    ),
  },
  {
    rotulo: "TRF4 · revisão benefício",
    tribunal: "trf4",
    termos: pack(
      ["revisão teto EC 20 41", "revisão teto prescrita"],
      ["revisão buraco negro", "revisão buraco negro decadência"],
      ["reajuste benefício deflação", "reajuste índice legal"],
      ["desconto benefício indevido", "desconto autorização"]
    ),
  },
  {
    rotulo: "STJ · improbidade licitação",
    tribunal: "stj",
    termos: pack(
      ["improbidade nova lei dolo", "improbidade dolo ausente"],
      ["overprice licitação", "overprice não comprovado"],
      ["nepotismo administração", "nepotismo não configurado"],
      ["enriquecimento ilícito agente", "enriquecimento não comprovado"]
    ),
  },
  {
    rotulo: "STF · direitos sociais",
    tribunal: "stf",
    termos: pack(
      ["piso salarial professor", "piso salarial discricionariedade"],
      ["greve servidor essencial", "greve limites"],
      ["moradia digna judicialização", "moradia política pública"],
      ["educação vaga creche", "creche discricionariedade"]
    ),
  },
];

function montar(): {
  lotes: Record<number, TermoSeed[]>;
  rotulos: Record<number, string>;
  max: number;
  nReforco: number;
  nVolume: number;
} {
  const lotes: Record<number, TermoSeed[]> = {};
  const rotulos: Record<number, string> = {};
  let n = 789;
  let nReforco = 0;
  let nVolume = 0;

  for (const p of LACUNAS_789) {
    lotes[n] = comPub(noTribunal(p.termos, p.tribunal), PUB_REFORCO);
    rotulos[n] = p.rotulo;
    n++;
    nReforco++;
  }

  const filaVolume: { rotulo: string; tribunal: string; termos: TermoSeed[] }[] =
    [];

  for (const tema of TEMAS_VOLUME_TJ) {
    for (const tj of TJS_API) {
      filaVolume.push({
        rotulo: `${tj.toUpperCase()} · ${tema.rotulo}`,
        tribunal: tj,
        termos: tema.termos,
      });
    }
  }

  for (const p of TEMAS_VOLUME_FED) {
    filaVolume.push({
      rotulo: p.rotulo,
      tribunal: p.tribunal,
      termos: p.termos,
    });
  }

  // Recicla temas TJ com sufixo de onda até completar 1500.
  let onda = 2;
  while (filaVolume.length < LOTE_MAX_FASE4 - 788) {
    for (const tema of TEMAS_VOLUME_TJ) {
      for (const tj of TJS_API) {
        filaVolume.push({
          rotulo: `${tj.toUpperCase()} · ${tema.rotulo} · v${onda}`,
          tribunal: tj,
          termos: tema.termos,
        });
        if (filaVolume.length >= LOTE_MAX_FASE4 - 788) break;
      }
      if (filaVolume.length >= LOTE_MAX_FASE4 - 788) break;
    }
    onda++;
    if (onda > 20) break;
  }

  for (const p of filaVolume) {
    if (n > LOTE_MAX_FASE4) break;
    lotes[n] = comPub(noTribunal(p.termos, p.tribunal), PUB_VOLUME);
    rotulos[n] = p.rotulo;
    n++;
    nVolume++;
  }

  return {
    lotes,
    rotulos,
    max: n - 1,
    nReforco,
    nVolume,
  };
}

const m = montar();
export const LOTES_789_PLUS = m.lotes;
export const ROTULO_LOTE_789 = m.rotulos;
/** Contagens para verificação (reforço = lacunas 2021; volume = pub 2023). */
export const FASE4_N_REFORCO = m.nReforco;
export const FASE4_N_VOLUME = m.nVolume;
