/**
 * Lotes 97–200 — completar os 10 TJs da API em todas as áreas de volume
 * e reforçar TST / TRF3 / TRF4 / CARF / STJ / STF.
 *
 * 97–176: 10 TJs × 8 packs (JEC, civil, CDC, família, imob, JECRIM, penal, LEF)
 * 177–200: Justiça do Trabalho, Federal, CARF e cortes superiores
 *
 * Queries diferentes das séries 65–80 e 81–96.
 * Rodar depois de 84–96: npx tsx scripts/seed-juris-ai-faixa.ts 97 200
 * (o diário avança ~16 lotes/noite sozinho quando LOTE_MAX=200)
 */

type TermoSeed = {
  q: string;
  lado?: "autor" | "reu" | "neutro";
  tribunal?: string;
};

function par(autor: string, reu: string): TermoSeed[] {
  return [
    { lado: "autor", q: autor },
    { lado: "reu", q: reu },
  ];
}

function noTribunal(termos: TermoSeed[], tribunal: string): TermoSeed[] {
  return termos.map((t) => ({ ...t, tribunal }));
}

/** TJs da API, menores primeiro (TJSP já está mais cheio). */
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

type PackId =
  | "jec"
  | "civil"
  | "cdc"
  | "familia"
  | "imob"
  | "jecrim"
  | "penal"
  | "lef";

