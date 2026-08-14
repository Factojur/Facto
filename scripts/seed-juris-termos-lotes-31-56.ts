/**
 * Lotes 31–56 — reforço das áreas principais + recortes setoriais.
 * Pronto para seed quando a cota liberar (`npm run seed:juris-ai -- <N>`).
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

// ——— Reforço áreas principais (31–40) ———

/** Lote 31 — JEC / consumidor reforço. */
export const TERMOS_MULTIAREA_LOTE_31: TermoSeed[] = [
  ...par(
    "JEC repetição indébito dobra CDC art 42 cobrança indevida procedência",
    "repetição indébito improcedência engano justificável boa-fé fornecedor"
  ),
  ...par(
    "Juizado Especial Cível tutela de urgência corte água energia procedência",
    "tutela urgência JEC indeferimento ausência perigo de dano"
  ),
  ...par(
    "CDC inversão ônus prova hipossuficiência técnica procedência",
    "inversão ônus prova indeferimento ausência verossimilhança"
  ),
  ...par(
    "telefone spam telemarketing insistente dano moral procedência",
    "telemarketing improcedência cadastro opt-in consentimento"
  ),
  ...par(
    "seguro auto recusa indenização sinistro abusiva procedência",
    "seguro auto improcedência agravamento risco exclusão cobertura"
  ),
  ...par(
    "ecommerce entrega não realizada obrigação fazer procedência",
    "ecommerce improcedência extravio caso fortuito transportadora"
  ),
  ...par(
    "banco conta salário desconto indevido devolução procedência",
    "desconto conta salário improcedência autorização contratual"
  ),
  ...par(
    "hotel overbooking hospedagem dano moral procedência",
    "overbooking improcedência realocação adequada assistência"
  ),
];

/** Lote 32 — Trabalhista III. */
export const TERMOS_MULTIAREA_LOTE_32: TermoSeed[] = [
  ...par(
    "trabalho intermitente irregularidade vínculo contínuo procedência",
    "trabalho intermitente improcedência modalidade legal válida"
  ),
  ...par(
    "teletrabalho horas extras controle jornada procedência",
    "teletrabalho improcedência atividade externa art 62 CLT"
  ),
  ...par(
    "assédio sexual trabalho indenização dano moral procedência",
    "assédio sexual improcedência ausência prova robusta"
  ),
  ...par(
    "grupo econômico trabalhista responsabilidade solidária procedência",
    "grupo econômico improcedência autonomia societária comprovada"
  ),
  ...par(
    "FGTS diferenças depósitos atualização procedência",
    "FGTS improcedência quitação regular depósitos"
  ),
  ...par(
    "aviso prévio proporcionalidade tempo serviço procedência",
    "aviso prévio improcedência cumprimento integral"
  ),
  ...par(
    "intervalo interjornadas art 66 CLT horas extras procedência",
    "intervalo interjornadas improcedência compensação válida"
  ),
  ...par(
    "trabalho doméstico direitos CLT reconhecimento procedência",
    "trabalho doméstico improcedência prestação eventual não contínua"
  ),
];

/** Lote 33 — Penal / processo penal reforço. */
export const TERMOS_MULTIAREA_LOTE_33: TermoSeed[] = [
  ...par(
    "prisão preventiva excesso prazo razoável habeas corpus procedência",
    "prisão preventiva denegação HC gravidade concreta delito",
    "stj"
  ),
  ...par(
    "nulidade busca e apreensão sem mandado ilegalidade provas",
    "busca apreensão legalidade flagrante consentimento válido"
  ),
  ...par(
    "colaboração premiada homologação benefícios procedência",
    "colaboração premiada rejeição ausência efetividade"
  ),
  ...par(
    "organização criminosa tipicidade associação condenação",
    "organização criminosa absolvição ausência estrutura estável"
  ),
  ...par(
    "corrupção passiva art 317 tipicidade condenação",
    "corrupção passiva absolvição ausência vantagem indevida"
  ),
  ...par(
    "interceptação telefônica autorização judicial validade",
    "interceptação telefônica nulidade ausência fundamentação"
  ),
  ...par(
    "júri quesitação nulidade vício absolvição",
    "júri quesitação regularidade manutenção condenação"
  ),
  ...par(
    "medida cautelar diversa prisão substituição cabimento",
    "cautelar diversa indeferimento insuficiência medidas"
  ),
];

