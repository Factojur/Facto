"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useState } from "react";
import { JurisSugestoesPicker } from "@/components/dashboard/juris-sugestoes-picker";
import type { JurisCasoSalvo } from "@/components/dashboard/juris-caso-form";
import type { AreaIdMinuta } from "@/lib/minuta-modulo";

const ACCEPT_ANEXOS =
  ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png";

type FocoComplemento = "provas" | "juris" | "lei";

type Props = {
  modoWorkspace?: boolean;
  onFechar: () => void;
  arquivos: File[];
  onArquivosChange: (files: File[]) => void;
  provasUtil: number;
  jurisCount: number;
  temLeiMunicipal: boolean;
  processandoDocumentos?: boolean;
  enviando?: boolean;
  envioDesabilitado?: boolean;
  consultaJuris: string;
  areaId: AreaIdMinuta;
  ufForo?: string | null;
  jurisUploads: JurisCasoSalvo[];
  onJurisAplicar: (itens: JurisCasoSalvo[]) => void;
  onAbrirComplementos: (foco: FocoComplemento) => void;
  onEnviar: () => void;
};

/** Painel de anexos — portal no body, sempre na frente de tudo. */
export function ChatAnexosBanner({
  modoWorkspace = false,
  onFechar,
  arquivos,
  onArquivosChange,
  provasUtil,
  jurisCount,
  temLeiMunicipal,
  processandoDocumentos = false,
  enviando = false,
  envioDesabilitado = false,
  consultaJuris,
  areaId,
  ufForo,
  jurisUploads,
  onJurisAplicar,
  onAbrirComplementos,
  onEnviar,
}: Props) {
  const tituloId = useId();
  const inputId = useId();
  const [baseFactoAberta, setBaseFactoAberta] = useState(false);
  const [montado, setMontado] = useState(false);
  const consultaOk = consultaJuris.trim().length >= 40;
  const podeEnviar = arquivos.length > 0;

  const rowBtn =
    "flex w-full items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left text-sm transition hover:border-facto-gold/35 hover:bg-white/[0.06]";

  function adicionarArquivos(files: FileList | File[] | null) {
    if (!files?.length) return;
    onArquivosChange(Array.from(files).slice(0, 4));
  }

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

  if (!montado) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={tituloId}
    >
      <button
        type="button"
        className={`absolute inset-0 ${
          modoWorkspace ? "bg-black/75 backdrop-blur-sm" : "bg-black/60 backdrop-blur-sm"
        }`}
        aria-label="Fechar anexos"
        onClick={onFechar}
      />

      <div className="relative z-10 flex max-h-[min(85vh,32rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-facto-gold/45 bg-gradient-to-br from-[#221f18] via-[#161611] to-[#0e0e0b] shadow-[0_24px_80px_-12px_rgba(0,0,0,0.85),0_0_60px_-16px_rgba(144,139,106,0.55)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(144,139,106,0.18),transparent_55%)]" />
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-facto-gold/10 blur-3xl" />

        <header className="relative flex shrink-0 items-start justify-between gap-3 border-b border-facto-gold/20 px-4 py-3 sm:px-5 sm:py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-facto-gold/85">
              Material do caso
            </p>
            <h2 id={tituloId} className="mt-1 text-base font-semibold text-white sm:text-lg">
              Anexar ao relato
            </h2>
            <p className="mt-0.5 text-[11px] text-stone-500 sm:text-xs">
              Autos, PDF, provas, lei, jurisprudência ou base FACTO.
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="rounded-lg border border-white/10 px-2.5 py-1 text-sm text-stone-400 transition hover:border-facto-gold/40 hover:text-facto-gold"
            aria-label="Fechar painel de anexos"
          >
            ✕
          </button>
        </header>

        <div className="relative min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5 sm:py-4">
          <input
            id={inputId}
            type="file"
            accept={ACCEPT_ANEXOS}
            multiple
            className="sr-only"
            onChange={(e) => adicionarArquivos(e.target.files)}
          />
          <label htmlFor={inputId} className={`${rowBtn} cursor-pointer text-stone-100`}>
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-facto-gold/35 bg-facto-gold/10 text-base"
              aria-hidden
            >
              📄
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">Documentos no relato</span>
              <span className="mt-0.5 block text-[11px] text-stone-500">
                Autos, PDF, DOCX ou imagem (até 4 arquivos)
              </span>
            </span>
            {arquivos.length > 0 && (
              <span className="rounded-full bg-facto-gold/20 px-2 py-0.5 text-[10px] font-semibold text-facto-gold">
                {arquivos.length}
              </span>
            )}
          </label>

          <button
            type="button"
            className={`${rowBtn} text-stone-100`}
            onClick={() => {
              onFechar();
              onAbrirComplementos("provas");
            }}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-facto-gold/35 bg-facto-gold/10 text-sm font-semibold text-facto-gold"
              aria-hidden
            >
              ✓
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">Provas do fato</span>
              <span className="mt-0.5 block text-[11px] text-stone-500">
                Contratos, prints e documentos do caso
              </span>
            </span>
            {provasUtil > 0 && (
              <span className="text-[10px] text-stone-500">{provasUtil}</span>
            )}
          </button>

          <button
            type="button"
            className={`${rowBtn} text-stone-100`}
            onClick={() => {
              onFechar();
              onAbrirComplementos("juris");
            }}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-facto-gold/35 bg-facto-gold/10 text-sm font-semibold text-facto-gold"
              aria-hidden
            >
              §
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">Lei e juris do caso</span>
              <span className="mt-0.5 block text-[11px] text-stone-500">
                Norma municipal ou julgado que você já tem
              </span>
            </span>
            {(jurisCount > 0 || temLeiMunicipal) && (
              <span className="text-[10px] text-stone-500">
                {jurisCount + (temLeiMunicipal ? 1 : 0)}
              </span>
            )}
          </button>

          <button
            type="button"
            disabled={!consultaOk}
            className={`${rowBtn} text-stone-100 disabled:opacity-40`}
            title={
              consultaOk
                ? "Buscar no acervo FACTO"
                : "Conte o caso primeiro (≥40 caracteres)"
            }
            onClick={() => setBaseFactoAberta((v) => !v)}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-facto-gold/35 bg-facto-gold/10 text-sm font-semibold text-facto-gold"
              aria-hidden
            >
              ★
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">Base FACTO</span>
              <span className="mt-0.5 block text-[11px] text-stone-500">
                Julgados curados por teses do relato
              </span>
            </span>
            <span className="text-[10px] text-stone-500">
              {baseFactoAberta ? "▴" : "▾"}
            </span>
          </button>

          {baseFactoAberta && consultaOk && (
            <div className="max-h-[min(32vh,220px)] overflow-y-auto rounded-lg border border-white/10 bg-black/30 p-2">
              <JurisSugestoesPicker
                consulta={consultaJuris.slice(0, 2500)}
                areaId={areaId}
                ufForo={ufForo}
                uploads={jurisUploads}
                onAplicar={(itens) => {
                  onJurisAplicar(itens);
                  onFechar();
                  setBaseFactoAberta(false);
                }}
              />
            </div>
          )}

          {arquivos.length > 0 && (
            <p className="truncate px-1 text-[11px] text-stone-500">
              Na fila: {arquivos.map((f) => f.name).join(", ")}
            </p>
          )}

          {processandoDocumentos && (
            <p className="px-1 text-[11px] text-amber-400" aria-live="polite">
              Lendo documentos (OCR se necessário)…
            </p>
          )}
        </div>

        <footer className="relative flex shrink-0 flex-col gap-2 border-t border-facto-gold/15 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-[11px] leading-relaxed text-stone-500">
            {arquivos.length > 0
              ? `${arquivos.length} arquivo${arquivos.length !== 1 ? "s" : ""} na fila — o assistente lê e organiza o caso.`
              : "Escolha documentos ou abra provas/lei/juris abaixo."}
          </p>
          <button
            type="button"
            disabled={!podeEnviar || enviando || envioDesabilitado}
            onClick={onEnviar}
            className="shrink-0 rounded-lg bg-facto-gold px-4 py-2 text-sm font-semibold text-facto-dark transition hover:bg-[#a39a78] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {enviando ? "Enviando…" : "Enviar"}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
