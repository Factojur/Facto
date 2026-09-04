/**
 * Casa ementa / citação da peça com juris anexada ao caso ou título da base FACTO.
 * 0 tokens — só CNJ e sobreposição de texto.
 */

export type FonteJurisCasavel = {
  id?: string;
  titulo: string;
  texto?: string;
  categoria?: string;
};

const CNJ_RE = /\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/g;

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function soDigitos(s: string): string {
  return s.replace(/\D/g, "");
}

export function extrairCnjs(texto: string): string[] {
  const out: string[] = [];
  for (const m of texto.matchAll(new RegExp(CNJ_RE.source, "g"))) {
    const d = soDigitos(m[0]);
    if (d.length === 20) out.push(d);
  }
  return out;
}

function scoreSobreposicao(a: string, b: string): number {
  const na = normalizar(a);
  const nb = normalizar(b);
  if (!na || !nb) return 0;
  if (na.includes(nb) || nb.includes(na)) return 0.9;
  const palavrasA = new Set(na.split(" ").filter((p) => p.length >= 5));
  if (palavrasA.size === 0) return 0;
  let hit = 0;
  for (const p of palavrasA) {
    if (nb.includes(p)) hit++;
  }
  return hit / palavrasA.size;
}

export type MatchJurisCaso = {
  fonte: FonteJurisCasavel;
  origem: "juris_caso" | "base_facto";
  confianca: "alta" | "media";
  motivo: string;
};

/**
 * Preferência: CNJ igual → alta; título/texto com boa sobreposição → média.
 */
export function casarEmentaComFontes(
  ementa: string,
  jurisCaso: FonteJurisCasavel[],
  baseFacto: FonteJurisCasavel[] = []
): MatchJurisCaso | null {
  const trecho = ementa.trim();
  if (!trecho) return null;
  const cnjsEmenta = new Set(extrairCnjs(trecho));

  const candidatos: MatchJurisCaso[] = [];

  const cnjFormatado = (digitos: string) => {
    const m = trecho.match(CNJ_RE);
    if (m) {
      for (const raw of m) {
        if (soDigitos(raw) === digitos) return raw;
      }
    }
    return digitos;
  };

  for (const f of jurisCaso) {
    const blob = `${f.titulo}\n${f.texto ?? ""}`;
    const cnjsFonte = extrairCnjs(blob);
    const cnjHit = cnjsFonte.find((c) => cnjsEmenta.has(c));
    if (cnjHit) {
      candidatos.push({
        fonte: f,
        origem: "juris_caso",
        confianca: "alta",
        motivo: `CNJ ${cnjFormatado(cnjHit)}`,
      });
      continue;
    }
    const sTitulo = scoreSobreposicao(trecho, f.titulo);
    const sTexto = scoreSobreposicao(trecho.slice(0, 400), (f.texto ?? "").slice(0, 800));
    const s = Math.max(sTitulo, sTexto);
    if (s >= 0.35) {
      candidatos.push({
        fonte: f,
        origem: "juris_caso",
        confianca: s >= 0.55 ? "alta" : "media",
        motivo: sTitulo >= sTexto ? "título" : "texto anexado",
      });
    }
  }

  for (const f of baseFacto) {
    const blob = `${f.titulo}\n${f.texto ?? ""}`;
    const cnjsFonte = extrairCnjs(blob);
    const cnjHit = cnjsFonte.find((c) => cnjsEmenta.has(c));
    if (cnjHit) {
      candidatos.push({
        fonte: f,
        origem: "base_facto",
        confianca: "alta",
        motivo: `CNJ na base FACTO`,
      });
      continue;
    }
    const s = scoreSobreposicao(trecho, f.titulo);
    if (s >= 0.4) {
      candidatos.push({
        fonte: f,
        origem: "base_facto",
        confianca: s >= 0.6 ? "alta" : "media",
        motivo: "título na base FACTO",
      });
    }
  }

  if (candidatos.length === 0) return null;
  candidatos.sort((a, b) => {
    const rank = (c: MatchJurisCaso) =>
      (c.confianca === "alta" ? 2 : 1) + (c.origem === "juris_caso" ? 0.5 : 0);
    return rank(b) - rank(a);
  });
  return candidatos[0]!;
}
