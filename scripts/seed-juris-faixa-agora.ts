/**
 * Mesmo fluxo do seed-juris-diario (faixa → atualiza estado → reindex embeddings).
 * Uso: npm run seed:juris-faixa-agora
 *      (ou) npx tsx scripts/seed-juris-faixa-agora.ts
 */
import { spawnSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { tokensDoPool } from "../src/lib/juris-provedores/jurisprudencia-service";
import { LOTE_MAX } from "./seed-juris-termos";
import { exigirGeminiApenasSeed } from "./lib/gemini-env-seed";

exigirGeminiApenasSeed("seed-juris-faixa-agora");

const estadoPath = resolve(process.cwd(), "scripts/seed-juris-estado.json");

type Estado = {
  proximoLote: number;
  ate: number;
  vencimento?: string | null;
  nota?: string;
};

function lerEstado(): Estado {
  try {
    const j = JSON.parse(readFileSync(estadoPath, "utf8")) as Estado;
    return {
      proximoLote: Math.max(1, Number(j.proximoLote) || 1),
      ate: Math.min(LOTE_MAX, Number(j.ate) || LOTE_MAX),
      vencimento: j.vencimento || null,
      nota: j.nota,
    };
  } catch {
    return { proximoLote: 789, ate: LOTE_MAX };
  }
}

function gravarEstado(e: Estado) {
  const out: Estado = {
    proximoLote: e.proximoLote,
    ate: Math.min(LOTE_MAX, e.ate),
  };
  if (e.vencimento) out.vencimento = e.vencimento;
  if (e.nota) out.nota = e.nota;
  writeFileSync(estadoPath, `${JSON.stringify(out, null, 2)}\n`, "utf8");
}

const estado = lerEstado();
const nContas = tokensDoPool().length;
const de = estado.proximoLote;
const ate = LOTE_MAX;

console.log(
  `[seed-faixa-agora] ${new Date().toISOString()} pool=${nContas} · lotes ${de}–${ate}` +
    (estado.vencimento ? ` · vencimento ${estado.vencimento} (pausa diário ignorada)` : "")
);

if (!nContas) {
  console.error("Nenhuma chave JURISPRUDENCIAS_AI no .env.local");
  process.exit(1);
}

if (de > LOTE_MAX) {
  console.log("Fila esgotada (proximoLote > LOTE_MAX).");
  process.exit(0);
}

const faixa = spawnSync(
  "npx",
  ["--yes", "tsx", "scripts/seed-juris-ai-faixa.ts", String(de), String(ate)],
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
const faixaOk = /Faixa \d+[–-]\d+ concluída/i.test(text);

if (mCota?.[1]) {
  const loteParou = Number(mCota[1]);
  gravarEstado({ ...estado, proximoLote: loteParou, ate: LOTE_MAX });
  console.log(`Estado: próximo lote ${loteParou} (cota).`);
} else if (faixaOk && faixa.status === 0) {
  gravarEstado({ ...estado, proximoLote: LOTE_MAX + 1, ate: LOTE_MAX });
  console.log(`Faixa até ${LOTE_MAX} ok.`);
} else if (faixa.status === 0) {
  gravarEstado({ ...estado, proximoLote: LOTE_MAX + 1, ate: LOTE_MAX });
  console.log("Estado avançado.");
}

console.log("Reindex embeddings (mesmo padrão do diário)…");
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
