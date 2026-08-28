"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GestaoShell } from "@/components/gestao/gestao-shell";
import {
  GestaoBarChart,
  GestaoKpiCard,
  GestaoPainel,
  GESTAO_INPUT,
} from "@/components/gestao/gestao-ui";

type Processo = {
  id: string;
  numero: string;
  cliente: string;
  area: string;
  status: string;
};

type ClienteOpcao = { id: string; nome: string };

const AREAS_SUGERIDAS = [
  "Cível",
  "Trabalhista",
  "Penal",
  "Família",
  "Consumidor",
  "Tributário",
  "Administrativo",
];

function BadgeStatus({ status }: { status: string }) {
  const ativo = status === "ativo";
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
        ativo
          ? "border-emerald-800/50 bg-emerald-950/50 text-emerald-300"
          : "border-stone-700 bg-stone-800/80 text-stone-400"
      }`}
    >
      {ativo ? "Ativo" : "Arquivado"}
    </span>
  );
}

export default function GestaoProcessosPage() {
  const [escritorioNome, setEscritorioNome] = useState("");
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [clientes, setClientes] = useState<ClienteOpcao[]>([]);
  const [numero, setNumero] = useState("");
  const [cliente, setCliente] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [area, setArea] = useState("");
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const ctx = await fetch("/api/gestao/escritorio").then((r) => r.json());
    if (ctx.escritorio?.nome) setEscritorioNome(ctx.escritorio.nome);
    const res = await fetch("/api/gestao/processos");
    const data = (await res.json()) as { processos?: Processo[]; error?: string };
    const cliRes = await fetch("/api/gestao/clientes");
    const cliData = (await cliRes.json()) as { clientes?: ClienteOpcao[] };
    setClientes(cliData.clientes ?? []);
    if (!res.ok) {
      setErro(data.error ?? "Erro ao carregar.");
    } else {
      setProcessos(data.processos ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const stats = useMemo(() => {
    const ativos = processos.filter((p) => p.status === "ativo");
    const areas = new Map<string, number>();
    for (const p of ativos) {
      const a = p.area.trim() || "Sem área";
      areas.set(a, (areas.get(a) ?? 0) + 1);
    }
    return {
      total: processos.length,
      ativos: ativos.length,
      arquivados: processos.filter((p) => p.status === "arquivado").length,
      porArea: [...areas.entries()]
        .map(([area, total]) => ({ rotulo: area, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 6),
    };
  }, [processos]);

  const processosFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return processos;
    return processos.filter(
      (p) =>
        p.cliente.toLowerCase().includes(q) ||
        p.numero.toLowerCase().includes(q) ||
        p.area.toLowerCase().includes(q)
    );
  }, [processos, busca]);

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    const res = await fetch("/api/gestao/processos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        numero,
        cliente: clienteId
          ? clientes.find((c) => c.id === clienteId)?.nome ?? cliente
          : cliente,
        clienteId: clienteId || null,
        area,
      }),
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setErro(data.error ?? "Falha ao salvar.");
      setSalvando(false);
      return;
    }
    setNumero("");
    setCliente("");
    setClienteId("");
    setArea("");
    setSalvando(false);
    void carregar();
  }

  return (
    <GestaoShell
      titulo="Processos"
      subtitulo="Pastas e clientes do escritório"
      escritorioNome={escritorioNome}
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <GestaoKpiCard label="Total de pastas" valor={stats.total} />
        <GestaoKpiCard label="Ativos" valor={stats.ativos} destaque="ok" />
        <GestaoKpiCard label="Arquivados" valor={stats.arquivados} />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <GestaoPainel titulo="Nova pasta">
          <form onSubmit={adicionar} className="grid gap-3">
            <input
              placeholder="Nº processo (CNJ ou interno)"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              required
              className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white placeholder:text-stone-500"
            />
            <select
              value={clienteId}
              onChange={(e) => {
                setClienteId(e.target.value);
                const c = clientes.find((x) => x.id === e.target.value);
                if (c) setCliente(c.nome);
              }}
              className={`${GESTAO_INPUT} sm:col-span-2`}
            >
              <option value="">Cliente cadastrado (opcional)</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
            <input
              placeholder="Ou digite o nome do cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              required={!clienteId}
              className={GESTAO_INPUT}
            />
            <div className="flex flex-wrap gap-2">
              <input
                list="areas-gestao"
                placeholder="Área (ex.: Cível)"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                required
                className="min-w-[140px] flex-1 rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white"
              />
              <datalist id="areas-gestao">
                {AREAS_SUGERIDAS.map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
              <button
                type="submit"
                disabled={salvando}
                className="rounded-lg bg-facto-gold px-4 py-2 text-sm font-semibold text-facto-dark disabled:opacity-50"
              >
                {salvando ? "Salvando…" : "Adicionar"}
              </button>
            </div>
          </form>
          {erro ? <p className="mt-3 text-sm text-red-400">{erro}</p> : null}
        </GestaoPainel>

        <GestaoBarChart
          titulo="Pastas ativas por área"
          itens={stats.porArea}
          cor="bg-facto-gold"
        />
      </div>

      <div className="mb-4">
        <input
          type="search"
          placeholder="Buscar por cliente, número ou área…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full max-w-md rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white placeholder:text-stone-500"
        />
      </div>

      {loading ? (
        <p className="text-stone-500">Carregando…</p>
      ) : processosFiltrados.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-800 px-4 py-8 text-center text-sm text-stone-500">
          {busca
            ? "Nenhum processo encontrado para essa busca."
            : "Nenhum processo cadastrado. Adicione a primeira pasta acima."}
        </p>
      ) : (
        <ul className="divide-y divide-stone-800 rounded-xl border border-stone-800 bg-stone-900/20">
          {processosFiltrados.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/gestao/processos/${p.id}`}
                  className="font-medium text-white hover:text-facto-gold"
                >
                  {p.cliente}
                </Link>
                <p className="mt-0.5 font-mono text-xs text-stone-500">
                  {p.numero || "Sem número"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-stone-700 bg-stone-800/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-stone-300">
                  {p.area || "Sem área"}
                </span>
                <BadgeStatus status={p.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </GestaoShell>
  );
}
