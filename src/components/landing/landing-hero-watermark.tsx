"use client";

import { useEffect, useRef } from "react";
import { JusticaWatermark } from "@/components/dashboard/justica-watermark";

/**
 * Balança do hero com flutuação + oscilação dos pratos (rAF).
 */
export function LandingHeroWatermark() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const svg = wrap.querySelector("svg");
    if (!svg) return;

    const yoke = svg.querySelector<SVGGElement>(".justica-wm-yoke");
    const panL = svg.querySelector<SVGGElement>(".justica-wm-pan--left");
    const panR = svg.querySelector<SVGGElement>(".justica-wm-pan--right");

    let raf = 0;
    let running = true;
    const start = performance.now();

    const tick = (now: number) => {
      if (!running) return;
      const t = (now - start) / 1000;
      const floatY = Math.sin(t * 0.7) * 14;
      const floatR = Math.sin(t * 0.55) * 2.2;
      wrap.style.transform = `translateY(${floatY}px) rotate(${floatR}deg)`;

      if (yoke) {
        const tilt = Math.sin(t * 1.1) * 4;
        yoke.setAttribute("transform", `rotate(${tilt} 180 108)`);
      }
      if (panL) {
        const dy = Math.sin(t * 1.1) * 8;
        panL.setAttribute("transform", `translate(0 ${dy})`);
      }
      if (panR) {
        const dy = Math.sin(t * 1.1 + Math.PI) * 8;
        panR.setAttribute("transform", `translate(0 ${dy})`);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute -bottom-[4%] -right-[2%] z-0 h-[min(48vh,460px)] w-[min(48vh,460px)] opacity-[0.18] md:opacity-[0.24]"
      style={{ willChange: "transform", transformOrigin: "70% 80%" }}
      aria-hidden
    >
      <JusticaWatermark className="h-full w-full" />
    </div>
  );
}
