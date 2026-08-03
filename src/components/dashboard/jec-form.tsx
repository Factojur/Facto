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
import {
  ComarcaSection,
  comarcaVazia,
  type ComarcaValue,
} from "@/components/dashboard/comarca-form";
import {
  ValoresCausaSection,
  valoresCausaVazio,
  type ValoresPorCategoria,
} from "@/components/dashboard/valores-causa-form";
import { TIPOS_ACAO_JEC } from "@/lib/tipos-acao-jec";
import { ReusSection } from "@/components/dashboard/reus-form";
import {
  JurisCasoSection,
  type JurisCasoSalvo,
} from "@/components/dashboard/juris-caso-form";
import type { ReuValue } from "@/lib/reu-types";
import type { JurisCasoPayload } from "@/lib/juris-caso-types";

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

  const citacoes = resultado.citacoes ?? [];
  const jurisSemLastro = citacoes.filter(
    (c) => c.tipo === "jurisprudencia" && !c.verificada
  );
  const jurisVerificada = citacoes.filter(
    (c) => c.tipo === "jurisprudencia" && c.verificada
  );
  const fontes = resultado.baseConhecimentoUtilizada ?? [];
  const faltouNaBase =
    (resultado.marcadoresNaoEncontrado ?? 0) > 0 || fontes.length === 0;

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
            {resultado.geradoPorIA && resultado.modeloIA
              ? ` Redigida por IA (${resultado.modeloIA}).`
              : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onFechar}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
        >
          Ocultar peça
        </button>
      </div>

      {resultado.avisoIA && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
          <p className="font-semibold">Atenção — peça incompleta para protocolo</p>
          <p className="mt-1">{resultado.avisoIA}</p>
        </div>
      )}
      {!resultado.geradoPorIA && !resultado.avisoIA && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Esta peça não foi redigida pela IA (template de reserva). A seção DO
          DIREITO tende a ficar genérica — gere novamente com a IA ativa.
        </div>
      )}

      {resultado.analiseEstrategica && (
        <section className="rounded-lg border border-stone-300 bg-stone-50 p-5 shadow-sm">
          <h3 className="font-semibold text-stone-800">
            Análise estratégica (Chain of Thought)
          </h3>
          {resultado.analiseEstrategica.nomeAcao && (
            <p className="mt-2 text-sm text-stone-700">
              <strong>Ação qualificada:</strong>{" "}
              {resultado.analiseEstrategica.nomeAcao}
            </p>
          )}
          {resultado.analiseEstrategica.tesePrincipal && (
            <p className="mt-1 text-sm text-stone-700">
              <strong>Tese:</strong> {resultado.analiseEstrategica.tesePrincipal}
            </p>
          )}
          {resultado.analiseEstrategica.naturezaRelacao && (
            <p className="mt-1 text-sm text-stone-700">
              <strong>Natureza:</strong>{" "}
              {resultado.analiseEstrategica.naturezaRelacao}
            </p>
          )}
          {resultado.analiseEstrategica.direitosViolados &&
            resultado.analiseEstrategica.direitosViolados.length > 0 && (
              <p className="mt-1 text-sm text-stone-700">
                <strong>Direitos violados:</strong>{" "}
                {resultado.analiseEstrategica.direitosViolados.join("; ")}
              </p>
            )}
        </section>
      )}

      {jurisSemLastro.length > 0 && (
        <section className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-800">
            Jurisprudência sem lastro na base — conferir antes de protocolar
          </h3>
          <p className="mt-1 text-xs text-red-700">
            Estes trechos aparecem na peça, mas não foram encontrados no
            material injetado (base de conhecimento ou jurisprudência anexada ao
            caso). Possível invenção da IA.
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-800">
            {jurisSemLastro.map((c) => (
              <li key={c.trecho}>{c.trecho}</li>
            ))}
          </ul>
        </section>
      )}

      {(fontes.length > 0 ||
        faltouNaBase ||
        resultado.leiMunicipalUtilizada ||
        (resultado.jurisDoCasoUtilizada &&
          resultado.jurisDoCasoUtilizada.length > 0) ||
        jurisVerificada.length > 0) && (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800">Fontes e verificação</h3>

          {resultado.leiMunicipalUtilizada && (
            <p className="mt-2 text-sm text-slate-600">
              <strong>Lei municipal anexada:</strong>{" "}
              {resultado.leiMunicipalUtilizada.nome}
            </p>
          )}

          {resultado.jurisDoCasoUtilizada &&
            resultado.jurisDoCasoUtilizada.length > 0 && (
              <p className="mt-2 text-sm text-slate-600">
                <strong>Jurisprudência/súmulas do caso:</strong>{" "}
                {resultado.jurisDoCasoUtilizada.map((j) => j.titulo).join("; ")}
              </p>
            )}

          <div className="mt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Base de conhecimento usada ({fontes.length})
            </p>
            {fontes.length === 0 ? (
              <p className="mt-1 text-sm text-amber-800">
                Nenhum trecho da base foi recuperado para este tema. Súmulas e
                acórdãos não devem ser citados até você cadastrar jurisprudência
                pertinente em Admin → Base de conhecimento.
              </p>
            ) : (
              <ul className="mt-1 space-y-1 text-sm text-slate-700">
                {fontes.map((item, i) => (
                  <li key={`${item.titulo}-${i}`}>
                    <span className="font-medium text-stone-700">
                      {item.categoria}
                    </span>{" "}
                    — {item.titulo}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {(resultado.marcadoresNaoEncontrado ?? 0) > 0 && (
            <p className="mt-3 text-sm text-amber-800">
              A IA sinalizou {resultado.marcadoresNaoEncontrado}{" "}
              {resultado.marcadoresNaoEncontrado === 1 ? "trecho" : "trechos"}{" "}
              sem fundamentação específica na base ([NÃO ENCONTRADO NA BASE]).
              Considere cadastrar súmula/julgado correspondente.
            </p>
          )}

          {jurisVerificada.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Jurisprudência verificada na base
              </p>
              <ul className="mt-1 list-inside list-disc text-sm text-emerald-800">
                {jurisVerificada.map((c) => (
                  <li key={c.trecho}>{c.trecho}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

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

      {resultado.valorCausaResumo && (
        <section className="rounded-lg border border-stone-300 bg-stone-50 p-6 shadow-sm">
          <h3 className="mb-2 font-semibold text-stone-800">
            Valor da causa (calculado)
          </h3>
          <p className="text-sm text-stone-700">
            <strong>Total:</strong> {resultado.valorCausaResumo.totalFormatado} (
            {resultado.valorCausaResumo.totalPorExtenso})
          </p>
          <p className="mt-1 text-xs text-stone-500">
            Esse valor foi somado exatamente pelo sistema, item a item — a IA
            não recalcula nem altera esse número na peça.
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
  const [fatos, setFatos] = useState("");
  const [tutelaUrgencia, setTutelaUrgencia] = useState(false);
  const [escritorio, setEscritorio] =
    useState<EscritorioConfig>(escritorioConfigVazio);
  const [comarca, setComarca] = useState<ComarcaValue>(comarcaVazia);
  const [valoresCausa, setValoresCausa] =
    useState<ValoresPorCategoria>(valoresCausaVazio);
  const [usaLeiMunicipal, setUsaLeiMunicipal] = useState(false);
  const [leiMunicipalTexto, setLeiMunicipalTexto] = useState("");
  const [leiMunicipalTitulo, setLeiMunicipalTitulo] = useState("");
  const [mostrarDocsOpcionais, setMostrarDocsOpcionais] = useState(false);
  const [mostrarMidiasOpcionais, setMostrarMidiasOpcionais] = useState(false);
  const [linkNuvem, setLinkNuvem] = useState("");
  const [reus, setReus] = useState<ReuValue[]>([]);
  const [jurisCaso, setJurisCaso] = useState<JurisCasoSalvo[]>([]);

  const isAssistente = tipoSelecionado === ASSISTENTE_FACTO;

  useEffect(() => {
    setEscritorio(carregarEscritorioConfig());
  }, []);

  async function lerArquivoComoBase64(
    file: File
  ): Promise<{ nome: string; mimeType: string; base64: string }> {
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const tipoAcao = String(formData.get("tipoAcao"));
    const modoAssistente = tipoAcao === ASSISTENTE_FACTO;

    let leiMunicipal: {
      nome?: string;
      mimeType?: string;
      base64?: string;
      texto?: string;
    } | null = null;

    if (usaLeiMunicipal) {
      const textoColado = leiMunicipalTexto.trim();
      const inputLei = form.querySelector<HTMLInputElement>("#leiMunicipal");
      const arquivo = inputLei?.files?.[0];

      if (!textoColado && !arquivo) {
        setError(
          "Marque a lei municipal e anexe o PDF/Word ou cole o texto da norma."
        );
        setLoading(false);
        return;
      }

      if (textoColado) {
        leiMunicipal = {
          nome: leiMunicipalTitulo.trim() || "Lei municipal (texto colado)",
          texto: textoColado,
        };
      } else if (arquivo) {
        try {
          leiMunicipal = await lerArquivoComoBase64(arquivo);
        } catch {
          setError("Não foi possível ler o arquivo da lei municipal.");
          setLoading(false);
          return;
        }
      }
    }

    const jurisDoCaso: JurisCasoPayload[] = jurisCaso.map((j) => ({
      id: j.id,
      tipo: j.tipo,
      titulo: j.titulo,
      texto: j.texto.trim() || undefined,
      nomeArquivo: j.nomeArquivo ?? j.arquivo?.nome,
      mimeType: j.texto.trim() ? undefined : j.arquivo?.mimeType,
      base64: j.texto.trim() ? undefined : j.arquivo?.base64,
    }));

    const payload = {
      tipoAcao,
      tutelaUrgencia: modoAssistente ? false : tutelaUrgencia,
      fatos: fatos.trim(),
      documentos: {
        essenciais: getFileNames(
          form.querySelector<HTMLInputElement>("#documentosEssenciais")
        ),
        declaracaoHipossuficiencia: getFileNames(
          form.querySelector<HTMLInputElement>("#declaracaoHipossuficiencia")
        ),
        mandadoLevantamentoEletronico: getFileNames(
          form.querySelector<HTMLInputElement>("#mandadoLevantamentoEletronico")
        ),
      },
      provas: getFileNames(
        form.querySelector<HTMLInputElement>("#provasEssenciais")
      ),
      fotos: [],
      midias: getFileNames(form.querySelector<HTMLInputElement>("#midias")),
      linkNuvem: linkNuvem.trim() || null,
      reus,
      jurisDoCaso: jurisDoCaso.length > 0 ? jurisDoCaso : null,
      escritorio,
      comarca: {
        cep: comarca.cep,
        cidade: comarca.cidade,
        uf: comarca.uf,
        numeroJuizado: comarca.numeroJuizado || undefined,
      },
      valoresCausa,
      leiMunicipal,
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

      // Mantém o formulário intacto; só atualiza o resultado abaixo.
      setResultado(data);
      window.setTimeout(() => {
        document
          .getElementById("peca-gerada")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch {
      setError("Falha na comunicação com o servidor. Tente novamente.");
    }

    setLoading(false);
  }

  return (
    <div className="space-y-8">
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
              {TIPOS_ACAO_JEC.map((grupo) => (
                <optgroup key={grupo.label} label={grupo.label}>
                  {grupo.opcoes.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </optgroup>
              ))}
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
                gerada. Para escolher a ação ou recurso manualmente, use os
                grupos do seletor (petições, execução, defesa, recursos).
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
              checked={tutelaUrgencia}
              disabled={isAssistente}
              onChange={(e) => setTutelaUrgencia(e.target.checked)}
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

      <ComarcaSection value={comarca} onChange={setComarca} />

      <ValoresCausaSection value={valoresCausa} onChange={setValoresCausa} />

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
            value={fatos}
            onChange={(e) => setFatos(e.target.value)}
            placeholder="Descreva detalhadamente os fatos relevantes para a peça no Juizado Especial Cível..."
            className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-800 placeholder-slate-400 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
          />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-slate-800">
          Lei municipal (opcional)
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Use quando a ação depender de lei, decreto ou código do município. Você
          pode <strong className="font-medium text-slate-700">anexar arquivo</strong>{" "}
          ou{" "}
          <strong className="font-medium text-slate-700">colar o texto</strong>. A
          IA analisa só o que você enviar — não inventa norma municipal.
        </p>
        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={usaLeiMunicipal}
            onChange={(e) => {
              setUsaLeiMunicipal(e.target.checked);
              if (!e.target.checked) {
                setLeiMunicipalTexto("");
                setLeiMunicipalTitulo("");
              }
            }}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-stone-700 focus:ring-stone-500"
          />
          <span>
            Este caso depende de norma municipal — anexar arquivo ou colar texto
          </span>
        </label>
        {usaLeiMunicipal && (
          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="leiMunicipalTitulo"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Nome / identificação da norma (opcional)
              </label>
              <input
                id="leiMunicipalTitulo"
                type="text"
                value={leiMunicipalTitulo}
                onChange={(e) => setLeiMunicipalTitulo(e.target.value)}
                placeholder="Ex.: Lei Municipal nº 123/2020 — Código de Posturas"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
              />
            </div>
            <FileField
              id="leiMunicipal"
              label="Arquivo da lei / decreto (PDF ou Word)"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
            <div>
              <label
                htmlFor="leiMunicipalTexto"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Ou cole o texto da norma
              </label>
              <textarea
                id="leiMunicipalTexto"
                rows={8}
                value={leiMunicipalTexto}
                onChange={(e) => setLeiMunicipalTexto(e.target.value)}
                placeholder="Cole aqui os artigos pertinentes da lei ou decreto municipal..."
                className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-800 placeholder-slate-400 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Se preencher o texto e também anexar arquivo, o{" "}
                <strong className="font-medium">texto colado tem prioridade</strong>.
              </p>
            </div>
          </div>
        )}
      </section>

      <JurisCasoSection value={jurisCaso} onChange={setJurisCaso} />

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-slate-800">
          Documentos pessoais
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Anexe o que for protocolar com a peça. Os nomes dos arquivos entram na
          checklist da petição.
        </p>

        <div className="space-y-5">
          <div>
            <h3 className="mb-1 text-sm font-semibold text-slate-800">
              Essenciais
            </h3>
            <p className="mb-3 text-xs leading-relaxed text-slate-500">
              Em um único envio: identidade (RG ou CNH), CPF, comprovante de
              residência e procuração — selecione vários arquivos de uma vez.
            </p>
            <FileField
              id="documentosEssenciais"
              label="Identidade, CPF, residência e procuração"
              accept="image/*,.pdf,.doc,.docx"
              multiple
            />
          </div>

          <div className="border-t border-slate-100 pt-4">
            <label className="flex items-start gap-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={mostrarDocsOpcionais}
                onChange={(e) => setMostrarDocsOpcionais(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-stone-700 focus:ring-stone-500"
              />
              <span>
                <span className="font-medium text-slate-800">
                  Anexar documentos opcionais
                </span>
                <span className="mt-0.5 block text-xs font-normal leading-relaxed text-slate-500">
                  Declaração de hipossuficiência (justiça gratuita) e/ou Mandado
                  de Levantamento Eletrônico (MLE), quando já estiverem prontos.
                </span>
              </span>
            </label>
            <div
              className={
                mostrarDocsOpcionais
                  ? "mt-3 grid gap-4 sm:grid-cols-2"
                  : "hidden"
              }
            >
              <FileField
                id="declaracaoHipossuficiencia"
                label="Declaração de hipossuficiência"
                accept="image/*,.pdf,.doc,.docx"
              />
              <FileField
                id="mandadoLevantamentoEletronico"
                label="Mandado de Levantamento Eletrônico (MLE)"
                accept="image/*,.pdf,.doc,.docx"
              />
            </div>
          </div>
        </div>
      </section>

      <ReusSection value={reus} onChange={setReus} />

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-slate-800">
          Provas e mídias
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Anexe as provas do caso. Os nomes dos arquivos entram na peça (tópico
          de provas e anexos). O link de nuvem (Drive etc.) é colado por você —
          o FACTO ainda não cria a pasta automaticamente.
        </p>

        <div className="space-y-5">
          <div>
            <h3 className="mb-1 text-sm font-semibold text-slate-800">
              Essenciais
            </h3>
            <p className="mb-3 text-xs leading-relaxed text-slate-500">
              Prints, recibos, contratos, fotos e demais documentos probatórios —
              vários arquivos de uma vez.
            </p>
            <FileField
              id="provasEssenciais"
              label="Documentos e imagens de prova"
              accept="image/*,.pdf,.doc,.docx,.heic,.heif,.webp"
              multiple
            />
          </div>

          <div>
            <label
              htmlFor="linkNuvem"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Link da nuvem (Drive / Dropbox / OneDrive)
            </label>
            <input
              id="linkNuvem"
              type="url"
              value={linkNuvem}
              onChange={(e) => setLinkNuvem(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Monte a pasta no seu Drive, compartilhe com acesso de leitura e cole
              o link aqui. Na peça: menção breve em DOS FATOS e o link completo em
              DAS PROVAS E ANEXOS.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <label className="flex items-start gap-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={mostrarMidiasOpcionais}
                onChange={(e) => setMostrarMidiasOpcionais(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-stone-700 focus:ring-stone-500"
              />
              <span>
                <span className="font-medium text-slate-800">
                  Anexar áudios e vídeos
                </span>
                <span className="mt-0.5 block text-xs font-normal leading-relaxed text-slate-500">
                  Gravações relevantes ao caso (WhatsApp, ligações, imagens em
                  movimento etc.).
                </span>
              </span>
            </label>
            <div className={mostrarMidiasOpcionais ? "mt-3" : "hidden"}>
              <FileField
                id="midias"
                label="Áudios e vídeos"
                accept="audio/*,video/*,.mp3,.wav,.m4a,.ogg,.mp4,.mov,.avi,.mkv,.webm"
                multiple
              />
            </div>
          </div>
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
            ? "Análise estratégica + redação Tier-1 (pode levar até ~1 min)..."
            : isAssistente
              ? "Analisar Case e Gerar Peça"
              : "Analisar Provas e Gerar Peça"}
        </button>
      </div>
    </form>

      {resultado && (
        <div id="peca-gerada" className="scroll-mt-6 border-t border-slate-200 pt-8">
          <p className="mb-4 text-sm text-slate-500">
            O formulário acima permanece preenchido. Edite os fatos e gere de novo
            quando quiser — PDF e Word abrem em nova aba.
          </p>
          <PecasResultado
            resultado={resultado}
            escritorio={escritorio}
            onFechar={() => setResultado(null)}
          />
        </div>
      )}
    </div>
  );
}
