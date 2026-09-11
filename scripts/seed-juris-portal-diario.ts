/**
 * Seed diário 02h — portais SJUR (TSE + TRE em **rodízio**).
 *
 * Cada noite: 2 temas TSE + 2 temas de **1 TRE** (UF da fila).
 * Noite seguinte: próximo TRE. Tema guardado por UF (cobertura nacional rápida).
 *
 * Gemini: só GEMINI_API_KEY_SEED (free) no reindex.
 * Uso: npm run seed:juris-portal-diario
 * Instalar: powershell -ExecutionPolicy Bypass -File scripts\instalar-tarefa-seed-portal.ps1
 */
import { config } from "dotenv";
import { spawnSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { metadadosJurisDoTexto } from "../src/lib/juris-metadados";
import { buscarTseJuris, ementaTseValida } from "../src/lib/scrapers/tse";
import {
  buscarTreJuris,
  ementaTreValida,
  siglaTre,
  type UfTre,
} from "../src/lib/scrapers/tre";
import type { JulgadoScrape } from "../src/lib/scrapers/types";
import { exigirGeminiApenasSeed } from "./lib/gemini-env-seed";
import {
  FILA_TRE_P1A,
  PORTAL_POR_TEMA,
  PORTAL_TEMAS_TRE_POR_NOITE,
  PORTAL_TEMAS_TSE_POR_NOITE,
  TEMAS_TRE_P1A,
  TEMAS_TSE_P0,
  type TemaPortal,
} from "./seed-juris-portal-temas";

config({ path: resolve(process.cwd(), ".env.local") });
exigirGeminiApenasSeed("seed-juris-portal-diario");

const estadoPath = resolve(process.cwd(), "scripts/seed-juris-portal-estado.json");
const FONTE_TSE = "tse-portal";

type EstadoPortal = {
  /** Índice no lote TSE (cicla). */
  temaIndice: number;
  /** Próxima UF da FILA_TRE_P1A a rodar nesta noite. */
  treUfIndice: number;
  /** Progresso de tema por UF (`sp`, `mg`, …). */
  treTemaPorUf: Partial<Record<UfTre, number>>;
  ultimaRodada: string | null;
  ultimoResultado?: {
    temas: number;
    inserts: number;
    skips: number;
    falhas: number;
    tseInserts?: number;
    treInserts?: number;
    treUf?: string;
    proximoTre?: string;
  };
};

type EstadoLegado = EstadoPortal & {
  treTemaIndice?: number;
  treSpTemaIndice?: number;
  treFilaConcluida?: boolean;
};

function hojeSp(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
}

function fonteTre(uf: UfTre): string {
  return `tre-${uf}-portal`;
}

function lerEstado(): EstadoPortal {
  try {
    const j = JSON.parse(readFileSync(estadoPath, "utf8")) as EstadoLegado;
    const porUf: Partial<Record<UfTre, number>> = {
      ...(j.treTemaPorUf || {}),
    };
    // Migração legado → progresso SP
    if (porUf.sp == null) {
      const legado =
        j.treTemaIndice != null
          ? Number(j.treTemaIndice)
          : Number(j.treSpTemaIndice) || 0;
      if (legado > 0) porUf.sp = legado;
    }
    return {
      temaIndice: Math.max(0, Number(j.temaIndice) || 0),
      treUfIndice: Math.max(0, Number(j.treUfIndice) || 0) % FILA_TRE_P1A.length,
      treTemaPorUf: porUf,
      ultimaRodada: j.ultimaRodada ?? null,
      ultimoResultado: j.ultimoResultado,
    };
  } catch {
    return {
      temaIndice: 0,
      treUfIndice: 0,
      treTemaPorUf: {},
      ultimaRodada: null,
    };
  }
}

function gravarEstado(e: EstadoPortal) {
  const out = {
    temaIndice: e.temaIndice,
    treUfIndice: e.treUfIndice,
    treTemaPorUf: e.treTemaPorUf,
    ultimaRodada: e.ultimaRodada,
    ultimoResultado: e.ultimoResultado,
  };
  writeFileSync(estadoPath, `${JSON.stringify(out, null, 2)}\n`, "utf8");
}

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

function fatiaTemas(
  lista: TemaPortal[],
  indice: number,
  porNoite: number
): {
  fatia: TemaPortal[];
  proximo: number;
  de: number;
  ate: number;
  fechouCiclo: boolean;
} {
  let de = indice;
  if (de >= lista.length) de = 0;
  const ate = Math.min(lista.length, de + porNoite);
  const fatia = lista.slice(de, ate);
  const fechouCiclo = ate >= lista.length;
  const proximo = fechouCiclo ? 0 : ate;
  return { fatia, proximo, de, ate, fechouCiclo };
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
  const treRaw =
    process.env.PORTAL_TEMAS_TRE_POR_NOITE ??
    process.env.PORTAL_TEMAS_TRE_SP_POR_NOITE;
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
      : PORTAL_TEMAS_TRE_POR_NOITE
  );

  if (tseN + treN < 1) {
    console.error("Nada a rodar (TSE=0 e TRE=0).");
    process.exit(0);
  }

  const tse = fatiaTemas(TEMAS_TSE_P0, estado.temaIndice, tseN);

  const ufIndice = estado.treUfIndice % FILA_TRE_P1A.length;
  const ufAtual = FILA_TRE_P1A[ufIndice]!;
  const sigla = siglaTre(ufAtual);
  const temaUf = Math.max(0, Number(estado.treTemaPorUf[ufAtual]) || 0);
  const tre =
    treN > 0
      ? fatiaTemas(TEMAS_TRE_P1A, temaUf, treN)
      : {
          fatia: [] as TemaPortal[],
          proximo: temaUf,
          de: 0,
          ate: 0,
          fechouCiclo: false,
        };

  const proximaUfIndice = (ufIndice + 1) % FILA_TRE_P1A.length;
  const proximaSigla = siglaTre(FILA_TRE_P1A[proximaUfIndice]!);

  console.log(
    `[portal-diario] ${new Date().toISOString()} · rodízio · TSE ${tse.de}..${Math.max(tse.de, tse.ate - 1)} (${tse.fatia.length}) · ${sigla} temas ${tre.de}..${Math.max(tre.de, tre.ate - 1)} (${tre.fatia.length}) · UF ${ufIndice + 1}/${FILA_TRE_P1A.length} · amanhã ${proximaSigla} · por tema até ${PORTAL_POR_TEMA}`
  );

  let inserts = 0;
  let skips = 0;
  let falhas = 0;
  let tseInserts = 0;
  let treInserts = 0;

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
    console.log(`\n→ ${sigla} «${tema.q}»`);
    const r = await buscarTreJuris(ufAtual, tema.q, {
      limite: PORTAL_POR_TEMA,
    });
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
      fonte: fonteTre(ufAtual),
      tribunalDefault: sigla,
      ementaOk: ementaTreValida,
    });
    inserts += u.inserts;
    skips += u.skips;
    falhas += u.falhas;
    treInserts += u.inserts;
    await new Promise((r) => setTimeout(r, 2500));
  }

  estado.temaIndice = tse.proximo;
  if (tre.fatia.length > 0) {
    estado.treTemaPorUf = {
      ...estado.treTemaPorUf,
      [ufAtual]: tre.proximo,
    };
    if (tre.fechouCiclo) {
      console.log(
        `\n✔ ${sigla}: ciclo de ${TEMAS_TRE_P1A.length} temas fechado — na próxima passagem reinicia (inflar contínuo).`
      );
    }
  }
  // Rodízio: sempre avança UF para a próxima noite
  estado.treUfIndice = proximaUfIndice;
  estado.ultimaRodada = hojeSp();
  estado.ultimoResultado = {
    temas: tse.fatia.length + tre.fatia.length,
    inserts,
    skips,
    falhas,
    tseInserts,
    treInserts,
    treUf: sigla,
    proximoTre: proximaSigla,
  };
  gravarEstado(estado);

  console.log(
    `\nResumo: +${inserts} insert (TSE ${tseInserts} · ${sigla} ${treInserts}) · ${skips} skip · ${falhas} falha · próximo TSE=${estado.temaIndice} · amanhã TRE ${proximaSigla} (tema ${estado.treTemaPorUf[FILA_TRE_P1A[proximaUfIndice]!] ?? 0})`
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
