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
        Descreva o caso ou anexe o PDF dos autos. A peça sobe no preview para
        você editar e exportar — com lastro da{" "}
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
          <span>Anexe os autos — a análise começa na hora</span>
        </li>
        <li className="flex gap-2">
          <span className="text-facto-gold" aria-hidden>
            ·
          </span>
          <span>Complemente com uma instrução curta se quiser</span>
        </li>
        <li className="flex gap-2">
          <span className="text-facto-gold" aria-hidden>
            ·
          </span>
          <span>
            Edite a peça no preview e exporte Word/PDF para protocolar
          </span>
        </li>
      </ul>
    </div>
  );
}
