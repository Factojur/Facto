/**
 * Base de conhecimento jurídico — RAG da minuta FACTO.
 * Busca casos semelhantes aos fatos e prioriza julgado favorável ao polo
 * da peça (ativo/passivo). Súmulas e leis não entram no filtro de desfecho.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { CONHECIMENTO_CURADO_JEC } from "@/lib/conhecimento-curado-jec";
import { SUMULAS_ATIVAS_CURADAS } from "@/lib/sumulas";
import { gerarEmbedding } from "@/lib/ia/embeddings";
import {
  bonusLastroPolo,
  lastroContrarioAoPolo,
  pistaQueryPolo,
} from "@/lib/lastro-favoravel-polo";
import { expandirQueryLastro } from "@/lib/expansao-query-lastro";
import type { PoloAdvocacia } from "@/lib/polo-especies-por-area";

export const CATEGORIAS_LASTRO = ["Súmula", "Jurisprudência"] as const;
/** Inclui Lei só por linhas antigas no banco — não cadastrar nem retrieve. */
export const CATEGORIAS_CONHECIMENTO = [
  ...CATEGORIAS_LASTRO,
  "Lei",
] as const;
export type CategoriaConhecimento = (typeof CATEGORIAS_CONHECIMENTO)[number];

export function ehCategoriaLastro(categoria: string): boolean {
  const c = categoria.trim().toLowerCase();
  return c === "súmula" || c === "sumula" || c.startsWith("juris");
}

export type ItemConhecimento = {
  id: string;
  titulo: string;
  categoria: string;
  texto: string;
  criado_em: string;
  arquivo_nome?: string | null;
  arquivo_path?: string | null;
  arquivo_tipo?: string | null;
};

/** Metadados para listagem admin (sem campo `texto`). */
export type ItemConhecimentoLista = Omit<ItemConhecimento, "texto" | "arquivo_tipo">;

/**
 * Um trecho relevante extraído de um item da base de conhecimento. Documentos
 * grandes (uma lei inteira, um código, a Constituição) são cadastrados por
 * completo em `base_conhecimento`, mas nunca são injetados inteiros num
 * prompt — são quebrados em trechos (artigo a artigo, quando possível) e só
 * os trechos mais relevantes para o tema da ação entram no contexto da IA.
 */
export type TrechoConhecimento = {
  titulo: string;
  categoria: string;
  texto: string;
  /** Id na base_conhecimento, quando vier do banco. */
  conhecimentoId?: string;
  /** Similaridade semântica 0–1, se retrieve vetorial. */
  scoreSemantico?: number;
};

/** Núcleo curado + lote 01 de súmulas (SV 1–10 STF). */
const CONHECIMENTO_CURADO: TrechoConhecimento[] = [
  ...CONHECIMENTO_CURADO_JEC,
  ...SUMULAS_ATIVAS_CURADAS,
];

export const TIPOS_ARQUIVO_ACEITOS = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
} as const;

export type TipoArquivoAceito =
  (typeof TIPOS_ARQUIVO_ACEITOS)[keyof typeof TIPOS_ARQUIVO_ACEITOS];

export const TAMANHO_MAXIMO_ARQUIVO_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Extrai o texto de um PDF ou Word (.docx) para ser usado como conteúdo
 * pesquisável da base de conhecimento — o mesmo texto que seria colado
 * manualmente no campo "Texto/Conteúdo". Arquivos .doc (formato binário
 * antigo) não são suportados, apenas .docx (formato OOXML).
 */
export async function extrairTextoDeArquivo(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try {
      const resultado = await parser.getText();
      return resultado.text.trim();
    } finally {
      await parser.destroy();
    }
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const mammoth = await import("mammoth");
    const resultado = await mammoth.extractRawText({ buffer });
    return resultado.value.trim();
  }

  throw new Error(
    "Formato de arquivo não suportado. Envie um PDF ou um Word (.docx)."
  );
}

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const STOPWORDS = new Set([
  "para",
  "pela",
  "pelo",
  "pelos",
  "pelas",
  "uma",
  "umas",
  "uns",
  "com",
  "sem",
  "sob",
  "sobre",
  "entre",
  "quando",
  "onde",
  "como",
  "mais",
  "menos",
  "muito",
  "muitos",
  "apos",
  "antes",
  "depois",
  "este",
  "esta",
  "estes",
  "estas",
  "esse",
  "essa",
  "isso",
  "aquele",
  "aquela",
  "dele",
  "dela",
  "deles",
  "delas",
  "seu",
  "sua",
  "seus",
  "suas",
  "que",
  "qual",
  "quais",
  "foi",
  "ser",
  "ter",
  "havia",
  "tendo",
  "sendo",
  "nao",
  "sim",
  "também",
  "tambem",
]);

