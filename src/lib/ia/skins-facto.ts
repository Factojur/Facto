/**
 * Trabalho real de cada skin visível — sem chamada extra ao Gemini.
 * Maestro, Pesquisa e o reforço do Estrategista são determinísticos.
 * Qualidade: cada skin entrega detalhe útil e injeta protocolo cirúrgico no Redator.
 */

import { tituloPecaDaArea, canonizarEspecieDaArea } from "@/lib/peca-especie-area";
import { prefixoAntesDoNomePeca } from "@/lib/partes-ja-qualificadas";
import type { TeseCanonica } from "@/lib/teses-canonicas";
import type { EtapaEquipeFacto } from "@/lib/ia/agentes-facto";
import type { PoloAdvocacia } from "@/lib/polo-advocacia";
import {
  extrairUltimoAtoDoTexto,
  incidenteExecucaoJaAberto,
} from "@/lib/peca-cabivel-autos";

export type VinculosPecaFacto = {
  especie: string;
  tituloPeca: string;
  /** Sempre null — remédio local desligado; Auditor pode alertar à parte. */
  cabivel: string | null;
  cabivelTitulo: string | null;
  incidenteAberto: boolean;
  prefixoNome: string;
};

/**
 * Espécie = só a informada (IA / chips / advogado), canonizada ao rito da área.
 * Sem heurística de último ato.
 */
export function resolverVinculosPeca(params: {
  areaId: string;
  especie: string;
  tipoAcao?: string | null;
  fatos?: string | null;
  /** @deprecated Ignorado. */
  confiarEspecie?: boolean;
}): VinculosPecaFacto {
  const raw = String(params.especie ?? "").trim();
  const especie = raw
    ? canonizarEspecieDaArea(params.areaId, raw)
    : "";
  const titulo =
    (especie
      ? tituloPecaDaArea(params.areaId, especie, params.tipoAcao)
      : "") ||
    params.tipoAcao?.trim() ||
    "Peça";
  const blob = `${params.tipoAcao ?? ""}\n${params.fatos ?? ""}`;
  return {
    especie,
    tituloPeca: titulo,
    cabivel: null,
    cabivelTitulo: null,
    incidenteAberto: incidenteExecucaoJaAberto(blob),
    prefixoNome: prefixoAntesDoNomePeca(especie),
  };
}

/** Núcleo dos fatos para RAG — corta ruído OCR e prioriza termos jurídicos. */
export function nucleoFatosParaPesquisa(fatos: string | null | undefined): string {
  const limpo = String(fatos ?? "")
    .replace(/\s+/g, " ")
    .replace(/_{3,}/g, " ")
    .replace(/\b(fls?\.?\s*\d+|página\s+\d+)\b/gi, " ")
    .trim();
  if (!limpo) return "";

  const reJur =
    /\b(tutela|astreintes|danos?\s+morais?|danos?\s+materiais?|alimentos|guarda|despejo|usucapi[aã]o|habeas|mandado\s+de\s+seguran|agravo|apela[cç][aã]o|embargos|contest|reclama[cç][aã]o|INSS|BPC|FGTS|horas?\s+extras?|pejotiza|LGPD|improbidade|penhora|execu[cç][aã]o|cumprimento|senten[cç]a|JULGO|improced|procedente|corte\s+indevido|energia|restabelec)/i;

  const frases = limpo.split(/(?<=[.!?])\s+/).filter((f) => f.length >= 24);
  const comSinal = frases.filter((f) => reJur.test(f));
  const escolhidas =
    comSinal.length > 0 ? comSinal.slice(0, 4) : frases.slice(0, 3);
  const nucleo = (escolhidas.length ? escolhidas.join(" ") : limpo).slice(0, 1200);
  return nucleo.trim();
}

