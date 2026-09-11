/**
 * 1) Remove portal TJ com ementa fraca (Rel./curto/ler mais).
 * 2) Repor MS+AC temas 0–1 com scraper endurecido (não avança fila PA).
 */
import { config } from "dotenv";
import { spawnSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { metadadosJurisDoTexto } from "../src/lib/juris-metadados";
import {
  buscarEsajTjJuris,
  fonteTjPortal,
  siglaTj,
  type UfTjEsaj,
} from "../src/lib/scrapers/esaj-tj";
import { ementaJurisPortalValida } from "../src/lib/scrapers/validar-ementa";
import {
  TEMAS_TJ_P2B,
  TJ_PORTAL_ANOS,
  TJ_PORTAL_POR_TEMA,
} from "./seed-juris-tj-portal-temas";

config({ path: resolve(process.cwd(), ".env.local") });
const estadoPath = resolve(process.cwd(), "scripts/seed-juris-tj-portal-estado.json");

function montarTexto(ementa: string, relator?: string, data?: string, url?: string) {
  const partes = [ementa.trim()];
  if (relator) partes.push(`Relator(a): ${relator}`);
  if (data) partes.push(`Data: ${data}`);
  if (url) partes.push(`Fonte oficial: ${url}`);
  return partes.join("\n\n");
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
    (r) => !ementaJurisPortalValida((r.texto as string) || "")
  );
  console.log(
    JSON.stringify(
      {
        totalPortal: data?.length ?? 0,
        ruins: ruins.length,
        amostra: ruins.slice(0, 15).map((r) => ({
          titulo: r.titulo,
          fonte: r.fonte,
          tip: ((r.texto as string) || "").replace(/\s+/g, " ").slice(0, 100),
        })),
      },
      null,
      2
    )
  );

  if (ruins.length) {
    const { error: delErr } = await sb
      .from("base_conhecimento")
      .delete()
      .in(
        "id",
        ruins.map((r) => r.id)
      );
    if (delErr) throw delErr;
    console.log(`Removidos ${ruins.length} ruins.`);
  }

  const estadoAntes = readFileSync(estadoPath, "utf8");
  const estado = JSON.parse(estadoAntes) as {
    tjTemaPorUf: Partial<Record<UfTjEsaj, number>>;
  };

  let insertsTotal = 0;
  for (const uf of ["ms", "ac"] as UfTjEsaj[]) {
    const sigla = siglaTj(uf);
    const fonte = fonteTjPortal(uf);
    let inserts = 0;
    for (const tema of TEMAS_TJ_P2B.slice(0, 2)) {
      console.log(`\n→ ${sigla} «${tema.q}»`);
      const r = await buscarEsajTjJuris(uf, tema.q, {
        limite: TJ_PORTAL_POR_TEMA,
        anos: TJ_PORTAL_ANOS,
      });
      if (r.erro) console.error(r.erro);
      if (r.aviso) console.warn(r.aviso);
      console.log(`  pool=${r.julgados.length}`);
      for (const j of r.julgados) {
        if (!ementaJurisPortalValida(j.ementa)) continue;
        const titulo = j.titulo.trim();
        const { data: ex } = await sb
          .from("base_conhecimento")
          .select("id")
          .eq("titulo", titulo)
          .maybeSingle();
        if (ex?.id) continue;
        const texto = montarTexto(j.ementa, j.relator, j.data, j.url);
        const meta = metadadosJurisDoTexto(titulo, texto, sigla);
        const { error: insErr } = await sb.from("base_conhecimento").insert({
          titulo,
          categoria: "Jurisprudência" as const,
          texto,
          fonte,
          status: "validado",
          tribunal: meta.tribunal || sigla,
          area_tags: tema.area_tags?.length ? tema.area_tags : meta.area_tags,
        });
        if (insErr) console.error(insErr.message);
        else {
          inserts++;
          console.log(`  + ${titulo} · ${j.ementa.slice(0, 70)}…`);
        }
      }
    }
    console.log(`Resumo ${sigla}: +${inserts}`);
    insertsTotal += inserts;
    if (inserts > 0) estado.tjTemaPorUf[uf] = 2;
  }

  const base = JSON.parse(estadoAntes) as Record<string, unknown>;
  base.tjTemaPorUf = { ...(base.tjTemaPorUf as object), ...estado.tjTemaPorUf };
  writeFileSync(estadoPath, `${JSON.stringify(base, null, 2)}\n`, "utf8");

  console.log(`TOTAL +${insertsTotal}`);
  if (insertsTotal > 0) {
    spawnSync(
      "npx",
      ["--yes", "tsx", "scripts/reindex-embeddings.ts", "--paygo-portal-tj"],
      {
        encoding: "utf8",
        cwd: process.cwd(),
        shell: true,
        env: process.env,
        stdio: "inherit",
        maxBuffer: 40 * 1024 * 1024,
      }
    );
  }

  // Reauditoria rápida
  const { data: after } = await sb
    .from("base_conhecimento")
    .select("fonte, texto")
    .in("fonte", ["tjms-portal", "tjac-portal"]);
  const ruinsAfter = (after || []).filter(
    (r) => !ementaJurisPortalValida((r.texto as string) || "")
  );
  console.log(
    JSON.stringify(
      {
        msAc: after?.length ?? 0,
        ruinsApos: ruinsAfter.length,
        tips: (after || []).slice(0, 4).map((r) =>
          ((r.texto as string) || "").replace(/\s+/g, " ").slice(0, 90)
        ),
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
