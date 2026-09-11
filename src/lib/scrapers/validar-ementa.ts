/**
 * Valida ementa de scrape (e-SAJ / portais TJ / TSE etc.).
 * Rejeita chrome da página, CSS, `ler mais`, cabeçalho vazio e
 * fragmentos que são só cadeia de precedentes (`Rel. Des.…`).
 */

import type { JulgadoScrape } from "@/lib/scrapers/types";

const CNJ = /\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/;

const LIXO =
  /esajCelula|escolhaBeta|suportesistemastjsp|Identificar-se|Peticionamento Eletr|downloadEmenta|ementaClass|\{[\s\S]*position:\s*relative/i;

/** Começo típico de ementa/julgado útil (não citação solta). */
const INICIO_EMENTA =
  /^(EMENTA\s*:|Ementa\s*:|E\s*M\s*E\s*N\s*T\s*A\b|DIREITO\s|RECURSO\s|APELA[CÇ][AÃ]O(\s+C[IÍ]VEL|\s+CRIMINAL|\s+DEFENSIVA|\s+DA|\s*[.–—-]|\s*$)|AGRAVO\s|EMBARGOS\s|A[CÇ][AÃ]O\s|DECLARAT|INDENIZA|RESPONSABIL|CONSUMIDOR|C[IÍ]VEL\s|PROCESSUAL\s|CIVIL\s|PENAL\s|HABEAS|MANDADO|TUTELA|OBRIGAC|OBRIGAÇÃO|DANOS?\s|FALHA\s|NEGATIVA|V\.V\.\s*Ementa|SEGURO\s|APELA[CÇ][AÃ]O\s*[-–])/i;

function limpar(s: string): string {
  return (s || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Recorta o corpo útil da ementa (tira prefixo "Ementa:", cabeçalho residual).
 * Não tenta “salvar” texto que começa em cadeia de precedentes — isso mascara lixo.
 */
export function normalizarEmentaPortal(texto: string): string {
  let t = limpar(texto);
  t = t.replace(/\.{2,}\s*ler mais/gi, " ").replace(/…\s*ler mais/gi, " ");
  t = limpar(t.replace(/^Ementa\s*:?\s*/i, ""));

  // Só recorta se achar ementa real (não "Apelação Cível n. …" em citação).
  if (/^[,;./\s]*Rel(ator|atora|ª|a)?\.?\s*/i.test(t)) {
    const m = t.match(
      /\b(EMENTA\s*:|DIREITO\s+(?:DO\s+CONSUMIDOR|CIVIL|PROCESSUAL|PENAL)|RECURSO\s+INOMINADO|EMBARGOS\s+DE\s+DECLARA)/i
    );
    if (m?.index != null && m.index > 0) {
      t = t.slice(m.index).replace(/^Ementa\s*:?\s*/i, "");
    }
  }

  const prec = t.search(/\bPrecedentes?\s*:/i);
  if (prec > 220) t = t.slice(0, prec).trim();

  return limpar(t).slice(0, 4500);
}

export function ementaPareceLixo(texto: string): boolean {
  return !ementaJurisPortalValida(texto);
}

/**
 * Contrato de qualidade para seed/portal FACTO — apto a fundamentação de peça.
 * Usar em todo insert de jurisprudência portal (e-SAJ e portais próprios).
 */
export function ementaJurisPortalValida(texto: string): boolean {
  const t = normalizarEmentaPortal(texto);
  if (t.length < 200) return false;
  if (/<[a-z][\s\S]*>/i.test(t)) return false;
  if (LIXO.test(t)) return false;
  if (/ler mais/i.test(t)) return false;

  if (
    /^(PODER JUDICI[AÁ]RIO|Tribunal de Justiça)/i.test(t) &&
    t.length < 900
  ) {
    return false;
  }

  // Fragmento = só cadeia de precedentes / metadados
  if (
    /^[,;./\s]*Rel(ator|atora|ª|a)?\.?\s*(Des|Ju[ií]z|Desa|ª|º|:)/i.test(t)
  ) {
    return false;
  }
  if (/^[,;./\s]*Rel(ator|atora|ª)/i.test(t)) return false;
  if (/^[,;./\s]*\d{1,2}[ªº]?\s*C[aâ]mara/i.test(t)) return false;
  if (/^Voto servindo como ementa/i.test(t)) return false;
  if (/^_{5,}/.test(t)) return false;
  if (/^Número do processo\s*:/i.test(t)) return false;
  // Começa no meio de número/dispositivo sem ementa
  if (/^\/?\d{2,5}\s*[–—-]/.test(t) && !INICIO_EMENTA.test(t)) return false;

  // Espelho e-SAJ colado: metadados sem tese no início
  if (
    /Órgão julgador\s*:/i.test(t) &&
    /Data do julgamento\s*:/i.test(t) &&
    !INICIO_EMENTA.test(t) &&
    !/\bEMENTA\s*:/i.test(t.slice(0, 200))
  ) {
    return false;
  }

  // Colagem de precedentes no início (portal e-SAJ ruim)
  const cnjs = t.match(/\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/g) || [];
  if (cnjs.length >= 3 && /^[,;./\s]*Rel/i.test(t)) return false;
  const tribunais = (
    t.match(
      /\bTJ(AC|AL|AP|AM|BA|CE|DFT?|ES|GO|MA|MG|MS|MT|PA|PB|PE|PI|PR|RJ|RN|RO|RR|RS|SC|SE|SP|TO)\b/gi
    ) || []
  ).length;
  if (tribunais >= 2 && /^[,;./\s]*Rel/i.test(t)) return false;

  const citacoes = (t.match(/\bRel\.?\s*(Des|Ju[ií]z|Desa)/gi) || []).length;
  const datasJ = (t.match(/\bj\.\s*\d{1,2}[./]\d{1,2}[./]\d{2,4}/gi) || [])
    .length;
  if (citacoes >= 3 && !INICIO_EMENTA.test(t)) return false;
  if (citacoes >= 2 && datasJ >= 2 && t.length < 650 && !INICIO_EMENTA.test(t)) {
    return false;
  }
  // Predomínio de citações no início da colagem
  if (citacoes >= 4 && cnjs.length >= 2 && /^[,;./\s]*Rel/i.test(t)) {
    return false;
  }

  // Exige cara de ementa (início ou "Ementa:" cedo)
  const head = t.slice(0, 320);
  const parece =
    INICIO_EMENTA.test(t) ||
    /\bEMENTA\s*:/i.test(head) ||
    /\b(RECURSO INOMINADO|APELA[CÇ][AÃ]O C[IÍ]VEL|AGRAVO DE INSTRUMENTO|EMBARGOS DE DECLARA)/i.test(
      head
    );
  if (!parece) return false;

  // Evita falso positivo: "Apelação Cível n. 0700…" (citação) no início
  if (
    /^APELA[CÇ][AÃ]O C[IÍ]VEL\s*n[ºo°.]?\s*\d{7}/i.test(t) &&
    citacoes >= 1
  ) {
    return false;
  }

  return true;
}

export function julgadoScrapeValido(
  j: Pick<JulgadoScrape, "ementa" | "numeroProcesso" | "titulo">
): boolean {
  const cnj =
    j.numeroProcesso?.match(CNJ)?.[0] || j.titulo?.match(CNJ)?.[0] || null;
  if (!cnj) return false;
  return ementaJurisPortalValida(j.ementa || "");
}

export function filtrarJulgadosScrape<
  T extends Pick<JulgadoScrape, "ementa" | "numeroProcesso" | "titulo">,
>(itens: T[]): T[] {
  return itens
    .map((j) => ({
      ...j,
      ementa: normalizarEmentaPortal(j.ementa || ""),
    }))
    .filter(julgadoScrapeValido);
}
