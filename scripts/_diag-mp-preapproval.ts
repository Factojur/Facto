import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

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
  const id = process.argv[2] || "89714bab96614507be8620181d8db183";
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  if (!token) throw new Error("sem token MP");

  const res = await fetch(`https://api.mercadopago.com/preapproval/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const j = (await res.json()) as Record<string, unknown>;
  console.log("status HTTP", res.status);
  console.log(
    JSON.stringify(
      {
        id: j.id,
        status: j.status,
        payer_email: j.payer_email,
        reason: j.reason,
        auto_recurring: j.auto_recurring,
        external_reference: j.external_reference,
      },
      null,
      2
    )
  );

  // schema webhook
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const wh = await admin.from("webhook_eventos_mp").select("*").limit(1);
  console.log("webhook sample keys", wh.error?.message ?? Object.keys(wh.data?.[0] ?? {}));
  const wh2 = await admin
    .from("webhook_eventos_mp")
    .select("*")
    .order("id", { ascending: false })
    .limit(8);
  console.log("webhooks recent", JSON.stringify(wh2.data, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
