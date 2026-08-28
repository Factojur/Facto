import Link from "next/link";
import { formatarMoeda } from "@/lib/gestao/gestao-format";
import {
  urgenciaPrazo,
  type ResumoGestaoDashboard,
} from "@/lib/gestao/gestao-dashboard-stats";
import {
  BadgeUrgenciaPrazo,
  GestaoBarChart,
  GestaoKpiCard,
  GestaoPainel,
  GestaoPrazosChart,
} from "@/components/gestao/gestao-ui";

function saudacao(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function formatarData(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function GestaoDashboard({
  resumo,
  nomeUsuario,
}: {
  resumo: ResumoGestaoDashboard;
  nomeUsuario?: string;
}) {
  const primeiroNome = nomeUsuario?.split(/\s+/)[0];

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-facto-gold/20 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 px-6 py-8">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-facto-gold/10 blur-3xl"
          aria-hidden
        />
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-facto-gold">
          FACTO Gestão
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
          {saudacao()}
          {primeiroNome ? `, ${primeiroNome}` : ""}
        </h2>
        <p className="mt-2 max-w-xl text-sm text-stone-400">
          Visão do dia: prazos, audiências e pastas que precisam de atenção antes
          de abrir as minutas no FACTO.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-stone-700 bg-stone-900/80 px-3 py-1.5 text-xs font-medium text-stone-300 hover:border-facto-gold/40 hover:text-facto-gold"
          >
            Abrir minutas FACTO ↗
          </Link>
          <Link
            href="/gestao/prazos"
            className="rounded-lg bg-facto-gold/15 px-3 py-1.5 text-xs font-medium text-facto-gold hover:bg-facto-gold/25"
          >
            Ver todos os prazos
          </Link>
        </div>
      </div>

      {resumo.checklistDia.length > 0 && (
        <GestaoPainel titulo="O que observar hoje">
          <ul className="space-y-2">
            {resumo.checklistDia.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition hover:bg-stone-800/50 ${
                    item.urgente
                      ? "border-red-900/50 text-red-100"
                      : "border-stone-800 text-stone-300"
                  }`}
                >
                  <span aria-hidden>{item.urgente ? "⚠" : "→"}</span>
                  {item.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </GestaoPainel>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GestaoKpiCard
          label="Processos ativos"
          valor={resumo.processosAtivos}
          href="/gestao/processos"
        />
        <GestaoKpiCard
          label="Clientes"
          valor={resumo.clientesAtivos}
          href="/gestao/clientes"
        />
        <GestaoKpiCard
          label="Prazos em aberto"
          valor={resumo.prazosAbertos}
          href="/gestao/prazos"
          destaque={resumo.prazosVencidos > 0 ? "danger" : undefined}
          sub={
            resumo.prazosVencidos > 0
              ? `${resumo.prazosVencidos} vencido(s)`
              : undefined
          }
        />
        <GestaoKpiCard
          label="Compromissos hoje"
          valor={resumo.compromissosHoje}
          href="/gestao/agenda"
          sub={`${resumo.compromissosSemana} esta semana`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <GestaoKpiCard
          label="Honorários contratados"
          valor={formatarMoeda(resumo.honorariosContratadosCentavos)}
          href="/gestao/honorarios"
          destaque="ok"
          sub={
            resumo.processosSemHonorario > 0
              ? `${resumo.processosSemHonorario} pasta(s) sem definir`
              : "Carteira ativa"
          }
        />
        <GestaoKpiCard
          label="Vencem hoje"
          valor={resumo.prazosHoje}
          href="/gestao/prazos"
          destaque={resumo.prazosHoje > 0 ? "danger" : undefined}
        />
        <GestaoKpiCard
          label="Pastas arquivadas"
          valor={resumo.processosArquivados}
          href="/gestao/processos"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GestaoBarChart
          titulo="Processos por área"
          itens={resumo.processosPorArea.map((p) => ({
            rotulo: p.area,
            total: p.total,
          }))}
        />
        <GestaoPrazosChart itens={resumo.prazosPorUrgencia} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GestaoPainel
          titulo="Próximos prazos"
          acao={
            <Link
              href="/gestao/prazos"
              className="text-xs text-facto-gold hover:underline"
            >
              Ver todos
            </Link>
          }
        >
          {resumo.proximosPrazos.length === 0 ? (
            <p className="text-sm text-stone-500">
              Nenhum prazo em aberto. Cadastre manifestações, recursos e
              diligências.
            </p>
          ) : (
            <ul className="divide-y divide-stone-800">
              {resumo.proximosPrazos.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                >
                  <span className="text-sm text-stone-200">{p.titulo}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs tabular-nums text-stone-500">
                      {formatarData(p.vencimento)}
                    </span>
                    <BadgeUrgenciaPrazo urgencia={urgenciaPrazo(p)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </GestaoPainel>

        <GestaoPainel
          titulo="Agenda — próximos compromissos"
          acao={
            <Link
              href="/gestao/agenda"
              className="text-xs text-facto-gold hover:underline"
            >
              Ver agenda
            </Link>
          }
        >
          {resumo.proximosEventos.length === 0 ? (
            <p className="text-sm text-stone-500">
              Sem audiências ou reuniões agendadas. Registre perícias, CEJUSC e
              sustentações.
            </p>
          ) : (
            <ul className="divide-y divide-stone-800">
              {resumo.proximosEventos.map((e) => (
                <li key={e.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-medium text-stone-200">
                    {e.titulo}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {formatarDataHora(e.inicio)}
                    {e.local ? ` · ${e.local}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </GestaoPainel>
      </div>

      <section className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4 text-sm text-amber-100/90">
        <strong className="text-amber-200">MVP local.</strong> Dados em{" "}
        <code className="text-amber-300">.data/gestao/</code>. Minutas FACTO
        continuam no módulo de peças — aqui: clientes, pastas, prazos, agenda e
        honorários (sem financeiro).
      </section>
    </div>
  );
}
