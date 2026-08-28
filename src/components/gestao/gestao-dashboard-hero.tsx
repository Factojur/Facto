"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FactoLogo } from "@/components/brand/facto-logo";
import { FACTO_TAGLINE } from "@/components/brand/facto-logo";
import { JusticaWatermark } from "@/components/dashboard/justica-watermark";

function saudacao(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function GestaoHeroAtmosphere() {
  const orbARef = useRef<HTMLDivElement>(null);
  const orbBRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let raf = 0;
    let running = true;
    const start = performance.now();

    const tick = (now: number) => {
      if (!running) return;
      const t = (now - start) / 1000;

      if (orbARef.current) {
        const x = Math.sin(t * 0.5) * 18;
        const y = Math.cos(t * 0.4) * 14;
        orbARef.current.style.transform = `translate(${x}px, ${y}px)`;
        orbARef.current.style.opacity = String(0.35 + Math.sin(t * 0.55) * 0.12);
      }
      if (orbBRef.current) {
        const x = Math.cos(t * 0.42) * -22;
        const y = Math.sin(t * 0.38) * 12;
        orbBRef.current.style.transform = `translate(${x}px, ${y}px)`;
        orbBRef.current.style.opacity = String(0.28 + Math.cos(t * 0.48) * 0.1);
      }
      if (scanRef.current) {
        const y = ((t * 0.08) % 1) * 120 - 20;
        scanRef.current.style.transform = `translateY(${y}%)`;
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
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(144,139,106,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(144,139,106,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 70% 30%, #000 15%, transparent 72%)",
        }}
      />
      <div
        ref={orbARef}
        className="absolute -left-[5%] top-[5%] h-56 w-56 rounded-full md:h-72 md:w-72"
        style={{
          background:
            "radial-gradient(circle, rgba(144,139,106,0.28) 0%, rgba(144,139,106,0.04) 50%, transparent 72%)",
          willChange: "transform, opacity",
        }}
      />
      <div
        ref={orbBRef}
        className="absolute bottom-0 right-[10%] h-48 w-48 rounded-full md:h-64 md:w-64"
        style={{
          background:
            "radial-gradient(circle, rgba(144,139,106,0.22) 0%, transparent 68%)",
          willChange: "transform, opacity",
        }}
      />
      <div
        ref={scanRef}
        className="absolute inset-x-0 top-0 h-24 opacity-40"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(144,139,106,0.14), transparent)",
          willChange: "transform",
        }}
      />
    </div>
  );
}

function GestaoHeroWatermark() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const svg = wrap.querySelector("svg");
    if (!svg) return;

    if (reduced) return;

    const yoke = svg.querySelector<SVGGElement>(".justica-wm-yoke");
    const panL = svg.querySelector<SVGGElement>(".justica-wm-pan--left");
    const panR = svg.querySelector<SVGGElement>(".justica-wm-pan--right");

    let raf = 0;
    let running = true;
    const start = performance.now();

    const tick = (now: number) => {
      if (!running) return;
      const t = (now - start) / 1000;
      const floatY = Math.sin(t * 0.65) * 10;
      const floatR = Math.sin(t * 0.5) * 1.6;
      wrap.style.transform = `translateY(${floatY}px) rotate(${floatR}deg)`;

      if (yoke) {
        const tilt = Math.sin(t * 1) * 3.5;
        yoke.setAttribute("transform", `rotate(${tilt} 180 108)`);
      }
      if (panL) {
        panL.setAttribute("transform", `translate(0 ${Math.sin(t * 1) * 6})`);
      }
      if (panR) {
        panR.setAttribute(
          "transform",
          `translate(0 ${Math.sin(t * 1 + Math.PI) * 6})`
        );
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
      className="pointer-events-none absolute -bottom-6 -right-4 z-0 h-[min(38vh,320px)] w-[min(38vh,320px)] opacity-[0.2] sm:-right-2 sm:opacity-[0.26] md:h-[min(42vh,380px)] md:w-[min(42vh,380px)]"
      style={{ willChange: "transform", transformOrigin: "70% 85%" }}
      aria-hidden
    >
      <JusticaWatermark className="h-full w-full" />
    </div>
  );
}

type Props = {
  nomeUsuario?: string;
  processosAtivos: number;
  prazosVencidos: number;
  prazosHoje: number;
  compromissosHoje: number;
};

export function GestaoDashboardHero({
  nomeUsuario,
  processosAtivos,
  prazosVencidos,
  prazosHoje,
  compromissosHoje,
}: Props) {
  const [montado, setMontado] = useState(false);
  const primeiroNome = nomeUsuario?.split(/\s+/)[0];
  const urgentes = prazosVencidos + prazosHoje;

  useEffect(() => {
    setMontado(true);
  }, []);

  const fade = (delayMs: number) =>
    montado
      ? { animation: `fade-up 0.65s ease-out ${delayMs}ms both` }
      : { opacity: 0 };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-facto-gold/25 bg-gradient-to-br from-stone-900 via-facto-dark to-stone-950 shadow-xl shadow-black/30">
      <GestaoHeroAtmosphere />
      <GestaoHeroWatermark />

      <div className="relative z-10 px-6 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3" style={fade(0)}>
              <FactoLogo variant="icon" size="xs" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-facto-gold">
                  FACTO Gestão
                </p>
                <p className="text-[11px] text-stone-500">{FACTO_TAGLINE}</p>
              </div>
            </div>

            <h2
              className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
              style={fade(80)}
            >
              {saudacao()}
              {primeiroNome ? `, ${primeiroNome}` : ""}
            </h2>
            <p
              className="mt-3 max-w-xl text-sm leading-relaxed text-stone-400 sm:text-base"
              style={fade(160)}
            >
              Painel do escritório com a mesma identidade do FACTO — prazos,
              audiências e pastas em um só lugar, separado das minutas.
            </p>

            <div
              className="mt-6 flex flex-wrap gap-2"
              style={fade(240)}
            >
              <Link
                href="/gestao/prazos"
                className="inline-flex items-center rounded-xl bg-facto-gold px-4 py-2 text-xs font-semibold text-facto-dark shadow-md shadow-facto-gold/15 transition hover:bg-[#b8ae8a]"
              >
                Ver prazos
              </Link>
            </div>
          </div>

          <div
            className="grid grid-cols-3 gap-2 sm:gap-3 lg:min-w-[280px]"
            style={fade(320)}
          >
            <div
              className={`rounded-xl border px-3 py-3 backdrop-blur-sm ${
                urgentes > 0
                  ? "border-red-900/50 bg-red-950/30"
                  : "border-stone-800/80 bg-stone-950/40"
              }`}
            >
              <p className="text-[10px] uppercase tracking-wider text-stone-500">
                Urgentes
              </p>
              <p
                className={`mt-1 text-2xl font-semibold tabular-nums ${
                  urgentes > 0 ? "text-red-200" : "text-white"
                }`}
              >
                {urgentes}
              </p>
            </div>
            <div className="rounded-xl border border-stone-800/80 bg-stone-950/40 px-3 py-3 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-wider text-stone-500">
                Hoje
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-facto-gold">
                {compromissosHoje}
              </p>
              <p className="text-[10px] text-stone-600">agenda</p>
            </div>
            <div className="rounded-xl border border-stone-800/80 bg-stone-950/40 px-3 py-3 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-wider text-stone-500">
                Ativos
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
                {processosAtivos}
              </p>
              <p className="text-[10px] text-stone-600">pastas</p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative z-10 h-px bg-gradient-to-r from-transparent via-facto-gold/40 to-transparent"
        aria-hidden
      />
    </section>
  );
}
