"use client";

import type { PreviewTriagemData } from "@/components/dashboard/preview-triagem-peca";
import { PlanoEstrategicoCorpo } from "@/components/dashboard/preview-triagem-peca";
import {
  montarResumoEntendimentoChat,
  rotuloAreaChat,
  type EstadoCasoChat,
} from "@/lib/chat-minuta";

function EntendimentoLocalCard({
  resumo,
  areaRotulo,
}: {
  resumo: ReturnType<typeof montarResumoEntendimentoChat>;
  areaRotulo: string;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white/95 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
        Entendimento do caso
      </p>
      <p className="mt-2 text-sm leading-relaxed text-stone-700">
        {resumo.fatosResumo}
      </p>
      <dl className="mt-4 grid gap-2 text-sm text-stone-700 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium text-stone-500">Área</dt>
          <dd className="font-medium text-stone-900">{areaRotulo}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-stone-500">Espécie</dt>
          <dd>{resumo.especie}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-stone-500">Ação</dt>
          <dd>{resumo.tipoAcao}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-stone-500">Foro</dt>
          <dd>{resumo.foro}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium text-stone-500">Partes</dt>
          <dd>
            {resumo.autores} × {resumo.reus}
          </dd>
        </div>
      </dl>
      {resumo.pedidos.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-stone-500">Pedidos identificados</p>
          <ul className="mt-1 list-inside list-disc text-sm text-stone-700">
            {resumo.pedidos.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function PlanoCasoPainel({
  estado,
  triagem,
  carregando,
  confirmando,
  onConfirmarRedacao,
  onAtualizarPlano,
}: {
  estado: EstadoCasoChat;
  triagem: PreviewTriagemData | null;
  carregando?: boolean;
  confirmando?: boolean;
  onConfirmarRedacao: () => void;
  onAtualizarPlano?: () => void;
}) {
  const resumo = montarResumoEntendimentoChat(estado);
  const areaRotulo = rotuloAreaChat(estado.areaId);

  if (carregando && !triagem) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <EntendimentoLocalCard resumo={resumo} areaRotulo={areaRotulo} />
        <div
          className="rounded-xl border border-dashed border-stone-300 bg-white/80 p-6 text-center"
          aria-busy="true"
        >
          <div className="mx-auto max-w-sm space-y-2">
            <div className="h-3 w-3/4 animate-pulse rounded bg-stone-200" />
            <div className="h-3 w-full animate-pulse rounded bg-stone-100" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-stone-100" />
          </div>
          <p className="mt-4 text-sm text-stone-600">
            A IA está montando o plano estratégico (tópicos, teses e juris)…
          </p>
          <p className="mt-1 text-xs text-stone-500">Não consome cota de peça.</p>
        </div>
      </div>
    );
  }

  if (!triagem) {
    return (
      <div className="mx-auto max-w-3xl">
        <EntendimentoLocalCard resumo={resumo} areaRotulo={areaRotulo} />
        <p className="mt-4 text-center text-xs text-stone-500">
          Continue conversando à esquerda ou aguarde o plano estratégico.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <section className="rounded-xl border border-stone-200 bg-gradient-to-b from-stone-50 to-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-900">
            Plano do caso — não consome cota
          </span>
          {carregando && (
            <span className="text-[11px] text-stone-500">Atualizando…</span>
          )}
        </div>
        <h2 className="text-base font-semibold text-stone-900 sm:text-lg">
          Proposta estratégica — converse até ficar bom, depois redija
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Revise tópicos, teses e pedidos. A redação completa só debita 1 peça ao
          confirmar.
        </p>

        <PlanoEstrategicoCorpo triagem={triagem} />

        <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-stone-200 pt-4">
          {onAtualizarPlano && (
            <button
              type="button"
              onClick={onAtualizarPlano}
              disabled={confirmando || carregando}
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-60"
            >
              Atualizar plano
            </button>
          )}
          <button
            type="button"
            onClick={onConfirmarRedacao}
            disabled={confirmando || carregando}
            className="rounded-lg bg-stone-800 px-5 py-2 text-sm font-semibold text-amber-50 shadow-sm hover:bg-stone-700 disabled:opacity-60"
          >
            {confirmando ? "Redigindo a peça…" : "Confirmar e redigir (1 peça)"}
          </button>
        </div>
      </section>
    </div>
  );
}
