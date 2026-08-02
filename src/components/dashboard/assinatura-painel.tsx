"use client";

import { useState } from "react";

export type AssinaturaResumoUI = {
  /** Ex.: "Plano Mensal" | "Plano Anual" */
  planoLabel: string;
  /** Ex.: "Ativo" | "Cancelado" | "Pausado" */
  statusLabel: string;
  /** Status técnico para estilizar o badge */
  status: "ativo" | "cancelado" | "pausado" | "pendente";
  /** Data formatada da próxima cobrança (ou fim do ciclo) */
  proximaCobrancaLabel: string;
};

const ASSINATURA_DEMO: AssinaturaResumoUI = {
  planoLabel: "Plano Mensal",
  statusLabel: "Ativo",
  status: "ativo",
  proximaCobrancaLabel: "02 de setembro de 2026",
};

function badgeClasses(status: AssinaturaResumoUI["status"]): string {
  switch (status) {
    case "ativo":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200";
    case "cancelado":
      return "bg-red-50 text-red-800 ring-red-200";
    case "pausado":
      return "bg-amber-50 text-amber-900 ring-amber-200";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}

/**
 * Painel de gerenciamento de assinatura (UI).
 * Dados demo por enquanto — integração Mercado Pago no próximo passo.
 */
export function AssinaturaPainel({
  assinatura = ASSINATURA_DEMO,
}: {
  assinatura?: AssinaturaResumoUI;
}) {
  const [modalAberto, setModalAberto] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  function abrirModal() {
    setModalAberto(true);
  }

  function fecharModal() {
    if (confirmando) return;
    setModalAberto(false);
  }

  async function confirmarCancelamento() {
    setConfirmando(true);
    // Placeholder: próxima etapa chama a API do Mercado Pago.
    console.log("[FACTO Assinatura] cancelamento solicitado", assinatura);
    await new Promise((r) => setTimeout(r, 400));
    setConfirmando(false);
    setModalAberto(false);
    window.alert(
      "Solicitação de cancelamento registrada (interface). Em breve conectaremos ao Mercado Pago."
    );
  }

  return (
    <>
      <section
        id="assinatura"
        className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Gerenciamento de assinatura
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Acompanhe seu plano e, se precisar, cancele quando quiser.
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${badgeClasses(assinatura.status)}`}
          >
            {assinatura.statusLabel}
          </span>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Plano atual
            </dt>
            <dd className="mt-1 text-base font-semibold text-slate-900">
              {assinatura.planoLabel} — {assinatura.statusLabel}
            </dd>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Próxima cobrança
            </dt>
            <dd className="mt-1 text-base font-semibold text-slate-900">
              {assinatura.proximaCobrancaLabel}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <p className="max-w-md text-xs leading-relaxed text-slate-500">
            Cancelamentos seguem a regra dos 7 dias de teste e o ciclo vigente.
            Detalhes aparecem na confirmação.
          </p>
          <button
            type="button"
            onClick={abrirModal}
            disabled={assinatura.status === "cancelado"}
            className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar assinatura
          </button>
        </div>
      </section>

      {modalAberto && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-cancelar-titulo"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Fechar"
            onClick={fecharModal}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3
              id="modal-cancelar-titulo"
              className="text-lg font-semibold text-slate-900"
            >
              Confirmar cancelamento
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Se você está dentro dos 7 dias de teste, o cancelamento estorna o
              valor automaticamente. Se já passou de 7 dias, sua assinatura
              continuará ativa até o fim do ciclo atual e não será renovada.
            </p>
            <p className="mt-3 text-sm text-slate-500">
              Deseja continuar com o cancelamento?
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={fecharModal}
                disabled={confirmando}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Manter assinatura
              </button>
              <button
                type="button"
                onClick={confirmarCancelamento}
                disabled={confirmando}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
              >
                {confirmando ? "Cancelando..." : "Confirmar cancelamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
