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
  onDispensar,
  compacto,
  apenasSugestao,
}: {
  inferencia: InferenciaAreaChat | null;
  areaAtual: AreaIdMinuta;
  onConfirmar: (areaId: AreaIdMinuta) => void;
  onDispensar?: () => void;
  compacto?: boolean;
  /** Média confiança — chip leve, não bloqueia fluxo. */
  apenasSugestao?: boolean;
}) {
  const opcoes = opcoesAreaParaConfirmacao(inferencia);
  if (opcoes.length === 0) return null;

  const sugestao = inferencia?.areaId ?? areaAtual;
  const titulo = apenasSugestao
    ? "Área sugerida — confirme se estiver errada"
    : "Confirme a área do caso";
  const subtitulo = apenasSugestao
    ? "Seguimos com o plano enquanto isso. Um clique aqui só se o módulo não for o ideal."
    : "O relato pode caber em mais de um módulo. Escolha a área correta para espécie e endereçamento.";

  return (
    <div
      className={
        compacto
          ? apenasSugestao
            ? "rounded-lg border border-white/10 bg-stone-800/40 px-3 py-2.5"
            : "rounded-lg border border-amber-500/40 bg-amber-950/25 px-3 py-2.5"
          : apenasSugestao
            ? "rounded-xl border border-stone-200 bg-stone-50 px-4 py-3"
            : "rounded-xl border border-amber-300 bg-amber-50 px-4 py-3"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p
          className={
            compacto
              ? apenasSugestao
                ? "text-xs font-semibold text-stone-200"
                : "text-xs font-semibold text-amber-100"
              : apenasSugestao
                ? "text-sm font-semibold text-stone-800"
                : "text-sm font-semibold text-amber-950"
          }
        >
          {titulo}
        </p>
        {onDispensar && apenasSugestao && (
          <button
            type="button"
            onClick={onDispensar}
            className={
              compacto
                ? "text-[10px] text-stone-400 underline-offset-2 hover:underline"
                : "text-xs text-stone-500 underline-offset-2 hover:underline"
            }
          >
            está certo
          </button>
        )}
      </div>
      <p
        className={
          compacto
            ? apenasSugestao
              ? "mt-1 text-[11px] leading-relaxed text-stone-400"
              : "mt-1 text-[11px] leading-relaxed text-amber-100/85"
            : apenasSugestao
              ? "mt-1 text-xs leading-relaxed text-stone-600"
              : "mt-1 text-xs leading-relaxed text-amber-900/90"
        }
      >
        {subtitulo}
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
