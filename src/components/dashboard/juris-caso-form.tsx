"use client";

import { useState } from "react";
import {
  jurisCasoTemConteudo,
  jurisCasoVazio,
  MAX_JURIS_CASO,
  resumoJurisCaso,
  type JurisCasoItem,
  type TipoFonteJurisCaso,
} from "@/lib/juris-caso-types";

function campoClasse() {
  return "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200";
}

export type ArquivoJurisPayload = {
  nome: string;
  mimeType: string;
  base64: string;
};

/** Item salvo no formulário, com payload de arquivo opcional para a API. */
export type JurisCasoSalvo = JurisCasoItem & {
  arquivo?: ArquivoJurisPayload | null;
};

async function lerArquivoComoBase64(file: File): Promise<ArquivoJurisPayload> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return {
    nome: file.name,
    mimeType: file.type || "application/pdf",
    base64: btoa(binary),
  };
}

function JurisEditor({
  item,
  arquivo,
  onChange,
  onArquivo,
  onSalvar,
  onCancelar,
  modoEdicao,
}: {
  item: JurisCasoItem;
  arquivo: ArquivoJurisPayload | null;
  onChange: (i: JurisCasoItem) => void;
  onArquivo: (a: ArquivoJurisPayload | null) => void;
  onSalvar: () => void;
  onCancelar: () => void;
  modoEdicao: boolean;
}) {
  const [erro, setErro] = useState<string | null>(null);
  const [lendoArquivo, setLendoArquivo] = useState(false);

  function atualizar(parcial: Partial<JurisCasoItem>) {
    onChange({ ...item, ...parcial });
  }

  async function aoArquivo(file: File | undefined) {
    setErro(null);
    if (!file) {
      onArquivo(null);
      atualizar({ nomeArquivo: null });
      return;
    }
    setLendoArquivo(true);
    try {
      const lido = await lerArquivoComoBase64(file);
      onArquivo(lido);
      atualizar({
        nomeArquivo: lido.nome,
        titulo: item.titulo.trim() || lido.nome.replace(/\.[^.]+$/, ""),
      });
    } catch {
      setErro("Não foi possível ler o arquivo.");
    } finally {
      setLendoArquivo(false);
    }
  }

  function tentarSalvar() {
    const temTexto = Boolean(item.texto.trim());
    const temArquivo = Boolean(arquivo || item.nomeArquivo);
    if (!temTexto && !temArquivo) {
      setErro("Cole o texto da ementa/decisão ou anexe um PDF/Word.");
      return;
    }
    if (!item.titulo.trim() && !temArquivo) {
      setErro("Informe um título (ex.: tribunal e número do processo).");
      return;
    }
    setErro(null);
    onSalvar();
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800">
          {modoEdicao ? "Editar fonte" : "Nova jurisprudência / súmula"}
        </h3>
        <button
          type="button"
          onClick={onCancelar}
          className="text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          Cancelar
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Tipo
          </label>
          <select
            value={item.tipo}
            onChange={(e) =>
              atualizar({ tipo: e.target.value as TipoFonteJurisCaso })
            }
            className={campoClasse()}
          >
            <option value="acordao">Acórdão / colegiado</option>
            <option value="sumula">Súmula</option>
            <option value="decisao">Decisão monocrática</option>
            <option value="outro">Outro precedente</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Título / identificação
          </label>
          <input
            value={item.titulo}
            onChange={(e) => atualizar({ titulo: e.target.value })}
            placeholder="Ex.: STJ — REsp 1.234.567/SP"
            className={campoClasse()}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Arquivo (PDF ou Word) — opcional
          </label>
          <input
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => void aoArquivo(e.target.files?.[0])}
            className="block w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-stone-700 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-amber-50"
          />
          {lendoArquivo && (
            <p className="mt-1 text-xs text-slate-500">Lendo arquivo…</p>
          )}
          {(arquivo?.nome || item.nomeArquivo) && !lendoArquivo && (
            <p className="mt-1 text-xs text-slate-500">
              Arquivo: {arquivo?.nome || item.nomeArquivo}
            </p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Ou cole ementa / trechos do voto
          </label>
          <textarea
            rows={7}
            value={item.texto}
            onChange={(e) => atualizar({ texto: e.target.value })}
            placeholder="Cole a ementa e os trechos do voto que interessam ao caso…"
            className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-800 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
          />
          <p className="mt-1.5 text-xs text-slate-500">
            Se houver texto colado e arquivo, o{" "}
            <strong className="font-medium">texto colado tem prioridade</strong>{" "}
            na leitura.
          </p>
        </div>
      </div>

      {erro && <p className="mt-3 text-sm text-amber-700">{erro}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={tentarSalvar}
          className="rounded-lg bg-stone-800 px-4 py-2.5 text-sm font-medium text-amber-50 transition hover:bg-stone-700"
        >
          {modoEdicao ? "Salvar alterações" : "Salvar fonte"}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-white"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export function JurisCasoSection({
  value,
  onChange,
}: {
  value: JurisCasoSalvo[];
  onChange: (itens: JurisCasoSalvo[]) => void;
}) {
  const [ativo, setAtivo] = useState(false);
  const [rascunho, setRascunho] = useState<JurisCasoItem | null>(null);
  const [arquivoRascunho, setArquivoRascunho] =
    useState<ArquivoJurisPayload | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const editorAberto = rascunho != null;
  const secaoVisivel = ativo || value.length > 0;

  function abrirNovo() {
    if (value.length >= MAX_JURIS_CASO) return;
    setEditandoId(null);
    setArquivoRascunho(null);
    setRascunho(jurisCasoVazio());
  }

  function abrirEdicao(item: JurisCasoSalvo) {
    setEditandoId(item.id);
    setArquivoRascunho(item.arquivo ?? null);
    setRascunho({
      id: item.id,
      tipo: item.tipo,
      titulo: item.titulo,
      texto: item.texto,
      nomeArquivo: item.nomeArquivo,
    });
  }

  function fecharEditor() {
    setRascunho(null);
    setArquivoRascunho(null);
    setEditandoId(null);
  }

  function salvarRascunho() {
    if (!rascunho || !jurisCasoTemConteudo(rascunho)) return;

    const anterior = editandoId
      ? value.find((v) => v.id === editandoId)
      : undefined;
    const arquivo = arquivoRascunho ?? anterior?.arquivo ?? null;

    const salvo: JurisCasoSalvo = {
      id: rascunho.id,
      tipo: rascunho.tipo,
      titulo: rascunho.titulo.trim(),
      texto: rascunho.texto,
      nomeArquivo: rascunho.nomeArquivo ?? arquivo?.nome ?? null,
      arquivo,
    };

    if (editandoId) {
      onChange(value.map((v) => (v.id === editandoId ? salvo : v)));
    } else {
      onChange([...value, salvo]);
    }
    fecharEditor();
  }

  function remover(id: string) {
    onChange(value.filter((v) => v.id !== id));
    if (editandoId === id) fecharEditor();
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold text-slate-800">
        Jurisprudência e súmulas do caso (opcional)
      </h2>
      <p className="mb-4 text-sm text-slate-500">
        Anexe acórdãos, súmulas ou decisões favoráveis ao caso. A IA lê a
        ementa/voto, cita no padrão forense e encaixa em DOS FATOS ou DO
        DIREITO — sem inventar número de processo fora do que você enviar.
      </p>

      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={secaoVisivel}
          onChange={(e) => {
            const on = e.target.checked;
            setAtivo(on);
            if (!on) {
              onChange([]);
              fecharEditor();
            }
          }}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-stone-700 focus:ring-stone-500"
        />
        <span>
          Quero anexar jurisprudência ou súmula pertinente a este caso
        </span>
      </label>

      {secaoVisivel && (
        <div className="mt-4 space-y-3">
          {value.length > 0 ? (
            <ul className="space-y-2">
              {value.map((item, i) => {
                const { titulo, detalhe } = resumoJurisCaso(item);
                return (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5"
                  >
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-stone-400 bg-stone-50 text-[11px] font-semibold text-stone-700"
                      aria-hidden
                    >
                      ✓
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        <span className="text-slate-400">{i + 1}.</span>{" "}
                        {titulo}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {detalhe}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => abrirEdicao(item)}
                        className="text-xs font-medium text-stone-700 hover:text-stone-900"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => remover(item.id)}
                        className="text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        Remover
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            !editorAberto && (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                Nenhuma fonte salva ainda.
              </p>
            )
          )}

          {editorAberto && rascunho ? (
            <JurisEditor
              key={rascunho.id + (editandoId ?? "novo")}
              item={rascunho}
              arquivo={arquivoRascunho}
              onChange={setRascunho}
              onArquivo={setArquivoRascunho}
              onSalvar={salvarRascunho}
              onCancelar={fecharEditor}
              modoEdicao={editandoId != null}
            />
          ) : (
            value.length < MAX_JURIS_CASO && (
              <button
                type="button"
                onClick={abrirNovo}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                + Adicionar jurisprudência / súmula
              </button>
            )
          )}

          {value.length >= MAX_JURIS_CASO && !editorAberto && (
            <p className="text-xs text-slate-500">
              Limite de {MAX_JURIS_CASO} fontes por peça (para caber no tempo de
              geração).
            </p>
          )}
        </div>
      )}
    </section>
  );
}
