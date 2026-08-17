"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { GerarPecaJecOutput } from "@/lib/gerar-peca-jec";
import {
  ASSISTENTE_FACTO,
  analisarCaseAssistente,
  formatarNomeAcaoForense,
  montarTituloAcaoCompleto,
  type DecisaoAssistente,
  type ModoDefinicaoAcao,
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
import { docsConferenciaDaArea } from "@/lib/docs-conferencia-protocolo";
import {
  ESPECIES_PECA_JEC,
  inferirEspeciePeca,
  metaEspecie,
  normalizarEspeciePeca,
  tituloPecaCabivel,
  type EspeciePecaJec,
} from "@/lib/jec-especie-peca";
import {
  areaUsaPoloAdvocacia,
  especieCompativelComPolo,
  filtrarEspeciesPorPolo,
  inferirPoloPorEspecie,
  normalizarPoloAdvocacia,
  rotuloPoloAdvocacia,
  type PoloAdvocacia,
} from "@/lib/polo-advocacia";
import {
  idsPeticaoInicialDaArea,
  listaEspeciesDaArea,
  metaEspecieDaArea,
  tituloPecaDaArea,
} from "@/lib/peca-especie-area";
import {
  GUIAS_MINUTA,
  LOADING_STAGES_GERACAO,
  areaMostraMle,
  moduloDaArea,
  type AreaIdMinuta,
  type GuiaMinuta,
} from "@/lib/minuta-modulo";
import {
  autoresAPartirDosNomes,
  autorOkParaChecklist,
  pecaUsaPartesJaQualificadas,
  reuOkParaChecklist,
  reusAPartirDosNomes,
  resolverPoloClienteQualificacao,
  textoAjudaQualificacaoPeca,
} from "@/lib/partes-ja-qualificadas";
import type { FaseCasoJec } from "@/lib/jec-caso-types";
import { metaFase } from "@/lib/jec-caso-types";
import {
  obterCasoJec,
  vincularPecaAoCaso,
} from "@/lib/jec-casos-storage";
import { calcularResumoValorCausa } from "@/lib/valores-causa";
import {
  mensagemBloqueioTetoLeigo,
  ultrapassaTetoJec,
} from "@/lib/jec-teto";
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
  normalizarComarcaValue,
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
import { ReusSection } from "@/components/dashboard/reus-form";
import { AutorSection } from "@/components/dashboard/autor-form";
import {
  JurisCasoSection,
  type JurisCasoSalvo,
} from "@/components/dashboard/juris-caso-form";
import { JurisSugestoesPicker } from "@/components/dashboard/juris-sugestoes-picker";
import type { ReuValue } from "@/lib/reu-types";
import {
  normalizarAutores,
  type AutorValue,
} from "@/lib/autor-types";
import type { JurisCasoPayload } from "@/lib/juris-caso-types";
import type { ResumoCota } from "@/lib/cota-pecas";
import { PacotesExtrasPainel } from "@/components/dashboard/pacotes-extras-painel";
import { AnalisarProcessoSection } from "@/components/dashboard/analisar-processo-section";
import type { AnaliseProcessoResultado } from "@/lib/analisar-processo-types";
import { ROTULO_DOC_LABEL } from "@/lib/analisar-processo-types";

type GuiaJec = GuiaMinuta;
const GUIAS_JEC = GUIAS_MINUTA;
const LOADING_STAGES = LOADING_STAGES_GERACAO;

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

function ProtocoloDocsChecklist({ areaId }: { areaId: AreaIdMinuta }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">
        Conferência de documentos
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Lembrete do que você junta no protocolo (e-proc, ESAJ ou presencial).
        O FACTO não envia esses arquivos ao juízo e a lista não entra na
        redação da peça.
      </p>
      <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950">
        Cada caso pode precisar de documentos próprios. Confira sempre o que a
        peça alega e o que a unidade judiciária exige.
      </p>

      <ul className="mt-4 list-disc space-y-2.5 pl-5">
        {docsConferenciaDaArea(areaId).map((doc) => (
          <li key={doc.id} className="text-sm text-slate-800">
            {doc.label}
            {doc.nota ? (
              <span className="mt-0.5 block text-xs font-normal text-slate-500">
                {doc.nota}
              </span>
            ) : null}
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
          Word com timbre · PDF e cópia em texto limpo
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
            Minuta — revise antes de protocolar
          </div>
          <h2 className="text-xl font-semibold text-slate-800">
            Peça gerada
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Complete os campos entre colchetes, se houver, antes de protocolar.
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
      {resultado.equipeEtapas && resultado.equipeEtapas.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-800">
            Equipe FACTO nesta geração
          </h3>
          <ul className="space-y-2">
            {resultado.equipeEtapas.map((e) => (
              <li
                key={`${e.id}-${e.titulo}`}
                className="flex items-start gap-2 text-sm text-slate-700"
              >
                <span
                  className={
                    e.status === "ok"
                      ? "mt-0.5 text-emerald-600"
                      : e.status === "parcial"
                        ? "mt-0.5 text-amber-600"
                        : "mt-0.5 text-slate-400"
                  }
                >
                  {e.status === "ok" ? "✓" : e.status === "parcial" ? "!" : "·"}
                </span>
                <span className="min-w-0">
                  <span className="font-medium text-slate-800">{e.skin}</span>
                  <span className="text-slate-500"> — {e.titulo}</span>
                  {e.detalhe ? (
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {e.detalhe}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {!resultado.geradoPorIA && !resultado.avisoIA && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Peça de reserva (fundamentação genérica). Gere novamente para obter a
          redação completa.
        </div>
      )}

      {resultado.analiseEstrategica && (
        <section className="rounded-lg border border-stone-300 bg-stone-50 p-5 shadow-sm">
          <h3 className="font-semibold text-stone-800">Análise estratégica</h3>
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
            Jurisprudência a conferir
          </h3>
          <p className="mt-1 text-xs text-red-700">
            Trechos na peça sem correspondência no material anexado ou na base
            do caso.
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
            Soma fixa do formulário — não é alterada na redação.
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
          Fundamentação legal aplicável
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
    modoAcao: "assistente" as ModoDefinicaoAcao,
    tipoAcaoTexto: "",
    especiePeca: "peticao-inicial" as EspeciePecaJec,
    poloAdvocacia: "ativo" as PoloAdvocacia,
    especieManual: false,
    fatos: "",
    tutelaUrgencia: false,
    cumuloDanosMorais: false,
    cumuloDanosMateriais: false,
    comarca: comarcaVazia(),
    valoresCausa: valoresCausaVazio(),
    usaLeiMunicipal: false,
    leiMunicipalTexto: "",
    leiMunicipalTitulo: "",
    linkNuvem: "",
    reus: [] as ReuValue[],
    autores: [] as AutorValue[],
    jurisCaso: [] as JurisCasoSalvo[],
    pedidos: [] as PedidoItem[],
    mostrarMidiasOpcionais: false,
    pedirJusticaGratuita: false,
    temMle: false,
    justificativaAssistente: null as string | null,
    notaAssistente: false,
  };
}

export function JecForm({
  leigo = false,
  areaId = "jec",
}: {
  leigo?: boolean;
  areaId?: AreaIdMinuta;
}) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<GerarPecaJecOutput | null>(null);
  const [casoVinculoId, setCasoVinculoId] = useState<string | null>(null);
  const [faseVinculo, setFaseVinculo] = useState<FaseCasoJec | null>(null);
  const [msgCaso, setMsgCaso] = useState<string | null>(null);
  const [guiaAtiva, setGuiaAtiva] = useState<GuiaJec>("identificacao");
  const [modoAcao, setModoAcao] = useState<ModoDefinicaoAcao>("assistente");
  const [tipoAcaoTexto, setTipoAcaoTexto] = useState("");
  const [especiePeca, setEspeciePeca] = useState(
    () => idsPeticaoInicialDaArea(areaId)[0] ?? "peticao-inicial"
  );
  const [poloAdvocacia, setPoloAdvocacia] = useState<PoloAdvocacia>("ativo");
  const [especieManual, setEspecieManual] = useState(false);
  const [fatos, setFatos] = useState("");
  const [tutelaUrgencia, setTutelaUrgencia] = useState(false);
  const [cumuloDanosMorais, setCumuloDanosMorais] = useState(false);
  const [cumuloDanosMateriais, setCumuloDanosMateriais] = useState(false);
  const [escritorio, setEscritorio] =
    useState<EscritorioConfig>(escritorioConfigVazio);
  const [comarca, setComarca] = useState<ComarcaValue>(comarcaVazia);
  const [valoresCausa, setValoresCausa] =
    useState<ValoresPorCategoria>(valoresCausaVazio);
  const [usaLeiMunicipal, setUsaLeiMunicipal] = useState(false);
  const [leiMunicipalTexto, setLeiMunicipalTexto] = useState("");
  const [leiMunicipalTitulo, setLeiMunicipalTitulo] = useState("");
  const [mostrarMidiasOpcionais, setMostrarMidiasOpcionais] = useState(false);
  const [pedirJusticaGratuita, setPedirJusticaGratuita] = useState(false);
  const [temMle, setTemMle] = useState(false);
  const [linkNuvem, setLinkNuvem] = useState("");
  const [reus, setReus] = useState<ReuValue[]>([]);
  const [autores, setAutores] = useState<AutorValue[]>([]);
  const [jurisCaso, setJurisCaso] = useState<JurisCasoSalvo[]>([]);
  const [pedidos, setPedidos] = useState<PedidoItem[]>([]);
  const [decisaoSugerida, setDecisaoSugerida] =
    useState<DecisaoAssistente | null>(null);
  const [notaAssistente, setNotaAssistente] = useState(false);
  const [justificativaAssistente, setJustificativaAssistente] = useState<
    string | null
  >(null);
  const [analisandoAssistente, setAnalisandoAssistente] = useState(false);
  const [analiseProcesso, setAnaliseProcesso] =
    useState<AnaliseProcessoResultado | null>(null);
  const [processoConfirmado, setProcessoConfirmado] = useState(false);
  const [rascunhos, setRascunhos] = useState<JecRascunhoSalvo[]>([]);
  const [rascunhoAtivoId, setRascunhoAtivoId] = useState<string | null>(null);
  const [msgRascunho, setMsgRascunho] = useState<string | null>(null);
  const [cota, setCota] = useState<ResumoCota | null>(null);

  const isAssistente = modoAcao === "assistente";
  const isProcesso = modoAcao === "processo";
  const assistentePendente =
    (isAssistente || isProcesso) && tipoAcaoTexto.trim().length < 8;
  const tipoAcaoDefinido = formatarNomeAcaoForense(tipoAcaoTexto, areaId);

  useEffect(() => {
    let cancelado = false;
    async function carregarCota() {
      try {
        const res = await fetch("/api/cota");
        const data = await res.json();
        if (!cancelado && res.ok && data.cota) setCota(data.cota);
      } catch {
        /* silencioso — UI de cota é auxiliar */
      }
    }
    void carregarCota();
    return () => {
      cancelado = true;
    };
  }, []);

  // JEC-2: contexto vindo da linha do tempo do caso
  useEffect(() => {
    const casoId = searchParams.get("caso");
    const fase = searchParams.get("fase") as FaseCasoJec | null;
    const especieParam = normalizarEspeciePeca(searchParams.get("especie"));
    const processo = searchParams.get("processo");
    const foro = searchParams.get("foro");
    const fatosParam = searchParams.get("fatos");

    if (casoId && obterCasoJec(casoId)) {
      setCasoVinculoId(casoId);
      if (fase) setFaseVinculo(fase);
    }
    if (especieParam) {
      setEspeciePeca(especieParam);
      setEspecieManual(true);
    }
    if (processo || foro) {
      setComarca((c) => ({
        ...c,
        numeroProcesso: processo?.trim() || c.numeroProcesso,
        foro: foro?.trim() || c.foro,
      }));
    }
    if (fatosParam?.trim()) {
      setFatos((atual) => (atual.trim() ? atual : fatosParam.trim()));
    }
  }, [searchParams]);

  const resumoValores = useMemo(
    () => calcularResumoValorCausa(valoresCausa),
    [valoresCausa]
  );

  const comAdvogado = !leigo;
  const bloqueadoTetoLeigo =
    areaId === "jec" &&
    leigo &&
    ultrapassaTetoJec(resumoValores.totalCentavos, false);
  const idsInicial = idsPeticaoInicialDaArea(areaId);
  const especiesOpcoes = useMemo(() => {
    const base = listaEspeciesDaArea(areaId) ?? ESPECIES_PECA_JEC;
    if (!areaUsaPoloAdvocacia(areaId)) return base;
    return filtrarEspeciesPorPolo(
      areaId,
      base as readonly { id: string }[],
      poloAdvocacia
    ) as typeof base;
  }, [areaId, poloAdvocacia]);
  const moduloUi = moduloDaArea(areaId);
  const comPoloAdvocacia = areaUsaPoloAdvocacia(areaId);

  useEffect(() => {
    if (!comPoloAdvocacia) return;
    if (!especieCompativelComPolo(areaId, especiePeca, poloAdvocacia)) {
      const primeira = especiesOpcoes[0]?.id;
      if (primeira) setEspeciePeca(primeira);
    }
  }, [areaId, comPoloAdvocacia, poloAdvocacia, especiePeca, especiesOpcoes]);

  useEffect(() => {
    if (!comPoloAdvocacia || !especieManual) return;
    const inferido = inferirPoloPorEspecie(areaId, especiePeca);
    if (inferido && inferido !== poloAdvocacia) {
      setPoloAdvocacia(inferido);
    }
  }, [areaId, comPoloAdvocacia, especieManual, especiePeca, poloAdvocacia]);

  const tituloAcaoCompleto = useMemo(() => {
    if (!tipoAcaoDefinido) return "";
    if (pecaUsaPartesJaQualificadas(especiePeca, idsInicial)) {
      return formatarNomeAcaoForense(
        tituloPecaDaArea(
          areaId,
          especiePeca,
          tipoAcaoDefinido,
          justificativaAssistente ?? ""
        ),
        areaId
      );
    }
    return montarTituloAcaoCompleto(
      tipoAcaoDefinido,
      {
        danosMorais: cumuloDanosMorais,
        danosMateriais: cumuloDanosMateriais,
        tutelaUrgencia,
      },
      areaId
    );
  }, [
    tipoAcaoDefinido,
    especiePeca,
    areaId,
    idsInicial,
    justificativaAssistente,
    cumuloDanosMorais,
    cumuloDanosMateriais,
    tutelaUrgencia,
  ]);

  const jaQualificadas = pecaUsaPartesJaQualificadas(especiePeca, idsInicial);
  const ajudaQualificacao = textoAjudaQualificacaoPeca(
    areaId,
    especiePeca,
    comPoloAdvocacia
      ? poloAdvocacia
      : resolverPoloClienteQualificacao(areaId, especiePeca, null),
    moduloUi.rotuloPoloAtivo,
    moduloUi.rotuloPoloPassivo
  );
  const checklistItens = montarChecklistJec({
    tipoSelecionado: tipoAcaoDefinido || (assistentePendente ? ASSISTENTE_FACTO : ""),
    fatos,
    autorOk: autorOkParaChecklist(
      autores,
      jaQualificadas,
      analiseProcesso?.ficha.partesAutor
    ),
    reusOk: reuOkParaChecklist(
      reus,
      jaQualificadas,
      analiseProcesso?.ficha.partesReu
    ),
    comarcaForo: comarca.foro ?? "",
    temValor: resumoValores.totalCentavos > 0,
    assistentePendente:
      assistentePendente ||
      (modoAcao === "livre" && tipoAcaoTexto.trim().length < 8),
    processoPendenteConfirmacao:
      isProcesso && Boolean(analiseProcesso) && !processoConfirmado,
    partesJaQualificadas: jaQualificadas,
  });

  const podeGerar = podeGerarPeca(checklistItens) && !bloqueadoTetoLeigo;

  const itemOk = (id: string) =>
    Boolean(checklistItens.find((i) => i.id === id)?.ok);
  const guiaIdentificacaoOk =
    itemOk("tipo") && itemOk("autor") && itemOk("reus");
  const guiaFatosOk = itemOk("fatos");
  const guiaPedidosOk =
    itemOk("valores") ||
    pedidos.some((p) => p.descricao.trim().length > 0);

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

  function sincronizarEspecieDoTipo(texto: string, forcar = false) {
    if (especieManual && !forcar) return;
    setEspeciePeca(inferirEspeciePeca(texto, fatos));
  }

  function aplicarDecisaoAssistente(decisao: DecisaoAssistente) {
    setModoAcao("assistente");
    const titulo = decisao.tituloCompleto || decisao.tipoAcao;
    setTipoAcaoTexto(titulo);
    if (!especieManual) {
      setEspeciePeca(inferirEspeciePeca(titulo, fatos));
    }
    setTutelaUrgencia(decisao.tutelaUrgencia);
    setCumuloDanosMorais(decisao.danosMorais);
    setCumuloDanosMateriais(decisao.danosMateriais);
    setJustificativaAssistente(decisao.justificativa);
    setNotaAssistente(true);
    setDecisaoSugerida(decisao);
  }

  function aplicarAnaliseProcesso(analise: AnaliseProcessoResultado) {
    setAnaliseProcesso(analise);
    setProcessoConfirmado(false);
    setModoAcao("processo");
    const peca = analise.pecaCandidata;
    const titulo = pecaUsaPartesJaQualificadas(
      peca.especiePeca,
      idsInicial
    )
      ? peca.tituloCompleto || peca.tipoAcao
      : peca.tituloCompleto || peca.tipoAcao;
    setTipoAcaoTexto(titulo);
    setEspeciePeca(
      inferirEspeciePeca(titulo, analise.ficha.fatosSugeridos, peca.especiePeca)
    );
    setEspecieManual(true);
    if (comPoloAdvocacia) {
      const esp = inferirEspeciePeca(
        titulo,
        analise.ficha.fatosSugeridos,
        peca.especiePeca
      );
      const poloInferido = inferirPoloPorEspecie(areaId, esp);
      if (poloInferido) setPoloAdvocacia(poloInferido);
    }
    setTutelaUrgencia(peca.tutelaUrgencia);
    setCumuloDanosMorais(peca.danosMorais);
    setCumuloDanosMateriais(peca.danosMateriais);
    setJustificativaAssistente(peca.justificativa);
    setNotaAssistente(true);
    if (analise.ficha.fatosSugeridos.trim()) {
      setFatos(analise.ficha.fatosSugeridos.trim());
    }
    if (analise.ficha.numeroProcesso.trim()) {
      setComarca((c) => ({
        ...c,
        numeroProcesso: analise.ficha.numeroProcesso.trim(),
      }));
    }
    if (analise.ficha.partesAutor.trim()) {
      setAutores(autoresAPartirDosNomes(analise.ficha.partesAutor));
    }
    if (analise.ficha.partesReu.trim()) {
      setReus(reusAPartirDosNomes(analise.ficha.partesReu));
    }
  }

  function confirmarPecaDoProcesso() {
    if (!analiseProcesso) return;
    setProcessoConfirmado(true);
    setError(null);
  }

  async function handleAnalisarAssistente() {
    if (fatos.trim().length < 40) {
      setError(
        "Descreva os fatos (mín. ~40 caracteres) antes de pedir a análise do Assistente."
      );
      document
        .getElementById("secao-fatos")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setError(null);
    setAnalisandoAssistente(true);
    try {
      const response = await fetch("/api/assistente-facto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fatos: fatos.trim(), areaId }),
      });
      const texto = await response.text();
      let data: {
        error?: string;
        decisao?: DecisaoAssistente;
      } = {};
      try {
        data = JSON.parse(texto) as typeof data;
      } catch {
        setError(
          response.ok
            ? "Resposta inválida do Assistente. Tente novamente."
            : `Falha no Assistente (HTTP ${response.status}). Tente novamente.`
        );
        return;
      }

      if (!response.ok || !data.decisao) {
        // Fallback local se a API falhar
        const local = analisarCaseAssistente({ fatos, areaId });
        aplicarDecisaoAssistente(local);
        setError(
          data.error
            ? `${data.error} Usamos a análise local de respaldo.`
            : null
        );
        return;
      }

      aplicarDecisaoAssistente(data.decisao);
    } catch {
        const local = analisarCaseAssistente({ fatos, areaId });
      aplicarDecisaoAssistente(local);
      setError(
        "Não foi possível falar com a IA agora. Aplicamos a análise local — revise o tipo sugerido."
      );
    } finally {
      setAnalisandoAssistente(false);
    }
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
    setModoAcao(ini.modoAcao);
    setTipoAcaoTexto(ini.tipoAcaoTexto);
    setEspeciePeca(ini.especiePeca);
    setPoloAdvocacia(ini.poloAdvocacia);
    setEspecieManual(ini.especieManual);
    setFatos(ini.fatos);
    setTutelaUrgencia(ini.tutelaUrgencia);
    setCumuloDanosMorais(ini.cumuloDanosMorais);
    setCumuloDanosMateriais(ini.cumuloDanosMateriais);
    setComarca(ini.comarca);
    setValoresCausa(ini.valoresCausa);
    setUsaLeiMunicipal(ini.usaLeiMunicipal);
    setLeiMunicipalTexto(ini.leiMunicipalTexto);
    setLeiMunicipalTitulo(ini.leiMunicipalTitulo);
    setLinkNuvem(ini.linkNuvem);
    setReus(ini.reus);
    setAutores(ini.autores);
    setJurisCaso(ini.jurisCaso);
    setPedidos(ini.pedidos);
    setMostrarMidiasOpcionais(ini.mostrarMidiasOpcionais);
    setPedirJusticaGratuita(ini.pedirJusticaGratuita);
    setTemMle(ini.temMle);
    setDecisaoSugerida(null);
    setJustificativaAssistente(ini.justificativaAssistente);
    setNotaAssistente(ini.notaAssistente);
    setAnaliseProcesso(null);
    setProcessoConfirmado(false);
    setResultado(null);
    setRascunhoAtivoId(null);
    setMsgRascunho(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function aplicarRascunho(r: JecRascunhoSalvo) {
    const p = r.payload;
    setFatos(p.fatos ?? "");
    const tipoSalvo = (p.tipoSelecionado ?? "").trim();
    if (!tipoSalvo || tipoSalvo === ASSISTENTE_FACTO) {
      setModoAcao("assistente");
      setTipoAcaoTexto("");
    } else {
      setModoAcao("livre");
      setTipoAcaoTexto(tipoSalvo);
    }
    const espSalva = inferirEspeciePeca(
      tipoSalvo,
      p.fatos,
      p.especiePeca
    );
    setEspeciePeca(espSalva);
    setPoloAdvocacia(normalizarPoloAdvocacia(p.poloAdvocacia));
    setEspecieManual(Boolean(p.especiePeca));
    setTutelaUrgencia(Boolean(p.tutelaUrgencia));
    setComarca(normalizarComarcaValue(p.comarca, areaId));
    setValoresCausa(p.valoresCausa ?? valoresCausaVazio());
    setUsaLeiMunicipal(Boolean(p.usaLeiMunicipal));
    setLeiMunicipalTexto(p.leiMunicipalTexto ?? "");
    setLeiMunicipalTitulo(p.leiMunicipalTitulo ?? "");
    setLinkNuvem(p.linkNuvem ?? "");
    setReus(Array.isArray(p.reus) ? p.reus : []);
    setAutores(
      normalizarAutores(
        Array.isArray(p.autores) && p.autores.length
          ? p.autores
          : p.autor ?? []
      )
    );
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
    setJustificativaAssistente(null);
    setCumuloDanosMorais(false);
    setCumuloDanosMateriais(false);
    setRascunhoAtivoId(r.id);
    setMsgRascunho(
      "Rascunho restaurado. Reenvie os anexos, se necessário."
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
          tipoSelecionado: tituloAcaoCompleto || tipoAcaoTexto || ASSISTENTE_FACTO,
          especiePeca,
          poloAdvocacia: comPoloAdvocacia ? poloAdvocacia : undefined,
          tutelaUrgencia,
          comarca,
          valoresCausa,
          usaLeiMunicipal,
          leiMunicipalTexto,
          leiMunicipalTitulo,
          linkNuvem,
          reus,
          autores,
          pedidos,
          jurisCaso,
        }),
        rascunhoAtivoId ?? undefined,
        nomePrompt.trim() || undefined
      );
      setRascunhoAtivoId(salvo.id);
      setRascunhos(listarRascunhosJec());
      setMsgRascunho("Salvo neste navegador.");
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

    if (
      areaId === "jec" &&
      leigo &&
      ultrapassaTetoJec(resumoValores.totalCentavos, false)
    ) {
      setError(mensagemBloqueioTetoLeigo(resumoValores.totalCentavos));
      return;
    }

    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const tipoAcaoRaw = tituloAcaoCompleto || formatarNomeAcaoForense(tipoAcaoTexto, areaId);
    if (!tipoAcaoRaw || tipoAcaoRaw === ASSISTENTE_FACTO) {
      setError(
        modoAcao === "assistente"
          ? "Peça ao Assistente Facto para analisar os fatos e nomear a ação, ou informe o tipo livremente."
          : "Informe o tipo de ação antes de gerar a peça."
      );
      setLoading(false);
      return;
    }

    const tipoAcao = montarTituloAcaoCompleto(tipoAcaoRaw, {
      danosMorais: cumuloDanosMorais,
      danosMateriais: cumuloDanosMateriais,
      tutelaUrgencia,
    });

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
      especiePeca,
      poloAdvocacia: comPoloAdvocacia ? poloAdvocacia : undefined,
      atuarLeigo: leigo,
      areaId,
      dispositivoSentenca:
        analiseProcesso?.ficha.dispositivo?.trim() || undefined,
      tutelaUrgencia,
      pedirJusticaGratuita,
      temMle: areaMostraMle(areaId) ? temMle : false,
      fatos: fatos.trim(),
      pedidosUsuario,
      documentos: {
        declaracaoHipossuficiencia: [],
        mandadoLevantamentoEletronico: [],
      },
      provas: getFileNames(
        form.querySelector<HTMLInputElement>("#provasEssenciais")
      ),
      fotos: [],
      midias: getFileNames(form.querySelector<HTMLInputElement>("#midias")),
      linkNuvem: linkNuvem.trim() || null,
      reus,
      autores,
      jurisDoCaso: jurisDoCaso.length > 0 ? jurisDoCaso : null,
      escritorio,
      comarca: (() => {
        const foro = comarca.foro.trim();
        // cidade/UF só para fechamento/OAB — o cabeçalho usa o texto do foro.
        const legadoCidade = comarca.cidade?.trim() ?? "";
        const legadoUf = comarca.uf?.trim() ?? "";
        return {
          foro,
          cidade: legadoCidade || undefined,
          uf: legadoUf || undefined,
          numeroJuizado: comarca.numeroJuizado || undefined,
          numeroProcesso: comarca.numeroProcesso?.trim() || undefined,
        };
      })(),
      valoresCausa,
      leiMunicipal,
    };

    try {
      const response = await fetch("/api/gerar-peca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const texto = await response.text();
      let data: {
        error?: string;
        codigo?: string;
        cota?: ResumoCota;
      } & Partial<GerarPecaJecOutput> = {};
      try {
        data = JSON.parse(texto) as typeof data;
      } catch {
        const dicaTimeout =
          response.status === 504 || response.status === 408
            ? " A geração pode ter estourado o tempo limite — tente de novo com fatos um pouco mais objetivos."
            : "";
        setError(
          `Falha na comunicação com o servidor (HTTP ${response.status || "—"}). Tente novamente.${dicaTimeout}`
        );
        setLoading(false);
        return;
      }

      if (!response.ok) {
        if (data.codigo === "COTA_ESGOTADA" && data.cota) {
          setCota(data.cota);
          window.setTimeout(() => {
            document
              .getElementById("pacotes-extras-jec")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 50);
        }
        setError(data.error ?? "Erro ao gerar a peça.");
        setLoading(false);
        return;
      }

      if (data.cota) setCota(data.cota);
      setResultado(data as GerarPecaJecOutput);
      setMsgCaso(null);
      window.setTimeout(() => {
        document
          .getElementById("peca-gerada")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch (erro) {
      setError(
        erro instanceof TypeError
          ? "Falha de rede ao falar com o servidor. Verifique a conexão e tente novamente."
          : "Falha na comunicação com o servidor. Tente novamente."
      );
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
            {moduloUi.tituloDashboard}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {moduloUi.copyCabecalho}
          </p>
          {cota?.trackingAtivo && cota.usoLabel && !cota.esgotada && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  (cota.percentualUsado ?? 0) >= 85
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
              />
              {cota.usoLabel}
            </p>
          )}
          {cota?.trackingAtivo && cota.usoLabelAnalises && !cota.esgotadaAnalises && (
            <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              {cota.usoLabelAnalises}
            </p>
          )}
        </header>

        {(cota?.esgotada ||
          (cota?.percentualUsado ?? 0) >= 85 ||
          cota?.esgotadaAnalises) && (
          <PacotesExtrasPainel
            id="pacotes-extras-jec"
            variante="banner"
            cota={cota}
          />
        )}

        {casoVinculoId && moduloUi.hrefCasos ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm">
            <p className="text-slate-600">
              Gerando para o caso{" "}
              <Link
                href={`${moduloUi.hrefCasos}/${casoVinculoId}`}
                className="font-medium text-stone-800 underline-offset-2 hover:underline"
              >
                {obterCasoJec(casoVinculoId)?.titulo ?? "aberto"}
              </Link>
              {faseVinculo ? (
                <span className="text-slate-500">
                  {" "}
                  · fase {metaFase(faseVinculo).rotulo}
                </span>
              ) : null}
            </p>
          </div>
        ) : null}

        <nav
          aria-label="Etapas do formulário"
          className="sticky top-0 z-20 -mx-1 flex gap-1 border-b border-slate-200 bg-white/95 px-1 py-2 backdrop-blur"
        >
          {GUIAS_JEC.map((guia) => {
            const ok =
              guia.id === "identificacao"
                ? guiaIdentificacaoOk
                : guia.id === "fatos"
                  ? guiaFatosOk
                  : guiaPedidosOk;
            const ativa = guiaAtiva === guia.id;
            return (
              <button
                key={guia.id}
                type="button"
                onClick={() => setGuiaAtiva(guia.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
                  ativa
                    ? "bg-stone-800 text-amber-50"
                    : "text-slate-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <span
                  aria-hidden
                  className={
                    ok
                      ? ativa
                        ? "text-emerald-300"
                        : "text-emerald-600"
                      : ativa
                        ? "text-amber-100/70"
                        : "text-slate-300"
                  }
                >
                  {ok ? "✓" : "○"}
                </span>
                {guia.label}
              </button>
            );
          })}
        </nav>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className={guiaAtiva === "identificacao" ? "space-y-6" : "hidden"}>
        <section
          id="secao-acao"
          className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-1 text-lg font-semibold text-slate-800">
            Peça e nome da ação
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            Escolha o tipo de peça (petição inicial, recurso, embargos etc.) e
            como obter o nome da ação: pelos fatos, pelos autos em PDF ou
            digitando você mesmo.
          </p>

          <div className="space-y-4 sm:max-w-2xl">
            {comPoloAdvocacia ? (
              <div>
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Estou atuando pelo…
                </span>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                  {(["ativo", "passivo"] as const).map((polo) => (
                    <label
                      key={polo}
                      className="flex flex-1 cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm has-[:checked]:border-stone-500 has-[:checked]:bg-stone-50"
                    >
                      <input
                        type="radio"
                        name="poloAdvocacia"
                        checked={poloAdvocacia === polo}
                        onChange={() => setPoloAdvocacia(polo)}
                        className="mt-0.5 h-4 w-4 border-slate-300 text-stone-700 focus:ring-stone-500"
                      />
                      <span>
                        <span className="font-medium text-slate-800">
                          {polo === "ativo" ? "Polo ativo" : "Polo passivo"}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {rotuloPoloAdvocacia(
                            polo,
                            moduloUi.rotuloPoloAtivo,
                            moduloUi.rotuloPoloPassivo
                          )}
                          {leigo
                            ? " — em causa própria"
                            : " — a peça será redigida em favor deste polo"}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-slate-500">
                  O tipo de peça abaixo é filtrado conforme o polo escolhido.
                  {areaId === "jec"
                    ? " Recurso inominado, contrarrazões, agravo, embargos e execução aparecem nos dois polos — quem recorre ou responde depende do seu cliente (autor ou réu)."
                    : " Recursos e incidentes podem aparecer nos dois polos, conforme o caso."}
                </p>
              </div>
            ) : null}

            <div>
              <label
                htmlFor="especiePeca"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Tipo de peça
              </label>
              <select
                id="especiePeca"
                name="especiePeca"
                value={especiePeca}
                onChange={(e) => {
                  const proxima = e.target.value;
                  setEspeciePeca(proxima);
                  setEspecieManual(true);
                  if (pecaUsaPartesJaQualificadas(proxima, idsInicial)) {
                    setTipoAcaoTexto(
                      tituloPecaDaArea(
                        areaId,
                        proxima,
                        tipoAcaoTexto,
                        justificativaAssistente ??
                          analiseProcesso?.pecaCandidata.justificativa ??
                          ""
                      )
                    );
                  }
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
              >
                {especiesOpcoes.map((esp) => (
                  <option key={esp.id} value={esp.id}>
                    {esp.rotulo}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-slate-500">
                {(() => {
                  const meta = metaEspecieDaArea(areaId, especiePeca);
                  const prazo =
                    "prazoAviso" in meta
                      ? String(
                          (meta as { prazoAviso?: string }).prazoAviso ?? ""
                        )
                      : "";
                  return `${meta.descricao}${
                    meta.exigeProcesso
                      ? " Informe o nº do processo na Comarca."
                      : ""
                  }${prazo ? ` ${prazo}` : ""}`;
                })()}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
              <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm has-[:checked]:border-stone-500 has-[:checked]:bg-stone-50">
                <input
                  type="radio"
                  name="modoAcao"
                  checked={modoAcao === "assistente"}
                  onChange={() => {
                    setModoAcao("assistente");
                    setNotaAssistente(false);
                    setJustificativaAssistente(null);
                    setDecisaoSugerida(null);
                    setTipoAcaoTexto("");
                    setAnaliseProcesso(null);
                    setProcessoConfirmado(false);
                  }}
                  className="mt-0.5 h-4 w-4 border-slate-300 text-stone-700 focus:ring-stone-500"
                />
                <span>
                  <span className="font-medium text-slate-800">
                    Assistente FACTO
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    A partir dos fatos, sugerimos o nome usual da ação.
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm has-[:checked]:border-stone-500 has-[:checked]:bg-stone-50">
                <input
                  type="radio"
                  name="modoAcao"
                  checked={modoAcao === "processo"}
                  onChange={() => {
                    setModoAcao("processo");
                    setNotaAssistente(false);
                    setJustificativaAssistente(null);
                    setDecisaoSugerida(null);
                    setTipoAcaoTexto("");
                    setAnaliseProcesso(null);
                    setProcessoConfirmado(false);
                  }}
                  className="mt-0.5 h-4 w-4 border-slate-300 text-stone-700 focus:ring-stone-500"
                />
                <span>
                  <span className="font-medium text-slate-800">
                    Analisar processo
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    Envie PDF/DOCX dos autos (até 40 MB no total); sugerimos a
                    peça cabível para você confirmar. Não gasta cota de peça.
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm has-[:checked]:border-stone-500 has-[:checked]:bg-stone-50">
                <input
                  type="radio"
                  name="modoAcao"
                  checked={modoAcao === "livre"}
                  onChange={() => {
                    setModoAcao("livre");
                    setNotaAssistente(false);
                    setJustificativaAssistente(null);
                    setDecisaoSugerida(null);
                    setAnaliseProcesso(null);
                    setProcessoConfirmado(false);
                  }}
                  className="mt-0.5 h-4 w-4 border-slate-300 text-stone-700 focus:ring-stone-500"
                />
                <span>
                  <span className="font-medium text-slate-800">
                    Digitar o nome da ação
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    Você escreve o título (ex.: indenização por danos morais).
                  </span>
                </span>
              </label>
            </div>

            <input
              type="hidden"
              name="tipoAcao"
              value={tituloAcaoCompleto || ASSISTENTE_FACTO}
            />

            {modoAcao === "processo" && !analiseProcesso && (
              <AnalisarProcessoSection
                areaId={areaId}
                onResultado={(a) => {
                  aplicarAnaliseProcesso(a);
                  setError(null);
                }}
                onErro={(msg) => setError(msg || null)}
              />
            )}

            {modoAcao === "processo" && analiseProcesso && !processoConfirmado && (
              <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/70 p-4">
                <p className="text-sm font-medium text-stone-800">
                  Peça sugerida — confirme para continuar
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Espécie:</span>{" "}
                  {metaEspecieDaArea(
                    areaId,
                    analiseProcesso.pecaCandidata.especiePeca
                  ).rotulo}
                  {" · "}
                  <span className="font-semibold">Confiança:</span>{" "}
                  {Math.round(analiseProcesso.pecaCandidata.confianca * 100)}%
                </p>
                <p className="text-sm font-medium uppercase tracking-wide text-stone-800">
                  {analiseProcesso.pecaCandidata.tituloCompleto}
                </p>
                <p className="text-xs leading-relaxed text-stone-600">
                  {analiseProcesso.pecaCandidata.justificativa}
                </p>
                {analiseProcesso.documentos.length > 0 && (
                  <ul className="text-xs text-slate-600">
                    {analiseProcesso.documentos.map((d, i) => (
                      <li key={`${d.nome}-${i}`}>
                        {ROTULO_DOC_LABEL[d.rotulo]} — {d.nome}
                        {d.resumo ? `: ${d.resumo}` : ""}
                      </li>
                    ))}
                  </ul>
                )}
                {analiseProcesso.avisos.length > 0 && (
                  <ul className="text-xs text-amber-900/80">
                    {analiseProcesso.avisos.map((a) => (
                      <li key={a}>• {a}</li>
                    ))}
                  </ul>
                )}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={confirmarPecaDoProcesso}
                    className="rounded-lg bg-stone-700 px-4 py-2 text-sm font-medium text-amber-50 hover:bg-stone-600"
                  >
                    Confirmar peça sugerida
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAnaliseProcesso(null);
                      setProcessoConfirmado(false);
                      setTipoAcaoTexto("");
                      setNotaAssistente(false);
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Enviar outros documentos
                  </button>
                </div>
              </div>
            )}

            {modoAcao === "assistente" && !tipoAcaoTexto.trim() && (
              <div className="space-y-3 rounded-lg border border-stone-200 bg-stone-50/80 p-4">
                <p className="text-sm text-slate-600">
                  Preencha a seção <strong>Fatos</strong> e clique em analisar.
                  A IA aplica a ação e os cúmulos automaticamente.
                </p>
                <button
                  type="button"
                  onClick={() => void handleAnalisarAssistente()}
                  disabled={analisandoAssistente}
                  className="rounded-lg bg-stone-700 px-4 py-2 text-sm font-medium text-amber-50 hover:bg-stone-600 disabled:opacity-60"
                >
                  {analisandoAssistente
                    ? "Analisando com IA…"
                    : "Analisar fatos com Assistente Facto"}
                </button>
              </div>
            )}

            {(modoAcao === "livre" ||
              (tipoAcaoTexto.trim().length > 0 &&
                !(isProcesso && analiseProcesso && !processoConfirmado))) && (
              <div className="space-y-3 rounded-lg border border-stone-200 bg-stone-50/80 p-4">
                {notaAssistente && justificativaAssistente && (
                  <p className="text-xs leading-relaxed text-stone-600">
                    <span className="font-semibold text-stone-800">
                      Assistente Facto
                      {decisaoSugerida?.fonte === "gemini"
                        ? " (IA)"
                        : " (análise local)"}
                      :{" "}
                    </span>
                    {justificativaAssistente}
                  </p>
                )}

                <div>
                  <label
                    htmlFor="tipoAcaoLivre"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    {modoAcao === "assistente"
                      ? "Nome da ação (editável)"
                      : modoAcao === "processo"
                        ? "Nome da ação (confirmada — editável)"
                        : "Tipo de ação"}
                  </label>
                  <textarea
                    id="tipoAcaoLivre"
                    rows={2}
                    value={tipoAcaoTexto}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTipoAcaoTexto(v);
                      sincronizarEspecieDoTipo(v);
                      if (modoAcao === "assistente") {
                        setNotaAssistente(false);
                      }
                    }}
                    placeholder="Ex.: Ação Declaratória de Inexistência / Inexigibilidade de Débito"
                    className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
                  />
                </div>

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Cumular (c/c)
                </p>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={cumuloDanosMorais}
                      onChange={(e) => setCumuloDanosMorais(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-stone-700 focus:ring-stone-500"
                    />
                    Danos Morais
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={cumuloDanosMateriais}
                      onChange={(e) =>
                        setCumuloDanosMateriais(e.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-stone-700 focus:ring-stone-500"
                    />
                    Danos Materiais
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      id="tutelaUrgencia"
                      name="tutelaUrgencia"
                      type="checkbox"
                      checked={tutelaUrgencia}
                      onChange={(e) => setTutelaUrgencia(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-stone-700 focus:ring-stone-500"
                    />
                    Tutela de Urgência
                  </label>
                </div>

                {tituloAcaoCompleto && (
                  <div className="rounded-md border border-amber-200/80 bg-amber-50/80 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-800/80">
                      Título forense na peça
                    </p>
                    <p className="mt-1 text-sm font-medium uppercase leading-snug tracking-wide text-stone-800">
                      {tituloAcaoCompleto}
                    </p>
                  </div>
                )}

                {modoAcao === "assistente" && (
                  <button
                    type="button"
                    onClick={() => {
                      setTipoAcaoTexto("");
                      setNotaAssistente(false);
                      setJustificativaAssistente(null);
                      setDecisaoSugerida(null);
                    }}
                    className="text-xs font-medium text-stone-600 underline hover:text-stone-900"
                  >
                    Analisar de novo com o Assistente
                  </button>
                )}
                {modoAcao === "processo" && (
                  <button
                    type="button"
                    onClick={() => {
                      setAnaliseProcesso(null);
                      setProcessoConfirmado(false);
                      setTipoAcaoTexto("");
                      setNotaAssistente(false);
                      setJustificativaAssistente(null);
                    }}
                    className="text-xs font-medium text-stone-600 underline hover:text-stone-900"
                  >
                    Analisar outro processo / documentos
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        <ComarcaSection areaId={areaId} value={comarca} onChange={setComarca} />

        {ajudaQualificacao ? (
          <p className="rounded-lg border border-sky-100 bg-sky-50/90 px-4 py-3 text-xs leading-relaxed text-sky-950">
            <span className="font-semibold">Qualificação das partes: </span>
            {ajudaQualificacao}
          </p>
        ) : null}

        <AutorSection
          value={autores}
          onChange={setAutores}
          jaQualificado={pecaUsaPartesJaQualificadas(especiePeca, idsInicial)}
          rotuloPolo={moduloUi.rotuloPoloAtivo}
        >
          <div className="space-y-4">
            <div>
              <h3 className="mb-1 text-sm font-semibold text-slate-800">
                Opções na peça
              </h3>
              <p className="mb-3 text-xs leading-relaxed text-slate-500">
                Marque só o que deve constar no texto gerado. Documentos de
                hipossuficiência
                {areaMostraMle(areaId) ? " e do MLE" : ""} o FACTO não recebe:
                você junta depois, no protocolo (e-proc, PJe, ESAJ ou
                presencial).
              </p>
            </div>

            <label className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={pedirJusticaGratuita}
                onChange={(e) => setPedirJusticaGratuita(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-stone-700 focus:ring-stone-500"
              />
              <span>
                <span className="font-medium text-slate-800">
                  Pedir justiça gratuita (hipossuficiência)
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Inclui subtítulo e pedido de JG na peça. A declaração de
                  hipossuficiência você junta no protocolo, não aqui.
                </span>
              </span>
            </label>

            {areaMostraMle(areaId) && (
            <label className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={temMle}
                onChange={(e) => setTemMle(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-stone-700 focus:ring-stone-500"
              />
              <span>
                <span className="font-medium text-slate-800">
                  Há Mandado de Levantamento Eletrônico (MLE)
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Inclui pedido de expedição/utilização do MLE, quando cabível.
                  Os documentos do MLE você junta no protocolo, não aqui.
                </span>
              </span>
            </label>
            )}
          </div>
        </AutorSection>

        <div id="secao-reus" className="scroll-mt-24">
          <ReusSection
            value={reus}
            onChange={setReus}
            jaQualificado={pecaUsaPartesJaQualificadas(especiePeca, idsInicial)}
            rotuloPolo={moduloUi.rotuloPoloPassivo}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setGuiaAtiva("fatos")}
            className="rounded-lg bg-stone-700 px-4 py-2 text-sm font-medium text-amber-50 hover:bg-stone-600"
          >
            Continuar para fatos e fundamentos
          </button>
        </div>
        </div>

        <div className={guiaAtiva === "fatos" ? "space-y-6" : "hidden"}>
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
              placeholder={placeholderFatosPorTipo(
                tipoAcaoDefinido || tipoAcaoTexto || ASSISTENTE_FACTO
              )}
              className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-800 placeholder-slate-400 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {isAssistente && (
                <button
                  type="button"
                  onClick={() => void handleAnalisarAssistente()}
                  disabled={analisandoAssistente}
                  className="rounded-lg bg-stone-700 px-4 py-2 text-sm font-medium text-amber-50 transition hover:bg-stone-600 disabled:opacity-60"
                >
                  {analisandoAssistente
                    ? "Analisando…"
                    : "Analisar com Assistente Facto"}
                </button>
              )}
              <button
                type="button"
                onClick={handleSalvarAteAqui}
                className="rounded-lg border border-stone-600 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition hover:bg-stone-50"
              >
                Salvar até aqui
              </button>
              <span className="text-xs text-slate-500">
                Salva neste navegador (sem anexos).
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

        <section
          id="secao-fundamentos"
          className="scroll-mt-24 space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Fundamentos do caso
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              São anexos diferentes: a jurisprudência deste caso pode ser citada
              na peça; a lei municipal só fundamenta este município e não vira
              lastro geral do FACTO.
            </p>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
            <h3 className="mb-1 text-base font-semibold text-slate-800">
              Lei municipal (opcional)
            </h3>
            <p className="mb-4 text-sm text-slate-500">
              Norma deste município (posturas, ISS, código de obras, etc.). Serve
              para o sistema entender o fundamento deste caso — não é súmula nem
              acórdão, e não entra na base geral do FACTO.
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
                    Se houver texto e arquivo, prevalece o texto colado.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 space-y-4">
            <JurisSugestoesPicker
              consulta={[
                tipoAcaoDefinido || tipoAcaoTexto,
                fatos,
              ]
                .filter(Boolean)
                .join("\n")
                .slice(0, 2500)}
              ufForo={
                comarca.uf?.trim().toUpperCase() ||
                (() => {
                  const m = comarca.foro.match(/\/\s*([A-Za-z]{2})\b/);
                  return m?.[1]?.toUpperCase() ?? null;
                })()
              }
              uploads={jurisCaso}
              onAplicar={(itens) => {
                setJurisCaso((prev) => {
                  const ids = new Set(prev.map((p) => p.titulo.toLowerCase()));
                  const novos = itens.filter(
                    (i) => !ids.has(i.titulo.toLowerCase())
                  );
                  return [...prev, ...novos].slice(0, 5);
                });
              }}
            />
            <JurisCasoSection value={jurisCaso} onChange={setJurisCaso} />
          </div>
        </section>

        <section
          id="secao-provas"
          className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-1 text-lg font-semibold text-slate-800">
            Provas do fato
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            Contratos, prints, notas e fotos que a IA usa para fundamentar a
            minuta. Não substitui a juntada no protocolo: o FACTO não envia
            arquivos ao juízo.
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
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setGuiaAtiva("pedidos")}
            className="rounded-lg bg-stone-700 px-4 py-2 text-sm font-medium text-amber-50 hover:bg-stone-600"
          >
            Continuar para pedidos
          </button>
        </div>
        </div>

        <div className={guiaAtiva === "pedidos" ? "space-y-6" : "hidden"}>
        <div id="secao-valores" className="scroll-mt-24">
          <ValoresCausaSection
            value={valoresCausa}
            onChange={setValoresCausa}
            comAdvogado={comAdvogado}
          />
        </div>

        <PedidosSection value={pedidos} onChange={setPedidos} />

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
                  <Link
                    href="/dashboard/perfil"
                    className="font-medium text-stone-700 underline hover:text-stone-900"
                  >
                    Configurar no Perfil
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

          <div className="flex flex-col items-end gap-2 pt-2">
            {bloqueadoTetoLeigo && (
              <p className="max-w-md text-right text-sm text-red-800">
                {mensagemBloqueioTetoLeigo(resumoValores.totalCentavos)}
              </p>
            )}
            {cota?.esgotada && (
              <p className="text-sm text-amber-800">
                Cota esgotada —{" "}
                <a
                  href="#pacotes-extras-jec"
                  className="font-semibold underline"
                >
                  contrate um pacote extra
                </a>{" "}
                para continuar.
              </p>
            )}
            <button
              type="submit"
              disabled={
                loading ||
                !podeGerar ||
                Boolean(cota?.esgotada) ||
                bloqueadoTetoLeigo
              }
              className="rounded-lg bg-stone-700 px-8 py-3.5 text-base font-semibold text-amber-50 shadow-sm transition hover:bg-stone-600 disabled:opacity-60"
            >
              {loading
                ? LOADING_STAGES[loadingStage]
                : cota?.esgotada
                  ? "Cota esgotada"
                  : bloqueadoTetoLeigo
                    ? "Valor acima do teto (20 SM)"
                    : "Gerar peça"}
            </button>
          </div>
        </section>
        </div>
      </form>

      {resultado && (
        <div
          id="peca-gerada"
          className="scroll-mt-24 border-t border-slate-200 pt-8"
        >
          <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
            <p className="font-medium">Minuta para revisão</p>
            <p className="mt-1">
              Confira dados, valores e fundamentos antes de protocolar.{" "}
              <strong className="font-semibold">
                Baixe o PDF ou Word agora e salve na sua pasta ou nuvem pessoal
              </strong>{" "}
              — por privacidade, o FACTO não armazena a peça nem os dados das
              partes na conta do cliente. A preservação do arquivo é sua
              responsabilidade.
            </p>
          </div>

          {casoVinculoId && moduloUi.hrefCasos && (
            <div className="mb-4 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800">
              <p className="font-medium">Vincular esta peça ao caso?</p>
              <p className="mt-1 text-xs text-stone-500">
                Registra o texto na linha do tempo da fase atual do caso.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const fase =
                      faseVinculo ??
                      (obterCasoJec(casoVinculoId)?.faseAtual as FaseCasoJec) ??
                      "inicial";
                    const atualizado = vincularPecaAoCaso({
                      casoId: casoVinculoId,
                      fase,
                      especiePeca,
                      tituloPeca:
                        tituloAcaoCompleto || tipoAcaoTexto || especiePeca,
                      pecaTexto: resultado.peca,
                    });
                    if (atualizado) {
                      setMsgCaso("Peça vinculada ao caso.");
                    } else {
                      setMsgCaso("Não foi possível vincular (caso ausente).");
                    }
                  }}
                  className="rounded-lg bg-stone-700 px-4 py-2 text-sm font-semibold text-amber-50 hover:bg-stone-600"
                >
                  Vincular ao caso
                </button>
                <Link
                  href={`${moduloUi.hrefCasos}/${casoVinculoId}`}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Abrir caso
                </Link>
              </div>
              {msgCaso && (
                <p className="mt-2 text-xs text-emerald-700">{msgCaso}</p>
              )}
            </div>
          )}

          <PecasResultado
            resultado={resultado}
            escritorio={escritorio}
            onFechar={() => setResultado(null)}
          />

          <div className="mt-8">
            <ProtocoloDocsChecklist areaId={areaId} />
          </div>
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
