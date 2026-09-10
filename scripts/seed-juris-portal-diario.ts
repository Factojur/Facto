/**
 * Seed diário 02h — jurisprudência de portais SJUR (TSE + TRE-SP) → base_conhecimento.
 *
 * Gemini: só GEMINI_API_KEY_SEED (free) no reindex.
 * Uso: npm run seed:juris-portal-diario
 * Instalar: powershell -ExecutionPolicy Bypass -File scripts\instalar-tarefa-seed-portal.ps1
 *
 * Host TRE: jurisprudencia.tre-sp.jus.br (hostname define o tribunal).
 */
import { config } from "dotenv";
import { spawnSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { metadadosJurisDoTexto } from "../src/lib/juris-metadados";
import { buscarTseJuris, ementaTseValida } from "../src/lib/scrapers/tse";
import {
  buscarTreSpJuris,
  ementaTreValida,
} from "../src/lib/scrapers/tre";
import type { JulgadoScrape } from "../src/lib/scrapers/types";
import { exigirGeminiApenasSeed } from "./lib/gemini-env-seed";
import {
  PORTAL_POR_TEMA,
  PORTAL_TEMAS_TRE_SP_POR_NOITE,
  PORTAL_TEMAS_TSE_POR_NOITE,
  TEMAS_TRE_SP_P1A,
  TEMAS_TSE_P0,
  type TemaPortal,
} from "./seed-juris-portal-temas";

config({ path: resolve(process.cwd(), ".env.local") });
exigirGeminiApenasSeed("seed-juris-portal-diario");

const estadoPath = resolve(process.cwd(), "scripts/seed-juris-portal-estado.json");
const FONTE_TSE = "tse-portal";
const FONTE_TRE_SP = "tre-sp-portal";

type EstadoPortal = {
  temaIndice: number;
  treSpTemaIndice?: number;
  ultimaRodada: string | null;
  ultimoResultado?: {
    temas: number;
    inserts: number;
    skips: number;
    falhas: number;
    tseInserts?: number;
    treSpInserts?: number;
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
      treSpTemaIndice: Math.max(0, Number(j.treSpTemaIndice) || 0),
      ultimaRodada: j.ultimaRodada ?? null,
      ultimoResultado: j.ultimoResultado,
    };
  } catch {
    return { temaIndice: 0, treSpTemaIndice: 0, ultimaRodada: null };
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

function fatiaTemas(
  lista: TemaPortal[],
  indice: number,
  porNoite: number
): { fatia: TemaPortal[]; proximo: number; de: number; ate: number } {
  let de = indice;
  if (de >= lista.length) de = 0;
  const ate = Math.min(lista.length, de + porNoite);
  const fatia = lista.slice(de, ate);
  const proximo = ate >= lista.length ? 0 : ate;
  return { fatia, proximo, de, ate };
}

async function upsertJulgados(opts: {
  supabase: SupabaseClient;
  julgados: JulgadoScrape[];
  tema: TemaPortal;
  fonte: string;
  tribunalDefault: string;
  ementaOk: (t: string) => boolean;
}): Promise<{ inserts: number; skips: number; falhas: number }> {
  let inserts = 0;
  let skips = 0;
  let falhas = 0;

  for (const j of opts.julgados) {
    if (!opts.ementaOk(j.ementa)) {
      skips++;
      continue;
    }
    const titulo = j.titulo.trim();
    const texto = montarTexto(j.ementa, j.relator, j.data, j.url);
    const meta = metadadosJurisDoTexto(titulo, texto, j.tribunal);
    const area_tags = opts.tema.area_tags?.length
      ? opts.tema.area_tags
      : meta.area_tags;

    const { data: existente } = await opts.supabase
      .from("base_conhecimento")
      .select("id")
      .eq("titulo", titulo)
      .maybeSingle();

    if (existente?.id) {
      await opts.supabase
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

    const { error } = await opts.supabase.from("base_conhecimento").insert({
      titulo,
      categoria: "Jurisprudência" as const,
      texto,
      fonte: opts.fonte,
      status: "validado",
      tribunal: meta.tribunal || opts.tribunalDefault,
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

  return { inserts, skips, falhas };
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
  const tseRaw = process.env.PORTAL_TEMAS_TSE_POR_NOITE;
  const treRaw = process.env.PORTAL_TEMAS_TRE_SP_POR_NOITE;
  const tseN = Math.max(
    0,
    tseRaw != null && tseRaw !== ""
      ? Number(tseRaw)
      : PORTAL_TEMAS_TSE_POR_NOITE
  );
  const treN = Math.max(
    0,
    treRaw != null && treRaw !== ""
      ? Number(treRaw)
      : PORTAL_TEMAS_TRE_SP_POR_NOITE
  );
  if (tseN + treN < 1) {
    console.error("Defina ao menos 1 tema (TSE ou TRE-SP) por noite.");
    process.exit(1);
  }

  const tse = fatiaTemas(TEMAS_TSE_P0, estado.temaIndice, tseN);
  const tre = fatiaTemas(
    TEMAS_TRE_SP_P1A,
    estado.treSpTemaIndice ?? 0,
    treN
  );

  console.log(
    `[portal-diario] ${new Date().toISOString()} · TSE ${tse.de}..${tse.ate - 1} (${tse.fatia.length}) · TRE-SP ${tre.de}..${tre.ate - 1} (${tre.fatia.length}) · por tema até ${PORTAL_POR_TEMA}`
  );

  let inserts = 0;
  let skips = 0;
  let falhas = 0;
  let tseInserts = 0;
  let treSpInserts = 0;

  for (const tema of tse.fatia) {
    console.log(`\n→ TSE «${tema.q}»`);
    const r = await buscarTseJuris(tema.q, { limite: PORTAL_POR_TEMA });
    if (r.erro) {
      console.error(`  ERRO: ${r.erro}`);
      falhas++;
      continue;
    }
    if (r.aviso) console.log(`  aviso: ${r.aviso}`);
    console.log(
      `  pool API/filtrado: ${r.poolSize ?? "?"} / ${r.julgados.length} · ${r.duracaoMs}ms`
    );
    const u = await upsertJulgados({
      supabase,
      julgados: r.julgados,
      tema,
      fonte: FONTE_TSE,
      tribunalDefault: "TSE",
      ementaOk: ementaTseValida,
    });
    inserts += u.inserts;
    skips += u.skips;
    falhas += u.falhas;
    tseInserts += u.inserts;
    await new Promise((r) => setTimeout(r, 2500));
  }

  for (const tema of tre.fatia) {
    console.log(`\n→ TRE-SP «${tema.q}»`);
    const r = await buscarTreSpJuris(tema.q, { limite: PORTAL_POR_TEMA });
    if (r.erro) {
      console.error(`  ERRO: ${r.erro}`);
      falhas++;
      continue;
    }
    if (r.aviso) console.log(`  aviso: ${r.aviso}`);
    console.log(
      `  pool API/filtrado: ${r.poolSize ?? "?"} / ${r.julgados.length} · ${r.duracaoMs}ms`
    );
    const u = await upsertJulgados({
      supabase,
      julgados: r.julgados,
      tema,
      fonte: FONTE_TRE_SP,
      tribunalDefault: "TRE-SP",
      ementaOk: ementaTreValida,
    });
    inserts += u.inserts;
    skips += u.skips;
    falhas += u.falhas;
    treSpInserts += u.inserts;
    await new Promise((r) => setTimeout(r, 2500));
  }

  estado.temaIndice = tse.proximo;
  estado.treSpTemaIndice = tre.proximo;
  estado.ultimaRodada = hojeSp();
  estado.ultimoResultado = {
    temas: tse.fatia.length + tre.fatia.length,
    inserts,
    skips,
    falhas,
    tseInserts,
    treSpInserts,
  };
  gravarEstado(estado);

  console.log(
    `\nResumo: +${inserts} insert (TSE ${tseInserts} · TRE-SP ${treSpInserts}) · ${skips} skip · ${falhas} falha · próximo TSE=${estado.temaIndice} TRE-SP=${estado.treSpTemaIndice}`
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
      console.log(
        "Itens ficam sem vetor — retoma no smoke 03h ou npm run reindex:embeddings"
      );
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
