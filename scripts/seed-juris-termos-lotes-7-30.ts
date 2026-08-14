/**
 * Lotes 7–30 — multiárea complementar (pares autor × réu).
 * Pronto para seed quando a cota Jurisprudências.ai liberar.
 *
 * Cobertura: previdenciário, JECRIM, trabalhista, penal, constitucional,
 * tributário, empresarial, imobiliário, público, ambiental, família,
 * consumidor, digital, médico, agrário, eleitoral, PI, internacional,
 * civil, contratual, bancário, execução, JEC fino e súmulas STJ.
 */

import type { TermoSeed } from "./seed-juris-termos";

function par(
  temaAutor: string,
  temaReu: string,
  tribunal?: string
): TermoSeed[] {
  return [
    { lado: "autor", tribunal, q: temaAutor },
    { lado: "reu", tribunal, q: temaReu },
  ];
}

/** Lote 7 — Previdenciário (aposentadoria, BPC, revisão). */
export const TERMOS_MULTIAREA_LOTE_7: TermoSeed[] = [
  ...par(
    "aposentadoria por tempo de contribuição reconhecimento especial conversão procedência",
    "aposentadoria tempo contribuição improcedência ausência exposição agentes nocivos",
    "stj"
  ),
  ...par(
    "BPC LOAS deficiência miserabilidade benefício assistencial procedência",
    "BPC LOAS improcedência renda per capita superior critério objetivo",
    "stj"
  ),
  ...par(
    "revisão benefício previdenciário teto revisão da vida toda procedência",
    "revisão benefício improcedência decadência ato de concessão",
    "stj"
  ),
  ...par(
    "auxílio-acidente sequela redução capacidade laborativa procedência",
    "auxílio-acidente improcedência ausência nexo causal perícia desfavorável",
    "stj"
  ),
  ...par(
    "aposentadoria rural segurado especial início de prova material procedência",
    "aposentadoria rural improcedência prova exclusivamente testemunhal",
    "stj"
  ),
  ...par(
    "pensão por morte dependente união estável qualidade de segurado procedência",
    "pensão por morte improcedência perda qualidade de segurado",
    "stj"
  ),
  ...par(
    "auxílio-doença restabelecimento incapacidade temporária procedência",
    "auxílio-doença improcedência alta médica capacidade laborativa",
    "stj"
  ),
  ...par(
    "salário-maternidade segurada empregada benefício procedência",
    "salário-maternidade improcedência ausência vínculo emprego comprovado",
    "stj"
  ),
];

/** Lote 8 — JECRIM / infrações de menor potencial ofensivo. */
export const TERMOS_MULTIAREA_LOTE_8: TermoSeed[] = [
  ...par(
    "transação penal Juizado Especial Criminal homologação Lei 9099 procedência",
    "transação penal rejeição reincidência crime hediondo inviabilidade"
  ),
  ...par(
    "composição civil danos JECRIM homologação acordo procedência",
    "composição civil JECRIM improcedência ausência consentimento vítima"
  ),
  ...par(
    "lesão corporal leve JECRIM tipicidade material procedência",
    "lesão corporal leve absolvição princípio insignificância atipicidade"
  ),
  ...par(
    "ameaça art 147 CP JECRIM materialidade procedência",
    "ameaça absolvição falta de prova dolo específico"
  ),
  ...par(
    "vias de fato contravenção JECRIM condenação procedência",
    "vias de fato absolvição legítima defesa putativa"
  ),
  ...par(
    "injúria real JECRIM tipicidade procedência",
    "injúria absolvição exercício regular do direito crítica"
  ),
  ...par(
    "suspensão condicional do processo sursis processual cabimento procedência",
    "sursis processual indeferimento reincidência pena mínima superior"
  ),
  ...par(
    "recurso inominado JECRIM reforma sentença absolvição",
    "recurso inominado JECRIM manutenção condenação prova suficiente"
  ),
];

