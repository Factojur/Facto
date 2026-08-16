"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  casoEncerrado,
  metaFase,
  type CasoJec,
  type FaseCasoJec,
} from "@/lib/jec-caso-types";
import {
  criarCasoJec,
  excluirCasoJec,
  listarCasosJec,
} from "@/lib/jec-casos-storage";
import { podePersistirCasosNaNuvem } from "@/lib/emails-persistencia-casos";

function mapCasoNuvem(row: Record<string, unknown>): CasoJec {
  return {
    id: String(row.id),
    criadoEm: String(row.criado_em ?? new Date().toISOString()),
    atualizadoEm: String(row.atualizado_em ?? new Date().toISOString()),
    titulo: String(row.titulo ?? ""),
    numeroProcesso: String(row.numero_processo ?? ""),
    foro: String(row.foro ?? ""),
    polo: row.polo === "reu" ? "reu" : "autor",
    faseAtual: (row.fase_atual as FaseCasoJec) || "pre_acao",
    resumoFatos: String(row.resumo_fatos ?? ""),
    eventos: [],
  };
}

export function JecCasosLista({ emailUsuario }: { emailUsuario: string }) {
  const nuvem = podePersistirCasosNaNuvem(emailUsuario);
  const [casos, setCasos] = useState<CasoJec[]>([]);
  const [titulo, setTitulo] = useState("");
  const [numeroProcesso, setNumeroProcesso] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [avisoNuvem, setAvisoNuvem] = useState<string | null>(null);

  async function recarregar() {
    if (nuvem) {
      try {
        const res = await fetch("/api/jec/casos");
        const data = await res.json();
        if (res.ok && Array.isArray(data.casos)) {
          setCasos(data.casos.map(mapCasoNuvem));
          setAvisoNuvem(null);
          return;
        }
        setAvisoNuvem(
          data.error ||
            "Nuvem indisponível — usando armazenamento local neste navegador."
        );
      } catch {
        setAvisoNuvem(
          "Nuvem indisponível — usando armazenamento local neste navegador."
        );
      }
    }
    setCasos(listarCasosJec());
  }

  useEffect(() => {
    void recarregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só no mount / e-mail
  }, [emailUsuario]);

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (titulo.trim().length < 3) {
      setErro("Informe um título com pelo menos 3 caracteres.");
      return;
    }

    if (nuvem) {
      const res = await fetch("/api/jec/casos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: titulo.trim(),
          numeroProcesso: numeroProcesso.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.caso?.id) {
        setTitulo("");
        setNumeroProcesso("");
        window.location.href = `/dashboard/jec/casos/${data.caso.id}`;
        return;
      }
      setErro(
        data.error ||
          "Falha ao salvar na nuvem. Aplique a migration jec_casos ou use o modo local."
      );
      return;
    }

    const caso = criarCasoJec({
      titulo: titulo.trim(),
      numeroProcesso: numeroProcesso.trim(),
    });
    setTitulo("");
    setNumeroProcesso("");
    window.location.href = `/dashboard/jec/casos/${caso.id}`;
  }

  function handleExcluir(id: string, nome: string) {
    if (!window.confirm(`Excluir o caso "${nome}"? Esta ação não desfaz.`)) {
      return;
    }
    if (!nuvem) {
      excluirCasoJec(id);
      void recarregar();
    } else {
      // Exclusão na nuvem: por ora remove só da lista local se API DELETE não existir
      excluirCasoJec(id);
      void recarregar();
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
      <header>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              JEC · ciclo do processo
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-800">
              Meus casos
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Acompanhe o processo da pré-ação ao trânsito em julgado e gere a
              peça de cada etapa. Esta lista é só do Juizado Especial Cível —
              as outras áreas ainda não salvam caso aqui.
            </p>
          </div>
          <Link
            href="/dashboard/jec"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Gerar peça avulsa
          </Link>
        </div>
      </header>

      {nuvem ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
          Conta de teste/admin: os casos podem ser salvos na nuvem do projeto
          FACTO (Supabase) para você validar o sistema.
          {avisoNuvem ? (
            <span className="mt-1 block text-xs text-amber-900">{avisoNuvem}</span>
          ) : null}
        </div>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
          <strong className="font-semibold">Privacidade:</strong> o FACTO não
          guarda na nuvem os dados das partes nem a peça gerada. Os casos desta
          tela ficam só neste navegador.{" "}
          <strong className="font-semibold">
            Baixe e salve PDF/Word (ou copie para sua pasta/Drive)
          </strong>{" "}
          — a preservação do arquivo é sua responsabilidade.
        </div>
      )}

      <form
        onSubmit={(e) => void handleCriar(e)}
        className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-sm font-semibold text-slate-800">Novo caso</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="casoTitulo"
              className="mb-1 block text-xs font-medium text-slate-600"
            >
              Título / cliente / objeto
            </label>
            <input
              id="casoTitulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Silva × Banco — negativação indevida"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
            />
          </div>
          <div>
            <label
              htmlFor="casoProcesso"
              className="mb-1 block text-xs font-medium text-slate-600"
            >
              Nº do processo (se já houver)
            </label>
            <input
              id="casoProcesso"
              value={numeroProcesso}
              onChange={(e) => setNumeroProcesso(e.target.value)}
              placeholder="0000000-00.0000.0.00.0000"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
            />
          </div>
        </div>
        {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
        <button
          type="submit"
          className="mt-4 rounded-lg bg-stone-700 px-4 py-2 text-sm font-semibold text-amber-50 hover:bg-stone-600"
        >
          Criar caso
        </button>
      </form>

      <section className="space-y-3">
        {casos.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Nenhum caso ainda. Crie o primeiro para montar a linha do tempo até o
            trânsito.
          </p>
        ) : (
          casos.map((caso) => {
            const fase = metaFase(caso.faseAtual);
            return (
              <article
                key={caso.id}
                className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/jec/casos/${caso.id}`}
                    className="font-medium text-slate-800 hover:text-stone-900 hover:underline"
                  >
                    {caso.titulo}
                  </Link>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {caso.numeroProcesso
                      ? `Proc. ${caso.numeroProcesso} · `
                      : ""}
                    Fase: {fase.rotulo}
                    {casoEncerrado(caso.faseAtual) ? " · encerrado" : ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link
                    href={`/dashboard/jec/casos/${caso.id}`}
                    className="rounded-lg bg-stone-700 px-3 py-1.5 text-sm font-medium text-amber-50 hover:bg-stone-600"
                  >
                    Abrir
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleExcluir(caso.id, caso.titulo)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Excluir
                  </button>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
