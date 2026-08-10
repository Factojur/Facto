/**
 * Recupera e-mail do pagador + dispara pós-compra para um preapproval.
 * Uso: npx tsx scripts/recuperar-pos-compra.ts <preapprovalId>
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { buscarEmailPagadorPreapproval } from "../src/lib/mercadopago/client";
import { upsertAssinaturaDePreapproval } from "../src/lib/mercadopago/sincronizar-assinatura";
import { garantirConviteEEmailsPosCompra } from "../src/lib/mercadopago/pos-compra";
import { chamarMercadoPago } from "../src/lib/mercadopago/client";
import type { PreapprovalMp } from "../src/lib/mercadopago/sincronizar-assinatura";

function env() {
  const p = resolve(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  for (const linha of readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = linha.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

async function main() {
  env();
  const id = (process.argv[2] ?? "").trim();
  if (!id) {
    console.error("Uso: npx tsx scripts/recuperar-pos-compra.ts <preapprovalId>");
    process.exit(1);
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const pre = (await chamarMercadoPago(
    `/preapproval/${id}`
  )) as PreapprovalMp;
  console.log("preapproval", {
    id: pre.id,
    status: pre.status,
    payer_email: pre.payer_email,
    reason: pre.reason,
  });

  const email =
    (await buscarEmailPagadorPreapproval(id, pre.payer_email)) ??
    pre.payer_email?.trim() ??
    null;
  console.log("email resolvido:", email);

  const sync = await upsertAssinaturaDePreapproval(admin as never, {
    ...pre,
    payer_email: email,
  });
  console.log("sync", sync);

  if (!sync.email) {
    console.error("Sem e-mail — não dá para enviar pós-compra.");
    process.exit(1);
  }

  const envio = await garantirConviteEEmailsPosCompra(admin as never, {
    email: sync.email,
    mpPaymentId: sync.mpPaymentId ?? `preapproval:${id}`,
    valor: sync.valor,
    plano: sync.plano,
    atrasoConviteMinutos: 0,
  });
  console.log("envio", envio);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
