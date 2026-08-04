"use client";

export type PedidoItem = {
  id: string;
  descricao: string;
};

export function pedidoVazio(): PedidoItem {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `pedido-${Date.now()}`,
    descricao: "",
  };
}

export function PedidosSection({
  value,
  onChange,
}: {
  value: PedidoItem[];
  onChange: (v: PedidoItem[]) => void;
}) {
  function atualizar(id: string, descricao: string) {
    onChange(value.map((p) => (p.id === id ? { ...p, descricao } : p)));
  }

  function adicionar() {
    onChange([...value, pedidoVazio()]);
  }

  function remover(id: string) {
    onChange(value.filter((p) => p.id !== id));
  }

  return (
    <section
      id="secao-pedidos"
      className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="mb-1 text-lg font-semibold text-slate-800">
        Pedidos (opcional)
      </h2>
      <p className="mb-4 text-sm text-slate-500">
        O que o Juizado deve determinar.
      </p>
      <ul className="space-y-2">
        {value.map((p, idx) => (
          <li key={p.id} className="flex gap-2">
            <span className="mt-2.5 w-6 shrink-0 text-xs text-slate-400">
              {idx + 1}.
            </span>
            <input
              value={p.descricao}
              onChange={(e) => atualizar(p.id, e.target.value)}
              placeholder="Ex.: Condenar o réu ao pagamento de R$ …"
              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
            />
            <button
              type="button"
              onClick={() => remover(p.id)}
              className="shrink-0 rounded-lg border border-slate-200 px-2 text-xs text-slate-600 hover:bg-slate-50"
            >
              Remover
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={adicionar}
        className="mt-3 rounded-lg border border-stone-600 px-3 py-1.5 text-sm font-medium text-stone-800 hover:bg-stone-50"
      >
        + Adicionar pedido
      </button>
    </section>
  );
}
