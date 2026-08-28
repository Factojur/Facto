import type { GestaoStore } from "@/lib/gestao/gestao-types";

export class GestaoLimiteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GestaoLimiteError";
  }
}

/** Tetos por escritório no plano gratuito — protegem disco Supabase Free. */
export const LIMITES_GESTAO_GRATUITO = {
  clientes: 300,
  processos: 300,
  prazos: 500,
  agenda: 300,
  atividades: 120,
  convitesHistorico: 40,
} as const;

const MS_30_DIAS = 30 * 24 * 60 * 60 * 1000;

export function compactarStoreGestao(store: GestaoStore): void {
  const agora = Date.now();

  if (store.atividades.length > LIMITES_GESTAO_GRATUITO.atividades) {
    store.atividades.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
    store.atividades = store.atividades.slice(0, LIMITES_GESTAO_GRATUITO.atividades);
  }

  store.convites = store.convites.filter((c) => {
    if (!c.usadoEm && new Date(c.expiraEm).getTime() > agora) return true;
    const ref = c.usadoEm ?? c.expiraEm;
    return agora - new Date(ref).getTime() < MS_30_DIAS;
  });
  if (store.convites.length > LIMITES_GESTAO_GRATUITO.convitesHistorico) {
    store.convites.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
    store.convites = store.convites.slice(0, LIMITES_GESTAO_GRATUITO.convitesHistorico);
  }
}

export function contagemEscritorio(store: GestaoStore, escritorioId: string) {
  return {
    clientes: store.clientes.filter((c) => c.escritorioId === escritorioId).length,
    processos: store.processos.filter((p) => p.escritorioId === escritorioId).length,
    prazos: store.prazos.filter((p) => p.escritorioId === escritorioId).length,
    agenda: store.agenda.filter((e) => e.escritorioId === escritorioId).length,
    atividades: store.atividades.filter((a) => a.escritorioId === escritorioId).length,
  };
}

export function limiteGestaoExcedido(
  tipo: keyof typeof LIMITES_GESTAO_GRATUITO,
  atual: number
): boolean {
  const teto = LIMITES_GESTAO_GRATUITO[tipo];
  if (teto == null) return false;
  return atual >= teto;
}
