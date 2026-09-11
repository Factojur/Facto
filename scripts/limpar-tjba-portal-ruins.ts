/**
 * Remove itens tjba-portal com ementa truncada (....ler mais / só cabeçalho).
 * Uso: npx tsx scripts/limpar-tjba-portal-ruins.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

function motivoRuim(texto: string): string | null {
  const t = (texto || "").replace(/\s+/g, " ").trim();
  if (/\.{2,}\s*ler mais/i.test(t) || /…\s*ler mais/i.test(t) || /ler mais/i.test(t)) {
    return "ler_mais";
  }
  if (
    /^(Tribunal de Justiça do Estado da Bahia|PODER JUDICI[AÁ]RIO)/i.test(t) &&
    t.length < 900
  ) {
    return "cabecalho_curto";
  }
  if (t.length < 180) return "curto";
  return null;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("env");

  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await sb
    .from("base_conhecimento")
    .select("id, titulo, texto")
    .eq("fonte", "tjba-portal");
  if (error) throw error;

  const ruins = (data ?? [])
    .map((r) => ({
      id: r.id as string,
      titulo: r.titulo as string,
      motivo: motivoRuim(r.texto as string),
      len: ((r.texto as string) || "").length,
    }))
    .filter((r) => r.motivo);

  console.log(
    JSON.stringify(
      {
        total: data?.length ?? 0,
        ruins: ruins.length,
        amostra: ruins.slice(0, 20),
      },
      null,
      2
    )
  );

  if (!ruins.length) {
    console.log("Nada a remover.");
    return;
  }

  const ids = ruins.map((r) => r.id);
  const { error: delErr } = await sb
    .from("base_conhecimento")
    .delete()
    .in("id", ids);
  if (delErr) throw delErr;
  console.log(`Removidos ${ids.length} itens tjba-portal ruins.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