export function montarEtapaMaestro(params: {
  areaId: string;
  vinculos: VinculosPecaFacto;
  polo?: PoloAdvocacia | null;
  teses: TeseCanonica[];
  pedirJusticaGratuita?: boolean;
  temMle?: boolean;
  fatos?: string | null;
  ultimoAto?: string | null;
}): EtapaEquipeFacto {
  const v = params.vinculos;
  const ultimo =
    String(params.ultimoAto ?? "").trim() ||
    extrairUltimoAtoDoTexto(params.fatos ?? "") ||
    null;
  const partes = [
    v.especie ? `Peça: ${v.tituloPeca}` : "Peça: a definir (IA/chips)",
    params.polo ? `polo ${params.polo}` : "polo a confirmar",
    params.teses.length
      ? `teses ${params.teses.map((t) => t.rotulo).join(", ")}`
      : null,
    params.pedirJusticaGratuita ? "JG" : null,
    params.temMle ? "MLE" : null,
    v.incidenteAberto ? "incidente em curso" : null,
    ultimo ? `último ato: ${ultimo.slice(0, 90)}` : null,
  ].filter(Boolean);

  const status: EtapaEquipeFacto["status"] = !v.especie
    ? "parcial"
    : !params.polo
      ? "parcial"
      : "ok";

  return {
    id: "maestro",
    skin: "Maestro",
    titulo: "Orquestração",
    status,
    detalhe: `${partes.join(" · ")} · Analista → Pesquisa → Estrategista → Redator → Auditor`,
  };
}

export function blocoPecaCabivelPrompt(v: VinculosPecaFacto): string {
  if (!v.especie) {
    return [
      "PEÇA: ainda sem espécie confirmada — escolha pelos AUTOS e pela instrução do advogado.",
      "Se o chat registrou chips de peça/polo, respeite-os. Sem forçar remédio por menção histórica.",
    ].join(" ");
  }
  const linhas = [
    `PEÇA CONFIRMADA (IA ou advogado): ${v.tituloPeca} (id ${v.especie}).`,
    "Redija essa peça. Não reabra incidente antigo só porque o PDF cita nome histórico.",
  ];
  if (v.incidenteAberto) {
    linhas.push(
      "Os autos indicam incidente (cumprimento/execução) já em curso — não redija abertura do incidente."
    );
  }
  if (v.prefixoNome) {
    linhas.push(
      `Após “Vossa Excelência”, use o conectivo “${v.prefixoNome}” e só então o nome da peça em caixa alta.`
    );
  }
  return linhas.join(" ");
}

/** Protocolo do Estrategista injetado no Redator (0 tokens extras). */
export const PROTOCOLO_ESTRATEGISTA_VINCULOS = [
  "ESTRATEGISTA → REDATOR:",
  "1) Cada tópico de direito: fato concreto → encaixe normativo → consequência pedida.",
  "2) Use ENCAIXE/LASTRO do plano quando existirem; não cite julgado fora da BASE/anexo.",
  "3) Pedidos do formulário: reproduza o conteúdo (pode numerar/refinar a redação).",
  "4) Persuasão forense: valorizar o polo; impugnar o que for do adversário sem inventar fato.",
  "5) Proibido: índice de artigos, ementa órfã, template genérico, inventar CNJ/relator.",
].join(" ");

export function reforcarEstrategiaParaRedator(params: {
  estrategia: string;
  vinculos: VinculosPecaFacto;
  teses: TeseCanonica[];
  pedidosUsuario?: string[] | null;
  pedirJusticaGratuita?: boolean;
  temMle?: boolean;
  tutelaUrgencia?: boolean;
  polo?: PoloAdvocacia | null;
  ultimoAto?: string | null;
}): string {
  const v = params.vinculos;
  const teses =
    params.teses.length > 0
      ? params.teses.map((t) => `${t.rotulo} (${t.artigos})`).join("; ")
      : "nenhuma tese canônica bateu — fundamente pelos autos + BASE, sem analogia inventada";
  const pedidos = (params.pedidosUsuario ?? [])
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 8);
  const ultimo = String(params.ultimoAto ?? "").trim();
  const vinculos = [
    `<VINCULOS_FACTO>`,
    blocoPecaCabivelPrompt(v),
    params.polo ? `Polo da peça: ${params.polo}.` : "Polo: inferir pelos autos/chips se ainda aberto.",
    ultimo ? `Último ato nos autos (contexto): ${ultimo.slice(0, 220)}` : null,
    `Teses do código: ${teses}.`,
    params.pedirJusticaGratuita === true
      ? "Justiça gratuita: incluir no direito e nos pedidos."
      : params.pedirJusticaGratuita === false
        ? "Justiça gratuita: NÃO incluir pedido (checkbox desligado)."
        : null,
    params.temMle === true
      ? "MLE: incluir nos pedidos se a espécie admitir."
      : params.temMle === false
        ? "MLE: NÃO pedir."
        : null,
    params.tutelaUrgencia === true
      ? "Tutela de urgência: tratar no direito (art. 300) e nos pedidos, se a espécie admitir."
      : params.tutelaUrgencia === false
        ? "Tutela: só se os fatos revelarem urgência manifesta."
        : null,
    pedidos.length
      ? `Pedidos do formulário (reproduzir o conteúdo, sem omitir):\n- ${pedidos.join("\n- ")}`
      : null,
    PROTOCOLO_ESTRATEGISTA_VINCULOS,
    `</VINCULOS_FACTO>`,
  ].filter((l): l is string => Boolean(l));

  return `${vinculos.join("\n")}\n\n${params.estrategia.trim()}`;
}

