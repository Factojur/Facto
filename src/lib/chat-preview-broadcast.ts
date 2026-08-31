/**
 * Espelha a pré-visualização da peça em outra janela (2º monitor).
 * BroadcastChannel + sessionStorage (fallback se o canal ainda não estiver aberto).
 */

export const CHAT_PREVIEW_CHANNEL = "facto-chat-preview-v1";
export const CHAT_PREVIEW_SNAP_KEY = "facto:chat-preview-snap";
export const CHAT_PREVIEW_POPPED_KEY = "facto:chat-preview-popped";

export type ChatPreviewSnap = {
  peca: string;
  pecaHtml: string;
  geradoPorIA: boolean;
  avisoPreview: string | null;
  titulo: string;
  previewLoading: boolean;
  ts: number;
};

export function publicarPreviewPeca(snap: ChatPreviewSnap): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CHAT_PREVIEW_SNAP_KEY, JSON.stringify(snap));
  } catch {
    /* quota */
  }
  try {
    const ch = new BroadcastChannel(CHAT_PREVIEW_CHANNEL);
    ch.postMessage(snap);
    ch.close();
  } catch {
    /* Safari privado / iframe */
  }
}

export function lerPreviewPecaSnap(): ChatPreviewSnap | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CHAT_PREVIEW_SNAP_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ChatPreviewSnap;
  } catch {
    return null;
  }
}

export const WORKSPACE_CHROME_KEY = "facto:workspace-chrome-oculto";
export const WORKSPACE_CHROME_DICA_KEY = "facto:workspace-chrome-dica-v1";

export function lerChromeOculto(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(WORKSPACE_CHROME_KEY) === "1";
  } catch {
    return false;
  }
}

export function gravarChromeOculto(oculto: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WORKSPACE_CHROME_KEY, oculto ? "1" : "0");
    window.dispatchEvent(
      new CustomEvent("facto-workspace-chrome", { detail: { oculto } })
    );
  } catch {
    /* ignore */
  }
}

export function lerDicaChromeDispensada(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(WORKSPACE_CHROME_DICA_KEY) === "1";
  } catch {
    return false;
  }
}

export function dispensarDicaChrome(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WORKSPACE_CHROME_DICA_KEY, "1");
  } catch {
    /* ignore */
  }
}
