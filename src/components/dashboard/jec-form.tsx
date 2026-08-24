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
  agruparEspeciesPorPolo,
  inferirPoloPorEspecie,
  inferirPoloDoRelato,
  ladoPoloDaEspecie,
  normalizarPoloAdvocacia,
  rotuloPoloAdvocacia,
  type PoloAdvocacia,
} from "@/lib/polo-advocacia";
import {
  idsPeticaoInicialDaArea,
  listaEspeciesDaArea,
  metaEspecieDaArea,
  tituloPecaDaArea,
  aplicarFlagReconvencao,
  areaMostraCheckboxReconvencao,
  rotuloCheckboxReconvencao,
  especiePublicaDoFormulario,
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
import {
  calcularResumoValorCausa,
  formularioValoresEstaVazio,
  inferirResumoValorCausaDosFatos,
  resumoInferidoParaFormulario,
  type ResumoValorCausa,
} from "@/lib/valores-causa";
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
  pedidoVazio,
  type PedidoItem,
} from "@/components/dashboard/pedidos-form";
import { ReusSection } from "@/components/dashboard/reus-form";
import { AutorSection } from "@/components/dashboard/autor-form";
import {
  JurisCasoSection,
  type JurisCasoSalvo,
} from "@/components/dashboard/juris-caso-form";
import { JurisSugestoesPicker } from "@/components/dashboard/juris-sugestoes-picker";
import { ProvasDoFatoSection } from "@/components/dashboard/provas-do-fato-section";
import type { ProvaTextoCaso } from "@/lib/provas-caso-texto";
import type { ReuValue } from "@/lib/reu-types";
import {
  normalizarAutores,
  type AutorValue,
} from "@/lib/autor-types";
import type { JurisCasoPayload } from "@/lib/juris-caso-types";
import type { ResumoCota } from "@/lib/cota-pecas";
import { PacotesExtrasPainel } from "@/components/dashboard/pacotes-extras-painel";
import { TrialEsgotadoBanner } from "@/components/dashboard/trial-esgotado-banner";
import { EntradaCasoSection } from "@/components/dashboard/entrada-caso-section";
import { BotaoFalarCampo } from "@/components/dashboard/botao-falar-campo";
import { juntarTranscricao } from "@/lib/transcrever-audio";
import type { ConferenciaEntrada, PreenchimentoEntradaCaso } from "@/lib/entrada-caso-types";
import { montarConferenciaEntrada } from "@/lib/conferencia-entrada";
import { paginaDoTrechoNoTexto, rotuloCitacaoAnexo } from "@/lib/pagina-anexo-pdf";
import { detectarTesesCanonicas } from "@/lib/teses-canonicas";
import { extrairMetadadosAutos } from "@/lib/peca-cabivel-autos";
import { sugerirPrazoDaPeca } from "@/lib/prazo-intimacao";
import {
  buscarPerfilCliente,
  nomeClientePrincipal,
  salvarPerfilCliente,
  type PerfilClienteSalvo,
} from "@/lib/memoria-cliente-local";
import { AJUSTES_POR_GERACAO } from "@/lib/ia/ajustar-trecho-peca";

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
  onPecaAjustada,
  ajustesFeitos,
  auditorContexto,
  jurisCaso,
  versoes = [],
  versaoAtivaId = null,
  onSelecionarVersao,
}: {
  resultado: GerarPecaJecOutput;
  escritorio?: EscritorioConfig;
  onFechar: () => void;
  onPecaAjustada: (next: {
    peca: string;
    pecaHtml: string;
    citacoes?: GerarPecaJecOutput["citacoes"];
    auditoria?: GerarPecaJecOutput["auditoria"];
    equipeEtapas?: GerarPecaJecOutput["equipeEtapas"];
  }) => void;
  ajustesFeitos: number;
  auditorContexto?: {
    areaId: string;
    especie: string;
    tipoAcao: string;
    fatos: string;
    numeroProcesso?: string;
    pecaInaugural: boolean;
    pedirJusticaGratuita: boolean;
    temMle: boolean;
    comReconvencao: boolean;
    pedidosUsuario: string[];
  };
  jurisCaso: JurisCasoSalvo[];
  versoes?: { id: string; rotulo: string }[];
  versaoAtivaId?: string | null;
  onSelecionarVersao?: (id: string) => void;
}) {
  async function copiar(texto: string) {
    await navigator.clipboard.writeText(texto);
  }

  const [pedidoAjuste, setPedidoAjuste] = useState("");
  const [trechoAjuste, setTrechoAjuste] = useState("");
  const [ajustando, setAjustando] = useState(false);
  const [erroAjuste, setErroAjuste] = useState<string | null>(null);
  const ajustesRestantes = Math.max(0, AJUSTES_POR_GERACAO - ajustesFeitos);

  async function handleAjustarTrecho() {
    if (pedidoAjuste.trim().length < 8) {
      setErroAjuste("Descreva o pedido (mín. 8 caracteres).");
      return;
    }
    setAjustando(true);
    setErroAjuste(null);
    try {
      const res = await fetch("/api/ajustar-peca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          peca: resultado.peca,
          pedido: pedidoAjuste.trim(),
          trecho: trechoAjuste.trim() || undefined,
          contextoVerificacao: resultado.contextoVerificacao,
          ajustesJaFeitos: ajustesFeitos,
          auditor: auditorContexto,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        peca?: string;
        pecaHtml?: string;
        citacoes?: GerarPecaJecOutput["citacoes"];
        auditoria?: GerarPecaJecOutput["auditoria"];
        equipeEtapas?: GerarPecaJecOutput["equipeEtapas"];
      };
      if (!res.ok || !data.peca || !data.pecaHtml) {
        setErroAjuste(data.error ?? "Não foi possível ajustar.");
        return;
      }
      onPecaAjustada({
        peca: data.peca,
        pecaHtml: data.pecaHtml,
        citacoes: data.citacoes,
        auditoria: data.auditoria,
        equipeEtapas: data.equipeEtapas,
      });
      setPedidoAjuste("");
      setTrechoAjuste("");
    } catch {
      setErroAjuste("Falha de rede ao ajustar.");
    } finally {
      setAjustando(false);
    }
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

      {versoes.length > 1 && onSelecionarVersao && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Versões desta sessão
          </span>
          {versoes.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelecionarVersao(v.id)}
              className={
                v.id === versaoAtivaId
                  ? "rounded-md bg-stone-800 px-2.5 py-1 text-xs font-medium text-amber-50"
                  : "rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100"
              }
            >
              {v.rotulo}
            </button>
          ))}
        </div>
      )}

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
      {resultado.auditoria && resultado.auditoria.achados.length > 0 && (
        <section
          className={
            resultado.auditoria.achados.some((a) => a.gravidade === "bloqueante")
              ? "rounded-lg border border-red-200 bg-red-50/80 p-4"
              : "rounded-lg border border-amber-200 bg-amber-50/70 p-4"
          }
        >
          <h3 className="mb-2 text-sm font-semibold text-slate-800">
            Auditor — conferência da minuta
          </h3>
          <ul className="space-y-2">
            {resultado.auditoria.achados.map((a) => (
              <li key={a.id} className="text-sm text-slate-700">
                <span
                  className={
                    a.gravidade === "bloqueante"
                      ? "font-semibold text-red-800"
                      : a.gravidade === "alerta"
                        ? "font-semibold text-amber-900"
                        : "font-medium text-slate-700"
                  }
                >
                  {a.gravidade === "bloqueante"
                    ? "Impede protocolo — "
                    : a.gravidade === "alerta"
                      ? "Revise — "
                      : ""}
                  {a.titulo}.
                </span>{" "}
                <span className="text-slate-600">{a.detalhe}</span>
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
          <h3 className="font-semibold text-stone-800">Contexto da peça</h3>
          <p className="mt-1 text-xs text-stone-500">
            Painel de contexto usado na geração (tese, natureza, direitos) —
            conferência rápida antes do texto.
          </p>
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
                Nenhum trecho do acervo FACTO foi recuperado para este tema.
                Evite citar súmulas ou acórdãos sem lastro — anexe a ementa do
                caso na aba Fatos/juris ou gere de novo com mais detalhes.
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
              sem lastro no acervo FACTO (sem citação verificada).
              Confira ou substitua antes de protocolar.
            </p>
          )}

          {jurisVerificada.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Jurisprudência verificada na base
              </p>
              <ul className="mt-1 list-inside list-disc text-sm text-emerald-800">
                {jurisVerificada.map((c) => {
                  const anexo = jurisCaso.find((j) =>
                    j.texto
                      .toLowerCase()
                      .includes(c.trecho.toLowerCase().slice(0, 40))
                  );
                  const pagina = anexo
                    ? paginaDoTrechoNoTexto(anexo.texto, c.trecho)
                    : null;
                  return (
                    <li
                      key={c.trecho}
                      title={
                        anexo
                          ? rotuloCitacaoAnexo({
                              titulo: anexo.titulo || "juris do caso",
                              pagina,
                            })
                          : "Consta na base FACTO ou no anexo do caso"
                      }
                    >
                      {c.trecho}
                      {anexo ? (
                        <span className="ml-1 text-xs text-slate-500">
                          (
                          {rotuloCitacaoAnexo({
                            titulo: anexo.titulo || "juris do caso",
                            pagina,
                          })}
                          )
                        </span>
                      ) : null}
                    </li>
                  );
                })}
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
        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50/80 p-4">
          <p className="text-sm font-medium text-slate-800">
            Ajuste pontual ({ajustesRestantes} restante
            {ajustesRestantes === 1 ? "" : "s"} nesta minuta)
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Cole o trecho da minuta e o pedido em linguagem de advogado. Não
            muda endereçamento nem inventa julgado. Não é chat — se precisar de
            outra peça, volte ao formulário e gere de novo.
          </p>
          <textarea
            rows={2}
            value={trechoAjuste}
            onChange={(e) => setTrechoAjuste(e.target.value)}
            disabled={ajustesRestantes <= 0 || ajustando}
            placeholder="Trecho da minuta (opcional). Ex.: o parágrafo sobre juros de mora…"
            className="mt-2 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-stone-500 disabled:opacity-50"
          />
          <textarea
            rows={2}
            value={pedidoAjuste}
            onChange={(e) => setPedidoAjuste(e.target.value)}
            disabled={ajustesRestantes <= 0 || ajustando}
            placeholder="Pedido. Ex.: incluir tutela para o estorno; tirar o parágrafo sobre juros"
            className="mt-2 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-stone-500 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => void handleAjustarTrecho()}
            disabled={ajustesRestantes <= 0 || ajustando}
            className="mt-2 rounded-lg border border-stone-600 px-3 py-1.5 text-sm font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-50"
          >
            {ajustando ? "Ajustando…" : "Aplicar ajuste"}
          </button>
          {erroAjuste ? (
            <p className="mt-2 text-sm text-red-700">{erroAjuste}</p>
          ) : null}
        </div>
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
    comReconvencao: false,
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
  const [versoesPeca, setVersoesPeca] = useState<
    { id: string; rotulo: string; resultado: GerarPecaJecOutput }[]
  >([]);
  const [versaoAtivaId, setVersaoAtivaId] = useState<string | null>(null);
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
  const [poloConfirmado, setPoloConfirmado] = useState(false);
  const [especieManual, setEspecieManual] = useState(false);
  const [fatos, setFatos] = useState("");
  const [avisoEntrada, setAvisoEntrada] = useState<string | null>(null);
  const [conferenciaEntrada, setConferenciaEntrada] =
    useState<ConferenciaEntrada | null>(null);
  const [tesesOff, setTesesOff] = useState<string[]>([]);
  const [tesesIdsEntrada, setTesesIdsEntrada] = useState<string[]>([]);
  const [ajustesFeitos, setAjustesFeitos] = useState(0);
  const [tutelaUrgencia, setTutelaUrgencia] = useState(false);
  const [cumuloDanosMorais, setCumuloDanosMorais] = useState(false);
  const [cumuloDanosMateriais, setCumuloDanosMateriais] = useState(false);
  const [escritorio, setEscritorio] =
    useState<EscritorioConfig>(escritorioConfigVazio);
  const [comarca, setComarca] = useState<ComarcaValue>(comarcaVazia);
  const [valoresCausa, setValoresCausa] =
    useState<ValoresPorCategoria>(valoresCausaVazio);
  const [valoresManualExpandido, setValoresManualExpandido] = useState(false);
  const [valorInferido, setValorInferido] = useState<ResumoValorCausa | null>(
    null
  );
  const [provasCaso, setProvasCaso] = useState<ProvaTextoCaso[]>([]);
  const [midiasNomes, setMidiasNomes] = useState<string[]>([]);
  const [usaLeiMunicipal, setUsaLeiMunicipal] = useState(false);
  const [leiMunicipalTexto, setLeiMunicipalTexto] = useState("");
  const [leiMunicipalTitulo, setLeiMunicipalTitulo] = useState("");
  const [mostrarMidiasOpcionais, setMostrarMidiasOpcionais] = useState(false);
  const [pedirJusticaGratuita, setPedirJusticaGratuita] = useState(false);
  const [temMle, setTemMle] = useState(false);
  const [comReconvencao, setComReconvencao] = useState(false);
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
  const [rascunhos, setRascunhos] = useState<JecRascunhoSalvo[]>([]);
  const [rascunhoAtivoId, setRascunhoAtivoId] = useState<string | null>(null);
  const [msgRascunho, setMsgRascunho] = useState<string | null>(null);
  const [cota, setCota] = useState<ResumoCota | null>(null);

  const isAssistente = modoAcao === "assistente";
  const assistentePendente =
    isAssistente && tipoAcaoTexto.trim().length < 8;
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
      aplicarEspecieInferida(especieParam);
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

  useEffect(() => {
    if (!formularioValoresEstaVazio(valoresCausa)) {
      setValorInferido(null);
      return;
    }
    const t = fatos.trim();
    if (t.length < 40) {
      setValorInferido(null);
      return;
    }
    setValorInferido(inferirResumoValorCausaDosFatos(t));
  }, [fatos, valoresCausa]);

  function aplicarValorInferido() {
    if (!valorInferido) return;
    setValoresCausa(resumoInferidoParaFormulario(valorInferido));
    setValoresManualExpandido(true);
  }

  const comAdvogado = !leigo;
  const bloqueadoTetoLeigo =
    areaId === "jec" &&
    leigo &&
    ultrapassaTetoJec(resumoValores.totalCentavos, false);
  const idsInicial = idsPeticaoInicialDaArea(areaId);
  const especiesTodas = useMemo(
    () => {
      const lista = listaEspeciesDaArea(areaId);
      if (lista?.length) return lista;
      if (areaId === "jec") return ESPECIES_PECA_JEC;
      return [];
    },
    [areaId]
  );
  const especiesOpcoes = especiesTodas;
  const especiesPorPolo = useMemo(
    () =>
      areaUsaPoloAdvocacia(areaId)
        ? agruparEspeciesPorPolo(areaId, especiesTodas)
        : null,
    [areaId, especiesTodas]
  );
  const moduloUi = moduloDaArea(areaId);
  const comPoloAdvocacia = areaUsaPoloAdvocacia(areaId);
  const ladoEspecieAtual = comPoloAdvocacia
    ? ladoPoloDaEspecie(areaId, especiePeca)
    : null;
  const poloExigeEscolha = ladoEspecieAtual === "ambos";
  const dicaPrazo = useMemo(
    () =>
      sugerirPrazoDaPeca({
        fatos,
        especiePeca,
      }),
    [fatos, especiePeca]
  );
  const perfilMemoriaCliente = useMemo(() => {
    const nome = nomeClientePrincipal(autores, reus, poloAdvocacia);
    return buscarPerfilCliente(nome);
  }, [autores, reus, poloAdvocacia]);

  useEffect(() => {
    if (especiePeca !== "contestacao") setComReconvencao(false);
  }, [especiePeca]);

  const especieEfetiva = aplicarFlagReconvencao(
    areaId,
    especiePeca,
    comReconvencao
  );

  const tituloAcaoCompleto = useMemo(() => {
    if (!tipoAcaoDefinido) return "";
    if (pecaUsaPartesJaQualificadas(especieEfetiva, idsInicial)) {
      return formatarNomeAcaoForense(
        tituloPecaDaArea(
          areaId,
          especieEfetiva,
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
    especieEfetiva,
    areaId,
    idsInicial,
    justificativaAssistente,
    cumuloDanosMorais,
    cumuloDanosMateriais,
    tutelaUrgencia,
  ]);

  const jaQualificadas = pecaUsaPartesJaQualificadas(especieEfetiva, idsInicial);
  const ajudaQualificacao = textoAjudaQualificacaoPeca(
    areaId,
    especieEfetiva,
    comPoloAdvocacia
      ? poloAdvocacia
      : resolverPoloClienteQualificacao(areaId, especiePeca, null),
    moduloUi.rotuloPoloAtivo,
    moduloUi.rotuloPoloPassivo
  );
  const checklistItens = montarChecklistJec({
    tipoSelecionado: tipoAcaoDefinido || (assistentePendente ? ASSISTENTE_FACTO : ""),
    fatos,
    autorOk: autorOkParaChecklist(autores, jaQualificadas),
    reusOk: reuOkParaChecklist(reus, jaQualificadas),
    comarcaForo: comarca.foro ?? "",
    temValor:
      resumoValores.totalCentavos > 0 ||
      (valorInferido?.totalCentavos ?? 0) > 0,
    assistentePendente:
      assistentePendente ||
      (modoAcao === "livre" && tipoAcaoTexto.trim().length < 8),
    partesJaQualificadas: jaQualificadas,
  });

  const checklistComPolo =
    poloExigeEscolha && comPoloAdvocacia
      ? [
          ...checklistItens,
          {
            id: "polo",
            label: "Polo da advocacia (ativo ou passivo)",
            ok: poloConfirmado,
            bloqueante: true,
          },
        ]
      : checklistItens;

  const podeGerar =
    podeGerarPeca(checklistComPolo) && !bloqueadoTetoLeigo;

  const itemOk = (id: string) =>
    Boolean(checklistComPolo.find((i) => i.id === id)?.ok);
  const guiaIdentificacaoOk =
    itemOk("tipo") && itemOk("autor") && itemOk("reus") && itemOk("comarca");
  const guiaFatosOk = itemOk("fatos");
  const guiaPedidosOk =
    itemOk("valores") ||
    pedidos.some((p) => p.descricao.trim().length > 0);

  const tesesAtivas = useMemo(
    () =>
      detectarTesesCanonicas(
        areaId,
        [tipoAcaoTexto, fatos].filter(Boolean).join("\n"),
        tesesIdsEntrada
      ).filter((t) => !tesesOff.includes(t.id)),
    [areaId, tipoAcaoTexto, fatos, tesesOff, tesesIdsEntrada]
  );

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

  function aplicarMemoriaCliente(perfil: PerfilClienteSalvo) {
    setAutores(
      perfil.autores.map((a) => ({
        ...a,
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `autor-${Date.now()}-${Math.random()}`,
      }))
    );
    setReus(
      perfil.reus.map((r) => ({
        ...r,
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `reu-${Date.now()}-${Math.random()}`,
      }))
    );
  }

  useEffect(() => {
    if (!fatos.trim()) return;
    const meta = extrairMetadadosAutos(fatos);
    if (!meta.numeroProcesso && !meta.foro) return;
    setComarca((c) => {
      let mudou = false;
      const next = { ...c };
      if (meta.numeroProcesso && !c.numeroProcesso?.trim()) {
        next.numeroProcesso = meta.numeroProcesso;
        mudou = true;
      }
      if (meta.foro && !c.foro?.trim()) {
        next.foro = meta.foro;
        mudou = true;
      }
      return mudou ? next : c;
    });
  }, [fatos]);

  function aplicarEspecieInferida(raw: string) {
    const pub = especiePublicaDoFormulario(raw);
    setEspeciePeca(pub.especie);
    if (pub.comReconvencao) setComReconvencao(true);
    if (areaUsaPoloAdvocacia(areaId)) {
      const inferido = inferirPoloPorEspecie(areaId, pub.especie);
      if (inferido) {
        setPoloAdvocacia(inferido);
        setPoloConfirmado(true);
      } else {
        setPoloConfirmado(false);
      }
    }
  }

  function sincronizarEspecieDoTipo(texto: string, forcar = false) {
    if (especieManual && !forcar) return;
    aplicarEspecieInferida(inferirEspeciePeca(texto, fatos));
  }

  function aplicarDecisaoAssistente(decisao: DecisaoAssistente) {
    setModoAcao("assistente");
    const titulo = decisao.tituloCompleto || decisao.tipoAcao;
    setTipoAcaoTexto(titulo);
    if (!especieManual) {
      aplicarEspecieInferida(inferirEspeciePeca(titulo, fatos));
    }
    setTutelaUrgencia(decisao.tutelaUrgencia);
    setCumuloDanosMorais(decisao.danosMorais);
    setCumuloDanosMateriais(decisao.danosMateriais);
    setJustificativaAssistente(decisao.justificativa);
    setNotaAssistente(true);
    setDecisaoSugerida(decisao);
  }

  function aplicarEntradaCaso(preenchimento: PreenchimentoEntradaCaso) {
    setAvisoEntrada(preenchimento.resumoConferencia);
    setTesesOff([]);
    setTesesIdsEntrada(preenchimento.tesesIds ?? []);
    if (preenchimento.fatos) setFatos(preenchimento.fatos);
    if (preenchimento.tipoAcao) {
      setModoAcao("livre");
      setTipoAcaoTexto(preenchimento.tipoAcao);
    }
    if (preenchimento.especiePeca) {
      aplicarEspecieInferida(preenchimento.especiePeca);
      setEspecieManual(true);
      if (
        ladoPoloDaEspecie(areaId, preenchimento.especiePeca) === "ambos"
      ) {
        const inferidoPolo = inferirPoloDoRelato(
          [
            preenchimento.fatos,
            preenchimento.tipoAcao,
            preenchimento.resumoConferencia,
          ]
            .filter(Boolean)
            .join("\n")
        );
        if (inferidoPolo) {
          setPoloAdvocacia(inferidoPolo);
          setPoloConfirmado(true);
        }
      }
    }
    if (preenchimento.autoresNomes.length) {
      setAutores(autoresAPartirDosNomes(preenchimento.autoresNomes.join("; ")));
    }
    if (preenchimento.reusNomes.length) {
      setReus(reusAPartirDosNomes(preenchimento.reusNomes.join("; ")));
    }
    if (preenchimento.foro || preenchimento.numeroProcesso || preenchimento.cidade) {
      setComarca((c) => ({
        ...c,
        foro: preenchimento.foro?.trim() || c.foro,
        numeroProcesso:
          preenchimento.numeroProcesso?.trim() || c.numeroProcesso,
        cidade: preenchimento.cidade?.trim() || c.cidade,
        uf: preenchimento.uf?.trim() || c.uf,
        numeroJuizado:
          preenchimento.numeroVara?.trim() || c.numeroJuizado,
      }));
    }
    if (preenchimento.pedidos.length) {
      setPedidos(
        preenchimento.pedidos.map((descricao) => ({
          ...pedidoVazio(),
          descricao,
        }))
      );
    }
    if (preenchimento.pedirJusticaGratuita != null) {
      setPedirJusticaGratuita(preenchimento.pedirJusticaGratuita);
    }
    if (preenchimento.tutelaUrgencia != null) {
      setTutelaUrgencia(preenchimento.tutelaUrgencia);
    }
    if (preenchimento.danosMorais != null) {
      setCumuloDanosMorais(preenchimento.danosMorais);
    }
    if (preenchimento.danosMateriais != null) {
      setCumuloDanosMateriais(preenchimento.danosMateriais);
    }
    setGuiaAtiva("identificacao");
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
            ? `${data.error} Sugestão alternativa aplicada — revise o tipo indicado.`
            : null
        );
        return;
      }

      aplicarDecisaoAssistente(data.decisao);
    } catch {
        const local = analisarCaseAssistente({ fatos, areaId });
      aplicarDecisaoAssistente(local);
      setError(
        "Não foi possível consultar o Assistente agora. Há uma sugestão alternativa — revise o tipo indicado."
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
    setPoloConfirmado(false);
    setEspecieManual(ini.especieManual);
    setFatos(ini.fatos);
    setAvisoEntrada(null);
    setConferenciaEntrada(null);
    setTesesOff([]);
    setTesesIdsEntrada([]);
    setAjustesFeitos(0);
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
    setComReconvencao(ini.comReconvencao);
    setDecisaoSugerida(null);
    setJustificativaAssistente(ini.justificativaAssistente);
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
    const pub = especiePublicaDoFormulario(espSalva);
    aplicarEspecieInferida(espSalva);
    setComReconvencao(Boolean(p.comReconvencao) || pub.comReconvencao);
    if (!inferirPoloPorEspecie(areaId, pub.especie)) {
      setPoloAdvocacia(normalizarPoloAdvocacia(p.poloAdvocacia));
      setPoloConfirmado(true);
    }
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
          comReconvencao,
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
      setMsgRascunho("Salvo neste dispositivo.");
      if (comPoloAdvocacia) {
        salvarPerfilCliente({
          autores,
          reus,
          polo: poloAdvocacia,
        });
      }
    } catch {
      setMsgRascunho(
        "Não foi possível salvar (memória do dispositivo cheia ou bloqueada)."
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

    if (poloExigeEscolha && !poloConfirmado) {
      setError(
        "Confirme o polo (ativo ou passivo) antes de gerar — esta peça cabe nos dois lados."
      );
      return;
    }

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
      poloAdvocacia:
        comPoloAdvocacia && (!poloExigeEscolha || poloConfirmado)
          ? poloAdvocacia
          : undefined,
      atuarLeigo: leigo,
      areaId,
      tutelaUrgencia,
      pedirJusticaGratuita,
      temMle: areaMostraMle(areaId) ? temMle : false,
      comReconvencao:
        especiePeca === "contestacao" &&
        areaMostraCheckboxReconvencao(areaId) &&
        comReconvencao,
      fatos: fatos.trim(),
      pedidosUsuario,
      documentos: {
        declaracaoHipossuficiencia: [],
        mandadoLevantamentoEletronico: [],
      },
      provas: provasCaso.map((p) => p.nome),
      provasTexto: provasCaso.map((p) => ({
        nome: p.nome,
        texto: p.texto,
        tipo: p.tipo,
        sintese: p.sintese,
      })),
      fotos: [],
      midias: midiasNomes,
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
      tesesIds: tesesAtivas.map((t) => t.id),
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
          const alvo =
            data.cota.plano === "trial"
              ? "trial-esgotado-jec"
              : "pacotes-extras-jec";
          window.setTimeout(() => {
            document
              .getElementById(alvo)
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 50);
        }
        setError(data.error ?? "Erro ao gerar a peça.");
        setLoading(false);
        return;
      }

      if (data.cota) setCota(data.cota);
      const gerado = data as GerarPecaJecOutput;
      const id = `v-${Date.now()}`;
      setVersoesPeca((prev) => {
        const rotulo = `V${prev.length + 1}`;
        return [{ id, rotulo, resultado: gerado }, ...prev].slice(0, 5);
      });
      setVersaoAtivaId(id);
      setResultado(gerado);
      setAjustesFeitos(0);
      setMsgCaso(null);
      if (comPoloAdvocacia) {
        salvarPerfilCliente({
          autores,
          reus,
          polo: poloAdvocacia,
        });
      }
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
          <p className="mt-2 text-sm text-slate-600">
            Pode começar pela entrada do caso (preenche as abas). O formulário
            é conferência — Gerar fica só em Pedidos.
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
        </header>

        {cota?.plano === "trial" && cota.esgotada ? (
          <TrialEsgotadoBanner
            id="trial-esgotado-jec"
            usoLabel={cota.usoLabel}
          />
        ) : (
          (cota?.esgotada || (cota?.percentualUsado ?? 0) >= 85) && (
            <PacotesExtrasPainel
              id="pacotes-extras-jec"
              variante="banner"
              cota={cota}
            />
          )
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
        <EntradaCasoSection
          areaId={areaId}
          onPreenchido={({ preenchimento, teses }) => {
            aplicarEntradaCaso(preenchimento);
            setConferenciaEntrada(
              montarConferenciaEntrada(areaId, preenchimento, teses)
            );
            setError(null);
          }}
          onErro={(msg) => setError(msg || null)}
          onRelatoTranscrito={(texto) =>
            setFatos((atual) => juntarTranscricao(atual, texto))
          }
        />
        {avisoEntrada || conferenciaEntrada ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <p className="font-medium">Revise as três abas — a peça ainda não foi gerada.</p>
            {avisoEntrada ? <p className="mt-1">{avisoEntrada}</p> : null}
            {conferenciaEntrada ? (
              <>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {conferenciaEntrada.chips.map((c) => (
                    <span
                      key={c.chave}
                      className={
                        c.preenchido
                          ? "rounded-full border border-stone-300 bg-white px-2.5 py-0.5 text-xs text-stone-800"
                          : "rounded-full border border-dashed border-slate-400 bg-transparent px-2.5 py-0.5 text-xs text-slate-500"
                      }
                    >
                      {c.rotulo}
                    </span>
                  ))}
                </div>
                {conferenciaEntrada.vazios.length > 0 ? (
                  <p className="mt-2 text-xs text-slate-600">
                    Em branco: {conferenciaEntrada.vazios.join(" · ")}
                  </p>
                ) : null}
              </>
            ) : null}
          </div>
        ) : null}
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
            {comPoloAdvocacia && !poloExigeEscolha && ladoEspecieAtual ? (
              <p className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-700">
                Peça redigida pelo{" "}
                <span className="font-semibold">
                  polo {ladoEspecieAtual === "ativo" ? "ativo" : "passivo"}
                </span>{" "}
                ({rotuloPoloAdvocacia(
                  ladoEspecieAtual,
                  moduloUi.rotuloPoloAtivo,
                  moduloUi.rotuloPoloPassivo
                )}
                ){leigo ? " — em causa própria" : ""}. Ao trocar a peça, o polo
                ajusta sozinho.
              </p>
            ) : null}

            {comPoloAdvocacia && poloExigeEscolha ? (
              <div>
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Estou atuando pelo…
                </span>
                <p className="mb-2 text-xs text-slate-500">
                  {metaEspecieDaArea(areaId, especiePeca).rotulo} cabe nos dois
                  polos — escolha de quem você representa.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  {(["ativo", "passivo"] as const).map((polo) => (
                    <label
                      key={polo}
                      className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm has-[:checked]:border-stone-500 has-[:checked]:bg-stone-50"
                    >
                      <input
                        type="radio"
                        name="poloAdvocacia"
                        checked={poloConfirmado && poloAdvocacia === polo}
                        onChange={() => {
                          setPoloAdvocacia(polo);
                          setPoloConfirmado(true);
                        }}
                        className="h-4 w-4 border-slate-300 text-stone-700 focus:ring-stone-500"
                      />
                      <span className="font-medium text-slate-800">
                        {polo === "ativo"
                          ? `Polo ativo (${moduloUi.rotuloPoloAtivo})`
                          : `Polo passivo (${moduloUi.rotuloPoloPassivo})`}
                      </span>
                    </label>
                  ))}
                </div>
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
                  const inferido = inferirPoloPorEspecie(areaId, proxima);
                  if (inferido) {
                    setPoloAdvocacia(inferido);
                    setPoloConfirmado(true);
                  } else {
                    setPoloConfirmado(false);
                  }
                  if (pecaUsaPartesJaQualificadas(proxima, idsInicial)) {
                    setTipoAcaoTexto(
                      tituloPecaDaArea(
                        areaId,
                        proxima,
                        tipoAcaoTexto,
                        justificativaAssistente ?? ""
                      )
                    );
                  }
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
              >
                {especiesPorPolo ? (
                  <>
                    {especiesPorPolo.ativo.length > 0 ? (
                      <optgroup
                        label={`Polo ativo (${moduloUi.rotuloPoloAtivo})`}
                      >
                        {especiesPorPolo.ativo.map((esp) => (
                          <option key={esp.id} value={esp.id}>
                            {esp.rotulo}
                          </option>
                        ))}
                      </optgroup>
                    ) : null}
                    {especiesPorPolo.passivo.length > 0 ? (
                      <optgroup
                        label={`Polo passivo (${moduloUi.rotuloPoloPassivo})`}
                      >
                        {especiesPorPolo.passivo.map((esp) => (
                          <option key={esp.id} value={esp.id}>
                            {esp.rotulo}
                          </option>
                        ))}
                      </optgroup>
                    ) : null}
                    {especiesPorPolo.ambos.length > 0 ? (
                      <optgroup label="Ambos os polos">
                        {especiesPorPolo.ambos.map((esp) => (
                          <option key={esp.id} value={esp.id}>
                            {esp.rotulo}
                          </option>
                        ))}
                      </optgroup>
                    ) : null}
                  </>
                ) : (
                  especiesOpcoes.map((esp) => (
                    <option key={esp.id} value={esp.id}>
                      {esp.rotulo}
                    </option>
                  ))
                )}
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
              {dicaPrazo ? (
                <p className="mt-2 rounded-md border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-950">
                  {dicaPrazo.aviso}
                </p>
              ) : null}
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
                  checked={modoAcao === "livre"}
                  onChange={() => {
                    setModoAcao("livre");
                    setNotaAssistente(false);
                    setJustificativaAssistente(null);
                    setDecisaoSugerida(null);
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

            {(modoAcao === "livre" || tipoAcaoTexto.trim().length > 0) && (
              <div className="space-y-3 rounded-lg border border-stone-200 bg-stone-50/80 p-4">
                {notaAssistente && justificativaAssistente && (
                  <p className="text-xs leading-relaxed text-stone-600">
                    <span className="font-semibold text-stone-800">
                      Assistente Facto
                      {decisaoSugerida?.fonte === "gemini" ? " (IA)" : ""}
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
        />

        {perfilMemoriaCliente ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 px-4 py-3">
            <p className="text-xs text-emerald-950">
              Já temos qualificação salva de{" "}
              <span className="font-semibold">{perfilMemoriaCliente.rotulo}</span>{" "}
              neste dispositivo.
            </p>
            <button
              type="button"
              onClick={() => aplicarMemoriaCliente(perfilMemoriaCliente)}
              className="mt-2 text-xs font-medium text-emerald-900 underline hover:text-emerald-950"
            >
              Preencher autor e réu com os dados salvos
            </button>
          </div>
        ) : null}

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
            {tesesAtivas.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Teses sugeridas (conferir)
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  A redação usa estes artigos. Clique para tirar o que não
                  couber. Julgado continua só da base.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tesesAtivas.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      title={t.artigos}
                      onClick={() =>
                        setTesesOff((prev) =>
                          prev.includes(t.id) ? prev : [...prev, t.id]
                        )
                      }
                      className="rounded-full border border-stone-300 bg-white px-2.5 py-1 text-xs text-stone-800 hover:border-stone-500"
                    >
                      {t.rotulo}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <BotaoFalarCampo
                disabled={analisandoAssistente}
                areaId={areaId}
                onTranscrito={(texto) =>
                  setFatos((atual) => juntarTranscricao(atual, texto))
                }
              />
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
                Salva neste dispositivo (sem anexos).
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Se já falou na Entrada, o texto já está aqui. Falar de novo anexa
              mais (outra transcrição).
            </p>
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
              areaId={areaId}
              polo={comPoloAdvocacia ? poloAdvocacia : null}
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

        <ProvasDoFatoSection
          provas={provasCaso}
          onProvasChange={setProvasCaso}
          linkNuvem={linkNuvem}
          onLinkNuvemChange={setLinkNuvem}
          midiasNomes={midiasNomes}
          onMidiasChange={setMidiasNomes}
          mostrarMidiasOpcionais={mostrarMidiasOpcionais}
          onMostrarMidiasChange={setMostrarMidiasOpcionais}
        />
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
            expandidoManual={valoresManualExpandido}
            onExpandidoManualChange={setValoresManualExpandido}
            valorInferido={valorInferido}
            onAplicarValorInferido={aplicarValorInferido}
          />
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-slate-800">
            Pedidos na peça
          </h2>
          <p className="mb-4 text-xs leading-relaxed text-slate-500">
            Marque só o que deve constar no texto. Documentos de
            hipossuficiência
            {areaMostraMle(areaId) ? " e do MLE" : ""} você junta no protocolo,
            não aqui.
          </p>
          <div className="space-y-3">
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
                  Inclui o pedido de JG na peça.
                </span>
              </span>
            </label>
            {especiePeca === "contestacao" &&
              areaMostraCheckboxReconvencao(areaId) && (
                <label className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={comReconvencao}
                    onChange={(e) => setComReconvencao(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-stone-700 focus:ring-stone-500"
                  />
                  <span>
                    <span className="font-medium text-slate-800">
                      {rotuloCheckboxReconvencao(areaId).titulo}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {rotuloCheckboxReconvencao(areaId).ajuda}
                    </span>
                  </span>
                </label>
              )}
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
                    Inclui o pedido de MLE, quando cabível.
                  </span>
                </span>
              </label>
            )}
          </div>
        </section>

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
              {checklistComPolo.map((item) => (
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
                {cota.plano === "trial" ? (
                  <>
                    Teste sem peças —{" "}
                    <a
                      href="#trial-esgotado-jec"
                      className="font-semibold underline"
                    >
                      escolha um plano
                    </a>{" "}
                    para continuar.
                  </>
                ) : (
                  <>
                    Cota esgotada —{" "}
                    <a
                      href="#pacotes-extras-jec"
                      className="font-semibold underline"
                    >
                      contrate um pacote extra
                    </a>{" "}
                    para continuar.
                  </>
                )}
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
                  ? cota.plano === "trial"
                    ? "Teste esgotado"
                    : "Cota esgotada"
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
            versoes={versoesPeca.map((v) => ({ id: v.id, rotulo: v.rotulo }))}
            versaoAtivaId={versaoAtivaId}
            onSelecionarVersao={(id) => {
              const hit = versoesPeca.find((v) => v.id === id);
              if (!hit) return;
              setVersaoAtivaId(id);
              setResultado(hit.resultado);
              setAjustesFeitos(0);
            }}
            ajustesFeitos={ajustesFeitos}
            jurisCaso={jurisCaso}
            auditorContexto={{
              areaId,
              especie: especiePeca,
              tipoAcao: tipoAcaoTexto,
              fatos,
              numeroProcesso: comarca.numeroProcesso,
              pecaInaugural: !pecaUsaPartesJaQualificadas(
                especiePeca,
                idsInicial
              ),
              pedirJusticaGratuita,
              temMle,
              comReconvencao,
              pedidosUsuario: pedidos.map((p) => p.descricao.trim()).filter(Boolean),
            }}
            onPecaAjustada={(next) => {
              setResultado((prev) =>
                prev
                  ? {
                      ...prev,
                      peca: next.peca,
                      pecaHtml: next.pecaHtml,
                      citacoes: next.citacoes ?? prev.citacoes,
                      auditoria: next.auditoria ?? prev.auditoria,
                      equipeEtapas: next.equipeEtapas ?? prev.equipeEtapas,
                    }
                  : prev
              );
              setAjustesFeitos((n) => n + 1);
            }}
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
