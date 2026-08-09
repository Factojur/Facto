/**
 * Seed STJ lote 12 (Súmulas 111–120).
 * Uso: node scripts/seed-sumulas-stj-lote-12.mjs
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
  [111, "Os honorários advocatícios, nas ações previdenciárias, não incidem sobre as prestações vencidas após a sentença."],
  [112, "O depósito somente suspende a exigibilidade do crédito tributário se for integral e em dinheiro."],
  [113, "Os juros compensatórios, na desapropriação direta, incidem a partir da imissão na posse, calculados sobre o valor da indenização, corrigido monetariamente."],
  [114, "Os juros compensatórios, na desapropriação indireta, incidem a partir da ocupação, calculados sobre o valor da indenização, corrigido monetariamente."],
  [115, "Na instância especial é inexistente recurso interposto por advogado sem procuração nos autos."],
  [116, "A Fazenda Pública e o Ministério Público têm prazo em dobro para interpor agravo regimental no Superior Tribunal de Justiça."],
  [117, "A inobservância do prazo de 48 horas, entre a publicação de pauta e o julgamento sem a presença das partes, acarreta nulidade."],
  [118, "O agravo de instrumento é o recurso cabível da decisão que homologa a atualização do cálculo da liquidação."],
  [119, "A ação de desapropriação indireta prescreve em vinte anos."],
  [120, "O oficial de farmácia, inscrito no Conselho Regional de Farmácia, pode ser responsável técnico por drogaria."],
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
  const titulo = `Súmula ${n} do STJ`;
  const texto = `Súmula ${n}/STJ (ATIVA): ${enunciado}`;
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
console.log("STJ lote 12: Súmulas 111–120. Próximo: 121–130.");
if (falha) process.exit(1);
