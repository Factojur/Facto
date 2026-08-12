/**
 * Suite casos-ouro FACTO — regressão local sem Gemini (0 tokens).
 *
 * Cobertura:
 * - JEC petição inicial (9 temas + híbrido)
 * - JEC demais espécies (contestação, embargos, recurso, réplica, execução)
 * - Lastro multiárea (todas as áreas de atuação, inclusive fechadas)
 *
 * Uso: npm run test:casos-ouro
 */

import { AREAS_ATUACAO } from "../src/lib/areas-atuacao";
import { ESPECIES_PECA_JEC } from "../src/lib/jec-especie-peca";
import {
  garantirSecaoValorCausa,
  mesclarFatosIaComDireitoReserva,
} from "../src/lib/ia/mesclar-peca-hibrida";
import {
  normalizarPecaGerada,
  pecaTemFundamentacaoGenerica,
} from "../src/lib/ia/normalizar-peca-gerada";
import { verificarCitacoes } from "../src/lib/ia/verificacao-citacoes";
import { CASOS_OURO_AREAS } from "./casos-ouro/fixtures-areas";
import { CASOS_OURO_ESPECIES } from "./casos-ouro/fixtures-especies";
import { CASOS_OURO_JEC } from "./casos-ouro/fixtures";
import { mergeStats, rodarAssertsLastro } from "./casos-ouro/lastro";
import { createSuite } from "./casos-ouro/suite";
import type { CasoOuroArea, CasoOuroEspecie, CasoOuroJec } from "./casos-ouro/types";

