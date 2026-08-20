"use client";

import { useEffect, useState } from "react";
import {
  LIMITE_ARQUIVO_LOCAL_BYTES,
  MIN_CHARS_TEXTO_UTIL,
  extrairTextoArquivoLocal,
} from "@/lib/extrair-texto-cliente";
import {
  LIMITE_UPLOAD_ANALISE_BYTES,
  type LeituraRelato,
  type PreenchimentoEntradaCaso,
} from "@/lib/entrada-caso-types";
import type { ResumoCota } from "@/lib/cota-pecas";
import { juntarTranscricao } from "@/lib/transcrever-audio";
import { BotaoFalarCampo } from "@/components/dashboard/botao-falar-campo";

type ArquivoEnvio = { nome: string; mimeType: string; base64: string };

type Props = {
  areaId: string;
  onPreenchido: (p: {
    preenchimento: PreenchimentoEntradaCaso;
    teses: { id: string; rotulo: string; artigos: string }[];
    leituraRelato?: LeituraRelato;
  }) => void;
  onErro: (msg: string) => void;
  /** Mesma transcrição da Entrada, sem segunda chamada Gemini. */
  onRelatoTranscrito?: (texto: string) => void;
};

async function arquivoParaBase64(file: File): Promise<ArquivoEnvio> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return {
    nome: file.name,
    mimeType: file.type || "application/pdf",
    base64: btoa(binary),
  };
}

export function EntradaCasoSection({
  areaId,
  onPreenchido,
  onErro,
  onRelatoTranscrito,
}: Props) {
  const [relato, setRelato] = useState("");
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [cota, setCota] = useState<ResumoCota | null>(null);
  const [leitura, setLeitura] = useState<LeituraRelato | null>(null);

  useEffect(() => {
    void fetch("/api/cota")
      .then((r) => r.json())
      .then((d: { cota?: ResumoCota }) => {
        if (d.cota) setCota(d.cota);
      })
      .catch(() => {
        /* saldo opcional */
      });
  }, []);

  async function handlePreencher() {
    if (relato.trim().length < 40 && arquivos.length === 0) {
      onErro("Cole o caso ou anexe um PDF/DOCX.");
      return;
    }
    if (cota?.trackingAtivo && cota.esgotadaAnalises) {
      onErro(
        "Limite mensal de consultas atingido. A entrada do caso consome 1 consulta do plano (diferente de gerar a minuta)."
      );
      return;
    }
    setEnviando(true);
    onErro("");
    try {
      const payloadArquivos: ArquivoEnvio[] = [];
      let relatoMaisTexto = relato.trim();
      for (const file of arquivos.slice(0, 4)) {
        if (file.size > LIMITE_ARQUIVO_LOCAL_BYTES) {
          onErro(`“${file.name}” passa de 40 MB.`);
          return;
        }
        try {
          const texto = await extrairTextoArquivoLocal(file);
          if (texto.length >= MIN_CHARS_TEXTO_UTIL) {
            relatoMaisTexto = [relatoMaisTexto, `--- ${file.name} ---\n${texto}`]
              .filter(Boolean)
              .join("\n\n");
            continue;
          }
        } catch {
          /* tenta OCR no servidor */
        }
        if (file.size > LIMITE_UPLOAD_ANALISE_BYTES) {
          onErro(
            `“${file.name}” parece escaneado e é grande demais para leitura automática aqui. Cole o texto ou envie um PDF mais leve.`
          );
          return;
        }
        payloadArquivos.push(await arquivoParaBase64(file));
      }

      const res = await fetch("/api/entrada-caso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          relato: relatoMaisTexto,
          areaId,
          arquivos: payloadArquivos,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        preenchimento?: PreenchimentoEntradaCaso;
        teses?: { id: string; rotulo: string; artigos: string }[];
        leituraRelato?: LeituraRelato;
      };
      if (!res.ok || !data.preenchimento) {
        onErro(data.error ?? `Falha ao preencher (HTTP ${res.status}).`);
        return;
      }
      if (data.leituraRelato) setLeitura(data.leituraRelato);
      onPreenchido({
        preenchimento: data.preenchimento,
        teses: data.teses ?? [],
        leituraRelato: data.leituraRelato,
      });
    } catch (erro) {
      onErro(
        erro instanceof Error
          ? erro.message
          : "Não foi possível preencher o formulário."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="rounded-lg border border-stone-300 bg-stone-50 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Entrada do caso</h2>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">
        Cole o relato, fale o caso, cole um e-mail do cliente ou anexe o PDF. O
        FACTO preenche as três abas para você conferir. A peça só nasce no
        botão Gerar, em Pedidos — nada é protocolado daqui.
      </p>
      {cota?.trackingAtivo && cota.usoLabelAnalises ? (
        <p className="mt-2 text-xs font-medium text-slate-600">
          {cota.usoLabelAnalises} · esta entrada usa 1 consulta do plano
        </p>
      ) : (
        <p className="mt-2 text-xs text-slate-500">
          Esta entrada usa 1 consulta do plano (não consome minuta).
        </p>
      )}
      <textarea
        rows={6}
        value={relato}
        onChange={(e) => setRelato(e.target.value)}
        placeholder="Ex.: Cliente comprou notebook no site em 02/08, recebeu em 05/08, pediu arrependimento no 6º dia e a loja recusou a devolução…"
        className="mt-3 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
      />
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="text-sm text-slate-700">
          <span className="sr-only">Anexar PDF ou Word</span>
          <input
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
            multiple
            onChange={(e) =>
              setArquivos(Array.from(e.target.files ?? []).slice(0, 4))
            }
            className="block w-full cursor-pointer text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-stone-700 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-amber-50 hover:file:bg-stone-600"
          />
        </label>
        <BotaoFalarCampo
          disabled={enviando}
          areaId={areaId}
          onTranscrito={(texto) => {
            setRelato((atual) => juntarTranscricao(atual, texto));
            onRelatoTranscrito?.(texto);
          }}
        />
        <button
          type="button"
          onClick={() => void handlePreencher()}
          disabled={enviando}
          className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-amber-50 hover:bg-stone-700 disabled:opacity-60"
        >
          {enviando ? "Preenchendo o formulário…" : "Preencher as três abas"}
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Falar coloca o texto aqui e na aba Fatos (uma transcrição). Confira nomes
        e números. Preencher as três abas continua no clique e usa 1 análise.
      </p>
      {arquivos.length > 0 && (
        <p className="mt-2 text-xs text-slate-500">
          {arquivos.map((f) => f.name).join(" · ")}
        </p>
      )}
      {leitura?.resumo ? (
        <p className="mt-2 text-xs text-slate-600">{leitura.resumo}</p>
      ) : null}
      {leitura?.trecho ? (
        <details className="mt-1">
          <summary className="cursor-pointer text-xs text-slate-500">
            Trecho lido
          </summary>
          <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-slate-500">
            {leitura.trecho}
          </p>
        </details>
      ) : null}
    </section>
  );
}
