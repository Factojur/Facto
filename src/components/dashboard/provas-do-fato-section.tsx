"use client";

import { useRef, useState } from "react";
import {
  extrairTextosDeProvas,
  type ProvaTextoCaso,
} from "@/lib/provas-caso-texto";

type Props = {
  provas: ProvaTextoCaso[];
  onProvasChange: (provas: ProvaTextoCaso[]) => void;
  linkNuvem: string;
  onLinkNuvemChange: (v: string) => void;
  midiasNomes: string[];
  onMidiasChange: (nomes: string[]) => void;
  mostrarMidiasOpcionais: boolean;
  onMostrarMidiasChange: (v: boolean) => void;
};

export function ProvasDoFatoSection({
  provas,
  onProvasChange,
  linkNuvem,
  onLinkNuvemChange,
  midiasNomes,
  onMidiasChange,
  mostrarMidiasOpcionais,
  onMostrarMidiasChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const midiasRef = useRef<HTMLInputElement>(null);
  const [extraindo, setExtraindo] = useState(false);
  const [avisos, setAvisos] = useState<string[]>([]);

  async function onSelecionarProvas(files: FileList | null) {
    if (!files?.length) return;
    setExtraindo(true);
    setAvisos([]);
    try {
      const { provas: extraidas, avisos: av } = await extrairTextosDeProvas(
        Array.from(files)
      );
      onProvasChange(extraidas);
      setAvisos(av);
    } finally {
      setExtraindo(false);
    }
  }

  function onSelecionarMidias(files: FileList | null) {
    if (!files?.length) return;
    onMidiasChange(Array.from(files).map((f) => f.name));
  }

  const comTexto = provas.filter((p) => p.texto.trim().length >= 40).length;

  return (
    <section
      id="secao-provas"
      className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="mb-1 text-lg font-semibold text-slate-800">
        Provas do fato
      </h2>
      <p className="mb-4 text-sm leading-relaxed text-slate-500">
        PDFs, Word e imagens (prints) são lidos pelo FACTO para fundamentar
        fatos e direito. O conteúdo entra na redação; o protocolo e o link de
        nuvem ficam a seu cargo.
      </p>

      <div className="space-y-5">
        <div>
          <label
            htmlFor="provasEssenciais"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Documentos e imagens de prova
          </label>
          <input
            ref={inputRef}
            id="provasEssenciais"
            type="file"
            accept="image/*,.pdf,.doc,.docx,.heic,.heif,.webp"
            multiple
            disabled={extraindo}
            onChange={(e) => {
              void onSelecionarProvas(e.target.files);
            }}
            className="block w-full cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-stone-700 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-amber-50 hover:file:bg-stone-600 disabled:opacity-60"
          />
          {extraindo && (
            <p className="mt-2 text-xs text-stone-600" role="status">
              Lendo documentos (texto nativo ou OCR leve em imagens/PDF
              escaneado)…
            </p>
          )}
          {provas.length > 0 && !extraindo && (
            <ul className="mt-3 space-y-3 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
              {provas.map((p) => (
                <li key={p.id} className="space-y-1">
                  <div className="flex items-start gap-2">
                    <span
                      className={
                        p.texto.trim().length >= 40
                          ? "text-emerald-700"
                          : "text-amber-700"
                      }
                      aria-hidden
                    >
                      {p.texto.trim().length >= 40 ? "✓" : "○"}
                    </span>
                    <span className="font-medium text-slate-800">
                      {p.nome}
                      {p.origemTexto === "ocr" && (
                        <span className="ml-1 font-normal text-stone-500">
                          (OCR)
                        </span>
                      )}
                    </span>
                  </div>
                  {p.sintese && (
                    <p className="pl-5 leading-relaxed text-slate-600">
                      {p.sintese}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
          {comTexto > 0 && (
            <p className="mt-2 text-xs text-emerald-800">
              {comTexto} documento{comTexto !== 1 ? "s" : ""} com texto
              interpretado na fundamentação.
            </p>
          )}
          {avisos.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-amber-900">
              {avisos.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          )}
          {provas.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onProvasChange([]);
                setAvisos([]);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="mt-2 text-xs font-medium text-slate-500 hover:text-red-600"
            >
              Limpar seleção
            </button>
          )}
        </div>

        <div>
          <label
            htmlFor="linkNuvem"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Link da nuvem (Drive / Dropbox / OneDrive)
          </label>
          <p className="mb-2 text-xs text-slate-500">
            O FACTO não acessa o link — reproduz na peça para magistrado,
            serventia e partes consultarem o acervo digital, no padrão forense
            de menção a provas em nuvem.
          </p>
          <input
            id="linkNuvem"
            type="url"
            value={linkNuvem}
            onChange={(e) => onLinkNuvemChange(e.target.value)}
            placeholder="https://drive.google.com/drive/folders/..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
          />
        </div>

        <div className="border-t border-slate-100 pt-4">
          <label className="flex items-start gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={mostrarMidiasOpcionais}
              onChange={(e) => onMostrarMidiasChange(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-stone-700 focus:ring-stone-500"
            />
            <span>
              <span className="font-medium text-slate-800">
                Incluir áudios e vídeos na relação de anexos
              </span>
            </span>
          </label>
          <div className={mostrarMidiasOpcionais ? "mt-3" : "hidden"}>
            <input
              ref={midiasRef}
              id="midias"
              type="file"
              accept="audio/*,video/*,.mp3,.wav,.m4a,.ogg,.mp4,.mov,.avi,.mkv,.webm"
              multiple
              onChange={(e) => onSelecionarMidias(e.target.files)}
              className="block w-full cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-stone-700 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-amber-50 hover:file:bg-stone-600"
            />
            {midiasNomes.length > 0 && (
              <p className="mt-2 text-xs text-slate-600">
                Mídias: {midiasNomes.join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
