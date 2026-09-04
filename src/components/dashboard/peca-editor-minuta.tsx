"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TextoJuridicoInline } from "@/components/dashboard/texto-juridico-inline";
import {
  contarRefsPeca,
  reconstruirPecaDeSegmentos,
  segmentarPecaEditavel,
  type SegmentoPecaEditavel,
} from "@/lib/peca-blocos-editaveis";
import { classificarPeca } from "@/lib/tipografia-peca";
import { ESTILO_EMENTA_A4, ESTILO_FOLHA_A4 } from "@/lib/estilo-folha-a4";

type Props = {
  peca: string;
  onAbrirFls?: (pagina: number | null, trecho: string) => void;
  /** Clique na ementa → inspector de lastro (juris do caso / base). */
  onAbrirEmenta?: (textoEmenta: string) => void;
  /** Persiste edição do corpo (ementas não mudam). */
  onPecaEditada?: (texto: string) => void;
  /** Stream / montagem: só leitura com ícones. */
  somenteLeitura?: boolean;
};

export type PecaEditorMinutaHandle = {
  /** Lê o DOM (inclui edição ainda em foco), sincroniza e devolve o texto. */
  flushTexto: () => string;
};

function classePorTipo(tipo: string): string {
  switch (tipo) {
    case "enderecamento":
    case "nome-acao":
      return "text-center font-bold uppercase tracking-wide";
    case "secao-titulo":
      // Negrito só se a IA marcou (**…**) — alinhado ao PDF/Word
      return "uppercase";
    case "subtopico":
      return "pl-[2cm] max-[720px]:pl-4";
    case "fechamento":
      return "text-center";
    case "item-pedido":
      return "text-justify indent-[2cm] max-[720px]:indent-6";
    default:
      return "text-justify indent-[2cm] max-[720px]:indent-6";
  }
}

function espacoBloco(tipo: string, texto?: string): string {
  switch (tipo) {
    case "secao-titulo":
      return "mt-[1.5em] mb-0";
    case "subtopico":
      return "mt-[0.75em] mb-0";
    case "fechamento":
      // Respiro só antes de Nestes termos (marcador [[ESPACO_1]] já cobre o caso normalizado)
      if (/^(Nestes termos|Termos em que)/i.test((texto ?? "").trim())) {
        return "mt-0 mb-0";
      }
      return "mt-0 mb-0";
    case "enderecamento":
    case "nome-acao":
      return "mb-0";
    default:
      return "mb-0";
  }
}

function textoDoNo(el: HTMLElement): string {
  return (el.innerText ?? "").replace(/\u00a0/g, " ").replace(/\r\n/g, "\n");
}

/**
 * Leitura com fls./lei clicáveis; clique no parágrafo entra no contenteditable.
 */
