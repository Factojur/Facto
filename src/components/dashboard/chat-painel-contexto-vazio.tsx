"use client";

/**
 * Painel direito vazio — sem metadados pré-preenchidos até o relato.
 */

export function ChatPainelContextoVazio({ workspace }: { workspace?: boolean }) {
  return (
    <div className="mx-auto flex min-h-[min(420px,55vh)] max-w-md flex-col items-center justify-center px-6 py-10 text-center">
      <p
        className={`text-lg font-semibold tracking-tight sm:text-xl ${
          workspace ? "text-stone-100" : "text-stone-800"
        }`}
      >
        o planejamento que economiza o seu tempo.
      </p>
      <p
        className={`mt-3 max-w-sm text-sm leading-relaxed ${
          workspace ? "text-stone-400" : "text-stone-600"
        }`}
      >
        Descreva o caso à esquerda. Área, estratégia e plano surgem do que você
        contar — com lastro da{" "}
        <strong className="font-medium text-facto-gold">base FACTO</strong>.
      </p>
      <ul
        className={`mt-6 space-y-2 text-left text-xs ${
          workspace ? "text-stone-500" : "text-stone-500"
        }`}
      >
        <li className="flex gap-2">
          <span className="text-facto-gold" aria-hidden>
            ·
          </span>
          <span>Converse até o plano ficar bom</span>
        </li>
        <li className="flex gap-2">
          <span className="text-facto-gold" aria-hidden>
            ·
          </span>
          <span>Anexe PDF ou use Provas / lei e juris do caso</span>
        </li>
        <li className="flex gap-2">
          <span className="text-facto-gold" aria-hidden>
            ·
          </span>
          <span>
            <strong className="font-medium text-stone-400">Redigir</strong> só
            quando quiser a peça protocolável (1 crédito)
          </span>
        </li>
      </ul>
    </div>
  );
}
