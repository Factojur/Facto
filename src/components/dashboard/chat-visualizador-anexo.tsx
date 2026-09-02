"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AnexoMemoriaItem } from "@/lib/chat-anexos-memoria";

type Props = {
  arquivos: File[];
  anexosMemoria: AnexoMemoriaItem[];
  pagina: number | null;
  trecho: string;
  onFechar: () => void;
  modoWorkspace?: boolean;
};

function extrairTextoPaginaMemoria(
  memoria: AnexoMemoriaItem[],
  pagina: number | null
): string | null {
  for (const item of memoria) {
    const texto = item.textoExtraido?.trim();
    if (!texto) continue;
    if (!pagina) return texto.slice(0, 2400);
    const re = new RegExp(
      `---\\s*página\\s+${pagina}\\s*---([\\s\\S]*?)(?=---\\s*página\\s+\\d+\\s*---|$)`,
      "i"
    );
    const m = texto.match(re);
    if (m?.[1]?.trim()) return m[1].trim().slice(0, 2400);
  }
  return null;
}

async function renderizarPaginaPdf(
  file: File,
  pagina: number,
  canvas: HTMLCanvasElement
): Promise<number> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const alvo = Math.min(Math.max(1, pagina), doc.numPages);
  const page = await doc.getPage(alvo);
  const viewport = page.getViewport({ scale: 1.35 });
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas indisponível");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  return alvo;
}

/** Visualizador de anexo na página citada (fls.). */
export function ChatVisualizadorAnexo({
  arquivos,
  anexosMemoria,
  pagina,
  trecho,
  onFechar,
  modoWorkspace = false,
}: Props) {
  const tituloId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [montado, setMontado] = useState(false);
  const [paginaRender, setPaginaRender] = useState<number | null>(pagina);
  const [textoMemoria, setTextoMemoria] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [nomeArquivo, setNomeArquivo] = useState<string>("");

  const pdfFile = arquivos.find(
    (f) => f.type.includes("pdf") || f.name.toLowerCase().endsWith(".pdf")
  );

  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
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
  }, [onFechar]);

  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      setErro(null);
      setTextoMemoria(null);
      if (pdfFile && canvasRef.current) {
        setNomeArquivo(pdfFile.name);
        try {
          const p = await renderizarPaginaPdf(
            pdfFile,
            pagina ?? 1,
            canvasRef.current
          );
          if (!cancelado) setPaginaRender(p);
        } catch (e) {
          if (!cancelado) {
            setErro(
              e instanceof Error ? e.message : "Não foi possível abrir o PDF."
            );
          }
        }
        return;
      }
      const texto = extrairTextoPaginaMemoria(anexosMemoria, pagina);
      if (texto) {
        if (!cancelado) {
          setNomeArquivo(anexosMemoria[0]?.nome ?? "Anexo");
          setTextoMemoria(texto);
          setPaginaRender(pagina);
        }
        return;
      }
      if (!cancelado) {
        setErro("Nenhum PDF do caso disponível para esta referência.");
      }
    }
    void carregar();
    return () => {
      cancelado = true;
    };
  }, [pdfFile, anexosMemoria, pagina]);

  if (!montado) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={tituloId}
    >
      <button
        type="button"
        className={`absolute inset-0 ${
          modoWorkspace ? "bg-black/80 backdrop-blur-sm" : "bg-black/65 backdrop-blur-sm"
        }`}
        aria-label="Fechar visualizador"
        onClick={onFechar}
      />
      <div className="relative z-10 flex max-h-[min(92vh,48rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-facto-gold/40 bg-stone-950 shadow-2xl">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-facto-gold/90">
              Anexo do caso
            </p>
            <h2 id={tituloId} className="mt-1 text-base font-semibold text-white">
              {paginaRender ? `Folha ${paginaRender}` : "Material anexado"}
            </h2>
            <p className="mt-0.5 text-xs text-stone-400">
              {nomeArquivo}
              {trecho.trim() ? ` · ${trecho.trim().slice(0, 60)}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-stone-300 hover:bg-white/10"
          >
            Fechar
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-auto bg-stone-900 p-4">
          {erro && (
            <p className="rounded-lg border border-amber-500/40 bg-amber-950/40 px-3 py-2 text-sm text-amber-100">
              {erro}
            </p>
          )}
          {textoMemoria && (
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-stone-200">
              {textoMemoria}
            </pre>
          )}
          {!textoMemoria && !erro && (
            <div className="flex justify-center">
              <canvas ref={canvasRef} className="max-w-full rounded-md bg-white shadow-lg" />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
