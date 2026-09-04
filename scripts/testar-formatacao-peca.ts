/**
 * Fixture local — valida normalização forense SEM chamar a API Gemini.
 * Uso: npx tsx scripts/testar-formatacao-peca.ts
 */

import { normalizarPecaGerada } from "../src/lib/ia/normalizar-peca-gerada";
import {
  mesclarFatosIaComDireitoReserva,
  garantirSecaoValorCausa,
} from "../src/lib/ia/mesclar-peca-hibrida";
import { pecaTemFundamentacaoGenerica } from "../src/lib/ia/normalizar-peca-gerada";
import {
  garantirEstruturaCabecalho,
  limparPlaceholdersQualificacao,
  posProcessarDepoisQualificacao,
  prepararCorpoParaInjecaoQualificacao,
  sanitizarPecaPorArea,
} from "../src/lib/ia/pos-processar-peca-gerada";

const FIXTURE_IA = `
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DO JUIZADO ESPECIAL CÍVEL DA COMARCA DE SÃO PAULO - SP

AÇÃO DE INDENIZAÇÃO POR DANOS MATERIAIS E MORAIS

JOÃO DA SILVA, brasileiro, solteiro, comerciante, inscrito no CPF sob nº 000.000.000-00, vem, respeitosamente, à presença de Vossa Excelência, propor a presente

PETIÇÃO INICIAL — AÇÃO DECLARATÓRIA DE INEXISTÊNCIA DE DÉBITO C/C DANOS MORAIS (JEC)

em face de BANCO EXEMPLO S.A., pelos fatos e fundamentos jurídicos a seguir expostos.

I - DOS FATOS
O autor foi vítima de golpe mediante falsa central telefônica. Em 10 de janeiro de 2026, recebeu ligação de terceiros que se passaram por funcionários do banco.
Os valores foram transferidos via PIX sem o consentimento válido do consumidor. A instituição financeira não bloqueou a tempo as operações atípicas.
O prejuízo patrimonial e o abalo moral decorrente da fraude e da inércia administrativa ultrapassam o mero aborrecimento.

II - DO DIREITO a) Da competência do Juizado Especial Cível
Há plausibilidade do direito invocado e necessidade de intervenção do Poder Judiciário para restabelecer a situação jurídica ofendida, privilegiando a oralidade, simplicidade, informalidade, economia processual e celeridade.
b) Da relação de consumo A relação estabelecida entre as partes atrai o CDC.

III - DOS PEDIDOS
Ante o exposto, requer:
a) A citação do réu;
b) A condenação ao pagamento de indenização;
c) A procedência dos pedidos.

Termos em que,
Pede e espera deferimento.

São Paulo/SP, 4 de agosto de 2026.

Maria Silva
OAB/SP 147099
`.trim();

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`FAIL: ${msg}`);
  console.log(`OK: ${msg}`);
}