/** Lote 9 — Trabalhista complementar. */
export const TERMOS_MULTIAREA_LOTE_9: TermoSeed[] = [
  ...par(
    "vínculo emprego pejotização fraude CLT reconhecimento procedência",
    "vínculo emprego improcedência prestação serviço autônomo pessoa jurídica"
  ),
  ...par(
    "adicional insalubridade grau máximo atividade procedência",
    "adicional insalubridade improcedência laudo pericial negativo EPI eficaz"
  ),
  ...par(
    "adicional periculosidade eletricidade inflamáveis procedência",
    "adicional periculosidade improcedência exposição eventual intermitente"
  ),
  ...par(
    "equiparação salarial identidade função simultaneidade procedência",
    "equiparação salarial improcedência diferença produtividade tempo serviço"
  ),
  ...par(
    "rescisão indireta falta grave empregador verbas rescisórias procedência",
    "rescisão indireta improcedência justa causa empregado abandono"
  ),
  ...par(
    "dano moral trabalhista revista íntima vexatória procedência",
    "dano moral trabalhista improcedência poder diretivo fiscalização regular"
  ),
  ...par(
    "horas in itinere tempo à disposição empregador procedência",
    "horas in itinere improcedência transporte público regular acessível"
  ),
  ...par(
    "terceirização ilicitude atividade-fim responsabilidade solidária procedência",
    "terceirização improcedência atividade-meio responsabilidade subsidiária"
  ),
];

/** Lote 10 — Direito Penal comum. */
export const TERMOS_MULTIAREA_LOTE_10: TermoSeed[] = [
  ...par(
    "roubo majorado concurso pessoas arma de fogo condenação procedência",
    "roubo absolvição legítima defesa excesso não doloso"
  ),
  ...par(
    "tráfico drogas art 33 tipicidade materialidade condenação",
    "tráfico drogas absolvição insignificância posse para uso próprio"
  ),
  ...par(
    "estupro de vulnerável materialidade condenação procedência",
    "estupro de vulnerável absolvição dúvida razoável prova frágil"
  ),
  ...par(
    "homicídio doloso qualificado tribunal do júri condenação",
    "homicídio absolvição legítima defesa real"
  ),
  ...par(
    "estelionato art 171 tipicidade dolo específico condenação",
    "estelionato absolvição mero inadimplemento civil atipicidade"
  ),
  ...par(
    "habeas corpus prisão preventiva excesso de prazo procedência",
    "habeas corpus denegação fundamentação concreta periculum libertatis",
    "stj"
  ),
  ...par(
    "progressão de regime requisitos objetivos subjetivos deferimento",
    "progressão de regime indeferimento falta grave interrupção prazo"
  ),
  ...par(
    "revisão criminal prova nova inocência procedência",
    "revisão criminal improcedência mera reanálise provas já apreciadas"
  ),
];

/** Lote 11 — Constitucional / controle / garantias. */
export const TERMOS_MULTIAREA_LOTE_11: TermoSeed[] = [
  ...par(
    "mandado de segurança direito líquido e certo ato coator procedência",
    "mandado de segurança denegação dilação probatória inadequação via",
    "stj"
  ),
  ...par(
    "habeas data acesso informações pessoais indeferimento administrativo procedência",
    "habeas data improcedência informação já fornecida falta interesse"
  ),
  ...par(
    "ação popular lesividade ato administrativo nulidade procedência",
    "ação popular improcedência ausência ilegalidade interesse público"
  ),
  ...par(
    "ADPF arguição de descumprimento preceito fundamental cabimento",
    "ADPF inviabilidade inadequação da via eleita",
    "stf"
  ),
  ...par(
    "controle difuso inconstitucionalidade lei municipal procedência",
    "controle difuso improcedência constitucionalidade formal material"
  ),
  ...par(
    "direito de reunião liberdade de expressão manifestação pacífica procedência",
    "restrição manifestação improcedência ordem pública proporcionalidade"
  ),
  ...par(
    "igualdade concursal critério discriminatório anulação procedência",
    "concurso público improcedência critério objetivo justificado natureza cargo"
  ),
  ...par(
    "privacidade dados pessoais intervenção estatal desproporcional procedência",
    "privacidade improcedência interesse público preponderante legalidade"
  ),
];

/** Lote 12 — Tributário complementar. */
export const TERMOS_MULTIAREA_LOTE_12: TermoSeed[] = [
  ...par(
    "IPTU progressividade alíquotas função social propriedade procedência",
    "IPTU improcedência progressividade inconstitucional antes EC 29",
    "stj"
  ),
  ...par(
    "ISS local prestação serviço regra geral procedência",
    "ISS improcedência competência município do estabelecimento prestador",
    "stj"
  ),
  ...par(
    "ITBI base cálculo valor venal referência procedência",
    "ITBI improcedência base cálculo valor da avaliação municipal",
    "stj"
  ),
  ...par(
    "execução fiscal CDA nulidade ausência fundamento legal procedência",
    "execução fiscal improcedência CDA válida presunção de certeza",
    "stj"
  ),
  ...par(
    "compensação tributária crédito reconhecido judicialmente procedência",
    "compensação tributária improcedência ausência habilitação legal",
    "stj"
  ),
  ...par(
    "IPI crédito presumido insumos isentos não cumulatividade procedência",
    "IPI crédito presumido improcedência insumos alíquota zero",
    "stj"
  ),
  ...par(
    "contribuição previdenciária verbas indenizatórias não incidência procedência",
    "contribuição previdenciária improcedência natureza salarial verba",
    "stj"
  ),
  ...par(
    "taxa de fiscalização poder de polícia fato gerador procedência",
    "taxa improcedência ausência efetiva fiscalização serviço específico",
    "stj"
  ),
];

