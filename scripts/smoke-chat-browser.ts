/**
 * Smoke E2E do chat no browser — 20 áreas (relato → plano visível).
 * Auth: magic link via SUPABASE_SERVICE_ROLE_KEY (.env.local).
 * Uso: npx tsx scripts/smoke-chat-browser.ts [--base=http://localhost:3000]
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { chromium, type BrowserContext, type Page } from "playwright";
import { EMAIL_COMPLETO_TESTE } from "../src/lib/emails-acesso-livre";
import type { AreaIdMinuta } from "../src/lib/minuta-modulo";

config({ path: ".env.local" });

const BASE =
  process.argv.find((a) => a.startsWith("--base="))?.split("=")[1] ??
  process.env.SMOKE_BASE_URL ??
  "http://localhost:3000";

const TIMEOUT_MS = 90_000;

/** Relatos curtos por área — mesmo conjunto do smoke local. */
const RELATOS: Record<AreaIdMinuta, string> = {
  jec: "Autor João contra Enel. Corte de energia indevido. Tutela de urgência e danos morais no JEC Campinas.",
  consumidor:
    "Consumidor Maria contra telefonia. Cobrança indevida e negativação Serasa. CDC art. 42. Danos morais.",
  civil:
    "Cobrança R$ 45 mil por inadimplemento contratual. Autor Pedro contra construtora. Vara Cível.",
  familia:
    "Ação de alimentos. Genitora Ana requer pensão do genitor em favor do filho menor. Guarda compartilhada.",
  trabalhista:
    "Reclamação trabalhista. Reclamante Carlos contra Empresa XYZ. Horas extras e FGTS.",
  imobiliario:
    "Despejo por falta de pagamento. Locador contra locatário. Lei 8.245.",
  previdenciario:
    "BPC LOAS indeferido pelo INSS. Autor menor representado pela mãe. Petição inicial.",
  tributario:
    "Embargos à execução fiscal. Executado impugna CDA de ICMS. Lei 6.830.",
  administrativo:
    "Mandado de segurança contra Secretário da Fazenda que negou restituição tributária.",
  digital:
    "Vazamento de dados pessoais LGPD art. 42. Autor contra plataforma digital.",
  empresarial: "Recuperação judicial. Devedor empresarial. Lei 11.101.",
  ambiental:
    "Ação civil pública ambiental. MP contra empresa por desmatamento ilegal.",
  "propriedade-intelectual":
    "Abstenção de uso de marca registrada. Titular contra concorrente. Lei 9.279.",
  medico: "Erro médico em cirurgia. Paciente com sequelas. Indenização contra hospital.",
  internacional:
    "Homologação de sentença estrangeira de divórcio. Autor residente no Brasil.",
  agrario: "Usucapião rural. Posse mansa 15 anos. Estatuto da Terra.",
  criminal: "Habeas corpus com liminar. Paciente preso preventivamente. CPP art. 647.",
  constitucional:
    "Mandado de segurança contra ato de autoridade que violou direito líquido e certo.",
  jecr: "Queixa-crime JECRIM. Infração de menor potencial ofensivo. Lei 9.099 criminal.",
  eleitoral:
    "Representação por propaganda eleitoral antecipada. Lei 9.504. TRE.",
};

const AREAS = Object.keys(RELATOS) as AreaIdMinuta[];

type Resultado = { area: string; ok: boolean; detalhe: string };

async function autenticar(base: string): Promise<{ browser: Awaited<ReturnType<typeof chromium.launch>>; context: BrowserContext; page: Page }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !serviceKey || !anon) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ou ANON ausente");
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: EMAIL_COMPLETO_TESTE,
    options: { redirectTo: `${base}/auth/callback` },
  });
  const otp = link?.properties?.email_otp;
  if (linkErr || !otp) throw new Error(linkErr?.message ?? "sem OTP");

  const anonClient = createClient(url, anon);
  const { data: auth, error: otpErr } = await anonClient.auth.verifyOtp({
    email: EMAIL_COMPLETO_TESTE,
    token: otp,
    type: "email",
  });
  if (otpErr || !auth.session) throw new Error(otpErr?.message ?? "verifyOtp falhou");

  const jar: { name: string; value: string; options: Record<string, unknown> }[] = [];
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => [],
      setAll: (cookies) => {
        for (const c of cookies) jar.push(c);
      },
    },
  });
  await supabase.auth.setSession({
    access_token: auth.session.access_token,
    refresh_token: auth.session.refresh_token,
  });

  const host = new URL(base).hostname;
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addCookies(
    jar.map((c) => ({
      name: c.name,
      value: c.value,
      domain: host,
      path: String(c.options.path ?? "/"),
      httpOnly: Boolean(c.options.httpOnly),
      secure: base.startsWith("https"),
      sameSite: "Lax" as const,
    }))
  );
  const page = await context.newPage();
  const sessao = await page.request.post(`${base}/api/auth/sessao`);
  if (!sessao.ok()) throw new Error(`POST /api/auth/sessao → ${sessao.status()}`);
  await page.goto(`${base}/dashboard`, { waitUntil: "networkidle", timeout: TIMEOUT_MS });
  if (!page.url().includes("/dashboard")) {
    throw new Error(`dashboard inacessível: ${page.url()}`);
  }
  return { browser, context, page };
}

