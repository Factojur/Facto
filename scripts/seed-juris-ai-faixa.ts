/**
 * Roda vários lotes em sequência e para se a cota diária da API esgotar.
 * Uso: npx tsx scripts/seed-juris-ai-faixa.ts 9 56
 *      npx tsx scripts/seed-juris-ai-faixa.ts 40 64
 * Lotes 57–64 = lacunas (TST / TRF / STJ eleitoral / CARF).
 */
import { spawnSync } from "child_process";
import { termosDoLote, LOTE_MAX } from "./seed-juris-termos";

const from = Math.max(1, Number(process.argv[2] ?? 9) || 9);
const to = Math.min(LOTE_MAX, Number(process.argv[3] ?? LOTE_MAX) || LOTE_MAX);

let consultas = 0;
for (let n = from; n <= to; n++) {
  consultas += termosDoLote(n).length;
}
console.log(
  `Faixa ${from}–${to}: ${to - from + 1} lotes, ${consultas} consultas HTTP (1 por termo).`
);
console.log("Para se aparecer “Cota diária esgotada”. Depois: reindex:embeddings.\n");

for (let n = from; n <= to; n++) {
  const qtd = termosDoLote(n).length;
  console.log(`\n========== LOTE ${n}/${to} (${qtd} termos) ==========\n`);
  const r = spawnSync("npx", ["tsx", "scripts/seed-juris-ai-lote.ts", String(n)], {
    encoding: "utf8",
    env: { ...process.env, SEED_JURIS_POR_TEMA: process.env.SEED_JURIS_POR_TEMA ?? "15" },
    cwd: process.cwd(),
    shell: true,
    maxBuffer: 20 * 1024 * 1024,
  });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  const text = `${r.stdout ?? ""}\n${r.stderr ?? ""}`;
  if (/Cota diária esgotada/i.test(text)) {
    console.log(
      `\nCota do dia esgotou no lote ${n}. Amanhã: npx tsx scripts/seed-juris-ai-faixa.ts ${n} ${to}`
    );
    process.exit(0);
  }
  if (r.status && r.status !== 0) {
    console.error(`Lote ${n} exit ${r.status}`);
    if (/401|403|não autentic/i.test(text)) process.exit(1);
  }
}

console.log(`\nFaixa ${from}–${to} concluída. Próximo: npm run reindex:embeddings`);
