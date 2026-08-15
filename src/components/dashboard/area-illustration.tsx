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
  const thin = { ...stroke, strokeWidth: 1.2 };

  switch (areaId) {
    case "jec":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <path d="M60 14v52M40 30h40" {...stroke} />
          <path d="M40 30L30 40M80 30l10 10" {...stroke} />
          <ellipse cx="30" cy="44" rx="9" ry="3.5" {...stroke} />
          <ellipse cx="90" cy="44" rx="9" ry="3.5" {...stroke} />
          <path d="M44 70h32v16H44z" {...stroke} />
          <path d="M50 76h8M50 80h14" {...thin} />
        </svg>
      );

    case "jecr":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <path d="M28 22h40l8 8v48H28V22z" {...stroke} />
          <path d="M68 22v8h8" {...stroke} />
          <path d="M36 40h28M36 50h22M36 60h26" {...thin} />
          <path d="M82 38v28" {...stroke} />
          <rect x="74" y="32" width="16" height="10" rx="1" {...stroke} />
          <path d="M78 66h8M74 72h16" {...stroke} />
        </svg>
      );

    case "trabalhista":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <rect x="26" y="28" width="48" height="50" rx="2" {...stroke} />
          <path d="M34 40h32M34 50h24M34 60h28" {...thin} />
          <circle cx="88" cy="40" r="14" {...stroke} />
          <path d="M88 32v8l6 4" {...stroke} />
        </svg>
      );

    case "criminal":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <path d="M60 16l28 10v22c0 18-12 30-28 36-16-6-28-18-28-36V26L60 16z" {...stroke} />
          <path d="M60 36v28M48 50h24" {...thin} />
        </svg>
      );

    case "empresarial":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <path d="M24 78V40l22-14 22 14v38" {...stroke} />
          <path d="M38 78V56h12v22M54 78V50h12v28" {...thin} />
          <path d="M22 78h48" {...stroke} />
          <rect x="74" y="42" width="24" height="32" rx="1.5" {...stroke} />
          <path d="M80 52h12M80 60h8" {...thin} />
        </svg>
      );

    case "civil":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <path d="M32 24h40l12 12v48H32V24z" {...stroke} />
          <path d="M72 24v12h12" {...stroke} />
          <path d="M42 48h28M42 58h20M42 68h24" {...thin} />
          <path d="M84 70l10 6-10 6v-12z" {...stroke} />
        </svg>
      );

    case "familia":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <path d="M24 78V46l36-24 36 24v32" {...stroke} />
          <path d="M52 78V58h16v20" {...stroke} />
          <circle cx="48" cy="40" r="7" {...stroke} />
          <circle cx="72" cy="40" r="7" {...stroke} />
        </svg>
      );

    case "imobiliario":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <path d="M22 78V48l38-26 38 26v30" {...stroke} />
          <path d="M50 78V58h20v20" {...stroke} />
          <circle cx="86" cy="36" r="8" {...stroke} />
          <path d="M86 44v16l6 4" {...stroke} />
        </svg>
      );

    case "contratual":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <path d="M30 20h40l14 14v54H30V20z" {...stroke} />
          <path d="M70 20v14h14" {...stroke} />
          <path d="M40 48h28M40 58h20" {...thin} />
          <path d="M40 72c8 8 20 8 28 0" {...stroke} />
        </svg>
      );

    case "tributario":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <path d="M28 22h36l12 12v52H28V22z" {...stroke} />
          <path d="M64 22v12h12" {...stroke} />
          <path d="M38 46h20M38 56h16M38 66h18" {...thin} />
          <path d="M78 78V48M90 78V38M102 78V58M72 78h36" {...stroke} />
        </svg>
      );

    case "administrativo":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <path d="M20 78h80" {...stroke} />
          <path d="M28 78V50h12v28M50 78V40h12v38M72 78V50h12v28" {...stroke} />
          <path d="M24 50h72" {...stroke} />
          <path d="M60 18l32 20H28L60 18z" {...stroke} />
        </svg>
      );

    case "previdenciario":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <rect x="28" y="28" width="64" height="44" rx="3" {...stroke} />
          <circle cx="48" cy="48" r="8" {...stroke} />
          <path d="M62 44h22M62 54h16" {...thin} />
          <path d="M36 80h48" {...stroke} />
        </svg>
      );

    case "consumidor":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <path d="M60 14v40M44 28h32" {...stroke} />
          <path d="M44 28L36 38M76 28l8 10" {...stroke} />
          <ellipse cx="36" cy="42" rx="8" ry="3" {...stroke} />
          <ellipse cx="84" cy="42" rx="8" ry="3" {...stroke} />
          <path d="M38 68h44l-6 18H44L38 68z" {...stroke} />
        </svg>
      );

    case "digital":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <rect x="24" y="22" width="72" height="44" rx="3" {...stroke} />
          <path d="M44 78h32M60 66v12" {...stroke} />
          <rect x="48" y="34" width="24" height="20" rx="2" {...stroke} />
          <path d="M52 34v-4a8 8 0 0116 0v4" {...stroke} />
        </svg>
      );

    case "ambiental":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <path d="M52 82V48" {...stroke} />
          <path d="M52 54c-16-2-24-16-22-30 14 2 22 14 22 30z" {...stroke} />
          <path d="M52 60c16-2 24-16 22-30-14 2-22 14-22 30z" {...stroke} />
          <rect x="74" y="50" width="26" height="32" rx="1.5" {...stroke} />
          <path d="M80 60h14M80 68h10" {...thin} />
        </svg>
      );

    case "propriedade-intelectual":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <circle cx="48" cy="42" r="20" {...stroke} />
          <path d="M38 42h12c5 0 8 3 8 7s-3 7-8 7h-6" {...stroke} />
          <path d="M42 42v22" {...stroke} />
          <path d="M78 28h18l8 8v40H78V28z" {...stroke} />
          <path d="M96 28v8h8" {...stroke} />
        </svg>
      );

    case "internacional":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <circle cx="48" cy="48" r="24" {...stroke} />
          <path d="M24 48h48M48 24c5 6 8 12 8 24s-3 18-8 24c-5-6-8-12-8-24s3-18 8-24z" {...thin} />
          <rect x="76" y="40" width="24" height="32" rx="1.5" {...stroke} />
          <path d="M82 50h12M82 58h8" {...thin} />
        </svg>
      );

    case "medico":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <rect x="26" y="22" width="40" height="54" rx="2" {...stroke} />
          <path d="M34 36h24M34 46h18M34 56h20" {...thin} />
          <path d="M78 30h16v14h14v16H94v14H78V60H64V44h14V30z" {...stroke} />
        </svg>
      );

    case "agrario":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <path d="M24 78V50l20-16 20 16v28" {...stroke} />
          <path d="M36 78V60h16v18" {...stroke} />
          <path d="M20 78h84" {...stroke} />
          <path d="M68 78c6-16 14-26 28-30" {...stroke} />
          <circle cx="88" cy="36" r="8" {...stroke} />
        </svg>
      );

    case "eleitoral":
      return (
        <svg viewBox="0 0 120 100" className={className} aria-hidden>
          <rect x="32" y="36" width="56" height="42" rx="3" {...stroke} />
          <path d="M48 36v-8h24v8" {...stroke} />
          <path d="M52 36h16" {...thin} />
          <path d="M50 58l8 8 16-16" {...stroke} />
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
