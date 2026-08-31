"use client";

import type { AreaIdMinuta } from "@/lib/minuta-modulo";
import {
  opcoesAreaParaConfirmacao,
  rotuloAreaChat,
  type InferenciaAreaChat,
} from "@/lib/chat-minuta";

export function ChatConfirmarArea({
  inferencia,
  areaAtual,
  onConfirmar,
  compacto,
}: {
  inferencia: InferenciaAreaChat | null;
  areaAtual: AreaIdMinuta;
  onConfirmar: (areaId: AreaIdMinuta) => void;
  compacto?: boolean;
}) {
  const opcoes = opcoesAreaParaConfirmacao(inferencia);
  if (opcoes.length === 0) return null;

  const sugestao = inferencia?.areaId ?? areaAtual;

  return (
    <div
      className={
        compacto
          ? "rounded-lg border border-amber-500/40 bg-amber-950/25 px-3 py-2.5"
          : "rounded-xl border border-amber-300 bg-amber-50 px-4 py-3"
      }
    >
      <p
        className={
          compacto
            ? "text-xs font-semibold text-amber-100"
            : "text-sm font-semibold text-amber-950"
        }
      >
        Confirme a área do caso
      </p>
      <p
        className={
          compacto
            ? "mt-1 text-[11px] leading-relaxed text-amber-100/85"
            : "mt-1 text-xs leading-relaxed text-amber-900/90"
        }
      >
        O relato pode caber em mais de um módulo. Escolha a área correta antes
        do plano e da redação — assim evitamos espécie e endereçamento errados.
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {opcoes.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onConfirmar(id)}
            className={
              id === sugestao
                ? compacto
                  ? "rounded-lg border border-facto-gold/50 bg-facto-gold/20 px-3 py-1.5 text-[11px] font-semibold text-facto-gold"
                  : "rounded-lg border border-amber-700 bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-950"
                : compacto
                  ? "rounded-lg border border-white/15 bg-stone-800/80 px-3 py-1.5 text-[11px] font-medium text-stone-200 hover:border-facto-gold/35"
                  : "rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:border-stone-400"
            }
          >
            {rotuloAreaChat(id)}
            {id === sugestao ? " (sugestão)" : ""}
          </button>
        ))}
      </div>
    </div>
  );
}
