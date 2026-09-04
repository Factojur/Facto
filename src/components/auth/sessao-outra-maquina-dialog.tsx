"use client";

type Props = {
  aberto: boolean;
  carregando?: boolean;
  onAbrirAqui: () => void;
  onManterOutro: () => void;
};

/**
 * Conflito de sessão única de peças — copy FACTO (não técnica).
 */
export function SessaoOutraMaquinaDialog({
  aberto,
  carregando = false,
  onAbrirAqui,
  onManterOutro,
}: Props) {
  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sessao-outra-titulo"
    >
      <div className="w-full max-w-md rounded-2xl border border-stone-700 bg-stone-900 p-6 shadow-2xl shadow-black/50">
        <h2
          id="sessao-outra-titulo"
          className="text-lg font-semibold tracking-tight text-white"
        >
          FACTO já está aberto em outro lugar
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-300">
          Detectamos uma sessão ativa em outro computador ou navegador. Para
          proteger sua cota e o trabalho em andamento, o assistente de peças
          fica em <strong className="font-medium text-stone-100">um
          dispositivo por vez</strong>.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-stone-400">
          O que prefere fazer?
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            disabled={carregando}
            onClick={onAbrirAqui}
            className="w-full rounded-lg bg-facto-gold py-3 text-sm font-semibold text-facto-dark transition hover:bg-[#a39a78] disabled:opacity-50"
          >
            {carregando ? "Abrindo…" : "Abrir neste computador"}
          </button>
          <button
            type="button"
            disabled={carregando}
            onClick={onManterOutro}
            className="w-full rounded-lg border border-stone-600 bg-stone-800/80 py-3 text-sm font-medium text-stone-200 transition hover:border-stone-500 hover:bg-stone-800 disabled:opacity-50"
          >
            Manter no outro dispositivo
          </button>
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-stone-500">
          Se abrir aqui, a outra tela será desconectada do assistente (seus
          casos salvos não se perdem). Gestão, se usar, não entra nessa regra.
        </p>
      </div>
    </div>
  );
}
