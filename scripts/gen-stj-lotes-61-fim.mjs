/**
 * Extrai súmulas STJ 601–676 do Verbetes e gera lotes 61–fim + seed.
 * A partir da 655 o PDF/markdown omite "(SÚMULA N," no enunciado.
 * Uso: node scripts/gen-stj-lotes-61-fim.mjs
 */
import { readFileSync, writeFileSync } from "fs";

const VERBETES =
  "C:/Users/jefee/.cursor/projects/c-Users-jefee-Projects-facto/agent-tools/f2e0130a-e9f1-4566-bd10-6c38bdab8f1a.txt";
const raw = readFileSync(VERBETES, "utf8");

const cancelMeta = {
  603: "CANCELADA pela Segunda Seção em 22/08/2018 (REsp 1.555.722/SP, DJe 27/08/2018).",
};

const byNum = new Map();

// Formato clássico: enunciado (SÚMULA N, ...)
const reClassic = /([^\n]+?)\s*\(SÚMULA\s+(\d+)[,)]/g;
let m;
while ((m = reClassic.exec(raw)) !== null) {
  const n = Number(m[2]);
  if (n < 601) continue;
  let text = m[1].trim();
  if (text.startsWith("●") || text.startsWith("###") || text.startsWith("scon.")) continue;
  if (text.includes("SÚMULA CANCELADA") || text.includes("SÚMULA REVISADA")) continue;
  text = text.replace(/^.*?VEJA MAIS\s*/i, "").trim();
  byNum.set(n, text);
}

// 630 revisada
const block630 = raw.match(
  /SÚMULA 630[\s\S]*?\n\n(A incidência da atenuante da confissão espontânea[\s\S]*?\.)\s*\(TERCEIRA SEÇÃO,\s*julgado em 10\/9\/2025/
);
if (block630) byNum.set(630, block630[1].trim());

// Formato novo (655+): ### ● SÚMULA N ... \n\n enunciado (ÓRGÃO, julgado...
const reNew =
  /###\s*●\s*SÚMULA\s+(\d+)[^\n]*\n\n([^\n]+?)\s*\((?:PRIMEIRA|SEGUNDA|TERCEIRA|CORTE)[^)]+\)/g;
while ((m = reNew.exec(raw)) !== null) {
  const n = Number(m[1]);
  if (n < 655) continue;
  byNum.set(n, m[2].trim());
}

// Enunciados "órfãos" entre headers (658, 665, 672)
const orphans = [
  [
    658,
    "O crime de apropriação indébita tributária pode ocorrer tanto em operações próprias, como em razão de substituição tributária.",
  ],
  [
    665,
    "O controle jurisdicional do processo administrativo disciplinar restringe-se ao exame da regularidade do procedimento e da legalidade do ato, à luz dos princípios do contraditório, da ampla defesa e do devido processo legal, não sendo possível incursão no mérito administrativo, ressalvadas as hipóteses de flagrante ilegalidade, teratologia ou manifesta desproporcionalidade da sanção aplicada.",
  ],
  [
    672,
    "A alteração da capitulação legal da conduta do servidor, por si só, não enseja a nulidade do processo administrativo disciplinar.",
  ],
];
for (const [n, t] of orphans) byNum.set(n, t);

const max = 676;
const missing = [];
const items = [];
for (let n = 601; n <= max; n++) {
  if (!byNum.has(n)) missing.push(n);
  else items.push([n, byNum.get(n)]);
}
console.log("range 601-", max, "found", items.length, "missing", missing.join(",") || "-");
if (missing.length) {
  console.error("Ainda faltam números — abortando.");
  process.exit(1);
}

function quote(s) {
  return JSON.stringify(s);
}

const firstLote = 61;
const loteCount = Math.ceil(items.length / 10);
const lastLote = firstLote + loteCount - 1;

for (let lote = firstLote; lote <= lastLote; lote++) {
  const offset = (lote - firstLote) * 10;
  const slice = items.slice(offset, offset + 10);
  if (!slice.length) break;
  const start = slice[0][0];
  const end = slice[slice.length - 1][0];
  const canceladas = slice.filter(([n]) => cancelMeta[n]).map(([n]) => n);
  const headerNote = canceladas.length
    ? `Cancelada(s): ${canceladas.join(" e ")} (não entram no RAG ativo).`
    : "ativas — VerbetesSTJ.";
  let extra = "";
  if (slice.some(([n]) => n === 630))
    extra =
      "\n * Obs.: Súmula 630 usa a redação revisada em 10/09/2025 (tema 1194).";

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
  console.log("wrote lote", lote, start, "-", end, "n=", slice.length, "cancel:", canceladas.join(",") || "-");
}

const canceladasAll = [603];
const ativas = items.filter(([n]) => !cancelMeta[n]);

const seed = `/**
 * Seed STJ lotes ${firstLote}–${lastLote} (Súmulas 601–${max}).
 * Canceladas fora do RAG: 603.
 * Uso: node scripts/seed-sumulas-stj-lote-61-fim.mjs
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
console.log("STJ lotes ${firstLote}–${lastLote}: 601–${max}. Feed STJ (Verbetes atual) completo.");
if (falha) process.exit(1);
`;

writeFileSync("scripts/seed-sumulas-stj-lote-61-fim.mjs", seed, "utf8");
writeFileSync(
  "scripts/_stj-61-fim-meta.json",
  JSON.stringify({ firstLote, lastLote, max, count: items.length }, null, 2)
);
console.log("wrote seed", ativas.length, "ativas; lotes", firstLote, "-", lastLote);
