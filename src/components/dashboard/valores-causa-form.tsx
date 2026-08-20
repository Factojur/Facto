"use client";

import {
  CATEGORIAS_VALOR,
  calcularResumoValorCausa,
  formatarCentavos,
  itemValorVazio,
  type CategoriaValorId,
  type ItemValor,
  type ResumoValorCausa,
} from "@/lib/valores-causa";
import {
  mensagemAlertaTetoJec,
  ultrapassaTetoJec,
} from "@/lib/jec-teto";

export type ValoresPorCategoria = Record<CategoriaValorId, ItemValor[]>;

export function valoresCausaVazio(): ValoresPorCategoria {
  return { danosMateriais: [], danosMorais: [] };
}

export function ValoresCausaSection({
  value,
  onChange,
  comAdvogado = true,
  expandidoManual = false,
  onExpandidoManualChange,
  valorInferido = null,
  onAplicarValorInferido,
}: {
  value: ValoresPorCategoria;
  onChange: (v: ValoresPorCategoria) => void;
  /** false = leigo (teto 20 SM, aviso bloqueante); true = OAB (teto 40 SM, aviso). */
  comAdvogado?: boolean;
  expandidoManual?: boolean;
  onExpandidoManualChange?: (v: boolean) => void;
  valorInferido?: ResumoValorCausa | null;
  onAplicarValorInferido?: () => void;
}) {
  const resumo = calcularResumoValorCausa(value);
  const temItensManuais = resumo.totalCentavos > 0;
  const mostrarFormulario = expandidoManual || temItensManuais;

  function adicionarItem(categoria: CategoriaValorId) {
    onChange({ ...value, [categoria]: [...value[categoria], itemValorVazio()] });
  }

  function removerItem(categoria: CategoriaValorId, id: string) {
    onChange({
      ...value,
      [categoria]: value[categoria].filter((i) => i.id !== id),
    });
  }

  function atualizarItem(
    categoria: CategoriaValorId,
    id: string,
    campo: "descricao" | "valor",
    texto: string
  ) {
    onChange({
      ...value,
      [categoria]: value[categoria].map((i) =>
        i.id === id ? { ...i, [campo]: texto } : i
      ),
    });
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold text-slate-800">
        Valores da Causa (opcional)
      </h2>
      <p className="mb-4 text-sm text-slate-500">
        Opcional. Se preencher manualmente, a soma entra na peça sem alteração.
        Se deixar em branco, o sistema usa os valores citados nos fatos.
      </p>

      {valorInferido && !temItensManuais && (
        <div
          className="mb-4 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <div>
            <p className="text-sm font-medium text-amber-950">
              Valor inferido dos fatos — confira
            </p>
            <p className="mt-0.5 text-sm text-amber-900">
              {valorInferido.totalFormatado}
              {valorInferido.categorias.some((c) => c.itens.length > 0) && (
                <span className="text-amber-800/80">
                  {" "}
                  (
                  {valorInferido.categorias
                    .flatMap((c) => c.itens.map((i) => i.descricao))
                    .slice(0, 3)
                    .join("; ")}
                  )
                </span>
              )}
            </p>
          </div>
          {onAplicarValorInferido && (
            <button
              type="button"
              onClick={onAplicarValorInferido}
              className="shrink-0 rounded-lg bg-stone-800 px-3 py-1.5 text-sm font-medium text-amber-50 hover:bg-stone-700"
            >
              Aplicar e editar
            </button>
          )}
        </div>
      )}

      {!mostrarFormulario && onExpandidoManualChange && (
        <button
          type="button"
          onClick={() => onExpandidoManualChange(true)}
          className="mb-4 text-sm font-medium text-stone-700 hover:text-stone-900"
        >
          Preencher valores manualmente
        </button>
      )}

      <div className={mostrarFormulario ? "space-y-5" : "hidden"}>
        {CATEGORIAS_VALOR.map(({ id, label }) => {
          const itens = value[id];
          const subtotal =
            resumo.categorias.find((c) => c.id === id)?.subtotalCentavos ?? 0;

          return (
            <div key={id} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
                <span className="text-sm font-medium text-stone-700">
                  {formatarCentavos(subtotal)}
                </span>
              </div>

              {itens.length > 0 && (
                <div className="space-y-2">
                  {itens.map((item) => (
                    <div key={item.id} className="flex gap-2">
                      <input
                        type="text"
                        value={item.descricao}
                        onChange={(e) =>
                          atualizarItem(id, item.id, "descricao", e.target.value)
                        }
                        placeholder="Descrição (ex: Conserto do carro)"
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
                      />
                      <input
                        type="text"
                        inputMode="decimal"
                        value={item.valor}
                        onChange={(e) =>
                          atualizarItem(id, item.id, "valor", e.target.value)
                        }
                        placeholder="R$ 0,00"
                        className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
                      />
                      <button
                        type="button"
                        onClick={() => removerItem(id, item.id)}
                        aria-label="Remover item"
                        className="shrink-0 rounded-lg px-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => adicionarItem(id)}
                className="mt-3 text-sm font-medium text-stone-700 hover:text-stone-900"
              >
                + Adicionar item
              </button>
            </div>
          );
        })}
      </div>

      {mostrarFormulario && (
        <>
          <div className="mt-5 flex items-center justify-between rounded-lg bg-stone-800 px-4 py-3">
            <span className="text-sm font-medium text-amber-50">
              Total da Causa
            </span>
            <span className="text-lg font-bold text-amber-50">
              {resumo.totalFormatado}
            </span>
          </div>
          {resumo.totalCentavos > 0 && (
            <p className="mt-1.5 text-xs text-slate-500">
              Por extenso: {resumo.totalPorExtenso}.
            </p>
          )}
          {ultrapassaTetoJec(resumo.totalCentavos, comAdvogado) && (
            <p
              className={`mt-2 rounded-lg border px-3 py-2 text-xs ${
                comAdvogado
                  ? "border-amber-200 bg-amber-50 text-amber-900"
                  : "border-red-200 bg-red-50 text-red-900"
              }`}
              role="alert"
            >
              {mensagemAlertaTetoJec(resumo.totalCentavos, comAdvogado)}
            </p>
          )}
        </>
      )}
    </section>
  );
}