/** Lote 34 — Família III. */
export const TERMOS_MULTIAREA_LOTE_34: TermoSeed[] = [
  ...par(
    "alimentos gravídicos fixação binômio procedência",
    "alimentos gravídicos improcedência ausência indícios paternidade"
  ),
  ...par(
    "guarda unilateral excepcionalidade melhor interesse procedência",
    "guarda unilateral improcedência guarda compartilhada viável"
  ),
  ...par(
    "alienação parental advertência alteração guarda procedência",
    "alienação parental improcedência ausência prova atos"
  ),
  ...par(
    "divórcio partilha dívida comum responsabilidade procedência",
    "partilha dívida improcedência dívida particular exclusão"
  ),
  ...par(
    "nome casado retorno nome solteiro divórcio procedência",
    "alteração nome improcedência ausência justo motivo"
  ),
  ...par(
    "curatela interdição incapacidade civil procedência",
    "curatela improcedência capacidade residual suficiente"
  ),
  ...par(
    "alimentos transitórios ex-cônjuge prazo determinado procedência",
    "alimentos transitórios improcedência autossuficiência comprovada"
  ),
  ...par(
    "multiparentalidade registro dupla paternidade procedência",
    "multiparentalidade improcedência ausência vínculo socioafetivo"
  ),
];

/** Lote 35 — Tributário III. */
export const TERMOS_MULTIAREA_LOTE_35: TermoSeed[] = [
  ...par(
    "ICMS transferência mercadoria entre estabelecimentos não incidência",
    "ICMS transferência incidência operação interna",
    "stj"
  ),
  ...par(
    "PIS COFINS monofásico ressarcimento crédito procedência",
    "PIS COFINS monofásico improcedência ausência saldo credor",
    "stj"
  ),
  ...par(
    "IRPF dedução despesas médicas comprovação procedência",
    "IRPF dedução improcedência documentação insuficiente",
    "stj"
  ),
  ...par(
    "REFIS exclusão parcelamento regularidade procedência",
    "REFIS exclusão improcedência inadimplemento comprovado",
    "stj"
  ),
  ...par(
    "substituição tributária ICMS restituição fato gerador presumido",
    "substituição tributária improcedência base cálculo legítima",
    "stj"
  ),
  ...par(
    "ITCMD progressividade alíquotas constitucionalidade procedência",
    "ITCMD progressividade improcedência alíquota única estadual",
    "stj"
  ),
  ...par(
    "contribuição melhoria obra pública benefício procedência",
    "contribuição melhoria improcedência ausência valorização imóvel"
  ),
  ...par(
    "simples nacional exclusão irregularidades procedência",
    "simples nacional exclusão improcedência irregularidade fiscal grave",
    "stj"
  ),
];

/** Lote 36 — Previdenciário II. */
export const TERMOS_MULTIAREA_LOTE_36: TermoSeed[] = [
  ...par(
    "aposentadoria especial agente nocivo ruído NHO 01 procedência",
    "aposentadoria especial improcedência EPI eficaz elimina nocividade",
    "stj"
  ),
  ...par(
    "desaposentação revisão benefício improcedência tema STJ",
    "desaposentação pedido acolhido reafirmação da DER",
    "stj"
  ),
  ...par(
    "auxílio-reclusão dependente baixa renda procedência",
    "auxílio-reclusão improcedência renda superior limite",
    "stj"
  ),
  ...par(
    "tempo serviço especial conversão comum fator procedência",
    "conversão tempo especial improcedência legislação posterior vedação",
    "stj"
  ),
  ...par(
    "benefício por incapacidade auxílio-acidente cumulação procedência",
    "cumulação benefícios improcedência vedação legal",
    "stj"
  ),
  ...par(
    "pensão morte rateio companheira cônjuge procedência",
    "pensão morte rateio improcedência união estável não comprovada",
    "stj"
  ),
  ...par(
    "reabilitação profissional obrigação INSS procedência",
    "reabilitação improcedência capacidade residual adequada",
    "stj"
  ),
  ...par(
    "justificação administrativa início prova material procedência",
    "justificação administrativa improcedência prova exclusivamente testemunhal",
    "stj"
  ),
];

/** Lote 37 — Bancário / CDC reforço. */
export const TERMOS_MULTIAREA_LOTE_37: TermoSeed[] = [
  ...par(
    "golpe falsa central bancária Súmula 479 procedência",
    "golpe falsa central culpa exclusiva vítima fortuito externo",
    "stj"
  ),
  ...par(
    "empréstimo consignado fraude terceiro banco responsabilidade procedência",
    "consignado fraude improcedência autenticação biométrica válida",
    "stj"
  ),
  ...par(
    "cartão crédito limite unilaterale redução abusiva procedência",
    "redução limite cartão improcedência risco crédito contratual"
  ),
  ...par(
    "financiamento imobiliário SFH revisão saldo devedor procedência",
    "SFH revisão improcedência plano contratual válido",
    "stj"
  ),
  ...par(
    "cheque especial juros abusivos revisão procedência",
    "cheque especial improcedência taxa média mercado",
    "stj"
  ),
  ...par(
    "portabilidade crédito obstáculo banco origem procedência",
    "portabilidade improcedência pendência contratual legítima"
  ),
  ...par(
    "open banking vazamento dados responsabilidade banco procedência",
    "open banking improcedência consentimento titular LGPD"
  ),
  ...par(
    "investimento CDB informação inadequada perda procedência",
    "CDB improcedência risco de mercado informado"
  ),
];

