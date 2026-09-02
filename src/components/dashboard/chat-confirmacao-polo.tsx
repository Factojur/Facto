"use client";

import type { EstadoCasoChat } from "@/lib/chat-minuta";
import {
  mensagemConfirmacaoPoloChat,
  opcoesPoloAdvogadoChat,
  type OpcaoPoloAdvogado,
} from "@/lib/chat-minuta";
import type { PoloAdvocacia } from "@/lib/polo-advocacia";

type Props = {
  estado: EstadoCasoChat;
  modoWorkspace?: boolean;
  onConfirmar: (polo: PoloAdvocacia, rotulo: string) => void;
};

export function ChatConfirmacaoPolo({
  estado,
  modoWorkspace,
  onConfirmar,
}: Props) {
  const opcoes: OpcaoPoloAdvogado[] = opcoesPoloAdvogadoChat(estado);

  return (
    <div
      className={
        modoWorkspace
          ? "rounded-xl border border-amber-500/35 bg-amber-950/35 p-3 backdrop-blur-sm"
          : "rounded-xl border border-amber-200/80 bg-amber-50/80 p-3 dark:border-amber-900/50 dark:bg-amber-950/30"
      }
    >
      <p
        className={`text-sm leading-relaxed ${
          modoWorkspace ? "text-amber-50" : "text-amber-950 dark:text-amber-100"
        }`}
      >
        {mensagemConfirmacaoPoloChat()}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {opcoes.map((op) => (
          <button
            key={op.polo}
            type="button"
            onClick={() => onConfirmar(op.polo, op.rotulo)}
            className={
              modoWorkspace
                ? "rounded-full border border-facto-gold/45 bg-facto-gold/15 px-3 py-1.5 text-xs font-semibold text-facto-gold transition hover:bg-facto-gold/25"
                : "rounded-full border border-amber-500/60 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100 dark:border-amber-700 dark:bg-stone-900 dark:text-amber-100 dark:hover:bg-amber-950"
            }
          >
            {op.rotulo}
          </button>
        ))}
      </div>
    </div>
  );
}
