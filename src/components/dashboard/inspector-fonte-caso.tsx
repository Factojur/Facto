"use client";

import { PainelLateralPortal } from "@/components/dashboard/painel-lateral-portal";
import type { MatchJurisCaso } from "@/lib/casar-juris-caso-peca";

export type ItemInspectorFonte = {
  id: string;
  titulo: string;
  detalhe?: string;
  corpo?: string;
  badge?: string;
};

export type EstadoInspectorFonte =
  | {
      modo: "lista";
      titulo: string;
      itens: ItemInspectorFonte[];
      rodape?: string;
    }
  | {
      modo: "detalhe";
      titulo: string;
      item: ItemInspectorFonte;
      match?: MatchJurisCaso | null;
      ementaPeca?: string;
    };

type Props = {
  estado: EstadoInspectorFonte | null;
  onFechar: () => void;
  onSelecionarItem?: (item: ItemInspectorFonte) => void;
  onAbrirEdicao?: () => void;
};

/** Inspector lateral — fonte do caso / ementa casada (0 tokens). */
export function InspectorFonteCaso({
  estado,
  onFechar,
  onSelecionarItem,
  onAbrirEdicao,
}: Props) {
  if (!estado) return null;

  return (
    <PainelLateralPortal
      aberto
      onFechar={onFechar}
      ariaLabel={estado.titulo}
      maxWidthClass="max-w-lg"
    >
      <header className="flex items-start justify-between gap-3 border-b border-stone-200 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-facto-gold">
            Lastro do caso
          </p>
          <h2 className="truncate text-base font-semibold text-stone-900">
            {estado.titulo}
          </h2>
        </div>
        <button
          type="button"
          onClick={onFechar}
          className="rounded-md px-2 py-1 text-sm text-stone-500 hover:bg-stone-100 hover:text-stone-800"
        >
          Fechar
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {estado.modo === "lista" ? (
          <>
            {estado.itens.length === 0 ? (
              <p className="text-sm text-stone-500">
                Nenhuma fonte nesta categoria ainda. Anexe no painel de
                complementos.
              </p>
            ) : (
              <ul className="space-y-2">
                {estado.itens.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onSelecionarItem?.(item)}
                      className="w-full rounded-lg border border-stone-200 bg-stone-50/80 px-3 py-2.5 text-left transition hover:border-sky-300 hover:bg-sky-50/50"
                    >
                      <div className="flex items-center gap-2">
                        {item.badge ? (
                          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-violet-800">
                            {item.badge}
                          </span>
                        ) : null}
                        <span className="text-sm font-medium text-stone-900">
                          {item.titulo}
                        </span>
                      </div>
                      {item.detalhe ? (
                        <p className="mt-1 line-clamp-2 text-xs text-stone-500">
                          {item.detalhe}
                        </p>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {estado.rodape ? (
              <p className="mt-4 text-xs text-stone-500">{estado.rodape}</p>
            ) : null}
          </>
        ) : (
          <>
            {estado.match ? (
              <p className="mb-3 rounded-md border border-emerald-200 bg-emerald-50/80 px-2.5 py-1.5 text-xs text-emerald-900">
                Casada com a peça ({estado.match.confianca}) ·{" "}
                {estado.match.origem === "juris_caso"
                  ? "anexo do caso"
                  : "base FACTO"}{" "}
                · {estado.match.motivo}
              </p>
            ) : null}
            {estado.item.badge ? (
              <span className="mb-2 inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-violet-800">
                {estado.item.badge}
              </span>
            ) : null}
            <h3 className="text-sm font-semibold text-stone-900">
              {estado.item.titulo}
            </h3>
            {estado.item.detalhe ? (
              <p className="mt-1 text-xs text-stone-500">{estado.item.detalhe}</p>
            ) : null}
            {estado.ementaPeca ? (
              <section className="mt-4">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-stone-500">
                  Na peça
                </p>
                <blockquote className="border-l-2 border-stone-300 bg-stone-50/80 py-2 pl-3 text-sm italic leading-relaxed text-stone-800">
                  {estado.ementaPeca}
                </blockquote>
              </section>
            ) : null}
            {estado.item.corpo ? (
              <section className="mt-4">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-stone-500">
                  Fonte
                </p>
                <pre className="whitespace-pre-wrap rounded-lg border border-stone-100 bg-white p-3 font-sans text-sm leading-relaxed text-stone-800">
                  {estado.item.corpo}
                </pre>
              </section>
            ) : (
              <p className="mt-4 text-sm text-stone-500">
                Sem texto completo desta fonte no caso. A ementa acima é o que
                entrou na minuta.
              </p>
            )}
          </>
        )}
      </div>

      {onAbrirEdicao ? (
        <footer className="border-t border-stone-200 px-4 py-3">
          <button
            type="button"
            onClick={onAbrirEdicao}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50"
          >
            Abrir complementos para editar
          </button>
        </footer>
      ) : null}
    </PainelLateralPortal>
  );
}