const PACKS: Record<PackId, { rotulo: string; termos: TermoSeed[] }> = {
  jec: {
    rotulo: "JEC vol.2",
    termos: [
      ...par(
        "juizado especial cível obrigação de fazer procedência",
        "juizado especial cível obrigação de fazer impossibilidade"
      ),
      ...par(
        "juizado especial cível repetição de indébito CDC",
        "juizado especial cível cobrança devida serviço prestado"
      ),
      ...par(
        "juizado especial cível acidente trânsito indenização",
        "juizado especial cível acidente trânsito culpa exclusiva"
      ),
      ...par(
        "juizado especial cível atraso voo dano moral",
        "juizado especial cível atraso voo fortuito externo"
      ),
      ...par(
        "juizado especial cível recusa cartão crédito dano moral",
        "juizado especial cível recusa cartão limite contratual"
      ),
      ...par(
        "embargos à execução juizado especial cível",
        "embargos execução juizado rejeitados título líquido"
      ),
    ],
  },
  civil: {
    rotulo: "civil comum",
    termos: [
      ...par(
        "ação de cobrança contrato particular procedência",
        "ação de cobrança improcedência pagamento comprovado"
      ),
      ...par(
        "responsabilidade civil acidente dano material moral",
        "responsabilidade civil ausência nexo causal"
      ),
      ...par(
        "rescisão contratual inadimplemento perdas danos",
        "rescisão contratual exceção do contrato não cumprido"
      ),
      ...par(
        "enriquecimento sem causa restituição",
        "enriquecimento sem causa ausência prova deslocamento"
      ),
      ...par(
        "promessa de compra e venda adjudicação compulsória",
        "adjudicação compulsória inadimplemento do promitente comprador"
      ),
      ...par(
        "título de crédito nota promissória execução",
        "nota promissória prescrição execução"
      ),
    ],
  },
  cdc: {
    rotulo: "consumidor CPC",
    termos: [
      ...par(
        "relação de consumo CDC inversão do ônus da prova",
        "relação de consumo afastada destinatário final"
      ),
      ...par(
        "publicidade enganosa CDC indenização",
        "publicidade enganosa merchandising puffing"
      ),
      ...par(
        "prática abusiva CDC cláusula potestativa",
        "cláusula contratual CDC equilíbrio boa-fé"
      ),
      ...par(
        "plano de saúde reajuste abusivo idosos",
        "plano saúde reajuste autorizado ANS"
      ),
      ...par(
        "banco conta encerrada unilateralmente dano moral",
        "banco encerramento conta previsão contratual"
      ),
      ...par(
        "seguro recusa cobertura indenização securitária",
        "seguro risco excluído cláusula válida"
      ),
    ],
  },
  familia: {
    rotulo: "família",
    termos: [
      ...par(
        "alimentos avoengos obrigação subsidiária",
        "alimentos avoengos ausência prova impossibilidade pais"
      ),
      ...par(
        "alimentos gravídicos lei 11804",
        "alimentos gravídicos indícios insuficientes paternidade"
      ),
      ...par(
        "exoneração de alimentos filho maioridade",
        "exoneração alimentos filho universidade necessidade"
      ),
      ...par(
        "regulamentação de visitas convívio paterno",
        "visitas suspensas risco à criança"
      ),
      ...par(
        "união estável reconhecimento partilha",
        "união estável namoro ausência convivência pública"
      ),
      ...par(
        "inventário colação sonegados",
        "inventário bem particular fora da herança"
      ),
    ],
  },
  imob: {
    rotulo: "imobiliário",
    termos: [
      ...par(
        "despejo locação aluguel",
        "despejo mora purgada"
      ),
      ...par(
        "renovatória de locação comercial",
        "renovatória decadência"
      ),
      ...par(
        "consignação de aluguel",
        "consignação valor insuficiente"
      ),
      ...par(
        "bem de família impenhorabilidade",
        "penhora bem de família"
      ),
      ...par(
        "atraso na entrega do imóvel",
        "atraso de obra caso fortuito"
      ),
      ...par(
        "distrato imobiliário retenção",
        "distrato percentual de retenção"
      ),
    ],
  },
  jecrim: {
    rotulo: "JECRIM",
    termos: [
      ...par(
        "juizado especial criminal ameaça composição civil",
        "ameaça juizado criminal representação intempestiva"
      ),
      ...par(
        "juizado especial criminal injúria real transação",
        "injúria juizado criminal atipicidade"
      ),
      ...par(
        "direção perigosa juizado criminal transação penal",
        "direção perigosa juizado reincidência"
      ),
      ...par(
        "desacato juizado especial criminal",
        "desacato atipicidade liberdade de expressão"
      ),
      ...par(
        "crime de menor potencial ofensivo suspensão processo",
        "sursis processual descumprimento condições"
      ),
      ...par(
        "homologação transação penal juizado criminal",
        "transação penal recusada pelo Ministério Público"
      ),
    ],
  },
  penal: {
    rotulo: "penal comum",
    termos: [
      ...par(
        "habeas corpus constrangimento ilegal prisão",
        "habeas corpus prisão preventiva requisitos art 312"
      ),
      ...par(
        "tráfico de drogas quantidade insignificante",
        "tráfico drogas associação"
      ),
      ...par(
        "furto privilegiado pequeno valor",
        "furto rompimento obstáculo qualificadora"
      ),
      ...par(
        "estelionato arrependimento posterior",
        "estelionato continuidade delitiva"
      ),
      ...par(
        "violência doméstica lei maria da penha medidas protetivas",
        "medidas protetivas revogação ausência risco"
      ),
      ...par(
        "execução penal livramento condicional",
        "execução penal falta grave regressão"
      ),
    ],
  },
  lef: {
    rotulo: "execução fiscal",
    termos: [
      ...par(
        "embargos à execução fiscal CDA nula",
        "embargos execução fiscal CDA presunção de certeza"
      ),
      ...par(
        "exceção de pré-executividade execução fiscal",
        "exceção pré-executividade matéria de prova"
      ),
      ...par(
        "execução fiscal prescrição intercorrente",
        "execução fiscal prescricão intercorrente causa interruptiva"
      ),
      ...par(
        "substituição de CDA execução fiscal",
        "substituição CDA cerceamento defesa"
      ),
      ...par(
        "penhora execução fiscal bem de família",
        "penhora fiscal dinheiro preferência"
      ),
      ...par(
        "IPTU lançamento notificação contribuinte",
        "IPTU lançamento regular lei municipal"
      ),
    ],
  },
};

const PACK_ORDER: PackId[] = [
  "jec",
  "civil",
  "cdc",
  "familia",
  "imob",
  "jecrim",
  "penal",
  "lef",
];

