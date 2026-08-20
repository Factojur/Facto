/**
 * JurisprudenciaService — busca controlada no Jurisprudências.ai
 * + formatação no padrão interno FACTO.
 *
 * Política de produto (cliente):
 * - Runtime do app: só base curada FACTO (`provedorExternoAtivo: false` em sugerir).
 * - Esta lib permanece para seed / scripts admin — não é caminho do usuário.
 * - Cota externa no produto = 0 (desligada).
 *
 * Env (seed):
 * - JURISPRUDENCIAS_AI_API_KEY — token principal
 * - JURISPRUDENCIAS_AI_API_KEYS — pool (vírgula/espaço/ponto-e-vírgula)
 */

import type { JurisCandidato } from "@/lib/juris-provedores/types";

const BASE = "https://jurisprudencias.ai/api/v1";

/**
 * Limite mensal de buscas externas por usuário no produto.
 * 0 = desligado no app (cliente só usa base curada).
 */
export const JURIS_BUSCAS_POR_USUARIO_MES = 0;

/** @deprecated Use JURIS_BUSCAS_POR_USUARIO_MES */
export const JURIS_BUSCAS_POR_USUARIO_DIA = JURIS_BUSCAS_POR_USUARIO_MES;

export type PrecedenteInterno = Omit<JurisCandidato, "id" | "letra">;

export type ResultadoBuscaPrecedentes = {
  precedentes: PrecedenteInterno[];
  /** Chamadas HTTP feitas nesta busca (inclui tentativas 429 no pool). */
  chamadasApi: number;
  aviso?: string;
  erroApi?: string;
};

type DecisaoAi = {
  process_number?: string;
  process_type?: string;
  rapporteur?: string;
  adjudicating_body?: string;
  publication_date?: string;
  trial_date?: string;
  excerpt?: string;
  summary?: string;
  ementa?: string;
  url?: string;
  court?: string;
};

/** Lookup 429 é cota distinta da busca — não mistura com tokensEsgotadosAte. */
const tokensLookupEsgotadosAte = new Map<string, number>();

const SLUGS_API_EXTRA = [
  "tst",
  "trf1",
  "trf2",
  "trf3",
  "trf4",
  "trf5",
  "trf6",
  "carf",
];

const CNJ_RE =
  /\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/;

/** Teto da ementa gravada (evita voto/relatório colados no campo summary). */
const EMENTA_MAX_CHARS = 4000;

/** Tokens marcados esgotados até este instante (ms). Evita bater de novo no mesmo cold start. */
const tokensEsgotadosAte = new Map<string, number>();

function fingerprint(token: string): string {
  return token.slice(-16);
}

function tokenDisponivel(token: string): boolean {
  const ate = tokensEsgotadosAte.get(fingerprint(token));
  if (!ate) return true;
  if (Date.now() >= ate) {
    tokensEsgotadosAte.delete(fingerprint(token));
    return true;
  }
  return false;
}

function tokenLookupDisponivel(token: string): boolean {
  const ate = tokensLookupEsgotadosAte.get(fingerprint(token));
  if (!ate) return true;
  if (Date.now() >= ate) {
    tokensLookupEsgotadosAte.delete(fingerprint(token));
    return true;
  }
  return false;
}

/** Marca token esgotado até a próxima meia-noite em America/Sao_Paulo. */
function marcarTokenEsgotado(token: string): void {
  tokensEsgotadosAte.set(fingerprint(token), meiaNoiteSpMs());
}

function meiaNoiteSpMs(): number {
  const spDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [y, m, d] = spDate.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d! + 1, 3, 0, 0)).getTime();
}

function marcarTokenLookupEsgotado(token: string): void {
  tokensLookupEsgotadosAte.set(fingerprint(token), meiaNoiteSpMs());
}

export function tokensDoPool(): string[] {
  const lista: string[] = [];
  const principal = process.env.JURISPRUDENCIAS_AI_API_KEY?.trim();
  if (principal) lista.push(principal);
  const extras = process.env.JURISPRUDENCIAS_AI_API_KEYS?.trim();
  if (extras) {
    for (const t of extras.split(/[,;\s]+/)) {
      const v = t.trim();
      if (v && !lista.includes(v)) lista.push(v);
    }
  }
  return lista;
}

/**
 * Contas ainda com cota (não marcadas 429), com rotação horária para
 * espalhar o uso. Se todas estiverem marcadas esgotadas, devolve o pool
 * inteiro para tentar de novo (cache pode estar desatualizado).
 */
function tokensOrdenadosParaTentativa(): string[] {
  const todos = tokensDoPool();
  if (todos.length <= 1) return todos;

  const disponiveis = todos.filter(tokenDisponivel);
  const base = disponiveis.length > 0 ? disponiveis : todos;
  const start = Math.floor(Date.now() / 3_600_000) % base.length;
  return [...base.slice(start), ...base.slice(0, start)];
}

export function jurisprudenciaServiceConfigurado(): boolean {
  return tokensDoPool().length > 0;
}