/** Lote 38 — Administrativo / licitações II. */
export const TERMOS_MULTIAREA_LOTE_38: TermoSeed[] = [
  ...par(
    "Lei 14133 inexigibilidade contratação irregular anulação procedência",
    "inexigibilidade licitação improcedência hipótese legal configurada"
  ),
  ...par(
    "dispensa licitação emergência comprovada validade",
    "dispensa licitação anulação ausência emergência real"
  ),
  ...par(
    "sanção impedimento licitar proporcionalidade procedência",
    "impedimento licitar improcedência sanção proporcional motivada"
  ),
  ...par(
    "contrato administrativo reequilíbrio econômico-financeiro procedência",
    "reequilíbrio improcedência álea ordinária risco empresário"
  ),
  ...par(
    "servidor público remoção ofício motivação procedência",
    "remoção ofício improcedência interesse público discricionariedade"
  ),
  ...par(
    "concurso público cadastro reserva nomeação procedência",
    "cadastro reserva improcedência mera expectativa direito",
    "stj"
  ),
  ...par(
    "PAD demissão servidor nulidade cerceamento procedência",
    "PAD demissão improcedência contraditório ampla defesa observados"
  ),
  ...par(
    " improbidade lesão erário ressarcimento integral procedência",
    "improbidade improcedência ausência dano ao erário",
    "stj"
  ),
];

/** Lote 39 — Imobiliário III. */
export const TERMOS_MULTIAREA_LOTE_39: TermoSeed[] = [
  ...par(
    "usucapião familiar abandono lar conjugal procedência",
    "usucapião familiar improcedência ausência abandono configurado"
  ),
  ...par(
    "usucapião coletiva área urbana ZEIS procedência",
    "usucapião coletiva improcedência área inferior requisitos"
  ),
  ...par(
    "compromisso compra venda registro imóveis eficácia procedência",
    "compromisso compra venda improcedência inadimplemento comprador"
  ),
  ...par(
    "condomínio multa antissocial morador procedência",
    "multa antissocial improcedência ausência reiteração assembleia"
  ),
  ...par(
    "despesas condomínio obrigação propter rem adquirente procedência",
    "despesas condomínio improcedência período anterior aquisição"
  ),
  ...par(
    "locação comercial renovatória prazo procedência",
    "renovatória locação improcedência falta requisitos Lei 8245"
  ),
  ...par(
    "bem de família penhora exceção dívidas condomínio procedência",
    "bem de família impenhorabilidade manutenção Súmula 364",
    "stj"
  ),
  ...par(
    "retificação registro imóveis área confrontações procedência",
    "retificação registro improcedência litígio confrontantes"
  ),
];

/** Lote 40 — Empresarial II. */
export const TERMOS_MULTIAREA_LOTE_40: TermoSeed[] = [
  ...par(
    "holding familiar planejamento sucessório validade",
    "holding familiar anulação simulação fraude credores"
  ),
  ...par(
    "acordo de sócios tag along drag along eficácia procedência",
    "acordo de sócios improcedência cláusula leonina"
  ),
  ...par(
    "administrador sociedade responsabilidade atos culposos procedência",
    "administrador improcedência diligência business judgment"
  ),
  ...par(
    "joint venture dissolução apuração haveres procedência",
    "joint venture improcedência prazo determinado vigente"
  ),
  ...par(
    "marca notória proteção ampla LPI procedência",
    "marca notória improcedência segmentos distintos sem confusão",
    "stj"
  ),
  ...par(
    "recuperação extrajudicial credores adesão procedência",
    "recuperação extrajudicial improcedência quórum insuficiente",
    "stj"
  ),
  ...par(
    "nota promissória execução requisitos cambiais procedência",
    "nota promissória improcedência vício formal título"
  ),
  ...par(
    "franquia rescisão royalties indenização procedência",
    "franquia rescisão improcedência inadimplemento franqueado"
  ),
];

// ——— Recortes setoriais (41–52) ———

