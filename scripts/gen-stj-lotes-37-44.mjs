/**
 * Gera lotes STJ 37–44 (361–440) + seed.
 * Uso: node scripts/gen-stj-lotes-37-44.mjs
 */
import { writeFileSync } from "fs";

const cancelMeta = {
  366: "CANCELADA pela Corte Especial em 16/09/2009 (CC 101.977/SP, DJe 22/09/2009).",
  408: "CANCELADA pela Primeira Seção em 28/10/2020 (Pet 12.344/DF, DJe 18/11/2020).",
  418: "CANCELADA pela Corte Especial em 01/07/2016 (DJe 03/08/2016).",
  421: "CANCELADA pela Corte Especial em 17/04/2024 (QO no REsp 1.108.013/RJ, Projeto de Súmula n. 851, DJe 22/04/2024).",
};

const items = [
  [361, "A notificação do protesto, para requerimento de falência da empresa devedora, exige a identificação da pessoa que a recebeu."],
  [362, "A correção monetária do valor da indenização do dano moral incide desde a data do arbitramento."],
  [363, "Compete à Justiça estadual processar e julgar a ação de cobrança ajuizada por profissional liberal contra cliente."],
  [364, "O conceito de impenhorabilidade de bem de família abrange também o imóvel pertencente a pessoas solteiras, separadas e viúvas."],
  [365, "A intervenção da União como sucessora da Rede Ferroviária Federal S/A (RFFSA) desloca a competência para a Justiça Federal ainda que a sentença tenha sido proferida por Juízo estadual."],
  [366, "Compete à Justiça estadual processar e julgar ação indenizatória proposta por viúva e filhos de empregado falecido em acidente de trabalho."],
  [367, "A competência estabelecida pela EC n. 45/2004 não alcança os processos já sentenciados."],
  [368, "Compete à Justiça comum estadual processar e julgar os pedidos de retificação de dados cadastrais da Justiça Eleitoral."],
  [369, "No contrato de arrendamento mercantil (leasing), ainda que haja cláusula resolutiva expressa, é necessária a notificação prévia do arrendatário para constituí-lo em mora."],
  [370, "Caracteriza dano moral a apresentação antecipada de cheque pré-datado."],
  [371, "Nos contratos de participação financeira para a aquisição de linha telefônica, o Valor Patrimonial da Ação (VPA) é apurado com base no balancete do mês da integralização."],
  [372, "Na ação de exibição de documentos, não cabe a aplicação de multa cominatória."],
  [373, "É ilegítima a exigência de depósito prévio para admissibilidade de recurso administrativo."],
  [374, "Compete à Justiça Eleitoral processar e julgar a ação para anular débito decorrente de multa eleitoral."],
  [375, "O reconhecimento da fraude à execução depende do registro da penhora do bem alienado ou da prova de má-fé do terceiro adquirente."],
  [376, "Compete à turma recursal processar e julgar o mandado de segurança contra ato de juizado especial."],
  [377, "O portador de visão monocular tem direito de concorrer, em concurso público, às vagas reservadas aos deficientes."],
  [378, "Reconhecido o desvio de função, o servidor faz jus às diferenças salariais decorrentes."],
  [379, "Nos contratos bancários não regidos por legislação específica, os juros moratórios poderão ser convencionados até o limite de 1% ao mês."],
  [380, "A simples propositura da ação de revisão de contrato não inibe a caracterização da mora do autor."],
  [381, "Nos contratos bancários, é vedado ao julgador conhecer, de ofício, da abusividade das cláusulas."],
  [382, "A estipulação de juros remuneratórios superiores a 12% ao ano, por si só, não indica abusividade."],
  [383, "A competência para processar e julgar as ações conexas de interesse de menor é, em princípio, do foro do domicílio do detentor de sua guarda."],
  [384, "Cabe ação monitória para haver saldo remanescente oriundo de venda extrajudicial de bem alienado fiduciariamente em garantia."],
  [385, "Da anotação irregular em cadastro de proteção ao crédito, não cabe indenização por dano moral, quando preexistente legítima inscrição, ressalvado o direito ao cancelamento."],
  [386, "São isentas de imposto de renda as indenizações de férias proporcionais e o respectivo adicional."],
  [387, "É lícita a cumulação das indenizações de dano estético e dano moral."],
  [388, "A simples devolução indevida de cheque caracteriza dano moral."],
  [389, 'A comprovação do pagamento do "custo do serviço" referente ao fornecimento de certidão de assentamentos constantes dos livros da companhia é requisito de procedibilidade da ação de exibição de documentos ajuizada em face da sociedade anônima.'],
  [390, "Nas decisões por maioria, em reexame necessário, não se admitem embargos infringentes."],
  [391, "O ICMS incide sobre o valor da tarifa de energia elétrica correspondente à demanda de potência efetivamente utilizada."],
  [392, "A Fazenda Pública pode substituir a certidão de dívida ativa (CDA) até a prolação da sentença de embargos, quando se tratar de correção de erro material ou formal, vedada a modificação do sujeito passivo da execução."],
  [393, "A exceção de pré-executividade é admissível na execução fiscal relativamente às matérias conhecíveis de ofício que não demandem dilação probatória."],
  [394, "É admissível, em embargos à execução, compensar os valores de imposto de renda retidos indevidamente na fonte com os valores restituídos apurados na declaração anual."],
  [395, "O ICMS incide sobre o valor da venda a prazo constante da nota fiscal."],
  [396, "A Confederação Nacional da Agricultura tem legitimidade ativa para a cobrança da contribuição sindical rural."],
  [397, "O contribuinte do IPTU é notificado do lançamento pelo envio do carnê ao seu endereço."],
  [398, "A prescrição da ação para pleitear os juros progressivos sobre os saldos de conta vinculada do FGTS não atinge o fundo de direito, limitando-se às parcelas vencidas."],
  [399, "Cabe à legislação municipal estabelecer o sujeito passivo do IPTU."],
  [400, "O encargo de 20% previsto no DL n. 1.025/1969 é exigível na execução fiscal proposta contra a massa falida."],
  [401, "O prazo decadencial da ação rescisória só se inicia quando não for cabível qualquer recurso do último pronunciamento judicial."],
  [402, "O contrato de seguro por danos pessoais compreende os danos morais, salvo cláusula expressa de exclusão."],
  [403, "Independe de prova do prejuízo a indenização pela publicação não autorizada de imagem de pessoa com fins econômicos ou comerciais."],
  [404, "É dispensável o aviso de recebimento (AR) na carta de comunicação ao consumidor sobre a negativação de seu nome em bancos de dados e cadastros."],
  [405, "A ação de cobrança do seguro obrigatório (DPVAT) prescreve em três anos."],
  [406, "A Fazenda Pública pode recusar a substituição do bem penhorado por precatório."],
  [407, "É legítima a cobrança da tarifa de água fixada de acordo com as categorias de usuários e as faixas de consumo."],
  [408, "Nas ações de desapropriação, os juros compensatórios incidentes após a Medida Provisória n. 1.577, de 11/06/1997, devem ser fixados em 6% ao ano até 13/09/2001 e, a partir de então, em 12% ao ano, na forma da Súmula n. 618 do Supremo Tribunal Federal."],
  [409, "Em execução fiscal, a prescrição ocorrida antes da propositura da ação pode ser decretada de ofício (art. 219, § 5º, do CPC)."],
  [410, "A prévia intimação pessoal do devedor constitui condição necessária para a cobrança de multa pelo descumprimento de obrigação de fazer ou não fazer."],
  [411, "É devida a correção monetária ao creditamento do IPI quando há oposição ao seu aproveitamento decorrente de resistência ilegítima do Fisco."],
  [412, "A ação de repetição de indébito de tarifas de água e esgoto sujeita-se ao prazo prescricional estabelecido no Código Civil."],
  [413, "O farmacêutico pode acumular a responsabilidade técnica por uma farmácia e uma drogaria ou por duas drogarias."],
  [414, "A citação por edital na execução fiscal é cabível quando frustradas as demais modalidades."],
  [415, "O período de suspensão do prazo prescricional é regulado pelo máximo da pena cominada."],
  [416, "É devida a pensão por morte aos dependentes do segurado que, apesar de ter perdido essa qualidade, preencheu os requisitos legais para a obtenção de aposentadoria até a data do seu óbito."],
  [417, "Na execução civil, a penhora de dinheiro na ordem de nomeação de bens não tem caráter absoluto."],
  [418, "É inadmissível o recurso especial interposto antes da publicação do acórdão dos embargos de declaração, sem posterior ratificação."],
  [419, "Descabe a prisão civil do depositário judicial infiel."],
  [420, "Incabível, em embargos de divergência, discutir o valor de indenização por danos morais."],
  [421, "Os honorários advocatícios não são devidos à Defensoria Pública quando ela atua contra a pessoa jurídica de direito público à qual pertença."],
  [422, "O art. 6º, e, da Lei n. 4.380/1964 não estabelece limitação aos juros remuneratórios nos contratos vinculados ao SFH."],
  [423, "A Contribuição para Financiamento da Seguridade Social - Cofins incide sobre as receitas provenientes das operações de locação de bens móveis."],
  [424, "É legítima a incidência de ISS sobre os serviços bancários congêneres da lista anexa ao DL n. 406/1968 e à LC n. 56/1987."],
  [425, "A retenção da contribuição para a seguridade social pelo tomador do serviço não se aplica às empresas optantes pelo Simples."],
  [426, "Os juros de mora na indenização do seguro DPVAT fluem a partir da citação."],
  [427, "A ação de cobrança de diferenças de valores de complementação de aposentadoria prescreve em cinco anos contados da data do pagamento."],
  [428, "Compete ao Tribunal Regional Federal decidir os conflitos de competência entre juizado especial federal e juízo federal da mesma seção judiciária."],
  [429, "A citação postal, quando autorizada por lei, exige o aviso de recebimento."],
  [430, "O inadimplemento da obrigação tributária pela sociedade não gera, por si só, a responsabilidade solidária do sócio-gerente."],
  [431, "É ilegal a cobrança de ICMS com base no valor da mercadoria submetido ao regime de pauta fiscal."],
  [432, "As empresas de construção civil não estão obrigadas a pagar ICMS sobre mercadorias adquiridas como insumos em operações interestaduais."],
  [433, "O produto semielaborado, para fins de incidência de ICMS, é aquele que preenche cumulativamente os três requisitos do art. 1º da Lei Complementar n. 65/1991."],
  [434, "O pagamento da multa por infração de trânsito não inibe a discussão judicial do débito."],
  [435, "Presume-se dissolvida irregularmente a empresa que deixar de funcionar no seu domicílio fiscal, sem comunicação aos órgãos competentes, legitimando o redirecionamento da execução fiscal para o sócio-gerente."],
  [436, "A entrega de declaração pelo contribuinte reconhecendo débito fiscal constitui o crédito tributário, dispensada qualquer outra providência por parte do fisco."],
  [437, "A suspensão da exigibilidade do crédito tributário superior a quinhentos mil reais para opção pelo Refis pressupõe a homologação expressa do comitê gestor e a constituição de garantia por meio do arrolamento de bens."],
  [438, "É inadmissível a extinção da punibilidade pela prescrição da pretensão punitiva com fundamento em pena hipotética, independentemente da existência ou sorte do processo penal."],
  [439, "Admite-se o exame criminológico pelas peculiaridades do caso, desde que em decisão motivada."],
  [440, "Fixada a pena-base no mínimo legal, é vedado o estabelecimento de regime prisional mais gravoso do que o cabível em razão da sanção imposta, com base apenas na gravidade abstrata do delito."],
];

