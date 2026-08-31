"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getAreaById, hrefModuloArea } from "@/lib/areas-atuacao";
import { sugerirAreaPorWizard } from "@/lib/grupos-areas-dashboard";
import {
  chatMinutaAreaHabilitada,
  hrefChatMinuta,
} from "@/lib/chat-minuta";
import { AreaIllustration } from "@/components/dashboard/area-illustration";
import { areaEstaLiberada } from "@/lib/acesso-areas";
import type { PlanoId } from "@/lib/planos-facto";

type Props = {
  leigo?: boolean;
  plano?: PlanoId | null;
  previewAreas?: boolean;
  /** No painel da home: já vem aberto, sem toggle. */
  sempreAberto?: boolean;
  /** Catálogo manual: formulário como ação principal. */
  preferirFormulario?: boolean;
};

function IconeGuia({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 11.2v5.3M12 8.2h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AssistenteEscolhaArea({
  leigo = false,
  plano = null,
  previewAreas = false,
  sempreAberto = false,
  preferirFormulario = false,
}: Props) {
  const [aberto, setAberto] = useState(sempreAberto);
  const [assunto, setAssunto] = useState("");
  const [juizado, setJuizado] = useState<"sim" | "nao" | "nao_sei">("nao_sei");

  const sugestao = useMemo(() => {
    if (!assunto) return null;
    return sugerirAreaPorWizard({ assunto, juizado });
  }, [assunto, juizado]);

  const area = sugestao ? getAreaById(sugestao.areaId) : null;
  const hrefModulo =
    area && hrefModuloArea(area, previewAreas)
      ? hrefModuloArea(area, previewAreas)
      : null;
  const hrefChat =
    area && chatMinutaAreaHabilitada(area.id)
      ? hrefChatMinuta(area.id, { nova: true })
      : null;
  const liberada =
    area && (hrefModulo || hrefChat)
      ? areaEstaLiberada(area.id, {
          plano,
          tipoUsuario: leigo ? "leigo" : "advogado",
        })
      : false;

  if (leigo) return null;

  return (
    <section
      className={`rounded-lg border transition ${
        aberto || sempreAberto
          ? "border-white/15 bg-white/[0.05]"
          : "border-transparent bg-transparent hover:border-white/10 hover:bg-white/[0.03]"
      }`}
    >
      {!sempreAberto && (
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-stone-400">
          <IconeGuia className="h-4 w-4" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-stone-200">
            Em dúvida sobre a área?
          </span>
          <span className="mt-0.5 block text-xs text-stone-500">
            Duas perguntas — o FACTO sugere a área e abre o assistente.
          </span>
        </span>

        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-stone-300">
          {aberto ? "Fechar" : "Abrir guia"}
          <svg
            viewBox="0 0 20 20"
            className={`h-3.5 w-3.5 text-facto-gold transition-transform ${
              aberto ? "rotate-180" : ""
            }`}
            fill="currentColor"
            aria-hidden
          >
            <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
          </svg>
        </span>
      </button>
      )}

      {aberto || sempreAberto ? (
        <div
          className={`space-y-4 px-3 pb-3.5 pt-3 ${
            sempreAberto ? "" : "border-t border-white/10"
          }`}
        >
          {sempreAberto && (
            <div className="mb-1">
              <p className="text-sm font-medium text-stone-200">
                Em dúvida sobre a área?
              </p>
              <p className="mt-0.5 text-xs text-stone-500">
                Responda e abra no assistente (ou no formulário).
              </p>
            </div>
          )}
          <div>
            <label
              htmlFor="wizard-assunto"
              className="mb-1.5 block text-sm font-medium text-stone-300"
            >
              Sobre o que é o caso?
            </label>
            <select
              id="wizard-assunto"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-stone-900/80 px-3 py-2 text-sm text-white outline-none focus:border-facto-gold/50"
            >
              <option value="">Selecione…</option>
              <option value="consumo">Consumo (loja, banco, plano, serviço)</option>
              <option value="civil">Cível entre particulares (sem consumo)</option>
              <option value="familia">Família (divórcio, guarda, pensão, inventário)</option>
              <option value="imobiliario">Imóvel (aluguel, despejo, usucapião)</option>
              <option value="trabalho">Trabalho (demissão, verbas, vínculo)</option>
              <option value="previdencia">INSS / aposentadoria / benefício</option>
              <option value="penal">Crime / polícia / inquérito</option>
              <option value="tributario">Imposto / execução fiscal</option>
              <option value="administrativo">Atos da Prefeitura, Estado ou União</option>
              <option value="constitucional">STF, MS, RE, ADI</option>
              <option value="empresarial">Sociedade / empresa</option>
              <option value="digital">Internet, LGPD, dados</option>
              <option value="ambiental">Meio ambiente / IBAMA</option>
              <option value="saude">Erro médico / hospital</option>
              <option value="eleitoral">Eleições / registro / AIJE</option>
            </select>
          </div>

          {(assunto === "consumo" ||
            assunto === "civil" ||
            assunto === "penal") && (
            <div>
              <span className="mb-1.5 block text-sm font-medium text-stone-300">
                Cabe no Juizado Especial (valor até o teto da Lei 9.099)?
              </span>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["sim", "Sim, no Juizado"],
                    ["nao", "Não — vara comum"],
                    ["nao_sei", "Não tenho certeza"],
                  ] as const
                ).map(([id, rotulo]) => (
                  <label
                    key={id}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-stone-300 has-[:checked]:border-facto-gold/50 has-[:checked]:bg-facto-gold/10"
                  >
                    <input
                      type="radio"
                      name="wizard-juizado"
                      checked={juizado === id}
                      onChange={() => setJuizado(id)}
                      className="border-stone-500 text-facto-gold"
                    />
                    {rotulo}
                  </label>
                ))}
              </div>
            </div>
          )}

          {sugestao && area ? (
            <div className="rounded-lg border border-facto-gold/30 bg-facto-gold/5 p-4">
              <div className="flex items-start gap-3">
                <AreaIllustration
                  areaId={area.id}
                  className="h-10 w-10 shrink-0 text-facto-gold"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{area.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-stone-400">
                    {sugestao.motivo}
                  </p>
                </div>
              </div>
              {liberada && (hrefChat || hrefModulo) ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {preferirFormulario && hrefModulo ? (
                    <Link
                      href={hrefModulo}
                      className="inline-flex rounded-lg bg-facto-gold px-4 py-2 text-sm font-semibold text-facto-dark hover:bg-[#a39a78]"
                    >
                      Abrir formulário →
                    </Link>
                  ) : hrefChat ? (
                    <Link
                      href={hrefChat}
                      className="inline-flex rounded-lg bg-facto-gold px-4 py-2 text-sm font-semibold text-facto-dark hover:bg-[#a39a78]"
                    >
                      Começar no assistente →
                    </Link>
                  ) : hrefModulo ? (
                    <Link
                      href={hrefModulo}
                      className="inline-flex rounded-lg bg-facto-gold px-4 py-2 text-sm font-semibold text-facto-dark hover:bg-[#a39a78]"
                    >
                      Entrar neste módulo →
                    </Link>
                  ) : null}
                  {preferirFormulario && hrefChat ? (
                    <Link
                      href={hrefChat}
                      className="inline-flex rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-stone-200 hover:bg-white/5"
                    >
                      Assistente →
                    </Link>
                  ) : hrefModulo && hrefChat ? (
                    <Link
                      href={hrefModulo}
                      className="inline-flex rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-stone-200 hover:bg-white/5"
                    >
                      Formulário completo →
                    </Link>
                  ) : null}
                </div>
              ) : (
                <p className="mt-3 text-xs text-amber-200/90">
                  Este módulo exige plano ou OAB compatível com seu cadastro.
                </p>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
