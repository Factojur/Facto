import type { HTMLAttributes, SVGAttributes } from "react";

/**
 * Wordmark e logo completo da FACTO — recortados a partir da arte oficial
 * enviada em 31/07/2026, com fundo removido (canal alfa real).
 */
export const FACTO_WORDMARK_SRC = "/brand/facto-wordmark.png";

export type FactoWordmarkIaSize = "chat" | "xs" | "watermark";

const SIZE_EM: Record<FactoWordmarkIaSize, string> = {
  chat: "text-[1.35rem] md:text-[1.7rem]",
  xs: "text-[18px]",
  watermark: "text-[2.75rem] sm:text-[3.5rem]",
};

/** IA no mesmo desenho da logo: I = traço; A = chevron sólido sem barra. */
function WordmarkIaSuffix({
  className,
  ...props
}: SVGAttributes<SVGSVGElement>) {
  // Cap comum I/A: y 6–94. Ápice do A em y=16 (não y=6) para não “estourar” o I.
  // Pernas simétricas, mesma largura da barra do I (~18).
  return (
    <svg
      viewBox="0 0 80 100"
      fill="currentColor"
      className={`block h-[0.58em] w-auto shrink-0 ${className ?? ""}`}
      aria-hidden
      {...props}
    >
      <rect x="0" y="6" width="18" height="88" rx="1" />
      <path d="M 20 94 L 38 94 L 50 16 L 32 16 Z" />
      <path d="M 50 16 L 68 16 L 80 94 L 62 94 Z" />
    </svg>
  );
}

export function FactoWordmark({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={FACTO_WORDMARK_SRC}
      alt="FACTO"
      draggable={false}
      className={`block h-[1em] w-auto select-none ${className ?? ""}`}
      width={983}
      height={231}
      {...props}
    />
  );
}

/** FACTO (PNG oficial) + IA (SVG no traço da logo, ouro mais suave). */
export function FactoWordmarkIa({
  size = "chat",
  className,
  watermarkOpacity,
  ...props
}: {
  size?: FactoWordmarkIaSize;
  /** Opacidade do conjunto — marca d'água do workspace. */
  watermarkOpacity?: number;
} & Omit<HTMLAttributes<HTMLSpanElement>, "children">) {
  const decorativo = watermarkOpacity != null;

  return (
    <span
      role={decorativo ? undefined : "img"}
      aria-label={decorativo ? undefined : "FACTOIA"}
      aria-hidden={decorativo ? true : undefined}
      className={`inline-flex max-w-full items-center leading-none ${SIZE_EM[size]} ${className ?? ""}`}
      style={watermarkOpacity != null ? { opacity: watermarkOpacity } : undefined}
      {...props}
    >
      <FactoWordmark className="h-[1em] w-auto shrink-0" alt="" aria-hidden />
      <span
        className="ml-[0.05em] inline-flex shrink-0 items-center text-facto-gold-ia"
        aria-hidden
      >
        <WordmarkIaSuffix />
      </span>
    </span>
  );
}

export function FactoLogoCompleto({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/facto-logo.png"
      alt="FACTO — Inteligência Jurídica"
      draggable={false}
      className={`block w-auto select-none ${className ?? ""}`}
      width={983}
      height={772}
      {...props}
    />
  );
}
