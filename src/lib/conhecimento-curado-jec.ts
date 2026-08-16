/**
 * Complemento do RAG (súmulas). Lei não entra no retrieve.
 */

import type { TrechoConhecimento } from "@/lib/base-conhecimento";

export const CONHECIMENTO_CURADO_JEC: TrechoConhecimento[] = [
  {
    titulo: "Súmula 297 do STJ",
    categoria: "Súmula",
    texto:
      "Súmula 297/STJ: O Código de Defesa do Consumidor é aplicável às instituições financeiras.",
  },
  {
    titulo: "Súmula 479 do STJ",
    categoria: "Súmula",
    texto:
      "Súmula 479/STJ: As instituições financeiras respondem objetivamente pelos danos gerados por fortuito interno relativo a fraudes e delitos praticados por terceiros no âmbito de operações bancárias.",
  },
  {
    titulo: "Súmula 54 do STJ",
    categoria: "Súmula",
    texto:
      "Súmula 54/STJ: Os juros moratórios fluem a partir do evento danoso, em caso de responsabilidade extracontratual.",
  },
  {
    titulo: "Súmula 37 do STJ",
    categoria: "Súmula",
    texto:
      "Súmula 37/STJ: São cumuláveis as indenizações por dano material e dano moral oriundos do mesmo fato.",
  },
  {
    titulo: "Súmula 227 do STJ",
    categoria: "Súmula",
    texto:
      "Súmula 227/STJ: A pessoa jurídica pode sofrer dano moral.",
  },
  {
    titulo: "Súmula 326 do STJ",
    categoria: "Súmula",
    texto:
      "Súmula 326/STJ: Na ação de indenização por dano moral, a condenação em montante inferior ao postulado na inicial não implica sucumbência recíproca.",
  },
];
