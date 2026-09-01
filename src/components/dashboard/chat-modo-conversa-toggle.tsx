"use client";

import type { ModoConversaChat } from "@/lib/modo-conversa-chat";
import { configModoConversa } from "@/lib/modo-conversa-chat";

type Props = {
  modo: ModoConversaChat;
  onModoChange: (modo: ModoConversaChat) => void;
  modoWorkspace?: boolean;
  compacto?: boolean;
};

/** Toggle Instantâneo / Planejado — estilo MinutaIA. */
export function ChatModoConversaToggle({
  modo,
  onModoChange,
  modoWorkspace = false,
  compacto = false,
}: Props) {
  const instantaneo = configModoConversa("instantaneo");
  const planejado = configModoConversa("planejado");

  const shell = modoWorkspace
    ? "border-white/15 bg-white/[0.06]"
    : "border-stone-600/50 bg-stone-800/80";

  const ativo = modoWorkspace
    ? "bg-facto-gold/20 text-facto-gold ring-1 ring-facto-gold/40"
    : "bg-facto-gold/25 text-amber-50 ring-1 ring-facto-gold/45";

  const inativo = modoWorkspace
    ? "text-stone-400 hover:text-stone-200"
    : "text-stone-400 hover:text-stone-200";

  const btn = `rounded-full px-2 py-0.5 font-semibold transition ${
    compacto ? "text-[10px]" : "text-[11px]"
  }`;

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full border p-0.5 ${shell}`}
      role="group"
      aria-label="Modo da conversa"
    >
      <button
        type="button"
        title={instantaneo.dica}
        aria-pressed={modo === "instantaneo"}
        onClick={() => onModoChange("instantaneo")}
        className={`${btn} ${modo === "instantaneo" ? ativo : inativo}`}
      >
        Instantâneo
      </button>
      <button
        type="button"
        title={planejado.dica}
        aria-pressed={modo === "planejado"}
        onClick={() => onModoChange("planejado")}
        className={`${btn} ${modo === "planejado" ? ativo : inativo}`}
      >
        Planejado
      </button>
    </div>
  );
}
