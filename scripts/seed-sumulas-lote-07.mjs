/**
 * Seed lote 7 — SV 62, 63 e 64 (fecha vinculantes publicadas).
 * Uso: node scripts/seed-sumulas-lote-07.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
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

const ITEMS = [
  [
    62,
    "É legítima a revogação da isenção estabelecida no art. 6º, II, da Lei Complementar 70/1991 pelo art. 56 da Lei 9.430/1996, dado que a LC 70/1991 é apenas formalmente complementar, mas materialmente ordinária com relação aos dispositivos concernentes à contribuição social por ela instituída.",
  ],
  [
    63,
    "O tráfico privilegiado (art. 33, § 4º, da Lei 11.343/2006) não configura crime hediondo, afastando-se a aplicação dos parâmetros mais rigorosos de progressão de regime e de livramento condicional.",
  ],
  [
    64,
    "A demonstração da intenção de transportar a substância entorpecente para outro estado da Federação autoriza a aplicação da majorante prevista no art. 40, inciso V, da Lei nº 11.343/2006, ainda que não ocorra a efetiva transposição da divisa estadual.",
  ],
];

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

for (const [n, enunciado] of ITEMS) {
  const titulo = `Súmula Vinculante ${n} do STF`;
  const texto = `Súmula Vinculante ${n}/STF (ATIVA): ${enunciado}`;
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

console.log(`\nConcluído: ${ok} ok, ${falha} falha(s).`);
console.log(
  "Vinculantes publicadas: SV 1–29 + 31–64. Pendente: SV 30 (sem publicação)."
);
if (falha) process.exit(1);
