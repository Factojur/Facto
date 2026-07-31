/**
 * Ícone da FACTO (casa + balança + rede neural) — imagem com fundo
 * transparente de verdade (canal alfa), recortada a partir da arte oficial
 * enviada em 31/07/2026. Antes disso o "ícone" era um SVG desenhado à mão,
 * sem o elemento de IA (cérebro) e sem bater com a arte oficial — trocado
 * aqui para manter a marca consistente em todo o site.
 */
export function FactoIcon({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/facto-icon.png"
      alt=""
      aria-hidden
      draggable={false}
      className={`block w-auto select-none ${className ?? ""}`}
      width={983}
      height={541}
      {...props}
    />
  );
}

/**
 * Só o cérebro (elemento de IA), sem casa/balança — recortado a partir da
 * arte enviada em 31/07/2026 para o menu do painel de geração de peças, com
 * fundo removido (canal alfa real).
 */
export function FactoIconBrain({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/facto-icon-brain.png"
      alt=""
      aria-hidden
      draggable={false}
      className={`block w-auto select-none ${className ?? ""}`}
      width={478}
      height={412}
      {...props}
    />
  );
}
