export function JusticaWatermark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={`text-facto-gold ${className ?? ""}`}
    >
      <path
        d="M128 388h104l-8 24H136l-8-24z"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M118 412h124l-6 8H124l-6-8z"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.45"
      />

      <rect
        x="168"
        y="88"
        width="24"
        height="300"
        rx="2"
        fill="currentColor"
        opacity="0.15"
      />
      <line
        x1="180"
        y1="88"
        x2="180"
        y2="388"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.5"
      />

      <ellipse cx="180" cy="82" rx="20" ry="9" fill="currentColor" opacity="0.3" />

      <line
        x1="32"
        y1="108"
        x2="328"
        y2="108"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.55"
      />

      <line x1="56" y1="108" x2="56" y2="148" stroke="currentColor" strokeWidth="2.5" opacity="0.45" />
      <line x1="50" y1="148" x2="62" y2="148" stroke="currentColor" strokeWidth="2.5" opacity="0.45" />
      <line x1="53" y1="148" x2="53" y2="188" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      <line x1="59" y1="148" x2="59" y2="188" stroke="currentColor" strokeWidth="2" opacity="0.4" />

      <path d="M16 208h80l-8 24H24l-8-24z" fill="currentColor" opacity="0.18" />
      <path d="M12 232h88" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <path d="M20 208h72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />

      <line x1="304" y1="108" x2="304" y2="156" stroke="currentColor" strokeWidth="2.5" opacity="0.45" />
      <line x1="298" y1="156" x2="310" y2="156" stroke="currentColor" strokeWidth="2.5" opacity="0.45" />
      <line x1="301" y1="156" x2="301" y2="204" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      <line x1="307" y1="156" x2="307" y2="204" stroke="currentColor" strokeWidth="2" opacity="0.4" />

      <path d="M264 224h80l-8 24h-64l-8-24z" fill="currentColor" opacity="0.18" />
      <path d="M260 248h88" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <path d="M268 224h72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />

      <path
        d="M88 48c46-38 138-38 184 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.28"
      />
    </svg>
  );
}
