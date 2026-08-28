import { mkdir, readFile, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import type { GestaoStore } from "@/lib/gestao/gestao-types";
import { processoGestaoPadrao } from "@/lib/gestao/gestao-types";

function resolveStoreFile(): string {
  if (process.env.GESTAO_STORE_DIR?.trim()) {
    return path.join(process.env.GESTAO_STORE_DIR.trim(), "store.json");
  }
  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), "facto-gestao", "store.json");
  }
  return path.join(process.cwd(), ".data", "gestao", "store.json");
}

const STORE_FILE = resolveStoreFile();
const STORE_DIR = path.dirname(STORE_FILE);

let cacheStore: GestaoStore | null = null;
let writeQueue: Promise<unknown> = Promise.resolve();

function storeVazio(): GestaoStore {
  return {
    escritorios: [],
    membros: [],
    convites: [],
    clientes: [],
    processos: [],
    prazos: [],
    agenda: [],
    atividades: [],
  };
}

function normalizarGestaoStore(raw: GestaoStore): GestaoStore {
  const clientes = raw.clientes ?? [];
  const atividades = raw.atividades ?? [];
  const processos = (raw.processos ?? []).map((p) =>
    processoGestaoPadrao({
      ...p,
      clienteId: p.clienteId ?? null,
      vara: p.vara ?? "",
      comarca: p.comarca ?? "",
      tribunal: p.tribunal ?? "",
      valorCausaCentavos: p.valorCausaCentavos ?? null,
      poloCliente: p.poloCliente ?? null,
      honorarioTipo: p.honorarioTipo ?? "a_definir",
      honorarioValorCentavos: p.honorarioValorCentavos ?? null,
      honorarioPercentual: p.honorarioPercentual ?? null,
      honorarioStatus: p.honorarioStatus ?? "a_definir",
      honorarioObservacao: p.honorarioObservacao ?? "",
      notas: p.notas ?? "",
    })
  );
  return {
    ...raw,
    clientes,
    atividades,
    processos,
  };
}

async function lerStoreDoDisco(): Promise<GestaoStore> {
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as GestaoStore;
    return normalizarGestaoStore(parsed);
  } catch {
    return storeVazio();
  }
}

export async function lerGestaoStore(): Promise<GestaoStore> {
  if (cacheStore) return normalizarGestaoStore(cacheStore);
  cacheStore = await lerStoreDoDisco();
  return cacheStore;
}

export async function salvarGestaoStore(store: GestaoStore): Promise<void> {
  await mkdir(STORE_DIR, { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
  cacheStore = store;
}

export async function alterarGestaoStore<T>(
  fn: (store: GestaoStore) => T
): Promise<T> {
  const run = async (): Promise<T> => {
    const store = await lerStoreDoDisco();
    const result = fn(store);
    await salvarGestaoStore(store);
    return result;
  };
  const next = writeQueue.then(run, run);
  writeQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

export function novoId(): string {
  return crypto.randomUUID();
}

export function tokenConvite(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 24);
}

export function codigoConvite(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
