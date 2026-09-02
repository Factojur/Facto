"use client";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconMessage({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        {...stroke}
      />
    </svg>
  );
}

function IconPuzzle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M19.439 7.85c-.049.322.059.648.293.877l1.472 1.433a1.2 1.2 0 0 1 0 1.72l-1.472 1.433a1.01 1.01 0 0 0-.293.877c.017.11.017.221 0 .331a1.2 1.2 0 0 1-1.2 1.2 1.01 1.01 0 0 0-.877.293l-1.433 1.472a1.2 1.2 0 0 1-1.72 0l-1.433-1.472a1.01 1.01 0 0 0-.877-.293 1.2 1.2 0 0 1-1.2-1.2 1.01 1.01 0 0 0-.293-.877L5.85 12.56a1.2 1.2 0 0 1 0-1.72l1.433-1.472a1.01 1.01 0 0 0 .293-.877 1.2 1.2 0 0 1 1.2-1.2c.11-.017.221-.017.331 0a1.01 1.01 0 0 0 .877-.293l1.472-1.433a1.2 1.2 0 0 1 1.72 0l1.472 1.433c.23.234.555.342.877.293z"
        {...stroke}
      />
      <path d="M12 8v8 M8 12h8" {...stroke} />
    </svg>
  );
}

function IconBook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" {...stroke} />
      <path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
        {...stroke}
      />
    </svg>
  );
}

function IconGavel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10" {...stroke} />
      <path d="m16 16 6-6" {...stroke} />
      <path d="m8 8 6-6" {...stroke} />
      <path d="m9 7 8 8" {...stroke} />
      <path d="m3 21 3-3" {...stroke} />
    </svg>
  );
}

export type AbaFontesChat = "chat" | "anexos" | "juris" | "teses";

type Props = {
  contagens: {
    anexos: number;
    juris: number;
    provas: number;
    teses: number;
  };
  onAbrir: (aba: AbaFontesChat) => void;
  modoWorkspace?: boolean;
};

function Badge({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500 px-1 text-[9px] font-bold text-white">
      {n > 9 ? "9+" : n}
    </span>
  );
}

/** Coluna flutuante de fontes — comportamento MinutaIA, visual FACTO. */
export function ChatFontesFlutuante({
  contagens,
  onAbrir,
  modoWorkspace,
}: Props) {
  const btn = modoWorkspace
    ? "relative flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-stone-900/75 text-stone-300 shadow-lg backdrop-blur-md transition hover:border-facto-gold/40 hover:bg-stone-800/90 hover:text-facto-gold"
    : "relative flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 shadow-md transition hover:border-amber-400 hover:text-amber-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300";

  const totalAnexos = contagens.anexos + contagens.provas;

  return (
    <div
      className="pointer-events-auto absolute right-2 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-2 sm:right-3"
      aria-label="Fontes do caso"
    >
      <button
        type="button"
        className={btn}
        title="Voltar ao chat"
        onClick={() => onAbrir("chat")}
      >
        <IconMessage className="h-4.5 w-4.5" />
      </button>
      <button
        type="button"
        className={btn}
        title="Teses e complementos"
        onClick={() => onAbrir("teses")}
      >
        <IconPuzzle className="h-4.5 w-4.5" />
        <Badge n={contagens.teses} />
      </button>
      <button
        type="button"
        className={btn}
        title="Documentos e provas anexados"
        onClick={() => onAbrir("anexos")}
      >
        <IconBook className="h-4.5 w-4.5" />
        <Badge n={totalAnexos} />
      </button>
      <button
        type="button"
        className={btn}
        title="Jurisprudência do caso"
        onClick={() => onAbrir("juris")}
      >
        <IconGavel className="h-4.5 w-4.5" />
        <Badge n={contagens.juris} />
      </button>
    </div>
  );
}
