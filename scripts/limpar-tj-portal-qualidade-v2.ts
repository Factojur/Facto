/**
 * Limpa de novo todos tj%-portal que falham ementaJurisPortalValida
 * (valida só o bloco da ementa, antes de Relator/Data/Fonte).
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

  const ruins = (data || []).filter(
    (r) => !ementaJurisPortalValida(soEmenta((r.texto as string) || ""))
  );
  console.log(
    JSON.stringify(
      {
        total: data?.length ?? 0,
        ruins: ruins.length,
        porFonte: Object.fromEntries(
          [...new Set(ruins.map((r) => r.fonte))].map((f) => [
            f,
            ruins.filter((r) => r.fonte === f).length,
          ])
        ),
        amostra: ruins.slice(0, 12).map((r) => ({
          titulo: r.titulo,
          fonte: r.fonte,
          tip: soEmenta((r.texto as string) || "")
            .replace(/\s+/g, " ")
            .slice(0, 100),
        })),
      },
      null,
      2
    )
  );
  if (!ruins.length) return;
  const { error: delErr } = await sb
    .from("base_conhecimento")
    .delete()
    .in(
      "id",
      ruins.map((r) => r.id)
    );
  if (delErr) throw delErr;
  console.log(`Removidos ${ruins.length}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
