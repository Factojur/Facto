/**
 * Seed STJ lotes 13–20 (Súmulas 121–200).
 * Canceladas fora do RAG: 142, 152, 157, 174, 183.
 * Uso: node scripts/seed-sumulas-stj-lote-13-20.mjs
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

const CANCELADAS = [142, 152, 157, 174, 183];

const ITEMS = [
  [121, "Na execução fiscal o devedor deverá ser intimado, pessoalmente, do dia e hora da realização do leilão."],
  [122, 'Compete à Justiça Federal o processo e julgamento unificado dos crimes conexos de competência federal e estadual, não se aplicando a regra do art. 78, II, "a", do Código de Processo Penal.'],
  [123, "A decisão que admite, ou não, o recurso especial deve ser fundamentada, com o exame dos seus pressupostos gerais e constitucionais."],
  [124, "A taxa de melhoramento dos portos tem base de cálculo diversa do imposto de importação, sendo legítima a sua cobrança sobre a importação de mercadorias de países signatários do GATT, da ALALC ou ALADI."],
  [125, "O pagamento de férias não gozadas por necessidade do serviço não está sujeito à incidência do imposto de renda."],
  [126, "É inadmissível recurso especial, quando o acórdão recorrido assenta em fundamentos constitucional e infraconstitucional, qualquer deles suficiente, por si só, para mantê-lo, e a parte vencida não manifesta recurso extraordinário."],
  [127, "É ilegal condicionar a renovação da licença de veículo ao pagamento de multa, da qual o infrator não foi notificado."],
  [128, "Na execução fiscal haverá segundo leilão, se no primeiro não houver lanço superior à avaliação."],
  [129, "O exportador adquire o direito de transferência de crédito do ICMS quando realiza a exportação do produto e não ao estocar a matéria-prima."],
  [130, "A empresa responde, perante o cliente, pela reparação de dano ou furto de veículo ocorridos em seu estacionamento."],
  [131, "Nas ações de desapropriação incluem-se no cálculo da verba advocatícia as parcelas relativas aos juros compensatórios e moratórios, devidamente corrigidas."],
  [132, "A ausência de registro da transferência não implica a responsabilidade do antigo proprietário por dano resultante de acidente que envolva o veículo alienado."],
  [133, "A restituição da importância adiantada, à conta de contrato de câmbio, independe de ter sido a antecipação efetuada nos quinze dias anteriores ao requerimento da concordata."],
  [134, "Embora intimado da penhora em imóvel do casal, o cônjuge do executado pode opor embargos de terceiro para defesa de sua meação."],
  [135, "O ICMS não incide na gravação e distribuição de filmes e videoteipes."],
  [136, "O pagamento de licença-prêmio não gozada por necessidade do serviço não está sujeito ao imposto de renda."],
  [137, "Compete à Justiça Comum Estadual processar e julgar ação de servidor público municipal, pleiteando direitos relativos ao vínculo estatutário."],
  [138, "O ISS incide na operação de arrendamento mercantil de coisas móveis."],
  [139, "Cabe à Procuradoria da Fazenda Nacional propor execução fiscal para cobrança de crédito relativo ao ITR."],
  [140, "Compete à Justiça Comum Estadual processar e julgar crime em que o indígena figure como autor ou vítima."],
  [141, "Os honorários de advogado em desapropriação direta são calculados sobre a diferença entre a indenização e a oferta, corrigidas monetariamente."],
  [143, "Prescreve em cinco anos a ação de perdas e danos pelo uso de marca comercial."],
  [144, "Os créditos de natureza alimentícia gozam de preferência, desvinculados os precatórios da ordem cronológica dos créditos de natureza diversa."],
  [145, "No transporte desinteressado, de simples cortesia, o transportador só será civilmente responsável por danos causados ao transportado quando incorrer em dolo ou culpa grave."],
  [146, "O segurado, vítima de novo infortúnio, faz jus a um único benefício somado ao salário de contribuição vigente no dia do acidente."],
  [147, "Compete à Justiça Federal processar e julgar os crimes praticados contra funcionário público federal, quando relacionados com o exercício da função."],
  [148, "Os débitos relativos a benefício previdenciário, vencidos e cobrados em juízo após a vigência da Lei n. 6.899/81, devem ser corrigidos monetariamente na forma prevista nesse diploma legal."],
  [149, "A prova exclusivamente testemunhal não basta à comprovação da atividade rurícola, para efeito da obtenção de benefício previdenciário."],
  [150, "Compete à Justiça Federal decidir sobre a existência de interesse jurídico que justifique a presença, no processo, da União, suas autarquias ou empresas públicas."],
  [151, "A competência para o processo e julgamento por crime de contrabando ou descaminho define-se pela prevenção do juízo federal do lugar da apreensão dos bens."],
  [153, "A desistência da execução fiscal, após o oferecimento dos embargos, não exime o exequente dos encargos da sucumbência."],
  [154, "Os optantes pelo FGTS, nos termos da Lei n. 5.958, de 1973, têm direito à taxa progressiva dos juros, na forma do art. 4º da Lei n. 5.107, de 1966."],
  [155, "O ICMS incide na importação de aeronave, por pessoa física, para uso próprio."],
  [156, "A prestação de serviço de composição gráfica, personalizada e sob encomenda, ainda que envolva fornecimento de mercadorias, está sujeita, apenas, ao ISS."],
  [158, "Não se presta a justificar embargos de divergência o dissídio com acórdão de Turma ou Seção que não mais tenha competência para a matéria neles versada."],
  [159, "O benefício acidentário, no caso de contribuinte que perceba remuneração variável, deve ser calculado com base na média aritmética dos últimos doze meses de contribuição."],
  [160, "É defeso, ao município, atualizar o IPTU, mediante decreto, em percentual superior ao índice oficial de correção monetária."],
  [161, "É da competência da Justiça Estadual autorizar o levantamento dos valores relativos ao PIS/PASEP e FGTS, em decorrência do falecimento do titular da conta."],
  [162, "Na repetição de indébito tributário, a correção monetária incide a partir do pagamento indevido."],
  [163, "O fornecimento de mercadorias com a simultânea prestação de serviços em bares, restaurantes e estabelecimentos similares constitui fato gerador do ICMS a incidir sobre o valor total da operação."],
  [164, "O prefeito municipal, após a extinção do mandato, continua sujeito a processo por crime previsto no art. 1º do Decreto-lei n. 201, de 27/02/1967."],
  [165, "Compete à Justiça Federal processar e julgar crime de falso testemunho cometido no processo trabalhista."],
  [166, "Não constitui fato gerador do ICMS o simples deslocamento de mercadoria de um para outro estabelecimento do mesmo contribuinte."],
  [167, "O fornecimento de concreto, por empreitada, para construção civil, preparado no trajeto até a obra em betoneiras acopladas a caminhões, é prestação de serviço, sujeitando-se apenas à incidência do ISS."],
  [168, "Não cabem embargos de divergência, quando a jurisprudência do Tribunal se firmou no mesmo sentido do acórdão embargado."],
  [169, "São inadmissíveis embargos infringentes no processo de mandado de segurança."],
  [170, "Compete ao juízo onde primeiro for intentada a ação envolvendo acumulação de pedidos, trabalhista e estatutário, decidi-la nos limites da sua jurisdição, sem prejuízo do ajuizamento de nova causa, com o pedido remanescente, no juízo próprio."],
  [171, "Cominadas cumulativamente, em lei especial, penas privativa de liberdade e pecuniária, é defeso a substituição da prisão por multa."],
  [172, "Compete à Justiça Comum processar e julgar militar por crime de abuso de autoridade, ainda que praticado em serviço."],
  [173, "Compete à Justiça Federal processar e julgar o pedido de reintegração em cargo público federal, ainda que o servidor tenha sido dispensado antes da instituição do regime jurídico único."],
  [175, "Descabe o depósito prévio nas ações rescisórias propostas pelo INSS."],
  [176, "É nula a cláusula contratual que sujeita o devedor à taxa de juros divulgada pela ANBID/CETIP."],
  [177, "O Superior Tribunal de Justiça é incompetente para processar e julgar, originariamente, mandado de segurança contra ato de órgão colegiado presidido por Ministro de Estado."],
  [178, "O INSS não goza de isenção do pagamento de custas e emolumentos, nas ações acidentárias e de benefícios, propostas na Justiça Estadual."],
  [179, "O estabelecimento de crédito que recebe dinheiro, em depósito judicial, responde pelo pagamento da correção monetária relativa aos valores recolhidos."],
  [180, "Na lide trabalhista, compete ao Tribunal Regional do Trabalho dirimir conflito de competência verificado, na respectiva região, entre juiz estadual e junta de conciliação e julgamento."],
  [181, "É admissível ação declaratória, visando a obter certeza quanto à exata interpretação de cláusula contratual."],
  [182, "É inviável o agravo do art. 545 do CPC que deixa de atacar especificamente os fundamentos da decisão agravada."],
  [184, "A microempresa de representação comercial é isenta do imposto de renda."],
  [185, "Nos depósitos judiciais, não incide o imposto sobre operações financeiras."],
  [186, "Nas indenizações por ato ilícito, os juros compostos somente são devidos por aquele que praticou o crime."],
  [187, "É deserto o recurso interposto para o Superior Tribunal de Justiça, quando o recorrente não recolhe, na origem, a importância das despesas de remessa e retorno dos autos."],
  [188, "Os juros moratórios, na repetição do indébito tributário, são devidos a partir do trânsito em julgado da sentença."],
  [189, "É desnecessária a intervenção do Ministério Público nas execuções fiscais."],
  [190, "Na execução fiscal, processada perante a Justiça Estadual, cumpre à Fazenda Pública antecipar o numerário destinado ao custeio das despesas com o transporte dos oficiais de justiça."],
  [191, "A pronúncia é causa interruptiva da prescrição, ainda que o Tribunal do Júri venha a desclassificar o crime."],
  [192, "Compete ao juízo das execuções penais do Estado a execução das penas impostas a sentenciados pela Justiça Federal, Militar ou Eleitoral, quando recolhidos a estabelecimentos sujeitos à administração estadual."],
  [193, "O direito de uso de linha telefônica pode ser adquirido por usucapião."],
  [194, "Prescreve em vinte anos a ação para obter, do construtor, indenização por defeitos da obra."],
  [195, "Em embargos de terceiro não se anula ato jurídico, por fraude contra credores."],
  [196, "Ao executado que, citado por edital ou por hora certa, permanecer revel, será nomeado curador especial, com legitimidade para apresentação de embargos."],
  [197, "O divórcio direto pode ser concedido sem que haja prévia partilha dos bens."],
  [198, "Na importação de veículo por pessoa física, destinado a uso próprio, incide o ICMS."],
  [199, "Na execução hipotecária de crédito vinculado ao Sistema Financeiro da Habitação, nos termos da Lei n. 5.741/71, a petição inicial deve ser instruída com, pelo menos, dois avisos de cobrança."],
  [200, "O juízo federal competente para processar e julgar acusado de crime de uso de passaporte falso é o do lugar onde o delito se consumou."],
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
console.log(
  "STJ lotes 13–20: 121–200 (142, 152, 157, 174, 183 fora do RAG). Próximo: 201–210."
);
if (falha) process.exit(1);
