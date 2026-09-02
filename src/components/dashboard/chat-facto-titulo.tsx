"use client";

import { useEffect, useId, useRef } from "react";
import { FactoWordmarkIa } from "@/components/brand/facto-wordmark";

/** Linhas que partem das bordas e convergem no centro (wordmark FACTO). */
const RAIOS: [number, number, number, number][] = [
  [0, 18, 44, 48],
  [0, 38, 42, 50],
  [0, 55, 41, 50],
  [0, 72, 44, 52],
  [0, 88, 46, 54],
  [100, 12, 56, 48],
  [100, 32, 58, 49],
  [100, 50, 59, 50],
  [100, 68, 58, 51],
  [100, 90, 56, 54],
  [12, 0, 46, 42],
  [28, 0, 48, 40],
  [50, 0, 50, 38],
  [72, 0, 52, 40],
  [88, 0, 54, 42],
  [10, 100, 46, 58],
  [32, 100, 48, 60],
  [50, 100, 50, 62],
  [68, 100, 52, 60],
  [90, 100, 54, 58],
  [8, 8, 44, 44],
  [92, 8, 56, 44],
  [8, 92, 44, 56],
  [92, 92, 56, 56],
  [18, 45, 40, 49],
  [82, 55, 60, 51],
];

const NOS: [number, number][] = [
  [0, 18],
  [0, 55],
  [0, 88],
  [100, 12],
  [100, 50],
  [100, 90],
  [28, 0],
  [50, 0],
  [72, 0],
  [32, 100],
  [50, 100],
  [68, 100],
  [18, 45],
  [82, 55],
  [8, 8],
  [92, 92],
  [44, 48],
  [56, 52],
  [50, 42],
  [50, 58],
];

function preferReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Fundo neural fraco — raios convergindo no FACTO. */
function NeuronioFundoTitulo() {
  const gid = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const soft = preferReducedMotion();
    let raf = 0;
    const t0 = performance.now();

    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      const root = rootRef.current;
      if (!root) {
        raf = requestAnimationFrame(tick);
        return;
      }

      root.querySelectorAll<SVGCircleElement>("[data-titulo-node]").forEach((node, i) => {
        const base = Number(node.dataset.rBase || "0.35");
        const pulse =
          0.12 + (Math.sin(t * 0.7 + i * 0.45) + 1) * (soft ? 0.05 : 0.1);
        node.setAttribute("opacity", String(pulse));
        node.setAttribute(
          "r",
          String(base + Math.sin(t * 0.55 + i * 0.3) * (soft ? 0.02 : 0.05))
        );
      });

      root.querySelectorAll<SVGLineElement>("[data-titulo-link]").forEach((link, i) => {
        link.style.opacity = String(
          0.08 + (Math.sin(t * 0.55 + i * 0.35) + 1) * 0.05
        );
      });

      const speed = soft ? 0.025 : 0.045;
      root.querySelectorAll<SVGCircleElement>("[data-titulo-part]").forEach((dot, i) => {
        const ray = RAIOS[i % RAIOS.length];
        if (!ray) return;
        const [x1, y1, x2, y2] = ray;
        const u = (t * (speed + (i % 7) * 0.008) + i * 0.12) % 1;
        const e = u * u * (3 - 2 * u);
        dot.setAttribute("cx", String(x1 + (x2 - x1) * e));
        dot.setAttribute("cy", String(y1 + (y2 - y1) * e));
        dot.setAttribute("opacity", String(0.15 + e * 0.35));
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-55"
      aria-hidden
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id={`titulo-fade-${gid}`} cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#908b6a" stopOpacity="0.14" />
            <stop offset="55%" stopColor="#908b6a" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#908b6a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#titulo-fade-${gid})`} />
        {RAIOS.map(([x1, y1, x2, y2], i) => (
          <line
            key={`l-${i}`}
            data-titulo-link
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#908b6a"
            strokeWidth="0.12"
            opacity="0.16"
          />
        ))}
        {NOS.map(([cx, cy], i) => (
          <circle
            key={`n-${i}`}
            data-titulo-node
            data-r-base={i % 4 === 0 ? "0.42" : "0.28"}
            cx={cx}
            cy={cy}
            r={i % 4 === 0 ? 0.42 : 0.28}
            fill="#908b6a"
            opacity="0.22"
          />
        ))}
        {RAIOS.map(([x1, y1], i) => (
          <circle
            key={`p-${i}`}
            data-titulo-part
            cx={x1}
            cy={y1}
            r="0.28"
            fill="#c4bf9a"
            opacity="0.2"
          />
        ))}
      </svg>
    </div>
  );
}

/** Título da seção de assistente — wordmark oficial + neurônios fracos. */
export function ChatFactoTitulo() {
  return (
    <div className="relative w-full overflow-hidden py-6 md:py-8">
      <NeuronioFundoTitulo />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-[min(90vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-facto-gold/10 blur-3xl"
        aria-hidden
      />
      <h2 className="relative mx-auto flex items-baseline justify-center gap-x-3 px-4">
        <span className="text-xl font-semibold tracking-tight text-stone-400 md:text-2xl">
          Chat
        </span>
        <span className="facto-titulo-wordmark inline-flex items-center">
          <FactoWordmarkIa size="chat" />
        </span>
      </h2>
    </div>
  );
}
