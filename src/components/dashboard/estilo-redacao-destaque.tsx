"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useState } from "react";

const CHAVE_OCULTAR_SEMPRE = "facto-estilo-cta-ocultar-sempre";
const CHAVE_OCULTAR_SESSAO = "facto-estilo-cta-ocultar-sessao";
/** Legado — tratado como ocultar sempre. */
const CHAVE_DISMISS_LEGADO = "facto-estilo-cta-dismiss";

function lerOcultarSempre(): boolean {
  try {
    if (localStorage.getItem(CHAVE_OCULTAR_SEMPRE) === "1") return true;
    if (localStorage.getItem(CHAVE_DISMISS_LEGADO) === "1") return true;
    return false;
  } catch {
    return false;
  }
}

function lerOcultarSessao(): boolean {
  try {
    return sessionStorage.getItem(CHAVE_OCULTAR_SESSAO) === "1";
  } catch {
    return false;
  }
}

function gravarOcultarSempre() {
  try {
    localStorage.setItem(CHAVE_OCULTAR_SEMPRE, "1");
    localStorage.removeItem(CHAVE_DISMISS_LEGADO);
  } catch {
    /* ignore */
  }
}

function gravarOcultarSessao() {
  try {
    sessionStorage.setItem(CHAVE_OCULTAR_SESSAO, "1");
  } catch {
    /* ignore */
  }
}

export function EstiloRedacaoDestaque() {
  const [carregando, setCarregando] = useState(true);
  const [estiloConfigurado, setEstiloConfigurado] = useState(false);
  const [ocultarSempre, setOcultarSempre] = useState(false);
  const [ocultarSessao, setOcultarSessao] = useState(false);
  const [modalOcultar, setModalOcultar] = useState(false);
  const [portalMontado, setPortalMontado] = useState(false);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetch("/api/perfil/estilo");
      const data = (await res.json()) as {
        resumo?: string | null;
        optIn?: boolean;
      };
      if (res.ok && data.resumo?.trim() && data.optIn) {
        setEstiloConfigurado(true);
      } else {
        setEstiloConfigurado(false);
      }
    } catch {
      setEstiloConfigurado(false);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    setPortalMontado(true);
    setOcultarSempre(lerOcultarSempre());
    setOcultarSessao(lerOcultarSessao());
    void recarregar();
  }, [recarregar]);

  useEffect(() => {
    if (!modalOcultar) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setModalOcultar(false);
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [modalOcultar]);

  const visivel =
    !carregando && !estiloConfigurado && !ocultarSempre && !ocultarSessao;

  if (!visivel) return null;

  return (
    <>
      <section className="relative px-6 md:px-10">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-stone-900/90 via-stone-950 to-stone-900 p-6 shadow-lg md:p-8">
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-facto-gold/10 blur-3xl"
            aria-hidden
          />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-facto-gold">
                Diferencial FACTO
              </p>
              <h2 className="mt-2 text-xl font-bold text-white md:text-2xl">
                Peças no tom do seu escritório{" "}
                <span className="font-normal text-stone-400">(opcional)</span>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-400">
                Envie até três peças de referência. O FACTO interpreta tom,
                extensão e forma dos pedidos — sem copiar fatos — e aplica nas
                próximas gerações, com o rito forense intacto.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                href="/dashboard/perfil#estilo-redacao"
                className="inline-flex items-center justify-center rounded-lg bg-facto-gold px-5 py-2.5 text-sm font-semibold text-facto-dark transition hover:bg-[#a39a78]"
              >
                Configurar estilo
              </Link>
              <button
                type="button"
                onClick={() => setModalOcultar(true)}
                className="text-sm text-stone-500 hover:text-stone-300"
              >
                Ocultar
              </button>
            </div>
          </div>
        </div>
      </section>

      {modalOcultar &&
        portalMontado &&
        createPortal(
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="estilo-ocultar-titulo"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
              aria-label="Fechar"
              onClick={() => setModalOcultar(false)}
            />
            <div className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-white/10 bg-stone-900 p-5 shadow-xl">
              <h3
                id="estilo-ocultar-titulo"
                className="text-base font-semibold text-white"
              >
                Ocultar convite na home?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-400">
                Você pode configurar o tom do escritório quando quiser. Este
                aviso some sozinho depois que você enviar as peças de
                referência.
              </p>

              <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-3.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-facto-gold">
                  Como configurar depois
                </p>
                <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-sm leading-relaxed text-stone-300">
                  <li>
                    Abra{" "}
                    <Link
                      href="/dashboard/perfil#estilo-redacao"
                      className="font-medium text-facto-gold underline underline-offset-2 hover:text-[#c4bf9a]"
                      onClick={() => setModalOcultar(false)}
                    >
                      Meu perfil → Tom do escritório
                    </Link>
                    .
                  </li>
                  <li>
                    Marque a autorização e envie de 1 a 3 peças suas (PDF ou
                    Word).
                  </li>
                  <li>
                    Clique em <strong className="font-medium text-stone-200">Gerar meu perfil</strong>.
                    O FACTO extrai só o estilo — tom, extensão e forma dos
                    pedidos — sem copiar fatos.
                  </li>
                  <li>
                    Nas próximas redações, o estilo entra automaticamente; o
                    rito forense permanece igual.
                  </li>
                </ol>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    gravarOcultarSessao();
                    setOcultarSessao(true);
                    setModalOcultar(false);
                  }}
                  className="rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-stone-200 transition hover:bg-white/10"
                >
                  Ocultar desta visita
                </button>
                <button
                  type="button"
                  onClick={() => {
                    gravarOcultarSempre();
                    setOcultarSempre(true);
                    setModalOcultar(false);
                  }}
                  className="rounded-lg bg-facto-gold px-4 py-2 text-sm font-semibold text-facto-dark transition hover:bg-[#a39a78]"
                >
                  Não mostrar mais na home
                </button>
                <button
                  type="button"
                  onClick={() => setModalOcultar(false)}
                  className="rounded-lg px-4 py-2 text-sm text-stone-500 transition hover:text-stone-300 sm:ml-auto"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