/** Lote 13 — Empresarial / falência / recuperação. */
export const TERMOS_MULTIAREA_LOTE_13: TermoSeed[] = [
  ...par(
    "falência pedido credor insolvência título líquido procedência",
    "falência improcedência impugnação crédito ausência insolvência",
    "stj"
  ),
  ...par(
    "recuperação judicial convolação falência descumprimento plano",
    "recuperação judicial manutenção plano cumprimento substancial",
    "stj"
  ),
  ...par(
    "desconsideração personalidade jurídica grupo econômico abuso procedência",
    "desconsideração personalidade improcedência ausência desvio patrimonial",
    "stj"
  ),
  ...par(
    "exclusão sócio justa causa quebra affectio societatis procedência",
    "exclusão sócio improcedência ausência justa causa societária"
  ),
  ...par(
    "apuração haveres critério balanço de determinação procedência",
    "apuração haveres improcedência critério contratual diverso"
  ),
  ...par(
    "título de crédito cheque sustação ordem pagamento procedência",
    "cheque improcedência sustação abusiva obrigação cambial"
  ),
  ...par(
    "concorrência desleal confusão clientela indenização procedência",
    "concorrência desleal improcedência uso legítimo marca genérica"
  ),
  ...par(
    "contrato societário anulação vício consentimento procedência",
    "contrato societário improcedência ratificação atos societários"
  ),
];

/** Lote 14 — Imobiliário complementar. */
export const TERMOS_MULTIAREA_LOTE_14: TermoSeed[] = [
  ...par(
    "ação demarcatória limites imóveis confrontantes procedência",
    "demarcatória improcedência ausência prova pericial limites"
  ),
  ...par(
    "ação reivindicação domínio propriedade imóvel procedência",
    "reivindicação improcedência posse de boa-fé usucapião em curso"
  ),
  ...par(
    "distrato imobiliário Lei 13786 devolução valores procedência",
    "distrato imobiliário improcedência retenção percentual contratual válido"
  ),
  ...par(
    "atraso obra construtora lucros cessantes dano moral procedência",
    "atraso obra improcedência caso fortuito readequação cronograma"
  ),
  ...par(
    "condomínio edilício obras irregulares obrigação demolir procedência",
    "obras condomínio improcedência autorização assembleia regularidade"
  ),
  ...par(
    "servidão administrativa indenização restrição uso procedência",
    "servidão administrativa improcedência ausência prejuízo patrimonial"
  ),
  ...par(
    "compra venda imóvel vício oculto redibição procedência",
    "vício oculto imóvel improcedência ciência comprador decadência"
  ),
  ...par(
    "alienação fiduciária imóvel consolidação propriedade procedência",
    "alienação fiduciária improcedência purgação mora tempestiva"
  ),
];

/** Lote 15 — Direito Público / administrativo. */
export const TERMOS_MULTIAREA_LOTE_15: TermoSeed[] = [
  ...par(
    "responsabilidade civil Estado omissão serviço público procedência",
    "responsabilidade Estado improcedência ausência nexo causal omissão"
  ),
  ...par(
    "licença ambiental indeferimento discricionariedade motivação procedência",
    "licença ambiental improcedência discricionariedade técnica regular"
  ),
  ...par(
    "contrato administrativo rescisão unilateral indenização procedência",
    "rescisão contrato administrativo improcedência inadimplemento particular"
  ),
  ...par(
    "servidor público adicional tempo serviço incorporação procedência",
    "adicional servidor improcedência ausência previsão legal"
  ),
  ...par(
    "tombamento restrição propriedade indenização procedência",
    "tombamento improcedência função social ausência indenização automática"
  ),
  ...par(
    "intervenção Estado domínio econômico desapropriação indireta procedência",
    "desapropriação indireta improcedência ausência esvaziamento econômico"
  ),
  ...par(
    "pregão eletrônico julgamento proposta inexequível anulação procedência",
    "pregão eletrônico improcedência proposta válida critério edital"
  ),
  ...par(
    "improbidade sanção Lei 14230 dolo específico procedência",
    "improbidade improcedência mera irregularidade ausência dolo",
    "stj"
  ),
];

