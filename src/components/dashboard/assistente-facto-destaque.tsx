function IconeChipProcessador({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      {/* Corpo do chip */}
      <rect
        x="7"
        y="7"
        width="10"
        height="10"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Die interno */}
      <rect
        x="9.5"
        y="9.5"
        width="5"
        height="5"
        rx="0.6"
        fill="currentColor"
        opacity="0.85"
      />
      {/* Pinos — top */}
      <path
        d="M10 7V4.5M14 7V4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Pinos — bottom */}
      <path
        d="M10 17v2.5M14 17v2.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Pinos — left */}
      <path
        d="M7 10H4.5M7 14H4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Pinos — right */}
      <path
        d="M17 10h2.5M17 14h2.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Chip compacto no hero da home — presença de IA sem faixa larga. */
export function AssistenteFactoDestaque({ leigo = false }: { leigo?: boolean }) {
  void leigo;
  return (
    <div
      className="group relative inline-flex max-w-full items-center gap-2.5 rounded-full border border-facto-gold/40 bg-gradient-to-r from-facto-gold/[0.16] via-white/[0.05] to-facto-gold/[0.1] px-3.5 py-2 shadow-[0_0_28px_-10px_rgba(144,139,106,0.55)] backdrop-blur-sm"
      role="status"
      aria-label="Assistente Facto IA"
    >
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
        <span
          className="assistente-ia-pulse pointer-events-none absolute inset-0 rounded-full bg-facto-gold/30"
          aria-hidden
        />
        <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-facto-gold/50 bg-[#1c1c16]/90 text-facto-gold shadow-inner shadow-facto-gold/20 transition group-hover:border-facto-gold/80">
          <IconeChipProcessador className="h-4 w-4" />
        </span>
      </span>

      <div className="min-w-0 pr-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-facto-gold/85">
          Assinatura FACTO
        </p>
        <p className="text-sm font-semibold leading-tight text-white">
          Assistente Facto{" "}
          <span className="assistente-ia-shimmer">IA</span>
        </p>
        <p className="mt-0.5 truncate text-[11px] text-stone-500">
          acelera seu processo
        </p>
      </div>
    </div>
  );
}
