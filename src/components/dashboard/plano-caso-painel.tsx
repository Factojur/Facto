"use client";

import type { PreviewTriagemData } from "@/components/dashboard/preview-triagem-peca";
import { PlanoEstrategicoCorpo } from "@/components/dashboard/preview-triagem-peca";
import { AlertaFatosPedidosChips } from "@/components/dashboard/alerta-fatos-pedidos-chips";
import type { AlertaFatosPedidos } from "@/lib/alerta-fatos-pedidos";
import {
  casoChatPainelVazio,
  casoChatTemConteudo,
  montarResumoEntendimentoChat,
  rotuloAreaChat,
  type EstadoCasoChat,
} from "@/lib/chat-minuta";
import { ChatPainelContextoVazio } from "@/components/dashboard/chat-painel-contexto-vazio";
import type { VersaoPlanoChat } from "@/lib/chat-plano-versoes";

function EntendimentoLocalCard({
  resumo,
  areaRotulo,
  pedidosEditaveis,
  onPedidosChange,
}: {
  resumo: ReturnType<typeof montarResumoEntendimentoChat>;
  areaRotulo: string;
  pedidosEditaveis?: boolean;
  onPedidosChange?: (pedidos: string[]) => void;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white/95 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
        Entendimento do caso
      </p>
      <p className="mt-2 text-sm leading-relaxed text-stone-700">
        {resumo.fatosResumo}
      </p>
      <dl className="mt-4 grid gap-2 text-sm text-stone-700 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium text-stone-500">Área</dt>
          <dd className="font-medium text-stone-900">{areaRotulo}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-stone-500">Espécie</dt>
          <dd>{resumo.especie}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-stone-500">Ação</dt>
          <dd>{resumo.tipoAcao}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-stone-500">Foro</dt>
          <dd>{resumo.foro}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium text-stone-500">Partes</dt>
          <dd>
            {resumo.autores} × {resumo.reus}
          </dd>
        </div>
      </dl>
      {resumo.pedidos.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-stone-500">Pedidos identificados</p>
          {pedidosEditaveis && onPedidosChange ? (
            <textarea
              className="mt-1 w-full rounded-lg border border-stone-200 bg-white p-2 text-sm text-stone-800"
              rows={Math.min(5, resumo.pedidos.length + 1)}
              value={resumo.pedidos.join("\n")}
              onChange={(e) =>
                onPedidosChange(
                  e.target.value
                    .split("\n")
                    .map((l) => l.trim())
                    .filter(Boolean)
                )
              }
            />
          ) : (
            <ul className="mt-1 list-inside list-disc text-sm text-stone-700">
              {resumo.pedidos.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function PlanoCasoPainel({
  estado,
  triagem,
  carregando,
  confirmando,
  planoAtualizado,
  versoes,
  alertasFatosPedidos,
  leituraAnexo,
  dicaPrazo,
  avisoComplementosLastro,
  onAtualizarPlano,
  onPedidosChange,
  onRestaurarVersao,
  onIncluirCobertura,
  onAbrirFls,
}: {
  estado: EstadoCasoChat;
  triagem: PreviewTriagemData | null;
  carregando?: boolean;
  confirmando?: boolean;
  planoAtualizado?: boolean;
  versoes?: VersaoPlanoChat[];
  alertasFatosPedidos?: AlertaFatosPedidos[];
  leituraAnexo?: string | null;
  dicaPrazo?: string | null;
  avisoComplementosLastro?: string | null;
  onAtualizarPlano?: () => void;
  onPedidosChange?: (pedidos: string[]) => void;
  onRestaurarVersao?: (versao: VersaoPlanoChat) => void;
  onIncluirCobertura?: (itemId: string) => void;
  onAbrirFls?: (pagina: number | null, trecho: string) => void;
}) {
  const resumo = montarResumoEntendimentoChat(estado);
  const painelVazio = casoChatPainelVazio(estado);
  const areaRotulo = painelVazio
    ? "A definir"
    : estado.areaConfirmada || estado.areaInferida
      ? rotuloAreaChat(estado.areaId)
      : "A definir";
  const nVersoes = versoes?.length ?? 0;

  if (painelVazio && !carregando) {
    return <ChatPainelContextoVazio />;
  }

  if (carregando && !triagem) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        {casoChatTemConteudo(estado) ? (
          <EntendimentoLocalCard resumo={resumo} areaRotulo={areaRotulo} />
        ) : (
          <ChatPainelContextoVazio />
        )}
        <div
          className="rounded-xl border border-dashed border-stone-300 bg-white/80 p-6 text-center"
          aria-busy="true"
        >
          <div className="mx-auto max-w-sm space-y-2">
            <div className="h-3 w-3/4 animate-pulse rounded bg-stone-200" />
            <div className="h-3 w-full animate-pulse rounded bg-stone-100" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-stone-100" />
          </div>
          <p className="mt-4 text-sm text-stone-600">
            Montando o plano estratégico (tópicos, teses e lastro)…
          </p>
          <p className="mt-1 text-xs text-stone-500">Não consome cota de peça.</p>
        </div>
      </div>
    );
  }

  if (!triagem) {
    return (
      <div className="mx-auto max-w-3xl">
        {resumo.fatosResumo || resumo.foro !== "—" || resumo.autores !== "—" ? (
          <EntendimentoLocalCard
            resumo={resumo}
            areaRotulo={areaRotulo}
            pedidosEditaveis={Boolean(onPedidosChange)}
            onPedidosChange={onPedidosChange}
          />
        ) : (
          <p className="rounded-xl border border-dashed border-stone-300 bg-white/80 p-6 text-center text-sm text-stone-600">
            Oriente no chat o que pretende na peça. O plano estratégico sobe aqui
            quando a IA concluir a análise (Gemini) — sem chute local de remédio.
          </p>
        )}
        <p className="mt-4 text-center text-xs text-stone-500">
          Continue conversando à esquerda — o plano atualiza quando a IA responder.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <section
        className={`rounded-xl border bg-gradient-to-b from-stone-50 to-white p-4 shadow-sm transition-shadow sm:p-5 ${
          planoAtualizado
            ? "border-facto-gold/50 ring-1 ring-facto-gold/30"
            : "border-stone-200"
        }`}
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-900">
            Plano do caso — sem cota
          </span>
          {nVersoes > 1 && (
            <span className="rounded-full border border-stone-200 bg-white px-2.5 py-0.5 text-[10px] font-medium text-stone-600">
              v{nVersoes}
            </span>
          )}
          {carregando && (
            <span className="text-[11px] text-stone-500">Atualizando…</span>
          )}
          {planoAtualizado && !carregando && (
            <span className="text-[11px] font-medium text-facto-gold">
              Plano atualizado
            </span>
          )}
        </div>
        <h2 className="text-base font-semibold text-stone-900 sm:text-lg">
          Proposta estratégica — converse até ficar bom
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Edite pedidos abaixo se precisar. A redação completa debita 1 peça ao
          confirmar.
        </p>

        {leituraAnexo && (
          <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50/90 px-3 py-2.5 text-sm text-sky-950 whitespace-pre-wrap">
            {leituraAnexo.replace(/\*\*/g, "")}
          </div>
        )}

        {dicaPrazo && (
          <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50/80 px-3 py-2 text-xs text-sky-950">
            <p className="font-semibold">Prazo estimado (conferência)</p>
            <p className="mt-0.5 leading-relaxed">{dicaPrazo}</p>
          </div>
        )}

        {avisoComplementosLastro && (
          <p className="mt-3 text-xs text-stone-500">{avisoComplementosLastro}</p>
        )}

        {alertasFatosPedidos && alertasFatosPedidos.length > 0 && (
          <div className="mt-4">
            <AlertaFatosPedidosChips alertas={alertasFatosPedidos} />
          </div>
        )}

        <PlanoEstrategicoCorpo
          triagem={{
            ...triagem,
            jurisTitulos:
              triagem.jurisTitulos ??
              estado.jurisCaso
                .filter((j) => j.titulo?.trim() || j.texto?.trim())
                .map((j) => j.titulo.trim() || j.nomeArquivo || "Juris do caso"),
          }}
          onIncluirCobertura={onIncluirCobertura}
          onAbrirFls={onAbrirFls}
        />

        {onPedidosChange && resumo.pedidos.length > 0 && (
          <div className="mt-4 rounded-lg border border-stone-200 bg-white p-3">
            <p className="text-xs font-semibold text-stone-600">
              Pedidos (edição rápida)
            </p>
            <textarea
              className="mt-2 w-full rounded-lg border border-stone-200 p-2 text-sm"
              rows={3}
              value={estado.pedidos.filter(Boolean).join("\n")}
              onChange={(e) =>
                onPedidosChange(
                  e.target.value
                    .split("\n")
                    .map((l) => l.trim())
                    .filter(Boolean)
                )
              }
            />
          </div>
        )}

        {versoes && versoes.length > 1 && onRestaurarVersao && (
          <details className="mt-4">
            <summary className="cursor-pointer text-xs font-medium text-stone-500">
              Versões anteriores do plano ({versoes.length - 1})
            </summary>
            <ul className="mt-2 space-y-1">
              {versoes
                .slice(0, -1)
                .reverse()
                .map((v) => (
                  <li key={v.id}>
                    <button
                      type="button"
                      onClick={() => onRestaurarVersao(v)}
                      className="text-xs text-stone-600 underline-offset-2 hover:underline"
                    >
                      {new Date(v.ts).toLocaleString("pt-BR")} —{" "}
                      {v.resumoMudanca ?? "versão anterior"}
                    </button>
                  </li>
                ))}
            </ul>
          </details>
        )}

        {onAtualizarPlano && (
          <div className="mt-6 flex justify-end border-t border-stone-200 pt-4">
            <button
              type="button"
              onClick={onAtualizarPlano}
              disabled={confirmando || carregando}
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-60"
            >
              Atualizar plano
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
