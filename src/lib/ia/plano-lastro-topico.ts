/**
 * Lastro por tópico — camada B (LASTRO: na triagem) + camada A (fallback local).
 */

import type { ItemCoberturaTese } from "@/lib/ia/cobertura-teses-peca";
import type { LastroTopicoItem, TopicoPlanejado, TipoLastroTopico } from "@/lib/ia/plano-topicos-peca";

const RE_FLS = /\bfls?\.?\s*(\d+)/gi;
const RE_LEI =
  /\b(?:art(?:igo)?\.?\s*\d+[º°]?(?:\s*,\s*(?:inciso\s+[IVXLCDM]+|§\s*\d+[º°]?))?[^|;,]{0,40}(?:constitui[cç][aã]o federal|c[oó]digo de processo civil|c[oó]digo civil|cpc|cf|lei\s+n?[º°.]?\s*[\d./]+(?:\/\d{2,4})?)|lei\s+n?[º°.]?\s*[\d./]+(?:\/\d{2,4})?)\b/gi;

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function palavrasChave(texto: string, min = 5): string[] {
  return norm(texto)
    .split(/\s+/)
    .filter((w) => w.length >= min);
}

function dedupLastro(itens: LastroTopicoItem[]): LastroTopicoItem[] {
  const vistos = new Set<string>();
  const out: LastroTopicoItem[] = [];
  for (const item of itens) {
    const k = `${item.tipo}:${norm(item.ref)}`;
    if (vistos.has(k)) continue;
    vistos.add(k);
    out.push(item);
  }
  return out;
}

function extrairFlsDoTexto(texto: string): LastroTopicoItem[] {
  const itens: LastroTopicoItem[] = [];
  for (const m of texto.matchAll(RE_FLS)) {
    const n = m[1];
    if (n) itens.push({ tipo: "anexo", ref: `fls. ${n}` });
  }
  return itens;
}

function extrairLeisDoTexto(texto: string): LastroTopicoItem[] {
  const itens: LastroTopicoItem[] = [];
  for (const m of texto.matchAll(RE_LEI)) {
    const ref = m[0]?.trim();
    if (ref) itens.push({ tipo: "lei", ref });
  }
  return itens;
}

/** Bloco da estratégia entre este tópico romano e o próximo. */
export function extrairBlocoEstrategiaTopico(
  estrategia: string,
  romano: string,
  proximoRomano?: string
): string {
  const esc = romano.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const ini = new RegExp(
    `(?:^|\\n)\\s*${esc}\\s*[\\.\\)\\-–—]\\s*[^\\n]+`,
    "i"
  );
  const start = estrategia.search(ini);
  if (start < 0) return "";

  let end = estrategia.length;
  if (proximoRomano) {
    const escProx = proximoRomano.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prox = new RegExp(
      `(?:^|\\n)\\s*${escProx}\\s*[\\.\\)\\-–—]\\s*`,
      "i"
    );
    const idx = estrategia.slice(start + 1).search(prox);
    if (idx >= 0) end = start + 1 + idx;
  }

  return estrategia.slice(start, end).trim();
}

function textoProximoAoTopico(texto: string, termos: string[]): boolean {
  const b = norm(texto);
  return termos.some((t) => t.length >= 5 && b.includes(t));
}

function tesesRelacionadasAoTopico(
  topico: TopicoPlanejado,
  cobertura: ItemCoberturaTese[]
): ItemCoberturaTese[] {
  const termos = [
    ...palavrasChave(topico.titulo),
    ...topico.subtitulos.flatMap((s) => palavrasChave(s)),
    ...(topico.encaixe ? palavrasChave(topico.encaixe) : []),
    ...(topico.lastro ?? []).flatMap((l) => palavrasChave(l.ref, 4)),
  ];

  return cobertura.filter((c) => {
    const r = norm(c.rotulo);
    if (termos.some((w) => w.length >= 5 && r.includes(w))) return true;
    if (termos.some((w) => w.length >= 5 && norm(topico.titulo).includes(w))) {
      return r.includes(norm(topico.titulo).slice(0, 12));
    }
    return (
      norm(topico.titulo).includes(r.slice(0, 12)) ||
      r.includes(norm(topico.titulo).slice(0, 12))
    );
  });
}

