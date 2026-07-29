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

    default:
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <circle cx="60" cy="50" r="28" {...stroke} />
        </svg>
      );
  }
}
