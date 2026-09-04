/**
 * Dois casos E2E: conversa (chat-conversa) + gerar-peca (1 crédito cada).
 * Valida prompts livres (rito leve / espécie pista) sem depender do Playwright+React input.
 *
 * Uso: npx tsx scripts/smoke-api-dois-casos-peca.ts [--base=http://127.0.0.1:3000]
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { writeFileSync, mkdirSync } from "fs";
import { EMAIL_COMPLETO_TESTE } from "../src/lib/emails-acesso-livre";
import {
  aplicarPreenchimentoAoEstado,
  estadoCasoChatVazio,
  inferirAreaChat,
  montarPayloadGeracaoChat,
  type EstadoCasoChat,
  type MensagemChat,
} from "../src/lib/chat-minuta";
import { organizarCasoLocal } from "../src/lib/organizar-caso-local";
import { inferirEspecieDaArea } from "../src/lib/peca-especie-area";
import { aliviarGuiaEstruturaPrompt, blocoEstruturaDaArea } from "../src/lib/peca-especie-area";
import { casoTemLastroMinimoParaPeca } from "../src/lib/chat-minuta-redacao";

config({ path: ".env.local" });

const BASE =
  process.argv.find((a) => a.startsWith("--base="))?.split("=")[1] ??
  "http://127.0.0.1:3000";

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
    ajuste: "Confirme em 3 linhas: juízo, partes e espécie da peça.",
    pedidoRedacao: "Redija a petição inicial completa.",
    checagens: [
      /JUIZADO|JEC|ENERGIA|ENEL|JO[AÃ]O/i,
      /DOS FATOS|DO DIREITO|DOS PEDIDOS/i,
      /Nestes termos|pede deferimento|Diante do exposto|Ante o exposto|Termos em que|requer a Vossa Excel/i,
    ],
  },
  {
    id: "civil-contestacao",
    relato: [
      "Atuo pelo réu Beta Serviços Ltda, CNPJ 33.444.555/0001-99, com sede na Av. Ana Costa 500,",
      "Santos/SP. O autor Pedro Nogueira ajuizou cobrança de R$ 45.000 na 2ª Vara Cível de Santos,",
      "processo 1001234-56.2026.8.26.0562, alegando inadimplemento contratual. Na verdade o contrato",
      "foi rescindido amigavelmente em 15/03/2026 com quitação. Quero contestação com preliminares",
      "de falta de interesse e, no mérito, improcedência, sem reconvenção.",
    ].join(" "),
    ajuste: "Confirme juízo, polo e se a peça é contestação.",
    pedidoRedacao: "Redija a contestação completa com impugnação específica.",
    checagens: [
      /CONTESTA|BETA|PEDRO|VARA C[IÍ]VEL|SANTOS/i,
      /FATOS|M[EÉ]RITO|DIREITO|PEDIDOS|PRELIMINAR/i,
      /Nestes termos|pede deferimento|Diante do exposto|Ante o exposto|Termos em que|requer a Vossa Excel/i,
    ],
    proibidos: [
      /restabelecimento.{0,50}servi[cç]o essencial/i,
      /tutela de urg[eê]ncia.{0,80}(?:relig|corte|energia|servi[cç]o essencial)/i,
      /Da tutela de urg[eê]ncia formulada/i,
    ],
  },
  {
    id: "familia-apelacao-sentenca",
    relato: [
      "Sou advogado do requerido Flávio Henrique de Oliveira Herlemann.",
      "Última publicação: sentença de 12/12/2025 no processo 1000011-77.2025.8.26.0279,",
      "1ª Vara de Itararé/SP — ação de reconhecimento e dissolução de união estável c/c",
      "partilha, guarda e alimentos (Requerente: Luisa de Almeida Herlemann).",
      "A sentença JULGOU PARCIALMENTE PROCEDENTE: reconheceu união 10/12/2017–16/08/2024,",
      "excluiu o imóvel da partilha (vitória do réu), partilhou móveis/veículos/dívidas 50%,",
      "fixou guarda compartilhada da filha com residência materna e condenou o requerido a alimentos",
      "de 1/3 dos rendimentos líquidos. Quero interpor apelação impugnando alimentos e dívidas,",
      "preservando a exclusão do imóvel. Nos autos a prole é filha.",
    ].join(" "),
    ajuste:
      "Confirme em 3 linhas: área, polo (requerido) e se a peça é apelação contra a sentença.",
    pedidoRedacao:
      "Redija a apelação completa do requerido contra a sentença parcialmente procedente.",
    checagens: [
      /APELA[CÇ][AÃ]O|RECURSO/i,
      /FL[AÁ]VIO|REQUERID|APELANTE|ITARAR[EÉ]|1000011-77\.2025/i,
      /ALIMENT|UNI[AÃ]O\s+EST[AÁ]VEL|PARTILHA|1\/3|TER[CÇ]O/i,
      /Nestes termos|pede deferimento|Diante do exposto|Ante o exposto|Termos em que|requer a Vossa Excel/i,
      /filha|a menor|alimentanda/i,
    ],
    proibidos: [
      /restabelecimento.{0,50}servi[cç]o essencial/i,
      /tutela de urg[eê]ncia.{0,80}(?:relig|corte|energia)/i,
      /CONTESTA[CÇ][AÃ]O\b/i,
      /\bo filho\b|\bao filho\b|\bdo filho\b|\balimentando\b/i,
    ],
  },
] as const;

function cookieHeader(
  jar: { name: string; value: string }[]
): string {
  return jar.map((c) => `${c.name}=${c.value}`).join("; ");
}

async function autenticar(): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: EMAIL_COMPLETO_TESTE,
    options: { redirectTo: `${BASE}/auth/callback` },
  });
  const otp = link?.properties?.email_otp;
  if (linkErr || !otp) throw new Error(linkErr?.message ?? "sem OTP");

  const anonClient = createClient(url, anon);
  const { data: auth, error: otpErr } = await anonClient.auth.verifyOtp({
    email: EMAIL_COMPLETO_TESTE,
    token: otp,
    type: "email",
  });
  if (otpErr || !auth.session) throw new Error(otpErr?.message ?? "verifyOtp");

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

  let cookie = cookieHeader(jar);
  const sess = await fetch(`${BASE}/api/auth/sessao`, {
    method: "POST",
    headers: { Cookie: cookie },
  });
  const setCookies = sess.headers.getSetCookie?.() ?? [];
  for (const raw of setCookies) {
    const [nv] = raw.split(";");
    const eq = nv.indexOf("=");
    if (eq > 0) {
      const name = nv.slice(0, eq).trim();
      const value = nv.slice(eq + 1).trim();
      jar.push({ name, value, options: {} });
    }
  }
  // fallback Node sem getSetCookie
  const single = sess.headers.get("set-cookie");
  if (single && setCookies.length === 0) {
    for (const part of single.split(/,(?=[^;]+?=)/)) {
      const [nv] = part.split(";");
      const eq = nv.indexOf("=");
      if (eq > 0) {
        jar.push({
          name: nv.slice(0, eq).trim(),
          value: nv.slice(eq + 1).trim(),
          options: {},
        });
      }
    }
  }
  cookie = cookieHeader(jar);
  if (!sess.ok) {
    throw new Error(`sessao ${sess.status}: ${await sess.text()}`);
  }
  return cookie;
}

async function postJson(
  path: string,
  body: unknown,
  cookie: string
): Promise<{ status: number; json: Record<string, unknown>; text: string }> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    /* ndjson / plain */
  }
  return { status: res.status, json, text };
}