function ritoPalavrasArea(areaId?: string): string[] {
  if (!areaId || areaId === "jec") return ["juizado", "9099"];
  if (areaId === "consumidor") return ["cdc", "consumidor"];
  if (areaId === "civil") return ["obrigacoes", "codigo civil"];
  if (areaId === "trabalhista") return ["clt", "reclamacao"];
  if (areaId === "familia") return ["alimentos", "guarda"];
  if (areaId === "imobiliario") return ["locacao", "despejo"];
  if (areaId === "tributario") return ["tributario", "execucao fiscal"];
  if (areaId === "previdenciario") return ["inss", "beneficio"];
  if (areaId === "criminal") return ["penal", "cpp"];
  if (areaId === "jecr") return ["jecrim", "transacao"];
  if (areaId === "constitucional") return ["constituicao", "mandado"];
  if (areaId === "administrativo") return ["fazenda", "mandado"];
  return [];
}

function palavrasChave(
  tipoAcao: string,
  textoExtra?: string,
  areaId?: string
): string[] {
  const expansao = expandirQueryLastro(areaId, tipoAcao, textoExtra);
  const bruto = normalizar(
    [tipoAcao, textoExtra ?? "", expansao.blocoSemantico]
      .filter(Boolean)
      .join(" ")
  );
  const palavras = bruto
    .split(/[^a-z0-9]+/)
    .filter((p) => p.length > 3 && !STOPWORDS.has(p));

  const termosExpansao = expansao.termos.flatMap((t) =>
    normalizar(t)
      .split(/\s+/)
      .filter((p) => p.length > 3)
  );

  return Array.from(
    new Set([
      ...palavras,
      ...termosExpansao,
      ...expansao.bigramas,
      ...ritoPalavrasArea(areaId),
    ])
  ).slice(0, 36);
}

// Tamanho máximo de um trecho individual — grande o bastante para caber um
// artigo inteiro com seus parágrafos e incisos, pequeno o bastante para que
// vários trechos de fontes diferentes caibam no orçamento total do prompt.
const TAMANHO_MAXIMO_TRECHO = 2_500;

/**
 * Quebra o texto de um item em trechos menores. Leis, códigos e a
 * Constituição têm uma estrutura previsível ("Art. 5º ...", "Art. 6º ..."),
 * então a divisão é feita por artigo sempre que o texto tiver artigos
 * suficientes para isso valer a pena. Súmulas e ementas de jurisprudência
 * (textos curtos, sem essa estrutura) simplesmente viram um único trecho.
 */
function dividirEmTrechos(texto: string): string[] {
  const textoLimpo = texto.trim();
  if (!textoLimpo) return [];

  const porArtigo = textoLimpo
    .split(/(?=art(?:igo)?\.?\s*\d+[º°]?\b)/gi)
    .map((parte) => parte.trim())
    .filter(Boolean);

  const partesBase = porArtigo.length > 3 ? porArtigo : [textoLimpo];

  const trechos: string[] = [];
  for (const parte of partesBase) {
    if (parte.length <= TAMANHO_MAXIMO_TRECHO) {
      trechos.push(parte);
      continue;
    }

    // Artigo (ou documento sem estrutura de artigos) grande demais: quebra
    // por parágrafo em blocos que caibam no limite.
    const paragrafos = parte.split(/\n{2,}/);
    let atual = "";
    for (const paragrafo of paragrafos) {
      const candidato = atual ? `${atual}\n\n${paragrafo}` : paragrafo;
      if (candidato.length > TAMANHO_MAXIMO_TRECHO && atual) {
        trechos.push(atual.trim());
        atual = paragrafo;
      } else {
        atual = candidato;
      }
    }
    if (atual.trim()) trechos.push(atual.trim());
  }

  return trechos;
}

function pontuarTrecho(trechoNormalizado: string, palavras: string[]): number {
  let pontos = 0;
  for (const palavra of palavras) {
    if (!palavra) continue;
    pontos += trechoNormalizado.split(palavra).length - 1;
  }
  return pontos;
}