/** Escolhe um tribunal: heurística leve; padrão STJ (melhor para JEC/nacional). */
export function escolherTribunal(query: string): string {
  const q = query.toLowerCase();
  if (/\btjsp\b|s[aã]o paulo|\bsp\b/.test(q)) return "tjsp";
  if (/\btjrj\b|rio de janeiro|\brj\b/.test(q)) return "tjrj";
  if (/\btjmg\b|minas/.test(q)) return "tjmg";
  if (/\bstf\b|supremo/.test(q)) return "stf";
  if (/\btst\b|trabalh/.test(q)) return "tst";
  return "stj";
}

/** Slug aceito em `/courts/:id/` (TJSP → tjsp). */
export function slugTribunalParaApi(tribunal: string): string | null {
  const bruto = tribunal.trim();
  const head =
    bruto.match(/^(stf|stj|tst|trf[1-6]|carf|tj[a-z]{2,3})\b/i)?.[1] ||
    bruto.split(/[\s—–-]+/)[0] ||
    bruto;
  const s = head
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]/g, "");
  if (!s) return null;
  if (s === "tjdft" || s === "tjd" || s === "tjdf") return "tjdft";
  if (
    /^(stf|stj|tst|tjsp|tjrj|tjmg|tjrs|tjpr|tjsc|tjba|tjpe|tjce|tjgo|tjes|tjmt|tjms|tjma)$/.test(
      s
    ) ||
    SLUGS_API_EXTRA.includes(s)
  ) {
    return s;
  }
  if (s.startsWith("tj") && s.length >= 4 && s.length <= 6) return s;
  return null;
}

export function numeroProcessoDeTitulo(titulo: string): string | null {
  const m = titulo.match(CNJ_RE);
  return m?.[0] ?? null;
}

function cortarEmenta(texto: string): string {
  let t = texto.trim();
  const corte = t.search(
    /\n\s*(RELAT[ÓO]RIO|VOTO\b|AC[ÓO]RD[ÃA]O\s*\n|É O RELAT[ÓO]RIO)/i
  );
  if (corte > 80) t = t.slice(0, corte).trim();
  if (t.length > EMENTA_MAX_CHARS) {
    t = t.slice(0, EMENTA_MAX_CHARS).replace(/\s+\S*$/, "").trim();
  }
  return t;
}

/** Só ementa/summary. Ignora inteiro teor se a API mandar outros campos. */
export function ementaDeDecisaoAi(d: DecisaoAi): string {
  return cortarEmenta(d.summary || d.ementa || d.excerpt || "");
}

function formatarDecisao(
  d: DecisaoAi,
  court: string
): PrecedenteInterno | null {
  const ementa = ementaDeDecisaoAi(d);
  if (!ementa) return null;
  const data = d.publication_date || d.trial_date;
  return {
    origem: "jurisprudencias_ai",
    tribunal: court.toUpperCase(),
    titulo: `${court.toUpperCase()} — ${d.process_number || d.process_type || "decisão"}`,
    ementa,
    numeroProcesso: d.process_number,
    relator: d.rapporteur,
    data,
    url: d.url,
    tipo: "acordao",
  };
}

async function fetchDecisoes(
  court: string,
  q: string,
  token: string
): Promise<{ decisoes: DecisaoAi[]; status: number; erro?: string }> {
  const url = new URL(`${BASE}/courts/${court}/decisions`);
  url.searchParams.set("q", q.slice(0, 200));
  url.searchParams.set("page", "0");
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const errJson = (await res.json()) as {
        error?: { message?: string; code?: string };
      };
      if (errJson.error?.message) msg = errJson.error.message;
      else if (errJson.error?.code) msg = errJson.error.code;
    } catch {
      /* ignore */
    }
    return { decisoes: [], status: res.status, erro: msg };
  }
  const json = (await res.json()) as { data?: DecisaoAi[] };
  return { decisoes: json.data ?? [], status: res.status };
}

function tokensOrdenadosParaLookup(): string[] {
  const todos = tokensDoPool();
  if (todos.length <= 1) return todos;
  const disponiveis = todos.filter(tokenLookupDisponivel);
  const base = disponiveis.length > 0 ? disponiveis : todos;
  const start = Math.floor(Date.now() / 3_600_000) % base.length;
  return [...base.slice(start), ...base.slice(0, start)];
}

export type ResultadoLookupEmenta = {
  ementa?: string;
  data?: string;
  relator?: string;
  url?: string;
  numeroProcesso?: string;
  status: number;
  esgotado?: boolean;
  erro?: string;
};

/**
 * Cota de consultas (10 mil/dia), não de buscas.
 * Devolve só ementa estruturada.
 */
