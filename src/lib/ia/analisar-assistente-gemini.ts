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

function systemClassificacao(areaId: string): string {
  if (areaId === "civil") {
    return [
      "Você é o Assistente Facto, paralegal especialista em contencioso cível na justiça comum (Código Civil e CPC).",
      "Analise os FATOS e NOMEIE a ação processual cabível no padrão forense.",
      "",
      "REGRAS DE NOMENCLATURA:",
      '- Use o formato: "Ação de [NOME] c/c [Cúmulos]" — SEM prefixo "Petição Inicial" e SEM "(JEC)".',
      "- Exemplos válidos:",
      '  • "Ação de Cobrança c/c Danos Morais"',
      '  • "Ação de Indenização por Danos Materiais e Morais"',
      '  • "Ação de Obrigação de Fazer c/c Tutela de Urgência"',
      '  • "Execução de Título Extrajudicial"',
      "- NÃO use Lei 9.099/95, recurso inominado nem CDC (relação de consumo / inversão do ônus) — se for consumo, o módulo é Consumidor.",
      "- Honorários: art. 85 do CPC. Responsabilidade: arts. 186 e 927 do CC quando couber.",
      "- NÃO escolha de uma lista fechada: invente o nome técnico correto e usual na praxe forense brasileira.",
      "- Tutela de urgência só com urgência real (art. 300 do CPC).",
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
  }
  if (areaId === "consumidor") {
    return [
      "Você é o Assistente Facto, paralegal especialista em direito do consumidor na justiça comum (CDC e CPC).",
      "Analise os FATOS e NOMEIE a ação processual cabível no padrão forense.",
      "",
      "REGRAS DE NOMENCLATURA:",
      '- Use o formato: "Ação de [NOME] c/c [Cúmulos]" — SEM prefixo "Petição Inicial" e SEM "(JEC)".',
      "- Exemplos válidos:",
      '  • "Ação Declaratória de Inexistência / Inexigibilidade de Débito c/c Danos Morais"',
      '  • "Ação de Indenização por Danos Materiais e Morais"',
      '  • "Ação de Obrigação de Fazer c/c Danos Morais e Tutela de Urgência"',
      "- NÃO use Lei 9.099/95 nem recurso inominado. Este módulo NÃO é Juizado.",
      "- Golpe/fraude/PIX/cartão/falsa central → indenização ou inexigibilidade + danos; NÃO execução de título.",
      "- Tutela de urgência só com urgência real (art. 300 do CPC).",
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
  }
  return [
    "Você é o Assistente Facto, paralegal especialista em Juizado Especial Cível brasileiro (Lei 9.099/95).",
    "Analise os FATOS e NOMEIE a ação processual cabível no padrão forense.",
    "",
    "REGRAS DE NOMENCLATURA:",
    '- Use o formato: "Ação de [NOME] c/c [Cúmulos] (JEC)" — SEM prefixo "Petição Inicial".',
    "- Exemplos válidos:",
    '  • "Ação Declaratória de Inexistência / Inexigibilidade de Débito c/c Danos Morais (JEC)"',
    '  • "Ação de Indenização por Danos Materiais e Morais (JEC)"',
    '  • "Ação de Obrigação de Fazer c/c Danos Morais e Tutela de Urgência (JEC)"',
    '  • "Execução de Título Extrajudicial (JEC)"',
    '- PROIBIDO começar com "Petição Inicial" — a peça já é a petição; o nome é só o da ação.',
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
}

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
  areaId?: string;
}): Promise<DecisaoAssistente> {
  const fatos = input.fatos.trim();
  const areaId = input.areaId ?? "jec";
  const fallback = () => analisarCaseAssistente({ fatos, areaId });

  if (fatos.length < 40) {
    return fallback();
  }

  if (!geminiConfigurado()) {
    return fallback();
  }

  const res = await gerarTextoComGemini({
    systemPrompt: systemClassificacao(areaId),
    userPrompt: [
      "<FATOS_DO_CASO>",
      fatos.slice(0, 12_000),
      "</FATOS_DO_CASO>",
      "",
      areaId === "civil"
        ? "Com base nos fatos (nomenclatura da justiça comum cível / CPC, se disponível),"
        : areaId === "consumidor"
          ? "Com base nos fatos (nomenclatura consumerista na justiça comum / CDC+CPC, se disponível),"
          : "Com base nos fatos (e em busca geral sobre nomenclatura forense no JEC, se disponível),",
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
    formatarNomeAcaoForense(tipoBruto, areaId) || fallback().tipoAcao;

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
    tituloCompleto: montarTituloAcaoCompleto(tipoAcao, cumulos, areaId),
    fonte: "gemini",
  };
}
