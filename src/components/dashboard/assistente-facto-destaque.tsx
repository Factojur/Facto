/** Chip de processador com trilhas/neurônios — presença de IA no hero. */
export function AssistenteFactoDestaque({ leigo = false }: { leigo?: boolean }) {
  void leigo;

  return (
    <div
      className="assistente-chip-root group relative isolate inline-flex max-w-full select-none px-5 py-4"
      role="status"
      aria-label="Assistente Facto IA"
    >
      {/* Halo externo pulsante */}
      <span
        className="assistente-chip-halo pointer-events-none absolute left-1/2 top-1/2 h-[72%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-facto-gold/25 blur-2xl"
        aria-hidden
      />

      {/* Ramificações esquerdas */}
      <svg
        className="pointer-events-none absolute left-0 top-1/2 h-[7.5rem] w-14 -translate-y-1/2 overflow-visible text-facto-gold"
        viewBox="0 0 56 120"
        fill="none"
        aria-hidden
      >
        <g
          className="assistente-chip-trails"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.55"
        >
          <path d="M56 30 H34 Q22 30 22 42 V50 Q22 58 10 58 H2" />
          <path d="M56 60 H28 Q16 60 16 72 V86" />
          <path d="M56 90 H36 Q24 90 24 102 H6" />
        </g>
        <g fill="currentColor" className="assistente-chip-nodes">
          <circle cx="2" cy="58" r="2.2" />
          <circle cx="16" cy="86" r="1.8" />
          <circle cx="6" cy="102" r="1.8" />
        </g>
        <g className="assistente-chip-dots">
          <circle r="2.4" fill="#f0ebd0" filter="url(#assistente-glow)">
            <animateMotion
              dur="2.1s"
              repeatCount="indefinite"
              path="M2 58 H10 Q22 58 22 50 V42 Q22 30 34 30 H56"
            />
          </circle>
          <circle r="2" fill="#e8e2c0" filter="url(#assistente-glow)">
            <animateMotion
              dur="2.6s"
              begin="0.35s"
              repeatCount="indefinite"
              path="M16 86 V72 Q16 60 28 60 H56"
            />
          </circle>
          <circle r="1.9" fill="#f5f0d4" filter="url(#assistente-glow)">
            <animateMotion
              dur="2.4s"
              begin="0.85s"
              repeatCount="indefinite"
              path="M6 102 H24 Q24 90 36 90 H56"
            />
          </circle>
        </g>
        <defs>
          <filter
            id="assistente-glow"
            x="-80%"
            y="-80%"
            width="260%"
            height="260%"
          >
            <feGaussianBlur stdDeviation="1.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Ramificações direitas */}
      <svg
        className="pointer-events-none absolute right-0 top-1/2 h-[7.5rem] w-14 -translate-y-1/2 overflow-visible text-facto-gold"
        viewBox="0 0 56 120"
        fill="none"
        aria-hidden
      >
        <g
          className="assistente-chip-trails"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.55"
        >
          <path d="M0 30 H22 Q34 30 34 42 V50 Q34 58 46 58 H54" />
          <path d="M0 60 H28 Q40 60 40 72 V86" />
          <path d="M0 90 H20 Q32 90 32 102 H50" />
        </g>
        <g fill="currentColor" className="assistente-chip-nodes">
          <circle cx="54" cy="58" r="2.2" />
          <circle cx="40" cy="86" r="1.8" />
          <circle cx="50" cy="102" r="1.8" />
        </g>
        <g className="assistente-chip-dots">
          <circle r="2.4" fill="#f0ebd0" filter="url(#assistente-glow-r)">
            <animateMotion
              dur="2s"
              begin="0.15s"
              repeatCount="indefinite"
              path="M54 58 H46 Q34 58 34 50 V42 Q34 30 22 30 H0"
            />
          </circle>
          <circle r="2" fill="#e8e2c0" filter="url(#assistente-glow-r)">
            <animateMotion
              dur="2.7s"
              begin="0.7s"
              repeatCount="indefinite"
              path="M40 86 V72 Q40 60 28 60 H0"
            />
          </circle>
          <circle r="1.9" fill="#f5f0d4" filter="url(#assistente-glow-r)">
            <animateMotion
              dur="2.3s"
              begin="1.1s"
              repeatCount="indefinite"
              path="M50 102 H32 Q32 90 20 90 H0"
            />
          </circle>
        </g>
        <defs>
          <filter
            id="assistente-glow-r"
            x="-80%"
            y="-80%"
            width="260%"
            height="260%"
          >
            <feGaussianBlur stdDeviation="1.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Pinos superiores / inferiores */}
      <div
        className="pointer-events-none absolute left-1/2 top-1 flex -translate-x-1/2 gap-3"
        aria-hidden
      >
        {[0, 1, 2].map((i) => (
          <span
            key={`pin-t-${i}`}
            className="relative flex flex-col items-center"
          >
            <span
              className="assistente-chip-dot-vert mb-0.5 h-1.5 w-1.5 rounded-full bg-[#f0ebd0] shadow-[0_0_6px_rgba(240,235,208,0.9)]"
              style={{ animationDelay: `${i * 0.28}s` }}
            />
            <span className="assistente-chip-pin h-2.5 w-1 rounded-t-sm bg-facto-gold/65" />
          </span>
        ))}
      </div>
      <div
        className="pointer-events-none absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-3"
        aria-hidden
      >
        {[0, 1, 2].map((i) => (
          <span
            key={`pin-b-${i}`}
            className="relative flex flex-col items-center"
          >
            <span className="assistente-chip-pin h-2.5 w-1 rounded-b-sm bg-facto-gold/65" />
            <span
              className="assistente-chip-dot-vert mt-0.5 h-1.5 w-1.5 rounded-full bg-[#e8e2c0] shadow-[0_0_6px_rgba(232,226,192,0.85)]"
              style={{ animationDelay: `${0.35 + i * 0.3}s` }}
            />
          </span>
        ))}
      </div>

      {/* Corpo do chip + pinos laterais */}
      <div className="relative z-10 flex items-stretch">
        <div
          className="mr-0.5 flex flex-col justify-center gap-1.5 py-2"
          aria-hidden
        >
          {[0, 1, 2, 3].map((i) => (
            <span
              key={`pin-l-${i}`}
              className="assistente-chip-pin h-1 w-2.5 rounded-l-sm bg-facto-gold/70"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>

        <div className="assistente-chip-body relative min-w-[12rem] overflow-hidden rounded-md border border-facto-gold/60 bg-gradient-to-br from-[#2a281f] via-[#1c1c16] to-[#12120e] px-4 py-3">
          <span
            className="pointer-events-none absolute inset-[3px] rounded-[3px] border border-facto-gold/20 bg-[linear-gradient(135deg,rgba(144,139,106,0.12)_0%,transparent_45%,rgba(144,139,106,0.06)_100%)]"
            aria-hidden
          />
          <span
            className="assistente-chip-scan pointer-events-none absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-transparent via-facto-gold/28 to-transparent"
            aria-hidden
          />
          <span
            className="assistente-chip-sheen pointer-events-none absolute inset-0"
            aria-hidden
          />

          <div className="relative text-center">
            <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-facto-gold/85">
              Assinatura FACTO
            </p>
            <p className="mt-0.5 text-sm font-semibold leading-tight text-white">
              Assistente Facto{" "}
              <span className="assistente-ia-shimmer">IA</span>
            </p>
            <p className="mt-0.5 text-[11px] text-stone-400">
              acelera seu processo
            </p>
          </div>
        </div>

        <div
          className="ml-0.5 flex flex-col justify-center gap-1.5 py-2"
          aria-hidden
        >
          {[0, 1, 2, 3].map((i) => (
            <span
              key={`pin-r-${i}`}
              className="assistente-chip-pin h-1 w-2.5 rounded-r-sm bg-facto-gold/70"
              style={{ animationDelay: `${0.1 + i * 0.18}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