function jurisRelacionadas(
  topico: TopicoPlanejado,
  juris: { titulo: string; texto?: string }[]
): string[] {
  const termos = [
    ...palavrasChave(topico.titulo),
    ...topico.subtitulos.flatMap((s) => palavrasChave(s)),
    ...(topico.encaixe ? palavrasChave(topico.encaixe) : []),
  ];
  return juris
    .filter((j) => {
      const blob = norm(`${j.titulo}\n${(j.texto ?? "").slice(0, 500)}`);
      if (termos.some((w) => w.length >= 5 && blob.includes(w))) return true;
      const t = norm(j.titulo);
      return termos.some((w) => w.length >= 5 && t.includes(w));
    })
    .map((j) => j.titulo);
}

/** Enriquece lastro estruturado (B) com extração local (A) quando faltar fonte. */
export function complementarLastroTopico(params: {
  topico: TopicoPlanejado;
  estrategiaJuridica: string;
  todosTopicos: TopicoPlanejado[];
  cobertura: ItemCoberturaTese[];
  /** @deprecated prefer jurisItens */
  jurisTitulos?: string[];
  jurisItens?: { titulo: string; texto?: string }[];
}): TopicoPlanejado {
  const idx = params.todosTopicos.findIndex(
    (t) => t.romano === params.topico.romano && t.titulo === params.topico.titulo
  );
  const proximo =
    idx >= 0 && idx < params.todosTopicos.length - 1
      ? params.todosTopicos[idx + 1]!.romano
      : undefined;

  const bloco = extrairBlocoEstrategiaTopico(
    params.estrategiaJuridica,
    params.topico.romano,
    proximo
  );
  const corpus = [
    bloco,
    params.topico.titulo,
    ...params.topico.subtitulos,
    params.topico.encaixe ?? "",
  ]
    .filter(Boolean)
    .join("\n");

  const termos = palavrasChave(params.topico.titulo);
  const lastroBase = [...(params.topico.lastro ?? [])];

  if (!lastroBase.some((l) => l.tipo === "anexo")) {
    const flsBloco = extrairFlsDoTexto(bloco);
    const flsCorpus = extrairFlsDoTexto(corpus);
    lastroBase.push(...flsBloco, ...flsCorpus);
  }

  if (!lastroBase.some((l) => l.tipo === "lei")) {
    lastroBase.push(...extrairLeisDoTexto(corpus));
  }

  const teses = tesesRelacionadasAoTopico(params.topico, params.cobertura);
  for (const t of teses.filter((c) => c.noPlano)) {
    if (!lastroBase.some((l) => l.tipo === "tese" && norm(l.ref).includes(norm(t.rotulo).slice(0, 12)))) {
      lastroBase.push({ tipo: "tese", ref: t.rotulo });
    }
  }

  const juris = jurisRelacionadas(
    params.topico,
    params.jurisItens ??
      (params.jurisTitulos ?? []).map((titulo) => ({ titulo }))
  );
  for (const j of juris) {
    if (!lastroBase.some((l) => l.tipo === "juris" && norm(l.ref).includes(norm(j).slice(0, 12)))) {
      lastroBase.push({ tipo: "juris", ref: j });
    }
  }

  if (
    !lastroBase.some((l) => l.tipo === "relato") &&
    textoProximoAoTopico(corpus, ["relato", "narrado", "fatos", "autor", "cliente"])
  ) {
    lastroBase.unshift({ tipo: "relato", ref: "relato do caso" });
  }

  let encaixe = params.topico.encaixe?.trim();
  if (!encaixe && params.topico.subtitulos.length === 1) {
    const sub = params.topico.subtitulos[0]!;
    if (sub.length >= 24 && /caso|fato|pois|porque|em razão/i.test(sub)) {
      encaixe = sub;
    }
  }

  return {
    ...params.topico,
    encaixe: encaixe || params.topico.encaixe,
    lastro: dedupLastro(lastroBase).slice(0, 12),
  };
}

