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
  formatarCpf,
  reuVazio,
  type ReuValue,
  type TipoReu,
} from "@/lib/reu-types";

function campoClasse() {
  return "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200";
}

function ReuCard({
  reu,
  indice,
  total,
  onChange,
  onRemover,
}: {
  reu: ReuValue;
  indice: number;
  total: number;
  onChange: (r: ReuValue) => void;
  onRemover: () => void;
}) {
  const [buscandoCnpj, setBuscandoCnpj] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroCnpj, setErroCnpj] = useState<string | null>(null);
  const [erroCep, setErroCep] = useState<string | null>(null);

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

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800">
          Réu {indice + 1}
          {total > 1 ? ` de ${total}` : ""}
        </h3>
        {total > 1 && (
          <button
            type="button"
            onClick={onRemover}
            className="text-xs font-medium text-red-600 hover:text-red-700"
          >
            Remover
          </button>
        )}
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
                className={campoClasse()}
              />
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
    </div>
  );
}

export function ReusSection({
  value,
  onChange,
}: {
  value: ReuValue[];
  onChange: (reus: ReuValue[]) => void;
}) {
  function atualizarEm(i: number, reu: ReuValue) {
    onChange(value.map((r, idx) => (idx === i ? reu : r)));
  }

  function remover(i: number) {
    if (value.length <= 1) {
      onChange([reuVazio()]);
      return;
    }
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold text-slate-800">
        Qualificação do(s) réu(s)
      </h2>
      <p className="mb-4 text-sm text-slate-500">
        Dados da parte passiva para o trecho &quot;em face de…&quot;. Em pessoa
        jurídica, o CNPJ busca razão social e endereço (BrasilAPI). O CEP
        completa o endereço (ViaCEP).
      </p>

      <div className="space-y-4">
        {value.map((reu, i) => (
          <ReuCard
            key={reu.id}
            reu={reu}
            indice={i}
            total={value.length}
            onChange={(r) => atualizarEm(i, r)}
            onRemover={() => remover(i)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange([...value, reuVazio()])}
        className="mt-4 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        + Adicionar outro réu
      </button>
    </section>
  );
}
