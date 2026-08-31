"use client";

import { useEffect, useState } from "react";

export type FaseEquipeChat =
  | "idle"
  | "intake"
  | "preview"
  | "triagem"
  | "redacao"
  | "ajuste";

type PassoAgente = {
  skin: string;
  titulo: string;
};

const PASSOS: Record<Exclude<FaseEquipeChat, "idle">, PassoAgente[]> = {
  intake: [
    { skin: "Maestro", titulo: "Recebendo o relato" },
    { skin: "Analista Facto", titulo: "Organizando fatos, partes e pedidos" },
    { skin: "Analista Facto", titulo: "Conferindo espécie e área" },
  ],
  preview: [
    { skin: "Maestro", titulo: "Montando plano estratégico" },
    { skin: "Estrategista", titulo: "Definindo tópicos e teses" },
    { skin: "Pesquisa & súmulas", titulo: "Buscando lastro na base FACTO" },
  ],
  triagem: [
    { skin: "Maestro", titulo: "Preparando plano da peça" },
    { skin: "Estrategista", titulo: "Definindo tópicos e teses" },
  ],
  redacao: [
    { skin: "Pesquisa & súmulas", titulo: "Buscando lastro na base FACTO" },
    { skin: "Estrategista", titulo: "Fechando estratégia" },
    { skin: "Redator forense", titulo: "Redigindo a minuta" },
    { skin: "Auditor", titulo: "Conferindo forma e citações" },
  ],
  ajuste: [{ skin: "Redator forense", titulo: "Ajustando o trecho pedido" }],
};

/**
 * Balão vivo da equipe — progressão visual sem custo de API.
 * Os passos avançam por tempo enquanto a fase real estiver ativa.
 */
export function ChatEquipeTrabalhando({
  fase,
  className = "",
}: {
  fase: FaseEquipeChat;
  className?: string;
}) {
  const passos = fase === "idle" ? [] : PASSOS[fase];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
    if (passos.length <= 1) return;
    const id = window.setInterval(() => {
      setIdx((i) => Math.min(i + 1, passos.length - 1));
    }, 2200);
    return () => window.clearInterval(id);
  }, [fase, passos.length]);

  if (fase === "idle" || passos.length === 0) return null;

  const atual = passos[Math.min(idx, passos.length - 1)]!;

  return (
    <div className={`flex justify-start ${className}`}>
      <div
        className="max-w-[94%] rounded-2xl border border-dashed border-stone-300 bg-stone-50/95 px-4 py-2.5 text-sm shadow-sm"
        role="status"
        aria-live="polite"
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">
          Equipe FACTO
        </p>
        <ul className="mt-1.5 space-y-1">
          {passos.map((p, i) => {
            const feito = i < idx;
            const ativo = i === idx;
            return (
              <li
                key={`${p.skin}-${p.titulo}-${i}`}
                className={`flex items-center gap-2 text-[12px] leading-snug ${
                  ativo
                    ? "font-medium text-stone-800"
                    : feito
                      ? "text-stone-500"
                      : "text-stone-400"
                }`}
              >
                <span
                  className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                    ativo
                      ? "animate-pulse bg-facto-gold"
                      : feito
                        ? "bg-stone-400"
                        : "bg-stone-300"
                  }`}
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className="font-semibold">{p.skin}</span>
                  <span className="text-stone-500"> — {p.titulo}</span>
                  {ativo ? "…" : feito ? " ✓" : ""}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-1.5 text-[11px] text-stone-500">
          {atual.skin} em ação — isso aparece enquanto o sistema trabalha.
        </p>
      </div>
    </div>
  );
}

export function faseEquipeDeEstados(s: {
  enviando: boolean;
  previewLoading: boolean;
  triagemLoading: boolean;
  redigindo: boolean;
  ajustando: boolean;
}): FaseEquipeChat {
  if (s.enviando) return "intake";
  if (s.redigindo) return "redacao";
  if (s.triagemLoading) return "triagem";
  if (s.ajustando) return "ajuste";
  if (s.previewLoading) return "preview";
  return "idle";
}