const normalizada = normalizarPecaGerada(FIXTURE_IA);
assert(/I - DOS FATOS/.test(normalizada), "título DOS FATOS normalizado");
assert(
  (normalizada.match(/\n/g)?.length ?? 0) > 10,
  "peça com múltiplas linhas após normalização"
);
assert(
  !/PETI[CÇ][AÃ]O\s+INICIAL/i.test(normalizada),
  "remove PETIÇÃO INICIAL do nome da ação"
);
assert(
  !/\[\[ESPACO_/i.test(normalizada.split("\n").find((l) => /em face/i.test(l)) ?? ""),
  "marcador não cola em 'em face de'"
);
assert(
  /^II - DO DIREITO\s*$/m.test(normalizada),
  "II - DO DIREITO sozinho na linha"
);
assert(
  !/^II - DO DIREITO[ \t]+a\)/m.test(normalizada),
  "subtítulo a) não cola no DO DIREITO"
);

const romanosNaMesmaLinha = normalizarPecaGerada(
  "I - DOS FATOS II - DO DIREITO III - DOS PEDIDOS\nTexto."
);
assert(/^I - DOS FATOS$/m.test(romanosNaMesmaLinha), "romanos colados → I sozinho");
assert(/^II - DO DIREITO$/m.test(romanosNaMesmaLinha), "romanos colados → II sozinho");
assert(/^III - DOS PEDIDOS$/m.test(romanosNaMesmaLinha), "romanos colados → III sozinho");
assert(
  !/I - DOS FATOS II - DO DIREITO/.test(romanosNaMesmaLinha),
  "não mantém I e II na mesma linha"
);

const enderecamentoColado = normalizarPecaGerada(
  "em face de BANCO EXEMPLO S.A., pelos fatos e fundamentos a seguir. I - DOS FATOS O autor teve o corte."
);
assert(
  /^em face de BANCO EXEMPLO/m.test(enderecamentoColado),
  "prefixo em face de separado do romano"
);
assert(/^I - DOS FATOS$/m.test(enderecamentoColado), "I - DOS FATOS sozinho após prefixo");
assert(
  /O autor teve o corte/i.test(enderecamentoColado) &&
    !/^I - DOS FATOS O autor/m.test(enderecamentoColado),
  "corpo não cola no título DOS FATOS"
);

const fatosDireitoFundidos = normalizarPecaGerada(
  "I - DOS FATOS DO DIREITO\nRelato breve."
);
assert(/^I - DOS FATOS$/m.test(fatosDireitoFundidos), "FATOS+DIREITO fundidos → I");
assert(/^II - DO DIREITO$/m.test(fatosDireitoFundidos), "FATOS+DIREITO fundidos → II");

assert(
  /Nestes termos,\npede deferimento\./.test(normalizada),
  "fechamento em duas linhas"
);
assert(
  /pede deferimento\.\n\[\[ESPACO_1_LINHA\]\]/.test(normalizada),
  "1 linha após pede deferimento"
);
assert(
  /\[\[ESPACO_1_LINHA\]\]\nNestes termos,/i.test(normalizada),
  "1 linha em branco antes de Nestes termos"
);
assert(
  /propor a presente\n\[\[ESPACO_1_LINHA\]\]\n/i.test(normalizada) ||
    /propor a presente\.?\n\[\[ESPACO_1_LINHA\]\]/i.test(normalizada),
  "linha em branco após propor a presente"
);
assert(
  /\[\[ESPACO_1_LINHA\]\]\nb\)/i.test(normalizada),
  "linha em branco entre subtítulos do direito"
);
assert(
  /DOS PEDIDOS[\s\S]*?\na\)\s+A citação/i.test(normalizada) &&
    !/DOS PEDIDOS[\s\S]*?\n\*\*a\)/i.test(normalizada),
  "itens de DOS PEDIDOS sem negrito"
);

const corpoFatos = (normalizada.split(/I - DOS FATOS/)[1] ?? "").split(/II - DO DIREITO/)[0] ?? "";
assert(
  /golpe mediante falsa central/i.test(corpoFatos) &&
    /valores foram transferidos/i.test(corpoFatos) &&
    /prejuízo patrimonial/i.test(corpoFatos),
  "corpo dos fatos preserva as três frases"
);
assert(
  corpoFatos.trim().split("\n").filter(Boolean).length <= 2,
  "frases dos fatos viram parágrafo(s) contínuos para justificar"
);

const subtituloLatim = normalizarPecaGerada(
  `*c) Do dano moral "in re ipsa" e do dever de indenizar**`
);
const linhaC =
  subtituloLatim.split("\n").find((l) => /^c\)\s/i.test(l.trim())) ?? "";
assert(
  /^c\) Do dano moral \*"in re ipsa"\* e do dever de indenizar$/i.test(
    linhaC.trim()
  ),
  'subtítulo: negrito via tipografia; só "in re ipsa" em *"…"*'
);
assert(
  !/^\*{1,2}/.test(linhaC.trim()),
  "subtítulo sem * ou ** envolvendo a linha inteira"
);

const provasNum = normalizarPecaGerada(`III - DAS PROVAS E ANEXOS
O Autor instrui a presente exordial com os seguintes documentos essenciais:
a) Documentos pessoais do Autor (RG, CPF e comprovante de residência);
b) Comprovante de quitação integral do débito emitido junto à operadora;
c) Comprovante do extrato de negativação nos cadastros de proteção ao crédito (SPC/Serasa).

IV - DO VALOR DA CAUSA
Dá-se à causa o valor de R$ 1.000,00.`);
assert(
  /DAS PROVAS E ANEXOS[\s\S]*?\n1\)\s+Documentos pessoais/i.test(provasNum),
  "DAS PROVAS: a) vira 1)"
);
assert(
  /DAS PROVAS E ANEXOS[\s\S]*?\n2\)\s+Comprovante de quita/i.test(provasNum),
  "DAS PROVAS: b) vira 2)"
);
assert(
  /DAS PROVAS E ANEXOS[\s\S]*?\n3\)\s+Comprovante do extrato/i.test(provasNum),
  "DAS PROVAS: c) vira 3)"
);
assert(
  !/DAS PROVAS E ANEXOS[\s\S]*?\n[a-c]\)/i.test(provasNum),
  "DAS PROVAS sem itens a)/b)/c)"
);

