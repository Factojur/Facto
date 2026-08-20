/**
 * Baixa jurisprudência em lote (Jurisprudências.ai) → base_conhecimento.
 * Temas JEC quentes; ~10 ementas TJSP por tema (o que a API devolver na página).
 *
 * Uso: npm run seed:juris-ai-lote
 * Depois: npm run reindex:embeddings
 *
 * Consome 1 chamada HTTP por tema (pool de tokens se 429).
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { metadadosJurisDoTexto } from "../src/lib/juris-metadados";
import { config } from "dotenv";
import { resolve } from "path";
import {
  completarEmentaPorLookup,
  tokensDoPool,
  type PrecedenteInterno,
} from "../src/lib/juris-provedores/jurisprudencia-service";
import { termosDoLote, type TermoSeed, LOTE_MAX } from "./seed-juris-termos";

config({ path: resolve(process.cwd(), ".env.local") });

const BASE = "https://jurisprudencias.ai/api/v1";
const POR_TEMA = Math.max(
  1,
  Number(process.env.SEED_JURIS_POR_TEMA ?? 10) || 10
);
const TRIBUNAL = (process.env.SEED_JURIS_TRIBUNAL ?? "tjsp").toLowerCase();
/** Publicação mínima (YYYY-MM-DD). Use SEED_JURIS_PUB_FROM=off para desligar. */
const PUB_FROM = (() => {
  const v = (process.env.SEED_JURIS_PUB_FROM ?? "2023-01-01").trim();
  if (!v || v === "0" || /^off|nao|não$/i.test(v)) return "";
  return v;
})();
const USAR_LOOKUP = process.env.SEED_JURIS_LOOKUP !== "0";
const LOTE = Math.max(
  1,
  Number(process.env.SEED_JURIS_LOTE ?? process.argv[2] ?? 1) || 1
);
const TERMOS: TermoSeed[] = termosDoLote(LOTE);

if (!TERMOS.length || LOTE > LOTE_MAX) {
  console.error(
    `Lote ${LOTE} sem termos. Use 1–${LOTE_MAX} (ex.: npm run seed:juris-ai -- 31).`
  );
  process.exit(1);
}

type DecisaoAi = {
  process_number?: string;
  process_type?: string;
  rapporteur?: string;
  publication_date?: string;
  trial_date?: string;
  excerpt?: string;
  summary?: string;
  ementa?: string;
  url?: string;
};

function ementaValida(texto: string): boolean {
  const t = texto.trim();
  if (t.length < 100) return false;
  if (/esajCelula|escolhaBeta|suportesistemastjsp|Identificar-se|Peticionamento Eletr[oô]nico/i.test(t)) {
    return false;
  }
  if (/\{[\s\S]*position:\s*relative/i.test(t)) return false;
  return true;
}

function formatar(d: DecisaoAi, court: string): PrecedenteInterno | null {
  const ementa = (d.summary || d.excerpt || d.ementa || "").trim();
  if (!ementaValida(ementa)) return null;
  const num = d.process_number?.trim();
  return {
    origem: "jurisprudencias_ai",
    tribunal: court.toUpperCase(),
    titulo: num
      ? `${court.toUpperCase()} — ${num}`
      : `${court.toUpperCase()} — ${d.process_type || "decisão"}`,
    ementa,
    numeroProcesso: num,
    relator: d.rapporteur,
    data: d.publication_date || d.trial_date,
    url: d.url,
    tipo: "acordao",
  };
}

function montarTexto(p: PrecedenteInterno): string {
  const partes = [p.ementa.trim()];
  if (p.relator) partes.push(`Relator(a): ${p.relator}`);
  if (p.data) partes.push(`Data: ${p.data}`);
  if (p.url) partes.push(`Fonte oficial: ${p.url}`);
  return partes.join("\n\n");
}

async function buscarPagina(
  court: string,
  q: string,
  token: string,
  pubFrom?: string
): Promise<{ decisoes: DecisaoAi[]; status: number; erro?: string }> {
  const url = new URL(`${BASE}/courts/${court}/decisions`);
  url.searchParams.set("q", q.slice(0, 200));
  url.searchParams.set("page", "0");
  if (pubFrom) url.searchParams.set("pub_from", pubFrom);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const errJson = (await res.json()) as {
        error?: { message?: string };
      };
      if (errJson.error?.message) msg = errJson.error.message;
    } catch {
      /* ignore */
    }
    return { decisoes: [], status: res.status, erro: msg };
  }
  const json = (await res.json()) as { data?: DecisaoAi[] };
  return { decisoes: json.data ?? [], status: res.status };
}

