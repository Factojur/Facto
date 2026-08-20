"use client";

import { useState } from "react";
import {
  buscarEnderecoPorCep,
  formatarCep,
  formatarTelefone,
} from "@/lib/mascaras-endereco";
import {
  consultarCnpj,
  cnpjValido,
  formatarCnpj,
  cpfValido,
  formatarCpf,
  resumoReu,
  reuTemDadosMinimos,
  reuVazio,
  type ReuValue,
  type TipoReu,
} from "@/lib/reu-types";

function campoClasse(extra?: string) {
  return `w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200 ${extra ?? ""}`.trim();
}

function ReuEditor({
  reu,
  onChange,
  onSalvar,
  onCancelar,
  modoEdicao,
}: {
  reu: ReuValue;
  onChange: (r: ReuValue) => void;
  onSalvar: () => void;
  onCancelar: () => void;
  modoEdicao: boolean;
}) {
  const [buscandoCnpj, setBuscandoCnpj] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroCnpj, setErroCnpj] = useState<string | null>(null);
  const [erroCep, setErroCep] = useState<string | null>(null);
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);

  function atualizar(parcial: Partial<ReuValue>) {
    onChange({ ...reu, ...parcial });
  }

  function mudarTipo(tipo: TipoReu) {
    atualizar({ tipo });
  }

  async function aoCnpj(valor: string) {
    const formatado = formatarCnpj(valor);
    atualizar({ cnpj: formatado });
    setErroCnpj(null);
    if (!cnpjValido(formatado)) return;

    setBuscandoCnpj(true);
    try {
      const dados = await consultarCnpj(formatado);
      if (!dados) {
        setErroCnpj("CNPJ não encontrado. Preencha os dados manualmente.");
        return;
      }
      atualizar({
        cnpj: dados.cnpj,
        razaoSocial: dados.razaoSocial || reu.razaoSocial,
        nomeFantasia: dados.nomeFantasia || reu.nomeFantasia,
        cep: dados.cep || reu.cep,
        logradouro: dados.logradouro || reu.logradouro,
        numero: dados.numero || reu.numero,
        complemento: dados.complemento || reu.complemento,
        bairro: dados.bairro || reu.bairro,
        cidade: dados.cidade || reu.cidade,
        uf: dados.uf || reu.uf,
        email: dados.email || reu.email,
        telefone: dados.telefone
          ? formatarTelefone(dados.telefone)
          : reu.telefone,
      });
    } catch {
      setErroCnpj("Falha ao consultar CNPJ. Tente de novo ou preencha à mão.");
    } finally {
      setBuscandoCnpj(false);
    }
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
        logradouro: end.endereco || reu.logradouro,
        bairro: end.bairro || reu.bairro,
        cidade: end.cidade || reu.cidade,
        uf: end.uf || reu.uf,
      });
    } catch {
      setErroCep("Falha ao consultar CEP.");
    } finally {
      setBuscandoCep(false);
    }
  }

  function tentarSalvar() {
    if (!reuTemDadosMinimos(reu)) {
      setErroSalvar(
        reu.tipo === "pj"
          ? "Informe ao menos a razão social ou um CNPJ válido."
          : "Informe ao menos o nome completo ou um CPF válido."
      );
      return;
    }
    setErroSalvar(null);
    onSalvar();
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800">
          {modoEdicao ? "Editar réu" : "Novo réu"}
        </h3>
        <button
          type="button"
          onClick={onCancelar}
          className="text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          Cancelar
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2 text-slate-700">
          <input
            type="radio"
            name={`tipo-reu-${reu.id}`}
            checked={reu.tipo === "pj"}
            onChange={() => mudarTipo("pj")}
            className="text-stone-700 focus:ring-stone-500"
          />
          Pessoa jurídica
        </label>
        <label className="flex items-center gap-2 text-slate-700">
          <input
            type="radio"
            name={`tipo-reu-${reu.id}`}
            checked={reu.tipo === "pf"}
            onChange={() => mudarTipo("pf")}
            className="text-stone-700 focus:ring-stone-500"
          />
          Pessoa física
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {reu.tipo === "pj" ? (
          <>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                CNPJ
              </label>
              <input
                value={reu.cnpj}
                onChange={(e) => void aoCnpj(e.target.value)}
                placeholder="00.000.000/0000-00"
                className={campoClasse()}
              />
              {buscandoCnpj && (
                <p className="mt-1 text-xs text-slate-500">Consultando CNPJ…</p>
              )}
              {erroCnpj && (
                <p className="mt-1 text-xs text-amber-700">{erroCnpj}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Razão social
              </label>
              <input
                value={reu.razaoSocial}
                onChange={(e) => atualizar({ razaoSocial: e.target.value })}
                className={campoClasse()}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Nome fantasia (opcional)
              </label>
              <input
                value={reu.nomeFantasia}
                onChange={(e) => atualizar({ nomeFantasia: e.target.value })}
                className={campoClasse()}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Cartão CNPJ / comprovante (opcional)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) =>
                  atualizar({
                    documentoAnexoNome: e.target.files?.[0]?.name ?? null,
                  })
                }
                className="block w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-stone-700 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-amber-50"
              />
            </div>
          </>
        ) : (
          <>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Nome completo
              </label>
              <input
                value={reu.nomeCompleto}
                onChange={(e) => atualizar({ nomeCompleto: e.target.value })}
                className={campoClasse()}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                CPF
              </label>
              <input
                value={reu.cpf}
                onChange={(e) =>
                  atualizar({ cpf: formatarCpf(e.target.value) })
                }
                placeholder="000.000.000-00"
                className={campoClasse(
                  reu.cpf.replace(/\D/g, "").length === 11 && !cpfValido(reu.cpf)
                    ? "border-amber-400 focus:border-amber-500 focus:ring-amber-200"
                    : undefined
                )}
              />
              {reu.cpf.replace(/\D/g, "").length === 11 && !cpfValido(reu.cpf) && (
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
                value={reu.nacionalidade}
                onChange={(e) => atualizar({ nacionalidade: e.target.value })}
                className={campoClasse()}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Estado civil
              </label>
              <input
                value={reu.estadoCivil}
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
                value={reu.profissao}
                onChange={(e) => atualizar({ profissao: e.target.value })}
                className={campoClasse()}
              />
            </div>
          </>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            CEP
          </label>
          <input
            value={reu.cep}
            onChange={(e) => void aoCep(e.target.value)}
            placeholder="00000-000"
            className={campoClasse()}
          />
          {buscandoCep && (
            <p className="mt-1 text-xs text-slate-500">Buscando endereço…</p>
          )}
          {erroCep && <p className="mt-1 text-xs text-amber-700">{erroCep}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Logradouro
          </label>
          <input
            value={reu.logradouro}
            onChange={(e) => atualizar({ logradouro: e.target.value })}
            className={campoClasse()}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Número
          </label>
          <input
            value={reu.numero}
            onChange={(e) => atualizar({ numero: e.target.value })}
            className={campoClasse()}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Complemento
          </label>
          <input
            value={reu.complemento}
            onChange={(e) => atualizar({ complemento: e.target.value })}
            className={campoClasse()}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Bairro
          </label>
          <input
            value={reu.bairro}
            onChange={(e) => atualizar({ bairro: e.target.value })}
            className={campoClasse()}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Cidade
          </label>
          <input
            value={reu.cidade}
            onChange={(e) => atualizar({ cidade: e.target.value })}
            className={campoClasse()}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            UF
          </label>
          <input
            value={reu.uf}
            onChange={(e) =>
              atualizar({ uf: e.target.value.toUpperCase().slice(0, 2) })
            }
            maxLength={2}
            className={campoClasse()}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            E-mail (opcional)
          </label>
          <input
            type="email"
            value={reu.email}
            onChange={(e) => atualizar({ email: e.target.value })}
            className={campoClasse()}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Telefone (opcional)
          </label>
          <input
            value={reu.telefone}
            onChange={(e) =>
              atualizar({ telefone: formatarTelefone(e.target.value) })
            }
            className={campoClasse()}
          />
        </div>
      </div>

      {erroSalvar && (
        <p className="mt-3 text-sm text-amber-700">{erroSalvar}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={tentarSalvar}
          className="rounded-lg bg-stone-800 px-4 py-2.5 text-sm font-medium text-amber-50 transition hover:bg-stone-700"
        >
          {modoEdicao ? "Salvar alterações" : "Salvar réu"}
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

function ReuChecklistItem({
  reu,
  indice,
  onEditar,
  onRemover,
}: {
  reu: ReuValue;
  indice: number;
  onEditar: () => void;
  onRemover: () => void;
}) {
  const { titulo, detalhe } = resumoReu(reu);

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
          <p className="text-xs text-slate-400">
            {reu.tipo === "pj" ? "Pessoa jurídica" : "Pessoa física"}
          </p>
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

export function ReusSection({
  value,
  onChange,
  jaQualificado = false,
  rotuloPolo = "réu",
}: {
  value: ReuValue[];
  onChange: (reus: ReuValue[]) => void;
  jaQualificado?: boolean;
  rotuloPolo?: string;
}) {
  const [rascunho, setRascunho] = useState<ReuValue | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const editorAberto = rascunho != null;

  function abrirNovo() {
    setEditandoId(null);
    setRascunho(reuVazio());
  }

  function abrirEdicao(reu: ReuValue) {
    setEditandoId(reu.id);
    setRascunho({ ...reu });
  }

  function fecharEditor() {
    setRascunho(null);
    setEditandoId(null);
  }

  function salvarRascunho() {
    if (!rascunho) return;
    if (editandoId) {
      onChange(value.map((r) => (r.id === editandoId ? rascunho : r)));
    } else {
      onChange([...value, rascunho]);
    }
    fecharEditor();
  }

  function remover(id: string) {
    onChange(value.filter((r) => r.id !== id));
    if (editandoId === id) fecharEditor();
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold text-slate-800">
        {jaQualificado
          ? `${rotuloPolo.charAt(0).toUpperCase()}${rotuloPolo.slice(1)} (já qualificado nos autos)`
          : `Qualificação do(s) ${rotuloPolo}(s)`}
      </h2>
      <p className="mb-4 text-sm text-slate-500">
        {jaQualificado
          ? "Basta o nome ou a razão social. CNPJ e endereço são opcionais nesta peça."
          : `Preencha e salve cada ${rotuloPolo} na checklist. CNPJ preenche razão social; CEP completa o endereço.`}
      </p>

      {value.length > 0 ? (
        <ul className="mb-3 space-y-2">
          {value.map((reu, i) => (
            <ReuChecklistItem
              key={reu.id}
              reu={reu}
              indice={i}
              onEditar={() => abrirEdicao(reu)}
              onRemover={() => remover(reu.id)}
            />
          ))}
        </ul>
      ) : (
        !editorAberto && (
          <p className="mb-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
            Nenhum réu salvo ainda.
          </p>
        )
      )}

      {editorAberto && rascunho ? (
        <ReuEditor
          key={rascunho.id + (editandoId ?? "novo")}
          reu={rascunho}
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
          + Adicionar réu
        </button>
      )}
    </section>
  );
}
