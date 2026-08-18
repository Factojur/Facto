/**
 * Cliente mínimo para a Gemini API (Google AI Studio / AI Gemini).
 * Usa fetch puro (sem SDK) — funciona com chave Standard (AIza) e Auth key (AQ.).
 * Usado no sandbox (/admin/teste-ia) e na geração real (/api/gerar-peca).
 *
 * Workflow agentic:
 * - Etapa 1 (triagem): Flash-Lite — barato e suficiente para tese/estratégia
 * - Etapa 2 (redação): Flash como padrão (custo/qualidade)
 * Override opcional: GEMINI_MODELO_REDACAO=gemini-2.5-pro
 *
 * Sobre carga (503 / "high demand"): tenta o próximo modelo da cadeia
 * com pequeno backoff — não aborta na primeira falha transitória.
 */

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

/** Cadeia Etapa 1 — Paralegal / triagem (rápido e barato). */
export const MODELOS_TRIAGEM = [
  "gemini-flash-lite-latest",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-flash-latest",
] as const;

/**
 * Cadeia Etapa 2 — Redator (qualidade com custo controlado).
 * Flash primeiro; Lite como escape de sobrecarga; Pro só via env.
 * Evitar gemini-2.5-flash-lite: a API recusa contas novas (“no longer available”).
 */
export const MODELOS_REDACAO_PADRAO = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-2.0-flash",
  "gemini-flash-lite-latest",
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
const MODELO_FALLBACK = "gemini-flash-lite-latest";

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

/** 503 / sobrecarga / spike — vale tentar outro modelo ou retry. */
function modeloSobrecarregado(status: number, mensagem: string): boolean {
  if (status === 503 || status === 429) return true;
  const n = mensagem.toLowerCase();
  return (
    n.includes("high demand") ||
    n.includes("overloaded") ||
    n.includes("unavailable") ||
    n.includes("try again later") ||
    n.includes("resource_exhausted") ||
    n.includes("resource exhausted") ||
    n.includes("temporarily") ||
    n.includes("rate limit") ||
    n.includes("quota exceeded") ||
    n.includes("too many requests")
  );
}

