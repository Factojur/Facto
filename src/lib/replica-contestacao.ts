/**
 * Réplica à contestação — detecção e extração forense de teses defensivas.
 * Heurísticas determinísticas (sem cota Gemini na Entrada).
 */

export type TipoTeseContestacao = "preliminar" | "merito" | "pedido" | "outro";

export type TeseContestacao = {
  id: string;
  tipo: TipoTeseContestacao;
  rotulo: string;
  trecho: string;
};

export type AnaliseReplicaContestacao = {
  detectada: boolean;
  confianca: "alta" | "media" | "baixa";
  teses: TeseContestacao[];
  briefing: string;
  sugereEspecieReplica: boolean;
};

const MARCADORES_CONTESTACAO = [
  /\bcontesta(c|ç)(a|ã)o\b/i,
  /\bcontestou\s+o\s+pedido\b/i,
  /\bem\s+defesa\s+pr[oó]pria\b/i,
  /\bpreliminar(es)?\s+de\s+m[eé]rito\b/i,
  /\bno\s+m[eé]rito\s+da\s+contesta(c|ç)(a|ã)o\b/i,
  /\bimpugna\s+integralmente\b/i,
  /\bpor\s+estes\s+fundamentos\b/i,
  /\brequer\s+o\s+acolhimento\s+das\s+preliminares\b/i,
];

const MARCADORES_SECAO: { tipo: TipoTeseContestacao; re: RegExp }[] = [
  { tipo: "preliminar", re: /\bpreliminar(es)?\b/i },
  { tipo: "merito", re: /\b(do\s+)?m[eé]rito\b/i },
  { tipo: "pedido", re: /\b(dos\s+)?pedidos\b/i },
];

const INICIO_ITEM =
  /^(?:(\d{1,2})|([IVXLC]{1,6})|([a-z]))\s*[\).\-–—:]\s+(.+)$/i;

const LIMITE_TRECHO = 480;
const LIMITE_TESES = 12;

function normalizar(texto: string): string {
  return texto
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function trechoUtil(linhas: string[], inicio: number): string {
  const buf: string[] = [];
  for (let i = inicio; i < linhas.length && buf.join(" ").length < LIMITE_TRECHO; i++) {
    const linha = linhas[i]!.trim();
    if (!linha) {
      if (buf.length) buf.push("");
      continue;
    }
    if (buf.length && INICIO_ITEM.test(linha) && buf.join(" ").length > 80) break;
    if (
      buf.length &&
      /^(I{1,3}|IV|VI{0,3}|IX|X{0,3})\s*[-–—.]?\s*(PRELIMINAR|DO MÉRITO|MÉRITO|PEDIDOS)/i.test(
        linha
      )
    ) {
      break;
    }
    buf.push(linha);
  }
  return buf.join(" ").replace(/\s+/g, " ").trim().slice(0, LIMITE_TRECHO);
}

function tipoDaSecao(linha: string): TipoTeseContestacao | null {
  for (const m of MARCADORES_SECAO) {
    if (m.re.test(linha)) return m.tipo;
  }
  return null;
}

function indiceContestacao(texto: string): number {
  const lower = texto.toLowerCase();
  const candidatos = [
    lower.indexOf("contestação"),
    lower.indexOf("contestacao"),
    lower.indexOf("--- contest"),
  ].filter((i) => i >= 0);
  return candidatos.length ? Math.min(...candidatos) : -1;
}

function extrairTeses(texto: string): TeseContestacao[] {
  const norm = normalizar(texto);
  const inicio = indiceContestacao(norm);
  const bloco = inicio >= 0 ? norm.slice(inicio) : norm;
  const linhas = bloco.split("\n");

  let secaoAtual: TipoTeseContestacao = "merito";
  const teses: TeseContestacao[] = [];

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i]!.trim();
    if (!linha || linha.length < 4) continue;

    const sec = tipoDaSecao(linha);
    if (sec) {
      secaoAtual = sec;
      continue;
    }

    const m = linha.match(INICIO_ITEM);
    if (!m) continue;

    const rotulo = (m[1] ?? m[2] ?? m[3] ?? "").toUpperCase();
    const trecho = trechoUtil(linhas, i);
    if (trecho.length < 24) continue;

  const pareceTitulo =
      trecho.length < 50 &&
      !/[.;!?]/.test(trecho) &&
      teses.length > 0;
    if (pareceTitulo) continue;

    teses.push({
      id: `t${teses.length + 1}`,
      tipo: secaoAtual,
      rotulo,
      trecho,
    });

    if (teses.length >= LIMITE_TESES) break;
  }

  return teses;
}

