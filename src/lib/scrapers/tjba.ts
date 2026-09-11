/**
 * Scraper TJBA — portal https://jurisprudencia.tjba.jus.br/
 * (e-SAJ CJSG do BA redireciona ao menu e não serve para seed.)
 */
import type { JulgadoScrape, ResultadoScrape } from "@/lib/scrapers/types";
import {
  ementaJurisPortalValida,
  filtrarJulgadosScrape,
  normalizarEmentaPortal,
} from "@/lib/scrapers/validar-ementa";

export type OpcoesBuscaTjba = {
  limite?: number;
  /** Janela pela data de publicação (anos). */
  anos?: number;
  timeoutMs?: number;
};

function pubDentroDeAnos(dataStr: string | undefined, anos: number): boolean {
  if (!dataStr) return true;
  const m = dataStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return true;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  const limite = new Date();
  limite.setFullYear(limite.getFullYear() - anos);
  return d >= limite;
}

function limparTexto(s: string): string {
  return (s || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Recorta a parte útil (acordão/ementa) do texto expandido do card. */
function extrairEmentaDoTexto(displayed: string): string {
  let t = limparTexto(displayed);
  t = t.replace(/\.{2,}\s*ler mais/gi, " ").replace(/…\s*ler mais/gi, " ");
  t = limparTexto(t);

  const m =
    t.match(/Ementa\s*:?\s*(.+)$/i) ||
    t.match(/ACORD[AÃ]O\s+(.+)$/i) ||
    t.match(
      /\b(DIREITO (?:DO CONSUMIDOR|CIVIL|PROCESSUAL|AMBIENTAL|SECURIT[AÁ]RIO)[^.].+)$/i
    ) ||
    t.match(/\b(RECURSO INOMINADO[^.].+)$/i);

  let corpo = m?.[1] || t;

  // Remove cabeçalho processual residual.
  corpo = corpo
    .replace(/^PODER JUDICI[AÁ]RIO[\s\S]{0,400}?(?=DIREITO |RECURSO |EMENTA |APELA)/i, "")
    .replace(/^Tribunal de Justiça[\s\S]{0,400}?(?=DIREITO |RECURSO |EMENTA |APELA|DECIS)/i, "")
    .replace(/^Processo:\s*[^.]+\.?/i, "");

  return limparTexto(corpo).slice(0, 4500);
}

export function ementaTjbaValida(texto: string): boolean {
  const t = normalizarEmentaPortal(texto);
  if (!ementaJurisPortalValida(t)) return false;
  // Regras extras BA (portal com “ler mais” / cabeçalho).
  if (/ler mais/i.test(t)) return false;
  if (/^PODER JUDICI[AÁ]RIO/i.test(t) && t.length < 900) return false;
  if (/^Tribunal de Justiça do Estado da Bahia/i.test(t) && t.length < 900) {
    return false;
  }
  return true;
}

/**
 * Busca acórdãos no portal de jurisprudência do TJBA.
 */
export async function buscarTjbaJuris(
  termo: string,
  opcoes?: OpcoesBuscaTjba
): Promise<ResultadoScrape> {
  const q = termo.trim();
  const limite = Math.max(1, Math.min(40, opcoes?.limite ?? 12));
  const anos = Math.max(1, Math.min(10, opcoes?.anos ?? 3));
  const timeout = opcoes?.timeoutMs ?? 45_000;
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
    page.setDefaultTimeout(Math.min(timeout, 30_000));

    await page.goto("https://jurisprudencia.tjba.jus.br/", {
      waitUntil: "domcontentloaded",
      timeout: Math.min(timeout, 25_000),
    });

    await page.locator('input[name="assunto"]').waitFor({ state: "visible" });
    await page.locator('input[name="assunto"]').fill(q);

    const tipoAcordao = page.locator('input[name="tipoAcordao"]');
    if (await tipoAcordao.count()) {
      if (!(await tipoAcordao.isChecked().catch(() => true))) {
        await tipoAcordao.check().catch(() => undefined);
      }
    }
    // Evita misturar decisão monocrática no lote de acórdãos.
    const mono = page.locator('input[name="tipoDecisaoMonocratica"]');
    if (await mono.count()) {
      if (await mono.isChecked().catch(() => false)) {
        await mono.uncheck().catch(() => undefined);
      }
    }

    await page.getByRole("button", { name: "Pesquisar" }).click();
    await page.waitForSelector(".card .fieldValue, .card", {
      timeout: 25_000,
    });
    await page.waitForTimeout(1500);

    // Expande todos os "ler mais" visíveis (várias passadas — o DOM troca ao clicar).
    for (let pass = 0; pass < 4; pass++) {
      const botoes = page.locator(".read-more-button");
      const n = await botoes.count();
      if (!n) break;
      for (let i = 0; i < Math.min(n, limite + 4); i++) {
        await botoes.nth(i).click({ timeout: 2000 }).catch(() => undefined);
        await page.waitForTimeout(150);
      }
      await page.waitForTimeout(400);
    }

    const brutos = await page.locator(".card").evaluateAll((els, max) => {
      const cnjRe = /\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/;
      const out: {
        numeroProcesso: string;
        data?: string;
        relator?: string;
        displayed: string;
        url?: string;
      }[] = [];

      for (const el of els) {
        if (out.length >= max) break;
        const rows: Record<string, string> = {};
        for (const row of Array.from(el.querySelectorAll(".row"))) {
          const name = row
            .querySelector(".fieldName")
            ?.textContent?.replace(/:$/, "")
            .trim();
          const val = row
            .querySelector(".fieldValue")
            ?.textContent?.replace(/\s+/g, " ")
            .trim();
          if (name && val) rows[name] = val;
        }
        const numero =
          rows["Número do Processo"] ||
          (el.textContent || "").match(cnjRe)?.[0] ||
          "";
        if (!numero) continue;
        const displayed =
          el
            .querySelector(".displayed-text")
            ?.textContent?.replace(/\s+/g, " ")
            .trim() || "";
        const teor = el
          .querySelector('a[href*="inteiroTeor"]')
          ?.getAttribute("href");
        out.push({
          numeroProcesso: numero,
          data: rows["Data de Publicação"],
          relator: rows["Relator(a)"],
          displayed,
          url: teor || undefined,
        });
      }
      return out;
    }, limite * 2);

    const pool = filtrarJulgadosScrape(
      brutos
        .filter((j) => pubDentroDeAnos(j.data, anos))
        .map((j): JulgadoScrape => {
          const ementa = extrairEmentaDoTexto(j.displayed);
          return {
            titulo: `TJBA — ${j.numeroProcesso}`,
            ementa,
            tribunal: "TJBA",
            data: j.data,
            url: j.url,
            numeroProcesso: j.numeroProcesso,
            relator: j.relator,
          };
        })
        .filter((j) => ementaTjbaValida(j.ementa))
    ).slice(0, limite);

    if (!pool.length) {
      return {
        julgados: [],
        doCache: false,
        aviso: "TJBA sem ementas úteis (layout/captcha/sem hit).",
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
      erro: `Falha scraper TJBA: ${msg.slice(0, 220)}`,
      duracaoMs: Date.now() - t0,
      fonte: "erro",
    };
  } finally {
    await browser?.close().catch(() => undefined);
  }
}
