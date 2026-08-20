import Link from "next/link";
import { FactoLogo } from "@/components/brand/facto-logo";
import { LandingHeroAtmosphere } from "@/components/landing/landing-hero-atmosphere";
import { LandingHeroWatermark } from "@/components/landing/landing-hero-watermark";
import { LandingPrecos } from "@/components/landing/landing-precos";
import { PLANO_TRIAL } from "@/lib/planos-facto";

function IconeRelogio({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconeBalanca({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 3v18M7 21h10" strokeLinecap="round" />
      <path d="M4 7h6M14 7h6" strokeLinecap="round" />
      <path d="M4 7l-2.5 5a2.5 2.5 0 005 0L4 7zM20 7l-2.5 5a2.5 2.5 0 005 0L20 7z" strokeLinejoin="round" />
    </svg>
  );
}

function IconeDocumento({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M8 4h8l4 4v12H8V4z" strokeLinejoin="round" />
      <path d="M16 4v4h4M10 13h6M10 17h4" strokeLinecap="round" />
    </svg>
  );
}

function IconeCadeado({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" strokeLinecap="round" />
    </svg>
  );
}

const BENEFICIOS = [
  {
    icone: IconeRelogio,
    titulo: "Economize horas de trabalho",
    texto:
      "O que levaria horas de redação, o FACTO estrutura em minutos — fundamentos, pedidos e narrativa dos fatos prontos para revisão.",
  },
  {
    icone: IconeBalanca,
    titulo: "Fundamentos com lastro",
    texto:
      "Súmulas e julgados da base FACTO ou upload de sua preferência; o que não tiver lastro não é inventado.",
  },
  {
    icone: IconeDocumento,
    titulo: "Padrão forense",
    texto:
      "Peças em Word ou PDF no padrão do escritório; revise tipografia e detalhes do caso antes de protocolar.",
  },
  {
    icone: IconeCadeado,
    titulo: "Seus dados, sua confidencialidade",
    texto:
      "Ambiente privado para tratar o caso. O FACTO não armazena a peça gerada: baixe o Word ou PDF e guarde na sua pasta ou nuvem — a preservação é sua.",
  },
] as const;

const PASSOS = [
  {
    passo: "01",
    titulo: "Descreva o caso em minutos",
    texto:
      "Descreva o caso, analise o processo ou deixe o Assistente indicar a peça. Partes, fatos e pedidos no formulário guiado — sem minuta em branco.",
  },
  {
    passo: "02",
    titulo: "A equipe FACTO redige com lastro",
    texto:
      "Analista, Pesquisa e Redator estruturam a peça: fundamentos cruzam súmulas da base curada e a minuta sai em padrão forense — pronta para a sua revisão.",
  },
  {
    passo: "03",
    titulo: "Revise, baixe e protocole",
    texto:
      "Exporte em Word ou PDF, ajuste o que for do caso concreto e protocole. O FACTO acelera a redação; a caneta final continua sendo sua.",
  },
] as const;

export function LandingPage() {
  return (
    <div className="relative bg-facto-dark">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-facto-dark/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <FactoLogo variant="horizontal" size="sm" />
          <nav className="hidden items-center gap-8 text-sm font-medium text-stone-300 md:flex">
            <a href="#beneficios" className="transition hover:text-white">
              Por que o FACTO
            </a>
            <a href="#como-funciona" className="transition hover:text-white">
              Como funciona
            </a>
            <a href="#precos" className="transition hover:text-white">
              Preços
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/trial"
              className="hidden rounded-lg bg-facto-gold px-4 py-2 text-sm font-semibold text-facto-dark transition hover:bg-amber-300 sm:inline-flex"
            >
              Teste grátis
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-facto-gold/40 px-5 py-2 text-sm font-semibold text-facto-gold transition hover:bg-facto-gold hover:text-facto-dark"
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-6 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(144,139,106,0.18),transparent_60%)]"
            aria-hidden
          />
          <LandingHeroAtmosphere />
          <LandingHeroWatermark />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <FactoLogo variant="stacked" size="sm" className="mx-auto" />
            <span className="mt-6 inline-flex items-center rounded-full border border-facto-gold/30 bg-facto-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-facto-gold">
              Inteligência Jurídica
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.1] text-white sm:text-5xl md:text-6xl">
              A Inteligência Artificial que{" "}
              <span className="text-facto-gold">redige suas peças jurídicas</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-stone-400">
              O FACTO economiza horas da sua rotina, fundamenta com súmulas da
              base curada e entrega peças em padrão forense (Word ou PDF) —
              minuta para você revisar e protocolar.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3">
              <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:justify-center">
                <Link
                  href="/trial"
                  className="rounded-lg bg-facto-gold px-8 py-3.5 font-semibold text-facto-dark shadow-lg shadow-facto-gold/20 transition hover:bg-[#a39a78]"
                >
                  Teste grátis · 7 dias
                </Link>
                <a
                  href="#precos"
                  className="rounded-lg border border-white/15 px-8 py-3.5 font-semibold text-white transition hover:border-facto-gold/50 hover:bg-white/5"
                >
                  Ver planos
                </a>
              </div>
              <p className="max-w-md text-center text-xs leading-relaxed text-stone-500">
                Teste: 1 área e {PLANO_TRIAL.pecasPorMes} minutas com marca
                d’água. Planos pagos liberam a conta pelo e-mail após o
                pagamento.
              </p>
            </div>
          </div>
        </section>

        {/* Benefícios */}
        <section id="beneficios" className="relative px-6 py-20 md:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-facto-gold">
                Por que o FACTO
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
                Tecnologia a serviço da sua advocacia
              </h2>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {BENEFICIOS.map(({ icone: Icone, titulo, texto }) => (
                <article
                  key={titulo}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-facto-gold/30 hover:bg-white/[0.05]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-facto-gold/10 text-facto-gold">
                    <Icone className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-semibold text-white">{titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-500">
                    {texto}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section id="como-funciona" className="relative px-6 py-20 md:px-10">
          <div className="mx-auto max-w-7xl rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-12">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-facto-gold">
                Como funciona
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
                Do caso à minuta — rápido, lastreado e sob o seu controle
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-stone-500 md:text-base">
                Três passos pensados para a bancada: menos tempo na estrutura,
                mais segurança na fundamentação, você na revisão.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {PASSOS.map((item) => (
                <div key={item.passo} className="text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-facto-gold/30 bg-facto-gold/10 font-mono text-sm font-bold text-facto-gold">
                    {item.passo}
                  </span>
                  <h3 className="mt-4 font-semibold text-white">{item.titulo}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-stone-500">
                    {item.texto}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <LandingPrecos />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-10 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <FactoLogo variant="horizontal" size="sm" />
          <nav className="flex flex-wrap items-center justify-center gap-4 text-xs text-stone-500">
            <Link href="/privacidade" className="hover:text-stone-300">
              Privacidade
            </Link>
            <Link href="/termos" className="hover:text-stone-300">
              Termos de uso
            </Link>
          </nav>
          <p className="text-xs text-stone-600">
            © 2026 FACTO. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
