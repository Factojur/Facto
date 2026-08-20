"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MetodosPagamento } from "@/components/landing/metodos-pagamento";
import {
  PLANO_ANUAL,
  PLANO_ESCRITORIO_M,
  PLANO_ESCRITORIO_S,
  PLANO_JEC,
  PLANO_MENSAL,
  PLANO_PRO,
  PLANO_PRO_ANUAL,
  PLANO_TRIAL,
} from "@/lib/planos-facto";

const LINK_JEC =
  (process.env.NEXT_PUBLIC_MP_LINK_JEC ?? "").trim() ||
  "https://mpago.la/1Mqkzgm";
const LINK_MENSAL =
  (process.env.NEXT_PUBLIC_MP_LINK_MENSAL ?? "").trim() ||
  "https://mpago.la/2jsFX7w";
const LINK_PRO =
  (process.env.NEXT_PUBLIC_MP_LINK_PRO ?? "").trim() ||
  "https://mpago.la/18Pihyh";
const LINK_PRO_ANUAL =
  (process.env.NEXT_PUBLIC_MP_LINK_PRO_ANUAL ?? "").trim() ||
  "https://mpago.la/1xZjpYJ";
const LINK_ANUAL =
  (process.env.NEXT_PUBLIC_MP_LINK_ANUAL ?? "").trim() ||
  "https://mpago.la/26yzsZT";

type Aba = "comecar" | "advogado" | "escritorio";
type Ciclo = "mensal" | "anual";

const ABAS: { id: Aba; rotulo: string; dica: string }[] = [
  { id: "comecar", rotulo: "Começar", dica: "Teste ou Juizado" },
  { id: "advogado", rotulo: "Advogado", dica: "OAB · todas as áreas" },
  { id: "escritorio", rotulo: "Escritório", dica: "Assentos em equipe" },
];

function BotaoAssinar({
  href,
  children,
  variante = "secundario",
}: {
  href: string;
  children: React.ReactNode;
  variante?: "primario" | "secundario";
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`block w-full rounded-lg px-6 py-3.5 text-center font-semibold transition ${
        variante === "primario"
          ? "bg-facto-gold text-facto-dark shadow-lg shadow-facto-gold/20 hover:bg-[#a39a78]"
          : "border border-white/15 text-white hover:border-facto-gold/50 hover:bg-white/5"
      }`}
    >
      {children}
    </a>
  );
}