/** Prioriza súmulas no ranking. Lei não entra no retrieve. */
function bonusCategoria(categoria: string): number {
  const c = normalizar(categoria);
  if (c.includes("sumula")) return 4;
  if (c.includes("juris")) return 1;
  return 0;
}

function pontuarItemCurado(
  item: TrechoConhecimento,
  palavras: string[]
): number {
  const base = pontuarTrecho(
    normalizar(`${item.titulo} ${item.texto}`),
    palavras
  );
  if (base <= 0) return 0;
  return base + bonusCategoria(item.categoria);
}

/**
 * Busca na base de conhecimento os trechos relacionados ao tema da ação.
 *
 * Estratégia híbrida (P0 RAG semântico):
 * 1. Embedding da query → RPC `match_base_conhecimento` (pgvector), se disponível
 * 2. Fallback/complemento por palavra-chave (ILIKE) — comportamento legado
 * 3. Núcleo curado em memória (súmulas/JEC) por keyword
 * 4. Documentos candidatos são quebrados em trechos (por artigo) e ranqueados
 *
 * Falha de forma silenciosa (lista vazia / só curado) se a tabela ainda não
 * existir — a geração da peça nunca deve travar por causa disso.
 */
/** Civil: não injetar lastro CDC/banco quando o módulo não é Consumidor. */
function lastroConsumeristaParaCivil(
  titulo: string,
  texto: string,
  categoria: string
): boolean {
  const blob = `${titulo}\n${categoria}\n${texto}`.toLowerCase();
  return (
    /\bcdc\b/.test(blob) ||
    blob.includes("código de defesa do consumidor") ||
    blob.includes("codigo de defesa do consumidor") ||
    blob.includes("relação de consumo") ||
    blob.includes("relacao de consumo") ||
    /s[uú]mula\s*297/.test(blob) ||
    /s[uú]mula\s*479/.test(blob) ||
    blob.includes("instituição financeira") ||
    blob.includes("instituicao financeira") ||
    blob.includes("negativação indevida") ||
    blob.includes("negativacao indevida")
  );
}

function lastroDeJuizado(
  titulo: string,
  texto: string,
  categoria: string
): boolean {
  const blob = `${titulo}\n${categoria}\n${texto}`.toLowerCase();
  return (
    /9\.099/.test(blob) ||
    blob.includes("juizado especial") ||
    blob.includes("recurso inominado") ||
    blob.includes("turma recursal")
  );
}

function lastroAlienoAoTributario(
  titulo: string,
  texto: string,
  categoria: string
): boolean {
  const blob = `${titulo}\n${categoria}\n${texto}`.toLowerCase();
  if (
    /ctn|cda|execu[cç][aã]o fiscal|lei 6\.830|iptu|icms|iss\b|tribut/.test(blob)
  ) {
    return false;
  }
  return (
    lastroDeJuizado(titulo, texto, categoria) ||
    lastroConsumeristaParaCivil(titulo, texto, categoria) ||
    blob.includes("clt") ||
    blob.includes("reclamação trabalhista") ||
    blob.includes("reclamacao trabalhista")
  );
}

function lastroAlienoAFamilia(
  titulo: string,
  texto: string,
  categoria: string
): boolean {
  const blob = `${titulo}\n${categoria}\n${texto}`.toLowerCase();
  if (
    /alimento|guarda|div[oó]rcio|invent[aá]rio|filia[cç]|sucess[aã]o|uni[aã]o est[aá]vel|\beca\b|melhor interesse/.test(
      blob
    )
  ) {
    return false;
  }
  return (
    lastroDeJuizado(titulo, texto, categoria) ||
    lastroConsumeristaParaCivil(titulo, texto, categoria) ||
    blob.includes("clt") ||
    /execu[cç][aã]o fiscal|\bcda\b/.test(blob)
  );
}

function lastroAlienoAoTrabalhista(
  titulo: string,
  texto: string,
  categoria: string
): boolean {
  const blob = `${titulo}\n${categoria}\n${texto}`.toLowerCase();
  const trabalhista =
    /\bclt\b|\btst\b|\btrt\b|horas extras|v[ií]nculo empregat|fgts|verbas rescis|justi[cç]a do trabalho|reclama[cç][aã]o trabalhista|s[uú]mula\s*\d+\s*(do\s*)?tst/.test(
      blob
    );
  if (trabalhista) return false;
  // Sem marca trabalhista: descarta justiça comum / juizado / CDC / fiscal.
  return (
    lastroDeJuizado(titulo, texto, categoria) ||
    lastroConsumeristaParaCivil(titulo, texto, categoria) ||
    /execu[cç][aã]o fiscal|\bcda\b/.test(blob) ||
    /\btjsp\b|\btjrj\b|\btjmg\b|\btjrs\b|\btjgo\b|\btjce\b|vara c[ií]vel|c[oó]digo civil/.test(
      blob
    )
  );
}

