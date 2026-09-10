/**
 * Reindexa embeddings da base_conhecimento.
 * Uso: npx tsx scripts/reindex-embeddings.ts
 *      npx tsx scripts/reindex-embeddings.ts --forcar
 *      npx tsx scripts/reindex-embeddings.ts --paygo-catchup   ← ÚNICA vez: zera backlog com paygo
 *
 * Default: GEMINI_API_KEY_SEED (free). Paygo só com --paygo-catchup.
 */

import {
  exigirGeminiApenasSeed,
  exigirGeminiPaygoCatchupReindex,
} from "./lib/gemini-env-seed";

const paygoCatchup = process.argv.includes("--paygo-catchup");
if (paygoCatchup) {
  exigirGeminiPaygoCatchupReindex("reindex");
} else {
  exigirGeminiApenasSeed("reindex");
}

async function main() {
  const { reindexarBaseConhecimento } = await import(
    "../src/lib/ia/indexar-conhecimento"
  );
  const forcar = process.argv.includes("--forcar");
  console.log(
    "Reindexando embeddings…",
    forcar ? "(forçar todos)" : "(só sem embedding)",
    paygoCatchup ? "· PAYGO CATCH-UP" : "· SEED free"
  );

  let totalIndexados = 0;
  let totalFalhas = 0;
  const avisos: string[] = [];
  const lote = 400;
  // Catch-up: ~21k itens → precisa de mais rodadas que o diário free (20×400).
  const maxRodadas = paygoCatchup ? 80 : 20;

  for (let rodada = 1; rodada <= maxRodadas; rodada++) {
    const r = await reindexarBaseConhecimento({ forcar, limite: lote });
    totalIndexados += r.indexados;
    totalFalhas += r.falhas;
    for (const a of r.avisos) {
      if (avisos.length < 8) avisos.push(a);
    }
    console.log(
      `  rodada ${rodada}: +${r.indexados} indexados, ${r.falhas} falhas`
    );
    if (r.indexados === 0 && r.falhas === 0) break;
    if (forcar) break; // forçar: uma passada no limite basta
    if (r.indexados === 0 && r.falhas > 0) break;
  }

  console.log(
    JSON.stringify(
      {
        modo: paygoCatchup ? "paygo-catchup" : "seed-free",
        indexados: totalIndexados,
        falhas: totalFalhas,
        avisos,
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
