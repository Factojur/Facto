"use client";

import { dividirPecaEmPaginas } from "@/lib/peca-paginas-preview";
import { TextoJuridicoInline } from "@/components/dashboard/texto-juridico-inline";
import { useMemo } from "react";

export function PecaPreviewPaginado({
  peca,
  onAbrirFls,
}: {
  peca: string;
  onAbrirFls?: (pagina: number | null, trecho: string) => void;
}) {
  const paginas = useMemo(() => dividirPecaEmPaginas(peca), [peca]);

  if (!peca.trim()) {
    return <p className="text-sm text-slate-500">Redigindo peça…</p>;
  }

  return (
    <div className="flex flex-col items-center gap-4 bg-stone-100/80 py-4">
      {paginas.map((blocos, idx) => (
        <article
          key={`pag-${idx}`}
          className="relative w-full max-w-[min(100%,210mm)] bg-white shadow-md ring-1 ring-stone-200/80"
          style={{
            minHeight: "min(297mm, 72vh)",
            padding: "18mm 20mm 22mm",
          }}
        >
          <div className="font-serif text-[11pt] leading-[1.55] text-justify text-slate-900">
            {blocos.map((bloco, bi) => (
              <p key={`${idx}-${bi}`} className="mb-3 whitespace-pre-wrap">
                <TextoJuridicoInline
                  texto={bloco}
                  onAbrirFls={onAbrirFls}
                  className="inline"
                />
              </p>
            ))}
          </div>
          <footer className="pointer-events-none absolute bottom-3 right-5 text-[10px] text-stone-400">
            Folha {idx + 1} de {paginas.length}
          </footer>
        </article>
      ))}
    </div>
  );
}
