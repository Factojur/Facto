import Link from "next/link";
import { FactoLogo } from "@/components/brand/facto-logo";
import { FACTO_TAGLINE } from "@/components/brand/facto-logo";

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
    titulo: "Separado das minutas",
    texto:
      "Gestão não consome cota de peça. Minutas FACTO abrem em outra aba quando precisar.",
    icon: "⚖",
  },
] as const;

export function GestaoLoginLanding() {
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
            A operação do escritório, com a cara do FACTO
          </h1>
          <p className="relative mt-4 max-w-md text-sm leading-relaxed text-stone-400">
            {FACTO_TAGLINE} na redação de peças; aqui, o que importa no dia a
            dia: prazos, audiências, processos e equipe — sem misturar com o
            módulo de minutas.
          </p>

          <div className="relative mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/login?destino=gestao"
              className="inline-flex items-center justify-center rounded-xl bg-facto-gold px-6 py-3 text-sm font-semibold text-facto-dark shadow-lg shadow-facto-gold/10 transition hover:bg-[#b8ae8a]"
            >
              Entrar na gestão
            </Link>
            <Link
              href="/login?destino=gestao"
              className="inline-flex items-center justify-center rounded-xl border border-stone-700 px-6 py-3 text-sm font-medium text-stone-300 transition hover:border-facto-gold/40 hover:text-facto-gold"
            >
              Criar conta FACTO
            </Link>
          </div>

          <p className="relative mt-6 text-xs text-stone-600">
            Ambiente local / testes — não publicado em produção sem flag explícita.
          </p>
        </div>

        <div className="flex flex-col justify-center border-t border-stone-800 bg-stone-900/40 px-6 py-12 lg:border-l lg:border-t-0 lg:px-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
            O que você acompanha no painel
          </h2>
          <ul className="mt-6 space-y-5">
            {DESTAQUES.map((d) => (
              <li
                key={d.titulo}
                className="flex gap-4 rounded-xl border border-stone-800/80 bg-stone-950/50 p-4"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-facto-gold/10 text-lg"
                  aria-hidden
                >
                  {d.icon}
                </span>
                <div>
                  <p className="font-medium text-stone-100">{d.titulo}</p>
                  <p className="mt-1 text-sm text-stone-500">{d.texto}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-xl border border-facto-gold/20 bg-facto-gold/5 p-4 text-sm text-stone-300">
            <p className="font-medium text-facto-gold">Titular ou sócio</p>
            <p className="mt-1 text-stone-400">
              Após o login, crie o escritório ou aceite o convite do
              administrador. Colaboradores entram só na gestão — sem plano de
              minutas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