function lastroAlienoAoPrevidenciario(
  titulo: string,
  texto: string,
  categoria: string
): boolean {
  const blob = `${titulo}\n${categoria}\n${texto}`.toLowerCase();
  if (
    /\binss\b|previdenc|benef[ií]cio|aposentadoria|\bbpc\b|loas|aux[ií]lio|8\.213|\bjef\b|tempo de contribui/.test(
      blob
    )
  ) {
    return false;
  }
  return (
    lastroDeJuizado(titulo, texto, categoria) ||
    lastroConsumeristaParaCivil(titulo, texto, categoria) ||
    blob.includes("clt") ||
    /execu[cç][aã]o fiscal|\bcda\b/.test(blob)
  );
}

function lastroAlienoAoCriminal(
  titulo: string,
  texto: string,
  categoria: string
): boolean {
  const blob = `${titulo}\n${categoria}\n${texto}`.toLowerCase();
  if (
    /\bcpp\b|\bcp\b|habeas|penal|c[oó]digo penal|acusa[cç][aã]o|\blep\b|pris[aã]o|senten[cç]a condenat/.test(
      blob
    )
  ) {
    return false;
  }
  return (
    lastroConsumeristaParaCivil(titulo, texto, categoria) ||
    blob.includes("clt") ||
    /execu[cç][aã]o fiscal|\bcda\b|juizado especial c[ií]vel/.test(blob)
  );
}

function lastroAlienoAoJecr(
  titulo: string,
  texto: string,
  categoria: string
): boolean {
  const blob = `${titulo}\n${categoria}\n${texto}`.toLowerCase();
  if (
    /9\.099|jecrim|juizado especial criminal|transa[cç][aã]o penal|composi[cç][aã]o civil|queixa/.test(
      blob
    )
  ) {
    return false;
  }
  return (
    lastroConsumeristaParaCivil(titulo, texto, categoria) ||
    blob.includes("clt") ||
    /execu[cç][aã]o fiscal|\bcda\b/.test(blob)
  );
}

function lastroSoJuizadoCdcClt(
  titulo: string,
  texto: string,
  categoria: string
): boolean {
  return (
    lastroDeJuizado(titulo, texto, categoria) ||
    lastroConsumeristaParaCivil(titulo, texto, categoria) ||
    `${titulo} ${texto}`.toLowerCase().includes("clt")
  );
}

function descartarLastroPorArea(
  areaId: string | undefined,
  titulo: string,
  texto: string,
  categoria: string
): boolean {
  if (areaId === "civil") {
    return lastroConsumeristaParaCivil(titulo, texto, categoria);
  }
  if (areaId === "consumidor") {
    return lastroDeJuizado(titulo, texto, categoria);
  }
  if (areaId === "tributario") {
    return lastroAlienoAoTributario(titulo, texto, categoria);
  }
  if (areaId === "familia") {
    return lastroAlienoAFamilia(titulo, texto, categoria);
  }
  if (areaId === "trabalhista") {
    return lastroAlienoAoTrabalhista(titulo, texto, categoria);
  }
  if (areaId === "previdenciario") {
    return lastroAlienoAoPrevidenciario(titulo, texto, categoria);
  }
  if (areaId === "criminal") {
    return lastroAlienoAoCriminal(titulo, texto, categoria);
  }
  if (areaId === "jecr") {
    return lastroAlienoAoJecr(titulo, texto, categoria);
  }
  if (
    areaId === "imobiliario" ||
    areaId === "empresarial" ||
    areaId === "administrativo" ||
    areaId === "digital" ||
    areaId === "ambiental" ||
    areaId === "propriedade-intelectual" ||
    areaId === "agrario" ||
    areaId === "internacional" ||
    areaId === "eleitoral" ||
    areaId === "constitucional"
  ) {
    return lastroSoJuizadoCdcClt(titulo, texto, categoria);
  }
  if (areaId === "medico") {
    return (
      lastroDeJuizado(titulo, texto, categoria) ||
      `${titulo} ${texto}`.toLowerCase().includes("clt")
    );
  }
  return false;
}

