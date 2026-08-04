/**
 * Cliente mínimo para a Gemini API (Google AI Studio / AI Gemini).
 * Usa fetch puro (sem SDK) — funciona com chave Standard (AIza) e Auth key (AQ.).
 * Usado no sandbox (/admin/teste-ia) e na geração real (/api/gerar-peca).
 *
 * Workflow agentic:
 * - Etapa 1 (triagem): Flash-Lite — barato e suficiente para tese/estratégia
 * - Etapa 2 (redação): 2.5 Flash como padrão (custo/qualidade)
 * Override opcional: GEMINI_MODELO_REDACAO=gemini-2.5-pro
 */

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

/** Cadeia Etapa 1 — Paralegal / triagem (rápido e barato). */
export const MODELOS_TRIAGEM = [
  "gemini-2.5-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-2.0-flash",
] as const;

/**
 * Cadeia Etapa 2 — Redator (qualidade com custo controlado).
 * Flash primeiro; Pro só se GEMINI_MODELO_REDACAO apontar para ele.
 */
export const MODELOS_REDACAO_PADRAO = [
  "gemini-2.5-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-2.0-flash",
  "gemini-3.5-flash-lite",
] as const;

export function modelosRedacao(): readonly string[] {
  const preferido = process.env.GEMINI_MODELO_REDACAO?.trim();
  if (preferido) {
    return [preferido, ...MODELOS_REDACAO_PADRAO.filter((m) => m !== preferido)];
  }
  return MODELOS_REDACAO_PADRAO;
}

/** @deprecated Preferir modelosRedacao() */
export const MODELOS_REDACAO = MODELOS_REDACAO_PADRAO;

const MODELO_PADRAO = MODELOS_TRIAGEM[0];
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
  /** Grounding com Google Search (Assistente Facto / nomenclatura). */
  usarBuscaGoogle?: boolean;
}): Promise<ResultadoGemini> {
  const corpo: Record<string, unknown> = {
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
  };

  if (params.usarBuscaGoogle) {
    // Gemini API (v1beta) — grounding com busca Google
    corpo.tools = [{ google_search: {} }];
  }

  const resposta = await fetch(
    `${GEMINI_API_URL}/${params.modelo}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": params.apiKey,
      },
      body: JSON.stringify(corpo),
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
    // Ferramenta de busca não suportada neste modelo → sinaliza retry sem busca
    if (
      params.usarBuscaGoogle &&
      /google_?search|tool|grounding|not supported|unknown name/i.test(mensagem)
    ) {
      return { ok: false, erro: `__BUSCA_INDISPONIVEL__:${mensagem}` };
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
 * (útil quando aliases estão descontinuados).
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
  /** Ativa grounding com Google Search (quando o modelo permitir). */
  usarBuscaGoogle?: boolean;
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

  let usarBusca = Boolean(params.usarBuscaGoogle);

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
      const resultado = await chamarGemini({
        ...opts,
        modelo,
        usarBuscaGoogle: usarBusca,
      });

      if (resultado.ok) return resultado;

      if (resultado.erro.startsWith("__BUSCA_INDISPONIVEL__")) {
        // Desliga busca e tenta de novo a mesma cadeia
        usarBusca = false;
        ultimoErro = resultado.erro.replace("__BUSCA_INDISPONIVEL__:", "");
        const semBusca = await chamarGemini({
          ...opts,
          modelo,
          usarBuscaGoogle: false,
        });
        if (semBusca.ok) return semBusca;
        if (semBusca.erro.startsWith("__MODELO_INDISPONIVEL__")) {
          ultimoErro = semBusca.erro.replace("__MODELO_INDISPONIVEL__:", "");
          continue;
        }
        return {
          ok: false,
          erro: semBusca.erro.replace("__MODELO_INDISPONIVEL__:", ""),
        };
      }

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
