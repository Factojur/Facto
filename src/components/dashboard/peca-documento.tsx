"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { EscritorioConfig } from "@/lib/escritorio-types";
import { gerarPecaDocxBlob } from "@/lib/exportar-peca-docx";
import { gerarPecaPdfBlob } from "@/lib/exportar-peca-pdf";
import { textoPecaParaClipboard } from "@/lib/formatacao-forense";
import { abrirBlobEmNovaAba } from "@/lib/abrir-documento-nova-aba";
import { ExportacaoTrialUpsell } from "@/components/dashboard/exportacao-trial-upsell";
import { TextoJuridicoInline } from "@/components/dashboard/texto-juridico-inline";
import {
  PecaEditorMinuta,
  type PecaEditorMinutaHandle,
} from "@/components/dashboard/peca-editor-minuta";
import { PecaPreviewPaginado } from "@/components/dashboard/peca-preview-paginado";
import { ProtocoloDocsChecklist } from "@/components/dashboard/protocolo-docs-checklist";
import { conferirPecaAntesDeProtocolar } from "@/lib/checklist-conferencia-peca";
import type { AreaIdMinuta } from "@/lib/minuta-modulo";

export function PecaDocumentoView({
  peca,
  pecaHtml,
  escritorio,
  onCopiarTexto,
  onAbrirFls,
  onPecaEditada,
  exportacaoBloqueada = false,
  areaId,
  foro,
  numeroProcesso,
  previewPaginadoPadrao = false,
  riscosRodape,
  avisoScaffold,
  trechosBaseCount,
  ocultarExportacao = false,
  editorInterativo = false,
  edicaoBloqueada = false,
  onRedigir,
  confirmandoRedacao = false,
  especiePeca,
  fatos,
  pedirJusticaGratuita = false,
  modoScaffold = false,
  onAbrirEmenta,
}: {
  peca: string;
  pecaHtml: string;
  escritorio?: EscritorioConfig;
  onCopiarTexto: () => void;
  onAbrirFls?: (pagina: number | null, trecho: string) => void;
  onAbrirEmenta?: (textoEmenta: string) => void;
  onPecaEditada?: (texto: string) => void;
  exportacaoBloqueada?: boolean;
  areaId?: AreaIdMinuta | string;
  foro?: string;
  numeroProcesso?: string;
  previewPaginadoPadrao?: boolean;
  riscosRodape?: string[];
  avisoScaffold?: string | null;
  trechosBaseCount?: number;
  ocultarExportacao?: boolean;
  editorInterativo?: boolean;
  edicaoBloqueada?: boolean;
  onRedigir?: () => void;
  confirmandoRedacao?: boolean;
  especiePeca?: string;
  fatos?: string;
  pedirJusticaGratuita?: boolean;
  modoScaffold?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const editorRef = useRef<PecaEditorMinutaHandle>(null);
  const [baixando, setBaixando] = useState<"docx" | "pdf" | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [modoPreview, setModoPreview] = useState<"folhas" | "continuo">(
    previewPaginadoPadrao ? "folhas" : "continuo"
  );

  const itensConferencia = conferirPecaAntesDeProtocolar({
    peca,
    areaId,
    especie: especiePeca,
    fatos,
    numeroProcesso,
    pedirJusticaGratuita,
    modoScaffold: modoScaffold || Boolean(onRedigir),
  });
  const nAlertasConferencia = itensConferencia.filter(
    (i) => i.gravidade === "bloqueante" || i.gravidade === "alerta"
  ).length;
  const riscosUnicos = [
    ...new Set([
      ...(riscosRodape ?? []),
      ...itensConferencia.map((i) => i.texto),
    ]),
  ].slice(0, 10);

  /** Garante edição ainda em foco antes de exportar/copiar. */
  function textoCanonico(): string {
    const flushed = editorRef.current?.flushTexto();
    if (flushed?.trim()) return flushed;
    return peca;
  }

  async function handleBaixarDocx() {
    if (exportacaoBloqueada) return;
    setErro(null);
    setBaixando("docx");
    try {
      const texto = textoCanonico();
      const blob = await gerarPecaDocxBlob(
        texto,
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
      const texto = textoCanonico();
      const blob = await gerarPecaPdfBlob(texto);
      const url = URL.createObjectURL(blob);
      if (abaPdf) {
        abaPdf.location.href = url;
        window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
      } else {
        const abriu = abrirBlobEmNovaAba(blob, "peca-facto.pdf");
        if (!abriu) {
          setErro(
            "O navegador bloqueou a nova aba. Permita pop-ups para o FACTO."
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

  function handleCopiar() {
    const texto = textoPecaParaClipboard(textoCanonico());
    void navigator.clipboard.writeText(texto).then(() => {
      onCopiarTexto();
    });
  }

  const temHtml = Boolean(pecaHtml.trim());
  const usaEditorMinuta =
    editorInterativo && Boolean(peca.trim()) && Boolean(onAbrirFls);
  const usaFolhasTextoCru =
    !usaEditorMinuta &&
    modoPreview === "folhas" &&
    onAbrirFls &&
    !temHtml &&
    Boolean(peca.trim());

  return (
    <div>
      {avisoScaffold && !usaEditorMinuta ? (
        <p className="mb-3 rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-xs leading-relaxed text-amber-950">
          {avisoScaffold}
        </p>
      ) : null}

      {!ocultarExportacao && peca.trim() && !modoScaffold ? (
        <div className="sticky top-0 z-20 mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-stone-200/90 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm">
          <span className="text-[11px] font-medium text-stone-500">
            Entregar:
          </span>
          <button
            type="button"
            onClick={handleCopiar}
            className="rounded-md border border-slate-200 px-2.5 py-1 text-[12px] text-slate-700 hover:bg-slate-50"
          >
            Copiar
          </button>
          {exportacaoBloqueada ? (
            <Link
              href="/dashboard/planos"
              className="rounded-md border border-stone-300 bg-stone-100 px-2.5 py-1 text-[12px] font-medium text-stone-600"
            >
              Word/PDF · assinar
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={() => void handleBaixarDocx()}
                disabled={baixando !== null}
                className="rounded-md border border-stone-600 px-2.5 py-1 text-[12px] font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-50"
              >
                {baixando === "docx" ? "Word…" : "Word"}
              </button>
              <button
                type="button"
                onClick={() => void handleBaixarPdf()}
                disabled={baixando !== null}
                className="rounded-md bg-stone-800 px-2.5 py-1 text-[12px] font-medium text-amber-50 hover:bg-stone-700 disabled:opacity-50"
              >
                {baixando === "pdf" ? "PDF…" : "PDF"}
              </button>
            </>
          )}
          {nAlertasConferencia > 0 ? (
            <a
              href="#conferencia-peca"
              className="ml-auto rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-950 hover:bg-amber-100"
              title="Ir para o checklist de conferência"
            >
              {nAlertasConferencia} ponto
              {nAlertasConferencia === 1 ? "" : "s"} a conferir
            </a>
          ) : peca.trim().length > 400 ? (
            <span className="ml-auto text-[11px] text-emerald-800">
              Conferência ok
            </span>
          ) : null}
        </div>
      ) : null}

      {peca.trim() && onAbrirFls && !usaEditorMinuta ? (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium text-stone-500">Preview:</span>
          <button
            type="button"
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition ${
              modoPreview === "folhas"
                ? "bg-stone-800 text-amber-50"
                : "border border-stone-200 text-stone-600 hover:border-stone-400"
            }`}
            onClick={() => setModoPreview("folhas")}
          >
            Folhas A4
          </button>
          <button
            type="button"
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition ${
              modoPreview === "continuo"
                ? "bg-stone-800 text-amber-50"
                : "border border-stone-200 text-stone-600 hover:border-stone-400"
            }`}
            onClick={() => setModoPreview("continuo")}
          >
            Contínuo
          </button>
        </div>
      ) : null}

      {usaEditorMinuta ? (
        <PecaEditorMinuta
          ref={editorRef}
          peca={peca}
          onAbrirFls={onAbrirFls}
          onAbrirEmenta={onAbrirEmenta}
          onPecaEditada={onPecaEditada}
          somenteLeitura={!onPecaEditada || edicaoBloqueada}
        />
      ) : usaFolhasTextoCru ? (
        <PecaPreviewPaginado peca={peca} onAbrirFls={onAbrirFls} />
      ) : (
        <div
          ref={ref}
          className="w-full overflow-x-hidden rounded-lg border border-slate-200 bg-white shadow-inner [&_.documento-juridico]:max-w-full"
        >
          {temHtml ? (
            <div dangerouslySetInnerHTML={{ __html: pecaHtml }} />
          ) : onAbrirFls ? (
            <article className="documento-juridico p-6 text-[11pt] leading-relaxed text-slate-900">
              <div className="documento-conteudo">
                {peca.trim() ? (
                  <TextoJuridicoInline
                    texto={peca}
                    className="font-serif text-justify"
                    onAbrirFls={onAbrirFls}
                  />
                ) : (
                  <p className="text-sm text-slate-500">Redigindo peça…</p>
                )}
              </div>
            </article>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: pecaHtml }} />
          )}
        </div>
      )}

      {trechosBaseCount != null && trechosBaseCount > 0 ? (
        <p className="mt-3 text-[11px] font-medium text-stone-500">
          Base FACTO — {trechosBaseCount} trecho
          {trechosBaseCount === 1 ? "" : "s"} na fundamentação
        </p>
      ) : null}

      {onRedigir ? (
        <div className="mt-5 flex flex-col gap-2 border-t border-stone-200 pt-4">
          <p className="text-xs text-stone-500">
            Redigir consume <strong>1 crédito</strong> e gera a peça completa com
            IA.
          </p>
          <button
            type="button"
            onClick={onRedigir}
            disabled={confirmandoRedacao}
            className="w-full rounded-lg bg-stone-800 px-5 py-2.5 text-sm font-semibold text-amber-50 shadow-sm hover:bg-stone-700 disabled:opacity-60"
          >
            {confirmandoRedacao ? "Redigindo a peça…" : "Redigir (1 peça)"}
          </button>
        </div>
      ) : null}

      {riscosUnicos.length > 0 ? (
        <div
          id="conferencia-peca"
          className="mt-4 scroll-mt-16 rounded-lg border border-amber-300/80 bg-amber-50/90 px-3 py-3"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-900">
            Conferir antes de protocolar
          </p>
          <p className="mt-1 text-[11px] text-amber-900/80">
            Checklist local (0 tokens) — lastro, lacunas e fechamento. Não
            substitui a revisão do advogado.
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-950/90">
            {riscosUnicos.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {!ocultarExportacao &&
        (exportacaoBloqueada ? (
          <ExportacaoTrialUpsell className="mt-3" />
        ) : (
          <p className="mt-3 text-xs text-slate-500">
            Word e PDF usam o texto atual (com edições). Margens Times 3/2 cm;
            negrito/itálico seguem o Markdown da IA.
          </p>
        ))}

      {!ocultarExportacao ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopiar}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Copiar texto
          </button>
          {exportacaoBloqueada ? (
            <>
              <Link
                href="/dashboard/planos"
                className="rounded-lg border border-stone-300 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-600"
              >
                Word · assinar
              </Link>
              <Link
                href="/dashboard/planos"
                className="rounded-lg border border-stone-400 bg-stone-200 px-4 py-2 text-sm font-medium text-stone-700"
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
                className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-amber-50 hover:bg-stone-700 disabled:opacity-50"
              >
                {baixando === "pdf" ? "Gerando PDF..." : "Baixar PDF"}
              </button>
            </>
          )}
        </div>
      ) : null}

      {erro ? <p className="mt-2 text-sm text-red-700">{erro}</p> : null}

      {areaId && !modoScaffold ? (
        <div className="mt-4">
          <ProtocoloDocsChecklist
            areaId={areaId}
            foro={foro}
            numeroProcesso={numeroProcesso}
          />
        </div>
      ) : null}
    </div>
  );
}
