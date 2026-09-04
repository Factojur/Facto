"use client";

import { useRef, useState } from "react";
import type {
  AdesaoRedacao,
  EsforcoRedacao,
} from "@/lib/chat-redacao-opcoes";
import {
  ROTULO_ADESAO,
  ROTULO_ESFORCO,
} from "@/lib/chat-redacao-opcoes";

type Props = {
  adesao: AdesaoRedacao;
  esforco: EsforcoRedacao;
  onAdesao: (v: AdesaoRedacao) => void;
  onEsforco: (v: EsforcoRedacao) => void;
  modoWorkspace?: boolean;
  /** Modelo de peça só deste caso. */
  modeloNome?: string | null;
  onModeloArquivo?: (file: File) => Promise<void> | void;
  onRemoverModelo?: () => void;
  carregandoModelo?: boolean;
};

const ADESAO: AdesaoRedacao[] = ["livre", "fiel", "recorte"];
const ESFORCO: EsforcoRedacao[] = ["agil", "padrao", "fundo"];

function shellCls(modoWorkspace?: boolean) {
  return modoWorkspace
    ? "border-white/15 bg-white/[0.06]"
    : "border-stone-600/50 bg-stone-800/80";
}

function ativoCls(modoWorkspace?: boolean) {
  return modoWorkspace
    ? "bg-facto-gold/20 text-facto-gold ring-1 ring-facto-gold/40"
    : "bg-facto-gold/25 text-amber-50 ring-1 ring-facto-gold/45";
}

function inativoCls(modoWorkspace?: boolean) {
  return modoWorkspace
    ? "text-stone-400 hover:text-stone-200"
    : "text-stone-400 hover:text-stone-200";
}

/**
 * Modelo do caso + adesão (Livre / Fiel / Recorte) + profundidade.
 */
export function ChatRedacaoOpcoes({
  adesao,
  esforco,
  onAdesao,
  onEsforco,
  modoWorkspace,
  modeloNome,
  onModeloArquivo,
  onRemoverModelo,
  carregandoModelo = false,
}: Props) {
  const shell = shellCls(modoWorkspace);
  const btn = "rounded-full px-2 py-0.5 text-[10px] font-semibold transition";
  const inputRef = useRef<HTMLInputElement>(null);
  const [erroModelo, setErroModelo] = useState<string | null>(null);
  const temModelo = Boolean(modeloNome?.trim());

  async function aoEscolherArquivo(file: File | undefined) {
    setErroModelo(null);
    if (!file || !onModeloArquivo) return;
    const n = file.name.toLowerCase();
    if (!n.endsWith(".pdf") && !n.endsWith(".docx")) {
      setErroModelo("Use PDF ou DOCX.");
      return;
    }
    try {
      await onModeloArquivo(file);
    } catch (e) {
      setErroModelo(e instanceof Error ? e.message : "Falha ao ler o modelo.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {onModeloArquivo ? (
        <>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              void aoEscolherArquivo(f);
            }}
          />
          {temModelo ? (
            <span
              className={`inline-flex max-w-[11rem] items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                modoWorkspace
                  ? "border-facto-gold/35 bg-facto-gold/10 text-facto-gold"
                  : "border-facto-gold/40 bg-amber-50/90 text-amber-950"
              }`}
              title={`Modelo deste caso: ${modeloNome}. Livre/Fiel/Recorte definem o quanto seguir a forma.`}
            >
              <span className="truncate">Modelo: {modeloNome}</span>
              {onRemoverModelo ? (
                <button
                  type="button"
                  className="shrink-0 rounded-full px-0.5 opacity-80 hover:opacity-100"
                  title="Remover modelo deste caso"
                  aria-label="Remover modelo"
                  onClick={onRemoverModelo}
                >
                  ×
                </button>
              ) : null}
            </span>
          ) : (
            <button
              type="button"
              title="Anexe uma peça sua (PDF/DOCX) como referência de forma neste caso. Livre / Fiel / Recorte definem o quanto a FACTO a segue."
              disabled={carregandoModelo}
              className={`${btn} border ${shell} ${inativoCls(modoWorkspace)} ${
                carregandoModelo ? "opacity-50" : ""
              }`}
              onClick={() => inputRef.current?.click()}
            >
              {carregandoModelo ? "Lendo…" : "+ Modelo"}
            </button>
          )}
          {erroModelo ? (
            <span className="text-[10px] text-red-400">{erroModelo}</span>
          ) : null}
        </>
      ) : null}

      <div
        className={`inline-flex items-center gap-0.5 rounded-full border p-0.5 ${shell}`}
        role="group"
        aria-label="Adesão ao modelo do escritório"
      >
        {ADESAO.map((id) => (
          <button
            key={id}
            type="button"
            title={
              id === "livre"
                ? "A IA estrutura a peça pelo caso. Modelo/estilo, se houver, é só tom."
                : id === "fiel"
                  ? temModelo
                    ? "Segue de perto o modelo anexado (forma); fatos vêm dos autos."
                    : "Segue tom e ordem do estilo do escritório (anexe + Modelo para este caso)."
                  : temModelo
                    ? "Mantém o modelo e troca só o que os autos exigem."
                    : "Mantém o modelo/estilo e troca só o que os autos exigem."
            }
            aria-pressed={adesao === id}
            className={`${btn} ${adesao === id ? ativoCls(modoWorkspace) : inativoCls(modoWorkspace)}`}
            onClick={() => onAdesao(id)}
          >
            {ROTULO_ADESAO[id]}
          </button>
        ))}
      </div>
      <div
        className={`inline-flex items-center gap-0.5 rounded-full border p-0.5 ${shell}`}
        role="group"
        aria-label="Profundidade da redação"
      >
        {ESFORCO.map((id) => (
          <button
            key={id}
            type="button"
            title={
              id === "agil"
                ? "Mais rápida e enxuta. Ideal para peça simples ou ajuste de ritmo."
                : id === "fundo"
                  ? "Mais extensão e cuidado argumentativo. Preferível em recurso, MS, HC ou autos longos."
                  : "Equilíbrio entre profundidade e tempo. Recomendado na maioria dos casos."
            }
            aria-pressed={esforco === id}
            className={`${btn} ${esforco === id ? ativoCls(modoWorkspace) : inativoCls(modoWorkspace)}`}
            onClick={() => onEsforco(id)}
          >
            {ROTULO_ESFORCO[id]}
          </button>
        ))}
      </div>
    </div>
  );
}
