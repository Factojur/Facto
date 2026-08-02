/**
 * Cliente mínimo para a Gemini API (Google AI Studio / AI Gemini).
 * Usa fetch puro (sem SDK) para não adicionar dependência nova.
 * Usado no sandbox (/admin/teste-ia) e na geração real (/api/gerar-peca).
 * Atenção: a camada gratuita pode usar prompts para treinamento — em
 * produção recomenda-se chave/plano sem retenção quando disponível.
 */

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// Flash-Lite é o modelo mais generoso da camada gratuita (maior RPD) — ver
// canvas "melhores-ias-peca-juridica" para o comparativo de limites.
//
// Usamos o alias "-latest" (em vez de fixar uma versão como "gemini-2.5-
// flash-lite") justamente para não quebrar de novo: o Google descontinua
// versões datadas periodicamente para novos usos ("no longer available to
// new users", como aconteceu em 30/07/2026 com a 2.5) — o alias é resolvido
// pelo próprio Google para a versão estável vigente. Se mesmo assim algum
// dia parar de funcionar, o MODELO_FALLBACK abaixo é tentado automaticamente.
const MODELO_PADRAO = "gemini-flash-lite-latest";
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

/**
 * Chama a Gemini API com um system prompt e um prompt de usuário, retornando
 * o texto gerado. Nunca lança exceção — erros de rede, chave ausente ou
 * resposta bloqueada viram `{ ok: false, erro }` para o chamador decidir
 * como exibir.
 */
function modeloIndisponivel(status: number, mensagem: string): boolean {
  if (status === 404) return true;
  const normalizada = mensagem.toLowerCase();
  return (
    normalizada.includes("no longer available") ||
    normalizada.includes("not found") ||
    normalizada.includes("deprecated")
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
  // Auth key (AQ.) e Standard (AIza): header nativo é o caminho mais estável.
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
    return { ok: false, erro: `Resposta bloqueada pelo filtro de segurança (${bloqueio}).` };
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

export async function gerarTextoComGemini(params: {
  systemPrompt: string;
  userPrompt: string;
  modelo?: string;
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

  const modelo = params.modelo ?? MODELO_PADRAO;
  const opts = {
    systemPrompt: params.systemPrompt,
    userPrompt: params.userPrompt,
    temperature: params.temperature,
    maxOutputTokens: params.maxOutputTokens,
    apiKey,
  };

  try {
    const resultado = await chamarGemini({ ...opts, modelo });

    // Se o modelo pedido não existe mais (descontinuado pelo Google) e ainda
    // não era o fallback, tenta uma vez com o fallback antes de desistir.
    if (
      !resultado.ok &&
      resultado.erro.startsWith("__MODELO_INDISPONIVEL__") &&
      modelo !== MODELO_FALLBACK
    ) {
      return await chamarGemini({ ...opts, modelo: MODELO_FALLBACK });
    }

    if (!resultado.ok && resultado.erro.startsWith("__MODELO_INDISPONIVEL__")) {
      return { ok: false, erro: resultado.erro.replace("__MODELO_INDISPONIVEL__:", "") };
    }

    return resultado;
  } catch (erro) {
    return {
      ok: false,
      erro: erro instanceof Error ? erro.message : "Falha de rede ao chamar a Gemini API.",
    };
  }
}
