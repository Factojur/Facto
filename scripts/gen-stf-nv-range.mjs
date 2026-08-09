/**
 * Gera lotes STF NV a partir da lista tesesesumulas.
 * Uso: node scripts/gen-stf-nv-range.mjs <from> <to> <firstLoteNum>
 * Ex.: node scripts/gen-stf-nv-range.mjs 31 100 4
 */
import { readFileSync, writeFileSync } from "fs";

const from = Number(process.argv[2]);
const to = Number(process.argv[3]);
const firstLote = Number(process.argv[4]);
if (![from, to, firstLote].every(Number.isFinite) || from > to) {
  console.error("Uso: node scripts/gen-stf-nv-range.mjs <from> <to> <firstLote>");
  process.exit(1);
}

const SRC =
  "C:/Users/jefee/.cursor/projects/c-Users-jefee-Projects-facto/agent-tools/73a44325-be66-4f19-a64b-c10e36789913.txt";
const raw = readFileSync(SRC, "utf8");

/**
 * Fora do RAG — cruzamento tesesesumulas + DireitoHD + doutrina consolidada.
 * Só cancelamento/superação com consenso explícito (não “possível obsolescência”).
 */
const statusMeta = {
  2: {
    status: "superada",
    nota: "SUPERADA (sem eficácia pelo HC 47.663/SP; matéria hoje na Lei de Migração).",
  },
  3: {
    status: "superada",
    nota: "SUPERADA (imunidade de deputados estaduais equiparada à federal — CF/1988).",
  },
  4: { status: "cancelada", nota: "CANCELADA (Inq 104)." },
  5: {
    status: "cancelada",
    nota: "CANCELADA (RP 890 — sanção não supre vício de iniciativa).",
  },
  301: { status: "cancelada", nota: "CANCELADA." },
  394: { status: "cancelada", nota: "CANCELADA." },
  563: {
    status: "cancelada",
    nota: "CANCELADA (ADPF 357 — concurso de preferência tributária).",
  },
  584: { status: "cancelada", nota: "CANCELADA." },
  599: { status: "cancelada", nota: "CANCELADA." },
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
    .replace(/seqü/g, "sequ")
    .replace(/freqü/g, "frequ")
    .replace(/\s+/g, " ")
    .trim();
}

const byNum = new Map();
const re =
  /#### Súmula (\d+)\n\nhttps:\/\/tesesesumulas\.com\.br\/sumula\/stf\/\d+\n\n([^\n]+)/g;
let m;
while ((m = re.exec(raw)) !== null) {
  const n = Number(m[1]);
  if (n < from || n > to) continue;
  byNum.set(n, modernize(m[2]));
}

const missing = [];
for (let n = from; n <= to; n++) if (!byNum.has(n)) missing.push(n);
if (missing.length) {
  console.error("MISSING", missing.join(","));
  process.exit(1);
}

function quote(s) {
  return JSON.stringify(s);
}

const items = [];
for (let n = from; n <= to; n++) items.push([n, byNum.get(n)]);

const loteCount = Math.ceil(items.length / 10);
const lastLote = firstLote + loteCount - 1;
const lotePads = [];

for (let lote = firstLote; lote <= lastLote; lote++) {
  const offset = (lote - firstLote) * 10;
  const slice = items.slice(offset, offset + 10);
  if (!slice.length) break;
  const start = slice[0][0];
  const end = slice[slice.length - 1][0];
  const especiais = slice.filter(([n]) => statusMeta[n]).map(([n]) => n);
  const headerNote = especiais.length
    ? `Fora do RAG: ${especiais
        .map((n) => `${n} (${statusMeta[n].status})`)
        .join(", ")}.`
    : "ativas — enunciados STF não vinculantes.";

  const body = slice
    .map(([n, text]) => {
      const meta = statusMeta[n];
      if (meta) {
        return `  sumulaStf(\n    ${n},\n    ${quote(`${text} — ${meta.nota}`)},\n    { status: "${meta.status}" }\n  )`;
      }
      return `  sumulaStf(\n    ${n},\n    ${quote(text)}\n  )`;
    })
    .join(",\n");

  const pad = String(lote).padStart(2, "0");
  lotePads.push(pad);
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

const ativas = items.filter(([n]) => !statusMeta[n]);
const fora = items.filter(([n]) => statusMeta[n]).map(([n]) => n);

const seedName = `scripts/seed-sumulas-stf-nv-lote-${String(firstLote).padStart(2, "0")}-${String(lastLote).padStart(2, "0")}.mjs`;
const seed = `/**
 * Seed STF NV lotes ${firstLote}–${lastLote} (Súmulas ${from}–${to}).
 * Fora do RAG neste bloco: ${fora.join(", ") || "(nenhuma)"}.
 * Uso: node ${seedName}
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
console.log("STF NV lotes ${firstLote}–${lastLote}: ${from}–${to}.");
if (falha) process.exit(1);
`;

writeFileSync(seedName, seed, "utf8");
console.log("seed", seedName);
console.log("ativas", ativas.length, "fora", fora.join(",") || "-");
console.log("LOTES", lotePads.join(","));
