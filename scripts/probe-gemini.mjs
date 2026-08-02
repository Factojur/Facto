/**
 * Testa a chave do .env.local contra a API nativa (sem exibir o segredo).
 */
import fs from "node:fs";
import path from "node:path";

const envPath = path.resolve(process.cwd(), ".env.local");
const raw = fs.readFileSync(envPath, "utf8");
const match = raw.match(/^\s*GEMINI_API_KEY\s*=\s*(.+)\s*$/m);
const key = (match?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
if (!key) {
  console.log(JSON.stringify({ ok: false, reason: "no_key" }));
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?pageSize=1&key=${encodeURIComponent(key)}`;
const res = await fetch(url);
const body = await res.text();
console.log(
  JSON.stringify({
    ok: res.ok,
    status: res.status,
    snippet: body.slice(0, 180).replace(key, "[REDACTED]"),
  })
);
process.exit(res.ok ? 0 : 1);
