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
    "<COBERTURA_OBRIGATORIA>",
    "Cada tese e pedido abaixo DEVE constar em DO DIREITO (subtópico) e/ou DOS PEDIDOS.",
    "Não omita instituto manifestamente cabível ao relato.",
    "",
  ];

  if (teses.length) {
    linhas.push("Teses canônicas do caso:");
    for (const t of teses) {
      const ok = itens.find((i) => i.id === t.id)?.noPlano;
      linhas.push(`- ${t.rotulo} (${t.artigos})${ok ? "" : " ← incluir subtópico no direito"}`);
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

  linhas.push("</COBERTURA_OBRIGATORIA>");
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
