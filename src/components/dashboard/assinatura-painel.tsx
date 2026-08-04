"use client";

import { useEffect, useState } from "react";
import type { AssinaturaResumoUI } from "@/lib/assinatura-format";

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
 * Painel de gerenciamento de assinatura.
 * Carrega dados reais via GET /api/assinatura e cancela via POST /api/assinatura/cancelar.
 */
export function AssinaturaPainel() {
  const [assinatura, setAssinatura] = useState<AssinaturaResumoUI | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erroLoad, setErroLoad] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [mensagemOk, setMensagemOk] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  async function carregar() {
    setCarregando(true);
    setErroLoad(null);
    try {
      const res = await fetch("/api/assinatura");
      const data = await res.json();
      if (!res.ok) {
        setErroLoad(data.error ?? "Falha ao carregar assinatura.");
        setAssinatura(null);
      } else {
        setAssinatura(data.assinatura ?? null);
      }
    } catch {
      setErroLoad("Falha de rede ao carregar assinatura.");
      setAssinatura(null);
    }
    setCarregando(false);
  }

  useEffect(() => {
    void carregar();
  }, []);

  function abrirModal() {
    setErroAcao(null);
    setMensagemOk(null);
    setModalAberto(true);
  }

  function fecharModal() {
    if (confirmando) return;
    setModalAberto(false);
  }

  async function confirmarCancelamento() {
    setConfirmando(true);
    setErroAcao(null);
    try {
      const res = await fetch("/api/assinatura/cancelar", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setErroAcao(data.error ?? "Não foi possível cancelar a assinatura.");
        setConfirmando(false);
        return;
      }
      if (data.assinatura) setAssinatura(data.assinatura);
      setMensagemOk(
        data.mensagem ??
          data.aviso ??
          "Assinatura cancelada no Mercado Pago."
      );
      setModalAberto(false);
    } catch {
      setErroAcao("Falha de rede ao cancelar. Tente novamente.");
    }
    setConfirmando(false);
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
              Acompanhe seu plano e cancele quando quiser. O cancelamento é
              processado no Mercado Pago.
            </p>
          </div>
          {assinatura && (
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${badgeClasses(assinatura.status)}`}
            >
              {assinatura.statusLabel}
            </span>
          )}
        </div>

        {carregando && (
          <p className="mt-6 text-sm text-slate-500">Carregando assinatura…</p>
        )}

        {!carregando && erroLoad && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erroLoad}
          </div>
        )}

        {!carregando && !erroLoad && !assinatura && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Nenhuma assinatura registrada para o e-mail desta conta. Se você
            pagou com outro e-mail, fale com o suporte.
          </div>
        )}

        {!carregando && assinatura && (
          <>
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
                  Próxima cobrança / ciclo
                </dt>
                <dd className="mt-1 text-base font-semibold text-slate-900">
                  {assinatura.proximaCobrancaLabel}
                </dd>
              </div>
            </dl>

            {assinatura.mensagemAcesso && (
              <p className="mt-4 text-sm text-slate-600">
                {assinatura.mensagemAcesso}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <p className="max-w-md text-xs leading-relaxed text-slate-500">
                Dentro de 7 dias: corte imediato (CDC). Depois disso: acesso até
                o fim do ciclo já pago, sem renovação.
              </p>
              <button
                type="button"
                onClick={abrirModal}
                disabled={!assinatura.podeCancelar}
                className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar assinatura
              </button>
            </div>
          </>
        )}

        {mensagemOk && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {mensagemOk}
          </div>
        )}
        {erroAcao && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erroAcao}
          </div>
        )}
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
              Se você está dentro dos 7 dias, o cancelamento encerra o acesso e
              solicita o estorno (pode levar até 30 dias para aparecer na
              fatura). Se já passou de 7 dias, sua assinatura
              continuará ativa até o fim do ciclo atual e não será renovada.
            </p>
            <p className="mt-3 text-sm font-medium text-slate-700">
              Esta ação cancela a cobrança recorrente no Mercado Pago e não pode
              ser desfeita por aqui.
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
                {confirmando ? "Cancelando no Mercado Pago..." : "Confirmar cancelamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
