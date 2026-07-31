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
