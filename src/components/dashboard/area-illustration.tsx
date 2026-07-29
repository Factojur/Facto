export function AreaIllustration({
  areaId,
  className,
}: {
  areaId: string;
  className?: string;
}) {
  const stroke = {
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };

  switch (areaId) {
    case "jec":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <path d="M60 12v58M38 28h44" {...stroke} />
          <path d="M38 28L28 38M82 28l10 10" {...stroke} />
          <ellipse cx="28" cy="42" rx="10" ry="4" {...stroke} />
          <ellipse cx="92" cy="42" rx="10" ry="4" {...stroke} />
          <path d="M42 72h36v18H42z" {...stroke} />
          <path d="M48 78h8M48 82h14" {...stroke} strokeWidth="1.2" />
          <circle cx="60" cy="8" r="3" fill="currentColor" stroke="none" />
        </svg>
      );

    case "jecr":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <path d="M60 12v58M38 28h44" {...stroke} />
          <path d="M38 28L28 38M82 28l10 10" {...stroke} />
          <ellipse cx="28" cy="42" rx="10" ry="4" {...stroke} />
          <ellipse cx="92" cy="42" rx="10" ry="4" {...stroke} />
          <path d="M42 72h36v18H42z" {...stroke} />
          <path d="M48 78h8M48 82h14" {...stroke} strokeWidth="1.2" />
          <path d="M54 8h12v4H54z" fill="currentColor" stroke="none" />
          <path d="M58 14h4v8h-4z" fill="currentColor" stroke="none" />
        </svg>
      );

    case "trabalhista":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <path d="M35 78V42l25-18 25 18v36" {...stroke} />
          <path d="M52 78V58h16v20" {...stroke} />
          <path d="M30 78h60" {...stroke} strokeWidth="2" />
          <rect x="44" y="32" width="32" height="22" rx="2" {...stroke} />
          <path d="M50 38h20M50 43h14M50 48h18" {...stroke} strokeWidth="1.2" />
          <path d="M60 14v8" {...stroke} />
        </svg>
      );

    case "criminal":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <path d="M60 88V52" {...stroke} />
          <path d="M48 88h24" {...stroke} />
          <path
            d="M60 52c-14 0-24-10-24-22s10-22 24-22 24 10 24 22-10 22-24 22z"
            {...stroke}
          />
          <path d="M60 30v44M42 52h36" {...stroke} strokeWidth="1.2" />
          <path d="M60 8l8 12h-6v8h-4v-8h-6l8-12z" fill="currentColor" stroke="none" />
        </svg>
      );

    case "empresarial":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <path d="M28 78V38l32-20 32 20v40" {...stroke} />
          <path d="M44 78V54h12v24M64 78V48h12v30" {...stroke} />
          <path d="M38 78h44" {...stroke} strokeWidth="2" />
          <path d="M48 62h8M64 56h8" {...stroke} strokeWidth="1.2" />
          <path d="M36 88h48" {...stroke} />
          <circle cx="88" cy="32" r="10" {...stroke} />
          <path d="M84 32h8M88 28v8" {...stroke} strokeWidth="1.2" />
        </svg>
      );

    case "civil":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <path d="M40 78V28l20-12 20 12v50" {...stroke} />
          <path d="M48 42h24M48 52h18M48 62h20" {...stroke} strokeWidth="1.2" />
          <path d="M36 78h48" {...stroke} strokeWidth="2" />
        </svg>
      );

    case "familia":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <circle cx="42" cy="34" r="8" {...stroke} />
          <circle cx="78" cy="34" r="8" {...stroke} />
          <circle cx="60" cy="52" r="7" {...stroke} />
          <path d="M30 78c2-16 10-24 20-24s18 8 20 24" {...stroke} />
          <path d="M50 78c2-14 8-20 16-20s14 6 16 20" {...stroke} />
          <path d="M42 78c1-10 6-14 12-14s11 4 12 14" {...stroke} />
        </svg>
      );

    case "imobiliario":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <path d="M28 78V48l32-24 32 24v30" {...stroke} />
          <path d="M52 78V58h16v20" {...stroke} />
          <path d="M24 78h72" {...stroke} strokeWidth="2" />
          <path d="M44 40h8M68 40h8" {...stroke} strokeWidth="1.2" />
        </svg>
      );

    case "contratual":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <path d="M38 20h36l12 12v52H38V20z" {...stroke} />
          <path d="M74 20v12h12" {...stroke} />
          <path d="M48 44h28M48 54h22M48 64h26" {...stroke} strokeWidth="1.2" />
          <path d="M82 70l8 4-8 4v-8z" fill="currentColor" stroke="none" />
        </svg>
      );

    case "tributario":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <rect x="34" y="28" width="52" height="48" rx="4" {...stroke} />
          <path d="M46 44h28M46 54h20M46 64h24" {...stroke} strokeWidth="1.2" />
          <circle cx="78" cy="34" r="10" {...stroke} />
          <path d="M74 34h8M78 30v8" {...stroke} strokeWidth="1.2" />
        </svg>
      );

    case "administrativo":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <path d="M24 78h72" {...stroke} strokeWidth="2" />
          <path d="M32 78V48h12v30M54 78V38h12v40M76 78V52h12v26" {...stroke} />
          <path d="M28 48h64" {...stroke} />
          <path d="M60 20l28 20H32l28-20z" {...stroke} />
        </svg>
      );

    case "previdenciario":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <circle cx="60" cy="32" r="12" {...stroke} />
          <path d="M38 78c4-22 12-30 22-30s18 8 22 30" {...stroke} />
          <path d="M48 22c-8-2-14 4-12 12" {...stroke} strokeWidth="1.2" />
          <path d="M42 84h36" {...stroke} strokeWidth="2" />
        </svg>
      );

    case "consumidor":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <path d="M34 36h52l-6 34H40L34 36z" {...stroke} />
          <path d="M42 36l4-12h28l4 12" {...stroke} />
          <circle cx="48" cy="78" r="5" {...stroke} />
          <circle cx="72" cy="78" r="5" {...stroke} />
        </svg>
      );

    case "digital":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <rect x="28" y="24" width="64" height="42" rx="4" {...stroke} />
          <path d="M44 78h32M60 66v12" {...stroke} />
          <path d="M40 36h40M40 46h28M40 56h34" {...stroke} strokeWidth="1.2" />
          <circle cx="84" cy="30" r="3" fill="currentColor" stroke="none" />
        </svg>
      );

    case "ambiental":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <path d="M60 82V48" {...stroke} />
          <path d="M60 52c-16-2-24-14-22-28 12 2 20 12 22 28z" {...stroke} />
          <path d="M60 58c16-2 24-14 22-28-12 2-20 12-22 28z" {...stroke} />
          <path d="M40 82h40" {...stroke} strokeWidth="2" />
        </svg>
      );

    case "propriedade-intelectual":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <circle cx="60" cy="42" r="22" {...stroke} />
          <path d="M48 42h16c6 0 10 4 10 9s-4 9-10 9H54" {...stroke} />
          <path d="M54 42v28" {...stroke} />
          <path d="M42 82h36" {...stroke} strokeWidth="2" />
        </svg>
      );

    case "internacional":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <circle cx="60" cy="50" r="28" {...stroke} />
          <path d="M32 50h56M60 22v56" {...stroke} />
          <path d="M40 34c8 6 32 6 40 0M40 66c8-6 32-6 40 0" {...stroke} strokeWidth="1.2" />
        </svg>
      );

    case "medico":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <path d="M48 28h24v12h12v24H72v12H48V64H36V40h12V28z" {...stroke} />
          <path d="M36 82h48" {...stroke} strokeWidth="2" />
        </svg>
      );

    case "agrario":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <path d="M28 78c8-20 18-32 32-36 14 4 24 16 32 36" {...stroke} />
          <path d="M60 42V78" {...stroke} />
          <path d="M24 78h72" {...stroke} strokeWidth="2" />
          <path d="M44 52c4-8 10-12 16-12s12 4 16 12" {...stroke} strokeWidth="1.2" />
          <circle cx="60" cy="28" r="6" {...stroke} />
        </svg>
      );

    case "eleitoral":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <rect x="36" y="24" width="48" height="54" rx="4" {...stroke} />
          <path d="M48 40h24M48 50h18M48 60h22" {...stroke} strokeWidth="1.2" />
          <path d="M52 78h16" {...stroke} strokeWidth="2" />
          <circle cx="78" cy="32" r="8" {...stroke} />
          <path d="M78 28v8M74 32h8" {...stroke} strokeWidth="1.2" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <circle cx="60" cy="50" r="28" {...stroke} />
        </svg>
      );
  }
}
