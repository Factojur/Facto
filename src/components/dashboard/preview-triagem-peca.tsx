"use client";

import type { TopicoPlanejado } from "@/lib/ia/plano-topicos-peca";
import type { ItemCoberturaTese } from "@/lib/ia/cobertura-teses-peca";
import type { AnaliseEstrategica } from "@/lib/ia/triagem-caso-peca";
import { TextoJuridicoInline } from "@/components/dashboard/texto-juridico-inline";

export type PreviewTriagemData = {
  estrategiaJuridica: string;
  analiseEstrategica: AnaliseEstrategica;
  topicos: TopicoPlanejado[];
  cobertura: ItemCoberturaTese[];
  coberturaResumo?: string;
  modelo?: string;
  /** Pedidos digitados pelo advogado no formulário. */
  pedidosFormulario?: string[];
};

/** Corpo reutilizável do plano (chat + formulário). */
export function PlanoEstrategicoCorpo({
  triagem,
  onIncluirCobertura,
  onAbrirFls,
}: {
  triagem: PreviewTriagemData;
  /** 1 clique em item pendente — inclui tese/pedido no plano sem nova triagem. */
  onIncluirCobertura?: (itemId: string) => void;
  onAbrirFls?: (pagina: number | null, trecho: string) => void;
}) {
  const { analiseEstrategica: a } = triagem;
  const nOk = triagem.cobertura.filter((c) => c.noPlano).length;
  const pedidosForm = (triagem.pedidosFormulario ?? [])
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        {triagem.coberturaResumo && (
          <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-700">
            Cobertura {triagem.coberturaResumo}
          </span>
        )}
      </div>

      {(a.nomeAcao || a.tesePrincipal) && (
        <div className="mt-4 grid gap-2 text-sm text-stone-700 sm:grid-cols-2">
          {a.nomeAcao && (
            <p>
              <span className="font-medium text-stone-800">Ação:</span> {a.nomeAcao}
            </p>
          )}
          {a.tesePrincipal && (
            <p className="sm:col-span-2">
              <span className="font-medium text-stone-800">Tese:</span>{" "}
              <TextoJuridicoInline texto={a.tesePrincipal} onAbrirFls={onAbrirFls} />
            </p>
          )}
        </div>
      )}

      {triagem.topicos.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-stone-800">
            Plano de tópicos
          </h3>
          <ol className="mt-2 space-y-2">
            {triagem.topicos.map((t) => (
              <li
                key={`${t.romano}-${t.titulo}`}
                className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
              >
                <span className="font-medium text-stone-900">
                  {t.romano}. {t.titulo}
                </span>
                {t.subtitulos.length > 0 && (
                  <ul className="mt-1 list-inside list-disc text-stone-600">
                    {t.subtitulos.map((s) => (
                      <li key={s}>
                        <TextoJuridicoInline texto={s} onAbrirFls={onAbrirFls} />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      {triagem.cobertura.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-stone-800">
            Cobertura de teses e pedidos
          </h3>
          <p className="mt-0.5 text-xs text-stone-500">
            {nOk} de {triagem.cobertura.length} refletidos no plano da triagem.
            {triagem.cobertura.some((c) => !c.noPlano) && onIncluirCobertura && (
              <span className="text-stone-600">
                {" "}
                Toque em um item pendente para incluir.
              </span>
            )}
          </p>
          <ul className="mt-2 space-y-1.5">
            {triagem.cobertura.map((c) => (
              <li key={c.id} className="flex items-start gap-2 text-sm">
                <span
                  className={
                    c.noPlano ? "text-emerald-600" : "text-amber-600"
                  }
                  aria-hidden
                >
                  {c.noPlano ? "✓" : "!"}
                </span>
                {!c.noPlano && onIncluirCobertura ? (
                  <button
                    type="button"
                    onClick={() => onIncluirCobertura(c.id)}
                    className="rounded-lg border border-amber-300 bg-amber-50/90 px-2.5 py-1.5 text-left text-sm text-amber-950 transition hover:border-amber-400 hover:bg-amber-100"
                    title="Incluir no plano (sem nova triagem)"
                  >
                    <span className="font-medium">{c.rotulo}</span>
                    <span className="mt-0.5 block text-xs font-semibold text-amber-800">
                      + Incluir no plano
                    </span>
                  </button>
                ) : (
                  <span className="text-stone-700">{c.rotulo}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {pedidosForm.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-stone-800">
            Pedidos do formulário
          </h3>
          <ul className="mt-1 list-inside list-decimal text-sm text-stone-700">
            {pedidosForm.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {a.pedidosEssenciais && a.pedidosEssenciais.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-stone-800">
            Pedidos essenciais (triagem)
          </h3>
          <ul className="mt-1 list-inside list-disc text-sm text-stone-700">
            {a.pedidosEssenciais.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {a.riscosOuLacunas && a.riscosOuLacunas.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2">
          <h3 className="text-sm font-semibold text-amber-900">
            Riscos ou lacunas
          </h3>
          <ul className="mt-1 list-inside list-disc text-sm text-amber-900/90">
            {a.riscosOuLacunas.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      <details className="mt-4">
        <summary className="cursor-pointer text-xs font-medium text-stone-500 hover:text-stone-700">
          Ver análise completa (texto)
        </summary>
        <div className="mt-2 max-h-48 overflow-auto rounded-lg border border-stone-200 bg-stone-100/80 p-3 text-xs text-stone-700">
          <TextoJuridicoInline texto={triagem.estrategiaJuridica} onAbrirFls={onAbrirFls} />
        </div>
      </details>
    </>
  );
}

export function PreviewTriagemPeca({
  triagem,
  confirmando,
  onConfirmar,
  onVoltar,
  onReanalisar,
  onIncluirCobertura,
  rotuloVoltar = "Voltar ao formulário",
}: {
  triagem: PreviewTriagemData;
  confirmando?: boolean;
  onConfirmar: () => void;
  onVoltar: () => void;
  /** Nova triagem após editar o formulário (não consome cota). */
  onReanalisar?: () => void;
  onIncluirCobertura?: (itemId: string) => void;
  rotuloVoltar?: string;
}) {
  return (
    <section className="rounded-xl border-2 border-stone-400 bg-gradient-to-b from-stone-50 to-white p-5 shadow-md ring-1 ring-stone-200/80">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-emerald-900">
          Triagem — não consome cota
        </span>
        <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-950">
          A redação completa só debita 1 peça ao confirmar
        </span>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">
            Plano estratégico — conferir antes de redigir
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            A triagem leu o dossiê inteiro e definiu tópicos, teses e pedidos.
            Revise o plano; a redação seguirá estes títulos.
          </p>
        </div>
      </div>

      <PlanoEstrategicoCorpo triagem={triagem} onIncluirCobertura={onIncluirCobertura} />

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onVoltar}
          disabled={confirmando}
          className="rounded-lg border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-60"
        >
          {rotuloVoltar}
        </button>
        {onReanalisar && (
          <button
            type="button"
            onClick={onReanalisar}
            disabled={confirmando}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-60"
          >
            Reanalisar plano
          </button>
        )}
        <button
          type="button"
          onClick={onConfirmar}
          disabled={confirmando}
          className="rounded-lg bg-stone-700 px-6 py-2.5 text-sm font-semibold text-amber-50 shadow-sm hover:bg-stone-600 disabled:opacity-60"
        >
          {confirmando ? "Redigindo a peça…" : "Confirmar e redigir peça"}
        </button>
      </div>
    </section>
  );
}