export async function lookupEmentaPorNumero(
  court: string,
  numeroProcesso: string
): Promise<ResultadoLookupEmenta> {
  const slug = slugTribunalParaApi(court);
  const n = numeroProcesso.trim();
  if (!slug || n.length < 5) {
    return { status: 0, erro: "Tribunal ou número inválido." };
  }

  const tokens = tokensOrdenadosParaLookup();
  if (!tokens.length) {
    return { status: 0, erro: "API não configurada." };
  }

  let lastStatus = 0;
  for (const token of tokens) {
    const url = new URL(`${BASE}/courts/${slug}/decisions/lookup`);
    url.searchParams.set("n", n);
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
    lastStatus = res.status;
    if (res.status === 429 || res.status === 401 || res.status === 403) {
      marcarTokenLookupEsgotado(token);
      continue;
    }
    if (res.status === 404) {
      return { status: 404, erro: "Decisão não encontrada." };
    }
    if (!res.ok) {
      return { status: res.status, erro: `HTTP ${res.status}` };
    }
    const json = (await res.json()) as { data?: DecisaoAi };
    const d = json.data;
    if (!d) return { status: 200, erro: "Resposta sem dados." };
    const ementa = ementaDeDecisaoAi(d);
    if (!ementa) return { status: 200, erro: "Sem ementa." };
    return {
      status: 200,
      ementa,
      data: d.publication_date || d.trial_date,
      relator: d.rapporteur,
      url: d.url,
      numeroProcesso: d.process_number || n,
    };
  }

  return { status: lastStatus || 429, esgotado: true, erro: "Cota de consultas esgotada." };
}

export async function completarEmentaPorLookup(
  p: PrecedenteInterno
): Promise<{ precedente: PrecedenteInterno; lookup: boolean; esgotado?: boolean }> {
  const numero =
    p.numeroProcesso?.trim() || numeroProcessoDeTitulo(p.titulo) || "";
  const court = slugTribunalParaApi(p.tribunal) || slugTribunalParaApi(p.titulo);
  if (!numero || !court) {
    return { precedente: p, lookup: false };
  }
  const r = await lookupEmentaPorNumero(court, numero);
  if (r.esgotado) return { precedente: p, lookup: false, esgotado: true };
  if (!r.ementa) return { precedente: p, lookup: false };
  if (r.ementa.length <= p.ementa.trim().length + 40) {
    return { precedente: p, lookup: false };
  }
  return {
    lookup: true,
    precedente: {
      ...p,
      ementa: r.ementa,
      data: r.data || p.data,
      relator: r.relator || p.relator,
      url: r.url || p.url,
      numeroProcesso: r.numeroProcesso || p.numeroProcesso,
    },
  };
}

/**
 * Envia a query à API externa, recebe JSON e formata 1 precedente no padrão FACTO.
 * Se um token do pool estiver esgotado (429), tenta o próximo automaticamente.
 */
export async function buscarPrecedentes(
  query: string,
  opcoes?: { tribunal?: string }
): Promise<ResultadoBuscaPrecedentes> {
  const q = query.trim();
  if (q.length < 4) {
    return { precedentes: [], chamadasApi: 0, aviso: "Consulta muito curta." };
  }

  const tokens = tokensOrdenadosParaTentativa();
  if (!tokens.length) {
    return {
      precedentes: [],
      chamadasApi: 0,
      aviso:
        "Busca externa de tribunais não configurada. Use anexos e a base FACTO, ou configure as chaves no servidor.",
    };
  }

  const court = opcoes?.tribunal ?? escolherTribunal(q);
  let chamadasApi = 0;

  for (const token of tokens) {
    chamadasApi += 1;
    const { decisoes, status, erro } = await fetchDecisoes(court, q, token);

    if (status === 429) {
      marcarTokenEsgotado(token);
      continue; // próxima conta do pool
    }

    if (erro && !decisoes.length) {
      if (status === 401 || status === 403) {
        marcarTokenEsgotado(token);
        continue;
      }
      return { precedentes: [], chamadasApi, erroApi: erro };
    }

    for (const d of decisoes) {
      const fmt = formatarDecisao(d, court);
      if (fmt) {
        return { precedentes: [fmt], chamadasApi };
      }
    }

    // Resposta OK sem ementa útil — não queima o resto do pool
    return {
      precedentes: [],
      chamadasApi,
      aviso:
        "Nenhum acórdão com ementa útil retornou para esta busca. Tente outros termos.",
    };
  }

  return {
    precedentes: [],
    chamadasApi,
    erroApi:
      "Busca externa de tribunais temporariamente indisponível. Tente mais tarde ou use anexos e a base FACTO.",
  };
}

/** @deprecated Preferir buscarPrecedentes — mantido para imports antigos. */
export async function buscarJurisprudenciasAi(params: {
  consulta: string;
  maxPorTribunal?: number;
}): Promise<{
  itens: PrecedenteInterno[];
  erroApi?: string;
}> {
  const r = await buscarPrecedentes(params.consulta);
  return { itens: r.precedentes, erroApi: r.erroApi ?? r.aviso };
}

export function jurisAiTokenConfigurado(): boolean {
  return jurisprudenciaServiceConfigurado();
}
