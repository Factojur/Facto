/**
 * Passos 3–5: classifica docs, monta ficha e sugere peça a partir dos autos.
 */

import {
  formatarNomeAcaoForense,
  montarTituloAcaoCompleto,
} from "@/lib/assistente-facto";
import type {
  AnaliseProcessoResultado,
  DocumentoClassificado,
  FichaProcessual,
  RotuloDocProcesso,
} from "@/lib/analisar-processo-types";
import { ROTULOS_DOC_PROCESSO } from "@/lib/analisar-processo-types";
import { ritoDaArea } from "@/lib/area-rito";
import {
  inferirEspecieDaArea,
  idsPeticaoInicialDaArea,
  listaEspeciesDaArea,
  tituloPecaDaArea,
} from "@/lib/peca-especie-area";
import { pecaUsaPartesJaQualificadas } from "@/lib/partes-ja-qualificadas";
import {
  gerarTextoComGemini,
  geminiConfigurado,
  modelosRedacao,
} from "@/lib/ia/gemini-client";

const MAX_CHARS_TOTAL = 70_000;

function extrairJsonObjeto(texto: string): Record<string, unknown> | null {
  const limpo = texto
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(limpo);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    /* fatiar */
  }

  const inicio = limpo.indexOf("{");
  const fim = limpo.lastIndexOf("}");
  if (inicio >= 0 && fim > inicio) {
    try {
      const parsed = JSON.parse(limpo.slice(inicio, fim + 1));
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }
  }
  return null;
}

function str(v: unknown, fallback = ""): string {
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return fallback;
}

function num(v: unknown, fallback = 0.5): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(1, Math.max(0, n));
}

function bool(v: unknown, fallback = false): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["true", "sim", "yes", "1"].includes(s)) return true;
    if (["false", "nao", "não", "no", "0"].includes(s)) return false;
  }
  return fallback;
}

function normalizarRotulo(v: unknown): RotuloDocProcesso {
  const s = str(v).toLowerCase().replace(/\s+/g, "_");
  if ((ROTULOS_DOC_PROCESSO as readonly string[]).includes(s)) {
    return s as RotuloDocProcesso;
  }
  if (s.includes("senten")) return "sentenca";
  if (s.includes("contest")) return "contestacao";
  if (s.includes("inicial") || s.includes("petic")) return "peticao_inicial";
  if (s.includes("decis") || s.includes("despacho")) return "decisao";
  if (s.includes("recurso") || s.includes("agravo") || s.includes("embargo"))
    return "recurso";
  if (s.includes("auto")) return "autos_completos";
  return "outros";
}

function idsEspecieDaArea(areaId: string): string[] {
  const lista = listaEspeciesDaArea(areaId);
  if (lista) return lista.map((e) => e.id);
  return [
    "peticao-inicial",
    "contestacao",
    "embargos",
    "recurso-inominado",
    "agravo-instrumento",
    "contrarrazoes-inominado",
    "replica",
    "execucao",
  ];
}

function normalizarEspecie(
  v: unknown,
  tipoAcao: string,
  fatos: string,
  areaId: string
): string {
  const s = str(v).toLowerCase().replace(/\s+/g, "-");
  const ids = idsEspecieDaArea(areaId);
  if (ids.includes(s)) return s;
  return inferirEspecieDaArea(areaId, tipoAcao, fatos, s);
}

function systemAnalise(areaId: string): string {
  const rito = ritoDaArea(areaId);
  const ids = idsEspecieDaArea(areaId).join(" | ");
  return [
    `Você é o Assistente Facto, paralegal especialista em ${rito.especialidade}.`,
    rito.ritoLinha,
    "Receberá textos extraídos de documentos processuais (autos completos ou peças selecionadas).",
    "Tarefas:",
    "1) Classificar cada documento (sentença, contestação, petição inicial, decisão, recurso, autos, outros).",
    "2) Montar uma FICHA PROCESSUAL objetiva (sem inventar números/datas ausentes — use string vazia).",
    `3) Sugerir a PEÇA CABÍVEL agora (${ids}) com nome forense, confiança 0–1 e justificativa curta.`,
    "4) pecaCandidata.tipoAcao = nome da PEÇA A PROTOCOLAR AGORA. NUNCA copie só o nome da ação originária nem o nome do arquivo.",
    "5) fatosSugeridos: narrativa em 3ª pessoa pronta para o campo Fatos do formulário (8–20 linhas).",
    "6) dispositivo: resuma o julgamento da sentença (procedente, improcedente, parcialmente procedente, extinto). Vazio se não houver sentença.",
    "",
    "Responda SOMENTE JSON válido (sem markdown):",
    "{",
    '  "documentos": [{"nome":"","rotulo":"sentenca|contestacao|peticao_inicial|decisao|recurso|autos_completos|outros","resumo":""}],',
    '  "ficha": {',
    '    "orgao":"", "numeroProcesso":"", "comarca":"",',
    '    "partesAutor":"", "partesReu":"", "dataDecisao":"",',
    '    "dispositivo":"procedente|improcedente|parcialmente procedente|extinto|",',
    '    "pedidosResumo":"", "fundamentosResumo":"",',
    '    "faseProcessual":"", "fatosSugeridos":""',
    "  },",
    '  "pecaCandidata": {',
    `    "tipoAcao":"", "especiePeca":"${idsEspecieDaArea(areaId)[0]}", "confianca":0.0,`,
    '    "justificativa":"", "tutelaUrgencia":false, "danosMorais":false, "danosMateriais":false',
    "  },",
    '  "avisos": []',
    "}",
  ].join("\n");
}

