/**
 * Reteste caso 0006509 — cumprimento exequente Jefferson × FMU (0 tokens + E2E browser).
 * Uso: npx tsx scripts/testar-caso-0006509.ts [--browser] [--base=URL]
 */
import { config } from "dotenv";
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { chromium, type Page } from "playwright";
import { jsPDF } from "jspdf";
import {
  aplicarOrganizacaoAoEstadoChat,
  confirmarPoloAdvogadoChat,
  estadoCasoChatVazio,
  reajustarEspeciePoloChat,
  sincronizarPoloAutomaticoChat,
  validarPoloEspecieChat,
  precisaConfirmarPoloAdvogado,
} from "../src/lib/chat-minuta";
import { organizarCasoLocal } from "../src/lib/organizar-caso-local";
import { sugereMandadoSegurancaAutos } from "../src/lib/peca-cabivel-autos";
import { inferirPoloDoRelato } from "../src/lib/polo-advocacia";
import { EMAIL_COMPLETO_TESTE } from "../src/lib/emails-acesso-livre";
import { createSuite } from "./casos-ouro/suite";

config({ path: ".env.local" });

export const AUTOS_0006509 = `
CUMPRIMENTO DE SENTENÇA Nº 0006509-93.2023.8.26.0016
Foro Central Juizados Especiais Cíveis
Juizado Especial Cível Anexo Mackenzie
São Paulo/SP
Exequente: JEFFERSON DA SILVA RIBEIRO
Executada: FACULDADES METROPOLITANAS UNIDAS EDUCACIONAIS LTDA
O incidente de cumprimento já está instaurado.
DECISÃO
Juiz de Direito: Dr. André Yukio Ogata
boletos para pagamento de mensalidades vincendas, sob pena de multa diária de R$100,00.
Contudo, este Juízo reconhece que houve erro material na fixação da multa diária, não em seu valor, na forma de aplicação,
fixando multa de R$ 100,00 por ato de descumprimento, no importe total de R$ 600,00.
`.trim();

const RELATO_ADV =
  "Sou advogado do exequente Jefferson. Impetrar mandado de segurança contra decisão manifestamente ilegal do juiz que reduziu as astreintes.";

const BASE =
  process.argv.find((a) => a.startsWith("--base="))?.split("=")[1] ??
  "https://factoia.com.br";
const RUN_BROWSER = process.argv.includes("--browser");
const TIMEOUT = 120_000;

function pipelineLocal() {
  const { assert, stats } = createSuite();

  assert(inferirPoloDoRelato(AUTOS_0006509) === "ativo", "polo exequente só nos autos (capa)");
  assert(sugereMandadoSegurancaAutos(AUTOS_0006509, "ativo"), "sugere MS exequente nos autos");

  const relato = `${AUTOS_0006509}\n\n${RELATO_ADV}`;
  assert(sugereMandadoSegurancaAutos(relato, "ativo"), "sugere MS com relato adv");
  assert(inferirPoloDoRelato(relato) === "ativo", "polo exequente com relato adv");

  const org = organizarCasoLocal({
    areaId: "jec",
    relato,
    poloAdvocacia: "ativo",
  });
  assert(org.areaIdResolvida === "constitucional", `área ${org.areaIdResolvida}`);
  assert(
    org.preenchimento.especiePeca === "mandado-seguranca",
    org.preenchimento.especiePeca ?? "—"
  );
  assert(
    org.preenchimento.autoresNomes.some((n) => /jefferson/i.test(n)) ||
      /jefferson/i.test(relato),
    "Jefferson identificado"
  );

  let estado = estadoCasoChatVazio("jec");
  estado = aplicarOrganizacaoAoEstadoChat(estado, org.preenchimento, {
    areaId: org.areaIdResolvida,
    relato,
  });
  estado = sincronizarPoloAutomaticoChat(estado, relato);
  estado = reajustarEspeciePoloChat(estado);
  if (precisaConfirmarPoloAdvogado(estado)) {
    estado = confirmarPoloAdvogadoChat(estado, "ativo");
  }

  assert(estado.poloAdvocacia === "ativo", "polo ativo confirmado");
  assert(estado.especiePeca === "mandado-seguranca", `espécie ${estado.especiePeca}`);
  assert(validarPoloEspecieChat(estado) === null, "polo×espécie ok");
  assert(!/agravo/.test(estado.especiePeca), "não agravo da executada");

  const { oks, falhas } = stats();
  console.log(`Pipeline 0006509: ${oks} ok · ${falhas} falha(s)`);
  if (falhas > 0) process.exit(1);
}

