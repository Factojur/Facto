/**
 * Trabalho real de cada skin visível — sem chamada extra ao Gemini.
 * Maestro, Pesquisa e o reforço do Estrategista são determinísticos.
 */

import {
  ajustarEspecieCabivel,
  incidenteExecucaoJaAberto,
  pecaCabivelAposUltimoAto,
} from "@/lib/peca-cabivel-autos";
import { tituloPecaDaArea } from "@/lib/peca-especie-area";
import { prefixoAntesDoNomePeca } from "@/lib/partes-ja-qualificadas";
import type { TeseCanonica } from "@/lib/teses-canonicas";
import type { EtapaEquipeFacto } from "@/lib/ia/agentes-facto";
import type { PoloAdvocacia } from "@/lib/polo-advocacia";

export type VinculosPecaFacto = {
  especie: string;
  tituloPeca: string;
  cabivel: string | null;
  incidenteAberto: boolean;
  prefixoNome: string;
};

export function resolverVinculosPeca(params: {
  areaId: string;
  especie: string;
  tipoAcao?: string | null;
  fatos?: string | null;
}): VinculosPecaFacto {
  const especie = ajustarEspecieCabivel({
    areaId: params.areaId,
    especie: params.especie,
    tipoAcao: params.tipoAcao,
    fatos: params.fatos,
  });
  const blob = `${params.tipoAcao ?? ""} ${params.fatos ?? ""}`;
  return {
    especie,
    tituloPeca: tituloPecaDaArea(params.areaId, especie, params.tipoAcao),
    cabivel: pecaCabivelAposUltimoAto(params.areaId, blob),
    incidenteAberto: incidenteExecucaoJaAberto(blob),
    prefixoNome: prefixoAntesDoNomePeca(especie),
  };
}

export function montarEtapaMaestro(params: {
  areaId: string;
  vinculos: VinculosPecaFacto;
  polo?: PoloAdvocacia | null;
  teses: TeseCanonica[];
  pedirJusticaGratuita?: boolean;
  temMle?: boolean;
}): EtapaEquipeFacto {
  const v = params.vinculos;
  const tituloCabivel = v.cabivel
    ? tituloPecaDaArea(params.areaId, v.cabivel)
    : null;
  const partes = [
    `Peça: ${v.tituloPeca}`,
    params.polo ? `polo ${params.polo}` : null,
    params.teses.length
      ? `teses ${params.teses.map((t) => t.rotulo).join(", ")}`
      : null,
    params.pedirJusticaGratuita ? "JG" : null,
    params.temMle ? "MLE" : null,
    v.incidenteAberto && tituloCabivel
      ? `último ato → ${tituloCabivel}`
      : null,
  ].filter(Boolean);
  return {
    id: "maestro",
    skin: "Maestro",
    titulo: "Orquestração",
    status:
      v.incidenteAberto && v.cabivel && v.especie !== v.cabivel
        ? "parcial"
        : "ok",
    detalhe: `${partes.join(" · ")} · Analista → Pesquisa → Estrategista → Redator → Auditor`,
  };
}

export function blocoPecaCabivelPrompt(v: VinculosPecaFacto): string {
  const linhas = [
    `PEÇA A PROTOCOLAR AGORA: ${v.tituloPeca} (id ${v.especie}).`,
    "Não confunda com o nome do incidente já aberto nos autos.",
  ];
  if (v.incidenteAberto) {
    linhas.push(
      "Cumprimento/execução JÁ está instaurado. NÃO redija abertura de cumprimento nem de execução."
    );
  }
  if (v.cabivel && v.cabivel !== v.especie) {
    linhas.push(
      `Último ato dos autos aponta ${v.cabivel} — não reabra o incidente em curso.`
    );
  }
  if (v.prefixoNome) {
    linhas.push(
      `Após “Vossa Excelência”, use o conectivo “${v.prefixoNome}” e só então o nome da peça em caixa alta.`
    );
  }
  return linhas.join(" ");
}

export function reforcarEstrategiaParaRedator(params: {
  estrategia: string;
  vinculos: VinculosPecaFacto;
  teses: TeseCanonica[];
  pedidosUsuario?: string[] | null;
  pedirJusticaGratuita?: boolean;
  temMle?: boolean;
  tutelaUrgencia?: boolean;
}): string {
  const v = params.vinculos;
  const teses =
    params.teses.length > 0
      ? params.teses.map((t) => `${t.rotulo} (${t.artigos})`).join("; ")
      : "nenhuma tese canônica bateu — não invente analogia";
  const pedidos = (params.pedidosUsuario ?? [])
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 8);
  const vinculos = [
    `<VINCULOS_FACTO>`,
    blocoPecaCabivelPrompt(v),
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
}): string {
  return [
    params.areaId,
    params.vinculos.tituloPeca,
    params.tipoAcao,
    ...params.teses.map((t) => `${t.rotulo} ${t.artigos}`),
    String(params.fatos ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 2000),
  ]
    .filter((s) => s.trim().length > 0)
    .join("\n");
}

export function detalheAnalista(params: {
  nomeAcao?: string;
  vinculos: VinculosPecaFacto;
  riscos?: string[];
}): string {
  const partes = [
    params.nomeAcao
      ? `Ação: ${params.nomeAcao}`
      : `Espécie: ${params.vinculos.tituloPeca}`,
    params.vinculos.incidenteAberto ? "incidente já em curso" : null,
    params.riscos?.length ? `lacunas: ${params.riscos[0]}` : null,
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
    params.nBase ? `${params.nBase} trecho(s) da base` : "base sem trecho deste tema",
    params.polo
      ? `favoráveis ao polo ${params.polo}`
      : null,
    params.nLeis ? `${params.nLeis} lei(s)` : null,
    params.nSumulas ? `${params.nSumulas} súmula(s)` : null,
    params.nJurisCaso ? `${params.nJurisCaso} juris do caso` : null,
    params.nTeses ? `${params.nTeses} tese(s) do código` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function detalheEstrategista(params: {
  tesePrincipal?: string;
  nPedidos: number;
  nTeses: number;
}): string {
  const tese = params.tesePrincipal?.replace(/\s+/g, " ").trim().slice(0, 140);
  return [
    tese || "Estratégia montada",
    params.nTeses ? `${params.nTeses} tese(s) travada(s)` : null,
    params.nPedidos ? `${params.nPedidos} pedido(s) do formulário` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function detalheRedator(params: {
  caracteres: number;
  tituloPeca: string;
}): string {
  return `${params.tituloPeca} · ${params.caracteres.toLocaleString("pt-BR")} caracteres`;
}
