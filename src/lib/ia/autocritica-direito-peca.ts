/**
 * O8 / Fc2 — auto-crítica Flash só do DO DIREITO (pós-Redator).
 * Peça completa; não enxuga; só corrige incoerência, citação fraca e lacuna de tese.
 * Fail-open: qualquer falha devolve a peça original.
 */

import { PERSONA_ADVOGADO_SENIOR_FACTO } from "@/lib/ia/assistente-facto-prompt";
import { gerarTextoComGemini, modelosRedacao } from "@/lib/ia/gemini-client";
import {
  blocoCoberturaTesesParaRedator,
  type ItemCoberturaTese,
} from "@/lib/ia/cobertura-teses-peca";
import {
  blocoPlanoTopicosParaRedator,
  type TopicoPlanejado,
} from "@/lib/ia/plano-topicos-peca";
import {
  normalizarParagrafosDoDireito,
  substituirSecaoDoDireito,
} from "@/lib/ia/mesclar-peca-hibrida";
import { normalizarPecaGerada } from "@/lib/ia/normalizar-peca-gerada";
import type { TeseCanonica } from "@/lib/teses-canonicas";

const RE_TITULO_DIREITO =
  /^[IVXLCDM]+\s*[-—–.]\s*(?:DO DIREITO|DO MÉRITO|DAS RAZÕES DE REFORMA|DO REFORÇO DA INICIAL)/im;

const RE_FIM_DIREITO =
  /\n[IVXLCDM]+\s*[-—–.]\s*(?:DO VALOR|DA TUTELA|DAS PROVAS|DOS PEDIDOS|DAS MEDIDAS|DO DÉBITO|DA TEMPESTIVIDADE)/i;

/** Extrai a seção DO DIREITO da peça (título + corpo até o próximo romano). */
export function extrairSecaoDoDireitoDaPeca(peca: string): string | null {
  const t = peca.replace(/\r\n/g, "\n");
  const m = t.match(RE_TITULO_DIREITO);
  if (!m || m.index == null) return null;
  const cortado = t.slice(m.index);
  const fim = cortado.search(RE_FIM_DIREITO);
  const bloco = (fim > 0 ? cortado.slice(0, fim) : cortado).trim();
  return bloco.length >= 80 ? bloco : null;
}

function limparRespostaDireito(texto: string): string {
  let t = normalizarPecaGerada(texto).trim();
  t = t.replace(/<[^>]+>[\s\S]*?<\/[^>]+>/g, "").trim();
  const idx = t.search(RE_TITULO_DIREITO);
  if (idx >= 0) {
    const cortado = t.slice(idx);
    const fim = cortado.search(RE_FIM_DIREITO);
    return (fim > 0 ? cortado.slice(0, fim) : cortado).trim();
  }
  return t;
}

export type ResultadoAutocriticaDireito =
  | { ok: true; peca: string; modelo: string; aplicada: true }
  | { ok: true; peca: string; modelo?: string; aplicada: false; motivo: string }
  | { ok: false; peca: string; erro: string };

/**
 * 1 pass Flash sobre DO DIREITO. Não cria skin; não altera fatos/pedidos.
 */
export async function autocriticarSecaoDoDireito(params: {
  peca: string;
  topicos: TopicoPlanejado[];
  cobertura: ItemCoberturaTese[];
  teses: TeseCanonica[];
  estrategiaJuridica?: string;
  contextoLastro?: string;
}): Promise<ResultadoAutocriticaDireito> {
  const secaoAtual = extrairSecaoDoDireitoDaPeca(params.peca);
  if (!secaoAtual) {
    return {
      ok: true,
      peca: params.peca,
      aplicada: false,
      motivo: "Sem seção DO DIREITO detectável.",
    };
  }

  const cobertura = blocoCoberturaTesesParaRedator(
    params.cobertura,
    params.teses
  );
  const plano = blocoPlanoTopicosParaRedator(params.topicos);

  const systemPrompt = [
    PERSONA_ADVOGADO_SENIOR_FACTO,
    "TAREFA: auto-crítica interna do DO DIREITO já redigido.",
    "Devolva APENAS o bloco DO DIREITO revisado (título romano + subtítulos).",
    "PROIBIDO enxugar, resumir ou omitir tese/argumento útil.",
    "A peça deve permanecer COMPLETA — só corrija:",
    "1) incoerência lógica ou com os fatos/plano;",
    "2) citação fraca, incompleta ou sem lastro aparente;",
    "3) lacuna de tese/pedido listado em COBERTURA que o bloco não cobre.",
    "Não invente número de processo nem ementa falsa.",
    "Não reescreva DOS FATOS, pedidos nem fechamento.",
  ].join("\n");

  const userPrompt = [
    plano,
    cobertura ? `\n${cobertura}` : "",
    params.estrategiaJuridica?.trim()
      ? `\n<ESTRATEGIA>\n${params.estrategiaJuridica.slice(0, 6_000)}\n</ESTRATEGIA>`
      : "",
    params.contextoLastro?.trim()
      ? `\n<LASTRO>\n${params.contextoLastro.slice(0, 10_000)}\n</LASTRO>`
      : "",
    "",
    "<DO_DIREITO_ATUAL>",
    secaoAtual.slice(0, 14_000),
    "</DO_DIREITO_ATUAL>",
    "",
    "Revise o bloco acima (completo, sem enxugar) e devolva só o DO DIREITO corrigido.",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await gerarTextoComGemini({
    systemPrompt,
    userPrompt,
    modelos: modelosRedacao(),
    temperature: 0.2,
    maxOutputTokens: 6144,
  });

  if (!res.ok) {
    return { ok: false, peca: params.peca, erro: res.erro };
  }

  const blocoNovo = limparRespostaDireito(res.texto);
  if (blocoNovo.length < 120) {
    return {
      ok: true,
      peca: params.peca,
      aplicada: false,
      motivo: "Resposta da auto-crítica insuficiente.",
      modelo: res.modelo,
    };
  }

  // Não aceitar enxugamento agressivo (proteção de margem/qualidade).
  if (blocoNovo.length < secaoAtual.length * 0.72) {
    return {
      ok: true,
      peca: params.peca,
      aplicada: false,
      motivo: "Auto-crítica enxugou demais — mantida versão do Redator.",
      modelo: res.modelo,
    };
  }

  let peca = substituirSecaoDoDireito(params.peca, blocoNovo);
  peca = normalizarParagrafosDoDireito(peca);
  return { ok: true, peca, modelo: res.modelo, aplicada: true };
}
