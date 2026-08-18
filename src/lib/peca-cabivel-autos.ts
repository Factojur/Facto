/**
 * Interpreta autos / relato para a peça a PROTOCOLAR agora.
 * Não confundir com a espécie do incidente já aberto.
 */

import type { EscritorioConfig } from "@/lib/escritorio-types";
import { extrairCidadeUfDoForo, ufValida } from "@/lib/endereco-comarca";
import { moduloDaArea } from "@/lib/minuta-modulo";
import { nomesAutoresCurto, nomesReusCurto } from "@/lib/partes-ja-qualificadas";
import type { AutorValue } from "@/lib/autor-types";
import type { ReuValue } from "@/lib/reu-types";

const CNJ =
  /\b(\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4})\b/;

export type MetadadosAutos = {
  numeroProcesso: string | null;
  foro: string | null;
  cidade: string | null;
  uf: string | null;
  numeroVara: string | null;
  complementoOrgao: string | null;
};

/**
 * Teto da triagem (entrada / análise). ~180 mil caracteres ≈ 90–120 páginas
 * de texto extraído — cabe no contexto do Flash-Lite (1M tokens) e no
 * timeout de 60s. PDF maior: capa + decisões do miolo + fim (último ato).
 */
export const LIMITE_RELATO_TRIAGEM_CHARS = 180_000;

function trechosDecisao(texto: string, maxChars: number): string {
  if (maxChars < 80 || !texto.trim()) return "";
  const re = /\bDECIS[AÃ]O\b[\s\S]{0,2200}/gi;
  const partes: string[] = [];
  let usado = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto)) !== null && usado < maxChars) {
    const bloco = m[0].replace(/\s+/g, " ").trim();
    if (bloco.length < 40) continue;
    partes.push(bloco);
    usado += bloco.length + 2;
  }
  return partes.join("\n\n").slice(0, maxChars);
}

export function janelaRelatoParaTriagem(
  texto: string,
  max = LIMITE_RELATO_TRIAGEM_CHARS
): string {
  const t = texto.trim();
  if (t.length <= max) return t;
  const cabeca = Math.min(40_000, Math.floor(max * 0.22));
  const reservaDecisoes = Math.min(30_000, Math.floor(max * 0.18));
  const cauda = max - cabeca - reservaDecisoes - 180;
  const meio = t.slice(cabeca, Math.max(cabeca, t.length - cauda));
  const decisoes = trechosDecisao(meio, reservaDecisoes);
  const miolo = decisoes
    ? `[...decisões do trecho intermediário...]\n${decisoes}`
    : "[...trecho intermediário omitido — priorize o último ato...]";
  const caudaEfetiva = decisoes ? cauda : cauda + reservaDecisoes;
  return `${t.slice(0, cabeca)}\n\n${miolo}\n\n${t.slice(-caudaEfetiva)}`;
}