export function detectarContestacao(texto: string): boolean {
  const norm = normalizar(texto);
  if (norm.length < 80) return false;
  let hits = 0;
  for (const re of MARCADORES_CONTESTACAO) {
    if (re.test(norm)) hits++;
  }
  if (indiceContestacao(norm) >= 0) hits += 2;
  return hits >= 2;
}

export function montarBriefingReplica(teses: TeseContestacao[]): string {
  if (!teses.length) {
    return [
      "CONTESTAÇÃO IDENTIFICADA — impugnar ponto a ponto.",
      "Estruture a réplica: preliminares primeiro; depois mérito, sem repetir a inicial integralmente.",
      "Cada tese defensiva deve receber resposta específica (fato + direito).",
    ].join("\n");
  }

  const linhas: string[] = [
    "================================================================================",
    "IMPUGNAÇÃO DA CONTESTAÇÃO (estrutura obrigatória da réplica)",
    "================================================================================",
    "A peça é RÉPLICA. Impugne CADA tese abaixo, na mesma ordem, com fatos dos autos e direito.",
    "Não reproduza a contestação integralmente. Não repita a petição inicial sem necessidade.",
    "",
  ];

  const grupos: Record<TipoTeseContestacao, TeseContestacao[]> = {
    preliminar: [],
    merito: [],
    pedido: [],
    outro: [],
  };
  for (const t of teses) grupos[t.tipo].push(t);

  const rotulos: { chave: TipoTeseContestacao; titulo: string }[] = [
    { chave: "preliminar", titulo: "PRELIMINARES DA CONTESTAÇÃO" },
    { chave: "merito", titulo: "MÉRITO — TESES DEFENSIVAS" },
    { chave: "pedido", titulo: "PEDIDOS DO RÉU" },
    { chave: "outro", titulo: "DEMAIS ARGUMENTOS" },
  ];

  for (const { chave, titulo } of rotulos) {
    const lista = grupos[chave];
    if (!lista.length) continue;
    linhas.push(`--- ${titulo} ---`);
    for (const t of lista) {
      linhas.push(
        `• Tese ${t.rotulo} (${t.tipo}): ${t.trecho}`,
        `  → Impugnar com: (1) fato dos autos; (2) fundamento legal; (3) por que não procede.`
      );
    }
    linhas.push("");
  }

  return linhas.join("\n").trim();
}

export function analisarReplicaContestacao(params: {
  texto: string;
  especiePeca?: string | null;
}): AnaliseReplicaContestacao | null {
  const texto = normalizar(params.texto);
  if (texto.length < 80) return null;

  const detectada = detectarContestacao(texto);
  const especieReplica = params.especiePeca === "replica";
  if (!detectada && !especieReplica) return null;

  const teses = extrairTeses(texto);
  const briefing = montarBriefingReplica(teses);

  let confianca: AnaliseReplicaContestacao["confianca"] = "baixa";
  if (detectada && teses.length >= 3) confianca = "alta";
  else if (detectada && teses.length >= 1) confianca = "media";
  else if (detectada) confianca = "media";

  const sugereEspecieReplica =
    detectada &&
    teses.length >= 1 &&
    params.especiePeca !== "contestacao" &&
    params.especiePeca !== "replica";

  return {
    detectada: detectada || especieReplica,
    confianca,
    teses,
    briefing,
    sugereEspecieReplica,
  };
}

/** Serialização leve para o payload da API / estado do formulário. */
export function serializarReplicaContestacao(
  analise: AnaliseReplicaContestacao | null | undefined
): AnaliseReplicaContestacao | null {
  if (!analise?.detectada) return null;
  return {
    detectada: true,
    confianca: analise.confianca,
    teses: analise.teses.slice(0, LIMITE_TESES),
    briefing: analise.briefing.slice(0, 12_000),
    sugereEspecieReplica: analise.sugereEspecieReplica,
  };
}

/** Briefing para triagem/redação — payload do cliente ou heurística nos fatos. */
export function resolverBriefingReplicaParaGeracao(params: {
  fatos: string;
  especiePeca?: string | null;
  replicaContestacao?: AnaliseReplicaContestacao | null;
}): string | null {
  const doCliente = params.replicaContestacao?.briefing?.trim();
  if (doCliente) return doCliente;
  const analise = analisarReplicaContestacao({
    texto: params.fatos,
    especiePeca: params.especiePeca,
  });
  return analise?.briefing?.trim() || null;
}