export type OpcoesBuscaConhecimento = {
  polo?: PoloAdvocacia | null;
  especie?: string | null;
};

export async function buscarConhecimentoRelacionado(
  tipoAcao: string,
  limite = 6,
  /** Fatos / tese do caso — amplia as palavras-chave da busca (RAG). */
  textoExtra?: string,
  areaId?: string,
  opcoes?: OpcoesBuscaConhecimento
): Promise<TrechoConhecimento[]> {
  const polo = opcoes?.polo ?? null;
  const pistaPolo = pistaQueryPolo(polo);
  const tipoComPolo = [tipoAcao, opcoes?.especie, pistaPolo]
    .filter(Boolean)
    .join("\n");
  const palavras = palavrasChave(tipoComPolo, textoExtra, areaId);
  if (palavras.length === 0) return [];

  const expansao = expandirQueryLastro(areaId, tipoComPolo, textoExtra);
  const consulta = [tipoComPolo, textoExtra ?? "", expansao.blocoSemantico]
    .filter(Boolean)
    .join("\n");
  const limiteBusca = Math.max(limite * 3, 18);

  try {
    const admin = createAdminClient();
    const porId = new Map<
      string,
      ItemConhecimento & { similarity?: number }
    >();

    // —— 1) Retrieve semântico ——
    const queryEmb = await gerarEmbedding(consulta.slice(0, 4_000), {
      taskType: "RETRIEVAL_QUERY",
    });
    if (queryEmb) {
      const { data: sem, error: semErr } = await admin.rpc(
        "match_base_conhecimento",
        {
          query_embedding: queryEmb,
          match_count: 32,
        }
      );
      if (!semErr && Array.isArray(sem)) {
        for (const row of sem as Array<
          ItemConhecimento & { similarity?: number }
        >) {
          if (!row?.id) continue;
          if (!ehCategoriaLastro(row.categoria ?? "")) continue;
          porId.set(row.id, {
            id: row.id,
            titulo: row.titulo,
            categoria: row.categoria,
            texto: row.texto,
            criado_em: row.criado_em,
            similarity: Number(row.similarity ?? 0),
          });
        }
      }
    }

    // —— 2) Complemento keyword (legado) ——
    const condicoes = palavras
      .map((p) => {
        const termo = p.replace(/[,()]/g, "");
        return `titulo.ilike.%${termo}%,categoria.ilike.%${termo}%,texto.ilike.%${termo}%`;
      })
      .join(",");

    const { data, error } = await admin
      .from("base_conhecimento")
      .select("id, titulo, categoria, texto, criado_em")
      .neq("categoria", "Lei")
      .or(condicoes)
      .order("criado_em", { ascending: false })
      .limit(limiteBusca);

    if (error && porId.size === 0) throw error;

    for (const row of (data ?? []) as ItemConhecimento[]) {
      if (!ehCategoriaLastro(row.categoria)) continue;
      if (!porId.has(row.id)) {
        porId.set(row.id, { ...row, similarity: 0 });
      }
    }

    const documentos = Array.from(porId.values());
    const candidatos: (TrechoConhecimento & { score: number })[] = [];

    for (const documento of documentos) {
      const boostSemantico = (documento.similarity ?? 0) * 12;
      const trechos = dividirEmTrechos(documento.texto);
      for (const trecho of trechos) {
        const scoreKw = pontuarTrecho(normalizar(trecho), palavras);
        const scorePolo = bonusLastroPolo(
          `${documento.titulo}\n${trecho}`,
          documento.categoria,
          polo
        );
        const score =
          scoreKw +
          bonusCategoria(documento.categoria) +
          boostSemantico +
          scorePolo;
        if (score > 0 || boostSemantico >= 4) {
          candidatos.push({
            titulo: documento.titulo,
            categoria: documento.categoria,
            texto: trecho,
            conhecimentoId: documento.id,
            scoreSemantico: documento.similarity,
            score,
          });
        }
      }
    }

    for (const curado of CONHECIMENTO_CURADO) {
      if (!ehCategoriaLastro(curado.categoria)) continue;
      const score =
        pontuarItemCurado(curado, palavras) +
        bonusLastroPolo(
          `${curado.titulo}\n${curado.texto}`,
          curado.categoria,
          polo
        );
      if (score > 0) {
        candidatos.push({ ...curado, score });
      }
    }

    candidatos.sort((a, b) => b.score - a.score);
    const vistos = new Set<string>();
    const unicos: TrechoConhecimento[] = [];
    for (const c of candidatos) {
      if (descartarLastroPorArea(areaId, c.titulo, c.texto, c.categoria)) {
        continue;
      }
      if (lastroContrarioAoPolo(`${c.titulo}\n${c.texto}`, c.categoria, polo)) {
        continue;
      }
      const k = `${c.categoria}|${c.titulo}|${c.texto.slice(0, 60)}`;
      if (vistos.has(k)) continue;
      vistos.add(k);
      unicos.push({
        titulo: c.titulo,
        categoria: c.categoria,
        texto: c.texto,
        conhecimentoId: c.conhecimentoId,
        scoreSemantico: c.scoreSemantico,
      });
      if (unicos.length >= limite) break;
    }
    return unicos;
  } catch {
    // Sem banco: ainda devolve o núcleo curado pontuado.
    return CONHECIMENTO_CURADO.filter((item) => ehCategoriaLastro(item.categoria))
      .map((item) => ({
      item,
      score:
        pontuarItemCurado(item, palavras) +
        bonusLastroPolo(
          `${item.titulo}\n${item.texto}`,
          item.categoria,
          polo
        ),
    }))
      .filter((x) => x.score > 0)
      .filter(
        (x) =>
          !descartarLastroPorArea(
            areaId,
            x.item.titulo,
            x.item.texto,
            x.item.categoria
          ) &&
          !lastroContrarioAoPolo(
            `${x.item.titulo}\n${x.item.texto}`,
            x.item.categoria,
            polo
          )
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, limite)
      .map(({ item }) => item);
  }
}

