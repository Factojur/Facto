export type SumulaTribunal = "STF" | "STJ" | "TST" | "TSE";

export type SumulaLoteItem = {
  titulo: string;
  categoria: "Súmula";
  texto: string;
  status: "ativa" | "cancelada" | "superada" | "pendente_publicacao";
  tribunal: SumulaTribunal;
  numero: string;
  qualidade: "alta" | "media" | "revisar";
  fonte: string;
};

/** Atalho para montar item de Súmula Vinculante STF ativa. */
export function svStf(numero: number, enunciado: string): SumulaLoteItem {
  return {
    titulo: `Súmula Vinculante ${numero} do STF`,
    categoria: "Súmula",
    numero: `SV ${numero}`,
    tribunal: "STF",
    status: "ativa",
    qualidade: "alta",
    fonte: "Portal STF — Súmulas Vinculantes (enunciado consolidado)",
    texto: `Súmula Vinculante ${numero}/STF (ATIVA): ${enunciado.trim()}`,
  };
}

/** Atalho para Súmula do STF (não vinculante; ativa por padrão). */
export function sumulaStf(
  numero: number,
  enunciado: string,
  opcoes?: { status?: SumulaLoteItem["status"]; qualidade?: SumulaLoteItem["qualidade"] }
): SumulaLoteItem {
  const status = opcoes?.status ?? "ativa";
  const qualidade = opcoes?.qualidade ?? (status === "ativa" ? "alta" : "revisar");
  const rotulo =
    status === "cancelada"
      ? "CANCELADA"
      : status === "superada"
        ? "SUPERADA"
        : status === "pendente_publicacao"
          ? "PENDENTE"
          : "ATIVA";
  return {
    titulo: `Súmula ${numero} do STF`,
    categoria: "Súmula",
    numero: `STF ${numero}`,
    tribunal: "STF",
    status,
    qualidade,
    fonte: "STF — Súmulas (enunciados não vinculantes)",
    texto: `Súmula ${numero}/STF (${rotulo}): ${enunciado.trim()}`,
  };
}

/** Atalho para Súmula do STJ (ativa por padrão). */
export function sumulaStj(
  numero: number,
  enunciado: string,
  opcoes?: { status?: SumulaLoteItem["status"]; qualidade?: SumulaLoteItem["qualidade"] }
): SumulaLoteItem {
  const status = opcoes?.status ?? "ativa";
  const qualidade = opcoes?.qualidade ?? (status === "ativa" ? "alta" : "revisar");
  const rotulo =
    status === "cancelada"
      ? "CANCELADA"
      : status === "superada"
        ? "SUPERADA"
        : status === "pendente_publicacao"
          ? "PENDENTE"
          : "ATIVA";
  return {
    titulo: `Súmula ${numero} do STJ`,
    categoria: "Súmula",
    numero: `STJ ${numero}`,
    tribunal: "STJ",
    status,
    qualidade,
    fonte: "STJ — Enunciados das Súmulas (VerbetesSTJ)",
    texto: `Súmula ${numero}/STJ (${rotulo}): ${enunciado.trim()}`,
  };
}

function rotuloStatus(status: SumulaLoteItem["status"]): string {
  if (status === "cancelada") return "CANCELADA";
  if (status === "superada") return "SUPERADA";
  if (status === "pendente_publicacao") return "PENDENTE";
  return "ATIVA";
}

/** Atalho para Súmula do TST (ativa por padrão). */
export function sumulaTst(
  numero: number,
  enunciado: string,
  opcoes?: { status?: SumulaLoteItem["status"]; qualidade?: SumulaLoteItem["qualidade"] }
): SumulaLoteItem {
  const status = opcoes?.status ?? "ativa";
  const qualidade = opcoes?.qualidade ?? (status === "ativa" ? "alta" : "revisar");
  const rotulo = rotuloStatus(status);
  return {
    titulo: `Súmula ${numero} do TST`,
    categoria: "Súmula",
    numero: `TST ${numero}`,
    tribunal: "TST",
    status,
    qualidade,
    fonte: "TST — Livro de Súmulas, OJs e PNs (portal TST)",
    texto: `Súmula ${numero}/TST (${rotulo}): ${enunciado.trim()}`,
  };
}

/** Atalho para Súmula do TSE (ativa por padrão). */
export function sumulaTse(
  numero: number,
  enunciado: string,
  opcoes?: { status?: SumulaLoteItem["status"]; qualidade?: SumulaLoteItem["qualidade"] }
): SumulaLoteItem {
  const status = opcoes?.status ?? "ativa";
  const qualidade = opcoes?.qualidade ?? (status === "ativa" ? "alta" : "revisar");
  const rotulo = rotuloStatus(status);
  return {
    titulo: `Súmula ${numero} do TSE`,
    categoria: "Súmula",
    numero: `TSE ${numero}`,
    tribunal: "TSE",
    status,
    qualidade,
    fonte: "TSE — Súmulas do TSE (portal TSE)",
    texto: `Súmula ${numero}/TSE (${rotulo}): ${enunciado.trim()}`,
  };
}

export function sumulasAtivasParaBase(
  lotes: SumulaLoteItem[][]
): { titulo: string; categoria: "Súmula"; texto: string }[] {
  return lotes
    .flat()
    .filter((s) => s.status === "ativa" && s.qualidade !== "revisar")
    .map((s) => ({
      titulo: s.titulo,
      categoria: s.categoria,
      texto: s.texto,
    }));
}
