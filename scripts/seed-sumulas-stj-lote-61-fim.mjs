/**
 * Seed STJ lotes 61–68 (Súmulas 601–676).
 * Canceladas fora do RAG: 603.
 * Uso: node scripts/seed-sumulas-stj-lote-61-fim.mjs
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

const CANCELADAS = [603];

const ITEMS = [
  [
    601,
    "O Ministério Público tem legitimidade ativa para atuar na defesa de direitos difusos, coletivos e individuais homogêneos dos consumidores, ainda que decorrentes da prestação de serviço público."
  ],
  [
    602,
    "O Código de Defesa do Consumidor é aplicável aos empreendimentos habitacionais promovidos pelas sociedades cooperativas."
  ],
  [
    604,
    "O mandado de segurança não se presta para atribuir efeito suspensivo a recurso criminal interposto pelo Ministério Público."
  ],
  [
    605,
    "A superveniência da maioridade penal não interfere na apuração de ato infracional nem na aplicabilidade de medida socioeducativa em curso, inclusive na liberdade assistida, enquanto não atingida a idade de 21 anos."
  ],
  [
    606,
    "Não se aplica o princípio da insignificância a casos de transmissão clandestina de sinal de internet via radiofrequência, que caracteriza o fato típico previsto no art. 183 da Lei n. 9.472/1997."
  ],
  [
    607,
    "A majorante do tráfico transnacional de drogas (art. 40, I, da Lei n. 11.343/2006) configura-se com a prova da destinação internacional das drogas, ainda que não consumada a transposição de fronteiras."
  ],
  [
    608,
    "Aplica-se o Código de Defesa do Consumidor aos contratos de plano de saúde, salvo os administrados por entidades de autogestão."
  ],
  [
    609,
    "A recusa de cobertura securitária, sob a alegação de doença preexistente, é ilícita se não houve a exigência de exames médicos prévios à contratação ou a demonstração de má-fé do segurado."
  ],
  [
    610,
    "O suicídio não é coberto nos dois primeiros anos de vigência do contrato de seguro de vida, ressalvado o direito do beneficiário à devolução do montante da reserva técnica formada."
  ],
  [
    611,
    "Desde que devidamente motivada e com amparo em investigação ou sindicância, é permitida a instauração de processo administrativo disciplinar com base em denúncia anônima, em face do poder-dever de autotutela imposto à Administração."
  ],
  [
    612,
    "O certificado de entidade beneficente de assistência social (CEBAS), no prazo de sua validade, possui natureza declaratória para fins tributários, retroagindo seus efeitos à data em que demonstrado o cumprimento dos requisitos estabelecidos por lei complementar para a fruição da imunidade."
  ],
  [
    613,
    "Não se admite a aplicação da teoria do fato consumado em tema de Direito Ambiental."
  ],
  [
    614,
    "O locatário não possui legitimidade ativa para discutir a relação jurídico-tributária de IPTU e de taxas referentes ao imóvel alugado nem para repetir indébito desses tributos."
  ],
  [
    615,
    "Não pode ocorrer ou permanecer a inscrição do município em cadastros restritivos fundada em irregularidades na gestão anterior quando, na gestão sucessora, são tomadas as providências cabíveis à reparação dos danos eventualmente cometidos."
  ],
  [
    616,
    "A indenização securitária é devida quando ausente a comunicação prévia do segurado acerca do atraso no pagamento do prêmio, por constituir requisito essencial para a suspensão ou resolução do contrato de seguro."
  ],
  [
    617,
    "A ausência de suspensão ou revogação do livramento condicional antes do término do período de prova enseja a extinção da punibilidade pelo integral cumprimento da pena."
  ],
  [
    618,
    "A inversão do ônus da prova aplica-se às ações de degradação ambiental."
  ],
  [
    619,
    "A ocupação indevida de bem público configura mera detenção, de natureza precária, insuscetível de retenção ou indenização por acessões e benfeitorias."
  ],
  [
    620,
    "A embriaguez do segurado não exime a seguradora do pagamento da indenização prevista em contrato de seguro de vida."
  ],
  [
    621,
    "Os efeitos da sentença que reduz, majora ou exonera o alimentante do pagamento retroagem à data da citação, vedadas a compensação e a repetibilidade."
  ],
  [
    622,
    "A notificação do auto de infração faz cessar a contagem da decadência para a constituição do crédito tributário; exaurida a instância administrativa com o decurso do prazo para a impugnação ou com a notificação de seu julgamento definitivo e esgotado o prazo concedido pela Administração para o pagamento voluntário, inicia-se o prazo prescricional para a cobrança judicial."
  ],
  [
    623,
    "As obrigações ambientais possuem natureza propter rem, sendo admissível cobrá-las do proprietário ou possuidor atual e/ou dos anteriores, à escolha do credor."
  ],
  [
    624,
    "É possível cumular a indenização do dano moral com a reparação econômica da Lei n. 10.559/2002 (Lei da Anistia Política)."
  ],
  [
    625,
    "O pedido administrativo de compensação ou de restituição não interrompe o prazo prescricional para a ação de repetição de indébito tributário de que trata o art. 168 do CTN nem o da execução de título judicial contra a Fazenda Pública."
  ],
  [
    626,
    "A incidência do IPTU sobre imóvel situado em área considerada pela lei local como urbanizável ou de expansão urbana não está condicionada à existência dos melhoramentos elencados no art. 32, § 1º, do CTN."
  ],
  [
    627,
    "O contribuinte faz jus à concessão ou à manutenção da isenção do imposto de renda, não se lhe exigindo a demonstração da contemporaneidade dos sintomas da doença nem da recidiva da enfermidade."
  ],
  [
    628,
    "A teoria da encampação é aplicada no mandado de segurança quando presentes, cumulativamente, os seguintes requisitos: a) existência de vínculo hierárquico entre a autoridade que prestou informações e a que ordenou a prática do ato impugnado; b) manifestação a respeito do mérito nas informações prestadas; e c) ausência de modificação de competência estabelecida na Constituição Federal."
  ],
  [
    629,
    "Quanto ao dano ambiental, é admitida a condenação do réu à obrigação de fazer ou à de não fazer cumulada com a de indenizar."
  ],
  [
    630,
    "A incidência da atenuante da confissão espontânea no crime de tráfico ilícito de entorpecentes quando o acusado admitir a posse ou a propriedade para uso próprio, negando a prática do tráfico de drogas, deve ocorrer em proporção inferior à que seria devida no caso de confissão plena."
  ],
  [
    631,
    "O indulto extingue os efeitos primários da condenação (pretensão executória), mas não atinge os efeitos secundários, penais ou extrapenais."
  ],
  [
    632,
    "Nos contratos de seguro regidos pelo Código Civil, a correção monetária sobre a indenização securitária incide a partir da contratação até o efetivo pagamento."
  ],
  [
    633,
    "A Lei n. 9.784/1999, especialmente no que diz respeito ao prazo decadencial para a revisão de atos administrativos no âmbito da Administração Pública federal, pode ser aplicada, de forma subsidiária, aos estados e municípios, se inexistente norma local e específica que regule a matéria."
  ],
  [
    634,
    "Ao particular aplica-se o mesmo regime prescricional previsto na Lei de Improbidade Administrativa para o agente público."
  ],
  [
    635,
    "Os prazos prescricionais previstos no art. 142 da Lei n. 8.112/1990 iniciam-se na data em que a autoridade competente para a abertura do procedimento administrativo toma conhecimento do fato, interrompem-se com o primeiro ato de instauração válido - sindicância de caráter punitivo ou processo disciplinar - e voltam a fluir por inteiro, após decorridos 140 dias desde a interrupção."
  ],
  [
    636,
    "A folha de antecedentes criminais é documento suficiente a comprovar os maus antecedentes e a reincidência."
  ],
  [
    637,
    "O ente público detém legitimidade e interesse para intervir, incidentalmente, na ação possessória entre particulares, podendo deduzir qualquer matéria defensiva, inclusive, se for o caso, o domínio."
  ],
  [
    638,
    "É abusiva a cláusula contratual que restringe a responsabilidade de instituição financeira pelos danos decorrentes de roubo, furto ou extravio de bem entregue em garantia no âmbito de contrato de penhor civil."
  ],
  [
    639,
    "Não fere o contraditório e o devido processo decisão que, sem ouvida prévia da defesa, determine transferência ou permanência de custodiado em estabelecimento penitenciário federal."
  ],
  [
    640,
    "O benefício fiscal que trata do Regime Especial de Reintegração de Valores Tributários para as Empresas Exportadoras (REINTEGRA) alcança as operações de venda de mercadorias de origem nacional para a Zona Franca de Manaus, para consumo, industrialização ou reexportação para o estrangeiro."
  ],
  [
    641,
    "A portaria de instauração do processo administrativo disciplinar prescinde da exposição detalhada dos fatos a serem apurados."
  ],
  [
    642,
    "O direito à indenização por danos morais transmite-se com o falecimento do titular, possuindo os herdeiros da vítima legitimidade ativa para ajuizar ou prosseguir a ação indenizatória."
  ],
  [
    643,
    "A execução da pena restritiva de direitos depende do trânsito em julgado da condenação."
  ],
  [
    644,
    "O núcleo de prática jurídica deve apresentar o instrumento de mandato quando constituído pelo réu hipossuficiente, salvo nas hipóteses em que é nomeado pelo juízo."
  ],
  [
    645,
    "O crime de fraude à licitação é formal, e sua consumação prescinde da comprovação do prejuízo ou da obtenção de vantagem."
  ],
  [
    646,
    "É irrelevante a natureza da verba trabalhista para fins de incidência da contribuição ao FGTS, visto que apenas as verbas elencadas em lei (art. 28, § 9º, da Lei n. 8.212/1991), em rol taxativo, estão excluídas da sua base de cálculo, por força do disposto no art. 15, § 6º, da Lei n. 8.036/1990."
  ],
  [
    647,
    "São imprescritíveis as ações indenizatórias por danos morais e materiais decorrentes de atos de perseguição política com violação de direitos fundamentais ocorridos durante o regime militar."
  ],
  [
    648,
    "A superveniência da sentença condenatória prejudica o pedido de trancamento da ação penal por falta de justa causa feito em habeas corpus."
  ],
  [
    649,
    "Não incide ICMS sobre o serviço de transporte interestadual de mercadorias destinadas ao exterior."
  ],
  [
    650,
    "A autoridade administrativa não dispõe de discricionariedade para aplicar ao servidor pena diversa de demissão quando caraterizadas as hipóteses previstas no art. 132 da Lei n. 8.112/1990."
  ],
  [
    651,
    "Compete à autoridade administrativa aplicar a servidor público a pena de demissão em razão da prática de improbidade administrativa, independentemente de prévia condenação, por autoridade judiciária, à perda da função pública."
  ],
  [
    652,
    "A responsabilidade civil da Administração Pública por danos ao meio ambiente, decorrente de sua omissão no dever de fiscalização, é de caráter solidário, mas de execução subsidiária."
  ],
  [
    653,
    "O pedido de parcelamento fiscal, ainda que indeferido, interrompe o prazo prescricional, pois caracteriza confissão extrajudicial do débito."
  ],
  [
    654,
    "A tabela de preços máximos ao consumidor (PMC) publicada pela ABCFarma, adotada pelo Fisco para a fixação da base de cálculo do ICMS na sistemática da substituição tributária, não se aplica aos medicamentos destinados exclusivamente para uso de hospitais e clínicas."
  ],
  [
    655,
    "Aplica-se à união estável contraída por septuagenário o regime da separação obrigatória de bens, comunicando-se os adquiridos na constância, quando comprovado o esforço comum."
  ],
  [
    656,
    "É válida a cláusula de prorrogação automática de fiança na renovação do contrato principal. A exoneração do fiador depende da notificação prevista no art. 835 do Código Civil."
  ],
  [
    657,
    "Atendidos os requisitos de segurada especial no RGPS e do período de carência, a indígena menor de 16 anos faz jus ao salário-maternidade."
  ],
  [
    658,
    "O crime de apropriação indébita tributária pode ocorrer tanto em operações próprias, como em razão de substituição tributária."
  ],
  [
    659,
    "A fração de aumento em razão da prática de crime continuado deve ser fixada de acordo com o número de delitos cometidos, aplicando-se 1/6 pela prática de duas infrações, 1/5 para três, 1/4 para quatro, 1/3 para cinco, 1/2 para seis e 2/3 para sete ou mais infrações."
  ],
  [
    660,
    "A posse, pelo apenado, de aparelho celular ou de seus componentes essenciais constitui falta grave."
  ],
  [
    661,
    "A falta grave prescinde da perícia do celular apreendido ou de seus componentes essenciais."
  ],
  [
    662,
    "Para a prorrogação do prazo de permanência no sistema penitenciário federal, é prescindível a ocorrência de fato novo; basta constar, em decisão fundamentada, a persistência dos motivos que ensejaram a transferência inicial do preso."
  ],
  [
    663,
    "A pensão por morte de servidor público federal pode ser concedida ao filho inválido de qualquer idade, desde que a invalidez seja anterior ao óbito."
  ],
  [
    664,
    "É inaplicável a consunção entre o delito de embriaguez ao volante e o de condução de veículo automotor sem habilitação."
  ],
  [
    665,
    "O controle jurisdicional do processo administrativo disciplinar restringe-se ao exame da regularidade do procedimento e da legalidade do ato, à luz dos princípios do contraditório, da ampla defesa e do devido processo legal, não sendo possível incursão no mérito administrativo, ressalvadas as hipóteses de flagrante ilegalidade, teratologia ou manifesta desproporcionalidade da sanção aplicada."
  ],
  [
    666,
    "A legitimidade passiva, em demandas que visam à restituição de contribuições de terceiros, está vinculada à capacidade tributária ativa; assim, nas hipóteses em que as entidades terceiras são meras destinatárias das contribuições, não possuem elas legitimidade ad causam para figurar no polo passivo, juntamente com a União."
  ],
  [
    667,
    "Eventual aceitação de proposta de suspensão condicional do processo não prejudica a análise do pedido de trancamento de ação penal."
  ],
  [
    668,
    "Não é hediondo o delito de porte ou posse de arma de fogo de uso permitido, ainda que com numeração, marca ou qualquer outro sinal de identificação raspado, suprimido ou adulterado."
  ],
  [
    669,
    "O fornecimento de bebida alcoólica a criança ou adolescente, após o advento da Lei n. 13.106, de 17 de março de 2015, configura o crime previsto no art. 243 do ECA."
  ],
  [
    670,
    "Nos crimes sexuais cometidos contra a vítima em situação de vulnerabilidade temporária, em que ela recupera suas capacidades físicas e mentais e o pleno discernimento para decidir acerca da persecução penal de seu ofensor, a ação penal é pública condicionada à representação se o fato houver sido praticado na vigência da redação conferida ao art. 225 do Código Penal pela Lei n. 12.015, de 2009."
  ],
  [
    671,
    "Não incide o IPI quando sobrevém furto ou roubo do produto industrializado após sua saída do estabelecimento industrial ou equiparado e antes de sua entrega ao adquirente."
  ],
  [
    672,
    "A alteração da capitulação legal da conduta do servidor, por si só, não enseja a nulidade do processo administrativo disciplinar."
  ],
  [
    673,
    "A comprovação da regular notificação do executado para o pagamento da dívida de anuidade de conselhos de classe ou, em caso de recurso, o esgotamento das instâncias administrativas são requisitos indispensáveis à constituição e execução do crédito."
  ],
  [
    674,
    "A autoridade administrativa pode se utilizar de fundamentação per relationem nos processos disciplinares."
  ],
  [
    675,
    "É legítima a atuação dos órgãos de defesa do consumidor na aplicação de sanções administrativas previstas no CDC quando a conduta praticada ofender direito consumerista, o que não exclui nem inviabiliza a atuação do órgão ou entidade de controle quando a atividade é regulada."
  ],
  [
    676,
    "Em razão da Lei n. 13.964/2019, não é mais possível ao juiz, de ofício, decretar ou converter prisão em flagrante em prisão preventiva."
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
console.log("STJ lotes 61–68: 601–676. Feed STJ (Verbetes atual) completo.");
if (falha) process.exit(1);
