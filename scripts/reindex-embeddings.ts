/**
 * Reindexa embeddings da base_conhecimento.
 * Uso: npx tsx scripts/reindex-embeddings.ts
 *      npx tsx scripts/reindex-embeddings.ts --forcar
 *      npx tsx scripts/reindex-embeddings.ts --paygo-catchup   ← backlog geral (cuidado)
 *      npx tsx scripts/reindex-embeddings.ts --paygo-portal-tj ← só fonte tj%-portal (P2b)
 *
 * Default: GEMINI_API_KEY_SEED (free). Paygo só com flags --paygo-*.
 */

import {
  exigirGeminiApenasSeed,
  exigirGeminiPaygoCatchupReindex,
} from "./lib/gemini-env-seed";

const paygoCatchup = process.argv.includes("--paygo-catchup");
const paygoPortalTj = process.argv.includes("--paygo-portal-tj");
const paygo = paygoCatchup || paygoPortalTj;

if (paygo) {
  exigirGeminiPaygoCatchupReindex(
    paygoPortalTj ? "reindex-paygo-portal-tj" : "reindex-paygo-catchup"
  );
} else {
  exigirGeminiApenasSeed("reindex");
}

async function main() {
  const { reindexarBaseConhecimento } = await import(
    "../src/lib/ia/indexar-conhecimento"
  );
  const forcar = process.argv.includes("--forcar");
  const fonteLike = paygoPortalTj ? "tj%-portal" : undefined;
  console.log(
    "Reindexando embeddings…",
    forcar ? "(forçar todos)" : "(só sem embedding)",
    paygoPortalTj
      ? "· PAYGO tj%-portal"
      : paygoCatchup
        ? "· PAYGO CATCH-UP"
        : "· SEED free",
    fonteLike ? `· filtro fonte LIKE ${fonteLike}` : ""
  );

  let totalIndexados = 0;
  let totalFalhas = 0;
  const avisos: string[] = [];
  const lote = 400;
  // Portal TJ: lotes pequenos (~20–40/rodada); catch-up geral precisa de mais rodadas.
  const maxRodadas = paygoCatchup ? 80 : paygoPortalTj ? 40 : 20;

  for (let rodada = 1; rodada <= maxRodadas; rodada++) {
    const r = await reindexarBaseConhecimento({
      forcar,
      limite: lote,
      fonteLike,
    });
    totalIndexados += r.indexados;
    totalFalhas += r.falhas;
    for (const a of r.avisos) {
      if (avisos.length < 8) avisos.push(a);
    }
    console.log(
      `  rodada ${rodada}: +${r.indexados} indexados, ${r.falhas} falhas`
    );
    if (r.indexados === 0 && r.falhas === 0) break;
    if (forcar) break;
    if (r.indexados === 0 && r.falhas > 0) break;
  }

  console.log(
    JSON.stringify(
      {
        modo: paygoPortalTj
          ? "paygo-portal-tj"
          : paygoCatchup
            ? "paygo-catchup"
            : "seed-free",
        fonteLike: fonteLike ?? null,
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
