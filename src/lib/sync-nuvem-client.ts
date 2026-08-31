/**
 * Cliente browser: sync opcional minutas + memória na nuvem (LGPD opt-in).
 */

import type { ChatSessaoSnapshot } from "@/lib/chat-minuta-storage";
import type { AreaIdMinuta } from "@/lib/minuta-modulo";
import type { PerfilClienteSalvo } from "@/lib/memoria-cliente-local";
import type { SyncNuvemStatus } from "@/lib/sync-nuvem-lgpd";

export type MinutaHistoricoNuvem = {
  id: string;
  areaId: string;
  titulo: string;
  especiePeca: string | null;
  tipoAcao: string | null;
  foro: string | null;
  numeroProcesso: string | null;
  resumo: string | null;
  geradoPorIA: boolean;
  origem: "chat" | "formulario";
  sessaoId: string | null;
  criadoEm: string;
  atualizadoEm: string;
};

export type ChatSessaoNuvemResumo = {
  id: string;
  sessaoId: string;
  titulo: string;
  areaId: string;
  criadoEm: string;
  atualizadoEm: string;
  historicoPecas: unknown[];
};

export type ChatSessaoNuvemCompleta = ChatSessaoNuvemResumo & {
  snapshot: ChatSessaoSnapshot | null;
};

export type SalvarSessaoChatNuvemInput = {
  sessaoId: string;
  titulo: string;
  areaId: AreaIdMinuta;
  snapshot: ChatSessaoSnapshot;
  historicoPecas?: unknown[];
};

export type SalvarMinutaNuvemInput = {
  areaId: AreaIdMinuta;
  titulo: string;
  especiePeca?: string;
  tipoAcao?: string;
  foro?: string;
  numeroProcesso?: string;
  resumo?: string;
  pecaTexto?: string;
  pecaHtml?: string;
  geradoPorIA?: boolean;
  origem?: "chat" | "formulario";
  sessaoId?: string;
};

export async function fetchSyncNuvemStatus(): Promise<SyncNuvemStatus | null> {
  try {
    const res = await fetch("/api/sync-nuvem/opt-in", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as SyncNuvemStatus;
  } catch {
    return null;
  }
}

export async function registrarOptInSyncNuvem(
  confirmar: boolean
): Promise<{ ok: boolean; error?: string; status?: SyncNuvemStatus }> {
  try {
    const res = await fetch("/api/sync-nuvem/opt-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmar }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      optIn?: boolean;
      versao?: string | null;
      optInEm?: string | null;
    };
    if (!res.ok) {
      return { ok: false, error: data.error ?? "Não foi possível registrar." };
    }
    return {
      ok: true,
      status: {
        optIn: Boolean(data.optIn),
        versao: data.versao ?? null,
        optInEm: data.optInEm ?? null,
      },
    };
  } catch {
    return { ok: false, error: "Falha de rede." };
  }
}

export async function revogarOptInSyncNuvem(): Promise<boolean> {
  try {
    const res = await fetch("/api/sync-nuvem/opt-in", {
      method: "DELETE",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function listarMinutasNuvem(): Promise<MinutaHistoricoNuvem[]> {
  try {
    const res = await fetch("/api/minutas/historico", { cache: "no-store" });
    const data = (await res.json().catch(() => ({}))) as {
      minutas?: MinutaHistoricoNuvem[];
    };
    if (!res.ok || !Array.isArray(data.minutas)) return [];
    return data.minutas;
  } catch {
    return [];
  }
}

export async function salvarMinutaNuvem(
  input: SalvarMinutaNuvemInput
): Promise<{ ok: boolean; id?: string; error?: string }> {
  try {
    const res = await fetch("/api/minutas/historico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      id?: string;
      error?: string;
    };
    if (!res.ok) return { ok: false, error: data.error };
    return { ok: true, id: data.id };
  } catch {
    return { ok: false, error: "Falha de rede." };
  }
}

export async function excluirMinutaNuvem(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/minutas/historico?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sincronizarMemoriaClienteNuvem(
  perfil: PerfilClienteSalvo
): Promise<boolean> {
  try {
    const res = await fetch("/api/memoria-clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chave: perfil.chave,
        rotulo: perfil.rotulo,
        autores: perfil.autores,
        reus: perfil.reus,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function compactarSnapshotNuvem(snapshot: ChatSessaoSnapshot): ChatSessaoSnapshot {
  return {
    ...snapshot,
    mensagens: snapshot.mensagens.slice(-40),
    peca: snapshot.peca.slice(0, 80_000),
    pecaHtml: snapshot.pecaHtml.slice(0, 80_000),
  };
}

export async function listarSessoesChatNuvem(): Promise<ChatSessaoNuvemResumo[]> {
  try {
    const res = await fetch("/api/chat/sessoes", { cache: "no-store" });
    const data = (await res.json().catch(() => ({}))) as {
      sessoes?: ChatSessaoNuvemResumo[];
    };
    if (!res.ok || !Array.isArray(data.sessoes)) return [];
    return data.sessoes;
  } catch {
    return [];
  }
}

export async function obterSessaoChatNuvem(
  sessaoId: string
): Promise<ChatSessaoNuvemCompleta | null> {
  try {
    const res = await fetch(
      `/api/chat/sessoes?sessaoId=${encodeURIComponent(sessaoId)}`,
      { cache: "no-store" }
    );
    const data = (await res.json().catch(() => ({}))) as {
      sessao?: ChatSessaoNuvemCompleta;
      error?: string;
    };
    if (!res.ok || !data.sessao) return null;
    return data.sessao;
  } catch {
    return null;
  }
}

export async function salvarSessaoChatNuvem(
  input: SalvarSessaoChatNuvemInput
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/chat/sessoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessaoId: input.sessaoId,
        titulo: input.titulo,
        areaId: input.areaId,
        snapshot: compactarSnapshotNuvem(input.snapshot),
        historicoPecas: input.historicoPecas ?? [],
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
    };
    if (!res.ok) return { ok: false, error: data.error };
    return { ok: true };
  } catch {
    return { ok: false, error: "Falha de rede." };
  }
}

export async function excluirSessaoChatNuvem(sessaoId: string): Promise<boolean> {
  try {
    const res = await fetch(
      `/api/chat/sessoes?sessaoId=${encodeURIComponent(sessaoId)}`,
      { method: "DELETE" }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function puxarMemoriaClientesNuvem(): Promise<PerfilClienteSalvo[]> {
  try {
    const res = await fetch("/api/memoria-clientes", { cache: "no-store" });
    const data = (await res.json().catch(() => ({}))) as {
      perfis?: PerfilClienteSalvo[];
    };
    if (!res.ok || !Array.isArray(data.perfis)) return [];
    return data.perfis;
  } catch {
    return [];
  }
}
