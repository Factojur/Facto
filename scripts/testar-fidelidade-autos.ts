/**
 * Fidelidade aos autos (filho/filha, especialidade da vara, placeholders).
 * Uso: npx tsx scripts/testar-fidelidade-autos.ts
 */
import {
  aplicarFidelidadeEspecialidadeVara,
  aplicarFidelidadeGeneroParentesco,
  autosTemEspecialidadeVara,
  blocoPromptFidelidadeAutos,
  extrairSinaisFidelidadeAutos,
  limparPlaceholdersValorCausa,
} from "../src/lib/fidelidade-autos-peca";
import { limparPlaceholdersQualificacao } from "../src/lib/ia/pos-processar-peca-gerada";
import { formatarEnderecamentoPadrao } from "../src/lib/endereco-comarca";
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

  assert(
    !autosTemEspecialidadeVara("1ª Vara de Itararé/SP — união estável"),
    "1ª Vara sem especialidade"
  );
  assert(
    autosTemEspecialidadeVara("2ª Vara Cível de Santos"),
    "detecta Vara Cível"
  );

  const semEsp = aplicarFidelidadeEspecialidadeVara(
    "EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA 1ª VARA CÍVEL DO FÓRUM DA COMARCA DE ITARARÉ/SP\n\nAos autos da 1ª Vara Cível.",
    "1ª Vara de Itararé/SP — filha, alimentos."
  );
  assert(!/VARA C[IÍ]VEL/i.test(semEsp), "remove Vara Cível inventada");
  assert(/1ª\s*VARA\b/i.test(semEsp), "mantém 1ª Vara");

  const comEsp = aplicarFidelidadeEspecialidadeVara(
    "DA 2ª VARA CÍVEL DE SANTOS",
    "2ª Vara Cível de Santos — cobrança."
  );
  assert(/VARA C[IÍ]VEL/i.test(comEsp), "preserva especialidade lastreada");

  const endCivil = formatarEnderecamentoPadrao({
    areaId: "civil",
    comarca: { cidade: "Santos", uf: "SP", numeroJuizado: "2" },
  });
  assert(/2ª\s+VARA\b/i.test(endCivil), "civil com número → Nª VARA");
  assert(
    !/VARA C[IÍ]VEL/i.test(endCivil),
    "civil sem especialidade não inventa Cível"
  );

  const endFazenda = formatarEnderecamentoPadrao({
    areaId: "constitucional",
    especiePeca: "mandado-seguranca",
    comarca: {
      cidade: "São Paulo",
      uf: "SP",
      numeroJuizado: "1",
      especialidadeVara: "DA FAZENDA PÚBLICA",
    },
  });
  assert(/FAZENDA/i.test(endFazenda), "MS com especialidade Fazenda");
  assert(!/VARA C[IÍ]VEL/i.test(endFazenda), "MS Fazenda sem Cível");

  const { oks, falhas } = stats();
  console.log(`\n${oks} ok, ${falhas} falhas`);
  if (falhas > 0) process.exit(1);
}

main();
