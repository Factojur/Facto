/**
 * Testes do roteador Sonnet + checagem rápida da API Anthropic.
 * Uso: npx tsx scripts/testar-roteador-sonnet.ts
 */
import {
  areaDensaSonnet,
  decidirRedatorSonnet,
  especieExigeSonnet,
  LIMITE_CHARS_RELATO_SONNET_AREA_DENSA,
  recomendaFuncaoDetalhada,
} from "../src/lib/ia/roteador-redator";
import {
  anthropicConfigurado,
  gerarTextoComAnthropic,
  modeloAnthropicRedacao,
} from "../src/lib/ia/anthropic-client";
import { createSuite } from "./casos-ouro/suite";
import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const { assert, stats } = createSuite();

  assert(especieExigeSonnet("apelacao"), "apelação exige Sonnet");
  assert(especieExigeSonnet("cumprimento-alimentos"), "alimentos exige Sonnet");
  assert(!especieExigeSonnet("peticao-inicial"), "inicial JEC não exige Sonnet");
  assert(areaDensaSonnet("familia"), "família é área densa");

  const essencial = decidirRedatorSonnet({
    plano: "jec",
    especie: "apelacao",
    sonnetUsadas: 0,
    esforco: "fundo",
  });
  assert(
    essencial.usarSonnet && essencial.motivo === "especie_complexa",
    "Essencial + apelação + detalhada → Sonnet (teto 10%)"
  );
  assert(essencial.tetoMes === 3, "Essencial teto Sonnet = floor(30×10%) = 3");

  const trial = decidirRedatorSonnet({
    plano: "trial",
    especie: "apelacao",
    sonnetUsadas: 0,
    esforco: "fundo",
  });
  assert(!trial.usarSonnet, "trial nunca Sonnet");

  const padraoFlash = decidirRedatorSonnet({
    plano: "mensal",
    especie: "apelacao",
    areaId: "familia",
    sonnetUsadas: 0,
    esforco: "padrao",
  });
  assert(
    !padraoFlash.usarSonnet,
    "O5b: padrão = Flash mesmo com apelação"
  );

  const sugerir = recomendaFuncaoDetalhada({
    plano: "mensal",
    especie: "apelacao",
    areaId: "familia",
    sonnetUsadas: 0,
    anthropicOk: true,
  });
  assert(sugerir, "O5b: apelação + teto → sugere detalhada");

  const semTeto = recomendaFuncaoDetalhada({
    plano: "mensal",
    especie: "apelacao",
    sonnetUsadas: 99,
    anthropicOk: true,
  });
  assert(!semTeto, "O5b: teto esgotado → não pergunta");

  const densa = decidirRedatorSonnet({
    plano: "pro",
    especie: "peticao-inicial",
    areaId: "familia",
    charsRelato: LIMITE_CHARS_RELATO_SONNET_AREA_DENSA,
    sonnetUsadas: 0,
    esforco: "fundo",
  });
  assert(densa.usarSonnet && densa.motivo === "relato_longo", "área densa + 3,5k + detalhada → Sonnet");

  const fundo = decidirRedatorSonnet({
    plano: "pro",
    especie: "peticao-inicial",
    areaId: "constitucional",
    charsRelato: 800,
    sonnetUsadas: 0,
    esforco: "fundo",
  });
  assert(fundo.usarSonnet && fundo.motivo === "area_densa", "área densa + Fundo → Sonnet");

  console.log("\n— Anthropic —");
  if (!anthropicConfigurado()) {
    console.log("SKIP: ANTHROPIC_API_KEY ausente");
  } else {
    const r = await gerarTextoComAnthropic({
      systemPrompt: "Responda em uma linha, sem rodeios.",
      userPrompt: "Escreva só: SONNET_OK",
      temperature: 0,
      maxOutputTokens: 32,
    });
    assert(r.ok, `Anthropic OK (${modeloAnthropicRedacao()})`);
    if (r.ok) {
      assert(/SONNET_OK/i.test(r.texto), `texto contém SONNET_OK: ${r.texto.slice(0, 80)}`);
      console.log(`  modelo=${r.modelo}`);
    } else {
      console.error(`  ${r.erro}`);
    }
  }

  const { oks, falhas } = stats();
  console.log(`\n${oks} ok, ${falhas} falhas`);
  if (falhas > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