/** Lote 41 — Marítimo / portuário. */
export const TERMOS_MULTIAREA_LOTE_41: TermoSeed[] = [
  ...par(
    "transporte marítimo avaria carga responsabilidade armador procedência",
    "transporte marítimo improcedência caso fortuito tempestade"
  ),
  ...par(
    "conhecimento embarque bill of lading execução título procedência",
    "conhecimento embarque improcedência vício emissão"
  ),
  ...par(
    "acidente trabalho portuário responsabilidade operador procedência",
    "acidente portuário improcedência culpa exclusiva trabalhador"
  ),
  ...par(
    "afretamento embarcação inadimplemento rescisão procedência",
    "afretamento improcedência força maior impedimento navegação"
  ),
  ...par(
    "práticas portuárias tarifa abusiva ANTAQ procedência",
    "tarifa portuária improcedência tabela regulada válida"
  ),
  ...par(
    "salvamento marítimo remuneração recompensa procedência",
    "salvamento marítimo improcedência ausência perigo real"
  ),
  ...par(
    "poluição marítima óleo responsabilidade objetiva procedência",
    "poluição marítima improcedência ausência nexo causal"
  ),
  ...par(
    "arresto navio garantia crédito marítimo procedência",
    "arresto navio improcedência ausência crédito privilegiado"
  ),
];

/** Lote 42 — Aeronáutico / aviação. */
export const TERMOS_MULTIAREA_LOTE_42: TermoSeed[] = [
  ...par(
    "Convenção Montreal atraso voo indenização tarifada procedência",
    "Convenção Montreal improcedência caso fortuito meteorológico",
    "stj"
  ),
  ...par(
    "overbooking aéreo recusa embarque indenização procedência",
    "overbooking improcedência realocação voluntária assistência"
  ),
  ...par(
    "extravio bagagem voo internacional Montreal procedência",
    "extravio bagagem improcedência limite indenizatório SDR"
  ),
  ...par(
    "cancelamento voo reembolso integral ANAC procedência",
    "cancelamento voo improcedência remarcação aceita passageiro"
  ),
  ...par(
    "acidente aéreo responsabilidade transportador objetiva procedência",
    "acidente aéreo improcedência culpa exclusiva da vítima"
  ),
  ...par(
    "slot aeroportuário concessão irregular anulação procedência",
    "slot aeroportuário improcedência discricionariedade ANAC"
  ),
  ...par(
    "taxi aéreo contrato frete inadimplemento procedência",
    "taxi aéreo improcedência condições meteorológicas impeditivas"
  ),
  ...par(
    "piloto responsabilidade disciplinar ANAC cassação",
    "piloto cassação improcedência proporcionalidade sanção"
  ),
];

/** Lote 43 — Desportivo. */
export const TERMOS_MULTIAREA_LOTE_43: TermoSeed[] = [
  ...par(
    "contrato atleta profissional cláusula indenizatória procedência",
    "cláusula indenizatória atleta improcedência valor excessivo"
  ),
  ...par(
    "transferência atleta direitos econômicos disputa procedência",
    "direitos econômicos improcedência cessão válida registrada"
  ),
  ...par(
    "Justiça Desportiva tipicidade infração disciplinar condenação",
    "Justiça Desportiva absolvição ausência tipicidade"
  ),
  ...par(
    "clube futebol recuperação judicial créditos desportivos",
    "recuperação clube improcedência crédito extraconcursal"
  ),
  ...par(
    "direito de arena imagem atleta indenização procedência",
    "direito de arena improcedência cessão contratual válida"
  ),
  ...par(
    "torcida organizada responsabilidade civil estádio procedência",
    "torcida organizada improcedência ausência nexo causal"
  ),
  ...par(
    "Lei Pelé formação atleta indenização clube formador procedência",
    "indenização formação improcedência requisitos legais ausentes"
  ),
  ...par(
    "arbitral desportivo CAS reconhecimento sentença procedência",
    "arbitral desportivo denegação ofensa ordem pública"
  ),
];

/** Lote 44 — Urbanístico / solo urbano. */
export const TERMOS_MULTIAREA_LOTE_44: TermoSeed[] = [
  ...par(
    "plano diretor zoneamento restrição uso indenização procedência",
    "zoneamento improcedência função social propriedade urbana"
  ),
  ...par(
    "solo criado outorga onerosa cobrança procedência",
    "solo criado improcedência ausência previsão plano diretor"
  ),
  ...par(
    "IPTU progressivo no tempo função social procedência",
    "IPTU progressivo improcedência requisitos EC 29 ausentes",
    "stj"
  ),
  ...par(
    "desapropriação urbanística indenização prévia procedência",
    "desapropriação urbanística improcedência utilidade pública válida"
  ),
  ...par(
    "alvará construção indeferimento motivação procedência",
    "alvará construção improcedência irregularidade projeto"
  ),
  ...par(
    "regularização fundiária urbana REURB título procedência",
    "REURB improcedência área de risco inviabilidade"
  ),
  ...par(
    "estudo impacto de vizinhança EIV exigência procedência",
    "EIV improcedência porte empreendimento dispensa legal"
  ),
  ...par(
    "direito de preempção município alienação procedência",
    "preempção improcedência prazo decadencial esgotado"
  ),
];

