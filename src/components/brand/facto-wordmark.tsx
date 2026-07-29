export const FACTO_WORDMARK_SRC = "/brand/facto-wordmark.png";

export function FactoWordmark({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={FACTO_WORDMARK_SRC}
      alt="FACTO"
      draggable={false}
      className={`facto-wordmark-blend block h-[1em] w-auto select-none ${className ?? ""}`}
      width={540}
      height={142}
      {...props}
    />
  );
}

export function FactoLogoCompleto({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="/brand/facto-logo.png"
      alt="FACTO — Inteligência Jurídica"
      draggable={false}
      className={`facto-wordmark-blend block w-auto select-none ${className ?? ""}`}
      width={959}
      height={740}
      {...props}
    />
  );
}
