/**
 * Seed STJ lotes 53–60 (Súmulas 521–600).
 * Canceladas fora do RAG: 528.
 * Uso: node scripts/seed-sumulas-stj-lote-53-60.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 0) continue;
      const k = t.slice(0, i).trim();
      let v = t.slice(i + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {
    /* ignore */
  }
}

loadEnvLocal();

const CANCELADAS = [528];

const ITEMS = [
  [
    521,
    "A legitimidade para a execução fiscal de multa pendente de pagamento imposta em sentença condenatória é exclusiva da Procuradoria da Fazenda Pública."
  ],
  [
    522,
    "A conduta de atribuir-se falsa identidade perante autoridade policial é típica, ainda que em situação de alegada autodefesa."
  ],
  [
    523,
    "A taxa de juros de mora incidente na repetição de indébito de tributos estaduais deve corresponder à utilizada para cobrança do tributo pago em atraso, sendo legítima a incidência da taxa Selic, em ambas as hipóteses, quando prevista na legislação local, vedada sua cumulação com quaisquer outros índices."
  ],
  [
    524,
    "No tocante à base de cálculo, o ISSQN incide apenas sobre a taxa de agenciamento quando o serviço prestado por sociedade empresária de trabalho temporário for de intermediação, devendo, entretanto, englobar também os valores dos salários e encargos sociais dos trabalhadores por ela contratados nas hipóteses de fornecimento de mão de obra."
  ],
  [
    525,
    "A Câmara de Vereadores não possui personalidade jurídica, apenas personalidade judiciária, somente podendo demandar em juízo para defender os seus direitos institucionais."
  ],
  [
    526,
    "O reconhecimento de falta grave decorrente do cometimento de fato definido como crime doloso no cumprimento da pena prescinde do trânsito em julgado de sentença penal condenatória no processo penal instaurado para apuração do fato."
  ],
  [
    527,
    "O tempo de duração da medida de segurança não deve ultrapassar o limite máximo da pena abstratamente cominada ao delito praticado."
  ],
  [
    529,
    "No seguro de responsabilidade civil facultativo, não cabe o ajuizamento de ação pelo terceiro prejudicado direta e exclusivamente em face da seguradora do apontado causador do dano."
  ],
  [
    530,
    "Nos contratos bancários, na impossibilidade de comprovar a taxa de juros efetivamente contratada - por ausência de pactuação ou pela falta de juntada do instrumento aos autos -, aplica-se a taxa média de mercado, divulgada pelo Bacen, praticada nas operações da mesma espécie, salvo se a taxa cobrada for mais vantajosa para o devedor."
  ],
  [
    531,
    "Em ação monitória fundada em cheque prescrito ajuizada contra o emitente, é dispensável a menção ao negócio jurídico subjacente à emissão da cártula."
  ],
  [
    532,
    "Constitui prática comercial abusiva o envio de cartão de crédito sem prévia e expressa solicitação do consumidor, configurando-se ato ilícito indenizável e sujeito à aplicação de multa administrativa."
  ],
  [
    533,
    "Para o reconhecimento da prática de falta disciplinar no âmbito da execução penal, é imprescindível a instauração de procedimento administrativo pelo diretor do estabelecimento prisional, assegurado o direito de defesa, a ser realizado por advogado constituído ou defensor público nomeado."
  ],
  [
    534,
    "A prática de falta grave interrompe a contagem do prazo para a progressão de regime de cumprimento de pena, o qual se reinicia a partir do cometimento dessa infração."
  ],
  [
    535,
    "A prática de falta grave não interrompe o prazo para fim de comutação de pena ou indulto."
  ],
  [
    536,
    "A suspensão condicional do processo e a transação penal não se aplicam na hipótese de delitos sujeitos ao rito da Lei Maria da Penha."
  ],
  [
    537,
    "Em ação de reparação de danos, a seguradora denunciada, se aceitar a denunciação ou contestar o pedido do autor, pode ser condenada, direta e solidariamente junto com o segurado, ao pagamento da indenização devida à vítima, nos limites contratados na apólice."
  ],
  [
    538,
    "As administradoras de consórcio têm liberdade para estabelecer a respectiva taxa de administração, ainda que fixada em percentual superior a dez por cento."
  ],
  [
    539,
    "É permitida a capitalização de juros com periodicidade inferior à anual em contratos celebrados com instituições integrantes do Sistema Financeiro Nacional a partir de 31/3/2000 (MP n. 1.963-17/2000, reeditada como MP n. 2.170-36/2001), desde que expressamente pactuada."
  ],
  [
    540,
    "Na ação de cobrança do seguro DPVAT, constitui faculdade do autor escolher entre os foros do seu domicílio, do local do acidente ou ainda do domicílio do réu."
  ],
  [
    541,
    "A previsão no contrato bancário de taxa de juros anual superior ao duodécuplo da mensal é suficiente para permitir a cobrança da taxa efetiva anual contratada."
  ],
  [
    542,
    "A ação penal relativa ao crime de lesão corporal resultante de violência doméstica contra a mulher é pública incondicionada."
  ],
  [
    543,
    "Na hipótese de resolução de contrato de promessa de compra e venda de imóvel submetido ao Código de Defesa do Consumidor, deve ocorrer a imediata restituição das parcelas pagas pelo promitente comprador - integralmente, em caso de culpa exclusiva do promitente vendedor/construtor, ou parcialmente, caso tenha sido o comprador quem deu causa ao desfazimento."
  ],
  [
    544,
    "É válida a utilização de tabela do Conselho Nacional de Seguros Privados para estabelecer a proporcionalidade da indenização do seguro DPVAT ao grau de invalidez também na hipótese de sinistro anterior a 16/12/2008, data da entrada em vigor da Medida Provisória n. 451/2008."
  ],
  [
    545,
    "A confissão do autor possibilita a atenuação da pena prevista no art. 65, III, d, do Código Penal, independentemente de ser utilizada na formação do convencimento do julgador."
  ],
  [
    546,
    "A competência para processar e julgar o crime de uso de documento falso é firmada em razão da entidade ou órgão ao qual foi apresentado o documento público, não importando a qualificação do órgão expedidor."
  ],
  [
    547,
    "Nas ações em que se pleiteia o ressarcimento dos valores pagos a título de participação financeira do consumidor no custeio de construção de rede elétrica, o prazo prescricional é de vinte anos na vigência do Código Civil de 1916. Na vigência do Código Civil de 2002, o prazo é de cinco anos se houver previsão contratual de ressarcimento e de três anos na ausência de cláusula nesse sentido, observada a regra de transição disciplinada em seu art. 2.028."
  ],
  [
    548,
    "Incumbe ao credor a exclusão do registro da dívida em nome do devedor no cadastro de inadimplentes no prazo de cinco dias úteis, a partir do integral e efetivo pagamento do débito."
  ],
  [
    549,
    "É válida a penhora de bem de família pertencente a fiador de contrato de locação."
  ],
  [
    550,
    "A utilização de escore de crédito, método estatístico de avaliação de risco que não constitui banco de dados, dispensa o consentimento do consumidor, que terá o direito de solicitar esclarecimentos sobre as informações pessoais valoradas e as fontes dos dados considerados no respectivo cálculo."
  ],
  [
    551,
    "Nas demandas por complementação de ações de empresas de telefonia, admite-se a condenação ao pagamento de dividendos e juros sobre capital próprio independentemente de pedido expresso. No entanto, somente quando previstos no título executivo, poderão ser objeto de cumprimento de sentença."
  ],
  [
    552,
    "O portador de surdez unilateral não se qualifica como pessoa com deficiência para o fim de disputar as vagas reservadas em concursos públicos."
  ],
  [
    553,
    "Nos casos de empréstimo compulsório sobre o consumo de energia elétrica, é competente a Justiça estadual para o julgamento de demanda proposta exclusivamente contra a Eletrobrás. Requerida a intervenção da União no feito após a prolação de sentença pelo juízo estadual, os autos devem ser remetidos ao Tribunal Regional Federal competente para o julgamento da apelação se deferida a intervenção."
  ],
  [
    554,
    "Na hipótese de sucessão empresarial, a responsabilidade da sucessora abrange não apenas os tributos devidos pela sucedida, mas também as multas moratórias ou punitivas referentes a fatos geradores ocorridos até a data da sucessão."
  ],
  [
    555,
    "Quando não houver declaração do débito, o prazo decadencial quinquenal para o Fisco constituir o crédito tributário conta-se exclusivamente na forma do art. 173, I, do CTN, nos casos em que a legislação atribui ao sujeito passivo o dever de antecipar o pagamento sem prévio exame da autoridade administrativa."
  ],
  [
    556,
    "É indevida a incidência de imposto de renda sobre o valor da complementação de aposentadoria pago por entidade de previdência privada e em relação ao resgate de contribuições recolhidas para referidas entidades patrocinadoras no período de 1º/1/1989 a 31/12/1995, em razão da isenção concedida pelo art. 6º, VII, b, da Lei n. 7.713/1988, na redação anterior à que lhe foi dada pela Lei n. 9.250/1995."
  ],
  [
    557,
    "A renda mensal inicial (RMI) alusiva ao benefício de aposentadoria por invalidez precedido de auxílio-doença será apurada na forma do art. 36, § 7º, do Decreto n. 3.048/1999, observando-se, porém, os critérios previstos no art. 29, § 5º, da Lei n. 8.213/1991, quando intercalados períodos de afastamento e de atividade laboral."
  ],
  [
    558,
    "Em ações de execução fiscal, a petição inicial não pode ser indeferida sob o argumento da falta de indicação do CPF e/ou RG ou CNPJ da parte executada."
  ],
  [
    559,
    "Em ações de execução fiscal, é desnecessária a instrução da petição inicial com o demonstrativo de cálculo do débito, por tratar-se de requisito não previsto no art. 6º da Lei n. 6.830/1980."
  ],
  [
    560,
    "A decretação da indisponibilidade de bens e direitos, na forma do art. 185-A do CTN, pressupõe o exaurimento das diligências na busca por bens penhoráveis, o qual fica caracterizado quando infrutíferos o pedido de constrição sobre ativos financeiros e a expedição de ofícios aos registros públicos do domicílio do executado, ao Denatran ou Detran."
  ],
  [
    561,
    "Os Conselhos Regionais de Farmácia possuem atribuição para fiscalizar e autuar as farmácias e drogarias quanto ao cumprimento da exigência de manter profissional legalmente habilitado (farmacêutico) durante todo o período de funcionamento dos respectivos estabelecimentos."
  ],
  [
    562,
    "É possível a remição de parte do tempo de execução da pena quando o condenado, em regime fechado ou semiaberto, desempenha atividade laborativa, ainda que extramuros."
  ],
  [
    563,
    "O Código de Defesa do Consumidor é aplicável às entidades abertas de previdência complementar, não incidindo nos contratos previdenciários celebrados com entidades fechadas."
  ],
  [
    564,
    "No caso de reintegração de posse em arrendamento mercantil financeiro, quando a soma da importância antecipada a título de valor residual garantido (VRG) com o valor da venda do bem ultrapassar o total do VRG previsto contratualmente, o arrendatário terá direito de receber a respectiva diferença, cabendo, porém, se estipulado no contrato, o prévio desconto de outras despesas ou encargos pactuados."
  ],
  [
    565,
    "A pactuação das tarifas de abertura de crédito (TAC) e de emissão de carnê (TEC), ou outra denominação para o mesmo fato gerador, é válida apenas nos contratos bancários anteriores ao início da vigência da Resolução-CMN n. 3.518/2007, em 30/4/2008."
  ],
  [
    566,
    "Nos contratos bancários posteriores ao início da vigência da Resolução-CMN n. 3.518/2007, em 30/4/2008, pode ser cobrada a tarifa de cadastro no início do relacionamento entre o consumidor e a instituição financeira."
  ],
  [
    567,
    "Sistema de vigilância realizado por monitoramento eletrônico ou por existência de segurança no interior de estabelecimento comercial, por si só, não torna impossível a configuração do crime de furto."
  ],
  [
    568,
    "O relator, monocraticamente e no Superior Tribunal de Justiça, poderá dar ou negar provimento ao recurso quando houver entendimento dominante acerca do tema."
  ],
  [
    569,
    "Na importação, é indevida a exigência de nova certidão negativa de débito no desembaraço aduaneiro, se já apresentada a comprovação da quitação de tributos federais quando da concessão do benefício relativo ao regime de drawback."
  ],
  [
    570,
    "Compete à Justiça Federal o processo e julgamento de demanda em que se discute a ausência de ou o obstáculo ao credenciamento de instituição particular de ensino superior no Ministério da Educação como condição de expedição de diploma de ensino a distância aos estudantes."
  ],
  [
    571,
    "A taxa progressiva de juros não se aplica às contas vinculadas ao FGTS de trabalhadores qualificados como avulsos."
  ],
  [
    572,
    "O Banco do Brasil, na condição de gestor do Cadastro de Emitentes de Cheques sem Fundos (CCF), não tem a responsabilidade de notificar previamente o devedor acerca da sua inscrição no aludido cadastro, tampouco legitimidade passiva para as ações de reparação de danos fundadas na ausência de prévia comunicação."
  ],
  [
    573,
    "Nas ações de indenização decorrente de seguro DPVAT, a ciência inequívoca do caráter permanente da invalidez, para fins de contagem do prazo prescricional, depende de laudo médico, exceto nos casos de invalidez permanente notória ou naqueles em que o conhecimento anterior resulte comprovado na fase de instrução."
  ],
  [
    574,
    "Para a configuração do delito de violação de direito autoral e a comprovação de sua materialidade, é suficiente a perícia realizada por amostragem do produto apreendido, nos aspectos externos do material, e é desnecessária a identificação dos titulares dos direitos autorais violados ou daqueles que os representem."
  ],
  [
    575,
    "Constitui crime a conduta de permitir, confiar ou entregar a direção de veículo automotor a pessoa que não seja habilitada, ou que se encontre em qualquer das situações previstas no art. 310 do CTB, independentemente da ocorrência de lesão ou de perigo de dano concreto na condução do veículo."
  ],
  [
    576,
    "Ausente requerimento administrativo no INSS, o termo inicial para a implantação da aposentadoria por invalidez concedida judicialmente será a data da citação válida."
  ],
  [
    577,
    "É possível reconhecer o tempo de serviço rural anterior ao documento mais antigo apresentado, desde que amparado em convincente prova testemunhal colhida sob o contraditório."
  ],
  [
    578,
    "Os empregados que laboram no cultivo da cana-de-açúcar para empresa agroindustrial ligada ao setor sucroalcooleiro detêm a qualidade de rurícola, ensejando a isenção do FGTS desde a edição da Lei Complementar n. 11/1971 até a promulgação da Constituição Federal de 1988."
  ],
  [
    579,
    "Não é necessário ratificar o recurso especial interposto na pendência do julgamento dos embargos de declaração, quando inalterado o resultado anterior."
  ],
  [
    580,
    "A correção monetária nas indenizações do seguro DPVAT por morte ou invalidez, prevista no § 7º do art. 5º da Lei n. 6.194/1974, redação dada pela Lei n. 11.482/2007, incide desde a data do evento danoso."
  ],
  [
    581,
    "A recuperação judicial do devedor principal não impede o prosseguimento das ações e execuções ajuizadas contra terceiros devedores solidários ou coobrigados em geral, por garantia cambial, real ou fidejussória."
  ],
  [
    582,
    "Consuma-se o crime de roubo com a inversão da posse do bem mediante emprego de violência ou grave ameaça, ainda que por breve tempo e em seguida à perseguição imediata ao agente e recuperação da coisa roubada, sendo prescindível a posse mansa e pacífica ou desvigiada."
  ],
  [
    583,
    "O arquivamento provisório previsto no art. 20 da Lei n. 10.522/2002, dirigido aos débitos inscritos como dívida ativa da União pela Procuradoria-Geral da Fazenda Nacional ou por ela cobrados, não se aplica às execuções fiscais movidas pelos conselhos de fiscalização profissional ou pelas autarquias federais."
  ],
  [
    584,
    "As sociedades corretoras de seguros, que não se confundem com as sociedades de valores mobiliários ou com os agentes autônomos de seguro privado, estão fora do rol de entidades constantes do art. 22, § 1º, da Lei n. 8.212/1991, não se sujeitando à majoração da alíquota da Cofins prevista no art. 18 da Lei n. 10.684/2003."
  ],
  [
    585,
    "A responsabilidade solidária do ex-proprietário, prevista no art. 134 do Código de Trânsito Brasileiro - CTB, não abrange o IPVA incidente sobre o veículo automotor, no que se refere ao período posterior à sua alienação."
  ],
  [
    586,
    "A exigência de acordo entre o credor e o devedor na escolha do agente fiduciário aplica-se, exclusivamente, aos contratos não vinculados ao Sistema Financeiro da Habitação - SFH."
  ],
  [
    587,
    "Para a incidência da majorante prevista no art. 40, V, da Lei n. 11.343/2006, é desnecessária a efetiva transposição de fronteiras entre estados da Federação, sendo suficiente a demonstração inequívoca da intenção de realizar o tráfico interestadual."
  ],
  [
    588,
    "A prática de crime ou contravenção penal contra a mulher com violência ou grave ameaça no ambiente doméstico impossibilita a substituição da pena privativa de liberdade por restritiva de direitos."
  ],
  [
    589,
    "É inaplicável o princípio da insignificância nos crimes ou contravenções penais praticados contra a mulher no âmbito das relações domésticas."
  ],
  [
    590,
    "Constitui acréscimo patrimonial a atrair a incidência do imposto de renda, em caso de liquidação de entidade de previdência privada, a quantia que couber a cada participante, por rateio do patrimônio, superior ao valor das respectivas contribuições à entidade em liquidação, devidamente atualizadas e corrigidas."
  ],
  [
    591,
    "É permitida a prova emprestada no processo administrativo disciplinar, desde que devidamente autorizada pelo juízo competente e respeitados o contraditório e a ampla defesa."
  ],
  [
    592,
    "O excesso de prazo para a conclusão do processo administrativo disciplinar só causa nulidade se houver demonstração de prejuízo à defesa."
  ],
  [
    593,
    "O crime de estupro de vulnerável se configura com a conjunção carnal ou prática de ato libidinoso com menor de 14 anos, sendo irrelevante eventual consentimento da vítima para a prática do ato, sua experiência sexual anterior ou existência de relacionamento amoroso com o agente."
  ],
  [
    594,
    "O Ministério Público tem legitimidade ativa para ajuizar ação de alimentos em proveito de criança ou adolescente independentemente do exercício do poder familiar dos pais, ou do fato de o menor se encontrar nas situações de risco descritas no art. 98 do Estatuto da Criança e do Adolescente, ou de quaisquer outros questionamentos acerca da existência ou eficiência da Defensoria Pública na comarca."
  ],
  [
    595,
    "As instituições de ensino superior respondem objetivamente pelos danos suportados pelo aluno/consumidor pela realização de curso não reconhecido pelo Ministério da Educação, sobre o qual não lhe tenha sido dada prévia e adequada informação."
  ],
  [
    596,
    "A obrigação alimentar dos avós tem natureza complementar e subsidiária, somente se configurando no caso de impossibilidade total ou parcial de seu cumprimento pelos pais."
  ],
  [
    597,
    "A cláusula contratual de plano de saúde que prevê carência para utilização dos serviços de assistência médica nas situações de emergência ou de urgência é considerada abusiva se ultrapassado o prazo máximo de 24 horas contado da data da contratação."
  ],
  [
    598,
    "É desnecessária a apresentação de laudo médico oficial para o reconhecimento judicial da isenção do imposto de renda, desde que o magistrado entenda suficientemente demonstrada a doença grave por outros meios de prova."
  ],
  [
    599,
    "O princípio da insignificância é inaplicável aos crimes contra a administração pública."
  ],
  [
    600,
    "Para a configuração da violência doméstica e familiar prevista no artigo 5º da Lei n. 11.340/2006 (Lei Maria da Penha) não se exige a coabitação entre autor e vítima."
  ]
];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let ok = 0;
let falha = 0;
let removidas = 0;

