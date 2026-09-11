/**
 * Scraper TJPE — http://www.tjpe.jus.br/consultajurisprudenciaweb/
 * (não usa e-SAJ; portal JSF próprio.)
 */
import type { JulgadoScrape, ResultadoScrape } from "@/lib/scrapers/types";
import {
  ementaJurisPortalValida,
  filtrarJulgadosScrape,
  normalizarEmentaPortal,
} from "@/lib/scrapers/validar-ementa";

export type OpcoesBuscaTjpe = {
  limite?: number;
  anos?: number;
  timeoutMs?: number;
};

function limpar(s: string): string {
  return (s || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function dataOk(data: string | undefined, anos: number): boolean {
  if (!data) return true;
  const m = data.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return true;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  const lim = new Date();
  lim.setFullYear(lim.getFullYear() - anos);
  return d >= lim;
}

export function ementaTjpeValida(t: string): boolean {
  return ementaJurisPortalValida(normalizarEmentaPortal(t));
}

const URL_PE =
  "http://www.tjpe.jus.br/consultajurisprudenciaweb/xhtml/consulta/consulta.xhtml";

export async function buscarTjpeJuris(
  termo: string,
  opcoes?: OpcoesBuscaTjpe
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
    await page.goto(URL_PE, {
      waitUntil: "domcontentloaded",
      timeout: Math.min(timeout, 35_000),
    });

    const busca = page.locator(
      '#formPesquisaJurisprudencia\\:inputBuscaSimples, input[name="formPesquisaJurisprudencia:inputBuscaSimples"]'
    );
    await busca.waitFor({ state: "visible", timeout: 20_000 });
    await busca.fill(q);

    const acordao = page.locator(
      '#formPesquisaJurisprudencia\\:tipoAcordao, input[name="formPesquisaJurisprudencia:tipoAcordao"]'
    );
    if (await acordao.count()) {
      if (!(await acordao.isChecked().catch(() => false))) {
        await acordao.check().catch(() => undefined);
      }
    }

    // Botão pesquisar = link JSF (não submit nativo).
    const btn = page.locator('a').filter({ hasText: /^Pesquisar$/i }).first();
    await btn.click();
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3500);

    // Página intermediária: escolher Acórdãos.
    const linkAcordaos = page
      .locator("a")
      .filter({ hasText: /documentos encontrados/i })
      .first();
    if (await linkAcordaos.count()) {
      await linkAcordaos.click();
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(4500);
    }

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

      // Cards/resultados comuns no portal PE.
      const seletores = [
        ".ui-datalist-item",
        ".ui-datatable tbody tr",
        "table tbody tr",
        ".resultado",
        ".panel-body",
        "div[id*='resultado'] .rich-panel",
        "div[id*='Resultado']",
      ];
      const blocos: Element[] = [];
      for (const sel of seletores) {
        for (const el of Array.from(document.querySelectorAll(sel))) {
          blocos.push(el);
        }
      }
      // Fallback: qualquer bloco com CNJ + ementa.
      if (!blocos.length) {
        for (const el of Array.from(document.querySelectorAll("div,tr,li"))) {
          const t = (el.textContent || "").replace(/\s+/g, " ");
          if (cnjRe.test(t) && /ementa/i.test(t) && t.length > 180 && t.length < 12000) {
            blocos.push(el);
          }
        }
      }

      for (const el of blocos) {
        if (out.length >= max) break;
        const txt = (el.textContent || "").replace(/\s+/g, " ").trim();
        const cnj = txt.match(cnjRe)?.[0];
        if (!cnj || vistos.has(cnj) || txt.length < 100) continue;
        vistos.add(cnj);
        const ementa =
          txt.match(/Ementa\s*:?\s*(.+?)(?:Relator|Data|Classe|NPU|Inteiro|$)/i)?.[1] ||
          txt.slice(txt.indexOf(cnj) + cnj.length);
        out.push({
          numeroProcesso: cnj,
          ementa: ementa.replace(/\s+/g, " ").trim().slice(0, 4500),
          data: txt.match(/(\d{2}\/\d{2}\/\d{4})/)?.[1],
          relator: txt
            .match(/Relator(?:\(a\))?\s*:?\s*([^|]{5,80})/i)?.[1]
            ?.trim(),
          url: (el.querySelector("a[href]") as HTMLAnchorElement | null)?.href,
        });
      }
      return out;
    }, limite * 2);

    const pool = filtrarJulgadosScrape(
      brutos
        .filter((j) => dataOk(j.data, anos) && ementaTjpeValida(j.ementa))
        .map(
          (j): JulgadoScrape => ({
            titulo: `TJPE — ${j.numeroProcesso}`,
            ementa: j.ementa,
            tribunal: "TJPE",
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
        aviso: "TJPE sem ementas úteis (layout/sem hit).",
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
      erro: `Falha scraper TJPE: ${msg.slice(0, 220)}`,
      duracaoMs: Date.now() - t0,
      fonte: "erro",
    };
  } finally {
    await browser?.close().catch(() => undefined);
  }
}
