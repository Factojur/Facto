import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { ementaJurisPortalValida } from "../src/lib/scrapers/validar-ementa";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const { data } = await sb
    .from("base_conhecimento")
    .select("titulo, texto")
    .eq("titulo", "TJRN — 0819631-33.2024.8.20.5106")
    .maybeSingle();
  const t = (data?.texto || "").split(/\n\nRelator/)[0];
  console.log(
    JSON.stringify(
      {
        ok: ementaJurisPortalValida(t),
        tip: t.replace(/\s+/g, " ").slice(0, 220),
      },
      null,
      2
    )
  );
}

main();
