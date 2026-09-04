/**
 * Agente só de forma: recebe a peça já redigida e aplica padrão forense
 * (espaços, romanos, encerramento) sem reescrever teses nem inventar lastro.
 */

import {
  gerarTextoComGemini,
  MODELOS_TRIAGEM,
} from "@/lib/ia/gemini-client";

const SYSTEM = [
  "Você é um diagramador forense. NÃO é advogado de mérito.",
  "Recebe uma peça JURÍDICA já completa. Sua única tarefa: formatação protocolável.",
  "PROIBIDO: mudar pedidos, fatos, teses, citações, números de processo, valores, nomes, OAB.",
  "PROIBIDO: inventar jurisprudência, artigos ou parágrafos de mérito.",
  "PROIBIDO: resumir ou enxugar o DO DIREITO.",
  "MANTENHA blocos [[JURIS]]…[[/JURIS]] e *\"latim\"* exatamente como vieram.",
  "Ajuste apenas:",
  "- endereçamento em caixa alta numa linha;",
  "- linhas em branco entre endereçamento, epígrafe, qualificação, nome da peça, tópicos;",
  "- títulos romanos (I, II, III) sozinhos na linha;",
  "- subtítulos a)/b)/c) sozinhos quando forem de direito;",
  "- encerramento: Nestes termos, / pede deferimento. / local e data / nome / OAB;",
  "- remova separadores --- ou *** decorativos.",
  "Devolva SOMENTE o texto da peça, sem comentário.",
].join("\n");

export async function formatarPecaForense(params: {
  peca: string;
  especie?: string | null;
  areaId?: string | null;
}): Promise<{ texto: string; modelo?: string; ok: boolean }> {
  const peca = params.peca.trim();
  if (peca.length < 200) {
    return { texto: params.peca, ok: false };
  }

  const userPrompt = [
    params.areaId ? `Área (catálogo): ${params.areaId}` : "",
    params.especie ? `Espécie da peça já definida: ${params.especie}` : "",
    "A peça abaixo já tem o conteúdo jurídico. Formate-a no padrão forense dessa espécie.",
    "",
    "<PECA>",
    peca.slice(0, 90_000),
    "</PECA>",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await gerarTextoComGemini({
    systemPrompt: SYSTEM,
    userPrompt,
    modelos: MODELOS_TRIAGEM,
    temperature: 0.05,
    maxOutputTokens: 8192,
  });

  if (!res.ok) {
    return { texto: params.peca, ok: false };
  }

  const texto = res.texto.replace(/```[\s\S]*?```/g, (m) =>
    m.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "")
  ).trim();

  if (texto.length < Math.min(200, peca.length * 0.5)) {
    return { texto: params.peca, ok: false };
  }

  return { texto, modelo: res.modelo, ok: true };
}
