"use client";

import type { AreaIdMinuta } from "@/lib/minuta-modulo";
import {
  cabecalhoConferenciaTribunal,
  docsConferenciaComTribunal,
} from "@/lib/docs-conferencia-protocolo";

export function ProtocoloDocsChecklist({
  areaId,
  foro,
  numeroProcesso,
  compacto,
}: {
  areaId: AreaIdMinuta | string;
  foro?: string;
  numeroProcesso?: string;
  /** Menos padding — painel do chat. */
  compacto?: boolean;
}) {
  const conferencia = docsConferenciaComTribunal({
    areaId,
    foro,
    numeroProcesso,
  });
  const cabecalho = cabecalhoConferenciaTribunal(conferencia.tribunalId);

  return (
    <div
      className={
        compacto
          ? "rounded-lg border border-stone-200 bg-stone-50/80 p-3"
          : "rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      }
    >
      <h2
        className={
          compacto
            ? "text-sm font-semibold text-stone-800"
            : "text-lg font-semibold text-slate-800"
        }
      >
        Conferência de documentos
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-stone-600">
        Lembrete do que você junta no protocolo (e-proc, ESAJ ou presencial). O
        FACTO não envia esses arquivos ao juízo.
      </p>
      <p className="mt-2 text-[11px] font-medium text-stone-700">
        Tribunal inferido: {conferencia.tribunalRotulo}
      </p>
      {cabecalho ? (
        <p className="mt-2 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-[11px] leading-relaxed text-sky-950">
          {cabecalho}
        </p>
      ) : null}
      <ul className="mt-3 list-disc space-y-2 pl-5">
        {conferencia.itens.map((doc) => (
          <li key={doc.id} className="text-xs text-stone-800 sm:text-sm">
            {doc.label}
            {doc.nota ? (
              <span className="mt-0.5 block text-[11px] font-normal text-stone-500">
                {doc.nota}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
