import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { ementaJurisPortalValida, normalizarEmentaPortal } from "../src/lib/scrapers/validar-ementa";

config({ path: resolve(process.cwd(), ".env.local") });

function soEmenta(texto: string): string {
  const t = texto || "";
  const corte = t.search(/\n\nRelator\(a\):|\n\nData:|\n\nFonte oficial:/);
  return (corte >= 0 ? t.slice(0, corte) : t).trim();
}

async function main() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const { data } = await sb
    .from("base_conhecimento")
    .select("titulo, fonte, texto")
    .in("fonte", ["tjms-portal", "tjac-portal"]);

  for (const r of data || []) {
    const e = soEmenta(r.texto as string);
    const tip = e.replace(/\s+/g, " ").slice(0, 80);
    const ok = ementaJurisPortalValida(e);
    const startsRel = /^[,;./\s]*Rel/i.test(e);
    if (!ok || startsRel) {
      console.log(
        JSON.stringify({
          titulo: r.titulo,
          ok,
          startsRel,
          tip,
          norm: normalizarEmentaPortal(e).slice(0, 80),
        })
      );
    }
  }
}

main();