export function montarQueryPesquisa(params: {
  areaId: string;
  tipoAcao: string;
  vinculos: VinculosPecaFacto;
  teses: TeseCanonica[];
  fatos?: string | null;
  /** Trechos de juris anexada (título + miolo curto). */
  jurisDoCaso?: { titulo?: string; texto?: string }[] | null;
}): string {
  const jurisBits = (params.jurisDoCaso ?? [])
    .slice(0, 3)
    .map((j) => {
      const tit = j.titulo?.trim() ?? "";
      const tx = (j.texto ?? "").replace(/\s+/g, " ").trim().slice(0, 400);
      return [tit, tx].filter(Boolean).join(" ");
    })
    .filter(Boolean);
  const nucleo = nucleoFatosParaPesquisa(params.fatos);
  return [
    params.areaId,
    params.vinculos.tituloPeca,
    params.tipoAcao,
    ...params.teses.map((t) => `${t.rotulo} ${t.artigos}`),
    ...jurisBits,
    nucleo,
  ]
    .filter((s) => s.trim().length > 0)
    .join("\n");
}

export function detalheAnalista(params: {
  nomeAcao?: string;
  vinculos: VinculosPecaFacto;
  riscos?: string[];
  polo?: PoloAdvocacia | null;
  ultimoAto?: string | null;
}): string {
  const ultimo = String(params.ultimoAto ?? "").trim();
  const partes = [
    params.nomeAcao
      ? `Ação: ${params.nomeAcao}`
      : params.vinculos.especie
        ? `Espécie: ${params.vinculos.tituloPeca}`
        : "Espécie em aberto",
    params.polo ? `polo ${params.polo}` : null,
    params.vinculos.incidenteAberto ? "incidente já em curso" : null,
    ultimo ? `último ato lido` : null,
    params.riscos?.length
      ? `${params.riscos.length} lacuna(s): ${params.riscos[0]}`
      : null,
  ].filter(Boolean);
  return partes.join(" · ");
}

export function detalhePesquisa(params: {
  nBase: number;
  nLeis: number;
  nSumulas: number;
  nJurisCaso: number;
  nTeses: number;
  polo?: "ativo" | "passivo";
}): string {
  return [
    params.nBase
      ? `${params.nBase} trecho(s) da base`
      : "base sem trecho deste tema — redija com lei/súmula consolidada, sem inventar acórdão",
    params.polo ? `favoráveis ao polo ${params.polo}` : null,
    params.nLeis ? `${params.nLeis} lei(s)` : null,
    params.nSumulas ? `${params.nSumulas} súmula(s)` : null,
    params.nJurisCaso ? `${params.nJurisCaso} juris do caso` : null,
    params.nTeses ? `${params.nTeses} tese(s) sugerida(s)` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function detalheEstrategista(params: {
  tesePrincipal?: string;
  nPedidos: number;
  nTeses: number;
  nTopicos?: number;
}): string {
  const tese = params.tesePrincipal?.replace(/\s+/g, " ").trim().slice(0, 140);
  return [
    tese || "Estratégia: fato → tese → pedido",
    params.nTopicos ? `${params.nTopicos} tópico(s) no plano` : null,
    params.nTeses ? `${params.nTeses} tese(s)` : null,
    params.nPedidos ? `${params.nPedidos} pedido(s)` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function detalheRedator(params: {
  caracteres: number;
  tituloPeca: string;
}): string {
  return `${params.tituloPeca} · ${params.caracteres.toLocaleString("pt-BR")} caracteres · higiene + Auditor`;
}