/** Lote 45 — Militar / castrense. */
export const TERMOS_MULTIAREA_LOTE_45: TermoSeed[] = [
  ...par(
    "militar reforma incapacidade temporária procedência",
    "reforma militar improcedência aptidão comprovada perícia"
  ),
  ...par(
    "processo administrativo disciplinar militar nulidade procedência",
    "PAD militar improcedência regularidade contraditório"
  ),
  ...par(
    "promoção militar critério merecimento anulação procedência",
    "promoção militar improcedência discricionariedade hierárquica"
  ),
  ...par(
    "pensão militar dependente união estável procedência",
    "pensão militar improcedência ausência dependência econômica"
  ),
  ...par(
    "habeas corpus Justiça Militar competência procedência",
    "HC Justiça Militar denegação crime militar tipificado"
  ),
  ...par(
    "licenciamento militar irregularidade ato procedência",
    "licenciamento militar improcedência interesse público serviço"
  ),
  ...par(
    "adicional militar transferibilidade proventos procedência",
    "adicional militar improcedência natureza propter laborem"
  ),
  ...par(
    "crime militar insubordinação tipicidade condenação",
    "crime militar absolvição ausência dolo tipicidade"
  ),
];

/** Lote 46 — Infância e juventude (ECA). */
export const TERMOS_MULTIAREA_LOTE_46: TermoSeed[] = [
  ...par(
    "ECA medida protetiva acolhimento institucional procedência",
    "acolhimento institucional improcedência convivência familiar viável"
  ),
  ...par(
    "adoção internacional ECA requisitos procedência",
    "adoção internacional improcedência preferência nacionalidade brasileira"
  ),
  ...par(
    "ato infracional medida socioeducativa internação procedência",
    "internação socioeducativa improcedência medida em meio aberto suficiente"
  ),
  ...par(
    "guarda ECA familiar extensa preferência procedência",
    "guarda familiar extensa improcedência risco à criança"
  ),
  ...par(
    "alimentos provisórios menor urgência procedência",
    "alimentos provisórios improcedência ausência prova necessidade"
  ),
  ...par(
    "destituição poder familiar abandono negligência procedência",
    "destituição poder familiar improcedência possibilidade reintegração"
  ),
  ...par(
    "bullying escolar dano moral responsabilidade procedência",
    "bullying escolar improcedência ausência omissão escola"
  ),
  ...par(
    "trabalho infantil irregularidade indenização procedência",
    "trabalho infantil aprendiz regularidade legal idade permitida"
  ),
];

/** Lote 47 — Previdência complementar. */
export const TERMOS_MULTIAREA_LOTE_47: TermoSeed[] = [
  ...par(
    "previdência complementar revisão benefício entidade fechada procedência",
    "revisão previdência complementar improcedência regulamento vigente",
    "stj"
  ),
  ...par(
    "FUNPRESP servidor federal complementação procedência",
    "FUNPRESP improcedência opção regime próprio válida"
  ),
  ...par(
    "resgate contribuições previdência privada procedência",
    "resgate contribuições improcedência carência contratual",
    "stj"
  ),
  ...par(
    "benefício previdência complementar cálculo média salarial procedência",
    "cálculo benefício complementar improcedência fórmula regulamentar",
    "stj"
  ),
  ...par(
    "entidade fechada equacionamento déficit contribuição extraordinária",
    "equacionamento déficit improcedência ausência déficit atuarial",
    "stj"
  ),
  ...par(
    "portabilidade previdência complementar obstáculo procedência",
    "portabilidade improcedência requisitos regulamento não preenchidos"
  ),
  ...par(
    "PGBL VGBL tributação IR resgate procedência",
    "PGBL VGBL improcedência regime tributário contratado",
    "stj"
  ),
  ...par(
    "ação revisão suplementação aposentadoria STJ tema repetitivo",
    "suplementação aposentadoria improcedência coisa julgada",
    "stj"
  ),
];

