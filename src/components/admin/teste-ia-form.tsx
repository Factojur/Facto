"use client";

import { useState } from "react";

type Citacao = {
  trecho: string;
  tipo: "lei" | "jurisprudencia";
  verificada: boolean;
};

type Resultado = {
  textoGerado: string;
  modelo: string;
  contextoUtilizado: { titulo: string; categoria: string }[];
  citacoes: Citacao[];
  marcadoresNaoEncontrado: number;
};

const EXEMPLO_FATOS =
  "Caso de TESTE (fictício): o autor, cliente de uma operadora de telefonia, teve seu nome " +
  "negativado por uma dívida já quitada. A negativação indevida causou constrangimento e " +
  "impossibilitou a abertura de crédito para compra de eletrodomésticos.";

export function TesteIaForm() {
  const [tipoAcao, setTipoAcao] = useState("Indenização por Danos Morais");
  const [fatosFicticios, setFatosFicticios] = useState(EXEMPLO_FATOS);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setResultado(null);

    if (!tipoAcao.trim() || !fatosFicticios.trim()) {
      setErro("Preencha o tipo de ação e os fatos fictícios.");
      return;
    }

    setCarregando(true);
    try {
      const resposta = await fetch("/api/admin/teste-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipoAcao: tipoAcao.trim(), fatosFicticios: fatosFicticios.trim() }),
      });
      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.error ?? "Erro ao gerar o texto de teste.");
        return;
      }

      setResultado(dados as Resultado);
    } catch {
      setErro("Falha na comunicação com o servidor. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  const citacoes = resultado?.citacoes ?? [];
  const jurisprudenciaSemLastro = citacoes.filter(
    (c) => c.tipo === "jurisprudencia" && !c.verificada
  );
  const jurisprudenciaVerificada = citacoes.filter(
    (c) => c.tipo === "jurisprudencia" && c.verificada
  );
  const leis = citacoes.filter((c) => c.tipo === "lei");

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm leading-relaxed text-amber-200">
        <p className="font-semibold text-amber-100">Use apenas casos fictícios aqui.</p>
        <p className="mt-1">
          Este sandbox chama a camada gratuita da Gemini API para testar a geração por IA
          fundamentada na base de conhecimento. A camada gratuita do Google pode usar os prompts
          enviados para treinar modelos — por isso, nunca cole fatos, nomes ou documentos reais de
          clientes aqui. É só para validar qualidade de escrita e a verificação automática de
          citações antes de decidir sobre uma camada paga (sem treinamento) para produção.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
      >
        <h2 className="text-lg font-semibold text-white">Gerar peça completa (teste)</h2>
        <p className="mt-1 text-sm text-stone-500">
          O Assistente Facto redige a peça inteira (endereçamento, qualificação, fatos, direito,
          provas e pedidos), com estrutura livre. Ele recebe apenas o tipo de ação, os fatos abaixo
          e os itens da base de conhecimento relacionados ao tema — nada mais.
        </p>

        {erro && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
            {erro}
            {/sobrecarreg|high demand|try again later|503/i.test(erro) && (
              <p className="mt-2 text-red-200/80">
                Dica: a camada gratuita do Gemini oscila em horários de pico. O sistema
                já tenta outros modelos automaticamente — se persistir, aguarde 1–2 minutos
                e clique em gerar de novo.
              </p>
            )}
          </div>
        )}

        <div className="mt-4">
          <label htmlFor="testeTipoAcao" className="mb-1.5 block text-sm font-medium text-stone-300">
            Tipo de ação
          </label>
          <input
            id="testeTipoAcao"
            type="text"
            value={tipoAcao}
            onChange={(e) => setTipoAcao(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-facto-gold/50 focus:ring-2 focus:ring-facto-gold/20"
          />
        </div>

        <div className="mt-4">
          <label htmlFor="testeFatos" className="mb-1.5 block text-sm font-medium text-stone-300">
            Fatos (fictícios)
          </label>
          <textarea
            id="testeFatos"
            rows={6}
            value={fatosFicticios}
            onChange={(e) => setFatosFicticios(e.target.value)}
            className="w-full resize-y rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm leading-relaxed text-white outline-none focus:border-facto-gold/50 focus:ring-2 focus:ring-facto-gold/20"
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={carregando}
            className="rounded-lg bg-facto-gold px-6 py-2.5 text-sm font-semibold text-facto-dark transition hover:bg-facto-gold/90 disabled:opacity-60"
          >
            {carregando ? "Gerando..." : "Gerar com IA (teste)"}
          </button>
        </div>
      </form>

      {resultado && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold text-white">Texto gerado</h3>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-stone-400">
                modelo: {resultado.modelo}
              </span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-stone-300">
              {resultado.textoGerado}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="text-sm font-semibold text-white">
                Contexto da base de conhecimento usado ({resultado.contextoUtilizado.length})
              </h3>
              {resultado.contextoUtilizado.length === 0 ? (
                <p className="mt-2 text-sm text-stone-500">
                  Nenhum item relacionado encontrado para este tema.
                </p>
              ) : (
                <ul className="mt-2 space-y-1.5 text-sm text-stone-400">
                  {resultado.contextoUtilizado.map((item, i) => (
                    <li key={i}>
                      <span className="text-facto-gold">{item.categoria}</span> — {item.titulo}
                    </li>
                  ))}
                </ul>
              )}
              {resultado.marcadoresNaoEncontrado > 0 && (
                <p className="mt-3 text-xs text-stone-500">
                  A própria IA sinalizou {resultado.marcadoresNaoEncontrado}{" "}
                  {resultado.marcadoresNaoEncontrado === 1 ? "trecho" : "trechos"} sem
                  fundamentação específica na base.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="text-sm font-semibold text-white">
                Verificação de citações ({citacoes.length})
              </h3>
              <p className="mt-1 text-xs text-stone-500">
                Leis/códigos podem vir do conhecimento do modelo. Súmulas e jurisprudência só
                podem vir da base injetada — se aparecerem sem lastro, é sinal de possível
                invenção.
              </p>
              {citacoes.length === 0 ? (
                <p className="mt-2 text-sm text-stone-500">
                  Nenhuma citação identificada no texto gerado.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {jurisprudenciaSemLastro.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-red-400">
                        Jurisprudência sem lastro na base — conferir antes de usar
                      </p>
                      <ul className="mt-1 space-y-1">
                        {jurisprudenciaSemLastro.map((c, i) => (
                          <li
                            key={i}
                            className="rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-sm text-red-300"
                          >
                            {c.trecho}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {jurisprudenciaVerificada.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                        Jurisprudência verificada (presente na base injetada)
                      </p>
                      <ul className="mt-1 space-y-1">
                        {jurisprudenciaVerificada.map((c, i) => (
                          <li
                            key={i}
                            className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-sm text-emerald-300"
                          >
                            {c.trecho}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {leis.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                        Leis e artigos citados (memória do modelo ou base)
                      </p>
                      <ul className="mt-1 space-y-1">
                        {leis.map((c, i) => (
                          <li
                            key={i}
                            className={`rounded-md border px-2.5 py-1.5 text-sm ${
                              c.verificada
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                : "border-white/10 bg-white/[0.04] text-stone-300"
                            }`}
                          >
                            {c.trecho}
                            {c.verificada && (
                              <span className="ml-2 text-xs text-emerald-400">(na base)</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
