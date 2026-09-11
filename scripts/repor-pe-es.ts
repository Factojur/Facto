/**
 * Re-roda só PE+ES (+paygo). Preserva fila PA 15:30.
 */
import { config } from "dotenv";
import { spawnSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { metadadosJurisDoTexto } from "../src/lib/juris-metadados";
import { fonteTjPortal, siglaTj, type UfTjEsaj } from "../src/lib/scrapers/esaj-tj";
import { buscarTjpeJuris, ementaTjpeValida } from "../src/lib/scrapers/tjpe";
import { buscarTjesJuris, ementaTjesValida } from "../src/lib/scrapers/tjes";
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
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const estadoAntes = readFileSync(estadoPath, "utf8");
  const estado = JSON.parse(estadoAntes) as {
    tjTemaPorUf: Partial<Record<UfTjEsaj, number>>;
    falhasPorUf?: Partial<Record<UfTjEsaj, number>>;
  };
  let total = 0;
  const ufs: UfTjEsaj[] = ["es", "pe"];

  for (const uf of ufs) {
    const sigla = siglaTj(uf);
    const fonte = fonteTjPortal(uf);
    let inserts = 0;
    for (const tema of TEMAS_TJ_P2B.slice(0, 2)) {
      console.log(`\n→ ${sigla} «${tema.q}»`);
      const r =
        uf === "pe"
          ? await buscarTjpeJuris(tema.q, { limite: TJ_PORTAL_POR_TEMA, anos: TJ_PORTAL_ANOS })
          : await buscarTjesJuris(tema.q, { limite: TJ_PORTAL_POR_TEMA, anos: TJ_PORTAL_ANOS });
      if (r.erro) {
        console.error(r.erro);
        continue;
      }
      console.log(`  pool=${r.julgados.length} ${r.aviso || ""}`);
      for (const j of r.julgados) {
        const ok =
          (uf === "pe" && ementaTjpeValida(j.ementa)) ||
          (uf === "es" && ementaTjesValida(j.ementa));
        if (!ok) continue;
        const titulo = j.titulo.trim();
        const { data: ex } = await supabase
          .from("base_conhecimento")
          .select("id")
          .eq("titulo", titulo)
          .maybeSingle();
        if (ex?.id) continue;
        const texto = montarTexto(j.ementa, j.relator, j.data, j.url);
        const meta = metadadosJurisDoTexto(titulo, texto, sigla);
        const { error } = await supabase.from("base_conhecimento").insert({
          titulo,
          categoria: "Jurisprudência" as const,
          texto,
          fonte,
          status: "validado",
          tribunal: meta.tribunal || sigla,
          area_tags: tema.area_tags?.length ? tema.area_tags : meta.area_tags,
        });
        if (error) console.error(error.message);
        else {
          inserts++;
          console.log(`  + ${titulo}`);
        }
      }
    }
    console.log(`Resumo ${sigla}: +${inserts}`);
    total += inserts;
    if (inserts > 0) {
      estado.tjTemaPorUf[uf] = 2;
      if (estado.falhasPorUf) delete estado.falhasPorUf[uf];
    }
  }

  const base = JSON.parse(estadoAntes) as Record<string, unknown>;
  base.tjTemaPorUf = { ...(base.tjTemaPorUf as object), ...estado.tjTemaPorUf };
  base.falhasPorUf = estado.falhasPorUf || {};
  writeFileSync(estadoPath, `${JSON.stringify(base, null, 2)}\n`, "utf8");
  console.log(`TOTAL +${total}`);
  if (total > 0) {
    spawnSync("npx", ["--yes", "tsx", "scripts/reindex-embeddings.ts", "--paygo-portal-tj"], {
      encoding: "utf8",
      cwd: process.cwd(),
      shell: true,
      env: process.env,
      stdio: "inherit",
      maxBuffer: 40 * 1024 * 1024,
    });
  }
  process.exit(total > 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
