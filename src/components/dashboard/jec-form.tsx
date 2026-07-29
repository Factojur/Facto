"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { GerarPecaJecOutput } from "@/lib/gerar-peca-jec";
import { ASSISTENTE_FACTO } from "@/lib/assistente-facto";
import {
  escritorioConfigVazio,
  type EscritorioConfig,
} from "@/lib/escritorio-types";
import { carregarEscritorioConfig } from "@/lib/escritorio-storage";
import { EscritorioConfigPanel } from "@/components/dashboard/escritorio-config";
import { PecaDocumentoView } from "@/components/dashboard/peca-documento";

const tiposAcaoJec = [
  "Petição Inicial — Ação de Cobrança (JEC)",
  "Petição Inicial — Ação de Indenização por Danos Materiais e Morais (JEC)",
  "Petição Inicial — Ação de Obrigação de Fazer (JEC)",
  "Petição Inicial — Ação de Obrigação de Não Fazer (JEC)",
  "Petição Inicial — Ação de Despejo para Fim de Locação (JEC)",
  "Execução de Título Extrajudicial (JEC)",
  "Embargos de Declaração (JEC)",
  "Recurso Inominado (JEC)",
];

function getFileNames(input: HTMLInputElement | null): string[] {
  if (!input?.files?.length) return [];
  return Array.from(input.files).map((f) => f.name);
}

function FileField({
  id,
  label,
  accept,
  multiple = false,
}: {
  id: string;
  label: string;
  accept?: string;
  multiple?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type="file"
        accept={accept}
        multiple={multiple}
        className="block w-full cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-stone-700 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-amber-50 hover:file:bg-stone-600"
      />
    </div>
  );
}

