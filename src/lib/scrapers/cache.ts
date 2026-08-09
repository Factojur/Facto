/**
 * Cache técnico de scrapes (Supabase).
 * Chave: tribunal + query normalizada.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import type { JulgadoScrape } from "@/lib/scrapers/types";

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
    ? (data.resultados as JulgadoScrape[])
    : [];
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
