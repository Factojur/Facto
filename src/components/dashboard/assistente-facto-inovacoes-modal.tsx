"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useState } from "react";

const INOVACOES = [
  {
    titulo: "Assistente de minuta",
    texto:
      "Conte o caso em linguagem natural: o FACTO organiza área, espécie, polo e dados — caminho principal da peça.",
  },
  {
    titulo: "Preview forense grátis",
    texto:
      "Veja a peça na forma do tribunal antes de redigir. A redação completa só começa quando você confirmar.",
  },
  {
    titulo: "Lastro jurisprudencial",
    texto:
      "Pesquisa na base FACTO por casos semelhantes e julgados alinhados ao polo da peça.",
  },
  {
    titulo: "Minuta forense",
    texto:
      "Epígrafe, tipografia e export PDF/DOCX no padrão de protocolo — revise e protocole fora.",
  },
  {
    titulo: "Equipe de análise",
    texto:
      "Maestro, Analista, Pesquisa, Estrategista, Redator e Auditor trabalham em cadeia na peça.",
  },
  {
    titulo: "Estilo do escritório",
    texto:
      "Timbre, OAB e preferências de redação entram na minuta — a caneta continua sua.",
  },
] as const;

/** Painel tecnológico — portal no body para ficar na frente de tudo. */
export function AssistenteFactoInovacoesModal({
  aberto,
  onFechar,
}: {
  aberto: boolean;
  onFechar: () => void;
}) {
  const tituloId = useId();
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
    if (!aberto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onFechar();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [aberto, onFechar]);

  if (!aberto || !montado) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={tituloId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        aria-label="Fechar"
        onClick={onFechar}
      />

      <div className="relative z-10 flex max-h-[min(85vh,36rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-facto-gold/45 bg-gradient-to-br from-[#221f18] via-[#161611] to-[#0e0e0b] shadow-[0_24px_80px_-12px_rgba(0,0,0,0.85),0_0_60px_-16px_rgba(144,139,106,0.55)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(144,139,106,0.2),transparent_55%)]" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-facto-gold/10 blur-3xl" />

        <header className="relative flex shrink-0 items-start justify-between gap-3 border-b border-facto-gold/20 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-facto-gold/85">
              Sistema FACTO
            </p>
            <h2
              id={tituloId}
              className="mt-1 text-lg font-semibold text-white"
            >
              Inovações do Assistente{" "}
              <span className="assistente-ia-shimmer">IA</span>
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              O que o assistente FACTO faz na sua peça.
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="rounded-lg border border-white/10 px-2.5 py-1 text-sm text-stone-400 transition hover:border-facto-gold/40 hover:text-facto-gold"
            aria-label="Fechar painel"
          >
            ✕
          </button>
        </header>

        <div className="relative min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-5 py-4">
          {INOVACOES.map((item, i) => (
            <div
              key={item.titulo}
              className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5"
            >
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-facto-gold/35 bg-facto-gold/10 font-mono text-[10px] font-semibold text-facto-gold"
                aria-hidden
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-stone-100">
                  {item.titulo}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-stone-500">
                  {item.texto}
                </p>
              </div>
            </div>
          ))}
        </div>

        <footer className="relative shrink-0 border-t border-facto-gold/15 px-5 py-3 text-center text-[11px] text-stone-600">
          Minuta para revisar e protocolar — a decisão jurídica continua sua.
        </footer>
      </div>
    </div>,
    document.body
  );
}

export function useAssistenteInovacoesModal() {
  const [aberto, setAberto] = useState(false);
  return {
    aberto,
    abrir: () => setAberto(true),
    fechar: () => setAberto(false),
  };
}
