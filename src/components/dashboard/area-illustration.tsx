/** Ícones line-art limpos (estilo mockup híbrido / Lucide). viewBox 24×24. */
export function AreaIllustration({
  areaId,
  className,
}: {
  areaId: string;
  className?: string;
}) {
  const s = {
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };

  switch (areaId) {
    case "jec":
    case "jecr":
      // Balança (Lucide Scale)
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" {...s} />
          <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" {...s} />
          <path d="M7 21h10" {...s} />
          <path d="M12 3v18" {...s} />
          <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" {...s} />
        </svg>
      );

    case "civil":
      // Coluna / pilar
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <path d="M4 6h16" {...s} />
          <path d="M6 6v2h12V6" {...s} />
          <path d="M8 8v10M12 8v10M16 8v10" {...s} />
          <path d="M6 18h12" {...s} />
          <path d="M4 20h16" {...s} />
        </svg>
      );

    case "consumidor":
      // Carrinho
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <circle cx="8" cy="21" r="1" {...s} />
          <circle cx="19" cy="21" r="1" {...s} />
          <path
            d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L22 7H6"
            {...s}
          />
        </svg>
      );

    case "trabalhista":
      // Maleta (Lucide Briefcase)
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" {...s} />
          <rect width="20" height="14" x="2" y="6" rx="2" {...s} />
        </svg>
      );

    case "empresarial":
      // Prédio
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" {...s} />
          <path d="M6 12h12M6 16h12M10 6h4" {...s} />
          <path d="M10 22v-4h4v4" {...s} />
        </svg>
      );

    case "tributario":
      // Cédula
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <rect x="2" y="6" width="20" height="12" rx="2" {...s} />
          <circle cx="12" cy="12" r="2.5" {...s} />
          <path d="M6 9h1.5M16.5 15H18" {...s} />
        </svg>
      );

    case "previdenciario":
      // Escudo + cruz
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            {...s}
          />
          <path d="M12 8v8M8.5 12h7" {...s} />
        </svg>
      );

    case "familia":
      // Grupo (Lucide Users)
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" {...s} />
          <circle cx="9" cy="7" r="4" {...s} />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" {...s} />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" {...s} />
        </svg>
      );

    case "criminal":
      // Martelo de juiz: cabeça larga + anéis + cabo + bloco
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <g transform="rotate(-42 15 8)">
            {/* Cabeça do malhete (grossa) */}
            <rect x="9.5" y="1.5" width="11" height="7" rx="2" {...s} />
            {/* Faces / anéis da cabeça */}
            <path d="M11.2 1.5v7M18.8 1.5v7" {...s} />
            <path d="M9.5 5h11" {...s} />
            {/* Cabo */}
            <path d="M15 8.5v11" {...s} />
            <path d="M13.5 19.5h3" {...s} />
          </g>
          {/* Bloco sonoro */}
          <path d="M2.5 18.5h9.5" {...s} />
          <path d="M3.5 18.5c0-1.2 1.8-2 4-2s4 .8 4 2" {...s} />
        </svg>
      );

    case "imobiliario":
      // Casa (Lucide Home)
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" {...s} />
          <polyline points="9 22 9 12 15 12 15 22" {...s} />
        </svg>
      );

    case "administrativo":
      // Frontão / colunas (Parthenon)
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <path d="M3 21h18" {...s} />
          <path d="M5 21V10h2v11M9 21V10h2v11M13 21V10h2v11M17 21V10h2v11" {...s} />
          <path d="M3 10h18" {...s} />
          <path d="M12 3l9 7H3l9-7z" {...s} />
        </svg>
      );

    case "medico":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <path d="M8 2h8v6h6v8h-6v6H8v-6H2V8h6V2z" {...s} />
        </svg>
      );

    case "digital":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <rect x="2" y="3" width="20" height="14" rx="2" {...s} />
          <path d="M8 21h8M12 17v4" {...s} />
        </svg>
      );

    case "ambiental":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <path d="M12 22v-8" {...s} />
          <path d="M12 14c-5-1-8-6-7-11 4 1 7 5 7 11z" {...s} />
          <path d="M12 15c5-1 8-6 7-11-4 1-7 5-7 11z" {...s} />
        </svg>
      );

    case "propriedade-intelectual":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <circle cx="12" cy="12" r="9" {...s} />
          <path d="M9 9.5h3.2a2.2 2.2 0 0 1 0 4.4H10.5" {...s} />
          <path d="M10.5 9.5V17" {...s} />
        </svg>
      );

    case "agrario":
      // Trator (cabine + rodas + chassi)
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <circle cx="7" cy="17" r="3" {...s} />
          <circle cx="18" cy="18" r="2.5" {...s} />
          <path d="M10 17h5.5" {...s} />
          <path d="M4 17V9h7l2 4h5v4" {...s} />
          <path d="M11 9V5h4v4" {...s} />
          <path d="M13 5h5l1 4" {...s} />
        </svg>
      );

    case "internacional":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <circle cx="12" cy="12" r="9" {...s} />
          <path d="M3 12h18" {...s} />
          <path
            d="M12 3c2.5 3 4 6 4 9s-1.5 6-4 9c-2.5-3-4-6-4-9s1.5-6 4-9z"
            {...s}
          />
        </svg>
      );

    case "eleitoral":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <rect x="5" y="8" width="14" height="13" rx="2" {...s} />
          <path d="M9 8V5h6v3" {...s} />
          <path d="M9 14l2 2 4-4" {...s} />
        </svg>
      );

    case "contratual":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" {...s} />
          <path d="M14 2v6h6M9 13h6M9 17h4" {...s} />
        </svg>
      );

    case "constitucional":
      // Bandeira do Brasil (retângulo + losango + círculo)
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <rect x="2" y="5" width="20" height="14" rx="1.5" {...s} />
          <path d="M12 7.5 18.5 12 12 16.5 5.5 12Z" {...s} />
          <circle cx="12" cy="12" r="2.6" {...s} />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <circle cx="12" cy="12" r="8" {...s} />
        </svg>
      );
  }
}
