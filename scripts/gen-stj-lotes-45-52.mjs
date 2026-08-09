/**
 * Gera lotes STJ 45–52 (441–520) + seed.
 * Uso: node scripts/gen-stj-lotes-45-52.mjs
 */
import { writeFileSync } from "fs";

const cancelMeta = {
  469: "CANCELADA pela Segunda Seção em 11/04/2018 (Projeto de Súmula n. 937, DJe 17/04/2018).",
  470: "CANCELADA pela Segunda Seção em 27/05/2015 (REsp 858.056/GO, DJe 15/06/2015).",
  497: "CANCELADA pela Primeira Seção em 14/09/2022 (Projeto de Súmula n. 959, DJe 19/09/2022).",
  512: "CANCELADA pela Terceira Seção em 23/11/2016 (QO na Pet 11.796/DF, DJ 28/11/2016).",
};

const items = [
  [441, "A falta grave não interrompe o prazo para obtenção de livramento condicional."],
  [442, "É inadmissível aplicar, no furto qualificado, pelo concurso de agentes, a majorante do roubo."],
  [443, "O aumento na terceira fase de aplicação da pena no crime de roubo circunstanciado exige fundamentação concreta, não sendo suficiente para a sua exasperação a mera indicação do número de majorantes."],
  [444, "É vedada a utilização de inquéritos policiais e ações penais em curso para agravar a pena-base."],
  [445, "As diferenças de correção monetária resultantes de expurgos inflacionários sobre os saldos de FGTS têm como termo inicial a data em que deveriam ter sido creditadas."],
  [446, "Declarado e não pago o débito tributário pelo contribuinte, é legítima a recusa de expedição de certidão negativa ou positiva com efeito de negativa."],
  [447, "Os Estados e o Distrito Federal são partes legítimas na ação de restituição de imposto de renda retido na fonte proposta por seus servidores."],
  [448, "A opção pelo Simples de estabelecimentos dedicados às atividades de creche, pré-escola e ensino fundamental é admitida somente a partir de 24/10/2000, data de vigência da Lei n. 10.034/2000."],
  [449, "A vaga de garagem que possui matrícula própria no registro de imóveis não constitui bem de família para efeito de penhora."],
  [450, "Nos contratos vinculados ao SFH, a atualização do saldo devedor antecede sua amortização pelo pagamento da prestação."],
  [451, "É legítima a penhora da sede do estabelecimento comercial."],
  [452, "A extinção das ações de pequeno valor é faculdade da Administração Federal, vedada a atuação judicial de ofício."],
  [453, "Os honorários sucumbenciais, quando omitidos em decisão transitada em julgado, não podem ser cobrados em execução ou em ação própria."],
  [454, "Pactuada a correção monetária nos contratos do SFH pelo mesmo índice aplicável à caderneta de poupança, incide a taxa referencial (TR) a partir da vigência da Lei n. 8.177/1991."],
  [455, "A decisão que determina a produção antecipada de provas com base no art. 366 do CPP deve ser concretamente fundamentada, não a justificando unicamente o mero decurso do tempo."],
  [456, "É incabível a correção monetária dos salários de contribuição considerados no cálculo do salário de benefício de auxílio-doença, aposentadoria por invalidez, pensão ou auxílio-reclusão concedidos antes da vigência da CF/1988."],
  [457, "Os descontos incondicionais nas operações mercantis não se incluem na base de cálculo do ICMS."],
  [458, "A contribuição previdenciária incide sobre a comissão paga ao corretor de seguros."],
  [459, "A Taxa Referencial (TR) é o índice aplicável, a título de correção monetária, aos débitos com o FGTS recolhidos pelo empregador mas não repassados ao fundo."],
  [460, "É incabível o mandado de segurança para convalidar a compensação tributária realizada pelo contribuinte."],
  [461, "O contribuinte pode optar por receber, por meio de precatório ou por compensação, o indébito tributário certificado por sentença declaratória transitada em julgado."],
  [462, "Nas ações em que representa o FGTS, a CEF, quando sucumbente, não está isenta de reembolsar as custas antecipadas pela parte vencedora."],
  [463, "Incide imposto de renda sobre os valores percebidos a título de indenização por horas extraordinárias trabalhadas, ainda que decorrentes de acordo coletivo."],
  [464, "A regra de imputação de pagamentos estabelecida no art. 354 do Código Civil não se aplica às hipóteses de compensação tributária."],
  [465, "Ressalvada a hipótese de efetivo agravamento do risco, a seguradora não se exime do dever de indenizar em razão da transferência do veículo sem a sua prévia comunicação."],
  [466, "O titular da conta vinculada ao FGTS tem o direito de sacar o saldo respectivo quando declarado nulo seu contrato de trabalho por ausência de prévia aprovação em concurso público."],
  [467, "Prescreve em cinco anos, contados do término do processo administrativo, a pretensão da Administração Pública de promover a execução da multa por infração ambiental."],
  [468, "A base de cálculo do PIS, até a edição da MP n. 1.212/1995, era o faturamento ocorrido no sexto mês anterior ao do fato gerador."],
  [469, "Aplica-se o Código de Defesa do Consumidor aos contratos de plano de saúde."],
  [470, "O Ministério Público não tem legitimidade para pleitear, em ação civil pública, a indenização decorrente do DPVAT em benefício do segurado."],
  [471, "Os condenados por crimes hediondos ou assemelhados cometidos antes da vigência da Lei n. 11.464/2007 sujeitam-se ao disposto no art. 112 da Lei n. 7.210/1984 (Lei de Execução Penal) para a progressão de regime prisional."],
  [472, "A cobrança de comissão de permanência - cujo valor não pode ultrapassar a soma dos encargos remuneratórios e moratórios previstos no contrato - exclui a exigibilidade dos juros remuneratórios, moratórios e da multa contratual."],
  [473, "O mutuário do SFH não pode ser compelido a contratar o seguro habitacional obrigatório com a instituição financeira mutuante ou com a seguradora por ela indicada."],
  [474, "A indenização do seguro DPVAT, em caso de invalidez parcial do beneficiário, será paga de forma proporcional ao grau da invalidez."],
  [475, "Responde pelos danos decorrentes de protesto indevido o endossatário que recebe por endosso translativo título de crédito contendo vício formal extrínseco ou intrínseco, ficando ressalvado seu direito de regresso contra os endossantes e avalistas."],
  [476, "O endossatário de título de crédito por endosso-mandato só responde por danos decorrentes de protesto indevido se extrapolar os poderes de mandatário."],
  [477, "A decadência do art. 26 do CDC não é aplicável à prestação de contas para obter esclarecimentos sobre cobrança de taxas, tarifas e encargos bancários."],
  [478, "Na execução de crédito relativo a cotas condominiais, este tem preferência sobre o hipotecário."],
  [479, "As instituições financeiras respondem objetivamente pelos danos gerados por fortuito interno relativo a fraudes e delitos praticados por terceiros no âmbito de operações bancárias."],
  [480, "O juízo da recuperação judicial não é competente para decidir sobre a constrição de bens não abrangidos pelo plano de recuperação da empresa."],
  [481, "Faz jus ao benefício da justiça gratuita a pessoa jurídica com ou sem fins lucrativos que demonstrar sua impossibilidade de arcar com os encargos processuais."],
  [482, "A falta de ajuizamento da ação principal no prazo do art. 806 do CPC acarreta a perda da eficácia da liminar deferida e a extinção do processo cautelar."],
  [483, "O INSS não está obrigado a efetuar depósito prévio do preparo por gozar das prerrogativas e privilégios da Fazenda Pública."],
  [484, "Admite-se que o preparo seja efetuado no primeiro dia útil subsequente, quando a interposição do recurso ocorrer após o encerramento do expediente bancário."],
  [485, "A Lei de Arbitragem aplica-se aos contratos que contenham cláusula arbitral, ainda que celebrados antes da sua edição."],
  [486, "É impenhorável o único imóvel residencial do devedor que esteja locado a terceiros, desde que a renda obtida com a locação seja revertida para a subsistência ou a moradia da sua família."],
  [487, "O parágrafo único do art. 741 do CPC não se aplica às sentenças transitadas em julgado em data anterior à da sua vigência."],
  [488, "O § 2º do art. 6º da Lei n. 9.469/1997, que obriga à repartição dos honorários advocatícios, é inaplicável a acordos ou transações celebrados em data anterior à sua vigência."],
  [489, "Reconhecida a continência, devem ser reunidas na Justiça Federal as ações civis públicas propostas nesta e na Justiça estadual."],
  [490, "A dispensa de reexame necessário, quando o valor da condenação ou do direito controvertido for inferior a sessenta salários mínimos, não se aplica a sentenças ilíquidas."],
  [491, "É inadmissível a chamada progressão per saltum de regime prisional."],
  [492, "O ato infracional análogo ao tráfico de drogas, por si só, não conduz obrigatoriamente à imposição de medida socioeducativa de internação do adolescente."],
  [493, "É inadmissível a fixação de pena substitutiva (art. 44 do CP) como condição especial ao regime aberto."],
  [494, "O benefício fiscal do ressarcimento do crédito presumido do IPI relativo às exportações incide mesmo quando as matérias-primas ou os insumos sejam adquiridos de pessoa física ou jurídica não contribuinte do PIS/PASEP."],
  [495, "A aquisição de bens integrantes do ativo permanente da empresa não gera direito a creditamento de IPI."],
  [496, "Os registros de propriedade particular de imóveis situados em terrenos de marinha não são oponíveis à União."],
  [497, "Os créditos das autarquias federais preferem aos créditos da Fazenda estadual desde que coexistam penhoras sobre o mesmo bem."],
  [498, "Não incide imposto de renda sobre a indenização por danos morais."],
  [499, "As empresas prestadoras de serviços estão sujeitas às contribuições ao Sesc e Senac, salvo se integradas noutro serviço social."],
  [500, "A configuração do crime do art. 244-B do ECA independe da prova da efetiva corrupção do menor, por se tratar de delito formal."],
  [501, "É cabível a aplicação retroativa da Lei n. 11.343/2006, desde que o resultado da incidência das suas disposições, na íntegra, seja mais favorável ao réu do que o advindo da aplicação da Lei n. 6.368/1976, sendo vedada a combinação de leis."],
  [502, "Presentes a materialidade e a autoria, afigura-se típica, em relação ao crime previsto no art. 184, § 2º, do CP, a conduta de expor à venda CDs e DVDs piratas."],
  [503, "O prazo para ajuizamento de ação monitória em face do emitente de cheque sem força executiva é quinquenal, a contar do dia seguinte à data de emissão estampada na cártula."],
  [504, "O prazo para ajuizamento de ação monitória em face do emitente de nota promissória sem força executiva é quinquenal, a contar do dia seguinte ao vencimento do título."],
  [505, "A competência para processar e julgar as demandas que têm por objeto obrigações decorrentes dos contratos de planos de previdência privada firmados com a Fundação Rede Ferroviária de Seguridade Social - REFER é da Justiça estadual."],
  [506, "A Anatel não é parte legítima nas demandas entre a concessionária e o usuário de telefonia decorrentes de relação contratual."],
  [507, "A acumulação de auxílio-acidente com aposentadoria pressupõe que a lesão incapacitante e a aposentadoria sejam anteriores a 11/11/1997, observado o critério do art. 23 da Lei n. 8.213/1991 para definição do momento da lesão nos casos de doença profissional ou do trabalho."],
  [508, "A isenção da Cofins concedida pelo art. 6º, II, da LC n. 70/1991 às sociedades civis de prestação de serviços profissionais foi revogada pelo art. 56 da Lei n. 9.430/1996."],
  [509, "É lícito ao comerciante de boa-fé aproveitar os créditos de ICMS decorrentes de nota fiscal posteriormente declarada inidônea, quando demonstrada a veracidade da compra e venda."],
  [510, "A liberação de veículo retido apenas por transporte irregular de passageiros não está condicionada ao pagamento de multas e despesas."],
  [511, "É possível o reconhecimento do privilégio previsto no § 2º do art. 155 do CP nos casos de crime de furto qualificado, se estiverem presentes a primariedade do agente, o pequeno valor da coisa e a qualificadora for de ordem objetiva."],
  [512, "A aplicação da causa de diminuição de pena prevista no art. 33, § 4º, da Lei n. 11.343/2006 não afasta a hediondez do crime de tráfico de drogas."],
  [513, "A abolitio criminis temporária prevista na Lei n. 10.826/2003 aplica-se ao crime de posse de arma de fogo de uso permitido com numeração, marca ou qualquer outro sinal de identificação raspado, suprimido ou adulterado, praticado somente até 23/10/2005."],
  [514, "A CEF é responsável pelo fornecimento dos extratos das contas individualizadas vinculadas ao FGTS dos Trabalhadores participantes do Fundo de Garantia do Tempo de Serviço, inclusive para fins de exibição em juízo, independentemente do período em discussão."],
  [515, "A reunião de execuções fiscais contra o mesmo devedor constitui faculdade do Juiz."],
  [516, "A contribuição de intervenção no domínio econômico para o Incra (Decreto-Lei n. 1.110/1970), devida por empregadores rurais e urbanos, não foi extinta pelas Leis ns. 7.787/1989, 8.212/1991 e 8.213/1991, não podendo ser compensada com a contribuição ao INSS."],
  [517, "São devidos honorários advocatícios no cumprimento de sentença, haja ou não impugnação, depois de escoado o prazo para pagamento voluntário, que se inicia após a intimação do advogado da parte executada."],
  [518, "Para fins do art. 105, III, a, da Constituição Federal, não é cabível recurso especial fundado em alegada violação de enunciado de súmula."],
  [519, "Na hipótese de rejeição da impugnação ao cumprimento de sentença, não são cabíveis honorários advocatícios."],
  [520, "O benefício de saída temporária no âmbito da execução penal é ato jurisdicional insuscetível de delegação à autoridade administrativa do estabelecimento prisional."],
];

function quote(s) {
  return JSON.stringify(s);
}

for (let lote = 45; lote <= 52; lote++) {
  const start = 441 + (lote - 45) * 10;
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
 * Seed STJ lotes 45–52 (Súmulas 441–520).
 * Canceladas fora do RAG: ${canceladasAll.join(", ")}.
 * Uso: node scripts/seed-sumulas-stj-lote-45-52.mjs
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
console.log("STJ lotes 45–52: 441–520. Próximo: 521–.");
if (falha) process.exit(1);
`;

writeFileSync("scripts/seed-sumulas-stj-lote-45-52.mjs", seed, "utf8");
console.log("wrote seed with", ativas.length, "ativas");
