/**
 * Seed diário (01h, PC ligado): retoma do lote em seed-juris-estado.json,
 * usa o pool inteiro de contas, para no 429, atualiza o próximo lote e reindexa.
 *
 * Uso: npm run seed:juris-diario
 */
import { spawnSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { config } from "dotenv";
import { tokensDoPool } from "../src/lib/juris-provedores/jurisprudencia-service";
import { LOTE_MAX } from "./seed-juris-termos";

config({ path: resolve(process.cwd(), ".env.local") });

const estadoPath = resolve(process.cwd(), "scripts/seed-juris-estado.json");

type Estado = { proximoLote: number; ate: number };

function lerEstado(): Estado {
  try {
    const j = JSON.parse(readFileSync(estadoPath, "utf8")) as Estado;
    return {
      proximoLote: Math.max(1, Number(j.proximoLote) || 1),
      ate: Math.min(LOTE_MAX, Number(j.ate) || LOTE_MAX),
    };
  } catch {
    return { proximoLote: 56, ate: LOTE_MAX };
  }
}

function gravarEstado(e: Estado) {
  writeFileSync(estadoPath, `${JSON.stringify(e, null, 2)}\n`, "utf8");
}

const estado = lerEstado();
const nContas = tokensDoPool().length;
console.log(
  `[seed-diario] ${new Date().toISOString()} pool=${nContas} contas · lotes ${estado.proximoLote}–${estado.ate}`
);
if (!nContas) {
  console.error("Nenhuma chave JURISPRUDENCIAS_AI_API_KEY / _KEYS no .env.local");
  process.exit(1);
}

if (estado.proximoLote > estado.ate) {
  console.log("Faixa já concluída. Ajuste scripts/seed-juris-estado.json para a próxima série.");
  process.exit(0);
}

const faixa = spawnSync(
  "npx",
  ["tsx", "scripts/seed-juris-ai-faixa.ts", String(estado.proximoLote), String(estado.ate)],
  {
    encoding: "utf8",
    cwd: process.cwd(),
    shell: true,
    env: process.env,
    maxBuffer: 40 * 1024 * 1024,
  }
);
if (faixa.stdout) process.stdout.write(faixa.stdout);
if (faixa.stderr) process.stderr.write(faixa.stderr);

const text = `${faixa.stdout ?? ""}\n${faixa.stderr ?? ""}`;
const mCota = text.match(/Cota do dia esgotou no lote (\d+)/i);
const mLote = text.match(/Cota diária esgotada/i);

if (mCota?.[1]) {
  const loteParou = Number(mCota[1]);
  gravarEstado({ ...estado, proximoLote: loteParou });
  console.log(`Estado: próximo lote ${loteParou} (cota).`);
} else if (mLote) {
  console.log("Cota esgotada sem número de lote na mensagem; estado inalterado.");
} else if (faixa.status === 0) {
  gravarEstado({ ...estado, proximoLote: estado.ate + 1 });
  console.log(`Faixa ${estado.proximoLote}–${estado.ate} ok. Estado avançado.`);
}

console.log("Reindex embeddings…");
const reindex = spawnSync("npm", ["run", "reindex:embeddings"], {
  encoding: "utf8",
  cwd: process.cwd(),
  shell: true,
  env: process.env,
  maxBuffer: 40 * 1024 * 1024,
});
if (reindex.stdout) process.stdout.write(reindex.stdout);
if (reindex.stderr) process.stderr.write(reindex.stderr);
if (reindex.status && reindex.status !== 0) {
  process.exit(reindex.status);
}