function PecasResultado({
  resultado,
  escritorio,
  onFechar,
}: {
  resultado: GerarPecaJecOutput;
  escritorio?: EscritorioConfig;
  onFechar: () => void;
}) {
  async function copiar(texto: string) {
    await navigator.clipboard.writeText(texto);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Peça gerada com sucesso
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Revise o texto antes de protocolar. Campos entre colchetes devem ser
            completados.
          </p>
        </div>
        <button
          type="button"
          onClick={onFechar}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
        >
          Novo formulário
        </button>
      </div>

      {resultado.decisaoAssistente && (
        <section className="rounded-lg border border-stone-300 bg-stone-50 p-6 shadow-sm">
          <h3 className="mb-2 font-semibold text-stone-800">
            Decisão do Assistente Facto
          </h3>
          <p className="text-sm text-stone-700">
            <strong>Ação definida:</strong>{" "}
            {resultado.decisaoAssistente.tipoAcao}
          </p>
          <p className="mt-1 text-sm text-stone-700">
            <strong>Tutela de urgência:</strong>{" "}
            {resultado.decisaoAssistente.tutelaUrgencia
              ? "Recomendada"
              : "Não recomendada"}
          </p>
        </section>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Análise das provas</h3>
          <button
            type="button"
            onClick={() => copiar(resultado.analise)}
            className="text-sm font-medium text-stone-700 hover:text-stone-900"
          >
            Copiar
          </button>
        </div>
        <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
          {resultado.analise}
        </pre>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">
            Peça processual {resultado.timbrado ? "timbrada" : "formatada"}
          </h3>
        </div>
        <PecaDocumentoView
          peca={resultado.peca}
          pecaHtml={resultado.pecaHtml}
          escritorio={escritorio}
          onCopiarTexto={() => copiar(resultado.peca)}
        />
      </section>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-stone-800">
          Fundamentação legal aplicável (JEC)
        </h3>
        <ul className="list-inside list-disc space-y-1 text-sm text-stone-700">
          {resultado.fundamentoLegal.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function JecForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<GerarPecaJecOutput | null>(null);
  const [tipoSelecionado, setTipoSelecionado] = useState("");
  const [escritorio, setEscritorio] =
    useState<EscritorioConfig>(escritorioConfigVazio);

  const isAssistente = tipoSelecionado === ASSISTENTE_FACTO;

  useEffect(() => {
    setEscritorio(carregarEscritorioConfig());
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const tipoAcao = String(formData.get("tipoAcao"));
    const modoAssistente = tipoAcao === ASSISTENTE_FACTO;

    const payload = {
      tipoAcao,
      tutelaUrgencia: modoAssistente
        ? false
        : formData.get("tutelaUrgencia") === "on",
      fatos: String(formData.get("fatos")),
      documentos: {
        rg: getFileNames(form.querySelector<HTMLInputElement>("#rg")),
        cpf: getFileNames(form.querySelector<HTMLInputElement>("#cpf")),
        cnh: getFileNames(form.querySelector<HTMLInputElement>("#cnh")),
        comprovanteResidencia: getFileNames(
          form.querySelector<HTMLInputElement>("#comprovanteResidencia")
        ),
      },
      provas: getFileNames(form.querySelector<HTMLInputElement>("#provas")),
      fotos: getFileNames(form.querySelector<HTMLInputElement>("#fotos")),
      midias: getFileNames(form.querySelector<HTMLInputElement>("#midias")),
      escritorio,
    };

    try {
      const response = await fetch("/api/gerar-peca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Erro ao gerar a peça.");
        setLoading(false);
        return;
      }

      setResultado(data);
    } catch {
      setError("Falha na comunicação com o servidor. Tente novamente.");
    }

    setLoading(false);
  }

  if (resultado) {
    return (
      <PecasResultado
        resultado={resultado}
        escritorio={escritorio}
        onFechar={() => setResultado(null)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <header>
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition hover:text-facto-gold"
        >
          ← Voltar ao início
        </Link>
        <h1 className="text-2xl font-semibold text-slate-800">
          Geração de Peça — Juizado Especial Cível
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Peças fundamentadas na Lei nº 9.099/95. Preencha os dados para análise
          e elaboração da petição.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Dados da Ação
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2 sm:max-w-lg">
            <label
              htmlFor="tipoAcao"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Tipo de Ação
            </label>
            <select
              id="tipoAcao"
              name="tipoAcao"
              required
              value={tipoSelecionado}
              onChange={(e) => setTipoSelecionado(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
            >
              <option value="">Selecione o tipo de ação</option>
              <option value={ASSISTENTE_FACTO}>Assistente Facto (IA)</option>
              <optgroup label="Escolha manual">
                {tiposAcaoJec.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </optgroup>
            </select>

            {isAssistente && (
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                O <strong className="font-medium text-stone-700">Assistente Facto</strong>{" "}
                analisará os fatos narrados, a documentação anexada e as provas
                enviadas para identificar automaticamente a{" "}
                <strong className="font-medium text-stone-700">
                  ação cabível no Juizado Especial Cível
                </strong>{" "}
                e se há fundamento para{" "}
                <strong className="font-medium text-stone-700">
                  tutela de urgência
                </strong>
                . Você receberá a justificativa da decisão antes da peça ser
                gerada. Para escolher a ação manualmente, selecione uma das
                opções abaixo de &quot;Escolha manual&quot;.
              </p>
            )}
          </div>

          <div
            className={`flex items-center sm:col-span-2 ${isAssistente ? "opacity-50" : ""}`}
          >
            <input
              id="tutelaUrgencia"
              name="tutelaUrgencia"
              type="checkbox"
              disabled={isAssistente}
              className="h-4 w-4 rounded border-slate-300 text-stone-700 focus:ring-stone-500 disabled:cursor-not-allowed"
            />
            <label
              htmlFor="tutelaUrgencia"
              className="ml-2 text-sm font-medium text-slate-700"
            >
              Pedido de Tutela de Urgência
              {isAssistente && (
                <span className="ml-1 text-xs font-normal text-slate-500">
                  (definido pelo Assistente)
                </span>
              )}
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Fatos</h2>
        <div>
          <label
            htmlFor="fatos"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Descrição dos fatos
          </label>
          <textarea
            id="fatos"
            name="fatos"
            required
            rows={10}
            placeholder="Descreva detalhadamente os fatos relevantes para a peça no Juizado Especial Cível..."
            className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-800 placeholder-slate-400 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
          />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-slate-800">
          Documentos Pessoais
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Anexe documentos de identificação do cliente ou das partes envolvidas.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <FileField id="rg" label="RG" accept="image/*,.pdf" />
          <FileField id="cpf" label="CPF" accept="image/*,.pdf" />
          <FileField id="cnh" label="CNH" accept="image/*,.pdf" />
          <FileField
            id="comprovanteResidencia"
            label="Comprovante de Residência"
            accept="image/*,.pdf"
          />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-slate-800">
          Provas e Áudios
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Envie prints, recibos, fotos, contratos, áudios e vídeos relevantes ao
          caso.
        </p>
        <div className="grid gap-4">
          <FileField
            id="provas"
            label="Prints, recibos e documentos probatórios"
            accept="image/*,.pdf,.doc,.docx"
            multiple
          />
          <FileField
            id="fotos"
            label="Fotos e outros"
            accept="image/*,.heic,.heif,.webp"
            multiple
          />
          <FileField
            id="midias"
            label="Áudios e Vídeos"
            accept="audio/*,video/*,.mp3,.wav,.m4a,.ogg,.mp4,.mov,.avi,.mkv,.webm"
            multiple
          />
        </div>
      </section>

      <EscritorioConfigPanel value={escritorio} onChange={setEscritorio} />

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-stone-700 px-8 py-3.5 text-base font-semibold text-amber-50 shadow-sm transition hover:bg-stone-600 disabled:opacity-60"
        >
          {loading
            ? isAssistente
              ? "Assistente analisando..."
              : "Analisando e gerando..."
            : isAssistente
              ? "Analisar Case e Gerar Peça"
              : "Analisar Provas e Gerar Peça"}
        </button>
      </div>
    </form>
  );
}
