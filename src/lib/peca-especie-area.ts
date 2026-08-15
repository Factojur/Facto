/**
 * Despacho de espécies por área do dashboard.
 */

import {
  blocoEstruturaPrompt,
  inferirEspeciePeca,
  metaEspecie,
  tituloPecaCabivel,
  type EspeciePecaJec,
} from "@/lib/jec-especie-peca";
import {
  blocoEstruturaPromptConsumidor,
  ESPECIES_PECA_CONSUMIDOR,
  inferirEspecieConsumidor,
  metaEspecieConsumidor,
  tituloPecaConsumidor,
  type EspeciePecaConsumidor,
} from "@/lib/consumidor-especie-peca";
import { MODULO_CONSUMIDOR, MODULO_JEC } from "@/lib/minuta-modulo";

export function idsPeticaoInicialDaArea(areaId: string): readonly string[] {
  if (areaId === "consumidor") return MODULO_CONSUMIDOR.idsPeticaoInicial;
  return MODULO_JEC.idsPeticaoInicial;
}

export function inferirEspecieDaArea(
  areaId: string,
  tipoAcao: string,
  fatos?: string,
  especieExplicita?: string | null
): string {
  if (areaId === "consumidor") {
    return inferirEspecieConsumidor(tipoAcao, fatos, especieExplicita);
  }
  return inferirEspeciePeca(tipoAcao, fatos, especieExplicita);
}

export function blocoEstruturaDaArea(areaId: string, especie: string): string {
  if (areaId === "consumidor") {
    return blocoEstruturaPromptConsumidor(especie as EspeciePecaConsumidor);
  }
  return blocoEstruturaPrompt(especie as EspeciePecaJec);
}

export function metaEspecieDaArea(areaId: string, especie: string) {
  if (areaId === "consumidor") return metaEspecieConsumidor(especie);
  return metaEspecie(especie as EspeciePecaJec);
}

export function tituloPecaDaArea(
  areaId: string,
  especie: string,
  tipoSugerido?: string | null,
  contexto?: string | null
): string {
  if (areaId === "consumidor") {
    return tituloPecaConsumidor(
      especie as EspeciePecaConsumidor,
      tipoSugerido
    );
  }
  return tituloPecaCabivel(especie as EspeciePecaJec, tipoSugerido, contexto);
}

export function especieParaScaffoldJec(
  areaId: string,
  especie: string
): string {
  if (areaId !== "consumidor") return especie;
  switch (especie) {
    case "apelacao":
    case "agravo-instrumento":
      return "recurso";
    case "embargos-declaracao":
      return "embargos";
    case "cumprimento-sentenca":
    case "execucao-titulo":
      return "execucao";
    default:
      return especie;
  }
}

export function listaEspeciesDaArea(areaId: string) {
  if (areaId === "consumidor") return ESPECIES_PECA_CONSUMIDOR;
  return null;
}