function CardShell({
  children,
  destaque,
  className = "",
}: {
  children: React.ReactNode;
  destaque?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-8 ${
        destaque
          ? "border-facto-gold/40 bg-gradient-to-br from-facto-gold/[0.1] via-white/[0.04] to-transparent"
          : "border-white/10 bg-white/[0.03]"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function LandingPrecos() {
  const [aba, setAba] = useState<Aba>("comecar");
  const [ciclo, setCiclo] = useState<Ciclo>("mensal");

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("aba");
      if (q === "comecar" || q === "advogado" || q === "escritorio") {
        setAba(q);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const completo =
    ciclo === "mensal"
      ? {
          plano: PLANO_MENSAL,
          link: LINK_MENSAL,
          cta: "Assinar Completo",
          eyebrow: "Mais escolhido",
          sub: "Para advogados (OAB) · todas as áreas · 100 minutas/mês.",
          destaque: false as boolean,
        }
      : {
          plano: PLANO_ANUAL,
          link: LINK_ANUAL,
          cta: "Garantir desconto anual",
          eyebrow: "Economia anual",
          sub: `Completo o ano todo · ${PLANO_ANUAL.pecasPorMes} minutas/mês · ${PLANO_ANUAL.rotuloEquivalenteMensal}/mês.`,
          destaque: true,
        };

  const pro =
    ciclo === "mensal"
      ? {
          plano: PLANO_PRO,
          link: LINK_PRO,
          cta: "Assinar Pro",
          eyebrow: "Alto volume",
          sub: "Para advogados (OAB) · 180 minutas/mês com prioridade na fila.",
          destaque: false as boolean,
        }
      : {
          plano: PLANO_PRO_ANUAL,
          link: LINK_PRO_ANUAL,
          cta: "Assinar Pro anual",
          eyebrow: "Máximo volume · economia",
          sub: `${PLANO_PRO_ANUAL.pecasPorMes} minutas/mês o ano todo · ${PLANO_PRO_ANUAL.rotuloEquivalenteMensal}/mês.`,
          destaque: true,
        };

  return (
    <section id="precos" className="relative px-6 py-20 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-facto-gold">
            Planos
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
            Escolha o ritmo da sua bancada
          </h2>
          <p className="mt-4 text-stone-400">
            Cotas claras de minutas e análises. Equipe FACTO e base curada em
            todos os planos. Cancele quando quiser — sem fidelidade.
          </p>
        </div>

        <div
          className="mx-auto mt-10 flex max-w-xl flex-wrap justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5"
          role="tablist"
          aria-label="Tipo de plano"
        >
          {ABAS.map((item) => {
            const ativa = aba === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={ativa}
                onClick={() => setAba(item.id)}
                className={`min-w-[7.5rem] flex-1 rounded-xl px-3 py-2.5 text-center transition ${
                  ativa
                    ? "bg-facto-gold text-facto-dark shadow-md shadow-facto-gold/20"
                    : "text-stone-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="block text-sm font-semibold">{item.rotulo}</span>
                <span
                  className={`mt-0.5 block text-[10px] ${
                    ativa ? "text-facto-dark/70" : "text-stone-600"
                  }`}
                >
                  {item.dica}
                </span>
              </button>
            );
          })}
        </div>

        {aba === "comecar" && (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <CardShell destaque>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-facto-gold/80">
                Comece sem cartão
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                {PLANO_TRIAL.rotulo}
              </h3>
              <p className="mt-1 text-sm text-stone-500">
                1 área · {PLANO_TRIAL.pecasPorMes} minutas · 7 dias · marca
                d’água no export.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">
                  {PLANO_TRIAL.rotuloPreco}
                </span>
                <span className="text-stone-500">{PLANO_TRIAL.rotuloPeriodo}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-stone-400">
                {PLANO_TRIAL.beneficios.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-facto-gold">✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  href="/trial"
                  className="block w-full rounded-lg bg-facto-gold px-6 py-3.5 text-center font-semibold text-facto-dark transition hover:bg-[#a39a78]"
                >
                  Iniciar teste
                </Link>
              </div>
            </CardShell>

            <CardShell>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-facto-gold/80">
                Entrada · foco JEC
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                {PLANO_JEC.rotulo}
              </h3>
              <p className="mt-1 text-sm text-stone-500">
                Para a própria parte no Juizado — sem OAB: 40 minutas/mês com
                lastro e padrão forense.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">
                  {PLANO_JEC.rotuloPreco}
                </span>
                <span className="text-stone-500">{PLANO_JEC.rotuloPeriodo}</span>
              </div>
              <p className="mt-1 text-xs text-stone-500">
                ≈ {PLANO_JEC.custoPorPecaAprox} por peça na cota
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-stone-400">
                {PLANO_JEC.beneficios.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-facto-gold">✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <BotaoAssinar href={LINK_JEC}>Começar no JEC</BotaoAssinar>
              </div>
            </CardShell>
          </div>
        )}

        {aba === "advogado" && (
          <div className="mt-10">
            <div className="mb-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
                Cobrança
              </p>
              <div
                className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1"
                role="group"
                aria-label="Mensal ou anual"
              >
                <button
                  type="button"
                  onClick={() => setCiclo("mensal")}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    ciclo === "mensal"
                      ? "bg-white text-facto-dark"
                      : "text-stone-400 hover:text-white"
                  }`}
                >
                  Mensal
                </button>
                <button
                  type="button"
                  onClick={() => setCiclo("anual")}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    ciclo === "anual"
                      ? "bg-facto-gold text-facto-dark"
                      : "text-stone-400 hover:text-white"
                  }`}
                >
                  Anual
                  <span className="ml-1.5 text-[10px] font-bold opacity-80">
                    economia
                  </span>
                </button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {[completo, pro].map((item) => (
                <CardShell key={item.plano.id} destaque={item.destaque}>
                  {ciclo === "anual" && "rotuloEconomia" in item.plano && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-facto-gold/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-facto-dark">
                      Economize {item.plano.rotuloEconomia}/ano
                    </span>
                  )}
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-facto-gold/80">
                    {item.eyebrow}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-white">
                    {item.plano.rotulo}
                  </h3>
                  <p className="mt-1 text-sm text-stone-500">{item.sub}</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                      {item.plano.rotuloPreco}
                    </span>
                    <span className="text-stone-500">
                      {item.plano.rotuloPeriodo}
                    </span>
                  </div>
                  {"rotuloEquivalenteMensal" in item.plano && (
                    <p className="mt-1 text-sm font-medium text-facto-gold">
                      Equivale a {item.plano.rotuloEquivalenteMensal}/mês
                    </p>
                  )}
                  <p className="mt-1 text-xs text-stone-500">
                    ≈ {item.plano.custoPorPecaAprox} por peça na cota
                  </p>
                  <ul className="mt-6 flex-1 space-y-3 text-sm text-stone-400">
                    {item.plano.beneficios.map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <span className="mt-0.5 shrink-0 text-facto-gold">✓</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <BotaoAssinar
                      href={item.link}
                      variante={item.destaque ? "primario" : "secundario"}
                    >
                      {item.cta}
                    </BotaoAssinar>
                  </div>
                </CardShell>
              ))}
            </div>
          </div>
        )}

        {aba === "escritorio" && (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {(
              [
                {
                  plano: PLANO_ESCRITORIO_S,
                  mailto:
                    "mailto:factoassessoria.jur@gmail.com?subject=Escrit%C3%B3rio%20S%20FACTO",
                  cta: "Pedir Escritório S",
                },
                {
                  plano: PLANO_ESCRITORIO_M,
                  mailto:
                    "mailto:factoassessoria.jur@gmail.com?subject=Escrit%C3%B3rio%20M%20FACTO",
                  cta: "Pedir Escritório M",
                },
              ] as const
            ).map(({ plano, mailto, cta }) => (
              <CardShell key={plano.id}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-facto-gold/80">
                  Equipe · {plano.seats} assentos
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {plano.rotulo}
                </h3>
                <p className="mt-1 text-sm text-stone-500">
                  Cota em pool · OAB do administrador · estagiários sem OAB.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    {plano.rotuloPreco}
                  </span>
                  <span className="text-stone-500">{plano.rotuloPeriodo}</span>
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  ≈ {plano.custoPorPecaAprox} por peça na cota
                </p>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-stone-400">
                  {plano.beneficios.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 text-facto-gold">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <a
                    href={mailto}
                    className="block w-full rounded-lg border border-white/15 px-6 py-3.5 text-center font-semibold text-white transition hover:border-facto-gold/50 hover:bg-white/5"
                  >
                    {cta}
                  </a>
                </div>
              </CardShell>
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-xs leading-relaxed text-stone-600">
          Cotas renovam a cada ciclo. Pacotes extras (+50 / +100 peças ou +10
          análises) ficam na conta após o login — sem trocar de plano. Pagamento
          seguro via Mercado Pago. Escritório: checkout sob demanda.
        </p>

        <MetodosPagamento />
      </div>
    </section>
  );
}
