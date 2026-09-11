/**
 * Limpa SÓ fonte tj%-portal inapta (colagem Rel./multi-TJ/sem ementa).
 * NÃO aplica ao jurisprudencias.ai (critério portal é mais rígido).
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

function colagemPrecedentes(texto: string): boolean {
  const t = soEmenta(texto).replace(/\s+/g, " ").trim();
  if (/^[,;./\s]*Rel(ator|atora|ª)/i.test(t)) return true;
  if (
    /Órgão julgador\s*:/i.test(t) &&
    /Data do julgamento\s*:/i.test(t) &&
    !/^(EMENTA\s*:|DIREITO\s|RECURSO\s|APELA)/i.test(t)
  ) {
    return true;
  }
  const tjs = (
    t.match(
      /\bTJ(AC|AL|AP|AM|BA|CE|ES|GO|MA|MG|MS|MT|PA|PB|PE|PI|PR|RJ|RN|RO|RR|RS|SC|SE|SP|TO)\b/gi
    ) || []
  ).length;
  if (tjs >= 2 && /^[,;./\s]*Rel/i.test(t)) return true;
  const cnjs = t.match(/\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/g) || [];
  if (cnjs.length >= 3 && /^[,;./\s]*Rel/i.test(t)) return true;
  return false;
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

  const ruins = (data || []).filter((r) => {
    const e = soEmenta((r.texto as string) || "");
    return !ementaJurisPortalValida(e) || colagemPrecedentes((r.texto as string) || "");
  });

  console.log(
    JSON.stringify(
      {
        total: data?.length ?? 0,
        ruins: ruins.length,
        amostra: ruins.slice(0, 20).map((r) => ({
          titulo: r.titulo,
          fonte: r.fonte,
          tip: soEmenta((r.texto as string) || "")
            .replace(/\s+/g, " ")
            .slice(0, 110),
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
  console.log(`Removidos ${ruins.length} (só tj%-portal).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
