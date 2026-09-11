/**
 * Re-seed pontual TJBA (temas 0..1) após limpeza de ementas truncadas.
 * Não avança a fila global P2b (preserva próximo TJRN).
 *
 * Uso: npx tsx scripts/repor-tjba-temas.ts
 */
import { config } from "dotenv";
import { spawnSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { metadadosJurisDoTexto } from "../src/lib/juris-metadados";
import { buscarTjbaJuris, ementaTjbaValida } from "../src/lib/scrapers/tjba";
import {
  TEMAS_TJ_P2B,
  TJ_PORTAL_ANOS,
  TJ_PORTAL_POR_TEMA,
} from "./seed-juris-tj-portal-temas";

config({ path: resolve(process.cwd(), ".env.local") });

const estadoPath = resolve(
  process.cwd(),
  "scripts/seed-juris-tj-portal-estado.json"
);

function montarTexto(
  ementa: string,
  relator?: string,
  data?: string,
  url?: string
) {
  const partes = [ementa.trim()];
  if (relator) partes.push(`Relator(a): ${relator}`);
  if (data) partes.push(`Data: ${data}`);
  if (url) partes.push(`Fonte oficial: ${url}`);
  return partes.join("\n\n");
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("env");

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const estadoAntes = readFileSync(estadoPath, "utf8");

  const temas = TEMAS_TJ_P2B.slice(0, 2);
  let inserts = 0;
  let skips = 0;
  let falhas = 0;
  let rejeitados = 0;

  for (const tema of temas) {
    console.log(`→ TJBA «${tema.q}»`);
    const r = await buscarTjbaJuris(tema.q, {
      limite: TJ_PORTAL_POR_TEMA,
      anos: TJ_PORTAL_ANOS,
    });
    if (r.erro) {
      console.error(r.erro);
      falhas++;
      continue;
    }
    console.log(`  pool live=${r.julgados.length} · ${r.aviso || "ok"}`);

    for (const j of r.julgados) {
      if (!ementaTjbaValida(j.ementa)) {
        rejeitados++;
        continue;
      }
      const titulo = j.titulo.trim();
      const texto = montarTexto(j.ementa, j.relator, j.data, j.url);
      const meta = metadadosJurisDoTexto(titulo, texto, "TJBA");

      const { data: existente } = await supabase
        .from("base_conhecimento")
        .select("id")
        .eq("titulo", titulo)
        .maybeSingle();
      if (existente?.id) {
        skips++;
        continue;
      }

      const { error } = await supabase.from("base_conhecimento").insert({
        titulo,
        categoria: "Jurisprudência" as const,
        texto,
        fonte: "tjba-portal",
        status: "validado",
        tribunal: meta.tribunal || "TJBA",
        area_tags: tema.area_tags?.length ? tema.area_tags : meta.area_tags,
      });
      if (error) {
        console.error(`  fail ${titulo}: ${error.message}`);
        falhas++;
      } else {
        inserts++;
        console.log(`  + ${titulo}`);
      }
    }
  }

  // Restaura estado da fila (não atrapalhar TJRN).
  writeFileSync(estadoPath, estadoAntes, "utf8");

  console.log(
    `\nRepor TJBA: +${inserts} · skip ${skips} · rejeitados scraper ${rejeitados} · falha ${falhas}`
  );

  if (inserts > 0) {
    console.log("Reindex paygo tj*-portal…");
    const reindex = spawnSync(
      "npx",
      ["--yes", "tsx", "scripts/reindex-embeddings.ts", "--paygo-portal-tj"],
      {
        encoding: "utf8",
        cwd: process.cwd(),
        shell: true,
        env: process.env,
        maxBuffer: 40 * 1024 * 1024,
      }
    );
    if (reindex.stdout) process.stdout.write(reindex.stdout);
    if (reindex.stderr) process.stderr.write(reindex.stderr);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
