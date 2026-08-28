"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CHAVE_DISMISS = "facto-aviso-memoria-local-v1";

export function AvisoMemoriaLocal() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    try {
      setVisivel(localStorage.getItem(CHAVE_DISMISS) !== "1");
    } catch {
      setVisivel(true);
    }
  }, []);

  if (!visivel) return null;

  return (
    <div
      role="status"
      className="border-b border-amber-900/40 bg-amber-950/50 px-4 py-2.5 text-center text-xs text-amber-100/90 sm:px-6"
    >
      <span>
        Rascunhos, histórico JEC e memória de cliente ficam{" "}
        <strong className="font-medium">só neste navegador</strong> — não
        sincronizam com a nuvem. Limpar dados do site apaga esse conteúdo.{" "}
        <Link href="/privacidade" className="underline hover:text-white">
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
