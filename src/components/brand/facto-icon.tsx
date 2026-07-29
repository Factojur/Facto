export function FactoIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  const stroke = {
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg
      viewBox="0 0 100 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
      {...props}
    >
      {/* Casa — contorno aberto na base */}
      <path
        d="M13 64V39L50 11L87 39V64"
        {...stroke}
        strokeWidth="2"
      />

      {/* Balança — coluna */}
      <path d="M50 56V33" {...stroke} strokeWidth="2" />
      <ellipse cx="50" cy="30.5" rx="3" ry="2.2" fill="currentColor" />
      <path d="M43.5 56H56.5" {...stroke} strokeWidth="2" />
      <path d="M45.5 56V58.5M54.5 56V58.5" {...stroke} strokeWidth="1.6" />
      <path d="M41 58.5H59" {...stroke} strokeWidth="1.8" />

      {/* Trave horizontal */}
      <path d="M27 33H73" {...stroke} strokeWidth="2" />

      {/* Prato esquerdo */}
      <path
        d="M27 33L25 41M27 33V41M27 33L29 41"
        {...stroke}
        strokeWidth="1.35"
      />
      <path
        d="M19.5 41H34.5L32 48.5H22L19.5 41Z"
        {...stroke}
        strokeWidth="1.65"
      />

      {/* Prato direito */}
      <path
        d="M73 33L71 41M73 33V41M73 33L75 41"
        {...stroke}
        strokeWidth="1.35"
      />
      <path
        d="M65.5 41H80.5L78 48.5H68L65.5 41Z"
        {...stroke}
        strokeWidth="1.65"
      />
    </svg>
  );
}