function BlocoCorpo({
  seg,
  onAbrirFls,
  somenteLeitura,
  onCommit,
}: {
  seg: SegmentoPecaEditavel;
  onAbrirFls?: Props["onAbrirFls"];
  somenteLeitura?: boolean;
  onCommit: (id: string, texto: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const focandoRef = useRef(false);
  const [editando, setEditando] = useState(false);
  const tipo =
    classificarPeca(seg.texto)[0]?.tipo ?? ("paragrafo" as const);
  const cls = `font-serif text-[12pt] leading-[1.5] text-black ${classePorTipo(tipo)} ${espacoBloco(tipo, seg.texto)}`;
  const mostraInline = somenteLeitura || (!editando && Boolean(onAbrirFls));

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || mostraInline) return;
    el.innerText = seg.texto;
    el.focus();
    const sel = window.getSelection();
    if (sel) {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [seg.id, mostraInline, editando]);

  useEffect(() => {
    const el = ref.current;
    if (!el || focandoRef.current || mostraInline) return;
    if (textoDoNo(el).trim() !== seg.texto.trim()) {
      el.innerText = seg.texto;
    }
  }, [seg.texto, mostraInline]);

  if (mostraInline) {
    return (
      <div
        className={`${cls} ${somenteLeitura ? "" : "cursor-text rounded-sm transition hover:bg-sky-50/40"}`}
        data-seg-id={seg.id}
        onClick={() => {
          if (!somenteLeitura) setEditando(true);
        }}
        title={somenteLeitura ? undefined : "Clique para editar"}
      >
        <TextoJuridicoInline
          texto={seg.texto}
          onAbrirFls={onAbrirFls}
          className="font-serif text-[12pt] leading-[1.5] text-black"
        />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      data-seg-id={seg.id}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label="Editar parágrafo"
      spellCheck
      className={`${cls} rounded-sm outline-none transition hover:bg-sky-50/50 focus:bg-sky-50/70 focus:ring-1 focus:ring-sky-300/50`}
      onFocus={() => {
        focandoRef.current = true;
      }}
      onBlur={() => {
        focandoRef.current = false;
        const el = ref.current;
        if (!el) return;
        const next = textoDoNo(el).trim();
        if (next !== seg.texto.trim()) onCommit(seg.id, next);
        setEditando(false);
      }}
    />
  );
}

function BlocoEspacoTipografico({
  marcador,
}: {
  marcador?: SegmentoPecaEditavel["marcador"];
}) {
  const linhas = marcador?.linhas ?? 1;
  if (linhas === 6) {
    const extra =
      marcador?.epigrafe && marcador.epigrafe.length > 0
        ? marcador.epigrafe
        : marcador?.processo
          ? [marcador.processo]
          : [];
    const inicio = extra.length >= 3 ? 2 : 4;
    return (
      <div className="w-full" aria-hidden>
        {Array.from({ length: 6 }, (_, i) => {
          const idx = i + 1 - inicio;
          const texto =
            idx >= 0 && idx < extra.length ? extra[idx]! : "";
          return (
            <p
              key={i}
              className="m-0 min-h-[1.5em] p-0 text-left font-serif text-[12pt] leading-[1.5] text-black"
            >
              {texto || "\u00a0"}
            </p>
          );
        })}
      </div>
    );
  }
  return (
    <div
      className="w-full"
      style={{ height: `calc(1.5em * ${linhas})` }}
      aria-hidden
    />
  );
}

function BlocoEmenta({
  texto,
  onAbrirFls,
  onAbrirEmenta,
}: {
  texto: string;
  onAbrirFls?: Props["onAbrirFls"];
  onAbrirEmenta?: Props["onAbrirEmenta"];
}) {
  return (
    <div
      className="mb-0 mt-[0.75em] select-none border-l-2 border-stone-300 bg-stone-50/80 py-2 pl-4 pr-2"
      style={ESTILO_EMENTA_A4}
      contentEditable={false}
      suppressContentEditableWarning
      title="Ementa da base FACTO — não editável"
    >
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">
          Ementa · só leitura
        </p>
        {onAbrirEmenta ? (
          <button
            type="button"
            onClick={() => onAbrirEmenta(texto)}
            className="rounded border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-800 hover:bg-violet-100"
          >
            Ver lastro
          </button>
        ) : null}
      </div>
      <TextoJuridicoInline
        texto={texto}
        onAbrirFls={onAbrirFls}
        className="font-serif text-[10pt] italic leading-[1.5] text-slate-800"
      />
    </div>
  );
}

function ToolbarRefs({
  fls,
  leis,
  ementas,
}: {
  fls: number;
  leis: number;
  ementas: number;
}) {
  if (fls + leis + ementas === 0) return null;
  return (
    <div className="mb-2 flex flex-wrap gap-2 text-[11px] text-stone-500">
      {fls > 0 ? <span>{fls} fls. clicáveis no texto</span> : null}
      {leis > 0 ? <span>{leis} lei(s)</span> : null}
      {ementas > 0 ? <span>{ementas} ementa(s)</span> : null}
    </div>
  );
}

export const PecaEditorMinuta = forwardRef<PecaEditorMinutaHandle, Props>(
  function PecaEditorMinuta(
    { peca, onAbrirFls, onAbrirEmenta, onPecaEditada, somenteLeitura = false },
    ref
  ) {
    const rootRef = useRef<HTMLDivElement>(null);
    const segsState = useMemo(() => segmentarPecaEditavel(peca), [peca]);
    const segsRef = useRef(segsState);
    segsRef.current = segsState;
    const contagem = useMemo(() => contarRefsPeca(peca), [peca]);
    const onPecaEditadaRef = useRef(onPecaEditada);
    onPecaEditadaRef.current = onPecaEditada;

    function commit(id: string, texto: string) {
      const next = segsRef.current.map((s) =>
        s.id === id && !s.locked ? { ...s, texto } : s
      );
      segsRef.current = next;
      onPecaEditadaRef.current?.(reconstruirPecaDeSegmentos(next));
    }

    useImperativeHandle(ref, () => ({
      flushTexto: () => {
        const root = rootRef.current;
        if (!root) return peca;
        const ativo = document.activeElement;
        if (ativo instanceof HTMLElement && root.contains(ativo)) {
          ativo.blur();
        }
        const next = segsRef.current.map((s) => {
          if (s.locked || s.tipo === "ementa") return s;
          const el = root.querySelector(
            `[data-seg-id="${CSS.escape(s.id)}"]`
          ) as HTMLElement | null;
          if (!el) return s;
          const t = textoDoNo(el).trim();
          return t ? { ...s, texto: t } : s;
        });
        segsRef.current = next;
        const texto = reconstruirPecaDeSegmentos(next);
        onPecaEditadaRef.current?.(texto);
        return texto;
      },
    }));

    if (!peca.trim()) {
      return <p className="text-sm text-slate-500">Redigindo peça…</p>;
    }

    return (
      <div className="relative" ref={rootRef}>
        {!somenteLeitura ? (
          <p className="mb-3 rounded-md bg-sky-700 px-3 py-2 text-center text-[12px] font-medium leading-snug text-white sm:text-[13px]">
            Clique no parágrafo para editar · ícones fls./lei abrem o anexo.
            Ementas da base FACTO ficam travadas · use Ver lastro.
          </p>
        ) : (
          <p className="mb-3 rounded-md border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-center text-[11px] text-amber-950">
            Montando a peça… o texto cresce aqui. Depois você edita no próprio
            documento.
          </p>
        )}

        <ToolbarRefs
          fls={contagem.fls}
          leis={contagem.leis}
          ementas={contagem.ementas}
        />

        <article
          className="documento-juridico rounded-lg border border-slate-200 shadow-inner"
          style={ESTILO_FOLHA_A4}
        >
          <div className="documento-conteudo">
            {segsState.map((s) =>
              s.tipo === "ementa" ? (
                <BlocoEmenta
                  key={s.id}
                  texto={s.texto}
                  onAbrirFls={onAbrirFls}
                  onAbrirEmenta={onAbrirEmenta}
                />
              ) : s.tipo === "espaco" ? (
                <BlocoEspacoTipografico key={s.id} marcador={s.marcador} />
              ) : (
                <BlocoCorpo
                  key={s.id}
                  seg={s}
                  onAbrirFls={onAbrirFls}
                  somenteLeitura={somenteLeitura}
                  onCommit={commit}
                />
              )
            )}
          </div>
        </article>
      </div>
    );
  }
);
