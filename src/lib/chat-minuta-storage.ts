/**
 * Sessões do assistente de minuta — localStorage (LGPD: só neste navegador).
 * Peças geradas ficam ligadas à sessão para retomar conversa e histórico local.
 */

import type { AreaIdMinuta } from "@/lib/minuta-modulo";
import type {
  EstadoCasoChat,
  JurisCasoChat,
  MensagemChat,
} from "@/lib/chat-minuta";
import {
  estadoCasoChatVazio,
  normalizarEstadoCasoChat,
} from "@/lib/chat-minuta";
import {
  sanitizarAnexosMemoria,
  type AnexoMemoriaItem,
} from "@/lib/chat-anexos-memoria";

export const CHAT_SESSOES_KEY = "facto:chat-sessoes-v2";
export const CHAT_SESSAO_ATIVA_KEY = "facto:chat-sessao-ativa-v2";
export const CHAT_SYNC_OPT_IN_KEY = "facto:chat-sync-nuvem-opt-in-v1";
export const MAX_CHAT_SESSOES = 12;
const MAX_PECA_CHARS = 100_000;
const MAX_MENSAGENS = 80;

export type ChatPecaHistorico = {
  id: string;
  geradoEm: string;
  areaId: AreaIdMinuta;
  tipoAcao: string;
  especiePeca: string;
  geradoPorIA: boolean;
  resumo: string;
};

export type ChatSessaoSnapshot = {
  mensagens: MensagemChat[];
  estado: EstadoCasoChat;
  peca: string;
  pecaHtml: string;
  geradoPorIA: boolean;
  ajustesFeitos: number;
  avisoPreview: string | null;
  anexosMemoria?: AnexoMemoriaItem[];
};

export type ChatSessaoSalva = {
  id: string;
  titulo: string;
  criadoEm: string;
  atualizadoEm: string;
  areaId: AreaIdMinuta;
  snapshot: ChatSessaoSnapshot;
  historicoPecas: ChatPecaHistorico[];
};

function novoId(prefixo: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefixo}-${crypto.randomUUID()}`;
  }
  return `${prefixo}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function tituloDeSessao(estado: EstadoCasoChat): string {
  const base =
    estado.tipoAcao.trim() ||
    estado.fatos.replace(/\s+/g, " ").trim() ||
    "Nova conversa";
  return base.length > 72 ? `${base.slice(0, 72)}…` : base;
}

function truncar(texto: string, max: number): string {
  if (texto.length <= max) return texto;
  return `${texto.slice(0, max)}\n[…truncado para armazenamento local…]`;
}

function sanitizarJuris(juris: JurisCasoChat[]): JurisCasoChat[] {
  return juris.map((j) => ({
    ...j,
    arquivo: j.arquivo
      ? { ...j.arquivo, base64: "" }
      : j.arquivo ?? null,
  }));
}

export function sanitizarEstadoChat(estado: EstadoCasoChat): EstadoCasoChat {
  const normalizado = normalizarEstadoCasoChat(estado);
  return {
    ...normalizado,
    jurisCaso: sanitizarJuris(normalizado.jurisCaso),
  };
}

export function lerOptInSyncNuvemChat(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(CHAT_SYNC_OPT_IN_KEY) === "1";
  } catch {
    return false;
  }
}

export function salvarOptInSyncNuvemChat(optIn: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHAT_SYNC_OPT_IN_KEY, optIn ? "1" : "0");
  } catch {
    /* ignore */
  }
}

function lerLista(): ChatSessaoSalva[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHAT_SESSOES_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as ChatSessaoSalva[];
    if (!Array.isArray(arr)) return [];
    return arr.map((s) => ({
      ...s,
      snapshot: {
        ...s.snapshot,
        estado: sanitizarEstadoChat(s.snapshot?.estado),
        anexosMemoria: sanitizarAnexosMemoria(s.snapshot?.anexosMemoria),
      },
    }));
  } catch {
    return [];
  }
}

function gravarLista(lista: ChatSessaoSalva[]): void {
  if (typeof window === "undefined") return;
  const ordenada = [...lista].sort(
    (a, b) =>
      new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime()
  );
  localStorage.setItem(
    CHAT_SESSOES_KEY,
    JSON.stringify(ordenada.slice(0, MAX_CHAT_SESSOES))
  );
}

export function listarSessoesChat(): ChatSessaoSalva[] {
  return lerLista();
}

export function obterSessaoChat(id: string): ChatSessaoSalva | null {
  return lerLista().find((s) => s.id === id) ?? null;
}

export function lerSessaoAtivaId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(CHAT_SESSAO_ATIVA_KEY);
  } catch {
    return null;
  }
}

/** Sessão ativa com trabalho real (mensagem do usuário, fatos, resumo ou peça). */
export function sessaoChatAtivaTemTrabalho(): boolean {
  if (typeof window === "undefined") return false;
  const id = lerSessaoAtivaId();
  if (!id) return false;
  const sessao = obterSessaoChat(id);
  if (!sessao) return false;
  const snap = sessao.snapshot;
  const estado = snap?.estado;
  if (!estado) return false;
  return (
    snap.mensagens.some((m) => m.papel === "usuario") ||
    Boolean(estado.fatos?.trim()) ||
    Boolean(estado.resumoEntrada?.trim()) ||
    Boolean(snap.peca?.trim()) ||
    Boolean(snap.pecaHtml?.trim())
  );
}

