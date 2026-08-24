/**
 * Parsers e upserts do seed diário de súmulas (categoria Súmula).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { SUMULAS_ATIVAS_CURADAS } from "../src/lib/sumulas";

export type ItemSumulaSeed = {
  titulo: string;
  texto: string;
  categoria: "Súmula";
};

function limpar(s: string): string {
  return s
    .replace(/Súmulas\s*A-\d+/g, " ")
    .replace(/S\s*Ú\s*M\s*(?:\n\s*)*U\s*L\s*A\s*S?/g, " ")
    .replace(/(\w)-\s+(\w)/g, "$1$2")
    .replace(/\s+/g, " ")
    .trim();
}

function statusDeCabeca(head: string): "ativa" | "cancelada" {
  if (/\(cancelad/i.test(head)) return "cancelada";
  if (/cancelamento mantido/i.test(head)) return "cancelada";
  if (/REVOGAD/i.test(head)) return "cancelada";
  return "ativa";
}

/** Extrai blocos prefix-N do livro TST. */
export function parseBlocosPrefixo(
  textoLivro: string,
  prefixoRegex: RegExp,
  montar: (num: number, enunciado: string, status: "ativa" | "cancelada") => ItemSumulaSeed | null
): ItemSumulaSeed[] {
  const parts = textoLivro.split(prefixoRegex);
  // split with capture: [before, num1, body1, num2, body2, ...]
  const out: ItemSumulaSeed[] = [];
  const byNum = new Map<number, ItemSumulaSeed>();

  // Re-split keeping numbers
  const re = new RegExp(prefixoRegex.source, prefixoRegex.flags.includes("g") ? prefixoRegex.flags : prefixoRegex.flags + "g");
  const matches = [...textoLivro.matchAll(re)];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const num = Number(m[1]);
    if (!Number.isFinite(num)) continue;
    const start = (m.index ?? 0) + m[0].length;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? textoLivro.length) : textoLivro.length;
    let body = textoLivro.slice(start, end);
    const hi = body.search(/\bHistórico\s*:/i);
    if (hi >= 0) body = body.slice(0, hi);
    const head = limpar(body.slice(0, 400));
    const status = statusDeCabeca(head);
    let enunciado = limpar(body);
    // tira título curto no início (até primeiro ponto longo)
    const em = enunciado.match(
      /(?:DJ|DEJT)[^.]*\.\s*(.+)/i
    );
    if (em) enunciado = limpar(em[1]);
    if (enunciado.length < 30) continue;
    if (status !== "ativa") continue; // só ativas no RAG
    const item = montar(num, enunciado, status);
    if (!item) continue;
    const prev = byNum.get(num);
    if (!prev || item.texto.length > prev.texto.length) byNum.set(num, item);
  }
  for (const n of [...byNum.keys()].sort((a, b) => a - b)) {
    out.push(byNum.get(n)!);
  }
  void parts;
  return out;
}

export function carregarLivroTst(): string {
  const p = resolve(process.cwd(), "scripts/sumulas-fonte/tst-livro-2025.txt");
  if (!existsSync(p)) {
    throw new Error(`Fonte TST ausente: ${p}`);
  }
  return readFileSync(p, "utf8");
}

export function itensOjSdi1(livro: string): ItemSumulaSeed[] {
  return parseBlocosPrefixo(livro, /OJ-SDI1-(\d+)\b/g, (num, enunciado) => ({
    titulo: `OJ SDI-1 ${num} do TST`,
    categoria: "Súmula",
    texto: `OJ-SDI1-${num}/TST (ATIVA): ${enunciado}`,
  }));
}

export function itensOjSdi1t(livro: string): ItemSumulaSeed[] {
  return parseBlocosPrefixo(livro, /OJ-SDI1T-(\d+)\b/g, (num, enunciado) => ({
    titulo: `OJ SDI-1 Transitória ${num} do TST`,
    categoria: "Súmula",
    texto: `OJ-SDI1T-${num}/TST (ATIVA): ${enunciado}`,
  }));
}

export function itensOjSdi2(livro: string): ItemSumulaSeed[] {
  return parseBlocosPrefixo(livro, /OJ-SDI2-(\d+)\b/g, (num, enunciado) => ({
    titulo: `OJ SDI-2 ${num} do TST`,
    categoria: "Súmula",
    texto: `OJ-SDI2-${num}/TST (ATIVA): ${enunciado}`,
  }));
}

export function itensOjTp(livro: string): ItemSumulaSeed[] {
  return parseBlocosPrefixo(livro, /OJ-TP\/OE-(\d+)\b/g, (num, enunciado) => ({
    titulo: `OJ TP/OE ${num} do TST`,
    categoria: "Súmula",
    texto: `OJ-TP/OE-${num}/TST (ATIVA): ${enunciado}`,
  }));
}

export function itensOjSdc(livro: string): ItemSumulaSeed[] {
  return parseBlocosPrefixo(livro, /OJ-SDC-(\d+)\b/g, (num, enunciado) => ({
    titulo: `OJ SDC ${num} do TST`,
    categoria: "Súmula",
    texto: `OJ-SDC-${num}/TST (ATIVA): ${enunciado}`,
  }));
}

