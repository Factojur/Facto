/**
 * Regeneração focada em DO DIREITO — preserva fatos, pedidos e envelope.
 */

import {
  montarContextoConhecimento,
  type TrechoConhecimento,
} from "@/lib/base-conhecimento";
import { PERSONA_ADVOGADO_SENIOR_FACTO } from "@/lib/ia/assistente-facto-prompt";
import { gerarTextoComGemini, modelosRedacao } from "@/lib/ia/gemini-client";
import {
  blocoPlanoTopicosParaRedator,
  type TopicoPlanejado,
} from "@/lib/ia/plano-topicos-peca";
import { blocoCoberturaTesesParaRedator } from "@/lib/ia/cobertura-teses-peca";
import type { ItemCoberturaTese } from "@/lib/ia/cobertura-teses-peca";
import type { TeseCanonica } from "@/lib/teses-canonicas";
import { blocoEstruturaDaArea } from "@/lib/peca-especie-area";
import { normalizarPecaGerada } from "@/lib/ia/normalizar-peca-gerada";
import {
  substituirSecaoDoDireito,
  normalizarParagrafosDoDireito,
} from "@/lib/ia/mesclar-peca-hibrida";

export type ResultadoRegenerarDireito =
  | { ok: true; peca: string; modelo: string }
  | { ok: false; erro: string };

function montarSystemPromptDireito(): string {
  return [
    PERSONA_ADVOGADO_SENIOR_FACTO,
    "TAREFA ÚNICA: redigir SOMENTE a seção DO DIREITO (ou DO MÉRITO — DOS FATOS E DO DIREITO) da peça.",
    "",
    "Regras:",
    "- Devolva APENAS o tópico romano de direito e seus subtópicos a)/b)/c).",
    "- Não repita endereçamento, qualificação, DOS FATOS, pedidos nem assinatura.",
    "- Parágrafos justificados, 2–3 períodos cada; subtítulos em linha própria.",
    "- Cite leis, súmulas e jurisprudência com lastro; sem inventar número de processo.",
    "- Use os títulos do PLANO DE TÓPICOS quando fornecidos.",
    "- Cubra integralmente as teses e pedidos indicados em COBERTURA_OBRIGATORIA.",
  ].join("\n");
}

function montarUserPromptDireito(params: {
  pecaAtual: string;
  estrategiaJuridica: string;
  topicos: TopicoPlanejado[];
  cobertura: ItemCoberturaTese[];
  teses: TeseCanonica[];
  contextoRedacao: string;
  areaId: string;
  especie: string;
  fatos: string;
}): string {
  const estrutura = blocoEstruturaDaArea(params.areaId, params.especie);
  const plano = blocoPlanoTopicosParaRedator(params.topicos, estrutura);
  const cobertura = blocoCoberturaTesesParaRedator(params.cobertura, params.teses);

  return [
    "<CONTEXTO_JURIDICO>",
    params.contextoRedacao.slice(0, 24_000),
    "</CONTEXTO_JURIDICO>",
    "",
    plano,
    cobertura ? `\n${cobertura}` : "",
    "",
    "<ESTRATEGIA_JURIDICA>",
    params.estrategiaJuridica.slice(0, 12_000),
    "</ESTRATEGIA_JURIDICA>",
    "",
    "Peça atual (referência — NÃO copie DOS FATOS nem PEDIDOS; só alinhe o direito):",
    params.pecaAtual.slice(0, 8_000),
    "",
    "Relato resumido:",
    params.fatos.slice(0, 4_000),
    "",
    "Redija agora SOMENTE o bloco DO DIREITO completo, começando pelo título romano (ex.: II - DO DIREITO).",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Extrai só o bloco DO DIREITO da resposta (remove vazamentos). */
function extrairBlocoDireito(texto: string): string {
  let t = normalizarPecaGerada(texto).trim();
  t = t.replace(/<ESTRATEGIA_JURIDICA>[\s\S]*?<\/ESTRATEGIA_JURIDICA>/gi, "").trim();

  const match = t.match(
    /^([IVXLCDM]+\s*[-—–.]\s*(?:DO DIREITO|DO MÉRITO)[\s\S]*)$/i
  );
  if (match) return match[1]!.trim();

  const idx = t.search(
    /^[IVXLCDM]+\s*[-—–.]\s*(?:DO DIREITO|DO MÉRITO)/im
  );
  if (idx >= 0) {
    const cortado = t.slice(idx);
    const fim = cortado.search(
      /\n[IVXLCDM]+\s*[-—–.]\s*(?:DO VALOR|DAS PROVAS|DOS PEDIDOS|DA TUTELA)/i
    );
    return (fim > 0 ? cortado.slice(0, fim) : cortado).trim();
  }

  return t;
}

export async function regenerarSecaoDoDireito(params: {
  pecaAtual: string;
  estrategiaJuridica: string;
  topicos: TopicoPlanejado[];
  cobertura: ItemCoberturaTese[];
  teses: TeseCanonica[];
  itensConhecimento: TrechoConhecimento[];
  areaId: string;
  especie: string;
  fatos: string;
}): Promise<ResultadoRegenerarDireito> {
  const contextoRedacao = montarContextoConhecimento(params.itensConhecimento);
  const userPrompt = montarUserPromptDireito({
    pecaAtual: params.pecaAtual,
    estrategiaJuridica: params.estrategiaJuridica,
    topicos: params.topicos,
    cobertura: params.cobertura,
    teses: params.teses,
    contextoRedacao,
    areaId: params.areaId,
    especie: params.especie,
    fatos: params.fatos,
  });

  const res = await gerarTextoComGemini({
    systemPrompt: montarSystemPromptDireito(),
    userPrompt,
    modelos: modelosRedacao(),
    temperature: 0.3,
    maxOutputTokens: 6144,
  });

  if (!res.ok) {
    return { ok: false, erro: res.erro };
  }

  const blocoDireito = extrairBlocoDireito(res.texto);
  if (blocoDireito.length < 120) {
    return { ok: false, erro: "A regeneração do direito retornou texto insuficiente." };
  }

  let peca = substituirSecaoDoDireito(params.pecaAtual, blocoDireito);
  peca = normalizarParagrafosDoDireito(peca);

  return { ok: true, peca, modelo: res.modelo };
}