export function definirSessaoAtivaId(id: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (id) localStorage.setItem(CHAT_SESSAO_ATIVA_KEY, id);
    else localStorage.removeItem(CHAT_SESSAO_ATIVA_KEY);
  } catch {
    /* ignore */
  }
}

export function excluirSessaoChat(id: string): void {
  const lista = lerLista().filter((s) => s.id !== id);
  gravarLista(lista);
  if (lerSessaoAtivaId() === id) definirSessaoAtivaId(null);
}

export type SalvarSessaoChatInput = {
  sessaoId?: string | null;
  snapshot: ChatSessaoSnapshot;
  novaPeca?: {
    areaId: AreaIdMinuta;
    tipoAcao: string;
    especiePeca: string;
    geradoPorIA: boolean;
    peca: string;
  } | null;
};

export function salvarSessaoChat(input: SalvarSessaoChatInput): ChatSessaoSalva {
  const agora = new Date().toISOString();
  const estado = sanitizarEstadoChat(input.snapshot.estado);
  const snapshot: ChatSessaoSnapshot = {
    ...input.snapshot,
    estado,
    mensagens: input.snapshot.mensagens.slice(-MAX_MENSAGENS),
    peca: truncar(input.snapshot.peca, MAX_PECA_CHARS),
    pecaHtml: truncar(input.snapshot.pecaHtml, MAX_PECA_CHARS),
  };

  const lista = lerLista();
  const id = input.sessaoId ?? novoId("chat");
  const existente = lista.find((s) => s.id === id);
  const historico = [...(existente?.historicoPecas ?? [])];

  if (input.novaPeca?.peca.trim()) {
    historico.unshift({
      id: novoId("peca"),
      geradoEm: agora,
      areaId: input.novaPeca.areaId,
      tipoAcao: input.novaPeca.tipoAcao,
      especiePeca: input.novaPeca.especiePeca,
      geradoPorIA: input.novaPeca.geradoPorIA,
      resumo: truncar(input.novaPeca.peca.replace(/\s+/g, " ").trim(), 160),
    });
  }

  const sessao: ChatSessaoSalva = {
    id,
    titulo: tituloDeSessao(estado),
    criadoEm: existente?.criadoEm ?? agora,
    atualizadoEm: agora,
    areaId: estado.areaId,
    snapshot,
    historicoPecas: historico.slice(0, 8),
  };

  const restante = lista.filter((s) => s.id !== id);
  gravarLista([sessao, ...restante]);
  definirSessaoAtivaId(id);
  return sessao;
}

export function criarSessaoChatVazia(areaId: AreaIdMinuta): ChatSessaoSalva {
  const id = novoId("chat");
  const agora = new Date().toISOString();
  const sessao: ChatSessaoSalva = {
    id,
    titulo: "Nova conversa",
    criadoEm: agora,
    atualizadoEm: agora,
    areaId,
    snapshot: {
      mensagens: [],
      estado: estadoCasoChatVazio(areaId),
      peca: "",
      pecaHtml: "",
      geradoPorIA: false,
      ajustesFeitos: 0,
      avisoPreview: null,
    },
    historicoPecas: [],
  };
  const lista = lerLista();
  gravarLista([sessao, ...lista]);
  definirSessaoAtivaId(id);
  return sessao;
}

/** Importa snapshot da nuvem para o navegador e torna a sessão ativa. */
export function importarSessaoChatRemota(input: {
  sessaoId: string;
  titulo?: string;
  areaId: AreaIdMinuta;
  snapshot: ChatSessaoSnapshot;
  historicoPecas?: ChatPecaHistorico[];
  criadoEm?: string;
}): ChatSessaoSalva {
  const agora = new Date().toISOString();
  const estado = sanitizarEstadoChat(input.snapshot.estado);
  const snapshot: ChatSessaoSnapshot = {
    ...input.snapshot,
    estado,
    mensagens: (input.snapshot.mensagens ?? []).slice(-MAX_MENSAGENS),
    peca: truncar(input.snapshot.peca ?? "", MAX_PECA_CHARS),
    pecaHtml: truncar(input.snapshot.pecaHtml ?? "", MAX_PECA_CHARS),
  };

  const lista = lerLista();
  const existente = lista.find((s) => s.id === input.sessaoId);
  const sessao: ChatSessaoSalva = {
    id: input.sessaoId,
    titulo:
      input.titulo?.trim() ||
      existente?.titulo ||
      tituloDeSessao(estado),
    criadoEm: input.criadoEm ?? existente?.criadoEm ?? agora,
    atualizadoEm: agora,
    areaId: input.areaId || estado.areaId,
    snapshot,
    historicoPecas: (
      input.historicoPecas ??
      existente?.historicoPecas ??
      []
    ).slice(0, 8),
  };

  gravarLista([sessao, ...lista.filter((s) => s.id !== sessao.id)]);
  definirSessaoAtivaId(sessao.id);
  return sessao;
}
