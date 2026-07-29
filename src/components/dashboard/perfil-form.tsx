"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { PerfilUsuario } from "@/lib/perfil-types";
import {
  buscarEnderecoPorCep,
  formatarCep,
  formatarTelefone,
} from "@/lib/mascaras-endereco";
import { createClient } from "@/lib/supabase/client";

function campo(
  id: string,
  label: string,
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  const { className, readOnly, ...rest } = props;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        readOnly={readOnly}
        className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-facto-gold focus:ring-2 focus:ring-facto-gold/20 ${
          readOnly
            ? "cursor-not-allowed bg-slate-50 text-slate-600"
            : "bg-white text-slate-800"
        } ${className ?? ""}`}
        {...rest}
      />
    </div>
  );
}

function enderecoCompletoViaCep(perfil: PerfilUsuario): boolean {
  return Boolean(
    perfil.cep &&
      perfil.endereco &&
      perfil.bairro &&
      perfil.cidade &&
      perfil.uf
  );
}

export function PerfilForm({ perfilInicial }: { perfilInicial: PerfilUsuario }) {
  const router = useRouter();
  const supabase = createClient();
  const [perfil, setPerfil] = useState(perfilInicial);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [enderecoAuto, setEnderecoAuto] = useState(
    enderecoCompletoViaCep(perfilInicial)
  );

  useEffect(() => {
    setPerfil({
      ...perfilInicial,
      telefone: perfilInicial.telefone
        ? formatarTelefone(perfilInicial.telefone)
        : perfilInicial.telefone,
      cep: perfilInicial.cep ? formatarCep(perfilInicial.cep) : perfilInicial.cep,
    });
    setEnderecoAuto(enderecoCompletoViaCep(perfilInicial));
  }, [perfilInicial]);

  function atualizar(campo: keyof PerfilUsuario, valor: string) {
    setPerfil((p) => ({ ...p, [campo]: valor }));
  }

  async function handleCepChange(valor: string) {
    const cepFormatado = formatarCep(valor);
    atualizar("cep", cepFormatado);

    const digitos = cepFormatado.replace(/\D/g, "");
    if (digitos.length < 8) {
      setEnderecoAuto(false);
      setPerfil((p) => ({
        ...p,
        cep: cepFormatado,
        endereco: "",
        bairro: "",
        cidade: "",
        uf: "",
      }));
      return;
    }

    setBuscandoCep(true);
    setErro(null);

    try {
      const endereco = await buscarEnderecoPorCep(digitos);
      if (!endereco) {
        setEnderecoAuto(false);
        setErro("CEP não encontrado. Verifique e tente novamente.");
        setBuscandoCep(false);
        return;
      }

      setPerfil((p) => ({
        ...p,
        cep: endereco.cep,
        endereco: endereco.endereco,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        uf: endereco.uf,
      }));
      setEnderecoAuto(true);
    } catch {
      setErro("Não foi possível consultar o CEP. Tente novamente.");
      setEnderecoAuto(false);
    }

    setBuscandoCep(false);
  }

  function handleTelefoneChange(valor: string) {
    atualizar("telefone", formatarTelefone(valor));
  }

  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 600_000) {
      setErro("Use uma foto de até 600 KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPerfil((p) => ({ ...p, foto_base64: base64 }));
      setErro(null);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    setMensagem(null);

    try {
      const res = await fetch("/api/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome_completo: perfil.nome_completo,
          cpf: perfil.cpf,
          oab_numero: perfil.oab_numero,
          telefone: perfil.telefone,
          foto_base64: perfil.foto_base64,
          endereco: perfil.endereco,
          numero: perfil.numero,
          complemento: perfil.complemento,
          bairro: perfil.bairro,
          cidade: perfil.cidade,
          uf: perfil.uf,
          cep: perfil.cep,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Erro ao salvar.");
        setSalvando(false);
        return;
      }

      setPerfil(data.perfil);
      setEnderecoAuto(enderecoCompletoViaCep(data.perfil));
      setMensagem("Perfil atualizado com sucesso.");
      router.refresh();
    } catch {
      setErro("Falha ao salvar. Tente novamente.");
    }
    setSalvando(false);
  }

  async function sair() {
    await fetch("/api/auth/sessao", { method: "DELETE" });
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const camposEnderecoBloqueados = enderecoAuto && !buscandoCep;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-stone-500 hover:text-facto-gold"
          >
            ← Voltar ao portal
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Meu perfil</h1>
          <p className="mt-1 text-sm text-slate-500">
            Foto, dados pessoais e endereço vinculados à sua conta.
          </p>
        </div>
        <button
          type="button"
          onClick={sair}
          className="shrink-0 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Sair
        </button>
      </div>

      {mensagem && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {mensagem}
        </div>
      )}
      {erro && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Foto de perfil</h2>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-facto-gold/30 bg-stone-100">
            {perfil.foto_base64 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={perfil.foto_base64}
                alt="Sua foto"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl text-stone-400">👤</span>
            )}
          </div>
          <div>
            <input
              id="foto"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFoto}
              className="text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-facto-dark file:px-3 file:py-2 file:text-sm file:font-medium file:text-facto-gold"
            />
            <p className="mt-1 text-xs text-slate-500">JPG, PNG ou WebP · máx. 600 KB</p>
          </div>
        </div>
      </section>

      <section
        id="dados"
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-800">Dados pessoais</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {campo("nome", "Nome completo", {
            value: perfil.nome_completo,
            onChange: (e) => atualizar("nome_completo", e.target.value),
            required: true,
          })}
          {campo("email", "E-mail", {
            value: perfil.email,
            readOnly: true,
          })}
          {campo("cpf", "CPF", {
            value: perfil.cpf,
            onChange: (e) => atualizar("cpf", e.target.value),
            required: true,
          })}
          {campo("oab", "OAB", {
            value: perfil.oab_numero,
            onChange: (e) => atualizar("oab_numero", e.target.value),
            required: true,
          })}
          {campo("telefone", "Telefone", {
            value: perfil.telefone ?? "",
            onChange: (e) => handleTelefoneChange(e.target.value),
            inputMode: "numeric",
            placeholder: "(00) 00000-0000",
            maxLength: 15,
          })}
        </div>
      </section>

      <section
        id="endereco"
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-800">Endereço</h2>
        <p className="mt-1 text-sm text-slate-500">
          Informe o CEP para preenchimento automático. Apenas número e complemento
          são editáveis.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 sm:max-w-xs">
            {campo("cep", "CEP", {
              value: perfil.cep ?? "",
              onChange: (e) => handleCepChange(e.target.value),
              inputMode: "numeric",
              placeholder: "00000-000",
              maxLength: 9,
              required: true,
            })}
            {buscandoCep && (
              <p className="mt-1 text-xs text-facto-gold">Buscando endereço...</p>
            )}
          </div>
          <div className="sm:col-span-2">
            {campo("endereco", "Logradouro", {
              value: perfil.endereco ?? "",
              readOnly: camposEnderecoBloqueados,
              placeholder: "Preenchido automaticamente pelo CEP",
            })}
          </div>
          {campo("numero", "Número", {
            value: perfil.numero ?? "",
            onChange: (e) => atualizar("numero", e.target.value),
            placeholder: "Ex.: 123",
          })}
          {campo("complemento", "Complemento (opcional)", {
            value: perfil.complemento ?? "",
            onChange: (e) => atualizar("complemento", e.target.value),
            placeholder: "Apto, sala, bloco...",
          })}
          {campo("bairro", "Bairro", {
            value: perfil.bairro ?? "",
            readOnly: camposEnderecoBloqueados,
            placeholder: "Preenchido automaticamente pelo CEP",
          })}
          {campo("cidade", "Cidade", {
            value: perfil.cidade ?? "",
            readOnly: camposEnderecoBloqueados,
            placeholder: "Preenchido automaticamente pelo CEP",
          })}
          {campo("uf", "UF", {
            value: perfil.uf ?? "",
            readOnly: camposEnderecoBloqueados,
            maxLength: 2,
            placeholder: "UF",
          })}
        </div>
      </section>

      <button
        type="submit"
        disabled={salvando || buscandoCep}
        className="rounded-lg bg-facto-gold px-8 py-3 font-semibold text-facto-dark transition hover:bg-[#a39a78] disabled:opacity-50"
      >
        {salvando ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}
