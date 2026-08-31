/**
 * Ajuda a achar a conta no AI Studio: imprime só prefixo/sufixo da key (sem segredo).
 * Uso: node scripts/identificar-gemini-key.mjs
 */
import fs from "node:fs";
import path from "node:path";

const envPath = path.resolve(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.log("Arquivo .env.local não encontrado.");
  process.exit(1);
}

const raw = fs.readFileSync(envPath, "utf8");
const match = raw.match(/^\s*GEMINI_API_KEY\s*=\s*(.+)\s*$/m);
const key = (match?.[1] ?? "").trim().replace(/^["']|["']$/g, "");

if (!key) {
  console.log("GEMINI_API_KEY vazia no .env.local");
  process.exit(1);
}

console.log("Compare no AI Studio (API keys) — a key deve terminar assim:\n");
console.log(`  …${key.slice(-8)}`);
console.log(`  (${key.length} caracteres, começa com ${key.slice(0, 3)}…)\n`);
console.log("Passos:");
console.log("1. Abra https://aistudio.google.com/apikey");
console.log("2. Troque de conta Google (canto superior direito) em cada e-mail que você usa");
console.log("3. Na lista de keys, procure a que termina com os caracteres acima");
console.log("4. Essa conta é a dona — ative Billing nela\n");

const url = `https://generativelanguage.googleapis.com/v1beta/models?pageSize=1&key=${encodeURIComponent(key)}`;
try {
  const res = await fetch(url);
  const body = await res.text();
  let billingHint = "";
  if (res.status === 429) billingHint = "Key responde, mas cota free/limite (429) — paygo na conta certa resolve.";
  else if (res.ok) billingHint = "Key responde OK — API ativa nesta key.";
  else billingHint = `API retornou HTTP ${res.status} — confira se a key não foi revogada.`;

  console.log(billingHint);
  if (!res.ok) {
    console.log(body.slice(0, 200).replace(key, "[REDACTED]"));
  }
} catch (e) {
  console.log("Não foi possível testar a API:", e instanceof Error ? e.message : e);
}
