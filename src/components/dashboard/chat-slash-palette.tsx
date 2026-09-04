"use client";

import type { SlashComando } from "@/lib/chat-slash-comandos";

type Props = {
  itens: SlashComando[];
  indiceAtivo: number;
  onEscolher: (cmd: SlashComando) => void;
  modoWorkspace?: boolean;
};

/** Paleta `/` sob o composer — espécie / atalho FACTO. */
export function ChatSlashPalette({
  itens,
  indiceAtivo,
  onEscolher,
  modoWorkspace,
}: Props) {
  if (itens.length === 0) return null;
  return (
    <div
      role="listbox"
      aria-label="Comandos rápidos"
      data-testid="chat-slash-palette"
      className={`mb-1.5 max-h-48 overflow-y-auto rounded-xl border shadow-lg ${
        modoWorkspace
          ? "border-white/15 bg-stone-950/95 text-stone-200"
          : "border-stone-200 bg-white text-stone-800"
      }`}
    >
      <p
        className={`sticky top-0 border-b px-2.5 py-1 text-[10px] font-medium ${
          modoWorkspace
            ? "border-white/10 bg-stone-950/95 text-stone-500"
            : "border-stone-100 bg-white text-stone-500"
        }`}
      >
        Digite / para espécie ou atalho — Enter escolhe
      </p>
      <ul className="py-0.5">
        {itens.map((cmd, i) => (
          <li key={cmd.id}>
            <button
              type="button"
              role="option"
              aria-selected={i === indiceAtivo}
              data-testid="chat-slash-item"
              className={`flex w-full flex-col gap-0.5 px-2.5 py-1.5 text-left text-[12px] transition ${
                i === indiceAtivo
                  ? modoWorkspace
                    ? "bg-facto-gold/15 text-facto-gold"
                    : "bg-amber-50 text-stone-900"
                  : modoWorkspace
                    ? "hover:bg-white/5"
                    : "hover:bg-stone-50"
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                onEscolher(cmd);
              }}
            >
              <span className="font-semibold">
                /{cmd.alias}{" "}
                <span className="font-normal opacity-80">— {cmd.rotulo}</span>
              </span>
              <span
                className={
                  modoWorkspace ? "text-[10px] text-stone-500" : "text-[10px] text-stone-500"
                }
              >
                {cmd.dica}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
