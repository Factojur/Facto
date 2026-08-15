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
import { ritoDaArea } from "@/lib/area-rito";

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
  return ritoDaArea(areaId).classificador;
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
      ritoDaArea(areaId).nomenclaturaUser,
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