/** Lote 48 — Mercado de capitais / CVM. */
export const TERMOS_MULTIAREA_LOTE_48: TermoSeed[] = [
  ...par(
    "CVM insider trading tipicidade condenação administrativa",
    "insider trading absolvição ausência informação privilegiada"
  ),
  ...par(
    "oferta pública ações informação inadequada indenização investidor",
    "oferta pública improcedência prospectus completo risco informado",
    "stj"
  ),
  ...par(
    "administrador fundo investimento responsabilidade perdas procedência",
    "fundo investimento improcedência risco de mercado divulgado"
  ),
  ...par(
    "debênture inadimplemento execução garantias procedência",
    "debênture improcedência reestruturação acordada"
  ),
  ...par(
    "manipulação mercado valores mobiliários sanção CVM",
    "manipulação mercado improcedência ausência dolo específico"
  ),
  ...par(
    "acionista minoritário abuso controle indenização procedência",
    "abuso controle improcedência deliberação assembleia regular",
    "stj"
  ),
  ...par(
    "OPA aquisição controle preço equitativo procedência",
    "OPA improcedência preço de mercado adequado"
  ),
  ...par(
    "consultor valores mobiliários recomendação inadequada procedência",
    "consultor improcedência perfil suitability observado"
  ),
];

/** Lote 49 — Energia / telecom regulatório. */
export const TERMOS_MULTIAREA_LOTE_49: TermoSeed[] = [
  ...par(
    "ANEEL tarifa energia reajuste abusivo procedência",
    "reajuste tarifa energia improcedência índice regulado válido"
  ),
  ...par(
    "corte energia elétrica inadimplência notificação prévia procedência",
    "corte energia improcedência notificação válida inadimplência"
  ),
  ...par(
    "geração distribuída solar crédito compensação procedência",
    "geração distribuída improcedência regra transição ANEEL"
  ),
  ...par(
    "ANATEL qualidade serviço telecom obrigação fazer procedência",
    "telecom qualidade improcedência metas regulatórias cumpridas"
  ),
  ...par(
    "portaabilidade numérica obstáculo operadora procedência",
    "portabilidade numérica improcedência pendência contratual"
  ),
  ...par(
    "fibra óptica instalação condomínio obrigação fazer procedência",
    "instalação fibra improcedência deliberação assembleia contrária"
  ),
  ...par(
    "gás canalizado concessionária falha fornecimento procedência",
    "gás canalizado improcedência manutenção programada avisada"
  ),
  ...par(
    "universalização serviço essencial telecom indenização procedência",
    "universalização improcedência plano cumprimento gradual"
  ),
];

/** Lote 50 — Conselhos profissionais. */
export const TERMOS_MULTIAREA_LOTE_50: TermoSeed[] = [
  ...par(
    "OAB processo disciplinar nulidade cerceamento defesa procedência",
    "OAB processo disciplinar improcedência contraditório observado"
  ),
  ...par(
    "CRM sanção médica cassação proporcionalidade procedência",
    "CRM cassação improcedência infração ética grave comprovada"
  ),
  ...par(
    "CREA exercício irregular engenharia multa procedência",
    "CREA multa improcedência atividade não privativa"
  ),
  ...par(
    "CRC contador responsabilidade técnica demonstrações procedência",
    "CRC responsabilidade improcedência ausência nexo causal"
  ),
  ...par(
    "CFP psicólogo sigilo profissional quebra justificada",
    "CFP sigilo improcedência dever legal comunicação"
  ),
  ...par(
    "inscrição conselho profissional indeferimento motivação procedência",
    "inscrição conselho improcedência requisito legal ausente"
  ),
  ...par(
    "anuidade conselho cobrança executiva procedência",
    "anuidade conselho improcedência serviço não prestado taxa"
  ),
  ...par(
    "publicidade profissional restrição ética anulação procedência",
    "publicidade profissional improcedência norma ética válida"
  ),
];

/** Lote 51 — Processo do trabalho. */
export const TERMOS_MULTIAREA_LOTE_51: TermoSeed[] = [
  ...par(
    "recurso ordinário trabalhista reforma sentença procedência",
    "recurso ordinário trabalhista negado provimento"
  ),
  ...par(
    "agravo de petição execução trabalhista reforma procedência",
    "agravo de petição improcedência cálculo regular"
  ),
  ...par(
    "recurso de revista TST transcendência procedência",
    "recurso de revista TST não conhecido ausência transcendência"
  ),
  ...par(
    "embargos declaração omissão acórdão trabalhista procedência",
    "embargos declaração rejeitados ausência omissão"
  ),
  ...par(
    "execução trabalhista penhora online deferimento",
    "penhora online trabalhista indeferimento impenhorabilidade"
  ),
  ...par(
    "jus postulandi Justiça Trabalho capacidade postulatória",
    "jus postulandi limitação fase recursal validade"
  ),
  ...par(
    "rito sumaríssimo trabalhista complexidade inviabilidade",
    "rito sumaríssimo adequação prova oral suficiente"
  ),
  ...par(
    "acordo judicial trabalhista homologação quitação ampla",
    "acordo trabalhista anulação vício consentimento"
  ),
];

