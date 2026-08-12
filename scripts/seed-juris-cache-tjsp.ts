/**
 * Promove julgados do cache TJSP (juris_scrape_cache) → base_conhecimento.
 * Meta: ~10 ementas por tema JEC já aquecido (sem worker / sem Gemini scrape).
 *
 * Idempotente por título (`TJSP — {numeroProcesso}` ou título truncado).
 * Depois: npm run reindex:embeddings
 *
 * Uso: npm run seed:juris-cache-tjsp
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import type { JulgadoScrape } from "../src/lib/scrapers/types";
import { ementaPareceLixo } from "../src/lib/scrapers/validar-ementa";

config({ path: resolve(process.cwd(), ".env.local") });

const POR_TEMA = Math.max(
  1,
  Number(process.env.SEED_JURIS_POR_TEMA ?? 10) || 10
);

function tituloItem(j: JulgadoScrape): string {
  const n = j.numeroProcesso?.trim();
  if (n) return `TJSP — ${n}`;
  // Sem número CNJ: usa hash curto da ementa (evita colapsar tudo em "julgado")
  const base = (j.ementa || j.titulo || "").trim().slice(0, 80);
  return `TJSP — ${base}`;
}

function textoItem(j: JulgadoScrape): string {
  const partes = [j.ementa.trim()];
  if (j.relator) partes.push(`Relator(a): ${j.relator}`);
  if (j.data) partes.push(`Data: ${j.data}`);
  if (j.url) partes.push(`Fonte oficial: ${j.url}`);
  if (j.titulo?.trim() && j.titulo.trim() !== j.ementa.trim().slice(0, 80)) {
    partes.unshift(j.titulo.trim());
  }
  return partes.filter(Boolean).join("\n\n");
}

function qualidade(j: JulgadoScrape): number {
  const len = (j.ementa || "").trim().length;
  const score = typeof j.scoreAfinidade === "number" ? j.scoreAfinidade : 0;
  const temNum = j.numeroProcesso?.trim() ? 50 : 0;
  return len + score * 10 + temNum;
}

function selecionarTop(
  julgados: JulgadoScrape[],
  n: number
): JulgadoScrape[] {
  const vistos = new Set<string>();
  const ordenados = [...julgados]
    .filter((j) => !ementaPareceLixo(j.ementa || ""))
    .sort((a, b) => qualidade(b) - qualidade(a));

  const out: JulgadoScrape[] = [];
  for (const j of ordenados) {
    const chave =
      j.numeroProcesso?.replace(/\D/g, "") ||
      j.ementa.trim().slice(0, 120).toLowerCase();
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    out.push(j);
    if (out.length >= n) break;
  }
  return out;
}

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

  const { data: rows, error } = await supabase
    .from("juris_scrape_cache")
    .select("id, tribunal, query_norm, resultados, criado_em")
    .eq("tribunal", "TJSP")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao ler cache:", error.message);
    process.exit(1);
  }

  if (!rows?.length) {
    console.error(
      "Cache TJSP vazio. Rode antes: npm run aquecer:cache-tjsp"
    );
    process.exit(1);
  }

  console.log(
    `Cache TJSP: ${rows.length} tema(s). Meta: ${POR_TEMA} julgados/tema → base_conhecimento\n`
  );

  let inseridos = 0;
  let pulados = 0;
  let falhas = 0;
  const idsNovos: string[] = [];

  for (const row of rows) {
    const pool = Array.isArray(row.resultados)
      ? (row.resultados as JulgadoScrape[])
      : [];
    const top = selecionarTop(pool, POR_TEMA);
    console.log(
      `▸ ${String(row.query_norm).slice(0, 70)}… pool=${pool.length} → seed=${top.length}`
    );

    for (const j of top) {
      const titulo = tituloItem(j);
      const texto = textoItem(j);
      if (texto.length < 80) {
        pulados++;
        continue;
      }

      const { data: existente } = await supabase
        .from("base_conhecimento")
        .select("id")
        .eq("titulo", titulo)
        .maybeSingle();

      if (existente?.id) {
        // Não sobrescreve item já cadastrado.
        pulados++;
        continue;
      }

      const { data: inserido, error: insErr } = await supabase
        .from("base_conhecimento")
        .insert({
          titulo,
          categoria: "Jurisprudência",
          texto,
          fonte: "tjsp_scraper",
          status: "validado",
        })
        .select("id")
        .single();

      if (insErr) {
        console.error(`  ERRO insert ${titulo}:`, insErr.message);
        falhas++;
      } else {
        inseridos++;
        if (inserido?.id) idsNovos.push(inserido.id);
        console.log(`  insert ${titulo}`);
      }
    }
  }

  console.log(
    `\nConcluído: ${inseridos} insert, ${pulados} pulados (já existiam), ${falhas} falha(s).`
  );
  console.log(
    `Próximo: npm run reindex:embeddings  (novos sem vetor: ~${idsNovos.length})`
  );
  if (falhas) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