const fechamentoEspaco = normalizarPecaGerada(`c) A procedência dos pedidos.

Nestes termos,
pede deferimento.

São Paulo/SP, 5 de agosto de 2026.
Maria Silva
Advogado
OAB/SP 147099`);
assert(
  /procedência dos pedidos\.\n\[\[ESPACO_1_LINHA\]\]\nNestes termos,/i.test(
    fechamentoEspaco
  ),
  "1 linha em branco entre último pedido e Nestes termos"
);
assert(
  /pede deferimento\.\n\[\[ESPACO_1_LINHA\]\]\nSão Paulo\/SP/i.test(
    fechamentoEspaco
  ),
  "1 linha em branco entre pede deferimento e data"
);
assert(
  /São Paulo\/SP, 5 de agosto de 2026\.\n\[\[ESPACO_1_LINHA\]\]\nMaria Silva\nOAB\/SP 147099/i.test(
    fechamentoEspaco
  ),
  "1 linha entre data e nome; OAB na linha seguinte sem Advogado"
);
assert(
  !/^Advogado$/im.test(fechamentoEspaco),
  "remove linha isolada Advogado no fechamento"
);

const semFechamento = normalizarPecaGerada(`EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA COMARCA DE CAMPINAS - SP

AÇÃO DE INDENIZAÇÃO POR DANOS MORAIS

JOÃO DA SILVA, brasileiro, vem propor a presente

em face de BANCO X S.A., pelos fatos a seguir.

I - DOS FATOS
O autor sofreu cobrança indevida após quitação do contrato de financiamento veicular.

II - DO DIREITO
a) Da relação de consumo
Aplica-se o CDC à hipótese dos autos.

III - DOS PEDIDOS
Ante o exposto, requer:
a) A citação do réu;
b) A procedência dos pedidos.`);
assert(
  /Nestes termos,\npede deferimento\./.test(semFechamento),
  "garante Nestes termos / pede deferimento se a IA omitir"
);
assert(
  /\[\[ESPACO_1_LINHA\]\]\nNestes termos,/i.test(semFechamento),
  "1 linha antes do fechamento inserido"
);

const italicoCorpo = normalizarPecaGerada(
  `O dano moral in re ipsa prescinde de prova do abalo. Configuram-se o fumus boni iuris e o "periculum in mora". Houve phishing e ausência de compliance.`
);
assert(
  /\*"in re ipsa"\*/i.test(italicoCorpo),
  "itálico: in re ipsa no corpo"
);
assert(
  /\*"fumus boni iuris"\*/i.test(italicoCorpo),
  "itálico: fumus boni iuris no corpo"
);
assert(
  /\*"periculum in mora"\*/i.test(italicoCorpo),
  "itálico: periculum já entre aspas"
);
assert(
  /\*"phishing"\*/i.test(italicoCorpo) && /\*"compliance"\*/i.test(italicoCorpo),
  "itálico: termos em inglês no corpo"
);
assert(
  (italicoCorpo.match(/\*"in re ipsa"\*/gi) || []).length === 1,
  "não duplica marcação de itálico"
);
assert(
  pecaTemFundamentacaoGenerica(normalizada),
  "fixture detectada como fundamentação genérica"
);

const hibrida = mesclarFatosIaComDireitoReserva({
  pecaIa: normalizada,
  tipoAcao: "Ação de Indenização por Danos Materiais e Morais",
  fatos: "golpe pix banco fraude",
  tutelaUrgencia: true,
  blocoValorCausa: "Dá-se à causa o valor de R$ 10.000,00 (dez mil reais).",
});

assert(/art\.\s*14 do CDC/i.test(hibrida), "híbrido injeta CDC");
assert(/Súmula 479/i.test(hibrida), "híbrido injeta Súmula 479");
assert(/DO VALOR DA CAUSA/i.test(hibrida), "híbrido garante valor da causa");
assert(/tutela de urgência/i.test(hibrida), "híbrido inclui tutela");
assert(
  /golpe mediante falsa central/i.test(hibrida),
  "híbrido preserva fatos da IA"
);

const comValor = garantirSecaoValorCausa(
  normalizada.replace(/DO VALOR DA CAUSA[\s\S]*?(?=\nIII|\nIV|\nV)/i, ""),
  "Dá-se à causa o valor de R$ 5.000,00."
);
assert(/DO VALOR DA CAUSA/i.test(comValor), "garantirSecaoValorCausa funciona");

