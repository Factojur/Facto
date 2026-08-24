"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CHAVE_DISMISS = "facto-estilo-cta-dismiss";

export function EstiloRedacaoDestaque() {
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
    <section className="relative px-6 md:px-10">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-stone-900/90 via-stone-950 to-stone-900 p-6 shadow-lg md:p-8">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-facto-gold/10 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-facto-gold">
              Diferencial FACTO
            </p>
            <h2 className="mt-2 text-xl font-bold text-white md:text-2xl">
              Peças no tom do seu escritório{" "}
              <span className="font-normal text-stone-400">(opcional)</span>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-400">
              Envie até três peças de referência. O FACTO interpreta tom,
              extensão e forma dos pedidos — sem copiar fatos — e aplica nas
              próximas gerações, com o rito forense intacto.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <Link
              href="/dashboard/perfil#estilo-redacao"
              className="inline-flex items-center justify-center rounded-lg bg-facto-gold px-5 py-2.5 text-sm font-semibold text-facto-dark transition hover:bg-[#a39a78]"
            >
              Configurar estilo
            </Link>
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
              className="text-sm text-stone-500 hover:text-stone-300"
            >
              Ocultar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
