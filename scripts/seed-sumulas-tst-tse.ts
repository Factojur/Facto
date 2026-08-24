/**
 * Sobe súmulas TST + TSE ativas em base_conhecimento (categoria Súmula).
 * Uso: npx tsx scripts/seed-sumulas-tst-tse.ts
 *
 * Idempotente por título. Não mistura com Jurisprudência.
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import { SUMULAS_ATIVAS_CURADAS } from "../src/lib/sumulas";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const alvo = SUMULAS_ATIVAS_CURADAS.filter(
    (s) =>
      s.titulo.includes(" do TST") ||
      s.titulo.includes(" do TSE") ||
      s.texto.includes("/TST (") ||
      s.texto.includes("/TSE (")
  );

  console.log(
    `Súmulas ativas TST/TSE para seed: ${alvo.length} (de ${SUMULAS_ATIVAS_CURADAS.length} ativas totais)\n`
  );

  let ok = 0;
  let falha = 0;

  for (const s of alvo) {
    const { data: existente } = await supabase
      .from("base_conhecimento")
      .select("id")
      .eq("titulo", s.titulo)
      .maybeSingle();

    if (existente?.id) {
      const { error } = await supabase
        .from("base_conhecimento")
        .update({
          categoria: "Súmula",
          texto: s.texto,
        })
        .eq("id", existente.id);
      if (error) {
        console.error(`ERRO update ${s.titulo}:`, error.message);
        falha++;
      } else {
        console.log(`OK update ${s.titulo}`);
        ok++;
      }
    } else {
      const { error } = await supabase.from("base_conhecimento").insert({
        titulo: s.titulo,
        categoria: "Súmula",
        texto: s.texto,
      });
      if (error) {
        console.error(`ERRO insert ${s.titulo}:`, error.message);
        falha++;
      } else {
        console.log(`OK insert ${s.titulo}`);
        ok++;
      }
    }
  }

  console.log(`\nConcluído: ${ok} ok, ${falha} falha(s).`);
  console.log("Depois: npm run reindex:embeddings (quando a cota Gemini permitir).");
  if (falha) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
