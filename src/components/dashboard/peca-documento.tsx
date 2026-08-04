"use client";

import { useRef, useState } from "react";
import type { EscritorioConfig } from "@/lib/escritorio-types";
import { gerarPecaDocxBlob } from "@/lib/exportar-peca-docx";
import { gerarPecaPdfBlob } from "@/lib/exportar-peca-pdf";
import {
  abrirBlobEmNovaAba,
  abrirPreviewHtmlEmNovaAba,
} from "@/lib/abrir-documento-nova-aba";

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
      // Abre a nova aba de imediato (evita bloqueio de popup após await)
      const previewOk = abrirPreviewHtmlEmNovaAba(
        pecaHtml,
        "Peça FACTO — Word / visualização"
      );
      const blob = await gerarPecaDocxBlob(
        peca,
        escritorio?.usarTimbre ? escritorio : undefined
      );
      // Download do .docx também em fluxo de nova aba (target=_blank no fallback)
      const a = document.createElement("a");
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = "peca-facto.docx";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);

      if (!previewOk) {
        setErro(
          "O navegador bloqueou a nova aba. Permita pop-ups para o FACTO. O Word foi baixado normalmente."
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
    // Abre aba placeholder síncrona para não perder o gesto do clique (anti-popup)
    const abaPdf = window.open("about:blank", "_blank");
    try {
      if (abaPdf) {
        try {
          abaPdf.opener = null;
        } catch {
          /* ignore */
        }
        abaPdf.document.write(
          "<p style='font-family:system-ui;padding:24px'>Gerando PDF FACTO…</p>"
        );
      }
      const blob = await gerarPecaPdfBlob(peca);
      const url = URL.createObjectURL(blob);
      if (abaPdf) {
        abaPdf.location.href = url;
        window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
      } else {
        const abriu = abrirBlobEmNovaAba(blob, "peca-facto.pdf");
        if (!abriu) {
          setErro(
            "O navegador bloqueou a nova aba. Permita pop-ups para o FACTO. O PDF foi baixado como alternativa."
          );
        }
      }
    } catch (e) {
      if (abaPdf) abaPdf.close();
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
        Abrem em nova aba. Word pode incluir timbre; PDF e cópia usam texto
        limpo.
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
            : "Baixar Word"}
        </button>
        <button
          type="button"
          onClick={handleBaixarPdf}
          disabled={baixando !== null}
          className="rounded-lg bg-stone-700 px-4 py-2 text-sm font-medium text-amber-50 hover:bg-stone-600 disabled:opacity-50"
        >
          {baixando === "pdf" ? "Gerando PDF..." : "Visualizar PDF"}
        </button>
      </div>

      {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}
    </div>
  );
}
