"use client";

import { useRef, useState } from "react";
import type { EscritorioConfig } from "@/lib/escritorio-types";
import { gerarPecaDocxBlob } from "@/lib/exportar-peca-docx";
import { gerarPecaPdfBlob } from "@/lib/exportar-peca-pdf";
import {
  abrirBlobEmNovaAba,
  abrirPreviewHtmlEmNovaAba,
} from "@/lib/abrir-documento-nova-aba";
import { saveAs } from "file-saver";

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
      // Preview em nova aba (dashboard permanece) + download do .docx
      const abriu = abrirPreviewHtmlEmNovaAba(
        pecaHtml,
        "Peça FACTO — Word / visualização"
      );
      const blob = await gerarPecaDocxBlob(
        peca,
        escritorio?.usarTimbre ? escritorio : undefined
      );
      saveAs(blob, "peca-facto.docx");
      if (!abriu) {
        setErro(
          "O navegador bloqueou a nova aba. Permita pop-ups para visualizar sem sair da dashboard. O Word foi baixado normalmente."
        );
      }
    } catch {
      setErro("Não foi possível gerar o arquivo Word.");
    }
    setBaixando(null);
  }

  async function handleBaixarPdf() {
    setErro(null);
    setBaixando("pdf");
    try {
      const blob = await gerarPecaPdfBlob(peca);
      const abriu = abrirBlobEmNovaAba(blob, "peca-facto.pdf");
      if (!abriu) {
        setErro(
          "O navegador bloqueou a nova aba. Permita pop-ups para o FACTO. O PDF foi baixado como alternativa."
        );
      }
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
        className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-inner"
        dangerouslySetInnerHTML={{ __html: pecaHtml }}
      />

      <p className="mt-3 text-xs text-slate-500">
        PDF e Word abrem em <strong>nova aba</strong> para você revisar sem perder
        a tela de elaboração. Formatação forense: Times 12, entrelinha 1,5,
        margens 3/2 cm e ~10 linhas após o endereçamento.
      </p>

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
          {baixando === "docx"
            ? "Gerando Word..."
            : "Abrir Word em nova aba"}
        </button>
        <button
          type="button"
          onClick={handleBaixarPdf}
          disabled={baixando !== null}
          className="rounded-lg bg-stone-700 px-4 py-2 text-sm font-medium text-amber-50 hover:bg-stone-600 disabled:opacity-50"
        >
          {baixando === "pdf" ? "Gerando PDF..." : "Abrir PDF em nova aba"}
        </button>
      </div>

      {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}
    </div>
  );
}
