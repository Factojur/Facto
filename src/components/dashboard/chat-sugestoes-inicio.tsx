"use client";

import { useState } from "react";

/** Exemplos de início — não gastam crédito; só preenchem o composer. */
export const SUGESTOES_INICIO_CASO = [
  "Corte indevido de água/energia — peço tutela e danos morais",
  "Rescisão trabalhista — verbas e FGTS",
  "Réplica à contestação — processo já em andamento",
  "Agravo de instrumento contra decisão que reduziu as astreintes",
  "Habeas corpus — constrangimento ilegal / liminar",
  "Mandado de segurança — direito líquido e certo",
  "Apelação cível — reforma da sentença",
  "Embargos de declaração — omissão na decisão",
  "Cumprimento de sentença — exequente",
  "Contestação — preliminares e mérito",
] as const;

type Props = {
  modoWorkspace?: boolean;
  onEscolher: (texto: string) => void;
};

/**
 * Exemplos recolhidos atrás de um botão — evita poluir o empty state.
 */
export function ChatSugestoesInicio({
  modoWorkspace = false,
  onEscolher,
}: Props) {
  const [aberto, setAberto] = useState(false);

  const btnShell = modoWorkspace
    ? "rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[12px] font-medium text-stone-300 backdrop-blur-sm transition hover:border-facto-gold/40 hover:text-facto-gold"
    : "rounded-full border border-stone-300 bg-white/80 px-3.5 py-1.5 text-[12px] font-medium text-stone-700 transition hover:border-facto-gold/50 hover:text-stone-900";

  const pill = modoWorkspace
    ? "rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-left text-[11px] text-stone-300 backdrop-blur-sm transition hover:border-facto-gold/40 hover:text-facto-gold"
    : "rounded-full border border-stone-300 bg-white/80 px-3 py-1.5 text-left text-[11px] text-stone-600 transition hover:border-facto-gold/50 hover:text-stone-900";

  return (
    <div className="flex flex-col items-center gap-2 pt-1">
      <button
        type="button"
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
        className={btnShell}
      >
        {aberto ? "Ocultar exemplos" : "Ver exemplos de caso"}
      </button>
      {aberto ? (
        <div className="flex max-w-2xl flex-wrap justify-center gap-2">
          {SUGESTOES_INICIO_CASO.map((sugestao) => (
            <button
              key={sugestao}
              type="button"
              data-testid="chat-sugestao"
              onClick={() => onEscolher(sugestao)}
              className={pill}
            >
              {sugestao}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
