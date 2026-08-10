/**
 * Diagnóstico rápido pós-compra (últimas 24h).
 * Uso: npx tsx scripts/diag-pos-compra.ts
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function carregarEnvLocal() {
  const caminho = resolve(process.cwd(), ".env.local");
  if (!existsSync(caminho)) return;
  for (const linha of readFileSync(caminho, "utf8").split(/\r?\n/)) {
    const t = linha.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const chave = t.slice(0, i).trim();
    let valor = t.slice(i + 1).trim();
    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1);
    }
    if (!process.env[chave]) process.env[chave] = valor;
  }
}

async function main() {
  carregarEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new Error("Faltam credenciais Supabase no .env.local");

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const desde = new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString();

  const [wh, ass, pag, em, conv] = await Promise.all([
    admin
      .from("webhook_eventos_mp")
      .select("id, topico, mp_id, processado, erro, recebido_em")
      .gte("recebido_em", desde)
      .order("recebido_em", { ascending: false })
      .limit(20),
    admin
      .from("assinaturas")
      .select(
        "id, email, plano, valor, status, mp_preapproval_id, criado_em, atualizado_em"
      )
      .order("atualizado_em", { ascending: false })
      .limit(12),
    admin
      .from("pagamentos")
      .select("id, valor, status, pago_em, mp_payment_id, assinatura_id")
      .gte("pago_em", desde)
      .order("pago_em", { ascending: false })
      .limit(12),
    admin
      .from("email_eventos")
      .select("tipo, status, destinatario, assunto, erro, criado_em, metadados")
      .gte("criado_em", desde)
      .order("criado_em", { ascending: false })
      .limit(25),
    admin
      .from("convites_pagos")
      .select("email, status, mp_payment_id, criado_em")
      .order("criado_em", { ascending: false })
      .limit(12),
  ]);

  console.log("=== ENV LOCAL ===");
  console.log({
    RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY?.trim()),
    TWILIO_ACCOUNT_SID: Boolean(process.env.TWILIO_ACCOUNT_SID?.trim()),
    TWILIO_AUTH_TOKEN: Boolean(process.env.TWILIO_AUTH_TOKEN?.trim()),
    TWILIO_FROM_NUMBER: process.env.TWILIO_FROM_NUMBER?.trim() || null,
    ALERTA_COMPRA_SMS_PARA:
      process.env.ALERTA_COMPRA_SMS_PARA?.trim() || "+5511985036364 (default)",
    MERCADOPAGO_ACCESS_TOKEN: Boolean(
      process.env.MERCADOPAGO_ACCESS_TOKEN?.trim()
    ),
    MERCADOPAGO_WEBHOOK_SECRET: Boolean(
      process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim()
    ),
  });

  console.log("\n=== WEBHOOKS (36h) ===");
  console.log(wh.error?.message ?? wh.data);

  console.log("\n=== ASSINATURAS recentes ===");
  console.log(ass.error?.message ?? ass.data);

  console.log("\n=== PAGAMENTOS (36h) ===");
  console.log(pag.error?.message ?? pag.data);

  console.log("\n=== EMAIL_EVENTOS (36h) ===");
  console.log(em.error?.message ?? em.data);

  console.log("\n=== CONVITES ===");
  console.log(conv.error?.message ?? conv.data);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