for (const n of CANCELADAS) {
  const titulo = `Súmula ${n} do STJ`;
  const { data: existente } = await supabase
    .from("base_conhecimento")
    .select("id")
    .eq("titulo", titulo)
    .maybeSingle();
  if (existente?.id) {
    const { error } = await supabase
      .from("base_conhecimento")
      .delete()
      .eq("id", existente.id);
    if (error) {
      console.error("ERRO delete cancelada", titulo, error.message);
      falha++;
    } else {
      console.log("OK remove cancelada", titulo);
      removidas++;
    }
  } else {
    console.log("skip (não estava no RAG)", titulo);
  }
}

for (const [n, enunciado] of ITEMS) {
  const titulo = `Súmula ${n} do STJ`;
  const texto = `Súmula ${n}/STJ (ATIVA): ${enunciado}`;
  const { data: existente } = await supabase
    .from("base_conhecimento")
    .select("id")
    .eq("titulo", titulo)
    .maybeSingle();

  const { error } = existente?.id
    ? await supabase
        .from("base_conhecimento")
        .update({ categoria: "Súmula", texto })
        .eq("id", existente.id)
    : await supabase.from("base_conhecimento").insert({
        titulo,
        categoria: "Súmula",
        texto,
      });

  if (error) {
    console.error("ERRO", titulo, error.message);
    falha++;
  } else {
    console.log(existente?.id ? "OK update" : "OK insert", titulo);
    ok++;
  }
}

console.log(
  `\nConcluído: ${ok} ativas ok, ${removidas} cancelada(s) removida(s), ${falha} falha(s).`
);
console.log("STJ lotes 53–60: 521–600. Próximo: 601–676+.");
if (falha) process.exit(1);
