"use client";

import type { AnaliseReplicaContestacao } from "@/lib/replica-contestacao";

type Props = {
  analise: AnaliseReplicaContestacao;
  onAplicarEspecie?: () => void;
};

const ROTULO_TIPO: Record<string, string> = {
  preliminar: "Preliminar",
  merito: "Mérito",
  pedido: "Pedido do réu",
  outro: "Outro",
};

export function ReplicaContestacaoPainel({ analise, onAplicarEspecie }: Props) {
  if (!analise.detectada) return null;

  return (
    <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-950">
      <p className="font-medium">
        Contestação detectada — {analise.teses.length} tese
        {analise.teses.length === 1 ? "" : "s"} para impugnar
        {analise.confianca !== "alta" ? (
          <span className="ml-1 font-normal text-indigo-700">
            (confiança {analise.confianca})
          </span>
        ) : null}
      </p>
      <p className="mt-1 text-xs text-indigo-800">
        Na geração, o Redator receberá o mapa ponto a ponto. Revise os fatos antes
        de protocolar.
      </p>
      {analise.sugereEspecieReplica && onAplicarEspecie ? (
        <button
          type="button"
          onClick={onAplicarEspecie}
          className="mt-2 rounded-md border border-indigo-300 bg-white px-3 py-1.5 text-xs font-medium text-indigo-900 hover:bg-indigo-100"
        >
          Usar espécie Réplica
        </button>
      ) : null}
      {analise.teses.length > 0 ? (
        <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-xs">
          {analise.teses.map((t) => (
            <li
              key={t.id}
              className="rounded border border-indigo-100 bg-white/80 px-2.5 py-2"
            >
              <span className="font-semibold text-indigo-900">
                {t.rotulo}) {ROTULO_TIPO[t.tipo] ?? t.tipo}
              </span>
              <p className="mt-0.5 text-indigo-800">{t.trecho}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-indigo-700">
          Não foi possível listar itens numerados — a estrutura de réplica ainda
          será aplicada na redação.
        </p>
      )}
    </div>
  );
}
