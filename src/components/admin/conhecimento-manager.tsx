"use client";

import { useRef, useState } from "react";
import { CATEGORIAS_CONHECIMENTO } from "@/lib/base-conhecimento";

type Item = {
  id: string;
  titulo: string;
  categoria: string;
  texto: string;
  criado_em: string;
  arquivo_nome?: string | null;
  arquivo_path?: string | null;
  arquivo_url?: string | null;
};

type Modo = "texto" | "arquivo";

function formatarData(data: string) {
  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function ConhecimentoManager({
  itensIniciais,
}: {
  itensIniciais: Item[];
}) {
  const [itens, setItens] = useState<Item[]>(itensIniciais);
  const [modo, setModo] = useState<Modo>("texto");
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState<string>(CATEGORIAS_CONHECIMENTO[0]);
  const [texto, setTexto] = useState("");
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [removendoId, setRemovendoId] = useState<string | null>(null);
  const arquivoRef = useRef<HTMLInputElement>(null);

  function limparFormulario() {
    setTitulo("");
    setTexto("");
    setNomeArquivo(null);
    if (arquivoRef.current) arquivoRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(false);

    if (!titulo.trim()) {
      setErro("Preencha o título.");
      return;
    }

    setEnviando(true);
    try {
      let resposta: Response;

      if (modo === "arquivo") {
        const arquivo = arquivoRef.current?.files?.[0];
        if (!arquivo) {
          setErro("Selecione um arquivo PDF ou Word (.docx).");
          setEnviando(false);
          return;
        }

        const formData = new FormData();
        formData.append("titulo", titulo.trim());
        formData.append("categoria", categoria);
        formData.append("arquivo", arquivo);

        resposta = await fetch("/api/admin/conhecimento", {
          method: "POST",
          body: formData,
        });
      } else {
        if (!texto.trim()) {
          setErro("Preencha o texto/conteúdo.");
          setEnviando(false);
          return;
        }

        resposta = await fetch("/api/admin/conhecimento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titulo: titulo.trim(),
            categoria,
            texto: texto.trim(),
          }),
        });
      }

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.error ?? "Erro ao salvar.");
        return;
      }

      setItens((atuais) => [dados.item as Item, ...atuais]);
      limparFormulario();
      setSucesso(true);
    } catch {
      setErro("Falha na comunicação com o servidor. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  async function handleRemover(id: string) {
    setRemovendoId(id);
    try {
      const resposta = await fetch(`/api/admin/conhecimento?id=${id}`, {
        method: "DELETE",
      });
      if (!resposta.ok) return;
      setItens((atuais) => atuais.filter((item) => item.id !== id));
    } finally {
      setRemovendoId(null);
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
      >
        <h2 className="text-lg font-semibold text-white">Adicionar item</h2>
        <p className="mt-1 text-sm text-stone-500">
          Cadastre leis específicas, súmulas ou jurisprudências importantes,
          colando o texto ou enviando um arquivo PDF/Word. Elas serão
          buscadas automaticamente pelo tema da ação e usadas para
          fundamentar as peças geradas.
        </p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setModo("texto")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              modo === "texto"
                ? "bg-facto-gold text-facto-dark"
                : "border border-white/15 text-stone-300 hover:border-facto-gold/50 hover:text-white"
            }`}
          >
            Colar texto
          </button>
          <button
            type="button"
            onClick={() => setModo("arquivo")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              modo === "arquivo"
                ? "bg-facto-gold text-facto-dark"
                : "border border-white/15 text-stone-300 hover:border-facto-gold/50 hover:text-white"
            }`}
          >
            Enviar arquivo (PDF/Word)
          </button>
        </div>

        {erro && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
            {erro}
          </div>
        )}
        {sucesso && !erro && (
          <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
            Item salvo com sucesso.
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label
              htmlFor="conhecimentoTitulo"
              className="mb-1.5 block text-sm font-medium text-stone-300"
            >
              Título
            </label>
            <input
              id="conhecimentoTitulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Súmula 385 do STJ"
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-stone-600 outline-none focus:border-facto-gold/50 focus:ring-2 focus:ring-facto-gold/20"
            />
          </div>

          <div>
            <label
              htmlFor="conhecimentoCategoria"
              className="mb-1.5 block text-sm font-medium text-stone-300"
            >
              Categoria
            </label>
            <select
              id="conhecimentoCategoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-facto-gold/50 focus:ring-2 focus:ring-facto-gold/20"
            >
              {CATEGORIAS_CONHECIMENTO.map((c) => (
                <option key={c} value={c} className="bg-facto-dark">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {modo === "texto" ? (
          <div className="mt-4">
            <label
              htmlFor="conhecimentoTexto"
              className="mb-1.5 block text-sm font-medium text-stone-300"
            >
              Texto/Conteúdo
            </label>
            <textarea
              id="conhecimentoTexto"
              rows={8}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Cole aqui o texto integral da lei, súmula ou jurisprudência..."
              className="w-full resize-y rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm leading-relaxed text-white placeholder-stone-600 outline-none focus:border-facto-gold/50 focus:ring-2 focus:ring-facto-gold/20"
            />
          </div>
        ) : (
          <div className="mt-4">
            <label
              htmlFor="conhecimentoArquivo"
              className="mb-1.5 block text-sm font-medium text-stone-300"
            >
              Arquivo (PDF ou Word .docx — até 8 MB)
            </label>
            <input
              id="conhecimentoArquivo"
              ref={arquivoRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => setNomeArquivo(e.target.files?.[0]?.name ?? null)}
              className="block w-full cursor-pointer rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-stone-300 file:mr-3 file:rounded-md file:border-0 file:bg-facto-gold file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-facto-dark hover:file:bg-facto-gold/90"
            />
            <p className="mt-1.5 text-xs text-stone-500">
              O texto é extraído automaticamente do arquivo para ser buscado
              pelo sistema. Arquivos .doc antigos não são aceitos — salve
              como .docx antes de enviar. PDFs escaneados sem OCR (imagem)
              não têm texto extraível.
            </p>
            {nomeArquivo && (
              <p className="mt-1 text-xs text-facto-gold">
                Selecionado: {nomeArquivo}
              </p>
            )}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={enviando}
            className="rounded-lg bg-facto-gold px-6 py-2.5 text-sm font-semibold text-facto-dark transition hover:bg-facto-gold/90 disabled:opacity-60"
          >
            {enviando ? "Salvando..." : "Salvar item"}
          </button>
        </div>
      </form>

      <div>
        <h2 className="text-lg font-semibold text-white">
          Itens cadastrados ({itens.length})
        </h2>
        {itens.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">
            Nenhum item cadastrado ainda.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {itens.map((item) => (
              <details
                key={item.id}
                className="group rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="mr-2 rounded-full bg-facto-gold/10 px-2 py-0.5 text-xs font-medium text-facto-gold">
                      {item.categoria}
                    </span>
                    <span className="truncate text-sm font-medium text-white">
                      {item.titulo}
                    </span>
                    <span className="ml-2 text-xs text-stone-600">
                      {formatarData(item.criado_em)}
                    </span>
                    {item.arquivo_nome && (
                      <div className="mt-0.5 truncate text-xs text-stone-500">
                        📎 {item.arquivo_nome}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {item.arquivo_url && (
                      <a
                        href={item.arquivo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-medium text-stone-300 hover:text-facto-gold"
                      >
                        Baixar original
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemover(item.id);
                      }}
                      disabled={removendoId === item.id}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
                    >
                      {removendoId === item.id ? "Removendo..." : "Remover"}
                    </button>
                  </div>
                </summary>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-stone-400">
                  {item.texto}
                </p>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
