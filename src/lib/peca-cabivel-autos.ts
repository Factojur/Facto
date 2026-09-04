/**
 * Interpreta autos / relato para a peça a PROTOCOLAR agora.
 * Não confundir com a espécie do incidente já aberto.
 */

import type { EscritorioConfig } from "@/lib/escritorio-types";
import { extrairCidadeUfDoForo, ufValida } from "@/lib/endereco-comarca";
import { moduloDaArea } from "@/lib/minuta-modulo";
import {
  nomesAutoresCurto,
  nomesReusCurto,
  resolverPoloClienteQualificacao,
} from "@/lib/partes-ja-qualificadas";
import type { PoloAdvocacia } from "@/lib/polo-especies-por-area";
import { tituloPecaDaArea } from "@/lib/peca-especie-area";
import {
  areaIdParaEspecieCabivel,
  especieExplicitaNoRelato,
} from "@/lib/calibracao-area-especie";
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
  /** Ex.: "CÍVEL", "DE FAMÍLIA E SUCESSÕES" — só se explícito nos autos. */
  especialidadeVara: string | null;
};

/**
 * Teto da janela enviada à triagem/redação (~320 mil caracteres ≈ 160–220
 * páginas de texto extraído). Lote de milhares de páginas NÃO cabe num único
 * contexto: capa + sentenças/acórdãos/decisões do miolo + cauda (último ato).
 */
export const LIMITE_RELATO_TRIAGEM_CHARS = 320_000;

function trechosDecisao(texto: string, maxChars: number): string {
  if (maxChars < 80 || !texto.trim()) return "";
  const re =
    /\b(DECIS[AÃ]O|SENTEN[CÇ]A|AC[OÓ]RD[AÃ]O|DESPACHO|DISPOSITIVO)\b[\s\S]{0,2800}/gi;
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
  const cabeca = Math.min(56_000, Math.floor(max * 0.2));
  const reservaDecisoes = Math.min(72_000, Math.floor(max * 0.28));
  const cauda = max - cabeca - reservaDecisoes - 180;
  const meio = t.slice(cabeca, Math.max(cabeca, t.length - cauda));
  const decisoes = trechosDecisao(meio, reservaDecisoes);
  const miolo = decisoes
    ? `[...decisões do trecho intermediário...]\n${decisoes}`
    : "[...trecho intermediário omitido — priorize o último ato...]";
  const caudaEfetiva = decisoes ? cauda : cauda + reservaDecisoes;
  return `${t.slice(0, cabeca)}\n\n${miolo}\n\n${t.slice(-caudaEfetiva)}`;
}

export type JanelaRelatoMeta = {
  texto: string;
  charsTotais: number;
  charsEnviados: number;
  truncado: boolean;
  encontrouDecisoes: boolean;
};

export function analisarJanelaRelato(
  texto: string,
  max = LIMITE_RELATO_TRIAGEM_CHARS
): JanelaRelatoMeta {
  const t = texto.trim();
  if (t.length <= max) {
    return {
      texto: t,
      charsTotais: t.length,
      charsEnviados: t.length,
      truncado: false,
      encontrouDecisoes: /\bDECIS[AÃ]O\b/i.test(t),
    };
  }
  const janela = janelaRelatoParaTriagem(t, max);
  return {
    texto: janela,
    charsTotais: t.length,
    charsEnviados: janela.length,
    truncado: true,
    encontrouDecisoes: janela.includes("[...decisões do trecho intermediário...]"),
  };
}

export function trechoLeituraRelato(texto: string, maxCabeca = 420): string {
  const t = texto.replace(/\s+/g, " ").trim();
  if (t.length <= maxCabeca + 220) return t;
  return `${t.slice(0, maxCabeca)}\n…\n${t.slice(-200)}`;
}

