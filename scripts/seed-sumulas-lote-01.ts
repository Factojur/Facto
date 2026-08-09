/**
 * Sobe o lote 01 de súmulas (SV 1–10 STF) em base_conhecimento.
 * Uso: npx tsx scripts/seed-sumulas-lote-01.ts
 *
 * Idempotente: se o título já existe, atualiza o texto.
 */

import { createClient } from "@supabase/supabase-js";
import { SUMULAS_LOTE_01 } from "../src/lib/sumulas/lote-01-sv-stf";
import { config } from "dotenv";
import { resolve } from "path";

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

  console.log(`Lote 01: ${SUMULAS_LOTE_01.length} súmulas (SV 1–10 STF)\n`);

  let ok = 0;
  let falha = 0;

  for (const s of SUMULAS_LOTE_01) {
    if (s.status !== "ativa") {
      console.log(`PULA (cancelada): ${s.titulo}`);
      continue;
    }
    if (s.qualidade === "revisar") {
      console.log(`PULA (qualidade revisar): ${s.titulo}`);
      continue;
    }

    const { data: existente } = await supabase
      .from("base_conhecimento")
      .select("id")
      .eq("titulo", s.titulo)
      .maybeSingle();

    if (existente?.id) {
      const { error } = await supabase
        .from("base_conhecimento")
        .update({
          categoria: s.categoria,
          texto: s.texto,
        })
        .eq("id", existente.id);
      if (error) {
        console.error(`ERRO update ${s.titulo}:`, error.message);
        falha++;
      } else {
        console.log(`OK update [${s.status}] ${s.titulo}`);
        ok++;
      }
    } else {
      const { error } = await supabase.from("base_conhecimento").insert({
        titulo: s.titulo,
        categoria: s.categoria,
        texto: s.texto,
      });
      if (error) {
        console.error(`ERRO insert ${s.titulo}:`, error.message);
        falha++;
      } else {
        console.log(`OK insert [${s.status}] ${s.titulo}`);
        ok++;
      }
    }
  }

  console.log(`\nConcluído: ${ok} ok, ${falha} falha(s).`);
  if (falha) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
