export type AreaTema = {
  gradient: string;
  glow: string;
  accent: string;
  pattern: string;
  tags: string[];
};

export const AREA_TEMAS: Record<string, AreaTema> = {
  jec: {
    gradient: "from-slate-800 via-slate-700 to-stone-800",
    glow: "bg-sky-400/20",
    accent: "text-sky-300",
    pattern: "radial-gradient(circle at 20% 80%, rgba(125,211,252,0.15), transparent 50%)",
    tags: ["Consumidor", "Cobrança", "Indenização"],
  },
  trabalhista: {
    gradient: "from-amber-900 via-stone-800 to-amber-950",
    glow: "bg-amber-400/20",
    accent: "text-amber-300",
    pattern: "radial-gradient(circle at 80% 20%, rgba(251,191,36,0.18), transparent 45%)",
    tags: ["Reclamação", "Rescisão", "Horas extras"],
  },
  criminal: {
    gradient: "from-stone-900 via-red-950 to-stone-900",
    glow: "bg-red-400/15",
    accent: "text-red-300",
    pattern: "radial-gradient(circle at 50% 0%, rgba(248,113,113,0.12), transparent 55%)",
    tags: ["Habeas corpus", "Defesa", "Recursos"],
  },
  empresarial: {
    gradient: "from-emerald-950 via-stone-900 to-teal-950",
    glow: "bg-emerald-400/15",
    accent: "text-emerald-300",
    pattern: "radial-gradient(circle at 10% 30%, rgba(52,211,153,0.14), transparent 50%)",
    tags: ["Contratos", "Societário", "Notificações"],
  },
};

export function getAreaTema(id: string): AreaTema {
  return (
    AREA_TEMAS[id] ?? {
      gradient: "from-stone-800 to-stone-900",
      glow: "bg-facto-gold/10",
      accent: "text-facto-gold",
      pattern: "none",
      tags: [],
    }
  );
}