async function limparLixoTjsp(
  supabase: SupabaseClient
): Promise<number> {
  // Só roda com SEED_JURIS_LIMPAR_LIXO=1 — evita apagar itens por engano.
  if (process.env.SEED_JURIS_LIMPAR_LIXO !== "1") {
    console.log(
      "Limpeza de lixo desligada (defina SEED_JURIS_LIMPAR_LIXO=1 para ativar).\n"
    );
    return 0;
  }

  const { data } = await supabase
    .from("base_conhecimento")
    .select("id, titulo, texto")
    .eq("categoria", "Jurisprudência")
    .ilike("titulo", "%julgado%");

  let removidos = 0;
  for (const row of data ?? []) {
    const lixo =
      /TJSP — (TJSP — )?julgado/i.test(row.titulo) ||
      !ementaValida(row.texto || "");
    if (!lixo) continue;
    const { error } = await supabase
      .from("base_conhecimento")
      .delete()
      .eq("id", row.id);
    if (!error) {
      removidos++;
      console.log(`  remove lixo: ${row.titulo}`);
    }
  }

  const { data: htmlRows } = await supabase
    .from("base_conhecimento")
    .select("id, titulo, texto")
    .eq("categoria", "Jurisprudência")
    .ilike("texto", "%esajCelula%");

  for (const row of htmlRows ?? []) {
    const { error } = await supabase
      .from("base_conhecimento")
      .delete()
      .eq("id", row.id);
    if (!error) {
      removidos++;
      console.log(`  remove HTML: ${row.titulo}`);
    }
  }

  return removidos;
}

/**
 * Insere precedente. Se o título já existe, NÃO sobrescreve o texto
 * (preserva o que já estava na base).
 */