function quote(s) {
  return JSON.stringify(s);
}

for (let lote = 37; lote <= 44; lote++) {
  const start = 361 + (lote - 37) * 10;
  const end = start + 9;
  const slice = items.filter(([n]) => n >= start && n <= end);
  const canceladas = slice.filter(([n]) => cancelMeta[n]).map(([n]) => n);
  const headerNote = canceladas.length
    ? `Cancelada(s): ${canceladas.join(" e ")} (não entram no RAG ativo).`
    : "ativas — VerbetesSTJ.";

  const body = slice
    .map(([n, text]) => {
      if (cancelMeta[n]) {
        return `  sumulaStj(\n    ${n},\n    ${quote(`${text} — ${cancelMeta[n]}`)},\n    { status: "cancelada" }\n  )`;
      }
      return `  sumulaStj(\n    ${n},\n    ${quote(text)}\n  )`;
    })
    .join(",\n");

  const pad = String(lote).padStart(2, "0");
  const content = `/**
 * STJ — Lote ${lote}: Súmulas ${start} a ${end}.
 * ${headerNote}
 */

import { sumulaStj, type SumulaLoteItem } from "@/lib/sumulas/types";

export const SUMULAS_STJ_LOTE_${pad}: SumulaLoteItem[] = [
${body},
];
`;

  writeFileSync(`src/lib/sumulas/stj-lote-${pad}.ts`, content, "utf8");
  console.log("wrote lote", lote, start, "-", end, "cancel:", canceladas.join(",") || "-");
}

const canceladasAll = Object.keys(cancelMeta).map(Number);
const ativas = items.filter(([n]) => !cancelMeta[n]);

const seed = `/**
 * Seed STJ lotes 37–44 (Súmulas 361–440).
 * Canceladas fora do RAG: ${canceladasAll.join(", ")}.
 * Uso: node scripts/seed-sumulas-stj-lote-37-44.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\\n")) {
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

const CANCELADAS = ${JSON.stringify(canceladasAll)};

const ITEMS = ${JSON.stringify(ativas, null, 2)};

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
  const titulo = \`Súmula \${n} do STJ\`;
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
  const titulo = \`Súmula \${n} do STJ\`;
  const texto = \`Súmula \${n}/STJ (ATIVA): \${enunciado}\`;
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
  \`\\nConcluído: \${ok} ativas ok, \${removidas} cancelada(s) removida(s), \${falha} falha(s).\`
);
console.log("STJ lotes 37–44: 361–440. Próximo: 441–.");
if (falha) process.exit(1);
`;

writeFileSync("scripts/seed-sumulas-stj-lote-37-44.mjs", seed, "utf8");
console.log("wrote seed with", ativas.length, "ativas");
