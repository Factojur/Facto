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
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN!.trim();
  const id = "89714bab96614507be8620181d8db183";

  const fat = await fetch(
    `https://api.mercadopago.com/authorized_payments/search?preapproval_id=${id}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log("authorized_payments search", fat.status);
  const fatJson = await fat.json();
  console.log(JSON.stringify(fatJson, null, 2).slice(0, 4000));

  const pay = await fetch(
    `https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&range=date_created&begin_date=NOW-2DAYS&end_date=NOW`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log("\npayments search", pay.status);
  const payJson = (await pay.json()) as {
    results?: Array<{
      id: number;
      status: string;
      transaction_amount: number;
      date_created: string;
      payer?: { email?: string };
      description?: string;
      external_reference?: string;
    }>;
  };
  const results = (payJson.results ?? []).slice(0, 15).map((r) => ({
    id: r.id,
    status: r.status,
    amount: r.transaction_amount,
    date: r.date_created,
    email: r.payer?.email,
    description: r.description,
    external_reference: r.external_reference,
  }));
  console.log(JSON.stringify(results, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
