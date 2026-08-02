/**
 * Cliente mínimo para a Gemini API (Google AI Studio / AI Gemini).
 * Usa fetch puro (sem SDK) — funciona com chave Standard (AIza) e Auth key (AQ.).
 * Usado no sandbox (/admin/teste-ia) e na geração real (/api/gerar-peca).
 *
 * Workflow agentic: Etapa 1 (triagem) usa modelos Flash; Etapa 2 (redação)
 * tenta Pro e cai para Flash de maior qualidade se o Pro estiver
 * descontinuado ou fora do free tier.
 */

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

/** Cadeia Etapa 1 — Paralegal / triagem (rápido e barato). */
export const MODELOS_TRIAGEM = [
  "gemini-1.5-flash",
  "gemini-flash-lite-latest",
  "gemini-3.5-flash-lite",
] as const;

/**
 * Cadeia Etapa 2 — Redator sênior (qualidade).
 * 1.5-pro costuma estar descontinuado / fora do free tier; por isso
 * seguimos com Flash “cheio” e, por fim, Lite.
 */
export const MODELOS_REDACAO = [
  "gemini-1.5-pro",
  "gemini-2.0-flash",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-3.5-flash-lite",
] as const;

const MODELO_PADRAO = MODELOS_TRIAGEM[1];
const MODELO_FALLBACK = "gemini-3.5-flash-lite";

export type ResultadoGeminiSucesso = {
  ok: true;
  texto: string;
  modelo: string;
};

export type ResultadoGeminiErro = {
  ok: false;
  erro: string;
};

export type ResultadoGemini = ResultadoGeminiSucesso | ResultadoGeminiErro;

export function geminiConfigurado(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

function modeloIndisponivel(status: number, mensagem: string): boolean {
  if (status === 404) return true;
  const normalizada = mensagem.toLowerCase();
  return (
    normalizada.includes("no longer available") ||
    normalizada.includes("not found") ||
    normalizada.includes("deprecated") ||
    normalizada.includes("is not supported") ||
    normalizada.includes("not supported for")
  );
}

async function chamarGemini(params: {
  systemPrompt: string;
  userPrompt: string;
  modelo: string;
  apiKey: string;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<ResultadoGemini> {
  const resposta = await fetch(
    `${GEMINI_API_URL}/${params.modelo}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": params.apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: params.systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: params.userPrompt }],
          },
        ],
        generationConfig: {
          temperature: params.temperature ?? 0.4,
          maxOutputTokens: params.maxOutputTokens ?? 8192,
        },
      }),
    }
  );

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const mensagem =
      dados?.error?.message ??
      `A Gemini API recusou a chamada (status ${resposta.status}).`;
    if (modeloIndisponivel(resposta.status, mensagem)) {
      return { ok: false, erro: `__MODELO_INDISPONIVEL__:${mensagem}` };
    }
    return { ok: false, erro: mensagem };
  }

  const candidato = dados?.candidates?.[0];
  const bloqueio = dados?.promptFeedback?.blockReason;

  if (bloqueio) {
    return {
      ok: false,
      erro: `Resposta bloqueada pelo filtro de segurança (${bloqueio}).`,
    };
  }

  const texto = candidato?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("")
    .trim();

  if (!texto) {
    return { ok: false, erro: "A IA não retornou nenhum texto." };
  }

  return { ok: true, texto, modelo: params.modelo };
}

/**
 * Chama a Gemini API com system + user prompt.
 * Se `modelos` for passado, tenta cada um em ordem até um responder
 * (útil quando aliases 1.5 estão descontinuados).
 */
export async function gerarTextoComGemini(params: {
  systemPrompt: string;
  userPrompt: string;
  /** Modelo único (legado). Preferir `modelos` no workflow agentic. */
  modelo?: string;
  /** Cadeia de modelos a tentar em ordem. */
  modelos?: readonly string[];
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<ResultadoGemini> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      erro: "GEMINI_API_KEY não configurada no .env.local.",
    };
  }

  const cadeia =
    params.modelos && params.modelos.length > 0
      ? [...params.modelos]
      : [params.modelo ?? MODELO_PADRAO, MODELO_FALLBACK].filter(
          (m, i, arr) => arr.indexOf(m) === i
        );

  const opts = {
    systemPrompt: params.systemPrompt,
    userPrompt: params.userPrompt,
    temperature: params.temperature,
    maxOutputTokens: params.maxOutputTokens,
    apiKey,
  };

  try {
    let ultimoErro = "Nenhum modelo Gemini respondeu.";

    for (const modelo of cadeia) {
      const resultado = await chamarGemini({ ...opts, modelo });

      if (resultado.ok) return resultado;

      if (resultado.erro.startsWith("__MODELO_INDISPONIVEL__")) {
        ultimoErro = resultado.erro.replace("__MODELO_INDISPONIVEL__:", "");
        continue;
      }

      // Erro “duro” (quota, auth, safety): não insiste na cadeia.
      return {
        ok: false,
        erro: resultado.erro.replace("__MODELO_INDISPONIVEL__:", ""),
      };
    }

    return { ok: false, erro: ultimoErro };
  } catch (erro) {
    return {
      ok: false,
      erro:
        erro instanceof Error
          ? erro.message
          : "Falha de rede ao chamar a Gemini API.",
    };
  }
}
