"use client";

import { TextoJuridicoInline } from "@/components/dashboard/texto-juridico-inline";

type Props = {
  texto: string;
  onAbrirFls?: (pagina: number | null, trecho: string) => void;
  /** Cursor piscando enquanto o stream chega. */
  streaming?: boolean;
};

/** Mensagem do chat com markdown mínimo e citações inline. */
export function ChatMensagemTexto({ texto, onAbrirFls, streaming }: Props) {
  return (
    <span className="relative">
      <TextoJuridicoInline texto={texto} onAbrirFls={onAbrirFls} />
      {streaming ? (
        <span
          className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.1em] animate-pulse bg-current align-middle opacity-70"
          aria-hidden
        />
      ) : null}
    </span>
  );
}
