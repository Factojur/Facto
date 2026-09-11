/**
 * Re-roda UFs da falha 12:30 (rn/am/pe/es) sem avançar a fila (próximo PA 15:30).
 * Uso: npx tsx scripts/repor-tj-falhas-1230.ts
 */
import { config } from "dotenv";
import { spawnSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { metadadosJurisDoTexto } from "../src/lib/juris-metadados";
import {
  buscarEsajTjJuris,
  ementaTjEsajValida,
  fonteTjPortal,
  siglaTj,
  type UfTjEsaj,
} from "../src/lib/scrapers/esaj-tj";
import { buscarTjrnJuris, ementaTjrnValida } from "../src/lib/scrapers/tjrn";
import { buscarTjpeJuris, ementaTjpeValida } from "../src/lib/scrapers/tjpe";
import { buscarTjesJuris, ementaTjesValida } from "../src/lib/scrapers/tjes";
import {
  TEMAS_TJ_P2B,
  TJ_PORTAL_ANOS,
  TJ_PORTAL_POR_TEMA,
} from "./seed-juris-tj-portal-temas";

config({ path: resolve(process.cwd(), ".env.local") });

const estadoPath = resolve(
  process.cwd(),
  "scripts/seed-juris-tj-portal-estado.json"
);

const UFS: UfTjEsaj[] = ["rn", "pe", "es"];

function montarTexto(
  ementa: string,
  relator?: string,
  data?: string,
  url?: string
) {
  const partes = [ementa.trim()];
  if (relator) partes.push(`Relator(a): ${relator}`);
  if (data) partes.push(`Data: ${data}`);
  if (url) partes.push(`Fonte oficial: ${url}`);
  return partes.join("\n\n");
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("env");
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const estadoAntes = readFileSync(estadoPath, "utf8");
  const estado = JSON.parse(estadoAntes) as {
    tjTemaPorUf: Partial<Record<UfTjEsaj, number>>;
    falhasPorUf?: Partial<Record<UfTjEsaj, number>>;
  };

  let insertsTotal = 0;

  for (const uf of UFS) {
    const sigla = siglaTj(uf);
    const fonte = fonteTjPortal(uf);
    const temas = TEMAS_TJ_P2B.slice(0, 2);
    let inserts = 0;
    let skips = 0;
    let falhas = 0;

    for (const tema of temas) {
      console.log(`\n→ ${sigla} «${tema.q}»`);
      const r =
        uf === "rn"
          ? await buscarTjrnJuris(tema.q, {
              limite: TJ_PORTAL_POR_TEMA,
              anos: TJ_PORTAL_ANOS,
            })
          : uf === "pe"
            ? await buscarTjpeJuris(tema.q, {
                limite: TJ_PORTAL_POR_TEMA,
                anos: TJ_PORTAL_ANOS,
              })
            : uf === "es"
              ? await buscarTjesJuris(tema.q, {
                  limite: TJ_PORTAL_POR_TEMA,
                  anos: TJ_PORTAL_ANOS,
                })
              : await buscarEsajTjJuris(uf, tema.q, {
                  limite: TJ_PORTAL_POR_TEMA,
                  anos: TJ_PORTAL_ANOS,
                });
      if (r.erro) {
        console.error(`  ERRO: ${r.erro}`);
        falhas++;
        continue;
      }
      if (r.aviso && !r.julgados.length) console.warn(`  ${r.aviso}`);
      console.log(`  pool=${r.julgados.length}`);

      for (const j of r.julgados) {
        const okEmenta =
          ementaTjEsajValida(j.ementa) ||
          (uf === "rn" && ementaTjrnValida(j.ementa)) ||
          (uf === "pe" && ementaTjpeValida(j.ementa)) ||
          (uf === "es" && ementaTjesValida(j.ementa));
        if (!okEmenta) {
          skips++;
          continue;
        }
        const titulo = j.titulo.trim();
        const texto = montarTexto(j.ementa, j.relator, j.data, j.url);
        const meta = metadadosJurisDoTexto(titulo, texto, sigla);
        const { data: existente } = await supabase
          .from("base_conhecimento")
          .select("id")
          .eq("titulo", titulo)
          .maybeSingle();
        if (existente?.id) {
          skips++;
          continue;
        }
        const { error } = await supabase.from("base_conhecimento").insert({
          titulo,
          categoria: "Jurisprudência" as const,
          texto,
          fonte,
          status: "validado",
          tribunal: meta.tribunal || sigla,
          area_tags: tema.area_tags?.length ? tema.area_tags : meta.area_tags,
        });
        if (error) {
          console.error(`  fail ${titulo}: ${error.message}`);
          falhas++;
        } else {
          inserts++;
          console.log(`  + ${titulo}`);
        }
      }
    }

    console.log(
      `Resumo ${sigla}: +${inserts} · skip ${skips} · falha ${falhas}`
    );
    insertsTotal += inserts;
    if (inserts > 0) {
      estado.tjTemaPorUf[uf] = 2;
      if (estado.falhasPorUf) delete estado.falhasPorUf[uf];
    }
  }

  // Restaura fila (PA nas 15:30) mas grava progresso de temas/falhas.
  const base = JSON.parse(estadoAntes) as Record<string, unknown>;
  base.tjTemaPorUf = {
    ...(base.tjTemaPorUf as object),
    ...estado.tjTemaPorUf,
  };
  base.falhasPorUf = estado.falhasPorUf || {};
  writeFileSync(estadoPath, `${JSON.stringify(base, null, 2)}\n`, "utf8");

  console.log(`\nTOTAL inserts: ${insertsTotal}`);
  if (insertsTotal > 0) {
    const reindex = spawnSync(
      "npx",
      ["--yes", "tsx", "scripts/reindex-embeddings.ts", "--paygo-portal-tj"],
      {
        encoding: "utf8",
        cwd: process.cwd(),
        shell: true,
        env: process.env,
        maxBuffer: 40 * 1024 * 1024,
      }
    );
    if (reindex.stdout) process.stdout.write(reindex.stdout);
    if (reindex.stderr) process.stderr.write(reindex.stderr);
  }

  process.exit(insertsTotal > 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
