"use client";

import Link from "next/link";
import type { UrgenciaPrazo } from "@/lib/gestao/gestao-dashboard-stats";

export function GestaoKpiCard({
  label,
  valor,
  href,
  destaque,
  sub,
}: {
  label: string;
  valor: string | number;
  href?: string;
  destaque?: "gold" | "danger" | "ok";
  sub?: string;
}) {
  const ring =
    destaque === "danger"
      ? "border-red-900/50 hover:border-red-700/60"
      : destaque === "ok"
        ? "border-emerald-900/40 hover:border-emerald-700/50"
        : "border-stone-800 hover:border-facto-gold/40";

  const inner = (
    <>
      <p
        className={`text-3xl font-semibold tabular-nums ${
          destaque === "danger"
            ? "text-red-300"
            : destaque === "ok"
              ? "text-emerald-300"
              : "text-white"
        }`}
      >
        {valor}
      </p>
      <p className="mt-1 text-sm text-stone-400">{label}</p>
      {sub ? <p className="mt-0.5 text-xs text-stone-500">{sub}</p> : null}
    </>
  );

  const cls = `rounded-xl border bg-stone-900/50 p-5 transition ${ring}`;
  if (href) {
    return (
      <Link href={href} className={`block ${cls}`}>
        {inner}
      </Link>
    );
  }
  return <div className={cls}>{inner}</div>;
}

export function GestaoBarChart({
  titulo,
  itens,
  cor = "bg-facto-gold",
}: {
  titulo: string;
  itens: { rotulo: string; total: number }[];
  cor?: string;
}) {
  const max = Math.max(1, ...itens.map((i) => i.total));

  return (
    <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-5">
      <h3 className="text-sm font-semibold text-stone-200">{titulo}</h3>
      {itens.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">Sem dados ainda.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {itens.map((item) => (
            <li key={item.rotulo}>
              <div className="mb-1 flex justify-between text-xs text-stone-400">
                <span className="truncate pr-2">{item.rotulo}</span>
                <span className="tabular-nums text-stone-300">{item.total}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-stone-800">
                <div
                  className={`h-full rounded-full ${cor} transition-all`}
                  style={{ width: `${Math.round((item.total / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const URGENCIA_LABEL: Record<UrgenciaPrazo, string> = {
  vencido: "Vencidos",
  hoje: "Hoje",
  semana: "7 dias",
  futuro: "Depois",
  concluido: "Concluídos",
};

const URGENCIA_COR: Record<UrgenciaPrazo, string> = {
  vencido: "bg-red-500",
  hoje: "bg-amber-500",
  semana: "bg-facto-gold",
  futuro: "bg-stone-500",
  concluido: "bg-emerald-600",
};

export function GestaoPrazosChart({
  itens,
}: {
  itens: { urgencia: UrgenciaPrazo; total: number }[];
}) {
  const filtrados = itens.filter((i) => i.total > 0);
  const total = filtrados.reduce((s, i) => s + i.total, 0) || 1;

  return (
    <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-5">
      <h3 className="text-sm font-semibold text-stone-200">
        Prazos por urgência
      </h3>
      {filtrados.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">Nenhum prazo cadastrado.</p>
      ) : (
        <>
          <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-stone-800">
            {filtrados.map((item) => (
              <div
                key={item.urgencia}
                className={`${URGENCIA_COR[item.urgencia]} transition-all`}
                style={{ width: `${(item.total / total) * 100}%` }}
                title={`${URGENCIA_LABEL[item.urgencia]}: ${item.total}`}
              />
            ))}
          </div>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-stone-400">
            {filtrados.map((item) => (
              <li key={item.urgencia} className="flex items-center gap-1.5">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${URGENCIA_COR[item.urgencia]}`}
                />
                {URGENCIA_LABEL[item.urgencia]} ({item.total})
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export function BadgeUrgenciaPrazo({ urgencia }: { urgencia: UrgenciaPrazo }) {
  const styles: Record<UrgenciaPrazo, string> = {
    vencido: "bg-red-950/80 text-red-300 border-red-800/60",
    hoje: "bg-amber-950/80 text-amber-200 border-amber-800/50",
    semana: "bg-stone-800 text-facto-gold border-facto-gold/30",
    futuro: "bg-stone-800/80 text-stone-400 border-stone-700",
    concluido: "bg-emerald-950/50 text-emerald-300 border-emerald-800/40",
  };
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${styles[urgencia]}`}
    >
      {URGENCIA_LABEL[urgencia]}
    </span>
  );
}

export const GESTAO_INPUT =
  "rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white placeholder:text-stone-500";

export const GESTAO_SELECT = `${GESTAO_INPUT} min-w-[140px]`;

export function GestaoPainel({
  titulo,
  children,
  acao,
}: {
  titulo: string;
  children: React.ReactNode;
  acao?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-stone-800 bg-stone-900/30">
      <div className="flex items-center justify-between gap-3 border-b border-stone-800 px-4 py-3">
        <h3 className="text-sm font-semibold text-stone-200">{titulo}</h3>
        {acao}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
