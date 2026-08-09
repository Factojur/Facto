/**
 * Seed STJ lote 10 (Súmulas 91–100).
 * Canceladas 91 e 94: não entram em base_conhecimento.
 * Uso: node scripts/seed-sumulas-stj-lote-10.mjs
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

/** Só ativas — 91 e 94 canceladas ficam só no código TS (fora do RAG). */
const ITEMS = [
  [92, "A terceiro de boa-fé não é oponível a alienação fiduciária não anotada no certificado de registro do veículo automotor."],
  [93, "A legislação sobre cédulas de crédito rural, comercial e industrial admite o pacto de capitalização de juros."],
  [95, "A redução da alíquota do imposto sobre produtos industrializados ou do imposto de importação não implica redução do ICMS."],
  [96, "O crime de extorsão consuma-se independentemente da obtenção da vantagem indevida."],
  [97, "Compete à Justiça do Trabalho processar e julgar reclamação de servidor público relativamente a vantagens trabalhistas anteriores à instituição do regime jurídico único."],
  [98, "Embargos de declaração manifestados com notório propósito de prequestionamento não têm caráter protelatório."],
  [99, "O Ministério Público tem legitimidade para recorrer no processo em que oficiou como fiscal da lei, ainda que não haja recurso da parte."],
  [100, "É devido o adicional ao frete para renovação da marinha mercante na importação sob o regime de benefícios fiscais à exportação (BEFIEX)."],
];

const CANCELADAS = [91, 94];

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
  const titulo = `Súmula ${n} do STJ`;
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

console.log(
  `\nConcluído: ${ok} ativas ok, ${removidas} cancelada(s) removida(s), ${falha} falha(s).`
);
console.log("STJ lote 10: 91–100 (91 e 94 fora do RAG). Próximo: 101–110.");
if (falha) process.exit(1);
