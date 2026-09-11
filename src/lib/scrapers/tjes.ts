/**
 * Scraper TJES — https://sistemas.tjes.jus.br/consulta-jurisprudencia/
 */
import type { JulgadoScrape, ResultadoScrape } from "@/lib/scrapers/types";
import {
  ementaJurisPortalValida,
  filtrarJulgadosScrape,
  normalizarEmentaPortal,
} from "@/lib/scrapers/validar-ementa";

export type OpcoesBuscaTjes = {
  limite?: number;
  anos?: number;
  timeoutMs?: number;
};

function limpar(s: string): string {
  return (s || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function dataOk(data: string | undefined, anos: number): boolean {
  if (!data) return true;
  const m = data.match(/(\d{2})\/(\d{2})\/(\d{4})/) || data.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return true;
  const d =
    m[0].includes("-")
      ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
      : new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  const lim = new Date();
  lim.setFullYear(lim.getFullYear() - anos);
  return d >= lim;
}

export function ementaTjesValida(t: string): boolean {
  return ementaJurisPortalValida(normalizarEmentaPortal(t));
}

const URL_ES = "https://sistemas.tjes.jus.br/consulta-jurisprudencia/";

export async function buscarTjesJuris(
  termo: string,
  opcoes?: OpcoesBuscaTjes
): Promise<ResultadoScrape> {
  const q = termo.trim();
  const limite = Math.max(1, Math.min(40, opcoes?.limite ?? 12));
  const anos = Math.max(1, Math.min(10, opcoes?.anos ?? 3));
  const timeout = opcoes?.timeoutMs ?? 60_000;
  const t0 = Date.now();
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
    page.setDefaultTimeout(Math.min(timeout, 40_000));
    await page.goto(URL_ES, {
      waitUntil: "domcontentloaded",
      timeout: Math.min(timeout, 35_000),
    });
    await page.waitForTimeout(1500);

    const busca = page
      .locator(
        'input[placeholder*="termos da busca"], input[type="text"]'
      )
      .first();
    await busca.waitFor({ state: "visible", timeout: 20_000 });
    await busca.fill(q);

    // Preferir 2º grau se houver checkbox/label.
    await page
      .getByText(/2º Grau PJe/i)
      .first()
      .click()
      .catch(() => undefined);

    const de = new Date();
    de.setFullYear(de.getFullYear() - anos);
    const deIso = de.toISOString().slice(0, 10);
    const ateIso = new Date().toISOString().slice(0, 10);
    const dates = page.locator('input[type="date"]');
    if ((await dates.count()) >= 2) {
      await dates.nth(0).fill(deIso).catch(() => undefined);
      await dates.nth(1).fill(ateIso).catch(() => undefined);
    }

    await page
      .getByRole("button", { name: /Pesquisar|Buscar|Consultar/i })
      .first()
      .click()
      .catch(async () => {
        await busca.press("Enter");
      });
    await page.waitForTimeout(4000);

    const brutos = await page.evaluate((max) => {
      const cnjRe = /\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/;
      const out: {
        numeroProcesso: string;
        ementa: string;
        data?: string;
        relator?: string;
        url?: string;
      }[] = [];
      const vistos = new Set<string>();
      const els = Array.from(
        document.querySelectorAll(
          "article, .card, .resultado, li, tr, .MuiCard-root, .list-item, div"
        )
      );
      for (const el of els) {
        if (out.length >= max) break;
        const txt = (el.textContent || "").replace(/\s+/g, " ").trim();
        const cnj = txt.match(cnjRe)?.[0];
        if (!cnj || vistos.has(cnj) || txt.length < 140) continue;
        // Evita pegar o container raiz inteiro.
        if (txt.length > 8000) continue;
        vistos.add(cnj);
        const ementa =
          txt.match(/Ementa\s*:?\s*(.+?)(?:Relator|Data|Classe|$)/i)?.[1] ||
          txt.slice(txt.indexOf(cnj) + cnj.length);
        out.push({
          numeroProcesso: cnj,
          ementa: ementa.replace(/\s+/g, " ").trim().slice(0, 4500),
          data:
            txt.match(/(\d{2}\/\d{2}\/\d{4})/)?.[1] ||
            txt.match(/(\d{4}-\d{2}-\d{2})/)?.[1],
          relator: txt
            .match(/Relator(?:\(a\))?\s*:?\s*([^|]{5,80})/i)?.[1]
            ?.trim(),
          url: (el.querySelector("a[href]") as HTMLAnchorElement | null)?.href,
        });
      }
      return out;
    }, limite * 3);

    const pool = filtrarJulgadosScrape(
      brutos
        .filter((j) => dataOk(j.data, anos) && ementaTjesValida(j.ementa))
        .map(
          (j): JulgadoScrape => ({
            titulo: `TJES — ${j.numeroProcesso}`,
            ementa: j.ementa,
            tribunal: "TJES",
            data: j.data,
            url: j.url,
            numeroProcesso: j.numeroProcesso,
            relator: j.relator,
          })
        )
    ).slice(0, limite);

    if (!pool.length) {
      return {
        julgados: [],
        doCache: false,
        aviso: "TJES sem ementas úteis (layout/sem hit).",
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
      erro: `Falha scraper TJES: ${msg.slice(0, 220)}`,
      duracaoMs: Date.now() - t0,
      fonte: "erro",
    };
  } finally {
    await browser?.close().catch(() => undefined);
  }
}
