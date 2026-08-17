"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AreaAtuacao } from "@/lib/areas-atuacao";
import { hrefModuloArea } from "@/lib/areas-atuacao";
import { AreaIllustration } from "@/components/dashboard/area-illustration";

/** Rótulos curtos no estilo do mockup híbrido. */
export const ROTULO_AREA_BOTAO: Record<string, string> = {
  jec: "JEC",
  civil: "Cível",
  consumidor: "Consumidor",
  tributario: "Tributário",
  familia: "Família e Sucessões",
  trabalhista: "Trabalhista",
  previdenciario: "Previdenciário",
  criminal: "Penal",
  constitucional: "Constitucional",
  jecr: "JECRIM",
  imobiliario: "Imobiliário",
  empresarial: "Empresarial",
  administrativo: "Administrativo",
  medico: "Médico",
  digital: "Digital",
  ambiental: "Ambiental",
  "propriedade-intelectual": "PI",
  agrario: "Agrário",
  internacional: "Internacional",
  eleitoral: "Eleitoral",
  contratual: "Contratual",
};

/** Arestas do circuito de fundo (coordenadas 0–100). */
const CIRCUITO: [number, number, number, number][] = [
  [5, 12, 22, 28],
  [22, 28, 40, 18],
  [40, 18, 58, 32],
  [58, 32, 78, 22],
  [78, 22, 95, 38],
  [8, 48, 28, 55],
  [28, 55, 48, 42],
  [48, 42, 68, 58],
  [68, 58, 88, 48],
  [12, 78, 32, 70],
  [32, 70, 52, 82],
  [52, 82, 72, 68],
  [72, 68, 92, 80],
  [22, 28, 28, 55],
  [58, 32, 68, 58],
  [40, 18, 48, 42],
  [78, 22, 88, 48],
  [28, 55, 32, 70],
  [48, 42, 52, 82],
];

const NOS_CIRCUITO: [number, number][] = [
  [5, 12],
  [22, 28],
  [40, 18],
  [58, 32],
  [78, 22],
  [95, 38],
  [8, 48],
  [28, 55],
  [48, 42],
  [68, 58],
  [88, 48],
  [12, 78],
  [32, 70],
  [52, 82],
  [72, 68],
  [92, 80],
];

function preferReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Circuito neural suave — ritmo da landing (drift lento + nós miúdos). */
export function CircuitoNeuralAnimado({
  className = "",
}: {
  className?: string;
}) {
  const gid = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const netRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const soft = preferReducedMotion();
    let raf = 0;
    const t0 = performance.now();

    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      const net = netRef.current;
      if (net) {
        // Drift bem suave, como o net da landing (sin/cos lentos)
        const x = Math.sin(t * 0.18) * (soft ? 4 : 10);
        const y = Math.cos(t * 0.22) * (soft ? 3 : 7);
        net.style.transform = `translate(${x}px, ${y}px)`;
      }

      const root = rootRef.current;
      if (root) {
        const nodes = root.querySelectorAll<SVGCircleElement>("[data-circ-node]");
        nodes.forEach((node, i) => {
          const base = Number(node.dataset.rBase || "0.22");
          const pulse =
            0.28 + (Math.sin(t * 1.1 + i * 0.55) + 1) * (soft ? 0.12 : 0.22);
          node.setAttribute("opacity", String(pulse));
          node.setAttribute(
            "r",
            String(base + Math.sin(t * 0.9 + i * 0.4) * (soft ? 0.02 : 0.04))
          );
        });

        const links = root.querySelectorAll<SVGLineElement>("[data-circ-link]");
        links.forEach((link, i) => {
          link.style.opacity = String(
            0.18 + (Math.sin(t * 0.9 + i * 0.4) + 1) * 0.1
          );
        });

        // Partículas miúdas percorrendo as arestas — bem lentas
        const parts = root.querySelectorAll<SVGCircleElement>("[data-circ-part]");
        const speed = soft ? 0.04 : 0.07;
        CIRCUITO.forEach(([x1, y1, x2, y2], i) => {
          const dot = parts[i];
          if (!dot) return;
          const u = (t * (speed + (i % 5) * 0.012) + i * 0.15) % 1;
          // Ease suave (quase idle)
          const e = u * u * (3 - 2 * u);
          dot.setAttribute("cx", String(x1 + (x2 - x1) * e));
          dot.setAttribute("cy", String(y1 + (y2 - y1) * e));
        });
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={rootRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <svg
        ref={netRef}
        className="absolute inset-0 h-full w-full will-change-transform"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id={`circ-fade-${gid}`} cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#908b6a" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#908b6a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#circ-fade-${gid})`} />
        {CIRCUITO.map(([x1, y1, x2, y2], i) => (
          <line
            key={`e-${i}`}
            data-circ-link
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#908b6a"
            strokeWidth="0.1"
            opacity="0.28"
          />
        ))}
        {NOS_CIRCUITO.map(([cx, cy], i) => (
          <circle
            key={`n-${i}`}
            data-circ-node
            data-r-base={i % 3 === 0 ? "0.28" : "0.18"}
            cx={cx}
            cy={cy}
            r={i % 3 === 0 ? 0.28 : 0.18}
            fill="#908b6a"
            opacity="0.4"
          />
        ))}
        {CIRCUITO.map(([x1, y1], i) => (
          <circle
            key={`p-${i}`}
            data-circ-part
            cx={x1}
            cy={y1}
            r="0.22"
            fill="#c4bf9a"
            opacity="0.55"
          />
        ))}
      </svg>
    </div>
  );
}

export function AreasMalhaFundo({ className = "" }: { className?: string }) {
  return <CircuitoNeuralAnimado className={className} />;
}

/** Rótulos curtos no nó do grafo (preview). */
const ROTULO_CURTO = ROTULO_AREA_BOTAO;

/** Arestas do grafo desktop (preview). */
const ARESTAS: [string, string][] = [
  ["jec", "civil"],
  ["jec", "consumidor"],
  ["jec", "jecr"],
  ["jec", "familia"],
  ["civil", "consumidor"],
  ["civil", "familia"],
  ["civil", "imobiliario"],
  ["civil", "empresarial"],
  ["civil", "medico"],
  ["civil", "digital"],
  ["consumidor", "medico"],
  ["consumidor", "tributario"],
  ["criminal", "jecr"],
  ["criminal", "digital"],
  ["criminal", "constitucional"],
  ["constitucional", "administrativo"],
  ["trabalhista", "previdenciario"],
  ["trabalhista", "jec"],
  ["tributario", "administrativo"],
  ["tributario", "empresarial"],
  ["ambiental", "administrativo"],
  ["ambiental", "agrario"],
  ["empresarial", "propriedade-intelectual"],
  ["imobiliario", "agrario"],
  ["imobiliario", "familia"],
  ["internacional", "empresarial"],
  ["eleitoral", "administrativo"],
  ["medico", "previdenciario"],
  ["digital", "propriedade-intelectual"],
];

const POS_FIXA: Record<string, { x: number; y: number }> = {
  jec: { x: 50, y: 46 },
  civil: { x: 38, y: 38 },
  consumidor: { x: 62, y: 34 },
  familia: { x: 28, y: 52 },
  trabalhista: { x: 72, y: 48 },
  tributario: { x: 58, y: 58 },
  criminal: { x: 22, y: 32 },
  constitucional: { x: 46, y: 28 },
  jecr: { x: 18, y: 48 },
  previdenciario: { x: 78, y: 32 },
  imobiliario: { x: 42, y: 66 },
  empresarial: { x: 68, y: 68 },
  administrativo: { x: 84, y: 56 },
  medico: { x: 52, y: 22 },
  digital: { x: 34, y: 22 },
  ambiental: { x: 88, y: 40 },
  "propriedade-intelectual": { x: 80, y: 72 },
  agrario: { x: 30, y: 72 },
  internacional: { x: 14, y: 62 },
  eleitoral: { x: 12, y: 28 },
};

type NodePos = { id: string; x: number; y: number };

function layoutNos(ids: string[]): NodePos[] {
  const placed = new Set<string>();
  const nodes: NodePos[] = [];
  for (const id of ids) {
    const fix = POS_FIXA[id];
    if (fix) {
      nodes.push({ id, x: fix.x, y: fix.y });
      placed.add(id);
    }
  }
  const missing = ids.filter((id) => !placed.has(id));
  missing.forEach((id, i) => {
    const angle =
      (i / Math.max(missing.length, 1)) * Math.PI * 2 - Math.PI / 2;
    nodes.push({
      id,
      x: 50 + Math.cos(angle) * 36,
      y: 48 + Math.sin(angle) * 30,
    });
  });
  return nodes;
}

type GrafoProps = {
  areas: AreaAtuacao[];
  liberada: (id: string) => boolean;
  previewInterno?: boolean;
};

/** Preview do grafo (não usado no dashboard atual). */
export function AreasGrafoDesktop({
  areas,
  liberada,
  previewInterno = false,
}: GrafoProps) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const edgeLayerRef = useRef<SVGGElement>(null);
  const particleLayerRef = useRef<SVGGElement>(null);
  const nodeEls = useRef<Map<string, HTMLElement>>(new Map());
  const gid = useId().replace(/:/g, "");

  const ids = useMemo(() => areas.map((a) => a.id), [areas]);
  const base = useMemo(() => layoutNos(ids), [ids]);
  const byId = useMemo(() => new Map(areas.map((a) => [a.id, a])), [areas]);
  const edges = useMemo(() => {
    const set = new Set(ids);
    return ARESTAS.filter(([a, b]) => set.has(a) && set.has(b));
  }, [ids]);
  const vizinhos = useMemo(() => {
    if (!hoverId) return new Set<string>();
    const s = new Set<string>([hoverId]);
    for (const [a, b] of edges) {
      if (a === hoverId) s.add(b);
      if (b === hoverId) s.add(a);
    }
    return s;
  }, [hoverId, edges]);
  const baseMap = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    for (const n of base) m.set(n.id, { x: n.x, y: n.y });
    return m;
  }, [base]);

  useEffect(() => {
    const soft = preferReducedMotion();
    const amp = soft ? 1.2 : 2.6;
    const ampY = soft ? 1.0 : 2.1;
    let raf = 0;
    const t0 = performance.now();
    const live = new Map<string, { x: number; y: number }>();

    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      base.forEach((n, i) => {
        const phase = i * 0.85;
        const x = n.x + Math.sin(t * 0.75 + phase) * amp;
        const y = n.y + Math.cos(t * 0.58 + phase * 1.15) * ampY;
        live.set(n.id, { x, y });
        const el = nodeEls.current.get(n.id);
        if (el) {
          el.style.left = `${x}%`;
          el.style.top = `${y}%`;
        }
      });
      const edgeGroup = edgeLayerRef.current;
      if (edgeGroup) {
        const lines = edgeGroup.querySelectorAll("line");
        edges.forEach(([a, b], i) => {
          const pa = live.get(a);
          const pb = live.get(b);
          const line = lines[i];
          if (!pa || !pb || !line) return;
          line.setAttribute("x1", String(pa.x));
          line.setAttribute("y1", String(pa.y));
          line.setAttribute("x2", String(pb.x));
          line.setAttribute("y2", String(pb.y));
        });
      }
      const partGroup = particleLayerRef.current;
      if (partGroup) {
        const dots = partGroup.querySelectorAll("circle");
        const speedMul = soft ? 0.12 : 0.22;
        edges.forEach(([a, b], i) => {
          const pa = live.get(a);
          const pb = live.get(b);
          const dot = dots[i];
          if (!pa || !pb || !dot) return;
          const u = (t * (speedMul + (i % 5) * 0.035) + i * 0.17) % 1;
          dot.setAttribute("cx", String(pa.x + (pb.x - pa.x) * u));
          dot.setAttribute("cy", String(pa.y + (pb.y - pa.y) * u));
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [base, edges]);

  if (areas.length === 0) return null;

  return (
    <div
      className="relative hidden min-h-[560px] overflow-hidden rounded-2xl border border-white/10 bg-[#14140f] lg:block"
      role="navigation"
      aria-label="Rede de áreas de atuação"
    >
      <CircuitoNeuralAnimado className="opacity-70" />
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        aria-hidden
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`edge-${gid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#908b6a" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#908b6a" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#908b6a" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <g ref={edgeLayerRef}>
          {edges.map(([a, b]) => {
            const pa = baseMap.get(a)!;
            const pb = baseMap.get(b)!;
            const active =
              hoverId !== null && (vizinhos.has(a) || vizinhos.has(b));
            return (
              <line
                key={`${a}-${b}`}
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                stroke={active ? "#d4cfa8" : `url(#edge-${gid})`}
                strokeWidth={active ? 0.4 : 0.16}
                opacity={hoverId && !active ? 0.15 : 1}
              />
            );
          })}
        </g>
        <g ref={particleLayerRef}>
          {edges.map(([a, b]) => {
            const pa = baseMap.get(a)!;
            const pb = baseMap.get(b)!;
            return (
              <circle
                key={`p-${a}-${b}`}
                cx={(pa.x + pb.x) / 2}
                cy={(pa.y + pb.y) / 2}
                r="0.45"
                fill="#c4bf9a"
                opacity="0.85"
              />
            );
          })}
        </g>
      </svg>
      <div className="relative z-10 h-full min-h-[560px] w-full">
        {base.map((n, i) => {
          const area = byId.get(n.id);
          if (!area) return null;
          const href = hrefModuloArea(area, previewInterno);
          const ok = Boolean(href && liberada(area.id));
          const lit = hoverId === null || vizinhos.has(n.id);
          const focused = hoverId === n.id;
          const rotulo = ROTULO_CURTO[n.id] ?? area.title;
          const inner = (
            <span
              className={`flex flex-col items-center gap-1.5 transition duration-300 ${
                lit ? "opacity-100" : "opacity-30"
              } ${focused ? "scale-110" : "scale-100"}`}
            >
              <span
                className={`relative flex h-14 w-14 items-center justify-center rounded-full border bg-[#1c1c16]/95 facto-node-pulse ${
                  focused
                    ? "border-facto-gold shadow-[0_0_28px_rgba(144,139,106,0.55)]"
                    : "border-facto-gold/45"
                }`}
                style={{ animationDelay: `${(i % 9) * 0.35}s` }}
              >
                <AreaIllustration
                  areaId={area.id}
                  className="h-8 w-8 text-facto-gold"
                />
              </span>
              <span className="max-w-[7.5rem] text-center text-[11px] font-semibold text-white/75">
                {rotulo}
              </span>
            </span>
          );
          return (
            <div
              key={n.id}
              ref={(el) => {
                if (el) nodeEls.current.set(n.id, el);
                else nodeEls.current.delete(n.id);
              }}
              className="absolute z-10"
              style={{
                left: `${n.x}%`,
                top: `${n.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              onMouseEnter={() => setHoverId(n.id)}
              onMouseLeave={() => setHoverId(null)}
            >
              {ok && href ? (
                <Link href={href} className="block" title={area.title}>
                  {inner}
                </Link>
              ) : (
                <div className="opacity-70">{inner}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Grade híbrida: circuito neural + cards (desktop e mobile). */
export function AreasGradeHibrida({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden py-2">
      <CircuitoNeuralAnimado className="opacity-80" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
