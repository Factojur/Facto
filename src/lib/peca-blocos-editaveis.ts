/**
 * Segmenta a peça em corpo editável × ementas travadas ([[JURIS]]) × espaços tipográficos.
 * Usado no preview MinutaIA-style (0 tokens).
 */

import {
  parseMarcadorEspaco,
  type MarcadorEspacoParseado,
} from "@/lib/formatacao-forense";
import { classificarPeca, limparMarcadorJuris } from "@/lib/tipografia-peca";

export type SegmentoPecaEditavel = {
  id: string;
  /** corpo = usuário edita; ementa = lastro FACTO; espaco = [[ESPACO_n]] (preview≡export) */
  tipo: "corpo" | "ementa" | "espaco";
  texto: string;
  locked: boolean;
  /** Só em tipo espaco — altura tipográfica. */
  marcador?: MarcadorEspacoParseado;
};

const RE_BLOCO_JURIS =
  /\[\[JURIS\]\]\s*([\s\S]*?)\s*\[\[\/JURIS\]\]/gi;

export function contarRefsPeca(texto: string): {
  fls: number;
  leis: number;
  ementas: number;
} {
  const fls = (texto.match(/\bfls?\.?\s*\d+/gi) ?? []).length;
  const leis = (
    texto.match(
      /\b(?:art(?:igo)?\.?\s*\d+|lei\s+n?[º°.]?\s*[\d./]+|constitui[cç][aã]o federal|c[oó]digo de processo civil|\bCPC\b|\bCDC\b|\bCLT\b)/gi
    ) ?? []
  ).length;
  const ementasMarcadas = (texto.match(/\[\[JURIS\]\]/gi) ?? []).length;
  const ementasClass = classificarPeca(texto).filter(
    (b) => b.tipo === "citacao-juris"
  ).length;
  return {
    fls,
    leis,
    ementas: Math.max(ementasMarcadas, ementasClass),
  };
}

function empilharBlocos(
  segs: SegmentoPecaEditavel[],
  corpo: string,
  iRef: { n: number }
) {
  for (const bloco of classificarPeca(corpo)) {
    if (bloco.tipo === "marcador" && bloco.marcador) {
      segs.push({
        id: `s-${iRef.n++}`,
        tipo: "espaco",
        texto: bloco.texto,
        locked: true,
        marcador: bloco.marcador,
      });
      continue;
    }
    if (bloco.tipo === "citacao-juris") {
      segs.push({
        id: `e-${iRef.n++}`,
        tipo: "ementa",
        texto: limparMarcadorJuris(bloco.texto),
        locked: true,
      });
      continue;
    }
    segs.push({
      id: `c-${iRef.n++}`,
      tipo: "corpo",
      texto: bloco.texto,
      locked: false,
    });
  }
}

/** Divide preservando blocos [[JURIS]]…[[/JURIS]] como ementa travada. */
export function segmentarPecaEditavel(texto: string): SegmentoPecaEditavel[] {
  const bruto = texto.replace(/\r\n/g, "\n");
  const segs: SegmentoPecaEditavel[] = [];
  const iRef = { n: 0 };
  let last = 0;
  let m: RegExpExecArray | null;
  const re = new RegExp(RE_BLOCO_JURIS.source, "gi");
  while ((m = re.exec(bruto)) !== null) {
    if (m.index > last) {
      const corpo = bruto.slice(last, m.index).trim();
      if (corpo) empilharBlocos(segs, corpo, iRef);
    }
    segs.push({
      id: `e-${iRef.n++}`,
      tipo: "ementa",
      texto: limparMarcadorJuris(m[1] ?? ""),
      locked: true,
    });
    last = m.index + m[0].length;
  }
  const resto = bruto.slice(last).trim();
  if (resto) empilharBlocos(segs, resto, iRef);
  return segs;
}

/** Reconstrói texto com [[JURIS]] nas ementas e marcadores de espaço (para export/IA). */
export function reconstruirPecaDeSegmentos(
  segs: SegmentoPecaEditavel[]
): string {
  return segs
    .map((s) => {
      if (s.tipo === "espaco") {
        const m = s.marcador ?? parseMarcadorEspaco(s.texto);
        if (m?.linhas === 6 && m.epigrafe?.length) {
          return `[[ESPACO_6_LINHAS|${m.epigrafe.join(";;")}]]`;
        }
        if (m?.linhas === 6 && m.processo) {
          return `[[ESPACO_6_LINHAS|${m.processo}]]`;
        }
        if (m?.linhas === 2) return "[[ESPACO_2_LINHAS]]";
        if (m?.linhas === 1) return "[[ESPACO_1_LINHA]]";
        return s.texto.trim() || "[[ESPACO_1_LINHA]]";
      }
      const t = s.texto.trim();
      if (!t) return "";
      if (s.tipo === "ementa") return `[[JURIS]]${t}[[/JURIS]]`;
      return t;
    })
    .filter(Boolean)
    .join("\n");
}
