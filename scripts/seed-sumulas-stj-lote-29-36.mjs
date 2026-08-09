/**
 * Seed STJ lotes 29–36 (Súmulas 281–360).
 * Canceladas/revogadas fora do RAG: 321, 343, 348, 357.
 * Uso: node scripts/seed-sumulas-stj-lote-29-36.mjs
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

const CANCELADAS = [321,343,348,357];

const ITEMS = [
  [
    281,
    "A indenização por dano moral não está sujeita à tarifação prevista na Lei de Imprensa."
  ],
  [
    282,
    "Cabe a citação por edital em ação monitória."
  ],
  [
    283,
    "As empresas administradoras de cartão de crédito são instituições financeiras e, por isso, os juros remuneratórios por elas cobrados não sofrem as limitações da Lei de Usura."
  ],
  [
    284,
    "A purga da mora, nos contratos de alienação fiduciária, só é permitida quando já pagos pelo menos 40% (quarenta por cento) do valor financiado."
  ],
  [
    285,
    "Nos contratos bancários posteriores ao Código de Defesa do Consumidor incide a multa moratória nele prevista."
  ],
  [
    286,
    "A renegociação de contrato bancário ou a confissão da dívida não impede a possibilidade de discussão sobre eventuais ilegalidades dos contratos anteriores."
  ],
  [
    287,
    "A Taxa Básica Financeira (TBF) não pode ser utilizada como indexador de correção monetária nos contratos bancários."
  ],
  [
    288,
    "A Taxa de Juros de Longo Prazo (TJLP) pode ser utilizada como indexador de correção monetária nos contratos bancários."
  ],
  [
    289,
    "A restituição das parcelas pagas a plano de previdência privada deve ser objeto de correção plena, por índice que recomponha a efetiva desvalorização da moeda."
  ],
  [
    290,
    "Nos planos de previdência privada, não cabe ao beneficiário a devolução da contribuição efetuada pelo patrocinador."
  ],
  [
    291,
    "A ação de cobrança de parcelas de complementação de aposentadoria pela previdência privada prescreve em cinco anos."
  ],
  [
    292,
    "A reconvenção é cabível na ação monitória, após a conversão do procedimento em ordinário."
  ],
  [
    293,
    "A cobrança antecipada do valor residual garantido (VRG) não descaracteriza o contrato de arrendamento mercantil."
  ],
  [
    294,
    "Não é potestativa a cláusula contratual que prevê a comissão de permanência, calculada pela taxa média de mercado apurada pelo Banco Central do Brasil, limitada à taxa do contrato."
  ],
  [
    295,
    "A Taxa Referencial (TR) é indexador válido para contratos posteriores à Lei n. 8.177/91, desde que pactuada."
  ],
  [
    296,
    "Os juros remuneratórios, não cumuláveis com a comissão de permanência, são devidos no período de inadimplência, à taxa média de mercado estipulada pelo Banco Central do Brasil, limitada ao percentual contratado."
  ],
  [
    297,
    "O Código de Defesa do Consumidor é aplicável às instituições financeiras."
  ],
  [
    298,
    "O alongamento de dívida originada de crédito rural não constitui faculdade da instituição financeira, mas, direito do devedor nos termos da lei."
  ],
  [
    299,
    "É admissível a ação monitória fundada em cheque prescrito."
  ],
  [
    300,
    "O instrumento de confissão de dívida, ainda que originário de contrato de abertura de crédito, constitui título executivo extrajudicial."
  ],
  [
    301,
    "Em ação investigatória, a recusa do suposto pai a submeter-se ao exame de DNA induz presunção juris tantum de paternidade."
  ],
  [
    302,
    "É abusiva a cláusula contratual de plano de saúde que limita no tempo a internação hospitalar do segurado."
  ],
  [
    303,
    "Em embargos de terceiro, quem deu causa à constrição indevida deve arcar com os honorários advocatícios."
  ],
  [
    304,
    "É ilegal a decretação da prisão civil daquele que não assume expressamente o encargo de depositário judicial."
  ],
  [
    305,
    "É descabida a prisão civil do depositário quando, decretada a falência da empresa, sobrevém a arrecadação do bem pelo síndico."
  ],
  [
    306,
    "Os honorários advocatícios devem ser compensados quando houver sucumbência recíproca, assegurado o direito autônomo do advogado à execução do saldo sem excluir a legitimidade da própria parte."
  ],
  [
    307,
    "A restituição de adiantamento de contrato de câmbio, na falência, deve ser atendida antes de qualquer crédito."
  ],
  [
    308,
    "A hipoteca firmada entre a construtora e o agente financeiro, anterior ou posterior à celebração da promessa de compra e venda, não tem eficácia perante os adquirentes do imóvel."
  ],
  [
    309,
    "O débito alimentar que autoriza a prisão civil do alimentante é o que compreende as três prestações anteriores ao ajuizamento da execução e as que se vencerem no curso do processo."
  ],
  [
    310,
    "O auxílio-creche não integra o salário-de-contribuição."
  ],
  [
    311,
    "Os atos do presidente do tribunal que disponham sobre processamento e pagamento de precatório não têm caráter jurisdicional."
  ],
  [
    312,
    "No processo administrativo para imposição de multa de trânsito, são necessárias as notificações da autuação e da aplicação da pena decorrente da infração."
  ],
  [
    313,
    "Em ação de indenização, procedente o pedido, é necessária a constituição de capital ou caução fidejussória para a garantia de pagamento da pensão, independentemente da situação financeira do demandado."
  ],
  [
    314,
    "Em execução fiscal, não localizados bens penhoráveis, suspende-se o processo por um ano, findo o qual se inicia o prazo da prescrição quinquenal intercorrente."
  ],
  [
    315,
    "Não cabem embargos de divergência no âmbito do agravo de instrumento que não admite recurso especial."
  ],
  [
    316,
    "Cabem embargos de divergência contra acórdão que, em agravo regimental, decide recurso especial."
  ],
  [
    317,
    "É definitiva a execução de título extrajudicial, ainda que pendente apelação contra sentença que julgue improcedentes os embargos."
  ],
  [
    318,
    "Formulado pedido certo e determinado, somente o autor tem interesse recursal em arguir o vício da sentença ilíquida."
  ],
  [
    319,
    "O encargo de depositário de bens penhorados pode ser expressamente recusado."
  ],
  [
    320,
    "A questão federal somente ventilada no voto vencido não atende ao requisito do prequestionamento."
  ],
  [
    322,
    "Para a repetição de indébito, nos contratos de abertura de crédito em conta-corrente, não se exige a prova do erro."
  ],
  [
    323,
    "A inscrição do nome do devedor pode ser mantida nos serviços de proteção ao crédito até o prazo máximo de cinco anos, independentemente da prescrição da execução."
  ],
  [
    324,
    "Compete à Justiça Federal processar e julgar ações de que participa a Fundação Habitacional do Exército, equiparada à entidade autárquica federal, supervisionada pelo Ministério do Exército."
  ],
  [
    325,
    "A remessa oficial devolve ao Tribunal o reexame de todas as parcelas da condenação suportadas pela Fazenda Pública, inclusive dos honorários de advogado."
  ],
  [
    326,
    "Na ação de indenização por dano moral, a condenação em montante inferior ao postulado na inicial não implica sucumbência recíproca."
  ],
  [
    327,
    "Nas ações referentes ao Sistema Financeiro da Habitação, a Caixa Econômica Federal tem legitimidade como sucessora do Banco Nacional da Habitação."
  ],
  [
    328,
    "Na execução contra instituição financeira, é penhorável o numerário disponível, excluídas as reservas bancárias mantidas no Banco Central."
  ],
  [
    329,
    "O Ministério Público tem legitimidade para propor ação civil pública em defesa do patrimônio público."
  ],
  [
    330,
    "É desnecessária a resposta preliminar de que trata o artigo 514 do Código de Processo Penal, na ação penal instruída por inquérito policial."
  ],
  [
    331,
    "A apelação interposta contra sentença que julga embargos à arrematação tem efeito meramente devolutivo."
  ],
  [
    332,
    "A fiança prestada sem autorização de um dos cônjuges implica a ineficácia total da garantia."
  ],
  [
    333,
    "Cabe mandado de segurança contra ato praticado em licitação promovida por sociedade de economia mista ou empresa pública."
  ],
  [
    334,
    "O ICMS não incide no serviço dos provedores de acesso à Internet."
  ],
  [
    335,
    "Nos contratos de locação, é válida a cláusula de renúncia à indenização das benfeitorias e ao direito de retenção."
  ],
  [
    336,
    "A mulher que renunciou aos alimentos na separação judicial tem direito à pensão previdenciária por morte do ex-marido, comprovada a necessidade econômica superveniente."
  ],
  [
    337,
    "É cabível a suspensão condicional do processo na desclassificação do crime e na procedência parcial da pretensão punitiva."
  ],
  [
    338,
    "A prescrição penal é aplicável nas medidas socioeducativas."
  ],
  [
    339,
    "É cabível ação monitória contra a Fazenda Pública."
  ],
  [
    340,
    "A lei aplicável à concessão de pensão previdenciária por morte é aquela vigente na data do óbito do segurado."
  ],
  [
    341,
    "A frequência a curso de ensino formal é causa de remição de parte do tempo de execução de pena sob regime fechado ou semiaberto."
  ],
  [
    342,
    "No procedimento para aplicação de medida socioeducativa, é nula a desistência de outras provas em face da confissão do adolescente."
  ],
  [
    344,
    "A liquidação por forma diversa da estabelecida na sentença não ofende a coisa julgada."
  ],
  [
    345,
    "São devidos honorários advocatícios pela Fazenda Pública nas execuções individuais de sentença proferida em ações coletivas, ainda que não embargadas."
  ],
  [
    346,
    "É vedada aos militares temporários, para aquisição de estabilidade, a contagem em dobro de férias e licenças não gozadas."
  ],
  [
    347,
    "O conhecimento de recurso de apelação do réu independe de sua prisão."
  ],
  [
    349,
    "Compete à Justiça Federal ou aos juízes com competência delegada o julgamento das execuções fiscais de contribuições devidas pelo empregador ao FGTS."
  ],
  [
    350,
    "O ICMS não incide sobre o serviço de habilitação de telefone celular."
  ],
  [
    351,
    "A alíquota de contribuição para o Seguro de Acidente do Trabalho (SAT) é aferida pelo grau de risco desenvolvido em cada empresa, individualizada pelo seu CNPJ, ou pelo grau de risco da atividade preponderante quando houver apenas um registro."
  ],
  [
    352,
    "A obtenção ou a renovação do Certificado de Entidade Beneficente de Assistência Social (Cebas) não exime a entidade do cumprimento dos requisitos legais supervenientes."
  ],
  [
    353,
    "As disposições do Código Tributário Nacional não se aplicam às contribuições para o FGTS."
  ],
  [
    354,
    "A invasão do imóvel é causa de suspensão do processo expropriatório para fins de reforma agrária."
  ],
  [
    355,
    "É válida a notificação do ato de exclusão do programa de recuperação fiscal do Refis pelo Diário Oficial ou pela Internet."
  ],
  [
    356,
    "É legítima a cobrança da tarifa básica pelo uso dos serviços de telefonia fixa."
  ],
  [
    358,
    "O cancelamento de pensão alimentícia de filho que atingiu a maioridade está sujeito à decisão judicial, mediante contraditório, ainda que nos próprios autos."
  ],
  [
    359,
    "Cabe ao órgão mantenedor do Cadastro de Proteção ao Crédito a notificação do devedor antes de proceder à inscrição."
  ],
  [
    360,
    "O benefício da denúncia espontânea não se aplica aos tributos sujeitos a lançamento por homologação regularmente declarados, mas pagos a destempo."
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
console.log("STJ lotes 29–36: 281–360. Próximo: 361–.");
if (falha) process.exit(1);
