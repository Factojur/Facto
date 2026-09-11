"use client";

import { useEffect, useState } from "react";

function formatarPt(n: number): string {
  return Math.round(n).toLocaleString("pt-BR");
}

/**
 * Contador estilo “inscritos” — lastro vivo (júris + súmulas).
 * Só renderiza se total > 0 (evita zero falso se o service role falhar).
 */
export function ContadorJurisLanding({ total }: { total: number }) {
  const [valor, setValor] = useState(0);

  useEffect(() => {
    if (total <= 0) return;

    const reduzido =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduzido) {
      setValor(total);
      return;
    }

    const inicio = performance.now();
    const duracaoMs = 1400;
    let raf = 0;

    const tick = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / duracaoMs);
      const ease = 1 - (1 - t) ** 3;
      setValor(total * ease);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [total]);

  if (total <= 0) return null;

  return (
    <div className="mt-8 flex flex-col items-center gap-1.5">
      <p
        className="font-[family-name:var(--font-facto)] text-3xl font-semibold tracking-tight text-facto-gold tabular-nums sm:text-4xl"
        aria-live="polite"
      >
        +{formatarPt(valor)}
      </p>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
        Julgados e súmulas na base
      </p>
      <p className="max-w-sm text-center text-xs leading-relaxed text-stone-500">
        Base em expansão · atualização diária com julgados recentes
      </p>
    </div>
  );
}
