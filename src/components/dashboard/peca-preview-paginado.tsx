"use client";

import { dividirPecaEmPaginas } from "@/lib/peca-paginas-preview";
import { ESTILO_EMENTA_A4, ESTILO_FOLHA_A4 } from "@/lib/estilo-folha-a4";
import { TextoJuridicoInline } from "@/components/dashboard/texto-juridico-inline";
import { classificarPeca } from "@/lib/tipografia-peca";
import {
  expandirLinhasMarcadorEspaco,
  parseMarcadorEspaco,
} from "@/lib/formatacao-forense";
import { useMemo } from "react";

function classePorTipo(tipo: string): string {
  switch (tipo) {
    case "enderecamento":
    case "nome-acao":
      return "text-center font-bold uppercase tracking-wide";
    case "secao-titulo":
      return "uppercase mt-[1.5em]";
    case "subtopico":
      return "pl-[2cm] max-[720px]:pl-4 mt-[0.75em]";
    case "fechamento":
      return "text-center";
    case "citacao-juris":
      return "";
    case "item-pedido":
    case "prova-item":
      return "text-justify indent-[2cm] max-[720px]:indent-6";
    default:
      return "text-justify indent-[2cm] max-[720px]:indent-6";
  }
}

function expandirMarcador(bloco: string): string[] | null {
  const m = parseMarcadorEspaco(bloco.trim());
  if (!m) return null;
  return expandirLinhasMarcadorEspaco(m);
}

export function PecaPreviewPaginado({
  peca,
  onAbrirFls,
}: {
  peca: string;
  onAbrirFls?: (pagina: number | null, trecho: string) => void;
}) {
  const paginas = useMemo(() => dividirPecaEmPaginas(peca), [peca]);

  if (!peca.trim()) {
    return <p className="text-sm text-slate-500">Redigindo peça…</p>;
  }

  return (
    <div className="flex flex-col items-center gap-4 bg-stone-100/80 py-4">
      {paginas.map((blocos, idx) => (
        <article
          key={`pag-${idx}`}
          className="relative w-full bg-white shadow-md ring-1 ring-stone-200/80"
          style={ESTILO_FOLHA_A4}
        >
          <div className="pb-6 text-inherit">
            {blocos.map((bloco, bi) => {
              const marcadorLinhas = expandirMarcador(bloco);
              if (marcadorLinhas) {
                return marcadorLinhas.map((linha, li) => (
                  <p
                    key={`${idx}-${bi}-m${li}`}
                    className="mb-0 min-h-[1.5em] text-center text-[12pt] leading-[1.5]"
                  >
                    {linha ? (
                      <TextoJuridicoInline
                        texto={linha}
                        onAbrirFls={onAbrirFls}
                        className="inline"
                      />
                    ) : (
                      "\u00a0"
                    )}
                  </p>
                ));
              }

              const tipo =
                classificarPeca(bloco)[0]?.tipo ?? ("paragrafo" as const);
              const estiloCitacao =
                tipo === "citacao-juris" ? ESTILO_EMENTA_A4 : undefined;
              return (
                <p
                  key={`${idx}-${bi}`}
                  className={`mb-0 whitespace-pre-wrap ${classePorTipo(tipo)}`}
                  style={estiloCitacao}
                >
                  <TextoJuridicoInline
                    texto={bloco}
                    onAbrirFls={onAbrirFls}
                    className="inline"
                  />
                </p>
              );
            })}
          </div>
          <footer className="pointer-events-none absolute bottom-3 right-[2cm] left-auto text-right text-[9pt] text-stone-500">
            {idx + 1}
          </footer>
        </article>
      ))}
    </div>
  );
}
