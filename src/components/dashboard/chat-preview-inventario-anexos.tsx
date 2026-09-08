"use client";

/**
 * Aba Peça sem texto — empty state ou inventário do que foi anexado.
 */

type Props = {
  arquivos: { nome: string }[];
  numeroProcesso?: string | null;
  foro?: string | null;
  mensagem?: string | null;
  modoWorkspace?: boolean;
};

export function ChatPreviewInventarioAnexos({
  arquivos,
  numeroProcesso,
  foro,
  mensagem,
  modoWorkspace = false,
}: Props) {
  const temMeta = Boolean(numeroProcesso?.trim() || foro?.trim());
  const temArquivos = arquivos.length > 0;
  const vazio = !temMeta && !temArquivos;

  if (vazio) {
    return (
      <div className="mx-auto flex min-h-[min(420px,55vh)] max-w-md flex-col items-center justify-center px-6 py-12 text-center">
        <p
          className={
            modoWorkspace
              ? "font-[family-name:var(--font-facto)] text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-facto-gold/80"
              : "font-[family-name:var(--font-facto)] text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-stone-500"
          }
        >
          Área da peça
        </p>
        <p
          className={
            modoWorkspace
              ? "mt-4 text-lg font-semibold leading-snug tracking-tight text-stone-100 sm:text-xl"
              : "mt-4 text-lg font-semibold leading-snug tracking-tight text-stone-800 sm:text-xl"
          }
        >
          O preview aparece aqui
        </p>
        <p
          className={
            modoWorkspace
              ? "mt-3 max-w-sm text-sm leading-relaxed text-stone-400"
              : "mt-3 max-w-sm text-sm leading-relaxed text-stone-600"
          }
        >
          {mensagem?.trim() ||
            "Anexe os autos ou descreva o caso no Assistente. Quando estiver pronto, use Gerar preview — a peça sobe neste painel."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[min(360px,50vh)] max-w-lg flex-col justify-center px-4 py-8">
      <p
        className={
          modoWorkspace
            ? "text-center font-[family-name:var(--font-facto)] text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-facto-gold/80"
            : "text-center font-[family-name:var(--font-facto)] text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-stone-500"
        }
      >
        No contexto
      </p>
      <p
        className={
          modoWorkspace
            ? "mt-2 text-center text-sm leading-relaxed text-stone-400"
            : "mt-2 text-center text-sm leading-relaxed text-stone-600"
        }
      >
        {mensagem?.trim() ||
          "Documentos e metadados do caso. A peça completa sobe após Gerar preview."}
      </p>

      <ul
        className={
          modoWorkspace
            ? "mt-5 space-y-2 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-stone-200"
            : "mt-5 space-y-2 rounded-xl border border-stone-200 bg-white/90 p-4 text-sm text-stone-800 shadow-sm"
        }
      >
        {numeroProcesso?.trim() ? (
          <li>
            <span
              className={
                modoWorkspace
                  ? "text-xs font-medium text-stone-500"
                  : "text-xs font-medium text-stone-500"
              }
            >
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
    </div>
  );
}
