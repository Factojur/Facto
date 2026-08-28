"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GestaoSeletorProcesso } from "@/components/gestao/gestao-seletor-processo";
import { GestaoShell } from "@/components/gestao/gestao-shell";
import { GestaoKpiCard, GestaoPainel, GESTAO_INPUT } from "@/components/gestao/gestao-ui";

type Evento = {
  id: string;
  titulo: string;
  inicio: string;
  local: string;
};

type GrupoAgenda = {
  id: string;
  rotulo: string;
  destaque?: boolean;
  eventos: Evento[];
};

function inicioDia(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function formatarHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatarDataLonga(d: Date): string {
  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function agruparEventos(eventos: Evento[]): GrupoAgenda[] {
  const hoje = inicioDia();
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);
  const fimSemana = new Date(hoje);
  const diaSem = hoje.getDay();
  const diasAteDomingo = diaSem === 0 ? 0 : 7 - diaSem;
  fimSemana.setDate(fimSemana.getDate() + diasAteDomingo);
  fimSemana.setHours(23, 59, 59, 999);

  const grupos: GrupoAgenda[] = [
    { id: "hoje", rotulo: "Hoje", destaque: true, eventos: [] },
    { id: "amanha", rotulo: "Amanhã", eventos: [] },
    { id: "semana", rotulo: "Restante da semana", eventos: [] },
    { id: "depois", rotulo: "Próximas datas", eventos: [] },
    { id: "passado", rotulo: "Anteriores (últimas 48h)", eventos: [] },
  ];

  const ordenados = eventos
    .slice()
    .sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime());

  for (const ev of ordenados) {
    const d = new Date(ev.inicio);
    const dia = inicioDia(d);

    if (dia.getTime() === hoje.getTime()) {
      grupos[0].eventos.push(ev);
    } else if (dia.getTime() === amanha.getTime()) {
      grupos[1].eventos.push(ev);
    } else if (d >= hoje && d <= fimSemana) {
      grupos[2].eventos.push(ev);
    } else if (d < hoje && d.getTime() >= hoje.getTime() - 48 * 60 * 60 * 1000) {
      grupos[4].eventos.push(ev);
    } else if (d > fimSemana) {
      grupos[3].eventos.push(ev);
    }
  }

  return grupos.filter((g) => g.eventos.length > 0);
}

export default function GestaoAgendaPage() {
  const [escritorioNome, setEscritorioNome] = useState("");
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [titulo, setTitulo] = useState("");
  const [inicio, setInicio] = useState("");
  const [local, setLocal] = useState("");
  const [processoId, setProcessoId] = useState("");
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    const ctx = await fetch("/api/gestao/escritorio").then((r) => r.json());
    if (ctx.escritorio?.nome) setEscritorioNome(ctx.escritorio.nome);
    const res = await fetch("/api/gestao/agenda");
    const data = (await res.json()) as { eventos?: Evento[] };
    setEventos(data.eventos ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const stats = useMemo(() => {
    const hoje = inicioDia();
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    const fimSem = new Date(hoje);
    const diaSem = hoje.getDay();
    fimSem.setDate(fimSem.getDate() + (diaSem === 0 ? 0 : 7 - diaSem));
    fimSem.setHours(23, 59, 59, 999);

    let hojeCount = 0;
    let semanaCount = 0;
    for (const ev of eventos) {
      const d = new Date(ev.inicio);
      if (d >= hoje && d < amanha) hojeCount++;
      if (d >= hoje && d <= fimSem) semanaCount++;
    }
    return { hoje: hojeCount, semana: semanaCount, total: eventos.length };
  }, [eventos]);

  const grupos = useMemo(() => agruparEventos(eventos), [eventos]);

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/gestao/agenda", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo,
        inicio,
        local,
        processoId: processoId || null,
      }),
    });
    setTitulo("");
    setInicio("");
    setLocal("");
    setProcessoId("");
    void carregar();
  }

  return (
    <GestaoShell
      titulo="Agenda"
      subtitulo="Audiências, perícias e reuniões"
      escritorioNome={escritorioNome}
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <GestaoKpiCard label="Compromissos hoje" valor={stats.hoje} />
        <GestaoKpiCard label="Esta semana" valor={stats.semana} />
        <GestaoKpiCard label="Total na agenda" valor={stats.total} />
      </div>

      <GestaoPainel titulo="Novo compromisso">
        <form
          onSubmit={adicionar}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <input
            placeholder="Título (audiência, perícia, CEJUSC…)"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white placeholder:text-stone-500 sm:col-span-2 lg:col-span-1"
          />
          <input
            type="datetime-local"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            required
            className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white"
          />
          <input
            placeholder="Local / link"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white placeholder:text-stone-500"
          />
          <GestaoSeletorProcesso value={processoId} onChange={setProcessoId} />
          <button
            type="submit"
            className="rounded-lg bg-facto-gold py-2 text-sm font-semibold text-facto-dark"
          >
            Adicionar
          </button>
        </form>
      </GestaoPainel>

      {loading ? (
        <p className="mt-6 text-stone-500">Carregando…</p>
      ) : grupos.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-stone-800 px-4 py-8 text-center text-sm text-stone-500">
          Nenhum compromisso na agenda. Cadastre audiências e reuniões acima.
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          {grupos.map((grupo) => (
            <section key={grupo.id}>
              <h3
                className={`mb-3 text-sm font-semibold uppercase tracking-wider ${
                  grupo.destaque ? "text-facto-gold" : "text-stone-500"
                }`}
              >
                {grupo.rotulo}
              </h3>
              <ul className="divide-y divide-stone-800 rounded-xl border border-stone-800 bg-stone-900/20">
                {grupo.eventos.map((ev) => {
                  const dataEv = new Date(ev.inicio);
                  return (
                    <li
                      key={ev.id}
                      className="flex flex-wrap items-start gap-4 px-4 py-3 text-sm"
                    >
                      <div
                        className={`shrink-0 rounded-lg border px-3 py-2 text-center ${
                          grupo.destaque
                            ? "border-facto-gold/30 bg-facto-gold/10"
                            : "border-stone-700 bg-stone-800/50"
                        }`}
                      >
                        <p className="text-lg font-semibold tabular-nums text-white">
                          {formatarHora(ev.inicio)}
                        </p>
                        {grupo.id === "depois" || grupo.id === "semana" ? (
                          <p className="text-[10px] capitalize text-stone-500">
                            {formatarDataLonga(dataEv).split(",")[0]}
                          </p>
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white">{ev.titulo}</p>
                        <p className="mt-0.5 text-stone-400">
                          {dataEv.toLocaleString("pt-BR", {
                            weekday: "short",
                            day: "2-digit",
                            month: "short",
                          })}
                          {ev.local ? ` · ${ev.local}` : ""}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </GestaoShell>
  );
}
