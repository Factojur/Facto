/**
 * Seed diário (01h, PC ligado): retoma do lote em seed-juris-estado.json,
 * usa o pool inteiro de contas (paga + grátis), queima a cota até 429,
 * atualiza o próximo lote e reindexa.
 *
 * Para 7 dias antes de `vencimento` (YYYY-MM-DD). Sem vencimento, segue até LOTE_MAX.
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

type Estado = {
  proximoLote: number;
  ate: number;
  vencimento?: string | null;
};

function hojeSp(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
}

function menosDias(iso: string, dias: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - dias);
  return dt.toISOString().slice(0, 10);
}

function lerEstado(): Estado {
  try {
    const j = JSON.parse(readFileSync(estadoPath, "utf8")) as Estado;
    return {
      proximoLote: Math.max(1, Number(j.proximoLote) || 1),
      ate: Math.min(LOTE_MAX, Number(j.ate) || LOTE_MAX),
      vencimento: j.vencimento || null,
    };
  } catch {
    return { proximoLote: 84, ate: LOTE_MAX };
  }
}

function gravarEstado(e: Estado) {
  const out: Estado = {
    proximoLote: e.proximoLote,
    ate: Math.min(LOTE_MAX, e.ate),
  };
  if (e.vencimento) out.vencimento = e.vencimento;
  writeFileSync(estadoPath, `${JSON.stringify(out, null, 2)}\n`, "utf8");
}

const estado = lerEstado();
const nContas = tokensDoPool().length;
console.log(
  `[seed-diario] ${new Date().toISOString()} pool=${nContas} contas · lotes ${estado.proximoLote}–${LOTE_MAX}` +
    (estado.vencimento ? ` · vencimento ${estado.vencimento}` : " · sem vencimento (não pausa a última semana)")
);
if (!nContas) {
  console.error("Nenhuma chave JURISPRUDENCIAS_AI_API_KEY / _KEYS no .env.local");
  process.exit(1);
}
if (nContas < 7) {
  console.warn(
    `ATENÇÃO: pool com ${nContas} conta(s); o combinado é 1 paga + 6 grátis = 7. Confira KEY e KEYS no .env.local.`
  );
}

if (estado.vencimento && /^\d{4}-\d{2}-\d{2}$/.test(estado.vencimento)) {
  const corte = menosDias(estado.vencimento, 7);
  if (hojeSp() >= corte) {
    console.log(
      `Pausa da última semana: hoje ${hojeSp()} ≥ ${corte} (vencimento ${estado.vencimento} − 7 dias). Seed automático parado. Complementar pontos fracos à mão.`
    );
    process.exit(0);
  }
}

if (estado.proximoLote > LOTE_MAX) {
  console.log("Fila de lotes esgotada. Monte a próxima série ou use a última semana da assinatura.");
  process.exit(0);
}

const faixa = spawnSync(
  "npx",
  [
    "--yes",
    "tsx",
    "scripts/seed-juris-ai-faixa.ts",
    String(estado.proximoLote),
    String(LOTE_MAX),
  ],
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
