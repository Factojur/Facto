/**
 * Remove portal TJ com texto curto/fragmento (não ementa útil).
 */
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

  const idsCurto = [
    "TJMS — 0800546-31.2022.8.12.0005",
    "TJMS — 0840634-31.2019.8.12.0001",
    "TJAC — 0703349-89.2025.8.01.0001",
    "TJAC — 0723659-53.2024.8.01.0001",
  ];

  // Busca por título + PE se começar mal
  const { data, error } = await sb
    .from("base_conhecimento")
    .select("id, titulo, fonte, texto")
    .in("fonte", ["tjms-portal", "tjac-portal", "tjpe-portal"]);
  if (error) throw error;

  const aRemover = (data || []).filter((r) => {
    const t = ((r.texto as string) || "").replace(/\s+/g, " ").trim();
    if (idsCurto.includes(r.titulo as string)) return true;
    if (t.length < 180) return true;
    // PE: começa no meio / parece só trecho penal sem ementa
    if (
      r.fonte === "tjpe-portal" &&
      (/^r da figura típica/i.test(t) || !/EMENTA|DIREITO |RECURSO |APELA/i.test(t.slice(0, 80)))
    ) {
      return true;
    }
    // MS/AC: só citação começando com vírgula/Rel.
    if (
      (r.fonte === "tjms-portal" || r.fonte === "tjac-portal") &&
      /^[,;]?\s*Rel\./i.test(t) &&
      t.length < 400
    ) {
      return true;
    }
    return false;
  });

  console.log(
    JSON.stringify(
      {
        candidatos: aRemover.map((r) => ({
          titulo: r.titulo,
          fonte: r.fonte,
          len: ((r.texto as string) || "").length,
          tip: ((r.texto as string) || "").replace(/\s+/g, " ").slice(0, 100),
        })),
      },
      null,
      2
    )
  );

  if (!aRemover.length) {
    console.log("Nada a remover.");
    return;
  }

  const { error: delErr } = await sb
    .from("base_conhecimento")
    .delete()
    .in(
      "id",
      aRemover.map((r) => r.id)
    );
  if (delErr) throw delErr;
  console.log(`Removidos ${aRemover.length}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
