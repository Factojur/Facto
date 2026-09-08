/**
 * Modelos de peça no Tom do escritório — 1 ativo por espécie (MVP).
 * Parâmetro de forma; nunca trava a IA (autos + lastro prevalecem).
 */

export const MAX_MODELOS_TOM = 12;
export const MAX_CHARS_MODELO_TOM = 40_000;
export const MIN_CHARS_MODELO_TOM = 200;

export type ModeloPecaTom = {
  especieId: string;
  nome: string;
  texto: string;
  atualizadoEm: string;
};

/** Espécies mais comuns para o seletor do Tom (id canônico). */
export const ESPECIES_SUGESTAO_MODELO_TOM: ReadonlyArray<{
  id: string;
  rotulo: string;
}> = [
  { id: "peticao-inicial", rotulo: "Petição inicial" },
  { id: "contestacao", rotulo: "Contestação" },
  { id: "replica", rotulo: "Réplica" },
  { id: "recurso-inominado", rotulo: "Recurso inominado" },
  { id: "apelacao", rotulo: "Apelação" },
  { id: "agravo-instrumento", rotulo: "Agravo de instrumento" },
  { id: "embargos-declaracao", rotulo: "Embargos de declaração" },
  { id: "execucao", rotulo: "Execução / cumprimento" },
  { id: "reclamacao-trabalhista", rotulo: "Reclamação trabalhista" },
  { id: "habeas-corpus", rotulo: "Habeas corpus" },
  { id: "mandado-seguranca", rotulo: "Mandado de segurança" },
  { id: "queixa-crime", rotulo: "Queixa-crime" },
];

export function normalizarEspecieModeloId(raw: string): string {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export function parseEstiloModelosJson(
  raw: unknown
): Record<string, ModeloPecaTom> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, ModeloPecaTom> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const id = normalizarEspecieModeloId(k);
    if (!id || !v || typeof v !== "object") continue;
    const o = v as Record<string, unknown>;
    const texto = String(o.texto ?? "").trim();
    const nome = String(o.nome ?? "").trim() || "Modelo do escritório";
    const atualizadoEm =
      String(o.atualizadoEm ?? "").trim() || new Date().toISOString();
    if (texto.length < MIN_CHARS_MODELO_TOM) continue;
    out[id] = {
      especieId: id,
      nome: nome.slice(0, 200),
      texto: texto.slice(0, MAX_CHARS_MODELO_TOM),
      atualizadoEm,
    };
  }
  return out;
}

export function listarModelosTomMeta(
  mapa: Record<string, ModeloPecaTom>
): Array<{
  especieId: string;
  nome: string;
  chars: number;
  atualizadoEm: string;
  rotuloSugestao: string | null;
}> {
  return Object.values(mapa)
    .map((m) => ({
      especieId: m.especieId,
      nome: m.nome,
      chars: m.texto.length,
      atualizadoEm: m.atualizadoEm,
      rotuloSugestao:
        ESPECIES_SUGESTAO_MODELO_TOM.find((e) => e.id === m.especieId)?.rotulo ??
        null,
    }))
    .sort((a, b) => a.especieId.localeCompare(b.especieId, "pt-BR"));
}

export function upsertModeloTom(
  mapa: Record<string, ModeloPecaTom>,
  input: { especieId: string; nome: string; texto: string }
): { ok: true; mapa: Record<string, ModeloPecaTom> } | { ok: false; erro: string } {
  const especieId = normalizarEspecieModeloId(input.especieId);
  if (!especieId) return { ok: false, erro: "Informe o tipo de peça (espécie)." };
  const texto = input.texto.trim();
  if (texto.length < MIN_CHARS_MODELO_TOM) {
    return {
      ok: false,
      erro: `Modelo com pouco texto (mín. ${MIN_CHARS_MODELO_TOM} caracteres).`,
    };
  }
  const next = { ...mapa };
  const jaExiste = Boolean(next[especieId]);
  if (!jaExiste && Object.keys(next).length >= MAX_MODELOS_TOM) {
    return {
      ok: false,
      erro: `Limite de ${MAX_MODELOS_TOM} modelos no Tom. Remova um para adicionar outro.`,
    };
  }
  next[especieId] = {
    especieId,
    nome: (input.nome.trim() || "Modelo do escritório").slice(0, 200),
    texto: texto.slice(0, MAX_CHARS_MODELO_TOM),
    atualizadoEm: new Date().toISOString(),
  };
  return { ok: true, mapa: next };
}

export function removerModeloTom(
  mapa: Record<string, ModeloPecaTom>,
  especieIdRaw: string
): Record<string, ModeloPecaTom> {
  const id = normalizarEspecieModeloId(especieIdRaw);
  if (!id || !mapa[id]) return mapa;
  const next = { ...mapa };
  delete next[id];
  return next;
}

export function buscarModeloTomPorEspecie(
  mapa: Record<string, ModeloPecaTom>,
  especieIdRaw: string | null | undefined
): ModeloPecaTom | null {
  const id = normalizarEspecieModeloId(especieIdRaw ?? "");
  if (!id) return null;
  return mapa[id] ?? null;
}
