/**
 * Análise de duplicidade entre precedente candidato e a base/fila.
 * - exata → bloqueia envio à verificação
 * - possivel → sobe com aviso para o admin
 * - nenhuma → sobe limpo
 */

export type NivelDuplicidade = "exata" | "possivel" | "nenhuma";

export type ParComparacao = {
  id?: string;
  titulo: string;
  texto: string;
  url?: string | null;
  numeroProcesso?: string | null;
};

export type ResultadoDuplicidade = {
  nivel: NivelDuplicidade;
  similar?: ParComparacao;
  motivo?: string;
};

function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function soDigitos(s: string): string {
  return s.replace(/\D/g, "");
}

function tokens(s: string): Set<string> {
  const stop = new Set([
    "de",
    "da",
    "do",
    "das",
    "dos",
    "a",
    "o",
    "e",
    "em",
    "no",
    "na",
    "para",
    "com",
    "por",
    "que",
    "um",
    "uma",
    "os",
    "as",
  ]);
  const out = new Set<string>();
  for (const t of normalizar(s).split(/[^a-z0-9]+/)) {
    if (t.length < 4 || stop.has(t)) continue;
    out.add(t);
  }
  return out;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

function extrairUrl(texto: string): string | null {
  const m = texto.match(/https?:\/\/[^\s)]+/i);
  return m?.[0] ?? null;
}

/**
 * Compara candidato com uma lista de existentes (base + fila).
 */
export function analisarDuplicidade(
  candidato: {
    titulo: string;
    ementa: string;
    url?: string | null;
    numeroProcesso?: string | null;
  },
  existentes: ParComparacao[]
): ResultadoDuplicidade {
  const candProc = candidato.numeroProcesso
    ? soDigitos(candidato.numeroProcesso)
    : "";
  const candUrl = (candidato.url || "").trim().toLowerCase();
  const candEmenta = normalizar(candidato.ementa).slice(0, 280);
  const candTitulo = normalizar(candidato.titulo);
  const candTokens = tokens(candidato.ementa);

  let melhorPossivel: ResultadoDuplicidade | null = null;

  for (const ex of existentes) {
    const exProc = ex.numeroProcesso ? soDigitos(ex.numeroProcesso) : "";
    const exUrl = (
      ex.url ||
      extrairUrl(ex.texto) ||
      ""
    )
      .trim()
      .toLowerCase();
    const exEmenta = normalizar(ex.texto).slice(0, 280);
    const exTitulo = normalizar(ex.titulo);

    if (candProc && exProc && candProc.length >= 10 && candProc === exProc) {
      return {
        nivel: "exata",
        similar: ex,
        motivo: `Mesmo número de processo (${candidato.numeroProcesso}).`,
      };
    }

    if (candUrl && exUrl && candUrl === exUrl) {
      return {
        nivel: "exata",
        similar: ex,
        motivo: "Mesmo link oficial do acórdão.",
      };
    }

    if (
      candEmenta.length > 80 &&
      exEmenta.length > 80 &&
      candEmenta === exEmenta
    ) {
      return {
        nivel: "exata",
        similar: ex,
        motivo: "Ementa idêntica (trecho inicial).",
      };
    }

    if (candTitulo && exTitulo && candTitulo === exTitulo) {
      return {
        nivel: "exata",
        similar: ex,
        motivo: "Mesmo título na base/fila.",
      };
    }

    const score = jaccard(candTokens, tokens(ex.texto));
    const tituloParecido =
      candTitulo.length > 12 &&
      exTitulo.length > 12 &&
      (candTitulo.includes(exTitulo.slice(0, 40)) ||
        exTitulo.includes(candTitulo.slice(0, 40)));

    if (score >= 0.82 || (score >= 0.65 && tituloParecido)) {
      const cand: ResultadoDuplicidade = {
        nivel: "possivel",
        similar: ex,
        motivo: `Similaridade textual ~${Math.round(score * 100)}%${
          tituloParecido ? " e título parecido" : ""
        }.`,
      };
      if (
        !melhorPossivel ||
        (cand.motivo &&
          melhorPossivel.motivo &&
          score >
            Number(melhorPossivel.motivo.match(/(\d+)%/)?.[1] ?? 0) / 100)
      ) {
        melhorPossivel = cand;
      }
    }
  }

  return melhorPossivel ?? { nivel: "nenhuma" };
}
