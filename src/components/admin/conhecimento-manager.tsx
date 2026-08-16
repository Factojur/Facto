"use client";

import { useMemo, useRef, useState } from "react";
import { CATEGORIAS_LASTRO } from "@/lib/base-conhecimento";

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

const ORDEM_CATEGORIAS = ["Súmula", "Jurisprudência"] as const;

/** Tribunais conhecidos — novos entram em "Outros" até aparecerem no título. */
const TRIBUNAIS_CONHECIDOS = [
  "STF",
  "STJ",
  "TST",
  "TSE",
  "STM",
  "TJAC",
  "TJAL",
  "TJAM",
  "TJAP",
  "TJBA",
  "TJCE",
  "TJDFT",
  "TJES",
  "TJGO",
  "TJMA",
  "TJMG",
  "TJMS",
  "TJMT",
  "TJPA",
  "TJPB",
  "TJPE",
  "TJPI",
  "TJPR",
  "TJRJ",
  "TJRN",
  "TJRO",
  "TJRR",
  "TJRS",
  "TJSC",
  "TJSE",
  "TJSP",
  "TJTO",
  "TRF1",
  "TRF2",
  "TRF3",
  "TRF4",
  "TRF5",
  "TRF6",
] as const;

function formatarData(data: string) {
  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Extrai tribunal do título (ex.: "TJSP — 1000…", "STJ — Súmula 479").
 */
export function inferirTribunal(titulo: string): string {
  const t = titulo.trim().toUpperCase();
  for (const trib of TRIBUNAIS_CONHECIDOS) {
    if (
      t.startsWith(`${trib} `) ||
      t.startsWith(`${trib}—`) ||
      t.startsWith(`${trib} -`) ||
      t.startsWith(`${trib}–`) ||
      t.includes(` ${trib} —`) ||
      t.includes(` ${trib} -`)
    ) {
      return trib;
    }
  }
  const m = t.match(/\b(T[JR][A-Z]{1,3}|ST[FJM]|TRF\d|TSE|STM)\b/);
  if (m?.[1]) return m[1];
  return "Outros";
}

function ordenarTribunais(a: string, b: string): number {
  if (a === "Outros") return 1;
  if (b === "Outros") return -1;
  const ia = TRIBUNAIS_CONHECIDOS.indexOf(
    a as (typeof TRIBUNAIS_CONHECIDOS)[number]
  );
  const ib = TRIBUNAIS_CONHECIDOS.indexOf(
    b as (typeof TRIBUNAIS_CONHECIDOS)[number]
  );
  if (ia >= 0 && ib >= 0) return ia - ib;
  if (ia >= 0) return -1;
  if (ib >= 0) return 1;
  return a.localeCompare(b, "pt-BR");
}

function SecaoRecolhivel({
  titulo,
  contagem,
  aberto,
  onToggle,
  children,
  nivel = 1,
}: {
  titulo: string;
  contagem: number;
  aberto: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  nivel?: 1 | 2;
}) {
  const pad = nivel === 1 ? "px-4 py-3" : "px-3 py-2.5";
  const border =
    nivel === 1
      ? "border-white/10 bg-white/[0.03]"
      : "border-white/8 bg-white/[0.02]";

  return (
    <div className={`rounded-xl border ${border}`}>
      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-center justify-between gap-3 ${pad} text-left transition hover:bg-white/[0.04]`}
        aria-expanded={aberto}
      >
        <span
          className={`font-semibold text-white ${nivel === 1 ? "text-base" : "text-sm"}`}
        >
          {titulo}
          <span className="ml-2 font-normal text-stone-500">({contagem})</span>
        </span>
        <span className="text-xs text-stone-500" aria-hidden>
          {aberto ? "▾ recolher" : "▸ expandir"}
        </span>
      </button>
      {aberto ? <div className="border-t border-white/5 p-3">{children}</div> : null}
    </div>
  );
}

function ItemLinha({
  item,
  removendoId,
  onRemover,
}: {
  item: Item;
  removendoId: string | null;
  onRemover: (id: string) => void;
}) {
  return (
    <details className="group rounded-lg border border-white/10 bg-black/20 px-3 py-2.5">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium text-white">{item.titulo}</span>
          <span className="ml-2 text-xs text-stone-600">
            {formatarData(item.criado_em)}
          </span>
          {item.arquivo_nome ? (
            <div className="mt-0.5 truncate text-xs text-stone-500">
              📎 {item.arquivo_nome}
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {item.arquivo_url ? (
            <a
              href={item.arquivo_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-medium text-stone-300 hover:text-facto-gold"
            >
              Baixar
            </a>
          ) : null}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemover(item.id);
            }}
            disabled={removendoId === item.id}
            className="rounded-lg px-2 py-1 text-xs font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
          >
            {removendoId === item.id ? "…" : "Remover"}
          </button>
        </div>
      </summary>
      <p className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-stone-400">
        {item.texto}
      </p>
      <p className="mt-2 text-xs text-stone-600">
        Para atualizar: remova este item e cadastre a versão nova (evita
        sobrescrita silenciosa).
      </p>
    </details>
  );
}

export function ConhecimentoManager({
  itensIniciais,
  totalDb,
}: {
  itensIniciais: Item[];
  /** Contagem exact do banco (pode igualar itensIniciais.length). */
  totalDb?: number;
}) {
  const [itens, setItens] = useState<Item[]>(itensIniciais);
  const [modo, setModo] = useState<Modo>("texto");
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState<string>(CATEGORIAS_LASTRO[0]);
  const [texto, setTexto] = useState("");
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [removendoId, setRemovendoId] = useState<string | null>(null);
  const arquivoRef = useRef<HTMLInputElement>(null);

  /** Categorias abertas; tribunais abertos: chave `Jurisprudência::TJSP`. */
  const [abertas, setAbertas] = useState<Record<string, boolean>>({});

  function toggle(chave: string) {
    setAbertas((prev) => ({ ...prev, [chave]: !prev[chave] }));
  }

  const totalExibido = totalDb ?? itens.length;

  const porCategoria = useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const cat of ORDEM_CATEGORIAS) map.set(cat, []);
    for (const item of itens) {
      const cat = ORDEM_CATEGORIAS.includes(
        item.categoria as (typeof ORDEM_CATEGORIAS)[number]
      )
        ? item.categoria
        : "Jurisprudência";
      const lista = map.get(cat) ?? [];
      lista.push(item);
      map.set(cat, lista);
    }
    return map;
  }, [itens]);

  const jurisPorTribunal = useMemo(() => {
    const juris = porCategoria.get("Jurisprudência") ?? [];
    const map = new Map<string, Item[]>();
    for (const item of juris) {
      const trib = inferirTribunal(item.titulo);
      const lista = map.get(trib) ?? [];
      lista.push(item);
      map.set(trib, lista);
    }
    return [...map.entries()].sort(([a], [b]) => ordenarTribunais(a, b));
  }, [porCategoria]);

  const sumulasPorOrgao = useMemo(() => {
    const sumulas = porCategoria.get("Súmula") ?? [];
    const map = new Map<string, Item[]>();
    for (const item of sumulas) {
      const trib = inferirTribunal(item.titulo);
      const lista = map.get(trib) ?? [];
      lista.push(item);
      map.set(trib, lista);
    }
    return [...map.entries()].sort(([a], [b]) => ordenarTribunais(a, b));
  }, [porCategoria]);

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
          Cadastre leis, súmulas ou jurisprudências (cole o texto ou envie
          PDF/Word). Para juris, prefira título com tribunal, ex.:{" "}
          <code className="text-stone-400">TJSP — 1000123-45.2024.8.26.0100</code>
          . Para atualizar um item existente: remova o antigo e cadastre o novo.
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
              placeholder="Ex: STJ — Súmula 479 · TJSP — 1000…"
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
              {CATEGORIAS_LASTRO.map((c) => (
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
              onChange={(e) =>
                setNomeArquivo(e.target.files?.[0]?.name ?? null)
              }
              className="block w-full cursor-pointer rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-stone-300 file:mr-3 file:rounded-md file:border-0 file:bg-facto-gold file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-facto-dark hover:file:bg-facto-gold/90"
            />
            <p className="mt-1.5 text-xs text-stone-500">
              O texto é extraído automaticamente. .doc antigo: salve como
              .docx. PDF só imagem (sem OCR) não extrai texto.
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
          Acervo ({totalExibido.toLocaleString("pt-BR")} no banco
          {itens.length !== totalExibido
            ? ` · ${itens.length.toLocaleString("pt-BR")} carregados`
            : ""}
          )
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Separado por categoria; jurisprudências (e súmulas) por tribunal.
          Seções recolhidas por padrão — expanda para editar/remover.
        </p>

        {itens.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">
            Nenhum item cadastrado ainda.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {ORDEM_CATEGORIAS.map((cat) => {
              const lista = porCategoria.get(cat) ?? [];
              const chaveCat = `cat:${cat}`;
              const abertoCat = Boolean(abertas[chaveCat]);

              return (
                <SecaoRecolhivel
                  key={cat}
                  titulo={cat === "Súmula" ? "Súmulas" : "Jurisprudências"}
                  contagem={lista.length}
                  aberto={abertoCat}
                  onToggle={() => toggle(chaveCat)}
                >
                  {lista.length === 0 ? (
                    <p className="text-sm text-stone-500">Nenhum item.</p>
                  ) : cat === "Jurisprudência" ? (
                    <div className="space-y-2">
                      {jurisPorTribunal.map(([trib, itensTrib]) => {
                        const chave = `jur:${trib}`;
                        return (
                          <SecaoRecolhivel
                            key={chave}
                            nivel={2}
                            titulo={trib}
                            contagem={itensTrib.length}
                            aberto={Boolean(abertas[chave])}
                            onToggle={() => toggle(chave)}
                          >
                            <div className="space-y-2">
                              {itensTrib.map((item) => (
                                <ItemLinha
                                  key={item.id}
                                  item={item}
                                  removendoId={removendoId}
                                  onRemover={handleRemover}
                                />
                              ))}
                            </div>
                          </SecaoRecolhivel>
                        );
                      })}
                    </div>
                  ) : cat === "Súmula" && sumulasPorOrgao.length > 1 ? (
                    <div className="space-y-2">
                      {sumulasPorOrgao.map(([org, itensOrg]) => {
                        const chave = `sum:${org}`;
                        return (
                          <SecaoRecolhivel
                            key={chave}
                            nivel={2}
                            titulo={org}
                            contagem={itensOrg.length}
                            aberto={Boolean(abertas[chave])}
                            onToggle={() => toggle(chave)}
                          >
                            <div className="space-y-2">
                              {itensOrg.map((item) => (
                                <ItemLinha
                                  key={item.id}
                                  item={item}
                                  removendoId={removendoId}
                                  onRemover={handleRemover}
                                />
                              ))}
                            </div>
                          </SecaoRecolhivel>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {lista.map((item) => (
                        <ItemLinha
                          key={item.id}
                          item={item}
                          removendoId={removendoId}
                          onRemover={handleRemover}
                        />
                      ))}
                    </div>
                  )}
                </SecaoRecolhivel>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
