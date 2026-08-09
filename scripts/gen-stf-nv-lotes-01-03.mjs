/**
 * Extrai STF NV 1–30 da lista tesesesumulas e gera lotes + seed.
 * Uso: node scripts/gen-stf-nv-lotes-01-03.mjs
 */
import { readFileSync, writeFileSync } from "fs";

const SRC =
  "C:/Users/jefee/.cursor/projects/c-Users-jefee-Projects-facto/agent-tools/73a44325-be66-4f19-a64b-c10e36789913.txt";
const raw = readFileSync(SRC, "utf8");

/** Status especial cruzado com doutrina/portal (não só o texto do enunciado). */
const statusMeta = {
  2: {
    status: "superada",
    nota: "SUPERADA (sem eficácia pelo HC 47.663/SP; matéria hoje na Lei de Migração).",
  },
  3: {
    status: "superada",
    nota: "SUPERADA (imunidade de deputados estaduais equiparada à federal — CF/1988).",
  },
  4: {
    status: "cancelada",
    nota: "CANCELADA.",
  },
};

function modernize(t) {
  return t
    .replace(/\(Cancelada\)/gi, "")
    .replace(/\(Superada\)/gi, "")
    .replace(/exeqüível/g, "exequível")
    .replace(/aquêle/g, "aquele")
    .replace(/prêso/g, "preso")
    .replace(/fôr /g, "for ")
    .replace(/têrmo/g, "termo")
    .replace(/tôda/g, "toda")
    .replace(/êles/g, "eles")
    .replace(/\s+/g, " ")
    .trim();
}

const byNum = new Map();
const re =
  /#### Súmula (\d+)\n\nhttps:\/\/tesesesumulas\.com\.br\/sumula\/stf\/\d+\n\n([^\n]+)/g;
let m;
while ((m = re.exec(raw)) !== null) {
  const n = Number(m[1]);
  if (n < 1 || n > 30) continue;
  byNum.set(n, modernize(m[2]));
}

const missing = [];
for (let n = 1; n <= 30; n++) if (!byNum.has(n)) missing.push(n);
if (missing.length) {
  console.error("MISSING", missing.join(","));
  process.exit(1);
}

function quote(s) {
  return JSON.stringify(s);
}

for (let lote = 1; lote <= 3; lote++) {
  const start = 1 + (lote - 1) * 10;
  const end = start + 9;
  const nums = [];
  for (let n = start; n <= end; n++) nums.push(n);
  const especiais = nums.filter((n) => statusMeta[n]);
  const headerNote = especiais.length
    ? `Fora do RAG: ${especiais
        .map((n) => `${n} (${statusMeta[n].status})`)
        .join(", ")}.`
    : "ativas — enunciados STF não vinculantes.";

  const body = nums
    .map((n) => {
      const text = byNum.get(n);
      const meta = statusMeta[n];
      if (meta) {
        return `  sumulaStf(\n    ${n},\n    ${quote(`${text} — ${meta.nota}`)},\n    { status: "${meta.status}" }\n  )`;
      }
      return `  sumulaStf(\n    ${n},\n    ${quote(text)}\n  )`;
    })
    .join(",\n");

  const pad = String(lote).padStart(2, "0");
  const content = `/**
 * STF — Lote ${lote} (não vinculantes): Súmulas ${start} a ${end}.
 * ${headerNote}
 */

import { sumulaStf, type SumulaLoteItem } from "@/lib/sumulas/types";

export const SUMULAS_STF_NV_LOTE_${pad}: SumulaLoteItem[] = [
${body},
];
`;
  writeFileSync(`src/lib/sumulas/stf-nv-lote-${pad}.ts`, content, "utf8");
  console.log("wrote stf-nv-lote", pad, start, "-", end);
}

const ativas = [];
for (let n = 1; n <= 30; n++) {
  if (statusMeta[n]) continue;
  ativas.push([n, byNum.get(n)]);
}
const fora = Object.keys(statusMeta).map(Number);

const seed = `/**
 * Seed STF NV lotes 1–3 (Súmulas 1–30).
 * Fora do RAG: ${fora.join(", ")}.
 * Uso: node scripts/seed-sumulas-stf-nv-lote-01-03.mjs
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

const FORA = ${JSON.stringify(fora)};
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

for (const n of FORA) {
  const titulo = \`Súmula \${n} do STF\`;
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
      console.error("ERRO delete", titulo, error.message);
      falha++;
    } else {
      console.log("OK remove fora-RAG", titulo);
      removidas++;
    }
  } else {
    console.log("skip (não estava no RAG)", titulo);
  }
}

for (const [n, enunciado] of ITEMS) {
  const titulo = \`Súmula \${n} do STF\`;
  const texto = \`Súmula \${n}/STF (ATIVA): \${enunciado}\`;
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
  \`\\nConcluído: \${ok} ativas ok, \${removidas} removida(s), \${falha} falha(s).\`
);
console.log("STF NV lotes 1–3: 1–30. Próximo: 31–.");
if (falha) process.exit(1);
`;

writeFileSync("scripts/seed-sumulas-stf-nv-lote-01-03.mjs", seed, "utf8");
console.log("ativas", ativas.length, "fora", fora.join(","));
