"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GestaoShell } from "@/components/gestao/gestao-shell";
import { GestaoKpiCard, GestaoPainel } from "@/components/gestao/gestao-ui";
import { formatarMoeda } from "@/lib/gestao/gestao-format";
import {
  calcularHonorarioContratado,
  sugerirHonorario,
} from "@/lib/gestao/gestao-honorarios";
import type { ProcessoGestao } from "@/lib/gestao/gestao-types";

const STATUS_LABEL: Record<string, string> = {
  a_definir: "A definir",
  proposta: "Proposta",
  contratado: "Contratado",
};

export default function GestaoHonorariosPage() {
  const [escritorioNome, setEscritorioNome] = useState("");
  const [processos, setProcessos] = useState<ProcessoGestao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<"todos" | "pendentes" | "contratados">(
    "todos"
  );

  const carregar = useCallback(async () => {
    const ctx = await fetch("/api/gestao/escritorio").then((r) => r.json());
    if (ctx.escritorio?.nome) setEscritorioNome(ctx.escritorio.nome);
    const res = await fetch("/api/gestao/processos");
    const data = (await res.json()) as { processos?: ProcessoGestao[] };
    setProcessos((data.processos ?? []).filter((p) => p.status === "ativo"));
    setLoading(false);
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const stats = useMemo(() => {
    let contratados = 0;
    let pendentes = 0;
    let totalContratadoCentavos = 0;
    for (const p of processos) {
      const valor = calcularHonorarioContratado(p);
      if (p.honorarioStatus === "contratado" && valor != null) {
        contratados++;
        totalContratadoCentavos += valor;
      } else if (
        p.honorarioTipo === "a_definir" ||
        p.honorarioStatus === "a_definir"
      ) {
        pendentes++;
      }
    }
    return { contratados, pendentes, totalContratadoCentavos };
  }, [processos]);

  const lista = useMemo(() => {
    if (filtro === "pendentes") {
      return processos.filter(
        (p) =>
          p.honorarioTipo === "a_definir" || p.honorarioStatus === "a_definir"
      );
    }
    if (filtro === "contratados") {
      return processos.filter((p) => p.honorarioStatus === "contratado");
    }
    return processos;
  }, [processos, filtro]);

  return (
    <GestaoShell
      titulo="Honorários"
      subtitulo="Referência e contratos — sem fluxo de caixa"
      escritorioNome={escritorioNome}
    >
      <p className="mb-6 text-sm text-stone-500">
        Acompanhe propostas e valores contratados por pasta. Não há controle de
        recebimentos neste MVP — apenas o que foi acordado com o cliente.
      </p>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <GestaoKpiCard
          label="Carteira contratada"
          valor={formatarMoeda(stats.totalContratadoCentavos)}
          destaque="ok"
        />
        <GestaoKpiCard label="Pastas contratadas" valor={stats.contratados} />
        <GestaoKpiCard
          label="Sem honorário definido"
          valor={stats.pendentes}
          destaque={stats.pendentes > 0 ? "danger" : undefined}
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["todos", "Todas as pastas"],
            ["pendentes", "A definir"],
            ["contratados", "Contratados"],
          ] as const
        ).map(([id, rotulo]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFiltro(id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              filtro === id
                ? "border-facto-gold/50 bg-facto-gold/10 text-facto-gold"
                : "border-stone-700 text-stone-400"
            }`}
          >
            {rotulo}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-stone-500">Carregando…</p>
      ) : lista.length === 0 ? (
        <p className="text-sm text-stone-500">Nenhuma pasta neste filtro.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-800">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-stone-800 bg-stone-900/50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3">Cliente / pasta</th>
                <th className="px-4 py-3">Área</th>
                <th className="px-4 py-3">Sugestão</th>
                <th className="px-4 py-3">Contratado</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {lista.map((p) => {
                const sug = sugerirHonorario({
                  area: p.area,
                  valorCausaCentavos: p.valorCausaCentavos,
                });
                const contratado = calcularHonorarioContratado(p);
                return (
                  <tr key={p.id} className="hover:bg-stone-900/30">
                    <td className="px-4 py-3">
                      <Link
                        href={`/gestao/processos/${p.id}`}
                        className="font-medium text-stone-200 hover:text-facto-gold"
                      >
                        {p.cliente}
                      </Link>
                      <p className="font-mono text-[10px] text-stone-600">
                        {p.numero || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-stone-400">{p.area}</td>
                    <td className="px-4 py-3 text-stone-400">
                      {formatarMoeda(sug.sugeridoCentavos)}
                    </td>
                    <td className="px-4 py-3 text-stone-200">
                      {contratado != null
                        ? formatarMoeda(contratado)
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-stone-700 px-2 py-0.5 text-[10px] uppercase text-stone-400">
                        {STATUS_LABEL[p.honorarioStatus] ?? p.honorarioStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <GestaoPainel titulo="Como usar">
        <ul className="list-inside list-disc space-y-1 text-sm text-stone-400">
          <li>
            A coluna <strong className="text-stone-300">Sugestão</strong> usa
            área e valor da causa — referência de mercado, não tabela OAB.
          </li>
          <li>
            Abra a pasta para definir tipo (fixo, %, mensal) e marcar como{" "}
            <em>contratado</em> quando fechar com o cliente.
          </li>
          <li>
            Não há lançamento de parcelas, boletos ou recebimentos nesta fase.
          </li>
        </ul>
      </GestaoPainel>
    </GestaoShell>
  );
}