// Um item de base de conhecimento pode ser uma lei inteira, uma constituição,
// um PDF de centenas de páginas — não há limite no cadastro. Sem um teto por
// item e por soma total, um único documento grande estoura sozinho a quota de
// tokens de qualquer provedor de IA (foi o que aconteceu em produção: alguém
// cadastrou a Constituição Federal inteira como "Lei", 1,5 milhão de
// caracteres, e ela passou a entrar em praticamente toda busca por conter
// termos genéricos como "indenização" e "dano"). Os limites abaixo protegem
// qualquer chamada de IA — real ou de teste — desse cenário.
const LIMITE_CARACTERES_POR_ITEM = 12_000; // ~3.000 tokens por item
const LIMITE_CARACTERES_TOTAL_CONTEXTO = 40_000; // ~10.000 tokens no total injetado

function truncarParaOrcamento(texto: string, limite: number): string {
  if (texto.length <= limite) return texto;
  return `${texto.slice(0, limite)}\n[...texto truncado — item muito longo para caber no limite de contexto da IA; cadastre trechos mais específicos em vez do documento inteiro...]`;
}

/**
 * Monta o texto da base de conhecimento a ser injetado no prompt de uma IA,
 * respeitando um orçamento de caracteres por item e no total — nunca deixa
 * um único documento grande estourar a quota de tokens da chamada. Usada
 * tanto pelo prompt de referência do fluxo determinístico quanto pelo
 * sandbox de teste em /admin/teste-ia.
 */
export function montarContextoConhecimento(itens: TrechoConhecimento[]): string {
  let restante = LIMITE_CARACTERES_TOTAL_CONTEXTO;
  const blocos: string[] = [];

  for (const item of itens) {
    if (restante <= 0) break;
    const limiteItem = Math.min(LIMITE_CARACTERES_POR_ITEM, restante);
    const textoAjustado = truncarParaOrcamento(item.texto.trim(), limiteItem);
    blocos.push(`[${item.categoria}] ${item.titulo}\n${textoAjustado}`);
    restante -= textoAjustado.length;
  }

  return blocos.join("\n\n---\n\n");
}

/**
 * Monta o texto que deve ser injetado no System Prompt da IA quando a
 * geração de peça por IA generativa for implementada. Hoje a peça do JEC é
 * montada de forma determinística (sem chamada a nenhum modelo de IA) — este
 * prompt já fica pronto no retorno da API para ser plugado assim que o
 * modelo for integrado.
 */
export function montarPromptBaseConhecimento(
  itens: TrechoConhecimento[]
): string | null {
  if (itens.length === 0) return null;

  return `Utilize obrigatoriamente as seguintes leis e jurisprudências:\n\n${montarContextoConhecimento(itens)}`;
}
