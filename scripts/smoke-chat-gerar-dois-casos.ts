/**
 * Dois fluxos E2E no chat FACTO (localhost): relato → conversa → “redija” → peça no preview.
 * Gasta 1 crédito por caso (auth magic link Completo).
 *
 * Uso: npx tsx scripts/smoke-chat-gerar-dois-casos.ts [--base=http://localhost:3000]
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { chromium, type BrowserContext, type Page } from "playwright";
import { EMAIL_COMPLETO_TESTE } from "../src/lib/emails-acesso-livre";
import { aliviarGuiaEstruturaPrompt } from "../src/lib/peca-especie-area";
import {
  casoTemLastroMinimoParaPeca,
} from "../src/lib/chat-minuta-redacao";
import { estadoCasoChatVazio } from "../src/lib/chat-minuta";

config({ path: ".env.local" });

const BASE =
  process.argv.find((a) => a.startsWith("--base="))?.split("=")[1] ??
  process.env.SMOKE_BASE_URL ??
  "http://localhost:3000";

const TIMEOUT_MS = 180_000;

const CASOS = [
  {
    id: "jec-consumo",
    relato: [
      "Sou advogado do autor João da Silva, CPF 529.982.247-25, residente na Rua das Flores 100,",
      "Centro, Campinas/SP, CEP 13010-000. A ré é Enel Distribuição São Paulo S.A.",
      "Em 10/08/2026 a Enel cortou a energia da residência sem aviso prévio, apesar de fatura paga",
      "em 05/08/2026 (protocolo 998877). O autor ficou 4 dias sem luz, perdeu medicamentos na geladeira",
      "e precisou comprar hotel. Quero petição inicial no JEC de Campinas pedindo tutela de urgência",
      "para religação, danos materiais R$ 1.200 e danos morais R$ 8.000, com justiça gratuita.",
    ].join(" "),
    pedidoRedacao:
      "Redija a petição inicial completa no preview com os fatos e pedidos que alinhamos.",
    checagens: [/JUIZADO|JEC|ENERGIA|ENEL|JO[AÃ]O/i, /DOS FATOS|DO DIREITO|DOS PEDIDOS/i],
  },
  {
    id: "civil-contestacao",
    relato: [
      "Atuo pelo réu Beta Serviços Ltda, CNPJ 33.444.555/0001-99, com sede na Av. Ana Costa 500,",
      "Santos/SP. O autor Pedro Nogueira ajuizou cobrança de R$ 45.000 na 2ª Vara Cível de Santos,",
      "processo 1001234-56.2026.8.26.0562, alegando inadimplemento contratual. Na verdade o contrato",
      "foi rescindido amigavelmente em 15/03/2026 com quitação (e-mail anexável). Quero contestação",
      "com preliminares de falta de interesse e, no mérito, improcedência, sem reconvenção.",
    ].join(" "),
    pedidoRedacao:
      "Redija a contestação completa no preview, impugnação específica e pedidos de improcedência.",
    checagens: [/CONTESTA|BETA|PEDRO|VARA C[IÍ]VEL|SANTOS/i, /DOS FATOS|DO M[EÉ]RITO|DO DIREITO|DOS PEDIDOS|PRELIMINAR/i],
    proibidos: [
      /restabelecimento.{0,50}servi[cç]o essencial/i,
      /tutela de urg[eê]ncia.{0,80}(?:relig|corte|energia|servi[cç]o essencial)/i,
      /Da tutela de urg[eê]ncia formulada/i,
    ],
  },
] as const;

function assertLocal(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
  console.log(`  OK local: ${msg}`);
}

function checksLocais() {
  console.log("— Checks locais (sem browser) —");
  const guia = aliviarGuiaEstruturaPrompt(
    [
      "Espécie da peça: Contestação.",
      "Rito: JUSTIÇA DO TRABALHO (CLT). NÃO aplique Lei 9.099/95.",
      "   NÃO aplique CDC nem Vara Cível.",
      "I - DOS FATOS",
      "II - DO DIREITO",
    ].join("\n")
  );
  assertLocal(!/NÃO aplique/i.test(guia), "guia sem NÃO aplique");
  assertLocal(!/^Rito:/m.test(guia), "guia sem linha Rito:");
  assertLocal(/DOS FATOS/.test(guia), "guia mantém seções");

  const curto = {
    ...estadoCasoChatVazio("jec"),
    fatos: "A ".repeat(40) + "--- página 1 ---\nExcelentíssimo Juízo Processo nº 0001",
  };
  assertLocal(
    casoTemLastroMinimoParaPeca(curto),
    "lastro relaxado com OCR/página"
  );
  console.log("");
}

async function autenticar(base: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !serviceKey || !anon) {
    throw new Error("env Supabase ausente (.env.local)");
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

  const jar: { name: string; value: string; options: Record<string, unknown> }[] =
    [];
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
  return { browser, context };
}

async function novoCaso(page: Page) {
  const btn = page.getByRole("button", { name: /novo caso/i }).first();
  if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(1000);
  }
}

async function garantirModoChat(page: Page) {
  const chat = page.getByRole("radio", { name: /^chat$/i });
  if (await chat.first().isVisible().catch(() => false)) {
    await chat.first().click();
    await page.waitForTimeout(400);
    return;
  }
  const btn = page.getByRole("button", { name: /^chat$/i });
  if (await btn.first().isVisible().catch(() => false)) {
    await btn.first().click();
    await page.waitForTimeout(400);
  }
}

async function setInputReact(page: Page, texto: string) {
  const composer = page.getByTestId("chat-composer");
  await composer.waitFor({ state: "visible", timeout: 25_000 });
  await composer.click({ timeout: 10_000 });
  // fill() do Playwright atualiza controlled inputs React com mais confiabilidade
  // que só dispatchEvent; reforço com _valueTracker quando ainda falhar.
  await composer.fill("");
  await composer.fill(texto);
  let v = await composer.inputValue();
  if (v.replace(/\s/g, "").length < Math.min(20, texto.replace(/\s/g, "").length)) {
    await composer.evaluate((el, value) => {
      const ta = el as HTMLTextAreaElement;
      const proto = window.HTMLTextAreaElement.prototype;
      const desc = Object.getOwnPropertyDescriptor(proto, "value");
      const last = ta.value;
      desc?.set?.call(ta, value);
      const tracker = (
        ta as HTMLTextAreaElement & {
          _valueTracker?: { setValue: (v: string) => void };
        }
      )._valueTracker;
      tracker?.setValue(last);
      ta.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          cancelable: true,
          inputType: "insertFromPaste",
          data: value,
        })
      );
      ta.dispatchEvent(new Event("change", { bubbles: true }));
    }, texto);
    v = await composer.inputValue();
  }
  if (v.replace(/\s/g, "").length < 20) {
    throw new Error(`input React não atualizou (len=${v.length})`);
  }
}

async function enviar(page: Page, texto: string) {
  await setInputReact(page, texto);
  const enviarBtn = page.getByTestId("chat-enviar");
  await enviarBtn.click({ timeout: 10_000 });
  await page.waitForTimeout(1000);
}

async function aguardarRespostaAssistente(page: Page, ms = 90_000) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    const msgs = page.locator("[data-chat-msg]");
    const n = await msgs.count();
    const body = await page.locator("body").innerText();
    if (
      n >= 2 &&
      /entendimento|plano|partes|fatos|pedido|JEC|contest|Enel|Beta|Jo[aã]o|Pedro|redig/i.test(
        body
      )
    ) {
      await page.waitForTimeout(2000);
      return;
    }
    if (/erro ao|falha|indispon/i.test(body)) {
      throw new Error(`erro na UI: ${body.slice(0, 400)}`);
    }
    await page.waitForTimeout(1200);
  }
  const n = await page.locator("[data-chat-msg]").count();
  throw new Error(`sem resposta do assistente (msgs=${n})`);
}

async function aguardarPeca(
  page: Page,
  checagens: RegExp[],
  proibidos: RegExp[] = []
): Promise<string> {
  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    const body = await page.locator("body").innerText();
    const ok = checagens.every((re) => re.test(body));
    if (ok && /Nestes termos|pede deferimento|Ante o exposto|Diante do exposto|OAB/i.test(body)) {
      for (const re of proibidos) {
        if (re.test(body)) {
          throw new Error(
            `contaminação proibida ${re} · trecho: ${body.match(re)?.[0] ?? "?"}`
          );
        }
      }
      return body;
    }
    if (/cota esgotada|sem cr[eé]dito|saldo insuficiente/i.test(body)) {
      throw new Error("cota/crédito insuficiente");
    }
    await page.waitForTimeout(2000);
  }
  const body = await page.locator("body").innerText();
  throw new Error(
    `peça não apareceu a tempo · trecho: ${body.slice(-800).replace(/\s+/g, " ")}`
  );
}

async function rodarCaso(
  context: BrowserContext,
  base: string,
  caso: (typeof CASOS)[number]
) {
  console.log(`▸ Caso ${caso.id}`);
  const page = await context.newPage();
  try {
    const sessao = await page.request.post(`${base}/api/auth/sessao`);
    if (!sessao.ok()) {
      throw new Error(`POST /api/auth/sessao → ${sessao.status()}`);
    }
    await page.goto(`${base}/dashboard?nova=1#assistente-workspace`, {
      waitUntil: "networkidle",
      timeout: TIMEOUT_MS,
    });
    await page.waitForTimeout(1500);
    await page.locator("#assistente-workspace").scrollIntoViewIfNeeded().catch(() => {});
    await novoCaso(page);
    await page.getByTestId("chat-composer").waitFor({ state: "visible", timeout: 30_000 });
    await garantirModoChat(page);

    await enviar(page, caso.relato);
    console.log("  relato enviado; aguardando entendimento…");
    await aguardarRespostaAssistente(page);

    await enviar(
      page,
      "Pode confirmar o entendimento: partes, juízo e espécie cabível em 3 linhas."
    );
    console.log("  ajuste conversacional enviado…");
    await aguardarRespostaAssistente(page, 60_000);

    await enviar(page, caso.pedidoRedacao);
    console.log("  pedido de redação (deve auto-Minuta + 1 crédito)…");
    const peca = await aguardarPeca(
      page,
      [...caso.checagens],
      "proibidos" in caso && Array.isArray(caso.proibidos) ? [...caso.proibidos] : []
    );
    console.log(
      `  OK peça · ${peca.length} chars · amostra: ${peca.slice(0, 180).replace(/\s+/g, " ")}…`
    );
    return { id: caso.id, ok: true as const };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`  FALHA ${caso.id}: ${msg}`);
    try {
      const shot = `tmp/smoke-gerar-${caso.id}.png`;
      await page.screenshot({ path: shot, fullPage: true });
      console.error(`  screenshot: ${shot}`);
    } catch {
      /* ignore */
    }
    return { id: caso.id, ok: false as const, erro: msg };
  } finally {
    await page.close();
  }
}

async function main() {
  checksLocais();
  console.log(`Smoke gerar 2 casos · ${BASE}\n`);

  const probe = await fetch(baseHealth(BASE)).catch(() => null);
  if (!probe?.ok) {
    throw new Error(`Servidor inacessível em ${BASE} (subir npm run dev)`);
  }

  const { browser, context } = await autenticar(BASE);
  console.log("Auth OK\n");

  const resultados = [];
  for (const caso of CASOS) {
    resultados.push(await rodarCaso(context, BASE, caso));
  }

  await browser.close();

  const falhas = resultados.filter((r) => !r.ok);
  console.log(
    `\nResumo: ${resultados.length - falhas.length}/${resultados.length} ok`
  );
  if (falhas.length) {
    process.exitCode = 1;
  }
}

function baseHealth(base: string) {
  return base.replace(/\/$/, "") + "/";
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
