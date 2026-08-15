import Link from "next/link";
import { FactoLogo } from "@/components/brand/facto-logo";
import { LandingHeroAtmosphere } from "@/components/landing/landing-hero-atmosphere";
import { LandingHeroWatermark } from "@/components/landing/landing-hero-watermark";
import { MetodosPagamento } from "@/components/landing/metodos-pagamento";
import {
  PLANO_ANUAL,
  PLANO_JEC,
  PLANO_MENSAL,
  PLANO_PRO,
  PLANO_PRO_ANUAL,
} from "@/lib/planos-facto";

/** Links de assinatura Mercado Pago (preapproval). */
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
          <Link
            href="/login"
            className="rounded-lg border border-facto-gold/40 px-5 py-2 text-sm font-semibold text-facto-gold transition hover:bg-facto-gold hover:text-facto-dark"
          >
            Entrar
          </Link>
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
                <a
                  href="#precos"
                  className="rounded-lg bg-facto-gold px-8 py-3.5 font-semibold text-facto-dark shadow-lg shadow-facto-gold/20 transition hover:bg-[#a39a78]"
                >
                  Ver planos
                </a>
                <Link
                  href="/login"
                  className="rounded-lg border border-white/15 px-8 py-3.5 font-semibold text-white transition hover:border-facto-gold/50 hover:bg-white/5"
                >
                  Já tenho conta
                </Link>
              </div>
              <p className="max-w-md text-center text-xs leading-relaxed text-stone-500">
                A conta é liberada depois do pagamento: você recebe um e-mail
                com o link de cadastro.
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

        {/* Preços */}
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
                Cotas claras de minutas, análises de processo e 15 buscas
                externas de jurisprudência por mês. Equipe FACTO e base curada
                em todos os planos. Cancele quando quiser — sem fidelidade.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {/* JEC */}
              <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-facto-gold/80">
                  Entrada · foco JEC
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {PLANO_JEC.rotulo}
                </h3>
                <p className="mt-1 text-sm text-stone-500">
                  Para leigos e quem atua só no Juizado, sem OAB: 40 minutas/mês
                  com lastro e padrão forense.
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
              </div>

              {/* Completo mensal */}
              <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-facto-gold/80">
                  Mais escolhido
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {PLANO_MENSAL.rotulo}
                </h3>
                <p className="mt-1 text-sm text-stone-500">
                  Para advogados (OAB) · todas as áreas · 100 minutas/mês.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    {PLANO_MENSAL.rotuloPreco}
                  </span>
                  <span className="text-stone-500">{PLANO_MENSAL.rotuloPeriodo}</span>
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  ≈ {PLANO_MENSAL.custoPorPecaAprox} por peça na cota
                </p>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-stone-400">
                  {PLANO_MENSAL.beneficios.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 text-facto-gold">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <BotaoAssinar href={LINK_MENSAL}>Assinar Completo</BotaoAssinar>
                </div>
              </div>

              {/* Completo Anual */}
              <div className="relative flex flex-col rounded-2xl border border-facto-gold/40 bg-gradient-to-br from-facto-gold/[0.1] via-white/[0.04] to-transparent p-8">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-facto-gold/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-facto-dark">
                  Economia · melhor custo Completo
                </span>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-facto-gold">
                  Economia anual
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {PLANO_ANUAL.rotulo}
                </h3>
                <p className="mt-1 text-sm text-stone-400">
                  Completo o ano todo · {PLANO_ANUAL.pecasPorMes} minutas/mês ·{" "}
                  {PLANO_ANUAL.rotuloEquivalenteMensal}/mês.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    {PLANO_ANUAL.rotuloPreco}
                  </span>
                  <span className="text-stone-400">{PLANO_ANUAL.rotuloPeriodo}</span>
                </div>
                <p className="mt-1 text-sm font-medium text-facto-gold">
                  Economize {PLANO_ANUAL.rotuloEconomia}/ano · mesma cota do
                  mensal
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  ≈ {PLANO_ANUAL.custoPorPecaAprox} por peça na cota anual
                </p>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-stone-300">
                  {PLANO_ANUAL.beneficios.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 text-facto-gold">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <BotaoAssinar href={LINK_ANUAL} variante="primario">
                    Garantir desconto anual
                  </BotaoAssinar>
                </div>
              </div>

              {/* Pro mensal */}
              <div className="flex flex-col rounded-2xl border border-amber-500/30 bg-white/[0.03] p-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300/80">
                  Alto volume
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {PLANO_PRO.rotulo}
                </h3>
                <p className="mt-1 text-sm text-stone-500">
                  Para advogados (OAB) · 180 minutas/mês com prioridade na fila.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    {PLANO_PRO.rotuloPreco}
                  </span>
                  <span className="text-stone-500">{PLANO_PRO.rotuloPeriodo}</span>
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  ≈ {PLANO_PRO.custoPorPecaAprox} por peça na cota
                </p>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-stone-400">
                  {PLANO_PRO.beneficios.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 text-facto-gold">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <BotaoAssinar href={LINK_PRO}>Assinar Pro</BotaoAssinar>
                </div>
              </div>

              {/* Pro Anual */}
              <div className="relative flex flex-col rounded-2xl border border-amber-400/50 bg-gradient-to-br from-amber-500/[0.12] via-white/[0.04] to-transparent p-8 shadow-xl shadow-amber-500/10 md:col-span-2 xl:col-span-2">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-xs font-bold uppercase tracking-wide text-facto-dark">
                  Máximo volume · economia anual
                </span>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300/90">
                  Escritório em escala
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {PLANO_PRO_ANUAL.rotulo}
                </h3>
                <p className="mt-1 text-sm text-stone-400">
                  {PLANO_PRO_ANUAL.pecasPorMes} minutas/mês o ano todo ·{" "}
                  {PLANO_PRO_ANUAL.rotuloEquivalenteMensal}/mês — prioridade e
                  pesquisa reforçada.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    {PLANO_PRO_ANUAL.rotuloPreco}
                  </span>
                  <span className="text-stone-400">
                    {PLANO_PRO_ANUAL.rotuloPeriodo}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-amber-300">
                  Economize {PLANO_PRO_ANUAL.rotuloEconomia}/ano · mesma cota do
                  Pro mensal
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  ≈ {PLANO_PRO_ANUAL.custoPorPecaAprox} por peça na cota anual
                </p>
                <ul className="mt-6 grid flex-1 gap-3 text-sm text-stone-300 sm:grid-cols-2">
                  {PLANO_PRO_ANUAL.beneficios.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 text-amber-300">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 max-w-sm">
                  <BotaoAssinar href={LINK_PRO_ANUAL} variante="primario">
                    Assinar Pro anual
                  </BotaoAssinar>
                </div>
              </div>
            </div>

            <p className="mt-8 text-center text-xs leading-relaxed text-stone-600">
              Cotas renovam a cada ciclo. Precisou de mais? Pacotes extras de
              peças (+50 ou +100) e de análises (+10) ficam na conta após o
              login — sem trocar de plano. Pagamento seguro via Mercado Pago.
            </p>

            <MetodosPagamento />
          </div>
        </section>
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
