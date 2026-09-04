"use client";

/**
 * Aba Peça sem minuta — listagem do que foi anexado.
 * Não mostra OCR cru nem “entendimento” do caso.
 */

export function ChatPreviewInventarioAnexos({
  arquivos,
  numeroProcesso,
  foro,
  mensagem,
}: {
  arquivos: { nome: string }[];
  numeroProcesso?: string | null;
  foro?: string | null;
  mensagem?: string | null;
}) {
  const temMeta = Boolean(numeroProcesso?.trim() || foro?.trim());
  const temArquivos = arquivos.length > 0;

  return (
    <div className="mx-auto flex min-h-[min(360px,50vh)] max-w-lg flex-col justify-center px-4 py-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
        Documentos no contexto
      </p>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">
        {mensagem?.trim() ||
          "O arquivo entrou no contexto. Oriente no chat o que pretende (ex.: agravo, contestação). A peça só aparece aqui depois do modo Minuta."}
      </p>

      {(temMeta || temArquivos) && (
        <ul className="mt-5 space-y-2 rounded-xl border border-stone-200 bg-white/90 p-4 text-sm text-stone-800 shadow-sm">
          {numeroProcesso?.trim() ? (
            <li>
              <span className="text-xs font-medium text-stone-500">
                Processo nº{" "}
              </span>
              {numeroProcesso.trim()}
            </li>
          ) : null}
          {foro?.trim() ? (
            <li>
              <span className="text-xs font-medium text-stone-500">Foro </span>
              {foro.trim()}
            </li>
          ) : null}
          {arquivos.map((a) => (
            <li key={a.nome} className="truncate">
              <span className="text-xs font-medium text-stone-500">Arquivo </span>
              {a.nome}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
