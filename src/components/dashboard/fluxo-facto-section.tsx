const PASSOS = [
  {
    passo: "01",
    titulo: "Escolha a área",
    texto:
      "Entre no módulo da sua especialidade ou favorite para acessar com um clique.",
    icone: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M4 10l8-6 8 6v10H4V10z" strokeLinejoin="round" />
        <path d="M9 20v-6h6v6" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    passo: "02",
    titulo: "Informe o caso",
    texto:
      "Partes, pedidos, fatos e provas em formulário guiado — sem começar do zero.",
    icone: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M8 4h8l2 4v14H6V4h2z" strokeLinejoin="round" />
        <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    passo: "03",
    titulo: "Assistente Facto (IA)",
    texto:
      "A IA estrutura fundamentos, cláusulas e redação jurídica com rigor em cada área.",
    destaque: true,
    icone: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M12 3l1.5 4.5H18l-3.5 2.5 1.5 4.5L12 12l-4.5 2.5 1.5-4.5L6 7.5h4.5L12 3z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    passo: "04",
    titulo: "Peça pronta",
    texto:
      "Documento formatado, timbrado e exportável em Word ou PDF — pronto para protocolar.",
    icone: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M8 4h8l4 4v12H8V4z" strokeLinejoin="round" />
        <path d="M16 4v4h4M10 13h6M10 17h4" strokeLinecap="round" />
      </svg>
    ),
  },
] as const;

export function FluxoFactoSection() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(144,139,106,0.12),transparent_55%)]"
        aria-hidden
      />

      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-facto-gold">
          Como funciona
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white md:text-2xl">
          Do caso ao protocolo em 4 passos
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-500 md:text-base">
          Um fluxo pensado para a rotina do advogado — simples, rápido e com
          rigor jurídico do início ao fim.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {PASSOS.map((item) => (
            <article
              key={item.passo}
              className={`relative rounded-xl border p-5 transition ${
                "destaque" in item && item.destaque
                  ? "border-facto-gold/35 bg-facto-gold/[0.08] shadow-lg shadow-facto-gold/5"
                  : "border-white/5 bg-white/[0.02] hover:border-white/10"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs font-bold text-facto-gold">
                  {item.passo}
                </span>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    "destaque" in item && item.destaque
                      ? "bg-facto-gold/15 text-facto-gold"
                      : "bg-white/5 text-stone-400"
                  }`}
                >
                  {item.icone}
                </span>
              </div>
              <h3 className="mt-4 font-semibold text-white">{item.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">
                {item.texto}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-stone-600 md:text-sm">
          Cada área terá seu módulo dedicado — o JEC já está disponível; as
          demais chegam em breve.
        </p>
      </div>
    </section>
  );
}
