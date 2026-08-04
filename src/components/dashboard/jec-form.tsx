"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { GerarPecaJecOutput } from "@/lib/gerar-peca-jec";
import {
  analisarCaseAssistente,
  ASSISTENTE_FACTO,
  type DecisaoAssistente,
} from "@/lib/assistente-facto";
import {
  escritorioConfigVazio,
  type EscritorioConfig,
} from "@/lib/escritorio-types";
import {
  carregarEscritorioConfig,
  salvarEscritorioConfig,
} from "@/lib/escritorio-storage";
import {
  excluirRascunhoJec,
  listarRascunhosJec,
  payloadLeveParaRascunho,
  salvarRascunhoJec,
  type JecRascunhoSalvo,
} from "@/lib/jec-rascunho-storage";
import { montarChecklistJec, podeGerarPeca } from "@/lib/jec-checklist";
import { placeholderFatosPorTipo } from "@/lib/jec-placeholders";
import { docsSugeridosPorTipo } from "@/lib/jec-docs-checklist";
import { calcularResumoValorCausa } from "@/lib/valores-causa";
import { gerarPecaDocxBlob } from "@/lib/exportar-peca-docx";
import { gerarPecaPdfBlob } from "@/lib/exportar-peca-pdf";
import {
  abrirBlobEmNovaAba,
  abrirPreviewHtmlEmNovaAba,
} from "@/lib/abrir-documento-nova-aba";
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
import {
  PedidosSection,
  type PedidoItem,
} from "@/components/dashboard/pedidos-form";
import { TIPOS_ACAO_JEC } from "@/lib/tipos-acao-jec";
import { ReusSection } from "@/components/dashboard/reus-form";
import {
  JurisCasoSection,
  type JurisCasoSalvo,
} from "@/components/dashboard/juris-caso-form";
import type { ReuValue } from "@/lib/reu-types";
import type { JurisCasoPayload } from "@/lib/juris-caso-types";

const NAV_SECOES = [
  { id: "secao-dados", label: "Dados" },
  { id: "secao-comarca", label: "Comarca" },
  { id: "secao-valores", label: "Valores" },
  { id: "secao-fatos", label: "Fatos" },
  { id: "secao-pedidos", label: "Pedidos" },
  { id: "secao-fundamentos", label: "Fundamentos" },
  { id: "secao-documentos", label: "Documentos" },
  { id: "secao-reus", label: "Réus" },
  { id: "secao-provas", label: "Provas" },
  { id: "secao-gerar", label: "Gerar" },
] as const;

const LOADING_STAGES = ["Triagem estratégica…", "Redação da peça…"];

function getFileNames(input: HTMLInputElement | null): string[] {
  if (!input?.files?.length) return [];
  return Array.from(input.files).map((f) => f.name);
}