async function novoCaso(page: Page): Promise<void> {
  const btn = page.getByRole("button", { name: /novo caso/i }).first();
  if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(800);
  }
}

async function enviarRelato(page: Page, relato: string): Promise<void> {
  const composer = page.locator("textarea").last();
  await composer.waitFor({ state: "visible", timeout: 15_000 });
  await composer.fill(relato);
  const enviar = page.getByRole("button", { name: /^enviar$/i }).last();
  await enviar.click();
}

async function confirmarPoloSePreciso(page: Page): Promise<void> {
  const polo = page.getByRole("button", { name: /exequente|autor|reclamante|impetrante|ativo/i }).first();
  if (await polo.isVisible({ timeout: 4000 }).catch(() => false)) {
    await polo.click();
    await page.waitForTimeout(500);
  }
}

async function aguardarPlano(page: Page): Promise<boolean> {
  const indicadores = [
    page.getByText(/entendimento do caso/i),
    page.getByText(/plano de tópicos/i),
    page.getByText(/montando o plano/i),
    page.getByRole("button", { name: /redigir/i }),
  ];
  const deadline = Date.now() + 75_000;
  while (Date.now() < deadline) {
    for (const loc of indicadores) {
      if (await loc.isVisible().catch(() => false)) return true;
    }
    if (await page.getByText(/erro|falha|indisponível/i).isVisible().catch(() => false)) {
      return false;
    }
    await page.waitForTimeout(1200);
  }
  return false;
}

async function smokeArea(page: Page, area: AreaIdMinuta): Promise<Resultado> {
  try {
    await page.goto(`${BASE}/dashboard?area=${area}&nova=1`, {
      waitUntil: "networkidle",
      timeout: TIMEOUT_MS,
    });
    await novoCaso(page);
    await enviarRelato(page, RELATOS[area]);
    await confirmarPoloSePreciso(page);
    const planoOk = await aguardarPlano(page);
    if (!planoOk) {
      const body = (await page.locator("body").innerText()).slice(0, 200);
      return { area, ok: false, detalhe: `plano não apareceu · ${body}` };
    }
    return { area, ok: true, detalhe: "plano/entendimento visível" };
  } catch (e) {
    return {
      area,
      ok: false,
      detalhe: e instanceof Error ? e.message : String(e),
    };
  }
}

async function main() {
  console.log(`Smoke browser · ${AREAS.length} áreas · ${BASE}\n`);

  let browser: Awaited<ReturnType<typeof chromium.launch>>;
  let page: Page;
  try {
    const auth = await autenticar(BASE);
    browser = auth.browser;
    page = auth.page;
    console.log("Auth OK\n");
  } catch (e) {
    console.error("Falha auth:", e instanceof Error ? e.message : e);
    process.exit(1);
  }

  const resultados: Resultado[] = [];
  for (const area of AREAS) {
    process.stdout.write(`▸ ${area.padEnd(24)} `);
    const r = await smokeArea(page, area);
    resultados.push(r);
    console.log(r.ok ? `OK — ${r.detalhe}` : `FALHA — ${r.detalhe}`);
  }

  await browser.close();

  const ok = resultados.filter((r) => r.ok).length;
  const falhas = resultados.filter((r) => !r.ok);
  console.log(`\nBrowser: ${ok} ok · ${falhas.length} falha(s)`);
  if (falhas.length > 0) {
    for (const f of falhas) console.log(`  ✗ ${f.area}: ${f.detalhe}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
