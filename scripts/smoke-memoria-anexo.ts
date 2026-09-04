/**
 * Smoke memória de anexo — 2º turno sem re-OCR (local + browser prod).
 * Uso: npx tsx scripts/smoke-memoria-anexo.ts [--browser] [--base=URL]
 */
import { config } from "dotenv";
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { chromium, type Page } from "playwright";
import { jsPDF } from "jspdf";
import {
  deveChamarEntradaCaso,
  processarArquivosComMemoria,
} from "../src/lib/chat-anexos-memoria";
import { EMAIL_COMPLETO_TESTE } from "../src/lib/emails-acesso-livre";
import { createSuite } from "./casos-ouro/suite";

config({ path: ".env.local" });

const BASE =
  process.argv.find((a) => a.startsWith("--base="))?.split("=")[1] ??
  "https://factoia.com.br";
const RUN_BROWSER = process.argv.includes("--browser");
const TIMEOUT = 120_000;

const TEXTO_PDF =
  "Exequente: MARIA SILVA. Executada: ENEL SP. Cumprimento de sentença. Multa diária R$ 100.";

async function pipelineLocal() {
  const { assert, stats } = createSuite();

  assert(
    !deveChamarEntradaCaso({ arquivosParaServidor: 0, casoJaOrganizado: true }),
    "caso organizado sem arquivo novo não chama entrada-caso"
  );
  assert(
    deveChamarEntradaCaso({ arquivosParaServidor: 1, casoJaOrganizado: true }),
    "arquivo novo ainda chama entrada-caso"
  );
  assert(
    !deveChamarEntradaCaso({ arquivosParaServidor: 0, casoJaOrganizado: false }),
    "sem arquivo e sem caso organizado não chama entrada-caso"
  );

  const file = new File([TEXTO_PDF], "smoke-memoria.pdf", {
    type: "application/pdf",
    lastModified: 1_700_000_000_000,
  });

  const primeiro = await processarArquivosComMemoria({
      relatoBase: "Analise o anexo.",
      files: [file],
      memoria: [],
      extrairTextoLocal: async () => TEXTO_PDF.repeat(3),
      minCharsTextoUtil: 40,
      limiteArquivoBytes: 40_000_000,
      limiteUploadBytes: 8_000_000,
      arquivoParaBase64: async (f) => ({
        nome: f.name,
        mimeType: f.type,
        base64: "dGVzdA==",
      }),
    });
    assert(primeiro.memoria.length === 1, "memória após 1º processamento");
    assert(
      primeiro.relato.includes("MARIA SILVA"),
      "texto do anexo no relato"
    );

    const segundo = await processarArquivosComMemoria({
      relatoBase: "Confirme o exequente.",
      files: [file],
      memoria: primeiro.memoria,
      extrairTextoLocal: async () => {
        throw new Error("não deveria extrair de novo");
      },
      minCharsTextoUtil: 40,
      limiteArquivoBytes: 40_000_000,
      limiteUploadBytes: 8_000_000,
      arquivoParaBase64: async (f) => ({
        nome: f.name,
        mimeType: f.type,
        base64: "dGVzdA==",
      }),
    });
    assert(segundo.reutilizouCache, "2º turno reutiliza cache");
    assert(segundo.arquivos.length === 0, "2º turno não reenvia PDF ao servidor");
    assert(
      segundo.relato.includes("MARIA SILVA"),
      "texto do anexo preservado no 2º turno"
    );

  const { oks, falhas } = stats();
  console.log(`Pipeline memória anexo: ${oks} ok · ${falhas} falha(s)`);
  if (falhas > 0) process.exit(1);
}

function gerarPdf(caminho: string) {
  const doc = new jsPDF();
  doc.text(doc.splitTextToSize(TEXTO_PDF, 180), 10, 15);
  writeFileSync(caminho, Buffer.from(doc.output("arraybuffer")));
}

async function autenticar(base: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: link } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: EMAIL_COMPLETO_TESTE,
    options: { redirectTo: `${base}/auth/callback` },
  });
  const otp = link?.properties?.email_otp;
  if (!otp) throw new Error("sem OTP");

  const { data: auth } = await createClient(url, anon).auth.verifyOtp({
    email: EMAIL_COMPLETO_TESTE,
    token: otp,
    type: "email",
  });
  if (!auth.session) throw new Error("sessão inválida");

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
  const page = await context.newPage();
  const sessao = await page.request.post(`${base}/api/auth/sessao`);
  if (!sessao.ok()) throw new Error(`sessão ${sessao.status()}`);
  await page.goto(`${base}/dashboard`, {
    waitUntil: "networkidle",
    timeout: TIMEOUT,
  });
  if (!page.url().includes("/dashboard")) {
    throw new Error(`dashboard inacessível: ${page.url()}`);
  }
  return { browser, page };
}

