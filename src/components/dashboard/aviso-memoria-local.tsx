"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { lerOptInSyncNuvemChat } from "@/lib/chat-minuta-storage";

const CHAVE_DISMISS = "facto-aviso-memoria-local-v2";

export function AvisoMemoriaLocal() {
  const [visivel, setVisivel] = useState(false);
  const [syncAtivo, setSyncAtivo] = useState(false);

  useEffect(() => {
    try {
      setSyncAtivo(lerOptInSyncNuvemChat());
      setVisivel(localStorage.getItem(CHAVE_DISMISS) !== "1");
    } catch {
      setVisivel(true);
    }
  }, []);

  if (!visivel || syncAtivo) return null;

  return (
    <div
      role="status"
      className="border-b border-amber-900/40 bg-amber-950/50 px-4 py-2.5 text-center text-xs text-amber-100/90 sm:px-6"
    >
      <span>
        Por padrão, rascunhos, histórico JEC, conversas e memória de cliente ficam{" "}
        <strong className="font-medium">só neste navegador</strong>. Para sincronizar
        entre dispositivos, ative <strong className="font-medium">Nuvem</strong> no
        assistente (opt-in LGPD). Limpar dados do site apaga o conteúdo local.{" "}
        <Link href="/privacidade#sync-nuvem" className="underline hover:text-white">
          Privacidade
        </Link>
      </span>
      <button
        type="button"
        onClick={() => {
          try {
            localStorage.setItem(CHAVE_DISMISS, "1");
          } catch {
            /* ignore */
          }
          setVisivel(false);
        }}
        className="ml-3 inline text-amber-200/80 underline hover:text-white"
      >
        Entendi
      </button>
    </div>
  );
}
