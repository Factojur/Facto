import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const titles = [
    "TJAC — 0700346-97.2024.8.01.0022",
    "TJAC — 0701603-60.2023.8.01.0001",
    "TJRN — 0819991-02.2023.8.20.5106",
    "TJRN — 0819631-33.2024.8.20.5106",
  ];
  for (const t of titles) {
    const { data } = await sb
      .from("base_conhecimento")
      .select("id, titulo")
      .eq("titulo", t)
      .maybeSingle();
    console.log(`${t}: ${data ? "AINDA EXISTE" : "removido/ausente"}`);
  }
  const { count: portal } = await sb
    .from("base_conhecimento")
    .select("id", { count: "exact", head: true })
    .like("fonte", "tj%-portal");
  const { count: ai } = await sb
    .from("base_conhecimento")
    .select("id", { count: "exact", head: true })
    .eq("fonte", "jurisprudencias.ai");
  const { count: juris } = await sb
    .from("base_conhecimento")
    .select("id", { count: "exact", head: true })
    .eq("categoria", "Jurisprudência");
  console.log(JSON.stringify({ portal, jurisprudenciasAi: ai, jurisTotal: juris }, null, 2));
}

main();
