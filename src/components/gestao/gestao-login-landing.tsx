import { FactoLogo } from "@/components/brand/facto-logo";
import { FACTO_TAGLINE } from "@/components/brand/facto-logo";
import { GestaoLoginForm } from "@/components/gestao/gestao-login-form";
import { Suspense } from "react";

function GestaoLoginFormSuspense({ convite }: { convite?: string | null }) {
  return (
    <Suspense
      fallback={<p className="text-sm text-stone-500">Carregando…</p>}
    >
      <GestaoLoginForm convite={convite} />
    </Suspense>
  );
}

const DESTAQUES = [
  {
    titulo: "Prazos sob controle",
    texto:
      "Vencidos, hoje e na semana — o que o advogado precisa ver ao abrir o dia.",
    icon: "⏱",
  },
  {
    titulo: "Agenda do escritório",
    texto: "Audiências, perícias, CEJUSC e reuniões com clientes num só lugar.",
    icon: "📅",
  },
  {
    titulo: "Processos e equipe",
    texto:
      "Pastas por área, clientes, honorários de referência e convites para sócios e colaboradores.",
    icon: "📁",
  },
  {
    titulo: "Módulo independente",
    texto:
      "Desenvolvido em paralelo ao FACTO de minutas — sem compartilhar login ou navegação.",
    icon: "⚖",
  },
] as const;

export function GestaoLoginLanding({ convite }: { convite?: string | null }) {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="mx-auto grid min-h-screen max-w-6xl lg:grid-cols-2">
        <div className="relative flex flex-col justify-center px-6 py-12 lg:px-10">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(163,154,120,0.12),_transparent_55%)]"
            aria-hidden
          />
          <FactoLogo variant="stacked" size="sm" className="relative" />
          <p className="relative mt-6 text-xs font-medium uppercase tracking-[0.25em] text-facto-gold">
            FACTO Gestão
          </p>
          <h1 className="relative mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
            A operação do escritório
          </h1>
          <p className="relative mt-4 max-w-md text-sm leading-relaxed text-stone-400">
            {FACTO_TAGLINE} na redação de peças; aqui, o dia a dia do
            escritório: prazos, audiências, processos e equipe.
          </p>

          <ul className="relative mt-8 space-y-4 lg:hidden">
            {DESTAQUES.slice(0, 2).map((d) => (
              <li key={d.titulo} className="text-sm text-stone-500">
                <span className="font-medium text-stone-300">{d.titulo}</span>
                {" — "}
                {d.texto}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-center border-t border-stone-800 bg-stone-900/40 px-6 py-12 lg:border-l lg:border-t-0 lg:px-10">
          <div className="mx-auto w-full max-w-md">
            <GestaoLoginFormSuspense convite={convite} />
          </div>

          <div className="mx-auto mt-10 hidden w-full max-w-md lg:block">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
              No painel
            </h2>
            <ul className="mt-4 space-y-3">
              {DESTAQUES.map((d) => (
                <li
                  key={d.titulo}
                  className="rounded-xl border border-stone-800/80 bg-stone-950/50 p-3 text-sm"
                >
                  <p className="font-medium text-stone-200">{d.titulo}</p>
                  <p className="mt-1 text-stone-500">{d.texto}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
