/**
 * Pós-processamento da peça gerada pela IA: espaçamento dissertativo,
 * remoção do título da ação logo após o endereçamento (fica só entre as
 * qualificações), espaço forense de ~10 linhas e deduplicação.
 */

import { MARCADOR_ESPACO_ENDEREÇAMENTO } from "@/lib/formatacao-forense";

const PADRAO_NOME_ACAO =
  /^(?:PETI[CÇ][AÃ]O\s+INICIAL\s*[—–-]?\s*)?(?:A[CÇ][AÃ]O\s+DE\s+|EXECU[CÇ][AÃ]O\s+|EMBARGOS\s+|RECURSO\s+)/i;

function ehLinhaEnderecamento(t: string): boolean {
  return /^(EXCELENT[IÍ]SSIMO|DA COMARCA|JU[IÍ]ZO\s+DA)/i.test(t);
}

function ehTituloSecao(t: string): boolean {
  return /^([IVXLCDM]+)\s*—\s+/i.test(t);
}

function ehNomeAcaoStandalone(t: string): boolean {
  const limpo = t.replace(/\s+/g, " ").trim();
  if (limpo.length < 8 || limpo.length > 160) return false;
  if (ehTituloSecao(limpo) || ehLinhaEnderecamento(limpo)) return false;
  // Título solto em caixa alta (ou quase) com vocabulário de ação
  const maiusculas = limpo === limpo.toUpperCase() || PADRAO_NOME_ACAO.test(limpo);
  return maiusculas && PADRAO_NOME_ACAO.test(limpo);
}

function ehInicioQualificacao(t: string): boolean {
  return (
    /\bvem,?\s/i.test(t) ||
    /\bpropor a presente\b/i.test(t) ||
    /\binscrit[oa]\s+no\s+CPF\b/i.test(t) ||
    /\bportador\(a\)\s+do\s+RG\b/i.test(t) ||
    /^\[[^\]]*(NOME|AUTOR)/i.test(t)
  );
}

/**
 * Remove o nome da ação que a IA coloca logo abaixo do endereçamento.
 * Mantém o que aparece após "propor a presente" (entre as qualificações).
 */
export function removerTituloAcaoAposEnderecamento(texto: string): string {
  const blocos = texto
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((b) => b.replace(/\n+/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (blocos.length === 0) return texto;

  const saida: string[] = [];
  let viuEnderecamento = false;
  let entrouQualificacao = false;

  for (let i = 0; i < blocos.length; i++) {
    const b = blocos[i]!;

    if (ehLinhaEnderecamento(b)) {
      viuEnderecamento = true;
      saida.push(b);
      continue;
    }

    if (!entrouQualificacao && ehInicioQualificacao(b)) {
      entrouQualificacao = true;
      saida.push(b);
      continue;
    }

    // Entre endereçamento e qualificação: descarta título solto da ação
    if (
      viuEnderecamento &&
      !entrouQualificacao &&
      ehNomeAcaoStandalone(b)
    ) {
      continue;
    }

    // Se o bloco é só "propor a presente" + nome da ação numa linha só, ok.
    // Se há título de ação duplicado logo após outro título idêntico, remove.
    if (
      saida.length > 0 &&
      ehNomeAcaoStandalone(b) &&
      ehNomeAcaoStandalone(saida[saida.length - 1]!)
    ) {
      continue;
    }

    saida.push(b);
  }

  return saida.join("\n\n");
}

function promoverQuebrasEmParagrafos(texto: string): string {
  let t = texto.replace(/\r\n/g, "\n").trim();

  // Mantém **negrito** (datas/valores) — HTML/DOCX/PDF convertem depois.
  t = t
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/__(.+?)__/g, "**$1**")
    .replace(/^\s*[-*]\s+/gm, "- ");

  t = t.replace(
    /^([IVXLCDM]+)\s*[.\-–—:]\s+/gim,
    (_m, romanos: string) => `${String(romanos).toUpperCase()} — `
  );

  // Cada linha não vazia vira parágrafo (a IA costuma usar \n simples).
  const linhas = t
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (linhas.length >= 2) {
    t = linhas.join("\n\n");
  } else if (t.length > 350 && !/\n\s*\n/.test(t)) {
    // Um único bloco: quebra após pontuação forte + maiúscula
    t = t.replace(/([.!?])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ"«])/g, "$1\n\n");
  }

  // Evita quebrar títulos romanos no meio: "I —" sozinho + resto na linha seguinte
  t = t.replace(
    /^([IVXLCDM]+ —)\n\n(.+)$/gim,
    (_m, titulo: string, resto: string) => `${titulo} ${resto}`
  );

  t = t.replace(/\n{3,}/g, "\n\n");
  return t.trim();
}

function deduplicarParagrafosConsecutivos(texto: string): string {
  const blocos = texto
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const saida: string[] = [];
  let anteriorNorm = "";

  for (const b of blocos) {
    const norm = b
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ");
    if (norm && norm === anteriorNorm) continue;
    // Também evita repetir o mesmo parágrafo se um contém o outro quase igual
    if (
      anteriorNorm.length > 80 &&
      norm.length > 80 &&
      (norm.includes(anteriorNorm) || anteriorNorm.includes(norm))
    ) {
      // Mantém o mais longo
      if (norm.length > anteriorNorm.length && saida.length > 0) {
        saida[saida.length - 1] = b;
        anteriorNorm = norm;
      }
      continue;
    }
    saida.push(b);
    anteriorNorm = norm;
  }

  return saida.join("\n\n");
}

/**
 * Insere o marcador de ~10 linhas em branco entre o último bloco de
 * endereçamento e o início da qualificação (praxe forense).
 */
export function inserirEspacoAposEnderecamento(texto: string): string {
  const blocos = texto
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .filter((b) => b !== MARCADOR_ESPACO_ENDEREÇAMENTO);

  const saida: string[] = [];
  let inseriu = false;

  for (let i = 0; i < blocos.length; i++) {
    const b = blocos[i]!;
    const proximo = blocos[i + 1];
    saida.push(b);

    if (
      !inseriu &&
      ehLinhaEnderecamento(b) &&
      proximo &&
      !ehLinhaEnderecamento(proximo)
    ) {
      saida.push(MARCADOR_ESPACO_ENDEREÇAMENTO);
      inseriu = true;
    }
  }

  return saida.join("\n\n");
}

/** Detecta fundamentação genérica típica do template de reserva. */
export function pecaTemFundamentacaoGenerica(texto: string): boolean {
  return (
    /plausibilidade do direito invocado/i.test(texto) ||
    /necessidade de\s+interven[cç][aã]o do Poder Judici[aá]rio para restabelecer/i.test(
      texto
    )
  );
}

/** Pipeline completo aplicado à saída da IA antes de HTML/PDF/Word. */
export function normalizarPecaGerada(texto: string): string {
  let t = promoverQuebrasEmParagrafos(texto);
  t = removerTituloAcaoAposEnderecamento(t);
  t = deduplicarParagrafosConsecutivos(t);
  t = inserirEspacoAposEnderecamento(t);
  return t.trim();
}