function gerarPdfAutos(caminho: string) {
  const doc = new jsPDF();
  const linhas = doc.splitTextToSize(AUTOS_0006509, 180);
  doc.text(linhas, 10, 15);
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
  if (!sessao.ok()) throw new Error(`sessão ${sessao.status()}`);
  await page.goto(`${base}/dashboard`, {
    waitUntil: "networkidle",
    timeout: TIMEOUT,
  });
  if (page.url().includes("/login")) {
    await page.request.post(`${base}/api/auth/sessao`);
    await page.goto(`${base}/dashboard`, {
      waitUntil: "networkidle",
      timeout: TIMEOUT,
    });
  }
  if (!page.url().includes("/dashboard")) {
    throw new Error(`dashboard inacessível: ${page.url()}`);
  }
  return { browser, page };
}

async function browserE2E(page: Page, base: string) {
  const tmpDir = resolve(process.cwd(), ".tmp-smoke");
  mkdirSync(tmpDir, { recursive: true });
  const pdfPath = resolve(tmpDir, "0006509-autos.pdf");
  gerarPdfAutos(pdfPath);

  const novo = page.getByRole("button", { name: /novo caso/i }).first();
  if (await novo.isVisible({ timeout: 5000 }).catch(() => false)) {
    await novo.click();
    await page.waitForTimeout(800);
  }

  const anexar = page.getByRole("button", { name: /anexar|material|documento/i }).first();
  if (await anexar.isVisible({ timeout: 8000 }).catch(() => false)) {
    await anexar.click();
    const input = page.locator('input[type="file"]').first();
    await input.setInputFiles(pdfPath);
    await page.waitForTimeout(1500);
  }

  const composer = page.locator("textarea").last();
  await composer.fill(
    "Analise os autos anexados. Sou advogado do exequente Jefferson — impetrar MS contra a decisão das astreintes."
  );
  await page.getByRole("button", { name: /^enviar$/i }).last().click();

  const exequente = page
    .getByRole("button", { name: /exequente|impetrante|ativo/i })
    .first();
  if (await exequente.isVisible({ timeout: 8000 }).catch(() => false)) {
    await exequente.click();
  }

  const deadline = Date.now() + 90_000;
  let body = "";
  while (Date.now() < deadline) {
    body = await page.locator("body").innerText();
    if (/entendimento do caso|plano de tópicos|mandado de segurança/i.test(body)) {
      break;
    }
    await page.waitForTimeout(2000);
  }

  const checks = {
    jefferson: /jefferson/i.test(body),
    exequente: /exequente|impetrante/i.test(body),
    ms: /mandado de segurança|mandado-seguranca/i.test(body),
    constitucional: /constitucional/i.test(body),
    semAgravoExecutada: !/agravo.*fmu|voz da executada/i.test(body),
    semBloqueioPolo: !/não combina com o polo passivo/i.test(body),
  };

  console.log("\nBrowser 0006509 — checks:");
  for (const [k, v] of Object.entries(checks)) {
    console.log(`  ${v ? "OK" : "FALHA"}: ${k}`);
  }

  const falhas = Object.values(checks).filter((v) => !v).length;
  if (falhas > 0) {
    console.log("\nTrecho da página:", body.slice(0, 500));
    throw new Error(`${falhas} check(s) falharam no browser`);
  }
  console.log("\nBrowser 0006509: OK");
}

async function main() {
  console.log("=== Caso 0006509 ===\n");
  pipelineLocal();

  if (RUN_BROWSER || process.argv.includes("--browser-only")) {
    console.log(`\nE2E browser em ${BASE}...\n`);
    const { browser, page } = await autenticar(BASE);
    try {
      await browserE2E(page, BASE);
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
