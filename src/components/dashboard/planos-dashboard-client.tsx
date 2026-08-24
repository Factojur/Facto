"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BotaoAssinarPlano } from "@/components/landing/botao-assinar-plano";
import { PacotesExtrasPainel } from "@/components/dashboard/pacotes-extras-painel";
import { AssinaturaPainel } from "@/components/dashboard/assinatura-painel";
import {
  PLANO_ANUAL,
  PLANO_JEC,
  PLANO_MENSAL,
  PLANO_PRO,
  PLANO_PRO_ANUAL,
  type PlanoCheckoutId,
  type PlanoId,
  rotuloPlano,
} from "@/lib/planos-facto";
import type { ResumoCota } from "@/lib/cota-pecas";
import { rotuloBotaoPlanoTopbar } from "@/components/dashboard/botao-plano-topbar";

const LINK_JEC =
  (process.env.NEXT_PUBLIC_MP_LINK_JEC ?? "").trim() ||
  "https://mpago.la/1Mqkzgm";
const LINK_MENSAL =
  (process.env.NEXT_PUBLIC_MP_LINK_MENSAL ?? "").trim() ||
  "https://mpago.la/2jsFX7w";
const LINK_PRO =
  (process.env.NEXT_PUBLIC_MP_LINK_PRO ?? "").trim() ||
  "https://mpago.la/18Pihyh";
const LINK_ANUAL =
  (process.env.NEXT_PUBLIC_MP_LINK_ANUAL ?? "").trim() ||
  "https://mpago.la/26yzsZT";
const LINK_PRO_ANUAL =
  (process.env.NEXT_PUBLIC_MP_LINK_PRO_ANUAL ?? "").trim() ||
  "https://mpago.la/1xZjpYJ";

type Ciclo = "mensal" | "anual";

type Oferta = {
  id: PlanoCheckoutId;
  nome: string;
  preco: string;
  periodo: string;
  pecas: string;
  destaque?: boolean;
  beneficios: string[];
  hrefFallback: string;
};

function ofertasParaPlano(
  plano: PlanoId | null,
  ciclo: Ciclo
): { titulo: string; subtitulo: string; ofertas: Oferta[] } {
  const jec: Oferta = {
    id: "jec",
    nome: PLANO_JEC.rotulo,
    preco: PLANO_JEC.rotuloPreco,
    periodo: PLANO_JEC.rotuloPeriodo,
    pecas: `${PLANO_JEC.pecasPorMes} peças/mês`,
    beneficios: PLANO_JEC.beneficios.slice(0, 4),
    hrefFallback: LINK_JEC,
  };
  const completoMensal: Oferta = {
    id: "mensal",
    nome: PLANO_MENSAL.rotulo,
    preco: PLANO_MENSAL.rotuloPreco,
    periodo: PLANO_MENSAL.rotuloPeriodo,
    pecas: `${PLANO_MENSAL.pecasPorMes} peças/mês`,
    destaque: true,
    beneficios: PLANO_MENSAL.beneficios.slice(0, 4),
    hrefFallback: LINK_MENSAL,
  };
  const completoAnual: Oferta = {
    id: "anual",
    nome: PLANO_ANUAL.rotulo,
    preco: PLANO_ANUAL.rotuloPreco,
    periodo: PLANO_ANUAL.rotuloPeriodo,
    pecas: `${PLANO_ANUAL.pecasPorMes} peças/mês`,
    destaque: true,
    beneficios: PLANO_ANUAL.beneficios.slice(0, 4),
    hrefFallback: LINK_ANUAL,
  };
  const proMensal: Oferta = {
    id: "pro",
    nome: PLANO_PRO.rotulo,
    preco: PLANO_PRO.rotuloPreco,
    periodo: PLANO_PRO.rotuloPeriodo,
    pecas: `${PLANO_PRO.pecasPorMes} peças/mês`,
    beneficios: PLANO_PRO.beneficios.slice(0, 4),
    hrefFallback: LINK_PRO,
  };
  const proAnual: Oferta = {
    id: "pro_anual",
    nome: PLANO_PRO_ANUAL.rotulo,
    preco: PLANO_PRO_ANUAL.rotuloPreco,
    periodo: PLANO_PRO_ANUAL.rotuloPeriodo,
    pecas: `${PLANO_PRO_ANUAL.pecasPorMes} peças/mês`,
    beneficios: PLANO_PRO_ANUAL.beneficios.slice(0, 4),
    hrefFallback: LINK_PRO_ANUAL,
  };

  const completo = ciclo === "anual" ? completoAnual : completoMensal;
  const pro = ciclo === "anual" ? proAnual : proMensal;

  if (!plano || plano === "trial") {
    return {
      titulo: "Escolha seu plano",
      subtitulo:
        "Contrate na mesma conta — o acesso libera após a confirmação do Mercado Pago.",
      ofertas: [jec, completo, pro],
    };
  }

  if (plano === "jec") {
    return {
      titulo: "Faça upgrade",
      subtitulo:
        "Você está no Plano JEC. Suba para Completo ou Pro e libere todas as áreas.",
      ofertas: [completo, pro],
    };
  }

  if (plano === "mensal" || plano === "anual") {
    return {
      titulo: "Upgrade para Pro",
      subtitulo:
        "Mais peças, prioridade Redator avançado e teto maior no ciclo.",
      ofertas: [pro],
    };
  }

  if (plano === "pro" || plano === "pro_anual") {
    return {
      titulo: "Você está no Pro",
      subtitulo:
        "Plano máximo individual. Se precisar de mais peças neste mês, use um pacote extra.",
      ofertas: [],
    };
  }

  return {
    titulo: "Planos FACTO",
    subtitulo: "Gerencie sua assinatura ou fale com o suporte para Escritório.",
    ofertas: [completo, pro],
  };
}

