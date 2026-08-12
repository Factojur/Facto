/**
 * Cache técnico de scrapes (Supabase).
 * Chave: tribunal + query normalizada.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import type { JulgadoScrape } from "@/lib/scrapers/types";
import { filtrarJulgadosScrape } from "@/lib/scrapers/validar-ementa";

/** TTL do cache em dias — após isso, re-scrape. */
const TTL_DIAS = 14;

export function normalizarQueryScrape(query: string): string {
  return query
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 400);
}

export async function lerCacheScrape(
  tribunal: string,
  query: string
): Promise<{ id: string; julgados: JulgadoScrape[] } | null> {
  const admin = createAdminClient();
  const queryNorm = normalizarQueryScrape(query);
  const { data, error } = await admin
    .from("juris_scrape_cache")
    .select("id, resultados, criado_em")
    .eq("tribunal", tribunal)
    .eq("query_norm", queryNorm)
    .maybeSingle();

  if (error || !data) return null;

  const criado = new Date(data.criado_em).getTime();
  const idadeDias = (Date.now() - criado) / (1000 * 60 * 60 * 24);
  if (idadeDias > TTL_DIAS) return null;

  const julgados = Array.isArray(data.resultados)
    ? filtrarJulgadosScrape(data.resultados as JulgadoScrape[])
    : [];
  if (!julgados.length) return null;
  return { id: data.id, julgados };
}

export async function gravarCacheScrape(
  tribunal: string,
  query: string,
  julgados: JulgadoScrape[]
): Promise<string | undefined> {
  const admin = createAdminClient();
  const queryNorm = normalizarQueryScrape(query);
  const { data, error } = await admin
    .from("juris_scrape_cache")
    .upsert(
      {
        tribunal,
        query_norm: queryNorm,
        resultados: julgados,
        criado_em: new Date().toISOString(),
      },
      { onConflict: "tribunal,query_norm" }
    )
    .select("id")
    .single();

  if (error) {
    console.error("[juris_scrape_cache]", error.message);
    return undefined;
  }
  return data?.id;
}

/** Remove ementas-lixo já gravadas no cache (não toca base_conhecimento). */
export async function limparLixoCacheScrape(
  tribunal = "TJSP"
): Promise<{ linhas: number; removidos: number }> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("juris_scrape_cache")
    .select("id, tribunal, query_norm, resultados")
    .eq("tribunal", tribunal);

  if (error) {
    console.error("[limparLixoCacheScrape]", error.message);
    return { linhas: 0, removidos: 0 };
  }

  let linhas = 0;
  let removidos = 0;
  for (const row of data ?? []) {
    const bruto = Array.isArray(row.resultados)
      ? (row.resultados as JulgadoScrape[])
      : [];
    const limpos = filtrarJulgadosScrape(bruto);
    const n = bruto.length - limpos.length;
    if (n <= 0) continue;
    removidos += n;
    linhas++;
    if (limpos.length) {
      await admin
        .from("juris_scrape_cache")
        .update({ resultados: limpos })
        .eq("id", row.id);
    } else {
      await admin.from("juris_scrape_cache").delete().eq("id", row.id);
    }
  }
  return { linhas, removidos };
}
