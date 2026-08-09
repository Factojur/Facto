/**
 * Seed STJ lotes 21–28 (Súmulas 201–280).
 * Canceladas fora do RAG: 212, 217, 222, 230, 256, 263, 276.
 * Uso: node scripts/seed-sumulas-stj-lote-21-28.mjs
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

const CANCELADAS = [212,217,222,230,256,263,276];

const ITEMS = [
  [
    201,
    "Os honorários advocatícios não podem ser fixados em salários-mínimos."
  ],
  [
    202,
    "A impetração de segurança por terceiro, contra ato judicial, não se condiciona à interposição de recurso."
  ],
  [
    203,
    "Não cabe recurso especial contra decisão proferida por órgão de segundo grau dos Juizados Especiais."
  ],
  [
    204,
    "Os juros de mora nas ações relativas a benefícios previdenciários incidem a partir da citação válida."
  ],
  [
    205,
    "A Lei 8.009/90 aplica-se à penhora realizada antes de sua vigência."
  ],
  [
    206,
    "A existência de vara privativa, instituída por lei estadual, não altera a competência territorial resultante das leis de processo."
  ],
  [
    207,
    "É inadmissível recurso especial quando cabíveis embargos infringentes contra o acórdão proferido no Tribunal de origem."
  ],
  [
    208,
    "Compete à Justiça Federal processar e julgar prefeito municipal por desvio de verba sujeita a prestação de contas perante órgão federal."
  ],
  [
    209,
    "Compete à Justiça Estadual processar e julgar prefeito por desvio de verba transferida e incorporada ao patrimônio municipal."
  ],
  [
    210,
    "A ação de cobrança das contribuições para o FGTS prescreve em trinta (30) anos."
  ],
  [
    211,
    "Inadmissível recurso especial quanto à questão que, a despeito da oposição de embargos declaratórios, não foi apreciada pelo Tribunal a quo."
  ],
  [
    213,
    "O mandado de segurança constitui ação adequada para a declaração do direito à compensação tributária."
  ],
  [
    214,
    "O fiador na locação não responde por obrigações resultantes de aditamento ao qual não anuiu."
  ],
  [
    215,
    "A indenização recebida pela adesão a programa de incentivo à demissão voluntária não está sujeita à incidência do imposto de renda."
  ],
  [
    216,
    "A tempestividade de recurso interposto no Superior Tribunal de Justiça é aferida pelo registro no protocolo da secretaria e não pela data da entrega na agência do correio."
  ],
  [
    218,
    "Compete à Justiça dos Estados processar e julgar ação de servidor estadual decorrente de direitos e vantagens estatutárias no exercício de cargo em comissão."
  ],
  [
    219,
    "Os créditos decorrentes de serviços prestados à massa falida, inclusive a remuneração do síndico, gozam dos privilégios próprios dos trabalhistas."
  ],
  [
    220,
    "A reincidência não influi no prazo da prescrição da pretensão punitiva."
  ],
  [
    221,
    "São civilmente responsáveis pelo ressarcimento de dano, decorrente de publicação pela imprensa, tanto o autor do escrito quanto o proprietário do veículo de divulgação."
  ],
  [
    223,
    "A certidão de intimação do acórdão recorrido constitui peça obrigatória do instrumento de agravo."
  ],
  [
    224,
    "Excluído do feito o ente federal, cuja presença levara o Juiz Estadual a declinar da competência, deve o Juiz Federal restituir os autos e não suscitar conflito."
  ],
  [
    225,
    "Compete ao Tribunal Regional do Trabalho apreciar recurso contra sentença proferida por órgão de primeiro grau da Justiça Trabalhista, ainda que para declarar-lhe a nulidade em virtude de incompetência."
  ],
  [
    226,
    "O Ministério Público tem legitimidade para recorrer na ação de acidente do trabalho, ainda que o segurado esteja assistido por advogado."
  ],
  [
    227,
    "A pessoa jurídica pode sofrer dano moral."
  ],
  [
    228,
    "É inadmissível o interdito proibitório para a proteção do direito autoral."
  ],
  [
    229,
    "O pedido do pagamento de indenização à seguradora suspende o prazo de prescrição até que o segurado tenha ciência da decisão."
  ],
  [
    231,
    "A incidência da circunstância atenuante não pode conduzir à redução da pena abaixo do mínimo legal."
  ],
  [
    232,
    "A Fazenda Pública, quando parte no processo, fica sujeita à exigência do depósito prévio dos honorários do perito."
  ],
  [
    233,
    "O contrato de abertura de crédito, ainda que acompanhado de extrato da conta-corrente, não é título executivo."
  ],
  [
    234,
    "A participação de membro do Ministério Público na fase investigatória criminal não acarreta o seu impedimento ou suspeição para o oferecimento da denúncia."
  ],
  [
    235,
    "A conexão não determina a reunião dos processos, se um deles já foi julgado."
  ],
  [
    236,
    "Não compete ao Superior Tribunal de Justiça dirimir conflitos de competência entre juízes trabalhistas vinculados a Tribunais Regionais do Trabalho diversos."
  ],
  [
    237,
    "Nas operações com cartão de crédito, os encargos relativos ao financiamento não são considerados no cálculo do ICMS."
  ],
  [
    238,
    "A avaliação da indenização devida ao proprietário do solo, em razão de alvará de pesquisa mineral, é processada no Juízo Estadual da situação do imóvel."
  ],
  [
    239,
    "O direito à adjudicação compulsória não se condiciona ao registro do compromisso de compra e venda no cartório de imóveis."
  ],
  [
    240,
    "A extinção do processo, por abandono da causa pelo autor, depende de requerimento do réu."
  ],
  [
    241,
    "A reincidência penal não pode ser considerada como circunstância agravante e, simultaneamente, como circunstância judicial."
  ],
  [
    242,
    "Cabe ação declaratória para reconhecimento de tempo de serviço para fins previdenciários."
  ],
  [
    243,
    "O benefício da suspensão do processo não é aplicável em relação às infrações penais cometidas em concurso material, concurso formal ou continuidade delitiva, quando a pena mínima cominada, seja pelo somatório, seja pela incidência da majorante, ultrapassar o limite de um (01) ano."
  ],
  [
    244,
    "Compete ao foro do local da recusa processar e julgar o crime de estelionato mediante cheque sem provisão de fundos."
  ],
  [
    245,
    "A notificação destinada a comprovar a mora nas dívidas garantidas por alienação fiduciária dispensa a indicação do valor do débito."
  ],
  [
    246,
    "O valor do seguro obrigatório deve ser deduzido da indenização judicialmente fixada."
  ],
  [
    247,
    "O contrato de abertura de crédito em conta-corrente, acompanhado do demonstrativo de débito, constitui documento hábil para o ajuizamento da ação monitória."
  ],
  [
    248,
    "Comprovada a prestação dos serviços, a duplicata não aceita, mas protestada, é título hábil para instruir pedido de falência."
  ],
  [
    249,
    "A Caixa Econômica Federal tem legitimidade passiva para integrar processo em que se discute correção monetária do FGTS."
  ],
  [
    250,
    "É legítima a cobrança de multa fiscal de empresa em regime de concordata."
  ],
  [
    251,
    "A meação só responde pelo ato ilícito quando o credor, na execução fiscal, provar que o enriquecimento dele resultante aproveitou ao casal."
  ],
  [
    252,
    "Os saldos das contas do FGTS, pela legislação infraconstitucional, são corrigidos em 42,72% (IPC) quanto às perdas de janeiro de 1989 e 44,80% (IPC) quanto às de abril de 1990, acolhidos pelo STJ os índices de 18,02% (LBC) quanto às perdas de junho de 1987, de 5,38% (BTN) para maio de 1990 e 7,00% (TR) para fevereiro de 1991, de acordo com o entendimento do STF (RE 226.855-7-RS)."
  ],
  [
    253,
    "O art. 557 do CPC, que autoriza o relator a decidir o recurso, alcança o reexame necessário."
  ],
  [
    254,
    "A decisão do Juízo Federal que exclui da relação processual ente federal não pode ser reexaminada no Juízo Estadual."
  ],
  [
    255,
    "Cabem embargos infringentes contra acórdão, proferido por maioria, em agravo retido, quando se tratar de matéria de mérito."
  ],
  [
    257,
    "A falta de pagamento do prêmio do seguro obrigatório de Danos Pessoais Causados por Veículos Automotores de Vias Terrestres (DPVAT) não é motivo para a recusa do pagamento da indenização."
  ],
  [
    258,
    "A nota promissória vinculada a contrato de abertura de crédito não goza de autonomia em razão da iliquidez do título que a originou."
  ],
  [
    259,
    "A ação de prestação de contas pode ser proposta pelo titular de conta-corrente bancária."
  ],
  [
    260,
    "A convenção de condomínio aprovada, ainda que sem registro, é eficaz para regular as relações entre os condôminos."
  ],
  [
    261,
    "A cobrança de direitos autorais pela retransmissão radiofônica de músicas, em estabelecimentos hoteleiros, deve ser feita conforme a taxa média de utilização do equipamento, apurada em liquidação."
  ],
  [
    262,
    "Incide o imposto de renda sobre o resultado das aplicações financeiras realizadas pelas cooperativas."
  ],
  [
    264,
    "É irrecorrível o ato judicial que apenas manda processar a concordata preventiva."
  ],
  [
    265,
    "É necessária a oitiva do menor infrator antes de decretar-se a regressão da medida socioeducativa."
  ],
  [
    266,
    "O diploma ou habilitação legal para o exercício do cargo deve ser exigido na posse e não na inscrição para o concurso público."
  ],
  [
    267,
    "A interposição de recurso, sem efeito suspensivo, contra decisão condenatória não obsta a expedição de mandado de prisão."
  ],
  [
    268,
    "O fiador que não integrou a relação processual na ação de despejo não responde pela execução do julgado."
  ],
  [
    269,
    "É admissível a adoção do regime prisional semiaberto aos reincidentes condenados a pena igual ou inferior a quatro anos se favoráveis as circunstâncias judiciais."
  ],
  [
    270,
    "O protesto pela preferência de crédito, apresentado por ente federal em execução que tramita na Justiça Estadual, não desloca a competência para a Justiça Federal."
  ],
  [
    271,
    "A correção monetária dos depósitos judiciais independe de ação específica contra o banco depositário."
  ],
  [
    272,
    "O trabalhador rural, na condição de segurado especial, sujeito à contribuição obrigatória sobre a produção rural comercializada, somente faz jus à aposentadoria por tempo de serviço, se recolher contribuições facultativas."
  ],
  [
    273,
    "Intimada a defesa da expedição da carta precatória, torna-se desnecessária intimação da data da audiência no juízo deprecado."
  ],
  [
    274,
    "O ISS incide sobre o valor dos serviços de assistência médica, incluindo-se neles as refeições, os medicamentos e as diárias hospitalares."
  ],
  [
    275,
    "O auxiliar de farmácia não pode ser responsável técnico por farmácia ou drogaria."
  ],
  [
    277,
    "Julgada procedente a investigação de paternidade, os alimentos são devidos a partir da citação."
  ],
  [
    278,
    "O termo inicial do prazo prescricional, na ação de indenização, é a data em que o segurado teve ciência inequívoca da incapacidade laboral."
  ],
  [
    279,
    "É cabível execução por título extrajudicial contra a Fazenda Pública."
  ],
  [
    280,
    "O art. 35 do Decreto-Lei n. 7.661, de 1945, que estabelece a prisão administrativa, foi revogado pelos incisos LXI e LXVII do art. 5º da Constituição Federal de 1988."
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
console.log("STJ lotes 21–28: 201–280. Próximo: 281–290.");
if (falha) process.exit(1);
