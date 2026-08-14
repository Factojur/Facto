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
  const payId = process.argv[2] || "172190021615";
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${payId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const j = (await res.json()) as Record<string, unknown>;
  console.log(
    JSON.stringify(
      {
        id: j.id,
        status: j.status,
        email: (j.payer as { email?: string } | undefined)?.email,
        amount: j.transaction_amount,
        description: j.description,
        point_of_interaction: j.point_of_interaction,
        metadata: j.metadata,
        order: j.order,
        external_reference: j.external_reference,
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
