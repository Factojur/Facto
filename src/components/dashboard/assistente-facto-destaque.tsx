function IconeIA({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <path
        d="M24 6l2.5 7.5H34l-6 4.5 2.5 7.5L24 21l-6.5 4.5 2.5-7.5-6-4.5h7.5L24 6z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M10 32c4-6 10-9 14-9s10 3 14 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <circle cx="24" cy="28" r="3" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

export function AssistenteFactoDestaque() {
  return (
    <section className="relative px-6 md:px-10">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl border border-facto-gold/35 bg-gradient-to-br from-facto-gold/[0.14] via-white/[0.04] to-transparent shadow-lg shadow-black/20">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-facto-gold/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-facto-gold/10 blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-facto-gold">
              Assinatura FACTO
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
              Assistente Facto{" "}
              <span className="text-facto-gold">(IA)</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-400 md:text-base">
              Inteligência jurídica presente em todas as áreas — orienta a
              redação, sugere fundamentos e acelera cada peça do início ao
              protocolo.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-facto-gold/40 bg-facto-gold/10 text-facto-gold shadow-inner shadow-facto-gold/10">
              <IconeIA className="h-9 w-9" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-white">Em todas as áreas</p>
              <p className="mt-0.5 text-xs text-stone-500">
                JEC, trabalhista, cível e mais
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
