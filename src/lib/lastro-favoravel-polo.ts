/**
 * Desfecho da ementa × polo da peça — 0 tokens.
 * A Pesquisa só injeta julgado que sirva a quem o advogado representa.
 */

import type { PoloAdvocacia } from "@/lib/polo-especies-por-area";

export type DesfechoPolo = PoloAdvocacia | "neutro";

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function ehJurisprudencia(categoria: string): boolean {
  const c = categoria.toLowerCase();
  if (c.includes("súmula") || c.includes("sumula")) return false;
  return c.includes("juris");
}

function trechoDispositivo(n: string): string {
  return n.length > 700 ? n.slice(-700) : n;
}

function recursoDeQuem(n: string): PoloAdvocacia | null {
  const m = n.match(
    /recurso[\s\w.]{0,60}?(do autor|da parte autora|do reclamante|do exequente|do impetrante|d[ao] reu|da re\b|da parte re|do reclamado|do executado|da requerida|da empresa|do banco)/
  );
  if (!m?.[1]) return null;
  const quem = m[1];
  if (
    /autor|reclamante|exequente|impetrante/.test(quem)
  ) {
    return "ativo";
  }
  return "passivo";
}

function recursoProvido(n: string): boolean | null {
  if (
    /\b(?:negaram|negou|negado|negar)\s+provimento\b|\bimprovido\b|\bdesprovido\b|\bnao provido\b|\brecurso desprovido\b/.test(
      n
    )
  ) {
    return false;
  }
  if (
    /\b(?:deram|deu|dado|dar)\s+provimento\b|\brecurso provido\b|\bparcialmente provido\b/.test(
      n
    )
  ) {
    return true;
  }
  return null;
}

function meritoAcao(n: string): PoloAdvocacia | null {
  const improcedente =
    /\bimprocedente\b|\bimprocedencia\b|\bdeneg(ou|aram|acao)\s+(?:a\s+)?seguranca\b|\bindeferimento da inicial\b/.test(
      n
    );
  const meroAborrecimento =
    /mero aborrecimento|nao configuracao de dano moral|nao ha dano moral|dano moral afastad/.test(
      n
    );
  const afastouCondenacao = /afastad\w{0,8}\s+a\s+conden/.test(n);
  const procedente =
    !afastouCondenacao &&
    /\bprocedente\b|\bprocedencia\b|\bconden(ar|acao|ou|ado)\b|\bdano moral in re ipsa\b|\bdano moral configurad/.test(
      n
    );
  if ((improcedente || meroAborrecimento) && !procedente) return "passivo";
  if (procedente && !improcedente && !meroAborrecimento) return "ativo";
  if (procedente && (improcedente || meroAborrecimento)) return null;
  return null;
}

/** Quem a ementa favorece: autor (ativo), réu (passivo) ou indefinido. */
export function inferirDesfechoPolo(texto: string): DesfechoPolo {
  const n = normalizar(texto);
  if (!n) return "neutro";
  const foco = trechoDispositivo(n);

  const quem = recursoDeQuem(foco) ?? recursoDeQuem(n);
  const provido = recursoProvido(foco) ?? recursoProvido(n);
  if (quem && provido != null) {
    if (provido) return quem;
    return quem === "ativo" ? "passivo" : "ativo";
  }

  const meritoFoco = meritoAcao(foco);
  if (meritoFoco) return meritoFoco;
  const meritoTodo = meritoAcao(n);
  if (meritoTodo) return meritoTodo;

  if (provido === false && /\bimprocedencia\b|\bimprocedente\b/.test(foco)) {
    return "passivo";
  }
  if (provido === false && /\bprocedencia\b|\bprocedente\b/.test(foco)) {
    return "ativo";
  }

  return "neutro";
}

export function lastroContrarioAoPolo(
  texto: string,
  categoria: string,
  polo: PoloAdvocacia | null | undefined
): boolean {
  if (!polo) return false;
  if (!ehJurisprudencia(categoria)) return false;
  const desfecho = inferirDesfechoPolo(texto);
  return desfecho !== "neutro" && desfecho !== polo;
}

/** Pista na query de embedding/keyword — não substitui os fatos. */
export function pistaQueryPolo(polo: PoloAdvocacia | null | undefined): string {
  if (polo === "passivo") {
    return "julgado favorável ao réu improcedência recurso do autor improvido";
  }
  if (polo === "ativo") {
    return "julgado favorável ao autor procedência condenação recurso da ré improvido";
  }
  return "";
}

export function bonusLastroPolo(
  texto: string,
  categoria: string,
  polo: PoloAdvocacia | null | undefined
): number {
  if (!polo) return 0;
  if (!ehJurisprudencia(categoria)) return 0;
  const desfecho = inferirDesfechoPolo(texto);
  if (desfecho === polo) return 10;
  if (desfecho !== "neutro") return -25;
  return 0;
}
