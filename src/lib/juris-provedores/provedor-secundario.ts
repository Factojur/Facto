/**
 * Provedor secundário (3–5 julgados por busca).
 * Ordem: scrape TJSP (cache ou live) → completa com base FACTO se faltar.
 */

import { buscarConhecimentoRelacionado } from "@/lib/base-conhecimento";
import type { PrecedenteInterno } from "@/lib/juris-provedores/jurisprudencia-service";
import { buscarTjsp } from "@/lib/scrapers/tjsp";
import { MAX_RESULTADOS_SCRAPE } from "@/lib/scrapers/types";

const MIN = 3;
const MAX = 5;

export type ResultadoProvedorSecundario = {
  precedentes: PrecedenteInterno[];
  /** true se precisou completar/usar só a base FACTO. */
  usandoFallbackLocal: boolean;
  aviso?: string;
  fonteTjsp?: "cache" | "live" | "off" | "erro";
};

function deScrape(j: {
  titulo: string;
  ementa: string;
  tribunal: string;
  data?: string;
  url?: string;
  numeroProcesso?: string;
  relator?: string;
}): PrecedenteInterno {
  return {
    origem: "tribunal_scraper",
    tribunal: j.tribunal,
    titulo: j.titulo,
    ementa: j.ementa,
    data: j.data,
    url: j.url,
    numeroProcesso: j.numeroProcesso,
    relator: j.relator,
    tipo: "acordao",
  };
}

async function fallbackBaseFacto(
  query: string,
  excluirTitulos: Set<string>,
  faltam: number
): Promise<PrecedenteInterno[]> {
  if (faltam <= 0) return [];
  const trechos = await buscarConhecimentoRelacionado(query, 12, query);
  const out: PrecedenteInterno[] = [];
  const vistos = new Set(excluirTitulos);

  for (const t of trechos) {
    if (out.length >= faltam) break;
    const cat = t.categoria.toLowerCase();
    if (!(cat.includes("juris") || cat.includes("jurisprud"))) continue;
    if (cat.includes("súmula") || cat.includes("sumula")) continue;
    const key = t.titulo.toLowerCase().trim();
    if (vistos.has(key)) continue;
    vistos.add(key);
    out.push({
      origem: "base_conhecimento",
      tribunal: "Base FACTO",
      titulo: t.titulo,
      ementa: t.texto,
      tipo: "acordao",
    });
  }
  return out;
}

export async function buscarJulgadosProvedorSecundario(
  query: string,
  excluirTitulos?: Set<string>
): Promise<ResultadoProvedorSecundario> {
  const q = query.trim();
  if (q.length < 4) {
    return { precedentes: [], usandoFallbackLocal: true };
  }

  const excluir = excluirTitulos ?? new Set<string>();
  const out: PrecedenteInterno[] = [];
  let usandoFallbackLocal = false;
  let aviso: string | undefined;
  let fonteTjsp: ResultadoProvedorSecundario["fonteTjsp"] = "off";

  try {
    const scrape = await buscarTjsp(q);
    if (scrape.doCache) fonteTjsp = "cache";
    else if (scrape.julgados.length) fonteTjsp = "live";
    else if (scrape.erro) fonteTjsp = "erro";
    else fonteTjsp = scrape.aviso?.includes("desligado") ? "off" : "erro";

    if (scrape.aviso) aviso = scrape.aviso;
    if (scrape.erro) aviso = scrape.erro;

    for (const j of scrape.julgados) {
      if (out.length >= MAX) break;
      const key = j.titulo.toLowerCase().trim();
      if (excluir.has(key)) continue;
      excluir.add(key);
      out.push(deScrape(j));
    }
  } catch (e) {
    fonteTjsp = "erro";
    aviso =
      e instanceof Error
        ? `Scraper TJSP indisponível: ${e.message.slice(0, 120)}`
        : "Scraper TJSP indisponível.";
  }

  if (out.length < MIN) {
    usandoFallbackLocal = true;
    const extra = await fallbackBaseFacto(q, excluir, MAX - out.length);
    out.push(...extra);
  }

  return {
    precedentes: out.slice(0, Math.max(MAX, MAX_RESULTADOS_SCRAPE)),
    usandoFallbackLocal,
    aviso,
    fonteTjsp,
  };
}

export { MIN as PROVEDOR_SECUNDARIO_MIN, MAX as PROVEDOR_SECUNDARIO_MAX };
