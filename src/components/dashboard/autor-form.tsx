"use client";

import { useState, type ReactNode } from "react";
import {
  buscarEnderecoPorCep,
  formatarCep,
  formatarTelefone,
} from "@/lib/mascaras-endereco";
import {
  LISTA_UFS,
  autorTemDadosMinimos,
  autorVazio,
  cpfValido,
  formatarCpf,
  formatarRgNumero,
  resumoAutor,
  type AutorValue,
} from "@/lib/autor-types";

function campoClasse(extra?: string) {
  return `w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200 ${extra ?? ""}`.trim();
}

function AutorEditor({
  autor,
  onChange,
  onSalvar,
  onCancelar,
  modoEdicao,
}: {
  autor: AutorValue;
  onChange: (a: AutorValue) => void;
  onSalvar: () => void;
  onCancelar: () => void;
  modoEdicao: boolean;
}) {
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroCep, setErroCep] = useState<string | null>(null);
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);

  function atualizar(parcial: Partial<AutorValue>) {
    onChange({ ...autor, ...parcial });
  }

  async function aoCep(valor: string) {
    const formatado = formatarCep(valor);
    atualizar({ cep: formatado });
    setErroCep(null);
    if (formatado.replace(/\D/g, "").length !== 8) return;

    setBuscandoCep(true);
    try {
      const end = await buscarEnderecoPorCep(formatado);
      if (!end) {
        setErroCep("CEP não encontrado.");
        return;
      }
      atualizar({
        cep: end.cep,
        logradouro: end.endereco || autor.logradouro,
        bairro: end.bairro || autor.bairro,
        cidade: end.cidade || autor.cidade,
        uf: end.uf || autor.uf,
      });
    } catch {
      setErroCep("Falha ao consultar CEP.");
    } finally {
      setBuscandoCep(false);
    }
  }

  function tentarSalvar() {
    if (!autorTemDadosMinimos(autor)) {
      setErroSalvar(
        "Informe ao menos o nome completo ou um CPF válido."
      );
      return;
    }
    setErroSalvar(null);
    onSalvar();
  }

  const cpfDigits = autor.cpf.replace(/\D/g, "");
  const cpfInvalido = cpfDigits.length === 11 && !cpfValido(autor.cpf);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800">
          {modoEdicao ? "Editar autor" : "Novo autor"}
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
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Nome completo
          </label>
          <input
            value={autor.nomeCompleto}
            onChange={(e) => atualizar({ nomeCompleto: e.target.value })}
            className={campoClasse()}
            autoComplete="name"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            CPF
          </label>
          <input
            value={autor.cpf}
            onChange={(e) => atualizar({ cpf: formatarCpf(e.target.value) })}
            placeholder="000.000.000-00"
            className={campoClasse(
              cpfInvalido
                ? "border-amber-400 focus:border-amber-500 focus:ring-amber-200"
                : undefined
            )}
          />
          {cpfInvalido && (
            <p className="mt-1 text-xs text-amber-700">
              CPF com dígitos verificadores inválidos — confira antes de gerar.
            </p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Nacionalidade
          </label>
          <input
            value={autor.nacionalidade}
            onChange={(e) => atualizar({ nacionalidade: e.target.value })}
            className={campoClasse()}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Estado civil
          </label>
          <input
            value={autor.estadoCivil}
            onChange={(e) => atualizar({ estadoCivil: e.target.value })}
            placeholder="solteiro(a), casado(a)…"
            className={campoClasse()}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Profissão
          </label>
          <input
            value={autor.profissao}
            onChange={(e) => atualizar({ profissao: e.target.value })}
            className={campoClasse()}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            RG
          </label>
          <input
            value={autor.rgNumero}
            onChange={(e) =>
              atualizar({ rgNumero: formatarRgNumero(e.target.value) })
            }
            placeholder="00.000.000-0"
            className={campoClasse()}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Estado emissor do RG
          </label>
          <select
            value={autor.rgUf}
            onChange={(e) => atualizar({ rgUf: e.target.value })}
            className={campoClasse()}
          >
            <option value="">UF</option>
            {LISTA_UFS.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            CEP
          </label>
          <input
            value={autor.cep}
            onChange={(e) => void aoCep(e.target.value)}
            placeholder="00000-000"
            className={campoClasse()}
          />
          {buscandoCep && (
            <p className="mt-1 text-xs text-slate-500">Consultando CEP…</p>
          )}
          {erroCep && <p className="mt-1 text-xs text-amber-700">{erroCep}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Número
          </label>
          <input
            value={autor.numero}
            onChange={(e) => atualizar({ numero: e.target.value })}
            className={campoClasse()}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Logradouro
          </label>
          <input
            value={autor.logradouro}
            onChange={(e) => atualizar({ logradouro: e.target.value })}
            className={campoClasse()}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Complemento
          </label>
          <input
            value={autor.complemento}
            onChange={(e) => atualizar({ complemento: e.target.value })}
            className={campoClasse()}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Bairro
          </label>
          <input
            value={autor.bairro}
            onChange={(e) => atualizar({ bairro: e.target.value })}
            className={campoClasse()}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Cidade
          </label>
          <input
            value={autor.cidade}
            onChange={(e) => atualizar({ cidade: e.target.value })}
            className={campoClasse()}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            UF
          </label>
          <select
            value={autor.uf}
            onChange={(e) => atualizar({ uf: e.target.value })}
            className={campoClasse()}
          >
            <option value="">UF</option>
            {LISTA_UFS.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            E-mail
          </label>
          <input
            type="email"
            value={autor.email}
            onChange={(e) => atualizar({ email: e.target.value })}
            className={campoClasse()}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Telefone
          </label>
          <input
            value={autor.telefone}
            onChange={(e) =>
              atualizar({ telefone: formatarTelefone(e.target.value) })
            }
            placeholder="(00) 00000-0000"
            className={campoClasse()}
          />
        </div>
      </div>

      {erroSalvar && (
        <p className="mt-3 text-xs text-amber-800">{erroSalvar}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={tentarSalvar}
          className="rounded-lg bg-stone-800 px-4 py-2.5 text-sm font-medium text-amber-50 transition hover:bg-stone-700"
        >
          {modoEdicao ? "Salvar alterações" : "Salvar autor"}
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

function AutorChecklistItem({
  autor,
  indice,
  onEditar,
  onRemover,
}: {
  autor: AutorValue;
  indice: number;
  onEditar: () => void;
  onRemover: () => void;
}) {
  const { titulo, detalhe } = resumoAutor(autor);

  return (
    <li className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-stone-400 bg-stone-50 text-[11px] font-semibold text-stone-700"
        aria-hidden
      >
        ✓
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">
          <span className="text-slate-400">{indice + 1}.</span> {titulo}
        </p>
        {detalhe ? (
          <p className="truncate text-xs text-slate-500">{detalhe}</p>
        ) : (
          <p className="text-xs text-slate-400">Pessoa física</p>
        )}
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onEditar}
          className="text-xs font-medium text-stone-700 hover:text-stone-900"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={onRemover}
          className="text-xs font-medium text-red-600 hover:text-red-700"
        >
          Remover
        </button>
      </div>
    </li>
  );
}

/**
 * Qualificação da(s) parte(s) autora(s) — checklist compacta (como réus).
 * Nome/OAB do advogado continuam no Perfil.
 */
export function AutorSection({
  value,
  onChange,
  children,
  jaQualificado = false,
  rotuloPolo = "autor",
}: {
  value: AutorValue[];
  onChange: (autores: AutorValue[]) => void;
  children?: ReactNode;
  jaQualificado?: boolean;
  rotuloPolo?: string;
}) {
  const [rascunho, setRascunho] = useState<AutorValue | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const editorAberto = rascunho != null;

  function abrirNovo() {
    setEditandoId(null);
    setRascunho(autorVazio());
  }

  function abrirEdicao(autor: AutorValue) {
    setEditandoId(autor.id);
    setRascunho({ ...autor });
  }

  function fecharEditor() {
    setRascunho(null);
    setEditandoId(null);
  }

  function salvarRascunho() {
    if (!rascunho) return;
    if (editandoId) {
      onChange(value.map((a) => (a.id === editandoId ? rascunho : a)));
    } else {
      onChange([...value, rascunho]);
    }
    fecharEditor();
  }

  function remover(id: string) {
    onChange(value.filter((a) => a.id !== id));
    if (editandoId === id) fecharEditor();
  }

  return (
    <section
      id="secao-autor"
      className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="mb-1 text-lg font-semibold text-slate-800">
        {jaQualificado
          ? `${rotuloPolo.charAt(0).toUpperCase()}${rotuloPolo.slice(1)} (já qualificado nos autos)`
          : `Dados do ${rotuloPolo}`}
      </h2>
      <p className="mb-4 text-sm text-slate-500">
        {jaQualificado
          ? "Nesta peça as partes já constam do processo. Basta o nome (a análise dos autos preenche quando possível). CPF e endereço são opcionais."
          : `Cadastre e salve cada ${rotuloPolo} na lista abaixo. Nome e OAB do advogado saem do seu Perfil — não precisam ser digitados aqui.`}
      </p>

      {value.length > 0 ? (
        <ul className="mb-3 space-y-2">
          {value.map((autor, i) => (
            <AutorChecklistItem
              key={autor.id}
              autor={autor}
              indice={i}
              onEditar={() => abrirEdicao(autor)}
              onRemover={() => remover(autor.id)}
            />
          ))}
        </ul>
      ) : (
        !editorAberto && (
          <p className="mb-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
            Nenhum autor cadastrado. Use “Adicionar autor” para começar.
          </p>
        )
      )}

      {editorAberto && rascunho ? (
        <AutorEditor
          key={rascunho.id + (editandoId ?? "novo")}
          autor={rascunho}
          onChange={setRascunho}
          onSalvar={salvarRascunho}
          onCancelar={fecharEditor}
          modoEdicao={editandoId != null}
        />
      ) : (
        <button
          type="button"
          onClick={abrirNovo}
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          + Adicionar autor
        </button>
      )}

      {children ? (
        <div className="mt-5 border-t border-slate-100 pt-5">{children}</div>
      ) : null}
    </section>
  );
}
