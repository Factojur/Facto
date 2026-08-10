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
import { config } from "dotenv";
import { resolve } from "path";
import {
  tokensDoPool,
  type PrecedenteInterno,
} from "../src/lib/juris-provedores/jurisprudencia-service";

config({ path: resolve(process.cwd(), ".env.local") });

const BASE = "https://jurisprudencias.ai/api/v1";
const POR_TEMA = Math.max(
  1,
  Number(process.env.SEED_JURIS_POR_TEMA ?? 10) || 10
);
const TRIBUNAL = (process.env.SEED_JURIS_TRIBUNAL ?? "tjsp").toLowerCase();

/** Temas JEC prioritários (alinhados ao aquecimento de cache). */
const TERMOS_JEC = [
  "indenização dano moral atraso voo",
  "inexigibilidade débito negativação indevida",
  "obrigação de fazer plano de saúde",
  "dano moral cobrança indevida telefone",
  "rescisão contrato compra venda veículo",
  "dano material e moral falha prestação serviço",
  "tutela urgência corte energia elétrica",
  "CDC vício produto garantia",
  "juros abusivos cartão crédito revisão",
  "golpe pix transferência fraude banco",
  "nome sujo SPC SERASA negativação",
  "atraso entrega imóvel construtora",
  "cancelamento passagem aérea reembolso",
  "honorários advocatícios JEC",
  "prova emprestada juizado especial",
];

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
  token: string
): Promise<{ decisoes: DecisaoAi[]; status: number; erro?: string }> {
  const url = new URL(`${BASE}/courts/${court}/decisions`);
  url.searchParams.set("q", q.slice(0, 200));
  url.searchParams.set("page", "0");
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

  // Também remove textos óbvios de HTML do e-SAJ
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

async function upsertPrecedente(
  supabase: SupabaseClient,
  p: PrecedenteInterno
): Promise<"insert" | "update" | "skip" | "erro"> {
  const titulo = p.titulo.trim();
  const texto = montarTexto(p);
  if (!ementaValida(texto)) return "skip";

  const { data: existente } = await supabase
    .from("base_conhecimento")
    .select("id")
    .eq("titulo", titulo)
    .maybeSingle();

  const payload = {
    titulo,
    categoria: "Jurisprudência" as const,
    texto,
    fonte: "jurisprudencias.ai",
    status: "validado",
  };

  if (existente?.id) {
    const { error } = await supabase
      .from("base_conhecimento")
      .update(payload)
      .eq("id", existente.id);
    return error ? "erro" : "update";
  }

  const { error } = await supabase.from("base_conhecimento").insert(payload);
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

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("Limpando lixo de seed anterior (cache HTML)…");
  const removidos = await limparLixoTjsp(supabase);
  console.log(`Removidos: ${removidos}\n`);

  console.log(
    `Lote Jurisprudências.ai → ${TRIBUNAL.toUpperCase()} · ${TERMOS_JEC.length} temas · até ${POR_TEMA}/tema\n`
  );

  let inseridos = 0;
  let atualizados = 0;
  let pulados = 0;
  let falhas = 0;
  let chamadas = 0;
  let tokenIdx = 0;

  for (const termo of TERMOS_JEC) {
    process.stdout.write(`▸ ${termo.slice(0, 56)}… `);

    let decisoes: DecisaoAi[] = [];
    let okHttp = false;
    for (let t = 0; t < tokens.length; t++) {
      const token = tokens[(tokenIdx + t) % tokens.length]!;
      chamadas++;
      const r = await buscarPagina(TRIBUNAL, termo, token);
      if (r.status === 429 || r.status === 401 || r.status === 403) {
        console.log(`token esgotado/negado (${r.status}), tentando outro…`);
        continue;
      }
      if (r.erro && !r.decisoes.length) {
        console.log(`ERRO ${r.erro}`);
        falhas++;
        okHttp = true;
        break;
      }
      decisoes = r.decisoes;
      tokenIdx = (tokenIdx + t) % tokens.length;
      okHttp = true;
      break;
    }

    if (!okHttp) {
      console.log("sem token disponível");
      falhas++;
      continue;
    }

    const vistos = new Set<string>();
    const formatados: PrecedenteInterno[] = [];
    for (const d of decisoes) {
      const fmt = formatar(d, TRIBUNAL);
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
    let u = 0;
    for (const p of formatados) {
      const r = await upsertPrecedente(supabase, p);
      if (r === "insert") {
        i++;
        inseridos++;
      } else if (r === "update") {
        u++;
        atualizados++;
      } else if (r === "skip") pulados++;
      else falhas++;
    }
    console.log(`${formatados.length} úteis (${i} new / ${u} upd)`);

    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(
    `\nConcluído: ${inseridos} insert, ${atualizados} update, ${pulados} skip, ${falhas} falha(s), ${chamadas} HTTP.`
  );
  console.log("Próximo: npm run reindex:embeddings");
  if (falhas && inseridos === 0 && atualizados === 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
