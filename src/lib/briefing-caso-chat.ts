/**
 * Ponte Meus casos JEC → assistente (sem ?area= / sem formulário).
 * sessionStorage one-shot; o chat consome e apaga.
 */
import { HREF_CHAT_ASSISTENTE } from "@/lib/minuta-modulo";

export const BRIEFING_CASO_CHAT_KEY = "facto_briefing_caso_chat";

export type BriefingCasoChat = {
  origem: "jec_casos";
  titulo?: string;
  areaId?: string;
  especie?: string;
  numeroProcesso?: string;
  foro?: string;
  fatos?: string;
  fase?: string;
};

export function gravarBriefingCasoChat(b: BriefingCasoChat): void {
  try {
    sessionStorage.setItem(BRIEFING_CASO_CHAT_KEY, JSON.stringify(b));
  } catch {
    /* private mode / quota */
  }
}

/** Lê e remove — consumir uma vez. */
export function consumirBriefingCasoChat(): BriefingCasoChat | null {
  try {
    const raw = sessionStorage.getItem(BRIEFING_CASO_CHAT_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(BRIEFING_CASO_CHAT_KEY);
    const parsed = JSON.parse(raw) as BriefingCasoChat;
    if (!parsed || parsed.origem !== "jec_casos") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function hrefAssistenteAposBriefing(b: BriefingCasoChat): string {
  gravarBriefingCasoChat(b);
  return HREF_CHAT_ASSISTENTE;
}
