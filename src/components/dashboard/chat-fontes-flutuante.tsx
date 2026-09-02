"use client";

import type { ReactNode } from "react";

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

function IconScroll({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V3a2 2 0 1 0-4 0v9h12"
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

export type AbaFontesChat = "chat" | "anexos" | "lei" | "juris" | "teses";

export type FontesContagens = {
  anexos: number;
  juris: number;
  provas: number;
  teses: number;
  lei: number;
};

export type FontesTooltips = Partial<Record<AbaFontesChat, string>>;

type Props = {
  contagens: FontesContagens;
  onAbrir: (aba: AbaFontesChat) => void;
  modoWorkspace?: boolean;
  abaAtiva?: AbaFontesChat | null;
  tooltips?: FontesTooltips;
  pulse?: Partial<Record<AbaFontesChat, boolean>>;
};

function Badge({ n, pulse }: { n: number; pulse?: boolean }) {
  if (n <= 0) return null;
  return (
    <span
      className={`absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500 px-1 text-[9px] font-bold text-white ${
        pulse ? "animate-pulse ring-2 ring-sky-300 ring-offset-1" : ""
      }`}
    >
      {n > 9 ? "9+" : n}
    </span>
  );
}

function BtnFonte({
  aba,
  label,
  tooltip,
  ativo,
  pulse,
  badge,
  modoWorkspace,
  onAbrir,
  children,
}: {
  aba: AbaFontesChat;
  label: string;
  tooltip?: string;
  ativo?: boolean;
  pulse?: boolean;
  badge?: number;
  modoWorkspace?: boolean;
  onAbrir: (aba: AbaFontesChat) => void;
  children: ReactNode;
}) {
  const base = modoWorkspace
    ? "relative flex h-10 w-10 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition"
    : "relative flex h-10 w-10 items-center justify-center rounded-full border shadow-md transition";

  const idle = modoWorkspace
    ? "border-white/15 bg-stone-900/75 text-stone-300 hover:border-facto-gold/40 hover:bg-stone-800/90 hover:text-facto-gold"
    : "border-stone-200 bg-white text-stone-600 hover:border-amber-400 hover:text-amber-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300";

  const active = modoWorkspace
    ? "border-facto-gold/70 bg-facto-gold/15 text-facto-gold ring-1 ring-facto-gold/35"
    : "border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-300 dark:border-amber-500/60 dark:bg-amber-950/40 dark:text-amber-100";

  const tip = tooltip?.trim() || label;

  return (
    <div className="group/btn relative">
      <button
        type="button"
        className={`${base} ${ativo ? active : idle}`}
        title={tip}
        aria-label={label}
        aria-current={ativo ? "true" : undefined}
        onClick={() => onAbrir(aba)}
      >
        {children}
        {badge != null && badge > 0 ? <Badge n={badge} pulse={pulse} /> : null}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute right-full top-1/2 z-50 mr-2 hidden w-44 -translate-y-1/2 rounded-lg border border-stone-200/90 bg-white/95 px-2.5 py-1.5 text-[11px] leading-snug text-stone-700 shadow-lg backdrop-blur-sm group-hover/btn:block group-focus-within/btn:block dark:border-stone-600 dark:bg-stone-900/95 dark:text-stone-200"
      >
        {tip}
      </span>
    </div>
  );
}

/** Coluna flutuante de fontes — comportamento MinutaIA, visual FACTO. */
export function ChatFontesFlutuante({
  contagens,
  onAbrir,
  modoWorkspace,
  abaAtiva,
  tooltips,
  pulse,
}: Props) {
  const totalAnexos = contagens.anexos + contagens.provas;

  return (
    <div
      className="pointer-events-auto absolute right-2 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-2 sm:right-3"
      aria-label="Fontes do caso"
    >
      <BtnFonte
        aba="chat"
        label="Voltar ao chat"
        tooltip={tooltips?.chat}
        ativo={abaAtiva === "chat"}
        modoWorkspace={modoWorkspace}
        onAbrir={onAbrir}
      >
        <IconMessage className="h-4.5 w-4.5" />
      </BtnFonte>
      <BtnFonte
        aba="anexos"
        label="Documentos e provas anexados"
        tooltip={tooltips?.anexos}
        ativo={abaAtiva === "anexos"}
        pulse={pulse?.anexos}
        badge={totalAnexos}
        modoWorkspace={modoWorkspace}
        onAbrir={onAbrir}
      >
        <IconBook className="h-4.5 w-4.5" />
      </BtnFonte>
      <BtnFonte
        aba="lei"
        label="Lei municipal"
        tooltip={tooltips?.lei}
        ativo={abaAtiva === "lei"}
        pulse={pulse?.lei}
        badge={contagens.lei}
        modoWorkspace={modoWorkspace}
        onAbrir={onAbrir}
      >
        <IconScroll className="h-4.5 w-4.5" />
      </BtnFonte>
      <BtnFonte
        aba="juris"
        label="Jurisprudência do caso"
        tooltip={tooltips?.juris}
        ativo={abaAtiva === "juris"}
        pulse={pulse?.juris}
        badge={contagens.juris}
        modoWorkspace={modoWorkspace}
        onAbrir={onAbrir}
      >
        <IconGavel className="h-4.5 w-4.5" />
      </BtnFonte>
      <BtnFonte
        aba="teses"
        label="Teses e complementos"
        tooltip={tooltips?.teses}
        ativo={abaAtiva === "teses"}
        pulse={pulse?.teses}
        badge={contagens.teses}
        modoWorkspace={modoWorkspace}
        onAbrir={onAbrir}
      >
        <IconPuzzle className="h-4.5 w-4.5" />
      </BtnFonte>
    </div>
  );
}
