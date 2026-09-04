/**
 * Fidelidade aos autos (filho/filha, placeholders de valor).
 * Uso: npx tsx scripts/testar-fidelidade-autos.ts
 */
import {
  aplicarFidelidadeGeneroParentesco,
  blocoPromptFidelidadeAutos,
  extrairSinaisFidelidadeAutos,
  limparPlaceholdersValorCausa,
} from "../src/lib/fidelidade-autos-peca";
import { limparPlaceholdersQualificacao } from "../src/lib/ia/pos-processar-peca-gerada";
import { createSuite } from "./casos-ouro/suite";

function main() {
  const { assert, stats } = createSuite();

  const soFilha = extrairSinaisFidelidadeAutos(
    "Guarda da filha e alimentos de 1/3. União estável."
  );
  assert(soFilha.soFilha, "detecta só filha");
  assert(!soFilha.soFilho, "não marca só filho");

  const negado = extrairSinaisFidelidadeAutos(
    "Nos autos a prole é filha (não filho)."
  );
  assert(negado.soFilha, "ignora «não filho» na detecção");
  assert(!negado.filho, "não filho não conta como presença");

  const soFilho = extrairSinaisFidelidadeAutos(
    "Alimentos ao filho menor João."
  );
  assert(soFilho.soFilho, "detecta só filho");

  const ambos = extrairSinaisFidelidadeAutos("filho e filha do casal");
  assert(ambos.filha && ambos.filho && !ambos.soFilha, "ambos sem soFilha");

  const peca = aplicarFidelidadeGeneroParentesco(
    "Fixou alimentos ao filho. O menor reside com a mãe. O alimentando precisa de escola.",
    soFilha
  );
  assert(/à filha/i.test(peca) || /a filha/i.test(peca), "filho → filha");
  assert(/a menor/i.test(peca), "o menor → a menor");
  assert(/alimentanda/i.test(peca), "alimentando → alimentanda");
  assert(!/\bo filho\b/i.test(peca), "sem o filho");

  const prompt = blocoPromptFidelidadeAutos(soFilha);
  assert(Boolean(prompt && /FILHA/i.test(prompt)), "prompt força filha");

  const valor = limparPlaceholdersValorCausa(
    "Dá-se à causa o valor de R$ ([valor por extenso]), para fins."
  );
  assert(/R\$ …/.test(valor), "limpa valor por extenso");
  assert(!/valor por extenso/i.test(valor), "sem placeholder extenso");

  const viaPos = limparPlaceholdersQualificacao(
    "Valor R$ ([valor por extenso]) e [VALOR DA CAUSA]."
  );
  assert(/R\$ …/.test(viaPos), "pos-process limpa valor");

  const { oks, falhas } = stats();
  console.log(`\n${oks} ok, ${falhas} falhas`);
  if (falhas > 0) process.exit(1);
}

main();