function FileField({
  id,
  label,
  hint,
  accept,
  multiple = false,
}: {
  id: string;
  label: string;
  hint?: string;
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
      {hint && (
        <p className="mb-2 text-xs leading-relaxed text-slate-500">{hint}</p>
      )}
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

function DocsSugeridosChecklist({ tipoAcao }: { tipoAcao: string }) {
  const docs = docsSugeridosPorTipo(tipoAcao);
  const [marcados, setMarcados] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMarcados({});
  }, [tipoAcao]);

  if (!tipoAcao) return null;

  return (
    <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Checklist sugerido (orientação — não bloqueia gerar)
      </p>
      <ul className="mt-2 space-y-2">
        {docs.map((doc) => (
          <li key={doc.id} className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(marcados[doc.id])}
              onChange={(e) =>
                setMarcados((prev) => ({
                  ...prev,
                  [doc.id]: e.target.checked,
                }))
              }
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-stone-700 focus:ring-stone-500"
            />
            <span className={doc.essencial ? "text-slate-800" : "text-slate-600"}>
              {doc.label}
              {!doc.essencial && (
                <span className="ml-1 text-xs text-slate-400">(opcional)</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StickyExportBar({
  peca,
  pecaHtml,
  escritorio,
  onVoltarFormulario,
}: {
  peca: string;
  pecaHtml: string;
  escritorio: EscritorioConfig;
  onVoltarFormulario: () => void;
}) {
  const [baixando, setBaixando] = useState<"docx" | "pdf" | null>(null);

  async function copiar() {
    await navigator.clipboard.writeText(peca);
  }

  async function handleWord() {
    setBaixando("docx");
    try {
      abrirPreviewHtmlEmNovaAba(pecaHtml, "Peça FACTO — Word / visualização");
      const blob = await gerarPecaDocxBlob(
        peca,
        escritorio.usarTimbre ? escritorio : undefined
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
      /* ignore */
    }
    setBaixando(null);
  }

  async function handlePdf() {
    setBaixando("pdf");
    const abaPdf = window.open("about:blank", "_blank");
    try {
      if (abaPdf) {
        abaPdf.document.write(
          "<p style='font-family:system-ui;padding:24px'>Gerando PDF FACTO…</p>"
        );
      }
      const blob = await gerarPecaPdfBlob(peca);
      const url = URL.createObjectURL(blob);
      if (abaPdf) {
        abaPdf.location.href = url;
        window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
      } else {
        abrirBlobEmNovaAba(blob, "peca-facto.pdf");
      }
    } catch {
      if (abaPdf) abaPdf.close();
    }
    setBaixando(null);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-2 sm:justify-between">
        <p className="hidden text-xs text-slate-500 sm:block">
          Exportações rápidas — Word pode incluir timbre; PDF e cópia = texto limpo.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void copiar()}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Copiar texto
          </button>
          <button
            type="button"
            onClick={() => void handleWord()}
            disabled={baixando !== null}
            className="rounded-lg border border-stone-600 px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-50"
          >
            {baixando === "docx" ? "Word…" : "Word"}
          </button>
          <button
            type="button"
            onClick={() => void handlePdf()}
            disabled={baixando !== null}
            className="rounded-lg bg-stone-700 px-3 py-2 text-sm font-medium text-amber-50 hover:bg-stone-600 disabled:opacity-50"
          >
            {baixando === "pdf" ? "PDF…" : "PDF"}
          </button>
          <button
            type="button"
            onClick={onVoltarFormulario}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Voltar ao formulário
          </button>
        </div>
      </div>
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
          <div className="mb-2 inline-flex rounded-md border border-amber-400 bg-amber-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900">
            MINUTA — revise antes de protocolar
          </div>
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

      <section id="peca-exportacoes" className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
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
        <p className="mt-3 text-xs text-slate-500">
          <strong>Word</strong> pode incluir cabeçalho/rodapé do timbre configurado
          no Perfil. <strong>PDF</strong> e <strong>copiar texto</strong> exportam
          apenas o conteúdo limpo da peça.
        </p>
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

function estadoInicialFormulario() {
  return {
    tipoSelecionado: "",
    fatos: "",
    tutelaUrgencia: false,
    comarca: comarcaVazia(),
    valoresCausa: valoresCausaVazio(),
    usaLeiMunicipal: false,
    leiMunicipalTexto: "",
    leiMunicipalTitulo: "",
    linkNuvem: "",
    reus: [] as ReuValue[],
    jurisCaso: [] as JurisCasoSalvo[],
    pedidos: [] as PedidoItem[],
    mostrarDocsOpcionais: false,
    mostrarMidiasOpcionais: false,
    decisaoSugerida: null as DecisaoAssistente | null,
    notaAssistente: false,
  };
}

export function JecForm() {
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
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
  const [pedidos, setPedidos] = useState<PedidoItem[]>([]);
  const [decisaoSugerida, setDecisaoSugerida] =
    useState<DecisaoAssistente | null>(null);
  const [notaAssistente, setNotaAssistente] = useState(false);
  const [rascunhos, setRascunhos] = useState<JecRascunhoSalvo[]>([]);
  const [rascunhoAtivoId, setRascunhoAtivoId] = useState<string | null>(null);
  const [msgRascunho, setMsgRascunho] = useState<string | null>(null);

  const isAssistente = tipoSelecionado === ASSISTENTE_FACTO;
  const modoAssistentePendenteConfirmacao = isAssistente;

  const resumoValores = useMemo(
    () => calcularResumoValorCausa(valoresCausa),
    [valoresCausa]
  );

  const checklistItens = montarChecklistJec({
    tipoSelecionado,
    fatos,
    reusCount: reus.length,
    comarcaCidade: comarca.cidade,
    comarcaUf: comarca.uf,
    temValor: resumoValores.totalCentavos > 0,
    modoAssistentePendenteConfirmacao,
  });

  const podeGerar = podeGerarPeca(checklistItens);

  useEffect(() => {
    setEscritorio(carregarEscritorioConfig());
    setRascunhos(listarRascunhosJec());
  }, []);

  useEffect(() => {
    if (!loading) {
      setLoadingStage(0);
      return;
    }
    setLoadingStage(0);
    const id = window.setInterval(() => {
      setLoadingStage((s) => (s + 1) % LOADING_STAGES.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [loading]);

  function handleToggleTimbre(checked: boolean) {
    const next = { ...escritorio, usarTimbre: checked };
    setEscritorio(next);
    salvarEscritorioConfig(next);
  }

  function handleSugerirAcao() {
    if (!fatos.trim()) {
      setError("Descreva os fatos antes de pedir sugestão do Assistente.");
      return;
    }
    setError(null);
    setDecisaoSugerida(
      analisarCaseAssistente({ fatos, totalArquivos: 0 })
    );
  }

  function handleConfirmarSugestao() {
    if (!decisaoSugerida) return;
    setTipoSelecionado(decisaoSugerida.tipoAcao);
    setTutelaUrgencia(decisaoSugerida.tutelaUrgencia);
    setNotaAssistente(true);
    setDecisaoSugerida(null);
  }

  function handleNovoCaso() {
    if (
      !window.confirm(
        "Isso limpa todos os campos do formulário e a peça gerada. Continuar?"
      )
    ) {
      return;
    }
    const ini = estadoInicialFormulario();
    setTipoSelecionado(ini.tipoSelecionado);
    setFatos(ini.fatos);
    setTutelaUrgencia(ini.tutelaUrgencia);
    setComarca(ini.comarca);
    setValoresCausa(ini.valoresCausa);
    setUsaLeiMunicipal(ini.usaLeiMunicipal);
    setLeiMunicipalTexto(ini.leiMunicipalTexto);
    setLeiMunicipalTitulo(ini.leiMunicipalTitulo);
    setLinkNuvem(ini.linkNuvem);
    setReus(ini.reus);
    setJurisCaso(ini.jurisCaso);
    setPedidos(ini.pedidos);
    setMostrarDocsOpcionais(ini.mostrarDocsOpcionais);
    setMostrarMidiasOpcionais(ini.mostrarMidiasOpcionais);
    setDecisaoSugerida(ini.decisaoSugerida);
    setNotaAssistente(ini.notaAssistente);
    setResultado(null);
    setRascunhoAtivoId(null);
    setMsgRascunho(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function aplicarRascunho(r: JecRascunhoSalvo) {
    const p = r.payload;
    setFatos(p.fatos ?? "");
    setTipoSelecionado(p.tipoSelecionado ?? "");
    setTutelaUrgencia(Boolean(p.tutelaUrgencia));
    setComarca(p.comarca ?? comarcaVazia());
    setValoresCausa(p.valoresCausa ?? valoresCausaVazio());
    setUsaLeiMunicipal(Boolean(p.usaLeiMunicipal));
    setLeiMunicipalTexto(p.leiMunicipalTexto ?? "");
    setLeiMunicipalTitulo(p.leiMunicipalTitulo ?? "");
    setLinkNuvem(p.linkNuvem ?? "");
    setReus(Array.isArray(p.reus) ? p.reus : []);
    setPedidos(Array.isArray(p.pedidos) ? p.pedidos : []);
    setJurisCaso(
      Array.isArray(p.jurisCaso)
        ? p.jurisCaso.map((j) => ({
            id: j.id,
            tipo: j.tipo,
            titulo: j.titulo,
            texto: j.texto,
            nomeArquivo: j.nomeArquivo ?? null,
            arquivo: null,
          }))
        : []
    );
    setDecisaoSugerida(null);
    setNotaAssistente(false);
    setRascunhoAtivoId(r.id);
    setMsgRascunho(
      "Rascunho restaurado. Anexos de arquivo (provas, PDFs) precisam ser reenviados."
    );
    setResultado(null);
  }

  function handleRestaurarRascunho(r: JecRascunhoSalvo) {
    if (
      !window.confirm(
        "Isso substituirá os dados atuais do formulário. Continuar?"
      )
    ) {
      return;
    }
    aplicarRascunho(r);
  }

  function handleSalvarAteAqui() {
    if (!fatos.trim() && reus.length === 0) {
      setMsgRascunho(
        "Escreva ao menos os fatos (ou cadastre um réu) antes de salvar."
      );
      return;
    }
    const tituloAtual =
      rascunhos.find((r) => r.id === rascunhoAtivoId)?.titulo ?? "";
    const nomePrompt = window.prompt(
      "Nome do rascunho (opcional)",
      tituloAtual
    );
    if (nomePrompt === null) return;

    try {
      const salvo = salvarRascunhoJec(
        payloadLeveParaRascunho({
          fatos,
          tipoSelecionado,
          tutelaUrgencia,
          comarca,
          valoresCausa,
          usaLeiMunicipal,
          leiMunicipalTexto,
          leiMunicipalTitulo,
          linkNuvem,
          reus,
          pedidos,
          jurisCaso,
        }),
        rascunhoAtivoId ?? undefined,
        nomePrompt.trim() || undefined
      );
      setRascunhoAtivoId(salvo.id);
      setRascunhos(listarRascunhosJec());
      setMsgRascunho(
        "Salvo neste navegador. Você pode sair e continuar depois — anexos de arquivo não entram no rascunho."
      );
    } catch {
      setMsgRascunho(
        "Não foi possível salvar (armazenamento do navegador cheio ou bloqueado)."
      );
    }
  }

  function handleExcluirRascunho(id: string) {
    excluirRascunhoJec(id);
    setRascunhos(listarRascunhosJec());
    if (rascunhoAtivoId === id) setRascunhoAtivoId(null);
    setMsgRascunho("Rascunho removido.");
  }

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
    if (!podeGerar) return;

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

    const pedidosUsuario = pedidos
      .map((p) => p.descricao.trim())
      .filter(Boolean);

    const payload = {
      tipoAcao,
      tutelaUrgencia: modoAssistente ? false : tutelaUrgencia,
      fatos: fatos.trim(),
      pedidosUsuario,
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
    <div className={`space-y-8 ${resultado ? "pb-24" : ""}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <header>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition hover:text-facto-gold"
            >
              ← Voltar ao início
            </Link>
            <button
              type="button"
              onClick={handleNovoCaso}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Novo caso
            </button>
          </div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Geração de Peça — Juizado Especial Cível
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Peças fundamentadas na Lei nº 9.099/95. A geração usa{" "}
            <strong className="font-medium text-slate-700">
              2 agentes Gemini
            </strong>{" "}
            (triagem estratégica + redação). A classificação do{" "}
            <strong className="font-medium text-slate-700">
              Assistente Facto
            </strong>{" "}
            é local, no navegador — sem chamada extra à IA.
          </p>
        </header>

        <nav
          aria-label="Seções do formulário"
          className="sticky top-0 z-20 -mx-1 flex gap-1 overflow-x-auto border-b border-slate-200 bg-white/95 px-1 py-2 backdrop-blur"
        >
          {NAV_SECOES.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-stone-100 hover:text-stone-900 sm:text-sm"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section
          id="secao-dados"
          className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
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
                onChange={(e) => {
                  const v = e.target.value;
                  setTipoSelecionado(v);
                  setDecisaoSugerida(null);
                  if (v !== ASSISTENTE_FACTO) {
                    setNotaAssistente(false);
                  }
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
              >
                <option value="">Selecione o tipo de ação</option>
                <option value={ASSISTENTE_FACTO}>
                  Assistente Facto (sugestão local)
                </option>
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

              {notaAssistente && !isAssistente && (
                <p className="mt-2 text-xs text-stone-600">
                  Tipo sugerido pelo Assistente Facto (regras locais) — confira
                  antes de gerar.
                </p>
              )}

              {isAssistente && (
                <div className="mt-4 space-y-3 rounded-lg border border-stone-200 bg-stone-50/80 p-4">
                  <p className="text-xs leading-relaxed text-slate-600">
                    A sugestão de ação usa{" "}
                    <strong className="font-medium text-stone-800">
                      regras locais e palavras-chave
                    </strong>{" "}
                    nos fatos — não há terceira chamada ao Gemini. Ao gerar, a
                    peça passa pelos{" "}
                    <strong className="font-medium text-stone-800">
                      2 agentes Gemini
                    </strong>{" "}
                    (triagem + redação).
                  </p>

                  {!decisaoSugerida ? (
                    <button
                      type="button"
                      onClick={handleSugerirAcao}
                      className="rounded-lg border border-stone-600 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100"
                    >
                      Sugerir tipo de ação
                    </button>
                  ) : (
                    <div className="space-y-2 rounded-md border border-stone-300 bg-white p-3">
                      <p className="text-sm text-stone-800">
                        <strong>Ação sugerida:</strong>{" "}
                        {decisaoSugerida.tipoAcao}
                      </p>
                      <p className="text-sm text-stone-700">
                        <strong>Tutela de urgência:</strong>{" "}
                        {decisaoSugerida.tutelaUrgencia
                          ? "Recomendada"
                          : "Não recomendada"}
                      </p>
                      <p className="text-sm text-stone-600">
                        {decisaoSugerida.justificativa}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleConfirmarSugestao}
                          className="rounded-lg bg-stone-700 px-3 py-1.5 text-sm font-medium text-amber-50 hover:bg-stone-600"
                        >
                          Confirmar e usar esta ação
                        </button>
                        <button
                          type="button"
                          onClick={() => setDecisaoSugerida(null)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                        >
                          Sugerir de novo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
                    (definido após confirmar sugestão)
                  </span>
                )}
              </label>
            </div>
          </div>
        </section>

        <ComarcaSection value={comarca} onChange={setComarca} />

        <div id="secao-valores" className="scroll-mt-24">
          <ValoresCausaSection value={valoresCausa} onChange={setValoresCausa} />
        </div>

        <section
          id="secao-fatos"
          className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
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
              placeholder={placeholderFatosPorTipo(tipoSelecionado)}
              className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-800 placeholder-slate-400 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSalvarAteAqui}
                className="rounded-lg border border-stone-600 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition hover:bg-stone-50"
              >
                Salvar até aqui
              </button>
              <span className="text-xs text-slate-500">
                Guarda o texto e os dados do formulário neste navegador (não os
                arquivos anexados).
              </span>
            </div>
            {msgRascunho && (
              <p className="mt-2 text-sm text-stone-600">{msgRascunho}</p>
            )}
            {rascunhos.length > 0 && (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Rascunhos salvos
                </p>
                <ul className="mt-2 space-y-2">
                  {rascunhos.map((r) => (
                    <li
                      key={r.id}
                      className={`flex flex-wrap items-start justify-between gap-2 rounded-md border px-3 py-2 text-sm ${
                        rascunhoAtivoId === r.id
                          ? "border-stone-400 bg-white"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-800">{r.titulo}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(r.atualizadoEm).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => handleRestaurarRascunho(r)}
                          className="rounded border border-slate-200 px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-slate-50"
                        >
                          Continuar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExcluirRascunho(r.id)}
                          className="rounded border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                        >
                          Excluir
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <PedidosSection value={pedidos} onChange={setPedidos} />

        <section
          id="secao-fundamentos"
          className="scroll-mt-24 space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Fundamentos do caso
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Lei municipal e jurisprudência anexadas aqui são{" "}
              <strong className="font-medium text-slate-700">
                analisadas pela IA
              </strong>{" "}
              (texto colado ou arquivo enviado).
            </p>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
            <h3 className="mb-1 text-base font-semibold text-slate-800">
              Lei municipal (opcional)
            </h3>
            <p className="mb-4 text-sm text-slate-500">
              Use quando a ação depender de lei, decreto ou código do município.
              A IA analisa o texto/arquivo enviado aqui — não inventa norma
              municipal.
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
                Este caso depende de norma municipal — anexar arquivo ou colar
                texto
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
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
            <JurisCasoSection value={jurisCaso} onChange={setJurisCaso} />
          </div>
        </section>

        <section
          id="secao-documentos"
          className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-1 text-lg font-semibold text-slate-800">
            Documentos pessoais
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            Apenas os{" "}
            <strong className="font-medium text-slate-700">
              nomes dos arquivos
            </strong>{" "}
            entram na checklist da peça — a IA{" "}
            <strong className="font-medium text-slate-700">
              não lê o conteúdo
            </strong>{" "}
            destes uploads.
          </p>

          <div className="space-y-5">
            <div>
              <h3 className="mb-1 text-sm font-semibold text-slate-800">
                Essenciais
              </h3>
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
                    Declaração de hipossuficiência e/ou Mandado de Levantamento
                    Eletrônico (MLE).
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

          <DocsSugeridosChecklist tipoAcao={tipoSelecionado} />
        </section>

        <div id="secao-reus" className="scroll-mt-24">
          <ReusSection value={reus} onChange={setReus} />
        </div>

        <section
          id="secao-provas"
          className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-1 text-lg font-semibold text-slate-800">
            Provas e mídias
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            Apenas os{" "}
            <strong className="font-medium text-slate-700">
              nomes dos arquivos
            </strong>{" "}
            entram na checklist da peça — a IA{" "}
            <strong className="font-medium text-slate-700">
              não lê o conteúdo
            </strong>{" "}
            destes uploads. O link de nuvem é colado por você.
          </p>

          <div className="space-y-5">
            <div>
              <h3 className="mb-1 text-sm font-semibold text-slate-800">
                Essenciais
              </h3>
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

        <section
          id="secao-gerar"
          className="scroll-mt-24 space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-800">
            Timbre e geração
          </h2>

          <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-4">
            <label className="flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={escritorio.usarTimbre}
                onChange={(e) => handleToggleTimbre(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-stone-700 focus:ring-stone-500"
              />
              <span>
                <span className="font-medium text-slate-800">
                  Usar timbre do escritório na peça
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  Cabeçalho, rodapé e marca d&apos;água vêm do Perfil.{" "}
                  <Link
                    href="/dashboard/perfil"
                    className="font-medium text-stone-700 underline hover:text-stone-900"
                  >
                    Configurar timbre no Perfil
                  </Link>
                </span>
              </span>
            </label>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Checklist antes de gerar
            </p>
            <ul className="mt-2 space-y-1.5">
              {checklistItens.map((item) => (
                <li
                  key={item.id}
                  className={`flex items-center gap-2 text-sm ${
                    item.ok ? "text-emerald-800" : "text-slate-600"
                  }`}
                >
                  <span
                    aria-hidden
                    className={
                      item.ok
                        ? "text-emerald-600"
                        : item.bloqueante
                          ? "text-red-500"
                          : "text-amber-500"
                    }
                  >
                    {item.ok ? "✓" : "○"}
                  </span>
                  {item.label}
                  {!item.bloqueante && !item.ok && (
                    <span className="text-xs text-slate-400">(recomendado)</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !podeGerar}
              className="rounded-lg bg-stone-700 px-8 py-3.5 text-base font-semibold text-amber-50 shadow-sm transition hover:bg-stone-600 disabled:opacity-60"
            >
              {loading
                ? LOADING_STAGES[loadingStage]
                : isAssistente
                  ? "Confirmar ação e gerar peça"
                  : "Analisar provas e gerar peça"}
            </button>
          </div>
        </section>
      </form>

      {resultado && (
        <div
          id="peca-gerada"
          className="scroll-mt-24 border-t border-slate-200 pt-8"
        >
          <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <strong>Minuta para revisão.</strong> Esta peça não é protocolada
            automaticamente — confira dados, valores e fundamentos antes de
            peticionar.
          </div>
          <p className="mb-4 text-sm text-slate-500">
            O formulário acima permanece preenchido. Edite os fatos e gere de
            novo quando quiser — PDF e Word abrem em nova aba.
          </p>
          <PecasResultado
            resultado={resultado}
            escritorio={escritorio}
            onFechar={() => setResultado(null)}
          />
        </div>
      )}

      {resultado && (
        <StickyExportBar
          peca={resultado.peca}
          pecaHtml={resultado.pecaHtml}
          escritorio={escritorio}
          onVoltarFormulario={() =>
            window.scrollTo({ top: 0, behavior: "smooth" })
          }
        />
      )}
    </div>
  );
}
