"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FASES_CASO_JEC,
  casoEncerrado,
  metaFase,
  type CasoJec,
  type FaseCasoJec,
} from "@/lib/jec-caso-types";
import {
  adicionarEventoCaso,
  atualizarCasoJec,
  avancarFaseCaso,
  definirFaseCaso,
  obterCasoJec,
} from "@/lib/jec-casos-storage";
import { podePersistirCasosNaNuvem } from "@/lib/emails-persistencia-casos";
import { PecaDocumentoView } from "@/components/dashboard/peca-documento";
import { gerarDocumentoTimbrado } from "@/lib/formatacao-juridica";
import { HREF_CHAT_ASSISTENTE } from "@/lib/minuta-modulo";
import { hrefAssistenteAposBriefing } from "@/lib/briefing-caso-chat";

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

export function JecCasoDetalhe({
  casoId,
  emailUsuario,
}: {
  casoId: string;
  emailUsuario: string;
}) {
  const nuvem = podePersistirCasosNaNuvem(emailUsuario);
  const [caso, setCaso] = useState<CasoJec | null>(null);
  const [nota, setNota] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [pecaAbertaId, setPecaAbertaId] = useState<string | null>(null);

  async function recarregar() {
    setCarregando(true);
    const local = obterCasoJec(casoId);
    if (local) {
      setCaso(local);
      setCarregando(false);
      return;
    }
    if (nuvem) {
      try {
        const res = await fetch("/api/jec/casos");
        const data = await res.json();
        if (res.ok && Array.isArray(data.casos)) {
          const encontrado = data.casos
            .map(mapCasoNuvem)
            .find((c: CasoJec) => c.id === casoId);
          setCaso(encontrado ?? null);
          setCarregando(false);
          return;
        }
      } catch {
        /* ignore */
      }
    }
    setCaso(null);
    setCarregando(false);
  }

  useEffect(() => {
    void recarregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [casoId, emailUsuario]);

  if (carregando) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-sm text-slate-500">
        Carregando caso…
      </div>
    );
  }

  if (!caso) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-slate-600">Caso não encontrado neste dispositivo.</p>
        <Link
          href="/dashboard/jec/casos"
          className="mt-4 inline-block text-sm font-medium text-stone-700 underline"
        >
          Voltar aos casos
        </Link>
      </div>
    );
  }

  const casoAtual = caso;
  const faseMeta = metaFase(casoAtual.faseAtual);
  const encerrado = casoEncerrado(casoAtual.faseAtual);

  function handleSalvarCabecalho(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const atualizado = atualizarCasoJec(casoId, {
      titulo: String(fd.get("titulo") ?? "").trim() || casoAtual.titulo,
      numeroProcesso: String(fd.get("numeroProcesso") ?? "").trim(),
      foro: String(fd.get("foro") ?? "").trim(),
      polo: (String(fd.get("polo") ?? "autor") as "autor" | "reu") || "autor",
      resumoFatos: String(fd.get("resumoFatos") ?? "").trim(),
    });
    if (atualizado) {
      setCaso(atualizado);
      setMsg("Dados do caso salvos.");
    }
  }

  function handleRegistrarNota() {
    if (nota.trim().length < 3) {
      setMsg("Escreva uma nota com pelo menos 3 caracteres.");
      return;
    }
    const atualizado = adicionarEventoCaso(casoId, {
      fase: casoAtual.faseAtual,
      nota: nota.trim(),
    });
    if (atualizado) {
      setCaso(atualizado);
      setNota("");
      setMsg("Nota registrada na linha do tempo.");
    }
  }

  function handleAvancar() {
    const atualizado = avancarFaseCaso(casoId);
    if (atualizado) {
      setCaso(atualizado);
      setMsg(`Avançou para: ${metaFase(atualizado.faseAtual).rotulo}.`);
    }
  }

  function handleDefinirFase(fase: FaseCasoJec) {
    const atualizado = definirFaseCaso(casoId, fase);
    if (atualizado) {
      setCaso(atualizado);
      setMsg(`Fase: ${metaFase(fase).rotulo}.`);
    }
  }

  function montarBriefingPeca(especie?: string | null): {
    href: string;
    onClick: () => void;
  } | null {
    const especieFinal = especie || faseMeta.especieSugerida;
    if (!especieFinal) return null;
    return {
      href: HREF_CHAT_ASSISTENTE,
      onClick: () => {
        hrefAssistenteAposBriefing({
          origem: "jec_casos",
          titulo: casoAtual.titulo,
          areaId: "jec",
          especie: especieFinal,
          numeroProcesso: casoAtual.numeroProcesso || undefined,
          foro: casoAtual.foro || undefined,
          fatos: casoAtual.resumoFatos?.slice(0, 2000) || undefined,
          fase: casoAtual.faseAtual,
        });
      },
    };
  }

  const gerarPeca = montarBriefingPeca();

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
      <header>
        <Link
          href="/dashboard/jec/casos"
          className="text-sm font-medium text-stone-500 hover:text-facto-gold"
        >
          ← Meus casos
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-800">
          {caso.titulo}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Fase atual:{" "}
          <span className="font-medium text-slate-700">{faseMeta.rotulo}</span>
          {encerrado ? " · trânsito registrado" : ""}
        </p>
      </header>

      {msg && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {msg}
        </p>
      )}

      {!nuvem && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-relaxed text-amber-950">
          Por privacidade, casos e peças do cliente não ficam na nuvem FACTO.
          Baixe PDF/Word e salve na sua pasta ou Drive — a preservação é sua
          responsabilidade.
        </p>
      )}

      <form
        onSubmit={handleSalvarCabecalho}
        className="space-y-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-sm font-semibold text-slate-800">Dados do caso</h2>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Título
          </label>
          <input
            name="titulo"
            defaultValue={caso.titulo}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Nº do processo
            </label>
            <input
              name="numeroProcesso"
              defaultValue={caso.numeroProcesso}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Polo
            </label>
            <select
              name="polo"
              defaultValue={caso.polo}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
            >
              <option value="autor">Autor / exequente</option>
              <option value="reu">Réu / executado</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Foro / juizado
          </label>
          <input
            name="foro"
            defaultValue={caso.foro}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Resumo dos fatos (reaproveitado na geração)
          </label>
          <textarea
            name="resumoFatos"
            rows={4}
            defaultValue={caso.resumoFatos}
            className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg border border-stone-600 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50"
        >
          Salvar dados
        </button>
      </form>

      {/* Timeline */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">
          Linha do tempo
        </h2>
        <ol className="relative mt-5 space-y-0 border-l border-slate-200 pl-5">
          {FASES_CASO_JEC.map((fase) => {
            const atingida = fase.ordem <= faseMeta.ordem;
            const atual = fase.id === caso.faseAtual;
            const eventosFase = caso.eventos.filter((ev) => ev.fase === fase.id);
            return (
              <li key={fase.id} className="relative pb-6 last:pb-0">
                <span
                  className={`absolute -left-[1.4rem] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                    atual
                      ? "border-facto-gold bg-facto-gold"
                      : atingida
                        ? "border-stone-600 bg-stone-600"
                        : "border-slate-300 bg-white"
                  }`}
                  aria-hidden
                />
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        atingida ? "text-slate-800" : "text-slate-400"
                      }`}
                    >
                      {fase.rotulo}
                      {atual && (
                        <span className="ml-2 text-xs font-semibold text-amber-700">
                          atual
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">{fase.descricao}</p>
                  </div>
                  {!encerrado && !atual && (
                    <button
                      type="button"
                      onClick={() => handleDefinirFase(fase.id)}
                      className="text-xs font-medium text-stone-600 underline-offset-2 hover:underline"
                    >
                      Ir para esta fase
                    </button>
                  )}
                </div>
                {eventosFase.length > 0 && (
                  <ul className="mt-2 space-y-1.5">
                    {eventosFase.map((ev) => {
                      const pecaAberta =
                        Boolean(ev.pecaTexto) && pecaAbertaId === ev.id;
                      const gerarDeNovo = ev.especiePeca
                        ? montarBriefingPeca(ev.especiePeca)
                        : null;
                      return (
                      <li
                        key={ev.id}
                        className="rounded-md bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600"
                      >
                        <span className="text-slate-400">
                          {new Date(ev.criadoEm).toLocaleString("pt-BR")}
                          {" · "}
                        </span>
                        {ev.nota}
                        {ev.tituloPeca && (
                          <span className="mt-0.5 block font-medium text-slate-700">
                            Peça: {ev.tituloPeca}
                          </span>
                        )}
                        {ev.pecaTexto ? (
                          <div className="mt-1.5 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setPecaAbertaId(pecaAberta ? null : ev.id)
                              }
                              className="font-medium text-stone-700 underline-offset-2 hover:underline"
                            >
                              {pecaAberta ? "Fechar" : "Reabrir"}
                            </button>
                            {gerarDeNovo ? (
                              <Link
                                href={gerarDeNovo.href}
                                onClick={gerarDeNovo.onClick}
                                className="font-medium text-stone-700 underline-offset-2 hover:underline"
                              >
                                Gerar de novo no assistente
                              </Link>
                            ) : null}
                          </div>
                        ) : null}
                        {pecaAberta && ev.pecaTexto ? (
                          <div className="mt-2">
                            <PecaDocumentoView
                              peca={ev.pecaTexto}
                              pecaHtml={
                                gerarDocumentoTimbrado(ev.pecaTexto).pecaHtml
                              }
                              onCopiarTexto={() =>
                                void navigator.clipboard.writeText(
                                  ev.pecaTexto ?? ""
                                )
                              }
                            />
                          </div>
                        ) : null}
                      </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      {/* Ações */}
      <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:flex-wrap">
        {gerarPeca && (
          <Link
            href={gerarPeca.href}
            onClick={gerarPeca.onClick}
            className="rounded-lg bg-stone-700 px-4 py-2.5 text-center text-sm font-semibold text-amber-50 hover:bg-stone-600"
          >
            Continuar no assistente
            {faseMeta.especieSugerida
              ? ` (${faseMeta.especieSugerida})`
              : ""}
          </Link>
        )}
        {!encerrado && (
          <button
            type="button"
            onClick={handleAvancar}
            className="rounded-lg border border-stone-600 px-4 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-50"
          >
            Avançar para próxima fase
          </button>
        )}
        <Link
          href={HREF_CHAT_ASSISTENTE}
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm text-slate-600 hover:bg-slate-50"
        >
          Abrir assistente
        </Link>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">
          Registrar nota na fase atual
        </h2>
        <textarea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          rows={3}
          placeholder="Ex.: Intimação em 10/08; audiência designada; sentença procedente…"
          className="mt-2 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
        />
        <button
          type="button"
          onClick={handleRegistrarNota}
          className="mt-3 rounded-lg bg-stone-700 px-4 py-2 text-sm font-medium text-amber-50 hover:bg-stone-600"
        >
          Registrar
        </button>
      </section>
    </div>
  );
}
