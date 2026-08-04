/**
 * Assistente Facto via Gemini — nomeia a ação forense livremente
 * (com grounding Google Search quando disponível).
 */

import {
  analisarCaseAssistente,
  formatarNomeAcaoForense,
  montarTituloAcaoCompleto,
  type DecisaoAssistente,
} from "@/lib/assistente-facto";
import {
  gerarTextoComGemini,
  geminiConfigurado,
  modelosRedacao,
  MODELOS_TRIAGEM,
} from "@/lib/ia/gemini-client";

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

const SYSTEM_CLASSIFICACAO = [
  "Você é o Assistente Facto, paralegal especialista em Juizado Especial Cível brasileiro (Lei 9.099/95).",
  "Analise os FATOS e NOMEIE a ação processual cabível no padrão forense.",
  "",
  "REGRAS DE NOMENCLATURA:",
  '- Use o formato: "Petição Inicial — Ação de [NOME] c/c [Cúmulos] (JEC)" quando couber petição inicial.',
  "- Exemplos válidos:",
  '  • "Petição Inicial — Ação Declaratória de Inexistência / Inexigibilidade de Débito c/c Danos Morais (JEC)"',
  '  • "Petição Inicial — Ação de Indenização por Danos Materiais e Morais (JEC)"',
  '  • "Petição Inicial — Ação de Obrigação de Fazer c/c Danos Morais e Tutela de Urgência (JEC)"',
  '  • "Execução de Título Extrajudicial (JEC)"',
  "- NÃO escolha de uma lista fechada: invente o nome técnico correto e usual na praxe forense brasileira.",
  "- Se tiver busca/Google disponível, confira nomenclatura usual de petições no JEC/CDC compatível com os fatos.",
  "- Golpe/fraude/PIX/cartão/falsa central → indenização ou inexigibilidade + danos; NÃO execução de título.",
  "- Tutela de urgência só com urgência real (corte, bloqueio, risco iminente).",
  "- Justificativa objetiva em português (2 a 4 frases), sem inventar fatos.",
  "",
  "Responda SOMENTE com JSON válido (sem markdown), neste formato:",
  "{",
  '  "tipoAcao": "<nome forense completo da ação>",',
  '  "tutelaUrgencia": true|false,',
  '  "danosMorais": true|false,',
  '  "danosMateriais": true|false,',
  '  "justificativa": "<texto>"',
  "}",
].join("\n");

/** Modelos com melhor suporte a Google Search grounding. */
const MODELOS_ASSISTENTE_BUSCA = [
  ...modelosRedacao().slice(0, 2),
  ...MODELOS_TRIAGEM,
] as const;

/**
 * Classifica o caso com Gemini (+ busca quando possível); se falhar, usa regras locais.
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

  const res = await gerarTextoComGemini({
    systemPrompt: SYSTEM_CLASSIFICACAO,
    userPrompt: [
      "<FATOS_DO_CASO>",
      fatos.slice(0, 12_000),
      "</FATOS_DO_CASO>",
      "",
      "Com base nos fatos (e em busca geral sobre nomenclatura forense no JEC, se disponível),",
      "nomeie a ação cabível e indique cúmulos.",
    ].join("\n"),
    modelos: MODELOS_ASSISTENTE_BUSCA,
    temperature: 0.25,
    maxOutputTokens: 1024,
    usarBuscaGoogle: true,
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
    formatarNomeAcaoForense(tipoBruto) || fallback().tipoAcao;

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
