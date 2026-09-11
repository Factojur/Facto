import Link from "next/link";
import { FactoLogo } from "@/components/brand/facto-logo";
import { ContadorJurisLanding } from "@/components/landing/contador-juris-landing";
import { LandingHeroAtmosphere } from "@/components/landing/landing-hero-atmosphere";
import { LandingHeroWatermark } from "@/components/landing/landing-hero-watermark";
import { LandingPrecos } from "@/components/landing/landing-precos";
import {
  LandingScrollHome,
  LandingSecaoLink,
} from "@/components/landing/landing-scroll";
import { PLANO_TRIAL } from "@/lib/planos-facto";

/**
 * Landing comercial — fluxo AIDA:
 * Attention (hero) → Interest (por quê) → Desire (como + desejo) → Action (planos/CTA).
 */

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

function IconeTom({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 19V5h10v14H4z" strokeLinejoin="round" />
      <path d="M14 8h6v11h-6" strokeLinejoin="round" />
      <path d="M7 9h4M7 13h4M7 17h2" strokeLinecap="round" />
    </svg>
  );
}

/** Interest — benefícios que prendem a atenção no problema real do advogado. */
const BENEFICIOS = [
  {
    icone: IconeRelogio,
    titulo: "Sai da página em branco",
    texto:
      "Você narra o caso. O FACTO monta o plano e a peça — você revisa e protocola, em vez de reescrever do zero.",
  },
  {
    icone: IconeBalanca,
    titulo: "Lastro que dá segurança",
    texto:
      "Súmulas e julgados da base FACTO em expansão (ou os que você anexa). O que não tem lastro não é inventado para “parecer jurídico”.",
  },
  {
    icone: IconeTom,
    titulo: "Tom do escritório (parâmetro)",
    texto:
      "Preferência de tom e forma — serve de parâmetro ao assistente, sem engessar a redação. Você decide quando usar; o rito e os autos prevalecem.",
  },
  {
    icone: IconeDocumento,
    titulo: "Pronta para revisar e baixar",
    texto:
      "Word ou PDF no padrão forense. A caneta final é sua; o FACTO acelera o caminho até o protocolo.",
  },
] as const;

/** Desire — jornada que torna o resultado desejável e concreto. */
const PASSOS = [
  {
    passo: "01",
    titulo: "Conte o caso uma vez",
    texto:
      "Chat, PDF ou Word. O assistente organiza fatos, partes e rito e mostra o plano do caso.",
  },
  {
    passo: "02",
    titulo: "Confirme e a equipe redige",
    texto:
      "No chat FACTO, Analista, Pesquisa e Redator estruturam a peça com lastro da base — no tom do seu perfil.",
  },
  {
    passo: "03",
    titulo: "Revise, exporte, protocole",
    texto:
      "Ajuste o concreto do caso, baixe Word ou PDF e protocole fora do FACTO. Rápido o suficiente para o prazo; sério o suficiente para o juízo.",
  },
] as const;

export function LandingPage({
  totalLastro = 0,
}: {
  totalLastro?: number;
}) {
  return (
    <div className="relative bg-facto-dark">
      <LandingScrollHome />
      <header className="sticky top-0 z-30 border-b border-white/10 bg-facto-dark/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <FactoLogo variant="horizontal" size="sm" />
          <nav className="hidden items-center gap-8 text-sm font-medium text-stone-300 md:flex">
            <LandingSecaoLink
              secaoId="beneficios"
              className="transition hover:text-white"
            >
              Por que o FACTO
            </LandingSecaoLink>
            <LandingSecaoLink
              secaoId="como-funciona"
              className="transition hover:text-white"
            >
              Como funciona
            </LandingSecaoLink>
            <LandingSecaoLink
              secaoId="precos"
              className="transition hover:text-white"
            >
              Planos
            </LandingSecaoLink>
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
        {/* A — Attention */}
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
              Conte o caso no assistente FACTO — plano do caso, redação com
              lastro da base curada e peça em Word ou PDF para revisar e
              protocolar.
            </p>

            <ContadorJurisLanding total={totalLastro} />

            <div className="mt-10 flex flex-col items-center gap-3">
              <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:justify-center">
                <Link
                  href="/trial"
                  className="rounded-lg bg-facto-gold px-8 py-3.5 font-semibold text-facto-dark shadow-lg shadow-facto-gold/20 transition hover:bg-[#a39a78]"
                >
                  Teste grátis · 7 dias
                </Link>
                <LandingSecaoLink
                  secaoId="precos"
                  className="rounded-lg border border-white/15 px-8 py-3.5 font-semibold text-white transition hover:border-facto-gold/50 hover:bg-white/5"
                >
                  Ver planos
                </LandingSecaoLink>
              </div>
              <p className="max-w-md text-center text-xs leading-relaxed text-stone-500">
                Teste: todas as áreas · {PLANO_TRIAL.pecasPorMes} peças · plano do
                caso incluso. Export Word/PDF nos planos pagos.
              </p>
            </div>
          </div>
        </section>

        {/* I — Interest */}
        <section id="beneficios" className="relative px-6 py-20 md:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-facto-gold">
                Por que o FACTO
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
                Assistente, lastro e o tom da sua bancada
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-stone-500 md:text-base">
                O FACTO não substitui o advogado: organiza o caso, fundamenta
                com a base curada e redige a peça para você revisar — com
                Assistente FACTO e o estilo do escritório como parâmetro.
              </p>
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

        {/* D — Desire */}
        <section id="como-funciona" className="relative px-6 py-20 md:px-10">
          <div className="mx-auto max-w-7xl rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-12">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-facto-gold">
                Como funciona
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
                Do relato à peça — com assistente e lastro
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-stone-500 md:text-base">
                Assistente primeiro: você narra o caso; o FACTO monta o plano e
                gera sua peça completa, pronta para conferência.
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

            <div className="mt-12 flex flex-col items-center gap-3 border-t border-white/10 pt-10 text-center">
              <p className="max-w-lg text-sm text-stone-400 md:text-base">
                Pronto para experimentar no seu próximo caso?
              </p>
              <Link
                href="/trial"
                className="rounded-lg bg-facto-gold px-7 py-3 text-sm font-semibold text-facto-dark transition hover:bg-[#a39a78]"
              >
                Teste grátis · 7 dias
              </Link>
            </div>
          </div>
        </section>

        {/* A — Action */}
        <LandingPrecos />
      </main>

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
            <Link href="/trial" className="hover:text-stone-300">
              Teste grátis
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
