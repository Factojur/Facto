/**
 * Casos JEC (JEC-2) — persistência local (navegador).
 * Mesmo padrão dos rascunhos; migration Supabase fica opcional para sync futuro.
 */

import {
  FASES_CASO_JEC,
  type CasoJec,
  type EventoCasoJec,
  type FaseCasoJec,
} from "@/lib/jec-caso-types";

export const JEC_CASOS_KEY = "facto:jec-casos-v1";
export const MAX_CASOS_JEC = 40;

function novoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `caso-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function gravarLista(lista: CasoJec[]): void {
  localStorage.setItem(JEC_CASOS_KEY, JSON.stringify(lista));
}

export function listarCasosJec(): CasoJec[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(JEC_CASOS_KEY);
    if (!raw) return [];
    const lista = JSON.parse(raw) as CasoJec[];
    if (!Array.isArray(lista)) return [];
    return lista.sort(
      (a, b) =>
        new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime()
    );
  } catch {
    return [];
  }
}

export function obterCasoJec(id: string): CasoJec | null {
  return listarCasosJec().find((c) => c.id === id) ?? null;
}

export function criarCasoJec(opcoes: {
  titulo: string;
  numeroProcesso?: string;
  foro?: string;
  polo?: "autor" | "reu";
  resumoFatos?: string;
  faseAtual?: FaseCasoJec;
}): CasoJec {
  const agora = new Date().toISOString();
  const fase = opcoes.faseAtual ?? "pre_acao";
  const caso: CasoJec = {
    id: novoId(),
    criadoEm: agora,
    atualizadoEm: agora,
    titulo: opcoes.titulo.trim() || "Caso sem título",
    numeroProcesso: (opcoes.numeroProcesso ?? "").trim(),
    foro: (opcoes.foro ?? "").trim(),
    polo: opcoes.polo ?? "autor",
    faseAtual: fase,
    resumoFatos: (opcoes.resumoFatos ?? "").trim(),
    eventos: [
      {
        id: novoId(),
        fase,
        criadoEm: agora,
        nota: "Caso criado no FACTO.",
      },
    ],
  };

  const lista = [caso, ...listarCasosJec()].slice(0, MAX_CASOS_JEC);
  gravarLista(lista);
  return caso;
}

export function atualizarCasoJec(
  id: string,
  patch: Partial<
    Pick<
      CasoJec,
      | "titulo"
      | "numeroProcesso"
      | "foro"
      | "polo"
      | "faseAtual"
      | "resumoFatos"
      | "eventos"
    >
  >
): CasoJec | null {
  const lista = listarCasosJec();
  const idx = lista.findIndex((c) => c.id === id);
  if (idx < 0) return null;
  const atual = lista[idx]!;
  const atualizado: CasoJec = {
    ...atual,
    ...patch,
    atualizadoEm: new Date().toISOString(),
  };
  lista[idx] = atualizado;
  gravarLista(lista);
  return atualizado;
}

export function excluirCasoJec(id: string): void {
  gravarLista(listarCasosJec().filter((c) => c.id !== id));
}

export function adicionarEventoCaso(
  casoId: string,
  evento: Omit<EventoCasoJec, "id" | "criadoEm"> & {
    id?: string;
    criadoEm?: string;
  }
): CasoJec | null {
  const caso = obterCasoJec(casoId);
  if (!caso) return null;
  const agora = new Date().toISOString();
  const novo: EventoCasoJec = {
    id: evento.id ?? novoId(),
    criadoEm: evento.criadoEm ?? agora,
    fase: evento.fase,
    nota: evento.nota,
    especiePeca: evento.especiePeca,
    tituloPeca: evento.tituloPeca,
    pecaTexto: evento.pecaTexto,
    rascunhoId: evento.rascunhoId,
  };
  return atualizarCasoJec(casoId, {
    faseAtual: evento.fase,
    eventos: [...caso.eventos, novo],
  });
}

/** Avança para a próxima fase da sequência canônica e registra evento. */
export function avancarFaseCaso(
  casoId: string,
  nota?: string
): CasoJec | null {
  const caso = obterCasoJec(casoId);
  if (!caso) return null;
  const ordemAtual = FASES_CASO_JEC.find((f) => f.id === caso.faseAtual)?.ordem ?? 0;
  const proxima = FASES_CASO_JEC.find((f) => f.ordem === ordemAtual + 1);
  if (!proxima) return caso;
  return adicionarEventoCaso(casoId, {
    fase: proxima.id,
    nota: nota?.trim() || `Avanço para: ${proxima.rotulo}.`,
  });
}

/** Define fase manualmente (pulo / retorno) com evento. */
export function definirFaseCaso(
  casoId: string,
  fase: FaseCasoJec,
  nota?: string
): CasoJec | null {
  const meta = FASES_CASO_JEC.find((f) => f.id === fase);
  return adicionarEventoCaso(casoId, {
    fase,
    nota: nota?.trim() || `Fase definida: ${meta?.rotulo ?? fase}.`,
  });
}

export function vincularPecaAoCaso(opcoes: {
  casoId: string;
  fase: FaseCasoJec;
  especiePeca?: string | null;
  tituloPeca?: string | null;
  pecaTexto?: string | null;
  rascunhoId?: string | null;
  nota?: string;
}): CasoJec | null {
  return adicionarEventoCaso(opcoes.casoId, {
    fase: opcoes.fase,
    especiePeca: opcoes.especiePeca,
    tituloPeca: opcoes.tituloPeca,
    pecaTexto: opcoes.pecaTexto
      ? opcoes.pecaTexto.slice(0, 120_000)
      : null,
    rascunhoId: opcoes.rascunhoId,
    nota:
      opcoes.nota?.trim() ||
      `Peça vinculada${opcoes.tituloPeca ? `: ${opcoes.tituloPeca}` : ""}.`,
  });
}