/** Lote 52 — STF / controle concentrado. */
export const TERMOS_MULTIAREA_LOTE_52: TermoSeed[] = [
  ...par(
    "ADI ação direta inconstitucionalidade lei estadual cabimento",
    "ADI inviabilidade inadequação objeto lei municipal",
    "stf"
  ),
  ...par(
    "ADC ação declaratória constitucionalidade cabimento",
    "ADC inviabilidade controvérsia judicial insuficiente",
    "stf"
  ),
  ...par(
    "ADPF preceito fundamental lesão cabimento",
    "ADPF inviabilidade outra via eficaz",
    "stf"
  ),
  ...par(
    "repercussão geral recurso extraordinário reconhecimento",
    "repercussão geral ausência questão constitucional relevante",
    "stf"
  ),
  ...par(
    "súmula vinculante aplicação obrigatória procedência",
    "súmula vinculante inaplicabilidade distinção fática",
    "stf"
  ),
  ...par(
    "reclamação STF descumprimento súmula vinculante procedência",
    "reclamação STF improcedência ausência adesão vinculante",
    "stf"
  ),
  ...par(
    "mandado de injunção omissão legislativa procedência",
    "mandado de injunção improcedência norma regulamentadora existente",
    "stf"
  ),
  ...par(
    "controle concentrado medida cautelar suspensão lei",
    "medida cautelar ADI indeferimento ausência urgência",
    "stf"
  ),
];

// ——— Reforço áreas ainda rasas no produto (53–56) ———

/** Lote 53 — JECRIM II. */
export const TERMOS_MULTIAREA_LOTE_53: TermoSeed[] = [
  ...par(
    "JECRIM homicídio culposo trânsito tipicidade condenação",
    "homicídio culposo trânsito absolvição caso fortuito"
  ),
  ...par(
    "JECRIM embriaguez ao volante tipicidade materialidade",
    "embriaguez volante absolvição ausência prova alcoolemia"
  ),
  ...par(
    "JECRIM desacato tipicidade condenação",
    "desacato absolvição crítica a servidor atipicidade"
  ),
  ...par(
    "JECRIM dano simples patrimônio tipicidade",
    "dano simples absolvição insignificância atipicidade"
  ),
  ...par(
    "JECRIM exercício irregular profissão contravenção",
    "exercício irregular absolvição ausência habitualidade"
  ),
  ...par(
    "representação vítima crimes ação pública condicionada",
    "representação vítima decadência prazo esgotado"
  ),
  ...par(
    "JECRIM remessa Juízo comum complexidade prova",
    "JECRIM competência mantida menor potencial ofensivo"
  ),
  ...par(
    "transação penal descumprimento retomada persecução",
    "transação penal cumprimento extinção punibilidade"
  ),
];

/** Lote 54 — Agrário II + eleitoral II (metade cada). */
export const TERMOS_MULTIAREA_LOTE_54: TermoSeed[] = [
  ...par(
    "módulo rural propriedade familiar proteção procedência",
    "módulo rural improcedência área produtiva empresarial"
  ),
  ...par(
    "grilagem terra pública anulação título procedência",
    "título terra improcedência regularidade registral"
  ),
  ...par(
    "contrato safra antecipação preço inadimplemento procedência",
    "contrato safra improcedência quebra produção caso fortuito"
  ),
  ...par(
    "ITR imposto territorial rural progressividade procedência",
    "ITR improcedência declaração regular produtividade"
  ),
  ...par(
    "propaganda eleitoral redes sociais irregular multa",
    "propaganda redes sociais improcedência conteúdo jornalístico"
  ),
  ...par(
    "cassação mandato abuso poder político procedência",
    "cassação mandato improcedência ausência potencialidade"
  ),
  ...par(
    "ficha limpa inelegibilidade condenação colegiado",
    "ficha limpa improcedência ausência decisão colegiada"
  ),
  ...par(
    "doação campanha irregular sanção procedência",
    "doação campanha improcedência limite legal observado"
  ),
];

/** Lote 55 — Internacional II + digital II. */
export const TERMOS_MULTIAREA_LOTE_55: TermoSeed[] = [
  ...par(
    "exequatur sentença arbitral estrangeira STJ procedência",
    "exequatur denegação violação ordem pública nacional",
    "stj"
  ),
  ...par(
    "cooperação jurídica internacional MLA prova procedência",
    "cooperação internacional indeferimento ausência tratado",
    "stj"
  ),
  ...par(
    "dupla cidadania extradição obstáculo brasileiro nato",
    "extradição brasileiro nato impossibilidade constitucional",
    "stf"
  ),
  ...par(
    "contrato CISG compra venda internacional inadimplemento",
    "CISG improcedência exclusão contratual convenção"
  ),
  ...par(
    "LGPD transferência internacional dados adequação procedência",
    "transferência internacional dados improcedência cláusulas padrão",
    "stj"
  ),
  ...par(
    "criptomoeda execução penhora ativos digitais procedência",
    "penhora cripto improcedência impossibilidade localização ativos"
  ),
  ...par(
    "NFTs direito autoral titularidade disputa procedência",
    "NFT improcedência ausência originalidade obra"
  ),
  ...par(
    "inteligência artificial responsabilidade dano produto procedência",
    "IA responsabilidade improcedência uso inadequado usuário"
  ),
];

