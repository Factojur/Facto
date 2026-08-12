/**
 * Valida ementa de scrape (TJSP e-SAJ) — fonte única para scraper, cache e seeds.
 * Rejeita chrome da página, CSS vazado e “ementa” sem CNJ.
 */

import type { JulgadoScrape } from "@/lib/scrapers/types";

const CNJ =
  /\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/;

const LIXO =
  /esajCelula|escolhaBeta|suportesistemastjsp|Identificar-se|Peticionamento Eletr|downloadEmenta|ementaClass|\{[\s\S]*position:\s*relative/i;

export function ementaPareceLixo(texto: string): boolean {
  const t = (texto || "").trim();
  if (t.length < 100) return true;
  if (/<[a-z][\s\S]*>/i.test(t)) return true;
  if (LIXO.test(t)) return true;
  return false;
}

export function julgadoScrapeValido(j: Pick<JulgadoScrape, "ementa" | "numeroProcesso" | "titulo">): boolean {
  const cnj =
    j.numeroProcesso?.match(CNJ)?.[0] ||
    j.titulo?.match(CNJ)?.[0] ||
    null;
  if (!cnj) return false;
  if (ementaPareceLixo(j.ementa || "")) return false;
  return true;
}

export function filtrarJulgadosScrape<T extends Pick<JulgadoScrape, "ementa" | "numeroProcesso" | "titulo">>(
  itens: T[]
): T[] {
  return itens.filter(julgadoScrapeValido);
}
