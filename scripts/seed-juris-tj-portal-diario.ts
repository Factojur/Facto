/**
 * Seed P2b — TJs e-SAJ (fora da Juris.ai).
 * Cadência: a cada 3 h · 1 TJ · 2 temas · julgados ~3 anos · reindex paygo só tj*-portal.
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
import type { JulgadoScrape } from "../src/lib/scrapers/types";
import type { TemaPortal } from "./seed-juris-portal-temas";
import {
  FILA_TJ_P2B_ESAJ,
  TEMAS_TJ_P2B,
  TJ_PORTAL_ANOS,
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
  ultimaRodada: string | null;
  ultimoResultado?: {
    inserts: number;
    skips: number;
    falhas: number;
    tjUf: string;
    proximoTj: string;
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
      ultimaRodada: j.ultimaRodada ?? null,
      ultimoResultado: j.ultimoResultado,
    };
  } catch {
    return { tjUfIndice: 0, tjTemaPorUf: {}, ultimaRodada: null };
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
    if (!ementaTjEsajValida(j.ementa)) {
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
  const ufIndice = estado.tjUfIndice % FILA_TJ_P2B_ESAJ.length;
  const uf = FILA_TJ_P2B_ESAJ[ufIndice]!;
  const sigla = siglaTj(uf);
  const fonte = fonteTjPortal(uf);
  const temaUf = estado.tjTemaPorUf[uf] ?? 0;
  const fatia = fatiaTemas(
    TEMAS_TJ_P2B,
    temaUf,
    TJ_PORTAL_TEMAS_POR_RODADA
  );
  const proximaUfIndice = (ufIndice + 1) % FILA_TJ_P2B_ESAJ.length;
  const proximaSigla = siglaTj(FILA_TJ_P2B_ESAJ[proximaUfIndice]!);

  console.log(
    `[tj-portal] ${agoraSp()} · ${sigla} temas ${fatia.de}..${Math.max(fatia.de, fatia.ate - 1)} (${fatia.fatia.length}) · ${TJ_PORTAL_ANOS} anos · por tema até ${TJ_PORTAL_POR_TEMA} · próximo ${proximaSigla}`
  );

  let inserts = 0;
  let skips = 0;
  let falhas = 0;

  for (const tema of fatia.fatia) {
    console.log(`\n→ ${sigla} «${tema.q}»`);
    const r = await buscarEsajTjJuris(uf, tema.q, {
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
      supabase,
      julgados: r.julgados,
      tema,
      fonte,
      tribunalDefault: sigla,
    });
    inserts += u.inserts;
    skips += u.skips;
    falhas += u.falhas;
  }

  // Só avança UF/tema se houve insert ou skip útil (hit no portal).
  // Falha total (captcha/WAF/rede) → mantém o mesmo TJ para a próxima rodada.
  const avançou = inserts > 0 || skips > 0;
  if (avançou) {
    estado.tjTemaPorUf[uf] = fatia.proximo;
    estado.tjUfIndice = proximaUfIndice;
  }
  estado.ultimaRodada = agoraSp();
  estado.ultimoResultado = {
    inserts,
    skips,
    falhas,
    tjUf: sigla,
    proximoTj: avançou ? proximaSigla : sigla,
  };
  gravarEstado(estado);

  console.log(
    `\nResumo: +${inserts} insert · ${skips} skip · ${falhas} falha · próximo ${avançou ? proximaSigla : `${sigla} (retry — sem avanço)`}`
  );

  if (inserts > 0) {
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

  process.exit(falhas && !inserts ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