/** Lote 16 — Ambiental complementar. */
export const TERMOS_MULTIAREA_LOTE_16: TermoSeed[] = [
  ...par(
    "área de preservação permanente APP intervenção indenização procedência",
    "APP improcedência uso consolidado ausência dano ambiental comprovado"
  ),
  ...par(
    "poluição sonora município poder de polícia multa procedência",
    "poluição sonora improcedência ausência medição técnica regular"
  ),
  ...par(
    "TAC termo de ajustamento de conduta homologação procedência",
    "TAC improcedência cláusulas abusivas desproporcionais"
  ),
  ...par(
    "responsabilidade ambiental solidária poluidor indireto procedência",
    "responsabilidade ambiental improcedência ausência nexo causal",
    "stj"
  ),
  ...par(
    "licenciamento ambiental EIA RIMA nulidade omissão procedência",
    "licenciamento ambiental improcedência estudo adequado aprovação CONAMA"
  ),
  ...par(
    "fauna silvestre apreensão animais tráfico procedência",
    "fauna silvestre improcedência criação autorizada documentação regular"
  ),
  ...par(
    "ressarcimento dano ambiental plantio recuperação área procedência",
    "dano ambiental improcedência recuperação espontânea área"
  ),
  ...par(
    "crime ambiental Lei 9605 tipicidade materialidade condenação",
    "crime ambiental absolvição ausência dolo insignificância"
  ),
];

/** Lote 17 — Família e sucessões. */
export const TERMOS_MULTIAREA_LOTE_17: TermoSeed[] = [
  ...par(
    "divórcio litigioso partilha bens regime comunhão parcial procedência",
    "partilha bens improcedência bem particular exclusão comunhão"
  ),
  ...par(
    "alimentos avoengos obrigação avós subsidiária procedência",
    "alimentos avoengos improcedência capacidade genitores suficiente"
  ),
  ...par(
    "regulamentação visitas convivência familiar procedência",
    "visitas improcedência risco à criança restrição justificada"
  ),
  ...par(
    "investigação paternidade exame DNA procedência",
    "investigação paternidade improcedência recusa justificada prova contrária"
  ),
  ...par(
    "adoção unilateral consentimento genitor procedência",
    "adoção improcedência ausência consentimento irregularidade"
  ),
  ...par(
    "inventário adjudicação herdeiro único procedência",
    "inventário improcedência herdeiros preteridos sonegação"
  ),
  ...par(
    "testamento nulidade incapacidade testador procedência",
    "testamento improcedência formalidades legais observadas"
  ),
  ...par(
    "união estável putativa direitos sucessórios procedência",
    "união estável putativa improcedência má-fé convivente"
  ),
];

/** Lote 18 — Consumidor complementar. */
export const TERMOS_MULTIAREA_LOTE_18: TermoSeed[] = [
  ...par(
    "publicidade enganosa CDC art 37 dano moral procedência",
    "publicidade enganosa improcedência mero puffing exagero publicitário"
  ),
  ...par(
    "prática abusiva CDC art 39 venda casada procedência",
    "venda casada improcedência produtos distintos liberdade contratual"
  ),
  ...par(
    "produto perigoso recall obrigação de fazer procedência",
    "produto perigoso improcedência risco inerente informação adequada"
  ),
  ...par(
    "fornecedor aparente cadeia consumo responsabilidade solidária procedência",
    "fornecedor aparente improcedência ausência participação cadeia"
  ),
  ...par(
    "cadastro restrição crédito comunicação prévia Súmula 359 STJ procedência",
    "cadastro restrição improcedência comunicação comprovada",
    "stj"
  ),
  ...par(
    "compra online arrependimento art 49 CDC reembolso procedência",
    "arrependimento CDC improcedência prazo decadencial esgotado"
  ),
  ...par(
    "serviço essencial corte indevido água energia dano moral procedência",
    "corte serviço essencial improcedência inadimplência notificação prévia"
  ),
  ...par(
    "garantia contratual extensão fabricante vício procedência",
    "garantia contratual improcedência mau uso exclusão cobertura"
  ),
];

