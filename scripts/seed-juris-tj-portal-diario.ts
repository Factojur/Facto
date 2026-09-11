/**
 * Seed P2b — TJs e-SAJ (fora da Juris.ai).
 * Cadência: a cada 3 h · 1 TJ (ou até 4 se falhar) · 2 temas · ~3 anos · paygo tj*-portal.
 *
 * Uso: npm run seed:juris-tj-portal-diario
 * Instalar: powershell -ExecutionPolicy Bypass -File scripts\instalar-tarefa-seed-tj-portal.ps1
 */
import { config } from "dotenv";
import { spawnSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { metadadosJurisDoTexto } from "../src/lib/juris-metadados";
import {
  buscarEsajTjJuris,
  ementaTjEsajValida,
  fonteTjPortal,
  siglaTj,
  type UfTjEsaj,
} from "../src/lib/scrapers/esaj-tj";
import { buscarTjbaJuris, ementaTjbaValida } from "../src/lib/scrapers/tjba";
import { buscarTjrnJuris, ementaTjrnValida } from "../src/lib/scrapers/tjrn";
import { buscarTjpeJuris, ementaTjpeValida } from "../src/lib/scrapers/tjpe";
import { buscarTjesJuris, ementaTjesValida } from "../src/lib/scrapers/tjes";
import { ementaJurisPortalValida } from "../src/lib/scrapers/validar-ementa";
import type { JulgadoScrape } from "../src/lib/scrapers/types";
import type { TemaPortal } from "./seed-juris-portal-temas";
import {
  FILA_TJ_P2B_ESAJ,
  TEMAS_TJ_P2B,
  TJ_PORTAL_ANOS,
  TJ_PORTAL_MAX_UF_POR_RODADA,
  TJ_PORTAL_POR_TEMA,
  TJ_PORTAL_TEMAS_POR_RODADA,
} from "./seed-juris-tj-portal-temas";

config({ path: resolve(process.cwd(), ".env.local") });

const estadoPath = resolve(
  process.cwd(),
  "scripts/seed-juris-tj-portal-estado.json"
);

type EstadoTj = {
  tjUfIndice: number;
  tjTemaPorUf: Partial<Record<UfTjEsaj, number>>;
  falhasPorUf?: Partial<Record<UfTjEsaj, number>>;
  ultimaRodada: string | null;
  ultimoResultado?: {
    inserts: number;
    skips: number;
    falhas: number;
    tjUf: string;
    proximoTj: string;
    tentativas?: string[];
  };
};

function agoraSp(): string {
  return new Date().toLocaleString("sv-SE", {
    timeZone: "America/Sao_Paulo",
  });
}

function lerEstado(): EstadoTj {
  try {
    const j = JSON.parse(readFileSync(estadoPath, "utf8")) as EstadoTj;
    return {
      tjUfIndice:
        Math.max(0, Number(j.tjUfIndice) || 0) % FILA_TJ_P2B_ESAJ.length,
      tjTemaPorUf: j.tjTemaPorUf || {},
      falhasPorUf: j.falhasPorUf || {},
      ultimaRodada: j.ultimaRodada ?? null,
      ultimoResultado: j.ultimoResultado,
    };
  } catch {
    return {
      tjUfIndice: 0,
      tjTemaPorUf: {},
      falhasPorUf: {},
      ultimaRodada: null,
    };
  }
}

function gravarEstado(e: EstadoTj) {
  writeFileSync(estadoPath, `${JSON.stringify(e, null, 2)}\n`, "utf8");
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
  porRodada: number
): { fatia: TemaPortal[]; proximo: number; de: number; ate: number } {
  let de = indice;
  if (de >= lista.length) de = 0;
  const ate = Math.min(lista.length, de + porRodada);
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
}): Promise<{ inserts: number; skips: number; falhas: number }> {
  let inserts = 0;
  let skips = 0;
  let falhas = 0;

  for (const j of opts.julgados) {
    if (!ementaJurisPortalValida(j.ementa)) {
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

async function rodarUf(opts: {
  supabase: SupabaseClient;
  uf: UfTjEsaj;
  temaIndice: number;
}): Promise<{
  inserts: number;
  skips: number;
  falhas: number;
  temaProximo: number;
  temaDe: number;
  temaAte: number;
}> {
  const sigla = siglaTj(opts.uf);
  const fonte = fonteTjPortal(opts.uf);
  const fatia = fatiaTemas(
    TEMAS_TJ_P2B,
    opts.temaIndice,
    TJ_PORTAL_TEMAS_POR_RODADA
  );

  console.log(
    `[tj-portal] ${agoraSp()} · ${sigla} temas ${fatia.de}..${Math.max(fatia.de, fatia.ate - 1)} (${fatia.fatia.length}) · ${TJ_PORTAL_ANOS} anos · por tema até ${TJ_PORTAL_POR_TEMA}`
  );

  let inserts = 0;
  let skips = 0;
  let falhas = 0;

  for (const tema of fatia.fatia) {
    console.log(`\n→ ${sigla} «${tema.q}»`);
    const r =
      opts.uf === "ba"
        ? await buscarTjbaJuris(tema.q, {
            limite: TJ_PORTAL_POR_TEMA,
            anos: TJ_PORTAL_ANOS,
          })
        : opts.uf === "rn"
          ? await buscarTjrnJuris(tema.q, {
              limite: TJ_PORTAL_POR_TEMA,
              anos: TJ_PORTAL_ANOS,
            })
          : opts.uf === "pe"
            ? await buscarTjpeJuris(tema.q, {
                limite: TJ_PORTAL_POR_TEMA,
                anos: TJ_PORTAL_ANOS,
              })
            : opts.uf === "es"
              ? await buscarTjesJuris(tema.q, {
                  limite: TJ_PORTAL_POR_TEMA,
                  anos: TJ_PORTAL_ANOS,
                })
              : await buscarEsajTjJuris(opts.uf, tema.q, {
                  limite: TJ_PORTAL_POR_TEMA,
                  anos: TJ_PORTAL_ANOS,
                });
    if (r.erro) {
      console.error(`  ERRO: ${r.erro}`);
      falhas++;
      continue;
    }
    if (r.aviso && !r.julgados.length) {
      console.warn(`  ${r.aviso}`);
    }
    const u = await upsertJulgados({
      supabase: opts.supabase,
      julgados: r.julgados,
      tema,
      fonte,
      tribunalDefault: sigla,
    });
    inserts += u.inserts;
    skips += u.skips;
    falhas += u.falhas;
  }

  return {
    inserts,
    skips,
    falhas,
    temaProximo: inserts > 0 || skips > 0 ? fatia.proximo : opts.temaIndice,
    temaDe: fatia.de,
    temaAte: fatia.ate,
  };
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  });
  const estado = lerEstado();
  const falhasPorUf = { ...(estado.falhasPorUf || {}) };
  const tentativas: string[] = [];

  let ufIndice = estado.tjUfIndice % FILA_TJ_P2B_ESAJ.length;
  let totalInserts = 0;
  let totalSkips = 0;
  let totalFalhas = 0;
  let ufOk: UfTjEsaj | null = null;

  for (let t = 0; t < TJ_PORTAL_MAX_UF_POR_RODADA; t++) {
    const uf = FILA_TJ_P2B_ESAJ[ufIndice]!;
    const sigla = siglaTj(uf);
    tentativas.push(sigla);

    const r = await rodarUf({
      supabase,
      uf,
      temaIndice: estado.tjTemaPorUf[uf] ?? 0,
    });

    totalInserts += r.inserts;
    totalSkips += r.skips;
    totalFalhas += r.falhas;
    estado.tjTemaPorUf[uf] = r.temaProximo;

    const proximaUfIndice = (ufIndice + 1) % FILA_TJ_P2B_ESAJ.length;

    if (r.inserts === 0 && (r.falhas > 0 || r.skips === 0)) {
      falhasPorUf[uf] = (falhasPorUf[uf] ?? 0) + 1;
      console.warn(
        `  → ${sigla} sem insert — substitui pelo próximo (falhas acumuladas=${falhasPorUf[uf]})`
      );
      ufIndice = proximaUfIndice;
      continue;
    }

    delete falhasPorUf[uf];
    ufOk = uf;
    ufIndice = proximaUfIndice;
    break;
  }

  const proximaSigla = siglaTj(FILA_TJ_P2B_ESAJ[ufIndice]!);
  estado.tjUfIndice = ufIndice;
  estado.falhasPorUf = falhasPorUf;
  estado.ultimaRodada = agoraSp();
  estado.ultimoResultado = {
    inserts: totalInserts,
    skips: totalSkips,
    falhas: totalFalhas,
    tjUf: ufOk ? siglaTj(ufOk) : tentativas[tentativas.length - 1]!,
    proximoTj: proximaSigla,
    tentativas,
  };
  gravarEstado(estado);

  console.log(
    `\nResumo: +${totalInserts} insert · ${totalSkips} skip · ${totalFalhas} falha · tentou [${tentativas.join(", ")}] · próximo ${proximaSigla}`
  );

  if (totalInserts > 0) {
    console.log("Reindex paygo (só fonte tj*-portal)…");
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
    if (reindex.status && reindex.status !== 0) {
      console.warn(
        "Reindex paygo incompleto — itens sem vetor; retoma na próxima rodada ou npm run reindex:embeddings:paygo-portal-tj"
      );
    }
  }

  process.exit(totalInserts === 0 && totalFalhas > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
