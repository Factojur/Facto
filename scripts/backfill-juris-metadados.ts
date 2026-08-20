/**
 * Preenche tribunal + area_tags em linhas antigas da base_conhecimento.
 * Uso: npx tsx scripts/backfill-juris-metadados.ts
 * Requer migration-base-tribunal-area.sql no Supabase.
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import { metadadosJurisDoTexto } from "../src/lib/juris-metadados";

config({ path: resolve(process.cwd(), ".env.local") });

const BATCH = 80;

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key);
  let offset = 0;
  let atualizados = 0;
  let lidos = 0;

  for (;;) {
    const { data, error } = await supabase
      .from("base_conhecimento")
      .select("id, titulo, texto, tribunal")
      .eq("categoria", "Jurisprudência")
      .is("tribunal", null)
      .range(offset, offset + BATCH - 1);

    if (error) {
      console.error(error.message);
      process.exit(1);
    }
    if (!data?.length) break;

    lidos += data.length;
    for (const row of data) {
      const meta = metadadosJurisDoTexto(row.titulo ?? "", row.texto ?? "");
      const { error: updErr } = await supabase
        .from("base_conhecimento")
        .update({
          tribunal: meta.tribunal,
          area_tags: meta.area_tags,
        })
        .eq("id", row.id);
      if (!updErr) atualizados += 1;
    }

    console.log(`… lidos ${lidos}, atualizados ${atualizados}`);
    if (data.length < BATCH) break;
    offset += BATCH;
  }

  console.log(`OK — ${atualizados} linhas com tribunal/area_tags.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
