/**
 * Checklist de conferência da minuta (0 tokens).
 * Combina auditor local + lacunas visíveis no texto — não substitui revisão humana.
 */

import { auditarPecaGerada } from "@/lib/ia/auditor-peca";

export type ItemConferenciaPeca = {
  id: string;
  gravidade: "bloqueante" | "alerta" | "info";
  texto: string;
};

const RE_PLACEHOLDER =
  /\[NOME[^\]]*\]|\[qualifica[^\]]*\]|_{3,}|\[endere[cç]o[^\]]*\]|\[UF\]/i;
const RE_FLS = /\bfls?\.?\s*\d/i;
const RE_PROCESSO =
  /\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b|processo\s*n[ºo°]/i;
const RE_FECHAMENTO =
  /Nestes termos|Termos em que|pede deferimento|Pede e espera deferimento/i;

export function conferirPecaAntesDeProtocolar(params: {
  peca: string;
  areaId?: string;
  especie?: string | null;
  fatos?: string | null;
  numeroProcesso?: string | null;
  pedirJusticaGratuita?: boolean;
  /** Scaffold ainda não redigido — ignora “peça curta”. */
  modoScaffold?: boolean;
}): ItemConferenciaPeca[] {
  const peca = params.peca ?? "";
  const itens: ItemConferenciaPeca[] = [];

  if (RE_PLACEHOLDER.test(peca)) {
    itens.push({
      id: "placeholder",
      gravidade: "alerta",
      texto:
        "Ainda há placeholders ([NOME…], lacunas ___). Complete partes e endereçamento antes de protocolar.",
    });
  }

  if (
    !params.modoScaffold &&
    peca.length > 800 &&
    /DOS PEDIDOS|Ante o exposto|Diante do exposto/i.test(peca) &&
    !RE_FECHAMENTO.test(peca)
  ) {
    itens.push({
      id: "fechamento-ausente",
      gravidade: "alerta",
      texto:
        "Falta o fechamento forense (Nestes termos / pede deferimento). Confira o final da peça.",
    });
  }

  if (!params.modoScaffold && peca.length > 800 && !RE_FLS.test(peca)) {
    itens.push({
      id: "sem-fls",
      gravidade: "info",
      texto:
        "Não há remissão a folhas (fls.) no corpo. Confira se os autos anexados foram citados.",
    });
  }

  const nProc = params.numeroProcesso?.trim();
  if (!params.modoScaffold && nProc && !peca.includes(nProc) && !RE_PROCESSO.test(peca)) {
    itens.push({
      id: "processo-ausente",
      gravidade: "alerta",
      texto: `O número ${nProc} não aparece na peça. Confira a epígrafe.`,
    });
  }

  if (params.pedirJusticaGratuita && !/justi[cç]a gratuita|gratuidade/i.test(peca)) {
    itens.push({
      id: "jg-ausente",
      gravidade: "alerta",
      texto: "Justiça gratuita foi marcada, mas o pedido não aparece no texto.",
    });
  }

  const auditoria = auditarPecaGerada({
    peca,
    areaId: params.areaId,
    especie: params.especie,
    fatos: params.fatos,
    numeroProcesso: params.numeroProcesso,
    pedirJusticaGratuita: params.pedirJusticaGratuita,
  });

  for (const a of auditoria.achados) {
    if (params.modoScaffold && a.id === "peca-curta") continue;
    if (itens.some((i) => i.id === a.id)) continue;
    itens.push({
      id: a.id,
      gravidade: a.gravidade,
      texto: `${a.titulo}: ${a.detalhe}`,
    });
  }

  return itens.slice(0, 10);
}
