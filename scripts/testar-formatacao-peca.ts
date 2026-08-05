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
assert(
  /Nestes termos,\npede deferimento\./.test(normalizada),
  "fechamento em duas linhas"
);
assert(
  /pede deferimento\.\n\[\[ESPACO_2_LINHAS\]\]/.test(normalizada),
  "2 linhas após pede deferimento"
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

console.log("\nTodas as checagens locais passaram (0 tokens Gemini).");
