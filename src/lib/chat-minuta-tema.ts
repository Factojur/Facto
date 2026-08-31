/** Tema visual do assistente de minuta — preferência local do usuário. */

export type ChatMinutaTema = "papel" | "suave";

const STORAGE_KEY = "facto-chat-minuta-tema";

export function lerChatMinutaTema(): ChatMinutaTema {
  if (typeof window === "undefined") return "papel";
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "suave" ? "suave" : "papel";
  } catch {
    return "papel";
  }
}

export function gravarChatMinutaTema(tema: ChatMinutaTema) {
  try {
    window.localStorage.setItem(STORAGE_KEY, tema);
  } catch {
    /* ignore */
  }
}

export function alternarChatMinutaTema(atual: ChatMinutaTema): ChatMinutaTema {
  const prox = atual === "papel" ? "suave" : "papel";
  gravarChatMinutaTema(prox);
  return prox;
}

/** Classes Tailwind por tema — idle (sem peça) conversa com a marca; com peça = papel. */
export type ChatMinutaTemaClasses = {
  label: string;
  dica: string;
  shell: string;
  chatCol: string;
  chatScroll: string;
  chatComposer: string;
  previewCol: string;
  previewHeader: string;
  previewBody: string;
  previewEmpty: string;
  previewIdleCol: string;
  previewIdleHeader: string;
  previewIdleBody: string;
  previewIdleEmpty: string;
  msgUsuario: string;
  msgAssistente: string;
  msgSistema: string;
  input: string;
};

/** Visual integrado à home — vidro escuro na paleta FACTO. */
export const CHAT_WORKSPACE_TEMA: ChatMinutaTemaClasses = {
  label: "Portal",
  dica: "Integrado à home FACTO",
  shell: "bg-transparent",
  chatCol:
    "border-white/10 bg-gradient-to-b from-white/[0.08] via-white/[0.04] to-transparent backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)]",
  chatScroll: "bg-transparent",
  chatComposer:
    "border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.45)]",
  previewCol: "",
  previewHeader: "",
  previewBody: "",
  previewEmpty: "",
  previewIdleCol:
    "border-white/10 bg-gradient-to-br from-stone-950/50 via-stone-900/35 to-stone-950/60 backdrop-blur-md",
  previewIdleHeader: "border-white/10 bg-white/[0.04] backdrop-blur-md",
  previewIdleBody:
    "bg-[radial-gradient(ellipse_at_25%_15%,rgba(144,139,106,0.18),transparent_52%),radial-gradient(ellipse_at_85%_85%,rgba(144,139,106,0.08),transparent_48%)]",
  previewIdleEmpty:
    "border-facto-gold/30 bg-white/[0.05] text-stone-300 shadow-xl shadow-black/30 backdrop-blur-md",
  msgUsuario:
    "border border-facto-gold/30 bg-facto-gold/15 text-amber-50 shadow-md shadow-black/25 backdrop-blur-sm",
  msgAssistente:
    "border border-white/12 bg-white/[0.09] text-stone-100 shadow-lg shadow-black/30 backdrop-blur-md",
  msgSistema:
    "border border-dashed border-white/18 bg-white/[0.04] text-stone-400 backdrop-blur-sm",
  input:
    "border-white/15 bg-white/[0.07] text-stone-100 caret-facto-gold placeholder:text-stone-500 focus:border-facto-gold/45 focus:ring-facto-gold/20 backdrop-blur-sm",
};

export function resolverTemaChatMinuta(
  temaId: ChatMinutaTema,
  opts: { workspace?: boolean; previewTemPeca?: boolean }
): ChatMinutaTemaClasses {
  const base = CHAT_MINUTA_TEMAS[temaId];
  if (!opts.workspace) return base;
  if (opts.previewTemPeca) {
    return {
      ...CHAT_WORKSPACE_TEMA,
      previewCol: base.previewCol,
      previewHeader: base.previewHeader,
      previewBody: base.previewBody,
      previewEmpty: base.previewEmpty,
    };
  }
  return CHAT_WORKSPACE_TEMA;
}

export const CHAT_MINUTA_TEMAS: Record<ChatMinutaTema, ChatMinutaTemaClasses> = {
  papel: {
    label: "Papel",
    dica: "Fundo quente, contraste alto — padrão FACTO",
    shell: "bg-[#e8e4dc]",
    chatCol: "bg-[#f5f2eb] border-stone-300/80",
    chatScroll: "bg-[#f5f2eb]",
    chatComposer: "bg-white border-stone-200",
    previewCol: "bg-[#fafaf8]",
    previewHeader: "bg-white border-stone-200",
    previewBody: "bg-[#fafaf8]",
    previewEmpty:
      "border-stone-300/90 bg-white text-stone-600 shadow-sm",
    previewIdleCol: "bg-facto-dark",
    previewIdleHeader: "border-white/10 bg-stone-950/80",
    previewIdleBody:
      "bg-[radial-gradient(ellipse_at_top,rgba(144,139,106,0.22),transparent_55%)] bg-facto-dark",
    previewIdleEmpty:
      "border-facto-gold/25 bg-white/5 text-stone-300 shadow-none backdrop-blur-sm",
    msgUsuario: "bg-stone-800 text-amber-50",
    msgAssistente: "border-stone-200 bg-white text-stone-800 shadow-sm",
    msgSistema:
      "border-dashed border-stone-300 bg-stone-50/90 text-stone-600",
    input:
      "border-stone-200 bg-white text-stone-900 caret-stone-900 placeholder:text-stone-500 focus:border-stone-500 focus:ring-stone-200",
  },
  suave: {
    label: "Suave",
    dica: "Menos brilho nas bordas — sessões longas",
    shell: "bg-[#d4cfc4]",
    chatCol: "bg-[#ebe7df] border-stone-400/50",
    chatScroll: "bg-[#ebe7df]",
    chatComposer: "bg-[#f7f5f0] border-stone-300",
    previewCol: "bg-[#f3f1ec]",
    previewHeader: "bg-[#faf9f6] border-stone-300",
    previewBody: "bg-[#f3f1ec]",
    previewEmpty:
      "border-stone-400/60 bg-[#faf9f6] text-stone-700 shadow-sm",
    previewIdleCol: "bg-facto-dark",
    previewIdleHeader: "border-white/10 bg-stone-950/80",
    previewIdleBody:
      "bg-[radial-gradient(ellipse_at_top,rgba(144,139,106,0.18),transparent_55%)] bg-facto-dark",
    previewIdleEmpty:
      "border-facto-gold/20 bg-white/[0.04] text-stone-300 shadow-none",
    msgUsuario: "bg-stone-900 text-amber-50",
    msgAssistente: "border-stone-300 bg-[#faf9f6] text-stone-900 shadow-sm",
    msgSistema:
      "border-dashed border-stone-400/70 bg-stone-100/80 text-stone-700",
    input:
      "border-stone-300 bg-[#faf9f6] text-stone-900 caret-stone-900 placeholder:text-stone-500 focus:border-stone-600 focus:ring-stone-300",
  },
};
