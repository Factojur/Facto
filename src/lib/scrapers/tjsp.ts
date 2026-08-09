/**
 * Scraper TJSP (e-SAJ CJSG) — Playwright headless.
 *
 * Fluxo:
 * 1. Termo de busca derivado das palavras-chave do caso (≤4 anos)
 * 2. Coleta pool amplo (até POOL_SCRAPE_MAX)
 * 3. Ranqueia por afinidade ao caso → devolve os 5 melhores
 *
 * Env:
 * - SCRAPER_TJSP_ENABLED / SCRAPER_TJSP_TIMEOUT_MS
 */

import {
  ANOS_MAX_JULGADO,
  MAX_RESULTADOS_SCRAPE,
  POOL_SCRAPE_MAX,
  type JulgadoScrape,
  type ResultadoScrape,
} from "@/lib/scrapers/types";
import {
  selecionarTopPorAfinidade,
  termoBuscaAPartirDoCaso,
} from "@/lib/scrapers/afinidade";
import { gravarCacheScrape, lerCacheScrape } from "@/lib/scrapers/cache";
import { enfileirarScrapeNaVerificacao } from "@/lib/scrapers/verificacao-scrape";

const TRIBUNAL = "TJSP";
const URL_CONSULTA =
  "https://esaj.tjsp.jus.br/cjsg/consultaCompleta.do";

export function scraperTjspHabilitado(): boolean {
  const v = process.env.SCRAPER_TJSP_ENABLED?.trim().toLowerCase();
  if (v === "0" || v === "false" || v === "off") return false;
  if (v === "1" || v === "true" || v === "on") return true;
  if (process.env.VERCEL) return false;
  return true;
}

function dataLimiteAnos(anos: number): { inicio: string; fim: string } {
  const fim = new Date();
  const inicio = new Date();
  inicio.setFullYear(inicio.getFullYear() - anos);
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  return { inicio: fmt(inicio), fim: fmt(fim) };
}

function dentroDeAnos(dataStr: string | undefined, anos: number): boolean {
  if (!dataStr) return true;
  const m = dataStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return true;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  const limite = new Date();
  limite.setFullYear(limite.getFullYear() - anos);
  return d >= limite;
}

type BrutoPagina = {
  titulo: string;
  ementa: string;
  data?: string;
  url?: string;
  numeroProcesso?: string;
  relator?: string;
};

async function extrairJulgadosDaPagina(
  page: import("playwright").Page,
  max: number
): Promise<BrutoPagina[]> {
  return page.evaluate((limite) => {
    const out: BrutoPagina[] = [];
    const blocos = Array.from(
      document.querySelectorAll(
        "tr.fundocin, .fundocin, div[id^='divDadosResultado']"
      )
    );
    const fonte =
      blocos.length > 0
        ? blocos
        : Array.from(document.querySelectorAll("table")).flatMap((t) =>
            Array.from(t.querySelectorAll("tr"))
          );

    for (const el of fonte) {
      if (out.length >= limite) break;
      const texto = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (texto.length < 80) continue;

      const ementaEl =
        el.querySelector(".ementaClass2, .ementaClass, td.ementaClass2") || el;
      let ementa = (ementaEl.textContent || "").replace(/\s+/g, " ").trim();
      ementa = ementa.replace(/^EMENTA:?\s*/i, "").trim();
      if (ementa.length < 60) continue;

      const link =
        (el.querySelector(
          "a.downloadEmenta, a.esajLinkLogin, a[href*='getArquivo'], a[href*='cposg']"
        ) as HTMLAnchorElement | null) ||
        (el.querySelector("a[href]") as HTMLAnchorElement | null);

      const procMatch = texto.match(
        /\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}|\d{4,7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/
      );
      const dataMatch =
        texto.match(
          /(?:Data\s+(?:do\s+)?[Jj]ulgamento|Julgamento)\s*:?\s*(\d{2}\/\d{2}\/\d{4})/i
        ) || texto.match(/(\d{2}\/\d{2}\/\d{4})/);
      const relMatch = texto.match(
        /Relator(?:\(a\))?\s*:?\s*([^\n|]+?)(?:\s{2}|Data|$)/i
      );

      const numeroProcesso = procMatch?.[0];
      out.push({
        titulo: numeroProcesso ? `TJSP — ${numeroProcesso}` : `TJSP — julgado`,
        ementa: ementa.slice(0, 4000),
        data: dataMatch?.[1],
        url: link?.href || undefined,
        numeroProcesso,
        relator: relMatch?.[1]?.trim().slice(0, 120),
      });
    }
    return out;
  }, max);
}

