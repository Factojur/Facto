/**
 * Verifica se GEMINI_API_KEY está carregável (sem imprimir o segredo).
 * Uso: node scripts/check-gemini-env.mjs
 */
import fs from "node:fs";
import path from "node:path";

const envPath = path.resolve(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.log(JSON.stringify({ ok: false, reason: "missing_.env.local" }));
  process.exit(1);
}

const raw = fs.readFileSync(envPath, "utf8");
const match = raw.match(/^\s*GEMINI_API_KEY\s*=\s*(.+)\s*$/m);
const value = (match?.[1] ?? "").trim().replace(/^["']|["']$/g, "");

if (!value) {
  console.log(JSON.stringify({ ok: false, reason: "empty_key" }));
  process.exit(1);
}

const prefix = value.slice(0, 3);
console.log(
  JSON.stringify({
    ok: true,
    length: value.length,
    prefix,
    note:
      prefix === "AQ."
        ? "Auth key (formato novo do AI Studio) — ok com ?key= nativo"
        : prefix === "AIz"
          ? "Standard key (AIza...) — ok"
          : "formato inesperado — confira no AI Studio",
  })
);
