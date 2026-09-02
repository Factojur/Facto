import type { HTMLAttributes } from "react";

/**
 * Wordmark e logo completo da FACTO — recortados a partir da arte oficial
 * enviada em 31/07/2026, com fundo removido (canal alfa real). Antes disso a
 * imagem tinha um fundo escuro sólido embutido no PNG e dependia de um hack
 * de CSS (`mix-blend-mode: lighten`) pra disfarçar o retângulo sobre o header
 * escuro — funcionava só quando o fundo por trás era exatamente da mesma cor,
 * e ficava visivelmente errado em qualquer outro fundo (cards claros, seções
 * da landing, etc.). Com transparência de verdade isso não é mais necessário
 * e a imagem fica correta sobre qualquer fundo.
 */
export const FACTO_WORDMARK_SRC = "/brand/facto-wordmark.png";

export type FactoWordmarkIaSize = "chat" | "xs" | "watermark";

const SIZE_EM: Record<FactoWordmarkIaSize, string> = {
  /** Título Chat FACTO no assistente. */
  chat: "text-[1.35rem] md:text-[1.7rem]",
  /** Topbar / horizontal compacto. */
  xs: "text-[18px]",
  /** Marca d'água no workspace (mesma escala visual do título, maior no painel). */
  watermark: "text-[2.75rem] sm:text-[3.5rem]",
};

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

/** FACTO (PNG oficial) + IA (Space Grotesk, ouro claro). */
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
      className={`inline-flex max-w-full items-baseline leading-none ${SIZE_EM[size]} ${className ?? ""}`}
      style={watermarkOpacity != null ? { opacity: watermarkOpacity } : undefined}
      {...props}
    >
      <FactoWordmark className="h-[1em] w-auto shrink-0" alt="" aria-hidden />
      <span
        className="ml-[0.06em] shrink-0 font-facto-ia text-[0.58em] font-semibold tracking-[0.08em] text-facto-gold-ia"
        aria-hidden
      >
        IA
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
