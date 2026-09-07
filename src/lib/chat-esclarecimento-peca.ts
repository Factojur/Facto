/**
 * Esclarecimento mínimo no chat (MinutaIA-style):
 * chips clicáveis para espécie + polo — sem heurística local forçando a peça.
 * A IA / o advogado decidem; documentos e mensagens contextualizam a redação.
 */

import type { EstadoCasoChat } from "@/lib/chat-minuta";
import { opcoesPoloAdvogadoChat } from "@/lib/chat-minuta";
import { tituloPecaDaArea } from "@/lib/peca-especie-area";

export type OpcaoEspecieEsclarecimento = {
  id: string;
  rotulo: string;
};

/** Remédios mais pedidos — neutros de área; a IA afina rito na redação. */
export const ESPECIES_ESCLARECIMENTO_CHAT: OpcaoEspecieEsclarecimento[] = [
  { id: "peticao-inicial", rotulo: "Petição inicial" },
  { id: "contestacao", rotulo: "Contestação / defesa" },
  { id: "replica", rotulo: "Réplica" },
  { id: "apelacao", rotulo: "Apelação / recurso" },
  { id: "agravo-instrumento", rotulo: "Agravo de instrumento" },
  { id: "embargos-declaracao", rotulo: "Embargos de declaração" },
  { id: "mandado-seguranca", rotulo: "Mandado de segurança" },
  { id: "habeas-corpus", rotulo: "Habeas corpus" },
  { id: "reclamacao", rotulo: "Reclamação trabalhista" },
  { id: "cumprimento-sentenca", rotulo: "Cumprimento de sentença" },
];

/** Falta espécie ou polo confirmado pelo usuário (ou pela IA já aceita via chip). */
export function precisaEsclarecimentoMinimoChat(
  estado: EstadoCasoChat
): boolean {
  const temEspecie = Boolean(estado.especiePeca?.trim());
  const temPolo = Boolean(estado.poloConfirmado && estado.poloAdvocacia);
  return !temEspecie || !temPolo;
}

export function opcoesEspecieEsclarecimentoChat(
  estado: EstadoCasoChat
): OpcaoEspecieEsclarecimento[] {
  const atual = estado.especiePeca?.trim().toLowerCase().replace(/\s+/g, "-");
  const base = [...ESPECIES_ESCLARECIMENTO_CHAT];
  if (!atual) return base;
  const idx = base.findIndex((o) => o.id === atual);
  if (idx > 0) {
    const [item] = base.splice(idx, 1);
    base.unshift(item!);
  } else if (idx < 0) {
    base.unshift({
      id: atual,
      rotulo:
        tituloPecaDaArea(estado.areaId, atual, estado.tipoAcao) ||
        atual.replace(/-/g, " "),
    });
  }
  return base;
}

export function rotulosPoloEsclarecimentoChat(estado: EstadoCasoChat) {
  return opcoesPoloAdvogadoChat(estado);
}

export function mensagemEsclarecimentoChat(estado: EstadoCasoChat): string {
  const faltaEspecie = !estado.especiePeca?.trim();
  const faltaPolo = !estado.poloConfirmado || !estado.poloAdvocacia;
  if (faltaEspecie && faltaPolo) {
    return "Para redigir com precisão: qual peça e de qual lado você atua? Clique abaixo (sem digitar).";
  }
  if (faltaEspecie) {
    return "Quase pronto — qual peça você quer protocolar agora? Clique na opção.";
  }
  return "Só falta o lado: você atua por qual polo? Clique na opção.";
}
