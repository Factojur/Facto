"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GestaoSeletorProcesso } from "@/components/gestao/gestao-seletor-processo";
import { GestaoShell } from "@/components/gestao/gestao-shell";
import {
  BadgeUrgenciaPrazo,
  GestaoKpiCard,
  GestaoPainel,
  GESTAO_INPUT,
} from "@/components/gestao/gestao-ui";
import {
  urgenciaPrazo,
  type UrgenciaPrazo,
} from "@/lib/gestao/gestao-dashboard-stats";

type Prazo = {
  id: string;
  titulo: string;
  vencimento: string;
  concluido: boolean;
};

type FiltroPrazo = "todos" | UrgenciaPrazo;

const FILTROS: { id: FiltroPrazo; rotulo: string }[] = [
  { id: "todos", rotulo: "Todos" },
  { id: "vencido", rotulo: "Vencidos" },
  { id: "hoje", rotulo: "Hoje" },
  { id: "semana", rotulo: "7 dias" },
  { id: "futuro", rotulo: "Depois" },
  { id: "concluido", rotulo: "Concluídos" },
];

function formatarData(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function GestaoPrazosPage() {
  const [escritorioNome, setEscritorioNome] = useState("");
  const [prazos, setPrazos] = useState<Prazo[]>([]);
  const [titulo, setTitulo] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [processoId, setProcessoId] = useState("");
  const [filtro, setFiltro] = useState<FiltroPrazo>("todos");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const ctx = await fetch("/api/gestao/escritorio").then((r) => r.json());
    if (ctx.escritorio?.nome) setEscritorioNome(ctx.escritorio.nome);
    const res = await fetch("/api/gestao/prazos");
    const data = (await res.json()) as { prazos?: Prazo[] };
    setPrazos(data.prazos ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const stats = useMemo(() => {
    const abertos = prazos.filter((p) => !p.concluido);
    return {
      abertos: abertos.length,
      vencidos: abertos.filter((p) => urgenciaPrazo(p) === "vencido").length,
      hoje: abertos.filter((p) => urgenciaPrazo(p) === "hoje").length,
      semana: abertos.filter((p) => urgenciaPrazo(p) === "semana").length,
      concluidos: prazos.filter((p) => p.concluido).length,
    };
  }, [prazos]);

  const prazosFiltrados = useMemo(() => {
    const lista =
      filtro === "todos"
        ? prazos
        : prazos.filter((p) => urgenciaPrazo(p) === filtro);

    return lista.slice().sort((a, b) => {
      if (a.concluido !== b.concluido) return a.concluido ? 1 : -1;
      return a.vencimento.localeCompare(b.vencimento);
    });
  }, [prazos, filtro]);

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/gestao/prazos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo,
        vencimento,
        processoId: processoId || null,
      }),
    });
    setTitulo("");
    setVencimento("");
    setProcessoId("");
    void carregar();
  }

  async function toggleConcluido(prazo: Prazo) {
    setSalvando(prazo.id);
    await fetch("/api/gestao/prazos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: prazo.id, concluido: !prazo.concluido }),
    });
    setSalvando(null);
    void carregar();
  }

  return (
    <GestaoShell
      titulo="Prazos"
      subtitulo="Vencimentos e tarefas do escritório"
      escritorioNome={escritorioNome}
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <GestaoKpiCard
          label="Em aberto"
          valor={stats.abertos}
          destaque={stats.vencidos > 0 ? "danger" : undefined}
        />
        <GestaoKpiCard
          label="Vencidos"
          valor={stats.vencidos}
          destaque={stats.vencidos > 0 ? "danger" : undefined}
        />
        <GestaoKpiCard label="Vencem hoje" valor={stats.hoje} />
        <GestaoKpiCard label="Próximos 7 dias" valor={stats.semana} />
        <GestaoKpiCard
          label="Concluídos"
          valor={stats.concluidos}
          destaque="ok"
        />
      </div>

      <GestaoPainel titulo="Novo prazo">
        <form onSubmit={adicionar} className="flex flex-wrap gap-3">
          <input
            placeholder="Descrição (ex.: Contestação, recurso, manifestação)"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            className={`min-w-[220px] flex-1 ${GESTAO_INPUT}`}
          />
          <GestaoSeletorProcesso
            value={processoId}
            onChange={setProcessoId}
            className="min-w-[200px]"
          />
          <input
            type="date"
            value={vencimento}
            onChange={(e) => setVencimento(e.target.value)}
            required
            className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white"
          />
          <button
            type="submit"
            className="rounded-lg bg-facto-gold px-4 py-2 text-sm font-semibold text-facto-dark"
          >
            Adicionar
          </button>
        </form>
      </GestaoPainel>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTROS.map((f) => {
          const ativo = filtro === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltro(f.id)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                ativo
                  ? "border-facto-gold/50 bg-facto-gold/10 text-facto-gold"
                  : "border-stone-700 text-stone-400 hover:border-stone-600 hover:text-stone-200"
              }`}
            >
              {f.rotulo}
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="mt-6 text-stone-500">Carregando…</p>
      ) : prazosFiltrados.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-stone-800 px-4 py-8 text-center text-sm text-stone-500">
          {filtro === "todos"
            ? "Nenhum prazo cadastrado. Registre o próximo vencimento acima."
            : "Nenhum prazo neste filtro."}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-stone-800 rounded-xl border border-stone-800 bg-stone-900/20">
          {prazosFiltrados.map((p) => {
            const urg = urgenciaPrazo(p);
            return (
              <li
                key={p.id}
                className={`flex flex-wrap items-center gap-3 px-4 py-3 text-sm ${
                  p.concluido ? "opacity-60" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => void toggleConcluido(p)}
                  disabled={salvando === p.id}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
                    p.concluido
                      ? "border-emerald-600 bg-emerald-600/20 text-emerald-400"
                      : "border-stone-600 hover:border-facto-gold/50"
                  }`}
                  aria-label={p.concluido ? "Marcar como pendente" : "Marcar como concluído"}
                >
                  {p.concluido ? "✓" : ""}
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={`font-medium ${
                      p.concluido
                        ? "text-stone-500 line-through"
                        : "text-white"
                    }`}
                  >
                    {p.titulo}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {formatarData(p.vencimento)}
                  </p>
                </div>
                <BadgeUrgenciaPrazo urgencia={urg} />
              </li>
            );
          })}
        </ul>
      )}
    </GestaoShell>
  );
}
