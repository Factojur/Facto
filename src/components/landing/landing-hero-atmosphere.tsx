"use client";

import { useEffect, useRef } from "react";

const NOS: [number, number][] = [
  [180, 120],
  [340, 200],
  [520, 140],
  [710, 220],
  [900, 160],
  [1040, 240],
  [120, 380],
  [290, 320],
  [470, 400],
  [650, 310],
  [830, 390],
  [1020, 330],
  [220, 560],
  [400, 500],
  [580, 580],
  [760, 490],
  [940, 560],
];

type Particula = {
  x: number;
  y: number;
  speed: number;
  size: number;
  opacity: number;
};

/**
 * Fundo animado do hero — movimento via rAF (não depende só de CSS animation,
 * que some com “reduzir movimento” do Windows).
 */
export function LandingHeroAtmosphere() {
  const rootRef = useRef<HTMLDivElement>(null);
  const orbARef = useRef<HTMLDivElement>(null);
  const orbBRef = useRef<HTMLDivElement>(null);
  const netRef = useRef<SVGGElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = particlesRef.current;
    if (!root || !canvas) return;

    let raf = 0;
    let running = true;
    const start = performance.now();

    const resize = () => {
      const rect = root.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const particulas: Particula[] = Array.from({ length: 28 }, (_, i) => ({
      x: (i * 37) % 100,
      y: 100 + (i % 7) * 8,
      speed: 12 + (i % 5) * 4,
      size: i % 3 === 0 ? 2.5 : 1.6,
      opacity: 0.2 + (i % 4) * 0.08,
    }));

    const tick = (now: number) => {
      if (!running) return;
      const t = (now - start) / 1000;
      const rect = root.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (orbARef.current) {
        const x = Math.sin(t * 0.45) * 28;
        const y = Math.cos(t * 0.35) * 22;
        const s = 1 + Math.sin(t * 0.4) * 0.08;
        orbARef.current.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
        orbARef.current.style.opacity = String(0.4 + Math.sin(t * 0.5) * 0.15);
      }
      if (orbBRef.current) {
        const x = Math.cos(t * 0.38) * -32;
        const y = Math.sin(t * 0.42) * -18;
        const s = 1 + Math.cos(t * 0.36) * 0.1;
        orbBRef.current.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
        orbBRef.current.style.opacity = String(0.32 + Math.cos(t * 0.45) * 0.12);
      }
      if (netRef.current) {
        const x = Math.sin(t * 0.2) * 12;
        const y = Math.cos(t * 0.25) * 8;
        netRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
      if (scanRef.current) {
        const cycle = ((t * 0.12) % 1) * (h + 120) - 60;
        scanRef.current.style.transform = `translateY(${cycle}px)`;
        scanRef.current.style.opacity = String(
          0.25 + Math.sin(t * 0.8) * 0.15
        );
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(-50%, -50%) rotate(${t * 18}deg)`;
      }

      // Pulsar nós SVG
      const nodes = root.querySelectorAll<SVGCircleElement>("[data-atm-node]");
      nodes.forEach((node, i) => {
        const pulse = 0.35 + (Math.sin(t * 2.2 + i * 0.55) + 1) * 0.3;
        node.setAttribute("fill-opacity", String(pulse));
        const base = Number(node.dataset.rBase || "2.2");
        node.setAttribute("r", String(base + Math.sin(t * 2 + i) * 0.6));
      });

      // Links dash offset
      const links = root.querySelectorAll<SVGPathElement>("[data-atm-link]");
      links.forEach((link, i) => {
        link.style.strokeDashoffset = String(
          40 - ((t * 18 + i * 12) % 40)
        );
        link.style.opacity = String(
          0.2 + (Math.sin(t * 1.5 + i) + 1) * 0.15
        );
      });

      const ctx = canvas.getContext("2d");
      if (ctx && w > 0 && h > 0) {
        ctx.clearRect(0, 0, w, h);
        for (const p of particulas) {
          p.y -= (p.speed * 1) / 60;
          if (p.y < -5) {
            p.y = 105 + Math.random() * 10;
            p.x = Math.random() * 100;
          }
          ctx.beginPath();
          ctx.fillStyle = `rgba(144, 139, 106, ${p.opacity})`;
          ctx.arc((p.x / 100) * w, (p.y / 100) * h, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(144,139,106,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(144,139,106,0.07) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, #000 20%, transparent 75%)",
        }}
      />

      <div
        ref={orbARef}
        className="absolute -left-[10%] top-[8%] h-[42vmin] w-[42vmin] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(144,139,106,0.32) 0%, rgba(144,139,106,0.06) 45%, transparent 70%)",
          willChange: "transform, opacity",
        }}
      />
      <div
        ref={orbBRef}
        className="absolute -right-[8%] bottom-[5%] h-[36vmin] w-[36vmin] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(144,139,106,0.28) 0%, rgba(144,139,106,0.05) 45%, transparent 70%)",
          willChange: "transform, opacity",
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full opacity-[0.35]"
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid slice"
      >
        <g
          ref={netRef}
          fill="none"
          stroke="rgb(144, 139, 106)"
          strokeWidth="1.2"
          style={{ willChange: "transform" }}
        >
          <path
            data-atm-link
            strokeDasharray="8 12"
            d="M180 120 L340 200 L520 140 L710 220 L900 160 L1040 240"
          />
          <path
            data-atm-link
            strokeDasharray="8 12"
            d="M120 380 L290 320 L470 400 L650 310 L830 390 L1020 330"
          />
          <path
            data-atm-link
            strokeDasharray="8 12"
            d="M220 560 L400 500 L580 580 L760 490 L940 560"
          />
          <path
            data-atm-link
            strokeDasharray="8 12"
            d="M340 200 L290 320 L400 500"
          />
          <path
            data-atm-link
            strokeDasharray="8 12"
            d="M710 220 L650 310 L760 490"
          />
        </g>
        <g fill="rgb(144, 139, 106)">
          {NOS.map(([cx, cy], i) => (
            <circle
              key={`${cx}-${cy}`}
              data-atm-node
              data-r-base={i % 4 === 0 ? "3.2" : "2.2"}
              cx={cx}
              cy={cy}
              r={i % 4 === 0 ? 3.2 : 2.2}
              fillOpacity="0.55"
            />
          ))}
        </g>
      </svg>

      <div
        ref={scanRef}
        className="absolute inset-x-0 top-0 h-28"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(144,139,106,0.16), transparent)",
          willChange: "transform, opacity",
        }}
      />

      <canvas ref={particlesRef} className="absolute inset-0" />

      <div
        className="absolute left-1/2 top-[42%] h-[min(70vw,520px)] w-[min(70vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-facto-gold/10"
      />
      <div
        ref={ringRef}
        className="absolute left-1/2 top-[42%] h-[min(70vw,520px)] w-[min(70vw,520px)] rounded-full"
        style={{
          border: "1px solid transparent",
          borderTopColor: "rgba(144,139,106,0.35)",
          borderRightColor: "rgba(144,139,106,0.1)",
          willChange: "transform",
        }}
      />
    </div>
  );
}
