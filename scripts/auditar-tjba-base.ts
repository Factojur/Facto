/**
 * Auditoria TJBA na base (todas as fontes com título TJBA% ou fonte tjba-portal).
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

function motivoRuim(texto: string): string | null {
  const t = (texto || "").replace(/\s+/g, " ").trim();
  if (/ler mais/i.test(t)) return "ler_mais";
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
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data, error } = await sb
    .from("base_conhecimento")
    .select("id, titulo, fonte, texto")
    .or("fonte.eq.tjba-portal,titulo.ilike.TJBA%");
  if (error) throw error;

  const rows = data ?? [];
  const ruins = rows
    .map((r) => ({
      id: r.id,
      titulo: r.titulo,
      fonte: r.fonte,
      motivo: motivoRuim(r.texto as string),
      len: ((r.texto as string) || "").length,
    }))
    .filter((r) => r.motivo);

  const ok = rows.filter((r) => !motivoRuim(r.texto as string));
  const porFonte: Record<string, number> = {};
  for (const r of rows) {
    const f = (r.fonte as string) || "?";
    porFonte[f] = (porFonte[f] || 0) + 1;
  }

  console.log(
    JSON.stringify(
      {
        total: rows.length,
        ruins: ruins.length,
        ok: ok.length,
        porFonte,
        amostraOk: ok.slice(0, 5).map((r) => ({
          titulo: r.titulo,
          fonte: r.fonte,
          len: ((r.texto as string) || "").length,
          tip: ((r.texto as string) || "").slice(0, 140),
        })),
        ruins,
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
