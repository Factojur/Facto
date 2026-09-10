/**
 * Scraper TSE — SJUR 4.0 (jurisprudencia.tse.jus.br).
 * Playwright headless; intercepta POST em sjur-pesquisa-api (hCaptcha no browser).
 */

import { chromium, type Page } from "playwright";
import type { JulgadoScrape, ResultadoScrape } from "@/lib/scrapers/types";

const TRIBUNAL = "TSE";
const URL_UI = "https://jurisprudencia.tse.jus.br/#/jurisprudencia/pesquisa";
const API_HINT = "sjur-pesquisa-backend/rest/public/pesquisa";

export type OpcoesBuscaTse = {
  /** Máx. decisões a devolver (default 15). */
  limite?: number;
  /** Página 0-based pedida à API via UI (default 0). */
  pagina?: number;
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

function stripHtml(html: string): string {
  return (html || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** CNJ pontuado ou número único 20 dígitos (padrão JE). */
export function numeroProcessoTseOk(n?: string): boolean {
  const t = (n || "").trim();
  if (!t) return false;
  if (/\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/.test(t)) return true;
  const digits = t.replace(/\D/g, "");
  if (digits.length === 20) return true;
  // nº curto do espelho (sem único) — aceita se tiver dígitos suficientes
  if (digits.length >= 9) return true;
  return false;
}

export function ementaTseValida(texto: string): boolean {
  const t = (texto || "").trim();
  if (t.length < 100) return false;
  if (/Falha na verifica|antirrob|hcaptcha|Insira um termo/i.test(t)) return false;
  if (/<[a-z][\s\S]*>/i.test(t)) return false;
  return true;
}

function urlEspelho(d: DecisaoSjur): string {
  const cod = d.codigoDecisao != null ? String(d.codigoDecisao) : "";
  if (cod) {
    return `https://jurisprudencia.tse.jus.br/#/jurisprudencia/espelho?codigoDecisao=${encodeURIComponent(cod)}`;
  }
  const n = d.numeroUnicoFormatado || d.numeroUnico || "";
  if (n) {
    return `https://jurisprudencia.tse.jus.br/#/jurisprudencia/pesquisa?expressaoLivre=${encodeURIComponent(n)}`;
  }
  return URL_UI;
}

function decisaoParaJulgado(d: DecisaoSjur): JulgadoScrape | null {
  const ementa = stripHtml(d.textoEmenta || d.textoDecisao || "");
  if (!ementaTseValida(ementa)) return null;
  const numero =
    d.numeroUnicoFormatado?.trim() ||
    d.numeroUnico?.trim() ||
    d.numeroProcesso?.trim() ||
    "";
  if (!numeroProcessoTseOk(numero) && !/\d{7,}/.test(numero)) return null;
  const relator =
    d.relatores?.map((r) => r.nome || r.autoridade).filter(Boolean)[0] ||
    undefined;
  const titulo = `${TRIBUNAL} — ${numero}`;
  return {
    titulo,
    ementa,
    tribunal: TRIBUNAL,
    data: d.dataDecisao || undefined,
    url: urlEspelho(d),
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
      reject(new Error("Timeout aguardando API SJUR TSE"));
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
 * Busca decisões no TSE (SJUR). Só uso local/seed — não na Vercel.
 */
export async function buscarTseJuris(
  termo: string,
  opcoes?: OpcoesBuscaTse
): Promise<ResultadoScrape> {
  const q = termo.trim();
  const t0 = Date.now();
  if (q.length < 3) {
    return {
      julgados: [],
      doCache: false,
      aviso: "Consulta TSE muito curta.",
      duracaoMs: 0,
    };
  }

  const limite = Math.min(40, Math.max(1, opcoes?.limite ?? 15));
  const timeoutMs = opcoes?.timeoutMs ?? 90_000;
  let browser: import("playwright").Browser | undefined;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const waitApi = esperarApiPesquisa(page, timeoutMs);

    await page.goto(URL_UI, {
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
      const j = decisaoParaJulgado(d);
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
        aviso: "TSE não retornou ementas úteis (captcha, layout ou termo sem hit).",
        fonte: "erro",
        duracaoMs: Date.now() - t0,
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
      erro: `Falha scraper TSE: ${msg.slice(0, 240)}`,
      fonte: "erro",
      duracaoMs: Date.now() - t0,
    };
  } finally {
    await browser?.close().catch(() => undefined);
  }
}
