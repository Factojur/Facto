"use client";

/** Bolha “digitando…” estilo chat fluido (MinutaIA-like). */
export function ChatIndicadorDigitando({
  temaAssistente,
}: {
  temaAssistente: string;
}) {
  return (
    <div className="flex justify-start">
      <div
        className={`flex items-center gap-1.5 rounded-2xl px-4 py-3 text-sm ${temaAssistente}`}
        aria-live="polite"
        aria-label="Assistente analisando"
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-60" />
        <span
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-60"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-60"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}