function montarEstado(relato: string): EstadoCasoChat {
  const areaId = inferirAreaChat({ texto: relato }).areaId;
  const org = organizarCasoLocal({ relato, areaId });
  let estado = aplicarPreenchimentoAoEstado(
    estadoCasoChatVazio(areaId),
    org.preenchimento
  );
  const especie =
    org.preenchimento.especiePeca ||
    inferirEspecieDaArea(
      areaId,
      org.preenchimento.tipoAcao ?? "Petição inicial",
      relato,
      null
    );
  estado = {
    ...estado,
    fatos: relato,
    especiePeca: especie,
    areaConfirmada: true,
  };
  if (!casoTemLastroMinimoParaPeca(estado)) {
    throw new Error("lastro mínimo falhou após montar estado");
  }
  return estado;
}

async function turnoChat(
  cookie: string,
  mensagem: string,
  estado: EstadoCasoChat,
  mensagens: MensagemChat[]
): Promise<{ resposta: string; estado: EstadoCasoChat }> {
  const r = await postJson(
    "/api/chat-conversa",
    {
      mensagem,
      estado,
      estadoAnterior: estado,
      mensagens,
      primeiroRelato: mensagens.length <= 1,
      modo: "instantaneo",
    },
    cookie
  );
  if (r.status !== 200) {
    throw new Error(`chat-conversa ${r.status}: ${r.text.slice(0, 300)}`);
  }
  const resposta = String(r.json.resposta ?? "");
  const estadoAtualizado =
    (r.json.estadoAtualizado as EstadoCasoChat | undefined) ?? estado;
  return { resposta, estado: estadoAtualizado };
}

