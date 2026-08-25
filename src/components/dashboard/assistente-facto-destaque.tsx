"use client";

import { useEffect, useRef } from "react";
import {
  AssistenteFactoInovacoesModal,
  useAssistenteInovacoesModal,
} from "@/components/dashboard/assistente-facto-inovacoes-modal";

const DOT_PATHS_LEFT = [
  {
    id: "l0",
    d: "M2 58 H10 Q22 58 22 50 V42 Q22 30 34 30 H56",
    dur: 2.1,
    begin: 0,
    r: 2.4,
    fill: "#f0ebd0",
  },
  {
    id: "l1",
    d: "M16 86 V72 Q16 60 28 60 H56",
    dur: 2.6,
    begin: 0.35,
    r: 2,
    fill: "#e8e2c0",
  },
  {
    id: "l2",
    d: "M6 102 H24 Q24 90 36 90 H56",
    dur: 2.4,
    begin: 0.85,
    r: 1.9,
    fill: "#f5f0d4",
  },
] as const;

const DOT_PATHS_RIGHT = [
  {
    id: "r0",
    d: "M54 58 H46 Q34 58 34 50 V42 Q34 30 22 30 H0",
    dur: 2,
    begin: 0.15,
    r: 2.4,
    fill: "#f0ebd0",
  },
  {
    id: "r1",
    d: "M40 86 V72 Q40 60 28 60 H0",
    dur: 2.7,
    begin: 0.7,
    r: 2,
    fill: "#e8e2c0",
  },
  {
    id: "r2",
    d: "M50 102 H32 Q32 90 20 90 H0",
    dur: 2.3,
    begin: 1.1,
    r: 1.9,
    fill: "#f5f0d4",
  },
] as const;

function preferReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Chip de processador com trilhas/neurônios — presença de IA no hero. */
export function AssistenteFactoDestaque({ leigo = false }: { leigo?: boolean }) {
  void leigo;
  const modal = useAssistenteInovacoesModal();
  const rootRef = useRef<HTMLButtonElement>(null);
  const haloRef = useRef<HTMLSpanElement>(null);
  const scanRef = useRef<HTMLSpanElement>(null);
  const sheenRef = useRef<HTMLSpanElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root.classList.add("assistente-chip--js");

    const pathEls = new Map<string, SVGPathElement>();
    root.querySelectorAll<SVGPathElement>("[data-chip-path]").forEach((el) => {
      const id = el.getAttribute("data-chip-path");
      if (id) pathEls.set(id, el);
    });

    const soft = preferReducedMotion();
    const amp = soft ? 0.5 : 1;
    let raf = 0;
    const t0 = performance.now();

    const tick = (now: number) => {
      const t = (now - t0) / 1000;

      const halo = haloRef.current;
      if (halo) {
        const wave = (Math.sin(t * 2.4) + 1) / 2;
        const scale = 0.92 + wave * 0.16 * amp;
        halo.style.transform = `translate(-50%, -50%) scale(${scale}) translateZ(0)`;
        halo.style.opacity = String(0.35 + wave * 0.35 * amp);
      }

      const scan = scanRef.current;
      if (scan) {
        const u = (t / 2.8) % 1;
        const x = -130 + u * 410;
        let opacity = 0;
        if (u < 0.12) opacity = u / 0.12 * 0.95;
        else if (u < 0.55) opacity = 0.95 - (u - 0.12) / 0.43 * 0.5;
        else opacity = Math.max(0, 0.45 - (u - 0.55) / 0.45 * 0.45);
        scan.style.transform = `translateX(${x}%) translateZ(0)`;
        scan.style.opacity = String(opacity * amp);
      }

      const sheen = sheenRef.current;
      if (sheen) {
        const wave = (Math.sin(t * 2) + 1) / 2;
        sheen.style.opacity = String(0.35 + wave * 0.5 * amp);
      }

      const body = bodyRef.current;
      if (body) {
        const wave = (Math.sin(t * 2.2) + 1) / 2;
        const spreadA = 18 + wave * 10 * amp;
        const spreadB = 40 + wave * 16 * amp;
        const alphaA = 0.45 + wave * 0.25 * amp;
        const alphaB = 0.35 + wave * 0.1 * amp;
        body.style.boxShadow = `0 0 ${spreadA}px -4px rgba(144, 139, 106, ${alphaA}), 0 0 ${spreadB}px -10px rgba(144, 139, 106, ${alphaB}), inset 0 1px 0 rgba(240, 235, 208, ${0.16 + wave * 0.12 * amp})`;
        body.style.borderColor = `rgba(${144 + wave * 52 * amp}, ${139 + wave * 52 * amp}, ${106 + wave * 86 * amp}, ${0.55 + wave * 0.2 * amp})`;
      }

      root.querySelectorAll<SVGCircleElement>("[data-chip-dot]").forEach((dot) => {
        const key = dot.getAttribute("data-chip-dot");
        if (!key) return;
        const path = pathEls.get(key);
        if (!path) return;
        const dur = Number(dot.dataset.dur || 2);
        const begin = Number(dot.dataset.begin || 0);
        const u = ((t + begin) % dur) / dur;
        const len = path.getTotalLength();
        const pt = path.getPointAtLength(u * len);
        dot.setAttribute("cx", String(pt.x));
        dot.setAttribute("cy", String(pt.y));
        dot.setAttribute(
          "opacity",
          String(0.55 + (Math.sin(t * 5 + begin * 3) + 1) * 0.22 * amp)
        );
      });

      root.querySelectorAll<SVGGElement>("[data-chip-trails]").forEach((g, i) => {
        g.style.opacity = String(
          0.35 + (Math.sin(t * 2.4 + i * 0.3) + 1) * 0.2 * amp
        );
      });

      root.querySelectorAll<SVGGElement>("[data-chip-nodes]").forEach((g, i) => {
        g.style.opacity = String(
          0.4 + (Math.sin(t * 1.8 + i * 0.4) + 1) * 0.275 * amp
        );
      });

      root.querySelectorAll<HTMLElement>("[data-chip-pin]").forEach((el) => {
        const phase = Number(el.dataset.phase || 0);
        el.style.opacity = String(
          0.55 + (Math.sin(t * 2 + phase) + 1) * 0.225 * amp
        );
      });

      root.querySelectorAll<HTMLElement>("[data-chip-dot-vert]").forEach((el) => {
        const phase = Number(el.dataset.phase || 0);
        const wave = (Math.sin(t * 1.6 + phase) + 1) / 2;
        const scale = 0.7 + wave * 0.55 * amp;
        el.style.opacity = String(0.3 + wave * 0.7 * amp);
        el.style.transform = `scale(${scale}) translateZ(0)`;
      });

      const shimmer = root.querySelector<HTMLElement>(".assistente-ia-shimmer");
      if (shimmer) {
        const pos = 140 - ((t * (soft ? 40 : 100)) % 280);
        shimmer.style.backgroundPosition = `${pos}% center`;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove("assistente-chip--js");
    };
  }, []);

  return (
    <>
      <button
        ref={rootRef}
        type="button"
        onClick={modal.abrir}
        className="assistente-chip-root group relative inline-flex max-w-full cursor-pointer select-none px-5 py-4 text-left transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-facto-gold/60"
        aria-label="Abrir inovações do Assistente Facto IA"
        aria-haspopup="dialog"
        aria-expanded={modal.aberto}
      >
        <span
          ref={haloRef}
          className="assistente-chip-halo pointer-events-none absolute left-1/2 top-1/2 h-[72%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-facto-gold/25 blur-2xl"
          style={{ willChange: "transform, opacity" }}
          aria-hidden
        />

        <svg
          className="pointer-events-none absolute left-0 top-1/2 h-[7.5rem] w-14 -translate-y-1/2 overflow-visible text-facto-gold"
          viewBox="0 0 56 120"
          fill="none"
          aria-hidden
        >
          <g
            data-chip-trails
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.55"
          >
            <path d="M56 30 H34 Q22 30 22 42 V50 Q22 58 10 58 H2" />
            <path d="M56 60 H28 Q16 60 16 72 V86" />
            <path d="M56 90 H36 Q24 90 24 102 H6" />
          </g>
          <g fill="currentColor" data-chip-nodes>
            <circle cx="2" cy="58" r="2.2" />
            <circle cx="16" cy="86" r="1.8" />
            <circle cx="6" cy="102" r="1.8" />
          </g>
          <g className="assistente-chip-dots">
            {DOT_PATHS_LEFT.map((p) => (
              <circle
                key={p.id}
                data-chip-dot={p.id}
                data-dur={String(p.dur)}
                data-begin={String(p.begin)}
                r={p.r}
                fill={p.fill}
              />
            ))}
          </g>
          {DOT_PATHS_LEFT.map((p) => (
            <path
              key={`path-${p.id}`}
              data-chip-path={p.id}
              d={p.d}
              fill="none"
              stroke="none"
              visibility="hidden"
            />
          ))}
        </svg>

        <svg
          className="pointer-events-none absolute right-0 top-1/2 h-[7.5rem] w-14 -translate-y-1/2 overflow-visible text-facto-gold"
          viewBox="0 0 56 120"
          fill="none"
          aria-hidden
        >
          <g
            data-chip-trails
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.55"
          >
            <path d="M0 30 H22 Q34 30 34 42 V50 Q34 58 46 58 H54" />
            <path d="M0 60 H28 Q40 60 40 72 V86" />
            <path d="M0 90 H20 Q32 90 32 102 H50" />
          </g>
          <g fill="currentColor" data-chip-nodes>
            <circle cx="54" cy="58" r="2.2" />
            <circle cx="40" cy="86" r="1.8" />
            <circle cx="50" cy="102" r="1.8" />
          </g>
          <g className="assistente-chip-dots">
            {DOT_PATHS_RIGHT.map((p) => (
              <circle
                key={p.id}
                data-chip-dot={p.id}
                data-dur={String(p.dur)}
                data-begin={String(p.begin)}
                r={p.r}
                fill={p.fill}
              />
            ))}
          </g>
          {DOT_PATHS_RIGHT.map((p) => (
            <path
              key={`path-${p.id}`}
              data-chip-path={p.id}
              d={p.d}
              fill="none"
              stroke="none"
              visibility="hidden"
            />
          ))}
        </svg>

        <div
          className="pointer-events-none absolute left-1/2 top-1 flex -translate-x-1/2 gap-3"
          aria-hidden
        >
          {[0, 1, 2].map((i) => (
            <span
              key={`pin-t-${i}`}
              className="relative flex flex-col items-center"
            >
              <span
                data-chip-dot-vert
                data-phase={String(i * 0.28)}
                className="assistente-chip-dot-vert mb-0.5 h-1.5 w-1.5 rounded-full bg-[#f0ebd0] shadow-[0_0_6px_rgba(240,235,208,0.9)]"
              />
              <span
                data-chip-pin
                data-phase={String(i * 0.28)}
                className="assistente-chip-pin h-2.5 w-1 rounded-t-sm bg-facto-gold/65"
              />
            </span>
          ))}
        </div>
        <div
          className="pointer-events-none absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-3"
          aria-hidden
        >
          {[0, 1, 2].map((i) => (
            <span
              key={`pin-b-${i}`}
              className="relative flex flex-col items-center"
            >
              <span
                data-chip-pin
                data-phase={String(0.35 + i * 0.3)}
                className="assistente-chip-pin h-2.5 w-1 rounded-b-sm bg-facto-gold/65"
              />
              <span
                data-chip-dot-vert
                data-phase={String(0.35 + i * 0.3)}
                className="assistente-chip-dot-vert mt-0.5 h-1.5 w-1.5 rounded-full bg-[#e8e2c0] shadow-[0_0_6px_rgba(232,226,192,0.85)]"
              />
            </span>
          ))}
        </div>

        <div className="relative z-10 flex items-stretch">
          <div
            className="mr-0.5 flex flex-col justify-center gap-1.5 py-2"
            aria-hidden
          >
            {[0, 1, 2, 3].map((i) => (
              <span
                key={`pin-l-${i}`}
                data-chip-pin
                data-phase={String(i * 0.18)}
                className="assistente-chip-pin h-1 w-2.5 rounded-l-sm bg-facto-gold/70"
              />
            ))}
          </div>

          <div
            ref={bodyRef}
            className="assistente-chip-body relative min-w-[12rem] overflow-hidden rounded-md border border-facto-gold/60 bg-gradient-to-br from-[#2a281f] via-[#1c1c16] to-[#12120e] px-4 py-3"
            style={{ willChange: "box-shadow, border-color" }}
          >
            <span
              className="pointer-events-none absolute inset-[3px] rounded-[3px] border border-facto-gold/20 bg-[linear-gradient(135deg,rgba(144,139,106,0.12)_0%,transparent_45%,rgba(144,139,106,0.06)_100%)]"
              aria-hidden
            />
            <span
              ref={scanRef}
              className="assistente-chip-scan pointer-events-none absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-transparent via-facto-gold/28 to-transparent"
              style={{ willChange: "transform, opacity" }}
              aria-hidden
            />
            <span
              ref={sheenRef}
              className="assistente-chip-sheen pointer-events-none absolute inset-0"
              style={{ willChange: "opacity" }}
              aria-hidden
            />

            <div className="relative text-center">
              <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-facto-gold/85">
                Assinatura FACTO
              </p>
              <p className="mt-0.5 text-sm font-semibold leading-tight text-white">
                Assistente Facto{" "}
                <span className="assistente-ia-shimmer">IA</span>
              </p>
              <p className="mt-0.5 text-[11px] text-stone-400">
                acelera seu processo
              </p>
            </div>
          </div>

          <div
            className="ml-0.5 flex flex-col justify-center gap-1.5 py-2"
            aria-hidden
          >
            {[0, 1, 2, 3].map((i) => (
              <span
                key={`pin-r-${i}`}
                data-chip-pin
                data-phase={String(0.1 + i * 0.18)}
                className="assistente-chip-pin h-1 w-2.5 rounded-r-sm bg-facto-gold/70"
              />
            ))}
          </div>
        </div>
      </button>

      <AssistenteFactoInovacoesModal
        aberto={modal.aberto}
        onFechar={modal.fechar}
      />
    </>
  );
}
