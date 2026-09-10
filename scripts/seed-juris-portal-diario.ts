/**
 * Seed diário 02h — jurisprudência de portais (P0: TSE/SJUR) → base_conhecimento.
 *
 * Gemini: só GEMINI_API_KEY_SEED (free) no reindex.
 * Uso: npm run seed:juris-portal-diario
 * Instalar: powershell -ExecutionPolicy Bypass -File scripts\instalar-tarefa-seed-portal.ps1
 */
import { config } from "dotenv";
import { spawnSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { metadadosJurisDoTexto } from "../src/lib/juris-metadados";
import { buscarTseJuris, ementaTseValida } from "../src/lib/scrapers/tse";
import { exigirGeminiApenasSeed } from "./lib/gemini-env-seed";
import {
  PORTAL_POR_TEMA,
  PORTAL_TEMAS_POR_NOITE,
  TEMAS_TSE_P0,
} from "./seed-juris-portal-temas";

config({ path: resolve(process.cwd(), ".env.local") });
exigirGeminiApenasSeed("seed-juris-portal-diario");

const estadoPath = resolve(process.cwd(), "scripts/seed-juris-portal-estado.json");
const FONTE = "tse-portal";

type EstadoPortal = {
  temaIndice: number;
  ultimaRodada: string | null;
  ultimoResultado?: {
    temas: number;
    inserts: number;
    skips: number;
    falhas: number;
  };
};

function hojeSp(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
}

function lerEstado(): EstadoPortal {
  try {
    const j = JSON.parse(readFileSync(estadoPath, "utf8")) as EstadoPortal;
    return {
      temaIndice: Math.max(0, Number(j.temaIndice) || 0),
      ultimaRodada: j.ultimaRodada ?? null,
      ultimoResultado: j.ultimoResultado,
    };
  } catch {
    return { temaIndice: 0, ultimaRodada: null };
  }
}

function gravarEstado(e: EstadoPortal) {
  writeFileSync(estadoPath, `${JSON.stringify(e, null, 2)}\n`, "utf8");
}

function montarTexto(ementa: string, relator?: string, data?: string, url?: string) {
  const partes = [ementa.trim()];
  if (relator) partes.push(`Relator(a): ${relator}`);
  if (data) partes.push(`Data: ${data}`);
  if (url) partes.push(`Fonte oficial: ${url}`);
  return partes.join("\n\n");
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const estado = lerEstado();
  if (estado.temaIndice >= TEMAS_TSE_P0.length) {
    console.log("Ciclo de temas TSE esgotado — reinicia do índice 0.");
    estado.temaIndice = 0;
  }

  const de = estado.temaIndice;
  const porNoite = Math.max(
    1,
    Number(process.env.PORTAL_TEMAS_POR_NOITE) || PORTAL_TEMAS_POR_NOITE
  );
  const ate = Math.min(TEMAS_TSE_P0.length, de + porNoite);
  const fatia = TEMAS_TSE_P0.slice(de, ate);
  console.log(
    `[portal-diario] ${new Date().toISOString()} temas ${de}..${ate - 1} (${fatia.length}) · por tema até ${PORTAL_POR_TEMA}`
  );

  let inserts = 0;
  let skips = 0;
  let falhas = 0;

  for (const tema of fatia) {
    console.log(`\n→ TSE «${tema.q}»`);
    const r = await buscarTseJuris(tema.q, { limite: PORTAL_POR_TEMA });
    if (r.erro) {
      console.error(`  ERRO: ${r.erro}`);
      falhas++;
      continue;
    }
    if (r.aviso) console.log(`  aviso: ${r.aviso}`);
    console.log(`  pool API/filtrado: ${r.poolSize ?? "?"} / ${r.julgados.length} · ${r.duracaoMs}ms`);

    for (const j of r.julgados) {
      if (!ementaTseValida(j.ementa)) {
        skips++;
        continue;
      }
      const titulo = j.titulo.trim();
      const texto = montarTexto(j.ementa, j.relator, j.data, j.url);
      const meta = metadadosJurisDoTexto(titulo, texto, j.tribunal);
      const area_tags =
        tema.area_tags?.length ? tema.area_tags : meta.area_tags;

      const { data: existente } = await supabase
        .from("base_conhecimento")
        .select("id")
        .eq("titulo", titulo)
        .maybeSingle();

      if (existente?.id) {
        await supabase
          .from("base_conhecimento")
          .update({
            tribunal: meta.tribunal,
            area_tags,
          })
          .eq("id", existente.id)
          .is("tribunal", null);
        skips++;
        continue;
      }

      const { error } = await supabase.from("base_conhecimento").insert({
        titulo,
        categoria: "Jurisprudência" as const,
        texto,
        fonte: FONTE,
        status: "validado",
        tribunal: meta.tribunal || "TSE",
        area_tags,
      });
      if (error) {
        console.error(`  insert fail ${titulo}: ${error.message}`);
        falhas++;
      } else {
        inserts++;
        console.log(`  + ${titulo.slice(0, 72)}`);
      }
    }

    // Folga entre temas (captcha / rate).
    await new Promise((r) => setTimeout(r, 2500));
  }

  estado.temaIndice = ate >= TEMAS_TSE_P0.length ? 0 : ate;
  estado.ultimaRodada = hojeSp();
  estado.ultimoResultado = {
    temas: fatia.length,
    inserts,
    skips,
    falhas,
  };
  gravarEstado(estado);

  console.log(
    `\nResumo: +${inserts} insert · ${skips} skip · ${falhas} falha · próximo temaIndice=${estado.temaIndice}`
  );

  if (inserts > 0) {
    console.log("Reindex embeddings (SEED free, teto 3 min)…");
    const re = spawnSync(
      "npx",
      ["--yes", "tsx", "scripts/reindex-embeddings.ts"],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        shell: true,
        maxBuffer: 40 * 1024 * 1024,
        timeout: 180_000,
      }
    );
    if (re.error) {
      console.error("Reindex não concluiu a tempo/erro:", re.error.message);
      console.log("Itens ficam sem vetor — retoma no smoke 03h ou npm run reindex:embeddings");
    } else {
      if (re.stdout) console.log(re.stdout.slice(-2000));
      if (re.stderr) console.error(re.stderr.slice(-1000));
    }
  }

  process.exit(falhas && !inserts ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
