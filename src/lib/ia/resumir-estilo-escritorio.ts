/**
 * Gera resumo de estilo a partir de amostras de peças (não copia conteúdo).
 */

import { geminiConfigurado, gerarTextoComGemini } from "@/lib/ia/gemini-client";

const MAX_RESUMO_CHARS = 3200;

export async function resumirEstiloEscritorio(
  textosAmostra: string[]
): Promise<{ ok: true; resumo: string } | { ok: false; erro: string }> {
  if (!geminiConfigurado()) {
    return { ok: false, erro: "Serviço de IA indisponível no momento." };
  }

  const concatenado = textosAmostra
    .map((t, i) => `--- AMOSTRA ${i + 1} ---\n${t.trim()}`)
    .join("\n\n")
    .slice(0, 120_000);

  if (concatenado.length < 800) {
    return {
      ok: false,
      erro: "Texto insuficiente nas amostras — envie peças com pelo menos ~2 páginas cada.",
    };
  }

  const res = await gerarTextoComGemini({
    systemPrompt: `Você analisa peças jurídicas brasileiras para extrair ESTILO DE REDAÇÃO do advogado.
NÃO reproduza fatos, nomes, valores, números de processo nem trechos longos das peças.
NÃO copie parágrafos — apenas descreva padrões observáveis.

Devolva um único bloco em português (máx. ~450 palavras) cobrindo:
- Tom (formal, combativo, técnico, conciso…)
- Tratamento ao juízo (Excelentíssimo, Vossa Excelência, variações)
- Extensão média de frases e parágrafos
- Como costuma estruturar pedidos (numerados, bloco único, subtópicos)
- Densidade de citação de lei vs. narrativa
- Uso de conectivos forenses característicos
- Fecho e assinatura (padrões, sem dados pessoais)
- Diferenças perceptíveis entre peças de ataque e defesa, se houver

O resumo será injetado no prompt de geração de NOVAS peças — deve orientar tom, não conteúdo.`,
    userPrompt: concatenado,
    modelos: ["gemini-flash-lite-latest", "gemini-2.5-flash"],
    temperature: 0.2,
    maxOutputTokens: 1200,
  });

  if (!res.ok) {
    return { ok: false, erro: res.erro };
  }

  const resumo = res.texto.trim().slice(0, MAX_RESUMO_CHARS);
  if (resumo.length < 120) {
    return { ok: false, erro: "Não foi possível extrair um perfil de estilo das amostras." };
  }

  return { ok: true, resumo };
}
