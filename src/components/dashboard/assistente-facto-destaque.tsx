function IconeIA({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <path
        d="M12 3.5l1.15 3.55H17l-2.9 2.1 1.1 3.55L12 10.7 8.8 12.7l1.1-3.55L7 7.05h3.85L12 3.5z"
        fill="currentColor"
      />
      <path
        d="M18.5 14.5l.55 1.7H21l-1.4 1 .55 1.7-1.4-1-1.4 1 .55-1.7-1.4-1h1.95l.55-1.7z"
        fill="currentColor"
        opacity="0.75"
      />
      <path
        d="M5.2 15.2l.4 1.2H7l-1 0.75.4 1.2-1-.75-1 .75.4-1.2-1-.75h1.4l.4-1.2z"
        fill="currentColor"
        opacity="0.55"
      />
    </svg>
  );
}

/** Chip compacto no hero da home — presença de IA sem faixa larga. */
export function AssistenteFactoDestaque({ leigo = false }: { leigo?: boolean }) {
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
          <IconeIA className="h-4 w-4" />
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
          {leigo
            ? "Orienta a minuta no JEC"
            : "Orienta a minuta nesta área"}
        </p>
      </div>
    </div>
  );
}
