"use client";

import { useEffect, useState } from "react";
import {
  LIMITE_ARQUIVO_LOCAL_BYTES,
  MIN_CHARS_TEXTO_UTIL,
  extrairTextoArquivoLocal,
} from "@/lib/extrair-texto-cliente";
import type { AnaliseProcessoResultado } from "@/lib/analisar-processo-types";
import {
  ROTULO_DOC_LABEL,
  ROTULOS_DOC_PROCESSO,
  type RotuloDocProcesso,
} from "@/lib/analisar-processo-types";
import type { ResumoCota } from "@/lib/cota-pecas";

type ArquivoLocal = {
  id: string;
  file: File;
  rotulo: RotuloDocProcesso;
};

type Props = {
  onResultado: (analise: AnaliseProcessoResultado) => void;
  onErro: (msg: string) => void;
};

export function AnalisarProcessoSection({ onResultado, onErro }: Props) {
  const [modoUpload, setModoUpload] = useState<"completos" | "seletivo">(
    "seletivo"
  );
  const [arquivos, setArquivos] = useState<ArquivoLocal[]>([]);
  const [analisando, setAnalisando] = useState(false);
  const [cota, setCota] = useState<ResumoCota | null>(null);

  useEffect(() => {
    void fetch("/api/cota")
      .then((r) => r.json())
      .then((d: { cota?: ResumoCota }) => {
        if (d.cota) setCota(d.cota);
      })
      .catch(() => {
        /* saldo opcional na UI */
      });
  }, []);

  function adicionarArquivos(list: FileList | null, rotulo: RotuloDocProcesso) {
    if (!list?.length) return;
    const novos: ArquivoLocal[] = [];
    for (const file of Array.from(list)) {
      novos.push({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        rotulo,
      });
    }
    setArquivos((prev) => [...prev, ...novos].slice(0, 6));
  }

  async function handleAnalisar() {
    if (arquivos.length === 0) {
      onErro("Selecione ao menos um PDF ou DOCX.");
      return;
    }
    if (cota?.trackingAtivo && cota.esgotadaAnalises) {
      onErro(
        "Limite mensal de análises atingido. Compre o pacote +10 análises no perfil ou aguarde o próximo ciclo."
      );
      return;
    }
    const totalBytes = arquivos.reduce((s, a) => s + a.file.size, 0);
    if (totalBytes > LIMITE_ARQUIVO_LOCAL_BYTES) {
      onErro(
        "Os arquivos somam mais de 40 MB. Envie as peças principais (sentença, inicial, contestação) em vez dos autos inteiros."
      );
      return;
    }
    setAnalisando(true);
    onErro("");
    try {
      const documentos: { nome: string; texto: string; rotulo: string }[] = [];
      for (const a of arquivos) {
        const texto = await extrairTextoArquivoLocal(a.file);
        if (texto.length < MIN_CHARS_TEXTO_UTIL) {
          onErro(
            `Não foi possível extrair texto de “${a.file.name}”. PDF escaneado (imagem) precisa de OCR; envie um PDF com texto selecionável.`
          );
          return;
        }
        documentos.push({
          nome: a.file.name,
          texto,
          rotulo: modoUpload === "completos" ? "autos_completos" : a.rotulo,
        });
      }

      const res = await fetch("/api/analisar-processo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentos }),
      });
      if (res.status === 413) {
        onErro(
          "O texto extraído ainda ficou grande demais para o servidor. Envie só a sentença ou a inicial."
        );
        return;
      }
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        analise?: AnaliseProcessoResultado;
      };
      if (!res.ok || !data.analise) {
        onErro(data.error ?? `Falha na análise (HTTP ${res.status}).`);
        return;
      }
      onResultado(data.analise);
    } catch (erro) {
      onErro(
        erro instanceof Error
          ? erro.message
          : "Não foi possível analisar o processo. Tente novamente."
      );
    } finally {
      setAnalisando(false);
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-stone-200 bg-stone-50/80 p-4">
      <div>
        <p className="text-sm font-medium text-slate-800">Analisar processo</p>
        <p className="mt-1 text-xs text-slate-500">
          Envie os autos completos ou apenas as peças relevantes. A IA monta a
          ficha e sugere a peça cabível — você confirma antes de gerar. Consome
          1 análise do plano, não a cota de peça.
        </p>
        {cota?.trackingAtivo && cota.usoLabelAnalises ? (
          <p className="mt-2 text-xs font-medium text-slate-600">
            {cota.usoLabelAnalises}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setModoUpload("completos")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
            modoUpload === "completos"
              ? "bg-stone-700 text-amber-50"
              : "border border-slate-300 bg-white text-slate-700"
          }`}
        >
          Autos completos
        </button>
        <button
          type="button"
          onClick={() => setModoUpload("seletivo")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
            modoUpload === "seletivo"
              ? "bg-stone-700 text-amber-50"
              : "border border-slate-300 bg-white text-slate-700"
          }`}
        >
          Peças selecionadas
        </button>
      </div>

      {modoUpload === "completos" ? (
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            PDF/DOCX dos autos (até 6 arquivos, 40 MB no total)
          </label>
          <input
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            multiple
            onChange={(e) => {
              setArquivos([]);
              adicionarArquivos(e.target.files, "autos_completos");
              e.target.value = "";
            }}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-stone-200 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-stone-800"
          />
        </div>
      ) : (
        <div className="space-y-2">
          {(
            [
              "peticao_inicial",
              "contestacao",
              "sentenca",
              "decisao",
              "recurso",
              "outros",
            ] as RotuloDocProcesso[]
          ).map((rotulo) => (
            <div key={rotulo} className="flex flex-wrap items-center gap-2">
              <span className="w-36 text-xs font-medium text-slate-600">
                {ROTULO_DOC_LABEL[rotulo]}
              </span>
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                multiple
                onChange={(e) => {
                  adicionarArquivos(e.target.files, rotulo);
                  e.target.value = "";
                }}
                className="block min-w-0 flex-1 text-xs text-slate-600 file:mr-2 file:rounded-md file:border-0 file:bg-stone-200 file:px-2 file:py-1 file:text-xs file:font-medium"
              />
            </div>
          ))}
        </div>
      )}

      {arquivos.length > 0 && (
        <ul className="space-y-1 text-xs text-slate-600">
          {arquivos.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-2 rounded border border-slate-200 bg-white px-2 py-1"
            >
              <span className="truncate">
                <span className="font-medium text-slate-700">
                  {ROTULO_DOC_LABEL[a.rotulo]}:
                </span>{" "}
                {a.file.name}
              </span>
              <button
                type="button"
                onClick={() =>
                  setArquivos((prev) => prev.filter((x) => x.id !== a.id))
                }
                className="shrink-0 text-stone-500 underline hover:text-stone-800"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => void handleAnalisar()}
        disabled={
          analisando ||
          arquivos.length === 0 ||
          Boolean(cota?.trackingAtivo && cota.esgotadaAnalises)
        }
        className="rounded-lg bg-stone-700 px-4 py-2 text-sm font-medium text-amber-50 hover:bg-stone-600 disabled:opacity-60"
      >
        {analisando
          ? "Analisando documentos…"
          : cota?.trackingAtivo && cota.esgotadaAnalises
            ? "Cota de análises esgotada"
            : "Analisar e sugerir peça"}
      </button>

      <p className="text-[11px] text-slate-500">
        Tipos aceitos: {ROTULOS_DOC_PROCESSO.map((r) => ROTULO_DOC_LABEL[r]).join(", ")}.
        O texto é lido no seu computador (até 40 MB). PDF escaneado sem OCR
        não funciona.
      </p>
    </div>
  );
}
