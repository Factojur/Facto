/**
 * JurisprudenciaService — busca controlada no Jurisprudências.ai
 * + formatação no padrão interno FACTO.
 *
 * Política de custo (produto):
 * - 1 chamada HTTP bem-sucedida por busca do usuário → 1 precedente
 * - Pool de tokens (várias contas): se uma esgota (429), troca para a próxima
 * - Cota mensal por usuário FACTO (15/mês) é aplicada na rota, não aqui
 *
 * Env:
 * - JURISPRUDENCIAS_AI_API_KEY — token principal
 * - JURISPRUDENCIAS_AI_API_KEYS — pool (vírgula/espaço/ponto-e-vírgula)
 */

import type { JurisCandidato } from "@/lib/juris-provedores/types";

const BASE = "https://jurisprudencias.ai/api/v1";

/** Limite mensal de buscas externas por usuário FACTO. */
export const JURIS_BUSCAS_POR_USUARIO_MES = 15;

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
};

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

/** Marca token esgotado até a próxima meia-noite em America/Sao_Paulo. */
function marcarTokenEsgotado(token: string): void {
  const agora = new Date();
  // Próxima meia-noite SP ≈ +1 dia civil SP
  const spDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(agora);
  const [y, m, d] = spDate.split("-").map(Number);
  // 03:00 UTC ≈ meia-noite SP no horário de Brasília padrão; usamos +24h a partir de agora como teto seguro
  const amanhaSp = new Date(Date.UTC(y!, m! - 1, d! + 1, 3, 0, 0));
  tokensEsgotadosAte.set(fingerprint(token), amanhaSp.getTime());
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

function formatarDecisao(
  d: DecisaoAi,
  court: string
): PrecedenteInterno | null {
  const ementa = (d.summary || d.excerpt || d.ementa || "").trim();
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
        "Para ementas de tribunais com link oficial, configure JURISPRUDENCIAS_AI_API_KEY (e opcionalmente JURISPRUDENCIAS_AI_API_KEYS) após assinar o Jurisprudências.ai.",
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
      "Todas as contas do Jurisprudências.ai no pool estão temporariamente sem cota. Tente mais tarde.",
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
