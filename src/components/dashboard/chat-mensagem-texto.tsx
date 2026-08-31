"use client";

import { Fragment } from "react";

/** Markdown mínimo: **negrito** (o assistente já usa em algumas respostas). */
export function ChatMensagemTexto({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p className="whitespace-pre-wrap">
      {partes.map((parte, i) => {
        if (parte.startsWith("**") && parte.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold">
              {parte.slice(2, -2)}
            </strong>
          );
        }
        return <Fragment key={i}>{parte}</Fragment>;
      })}
    </p>
  );
}