function htmlParaTexto(s: string): string {
  return s
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

async function gerarPeca(
  cookie: string,
  estado: EstadoCasoChat,
  opcoes?: { esforco?: "agil" | "padrao" | "fundo" }
): Promise<{ peca: string; equipeDetalhe: string; modeloHint: string }> {
  const payload = montarPayloadGeracaoChat(estado, { atuarLeigo: false });
  const r = await postJson(
    "/api/gerar-peca",
    {
      ...payload,
      stream: false,
      adiarDebitoCota: false,
      esforcoRedacao: opcoes?.esforco ?? "padrao",
      adesaoRedacao: "livre",
    },
    cookie
  );
  if (r.status !== 200) {
    throw new Error(`gerar-peca ${r.status}: ${r.text.slice(0, 500)}`);
  }
  let bruto =
    String(r.json.peca ?? r.json.texto ?? r.json.html ?? "") ||
    (typeof r.json.documento === "string" ? r.json.documento : "");
  if (!bruto || bruto.length < 400) {
    bruto = String(r.json.pecaHtml ?? "");
  }
  const peca = /<\/?[a-z][\s\S]*>/i.test(bruto) ? htmlParaTexto(bruto) : bruto;
  if (!peca || peca.length < 400) {
    throw new Error(
      `peça curta/ausente keys=${Object.keys(r.json).join(",")} len=${peca.length}`
    );
  }
  const etapas = Array.isArray(r.json.equipeEtapas) ? r.json.equipeEtapas : [];
  const redator = etapas.find(
    (e: { id?: string; skin?: string }) =>
      e.id === "redator" || /redator/i.test(String(e.skin ?? ""))
  ) as { detalhe?: string; modelo?: string } | undefined;
  const equipeDetalhe = String(redator?.detalhe ?? "");
  const modeloHint = String(
    redator?.modelo ?? r.json.modelo ?? r.json.modeloIA ?? equipeDetalhe
  );
  return { peca, equipeDetalhe, modeloHint };
}

function checksLocais() {
  const guia = aliviarGuiaEstruturaPrompt(
    blocoEstruturaDaArea("trabalhista", "contestacao")
  );
  if (/NÃO aplique/i.test(guia)) throw new Error("estrutura ainda com NÃO aplique");
  if (/^Rito:/m.test(guia)) throw new Error("estrutura ainda com Rito:");
  if (/ESTRUTURA OBRIGATÓRIA/i.test(guia)) {
    throw new Error("estrutura ainda OBRIGATÓRIA (deveria ser sugerida)");
  }
  console.log("  OK estrutura aliviada (trabalhista/contestacao)");
}

async function main() {
  console.log("— Checks locais —");
  checksLocais();
  const only =
    process.argv.find((a) => a.startsWith("--only="))?.split("=")[1] ?? null;
  const casos = only ? CASOS.filter((c) => c.id === only) : [...CASOS];
  if (only && casos.length === 0) {
    throw new Error(`--only=${only} sem match (${CASOS.map((c) => c.id).join(", ")})`);
  }
  console.log(`\nSmoke API ${casos.length} caso(s) · ${BASE}\n`);

  const probe = await fetch(BASE + "/").catch(() => null);
  if (!probe?.ok) throw new Error("servidor inacessível");

  const cookie = await autenticar();
  console.log("Auth/sessao OK\n");

  mkdirSync("tmp", { recursive: true });
  const resultados: { id: string; ok: boolean; detalhe: string }[] = [];

  for (const caso of casos) {
    process.stdout.write(`▸ ${caso.id} … `);
    try {
      let estado = montarEstado(caso.relato);
      const mensagens: MensagemChat[] = [
        {
          id: "u1",
          papel: "usuario",
          texto: caso.relato,
          ts: Date.now(),
        },
      ];

      const t1 = await turnoChat(cookie, caso.relato, estado, mensagens);
      estado = t1.estado;
      mensagens.push({
        id: "a1",
        papel: "assistente",
        texto: t1.resposta,
        ts: Date.now(),
      });
      if (t1.resposta.length < 40) {
        throw new Error("resposta chat vazia no 1º turno");
      }

      mensagens.push({
        id: "u2",
        papel: "usuario",
        texto: caso.ajuste,
        ts: Date.now(),
      });
      const t2 = await turnoChat(cookie, caso.ajuste, estado, mensagens);
      estado = t2.estado;
      mensagens.push({
        id: "a2",
        papel: "assistente",
        texto: t2.resposta,
        ts: Date.now(),
      });

      const pecaRes = await gerarPeca(
        cookie,
        {
          ...estado,
          // Relato original: chat pode resumir fatos e perder “filha”/números.
          fatos: caso.relato,
        },
        {
          esforco: caso.id.includes("apelacao") ? "fundo" : "padrao",
        }
      );
      const peca = pecaRes.peca;
      for (const re of caso.checagens) {
        if (!re.test(peca)) {
          throw new Error(`checagem falhou ${re} · amostra: ${peca.slice(0, 280)}`);
        }
      }
      const proibidos =
        "proibidos" in caso && Array.isArray(caso.proibidos) ? caso.proibidos : [];
      for (const re of proibidos) {
        if (re.test(peca)) {
          throw new Error(
            `contaminação proibida ${re} · trecho: ${peca.match(re)?.[0] ?? "?"}`
          );
        }
      }
      if (caso.id.includes("apelacao")) {
        const sonnetHint =
          /sonnet|claude|especie_complexa|area_densa|esforco_fundo/i.test(
            `${pecaRes.equipeDetalhe} ${pecaRes.modeloHint}`
          );
        console.log(
          `  redator: ${pecaRes.equipeDetalhe || pecaRes.modeloHint || "(sem detalhe)"}`
        );
        if (!sonnetHint) {
          console.log(
            "  aviso: detalhe não confirma Sonnet (API pode ocultar modelo); peça gerada mesmo assim"
          );
        }
        if (/VARA C[IÍ]VEL/i.test(peca) && !/especialidade|C[IÍ]VEL/.test(caso.relato)) {
          // Relato não traz especialidade — preferir só "1ª Vara"
          console.log("  aviso: peça ainda cita VARA CÍVEL (calibrar se endereçamento determinístico cobrir)");
        }
      }
      writeFileSync(`tmp/smoke-peca-${caso.id}.txt`, peca, "utf8");
      console.log(`OK (${peca.length} chars)`);
      resultados.push({ id: caso.id, ok: true, detalhe: `${peca.length} chars` });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`FALHA`);
      console.error(`  ${msg}`);
      resultados.push({ id: caso.id, ok: false, detalhe: msg });
    }
  }

  const ok = resultados.filter((r) => r.ok).length;
  console.log(`\nResumo: ${ok}/${resultados.length} ok`);
  if (ok < resultados.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