/** Lote 19 — Digital / LGPD / crimes cibernéticos. */
export const TERMOS_MULTIAREA_LOTE_19: TermoSeed[] = [
  ...par(
    "LGPD direito ao esquecimento desindexação procedência",
    "direito ao esquecimento improcedência interesse público informação",
    "stj"
  ),
  ...par(
    "vazamento dados sensíveis LGPD indenização coletiva procedência",
    "vazamento dados improcedência ausência dano concreto individual",
    "stj"
  ),
  ...par(
    "crime informático invasão dispositivo informática condenação",
    "invasão dispositivo absolvição ausência prova autoria"
  ),
  ...par(
    "difamação redes sociais responsabilidade provedor procedência",
    "provedor conteúdo improcedência ausência notificação remoção",
    "stj"
  ),
  ...par(
    "phishing golpe digital banco responsabilidade objetiva procedência",
    "phishing banco improcedência culpa exclusiva consumidor",
    "stj"
  ),
  ...par(
    "deepfake uso imagem não autorizado indenização procedência",
    "uso imagem improcedência domínio público ausência dano"
  ),
  ...par(
    "contrato software SaaS inadimplemento SLA indenização procedência",
    "contrato SaaS improcedência força maior indisponibilidade"
  ),
  ...par(
    "cookies tracking consentimento LGPD obrigação de fazer procedência",
    "cookies improcedência base legal legítimo interesse"
  ),
];

/** Lote 20 — Médico e saúde. */
export const TERMOS_MULTIAREA_LOTE_20: TermoSeed[] = [
  ...par(
    "erro médico cirúrgico nexo causal dano moral procedência",
    "erro médico improcedência complicação inerente consentimento informado"
  ),
  ...par(
    "plano saúde órtese prótese cobertura ANS procedência",
    "plano saúde órtese improcedência exclusão contratual rol taxativo",
    "stj"
  ),
  ...par(
    "negativa internação urgência plano saúde tutela procedência",
    "negativa internação improcedência procedimento eletivo carência",
    "stj"
  ),
  ...par(
    "responsabilidade hospital infecção hospitalar objetiva procedência",
    "infecção hospitalar improcedência culpa exclusiva paciente"
  ),
  ...par(
    "médico plantonista omissão socorro responsabilidade procedência",
    "omissão socorro improcedência atendimento adequado protocolo"
  ),
  ...par(
    "reajuste plano saúde abusividade idosos procedência",
    "reajuste plano saúde improcedência índice autorizado ANS",
    "stj"
  ),
  ...par(
    "prontuário médico fornecimento cópia obrigação fazer procedência",
    "prontuário médico improcedência sigilo profissional restrição"
  ),
  ...par(
    "cirurgia plástica obrigação de resultado insatisfação procedência",
    "cirurgia plástica improcedência obrigação de meio resultado aceitável"
  ),
];

/** Lote 21 — Agrário / agronegócio. */
export const TERMOS_MULTIAREA_LOTE_21: TermoSeed[] = [
  ...par(
    "arrendamento rural inadimplemento rescisão procedência",
    "arrendamento rural improcedência caso fortuito quebra safra"
  ),
  ...par(
    "parceria agrícola partilha frutos inadimplemento procedência",
    "parceria agrícola improcedência cumprimento proporcional contrato"
  ),
  ...par(
    "crédito rural execução garantia hipotecária procedência",
    "crédito rural improcedência vício contratação alienação fiduciária"
  ),
  ...par(
    "regularização fundiária usucapião rural procedência",
    "usucapião rural improcedência área pública inviabilidade"
  ),
  ...par(
    "desapropriação para reforma agrária indenização justa procedência",
    "desapropriação agrária improcedência produtividade comprovada"
  ),
  ...par(
    "contrato integração agroindústria cláusulas abusivas procedência",
    "integração agroindústria improcedência equilíbrio contratual"
  ),
  ...par(
    "CPR cédula produto rural execução título procedência",
    "CPR improcedência vício emissão ausência entrega produto"
  ),
  ...par(
    "seguro agrícola indenização sinistro estiagem procedência",
    "seguro agrícola improcedência exclusão cobertura contratual"
  ),
];

/** Lote 22 — Eleitoral. */
export const TERMOS_MULTIAREA_LOTE_22: TermoSeed[] = [
  ...par(
    "propaganda eleitoral antecipada multa procedência",
    "propaganda antecipada improcedência mera menção sem pedido voto"
  ),
  ...par(
    "abuso poder econômico cassação diploma procedência",
    "abuso poder econômico improcedência ausência potencialidade"
  ),
  ...par(
    "inelegibilidade condenação criminal transitada procedência",
    "inelegibilidade improcedência ausência trânsito julgado"
  ),
  ...par(
    "prestação contas campanha desaprovação sanção procedência",
    "prestação contas improcedência irregularidade sanável"
  ),
  ...par(
    "registro candidatura indeferimento condição elegibilidade",
    "registro candidatura deferimento regularidade documentação"
  ),
  ...par(
    "pesquisa eleitoral irregular multa procedência",
    "pesquisa eleitoral improcedência registro regular TSE"
  ),
  ...par(
    "captação ilícita sufrágio compra voto cassação procedência",
    "captação ilícita improcedência ausência prova robusta"
  ),
  ...par(
    "direito de resposta propaganda ofensiva deferimento",
    "direito de resposta indeferimento crítica política regular"
  ),
];

