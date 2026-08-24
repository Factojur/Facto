/**
 * Seed diário 03h — súmulas / OJs / PNs (TST, TSE, TJSP…) até zerar a fila.
 *
 * Estado: scripts/seed-sumulas-estado.json
 * Uso: npm run seed:sumulas-diario
 * Instalar: powershell -ExecutionPolicy Bypass -File scripts\instalar-tarefa-seed-sumulas.ps1
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { config } from "dotenv";
import { spawnSync } from "child_process";
import {
  ESTADO_SUMULAS_INICIAL,
  FILA_SUMULAS_DIARIO,
  type EstadoSumulasDiario,
  type FaseSumulaId,
} from "./seed-sumulas-diario-fila";
import {
  buscarTsePortal,
  carregarLivroTst,
  clienteSupabase,
  itensCodigoTstTse,
  itensOjSdi1,
  itensOjSdi1t,
  itensOjSdi2,
  itensOjSdc,
  itensOjTp,
  itensPn,
  itensTjspArquivo,
  upsertItens,
  type ItemSumulaSeed,
} from "./seed-sumulas-diario-handlers";

config({ path: resolve(process.cwd(), ".env.local") });

const estadoPath = resolve(process.cwd(), "scripts/seed-sumulas-estado.json");

function hojeSp(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
}

function lerEstado(): EstadoSumulasDiario {
  try {
    const j = JSON.parse(readFileSync(estadoPath, "utf8")) as EstadoSumulasDiario;
    return {
      faseIndice: Math.max(0, Number(j.faseIndice) || 0),
      offset: Math.max(0, Number(j.offset) || 0),
      concluido: Boolean(j.concluido),
      ultimaRodada: j.ultimaRodada ?? null,
      ultimoResultado: j.ultimoResultado,
    };
  } catch {
    return { ...ESTADO_SUMULAS_INICIAL };
  }
}

function gravarEstado(e: EstadoSumulasDiario) {
  writeFileSync(estadoPath, `${JSON.stringify(e, null, 2)}\n`, "utf8");
}

function fatia(itens: ItemSumulaSeed[], offset: number, porDia: number) {
  return {
    lote: itens.slice(offset, offset + porDia),
    total: itens.length,
  };
}

async function itensDaFase(id: FaseSumulaId): Promise<ItemSumulaSeed[]> {
  switch (id) {
    case "upsert_codigo_tst_tse":
      return itensCodigoTstTse();
    case "tst_oj_sdi1":
      return itensOjSdi1(carregarLivroTst());
    case "tst_oj_sdi1t":
      return itensOjSdi1t(carregarLivroTst());
    case "tst_oj_sdi2":
      return itensOjSdi2(carregarLivroTst());
    case "tst_oj_tp":
      return itensOjTp(carregarLivroTst());
    case "tst_oj_sdc":
      return itensOjSdc(carregarLivroTst());
    case "tst_pn":
      return itensPn(carregarLivroTst());
    case "tse_portal":
      return buscarTsePortal();
    case "tjsp_arquivo":
      return itensTjspArquivo();
    case "tre_skip":
    case "reindex_embeddings":
      return [];
    default:
      return [];
  }
}

function rodarReindexEmbeddings(): { ok: boolean; zeroPorQuota: boolean } {
  console.log("Reindex embeddings (só sem vetor)…");
  const r = spawnSync(
    "npx",
    ["--yes", "tsx", "scripts/reindex-embeddings.ts"],
    { cwd: process.cwd(), encoding: "utf8", shell: true, maxBuffer: 40 * 1024 * 1024 }
  );
  if (r.stdout) console.log(r.stdout);
  if (r.stderr) console.error(r.stderr);
  const texto = `${r.stdout ?? ""}\n${r.stderr ?? ""}`;
  const zeroPorQuota =
    /"indexados":\s*0/.test(texto) && /"falhas":\s*[1-9]/.test(texto);
  if (zeroPorQuota) {
    console.log(
      "Reindex com falha de quota Gemini — itens ficam sem vetor; retoma na próxima noite / fase final."
    );
  }
  return { ok: (r.status ?? 1) === 0, zeroPorQuota };
}

async function main() {
  const estado = lerEstado();
  console.log(
    `[sumulas-diario] ${new Date().toISOString()} fase=${estado.faseIndice} offset=${estado.offset} concluido=${estado.concluido}`
  );

  if (estado.concluido || estado.faseIndice >= FILA_SUMULAS_DIARIO.length) {
    console.log("Fila de súmulas concluída. Nada a fazer.");
    estado.concluido = true;
    estado.ultimaRodada = hojeSp();
    gravarEstado(estado);
    process.exit(0);
  }

  const fase = FILA_SUMULAS_DIARIO[estado.faseIndice];
  console.log(`Fase: ${fase.id} — ${fase.rotulo} (até ${fase.porDia}/noite)`);

  if (fase.id === "tre_skip") {
    console.log(
      "TRE: tribunais regionais eleitorais não editam súmula nacional. Lastro eleitoral = TSE (já na fila)."
    );
    estado.faseIndice += 1;
    estado.offset = 0;
    estado.ultimaRodada = hojeSp();
    estado.ultimoResultado = {
      fase: fase.id,
      ok: 0,
      falha: 0,
      avanco: 1,
    };
    if (estado.faseIndice >= FILA_SUMULAS_DIARIO.length) {
      estado.concluido = true;
    }
    gravarEstado(estado);
    process.exit(0);
  }

  if (fase.id === "reindex_embeddings") {
    const { ok: saiuOk, zeroPorQuota } = rodarReindexEmbeddings();
    if (saiuOk && !zeroPorQuota) {
      estado.faseIndice += 1;
      estado.offset = 0;
      if (estado.faseIndice >= FILA_SUMULAS_DIARIO.length) {
        estado.concluido = true;
        console.log("Fila de súmulas finalizada (com reindex).");
      }
    } else {
      console.log(
        "Reindex incompleto (quota/API). Mantém fase reindex para a próxima noite."
      );
    }
    estado.ultimaRodada = hojeSp();
    estado.ultimoResultado = {
      fase: fase.id,
      ok: saiuOk && !zeroPorQuota ? 1 : 0,
      falha: zeroPorQuota ? 1 : 0,
      avanco: saiuOk && !zeroPorQuota ? 1 : 0,
    };
    gravarEstado(estado);
    process.exit(saiuOk ? 0 : 1);
  }

  const supabase = clienteSupabase();
  const todos = await itensDaFase(fase.id);
  const { lote, total } = fatia(todos, estado.offset, fase.porDia);
  console.log(
    `Itens na fase: ${total} · processando ${lote.length} (offset ${estado.offset})`
  );

  if (total === 0 || lote.length === 0) {
    console.log("Nada nesta fatia — avança fase.");
    estado.faseIndice += 1;
    estado.offset = 0;
    estado.ultimaRodada = hojeSp();
    estado.ultimoResultado = { fase: fase.id, ok: 0, falha: 0, avanco: 1 };
    if (estado.faseIndice >= FILA_SUMULAS_DIARIO.length) {
      estado.concluido = true;
    }
    gravarEstado(estado);
    process.exit(0);
  }

  const { ok, falha } = await upsertItens(supabase, lote);
  const novoOffset = estado.offset + lote.length;
  if (novoOffset >= total) {
    console.log(`Fase ${fase.id} completa (${total} itens).`);
    estado.faseIndice += 1;
    estado.offset = 0;
  } else {
    estado.offset = novoOffset;
    console.log(`Próximo offset: ${estado.offset}/${total}`);
  }

  estado.ultimaRodada = hojeSp();
  estado.ultimoResultado = {
    fase: fase.id,
    ok,
    falha,
    avanco: lote.length,
  };
  if (estado.faseIndice >= FILA_SUMULAS_DIARIO.length) {
    estado.concluido = true;
  }
  gravarEstado(estado);
  console.log(`Concluído noite: ${ok} ok, ${falha} falha(s).`);

  // Como o juris diário: embeddings na mesma noite (só itens sem vetor).
  rodarReindexEmbeddings();

  if (falha) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
