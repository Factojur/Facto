"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BotaoAssinarPlano } from "@/components/landing/botao-assinar-plano";
import { MetodosPagamento } from "@/components/landing/metodos-pagamento";
import {
  PLANO_ANUAL,
  PLANO_ESCRITORIO_M,
  PLANO_ESCRITORIO_M_ANUAL,
  PLANO_ESCRITORIO_S,
  PLANO_ESCRITORIO_S_ANUAL,
  PLANO_JEC,
  PLANO_MENSAL,
  PLANO_PRO,
  PLANO_PRO_ANUAL,
  PLANO_TRIAL,
} from "@/lib/planos-facto";
import { ESCRITORIO_VENDA_ATIVA } from "@/lib/feature-flags";

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
  {
    id: "escritorio",
    rotulo: "Escritório",
    dica: ESCRITORIO_VENDA_ATIVA ? "Assentos em equipe" : "Fale conosco",
  },
];

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
    <div className={`plano-card-wrap ${className}`}>
      {destaque && (
        <span
          className="plano-card-glow-orb -right-10 -top-10 h-36 w-36 rounded-full bg-facto-gold/25 blur-3xl"
          aria-hidden
        />
      )}
      <div
        className={`plano-card-inner flex flex-col rounded-2xl border p-8 ${
          destaque
            ? "border-facto-gold/55 bg-gradient-to-br from-facto-gold/[0.22] via-[#2a261c]/90 to-[#16140f] shadow-[0_0_40px_-8px_rgba(196,191,154,0.55),0_0_80px_-20px_rgba(144,139,106,0.4)] ring-1 ring-facto-gold/35"
            : "border-white/10 bg-white/[0.03]"
        }`}
      >
        {children}
      </div>
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
          sub: "Para advogados (OAB) · todas as áreas · 100 peças/mês.",
          destaque: true,
        }
      : {
          plano: PLANO_ANUAL,
          link: LINK_ANUAL,
          cta: "Garantir desconto anual",
          eyebrow: "Economia anual",
          sub: `Completo o ano todo · ${PLANO_ANUAL.pecasPorMes} peças/mês · ${PLANO_ANUAL.rotuloEquivalenteMensal}/mês.`,
          destaque: true,
        };

  const pro =
    ciclo === "mensal"
      ? {
          plano: PLANO_PRO,
          link: LINK_PRO,
          cta: "Assinar Pro",
          eyebrow: "Alto volume",
          sub: "Para advogados (OAB) · 200 peças/mês com prioridade na fila.",
          destaque: false as boolean,
        }
      : {
          plano: PLANO_PRO_ANUAL,
          link: LINK_PRO_ANUAL,
          cta: "Assinar Pro anual",
          eyebrow: "Máximo volume · economia",
          sub: `${PLANO_PRO_ANUAL.pecasPorMes} peças/mês o ano todo · ${PLANO_PRO_ANUAL.rotuloEquivalenteMensal}/mês.`,
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
            Peças com cotas claras. Assistente com plano do caso — a Minuta
            (peça completa) consome a cota do plano. Cancele quando quiser — sem
            fidelidade.
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
                1 área · {PLANO_TRIAL.pecasPorMes} peças no assistente · 7 dias ·
                export limpo.
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
                Para a própria parte no Juizado — sem OAB: assistente + 40
                peças/mês com lastro e padrão forense.
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
                <BotaoAssinarPlano planoId="jec" hrefFallback={LINK_JEC}>
                  Começar no JEC
                </BotaoAssinarPlano>
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
                    <BotaoAssinarPlano
                      planoId={item.plano.id}
                      hrefFallback={item.link}
                      variante={item.destaque ? "primario" : "secundario"}
                    >
                      {item.cta}
                    </BotaoAssinarPlano>
                  </div>
                </CardShell>
              ))}
            </div>
          </div>
        )}

        {aba === "escritorio" && !ESCRITORIO_VENDA_ATIVA && (
          <div className="mt-10">
            <CardShell destaque className="mx-auto max-w-xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-facto-gold/80">
                Equipe · sob consulta
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                Planos Escritório
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-400">
                Assentos em equipe, cota em pool e OAB do administrador. Os
                valores e a forma de pagamento são definidos sob medida — entre
                em contato para verificar planos e valores.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-stone-400">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-facto-gold">✓</span>
                  <span>5 ou 10 assentos (sócios, estagiários, equipe)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-facto-gold">✓</span>
                  <span>Cota mensal compartilhada do escritório</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-facto-gold">✓</span>
                  <span>Todas as áreas liberadas ao responsável com OAB</span>
                </li>
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="mailto:contato@factoia.com.br?subject=FACTO%20Escrit%C3%B3rio%20%E2%80%94%20planos%20e%20valores"
                  className="block flex-1 rounded-lg bg-facto-gold px-6 py-3.5 text-center font-semibold text-facto-dark transition hover:bg-[#a39a78]"
                >
                  Entre em contato
                </a>
                <Link
                  href="/suporte?motivo=escritorio"
                  className="block flex-1 rounded-lg border border-white/15 px-6 py-3.5 text-center font-semibold text-white transition hover:border-facto-gold/50 hover:bg-white/5"
                >
                  Formulário de suporte
                </Link>
              </div>
              <p className="mt-4 text-center text-xs text-stone-500">
                contato@factoia.com.br
              </p>
            </CardShell>
          </div>
        )}

        {aba === "escritorio" && ESCRITORIO_VENDA_ATIVA && (
          <div className="mt-10">
            <div className="mb-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
                Cobrança
              </p>
              <div
                className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1"
                role="group"
                aria-label="Mensal ou anual escritório"
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
                    2 meses off
                  </span>
                </button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {(ciclo === "mensal"
                ? [
                    {
                      plano: PLANO_ESCRITORIO_S,
                      fallback:
                        "mailto:factoassessoria.jur@gmail.com?subject=Escrit%C3%B3rio%20S%20FACTO",
                      cta: "Assinar Escritório S",
                    },
                    {
                      plano: PLANO_ESCRITORIO_M,
                      fallback:
                        "mailto:factoassessoria.jur@gmail.com?subject=Escrit%C3%B3rio%20M%20FACTO",
                      cta: "Assinar Escritório M",
                    },
                  ]
                : [
                    {
                      plano: PLANO_ESCRITORIO_S_ANUAL,
                      fallback:
                        "mailto:factoassessoria.jur@gmail.com?subject=Escrit%C3%B3rio%20S%20Anual%20FACTO",
                      cta: "Assinar Escritório S anual",
                    },
                    {
                      plano: PLANO_ESCRITORIO_M_ANUAL,
                      fallback:
                        "mailto:factoassessoria.jur@gmail.com?subject=Escrit%C3%B3rio%20M%20Anual%20FACTO",
                      cta: "Assinar Escritório M anual",
                    },
                  ]
              ).map(({ plano, fallback, cta }) => (
                <CardShell key={plano.id} destaque={ciclo === "anual"}>
                  {ciclo === "anual" && "rotuloEconomia" in plano && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-facto-gold/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-facto-dark">
                      Economize {plano.rotuloEconomia}/ano
                    </span>
                  )}
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
                  {"rotuloEquivalenteMensal" in plano && (
                    <p className="mt-1 text-sm font-medium text-facto-gold">
                      Equivale a {plano.rotuloEquivalenteMensal}/mês
                    </p>
                  )}
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
                    <BotaoAssinarPlano
                      planoId={plano.id}
                      hrefFallback={fallback}
                      variante={ciclo === "anual" ? "primario" : "secundario"}
                    >
                      {cta}
                    </BotaoAssinarPlano>
                  </div>
                </CardShell>
              ))}
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-xs leading-relaxed text-stone-600">
          Cotas renovam a cada ciclo. Conta logada: checkout com vínculo
          automático à sua conta (mesmo pagando com outro e-mail no Mercado
          Pago). Visitante: use o e-mail da conta FACTO no pagamento. Pacotes
          extras ficam após o login. Pagamento seguro via Mercado Pago.
        </p>

        <MetodosPagamento />
      </div>
    </section>
  );
}