/** Lote 23 — Propriedade intelectual. */
export const TERMOS_MULTIAREA_LOTE_23: TermoSeed[] = [
  ...par(
    "patente violação exploração não autorizada indenização procedência",
    "patente improcedência estado da técnica anterioridade",
    "stj"
  ),
  ...par(
    "direito autoral plágio obra literária indenização procedência",
    "direito autoral improcedência uso justo citação limitada",
    "stj"
  ),
  ...par(
    "software pirataria indenização Lucrum cessans procedência",
    "software pirataria improcedência licença válida uso interno"
  ),
  ...par(
    "desenho industrial registro contrafação procedência",
    "desenho industrial improcedência ausência novidade"
  ),
  ...par(
    "nome empresarial colidência confusão mercado procedência",
    "nome empresarial improcedência distinção suficiente segmentos"
  ),
  ...par(
    "indicação geográfica uso indevido procedência",
    "indicação geográfica improcedência uso genérico descritivo"
  ),
  ...par(
    "know-how confidencialidade violação segredo negócio procedência",
    "segredo negócio improcedência informação de domínio público"
  ),
  ...par(
    "licenciamento marca royalties inadimplemento procedência",
    "licenciamento marca improcedência rescisão legítima licenciante"
  ),
];

/** Lote 24 — Internacional / cooperação. */
export const TERMOS_MULTIAREA_LOTE_24: TermoSeed[] = [
  ...par(
    "homologação sentença estrangeira STJ requisitos procedência",
    "homologação sentença estrangeira denegação ofensa ordem pública",
    "stj"
  ),
  ...par(
    "carta rogatória cumprimento ato processual procedência",
    "carta rogatória indeferimento ofensa soberania",
    "stj"
  ),
  ...par(
    "contrato internacional lex mercatoria cláusula foro procedência",
    "cláusula foro estrangeiro improcedência consumidor hipossuficiente",
    "stj"
  ),
  ...par(
    "extradição requisito dupla tipicidade procedência",
    "extradição indeferimento crime político obstáculo",
    "stf"
  ),
  ...par(
    "alimentos internacionais Convenção Haia cobrança procedência",
    "alimentos internacionais improcedência ausência tratado aplicável"
  ),
  ...par(
    "arbitragem internacional sentença estrangeira reconhecimento procedência",
    "arbitragem internacional denegação violação contraditório",
    "stj"
  ),
  ...par(
    "sequestro internacional criança Convenção Haia retorno procedência",
    "sequestro internacional criança indeferimento interesse superior"
  ),
  ...par(
    "execução sentença estrangeira homologada penhora procedência",
    "execução sentença estrangeira improcedência ausência homologação STJ"
  ),
];

/** Lote 25 — Civil / responsabilidade. */
export const TERMOS_MULTIAREA_LOTE_25: TermoSeed[] = [
  ...par(
    "responsabilidade civil acidente trânsito culpa concorrente procedência",
    "acidente trânsito improcedência culpa exclusiva da vítima"
  ),
  ...par(
    "dano moral pessoa jurídica abalo reputação procedência",
    "dano moral pessoa jurídica improcedência mero aborrecimento comercial",
    "stj"
  ),
  ...par(
    "responsabilidade objetiva atividade de risco art 927 CC procedência",
    "atividade de risco improcedência ausência nexo causal"
  ),
  ...par(
    "enriquecimento sem causa restituição indébito procedência",
    "enriquecimento sem causa improcedência causa jurídica válida"
  ),
  ...par(
    "posse esbulho reintegração liminar procedência",
    "reintegração posse improcedência posse precária autor"
  ),
  ...par(
    "obrigação de fazer astreintes multa diária procedência",
    "astreintes redução excessividade proporcionalidade",
    "stj"
  ),
  ...par(
    "prescrição quinquenal responsabilidade civil termo inicial procedência",
    "prescrição responsabilidade civil acolhida prazo esgotado"
  ),
  ...par(
    "dano estético cumulação dano moral procedência",
    "dano estético improcedência bis in idem com dano moral",
    "stj"
  ),
];

