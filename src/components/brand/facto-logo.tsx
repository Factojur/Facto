import { FactoIcon } from "./facto-icon";
import { FactoLogoCompleto, FactoWordmark } from "./facto-wordmark";

export const FACTO_TAGLINE = "Inteligência Jurídica";

const iconSizes = {
  xs: "h-7 w-7",
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-16 w-16",
  xl: "h-20 w-20",
} as const;

const logoStackSizes = {
  xs: "h-11",
  sm: "h-[108px]",
  md: "h-[132px]",
  lg: "h-[168px] sm:h-[200px]",
  xl: "h-[240px]",
} as const;

const wordmarkSizes = {
  xs: "h-[18px] text-[18px]",
  sm: "h-[22px] text-[22px]",
  md: "h-[28px] text-[28px]",
  lg: "h-[36px] text-[36px] sm:h-[44px] sm:text-[44px]",
  xl: "h-[52px] text-[52px]",
} as const;

export function FactoLogo({
  variant = "stacked",
  size = "md",
  showTagline = false,
  className,
}: {
  variant?: "stacked" | "horizontal" | "icon";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  className?: string;
}) {
  if (variant === "icon") {
    return (
      <FactoIcon
        className={`text-facto-gold ${iconSizes[size]} ${className ?? ""}`}
      />
    );
  }

  if (variant === "horizontal") {
    return (
      <div className={`flex items-center gap-3 ${className ?? ""}`}>
        <FactoIcon className={`shrink-0 text-facto-gold ${iconSizes[size]}`} />
        <div className="min-w-0 leading-none">
          <div className={wordmarkSizes[size]}>
            <FactoWordmark className="h-full w-auto" />
          </div>
          {showTagline && (
            <p className="mt-1.5 font-sans text-[9px] font-medium uppercase tracking-[0.28em] text-stone-500">
              {FACTO_TAGLINE}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className ?? ""}`}>
      <FactoLogoCompleto className={logoStackSizes[size]} />
      {showTagline && (
        <p className="mt-1 font-sans text-[8px] font-medium uppercase tracking-[0.28em] text-stone-500 md:text-[9px]">
          {FACTO_TAGLINE}
        </p>
      )}
    </div>
  );
}
