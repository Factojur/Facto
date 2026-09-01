/**
 * Cliente mínimo Anthropic Messages API (Claude) — fetch puro, sem SDK.
 * Usado só no Redator quando o roteador FACTO autoriza Sonnet.
 *
 * Env:
 * - ANTHROPIC_API_KEY
 * - ANTHROPIC_MODELO_REDACAO (default: claude-sonnet-4-5)
 */

import { registrarUsoIa } from "@/lib/ia/log-custo-ia";

export type ResultadoAnthropic =
  | { ok: true; texto: string; modelo: string }
  | { ok: false; erro: string };

export function anthropicConfigurado(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

export function modeloAnthropicRedacao(): string {
  return (
    process.env.ANTHROPIC_MODELO_REDACAO?.trim() || "claude-sonnet-4-5"
  );
}

export async function gerarTextoComAnthropic(params: {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  modelo?: string;
}): Promise<ResultadoAnthropic> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, erro: "ANTHROPIC_API_KEY não configurada." };
  }

  const modelo = params.modelo?.trim() || modeloAnthropicRedacao();

  try {
    const resposta = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: modelo,
        max_tokens: params.maxOutputTokens ?? 8192,
        temperature: params.temperature ?? 0.35,
        system: params.systemPrompt,
        messages: [{ role: "user", content: params.userPrompt }],
      }),
    });

    const dados = (await resposta.json().catch(() => null)) as {
      error?: { message?: string };
      content?: { type?: string; text?: string }[];
      model?: string;
      usage?: { input_tokens?: number; output_tokens?: number };
    } | null;

    if (!resposta.ok) {
      return {
        ok: false,
        erro:
          dados?.error?.message ??
          `Anthropic recusou a chamada (status ${resposta.status}).`,
      };
    }

    const texto = (dados?.content ?? [])
      .filter((c) => c.type === "text" && c.text)
      .map((c) => c.text!)
      .join("")
      .trim();

    if (!texto) {
      return { ok: false, erro: "Claude não retornou texto." };
    }

    registrarUsoIa({
      provedor: "anthropic",
      modelo: dados?.model ?? modelo,
      inputTokens: dados?.usage?.input_tokens,
      outputTokens: dados?.usage?.output_tokens,
      totalTokens:
        (dados?.usage?.input_tokens ?? 0) + (dados?.usage?.output_tokens ?? 0) ||
        undefined,
      etapa: "redacao-sonnet",
    });

    return { ok: true, texto, modelo: dados?.model ?? modelo };
  } catch (erro) {
    return {
      ok: false,
      erro:
        erro instanceof Error
          ? erro.message
          : "Falha de rede ao chamar a Anthropic API.",
    };
  }
}