function normalizarBlob(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/** Cumprimento/execução já instaurado — não é peça nova de abertura. */
export function incidenteExecucaoJaAberto(texto: string): boolean {
  const t = normalizarBlob(texto);
  if (!t) return false;
  if (
    /cumprimento de sentenca n[oº°]|autos do cumprimento|incidente de cumprimento ja|cumprimento ja (em curso|instaurado|aberto|distribuido)/.test(
      t
    )
  ) {
    return true;
  }
  const temCumprimento = /cumprimento de sentenca|\bfase de (cumprimento|execucao)\b/.test(
    t
  );
  const temDecisaoPosterior =
    /\bdecisao\b/.test(t) &&
    /(astreinte|multa (diaria|cominatoria)|penhora|sisbajud|erro material|tutela)/.test(
      t
    );
  const jaEmCurso =
    /(exequente|executad[oa]|planilha de debito|intimacao para pagar)/.test(t);
  return temCumprimento && (temDecisaoPosterior || jaEmCurso);
}

function especieEmbargosDaArea(areaId: string): string {
  if (areaId === "jec" || areaId === "jecr") return "embargos";
  return "embargos-declaracao";
}

function especieAgravoDaArea(areaId: string): string {
  if (areaId === "trabalhista") return "agravo-instrumento";
  return "agravo-instrumento";
}

function ehEspecieAberturaExecucao(especie: string): boolean {
  const e = especie.toLowerCase();
  return (
    e === "execucao" ||
    e === "cumprimento-sentenca" ||
    e === "cumprimento-alimentos" ||
    e === "execucao-titulo"
  );
}

/**
 * Último ato nos autos: o que protocolar (não o nome do processo).
 * JEC: agravo de interlocutória é excepcional — ED se o ataque for vício.
 */
export function pecaCabivelAposUltimoAto(
  areaId: string,
  texto: string
): string | null {
  const t = normalizarBlob(texto);
  if (!t) return null;

  if (/agravo de instrumento/.test(t) && /interpor|cabivel|recorrer/.test(t)) {
    return especieAgravoDaArea(areaId);
  }
  if (/embargos de declara/.test(t) && /opor|cabivel|omissao|contradicao/.test(t)) {
    return especieEmbargosDaArea(areaId);
  }

  const vicio =
    /omissao|contradicao|obscuridade|erro material/.test(t);
  const interlocutoria =
    /decisao (interlocutoria|que (alterou|reduziu|majorou|fixou|reconheceu))|alter(ou|acao) (d[ao]s )?astreintes|multa (diaria|cominatoria).{0,80}(alter|reduz|fixad|erro material)/.test(
      t
    ) ||
    (/astreinte|multa diaria/.test(t) && /erro material|nao em seu valor|forma de aplicacao/.test(t));

  if (!incidenteExecucaoJaAberto(texto) && !interlocutoria && !vicio) {
    return null;
  }

  if (vicio) return especieEmbargosDaArea(areaId);
  if (interlocutoria) {
    if (areaId === "jec" || areaId === "jecr") {
      return especieEmbargosDaArea(areaId);
    }
    return especieAgravoDaArea(areaId);
  }
  if (incidenteExecucaoJaAberto(texto) && /\bdecisao\b/.test(t)) {
    return areaId === "jec" || areaId === "jecr"
      ? especieEmbargosDaArea(areaId)
      : especieAgravoDaArea(areaId);
  }
  return null;
}

/** Corrige espécie quando o relato é o processo já em curso, não a peça a redigir. */
export function ajustarEspecieCabivel(params: {
  areaId: string;
  especie: string;
  tipoAcao?: string | null;
  fatos?: string | null;
}): string {
  const especie = String(params.especie ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  const blob = `${params.tipoAcao ?? ""} ${params.fatos ?? ""}`;
  const cabivel = pecaCabivelAposUltimoAto(params.areaId, blob);
  if (!cabivel) return params.especie;
  if (ehEspecieAberturaExecucao(especie) || especie === "peticao-inicial") {
    return cabivel;
  }
  return params.especie;
}

function numeroVaraDoTexto(texto: string): string | null {
  const m =
    texto.match(
      /(\d{1,3})\s*[ªºo°]?\s*(?:vara|juizado especial|zona eleitoral)/i
    ) ?? texto.match(/\b(\d{1,3})[ªº]\s*(?:vara|juizado)/i);
  return m?.[1] ?? null;
}

function complementoOrgaoDoTexto(texto: string): string | null {
  const anexo = texto.match(/anexo\s+([A-Za-zÀ-ÿ]{3,40})/i);
  const partes: string[] = [];
  if (/foro central/i.test(texto)) partes.push("FORO CENTRAL");
  if (anexo) partes.push(`ANEXO ${anexo[1]!.trim().toUpperCase()}`);
  return partes.length ? partes.join(" ") : null;
}

export function extrairMetadadosAutos(texto: string): MetadadosAutos {
  const t = texto.replace(/\u0000/g, " ");
  const cnj = t.match(CNJ)?.[1] ?? null;
  let cidadeUf = extrairCidadeUfDoForo(t);
  if (!cidadeUf.cidade || !cidadeUf.uf) {
    const m = t.match(
      /\b([A-Za-zÀ-ÿ']{3,}(?:\s+[A-Za-zÀ-ÿ']+){0,3})\s*[\/–-]\s*([A-Za-z]{2})\b/
    );
    if (m) {
      const uf = m[2]!.toUpperCase();
      if (ufValida(uf)) {
        cidadeUf = { cidade: m[1]!.trim(), uf };
      }
    }
  }

  const foroMatch =
    t.match(
      /Foro Central Juizados Especiais C[ií]veis[\s\S]{0,80}Juizado Especial C[ií]vel Anexo [A-Za-zÀ-ÿ]+/i
    ) ??
    t.match(
      /Juizado Especial C[ií]vel Anexo [A-Za-zÀ-ÿ]+[\s\S]{0,60}S[aã]o Paulo\s*[\/–-]\s*SP/i
    ) ??
    t.match(
      /Anexo do Juizado Especial C[ií]vel[\s\S]{0,120}S[aã]o Paulo\s*[\/–-]\s*SP/i
    );

  let foro = foroMatch?.[0]?.replace(/\s+/g, " ").trim() ?? null;
  if (!foro && cidadeUf.cidade && cidadeUf.uf) {
    if (/juizado especial c[ií]vel/i.test(t)) {
      foro = `Juizado Especial Cível de ${cidadeUf.cidade}/${cidadeUf.uf}`;
    }
  }

  return {
    numeroProcesso: cnj,
    foro,
    cidade: cidadeUf.cidade || null,
    uf: cidadeUf.uf || null,
    numeroVara: numeroVaraDoTexto(t),
    complementoOrgao: complementoOrgaoDoTexto(t),
  };
}

function capitalizarRotulo(rotulo: string): string {
  const t = rotulo.trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/**
 * Rótulos da epígrafe (Autor/Réu, Exequente/Executado, Reclamante…).
 */
export function rotulosEpigrafePeca(
  areaId: string,
  especie: string,
  fatos?: string | null
): { ativo: string; passivo: string } {
  const e = String(especie ?? "").toLowerCase();
  const blob = normalizarBlob(`${especie} ${fatos ?? ""}`);
  const modulo = moduloDaArea(areaId);

  if (e.includes("reconven")) {
    return { ativo: "Reconvinte", passivo: "Reconvindo" };
  }
  if (
    ehEspecieAberturaExecucao(e) ||
    /exequente|executad|cumprimento de sentenca|fase de execucao/.test(blob)
  ) {
    return { ativo: "Exequente", passivo: "Executado" };
  }
  if (areaId === "trabalhista") {
    return { ativo: "Reclamante", passivo: "Reclamado" };
  }
  return {
    ativo: capitalizarRotulo(modulo.rotuloPoloAtivo.split("/")[0]!.trim()),
    passivo: capitalizarRotulo(modulo.rotuloPoloPassivo.split("/")[0]!.trim()),
  };
}

export function linhasEpigrafePeca(opcoes: {
  areaId: string;
  especie: string;
  numeroProcesso?: string | null;
  autores?: AutorValue[] | null;
  reus?: ReuValue[] | null;
  fatos?: string | null;
  pecaInaugural?: boolean;
}): string[] {
  if (opcoes.pecaInaugural) return [];
  const n = String(opcoes.numeroProcesso ?? "").trim();
  const rotulos = rotulosEpigrafePeca(
    opcoes.areaId,
    opcoes.especie,
    opcoes.fatos
  );
  const ativo = nomesAutoresCurto(opcoes.autores);
  const passivo = nomesReusCurto(opcoes.reus);
  const linhas: string[] = [];
  if (n) {
    linhas.push(/^processo/i.test(n) ? n : `Processo nº: ${n}`);
  }
  if (ativo) linhas.push(`${rotulos.ativo}: ${ativo}`);
  if (passivo) linhas.push(`${rotulos.passivo}: ${passivo}`);
  return linhas;
}

export function formatarEnderecoAdvogado(opcoes: {
  escritorio?: EscritorioConfig | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  cep?: string | null;
}): string | null {
  const esc = opcoes.escritorio;
  const endEsc = [esc?.endereco?.trim(), esc?.cidadeUf?.trim()]
    .filter(Boolean)
    .join(" — ");
  if (endEsc.length >= 8) return endEsc;

  const partes = [
    opcoes.logradouro?.trim(),
    opcoes.numero?.trim() ? `nº ${opcoes.numero.trim()}` : "",
    opcoes.complemento?.trim(),
    opcoes.bairro?.trim(),
    [opcoes.cidade?.trim(), opcoes.uf?.trim().toUpperCase()]
      .filter(Boolean)
      .join("/"),
    opcoes.cep?.trim(),
  ].filter((p) => p && p.length > 0);
  const juntado = partes.join(", ");
  return juntado.length >= 8 ? juntado : null;
}
