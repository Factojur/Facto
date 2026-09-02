/**
 * Motor conversacional Fase 1 — fluidez MinutaIA, moat FACTO na Fase 2 (Redigir).
 * Flash-Lite, sem cota de peça. Interpreta, sugere, organiza — não redige petição inteira.
 */

import type { PreviewTriagemData } from "@/components/dashboard/preview-triagem-peca";
import type { EstadoCasoChat, MensagemChat } from "@/lib/chat-minuta";
import {
  montarResumoEntendimentoChat,
  rotuloAreaChat,
} from "@/lib/chat-minuta";
import { blocoRitoArea } from "@/lib/ia/assistente-facto-prompt";
import {
  gerarTextoComGemini,
  geminiConfigurado,
  MODELOS_TRIAGEM,
} from "@/lib/ia/gemini-client";
import {
  aplicarPatchEstadoRefinar,
  type PatchEstadoRefinar,
  type ResultadoRefinarPlano,
} from "@/lib/ia/chat-refinar-plano";
import {
  diffEstadoCasoChat,
  montarRespostaTurnoLocal,
  perguntaProativaLocal,
} from "@/lib/chat-resposta-turno";
import {
  configModoConversa,
  MODO_CONVERSA_PADRAO,
  normalizarModoConversa,
  type ModoConversaChat,
} from "@/lib/modo-conversa-chat";

export type { PatchEstadoRefinar, ResultadoRefinarPlano };
export { aplicarPatchEstadoRefinar };

export type PromptsConversaFase1 = {
  system: string;
  user: string;
  maxOutputTokens: number;
  temperature: number;
};

function blocoBaseSistemaConversa(modo: ModoConversaChat): string[] {
  const cfg = configModoConversa(modo);
  return [
    "Você é o assistente jurídico FACTO — conversa fluida com advogado ou leigo, no mesmo espírito do MinutaIA.",
    "Objetivo: entender o caso, interpretar fatos, sugerir teses e pedidos, organizar ideias.",
    "Liberdade: interprete área, espécie e cabimento como advogado sênior. O módulo/área FACTO é orientação de produto, não dogma.",
    "NÃO redija petição inteira. NÃO invente fatos, acórdãos ou números de processo não narrados/anexados.",
    "Tom: profissional, direto, acolhedor — como um colega experiente no chat.",
    "Pode usar listas curtas e **negrito** em termos-chave.",
    ...cfg.instrucoesSistema,
    "A redação formal da peça só ocorre quando o usuário clicar Redigir (1 crédito).",
  ];
}

