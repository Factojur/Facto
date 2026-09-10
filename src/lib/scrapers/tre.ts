/**
 * Scraper TRE — SJUR no host jurisprudencia.tre-XX.jus.br
 * (o hostname define o tribunal; mesma API/hCaptcha do TSE).
 * Só uso local/seed — não na Vercel.
 */

import { chromium, type Page } from "playwright";
import type { JulgadoScrape, ResultadoScrape } from "@/lib/scrapers/types";
import { ementaTseValida, numeroProcessoTseOk } from "@/lib/scrapers/tse";

export type UfTre =
  | "ac"
  | "al"
  | "ap"
  | "am"
  | "ba"
  | "ce"
  | "df"
  | "es"
  | "go"
  | "ma"
  | "mg"
  | "ms"
  | "mt"
  | "pa"
  | "pb"
  | "pr"
  | "pe"
  | "pi"
  | "rj"
  | "rn"
  | "rs"
  | "ro"
  | "rr"
  | "sc"
  | "sp"
  | "se"
  | "to";

export type OpcoesBuscaTre = {
  limite?: number;
  timeoutMs?: number;
};

type DecisaoSjur = {
  codigoDecisao?: number | string;
  numeroProcesso?: string;
  numeroUnico?: string;
  numeroUnicoFormatado?: string;
  dataDecisao?: string;
  descricaoTipoDecisao?: string;
  siglaTribunalJE?: string;
  textoEmenta?: string;
  textoDecisao?: string;
  relatores?: Array<{ nome?: string; autoridade?: string }>;
};

const API_HINT = "sjur-pesquisa-backend/rest/public/pesquisa";

function stripHtml(html: string): string {
  return (html || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&ndash;/gi, "–")
    .replace(/\s+/g, " ")
    .trim();
}

export function siglaTre(uf: UfTre): string {
  return `TRE-${uf.toUpperCase()}`;
}

export function urlUiTre(uf: UfTre): string {
  return `https://jurisprudencia.tre-${uf}.jus.br/#/jurisprudencia/pesquisa`;
}

export function ementaTreValida(texto: string): boolean {
  return ementaTseValida(texto);
}

function urlEspelho(uf: UfTre, d: DecisaoSjur): string {
  const base = `https://jurisprudencia.tre-${uf}.jus.br`;
  const cod = d.codigoDecisao != null ? String(d.codigoDecisao) : "";
  if (cod) {
    return `${base}/#/jurisprudencia/espelho?codigoDecisao=${encodeURIComponent(cod)}`;
  }
  const n = d.numeroUnicoFormatado || d.numeroUnico || "";
  if (n) {
    return `${base}/#/jurisprudencia/pesquisa?expressaoLivre=${encodeURIComponent(n)}`;
  }
  return urlUiTre(uf);
}

function decisaoParaJulgado(uf: UfTre, d: DecisaoSjur): JulgadoScrape | null {
  const siglaEsperada = siglaTre(uf);
  const sigla = (d.siglaTribunalJE || "").toUpperCase();
  if (sigla && sigla !== siglaEsperada) return null;

  const ementa = stripHtml(d.textoEmenta || d.textoDecisao || "");
  if (!ementaTreValida(ementa)) return null;
  const numero =
    d.numeroUnicoFormatado?.trim() ||
    d.numeroUnico?.trim() ||
    d.numeroProcesso?.trim() ||
    "";
  if (!numeroProcessoTseOk(numero) && !/\d{7,}/.test(numero)) return null;
  const relator =
    d.relatores?.map((r) => r.nome || r.autoridade).filter(Boolean)[0] ||
    undefined;
  return {
    titulo: `${siglaEsperada} — ${numero}`,
    ementa,
    tribunal: siglaEsperada,
    data: d.dataDecisao || undefined,
    url: urlEspelho(uf, d),
    numeroProcesso: numero,
    relator,
  };
}

async function esperarApiPesquisa(
  page: Page,
  timeoutMs: number
): Promise<DecisaoSjur[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      page.off("response", onResp);
      reject(new Error("Timeout aguardando API SJUR TRE"));
    }, timeoutMs);

    async function onResp(res: import("playwright").Response) {
      if (!res.url().includes(API_HINT)) return;
      if (res.request().method() !== "POST") return;
      try {
        const json = (await res.json()) as {
          mensagem?: string | null;
          content?: DecisaoSjur[];
        };
        if (json.mensagem && /antirrob|captcha|Falha/i.test(json.mensagem)) {
          clearTimeout(timer);
          page.off("response", onResp);
          reject(new Error(`SJUR antirrobô: ${json.mensagem}`));
          return;
        }
        clearTimeout(timer);
        page.off("response", onResp);
        resolve(Array.isArray(json.content) ? json.content : []);
      } catch (e) {
        clearTimeout(timer);
        page.off("response", onResp);
        reject(e);
      }
    }

    page.on("response", onResp);
  });
}

/**
 * Busca decisões de um TRE via SJUR (host jurisprudencia.tre-XX.jus.br).
 */
export async function buscarTreJuris(
  uf: UfTre,
  termo: string,
  opcoes?: OpcoesBuscaTre
): Promise<ResultadoScrape> {
  const q = termo.trim();
  const t0 = Date.now();
  if (q.length < 3) {
    return {
      julgados: [],
      doCache: false,
      aviso: "Consulta TRE muito curta.",
      duracaoMs: 0,
    };
  }

  const limite = Math.min(40, Math.max(1, opcoes?.limite ?? 15));
  const timeoutMs = opcoes?.timeoutMs ?? 90_000;
  let browser: import("playwright").Browser | undefined;
  const sigla = siglaTre(uf);

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const waitApi = esperarApiPesquisa(page, timeoutMs);

    await page.goto(urlUiTre(uf), {
      waitUntil: "domcontentloaded",
      timeout: timeoutMs,
    });
    await page.waitForTimeout(2000);

    const input = page.getByRole("textbox", { name: /Pesquisa livre/i });
    await input.fill(q);
    await page.getByRole("button", { name: /^Pesquisar$/i }).click();

    const content = await waitApi;
    const julgados: JulgadoScrape[] = [];
    const vistos = new Set<string>();
    for (const d of content) {
      if (julgados.length >= limite) break;
      const j = decisaoParaJulgado(uf, d);
      if (!j) continue;
      const key = j.numeroProcesso || j.titulo;
      if (vistos.has(key)) continue;
      vistos.add(key);
      julgados.push(j);
    }

    if (!julgados.length) {
      return {
        julgados: [],
        doCache: false,
        aviso: `${sigla} não retornou ementas úteis (captcha, layout ou termo sem hit).`,
        fonte: "erro",
        duracaoMs: Date.now() - t0,
        poolSize: content.length,
      };
    }

    return {
      julgados,
      doCache: false,
      poolSize: content.length,
      fonte: "live",
      duracaoMs: Date.now() - t0,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      julgados: [],
      doCache: false,
      erro: `Falha scraper ${sigla}: ${msg.slice(0, 240)}`,
      fonte: "erro",
      duracaoMs: Date.now() - t0,
    };
  } finally {
    await browser?.close().catch(() => undefined);
  }
}

/** Atalho P1a — TRE-SP. */
export async function buscarTreSpJuris(
  termo: string,
  opcoes?: OpcoesBuscaTre
): Promise<ResultadoScrape> {
  return buscarTreJuris("sp", termo, opcoes);
}
