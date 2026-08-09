"use client";

import { useEffect, useMemo, useState } from "react";
import type { JurisCandidato } from "@/lib/juris-provedores/types";
import {
  jurisCasoVazio,
  type JurisCasoItem,
} from "@/lib/juris-caso-types";
import type { JurisCasoSalvo } from "@/components/dashboard/juris-caso-form";

type Props = {
  /** Texto para buscar (fatos + tipo de ação). */
  consulta: string;
  /** Uploads já no formulário — entram como opções pré-marcáveis (sem gastar cota). */
  uploads: JurisCasoSalvo[];
  onAplicar: (itens: JurisCasoSalvo[]) => void;
};

const LETRAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const POR_PAGINA = 6;

function rotuloOrigem(origem: string): string {
  switch (origem) {
    case "jurisprudencias_ai":
      return "Julgado (API)";
    case "tribunal_scraper":
      return "TJSP";
    case "base_conhecimento":
      return "Base FACTO";
    case "upload_usuario":
      return "Seu anexo";
    case "sumula":
      return "Súmula";
    default:
      return origem.replace(/_/g, " ");
  }
}

export function JurisSugestoesPicker({ consulta, uploads, onAplicar }: Props) {
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [provedorExterno, setProvedorExterno] = useState(false);
  const [cota, setCota] = useState<{
    usadas: number;
    limite: number;
    restantes: number;
  } | null>(null);
  const [candidatos, setCandidatos] = useState<JurisCandidato[]>([]);
  const [totais, setTotais] = useState<{
    julgados: number;
    sumulas: number;
    uploads: number;
  } | null>(null);
  const [selecionados, setSelecionados] = useState<Record<string, boolean>>({});
  const [pagina, setPagina] = useState(0);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const res = await fetch("/api/juris/cota");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelado || !data.ativo) return;
        setCota({
          usadas: data.usadas,
          limite: data.limite,
          restantes: data.restantes,
        });
        setProvedorExterno(true);
      } catch {
        /* silencioso */
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  const totalPaginas = Math.max(1, Math.ceil(candidatos.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas - 1);
  const paginaItens = useMemo(() => {
    const ini = paginaAtual * POR_PAGINA;
    return candidatos.slice(ini, ini + POR_PAGINA);
  }, [candidatos, paginaAtual]);

  const qtdMarcadas = candidatos.filter((c) => selecionados[c.id]).length;

  async function abrirEBuscar() {
    setAberto(true);
    setCarregando(true);
    setErro(null);
    setAviso(null);
    setPagina(0);
    try {
      const res = await fetch("/api/juris/sugerir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consulta,
          uploads: uploads
            .filter((u) => (u.texto ?? "").trim().length > 20 || u.titulo)
            .map((u) => ({
              id: u.id,
              titulo: u.titulo,
              tipo: u.tipo,
              texto: u.texto,
            })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || "Não foi possível buscar sugestões.");
        setCandidatos([]);
        setTotais(null);
        return;
      }
      const lista = (data.candidatos ?? []) as JurisCandidato[];
      setCandidatos(lista);
      setTotais(data.totais ?? null);
      setAviso(data.aviso ?? null);
      setProvedorExterno(Boolean(data.provedorExternoAtivo));
      if (data.cota) setCota(data.cota);
      const init: Record<string, boolean> = {};
      for (const c of lista) {
        // Anexos do caso já estão na peça — pré-marca só para conferência
        init[c.id] = c.origem === "upload_usuario";
      }
      setSelecionados(init);
    } catch {
      setErro("Falha de rede ao buscar jurisprudências.");
    } finally {
      setCarregando(false);
    }
  }

  function toggle(id: string) {
    setSelecionados((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function selecionarTodos(marcar: boolean) {
    const next: Record<string, boolean> = {};
    for (const c of candidatos) next[c.id] = marcar;
    setSelecionados(next);
  }

  async function confirmar() {
    const escolhidos = candidatos.filter((c) => selecionados[c.id]);
    if (!escolhidos.length) return;

    setSalvando(true);
    setErro(null);
    try {
      const paraFila = escolhidos.filter(
        (c) =>
          c.origem === "jurisprudencias_ai" || c.origem === "tribunal_scraper"
      );
      if (paraFila.length) {
        await fetch("/api/juris/salvar-base", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            precedentes: paraFila.map((c) => ({
              titulo: c.titulo,
              ementa: c.ementa,
              tribunal: c.tribunal,
              data: c.data,
              url: c.url,
              numeroProcesso: c.numeroProcesso,
              relator: c.relator,
              origem: c.origem,
              tipo: c.tipo,
            })),
          }),
        });
      }

      // Uploads já estão em jurisCaso — só aplica sugestões novas
      const novos = escolhidos.filter((c) => c.origem !== "upload_usuario");
      const salvos: JurisCasoSalvo[] = novos.map((c) => {
        const ementaComLink = c.url
          ? `${c.ementa.trim()}\n\nFonte oficial para conferência: ${c.url}`
          : c.ementa;
        const base: JurisCasoItem = jurisCasoVazio({
          tipo: c.tipo,
          titulo: c.titulo,
          texto: ementaComLink,
        });
        return { ...base, id: crypto.randomUUID() };
      });
      if (salvos.length) onAplicar(salvos);
      setAberto(false);
    } catch {
      setErro("Não foi possível confirmar a seleção. Tente de novo.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void abrirEBuscar()}
          disabled={consulta.trim().length < 8}
          className="rounded-lg border border-stone-700 bg-stone-800 px-4 py-2.5 text-sm font-medium text-amber-50 hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Sugerir Jurisprudência/Súmula
        </button>
        {cota && provedorExterno ? (
          <span
            className="text-xs tabular-nums text-slate-500"
            title="Buscas externas usadas neste mês (Jurisprudências.ai). Uploads não contam. Renova no dia 1º."
          >
            {cota.usadas}/{cota.limite}
          </span>
        ) : null}
      </div>
      <p className="text-xs text-slate-500">
        Em cada busca: 1 súmula + 1 julgado externo (se houver cota) + até 5 do
        TJSP/base FACTO, além dos seus anexos. Anexos/texto que você colar
        entram na peça mesmo sem abrir esta sugestão. Busca externa:{" "}
        {cota ? `${cota.usadas}/${cota.limite}` : "15/mês"} (renova todo mês).
      </p>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="juris-sugestoes-titulo"
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
          >
            <div className="shrink-0 border-b border-slate-100 p-5 pb-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3
                  id="juris-sugestoes-titulo"
                  className="text-lg font-semibold text-slate-800"
                >
                  Escolha jurisprudência / súmula
                </h3>
                {cota && provedorExterno ? (
                  <span className="text-xs tabular-nums text-slate-500">
                    {cota.usadas}/{cota.limite} neste mês
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Marque as que quiser usar na peça. Seus anexos já entram na
                geração; aqui servem para conferência. Julgados da API vão para
                fila de verificação do admin (julgados de tribunal e da API).
              </p>
              {totais && !carregando ? (
                <p className="mt-2 text-xs text-slate-600">
                  {totais.sumulas} súmula(s), {totais.julgados} julgado(s)
                  {totais.uploads > 0 ? `, ${totais.uploads} anexo(s)` : ""}
                  {qtdMarcadas > 0 ? ` · ${qtdMarcadas} marcada(s)` : ""}.
                </p>
              ) : null}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {carregando && (
                <p className="text-sm text-slate-600">Buscando opções…</p>
              )}
              {erro && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
                  {erro}
                </p>
              )}
              {aviso && !carregando && (
                <p className="mb-3 text-xs text-amber-800">{aviso}</p>
              )}

              {!carregando && candidatos.length > 0 && (
                <>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => selecionarTodos(true)}
                      className="text-xs font-medium text-stone-700 underline"
                    >
                      Marcar todas
                    </button>
                    <button
                      type="button"
                      onClick={() => selecionarTodos(false)}
                      className="text-xs font-medium text-stone-700 underline"
                    >
                      Desmarcar todas
                    </button>
                  </div>
                  <ul className="space-y-3">
                    {paginaItens.map((c, i) => {
                      const idxGlobal = paginaAtual * POR_PAGINA + i;
                      return (
                        <li
                          key={c.id}
                          className="rounded-lg border border-slate-200 p-3"
                        >
                          <label className="flex cursor-pointer items-start gap-3">
                            <input
                              type="checkbox"
                              checked={Boolean(selecionados[c.id])}
                              onChange={() => toggle(c.id)}
                              className="mt-1 h-4 w-4 rounded border-slate-300 text-stone-700"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="font-semibold text-stone-800">
                                {c.letra ||
                                  LETRAS[idxGlobal] ||
                                  String(idxGlobal + 1)}
                                . {c.titulo}
                              </span>
                              <span className="ml-2 text-xs uppercase tracking-wide text-slate-400">
                                {rotuloOrigem(c.origem)}
                              </span>
                              <span className="mt-1 block text-sm leading-relaxed text-slate-700">
                                {c.ementa.length > 420
                                  ? `${c.ementa.slice(0, 420)}…`
                                  : c.ementa}
                              </span>
                              {c.url ? (
                                <a
                                  href={c.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1 inline-block text-xs font-medium text-stone-700 underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Abrir acórdão / fonte oficial
                                </a>
                              ) : null}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}

              {!carregando && !erro && candidatos.length === 0 && (
                <p className="text-sm text-slate-600">
                  Nenhuma sugestão encontrada. Anexe um julgado ou refine os
                  fatos / tipo da ação.
                </p>
              )}
            </div>

            <div className="shrink-0 border-t border-slate-100 p-5 pt-4">
              {!carregando && candidatos.length > POR_PAGINA ? (
                <div className="mb-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={paginaAtual <= 0}
                    onClick={() => setPagina((p) => Math.max(0, p - 1))}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <p className="text-xs text-slate-500">
                    Página {paginaAtual + 1} de {totalPaginas} ·{" "}
                    {candidatos.length} resultados
                  </p>
                  <button
                    type="button"
                    disabled={paginaAtual >= totalPaginas - 1}
                    onClick={() =>
                      setPagina((p) => Math.min(totalPaginas - 1, p + 1))
                    }
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-40"
                  >
                    Próxima
                  </button>
                </div>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAberto(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => void confirmar()}
                  disabled={carregando || salvando || qtdMarcadas === 0}
                  className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-amber-50 disabled:opacity-50"
                >
                  {salvando
                    ? "Salvando…"
                    : `Confirmar seleção${qtdMarcadas > 0 ? ` (${qtdMarcadas})` : ""}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