/** Lote 56 — Ambiental III + médico II. */
export const TERMOS_MULTIAREA_LOTE_56: TermoSeed[] = [
  ...par(
    "ACP ambiental obrigação fazer recuperação área procedência",
    "ACP ambiental improcedência ausência dano comprovado"
  ),
  ...par(
    "embargo obra IBAMA irregularidade procedência",
    "embargo obra improcedência licença ambiental válida"
  ),
  ...par(
    "compensação ambiental Cerrado Amazônia procedência",
    "compensação ambiental improcedência critérios legais cumpridos"
  ),
  ...par(
    "ruído urbano zoneamento restrição atividade procedência",
    "ruído urbano improcedência horários permitidos observados"
  ),
  ...par(
    "home care plano saúde continuidade tratamento procedência",
    "home care improcedência alta hospitalar critérios médicos",
    "stj"
  ),
  ...par(
    "medicamento alto custo SUS fornecimento procedência",
    "medicamento alto custo improcedência ausência registro ANVISA",
    "stj"
  ),
  ...par(
    "erro odontológico responsabilidade civil procedência",
    "erro odontológico improcedência complicação inerente"
  ),
  ...par(
    "pronto-socorro demora atendimento omissão Estado procedência",
    "demora atendimento improcedência protocolo fila urgência"
  ),
];

export const LOTES_31_A_56: Record<number, TermoSeed[]> = {
  31: TERMOS_MULTIAREA_LOTE_31,
  32: TERMOS_MULTIAREA_LOTE_32,
  33: TERMOS_MULTIAREA_LOTE_33,
  34: TERMOS_MULTIAREA_LOTE_34,
  35: TERMOS_MULTIAREA_LOTE_35,
  36: TERMOS_MULTIAREA_LOTE_36,
  37: TERMOS_MULTIAREA_LOTE_37,
  38: TERMOS_MULTIAREA_LOTE_38,
  39: TERMOS_MULTIAREA_LOTE_39,
  40: TERMOS_MULTIAREA_LOTE_40,
  41: TERMOS_MULTIAREA_LOTE_41,
  42: TERMOS_MULTIAREA_LOTE_42,
  43: TERMOS_MULTIAREA_LOTE_43,
  44: TERMOS_MULTIAREA_LOTE_44,
  45: TERMOS_MULTIAREA_LOTE_45,
  46: TERMOS_MULTIAREA_LOTE_46,
  47: TERMOS_MULTIAREA_LOTE_47,
  48: TERMOS_MULTIAREA_LOTE_48,
  49: TERMOS_MULTIAREA_LOTE_49,
  50: TERMOS_MULTIAREA_LOTE_50,
  51: TERMOS_MULTIAREA_LOTE_51,
  52: TERMOS_MULTIAREA_LOTE_52,
  53: TERMOS_MULTIAREA_LOTE_53,
  54: TERMOS_MULTIAREA_LOTE_54,
  55: TERMOS_MULTIAREA_LOTE_55,
  56: TERMOS_MULTIAREA_LOTE_56,
};

export const ROTULO_LOTE_31_56: Record<number, string> = {
  31: "JEC / consumidor III",
  32: "Trabalhista III",
  33: "Penal / processo penal II",
  34: "Família III",
  35: "Tributário III",
  36: "Previdenciário II",
  37: "Bancário / CDC reforço",
  38: "Administrativo / licitações II",
  39: "Imobiliário III",
  40: "Empresarial II",
  41: "Marítimo / portuário",
  42: "Aeronáutico / aviação",
  43: "Desportivo",
  44: "Urbanístico",
  45: "Militar / castrense",
  46: "Infância e juventude (ECA)",
  47: "Previdência complementar",
  48: "Mercado de capitais / CVM",
  49: "Energia / telecom",
  50: "Conselhos profissionais",
  51: "Processo do trabalho",
  52: "STF / controle concentrado",
  53: "JECRIM II",
  54: "Agrário II + eleitoral II",
  55: "Internacional II + digital II",
  56: "Ambiental III + médico II",
};