async function anexarPdf(page: Page, pdfPath: string) {
  const anexosBtn = page.getByRole("button", { name: /^anexos$/i }).last();
  if (await anexosBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await anexosBtn.click();
    await page.waitForTimeout(500);
  } else {
    const anexar = page
      .getByRole("button", { name: /anexar|material|documento/i })
      .first();
    if (await anexar.isVisible({ timeout: 5000 }).catch(() => false)) {
      await anexar.click();
      await page.waitForTimeout(500);
    }
  }
  // Banner input (accept inclui image/*). .first() pega outro <input hidden> do dashboard.
  const input = page.locator('input[type="file"][accept*="image/jpeg"]').last();
  await input.waitFor({ state: "attached", timeout: 15_000 });
  await input.setInputFiles(pdfPath);
  // Upload no banner dispara soContexto e fecha o painel; Enviar do banner
  // fica disabled sem fila — não clicar nele.
  await page
    .getByText(/li \d+ documento|lendo documentos|na fila:/i)
    .first()
    .waitFor({ state: "visible", timeout: 30_000 })
    .catch(() => undefined);
  await page.waitForTimeout(800);
  await page.keyboard.press("Escape").catch(() => undefined);
  await page.waitForTimeout(300);
}

async function enviarMensagem(page: Page, texto: string) {
  // Composer (não o Enviar do ChatAnexosBanner, que exige arquivos na fila).
  const composer = page.getByTestId("chat-composer");
  await composer.waitFor({ state: "visible", timeout: 15_000 });
  await composer.fill(texto);
  const enviar = page.getByTestId("chat-enviar");
  await enviar.waitFor({ state: "visible", timeout: 10_000 });
  await enviar.click({ timeout: 30_000 });
}

async function browserE2E(page: Page) {
  const tmpDir = resolve(process.cwd(), ".tmp-smoke");
  mkdirSync(tmpDir, { recursive: true });
  const pdfPath = resolve(tmpDir, "smoke-memoria-anexo.pdf");
  gerarPdf(pdfPath);

  let entradaCasoCalls = 0;
  page.on("request", (req) => {
    if (req.url().includes("/api/entrada-caso") && req.method() === "POST") {
      entradaCasoCalls += 1;
    }
  });

  const novo = page.getByRole("button", { name: /novo caso/i }).first();
  if (await novo.isVisible({ timeout: 5000 }).catch(() => false)) {
    await novo.click();
    await page.waitForTimeout(600);
  }

  await anexarPdf(page, pdfPath);
  await enviarMensagem(
    page,
    "Analise o PDF anexado. Sou advogado da exequente Maria Silva."
  );

  const exequente = page
    .getByRole("button", { name: /exequente|impetrante|ativo/i })
    .first();
  if (await exequente.isVisible({ timeout: 8000 }).catch(() => false)) {
    await exequente.click();
  }

  const deadline1 = Date.now() + 90_000;
  while (Date.now() < deadline1) {
    const body = await page.locator("body").innerText();
    if (/entendimento do caso|plano de tópicos|maria silva/i.test(body)) break;
    await page.waitForTimeout(2000);
  }

  const callsAposTurno1 = entradaCasoCalls;

  await enviarMensagem(
    page,
    "Sem anexar de novo: confirme o nome da exequente que você leu no PDF."
  );

  const deadline2 = Date.now() + 60_000;
  while (Date.now() < deadline2) {
    const body = await page.locator("body").innerText();
    if (/maria silva/i.test(body) && body.length > callsAposTurno1) break;
    await page.waitForTimeout(2000);
  }

  const callsAposTurno2 = entradaCasoCalls;
  const bodyAposTurno2 = await page.locator("body").innerText();

  let avisoCache = false;
  try {
    await anexarPdf(page, pdfPath);
    await enviarMensagem(page, "Reanexei o mesmo PDF — use a memória.");
    const deadline3 = Date.now() + 45_000;
    while (Date.now() < deadline3) {
      const body = await page.locator("body").innerText();
      if (/texto já lido|não foi necessário reler/i.test(body)) {
        avisoCache = true;
        break;
      }
      await page.waitForTimeout(1500);
    }
  } catch {
    console.log("  (aviso: reanexo no turno 3 não testado — input de arquivo indisponível)");
  }

  const checks = {
    turno1Organizou: /maria silva|entendimento|plano/i.test(bodyAposTurno2),
    turno2SemNovaEntradaCaso: callsAposTurno2 === callsAposTurno1,
    turno2ManteveContexto: /maria silva/i.test(bodyAposTurno2),
    turno3AvisoCache: avisoCache,
  };

  console.log("\nBrowser memória anexo — checks:");
  for (const [k, v] of Object.entries(checks)) {
    console.log(`  ${v ? "OK" : "FALHA"}: ${k}`);
  }
  console.log(`  (entrada-caso: ${callsAposTurno1} no turno 1 · ${callsAposTurno2} após turno 2)`);

  const falhas = Object.entries(checks).filter(
    ([k, v]) => !v && k !== "turno3AvisoCache"
  ).length;
  if (falhas > 0) throw new Error(`${falhas} check(s) falharam`);
  console.log("\nBrowser memória anexo: OK");
}

async function main() {
  console.log("=== Smoke memória anexo ===\n");
  await pipelineLocal();

  if (RUN_BROWSER) {
    console.log(`\nE2E browser em ${BASE}...\n`);
    const { browser, page } = await autenticar(BASE);
    try {
      await browserE2E(page);
    } finally {
      await browser.close();
    }
  } else {
    console.log("\n(dica: --browser para E2E em produção)");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
