/**
 * RAG direcionado por subtópico do plano estratégico.
 * Reusa hits já recuperados antes de gastar embedding extra.
 */

import {
  buscarConhecimentoRelacionado,
  type TrechoConhecimento,
} from "@/lib/base-conhecimento";
import type { TopicoPlanejado } from "@/lib/ia/plano-topicos-peca";

function chaveItem(i: TrechoConhecimento): string {
  return `${i.categoria}|${i.titulo}|${i.texto.slice(0, 80)}`;
}

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function palavras(texto: string, min = 5): string[] {
  return norm(texto)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= min);
}

/** Score local 0–1: título/encaixe/lastro × trecho da base. */
export function scoreTrechoVsTopico(
  item: TrechoConhecimento,
  topico: TopicoPlanejado
): number {
  const blob = norm(`${item.titulo}\n${item.texto.slice(0, 600)}`);
  const termos = [
    ...palavras(topico.titulo),
    ...topico.subtitulos.flatMap((s) => palavras(s)),
    ...(topico.encaixe ? palavras(topico.encaixe) : []),
    ...(topico.lastro ?? []).flatMap((l) => palavras(l.ref, 4)),
  ];
  if (!termos.length) return 0;
  let hit = 0;
  const uniq = [...new Set(termos)];
  for (const t of uniq) {
    if (blob.includes(t)) hit++;
  }
  return hit / uniq.length;
}

function consultaDoTopico(t: TopicoPlanejado): string {
  const partes = [
    t.titulo,
    t.encaixe?.slice(0, 180),
    ...(t.lastro ?? [])
      .filter((l) => l.tipo === "juris" || l.tipo === "lei" || l.tipo === "tese")
      .slice(0, 4)
      .map((l) => l.ref),
    ...t.subtitulos.slice(0, 2),
  ];
  return [...new Set(partes.map((p) => p?.trim()).filter(Boolean))].join(" ");
}

export async function buscarLastroPorTopicos(params: {
  areaId: string;
  fatos: string;
  topicos: TopicoPlanejado[];
  base: TrechoConhecimento[];
  opcoesLastro?: { polo?: "ativo" | "passivo"; especie?: string };
  enriquecerQuery: (areaId: string, q: string, fatos?: string | null) => string;
  maxPorConsulta?: number;
  maxTotal?: number;
  /** Hits locais mínimos por tópico antes de nova busca. */
  minHitsLocais?: number;
}): Promise<TrechoConhecimento[]> {
  const minLocais = params.minHitsLocais ?? 2;
  const porConsulta = params.maxPorConsulta ?? 3;
  const maxTotal = params.maxTotal ?? 16;

  const vistos = new Set(params.base.map(chaveItem));
  let acumulado = [...params.base];

  const topicosFinos: TopicoPlanejado[] = [];
  for (const t of params.topicos) {
    const locais = params.base.filter(
      (item) => scoreTrechoVsTopico(item, t) >= 0.2
    );
    if (locais.length < minLocais) {
      topicosFinos.push(t);
    }
  }

  const consultas = [
    ...new Set(
      topicosFinos
        .map(consultaDoTopico)
        .map((c) => c.trim())
        .filter((c) => c.length >= 8)
    ),
  ].slice(0, 8);

  for (const termo of consultas) {
    const hits = await buscarConhecimentoRelacionado(
      params.enriquecerQuery(params.areaId, termo, params.fatos),
      porConsulta,
      params.fatos,
      params.areaId,
      params.opcoesLastro
    );
    for (const h of hits) {
      const k = chaveItem(h);
      if (!vistos.has(k)) {
        acumulado.push(h);
        vistos.add(k);
      }
    }
  }

  // Preferência: trechos que casam com algum tópico do plano.
  acumulado = [...acumulado].sort((a, b) => {
    const sa = Math.max(
      0,
      ...params.topicos.map((t) => scoreTrechoVsTopico(a, t))
    );
    const sb = Math.max(
      0,
      ...params.topicos.map((t) => scoreTrechoVsTopico(b, t))
    );
    return sb - sa;
  });

  return acumulado.slice(0, maxTotal);
}
