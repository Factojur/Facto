/**
 * Scraper TJRN — https://jurisprudencia.tjrn.jus.br/api/pesquisar
 * Headless puro leva 403 (Akamai); tenta Chrome/Edge headed e POST na API.
 */
import type { JulgadoScrape, ResultadoScrape } from "@/lib/scrapers/types";
import {
  ementaJurisPortalValida,
  filtrarJulgadosScrape,
  normalizarEmentaPortal,
} from "@/lib/scrapers/validar-ementa";

export type OpcoesBuscaTjrn = {
  limite?: number;
  anos?: number;
  timeoutMs?: number;
};

function limparTexto(s: string): string {
  return (s || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatarCnj(raw: string): string | null {
  const d = (raw || "").replace(/\D/g, "");
  if (d.length !== 20) {
    const m = (raw || "").match(/\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/);
    return m?.[0] ?? null;
  }
  return `${d.slice(0, 7)}-${d.slice(7, 9)}.${d.slice(9, 13)}.${d.slice(13, 14)}.${d.slice(14, 16)}.${d.slice(16)}`;
}

function dataBrFromIso(iso?: string | null): string | undefined {
  if (!iso) return undefined;
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString("pt-BR");
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

export function ementaTjrnValida(texto: string): boolean {
  return ementaJurisPortalValida(normalizarEmentaPortal(texto));
}

function extrairEmentaHtml(html: string): string {
  let t = limparTexto(html);
  const m = t.match(/Ementa\s*:?\s*(.+?)(?:\bI\.\s*CASO|\bACÓRDÃO\b|$)/i);
  if (m?.[1]) t = m[1];
  return limparTexto(t).slice(0, 4500);
}

async function launchBrowser() {
  const { chromium } = await import("playwright");
  const tentativas: { channel?: "chrome" | "msedge"; headless: boolean }[] = [
    { channel: "chrome", headless: false },
    { channel: "msedge", headless: false },
    { headless: false },
    { channel: "chrome", headless: true },
    { headless: true },
  ];
  let last: unknown;
  for (const t of tentativas) {
    try {
      return await chromium.launch({
        ...t,
        args: ["--disable-dev-shm-usage", "--no-sandbox"],
      });
    } catch (e) {
      last = e;
    }
  }
  throw last instanceof Error ? last : new Error(String(last));
}

type HitRn = {
  _source?: {
    numero_processo?: string;
    ementa?: string;
    magistrado?: string;
    dt_publicacao?: string;
    dt_assinatura_teor?: string;
    id_documento_teor?: string;
  };
};

export async function buscarTjrnJuris(
  termo: string,
  opcoes?: OpcoesBuscaTjrn
): Promise<ResultadoScrape> {
  const q = termo.trim();
  const limite = Math.max(1, Math.min(40, opcoes?.limite ?? 12));
  const anos = Math.max(1, Math.min(10, opcoes?.anos ?? 3));
  const timeout = opcoes?.timeoutMs ?? 70_000;
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
    browser = await launchBrowser();
    const page = await browser.newPage({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      locale: "pt-BR",
    });
    page.setDefaultTimeout(Math.min(timeout, 50_000));

    const res = await page.goto("https://jurisprudencia.tjrn.jus.br/", {
      waitUntil: "domcontentloaded",
      timeout: Math.min(timeout, 45_000),
    });
    if (res && res.status() >= 400) {
      return {
        julgados: [],
        doCache: false,
        erro: `TJRN portal HTTP ${res.status()} (Akamai/WAF).`,
        duracaoMs: Date.now() - t0,
        fonte: "erro",
      };
    }
    await page.waitForTimeout(2500);
    const blocked = await page.evaluate(() =>
      /Access Denied|Acesso Bloqueado/i.test(document.body?.innerText || "")
    );
    if (blocked) {
      return {
        julgados: [],
        doCache: false,
        erro: "TJRN bloqueado por WAF/Akamai neste runtime.",
        duracaoMs: Date.now() - t0,
        fonte: "erro",
      };
    }

    const de = new Date();
    de.setFullYear(de.getFullYear() - anos);
    const dt_inicio = de.toISOString().slice(0, 10).split("-").reverse().join("-");
    const dt_fim = new Date()
      .toISOString()
      .slice(0, 10)
      .split("-")
      .reverse()
      .join("-");

    const api = await page.evaluate(
      async ({ termo, dt_inicio, dt_fim }) => {
        const token =
          document.querySelector('meta[name="_token"]')?.getAttribute("content") ||
          "";
        const body = {
          _token: token,
          page: 1,
          usuario: null,
          jurisprudencia: {
            texto: "",
            ementa: termo,
            numero_processo: "",
            dt_inicio,
            dt_fim,
            sistema: "PJE",
            decisao: "Acórdão",
            jurisdicao: "",
            classe: "",
            magistrado: "",
            colegiado: "",
            orgao_julgador: "",
          },
        };
        const r = await fetch("/api/pesquisar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRF-TOKEN": token,
          },
          credentials: "same-origin",
          body: JSON.stringify(body),
        });
        const json = await r.json();
        return {
          status: r.status,
          total: json?.hits?.total ?? 0,
          hits: (json?.hits?.hits || []).slice(0, 40),
        };
      },
      { termo: q, dt_inicio, dt_fim }
    );

    if (api.status >= 400) {
      return {
        julgados: [],
        doCache: false,
        erro: `TJRN API HTTP ${api.status}`,
        duracaoMs: Date.now() - t0,
        fonte: "erro",
      };
    }

    const brutos = (api.hits as HitRn[])
      .map((h): JulgadoScrape | null => {
        const s = h._source || {};
        const cnj = formatarCnj(s.numero_processo || "");
        if (!cnj) return null;
        const ementa = extrairEmentaHtml(s.ementa || "");
        const data =
          dataBrFromIso(s.dt_assinatura_teor) ||
          dataBrFromIso(s.dt_publicacao);
        return {
          titulo: `TJRN — ${cnj}`,
          ementa,
          tribunal: "TJRN",
          data: data || undefined,
          relator: s.magistrado,
          numeroProcesso: cnj,
          url: s.id_documento_teor
            ? `https://jurisprudencia.tjrn.jus.br/`
            : undefined,
        };
      })
      .filter((j): j is JulgadoScrape => j != null);

    const pool = filtrarJulgadosScrape(
      brutos.filter((j) => dataOk(j.data, anos) && ementaTjrnValida(j.ementa))
    ).slice(0, limite);

    if (!pool.length) {
      return {
        julgados: [],
        doCache: false,
        aviso: `TJRN sem ementas úteis (total API=${api.total}).`,
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
      erro: `Falha scraper TJRN: ${msg.slice(0, 220)}`,
      duracaoMs: Date.now() - t0,
      fonte: "erro",
    };
  } finally {
    await browser?.close().catch(() => undefined);
  }
}