export type DocTextoProcesso = {
  nome: string;
  rotuloHint?: string;
  texto: string;
};

export async function analisarProcessoComGemini(
  docs: DocTextoProcesso[],
  areaId: string = "jec"
): Promise<AnaliseProcessoResultado> {
  if (!geminiConfigurado()) {
    throw new Error("GEMINI_API_KEY não configurada.");
  }
  if (docs.length === 0) {
    throw new Error("Nenhum documento com texto extraído.");
  }

  let restante = MAX_CHARS_TOTAL;
  const blocos: string[] = [];
  for (const d of docs) {
    const cab = `### DOC: ${d.nome}${d.rotuloHint ? ` [${d.rotuloHint}]` : ""}\n`;
    const corpo = d.texto.trim().slice(0, Math.max(0, restante - cab.length));
    if (corpo.length < 20) continue;
    blocos.push(cab + corpo);
    restante -= cab.length + corpo.length;
    if (restante < 500) break;
  }

  if (blocos.length === 0) {
    throw new Error("Texto insuficiente nos documentos enviados.");
  }

  const res = await gerarTextoComGemini({
    systemPrompt: systemAnalise(areaId),
    userPrompt: [
      "<DOCUMENTOS_DO_PROCESSO>",
      blocos.join("\n\n"),
      "</DOCUMENTOS_DO_PROCESSO>",
      "",
      `Classifique, monte a ficha e sugira a peça cabível neste módulo (${ritoDaArea(areaId).especialidade}).`,
    ].join("\n"),
    modelos: modelosRedacao().slice(0, 3),
    temperature: 0.2,
    maxOutputTokens: 4_096,
  });

  if (!res.ok) {
    throw new Error(res.erro || "Falha na Gemini ao analisar o processo.");
  }

  const json = extrairJsonObjeto(res.texto);
  if (!json) {
    throw new Error("A IA não retornou JSON válido na análise do processo.");
  }

  const fichaRaw = (json.ficha ?? {}) as Record<string, unknown>;
  const ficha: FichaProcessual = {
    orgao: str(fichaRaw.orgao),
    numeroProcesso: str(fichaRaw.numeroProcesso),
    comarca: str(fichaRaw.comarca),
    partesAutor: str(fichaRaw.partesAutor),
    partesReu: str(fichaRaw.partesReu),
    dataDecisao: str(fichaRaw.dataDecisao),
    dispositivo: str(fichaRaw.dispositivo),
    pedidosResumo: str(fichaRaw.pedidosResumo),
    fundamentosResumo: str(fichaRaw.fundamentosResumo),
    faseProcessual: str(fichaRaw.faseProcessual),
    fatosSugeridos: str(fichaRaw.fatosSugeridos),
  };

  const docsRaw = Array.isArray(json.documentos) ? json.documentos : [];
  const documentos: DocumentoClassificado[] = docsRaw.map((row, i) => {
    const r = (row ?? {}) as Record<string, unknown>;
    return {
      nome: str(r.nome, docs[i]?.nome ?? `Documento ${i + 1}`),
      rotulo: normalizarRotulo(r.rotulo),
      resumo: str(r.resumo).slice(0, 400),
    };
  });

  const pecaRaw = (json.pecaCandidata ?? {}) as Record<string, unknown>;
  const justificativa = str(pecaRaw.justificativa);
  const tipoBruto = str(pecaRaw.tipoAcao);
  const danosMorais = bool(pecaRaw.danosMorais);
  const danosMateriais = bool(pecaRaw.danosMateriais);
  const tutelaUrgencia = bool(pecaRaw.tutelaUrgencia);
  const especiePeca = normalizarEspecie(
    pecaRaw.especiePeca,
    tipoBruto || justificativa,
    ficha.fatosSugeridos,
    areaId
  );
  const contextoTitulo = `${justificativa} ${ficha.fatosSugeridos} ${tipoBruto}`;
  const idsInicial = idsPeticaoInicialDaArea(areaId);
  const jaQual = pecaUsaPartesJaQualificadas(especiePeca, idsInicial);
  const tipoAcao = jaQual
    ? formatarNomeAcaoForense(
        tituloPecaDaArea(areaId, especiePeca, tipoBruto, contextoTitulo),
        areaId
      )
    : formatarNomeAcaoForense(tipoBruto, areaId) ||
      tipoBruto ||
      ritoDaArea(areaId).tipoAcaoDefault;
  const tituloCompleto = jaQual
    ? tipoAcao
    : montarTituloAcaoCompleto(tipoAcao, {
        danosMorais,
        danosMateriais,
        tutelaUrgencia,
      });

  const avisosRaw = Array.isArray(json.avisos) ? json.avisos : [];
  const avisos = avisosRaw
    .map((a) => str(a))
    .filter(Boolean)
    .slice(0, 8);

  if (!ficha.fatosSugeridos) {
    avisos.push(
      "A IA não extraiu narrativa de fatos — complete o campo Fatos manualmente."
    );
  }

  return {
    documentos:
      documentos.length > 0
        ? documentos
        : docs.map((d) => ({
            nome: d.nome,
            rotulo: normalizarRotulo(d.rotuloHint),
            resumo: "",
          })),
    ficha,
    pecaCandidata: {
      tipoAcao,
      especiePeca,
      tituloCompleto,
      confianca: num(pecaRaw.confianca, 0.55),
      justificativa:
        str(pecaRaw.justificativa) ||
        "Sugestão com base nos documentos enviados — confirme antes de gerar.",
      tutelaUrgencia,
      danosMorais,
      danosMateriais,
    },
    avisos,
  };
}
