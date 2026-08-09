/**
 * Extrai súmulas STJ 521–600 do Verbetes e gera lotes 53–60 + seed.
 */
import { readFileSync, writeFileSync } from "fs";

const VERBETES =
  "C:/Users/jefee/.cursor/projects/c-Users-jefee-Projects-facto/agent-tools/f2e0130a-e9f1-4566-bd10-6c38bdab8f1a.txt";
const raw = readFileSync(VERBETES, "utf8");

const cancelMeta = {
  528: "CANCELADA pela Terceira Seção em 23/02/2022 (Projeto de Súmula n. 1.258, DJe 24/02/2022).",
  603: "CANCELADA pela Segunda Seção em 22/08/2018 (REsp 1.555.722/SP, DJe 27/08/2018).",
};

/** Enunciado: texto antes de (SÚMULA N, ... */
const byNum = new Map();
const re = /([^\n]+?)\s*\(SÚMULA\s+(\d+)[,)]/g;
let m;
while ((m = re.exec(raw)) !== null) {
  const n = Number(m[2]);
  if (n < 521 || n > 600) continue;
  let text = m[1].trim();
  // descartar linhas de navegação/cabeçalho
  if (text.startsWith("●") || text.startsWith("###") || text.startsWith("scon.")) continue;
  if (text.includes("SÚMULA CANCELADA") || text.includes("SÚMULA REVISADA")) continue;
  byNum.set(n, text);
}

// 545 revisada (2025): enunciado novo vem sem (SÚMULA 545 no primeiro parêntese
const block545 = raw.match(
  /SÚMULA 545[\s\S]*?\n\n(A confissão do autor possibilita[\s\S]*?\.)\s*\(TERCEIRA SEÇÃO/
);
if (block545) byNum.set(545, block545[1].trim());

const missing = [];
const items = [];
for (let n = 521; n <= 600; n++) {
  if (!byNum.has(n)) missing.push(n);
  else items.push([n, byNum.get(n)]);
}
if (missing.length) {
  console.error("MISSING:", missing.join(", "));
  process.exit(1);
}

function quote(s) {
  return JSON.stringify(s);
}

for (let lote = 53; lote <= 60; lote++) {
  const start = 521 + (lote - 53) * 10;
  const end = start + 9;
  const slice = items.filter(([n]) => n >= start && n <= end);
  const canceladas = slice.filter(([n]) => cancelMeta[n]).map(([n]) => n);
  const headerNote = canceladas.length
    ? `Cancelada(s): ${canceladas.join(" e ")} (não entram no RAG ativo).`
    : "ativas — VerbetesSTJ.";
  let extra = "";
  if (start === 541)
    extra =
      "\n * Obs.: Súmula 545 usa a redação revisada em 10/09/2025 (tema 1194).";

  const body = slice
    .map(([n, text]) => {
      if (cancelMeta[n]) {
        return `  sumulaStj(\n    ${n},\n    ${quote(`${text} — ${cancelMeta[n]}`)},\n    { status: "cancelada" }\n  )`;
      }
      return `  sumulaStj(\n    ${n},\n    ${quote(text)}\n  )`;
    })
    .join(",\n");

  const pad = String(lote).padStart(2, "0");
  const content = `/**
 * STJ — Lote ${lote}: Súmulas ${start} a ${end}.
 * ${headerNote}${extra}
 */

import { sumulaStj, type SumulaLoteItem } from "@/lib/sumulas/types";

export const SUMULAS_STJ_LOTE_${pad}: SumulaLoteItem[] = [
${body},
];
`;
  writeFileSync(`src/lib/sumulas/stj-lote-${pad}.ts`, content, "utf8");
  console.log("wrote lote", lote, start, "-", end, "cancel:", canceladas.join(",") || "-");
}

const canceladasAll = Object.keys(cancelMeta)
  .map(Number)
  .filter((n) => n >= 521 && n <= 600);
const ativas = items.filter(([n]) => !cancelMeta[n]);

const seed = `/**
 * Seed STJ lotes 53–60 (Súmulas 521–600).
 * Canceladas fora do RAG: ${canceladasAll.join(", ")}.
 * Uso: node scripts/seed-sumulas-stj-lote-53-60.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 0) continue;
      const k = t.slice(0, i).trim();
      let v = t.slice(i + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {
    /* ignore */
  }
}

loadEnvLocal();

const CANCELADAS = ${JSON.stringify(canceladasAll)};

const ITEMS = ${JSON.stringify(ativas, null, 2)};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let ok = 0;
let falha = 0;
let removidas = 0;

for (const n of CANCELADAS) {
  const titulo = \`Súmula \${n} do STJ\`;
  const { data: existente } = await supabase
    .from("base_conhecimento")
    .select("id")
    .eq("titulo", titulo)
    .maybeSingle();
  if (existente?.id) {
    const { error } = await supabase
      .from("base_conhecimento")
      .delete()
      .eq("id", existente.id);
    if (error) {
      console.error("ERRO delete cancelada", titulo, error.message);
      falha++;
    } else {
      console.log("OK remove cancelada", titulo);
      removidas++;
    }
  } else {
    console.log("skip (não estava no RAG)", titulo);
  }
}

for (const [n, enunciado] of ITEMS) {
  const titulo = \`Súmula \${n} do STJ\`;
  const texto = \`Súmula \${n}/STJ (ATIVA): \${enunciado}\`;
  const { data: existente } = await supabase
    .from("base_conhecimento")
    .select("id")
    .eq("titulo", titulo)
    .maybeSingle();

  const { error } = existente?.id
    ? await supabase
        .from("base_conhecimento")
        .update({ categoria: "Súmula", texto })
        .eq("id", existente.id)
    : await supabase.from("base_conhecimento").insert({
        titulo,
        categoria: "Súmula",
        texto,
      });

  if (error) {
    console.error("ERRO", titulo, error.message);
    falha++;
  } else {
    console.log(existente?.id ? "OK update" : "OK insert", titulo);
    ok++;
  }
}

console.log(
  \`\\nConcluído: \${ok} ativas ok, \${removidas} cancelada(s) removida(s), \${falha} falha(s).\`
);
console.log("STJ lotes 53–60: 521–600. Próximo: 601–676+.");
if (falha) process.exit(1);
`;

writeFileSync("scripts/seed-sumulas-stj-lote-53-60.mjs", seed, "utf8");
console.log("wrote seed", ativas.length, "ativas");
console.log("545:", byNum.get(545)?.slice(0, 80));
console.log("528:", byNum.get(528)?.slice(0, 80));
