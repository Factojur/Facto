"use client";

import type { AlertaFatosPedidos } from "@/lib/alerta-fatos-pedidos";

export function AlertaFatosPedidosChips({
  alertas,
  titulo = "Conferência fatos × pedidos",
}: {
  alertas: AlertaFatosPedidos[];
  titulo?: string;
}) {
  if (!alertas.length) return null;

  return (
    <section className="rounded-lg border border-amber-200 bg-amber-50/90 p-4">
      <h3 className="text-sm font-semibold text-amber-950">{titulo}</h3>
      <p className="mt-1 text-xs text-amber-900/90">
        Revise antes de redigir ou protocolar — o FACTO não impede a geração.
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {alertas.map((a) => (
          <li
            key={a.id}
            className={`rounded-md border px-3 py-2 text-sm ${
              a.gravidade === "alerta"
                ? "border-amber-300 bg-white text-amber-950"
                : "border-stone-200 bg-white/80 text-stone-700"
            }`}
          >
            <span className="mr-1.5 font-medium uppercase tracking-wide text-[10px] text-stone-500">
              {a.gravidade === "alerta" ? "Atenção" : "Conferir"}
            </span>
            {a.mensagem}
          </li>
        ))}
      </ul>
    </section>
  );
}
