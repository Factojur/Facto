import Link from "next/link";
import { formatarMoeda } from "@/lib/gestao/gestao-format";
import {
  urgenciaPrazo,
  type ResumoGestaoDashboard,
} from "@/lib/gestao/gestao-dashboard-stats";
import { GestaoDashboardHero } from "@/components/gestao/gestao-dashboard-hero";
import {
  BadgeUrgenciaPrazo,
  GestaoBarChart,
  GestaoKpiCard,
  GestaoPainel,
  GestaoPrazosChart,
} from "@/components/gestao/gestao-ui";

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
  podeVerHonorarios = true,
}: {
  resumo: ResumoGestaoDashboard;
  nomeUsuario?: string;
  podeVerHonorarios?: boolean;
}) {
  return (
    <div className="space-y-8">
      <GestaoDashboardHero
        nomeUsuario={nomeUsuario}
        processosAtivos={resumo.processosAtivos}
        prazosVencidos={resumo.prazosVencidos}
        prazosHoje={resumo.prazosHoje}
        compromissosHoje={resumo.compromissosHoje}
      />

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

      <div className={`grid gap-4 sm:grid-cols-2 ${podeVerHonorarios ? "lg:grid-cols-3" : ""}`}>
        {podeVerHonorarios ? (
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
        ) : null}
        <GestaoKpiCard
          label="Vencem hoje"
          valor={resumo.prazosHoje}
          href="/gestao/prazos"
          destaque={resumo.prazosHoje > 0 ? "danger" : undefined}
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

      <section className="rounded-xl border border-stone-800 bg-stone-900/30 p-4 text-sm text-stone-400">
        <strong className="text-stone-300">Operação do escritório.</strong>{" "}
        Clientes, pastas, prazos, agenda e honorários de referência — separado
        das minutas FACTO. Dados do escritório ficam vinculados à sua conta
        administradora.
      </section>
    </div>
  );
}
