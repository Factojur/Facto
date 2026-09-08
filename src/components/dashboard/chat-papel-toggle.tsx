"use client";

import type { PapelInteracaoChat } from "@/lib/modo-conversa-chat";

type Props = {
  papel: PapelInteracaoChat;
  onPapelChange: (papel: PapelInteracaoChat) => void;
  modoWorkspace?: boolean;
};

/** Assistente vs Peça — seletor FACTO. */
export function ChatPapelToggle({
  papel,
  onPapelChange,
  modoWorkspace = false,
}: Props) {
  const shell = modoWorkspace
    ? "border-white/15 bg-white/[0.06]"
    : "border-stone-600/50 bg-stone-800/80";

  const ativo = modoWorkspace
    ? "bg-facto-gold/20 text-facto-gold ring-1 ring-facto-gold/40"
    : "bg-facto-gold/25 text-amber-50 ring-1 ring-facto-gold/45";

  const inativo = modoWorkspace
    ? "text-stone-400 hover:text-stone-200"
    : "text-stone-400 hover:text-stone-200";

  const btn = "rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition";

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full border p-0.5 ${shell}`}
      role="group"
      aria-label="Assistente ou Peça"
    >
      <button
        type="button"
        title="Conversa e contexto — não gera a peça nem consome crédito."
        aria-pressed={papel === "chat"}
        onClick={() => onPapelChange("chat")}
        className={`${btn} ${papel === "chat" ? ativo : inativo}`}
      >
        Assistente
      </button>
      <button
        type="button"
        title="Área do preview da peça. Gere com o botão Gerar preview (1 crédito)."
        aria-pressed={papel === "minuta"}
        onClick={() => onPapelChange("minuta")}
        className={`${btn} ${papel === "minuta" ? ativo : inativo}`}
      >
        Peça
      </button>
    </div>
  );
}