const typos = normalizarPecaGerada(
  `EXCELENTÍSSIMO(A) SENHOR(A) doutor(A) JUIZ(A) DE DIREITO DA ___ VARA DO JUIZADO ESPECIAL CÍVEL DO FÓRUM DA COMARCA DE SÃO PAULO/SP

Aplica-se o CDC. "In casu"* a indenização no patagar de R$ 8.000,00. aplicajući-se a Súmula 479.`
);
assert(/DOUTOR\(A\)/.test(typos.split("\n")[0]!), "endereçamento em caixa alta");
assert(/patamar/i.test(typos), "corrige patagar");
assert(/aplica-se a Súmula/i.test(typos), "corrige aplicajući-se");
assert(/\*"In casu"\*/.test(typos) || /\*"in casu"\*/i.test(typos), "latim órfão vira itálico");

const semCabecalho = prepararCorpoParaInjecaoQualificacao(
  `Texto solto da IA sobre energia.\n\nI - DOS FATOS\nFato um.`
);
assert(/^I\s*-/m.test(semCabecalho), "remove préâmbulo até DOS FATOS");

const comCab = garantirEstruturaCabecalho(semCabecalho, {
  enderecamento:
    "EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DO JUIZADO ESPECIAL CÍVEL DA COMARCA DE CAMPINAS - SP",
  epigrafe: ["Processo nº —", "AUTOR: Maria", "RÉU: Enel"],
});
assert(/EXCELENTÍSSIMO/i.test(comCab), "injeta endereçamento");
assert(/I\s*-\s*DOS FATOS/i.test(comCab), "mantém corpo");

const placeholders = limparPlaceholdersQualificacao(
  "Maria, [estado civil], CPF [CPF], valor [VALOR DA CAUSA]"
);
assert(!/\[CPF\]/.test(placeholders), "limpa placeholder CPF");

const hcSujo = sanitizarPecaPorArea(
  `EXCELENTÍSSIMO...\n\nem face de Enel São Paulo, pelos fatos.\n\nI - DOS FATOS\nPaciente preso em flagrante.\n\nPedido de multa diária de R$ 500.`,
  { areaId: "criminal", especie: "habeas-corpus" }
);
assert(!/enel/i.test(hcSujo), "HC remove Enel");
assert(!/multa diária/i.test(hcSujo), "HC remove multa CPC");

const finalHc = posProcessarDepoisQualificacao(hcSujo, {
  areaId: "criminal",
  especie: "habeas-corpus",
  tituloPeca: "HABEAS CORPUS",
});
assert(/HABEAS CORPUS/i.test(finalHc), "garante título HC");

// Tipografia protocolável — higiene pós-IA (0 tokens)
const lixoTipografia = normalizarPecaGerada(`\`\`\`markdown
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA 1ª VARA DO FÓRUM DA COMARCA DE ITARARÉ/SP
[[ESPACO_6_LINHAS]]
[[JURIS]]Processo nº: 1000011-77.2025.8.26.0279 I - DA TEMPESTIVIDADE[[/JURIS]]
A sentença no processo 1000011-77.2025.8.26.0279 fixou alimentos.
III - DO MÉRITO
RECURSAL: DA NECESSIDADE DE REDUÇÃO
A fixação *"**"in casu"*"* revela desproporção.
a) Reformar a r. sentença recorrida** no capítulo alimentar.
VII - DOS PEDIDOS
Diante do exposto, requer a Vossa Excelência a procedência.
Nestes termos,
pede deferimento.
Vara de Itararé/SP, 4 de setembro de 2026.
Teste
OAB/SP 147099
\`\`\``);
assert(!/^```/m.test(lixoTipografia), "remove cerca markdown");
assert(
  !/\[\[JURIS\]\]Processo nº/i.test(lixoTipografia),
  "Processo nº não vira bloco JURIS"
);
assert(
  !/\[\[JURIS\]\].*1000011-77\.2025/i.test(lixoTipografia),
  "parágrafo só com CNJ não vira JURIS"
);
assert(
  /III - DO MÉRITO RECURSAL/i.test(lixoTipografia),
  "cola título romano partido"
);
assert(
  /\*"in casu"\*/i.test(lixoTipografia) && !/\*"\*\*"in casu"/i.test(lixoTipografia),
  "latin markdown limpo"
);
assert(
  !/recorrida\*\*/i.test(lixoTipografia),
  "remove ** órfão em pedidos"
);
assert(
  /^Itararé\/SP,/m.test(lixoTipografia),
  "localidade sem prefixo Vara de"
);

console.log("\nTodas as checagens locais passaram (0 tokens Gemini).");
