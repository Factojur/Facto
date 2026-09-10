"use client";

/**
 * O5b — chips: manter padrão (Flash) | ir para o detalhado (Sonnet).
 * Não bloqueia Gerar depois da escolha; só pausa até o clique.
 */

import { COPY_PERGUNTA_FUNCAO_DETALHADA } from "@/lib/ia/roteador-redator";

type Props = {
  modoWorkspace?: boolean;
  onManterPadrao: () => void;
  onIrDetalhado: () => void;
};

export function ChatFuncaoDetalhadaChips({
  modoWorkspace = false,
  onManterPadrao,
  onIrDetalhado,
}: Props) {
  const chip =
    modoWorkspace
      ? "rounded-lg border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[12px] font-medium text-stone-300 transition hover:border-facto-gold/40 hover:text-facto-gold"
      : "rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-[12px] font-medium text-stone-700 transition hover:border-facto-gold/50";

  const chipDestaque =
    modoWorkspace
      ? "rounded-lg border border-facto-gold/40 bg-facto-gold/15 px-3 py-1.5 text-[12px] font-semibold text-facto-gold"
      : "rounded-lg border border-facto-gold/50 bg-amber-50 px-3 py-1.5 text-[12px] font-semibold text-stone-800";

  return (
    <div
      className="flex flex-col items-start gap-2 pt-1"
      data-testid="chat-funcao-detalhada"
      role="group"
      aria-label="Função detalhada"
    >
      <p
        className={
          modoWorkspace
            ? "text-[11px] text-stone-400"
            : "text-[11px] text-stone-500"
        }
      >
        {COPY_PERGUNTA_FUNCAO_DETALHADA}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          data-testid="chat-detalhada-padrao"
          className={chip}
          onClick={onManterPadrao}
        >
          Manter no padrão
        </button>
        <button
          type="button"
          data-testid="chat-detalhada-ir"
          className={chipDestaque}
          onClick={onIrDetalhado}
        >
          Ir para o detalhado
        </button>
      </div>
    </div>
  );
}
