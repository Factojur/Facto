/**
 * Memória local de qualificação por cliente (localStorage).
 * Reaproveita dados de partes já preenchidas em casos anteriores no mesmo navegador.
 */

import type { AutorValue } from "@/lib/autor-types";
import type { ReuValue } from "@/lib/reu-types";
import type { PoloAdvocacia } from "@/lib/polo-advocacia";

const CHAVE = "facto-memoria-clientes-v1";
const MAX_PERFIS = 40;

export type PerfilClienteSalvo = {
  chave: string;
  rotulo: string;
  autores: AutorValue[];
  reus: ReuValue[];
  atualizadoEm: number;
};

function normalizarChave(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function ler(): PerfilClienteSalvo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHAVE);
    if (!raw) return [];
    const arr = JSON.parse(raw) as PerfilClienteSalvo[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function gravar(lista: PerfilClienteSalvo[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    CHAVE,
    JSON.stringify(lista.slice(0, MAX_PERFIS))
  );
}

/** Nome principal conforme o polo em que o advogado atua. */
export function nomeClientePrincipal(
  autores: AutorValue[],
  reus: ReuValue[],
  polo: PoloAdvocacia
): string {
  if (polo === "passivo") {
    return (reus[0]?.nomeCompleto ?? autores[0]?.nomeCompleto ?? "").trim();
  }
  return (autores[0]?.nomeCompleto ?? reus[0]?.nomeCompleto ?? "").trim();
}

export function buscarPerfilCliente(nome: string): PerfilClienteSalvo | null {
  const chave = normalizarChave(nome);
  if (chave.length < 3) return null;
  return ler().find((p) => p.chave === chave) ?? null;
}

export function listarPerfisRecentes(limit = 5): PerfilClienteSalvo[] {
  return ler()
    .sort((a, b) => b.atualizadoEm - a.atualizadoEm)
    .slice(0, limit);
}

export function salvarPerfilCliente(params: {
  autores: AutorValue[];
  reus: ReuValue[];
  polo: PoloAdvocacia;
}): PerfilClienteSalvo | null {
  const rotulo = nomeClientePrincipal(
    params.autores,
    params.reus,
    params.polo
  );
  const chave = normalizarChave(rotulo);
  if (chave.length < 3) return null;
  if (!params.autores.some((a) => a.nomeCompleto.trim())) return null;

  const perfil: PerfilClienteSalvo = {
    chave,
    rotulo,
    autores: params.autores,
    reus: params.reus,
    atualizadoEm: Date.now(),
  };
  const resto = ler().filter((p) => p.chave !== chave);
  gravar([perfil, ...resto]);
  return perfil;
}
