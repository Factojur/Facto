"use client";

import { Fragment, useMemo } from "react";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconFileText({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8"
        {...stroke}
        strokeWidth={1.75}
      />
    </svg>
  );
}

function IconCheckCircle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="10" {...stroke} strokeWidth={2} />
      <path d="m9 12 2 2 4-4" {...stroke} strokeWidth={2} />
    </svg>
  );
}

/** Padrões MinutaIA-like: (fls. 34), art. 5º CF, Lei 12.016/2009. */
const RE_FLS = /(\(?\s*fls?\.?\s*[\d]+(?:\s*\/\s*[\d]+)?(?:\s*e\s*[\d]+)?\s*\)?)/gi;
const RE_LEI =
  /((?:art(?:igos?)?\.?\s*\d+[º°]?(?:\s*,\s*\d+[º°]?)*(?:\s*e\s*\d+[º°]?)?(?:\s*,\s*(?:inciso\s+[IVXLCDM]+|§\s*\d+[º°]?))?[^,.;]{0,48}(?:constitui[cç][aã]o federal|c[oó]digo de processo civil|c[oó]digo civil|cpc|cf|cdc|clt|lei\s+n?[º°.]?\s*[\d./]+(?:\/\d{2,4})?))|(?:lei\s+n?[º°.]?\s*[\d./]+(?:\/\d{2,4})?)|(?:constitui[cç][aã]o federal)|(?:c[oó]digo de processo civil))/gi;

type Props = {
  texto: string;
  className?: string;
  /** Abre anexo na página citada (quando conhecida). */
  onAbrirFls?: (pagina: number | null, trecho: string) => void;
};

function extrairPaginaFls(token: string): number | null {
  const m = token.match(/fls?\.?\s*(\d+)/i);
  return m ? Number(m[1]) : null;
}

function renderizarSegmento(
  segmento: string,
  key: string,
  onAbrirFls?: Props["onAbrirFls"]
) {
  const flsMatch = segmento.match(/^(\(?\s*fls?\.)/i);
  if (flsMatch) {
    const pagina = extrairPaginaFls(segmento);
    return (
      <span key={key} className="inline-flex items-center gap-0.5">
        <span>{segmento.replace(/\s+$/, "")}</span>
        <button
          type="button"
          title={
            pagina
              ? `Abrir anexo na p. ${pagina}`
              : "Referência aos autos anexados"
          }
          onClick={() => onAbrirFls?.(pagina, segmento)}
          className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded text-stone-400 transition hover:text-sky-400"
          aria-label="Ver trecho no anexo"
        >
          <IconFileText className="h-3.5 w-3.5" />
        </button>
      </span>
    );
  }

  if (RE_LEI.test(segmento)) {
    RE_LEI.lastIndex = 0;
    return (
      <span key={key} className="inline-flex items-center gap-0.5">
        <span>{segmento}</span>
        <span
          className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-emerald-500"
          title="Referência legal reconhecida"
          aria-hidden
        >
          <IconCheckCircle className="h-3.5 w-3.5" />
        </span>
      </span>
    );
  }

  return <Fragment key={key}>{segmento}</Fragment>;
}

/** Texto com **negrito**, ícones de fls. e ✓ em lei (estilo MinutaIA). */
export function TextoJuridicoInline({
  texto,
  className,
  onAbrirFls,
}: Props) {
  const partes = useMemo(() => {
    const tokens: { tipo: "md" | "txt"; valor: string }[] = [];
    const re = /(\*\*[^*]+\*\*|\(?\s*fls?\.?\s*[\d]+(?:\s*\/\s*[\d]+)?(?:\s*e\s*[\d]+)?\s*\)?)/gi;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(texto)) !== null) {
      if (m.index > last) {
        tokens.push({ tipo: "txt", valor: texto.slice(last, m.index) });
      }
      tokens.push({ tipo: "md", valor: m[0] });
      last = m.index + m[0].length;
    }
    if (last < texto.length) {
      tokens.push({ tipo: "txt", valor: texto.slice(last) });
    }
    return tokens;
  }, [texto]);

  return (
    <span className={`block whitespace-pre-wrap ${className ?? ""}`}>
      {partes.map((p, i) => {
        if (p.tipo === "md" && p.valor.startsWith("**")) {
          return (
            <strong key={i} className="font-semibold">
              {p.valor.slice(2, -2)}
            </strong>
          );
        }
        const sub = p.valor.split(RE_LEI);
        return sub.map((s, j) => {
          const key = `${i}-${j}`;
          if (!s) return null;
          if (/^\(?\s*fls?\.?/i.test(s.trim())) {
            return renderizarSegmento(s, key, onAbrirFls);
          }
          if (RE_LEI.test(s)) {
            RE_LEI.lastIndex = 0;
            return renderizarSegmento(s, key, onAbrirFls);
          }
          return <Fragment key={key}>{s}</Fragment>;
        });
      })}
    </span>
  );
}
