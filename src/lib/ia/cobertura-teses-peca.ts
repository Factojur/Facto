/**
 * Checklist de cobertura — cada tese/pedido deve aparecer no plano e na peça.
 */

import type { TopicoPlanejado } from "@/lib/ia/plano-topicos-peca";
import type { TeseCanonica } from "@/lib/teses-canonicas";

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function palavrasChave(texto: string): string[] {
  return norm(texto)
    .split(/\s+/)
    .filter((w) => w.length >= 5)
    .slice(0, 6);
}

function mencionadoNoPlano(plano: string, termos: string[]): boolean {
  const b = norm(plano);
  return termos.some((t) => b.includes(norm(t)));
}

export type ItemCoberturaTese = {
  id: string;
  rotulo: string;
  noPlano: boolean;
  exigeSubtopico: boolean;
};

/** Verifica se teses e pedidos do formulário estão refletidos no plano da triagem. */
export function avaliarCoberturaNoPlano(params: {
  estrategia: string;
  topicos: TopicoPlanejado[];
  teses: TeseCanonica[];
  pedidosFormulario?: string[];
}): ItemCoberturaTese[] {
  const planoTexto = [
    params.estrategia,
    ...params.topicos.map((t) => `${t.titulo} ${t.subtitulos.join(" ")}`),
  ].join("\n");

  const itens: ItemCoberturaTese[] = [];

  for (const tese of params.teses) {
    const termos = [tese.rotulo, ...tese.artigos.split(/[,;]/).map((a) => a.trim())].filter(
      Boolean
    );
    itens.push({
      id: tese.id,
      rotulo: tese.rotulo,
      noPlano: mencionadoNoPlano(planoTexto, termos),
      exigeSubtopico: true,
    });
  }

  for (const pedido of (params.pedidosFormulario ?? []).map((p) => p.trim()).filter(Boolean)) {
    const chave = palavrasChave(pedido)[0] ?? pedido.slice(0, 24);
    itens.push({
      id: `pedido-${norm(chave).slice(0, 32)}`,
      rotulo: `Pedido: ${pedido.slice(0, 80)}`,
      noPlano: mencionadoNoPlano(planoTexto, palavrasChave(pedido)),
      exigeSubtopico: false,
    });
  }

  return itens;
}

/** Bloco para o Redator — teses/pedidos que a triagem deve cobrir integralmente. */
export function blocoCoberturaTesesParaRedator(
  itens: ItemCoberturaTese[],
  teses: TeseCanonica[]
): string {
  const faltando = itens.filter((i) => !i.noPlano && i.exigeSubtopico);
  const pedidosFaltando = itens.filter((i) => !i.noPlano && !i.exigeSubtopico);

  const linhas = [
    "<COBERTURA_SUGERIDA>",
    "Guia de teses/pedidos — cubra o que o CASO comportar. Liberdade argumentativa total dentro do relato.",
    "NÃO force instituto fora dos autos; NÃO omita pedido explícito do advogado.",
    "",
  ];

  if (teses.length) {
    linhas.push("Teses canônicas sugeridas:");
    for (const t of teses) {
      const ok = itens.find((i) => i.id === t.id)?.noPlano;
      linhas.push(
        `- ${t.rotulo} (${t.artigos})${ok ? "" : " ← considerar subtópico no direito se cabível"}`
      );
    }
  }

  if (pedidosFaltando.length) {
    linhas.push("", "Pedidos do advogado (reproduzir em DOS PEDIDOS):");
    for (const p of pedidosFaltando) {
      linhas.push(`- ${p.rotulo.replace(/^Pedido:\s*/, "")}`);
    }
  }

  if (faltando.length === 0 && pedidosFaltando.length === 0 && teses.length === 0) {
    return "";
  }

  linhas.push("</COBERTURA_SUGERIDA>");
  return linhas.join("\n");
}