async function upsertPrecedente(
  supabase: SupabaseClient,
  p: PrecedenteInterno
): Promise<"insert" | "skip" | "erro"> {
  const titulo = p.titulo.trim();
  const texto = montarTexto(p);
  if (!ementaValida(texto)) return "skip";

  const meta = metadadosJurisDoTexto(titulo, texto, p.tribunal);

  const { data: existente } = await supabase
    .from("base_conhecimento")
    .select("id, texto")
    .eq("titulo", titulo)
    .maybeSingle();

  if (existente?.id) {
    // Já cadastrado — não apaga nem sobrescreve conteúdo anterior.
    // Backfill leve de metadados se a coluna estiver vazia.
    await supabase
      .from("base_conhecimento")
      .update({
        tribunal: meta.tribunal,
        area_tags: meta.area_tags,
      })
      .eq("id", existente.id)
      .is("tribunal", null);
    return "skip";
  }

  const { error } = await supabase.from("base_conhecimento").insert({
    titulo,
    categoria: "Jurisprudência" as const,
    texto,
    fonte: "jurisprudencias.ai",
    status: "validado",
    tribunal: meta.tribunal,
    area_tags: meta.area_tags,
  });
  return error ? "erro" : "insert";
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const tokens = tokensDoPool();
  if (!tokens.length) {
    console.error("Configure JURISPRUDENCIAS_AI_API_KEY / _KEYS no .env.local");
    process.exit(1);
  }

  console.log(
    `Pool Jurisprudências.ai: ${tokens.length} conta(s) (KEY + KEYS). Round-robin em todas; 429 só troca de token, não aborta o lote.`
  );

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("Checando base (sem apagar itens existentes)…");
  const removidos = await limparLixoTjsp(supabase);
  if (removidos) console.log(`Removidos (lixo): ${removidos}\n`);

  console.log(
    `Lote ${LOTE} Jurisprudências.ai · ${TERMOS.length} consultas · até ${POR_TEMA}/consulta · tribunal default ${TRIBUNAL.toUpperCase()}${PUB_FROM ? ` · pub_from ${PUB_FROM}` : ""}${USAR_LOOKUP ? " · lookup ementa" : ""}\n`
  );

  let inseridos = 0;
  let pulados = 0;
  let falhas = 0;
  let chamadas = 0;
  /** Próxima conta a usar — gira nas 7, não fica na paga até 429. */
  let tokenIdx = 0;

  let lookupEsgotado = false;

  async function buscarNoPool(
    court: string,
    query: string,
    pubFrom?: string
  ): Promise<{
    decisoes: DecisaoAi[];
    okHttp: boolean;
    todasEsgotadas: boolean;
    erroApi?: string;
  }> {
    for (let t = 0; t < tokens.length; t++) {
      const idx = (tokenIdx + t) % tokens.length;
      const token = tokens[idx]!;
      chamadas++;
      const r = await buscarPagina(court, query, token, pubFrom);
      if (r.status === 429 || r.status === 401 || r.status === 403) {
        process.stdout.write(`c${idx + 1}/${tokens.length}→${r.status} `);
        continue;
      }
      tokenIdx = (idx + 1) % tokens.length;
      if (r.erro && !r.decisoes.length) {
        return {
          decisoes: [],
          okHttp: true,
          todasEsgotadas: false,
          erroApi: r.erro,
        };
      }
      return {
        decisoes: r.decisoes,
        okHttp: true,
        todasEsgotadas: false,
      };
    }
    return { decisoes: [], okHttp: false, todasEsgotadas: true };
  }

  for (const termo of TERMOS) {
    const court = (termo.tribunal ?? TRIBUNAL).toLowerCase();
    const query = termo.q;
    process.stdout.write(
      `▸ [${court} ${tokenIdx + 1}/${tokens.length}] ${query.slice(0, 44)}… `
    );

    let r = await buscarNoPool(court, query, PUB_FROM || undefined);

    if (r.todasEsgotadas) {
      console.log(`${tokens.length}/${tokens.length} contas 429 — interrompendo o lote.`);
      falhas++;
      console.log("Cota diária esgotada — interrompendo o lote.");
      break;
    }

    if (r.erroApi) {
      console.log(`ERRO ${r.erroApi}`);
      falhas++;
      continue;
    }

    let decisoes = r.decisoes;

    if (PUB_FROM && decisoes.length === 0) {
      process.stdout.write("fallback sem data… ");
      r = await buscarNoPool(court, query);
      if (r.todasEsgotadas) {
        console.log(`${tokens.length}/${tokens.length} contas 429 no fallback — interrompendo o lote.`);
        falhas++;
        console.log("Cota diária esgotada — interrompendo o lote.");
        break;
      }
      if (r.erroApi) {
        console.log(`ERRO ${r.erroApi}`);
        falhas++;
        continue;
      }
      decisoes = r.decisoes;
    }

    const vistos = new Set<string>();
    const formatados: PrecedenteInterno[] = [];
    for (const d of decisoes) {
      const fmt = formatar(d, court);
      if (!fmt) continue;
      const chave =
        fmt.numeroProcesso?.replace(/\D/g, "") ||
        fmt.ementa.slice(0, 100).toLowerCase();
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      formatados.push(fmt);
      if (formatados.length >= POR_TEMA) break;
    }

    let i = 0;
    let s = 0;
    for (const p0 of formatados) {
      let p = p0;
      if (USAR_LOOKUP && !lookupEsgotado && (p.numeroProcesso || p.titulo)) {
        const hyd = await completarEmentaPorLookup(p);
        if (hyd.esgotado) lookupEsgotado = true;
        else if (hyd.lookup) p = hyd.precedente;
      }
      const up = await upsertPrecedente(supabase, p);
      if (up === "insert") {
        i++;
        inseridos++;
      } else if (up === "skip") {
        s++;
        pulados++;
      } else falhas++;
    }
    console.log(`${formatados.length} úteis (${i} new / ${s} skip)`);

    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(
    `\nConcluído: ${inseridos} insert, ${pulados} skip (já na base), ${falhas} falha(s), ${chamadas} HTTP.`
  );
  console.log("Próximo: npm run reindex:embeddings");
  if (falhas && inseridos === 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
