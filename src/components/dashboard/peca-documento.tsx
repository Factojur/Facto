"use client";

import { useRef, useState } from "react";
import type { EscritorioConfig } from "@/lib/escritorio-types";
import { baixarPecaDocx } from "@/lib/exportar-peca-docx";
import { baixarPecaPdf } from "@/lib/exportar-peca-pdf";

export function PecaDocumentoView({
  peca,
  pecaHtml,
  escritorio,
  onCopiarTexto,
}: {
  peca: string;
  pecaHtml: string;
  escritorio?: EscritorioConfig;
  onCopiarTexto: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [baixando, setBaixando] = useState<"docx" | "pdf" | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function handleBaixarDocx() {
    setErro(null);
    setBaixando("docx");
    try {
      await baixarPecaDocx(
        peca,
        escritorio?.usarTimbre ? escritorio : undefined
      );
    } catch {
      setErro("Não foi possível gerar o arquivo Word.");
    }
    setBaixando(null);
  }

  async function handleBaixarPdf() {
    setErro(null);
    setBaixando("pdf");
    try {
      await baixarPecaPdf(pecaHtml);
    } catch (e) {
      const detalhe = e instanceof Error ? e.message : "";
      setErro(
        detalhe
          ? `Não foi possível gerar o PDF: ${detalhe}`
          : "Não foi possível gerar o arquivo PDF."
      );
    }
    setBaixando(null);
  }

  return (
    <div>
      <div
        ref={ref}
        className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-8 shadow-inner"
        dangerouslySetInnerHTML={{ __html: pecaHtml }}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onCopiarTexto}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Copiar texto
        </button>
        <button
          type="button"
          onClick={handleBaixarDocx}
          disabled={baixando !== null}
          className="rounded-lg border border-stone-600 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-50"
        >
          {baixando === "docx" ? "Gerando Word..." : "Baixar em Word (.docx)"}
        </button>
        <button
          type="button"
          onClick={handleBaixarPdf}
          disabled={baixando !== null}
          className="rounded-lg bg-stone-700 px-4 py-2 text-sm font-medium text-amber-50 hover:bg-stone-600 disabled:opacity-50"
        >
          {baixando === "pdf" ? "Gerando PDF..." : "Baixar em PDF"}
        </button>
      </div>

      {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}
    </div>
  );
}