function dedupePool(itens: JulgadoScrape[]): JulgadoScrape[] {
  const vistos = new Set<string>();
  const out: JulgadoScrape[] = [];
  for (const j of itens) {
    const k =
      j.numeroProcesso?.replace(/\D/g, "") ||
      `${j.titulo}|${j.ementa.slice(0, 80)}`;
    if (vistos.has(k)) continue;
    vistos.add(k);
    out.push(j);
  }
  return out;
}

async function scrapeTjspLive(queryCaso: string): Promise<{
  pool: JulgadoScrape[];
  aviso?: string;
  erro?: string;
}> {
  const timeout = Number(process.env.SCRAPER_TJSP_TIMEOUT_MS ?? 45000);
  let browser: import("playwright").Browser | null = null;
  const termoBusca = termoBuscaAPartirDoCaso(queryCaso);

  try {
    const { chromium } = await import("playwright");
    browser = await chromium.launch({
      headless: true,
      args: ["--disable-dev-shm-usage", "--no-sandbox"],
    });
    const page = await browser.newPage({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      locale: "pt-BR",
    });
    page.setDefaultTimeout(Math.min(timeout, 30000));

    await page.goto(URL_CONSULTA, {
      waitUntil: "domcontentloaded",
      timeout: Math.min(timeout, 20000),
    });

    const campo = page
      .locator(
        [
          'textarea[name="dados.buscaInteiroTeor"]',
          'input[name="dados.buscaInteiroTeor"]',
          "#iddados\\.buscaInteiroTeor",
          'textarea[name="dados.ementa"]',
          'input[name="dados.ementa"]',
          "#iddados\\.ementa",
        ].join(", ")
      )
      .first();

    await campo.waitFor({ state: "visible", timeout: 12000 });
    await campo.fill(termoBusca);

    const { inicio, fim } = dataLimiteAnos(ANOS_MAX_JULGADO);
    const dtIni = page
      .locator(
        'input[name="dados.dtJulgamentoInicio"], #iddados\\.dtJulgamentoInicio'
      )
      .first();
    const dtFim = page
      .locator(
        'input[name="dados.dtJulgamentoFim"], #iddados\\.dtJulgamentoFim'
      )
      .first();
    if (await dtIni.count()) await dtIni.fill(inicio).catch(() => undefined);
    if (await dtFim.count()) await dtFim.fill(fim).catch(() => undefined);

    const cbAcordao = page
      .locator('input[name="tiposDecisaoSelecionados"][value="A"], input#cbA')
      .first();
    if (await cbAcordao.count()) {
      const checked = await cbAcordao.isChecked().catch(() => true);
      if (!checked) await cbAcordao.check().catch(() => undefined);
    }

    const btn = page
      .locator(
        'input[type="submit"][value="Pesquisar"], input#pbSubmit, input[name="pbSubmit"], button:has-text("Pesquisar")'
      )
      .first();
    await btn.click();
    await page.waitForLoadState("domcontentloaded");
    await page
      .waitForSelector(
        ".fundocin, tr.fundocin, .ementaClass2, #divDadosResultado-A, td.ementaClass2",
        { timeout: 18000 }
      )
      .catch(() => undefined);

    const brutos: BrutoPagina[] = [];
    brutos.push(...(await extrairJulgadosDaPagina(page, POOL_SCRAPE_MAX)));

    // Tenta 1–2 páginas seguintes para engrossar o pool
    for (let p = 0; p < 2 && brutos.length < POOL_SCRAPE_MAX; p++) {
      const proximo = page
        .locator(
          'a:has-text("Próximo"), a:has-text(">"), a[title*="Próxima"], a[title*="proxima"]'
        )
        .first();
      if (!(await proximo.count())) break;
      const disabled = await proximo.getAttribute("class");
      if (disabled?.includes("disabled")) break;
      await proximo.click().catch(() => undefined);
      await page.waitForLoadState("domcontentloaded").catch(() => undefined);
      await new Promise((r) => setTimeout(r, 800));
      const mais = await extrairJulgadosDaPagina(
        page,
        POOL_SCRAPE_MAX - brutos.length
      );
      if (!mais.length) break;
      brutos.push(...mais);
    }

    const pool = dedupePool(
      brutos
        .filter((j) => dentroDeAnos(j.data, ANOS_MAX_JULGADO))
        .map((j) => ({ ...j, tribunal: TRIBUNAL }))
    ).slice(0, POOL_SCRAPE_MAX);

    if (!pool.length) {
      return {
        pool: [],
        aviso:
          "TJSP não retornou ementas úteis (layout mudou, captcha ou sem resultado).",
      };
    }

    return { pool };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      pool: [],
      erro: `Falha no scraper TJSP: ${msg.slice(0, 200)}`,
    };
  } finally {
    await browser?.close().catch(() => undefined);
  }
}

