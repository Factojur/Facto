/**
 * Regenera src/lib/sumulas/index.ts com SV + STJ + STF NV.
 * Uso: node scripts/rebuild-sumulas-index.mjs
 */
import { writeFileSync, readdirSync } from "fs";

const nvPads = readdirSync("src/lib/sumulas")
  .filter((f) => /^stf-nv-lote-\d+\.ts$/.test(f))
  .map((f) => f.match(/(\d+)/)[1])
  .sort((a, b) => Number(a) - Number(b));

const lines = [];
lines.push(`import { SUMULAS_LOTE_01 } from "@/lib/sumulas/lote-01-sv-stf";`);
lines.push(`import { SUMULAS_LOTE_02 } from "@/lib/sumulas/lote-02-sv-stf";`);
lines.push(`import {`);
lines.push(`  SUMULAS_LOTE_03,`);
lines.push(`  SUMULA_SV_30_PENDENTE,`);
lines.push(`} from "@/lib/sumulas/lote-03-sv-stf";`);
lines.push(`import { SUMULAS_LOTE_04 } from "@/lib/sumulas/lote-04-sv-stf";`);
lines.push(`import { SUMULAS_LOTE_05 } from "@/lib/sumulas/lote-05-sv-stf";`);
lines.push(`import { SUMULAS_LOTE_06 } from "@/lib/sumulas/lote-06-sv-stf";`);
lines.push(`import {`);
lines.push(`  SUMULAS_LOTE_07,`);
lines.push(`  SUMULAS_LOTE_08,`);
lines.push(`  SUMULAS_LOTE_09,`);
lines.push(`} from "@/lib/sumulas/lote-07-sv-stf";`);

for (let i = 1; i <= 68; i++) {
  const pad = String(i).padStart(2, "0");
  lines.push(
    `import { SUMULAS_STJ_LOTE_${pad} } from "@/lib/sumulas/stj-lote-${pad}";`
  );
}
for (const pad of nvPads) {
  lines.push(
    `import { SUMULAS_STF_NV_LOTE_${pad} } from "@/lib/sumulas/stf-nv-lote-${pad}";`
  );
}
lines.push(`import { SUMULAS_PENDENTES } from "@/lib/sumulas/pendentes";`);
lines.push(`import {`);
lines.push(`  sumulasAtivasParaBase,`);
lines.push(`  type SumulaLoteItem,`);
lines.push(`} from "@/lib/sumulas/types";`);
lines.push(``);
lines.push(`export type { SumulaLoteItem };`);
lines.push(`export {`);
for (let i = 1; i <= 9; i++) {
  lines.push(`  SUMULAS_LOTE_0${i},`);
}
for (let i = 1; i <= 68; i++) {
  lines.push(`  SUMULAS_STJ_LOTE_${String(i).padStart(2, "0")},`);
}
for (const pad of nvPads) {
  lines.push(`  SUMULAS_STF_NV_LOTE_${pad},`);
}
lines.push(`  SUMULA_SV_30_PENDENTE,`);
lines.push(`  SUMULAS_PENDENTES,`);
lines.push(`};`);
lines.push(``);
lines.push(
  `export const TODOS_LOTES_SUMULAS: SumulaLoteItem[][] = [`
);
for (let i = 1; i <= 9; i++) {
  lines.push(`  SUMULAS_LOTE_0${i},`);
}
for (let i = 1; i <= 68; i++) {
  lines.push(`  SUMULAS_STJ_LOTE_${String(i).padStart(2, "0")},`);
}
for (const pad of nvPads) {
  lines.push(`  SUMULAS_STF_NV_LOTE_${pad},`);
}
lines.push(`];`);
lines.push(``);
lines.push(
  `export const SUMULAS_ATIVAS_CURADAS = sumulasAtivasParaBase(TODOS_LOTES_SUMULAS);`
);
lines.push(``);
lines.push(`export const SUMULAS_COM_PENDENTES: SumulaLoteItem[] = [`);
lines.push(`  ...TODOS_LOTES_SUMULAS.flat(),`);
lines.push(`  SUMULA_SV_30_PENDENTE,`);
lines.push(`];`);
lines.push(``);

writeFileSync("src/lib/sumulas/index.ts", lines.join("\n"), "utf8");
console.log("rebuilt index with NV lotes", nvPads.length, "pads", nvPads[0], "-", nvPads.at(-1));
