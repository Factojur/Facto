"use client";

/**
 * Chips de esclarecimento mínimo: peça + polo (clique, sem digitar).
 * Não trava Minuta — só direciona a IA com precisão.
 */

import type { EstadoCasoChat } from "@/lib/chat-minuta";
import {
  mensagemEsclarecimentoChat,
  opcoesEspecieEsclarecimentoChat,
  precisaEsclarecimentoMinimoChat,
  rotulosPoloEsclarecimentoChat,
} from "@/lib/chat-esclarecimento-peca";
import type { PoloAdvocacia } from "@/lib/polo-advocacia";

type Props = {
  estado: EstadoCasoChat;
  modoWorkspace?: boolean;
  onEscolherEspecie: (id: string, rotulo: string) => void;
  onEscolherPolo: (polo: PoloAdvocacia, rotulo: string) => void;
  onDispensar?: () => void;
};

export function ChatEsclarecimentoChips({
  estado,
  modoWorkspace = false,
  onEscolherEspecie,
  onEscolherPolo,
  onDispensar,
}: Props) {
  if (!precisaEsclarecimentoMinimoChat(estado)) return null;

  const faltaEspecie = !estado.especiePeca?.trim();
  const faltaPolo = !estado.poloConfirmado || !estado.poloAdvocacia;
  const especies = opcoesEspecieEsclarecimentoChat(estado);
  const polos = rotulosPoloEsclarecimentoChat(estado);

  const chip =
    modoWorkspace
      ? "rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-left text-[11px] text-stone-300 backdrop-blur-sm transition hover:border-facto-gold/40 hover:text-facto-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-facto-gold/60"
      : "rounded-full border border-stone-300 bg-white/80 px-3 py-1.5 text-left text-[11px] text-stone-600 transition hover:border-facto-gold/50 hover:text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500/70";

  const chipAtivo =
    modoWorkspace
      ? "rounded-full border border-facto-gold/50 bg-facto-gold/15 px-3 py-1.5 text-left text-[11px] font-semibold text-facto-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-facto-gold/60"
      : "rounded-full border border-facto-gold/50 bg-amber-50 px-3 py-1.5 text-left text-[11px] font-semibold text-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500/70";

  return (
    <div
      className="flex flex-col gap-2 pt-1"
      data-testid="chat-esclarecimento"
      role="group"
      aria-label="Esclarecimento da peça"
    >
      <p
        className={
          modoWorkspace
            ? "text-[11px] text-stone-400"
            : "text-[11px] text-stone-500"
        }
      >
        {mensagemEsclarecimentoChat(estado)}
      </p>
      {faltaEspecie ? (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Tipo de peça">
          {especies.map((op) => {
            const ativo = estado.especiePeca === op.id;
            return (
              <button
                key={op.id}
                type="button"
                data-testid={`chat-especie-${op.id}`}
                aria-pressed={ativo}
                aria-label={`Peça: ${op.rotulo}`}
                className={ativo ? chipAtivo : chip}
                onClick={() => onEscolherEspecie(op.id, op.rotulo)}
              >
                {op.rotulo}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Trocar peça sugerida">
          <p
            className={
              modoWorkspace
                ? "w-full text-[10px] text-stone-500"
                : "w-full text-[10px] text-stone-500"
            }
          >
            Peça sugerida (clique para trocar):
          </p>
          {especies.slice(0, 6).map((op) => {
            const ativo = estado.especiePeca === op.id;
            return (
              <button
                key={op.id}
                type="button"
                data-testid={`chat-especie-${op.id}`}
                aria-pressed={ativo}
                aria-label={`Peça: ${op.rotulo}`}
                className={ativo ? chipAtivo : chip}
                onClick={() => onEscolherEspecie(op.id, op.rotulo)}
              >
                {op.rotulo}
              </button>
            );
          })}
        </div>
      )}
      {faltaPolo && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Polo de atuação">
          {polos.map((op) => {
            const ativo =
              estado.poloAdvocacia === op.polo && estado.poloConfirmado;
            return (
              <button
                key={op.polo}
                type="button"
                data-testid={`chat-polo-${op.polo}`}
                aria-pressed={ativo}
                aria-label={`Atuo pelo ${op.rotulo}`}
                className={ativo ? chipAtivo : chip}
                onClick={() => onEscolherPolo(op.polo, op.rotulo)}
              >
                Atuo pelo {op.rotulo}
              </button>
            );
          })}
        </div>
      )}
      {onDispensar && (
        <button
          type="button"
          data-testid="chat-esclarecimento-pular"
          aria-label="Continuar sem confirmar peça e polo"
          className={
            modoWorkspace
              ? "self-start text-[10px] text-stone-500 underline-offset-2 hover:text-stone-300 hover:underline"
              : "self-start text-[10px] text-stone-500 underline-offset-2 hover:text-stone-700 hover:underline"
          }
          onClick={onDispensar}
        >
          Continuar sem confirmar (a IA usa o que já entendeu)
        </button>
      )}
    </div>
  );
}