function CardOferta({ oferta }: { oferta: Oferta }) {
  return (
    <div
      className={`flex flex-col rounded-2xl border p-5 ${
        oferta.destaque
          ? "border-facto-gold/50 bg-gradient-to-br from-amber-50 via-white to-stone-50 shadow-md shadow-amber-900/5"
          : "border-slate-200 bg-white shadow-sm"
      }`}
    >
      {oferta.destaque && (
        <span className="mb-2 inline-flex w-fit rounded-full bg-facto-gold/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
          Recomendado
        </span>
      )}
      <p className="text-lg font-bold text-slate-900">{oferta.nome}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
        {oferta.preco}
        <span className="text-sm font-medium text-slate-500">
          {oferta.periodo}
        </span>
      </p>
      <p className="mt-1 text-sm font-medium text-slate-600">{oferta.pecas}</p>
      <ul className="mt-4 flex-1 space-y-1.5 text-sm text-slate-600">
        {oferta.beneficios.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="text-facto-gold" aria-hidden>
              ✓
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5">
        <BotaoAssinarPlano
          planoId={oferta.id}
          hrefFallback={oferta.hrefFallback}
          variante={oferta.destaque ? "primario" : "dashboard"}
        >
          {oferta.id === "jec" ||
          oferta.id === "mensal" ||
          oferta.id === "anual" ||
          oferta.id === "pro" ||
          oferta.id === "pro_anual"
            ? `Assinar ${oferta.nome.replace(/^Plano\s+/i, "")}`
            : "Assinar"}
        </BotaoAssinarPlano>
      </div>
    </div>
  );
}

export function PlanosDashboardClient({
  planoInicial,
}: {
  planoInicial: PlanoId | null;
}) {
  const [ciclo, setCiclo] = useState<Ciclo>("mensal");
  const [cota, setCota] = useState<ResumoCota | null>(null);
  const plano = planoInicial;
  const { label } = rotuloBotaoPlanoTopbar(plano);
  const bloco = ofertasParaPlano(plano, ciclo);
  const mostraExtras =
    plano != null &&
    plano !== "trial" &&
    !String(plano).startsWith("escritorio");

  useEffect(() => {
    let cancel = false;
    void (async () => {
      try {
        const res = await fetch("/api/cota");
        if (!res.ok) return;
        const data = (await res.json()) as { cota?: ResumoCota };
        if (!cancel && data.cota) setCota(data.cota);
      } catch {
        /* silencioso */
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800/80">
          Assinatura FACTO
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
          {bloco.titulo}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          {bloco.subtitulo}
        </p>
        <p className="mt-3 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
          Situação atual:{" "}
          <span className="ml-1 font-semibold text-slate-900">
            {plano === "trial" || !plano
              ? "Teste grátis / sem plano"
              : rotuloPlano(plano) || label}
          </span>
        </p>
      </header>

      {bloco.ofertas.length > 0 && (
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Opções
            </h2>
            <div className="inline-flex rounded-full border border-slate-200 bg-white p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCiclo("mensal")}
                className={`rounded-full px-3 py-1.5 transition ${
                  ciclo === "mensal"
                    ? "bg-stone-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Mensal
              </button>
              <button
                type="button"
                onClick={() => setCiclo("anual")}
                className={`rounded-full px-3 py-1.5 transition ${
                  ciclo === "anual"
                    ? "bg-stone-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Anual
              </button>
            </div>
          </div>
          <div
            className={`grid gap-4 ${
              bloco.ofertas.length >= 3
                ? "md:grid-cols-3"
                : bloco.ofertas.length === 2
                  ? "md:grid-cols-2"
                  : "md:grid-cols-1 md:max-w-md"
            }`}
          >
            {bloco.ofertas.map((o) => (
              <CardOferta key={o.id} oferta={o} />
            ))}
          </div>
        </section>
      )}

      {mostraExtras && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Pacotes extras
          </h2>
          <PacotesExtrasPainel cota={cota} variante="painel" />
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Sua assinatura
        </h2>
        <AssinaturaPainel />
      </section>

      <p className="text-center text-xs text-slate-500">
        Dúvidas?{" "}
        <Link
          href="/dashboard/suporte"
          className="font-medium text-amber-800 underline-offset-2 hover:underline"
        >
          Fale com o suporte
        </Link>
        .
      </p>
    </div>
  );
}