/** Lote 26 — Contratual. */
export const TERMOS_MULTIAREA_LOTE_26: TermoSeed[] = [
  ...par(
    "revisão contratual onerosidade excessiva teoria imprevisão procedência",
    "revisão contratual improcedência álea ordinária risco assumido"
  ),
  ...par(
    "cláusula penal redução equitativa art 413 CC procedência",
    "cláusula penal improcedência valor proporcional cumprimento parcial"
  ),
  ...par(
    "resolução contratual inadimplemento absoluto procedência",
    "resolução contratual improcedência mora purgada cumprimento útil"
  ),
  ...par(
    "contrato adesão cláusula abusiva nulidade CDC procedência",
    "cláusula abusiva improcedência informação clara equilíbrio"
  ),
  ...par(
    "promessa compra venda adjudicação compulsória procedência",
    "promessa compra venda improcedência inadimplemento promissário"
  ),
  ...par(
    "fiança exoneração fiador notificação procedência",
    "fiança improcedência obrigação perene sem exoneração válida"
  ),
  ...par(
    "contrato empreitada defeito obra indenização procedência",
    "empreitada improcedência aceite obra sem ressalva"
  ),
  ...par(
    "cessão crédito notificação devedor eficácia procedência",
    "cessão crédito improcedência pagamento de boa-fé ao cedente"
  ),
];

/** Lote 27 — Bancário / financeiro. */
export const TERMOS_MULTIAREA_LOTE_27: TermoSeed[] = [
  ...par(
    "revisão contrato bancário capitalização juros abusivos procedência",
    "revisão bancária improcedência taxa média Bacen liberdade",
    "stj"
  ),
  ...par(
    "conta corrente lançamento indevido repetição indébito procedência",
    "lançamento conta improcedência autorização contratual tarifa"
  ),
  ...par(
    "cartão crédito cobrança fatura inexistente dano moral procedência",
    "cobrança cartão improcedência dívida comprovada fatura"
  ),
  ...par(
    "empréstimo consignado margem excedida nulidade procedência",
    "consignado improcedência margem legal observada"
  ),
  ...par(
    "seguro prestamista venda casada CDC procedência",
    "seguro prestamista improcedência opção voluntária contratada"
  ),
  ...par(
    "investimento perda aplicação informação inadequada procedência",
    "investimento improcedência risco informado perfil investidor"
  ),
  ...par(
    "financiamento veículo busca apreensão purgação mora procedência",
    "busca apreensão improcedência mora comprovada consolidação"
  ),
  ...par(
    "tarifa bancária cobrança ilícita devolução procedência",
    "tarifa bancária improcedência serviço efetivamente prestado",
    "stj"
  ),
];

/** Lote 28 — Execução e processo civil. */
export const TERMOS_MULTIAREA_LOTE_28: TermoSeed[] = [
  ...par(
    "embargos à execução excesso iliquidez acolhimento procedência",
    "embargos execução rejeição título líquido certo exigível"
  ),
  ...par(
    "penhora salário impenhorabilidade relativa percentual procedência",
    "penhora salário improcedência impenhorabilidade absoluta",
    "stj"
  ),
  ...par(
    "cumprimento sentença obrigação de fazer astreintes procedência",
    "cumprimento sentença improcedência obrigação impossível"
  ),
  ...par(
    "impugnação cumprimento sentença excesso execução procedência",
    "impugnação cumprimento rejeição cálculo correto"
  ),
  ...par(
    "ação monitória prova escrita sem eficácia título procedência",
    "monitória improcedência ausência prova escrita suficiente"
  ),
  ...par(
    "tutela antecipada urgência fumus periculum deferimento",
    "tutela antecipada indeferimento ausência probabilidade do direito"
  ),
  ...par(
    "agravo de instrumento decisão interlocutória reforma procedência",
    "agravo de instrumento negado provimento decisão mantida"
  ),
  ...par(
    "execução título extrajudicial protesto comprovado procedência",
    "execução título improcedência pagamento parcial quitação"
  ),
];

/** Lote 29 — JEC fino / temas quentes remanescentes. */
export const TERMOS_MULTIAREA_LOTE_29: TermoSeed[] = [
  ...par(
    "Juizado Especial Cível incompetência valor causa excedente",
    "JEC competência valor causa dentro do limite Lei 9099"
  ),
  ...par(
    "JEC prova pericial complexidade inviabilidade rito",
    "JEC prova documental suficiente julgamento antecipado"
  ),
  ...par(
    "dano moral atraso bagagem voo internacional Montreal procedência",
    "atraso bagagem improcedência assistência adequada Convenção Montreal"
  ),
  ...par(
    "curso online EAD vício serviço reembolso CDC procedência",
    "curso online improcedência serviço prestado conforme contratado"
  ),
  ...par(
    "aplicativo delivery atraso pedido indenização procedência",
    "delivery improcedência caso fortuito atraso logístico"
  ),
  ...par(
    "streaming assinatura cobrança após cancelamento procedência",
    "streaming improcedência renovação automática informada"
  ),
  ...par(
    "estacionamento furto veículo responsabilidade objetiva procedência",
    "estacionamento furto improcedência cláusula isenção válida aviso"
  ),
  ...par(
    "academia fitness cancelamento multa abusiva procedência",
    "academia cancelamento improcedência cláusula penal proporcional"
  ),
];

