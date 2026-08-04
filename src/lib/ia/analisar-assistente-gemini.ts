/**
 * Assistente Facto via Gemini — escolhe tipo de ação + cúmulos (tutela/danos).
 */

import { analisarCaseAssistente, type DecisaoAssistente, montarTituloAcaoCompleto } from "@/lib/assistente-facto";
import {
  gerarTextoComGemini,
  geminiConfigurado,
  MODELOS_TRIAGEM,
} from "@/lib/ia/gemini-client";
import { TIPOS_ACAO_JEC } from "@/lib/tipos-acao-jec";

export function listarTiposAcaoJecFlat(): string[] {
  return TIPOS_ACAO_JEC.flatMap((g) => [...g.opcoes]);
}

function normalizarParaMatch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Encaixa a resposta da IA em um item exato do catálogo. */
export function casarTipoAcaoNoCatalogo(
  candidato: string,
  catalogo: string[] = listarTiposAcaoJecFlat()
): string | null {
  const bruto = candidato.trim();
  if (!bruto) return null;

  const exato = catalogo.find((t) => t === bruto);
  if (exato) return exato;

  const alvo = normalizarParaMatch(bruto);
  let melhor: { tipo: string; score: number } | null = null;

  for (const tipo of catalogo) {
    const n = normalizarParaMatch(tipo);
    if (n === alvo) return tipo;
    if (n.includes(alvo) || alvo.includes(n)) {
      const score = Math.min(n.length, alvo.length) / Math.max(n.length, alvo.length);
      if (!melhor || score > melhor.score) melhor = { tipo, score };
    }
  }

  return melhor && melhor.score >= 0.45 ? melhor.tipo : null;
}

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
    /* tenta fatiar o primeiro {…} */
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

function boolField(v: unknown, fallback = false): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["true", "sim", "yes", "1"].includes(s)) return true;
    if (["false", "nao", "não", "no", "0"].includes(s)) return false;
  }
  return fallback;
}

function montarSystemPromptClassificacao(catalogo: string[]): string {
  return [
    "Você é o Assistente Facto, paralegal especialista em Juizado Especial Cível (Lei 9.099/95).",
    "Analise os FATOS do caso e escolha a ação processual cabível.",
    "",
    "REGRAS:",
    "- Escolha EXATAMENTE um item da lista TIPOS_CATALOGO (copie a string integral).",
    "- Indique se cabem cúmulos: danos morais, danos materiais e/ou tutela de urgência (art. 300 CPC).",
    "- Golpe/fraude/PIX/cartão/falsa central → em geral indenização ou inexigibilidade + danos; NÃO execução de título.",
    "- Cobrança indevida / negativação de dívida não reconhecida → preferir Declaratória de Inexistência/Inexigibilidade.",
    "- Tutela de urgência só se houver urgência real (corte de serviço, bloqueio, risco iminente etc.).",
    "- Justificativa objetiva em português (2 a 4 frases), sem inventar fatos.",
    "",
    "Responda SOMENTE com JSON válido (sem markdown), neste formato:",
    '{',
    '  "tipoAcao": "<string exata do catálogo>",',
    '  "tutelaUrgencia": true|false,',
    '  "danosMorais": true|false,',
    '  "danosMateriais": true|false,',
    '  "justificativa": "<texto>"',
    "}",
    "",
    "TIPOS_CATALOGO:",
    ...catalogo.map((t) => `- ${t}`),
  ].join("\n");
}

/**
 * Classifica o caso com Gemini; se falhar, usa regras locais.
 */
export async function analisarCaseComGemini(input: {
  fatos: string;
}): Promise<DecisaoAssistente> {
  const fatos = input.fatos.trim();
  const fallback = () => analisarCaseAssistente({ fatos });

  if (fatos.length < 40) {
    return fallback();
  }

  if (!geminiConfigurado()) {
    return fallback();
  }

  const catalogo = listarTiposAcaoJecFlat();
  // Catálogo completo no prompt fica grande; prioriza petições iniciais (mais usadas)
  const catalogoPrompt = catalogo.filter(
    (t) =>
      t.startsWith("Petição Inicial") ||
      t.startsWith("Execução") ||
      t.startsWith("Embargos") ||
      t.startsWith("Contestação") ||
      t.startsWith("Recurso Inominado") ||
      t.startsWith("Pedido de")
  );

  const res = await gerarTextoComGemini({
    systemPrompt: montarSystemPromptClassificacao(
      catalogoPrompt.length > 0 ? catalogoPrompt : catalogo
    ),
    userPrompt: [
      "<FATOS_DO_CASO>",
      fatos.slice(0, 12_000),
      "</FATOS_DO_CASO>",
      "",
      "Classifique a ação cabível no JEC conforme as regras.",
    ].join("\n"),
    modelos: MODELOS_TRIAGEM,
    temperature: 0.2,
    maxOutputTokens: 1024,
  });

  if (!res.ok) {
    console.warn("[assistente-facto] Gemini falhou, usando regras:", res.erro);
    return fallback();
  }

  const json = extrairJsonObjeto(res.texto);
  if (!json) {
    console.warn("[assistente-facto] JSON inválido da Gemini");
    return fallback();
  }

  const tipoBruto = String(json.tipoAcao ?? json.tipo_acao ?? "").trim();
  const tipoAcao =
    casarTipoAcaoNoCatalogo(tipoBruto, catalogo) ?? fallback().tipoAcao;

  const tutelaUrgencia = boolField(json.tutelaUrgencia ?? json.tutela_urgencia);
  const danosMorais = boolField(json.danosMorais ?? json.danos_morais);
  const danosMateriais = boolField(
    json.danosMateriais ?? json.danos_materiais
  );
  const justificativa =
    String(json.justificativa ?? "").trim() ||
    `Ação sugerida pela análise inteligente FACTO: ${tipoAcao}.`;

  const cumulos = { danosMorais, danosMateriais, tutelaUrgencia };

  return {
    tipoAcao,
    tutelaUrgencia,
    danosMorais,
    danosMateriais,
    justificativa,
    tituloCompleto: montarTituloAcaoCompleto(tipoAcao, cumulos),
    fonte: "gemini",
  };
}