export function resumoLeituraRelato(opcoes: {
  truncado: boolean;
  encontrouDecisoes: boolean;
  fonte: "texto" | "ocr" | "texto_e_ocr" | "relato";
}): string {
  const partes: string[] = [];
  if (opcoes.fonte === "ocr") {
    partes.push("PDF escaneado: texto via OCR. Confira nomes e números.");
  } else if (opcoes.fonte === "texto_e_ocr") {
    partes.push("Li texto selecionável e OCR. Confira nomes e números.");
  }
  if (opcoes.truncado && opcoes.encontrouDecisoes) {
    partes.push("Li capa + decisões + fim (PDF longo).");
  } else if (opcoes.truncado) {
    partes.push("Li capa e o fim dos autos (miolo omitido).");
  } else if (opcoes.fonte === "texto") {
    partes.push("Li o PDF inteiro.");
  } else if (opcoes.fonte === "relato" && partes.length === 0) {
    partes.push("Li o relato colado.");
  }
  return partes.join(" ");
}

export type LeituraRelatoBalao = {
  truncado: boolean;
  encontrouDecisoes: boolean;
  fonte: "texto" | "ocr" | "texto_e_ocr" | "relato";
  resumo?: string | null;
  trecho?: string | null;
};

/** Balão único pós-anexo (chat e painel). */
export function formatarBalaoLeituraAnexo(lr: LeituraRelatoBalao): string {
  const resumo = resumoLeituraRelato({
    truncado: lr.truncado,
    encontrouDecisoes: lr.encontrouDecisoes,
    fonte: lr.fonte,
  });
  const trecho =
    lr.resumo?.trim() ||
    lr.trecho?.trim().slice(0, 480) ||
    "";
  return [
    "**O que li do material anexado**",
    resumo,
    trecho ? `Trecho: ${trecho}${trecho.length >= 480 ? "…" : ""}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function normalizarBlob(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/** MS só com sinais explícitos — não inferir de “ilegal/astreintes” (isso é agravo em regra). */
export function sugereMandadoSegurancaAutos(
  texto: string,
  polo?: PoloAdvocacia | null
): boolean {
  if (polo === "passivo") return false;
  const t = normalizarBlob(texto);
  if (!t) return false;
  return /mandado de seguranca|impetrante|autoridade coatora|ato coator|contra\s+ato\s+(do\s+)?juiz|impetrar\s+ms\b/.test(
    t
  );
}

/** @deprecated import from calibracao-area-especie */
export { areaIdParaEspecieCabivel } from "@/lib/calibracao-area-especie";

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

/** Recurso cabível após sentença/acórdão de mérito (não interlocutória). */
function especieApelacaoDaArea(areaId: string): string {
  if (areaId === "jec" || areaId === "jecr") return "recurso-inominado";
  if (areaId === "trabalhista") return "recurso-ordinario";
  return "apelacao";
}

/**
 * Sentença (ou acórdão) de mérito nos autos — tipicamente abre apelação /
 * recurso inominado / RO, não contestação nem cumprimento.
 */
function sentencaMeritoNoTexto(t: string): boolean {
  if (!t) return false;
  // Cumprimento/execução já aberto: o “sentença” do título do incidente não conta.
  if (
    /cumprimento de sentenca|\bfase de (cumprimento|execucao)\b|exequente|executad/.test(
      t
    ) &&
    !/julgo (parcialmente )?(procedente|improcedente)/.test(t)
  ) {
    return false;
  }
  const dispositivo =
    /julgo (parcialmente )?(procedente|improcedente)/.test(t) ||
    (/ante o exposto|diante do exposto/.test(t) &&
      /resolucao de merito|artigo 487|art\.?\s*487/.test(t));
  const rotuloSentenca =
    /\bsentenca\b/.test(t) ||
    (/\bacordao\b/.test(t) &&
      /(negar|dar)\s+(parcial\s+)?provimento|conhecer.{0,40}recurso/.test(t));
  return dispositivo && rotuloSentenca;
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

  const explicita = especieExplicitaNoRelato(texto, areaId);
  /** Defesa/contestação/réplica explícitas não cortam remédio do último ato. */
  const explicitaFracaDefesa =
    explicita === "contestacao" ||
    explicita === "defesa" ||
    explicita === "replica" ||
    explicita === "defesa-jecrim" ||
    explicita === "resposta-acusacao";

  if (explicita && !explicitaFracaDefesa) return explicita;

  if (/agravo de instrumento/.test(t) && /interpor|cabivel|recorrer/.test(t)) {
    return especieAgravoDaArea(areaId);
  }
  if (/embargos de declara/.test(t) && /opor|cabivel|omissao|contradicao/.test(t)) {
    return especieEmbargosDaArea(areaId);
  }

  const vicio =
    /omissao|contradicao|obscuridade/.test(t) &&
    !/decisao.{0,120}(reduziu|alterou|majorou)|reduziu.{0,60}astreinte/.test(t);
  const interlocutoria =
    /decisao\b.{0,100}(interlocutor|reduziu|alterou|majorou|fixou|reconheceu)/.test(
      t
    ) ||
    /alter(ou|acao)\s+(d[ao]s\s+)?astreintes/.test(t) ||
    /reduziu.{0,80}astreinte/.test(t) ||
    /multa (diaria|cominatoria).{0,80}(alter|reduz|fixad)/.test(t) ||
    (/astreinte|multa diaria/.test(t) &&
      /erro material|nao em seu valor|forma de aplicacao/.test(t));

  const sentencaMerito = sentencaMeritoNoTexto(t);

  if (
    !incidenteExecucaoJaAberto(texto) &&
    !interlocutoria &&
    !vicio &&
    !sentencaMerito
  ) {
    return explicitaFracaDefesa ? explicita : null;
  }

  if (sugereMandadoSegurancaAutos(texto)) {
    return "mandado-seguranca";
  }

  // Interlocutória / decisão sobre astreintes em cumprimento → agravo (prevalece sobre "erro material").
  if (interlocutoria || (incidenteExecucaoJaAberto(texto) && /\bdecisao\b/.test(t))) {
    return especieAgravoDaArea(areaId);
  }
  if (vicio) return especieEmbargosDaArea(areaId);
  if (sentencaMerito) return especieApelacaoDaArea(areaId);
  return explicitaFracaDefesa ? explicita : null;
}

/** Ajusta espécie sugerida pelo último ato quando o polo do advogado é conhecido. */
export function ajustarCabivelAoPolo(
  areaId: string,
  cabivel: string,
  polo: PoloAdvocacia,
  texto: string
): string {
  const e = cabivel.toLowerCase();
  const t = normalizarBlob(texto);

  if (areaId === "criminal" || areaId === "jecr") {
    if (polo === "passivo" && /habeas-corpus|queixa-crime|peticao-inicial/.test(e)) {
      return areaId === "jecr" ? "defesa-jecrim" : "resposta-acusacao";
    }
    if (polo === "ativo" && /resposta-acusacao|defesa-jecrim|contestacao/.test(e)) {
      return areaId === "jecr" ? "queixa-crime" : "habeas-corpus";
    }
    return cabivel;
  }

  if (areaId === "trabalhista" && /execu[cç][aã]o|titulo executivo|cumprimento/.test(t)) {
    if (polo === "ativo" && /embargos|agravo-instrumento|defesa/.test(e)) {
      return "execucao-titulo";
    }
    if (polo === "passivo" && e === "execucao-titulo") return "defesa";
    if (polo === "passivo" && e === "reclamacao") return "defesa";
    return cabivel;
  }

  if (!incidenteExecucaoJaAberto(texto)) return cabivel;

  // Exequente em cumprimento: interlocutória → agravo (não forçar MS nem reabrir incidente).
  if (polo === "ativo" && /agravo-instrumento|embargos/.test(e)) {
    if (sugereMandadoSegurancaAutos(texto, polo)) return "mandado-seguranca";
    if (/agravo-instrumento/.test(e)) return cabivel;
    return especieAgravoDaArea(areaId);
  }

  if (
    polo === "ativo" &&
    sugereMandadoSegurancaAutos(texto, polo) &&
    (e === "cumprimento-sentenca" || e === "execucao")
  ) {
    return "mandado-seguranca";
  }

  if (
    polo === "passivo" &&
    (e === "cumprimento-sentenca" ||
      e === "cumprimento-alimentos" ||
      e === "execucao" ||
      e === "execucao-titulo")
  ) {
    if (areaId === "jec" || areaId === "jecr") return "embargos";
    return "embargos-declaracao";
  }

  return cabivel;
}

/** Corrige espécie quando o relato é o processo já em curso, não a peça a redigir. */
export function ajustarEspecieCabivel(params: {
  areaId: string;
  especie: string;
  tipoAcao?: string | null;
  fatos?: string | null;
  poloAdvocacia?: PoloAdvocacia | null;
}): string {
  const especie = String(params.especie ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  const blob = `${params.tipoAcao ?? ""} ${params.fatos ?? ""}`;
  let cabivel = pecaCabivelAposUltimoAto(params.areaId, blob);
  if (cabivel && params.poloAdvocacia) {
    cabivel = ajustarCabivelAoPolo(
      params.areaId,
      cabivel,
      params.poloAdvocacia,
      blob
    );
  }
  if (!cabivel) return params.especie;
  /** Sem espécie ainda (pista vazia) — o remédio do último ato é a orientação. */
  if (!especie && cabivel) return cabivel;
  const especieEhDefesa =
    /^(contestacao|defesa|replica|defesa-jecrim|resposta-acusacao)$/.test(especie);
  const cabivelEhRemedioUltimoAto =
    /agravo|embargos|mandado-seguranca|apelacao|recurso-inominado|recurso-ordinario/.test(
      cabivel
    );
  if (
    ehEspecieAberturaExecucao(especie) ||
    especie === "peticao-inicial" ||
    cabivel === "mandado-seguranca" ||
    (especieEhDefesa && cabivelEhRemedioUltimoAto)
  ) {
    return cabivel;
  }
  return params.especie;
}

/** Área + espécie coerentes após leitura dos autos (0 tokens). */
export function resolverAreaEspecieOrganizacao(params: {
  areaId: string;
  relato: string;
  especie: string;
  tipoAcao?: string | null;
  poloAdvocacia?: PoloAdvocacia | null;
}): { areaId: string; especie: string; tipoAcao: string } {
  const especieInicial =
    especieExplicitaNoRelato(params.relato, params.areaId) ?? params.especie;

  let especie = ajustarEspecieCabivel({
    areaId: params.areaId,
    especie: especieInicial,
    tipoAcao: params.tipoAcao,
    fatos: params.relato,
    poloAdvocacia: params.poloAdvocacia,
  });
  let areaId = areaIdParaEspecieCabivel(params.areaId, especie);
  // MS só se explícito no relato — não sobrescrever agravo por heurística.
  if (
    especie !== "mandado-seguranca" &&
    sugereMandadoSegurancaAutos(params.relato, params.poloAdvocacia)
  ) {
    especie = "mandado-seguranca";
    areaId = "constitucional";
  }
  const tipoAcao =
    tituloPecaDaArea(areaId, especie, params.tipoAcao ?? "Petição inicial") ||
    params.tipoAcao ||
    "Petição inicial";
  return { areaId, especie, tipoAcao };
}

function numeroVaraDoTexto(texto: string): string | null {
  const m =
    texto.match(
      /(\d{1,3})\s*[ªºo°]?\s*(?:vara|juizado especial|zona eleitoral)/i
    ) ?? texto.match(/\b(\d{1,3})[ªº]\s*(?:vara|juizado)/i);
  return m?.[1] ?? null;
}

/** Especialidade só se escrita nos autos — nunca inferir "Cível"/"Família". */
export function especialidadeVaraDoTexto(texto: string): string | null {
  const m = texto.match(
    /\d{1,3}\s*[ªºo°]?\s*VARA\s+(DE\s+FAM[IÍ]LIA(?:\s+E\s+SUCESS[OÕ]ES)?|C[IÍ]VEL|CRIMINAL|DA\s+FAZENDA(?:\s+P[UÚ]BLICA)?|DO\s+TRABALHO|FEDERAL|EMPRESARIAL|DA\s+INF[AÂ]NCIA)/i
  );
  if (!m?.[1]) return null;
  return m[1]
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase()
    .replace(/\bFAMILIA\b/, "FAMÍLIA")
    .replace(/\bCIVEL\b/, "CÍVEL")
    .replace(/\bPUBLICA\b/, "PÚBLICA")
    .replace(/\bINFANCIA\b/, "INFÂNCIA")
    .replace(/\bSUCESSOES\b/, "SUCESSÕES");
}

function complementoOrgaoDoTexto(texto: string): string | null {
  const anexo = texto.match(/anexo\s+([A-Za-zÀ-ÿ]{3,40})/i);
  const partes: string[] = [];
  if (/foro central/i.test(texto)) partes.push("FORO CENTRAL");
  if (anexo) partes.push(`ANEXO ${anexo[1]!.trim().toUpperCase()}`);
  return partes.length ? partes.join(" ") : null;
}

/**
 * Extrai o último ato decisório do fim dos autos/relato (0 tokens).
 * Usado no chat e na entrada para orientar espécie e redação.
 */
export function extrairUltimoAtoDoTexto(
  texto: string,
  maxChars = 600
): string | null {
  const t = texto.replace(/\u0000/g, " ").trim();
  if (!t) return null;

  const prioridade = (rotulo: string) => {
    const r = rotulo
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();
    if (r.startsWith("SENTEN")) return 4;
    if (r.startsWith("ACORD")) return 4;
    if (r.startsWith("DECIS")) return 3;
    if (r.startsWith("DESPACHO")) return 2;
    return 1; // CERTIDÃO etc.
  };

  const re =
    /\b(DECIS[AÃ]O|DESPACHO|SENTEN[CÇ]A|AC[OÓ]RD[AÃ]O|CERTID[AÃ]O)\b/gi;

  const escolher = (fonte: string): { idx: number; prio: number } | null => {
    const matches = [...fonte.matchAll(re)];
    if (matches.length === 0) return null;
    let escolhido = matches[matches.length - 1]!;
    let melhor = prioridade(escolhido[1] ?? "");
    for (let i = matches.length - 1; i >= 0; i--) {
      const m = matches[i]!;
      const p = prioridade(m[1] ?? "");
      if (p > melhor) {
        escolhido = m;
        melhor = p;
        if (melhor >= 4) break;
      }
    }
    return { idx: escolhido.index ?? 0, prio: melhor };
  };

  const caudaLen = Math.min(14_000, t.length);
  const cauda = t.slice(-caudaLen);
  let escolha = escolher(cauda);
  let baseOffset = t.length - caudaLen;
  let trechoFonte = cauda;

  // PDF que é a própria sentença: o rótulo SENTENÇA fica no início e a cauda
  // só traz “certidão de honorários” — preferir o ato decisório no documento.
  if (!escolha || escolha.prio <= 1) {
    const noDoc = escolher(t);
    if (noDoc && noDoc.prio > (escolha?.prio ?? 0)) {
      escolha = noDoc;
      baseOffset = 0;
      trechoFonte = t;
    }
  }

  let trecho = "";
  if (escolha) {
    trecho = trechoFonte.slice(escolha.idx).replace(/\s+/g, " ").trim();
  } else {
    const linhas = cauda
      .split(/\n+/)
      .map((l) => l.replace(/\s+/g, " ").trim())
      .filter((l) => l.length >= 35);
    trecho = linhas[linhas.length - 1] ?? "";
  }

  // Preferir o dispositivo (JULGO) quando a sentença é longa.
  const julgo = t.search(
    /\b(Ante o exposto|Diante do exposto|JULGO\s+(PARCIALMENTE\s+)?(PROCEDENTE|IMPROCEDENTE))/i
  );
  if (julgo >= 0 && (!escolha || escolha.prio >= 3)) {
    const doJulgo = t.slice(julgo).replace(/\s+/g, " ").trim();
    if (doJulgo.length > 80) trecho = doJulgo;
  }

  void baseOffset;
  if (!trecho) return null;
  return trecho.length > maxChars ? `${trecho.slice(0, maxChars)}…` : trecho;
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
  // ESAJ comum: "FORO DE ITARARÉ" / "COMARCA DE ITARARÉ" (sem inventar Juizado).
  if (!foro) {
    const foroDe = t.match(
      /\bFORO\s+DE\s+([A-Za-zÀ-ÿ']{3,}(?:\s+[A-Za-zÀ-ÿ']+){0,3})/i
    );
    const comarcaDe = t.match(
      /\bCOMARCA\s+DE\s+([A-Za-zÀ-ÿ']{3,}(?:\s+[A-Za-zÀ-ÿ']+){0,3})/i
    );
    const nome = (foroDe?.[1] ?? comarcaDe?.[1])?.replace(/\s+/g, " ").trim();
    if (nome) {
      foro = cidadeUf.uf
        ? `Foro de ${nome}/${cidadeUf.uf}`
        : `Foro de ${nome}`;
      if (
        !cidadeUf.cidade ||
        /^(foro|vara|comarca|juizado|tribunal)\b/i.test(cidadeUf.cidade)
      ) {
        cidadeUf = { ...cidadeUf, cidade: nome };
      }
    }
  }

  return {
    numeroProcesso: cnj,
    foro,
    cidade: cidadeUf.cidade || null,
    uf: cidadeUf.uf || null,
    numeroVara: numeroVaraDoTexto(t),
    complementoOrgao: complementoOrgaoDoTexto(t),
    especialidadeVara: especialidadeVaraDoTexto(t),
  };
}

function capitalizarRotulo(rotulo: string): string {
  const t = rotulo.trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Rótulos recursais da epígrafe (Apelante/Apelado…): o cliente fica na 1ª linha. */
function rotuloEpigrafeERecursal(ativo: string): boolean {
  return /^(Apelante|Recorrente|Agravante|Embargante|Impugnante)$/i.test(
    ativo
  );
}

/**
 * Rótulos da epígrafe (Autor/Réu, Apelante/Apelado, Exequente/Executado…).
 * Fase de cumprimento (Exequente/Executado) prevalece sobre embargos no mesmo
 * incidente; apelação/agravo/recurso usam o par recursal do CPC/rito.
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
  if (e.includes("apelacao")) {
    return { ativo: "Apelante", passivo: "Apelado" };
  }
  if (e.includes("agravo")) {
    return { ativo: "Agravante", passivo: "Agravado" };
  }
  if (e.includes("embargos")) {
    return { ativo: "Embargante", passivo: "Embargado" };
  }
  if (e.includes("recurso") || e.includes("contrarrazoes")) {
    return { ativo: "Recorrente", passivo: "Recorrido" };
  }
  if (e.includes("impugn")) {
    return { ativo: "Impugnante", passivo: "Impugnado" };
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
  poloAdvocacia?: PoloAdvocacia | null;
}): string[] {
  if (opcoes.pecaInaugural) return [];
  const n = String(opcoes.numeroProcesso ?? "").trim();
  const rotulos = rotulosEpigrafePeca(
    opcoes.areaId,
    opcoes.especie,
    opcoes.fatos
  );
  const nomeAutores = nomesAutoresCurto(opcoes.autores);
  const nomeReus = nomesReusCurto(opcoes.reus);
  let nomeLinhaAtivo = nomeAutores;
  let nomeLinhaPassivo = nomeReus;

  // Apelante/Recorrente/… = quem protocola; se o polo for passivo, inverte nomes.
  if (
    rotuloEpigrafeERecursal(rotulos.ativo) &&
    !String(opcoes.especie ?? "")
      .toLowerCase()
      .includes("contrarrazoes")
  ) {
    const polo = resolverPoloClienteQualificacao(
      opcoes.areaId,
      opcoes.especie,
      opcoes.poloAdvocacia
    );
    if (polo === "passivo") {
      nomeLinhaAtivo = nomeReus;
      nomeLinhaPassivo = nomeAutores;
    }
  }

  const linhas: string[] = [];
  if (n) {
    linhas.push(/^processo/i.test(n) ? n : `Processo nº: ${n}`);
  }
  if (nomeLinhaAtivo) linhas.push(`${rotulos.ativo}: ${nomeLinhaAtivo}`);
  if (nomeLinhaPassivo) linhas.push(`${rotulos.passivo}: ${nomeLinhaPassivo}`);
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
