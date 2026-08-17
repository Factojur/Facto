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
  jecr: {
    gradient: "from-stone-900 via-slate-800 to-red-950",
    glow: "bg-orange-300/15",
    accent: "text-orange-200",
    pattern: "radial-gradient(circle at 70% 20%, rgba(253,186,116,0.14), transparent 50%)",
    tags: ["TCO", "Transação penal", "Composição"],
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
  civil: {
    gradient: "from-stone-800 via-stone-700 to-neutral-900",
    glow: "bg-stone-300/15",
    accent: "text-stone-200",
    pattern: "radial-gradient(circle at 30% 70%, rgba(214,211,209,0.12), transparent 50%)",
    tags: ["Obrigações", "Indenização", "Cobrança"],
  },
  familia: {
    gradient: "from-rose-950 via-stone-900 to-rose-950",
    glow: "bg-rose-300/15",
    accent: "text-rose-200",
    pattern: "radial-gradient(circle at 70% 30%, rgba(251,113,133,0.14), transparent 50%)",
    tags: ["Divórcio", "Guarda", "Inventário"],
  },
  imobiliario: {
    gradient: "from-orange-950 via-stone-900 to-amber-950",
    glow: "bg-orange-300/15",
    accent: "text-orange-200",
    pattern: "radial-gradient(circle at 20% 20%, rgba(251,146,60,0.14), transparent 50%)",
    tags: ["Compra e venda", "Usucapião", "Despejo"],
  },
  contratual: {
    gradient: "from-yellow-950 via-stone-900 to-stone-800",
    glow: "bg-yellow-300/15",
    accent: "text-yellow-200",
    pattern: "radial-gradient(circle at 80% 60%, rgba(250,204,21,0.12), transparent 50%)",
    tags: ["Elaboração", "Revisão", "Litígios"],
  },
  tributario: {
    gradient: "from-lime-950 via-stone-900 to-green-950",
    glow: "bg-lime-300/15",
    accent: "text-lime-200",
    pattern: "radial-gradient(circle at 40% 10%, rgba(163,230,53,0.12), transparent 50%)",
    tags: ["Execução fiscal", "Defesa", "Planejamento"],
  },
  administrativo: {
    gradient: "from-blue-950 via-stone-900 to-indigo-950",
    glow: "bg-blue-300/15",
    accent: "text-blue-200",
    pattern: "radial-gradient(circle at 60% 80%, rgba(147,197,253,0.12), transparent 50%)",
    tags: ["Licitações", "MS", "Contratos"],
  },
  constitucional: {
    gradient: "from-amber-950 via-stone-900 to-yellow-950",
    glow: "bg-amber-300/15",
    accent: "text-amber-200",
    pattern: "radial-gradient(circle at 40% 20%, rgba(252,211,77,0.12), transparent 50%)",
    tags: ["Remédios", "RE", "STF"],
  },
  previdenciario: {
    gradient: "from-cyan-950 via-stone-900 to-sky-950",
    glow: "bg-cyan-300/15",
    accent: "text-cyan-200",
    pattern: "radial-gradient(circle at 15% 50%, rgba(103,232,249,0.12), transparent 50%)",
    tags: ["Aposentadoria", "INSS", "Revisão"],
  },
  consumidor: {
    gradient: "from-fuchsia-950 via-stone-900 to-purple-950",
    glow: "bg-fuchsia-300/15",
    accent: "text-fuchsia-200",
    pattern: "radial-gradient(circle at 75% 25%, rgba(232,121,249,0.14), transparent 50%)",
    tags: ["CDC", "Indenização", "Reclamação"],
  },
  digital: {
    gradient: "from-violet-950 via-stone-900 to-indigo-950",
    glow: "bg-violet-300/15",
    accent: "text-violet-200",
    pattern: "radial-gradient(circle at 50% 50%, rgba(167,139,250,0.14), transparent 50%)",
    tags: ["LGPD", "Dados", "Tecnologia"],
  },
  ambiental: {
    gradient: "from-green-950 via-stone-900 to-emerald-950",
    glow: "bg-green-300/15",
    accent: "text-green-200",
    pattern: "radial-gradient(circle at 25% 75%, rgba(74,222,128,0.14), transparent 50%)",
    tags: ["Licenciamento", "TAC", "ACP"],
  },
  "propriedade-intelectual": {
    gradient: "from-pink-950 via-stone-900 to-rose-950",
    glow: "bg-pink-300/15",
    accent: "text-pink-200",
    pattern: "radial-gradient(circle at 85% 40%, rgba(244,114,182,0.14), transparent 50%)",
    tags: ["Marcas", "Patentes", "Autoral"],
  },
  internacional: {
    gradient: "from-sky-950 via-stone-900 to-blue-950",
    glow: "bg-sky-300/15",
    accent: "text-sky-200",
    pattern: "radial-gradient(circle at 45% 15%, rgba(125,211,252,0.14), transparent 50%)",
    tags: ["Contratos", "Homologação", "Cooperação"],
  },
  medico: {
    gradient: "from-teal-950 via-stone-900 to-cyan-950",
    glow: "bg-teal-300/15",
    accent: "text-teal-200",
    pattern: "radial-gradient(circle at 35% 65%, rgba(45,212,191,0.14), transparent 50%)",
    tags: ["Erro médico", "Planos", "Conselhos"],
  },
  agrario: {
    gradient: "from-yellow-950 via-stone-900 to-lime-950",
    glow: "bg-yellow-400/15",
    accent: "text-yellow-100",
    pattern: "radial-gradient(circle at 10% 80%, rgba(250,204,21,0.14), transparent 50%)",
    tags: ["Contratos", "Crédito rural", "Fundiário"],
  },
  eleitoral: {
    gradient: "from-indigo-950 via-stone-900 to-blue-950",
    glow: "bg-indigo-300/15",
    accent: "text-indigo-200",
    pattern: "radial-gradient(circle at 90% 10%, rgba(165,180,252,0.14), transparent 50%)",
    tags: ["Candidatura", "Propaganda", "Contas"],
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
