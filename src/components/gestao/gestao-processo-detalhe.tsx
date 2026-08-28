"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  BadgeUrgenciaPrazo,
  GestaoPainel,
  GESTAO_INPUT,
  GESTAO_SELECT,
} from "@/components/gestao/gestao-ui";
import type { ProcessoGestao } from "@/lib/gestao/gestao-types";
import { urgenciaPrazo } from "@/lib/gestao/gestao-dashboard-stats";
import { parseMoedaParaCentavos } from "@/lib/gestao/gestao-format";

type Prazo = {
  id: string;
  titulo: string;
  vencimento: string;
  concluido: boolean;
  processoId: string | null;
};

type Evento = {
  id: string;
  titulo: string;
  inicio: string;
  local: string;
  processoId: string | null;
};

type Atividade = {
  id: string;
  titulo: string;
  conteudo: string;
  criadoEm: string;
};

export function GestaoProcessoDetalhe({ processoId }: { processoId: string }) {
  const [processo, setProcesso] = useState<ProcessoGestao | null>(null);
  const [prazos, setPrazos] = useState<Prazo[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [notaTitulo, setNotaTitulo] = useState("");
  const [notaConteudo, setNotaConteudo] = useState("");

  const carregar = useCallback(async () => {
    const [procRes, prazosRes, agendaRes, ativRes] = await Promise.all([
      fetch(`/api/gestao/processos?id=${encodeURIComponent(processoId)}`),
      fetch("/api/gestao/prazos"),
      fetch("/api/gestao/agenda"),
      fetch(
        `/api/gestao/atividades?processoId=${encodeURIComponent(processoId)}`
      ),
    ]);
    const procData = (await procRes.json()) as { processo?: ProcessoGestao };
    const prazosData = (await prazosRes.json()) as { prazos?: Prazo[] };
    const agendaData = (await agendaRes.json()) as { eventos?: Evento[] };
    const ativData = (await ativRes.json()) as { atividades?: Atividade[] };

    setProcesso(procData.processo ?? null);
    setPrazos(
      (prazosData.prazos ?? []).filter((p) => p.processoId === processoId)
    );
    setEventos(
      (agendaData.eventos ?? []).filter((e) => e.processoId === processoId)
    );
    setAtividades(ativData.atividades ?? []);
    setLoading(false);
  }, [processoId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function salvarPatch(patch: Record<string, unknown>) {
    if (!processo) return;
    setSalvando(true);
    await fetch("/api/gestao/processos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: processo.id, ...patch }),
    });
    setSalvando(false);
    void carregar();
  }

  async function adicionarNota(e: React.FormEvent) {
    e.preventDefault();
    if (!notaTitulo.trim()) return;
    await fetch("/api/gestao/atividades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: notaTitulo,
        conteudo: notaConteudo,
        processoId,
        clienteId: processo?.clienteId,
      }),
    });
    setNotaTitulo("");
    setNotaConteudo("");
    void carregar();
  }

  if (loading) {
    return <p className="text-stone-500">Carregando pasta…</p>;
  }

  if (!processo) {
    return (
      <p className="text-stone-500">
        Processo não encontrado.{" "}
        <Link href="/gestao/processos" className="text-facto-gold hover:underline">
          Voltar
        </Link>
      </p>
    );
  }

  const prazosProcesso = prazos;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-stone-500">
            {processo.area || "Sem área"} ·{" "}
            {processo.status === "ativo" ? "Ativo" : "Arquivado"}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            {processo.cliente}
          </h2>
          <p className="mt-1 font-mono text-sm text-stone-400">
            {processo.numero || "Sem número CNJ"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={salvando}
            onClick={() =>
              void salvarPatch({
                status: processo.status === "ativo" ? "arquivado" : "ativo",
              })
            }
            className="rounded-lg border border-stone-700 px-3 py-1.5 text-xs text-stone-300 hover:border-facto-gold/40"
          >
            {processo.status === "ativo" ? "Arquivar pasta" : "Reativar"}
          </button>
          <Link
            href="/gestao/processos"
            className="rounded-lg border border-stone-700 px-3 py-1.5 text-xs text-stone-400 hover:text-facto-gold"
          >
            ← Processos
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GestaoPainel titulo="Dados do processo">
          <div className="grid gap-3 text-sm">
            <label className="grid gap-1">
              <span className="text-xs text-stone-500">Vara / juízo</span>
              <input
                className={GESTAO_INPUT}
                defaultValue={processo.vara}
                onBlur={(e) => {
                  if (e.target.value !== processo.vara) {
                    void salvarPatch({ vara: e.target.value });
                  }
                }}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs text-stone-500">Comarca</span>
              <input
                className={GESTAO_INPUT}
                defaultValue={processo.comarca}
                onBlur={(e) => {
                  if (e.target.value !== processo.comarca) {
                    void salvarPatch({ comarca: e.target.value });
                  }
                }}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs text-stone-500">Tribunal</span>
              <input
                className={GESTAO_INPUT}
                defaultValue={processo.tribunal}
                onBlur={(e) => {
                  if (e.target.value !== processo.tribunal) {
                    void salvarPatch({ tribunal: e.target.value });
                  }
                }}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs text-stone-500">Valor da causa</span>
              <input
                className={GESTAO_INPUT}
                defaultValue={
                  processo.valorCausaCentavos != null
                    ? (processo.valorCausaCentavos / 100).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })
                    : ""
                }
                placeholder="0,00"
                onBlur={(e) => {
                  const centavos = parseMoedaParaCentavos(e.target.value);
                  void salvarPatch({ valorCausaCentavos: centavos });
                }}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs text-stone-500">Polo do cliente</span>
              <select
                className={GESTAO_SELECT}
                value={processo.poloCliente ?? ""}
                onChange={(e) =>
                  void salvarPatch({
                    poloCliente: e.target.value
                      ? (e.target.value as "ativo" | "passivo")
                      : null,
                  })
                }
              >
                <option value="">Não informado</option>
                <option value="ativo">Polo ativo</option>
                <option value="passivo">Polo passivo</option>
              </select>
            </label>
          </div>
        </GestaoPainel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GestaoPainel
          titulo="Prazos desta pasta"
          acao={
            <Link
              href="/gestao/prazos"
              className="text-xs text-facto-gold hover:underline"
            >
              Ver todos
            </Link>
          }
        >
          {prazosProcesso.length === 0 ? (
            <p className="text-sm text-stone-500">Nenhum prazo vinculado.</p>
          ) : (
            <ul className="divide-y divide-stone-800 text-sm">
              {prazosProcesso.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 py-2"
                >
                  <span className={p.concluido ? "text-stone-500 line-through" : "text-stone-200"}>
                    {p.titulo}
                  </span>
                  <BadgeUrgenciaPrazo urgencia={urgenciaPrazo(p)} />
                </li>
              ))}
            </ul>
          )}
        </GestaoPainel>

        <GestaoPainel
          titulo="Agenda"
          acao={
            <Link
              href="/gestao/agenda"
              className="text-xs text-facto-gold hover:underline"
            >
              Ver agenda
            </Link>
          }
        >
          {eventos.length === 0 ? (
            <p className="text-sm text-stone-500">Sem compromissos vinculados.</p>
          ) : (
            <ul className="divide-y divide-stone-800 text-sm">
              {eventos.map((e) => (
                <li key={e.id} className="py-2 text-stone-300">
                  <p className="font-medium text-stone-200">{e.titulo}</p>
                  <p className="text-xs text-stone-500">
                    {new Date(e.inicio).toLocaleString("pt-BR")}
                    {e.local ? ` · ${e.local}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </GestaoPainel>
      </div>

      <GestaoPainel titulo="Linha do tempo / notas">
        <form onSubmit={adicionarNota} className="mb-4 grid gap-2">
          <input
            className={GESTAO_INPUT}
            placeholder="Título (ex.: Reunião com cliente, andamento)"
            value={notaTitulo}
            onChange={(e) => setNotaTitulo(e.target.value)}
            required
          />
          <textarea
            className={`${GESTAO_INPUT} min-h-[80px]`}
            placeholder="Detalhes…"
            value={notaConteudo}
            onChange={(e) => setNotaConteudo(e.target.value)}
          />
          <button
            type="submit"
            className="justify-self-start rounded-lg bg-facto-gold px-4 py-2 text-sm font-semibold text-facto-dark"
          >
            Registrar nota
          </button>
        </form>
        {atividades.length === 0 ? (
          <p className="text-sm text-stone-500">Nenhuma anotação ainda.</p>
        ) : (
          <ul className="space-y-3">
            {atividades.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-stone-800 bg-stone-950/40 p-3 text-sm"
              >
                <p className="font-medium text-stone-200">{a.titulo}</p>
                {a.conteudo ? (
                  <p className="mt-1 whitespace-pre-wrap text-stone-400">
                    {a.conteudo}
                  </p>
                ) : null}
                <p className="mt-2 text-[10px] text-stone-600">
                  {new Date(a.criadoEm).toLocaleString("pt-BR")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </GestaoPainel>
    </div>
  );
}
