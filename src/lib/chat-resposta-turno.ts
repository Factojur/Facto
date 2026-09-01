/**
 * Respostas conversacionais no chat — diff local (0 tokens) + fallback.
 */

import type { EstadoCasoChat } from "@/lib/chat-minuta";
import { rotuloAreaChat } from "@/lib/chat-minuta";

export type DiffEstadoCaso = {
  pedidosNovos: string[];
  pedidosRemovidos: string[];
  fatosCresceram: boolean;
  tipoAcaoMudou: boolean;
  areaMudou: boolean;
  autoresMudaram: boolean;
  reusMudaram: boolean;
  tutelaLigada: boolean;
  jgLigada: boolean;
};

export function diffEstadoCasoChat(
  anterior: EstadoCasoChat,
  atual: EstadoCasoChat
): DiffEstadoCaso {
  const pedAnt = new Set(anterior.pedidos.filter(Boolean));
  const pedAtu = atual.pedidos.filter(Boolean);
  return {
    pedidosNovos: pedAtu.filter((p) => !pedAnt.has(p)),
    pedidosRemovidos: [...pedAnt].filter((p) => !pedAtu.includes(p)),
    fatosCresceram: atual.fatos.trim().length > anterior.fatos.trim().length + 20,
    tipoAcaoMudou:
      atual.tipoAcao.trim() !== anterior.tipoAcao.trim() &&
      Boolean(atual.tipoAcao.trim()),
    areaMudou: atual.areaId !== anterior.areaId,
    autoresMudaram:
      atual.autoresNomes.join("|") !== anterior.autoresNomes.join("|"),
    reusMudaram: atual.reusNomes.join("|") !== anterior.reusNomes.join("|"),
    tutelaLigada: !anterior.tutelaUrgencia && atual.tutelaUrgencia,
    jgLigada: !anterior.pedirJusticaGratuita && atual.pedirJusticaGratuita,
  };
}

/** Resposta rica no thread a partir do diff — sem LLM. */
export function montarRespostaTurnoLocal(input: {
  diff: DiffEstadoCaso;
  estado: EstadoCasoChat;
  primeiroRelato?: boolean;
}): string {
  const { diff, estado, primeiroRelato } = input;
  const linhas: string[] = [];

  if (primeiroRelato) {
    linhas.push(
      "Entendi. Montei o **plano estratégico** à direita — revise tópicos e pedidos enquanto conversamos."
    );
  } else {
    linhas.push("Atualizei o entendimento do caso.");
  }

  if (diff.pedidosNovos.length > 0) {
    linhas.push(
      `**Pedidos:** ${diff.pedidosNovos.map((p) => `“${p}”`).join(", ")}.`
    );
  }
  if (diff.tutelaLigada) {
    linhas.push("Marquei **tutela de urgência** — o plano vai refletir isso.");
  }
  if (diff.jgLigada) {
    linhas.push("Incluí pedido de **justiça gratuita** no encaminhamento.");
  }
  if (diff.autoresMudaram || diff.reusMudaram) {
    const partes = [
      estado.autoresNomes.length ? `autor: ${estado.autoresNomes.join(", ")}` : null,
      estado.reusNomes.length ? `réu: ${estado.reusNomes.join(", ")}` : null,
    ].filter(Boolean);
    if (partes.length) linhas.push(`**Partes:** ${partes.join(" · ")}.`);
  }
  if (diff.tipoAcaoMudou) {
    linhas.push(`**Espécie/ação:** ${estado.tipoAcao.trim()}.`);
  }
  if (diff.areaMudou) {
    linhas.push(`**Área:** ${rotuloAreaChat(estado.areaId)}.`);
  }
  if (diff.fatosCresceram && !diff.pedidosNovos.length) {
    linhas.push("Integrei os fatos complementares ao dossiê.");
  }

  linhas.push(
    "O plano à direita será atualizado em instantes. Quando estiver bom, **Redigir (1 peça)**."
  );

  return linhas.join("\n\n");
}

export function perguntaProativaLocal(estado: EstadoCasoChat): string | null {
  if (!estado.fatos.trim() || estado.fatos.trim().length < 40) return null;
  if (!estado.comarca.uf?.trim() && !estado.comarca.cidade?.trim()) {
    return "Qual a **comarca ou cidade/UF** do foro? Isso melhora endereçamento e juris.";
  }
  if (!estado.autoresNomes.length) {
    return "Quem é o **autor** (nome completo) para qualificação na peça?";
  }
  if (!estado.pedidos.filter(Boolean).length) {
    return "Quais **pedidos** você quer na peça (danos, obrigação, tutela)?";
  }
  return null;
}
