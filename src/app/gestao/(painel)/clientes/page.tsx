"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GestaoShell } from "@/components/gestao/gestao-shell";
import { GestaoPainel, GESTAO_INPUT } from "@/components/gestao/gestao-ui";

type Cliente = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  documento: string;
  notas: string;
};

export default function GestaoClientesPage() {
  const [escritorioNome, setEscritorioNome] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [documento, setDocumento] = useState("");
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    const ctx = await fetch("/api/gestao/escritorio").then((r) => r.json());
    if (ctx.escritorio?.nome) setEscritorioNome(ctx.escritorio.nome);
    const res = await fetch("/api/gestao/clientes");
    const data = (await res.json()) as { clientes?: Cliente[] };
    setClientes(data.clientes ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.documento.toLowerCase().includes(q)
    );
  }, [clientes, busca]);

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/gestao/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, telefone, documento }),
    });
    setNome("");
    setEmail("");
    setTelefone("");
    setDocumento("");
    void carregar();
  }

  return (
    <GestaoShell
      titulo="Clientes"
      subtitulo={`${clientes.length} cadastrado${clientes.length === 1 ? "" : "s"}`}
      escritorioNome={escritorioNome}
    >
      <GestaoPainel titulo="Novo cliente">
        <form onSubmit={adicionar} className="grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className={GESTAO_INPUT}
          />
          <input
            placeholder="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={GESTAO_INPUT}
          />
          <input
            placeholder="Telefone / WhatsApp"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className={GESTAO_INPUT}
          />
          <input
            placeholder="CPF ou CNPJ"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            className={GESTAO_INPUT}
          />
          <button
            type="submit"
            className="rounded-lg bg-facto-gold py-2 text-sm font-semibold text-facto-dark sm:col-span-2"
          >
            Cadastrar cliente
          </button>
        </form>
      </GestaoPainel>

      <div className="mt-6 mb-4">
        <input
          type="search"
          placeholder="Buscar cliente…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className={`${GESTAO_INPUT} max-w-md`}
        />
      </div>

      {loading ? (
        <p className="text-stone-500">Carregando…</p>
      ) : filtrados.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-800 px-4 py-8 text-center text-sm text-stone-500">
          Nenhum cliente cadastrado.
        </p>
      ) : (
        <ul className="divide-y divide-stone-800 rounded-xl border border-stone-800 bg-stone-900/20">
          {filtrados.map((c) => (
            <li key={c.id} className="px-4 py-3 text-sm">
              <p className="font-medium text-white">{c.nome}</p>
              <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-stone-500">
                {c.email ? <span>{c.email}</span> : null}
                {c.telefone ? <span>{c.telefone}</span> : null}
                {c.documento ? <span>{c.documento}</span> : null}
              </div>
              <Link
                href={`/gestao/processos?cliente=${encodeURIComponent(c.nome)}`}
                className="mt-2 inline-block text-xs text-facto-gold hover:underline"
              >
                Ver pastas →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </GestaoShell>
  );
}
