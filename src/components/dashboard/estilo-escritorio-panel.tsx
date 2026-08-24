"use client";

import { useCallback, useEffect, useState } from "react";

function lerArquivoBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      const base64 = data.includes(",") ? data.split(",")[1]! : data;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

export function EstiloEscritorioPanel() {
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [resumo, setResumo] = useState<string | null>(null);
  const [atualizadoEm, setAtualizadoEm] = useState<string | null>(null);
  const [optIn, setOptIn] = useState(false);
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await fetch("/api/perfil/estilo");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao carregar");
      setResumo(data.resumo ?? null);
      setAtualizadoEm(data.atualizadoEm ?? null);
      setOptIn(Boolean(data.optIn));
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar perfil de estilo.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  async function handleGerar() {
    setErro(null);
    setMsg(null);
    if (!optIn) {
      setErro("Autorize o uso das amostras antes de continuar.");
      return;
    }
    if (arquivos.length < 1) {
      setErro("Selecione de 1 a 3 peças suas (PDF ou Word).");
      return;
    }
    setProcessando(true);
    try {
      const amostras = await Promise.all(
        arquivos.map(async (file) => ({
          nome: file.name,
          mimeType: file.type || "application/pdf",
          base64: await lerArquivoBase64(file),
        }))
      );
      const res = await fetch("/api/perfil/estilo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optIn: true, amostras }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao gerar perfil");
      setResumo(data.resumo ?? null);
      setAtualizadoEm(data.atualizadoEm ?? null);
      setArquivos([]);
      setMsg(
        "Perfil de estilo salvo. Nas próximas peças, o FACTO ajusta tom e redação — o rito continua fixo."
      );
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao processar amostras.");
    } finally {
      setProcessando(false);
    }
  }

  async function handleLimpar() {
    if (!window.confirm("Remover o perfil de estilo salvo?")) return;
    setProcessando(true);
    setErro(null);
    setMsg(null);
    try {
      const res = await fetch("/api/perfil/estilo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limpar: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao limpar");
      setResumo(null);
      setAtualizadoEm(null);
      setOptIn(false);
      setArquivos([]);
      setMsg("Perfil de estilo removido.");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao limpar.");
    } finally {
      setProcessando(false);
    }
  }

  return (
    <section
      id="estilo-redacao"
      className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-800">
        Tom do escritório (opcional)
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Envie até 3 peças que você já protocolou. O FACTO extrai{" "}
        <strong>como</strong> você escreve (tom, extensão, pedidos) — não copia
        fatos nem textos inteiros. Nas gerações seguintes isso entra
        automaticamente; o esqueleto forense e o rito permanecem iguais.
      </p>

      {carregando ? (
        <p className="mt-4 text-sm text-slate-500">Carregando…</p>
      ) : (
        <>
          {resumo ? (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                Resumo ativo
                {atualizadoEm
                  ? ` · ${new Date(atualizadoEm).toLocaleDateString("pt-BR")}`
                  : ""}
              </p>
              <p className="mt-2 max-h-40 overflow-y-auto text-sm leading-relaxed text-emerald-950">
                {resumo}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Nenhum perfil de estilo ainda — use o upload abaixo.
            </p>
          )}

          <label className="mt-4 flex items-start gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={optIn}
              onChange={(e) => setOptIn(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300"
            />
            <span>
              Autorizo o FACTO a analisar minhas amostras só para montar este
              resumo de estilo (não compartilhamos com terceiros). Posso remover
              quando quiser.
            </span>
          </label>

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Amostras (1–3 · PDF ou Word)
            </label>
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              multiple
              onChange={(e) => {
                const lista = Array.from(e.target.files ?? []).slice(0, 3);
                setArquivos(lista);
              }}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-stone-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-stone-800"
            />
            {arquivos.length > 0 ? (
              <p className="mt-2 text-xs text-slate-500">
                {arquivos.map((f) => f.name).join(" · ")}
              </p>
            ) : null}
            <p className="mt-2 text-xs text-slate-500">
              Dica: misture tipos (ex.: 1 inicial + 1 contestação + 1 recurso).
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={processando}
              onClick={() => void handleGerar()}
              className="rounded-lg bg-stone-800 px-4 py-2.5 text-sm font-medium text-amber-50 hover:bg-stone-700 disabled:opacity-50"
            >
              {processando ? "Analisando…" : resumo ? "Atualizar estilo" : "Gerar meu perfil"}
            </button>
            {resumo ? (
              <button
                type="button"
                disabled={processando}
                onClick={() => void handleLimpar()}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Remover perfil
              </button>
            ) : null}
          </div>

          {erro ? (
            <p className="mt-3 text-sm text-red-700">{erro}</p>
          ) : null}
          {msg ? (
            <p className="mt-3 text-sm text-emerald-800">{msg}</p>
          ) : null}
        </>
      )}
    </section>
  );
}
