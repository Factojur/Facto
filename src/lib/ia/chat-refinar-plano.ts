/**
 * Turno conversacional no chat — refina entendimento/plano (Flash-Lite, sem cota de peça).
 * Custo ~R$ 0,02–0,05/turno — margem preservada vs 1 peça (~R$ 2+).
 */

import type { PreviewTriagemData } from "@/components/dashboard/preview-triagem-peca";
import type { EstadoCasoChat, MensagemChat } from "@/lib/chat-minuta";
import { montarResumoEntendimentoChat, rotuloAreaChat } from "@/lib/chat-minuta";
import { PERSONA_ADVOGADO_SENIOR_FACTO } from "@/lib/ia/assistente-facto-prompt";
import {
  gerarTextoComGemini,
  geminiConfigurado,
  MODELOS_TRIAGEM,
} from "@/lib/ia/gemini-client";

export type PatchEstadoRefinar = {
  pedidos?: string[];
  tutelaUrgencia?: boolean;
  pedirJusticaGratuita?: boolean;
  tipoAcao?: string;
  autoresNomes?: string[];
  reusNomes?: string[];
};

export type ResultadoRefinarPlano = {
  resposta: string;
  patchEstado?: PatchEstadoRefinar;
  perguntaProativa?: string | null;
  modelo?: string;
};

const LIMITE_MSGS = 6;
const LIMITE_CHARS_MSG = 600;

function resumirThread(msgs: MensagemChat[]): string {
  return msgs
    .slice(-LIMITE_MSGS)
    .map((m) => `${m.papel === "usuario" ? "U" : "A"}: ${m.texto.slice(0, LIMITE_CHARS_MSG)}`)
    .join("\n");
}

function extrairJson(texto: string): Record<string, unknown> | null {
  const match = texto.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function refinarPlanoComGemini(input: {
  mensagem: string;
  estado: EstadoCasoChat;
  triagem: PreviewTriagemData | null;
  mensagens: MensagemChat[];
}): Promise<ResultadoRefinarPlano | null> {
  if (!geminiConfigurado()) return null;

  const resumo = montarResumoEntendimentoChat(input.estado);
  const thread = resumirThread(input.mensagens);
  const planoBreve = input.triagem
    ? `Tópicos: ${input.triagem.topicos.map((t) => t.titulo).join("; ").slice(0, 400)}`
    : "Plano ainda não montado.";

  const system = `${PERSONA_ADVOGADO_SENIOR_FACTO}
Canal: chat FACTO. Responda em português, tom profissional e direto (2–4 frases).
Não invente fatos. Não redija petição inteira. Ajude a refinar pedidos, teses e lacunas antes da redação (que consome 1 peça).
Retorne APENAS JSON válido:
{
  "resposta": "texto para o usuário",
  "patchEstado": { "pedidos": ["..."], "tutelaUrgencia": true/false, "pedirJusticaGratuita": true/false, "tipoAcao": "...", "autoresNomes": ["..."], "reusNomes": ["..."] },
  "perguntaProativa": "uma pergunta curta ou null"
}
patchEstado só com campos que o usuário pediu ou corrigiu nesta mensagem.`;

  const user = `Área: ${rotuloAreaChat(input.estado.areaId)}
Ação: ${resumo.tipoAcao}
Partes: ${resumo.autores} × ${resumo.reus}
Pedidos atuais: ${resumo.pedidos.join("; ") || "—"}
${planoBreve}

Thread recente:
${thread}

Nova mensagem do usuário:
${input.mensagem.slice(0, 2000)}`;

  const resultado = await gerarTextoComGemini({
    modelos: MODELOS_TRIAGEM,
    systemPrompt: system,
    userPrompt: user,
    maxOutputTokens: 900,
    temperature: 0.35,
  });

  if (!resultado.ok) return null;

  const json = extrairJson(resultado.texto);
  if (!json || typeof json.resposta !== "string") {
    return {
      resposta: resultado.texto.trim().slice(0, 1200),
      modelo: resultado.modelo,
    };
  }

  const patch = json.patchEstado as PatchEstadoRefinar | undefined;
  const pergunta =
    typeof json.perguntaProativa === "string"
      ? json.perguntaProativa
      : json.perguntaProativa === null
        ? null
        : undefined;

  return {
    resposta: json.resposta.trim(),
    patchEstado: patch && typeof patch === "object" ? patch : undefined,
    perguntaProativa: pergunta,
    modelo: resultado.modelo,
  };
}

export function aplicarPatchEstadoRefinar(
  estado: EstadoCasoChat,
  patch: PatchEstadoRefinar
): EstadoCasoChat {
  const next = { ...estado };
  if (Array.isArray(patch.pedidos) && patch.pedidos.length > 0) {
    const merged = [...estado.pedidos.filter(Boolean)];
    for (const p of patch.pedidos) {
      const t = String(p).trim();
      if (t && !merged.includes(t)) merged.push(t);
    }
    next.pedidos = merged;
  }
  if (typeof patch.tutelaUrgencia === "boolean") {
    next.tutelaUrgencia = patch.tutelaUrgencia;
  }
  if (typeof patch.pedirJusticaGratuita === "boolean") {
    next.pedirJusticaGratuita = patch.pedirJusticaGratuita;
  }
  if (typeof patch.tipoAcao === "string" && patch.tipoAcao.trim()) {
    next.tipoAcao = patch.tipoAcao.trim();
  }
  if (Array.isArray(patch.autoresNomes) && patch.autoresNomes.length) {
    next.autoresNomes = patch.autoresNomes.map((n) => String(n).trim()).filter(Boolean);
  }
  if (Array.isArray(patch.reusNomes) && patch.reusNomes.length) {
    next.reusNomes = patch.reusNomes.map((n) => String(n).trim()).filter(Boolean);
  }
  return { ...next, planoVisto: false, previewVisto: false };
}