export function itensPn(livro: string): ItemSumulaSeed[] {
  return parseBlocosPrefixo(livro, /\bPN-(\d+)\b/g, (num, enunciado) => ({
    titulo: `Precedente Normativo ${num} do TST`,
    categoria: "Súmula",
    texto: `PN-${num}/TST (ATIVA): ${enunciado}`,
  }));
}

export function itensCodigoTstTse(): ItemSumulaSeed[] {
  return SUMULAS_ATIVAS_CURADAS.filter(
    (s) => s.titulo.includes(" do TST") || s.titulo.includes(" do TSE")
  ).map((s) => ({
    titulo: s.titulo,
    texto: s.texto,
    categoria: "Súmula" as const,
  }));
}

export function itensTjspArquivo(): ItemSumulaSeed[] {
  const p = resolve(process.cwd(), "scripts/sumulas-fonte/tjsp-sumulas.txt");
  if (!existsSync(p)) return [];
  const raw = readFileSync(p, "utf8");
  const out: ItemSumulaSeed[] = [];
  const re = /Súmula\s+(\d+)\s*:\s*([\s\S]*?)(?=\nSúmula\s+\d+\s*:|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    const num = Number(m[1]);
    let enunciado = limpar(m[2]);
    if (/^REVOGAD/i.test(enunciado) || enunciado.length < 20) continue;
    // corta notas de sessão
    enunciado = enunciado.replace(/\(Sessão[\s\S]*$/i, "").trim();
    if (enunciado.length < 20) continue;
    out.push({
      titulo: `Súmula ${num} do TJSP`,
      categoria: "Súmula",
      texto: `Súmula ${num}/TJSP (ATIVA): ${enunciado}`,
    });
  }
  return out;
}

/** Busca súmulas novas no portal TSE (páginas Plone). */
export async function buscarTsePortal(): Promise<ItemSumulaSeed[]> {
  const base =
    "https://www.tse.jus.br/legislacao/codigo-eleitoral/sumulas/sumulas-do-tse";
  const out: ItemSumulaSeed[] = [];
  for (let start = 0; start <= 80; start += 20) {
    const url = start === 0 ? base : `${base}?b_start:int=${start}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "FACTO-seed-sumulas/1.0" },
    });
    if (!res.ok) break;
    const html = await res.text();
    // headings + paragraph following — markdown-ish from pages varies; parse HTML loosely
    const blocos = [
      ...html.matchAll(
        /Súmula-TSE\s+n\.\s*(\d+)(?:\s*\((Cancelada)\))?\s*<\/[^>]+>\s*<[^>]+>([\s\S]*?)<\//gi
      ),
    ];
    if (blocos.length === 0) {
      // fallback: text pattern from fetched markdown-like dumps
      const textMatches = [
        ...html.matchAll(
          /Súmula-TSE\s+n\.\s*(\d+)(?:\s*\((Cancelada)\))?[\s\S]{0,80}?([A-ZÀ-Ú][^<]{40,1200}?)(?:<\/p>|<h2|$)/gi
        ),
      ];
      for (const tm of textMatches) {
        const num = Number(tm[1]);
        if (tm[2]) continue; // cancelada
        const enunciado = limpar(tm[3] ?? "");
        if (enunciado.length < 30) continue;
        out.push({
          titulo: `Súmula ${num} do TSE`,
          categoria: "Súmula",
          texto: `Súmula ${num}/TSE (ATIVA): ${enunciado}`,
        });
      }
    } else {
      for (const b of blocos) {
        const num = Number(b[1]);
        if (b[2]) continue;
        const enunciado = limpar(b[3] ?? "");
        if (enunciado.length < 30) continue;
        out.push({
          titulo: `Súmula ${num} do TSE`,
          categoria: "Súmula",
          texto: `Súmula ${num}/TSE (ATIVA): ${enunciado}`,
        });
      }
    }
    if (!html.includes("b_start") && start > 0) break;
    await new Promise((r) => setTimeout(r, 400));
  }
  // dedupe
  const map = new Map<string, ItemSumulaSeed>();
  for (const i of out) map.set(i.titulo, i);
  return [...map.values()].sort((a, b) => a.titulo.localeCompare(b.titulo, "pt"));
}

export function clienteSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function upsertItens(
  supabase: SupabaseClient,
  itens: ItemSumulaSeed[]
): Promise<{ ok: number; falha: number }> {
  let ok = 0;
  let falha = 0;
  for (const s of itens) {
    const { data: existente } = await supabase
      .from("base_conhecimento")
      .select("id")
      .eq("titulo", s.titulo)
      .maybeSingle();

    if (existente?.id) {
      const { error } = await supabase
        .from("base_conhecimento")
        .update({ categoria: "Súmula", texto: s.texto })
        .eq("id", existente.id);
      if (error) {
        console.error(`ERRO update ${s.titulo}:`, error.message);
        falha++;
      } else {
        console.log(`OK update ${s.titulo}`);
        ok++;
      }
    } else {
      const { error } = await supabase.from("base_conhecimento").insert({
        titulo: s.titulo,
        categoria: "Súmula",
        texto: s.texto,
      });
      if (error) {
        console.error(`ERRO insert ${s.titulo}:`, error.message);
        falha++;
      } else {
        console.log(`OK insert ${s.titulo}`);
        ok++;
      }
    }
  }
  return { ok, falha };
}
