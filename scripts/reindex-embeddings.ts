/**
 * Reindexa embeddings da base_conhecimento.
 * Uso: npx tsx scripts/reindex-embeddings.ts
 *      npx tsx scripts/reindex-embeddings.ts --forcar
 * Requer GEMINI_API_KEY_SEED (free) + SUPABASE_* no .env.local.
 * Seeds/reindex/smokes NÃO usam GEMINI_API_KEY paygo.
 */

import { exigirGeminiApenasSeed } from "./lib/gemini-env-seed";

exigirGeminiApenasSeed("reindex");

async function main() {
  const { reindexarBaseConhecimento } = await import(
    "../src/lib/ia/indexar-conhecimento"
  );
  const forcar = process.argv.includes("--forcar");
  console.log(
    "Reindexando embeddings…",
    forcar ? "(forçar todos)" : "(só sem embedding)"
  );

  let totalIndexados = 0;
  let totalFalhas = 0;
  const avisos: string[] = [];
  const lote = 400;

  // Continua em lotes até acabar (ou falhar o lote inteiro).
  for (let rodada = 1; rodada <= 20; rodada++) {
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
      { indexados: totalIndexados, falhas: totalFalhas, avisos },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
