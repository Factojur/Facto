/**
 * Anti-contaminação no chat — relatos mistos (JEC + Penal) e troca de área.
 */

import type { EstadoCasoChat, InferenciaAreaChat } from "@/lib/chat-minuta";
import type { AreaIdMinuta } from "@/lib/minuta-modulo";
import {
  confirmarAreaChat,
  estadoCasoChatVazio,
} from "@/lib/chat-minuta";

const GRUPOS_SINAL: { id: string; re: RegExp }[] = [
  {
    id: "consumidor",
    re: /\b(enel|sabesp|energia\s+el[eé]trica|fornecimento\s+de\s+energia|concession[aá]ria|corte\s+indevido|cdc\b|fornecedor|consumidor)\b/i,
  },
  {
    id: "criminal",
    re: /\b(habeas\s+corpus|flagrante|pris[aã]o\s+preventiva|furto\s+simples|art\.?\s*155|cpp\b|acusad[oa]|denúncia\s+criminal)\b/i,
  },
  {
    id: "previdenciario",
    re: /\b(inss|bpc|loas|previd|benef[ií]cio|aposentadoria|der\b)\b/i,
  },
];

/** Grupos só para reset por troca de rito real — civil ≠ consumidor. */
const GRUPO_POR_AREA: Record<AreaIdMinuta, string> = {
  jec: "jec",
  consumidor: "consumidor",
  civil: "civil",
  familia: "familia",
  trabalhista: "trabalhista",
  imobiliario: "imobiliario",
  previdenciario: "previdenciario",
  tributario: "tributario",
  administrativo: "administrativo",
  digital: "digital",
  empresarial: "empresarial",
  ambiental: "ambiental",
  "propriedade-intelectual": "pi",
  medico: "medico",
  internacional: "internacional",
  agrario: "agrario",
  criminal: "criminal",
  constitucional: "constitucional",
  jecr: "jecr",
  eleitoral: "eleitoral",
};

function gruposNoTexto(texto: string): string[] {
  return GRUPOS_SINAL.filter((g) => g.re.test(texto)).map((g) => g.id);
}

export function detectarRelatoMistoAreas(texto: string): {
  misto: boolean;
  grupos: string[];
  mensagem: string | null;
} {
  const grupos = gruposNoTexto(texto);
  const misto =
    (grupos.includes("consumidor") && grupos.includes("criminal")) ||
    (grupos.includes("previdenciario") && grupos.includes("criminal"));
  return {
    misto,
    grupos,
    mensagem: misto
      ? "O relato mistura temas de áreas diferentes (ex.: consumidor/energia e penal). Use **Novo caso** para cada peça — assim partes e qualificação não se contaminam."
      : null,
  };
}

export function deveResetarPorTrocaArea(
  estado: EstadoCasoChat,
  inferencia: InferenciaAreaChat,
  areaManual: boolean
): boolean {
  if (areaManual) return false;
  if (!estado.fatos.trim() || estado.fatos.trim().length < 40) return false;
  if (inferencia.confianca !== "alta") return false;
  const grupoAtual = GRUPO_POR_AREA[estado.areaId] ?? estado.areaId;
  const grupoNovo = GRUPO_POR_AREA[inferencia.areaId] ?? inferencia.areaId;
  return grupoAtual !== grupoNovo && estado.areaId !== inferencia.areaId;
}

/** Reinicia partes/qualificação quando o turno indica outro rito (ex.: JEC → Penal). */
export function prepararEstadoTrocaArea(
  inferencia: InferenciaAreaChat,
  relatoTurno: string
): EstadoCasoChat {
  const base = estadoCasoChatVazio(inferencia.areaId);
  return confirmarAreaChat(
    {
      ...base,
      fatos: relatoTurno.trim(),
      areaInferida: inferencia,
    },
    inferencia.areaId
  );
}

export function mensagemTrocaArea(
  areaAnterior: AreaIdMinuta,
  areaNova: AreaIdMinuta,
  rotulo: (id: AreaIdMinuta) => string
): string {
  return `Detectei um **novo tipo de caso** (${rotulo(areaNova)}) — diferente do anterior (${rotulo(areaAnterior)}). Reiniciei partes e qualificação deste turno. Se for outro cliente, use **Novo caso** para manter histórico separado.`;
}
