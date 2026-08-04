import Link from "next/link";
import { FactoLogo } from "@/components/brand/facto-logo";
import { JusticaWatermark } from "@/components/dashboard/justica-watermark";
import { MetodosPagamento } from "@/components/landing/metodos-pagamento";

const LINK_MENSAL = "https://mpago.la/2jsFX7w";
const LINK_ANUAL = "https://mpago.la/26yzsZT";

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
    titulo: "Jurisprudência sempre atualizada",
    texto:
      "A IA já traz entendimentos e precedentes recentes aplicados ao seu caso, sem você precisar garimpar tribunais.",
  },
  {
    icone: IconeDocumento,
    titulo: "Formatação impecável",
    texto:
      "Peças formatadas em padrão jurídico, exportáveis em Word ou PDF, prontas para protocolar sem retrabalho.",
  },
  {
    icone: IconeCadeado,
    titulo: "Seus dados, sua confidencialidade",
    texto:
      "Ambiente seguro e privado para tratar informações sensíveis de clientes e processos.",
  },
] as const;

const PASSOS = [
  {
    passo: "01",
    titulo: "Descreva o caso",
    texto: "Partes, fatos, pedidos e provas em um formulário guiado — sem começar do zero.",
  },
  {
    passo: "02",
    titulo: "O FACTO redige",
    texto: "A Inteligência Artificial estrutura fundamentos e redige a peça com rigor jurídico.",
  },
  {
    passo: "03",
    titulo: "Revise e protocole",
    texto: "Baixe em Word ou PDF, formatado e pronto para protocolar no seu processo.",
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
              Método de assistência
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
          <JusticaWatermark className="pointer-events-none absolute bottom-0 right-0 z-0 h-[min(48vh,460px)] w-[min(48vh,460px)] translate-x-[10%] translate-y-[15%] opacity-[0.16] md:opacity-[0.22]" />

          <div className="relative mx-auto max-w-3xl text-center">
            <FactoLogo variant="stacked" size="sm" className="mx-auto" />
            <span className="mt-6 inline-flex items-center rounded-full border border-facto-gold/30 bg-facto-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-facto-gold">
              Inteligência Jurídica
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.1] text-white sm:text-5xl md:text-6xl">
              A Inteligência Artificial que{" "}
              <span className="text-facto-gold">redige suas peças jurídicas</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-stone-400">
              O FACTO economiza horas da sua rotina, traz jurisprudência
              atualizada e entrega peças com formatação impecável — prontas
              para protocolar.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <a
                href="#precos"
                className="rounded-lg bg-facto-gold px-8 py-3.5 font-semibold text-facto-dark shadow-lg shadow-facto-gold/20 transition hover:bg-[#a39a78]"
              >
                Ver planos
              </a>
              <Link
                href="/cadastro"
                className="rounded-lg border border-white/15 px-8 py-3.5 font-semibold text-white transition hover:border-facto-gold/50 hover:bg-white/5"
              >
                Criar conta
              </Link>
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
                Do caso à peça pronta em 3 passos
              </h2>
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
          <div className="mx-auto max-w-4xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-facto-gold">
                Planos
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
                Escolha como quer assinar
              </h2>
              <p className="mt-4 text-stone-400">
                Cancele quando quiser. Sem contrato de fidelidade.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-2">
              {/* Mensal */}
              <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8">
                <h3 className="text-lg font-semibold text-white">Plano Mensal</h3>
                <p className="mt-1 text-sm text-stone-500">
                  Flexibilidade total, mês a mês.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">R$ 49,90</span>
                  <span className="text-stone-500">/mês</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-stone-400">
                  <li className="flex items-center gap-2">
                    <span className="text-facto-gold">✓</span> Acesso completo ao FACTO
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-facto-gold">✓</span> Peças jurídicas ilimitadas
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-facto-gold">✓</span> Cancele quando quiser
                  </li>
                </ul>
                <div className="mt-8">
                  <BotaoAssinar href={LINK_MENSAL}>Assinar mensal</BotaoAssinar>
                </div>
              </div>

              {/* Anual */}
              <div className="relative flex flex-col rounded-2xl border border-facto-gold/50 bg-gradient-to-br from-facto-gold/[0.14] via-white/[0.04] to-transparent p-8 shadow-xl shadow-facto-gold/10 md:scale-[1.03]">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-facto-gold px-4 py-1 text-xs font-bold uppercase tracking-wide text-facto-dark">
                  Melhor custo-benefício
                </span>
                <h3 className="text-lg font-semibold text-white">Plano Anual</h3>
                <p className="mt-1 text-sm text-stone-400">
                  Equivalente a R$ 39,90/mês.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">R$ 478,80</span>
                  <span className="text-stone-400">/ano</span>
                </div>
                <p className="mt-1 text-sm font-medium text-facto-gold">
                  Economize R$ 120,00 por ano
                </p>
                <ul className="mt-6 space-y-3 text-sm text-stone-300">
                  <li className="flex items-center gap-2">
                    <span className="text-facto-gold">✓</span> Acesso completo ao FACTO
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-facto-gold">✓</span> Peças jurídicas ilimitadas
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-facto-gold">✓</span> Melhor preço por mês
                  </li>
                </ul>
                <div className="mt-8">
                  <BotaoAssinar href={LINK_ANUAL} variante="primario">
                    Assinar anual
                  </BotaoAssinar>
                </div>
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-stone-600">
              Pagamento processado com segurança pelo Mercado Pago. Após a
              confirmação, seu acesso é liberado automaticamente.
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
