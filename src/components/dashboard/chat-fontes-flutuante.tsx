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

/** Documentos — clipe (não confundir com livro genérico). */
function IconPaperclip({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
        {...stroke}
      />
    </svg>
  );
}

/** Provas e teses — lâmpada (tese/ideia), legível em 20px. */
function IconLightbulb({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M9 18h6M10 21h4M12 2a6.5 6.5 0 0 0-3.8 11.8c.5.4.8 1 .8 1.6V17h6v-1.6c0-.6.3-1.2.8-1.6A6.5 6.5 0 0 0 12 2z"
        {...stroke}
      />
      <path d="M10 14h4" {...stroke} />
    </svg>
  );
}

/** Legislação — balança (lei), sem pergaminho que parece pasta. */
function IconScales({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 3v18" {...stroke} />
      <path d="M5 7h14" {...stroke} />
      <path d="M5 7l-3 6a3.5 3.5 0 0 0 7 0L6 7" {...stroke} />
      <path d="M19 7l-3 6a3.5 3.5 0 0 0 7 0l-3-6" {...stroke} />
      <path d="M9 21h6" {...stroke} />
    </svg>
  );
}

/** Jurisprudência — cabeça em paralelogramo + cabo + bloco (não parece rolo). */
function IconGavel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {/* cabeça do martelo (paralelogramo ~40°) */}
      <path d="M10.2 2.8l7.4 6.2-2.6 3.1-7.4-6.2z" {...stroke} />
      {/* detalhe da cabeça */}
      <path d="M11.6 4.6l4.6 3.9" {...stroke} />
      {/* cabo */}
      <path d="M10.8 11.4L5.4 16.8" {...stroke} />
      {/* bloco de impacto */}
      <path d="M3.2 18.4h10" {...stroke} strokeWidth={2.2} />
      <path d="M4.5 17v3.2M11.8 17v3.2" {...stroke} />
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

/** Coluna flutuante de fontes — visual FACTO. */
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
        <IconMessage className="h-5 w-5" />
      </BtnFonte>
      <BtnFonte
        aba="anexos"
        label="Documentos"
        tooltip={tooltips?.anexos}
        ativo={abaAtiva === "anexos"}
        pulse={pulse?.anexos}
        badge={totalAnexos}
        modoWorkspace={modoWorkspace}
        onAbrir={onAbrir}
      >
        <IconPaperclip className="h-5 w-5" />
      </BtnFonte>
      <BtnFonte
        aba="teses"
        label="Provas e teses"
        tooltip={
          tooltips?.teses ??
          "Provas do fato, teses e complementos. Modelo de peça: botão + Modelo na barra."
        }
        ativo={abaAtiva === "teses"}
        pulse={pulse?.teses}
        badge={contagens.teses}
        modoWorkspace={modoWorkspace}
        onAbrir={onAbrir}
      >
        <IconLightbulb className="h-5 w-5" />
      </BtnFonte>
      <BtnFonte
        aba="lei"
        label="Legislação"
        tooltip={tooltips?.lei ?? "Lei municipal do caso"}
        ativo={abaAtiva === "lei"}
        pulse={pulse?.lei}
        badge={contagens.lei}
        modoWorkspace={modoWorkspace}
        onAbrir={onAbrir}
      >
        <IconScales className="h-5 w-5" />
      </BtnFonte>
      <BtnFonte
        aba="juris"
        label="Jurisprudência"
        tooltip={tooltips?.juris}
        ativo={abaAtiva === "juris"}
        pulse={pulse?.juris}
        badge={contagens.juris}
        modoWorkspace={modoWorkspace}
        onAbrir={onAbrir}
      >
        <IconGavel className="h-5 w-5" />
      </BtnFonte>
    </div>
  );
}
