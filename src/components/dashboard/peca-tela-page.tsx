"use client";

import { useEffect, useState } from "react";
import { PecaDocumentoView } from "@/components/dashboard/peca-documento";
import {
  CHAT_PREVIEW_CHANNEL,
  lerPreviewPecaSnap,
  type ChatPreviewSnap,
} from "@/lib/chat-preview-broadcast";
import { carregarEscritorioConfig } from "@/lib/escritorio-storage";

/**
 * Janela só da peça — arraste para o segundo monitor.
 * Recebe atualizações ao vivo do assistente na outra aba.
 */
export function PecaTelaPage() {
  const [snap, setSnap] = useState<ChatPreviewSnap | null>(null);
  const [escritorio, setEscritorio] = useState(() =>
    typeof window !== "undefined" ? carregarEscritorioConfig() : null
  );

  useEffect(() => {
    setSnap(lerPreviewPecaSnap());
    setEscritorio(carregarEscritorioConfig());
    let ch: BroadcastChannel | null = null;
    try {
      ch = new BroadcastChannel(CHAT_PREVIEW_CHANNEL);
      ch.onmessage = (ev: MessageEvent<ChatPreviewSnap>) => {
        if (ev.data?.ts) setSnap(ev.data);
      };
    } catch {
      /* ignore */
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === "facto:chat-preview-snap" && e.newValue) {
        try {
          setSnap(JSON.parse(e.newValue) as ChatPreviewSnap);
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    const poll = window.setInterval(() => {
      const s = lerPreviewPecaSnap();
      if (s && (!snap || s.ts !== snap.ts)) setSnap(s);
    }, 800);
    return () => {
      ch?.close();
      window.removeEventListener("storage", onStorage);
      window.clearInterval(poll);
    };
  }, [snap?.ts]);

  const temPeca = Boolean(snap?.pecaHtml);

  return (
    <div
      className={`flex min-h-dvh flex-col ${
        temPeca
          ? "bg-[#fafaf8]"
          : "bg-facto-dark bg-[radial-gradient(ellipse_at_top,rgba(144,139,106,0.2),transparent_55%)]"
      }`}
    >
      <header
        className={`shrink-0 border-b px-4 py-2 ${
          temPeca
            ? "border-stone-200 bg-white text-stone-800"
            : "border-white/10 bg-stone-950/80 text-stone-100"
        }`}
      >
        <p className="text-center text-xs font-medium sm:text-sm">
          {snap?.titulo || "Pré-visualização FACTO"}
          {snap?.previewLoading ? " · atualizando…" : ""}
        </p>
        <p className="mt-0.5 text-center text-[10px] text-stone-500">
          Arraste esta janela para o outro monitor. Feche para voltar o preview
          à tela do chat.
        </p>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        {temPeca && snap ? (
          <div className="mx-auto max-w-4xl">
            <PecaDocumentoView
              peca={snap.peca}
              pecaHtml={snap.pecaHtml}
              escritorio={
                escritorio?.usarTimbre ? escritorio : undefined
              }
              exportacaoBloqueada={false}
              onCopiarTexto={() => {
                void navigator.clipboard.writeText(snap.peca);
              }}
            />
          </div>
        ) : (
          <div className="mx-auto flex max-w-md flex-col items-center justify-center py-24 text-center">
            <p className="text-sm font-medium text-facto-gold">
              Aguardando a peça
            </p>
            <p className="mt-2 text-xs text-stone-400">
              Descreva o caso no assistente da outra tela — o documento aparece
              aqui automaticamente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