function rodarCasoJec(caso: CasoOuroJec) {
  const { assert, stats } = createSuite();
  console.log(`\n▸ JEC · ${caso.id} — ${caso.tema}`);

  const normalizada = normalizarPecaGerada(caso.pecaIaBruta);

  assert(/I\s*-\s*DOS FATOS/i.test(normalizada), "seção DOS FATOS presente");
  assert(/II\s*-\s*DO DIREITO/i.test(normalizada), "seção DO DIREITO presente");
  assert(/DOS PEDIDOS/i.test(normalizada), "seção DOS PEDIDOS presente");
  assert(
    (normalizada.match(/\n/g)?.length ?? 0) > 8,
    "peça multilinha após normalização"
  );
  assert(
    /II\s*-\s*DO DIREITO\s*\n/i.test(normalizada),
    "II - DO DIREITO sozinho na linha"
  );
  assert(
    !/PETI[CÇ][AÃ]O INICIAL\s*[—–-]/.test(normalizada),
    "sem prefixo PETIÇÃO INICIAL —"
  );

  for (const chave of caso.fatosChave) {
    assert(
      new RegExp(chave.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(
        normalizada
      ),
      `preserva fato: “${chave}”`
    );
  }

  const { anotada } = rodarAssertsLastro({
    assert,
    texto: normalizada,
    contextoLastro: caso.contextoLastro,
    jurisComLastro: caso.jurisComLastro,
    jurisSemLastro: caso.jurisSemLastro,
  });

  const comValor = garantirSecaoValorCausa(anotada, caso.valorCausaBloco);
  assert(/DO VALOR DA CAUSA/i.test(comValor), "garante DO VALOR DA CAUSA");

  const hibrida = mesclarFatosIaComDireitoReserva({
    pecaIa: normalizada,
    tipoAcao: caso.tipoAcao,
    fatos: caso.fatosChave.join(" "),
    tutelaUrgencia: Boolean(caso.tutelaUrgencia),
    blocoValorCausa: caso.valorCausaBloco,
  });
  assert(/DO VALOR DA CAUSA/i.test(hibrida), "híbrido: valor da causa");
  assert(
    caso.fatosChave.some((f) =>
      new RegExp(f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(hibrida)
    ),
    "híbrido: preserva ao menos um fato-chave"
  );
  if (caso.tutelaUrgencia) {
    assert(/tutela de urgência/i.test(hibrida), "híbrido: tutela de urgência");
  }

  return stats();
}

function rodarCasoArea(caso: CasoOuroArea) {
  const { assert, stats } = createSuite();
  console.log(`\n▸ ÁREA · ${caso.areaId} · ${caso.id} — ${caso.tema}`);

  rodarAssertsLastro({
    assert,
    texto: caso.textoPeca,
    contextoLastro: caso.contextoLastro,
    jurisComLastro: caso.jurisComLastro,
    jurisSemLastro: caso.jurisSemLastro,
    leisComLastro: caso.leisComLastro,
  });

  return stats();
}

function rodarCasoEspecie(caso: CasoOuroEspecie) {
  const { assert, stats } = createSuite();
  console.log(`\n▸ ESPÉCIE · ${caso.especie} · ${caso.id} — ${caso.tema}`);

  const normalizada = normalizarPecaGerada(caso.pecaIaBruta);
  assert(
    (normalizada.match(/\n/g)?.length ?? 0) > 6,
    "peça multilinha após normalização"
  );

  for (const secao of caso.secoesObrigatorias) {
    assert(
      new RegExp(secao.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(
        normalizada
      ),
      `seção obrigatória: ${secao}`
    );
  }

  rodarAssertsLastro({
    assert,
    texto: normalizada,
    contextoLastro: caso.contextoLastro,
    jurisComLastro: caso.jurisComLastro,
    jurisSemLastro: caso.jurisSemLastro,
  });

  return stats();
}

function rodarAssertsEstruturais() {
  const { assert, stats } = createSuite();
  console.log("\n▸ estrutural — lastro e híbrido");

  const generica = `
I - DOS FATOS
Fatos quaisquer.

II - DO DIREITO
Há plausibilidade do direito invocado e necessidade de intervenção do Poder Judiciário para restabelecer o equilíbrio.

III - DOS PEDIDOS
a) Procedência.
`.trim();
  assert(
    pecaTemFundamentacaoGenerica(generica),
    "detecta fundamentação genérica"
  );
  assert(
    !pecaTemFundamentacaoGenerica(
      "II - DO DIREITO\nAplica-se o art. 14 do CDC e a Súmula 479 do STJ ao golpe PIX narrado."
    ),
    "não marca CDC/Súmula 479 como genérico"
  );

  const soEstrategia = "Tese: colacionar REsp 1234567 inventado na triagem.";
  const peca = "Cita-se o REsp 1234567 no mérito.";
  const citacoes = verificarCitacoes(peca, "CDC. Súmula 479.");
  const hit = citacoes.find((c) => /1234567/.test(c.trecho));
  assert(Boolean(hit), "detecta REsp só na peça");
  assert(hit ? !hit.verificada : false, "estratégia NÃO entra no lastro");
  const comEstrategia = verificarCitacoes(
    peca,
    [soEstrategia, "CDC. Súmula 479."].join("\n")
  );
  const hitVeneno = comEstrategia.find((c) => /1234567/.test(c.trecho));
  assert(
    hitVeneno ? hitVeneno.verificada : false,
    "controle: se a estratégia fosse lastro, o REsp passaria (regressão do furo)"
  );

  return stats();
}

function rodarCatalogoCobertura() {
  const { assert, stats } = createSuite();
  console.log("\n▸ catálogo — cobertura de áreas e espécies");

  const areasComFixture = new Set<string>(["jec"]);
  for (const c of CASOS_OURO_AREAS) {
    areasComFixture.add(c.areaId);
  }
  for (const area of AREAS_ATUACAO) {
    assert(
      areasComFixture.has(area.id),
      `cobertura área: ${area.id} (${area.title})`
    );
  }

  const especiesComFixture = new Set<string>(["peticao-inicial"]);
  for (const c of CASOS_OURO_ESPECIES) {
    especiesComFixture.add(c.especie);
  }
  for (const esp of ESPECIES_PECA_JEC) {
    assert(
      especiesComFixture.has(esp.id),
      `cobertura espécie JEC: ${esp.id} (${esp.rotulo})`
    );
  }

  return stats();
}

function main() {
  const totalCasos =
    CASOS_OURO_JEC.length +
    CASOS_OURO_AREAS.length +
    CASOS_OURO_ESPECIES.length;

  console.log(
    `Casos-ouro FACTO: ${totalCasos} casos + catálogo (0 tokens Gemini)\n`
  );
  console.log(
    `  JEC inicial: ${CASOS_OURO_JEC.length} · Áreas: ${CASOS_OURO_AREAS.length} · Espécies: ${CASOS_OURO_ESPECIES.length}`
  );

  const allStats = [];

  for (const caso of CASOS_OURO_JEC) {
    try {
      allStats.push(rodarCasoJec(caso));
    } catch (e) {
      allStats.push({ oks: 0, falhas: 1 });
      console.error(
        `  FAIL (exceção JEC): ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  for (const caso of CASOS_OURO_ESPECIES) {
    try {
      allStats.push(rodarCasoEspecie(caso));
    } catch (e) {
      allStats.push({ oks: 0, falhas: 1 });
      console.error(
        `  FAIL (exceção espécie): ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  for (const caso of CASOS_OURO_AREAS) {
    try {
      allStats.push(rodarCasoArea(caso));
    } catch (e) {
      allStats.push({ oks: 0, falhas: 1 });
      console.error(
        `  FAIL (exceção área): ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  try {
    allStats.push(rodarAssertsEstruturais());
    allStats.push(rodarCatalogoCobertura());
  } catch (e) {
    allStats.push({ oks: 0, falhas: 1 });
    console.error(
      `  FAIL (exceção estrutural): ${e instanceof Error ? e.message : String(e)}`
    );
  }

  const { oks, falhas } = mergeStats(...allStats);
  console.log(
    `\nResumo: ${oks} OK · ${falhas} FAIL · ${totalCasos} casos + catálogo`
  );
  if (falhas > 0) {
    process.exit(1);
  }
  console.log("Suite casos-ouro passou.");
}

main();
