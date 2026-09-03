import type { HTMLAttributes } from "react";

/**
 * Wordmark e logo completo da FACTO — recortados a partir da arte oficial
 * enviada em 31/07/2026, com fundo removido (canal alfa real).
 */
export const FACTO_WORDMARK_SRC = "/brand/facto-wordmark.png";

/** Proporções do PNG oficial (983×231) — A entre F e C (x≈165–342). */
const WM_ASPECT = 983 / 231;
const LETTER_A_X = 165 / 983;
const LETTER_A_W = 177 / 983;
const IA_SCALE = 0.58;

export type FactoWordmarkIaSize = "chat" | "xs" | "watermark";

const SIZE_EM: Record<FactoWordmarkIaSize, string> = {
  chat: "text-[1.35rem] md:text-[1.7rem]",
  xs: "text-[18px]",
  watermark: "text-[2.75rem] sm:text-[3.5rem]",
};

/** I = barra SVG; A = recorte da logo oficial (mesmo desenho do FACTO). */
function WordmarkIaSuffix() {
  const h = `${IA_SCALE}em`;
  const wmW = `${IA_SCALE * WM_ASPECT}em`;
  const aClipW = `${LETTER_A_W * IA_SCALE * WM_ASPECT}em`;
  const aOffset = `${-LETTER_A_X * IA_SCALE * WM_ASPECT}em`;

  return (
    <span className="ml-[0.04em] inline-flex items-baseline gap-[0.05em] leading-none text-facto-gold-ia">
      <svg
        viewBox="0 0 18 100"
        fill="currentColor"
        className="block shrink-0"
        style={{ height: h, width: "auto" }}
        aria-hidden
      >
        <rect x="0" y="6" width="18" height="88" rx="1" />
      </svg>
      <span
        className="inline-block shrink-0 overflow-hidden align-baseline opacity-90"
        style={{ width: aClipW, height: h }}
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={FACTO_WORDMARK_SRC}
          alt=""
          draggable={false}
          className="block max-w-none"
          style={{ height: h, width: wmW, marginLeft: aOffset }}
        />
      </span>
    </span>
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

/** FACTO (PNG oficial) + IA (I SVG + A da logo, ouro mais suave). */
export function FactoWordmarkIa({
  size = "chat",
  className,
  watermarkOpacity,
  ...props
}: {
  size?: FactoWordmarkIaSize;
  watermarkOpacity?: number;
} & Omit<HTMLAttributes<HTMLSpanElement>, "children">) {
  const decorativo = watermarkOpacity != null;

  return (
    <span
      role={decorativo ? undefined : "img"}
      aria-label={decorativo ? undefined : "FACTOIA"}
      aria-hidden={decorativo ? true : undefined}
      className={`inline-flex max-w-full items-baseline leading-none ${SIZE_EM[size]} ${className ?? ""}`}
      style={watermarkOpacity != null ? { opacity: watermarkOpacity } : undefined}
      {...props}
    >
      <FactoWordmark className="h-[1em] w-auto shrink-0" alt="" aria-hidden />
      <WordmarkIaSuffix />
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