function montarUserConversa(input: {
  mensagem: string;
  estado: EstadoCasoChat;
  triagem: PreviewTriagemData | null;
  mensagens: MensagemChat[];
  avisoExtra?: string | null;
}): string {
  const resumo = montarResumoEntendimentoChat(input.estado);
  const thread = resumirThread(input.mensagens);
  const planoBreve = input.triagem
    ? `Plano atual — tópicos: ${input.triagem.topicos.map((t) => t.titulo).join("; ").slice(0, 500)}`
    : "Plano ainda em montagem (painel à direita).";

  return [
    "Área/módulo FACTO sugerido (orientação — você pode reinterpretar se o usuário corrigir):",
    blocoRitoArea(input.estado.areaId),
    "",
    `Área atual: ${rotuloAreaChat(input.estado.areaId)}`,
    `Ação/espécie sugerida: ${resumo.tipoAcao} · ${resumo.especie}`,
    `Partes: ${resumo.autores} × ${resumo.reus}`,
    `Foro: ${resumo.foro}`,
    `Pedidos no caso: ${resumo.pedidos.join("; ") || "—"}`,
    `Fatos (trecho): ${resumo.fatosResumo}`,
    planoBreve,
    input.avisoExtra ? `Aviso interno: ${input.avisoExtra}` : "",
    "",
    "Histórico recente:",
    thread || "(primeira mensagem)",
    "",
    `Nova mensagem do usuário:\n${input.mensagem.slice(0, 4000)}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Prompts para stream (markdown direto, sem JSON). */
export function montarPromptsConversaStream(input: {
  mensagem: string;
  estado: EstadoCasoChat;
  triagem: PreviewTriagemData | null;
  mensagens: MensagemChat[];
  avisoExtra?: string | null;
  modo?: ModoConversaChat;
}): PromptsConversaFase1 {
  const modo = normalizarModoConversa(input.modo ?? MODO_CONVERSA_PADRAO);
  const cfg = configModoConversa(modo);

  const system = [
    ...blocoBaseSistemaConversa(modo),
    "Responda APENAS com o texto markdown para o chat — sem JSON, sem blocos de código.",
  ].join("\n");

  return {
    system,
    user: montarUserConversa(input),
    maxOutputTokens: cfg.maxOutputTokens,
    temperature: cfg.temperature,
  };
}

const LIMITE_MSGS = 12;
const LIMITE_CHARS_MSG = 1200;

function resumirThread(msgs: MensagemChat[]): string {
  return msgs
    .slice(-LIMITE_MSGS)
    .map((m) => {
      const papel =
        m.papel === "usuario" ? "Advogado" : m.papel === "assistente" ? "FACTO" : "Sistema";
      return `${papel}: ${m.texto.slice(0, LIMITE_CHARS_MSG)}`;
    })
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

function parsePatch(raw: unknown): PatchEstadoRefinar | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const p = raw as PatchEstadoRefinar;
  const out: PatchEstadoRefinar = {};
  if (Array.isArray(p.pedidos)) {
    out.pedidos = p.pedidos.map((x) => String(x).trim()).filter(Boolean);
  }
  if (typeof p.tutelaUrgencia === "boolean") out.tutelaUrgencia = p.tutelaUrgencia;
  if (typeof p.pedirJusticaGratuita === "boolean") {
    out.pedirJusticaGratuita = p.pedirJusticaGratuita;
  }
  if (typeof p.tipoAcao === "string" && p.tipoAcao.trim()) {
    out.tipoAcao = p.tipoAcao.trim();
  }
  if (Array.isArray(p.autoresNomes) && p.autoresNomes.length) {
    out.autoresNomes = p.autoresNomes.map((n) => String(n).trim()).filter(Boolean);
  }
  if (Array.isArray(p.reusNomes) && p.reusNomes.length) {
    out.reusNomes = p.reusNomes.map((n) => String(n).trim()).filter(Boolean);
  }
  return Object.keys(out).length ? out : undefined;
}

/** Resposta local quando Gemini indisponível — conversa nunca para. */
export function respostaConversaFallback(input: {
  estado: EstadoCasoChat;
  estadoAnterior: EstadoCasoChat;
  primeiroRelato: boolean;
  avisoExtra?: string | null;
}): ResultadoRefinarPlano {
  const diff = diffEstadoCasoChat(input.estadoAnterior, input.estado);
  let resposta = montarRespostaTurnoLocal({
    diff,
    estado: input.estado,
    primeiroRelato: input.primeiroRelato,
  });
  const proativa = perguntaProativaLocal(input.estado);
  if (proativa && !resposta.includes(proativa.slice(0, 24))) {
    resposta += `\n\n${proativa}`;
  }
  if (input.avisoExtra?.trim()) {
    resposta = `${input.avisoExtra.trim()}\n\n${resposta}`;
  }
  return { resposta, modelo: "local" };
}

export async function conversarAssistenteFase1(input: {
  mensagem: string;
  estado: EstadoCasoChat;
  estadoAnterior: EstadoCasoChat;
  triagem: PreviewTriagemData | null;
  mensagens: MensagemChat[];
  primeiroRelato?: boolean;
  avisoExtra?: string | null;
  modo?: ModoConversaChat;
}): Promise<ResultadoRefinarPlano> {
  const primeiroRelato = input.primeiroRelato ?? false;
  const modo = normalizarModoConversa(input.modo ?? MODO_CONVERSA_PADRAO);
  const cfg = configModoConversa(modo);

  if (!geminiConfigurado()) {
    return respostaConversaFallback({
      estado: input.estado,
      estadoAnterior: input.estadoAnterior,
      primeiroRelato,
      avisoExtra: input.avisoExtra,
    });
  }

  const system = blocoBaseSistemaConversa(modo).join("\n");

  const user = [
    montarUserConversa({
      mensagem: input.mensagem,
      estado: input.estado,
      triagem: input.triagem,
      mensagens: input.mensagens,
      avisoExtra: input.avisoExtra,
    }),
    "",
    "Retorne APENAS JSON válido:",
    `{
  "resposta": "texto markdown para o chat",
  "patchEstado": { "pedidos": [], "tutelaUrgencia": false, "pedirJusticaGratuita": false, "tipoAcao": "", "autoresNomes": [], "reusNomes": [] },
  "perguntaProativa": "pergunta curta ou null"
}`,
    "patchEstado: só campos explicitamente pedidos ou corrigidos nesta mensagem.",
  ].join("\n");

  const resultado = await gerarTextoComGemini({
    modelos: MODELOS_TRIAGEM,
    systemPrompt: system,
    userPrompt: user,
    maxOutputTokens: cfg.maxOutputTokens,
    temperature: cfg.temperature,
  });

  if (!resultado.ok) {
    return respostaConversaFallback({
      estado: input.estado,
      estadoAnterior: input.estadoAnterior,
      primeiroRelato,
      avisoExtra: input.avisoExtra,
    });
  }

  const json = extrairJson(resultado.texto);
  if (!json || typeof json.resposta !== "string") {
    const texto = resultado.texto.trim().slice(0, 2000);
    if (texto) {
      return { resposta: texto, modelo: resultado.modelo };
    }
    return respostaConversaFallback({
      estado: input.estado,
      estadoAnterior: input.estadoAnterior,
      primeiroRelato,
      avisoExtra: input.avisoExtra,
    });
  }

  let resposta = json.resposta.trim();
  const pergunta =
    typeof json.perguntaProativa === "string"
      ? json.perguntaProativa.trim()
      : json.perguntaProativa === null
        ? null
        : undefined;
  if (pergunta && !resposta.includes(pergunta.slice(0, 20))) {
    resposta += `\n\n${pergunta}`;
  }

  return {
    resposta,
    patchEstado: parsePatch(json.patchEstado),
    perguntaProativa: pergunta ?? null,
    modelo: resultado.modelo,
  };
}