export function complementarLastroTopicos(params: {
  topicos: TopicoPlanejado[];
  estrategiaJuridica: string;
  cobertura: ItemCoberturaTese[];
  /** @deprecated prefer jurisItens */
  jurisTitulos?: string[];
  jurisItens?: { titulo: string; texto?: string }[];
}): TopicoPlanejado[] {
  return params.topicos.map((topico) =>
    complementarLastroTopico({
      topico,
      estrategiaJuridica: params.estrategiaJuridica,
      todosTopicos: params.topicos,
      cobertura: params.cobertura,
      jurisTitulos: params.jurisTitulos,
      jurisItens: params.jurisItens,
    })
  );
}

export type LastroTopicoExibicao = {
  encaixe?: string;
  fontes: LastroTopicoItem[];
  tesesOk: string[];
  tesesPend: string[];
  juris: string[];
  aviso?: string;
};

const ROTULO_TIPO: Record<TipoLastroTopico, string> = {
  relato: "Relato",
  anexo: "Anexo",
  tese: "Tese",
  juris: "Juris",
  rito: "Rito",
  lei: "Lei",
  pedido: "Pedido",
};

export function rotuloTipoLastro(tipo: TipoLastroTopico): string {
  return ROTULO_TIPO[tipo];
}

export function montarLastroTopicoExibicao(
  topico: TopicoPlanejado,
  cobertura: ItemCoberturaTese[]
): LastroTopicoExibicao {
  const relacionados = tesesRelacionadasAoTopico(topico, cobertura);
  const fontes = topico.lastro ?? [];
  const juris = fontes.filter((f) => f.tipo === "juris").map((f) => f.ref);

  return {
    encaixe: topico.encaixe?.trim() || undefined,
    fontes,
    tesesOk: relacionados.filter((c) => c.noPlano).map((c) => c.rotulo),
    tesesPend: relacionados.filter((c) => !c.noPlano).map((c) => c.rotulo),
    juris: juris.length ? juris : [],
    aviso:
      fontes.length === 0 && !topico.encaixe
        ? "Sustentado pela estratégia geral — confira anexos (fls.) e juris do caso."
        : undefined,
  };
}

/** Texto plano para tooltip sem React. */
export function montarLastroTopicoTexto(
  topico: TopicoPlanejado,
  cobertura: ItemCoberturaTese[]
): string {
  const ex = montarLastroTopicoExibicao(topico, cobertura);
  const linhas: string[] = [];

  if (ex.encaixe) {
    linhas.push(`Encaixe: ${ex.encaixe}`);
  }

  if (ex.fontes.length) {
    const porTipo = new Map<TipoLastroTopico, string[]>();
    for (const f of ex.fontes) {
      const lista = porTipo.get(f.tipo) ?? [];
      lista.push(f.ref);
      porTipo.set(f.tipo, lista);
    }
    for (const [tipo, refs] of porTipo) {
      linhas.push(`${rotuloTipoLastro(tipo)}: ${refs.join("; ")}.`);
    }
  }

  if (ex.tesesOk.length) {
    linhas.push(`Teses no plano: ${ex.tesesOk.join("; ")}.`);
  }
  if (ex.tesesPend.length) {
    linhas.push(`Pendente: ${ex.tesesPend.join("; ")}.`);
  }
  if (ex.aviso) {
    linhas.push(ex.aviso);
  } else if (!ex.encaixe && !ex.fontes.length) {
    linhas.push("Confira anexos (fls.) e juris do caso antes de redigir.");
  }

  return linhas.join("\n");
}
