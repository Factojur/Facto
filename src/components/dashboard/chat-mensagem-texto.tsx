"use client";

import { TextoJuridicoInline } from "@/components/dashboard/texto-juridico-inline";

type Props = {
  texto: string;
  onAbrirFls?: (pagina: number | null, trecho: string) => void;
};

/** Mensagem do chat com markdown mínimo e citações inline. */
export function ChatMensagemTexto({ texto, onAbrirFls }: Props) {
  return <TextoJuridicoInline texto={texto} onAbrirFls={onAbrirFls} />;
}