const FEDERAL: { lote: number; tribunal: string; rotulo: string; termos: TermoSeed[] }[] =
  [
    {
      lote: 177,
      tribunal: "tst",
      rotulo: "TST · horas extras intervalo",
      termos: [
        ...par(
          "horas extras controle de jornada ônus do empregador",
          "horas extras cartão ponto válido jornada britânica"
        ),
        ...par(
          "intervalo intrajornada hora extra art 71 CLT",
          "intervalo intrajornada concedido parcialmente"
        ),
        ...par(
          "sobreaviso regime de prontidão",
          "sobreaviso uso de celular sem restrição"
        ),
        ...par(
          "banco de horas acordo coletivo validade",
          "banco de horas acordo individual inválido"
        ),
        ...par(
          "adicional noturno prorrogação jornada",
          "adicional noturno horário diurno"
        ),
        ...par(
          "horas in itinere tempo à disposição",
          "horas in itinere reforma trabalhista"
        ),
      ],
    },
    {
      lote: 178,
      tribunal: "tst",
      rotulo: "TST · rescisão FGTS",
      termos: [
        ...par(
          "rescisão indireta falta grave do empregador",
          "rescisão indireta rigor excessivo não caracterizado"
        ),
        ...par(
          "justa causa abandono de emprego",
          "justa causa desproporcional advertência prévia"
        ),
        ...par(
          "FGTS diferenças depósitos",
          "FGTS prescrição trintenária quinquenal"
        ),
        ...par(
          "multa 477 CLT atraso verbas rescisórias",
          "multa 477 CLT homologação tempestiva"
        ),
        ...par(
          "aviso prévio proporcional tempo de serviço",
          "aviso prévio indenizado projeção"
        ),
        ...par(
          "seguro-desemprego guia CD",
          "seguro-desemprego pedido de demissão"
        ),
      ],
    },
    {
      lote: 179,
      tribunal: "tst",
      rotulo: "TST · dano moral assédio",
      termos: [
        ...par(
          "assédio moral trabalho indenização",
          "assédio moral mero exercício do poder diretivo"
        ),
        ...par(
          "assédio sexual trabalho indenização",
          "assédio sexual ausência prova robusta"
        ),
        ...par(
          "dano existencial jornada excessiva",
          "dano existencial jornada contratual"
        ),
        ...par(
          "revista íntima dano moral",
          "revista íntima razoável sem contato físico"
        ),
        ...par(
          "doença ocupacional nexo concausa",
          "doença ocupacional ausência nexo INSS"
        ),
        ...par(
          "acidente de trabalho estabilidade acidentária",
          "acidente trabalho culpa exclusiva da vítima"
        ),
      ],
    },
    {
      lote: 180,
      tribunal: "tst",
      rotulo: "TST · estabilidade terceirização",
      termos: [
        ...par(
          "estabilidade gestante contrato determinado",
          "estabilidade gestante pedido de demissão"
        ),
        ...par(
          "cipeiro estabilidade provisória",
          "cipeiro estabilidade mandato encerrado"
        ),
        ...par(
          "terceirização ilícita vínculo tomador",
          "terceirização lícita atividade-meio"
        ),
        ...par(
          "pejotização vínculo de emprego",
          "pejotização autonomia ausência subordinação"
        ),
        ...par(
          "grupo econômico responsabilidade solidária",
          "grupo econômico ausência comunhão de interesses"
        ),
        ...par(
          "equiparação salarial identidade de função",
          "equiparação salarial diferença de tempo paradigma"
        ),
      ],
    },
    {
      lote: 181,
      tribunal: "trf3",
      rotulo: "TRF3 · aposentadoria tempo",
      termos: [
        ...par(
          "aposentadoria por tempo de contribuição carência",
          "aposentadoria tempo contribuição vínculo não comprovado"
        ),
        ...par(
          "reconhecimento tempo especial ruído",
          "tempo especial EPI eficaz ruído"
        ),
        ...par(
          "conversão tempo especial em comum",
          "conversão especial comum após EC 103"
        ),
        ...par(
          "aposentadoria híbrida rural urbana",
          "aposentadoria híbrida ausência qualidade segurado"
        ),
        ...par(
          "revisão da vida toda INSS",
          "revisão vida toda tese superada"
        ),
        ...par(
          "desaposentação desistência benefício",
          "desaposentação impossibilidade jurídica"
        ),
      ],
    },
    {
      lote: 182,
      tribunal: "trf3",
      rotulo: "TRF3 · BPC auxílio",
      termos: [
        ...par(
          "BPC LOAS deficiência miserabilidade",
          "BPC renda per capita superior 1/4 salário"
        ),
        ...par(
          "auxílio por incapacidade temporária nexo",
          "auxílio doença capacidade laborativa residual"
        ),
        ...par(
          "aposentadoria por incapacidade permanente",
          "incapacidade permanente reabilitação possível"
        ),
        ...par(
          "salário-maternidade segurada desempregada",
          "salário-maternidade perda qualidade de segurada"
        ),
        ...par(
          "pensão por morte dependente união estável",
          "pensão por morte união estável não comprovada"
        ),
        ...par(
          "auxílio-acidente consolidação lesão",
          "auxílio-acidente redução capacidade não comprovada"
        ),
      ],
    },
    {
      lote: 183,
      tribunal: "trf3",
      rotulo: "TRF3 · MS federal",
      termos: [
        ...par(
          "mandado de segurança servidor público federal",
          "mandado de segurança direito líquido não comprovado"
        ),
        ...par(
          "anulação de ato administrativo federal",
          "ato administrativo presunção de legitimidade"
        ),
        ...par(
          "licitação inexigibilidade irregular",
          "licitação inexigibilidade hipótese legal"
        ),
        ...par(
          "improbidade administrativa",
          "improbidade ausência dolo específico"
        ),
        ...par(
          "desapropriação indenização justa",
          "desapropriação valor venal suficiente"
        ),
        ...par(
          "FGTS correção TR IPCA",
          "FGTS correção índice legal"
        ),
      ],
    },
    {
      lote: 184,
      tribunal: "trf4",
      rotulo: "TRF4 · aposentadoria rural",
      termos: [
        ...par(
          "aposentadoria rural trabalhador avulso",
          "aposentadoria rural início de prova material"
        ),
        ...par(
          "segurado especial regime de economia familiar",
          "segurado especial descaracterização empregado"
        ),
        ...par(
          "tempo rural menor de 12 anos",
          "tempo rural idade mínima"
        ),
        ...par(
          "certidão de tempo de contribuição CTC",
          "CTC vínculos concomitantes"
        ),
        ...par(
          "benefício assistencial idoso BPC",
          "BPC idoso grupo familiar renda"
        ),
        ...par(
          "reafirmação da DER INSS",
          "reafirmação DER fato posterior indevido"
        ),
      ],
    },
    {
      lote: 185,
      tribunal: "trf4",
      rotulo: "TRF4 · auxílio e revisões",
      termos: [
        ...par(
          "auxílio-acidente nexo técnico epidemiológico",
          "NTEP presunção relativa elidida"
        ),
        ...par(
          "aposentadoria especial 25 anos",
          "aposentadoria especial agente nocivo não permanente"
        ),
        ...par(
          "revisão teto EC 20 e 41",
          "revisão teto decadência art 103"
        ),
        ...par(
          "pensão por morte união estável INSS",
          "pensão morte dependente não habilitado"
        ),
        ...par(
          "auxílio-reclusão baixa renda",
          "auxílio-reclusão renda acima do limite"
        ),
        ...par(
          "salário-maternidade trabalhadora avulsa",
          "salário-maternidade carência não cumprida"
        ),
      ],
    },
    {
      lote: 186,
      tribunal: "trf4",
      rotulo: "TRF4 · ambiental IBAMA",
      termos: [
        ...par(
          "auto de infração IBAMA anulação",
          "auto infração IBAMA regular contraditório"
        ),
        ...par(
          "embargo de obra ambiental licença",
          "embargo ambiental atividade sem licença"
        ),
        ...par(
          "multa ambiental proporcionalidade",
          "multa ambiental dosimetria legal"
        ),
        ...par(
          "área de preservação permanente APP",
          "APP área consolidada código florestal"
        ),
        ...par(
          "compensação ambiental licenciamento",
          "compensação ambiental valor devido"
        ),
        ...par(
          "ação civil pública dano ambiental",
          "ACP ambiental ausência nexo poluidor"
        ),
      ],
    },
    {
      lote: 187,
      tribunal: "carf",
      rotulo: "CARF · IRPJ lucro real",
      termos: [
        ...par(
          "IRPJ lucro real omissão de receita",
          "IRPJ omissão receita presunção elidida"
        ),
        ...par(
          "CSLL adições indedutíveis",
          "CSLL despesa operacional dedutível"
        ),
        ...par(
          "distribuição disfarçada de lucros DDL",
          "DDL operação com valor de mercado"
        ),
        ...par(
          "preço de transferência comparable uncontrolled",
          "preços transferência método PRL"
        ),
        ...par(
          "subcapitalização thin cap juros",
          "subcapitalização juros dedutíveis"
        ),
        ...par(
          "lucro da exploração incentivo",
          "lucro exploração glosa incentivo"
        ),
      ],
    },
    {
      lote: 188,
      tribunal: "carf",
      rotulo: "CARF · IPI PIS",
      termos: [
        ...par(
          "IPI crédito insumo industrialização",
          "IPI crédito glosa produto acabado"
        ),
        ...par(
          "IPI fato gerador saída estabelecimento",
          "IPI não incidência industrialização"
        ),
        ...par(
          "PIS COFINS regime cumulativo",
          "PIS COFINS base de cálculo exclusões"
        ),
        ...par(
          "PIS COFINS créditos de ICMS ST",
          "crédito PIS ICMS destacado"
        ),
        ...par(
          "reintegra crédito",
          "reintegra requisito exportação"
        ),
        ...par(
          "drawback suspensão tributos",
          "drawback descumprimento prazo"
        ),
      ],
    },
    {
      lote: 189,
      tribunal: "carf",
      rotulo: "CARF · contribuições previdenciárias",
      termos: [
        ...par(
          "contribuição previdenciária verbas indenizatórias",
          "contribuição previdenciária natureza salarial"
        ),
        ...par(
          "PLR participação lucros contribuição",
          "PLR acordo coletivo válido"
        ),
        ...par(
          "pró-labore sócio contribuição",
          "pró-labore retirada irregular"
        ),
        ...par(
          "cooperativa de trabalho contribuição",
          "cooperativa ausência vínculo"
        ),
        ...par(
          "retenção 11 por cento cessão de mão de obra",
          "retenção 11 por cento serviço sem cessão"
        ),
        ...par(
          "multa isolada obrigação acessória",
          "multa isolada proporcionalidade"
        ),
      ],
    },
    {
      lote: 190,
      tribunal: "carf",
      rotulo: "CARF · PAF decadência",
      termos: [
        ...par(
          "processo administrativo fiscal nulidade intimação",
          "PAF intimação válida Domicílio Tributário Eletrônico"
        ),
        ...par(
          "lançamento por homologação decadência 5 anos",
          "homologação tácita art 150 CTN"
        ),
        ...par(
          "denúncia espontânea art 138 CTN",
          "denúncia espontânea multa de mora devida"
        ),
        ...par(
          "arrolamento de bens garantia",
          "arrolamento bens desproporcional"
        ),
        ...par(
          "representação fiscal para fins penais",
          "representação fiscal ausência dolo"
        ),
        ...par(
          "compensação com precatório",
          "compensação precatório não autorizado"
        ),
      ],
    },
    {
      lote: 191,
      tribunal: "stj",
      rotulo: "STJ · consumerista repetitivos",
      termos: [
        ...par(
          "Súmula 297 STJ CDC instituições financeiras",
          "CDC banco relação de consumo afastada"
        ),
        ...par(
          "Súmula 479 STJ fortuito interno fraude",
          "Súmula 479 culpa exclusiva da vítima"
        ),
        ...par(
          "repetição de indébito em dobro CDC",
          "repetição indébito engano justificável"
        ),
        ...par(
          "plano de saúde rol ANS exemplificativo",
          "rol ANS taxativo cobertura"
        ),
        ...par(
          "prescrição pretensão indenizatória CDC 5 anos",
          "prescrição CDC prazo decenal CC"
        ),
        ...par(
          "juros de mora responsabilidade extracontratual",
          "juros mora termo inicial citação"
        ),
      ],
    },
    {
      lote: 192,
      tribunal: "stj",
      rotulo: "STJ · responsabilidade civil",
      termos: [
        ...par(
          "dano moral in re ipsa",
          "dano moral mero aborrecimento"
        ),
        ...par(
          "responsabilidade objetiva risco da atividade",
          "responsabilidade objetiva fato de terceiro"
        ),
        ...par(
          "perda de uma chance indenização",
          "perda de uma chance chance hipotética"
        ),
        ...par(
          "abandono afetivo indenização",
          "abandono afetivo ausência ilícito"
        ),
        ...par(
          "protesto indevido título dano moral",
          "protesto débito exigível"
        ),
        ...par(
          "prazo decadencial vício CDC",
          "decadência CDC vício aparente"
        ),
      ],
    },
    {
      lote: 193,
      tribunal: "stj",
      rotulo: "STJ · eleitoral (retoma 63)",
      termos: [
        ...par(
          "inelegibilidade condenação órgão colegiado",
          "inelegibilidade ausência condenação"
        ),
        ...par(
          "abuso de poder econômico eleitoral",
          "abuso poder econômico propaganda regular"
        ),
        ...par(
          "cassação de diploma recurso especial eleitoral",
          "cassação diploma prova insuficiente"
        ),
        ...par(
          "prestação de contas campanha desaprovação",
          "prestação contas irregularidade formal"
        ),
        ...par(
          "fidelidade partidária perda de mandato",
          "fidelidade partidária justa causa"
        ),
        ...par(
          "pesquisa eleitoral irregular multa",
          "pesquisa eleitoral registro regular"
        ),
      ],
    },
    {
      lote: 194,
      tribunal: "stj",
      rotulo: "STJ · digital PI internacional",
      termos: [
        ...par(
          "LGPD dano moral vazamento dados",
          "LGPD vazamento ausência dano indenizável"
        ),
        ...par(
          "marco civil da internet provedor responsabilidade",
          "provedor notificação judicial retirada"
        ),
        ...par(
          "marca contrafação abstenção",
          "marca uso de boa-fé descritivo"
        ),
        ...par(
          "direitos autorais contrafação indenização",
          "direitos autorais uso livre citação"
        ),
        ...par(
          "homologação sentença estrangeira STJ",
          "homologação sentença ofensa ordem pública"
        ),
        ...par(
          "alimentos internacionais convenção haia",
          "alimentos internacionais competência"
        ),
      ],
    },
    {
      lote: 195,
      tribunal: "stf",
      rotulo: "STF · repercussão geral",
      termos: [
        ...par(
          "repercussão geral recurso extraordinário",
          "repercussão geral questão infraconstitucional"
        ),
        ...par(
          "Tema 69 ICMS PIS COFINS",
          "Tema 69 modulação de efeitos"
        ),
        ...par(
          "coisa julgada inconstitucional",
          "coisa julgada segurança jurídica"
        ),
        ...par(
          "prisão após júri segundo grau",
          "execução provisória pena segundo grau"
        ),
        ...par(
          "foro privilegiado prerrogativa de função",
          "foro por prerrogativa crimes alheios ao cargo"
        ),
        ...par(
          "direito de greve servidor público",
          "greve servidor essencialidade"
        ),
      ],
    },
    {
      lote: 196,
      tribunal: "stf",
      rotulo: "STF · HC e constitucional",
      termos: [
        ...par(
          "habeas corpus STF constrangimento ilegal",
          "habeas corpus STF substitutivo de recurso"
        ),
        ...par(
          "liberdade de expressão discurso de ódio",
          "liberdade expressão limites honra"
        ),
        ...par(
          "sigilo de dados quebra judicial",
          "quebra de sigilo proporcionalidade"
        ),
        ...par(
          "mandado de injunção omissão legislativa",
          "mandado injunção omissão não caracterizada"
        ),
        ...par(
          "ADPF política pública saúde",
          "ADPF discricionariedade administrativa"
        ),
        ...par(
          "controle de constitucionalidade lei municipal",
          "lei municipal competência concorrente"
        ),
      ],
    },
    {
      lote: 197,
      tribunal: "tjsp",
      rotulo: "TJSP · médico e saúde",
      termos: [
        ...par(
          "erro médico nexo causal indenização",
          "erro médico complicação inerente ao ato"
        ),
        ...par(
          "obrigação de fazer fornecimento de medicamento",
          "medicamento experimental SUS"
        ),
        ...par(
          "home care plano de saúde",
          "home care não cobertura contratual"
        ),
        ...par(
          "cirurgia bariátrica cobertura",
          "cirurgia bariátrica requisitos ANS"
        ),
        ...par(
          "prontuário médico sigilo prova",
          "prontuário recusa injustificada"
        ),
        ...par(
          "responsabilidade hospital equipe médica",
          "hospital ato exclusivo do médico particular"
        ),
      ],
    },
    {
      lote: 198,
      tribunal: "tjmt",
      rotulo: "TJMT · agrário",
      termos: [
        ...par(
          "contrato de parceria agrícola rescisão",
          "parceria agrícola cumprimento contratual"
        ),
        ...par(
          "arrendamento rural despejo",
          "arrendamento rural prazo determinado"
        ),
        ...par(
          "crédito rural Cédula Pignoratícia",
          "cédula rural execução excesso"
        ),
        ...par(
          "usucapião rural módulo",
          "usucapião rural área pública"
        ),
        ...par(
          "regularização fundiária CAR",
          "CAR sobreposição área"
        ),
        ...par(
          "alienação fiduciária máquina agrícola",
          "busca e apreensão bem rural"
        ),
      ],
    },
    {
      lote: 199,
      tribunal: "tjgo",
      rotulo: "TJGO · agrário empresarial",
      termos: [
        ...par(
          "contrato de soja a termo inadimplemento",
          "contrato soja caso fortuito safra"
        ),
        ...par(
          "dissolução sociedade rural haveres",
          "dissolução sociedade justa causa"
        ),
        ...par(
          "marca agronegócio contrafação",
          "marca uso de nome geográfico"
        ),
        ...par(
          "CPR cédula de produto rural execução",
          "CPR prescrição título"
        ),
        ...par(
          "barter troca de insumos",
          "barter equilíbrio contratual"
        ),
        ...par(
          "garantia fidejussória rural",
          "aval rural outorga uxória"
        ),
      ],
    },
    {
      lote: 200,
      tribunal: "stj",
      rotulo: "STJ · tributário repetitivos",
      termos: [
        ...par(
          "execução fiscal redirecionamento sócio",
          "redirecionamento ausência dissolução irregular"
        ),
        ...par(
          "Súmula 393 STJ exceção pré-executividade",
          "exceção pré-executividade dilação probatória"
        ),
        ...par(
          "repetição de indébito tributário correção",
          "repetição indébito tributário prova do recolhimento"
        ),
        ...par(
          "mandado de segurança tributário crédito",
          "MS tributário dilação prova pericial"
        ),
        ...par(
          "ITCMD doação antecipação de herança",
          "ITCMD fato gerador legislação estadual"
        ),
        ...par(
          "ISS local da prestação",
          "ISS estabelecimento prestador"
        ),
      ],
    },
  ];

function montarLotesEstaduais(): {
  lotes: Record<number, TermoSeed[]>;
  rotulos: Record<number, string>;
} {
  const lotes: Record<number, TermoSeed[]> = {};
  const rotulos: Record<number, string> = {};
  let n = 97;
  for (const tj of TJS) {
    for (const pid of PACK_ORDER) {
      const pack = PACKS[pid];
      lotes[n] = noTribunal(pack.termos, tj);
      rotulos[n] = `${tj.toUpperCase()} · ${pack.rotulo}`;
      n++;
    }
  }
  return { lotes, rotulos };
}

const estaduais = montarLotesEstaduais();

export const LOTES_97_A_200: Record<number, TermoSeed[]> = { ...estaduais.lotes };
export const ROTULO_LOTE_97_200: Record<number, string> = { ...estaduais.rotulos };

for (const f of FEDERAL) {
  LOTES_97_A_200[f.lote] = noTribunal(f.termos, f.tribunal);
  ROTULO_LOTE_97_200[f.lote] = f.rotulo;
}

export const LOTE_MAX_EXPANDIDO = 200;