/** Auditor: títulos romanos do plano aparecem na peça? */
export function auditarTopicosNaPeca(
  peca: string,
  topicos: TopicoPlanejado[]
): { faltando: string[]; ok: number } {
  const b = norm(peca);
  const faltando: string[] = [];
  let ok = 0;

  for (const t of topicos) {
    const titulo = norm(t.titulo);
    const palavras = titulo.split(/\s+/).filter((w) => w.length >= 4);
    const achou =
      b.includes(titulo) ||
      (palavras.length >= 2 && palavras.filter((w) => b.includes(w)).length >= 2);
    if (achou) ok++;
    else faltando.push(`${t.romano}. ${t.titulo}`);
  }

  return { faltando, ok };
}

function indiceTopicoDireito(topicos: TopicoPlanejado[]): number {
  const idx = topicos.findIndex((t) => /direito|fundament|mérito|merito/i.test(t.titulo));
  if (idx >= 0) return idx;
  const fatos = topicos.findIndex((t) => /fato/i.test(t.titulo));
  return fatos >= 0 && fatos < topicos.length - 1 ? fatos + 1 : Math.max(0, topicos.length - 1);
}

function indiceTopicoPedidos(topicos: TopicoPlanejado[]): number {
  const idx = topicos.findIndex((t) => /pedido/i.test(t.titulo));
  return idx >= 0 ? idx : topicos.length - 1;
}

function atualizarResumoCobertura(itens: ItemCoberturaTese[]): string {
  const ok = itens.filter((i) => i.noPlano).length;
  return `${ok}/${itens.length}`;
}

/** Inclui tese ou pedido pendente no plano local (1 clique, sem nova triagem). */
export function incluirItemCoberturaNoPlano<
  T extends {
    estrategiaJuridica: string;
    topicos: TopicoPlanejado[];
    cobertura: ItemCoberturaTese[];
    coberturaResumo?: string;
    pedidosFormulario?: string[];
  },
>(triagem: T, itemId: string): T | null {
  const item = triagem.cobertura.find((c) => c.id === itemId);
  if (!item || item.noPlano) return null;

  const topicos = triagem.topicos.map((t) => ({
    ...t,
    subtitulos: [...t.subtitulos],
  }));
  const pedidosFormulario = [...(triagem.pedidosFormulario ?? [])];

  const ehPedido = item.rotulo.startsWith("Pedido:");
  const textoInclusao = ehPedido
    ? item.rotulo.replace(/^Pedido:\s*/i, "").trim()
    : item.rotulo.trim();

  if (!textoInclusao) return null;

  if (ehPedido) {
    if (!pedidosFormulario.some((p) => norm(p) === norm(textoInclusao))) {
      pedidosFormulario.push(textoInclusao);
    }
    if (topicos.length === 0) {
      topicos.push({
        romano: "I",
        titulo: "DOS PEDIDOS",
        subtitulos: [textoInclusao],
      });
    } else {
      const idx = indiceTopicoPedidos(topicos);
      const alvo = topicos[idx]!;
      if (!alvo.subtitulos.some((s) => norm(s) === norm(textoInclusao))) {
        alvo.subtitulos.push(textoInclusao);
      }
    }
  } else if (topicos.length === 0) {
    topicos.push({
      romano: "I",
      titulo: "DO DIREITO",
      subtitulos: [textoInclusao],
    });
  } else {
    const idx = indiceTopicoDireito(topicos);
    const alvo = topicos[idx]!;
    if (!alvo.subtitulos.some((s) => norm(s) === norm(textoInclusao))) {
      alvo.subtitulos.push(textoInclusao);
    }
  }

  const cobertura = triagem.cobertura.map((c) =>
    c.id === itemId ? { ...c, noPlano: true } : c
  );

  const nota = `\n[Incluído no plano: ${textoInclusao}]`;
  const estrategiaJuridica = triagem.estrategiaJuridica.includes(textoInclusao)
    ? triagem.estrategiaJuridica
    : `${triagem.estrategiaJuridica.trim()}${nota}`;

  return {
    ...triagem,
    topicos,
    pedidosFormulario,
    cobertura,
    coberturaResumo: atualizarResumoCobertura(cobertura),
    estrategiaJuridica,
  };
}
