/**
 * Scraper e-SAJ CJSG multi-UF (TJs fora da Juris.ai).
 * Mesmo layout do TJSP; host `esaj.tj{uf}.jus.br`.
 * Uso: seed P2b local — não na Vercel.
 */
import type { JulgadoScrape, ResultadoScrape } from "@/lib/scrapers/types";
import { filtrarJulgadosScrape } from "@/lib/scrapers/validar-ementa";

/** UFs P2b com e-SAJ típico (DF costuma ser outro portal — fora desta lista). */
export type UfTjEsaj =
  | "ac"
  | "al"
  | "ap"
  | "am"
  | "ba"
  | "es"
  | "ms"
  | "pa"
  | "pb"
  | "pe"
  | "pi"
  | "rn"
  | "ro"
  | "rr"
  | "se"
  | "to";

export type OpcoesBuscaEsajTj = {
  limite?: number;
  /** Janela de julgamento em anos (fase inflar P2b = 3). */
  anos?: number;
  timeoutMs?: number;
};

function dentroDeAnos(dataStr: string | undefined, anos: number): boolean {
  if (dataStr) {
    const m = dataStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (m) {
      const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
      const limite = new Date();
      limite.setFullYear(limite.getFullYear() - anos);
      return d >= limite;
    }
  }
  return true;
}

/** Ano no número CNJ (…AAAA.J.TR.OOOO) — fallback se a linha não trouxe data. */
function cnjDentroDeAnos(numero: string | undefined, anos: number): boolean {
  if (!numero) return true;
  const m = numero.match(/\d{7}-\d{2}\.(\d{4})\.\d\.\d{2}\.\d{4}/);
  if (!m) return true;
  const ano = Number(m[1]);
  const limite = new Date().getFullYear() - anos;
  return ano >= limite;
}

type BrutoPagina = {
  titulo: string;
  ementa: string;
  data?: string;
  url?: string;
  numeroProcesso?: string;
  relator?: string;
};

export function siglaTj(uf: UfTjEsaj): string {
  return `TJ${uf.toUpperCase()}`;
}

export function urlConsultaEsaj(uf: UfTjEsaj): string {
  // TJBA: HTTPS reseta a conexão; o e-SAJ responde em HTTP.
  if (uf === "ba") {
    return "http://esaj.tjba.jus.br/cjsg/consultaCompleta.do";
  }
  return `https://esaj.tj${uf}.jus.br/cjsg/consultaCompleta.do`;
}

export function fonteTjPortal(uf: UfTjEsaj): string {
  return `tj${uf}-portal`;
}

export function ementaTjEsajValida(texto: string): boolean {
  const t = (texto || "").trim();
  return t.length >= 100 && !/<[a-z][\s\S]*>/i.test(t);
}

