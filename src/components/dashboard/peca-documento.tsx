"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { EscritorioConfig } from "@/lib/escritorio-types";
import { gerarPecaDocxBlob } from "@/lib/exportar-peca-docx";
import { gerarPecaPdfBlob } from "@/lib/exportar-peca-pdf";
import {
  abrirBlobEmNovaAba,
  abrirPreviewHtmlEmNovaAba,
} from "@/lib/abrir-documento-nova-aba";
import { ExportacaoTrialUpsell } from "@/components/dashboard/exportacao-trial-upsell";

export function PecaDocumentoView({
  peca,
  pecaHtml,
  escritorio,
  onCopiarTexto,
  exportacaoBloqueada = false,
}: {
  peca: string;
  pecaHtml: string;
  escritorio?: EscritorioConfig;
  onCopiarTexto: () => void;
  /** Trial: bloqueia Word/PDF; preview e copiar texto permanecem. */
  exportacaoBloqueada?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [baixando, setBaixando] = useState<"docx" | "pdf" | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function handleBaixarDocx() {
    if (exportacaoBloqueada) return;
    setErro(null);
    setBaixando("docx");
    try {
      const previewOk = abrirPreviewHtmlEmNovaAba(
        pecaHtml,
        "Peça FACTO — Word / visualização"
      );
      const blob = await gerarPecaDocxBlob(
        peca,
        escritorio?.usarTimbre ? escritorio : undefined
      );
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
    if (exportacaoBloqueada) return;
    setErro(null);
    setBaixando("pdf");
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
        className="w-full overflow-x-hidden rounded-lg border border-slate-200 bg-white shadow-inner [&_.documento-juridico]:max-w-full"
        dangerouslySetInnerHTML={{ __html: pecaHtml }}
      />

      {exportacaoBloqueada ? (
        <ExportacaoTrialUpsell className="mt-3" />
      ) : (
        <p className="mt-3 text-xs text-slate-500">
          Abrem em nova aba. Word pode incluir timbre; PDF e cópia usam texto limpo.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onCopiarTexto}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Copiar texto
        </button>
        {exportacaoBloqueada ? (
          <>
            <Link
              href="/dashboard/planos"
              className="rounded-lg border border-stone-300 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-600"
              title="Exportação Word nos planos pagos"
            >
              Word · assinar
            </Link>
            <Link
              href="/dashboard/planos"
              className="rounded-lg border border-stone-400 bg-stone-200 px-4 py-2 text-sm font-medium text-stone-700"
              title="Exportação PDF nos planos pagos"
            >
              PDF · assinar
            </Link>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => void handleBaixarDocx()}
              disabled={baixando !== null}
              className="rounded-lg border border-stone-600 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-50"
            >
              {baixando === "docx" ? "Gerando Word..." : "Baixar Word"}
            </button>
            <button
              type="button"
              onClick={() => void handleBaixarPdf()}
              disabled={baixando !== null}
              className="rounded-lg bg-stone-700 px-4 py-2 text-sm font-medium text-amber-50 hover:bg-stone-600 disabled:opacity-50"
            >
              {baixando === "pdf" ? "Gerando PDF..." : "Visualizar PDF"}
            </button>
          </>
        )}
      </div>

      {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}
    </div>
  );
}
