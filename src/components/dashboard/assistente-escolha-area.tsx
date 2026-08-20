"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getAreaById, hrefModuloArea } from "@/lib/areas-atuacao";
import { sugerirAreaPorWizard } from "@/lib/grupos-areas-dashboard";
import { AreaIllustration } from "@/components/dashboard/area-illustration";
import { areaEstaLiberada } from "@/lib/acesso-areas";
import type { PlanoId } from "@/lib/planos-facto";

type Props = {
  leigo?: boolean;
  plano?: PlanoId | null;
  previewAreas?: boolean;
};

export function AssistenteEscolhaArea({
  leigo = false,
  plano = null,
  previewAreas = false,
}: Props) {
  const [aberto, setAberto] = useState(false);
  const [assunto, setAssunto] = useState("");
  const [juizado, setJuizado] = useState<"sim" | "nao" | "nao_sei">("nao_sei");

  const sugestao = useMemo(() => {
    if (!assunto) return null;
    return sugerirAreaPorWizard({ assunto, juizado });
  }, [assunto, juizado]);

  const area = sugestao ? getAreaById(sugestao.areaId) : null;
  const href =
    area && hrefModuloArea(area, previewAreas)
      ? hrefModuloArea(area, previewAreas)
      : null;
  const liberada =
    area && href
      ? areaEstaLiberada(area.id, {
          plano,
          tipoUsuario: leigo ? "leigo" : "advogado",
        })
      : false;

  if (leigo) return null;

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div>
          <h2 className="text-base font-semibold text-white">
            Não sei qual área escolher
          </h2>
          <p className="mt-1 text-sm text-stone-400">
            Responda em duas perguntas — o FACTO sugere o módulo certo.
          </p>
        </div>
        <span className="text-facto-gold" aria-hidden>
          {aberto ? "−" : "+"}
        </span>
      </button>

      {aberto ? (
        <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
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
              {href && liberada ? (
                <Link
                  href={href}
                  className="mt-3 inline-flex rounded-lg bg-facto-gold px-4 py-2 text-sm font-semibold text-facto-dark hover:bg-[#a39a78]"
                >
                  Entrar neste módulo →
                </Link>
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