/** Lote 30 — Súmulas STJ / temas de orientação consolidada. */
export const TERMOS_MULTIAREA_LOTE_30: TermoSeed[] = [
  ...par(
    "Súmula 297 STJ CDC instituições financeiras relação consumo procedência",
    "CDC banco improcedência ausência relação consumo pessoa jurídica",
    "stj"
  ),
  ...par(
    "Súmula 385 STJ negativação preexistente dano moral afasta procedência",
    "Súmula 385 STJ dano moral mantido ausência outra restrição legítima",
    "stj"
  ),
  ...par(
    "Súmula 479 STJ fortuito interno fraudes cartões procedência",
    "Súmula 479 STJ fortuito externo culpa exclusiva vítima",
    "stj"
  ),
  ...par(
    "Súmula 54 STJ juros mora responsabilidade extracontratual procedência",
    "juros mora improcedência termo inicial diverso evento danoso",
    "stj"
  ),
  ...par(
    "Súmula 326 STJ dano moral pedido certo ou incerto procedência",
    "dano moral improcedência valor excessivo redução equitativa",
    "stj"
  ),
  ...par(
    "Súmula 7 STJ revolvimento prova inviabilidade recurso especial",
    "recurso especial conhecimento reexame matéria fática vedado",
    "stj"
  ),
  ...par(
    "Súmula 83 STJ orientação consolidada tribunal procedência",
    "Súmula 83 STJ divergência jurisprudencial ainda existente",
    "stj"
  ),
  ...par(
    "Súmula 331 TST terceirização responsabilidade subsidiária procedência",
    "terceirização improcedência ausência culpa in vigilando tomador"
  ),
];

export const LOTES_7_A_30: Record<number, TermoSeed[]> = {
  7: TERMOS_MULTIAREA_LOTE_7,
  8: TERMOS_MULTIAREA_LOTE_8,
  9: TERMOS_MULTIAREA_LOTE_9,
  10: TERMOS_MULTIAREA_LOTE_10,
  11: TERMOS_MULTIAREA_LOTE_11,
  12: TERMOS_MULTIAREA_LOTE_12,
  13: TERMOS_MULTIAREA_LOTE_13,
  14: TERMOS_MULTIAREA_LOTE_14,
  15: TERMOS_MULTIAREA_LOTE_15,
  16: TERMOS_MULTIAREA_LOTE_16,
  17: TERMOS_MULTIAREA_LOTE_17,
  18: TERMOS_MULTIAREA_LOTE_18,
  19: TERMOS_MULTIAREA_LOTE_19,
  20: TERMOS_MULTIAREA_LOTE_20,
  21: TERMOS_MULTIAREA_LOTE_21,
  22: TERMOS_MULTIAREA_LOTE_22,
  23: TERMOS_MULTIAREA_LOTE_23,
  24: TERMOS_MULTIAREA_LOTE_24,
  25: TERMOS_MULTIAREA_LOTE_25,
  26: TERMOS_MULTIAREA_LOTE_26,
  27: TERMOS_MULTIAREA_LOTE_27,
  28: TERMOS_MULTIAREA_LOTE_28,
  29: TERMOS_MULTIAREA_LOTE_29,
  30: TERMOS_MULTIAREA_LOTE_30,
};

export const ROTULO_LOTE: Record<number, string> = {
  7: "Previdenciário",
  8: "JECRIM / Lei 9.099",
  9: "Trabalhista II",
  10: "Penal comum",
  11: "Constitucional",
  12: "Tributário II",
  13: "Empresarial / falência",
  14: "Imobiliário II",
  15: "Público / administrativo",
  16: "Ambiental II",
  17: "Família e sucessões",
  18: "Consumidor II",
  19: "Digital / LGPD",
  20: "Médico e saúde",
  21: "Agrário",
  22: "Eleitoral",
  23: "Propriedade intelectual",
  24: "Internacional / cooperação",
  25: "Civil / responsabilidade",
  26: "Contratual",
  27: "Bancário II",
  28: "Execução / CPC",
  29: "JEC fino",
  30: "Súmulas STJ / orientação",
};
