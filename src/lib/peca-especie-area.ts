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
import {
  blocoEstruturaPromptCivil,
  ESPECIES_PECA_CIVIL,
  inferirEspecieCivil,
  metaEspecieCivil,
  tituloPecaCivil,
  type EspeciePecaCivil,
} from "@/lib/civil-especie-peca";
import {
  blocoEstruturaPromptTrabalhista,
  ESPECIES_PECA_TRABALHISTA,
  inferirEspecieTrabalhista,
  metaEspecieTrabalhista,
  tituloPecaTrabalhista,
  type EspeciePecaTrabalhista,
} from "@/lib/trabalhista-especie-peca";
import {
  blocoEstruturaPromptFamilia,
  ESPECIES_PECA_FAMILIA,
  inferirEspecieFamilia,
  metaEspecieFamilia,
  tituloPecaFamilia,
  type EspeciePecaFamilia,
} from "@/lib/familia-especie-peca";
import {
  blocoEstruturaPromptImobiliario,
  ESPECIES_PECA_IMOBILIARIO,
  inferirEspecieImobiliario,
  metaEspecieImobiliario,
  tituloPecaImobiliario,
  type EspeciePecaImobiliario,
} from "@/lib/imobiliario-especie-peca";
import {
  blocoEstruturaPromptJecr,
  ESPECIES_PECA_JECR,
  inferirEspecieJecr,
  metaEspecieJecr,
  tituloPecaJecr,
  type EspeciePecaJecr,
} from "@/lib/jecr-especie-peca";
import { moduloDaArea } from "@/lib/minuta-modulo";

export function ehJusticaComumCpc(areaId: string): boolean {
  return (
    areaId === "consumidor" ||
    areaId === "civil" ||
    areaId === "familia" ||
    areaId === "imobiliario"
  );
}

export function idsPeticaoInicialDaArea(areaId: string): readonly string[] {
  return moduloDaArea(areaId).idsPeticaoInicial;
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
  if (areaId === "civil") {
    return inferirEspecieCivil(tipoAcao, fatos, especieExplicita);
  }
  if (areaId === "trabalhista") {
    return inferirEspecieTrabalhista(tipoAcao, fatos, especieExplicita);
  }
  if (areaId === "familia") {
    return inferirEspecieFamilia(tipoAcao, fatos, especieExplicita);
  }
  if (areaId === "imobiliario") {
    return inferirEspecieImobiliario(tipoAcao, fatos, especieExplicita);
  }
  if (areaId === "jecr") {
    return inferirEspecieJecr(tipoAcao, fatos, especieExplicita);
  }
  return inferirEspeciePeca(tipoAcao, fatos, especieExplicita);
}

export function blocoEstruturaDaArea(areaId: string, especie: string): string {
  if (areaId === "consumidor") {
    return blocoEstruturaPromptConsumidor(especie as EspeciePecaConsumidor);
  }
  if (areaId === "civil") {
    return blocoEstruturaPromptCivil(especie as EspeciePecaCivil);
  }
  if (areaId === "trabalhista") {
    return blocoEstruturaPromptTrabalhista(especie as EspeciePecaTrabalhista);
  }
  if (areaId === "familia") {
    return blocoEstruturaPromptFamilia(especie as EspeciePecaFamilia);
  }
  if (areaId === "imobiliario") {
    return blocoEstruturaPromptImobiliario(especie as EspeciePecaImobiliario);
  }
  if (areaId === "jecr") {
    return blocoEstruturaPromptJecr(especie as EspeciePecaJecr);
  }
  return blocoEstruturaPrompt(especie as EspeciePecaJec);
}

export function metaEspecieDaArea(areaId: string, especie: string) {
  if (areaId === "consumidor") return metaEspecieConsumidor(especie);
  if (areaId === "civil") return metaEspecieCivil(especie);
  if (areaId === "trabalhista") return metaEspecieTrabalhista(especie);
  if (areaId === "familia") return metaEspecieFamilia(especie);
  if (areaId === "imobiliario") return metaEspecieImobiliario(especie);
  if (areaId === "jecr") return metaEspecieJecr(especie);
  return metaEspecie(especie as EspeciePecaJec);
}

export function tituloPecaDaArea(
  areaId: string,
  especie: string,
  tipoSugerido?: string | null,
  contexto?: string | null
): string {
  if (areaId === "consumidor") {
    return tituloPecaConsumidor(especie as EspeciePecaConsumidor, tipoSugerido);
  }
  if (areaId === "civil") {
    return tituloPecaCivil(especie as EspeciePecaCivil, tipoSugerido);
  }
  if (areaId === "trabalhista") {
    return tituloPecaTrabalhista(especie as EspeciePecaTrabalhista, tipoSugerido);
  }
  if (areaId === "familia") {
    return tituloPecaFamilia(especie as EspeciePecaFamilia, tipoSugerido);
  }
  if (areaId === "imobiliario") {
    return tituloPecaImobiliario(especie as EspeciePecaImobiliario, tipoSugerido);
  }
  if (areaId === "jecr") {
    return tituloPecaJecr(especie as EspeciePecaJecr, tipoSugerido);
  }
  return tituloPecaCabivel(especie as EspeciePecaJec, tipoSugerido, contexto);
}

export function especieParaScaffoldJec(
  areaId: string,
  especie: string
): string {
  if (areaId === "jecr") {
    switch (especie) {
      case "queixa-crime":
      case "composicao-civil":
      case "transacao-penal":
      case "suspensao-condicional":
        return "peticao-inicial";
      case "defesa-jecrim":
        return "contestacao";
      case "alegacoes-finais":
        return "replica";
      case "recurso-inominado":
        return "recurso";
      case "embargos-declaracao":
        return "embargos";
      default:
        return especie;
    }
  }
  if (areaId === "trabalhista") {
    switch (especie) {
      case "reclamacao":
        return "peticao-inicial";
      case "defesa":
        return "contestacao";
      case "manifestacao":
        return "replica";
      case "recurso-ordinario":
      case "agravo-instrumento":
      case "agravo-peticao":
        return "recurso";
      case "embargos-declaracao":
        return "embargos";
      case "execucao-titulo":
        return "execucao";
      default:
        return especie;
    }
  }
  if (!ehJusticaComumCpc(areaId)) return especie;
  switch (especie) {
    case "apelacao":
    case "agravo-instrumento":
      return "recurso";
    case "embargos-declaracao":
      return "embargos";
    case "cumprimento-sentenca":
    case "cumprimento-alimentos":
    case "execucao-titulo":
      return "execucao";
    case "inventario":
    case "despejo":
    case "usucapiao":
    case "consignacao":
    case "condominio":
      return "peticao-inicial";
    default:
      return especie;
  }
}

export function listaEspeciesDaArea(areaId: string) {
  if (areaId === "consumidor") return ESPECIES_PECA_CONSUMIDOR;
  if (areaId === "civil") return ESPECIES_PECA_CIVIL;
  if (areaId === "trabalhista") return ESPECIES_PECA_TRABALHISTA;
  if (areaId === "familia") return ESPECIES_PECA_FAMILIA;
  if (areaId === "imobiliario") return ESPECIES_PECA_IMOBILIARIO;
  if (areaId === "jecr") return ESPECIES_PECA_JECR;
  return null;
}
