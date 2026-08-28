/**
 * Export one-shot de todos os scaffolds + estimativa de custo IA.
 * Preferível no dia a dia: npm run test:pecas-diario (lotes 22h).
 *
 * Uso: npx tsx scripts/exportar-scaffolds-teste.ts
 */
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { gerarScaffoldJob } from "./gerar-scaffold-teste";
import { listarJobsPecaTeste } from "./testes-pecas-fila";

const USD_POR_PECA_FLASH = 0.02;
const USD_POR_PECA_SONNET = 0.35;
const BRL_USD = 5.5;

const OUT_ROOT = join(
  process.cwd(),
  "tmp",
  "testes-pecas-scaffold",
  new Date().toISOString().slice(0, 10) + "-oneshot"
);

function main() {
  const jobs = listarJobsPecaTeste();
  const areas = new Set(jobs.map((j) => j.areaId)).size;
  const totalEsp = jobs.length;

  const custo1 = areas * USD_POR_PECA_FLASH;
  const custoTodas = totalEsp * USD_POR_PECA_FLASH;
  const custoMix =
    totalEsp * USD_POR_PECA_FLASH * 0.85 + totalEsp * USD_POR_PECA_SONNET * 0.15;

  const estimativa = [
    "# Estimativa — geração REAL com IA (não este export)",
    "",
    `Áreas: ${areas} · Espécies: ${totalEsp}`,
    "",
    `## A — 1 peça/área: ~US$ ${custo1.toFixed(2)} (~R$ ${(custo1 * BRL_USD).toFixed(0)})`,
    `## B — todas espécies Flash: ~US$ ${custoTodas.toFixed(2)} (~R$ ${(custoTodas * BRL_USD).toFixed(0)})`,
    `## B+ ~15% Sonnet: ~US$ ${custoMix.toFixed(2)} (~R$ ${(custoMix * BRL_USD).toFixed(0)})`,
    "",
    "Sem paygo Gemini: free tier 429. Este export = 0 tokens redação.",
    "Lotes automáticos 04h: npm run test:pecas-diario",
    "",
  ].join("\n");

  mkdirSync(OUT_ROOT, { recursive: true });
  writeFileSync(join(OUT_ROOT, "00-ESTIMATIVA-CUSTO.md"), estimativa, "utf8");
  console.log(estimativa);

  let ok = 0;
  let falhas = 0;
  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i]!;
    const dir = join(OUT_ROOT, job.areaId);
    mkdirSync(dir, { recursive: true });
    const nome = `${String(i).padStart(3, "0")}-${job.especieId}.txt`;
    try {
      const { peca, vazou9099 } = gerarScaffoldJob(job);
      writeFileSync(
        join(dir, nome),
        [
          `Índice: ${i}`,
          `${job.areaId} / ${job.especieId}`,
          vazou9099 ? "ALERTA 9.099" : "9.099 ok",
          "---",
          "",
          peca,
        ].join("\n"),
        "utf8"
      );
      ok++;
      process.stdout.write(".");
    } catch (e) {
      falhas++;
      writeFileSync(
        join(dir, nome + ".ERRO.txt"),
        String(e instanceof Error ? e.message : e),
        "utf8"
      );
      process.stdout.write("x");
    }
  }
  console.log(`\nok=${ok} falhas=${falhas} → ${OUT_ROOT}`);
  if (falhas) process.exit(1);
}

main();
