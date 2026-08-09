/**
 * Afinidade caso ↔ ementa: ranqueia o pool do tribunal e devolve os melhores
 * para aquele caso específico (não os N primeiros da página).
 */

import type { JulgadoScrape } from "@/lib/scrapers/types";

const STOPWORDS = new Set([
  "para",
  "pela",
  "pelo",
  "pelos",
  "pelas",
  "uma",
  "umas",
  "uns",
  "com",
  "sem",
  "sob",
  "sobre",
  "entre",
  "quando",
  "onde",
  "como",
  "mais",
  "menos",
  "muito",
  "muitos",
  "apos",
  "antes",
  "depois",
  "este",
  "esta",
  "estes",
  "estas",
  "esse",
  "essa",
  "isso",
  "aquele",
  "aquela",
  "dele",
  "dela",
  "seu",
  "sua",
  "seus",
  "suas",
  "que",
  "qual",
  "quais",
  "foi",
  "ser",
  "ter",
  "nao",
  "sim",
  "tambem",
  "ainda",
  "assim",
  "apenas",
  "sendo",
  "tendo",
  "pode",
  "deve",
  "caso",
  "parte",
  "autor",
  "reu",
  "réu",
  "processo",
  "acao",
  "ação",
  "juizo",
  "juízo",
  "vara",
  "tribunal",
  "acordao",
  "acórdão",
  "ementa",
  "relator",
  "julgamento",
  "recurso",
  "apelacao",
  "apelação",
]);

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

/** Extrai palavras-chave discriminantes do caso (fatos + tipo de ação). */
export function extrairPalavrasChaveCaso(query: string): string[] {
  const bruto = normalizar(query);
  const palavras = bruto
    .split(/[^a-z0-9]+/)
    .filter((p) => p.length >= 4 && !STOPWORDS.has(p));

  // Bigramas leves (ex.: "dano moral") — aumentam afinidade temática
  const bigramas: string[] = [];
  for (let i = 0; i < palavras.length - 1; i++) {
    const a = palavras[i]!;
    const b = palavras[i + 1]!;
    if (a.length >= 4 && b.length >= 4) {
      bigramas.push(`${a} ${b}`);
    }
  }

  const freq = new Map<string, number>();
  for (const p of palavras) freq.set(p, (freq.get(p) ?? 0) + 1);
  const unicos = [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .map(([p]) => p);

  const out: string[] = [];
  const vistos = new Set<string>();
  for (const b of bigramas.slice(0, 8)) {
    if (vistos.has(b)) continue;
    vistos.add(b);
    out.push(b);
  }
  for (const p of unicos) {
    if (out.length >= 28) break;
    if (vistos.has(p)) continue;
    vistos.add(p);
    out.push(p);
  }
  return out;
}

/**
 * Monta termo de busca para o tribunal a partir das palavras-chave do caso
 * (não um recorte cego do texto inteiro).
 */
export function termoBuscaAPartirDoCaso(query: string): string {
  const kws = extrairPalavrasChaveCaso(query);
  if (!kws.length) {
    return query.replace(/\s+/g, " ").trim().slice(0, 180);
  }
  // Mistura bigramas + unigramas mais longos
  const partes: string[] = [];
  for (const k of kws) {
    if (partes.join(" ").length > 160) break;
    partes.push(k);
  }
  return partes.join(" ").slice(0, 180);
}

function hashEstavel(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type JulgadoRanqueado = JulgadoScrape & {
  scoreAfinidade: number;
};

/** Pontua ementa/título contra as palavras-chave do caso. */
export function pontuarAfinidade(
  julgado: JulgadoScrape,
  palavrasChave: string[]
): number {
  if (!palavrasChave.length) return 0;
  const texto = normalizar(`${julgado.titulo}\n${julgado.ementa}`);
  let score = 0;

  for (const kw of palavrasChave) {
    const k = normalizar(kw);
    if (k.length < 4) continue;
    if (!texto.includes(k)) continue;

    // Bigramas valem mais; palavras longas também
    const peso = k.includes(" ") ? 3.2 : Math.min(2.4, 1 + k.length / 10);
    // Contagem limitada (evita ementa que só repete uma palavra)
    const ocorrencias = texto.split(k).length - 1;
    score += peso * Math.min(ocorrencias, 3);
  }

  // Cobertura: % das keywords presentes
  let hits = 0;
  for (const kw of palavrasChave) {
    if (texto.includes(normalizar(kw))) hits++;
  }
  const cobertura = hits / palavrasChave.length;
  score += cobertura * 8;

  // Ementas muito curtas perdem um pouco
  if (julgado.ementa.length < 120) score *= 0.7;

  return Math.round(score * 100) / 100;
}

/**
 * Seleciona os `topN` julgados com maior afinidade ao caso.
 * Empates próximos: desempate estável por hash(caso+processo) para variar
 * entre casos sem sorteio aleatório a cada refresh do mesmo caso.
 */
export function selecionarTopPorAfinidade(
  queryCaso: string,
  pool: JulgadoScrape[],
  topN: number
): JulgadoRanqueado[] {
  const palavras = extrairPalavrasChaveCaso(queryCaso);
  if (!pool.length) return [];

  const ranqueados: JulgadoRanqueado[] = pool.map((j) => ({
    ...j,
    scoreAfinidade: pontuarAfinidade(j, palavras),
  }));

  ranqueados.sort((a, b) => {
    const diff = b.scoreAfinidade - a.scoreAfinidade;
    // Diferença relevante de afinidade manda
    if (Math.abs(diff) > 0.35) return diff;
    // Empate próximo: variação determinística por caso + julgado
    const chaveA = `${normalizar(queryCaso)}|${a.numeroProcesso ?? a.titulo}|${a.url ?? ""}`;
    const chaveB = `${normalizar(queryCaso)}|${b.numeroProcesso ?? b.titulo}|${b.url ?? ""}`;
    return hashEstavel(chaveA) - hashEstavel(chaveB);
  });

  // Garante diversidade mínima: evita 5 ementas quase idênticas
  const escolhidos: JulgadoRanqueado[] = [];
  const ementasVistas = new Set<string>();

  for (const j of ranqueados) {
    if (escolhidos.length >= topN) break;
    const assinatura = normalizar(j.ementa).slice(0, 120);
    if (ementasVistas.has(assinatura)) continue;
    // Se score zero e já temos algum com score>0, pula puro ruído
    if (
      j.scoreAfinidade <= 0 &&
      escolhidos.some((e) => e.scoreAfinidade > 0) &&
      escolhidos.length >= Math.min(2, topN)
    ) {
      continue;
    }
    ementasVistas.add(assinatura);
    escolhidos.push(j);
  }

  // Se filtro ficou curto, completa com os demais do ranking
  if (escolhidos.length < topN) {
    for (const j of ranqueados) {
      if (escolhidos.length >= topN) break;
      if (escolhidos.some((e) => e.titulo === j.titulo && e.ementa === j.ementa)) {
        continue;
      }
      escolhidos.push(j);
    }
  }

  return escolhidos.slice(0, topN);
}