async function extrairJulgadosDaPagina(
  page: import("playwright").Page,
  max: number
): Promise<BrutoPagina[]> {
  return page.evaluate((limite) => {
    const out: BrutoPagina[] = [];
    const lixo =
      /esajCelula|escolhaBeta|Identificar-se|Peticionamento Eletr|downloadEmenta|ementaClass|\{[\s\S]*position:\s*relative/i;
    const cnjRe = /\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/;

    const linhas = Array.from(
      document.querySelectorAll("tr.fundocin, .fundocin")
    );
    const fallbackLinhas: Element[] = [];
    if (linhas.length === 0) {
      for (const el of Array.from(
        document.querySelectorAll(".ementaClass2, td.ementaClass2")
      )) {
        const row = el.closest("tr") || el.parentElement;
        if (row) fallbackLinhas.push(row);
      }
    }
    const fonte = linhas.length > 0 ? linhas : fallbackLinhas;
    const vistos = new Set<Element>();

    for (const el of fonte) {
      if (out.length >= limite) break;
      if (vistos.has(el)) continue;
      vistos.add(el);
      const txt = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (txt.length < 80 || lixo.test(txt)) continue;
      const cnj = txt.match(cnjRe)?.[0];
      if (!cnj) continue;

      let ementa = "";
      const emEl = el.querySelector(".ementaClass2, td.ementaClass2, .ementa");
      if (emEl) ementa = (emEl.textContent || "").replace(/\s+/g, " ").trim();
      if (!ementa || ementa.length < 80) {
        const idx = txt.indexOf(cnj);
        ementa = (idx >= 0 ? txt.slice(idx + cnj.length) : txt)
          .replace(/\s+/g, " ")
          .trim();
      }
      if (ementa.length < 80 || lixo.test(ementa)) continue;

      const dataM = txt.match(/(\d{2}\/\d{2}\/\d{4})/);
      const relM = txt.match(/Relator(?:\(a\))?\s*:?\s*([A-ZÀ-Ú][^.]{5,60})/i);
      const a = el.querySelector("a[href*='abrirDocumento'], a[href*='espelho']");
      const href = a?.getAttribute("href") || undefined;

      out.push({
        titulo: cnj,
        ementa,
        data: dataM?.[1],
        numeroProcesso: cnj,
        relator: relM?.[1]?.trim(),
        url: href
          ? href.startsWith("http")
            ? href
            : new URL(href, location.origin).href
          : undefined,
      });
    }
    return out;
  }, max);
}

/**
 * Busca acórdãos no e-SAJ do TJ da UF (live Playwright).
 */
export async function buscarEsajTjJuris(
  uf: UfTjEsaj,
  termo: string,
  opcoes?: OpcoesBuscaEsajTj
): Promise<ResultadoScrape> {
  const q = termo.trim();
  const limite = Math.max(1, Math.min(40, opcoes?.limite ?? 12));
  const anos = Math.max(1, Math.min(10, opcoes?.anos ?? 3));
  const timeout = opcoes?.timeoutMs ?? 45_000;
  const t0 = Date.now();
  const tribunal = siglaTj(uf);
  const url = urlConsultaEsaj(uf);

  if (q.length < 3) {
    return {
      julgados: [],
      doCache: false,
      aviso: "Consulta muito curta.",
      duracaoMs: 0,
      fonte: "off",
    };
  }

  let browser: import("playwright").Browser | null = null;
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
    page.setDefaultTimeout(Math.min(timeout, 30_000));

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: Math.min(timeout, 25_000),
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

    await campo.waitFor({ state: "visible", timeout: 15_000 });
    await campo.fill(q);

    // Não preencher datas no form: em vários e-SAJ (ex. TJMS) zera o resultado.
    // Janela de anos = filtro no cliente após extrair (data julgamento/publicação na linha).

    const cbAcordao = page
      .locator(
        'input[name="tiposDecisaoSelecionados"][value="A"], input#cbA, input[name="dados.tipoDecisaoSelecionados"][value="A"]'
      )
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
        { timeout: 25_000 }
      )
      .catch(() => undefined);
    // Resultado e-SAJ às vezes monta ementas após o DOM inicial.
    await page.waitForTimeout(1500);

    const brutos: BrutoPagina[] = [];
    brutos.push(...(await extrairJulgadosDaPagina(page, limite * 2)));

    for (let p = 0; p < 2 && brutos.length < limite * 2; p++) {
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
        limite * 2 - brutos.length
      );
      if (!mais.length) break;
      brutos.push(...mais);
    }

    const pool = filtrarJulgadosScrape(
      brutos
        .filter(
          (j) =>
            dentroDeAnos(j.data, anos) &&
            cnjDentroDeAnos(j.numeroProcesso || j.titulo, anos)
        )
        .map(
          (j): JulgadoScrape => ({
            ...j,
            titulo: `${tribunal} — ${j.numeroProcesso || j.titulo}`,
            tribunal,
          })
        )
    ).slice(0, limite);

    if (!pool.length) {
      return {
        julgados: [],
        doCache: false,
        aviso: `${tribunal} sem ementas úteis (layout/captcha/sem hit).`,
        duracaoMs: Date.now() - t0,
        fonte: "erro",
      };
    }

    return {
      julgados: pool,
      doCache: false,
      poolSize: pool.length,
      fonte: "live",
      duracaoMs: Date.now() - t0,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      julgados: [],
      doCache: false,
      erro: `Falha scraper ${tribunal}: ${msg.slice(0, 220)}`,
      duracaoMs: Date.now() - t0,
      fonte: "erro",
    };
  } finally {
    await browser?.close().catch(() => undefined);
  }
}
