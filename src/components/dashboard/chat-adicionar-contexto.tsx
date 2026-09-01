"use client";

type Props = {
  modoWorkspace?: boolean;
  aberto: boolean;
  onAbertoChange: (v: boolean) => void;
  itemCount: number;
  processandoDocumentos?: boolean;
};

/** Botão Anexos no composer — abre o banner central no chat. */
export function ChatAdicionarContexto({
  modoWorkspace = false,
  aberto,
  onAbertoChange,
  itemCount,
  processandoDocumentos = false,
}: Props) {
  const chipCls = modoWorkspace
    ? `inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold backdrop-blur-sm transition ${
        aberto
          ? "border-facto-gold/70 bg-facto-gold/20 text-facto-gold shadow-[0_0_0_1px_rgba(201,191,154,0.35)]"
          : "border-facto-gold/50 bg-facto-gold/12 text-facto-gold hover:border-facto-gold/75 hover:bg-facto-gold/18"
      }`
    : `inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold shadow-sm transition ${
        aberto
          ? "border-facto-gold bg-amber-50 text-amber-950 ring-2 ring-facto-gold/25"
          : "border-facto-gold/55 bg-amber-50 text-amber-900 hover:border-facto-gold hover:bg-amber-100/90"
      }`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onAbertoChange(!aberto)}
        className={chipCls}
        aria-expanded={aberto}
        aria-haspopup="dialog"
        title="Anexar autos, PDF, provas, lei, jurisprudência e buscar na base FACTO"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
          />
        </svg>
        Anexos
        {itemCount > 0 && (
          <span className="rounded-full bg-facto-gold/25 px-1.5 text-[10px] font-semibold text-facto-gold">
            {itemCount}
          </span>
        )}
      </button>

      {processandoDocumentos && !aberto && (
        <span
          className="absolute -top-1 left-full ml-1.5 whitespace-nowrap text-[10px] text-amber-400"
          aria-live="polite"
        >
          Lendo…
        </span>
      )}
    </div>
  );
}