function topDoPool(
  queryCaso: string,
  pool: JulgadoScrape[]
): JulgadoScrape[] {
  return selecionarTopPorAfinidade(
    queryCaso,
    pool,
    MAX_RESULTADOS_SCRAPE
  ).map(({ scoreAfinidade, ...rest }) => ({
    ...rest,
    scoreAfinidade,
  }));
}

/**
 * Busca no TJSP: cache/pool → ranking por afinidade ao caso → top 5.
 */
export async function buscarTjsp(query: string): Promise<ResultadoScrape> {
  const q = query.trim();
  if (q.length < 4) {
    return {
      julgados: [],
      doCache: false,
      aviso: "Consulta muito curta.",
      duracaoMs: 0,
    };
  }

  const t0 = Date.now();

  try {
    const cached = await lerCacheScrape(TRIBUNAL, q);
    if (cached && cached.julgados.length) {
      const top = topDoPool(q, cached.julgados);
      return {
        julgados: top,
        doCache: true,
        poolSize: cached.julgados.length,
        duracaoMs: Date.now() - t0,
      };
    }
  } catch {
    /* cache ausente */
  }

  if (!scraperTjspHabilitado()) {
    return {
      julgados: [],
      doCache: false,
      aviso:
        "Scraper TJSP desligado neste ambiente (defina SCRAPER_TJSP_ENABLED=true).",
      duracaoMs: Date.now() - t0,
    };
  }

  const live = await scrapeTjspLive(q);
  const pool = live.pool;
  const top = topDoPool(q, pool);

  let cacheId: string | undefined;
  if (pool.length) {
    try {
      // Cache guarda o pool; o picker recebe só o top ranqueado
      cacheId = await gravarCacheScrape(TRIBUNAL, q, pool);
      await enfileirarScrapeNaVerificacao(top, {
        scrapeCacheId: cacheId,
        fonte: "tjsp_scraper",
      });
    } catch (e) {
      console.error("[buscarTjsp pós-scrape]", e);
    }
  }

  return {
    julgados: top,
    doCache: false,
    poolSize: pool.length,
    aviso: live.aviso,
    erro: live.erro,
    duracaoMs: Date.now() - t0,
  };
}
