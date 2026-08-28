/**
 * RAG direcionado por subtópico do plano estratégico.
 */

import {
  buscarConhecimentoRelacionado,
  type TrechoConhecimento,
} from "@/lib/base-conhecimento";
import type { TopicoPlanejado } from "@/lib/ia/plano-topicos-peca";

function chaveItem(i: TrechoConhecimento): string {
  return `${i.categoria}|${i.titulo}|${i.texto.slice(0, 80)}`;
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
}): Promise<TrechoConhecimento[]> {
  const consultas: string[] = [];
  for (const t of params.topicos) {
    consultas.push(t.titulo);
    for (const sub of t.subtitulos) consultas.push(sub);
  }

  const unicos = [...new Set(consultas.map((c) => c.trim()).filter((c) => c.length >= 4))].slice(
    0,
    8
  );
  if (!unicos.length) return params.base;

  const vistos = new Set(params.base.map(chaveItem));
  let acumulado = [...params.base];
  const porConsulta = params.maxPorConsulta ?? 3;

  for (const termo of unicos) {
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

  return acumulado.slice(0, params.maxTotal ?? 16);
}