/** Auth / chave inválida — não adianta trocar de modelo. */
function erroAutenticacao(status: number, mensagem: string): boolean {
  if (status === 401 || status === 403) return true;
  const n = mensagem.toLowerCase();
  return (
    n.includes("api key not valid") ||
    n.includes("invalid api key") ||
    n.includes("permission denied") ||
    n.includes("consumer_invalid")
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type AnexoGemini = {
  mimeType: string;
  dataBase64: string;
};

async function chamarGemini(params: {
  systemPrompt: string;
  userPrompt: string;
  modelo: string;
  apiKey: string;
  temperature?: number;
  maxOutputTokens?: number;
  /** Grounding com Google Search — não usar na minuta. */
  usarBuscaGoogle?: boolean;
  anexos?: AnexoGemini[];
}): Promise<ResultadoGemini> {
  const userParts: Record<string, unknown>[] = [];
  for (const anexo of params.anexos ?? []) {
    const data = anexo.dataBase64.replace(/^data:[^;]+;base64,/, "");
    if (!data) continue;
    userParts.push({
      inline_data: { mime_type: anexo.mimeType, data },
    });
  }
  userParts.push({ text: params.userPrompt });

  const corpo: Record<string, unknown> = {
    systemInstruction: {
      parts: [{ text: params.systemPrompt }],
    },
    contents: [
      {
        role: "user",
        parts: userParts,
      },
    ],
    generationConfig: {
      temperature: params.temperature ?? 0.4,
      maxOutputTokens: params.maxOutputTokens ?? 8192,
    },
  };

  if (params.usarBuscaGoogle) {
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

    if (erroAutenticacao(resposta.status, mensagem)) {
      return { ok: false, erro: `__AUTH__:${mensagem}` };
    }
    if (modeloIndisponivel(resposta.status, mensagem)) {
      return { ok: false, erro: `__MODELO_INDISPONIVEL__:${mensagem}` };
    }
    if (modeloSobrecarregado(resposta.status, mensagem)) {
      return { ok: false, erro: `__SOBRECARGA__:${mensagem}` };
    }
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
    // Às vezes a API devolve 200 sem texto sob pressão — trata como transitório
    const finish = String(candidato?.finishReason ?? "");
    if (/OTHER|UNEXPECTED|RECITATION/i.test(finish) || !candidato) {
      return {
        ok: false,
        erro: `__SOBRECARGA__:Resposta vazia (${finish || "sem candidato"}).`,
      };
    }
    return { ok: false, erro: "A IA não retornou nenhum texto." };
  }

  return { ok: true, texto, modelo: params.modelo };
}

function limparPrefixoErro(erro: string): string {
  return erro
    .replace(/^__AUTH__:/, "")
    .replace(/^__MODELO_INDISPONIVEL__:/, "")
    .replace(/^__SOBRECARGA__:/, "")
    .replace(/^__BUSCA_INDISPONIVEL__:/, "");
}

/**
 * Chama a Gemini API com system + user prompt.
 * Se `modelos` for passado, tenta cada um em ordem até um responder.
 * Sobrecarga / 503 / high demand → próximo modelo (+ 1 retry curto).
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
  anexos?: AnexoGemini[];
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
    anexos: params.anexos,
  };

  try {
    let ultimoErro = "Nenhum modelo Gemini respondeu.";
    const errosPorModelo: string[] = [];

    for (let i = 0; i < cadeia.length; i++) {
      const modelo = cadeia[i]!;
      const tentativas = /lite/i.test(modelo) ? 2 : 3;

      for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
        const resultado = await chamarGemini({
          ...opts,
          modelo,
          usarBuscaGoogle: usarBusca,
        });

        if (resultado.ok) return resultado;

        if (resultado.erro.startsWith("__AUTH__")) {
          return {
            ok: false,
            erro:
              limparPrefixoErro(resultado.erro) +
              " Verifique a GEMINI_API_KEY.",
          };
        }

        if (resultado.erro.startsWith("__BUSCA_INDISPONIVEL__")) {
          usarBusca = false;
          ultimoErro = limparPrefixoErro(resultado.erro);
          const semBusca = await chamarGemini({
            ...opts,
            modelo,
            usarBuscaGoogle: false,
          });
          if (semBusca.ok) return semBusca;
          if (semBusca.erro.startsWith("__SOBRECARGA__")) {
            errosPorModelo.push(`${modelo}: sobrecarga`);
            ultimoErro = limparPrefixoErro(semBusca.erro);
            if (tentativa < tentativas) {
              await sleep(800 * tentativa);
              continue;
            }
            break; // próximo modelo
          }
          if (semBusca.erro.startsWith("__MODELO_INDISPONIVEL__")) {
            ultimoErro = limparPrefixoErro(semBusca.erro);
            break;
          }
          return { ok: false, erro: limparPrefixoErro(semBusca.erro) };
        }

        if (resultado.erro.startsWith("__MODELO_INDISPONIVEL__")) {
          ultimoErro = limparPrefixoErro(resultado.erro);
          errosPorModelo.push(`${modelo}: indisponível`);
          break; // próximo modelo
        }

        if (resultado.erro.startsWith("__SOBRECARGA__")) {
          ultimoErro = limparPrefixoErro(resultado.erro);
          errosPorModelo.push(`${modelo}: alta demanda`);
          if (tentativa < tentativas) {
            await sleep(700 * tentativa + Math.floor(Math.random() * 400));
            continue;
          }
          break; // próximo modelo da cadeia
        }

        // Erro duro (safety etc.)
        return { ok: false, erro: limparPrefixoErro(resultado.erro) };
      }

      // Pequena pausa antes do próximo modelo sob pressão
      if (i < cadeia.length - 1) {
        await sleep(350);
      }
    }

    const detalhe =
      errosPorModelo.length > 0
        ? ` Tentativas: ${errosPorModelo.join("; ")}.`
        : "";
    return {
      ok: false,
      erro:
        `Todos os modelos Gemini estão temporariamente sobrecarregados. ` +
        `Aguarde ~1 minuto e tente novamente.${detalhe} ` +
        `(último: ${ultimoErro})`,
    };
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
