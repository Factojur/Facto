"use client";

import type { ModoConversaChat } from "@/lib/modo-conversa-chat";
import { configModoConversa } from "@/lib/modo-conversa-chat";

type Props = {
  modo: ModoConversaChat;
  onModoChange: (modo: ModoConversaChat) => void;
  modoWorkspace?: boolean;
  compacto?: boolean;
  /** Direto/Aprofundado só no modo Peça. */
  desabilitado?: boolean;
};

/** Toggle Direto / Aprofundado. */
export function ChatModoConversaToggle({
  modo,
  onModoChange,
  modoWorkspace = false,
  compacto = false,
  desabilitado = false,
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
      aria-label="Modo Direto ou Aprofundado"
      aria-disabled={desabilitado}
    >
      <button
        type="button"
        title={desabilitado ? "Disponível no modo Peça" : instantaneo.dica}
        aria-pressed={modo === "instantaneo"}
        disabled={desabilitado}
        onClick={() => onModoChange("instantaneo")}
        className={`${btn} ${modo === "instantaneo" ? ativo : inativo} ${
          desabilitado ? "cursor-not-allowed opacity-40" : ""
        }`}
      >
        {instantaneo.rotulo}
      </button>
      <button
        type="button"
        title={desabilitado ? "Disponível no modo Peça" : planejado.dica}
        aria-pressed={modo === "planejado"}
        disabled={desabilitado}
        onClick={() => onModoChange("planejado")}
        className={`${btn} ${modo === "planejado" ? ativo : inativo} ${
          desabilitado ? "cursor-not-allowed opacity-40" : ""
        }`}
      >
        {planejado.rotulo}
      </button>
    </div>
  );
}
