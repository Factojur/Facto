/**
 * Auditoria de qualidade dos julgados portal TJ (contrato ementaJurisPortalValida).
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { ementaJurisPortalValida } from "../src/lib/scrapers/validar-ementa";

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
  const { data, error } = await sb
    .from("base_conhecimento")
    .select("id, titulo, fonte, texto")
    .like("fonte", "tj%-portal");
  if (error) throw error;

  const porFonte: Record<string, { total: number; ok: number; ruins: number; tipOk: string[] }> =
    {};
  let ruins = 0;
  for (const r of data || []) {
    const f = (r.fonte as string) || "?";
    if (!porFonte[f]) porFonte[f] = { total: 0, ok: 0, ruins: 0, tipOk: [] };
    porFonte[f].total++;
    const e = soEmenta((r.texto as string) || "");
    if (ementaJurisPortalValida(e)) {
      porFonte[f].ok++;
      if (porFonte[f].tipOk.length < 2) {
        porFonte[f].tipOk.push(e.replace(/\s+/g, " ").slice(0, 100));
      }
    } else {
      porFonte[f].ruins++;
      ruins++;
    }
  }
  console.log(JSON.stringify({ total: data?.length ?? 0, ruins, porFonte }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
