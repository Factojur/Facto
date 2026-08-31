/**
 * Despacho de espécies por área do dashboard.
 */

import {
  blocoEstruturaPrompt,
  inferirEspeciePeca,
  metaEspecie,
  tituloPecaCabivel,
  ESPECIES_PECA_JEC,
  esqueletoPorEspecie,
  type EspeciePecaJec,
} from "@/lib/jec-especie-peca";
import {
  blocoEstruturaPromptConsumidor,
  ESPECIES_PECA_CONSUMIDOR,
  esqueletoPorEspecieConsumidor,
  inferirEspecieConsumidor,
  metaEspecieConsumidor,
  tituloPecaConsumidor,
  type EspeciePecaConsumidor,
} from "@/lib/consumidor-especie-peca";
import {
  blocoEstruturaPromptCivil,
  ESPECIES_PECA_CIVIL,
  esqueletoPorEspecieCivil,
  inferirEspecieCivil,
  metaEspecieCivil,
  tituloPecaCivil,
  type EspeciePecaCivil,
} from "@/lib/civil-especie-peca";
import {
  blocoEstruturaPromptTrabalhista,
  ESPECIES_PECA_TRABALHISTA,
  esqueletoPorEspecieTrabalhista,
  inferirEspecieTrabalhista,
  metaEspecieTrabalhista,
  tituloPecaTrabalhista,
  type EspeciePecaTrabalhista,
} from "@/lib/trabalhista-especie-peca";
import {
  blocoEstruturaPromptFamilia,
  ESPECIES_PECA_FAMILIA,
  esqueletoPorEspecieFamilia,
  inferirEspecieFamilia,
  metaEspecieFamilia,
  tituloPecaFamilia,
  type EspeciePecaFamilia,
} from "@/lib/familia-especie-peca";
import {
  blocoEstruturaPromptImobiliario,
  ESPECIES_PECA_IMOBILIARIO,
  esqueletoPorEspecieImobiliario,
  inferirEspecieImobiliario,
  metaEspecieImobiliario,
  tituloPecaImobiliario,
  type EspeciePecaImobiliario,
} from "@/lib/imobiliario-especie-peca";
import {
  blocoEstruturaPromptJecr,
  ESPECIES_PECA_JECR,
  esqueletoPorEspecieJecr,
  inferirEspecieJecr,
  metaEspecieJecr,
  tituloPecaJecr,
  type EspeciePecaJecr,
} from "@/lib/jecr-especie-peca";
import { moduloDaArea } from "@/lib/minuta-modulo";
import { extrasQualificacaoEstruturaPrompt } from "@/lib/partes-ja-qualificadas";
import {
  blocoEstruturaKit,
  esqueletoKit,
  inferirEspecieKit,
  kitDaArea,
  metaEspecieKit,
  tituloPecaKit,
} from "@/lib/especies-restantes";
import { ajustarEspecieCabivel } from "@/lib/peca-cabivel-autos";

const ROMANOS_ESQUELETO = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"] as const;

export type SecaoEsqueletoArea = {
  chave: string;
  titulo: string;
  obrigatoria: boolean;
  opcionalSistema?: boolean;
};

/** Esqueleto romano da espécie no módulo da área (sem provas opcionais do sistema). */
export function esqueletosDaEspecie(
  areaId: string,
  especie: string
): SecaoEsqueletoArea[] {
  let secoes: SecaoEsqueletoArea[];
  if (areaId === "consumidor") {
    secoes = esqueletoPorEspecieConsumidor(especie);
  } else if (areaId === "civil") {
    secoes = esqueletoPorEspecieCivil(especie);
  } else if (areaId === "trabalhista") {
    secoes = esqueletoPorEspecieTrabalhista(especie);
  } else if (areaId === "familia") {
    secoes = esqueletoPorEspecieFamilia(especie);
  } else if (areaId === "imobiliario") {
    secoes = esqueletoPorEspecieImobiliario(especie);
  } else if (areaId === "jecr") {
    secoes = esqueletoPorEspecieJecr(especie);
  } else if (kitDaArea(areaId)) {
    secoes = esqueletoKit(areaId, especie);
  } else {
    secoes = esqueletoPorEspecie(especie as EspeciePecaJec);
  }
  return secoes.filter((s) => !s.opcionalSistema);
}

/** Seção de valor (causa/reconvenção/contraposto), quando prevista no esqueleto da espécie. */
export function secaoValorDaEspecie(
  areaId: string,
  especie: string
): { titulo: string; romano: string } | null {
  const secoes = esqueletosDaEspecie(areaId, especie);
  const idx = secoes.findIndex((s) => s.chave === "valor");
  if (idx < 0) return null;
  return {
    titulo: secoes[idx]!.titulo,
    romano: ROMANOS_ESQUELETO[idx] ?? String(idx + 1),
  };
}

export function ehJusticaComumCpc(areaId: string): boolean {
  return (
    areaId === "consumidor" ||
    areaId === "civil" ||
    areaId === "familia" ||
    areaId === "imobiliario" ||
    areaId === "digital" ||
    areaId === "medico" ||
    areaId === "agrario" ||
    areaId === "empresarial" ||
    areaId === "ambiental" ||
    areaId === "propriedade-intelectual" ||
    areaId === "internacional" ||
    areaId === "administrativo" ||
    areaId === "previdenciario"
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
  let especie: string;
  if (areaId === "consumidor") {
    especie = inferirEspecieConsumidor(tipoAcao, fatos, especieExplicita);
  } else if (areaId === "civil") {
    especie = inferirEspecieCivil(tipoAcao, fatos, especieExplicita);
  } else if (areaId === "trabalhista") {
    especie = inferirEspecieTrabalhista(tipoAcao, fatos, especieExplicita);
  } else if (areaId === "familia") {
    especie = inferirEspecieFamilia(tipoAcao, fatos, especieExplicita);
  } else if (areaId === "imobiliario") {
    especie = inferirEspecieImobiliario(tipoAcao, fatos, especieExplicita);
  } else if (areaId === "jecr") {
    especie = inferirEspecieJecr(tipoAcao, fatos, especieExplicita);
  } else if (kitDaArea(areaId)) {
    especie = inferirEspecieKit(areaId, tipoAcao, fatos, especieExplicita);
  } else {
    especie = inferirEspeciePeca(tipoAcao, fatos, especieExplicita);
  }
  return ajustarEspecieCabivel({
    areaId,
    especie,
    tipoAcao,
    fatos,
  });
}

export function blocoEstruturaDaArea(areaId: string, especie: string): string {
  let base: string;
  if (areaId === "consumidor") {
    base = blocoEstruturaPromptConsumidor(especie as EspeciePecaConsumidor);
  } else if (areaId === "civil") {
    base = blocoEstruturaPromptCivil(especie as EspeciePecaCivil);
  } else if (areaId === "trabalhista") {
    base = blocoEstruturaPromptTrabalhista(especie as EspeciePecaTrabalhista);
  } else if (areaId === "familia") {
    base = blocoEstruturaPromptFamilia(especie as EspeciePecaFamilia);
  } else if (areaId === "imobiliario") {
    base = blocoEstruturaPromptImobiliario(especie as EspeciePecaImobiliario);
  } else if (areaId === "jecr") {
    base = blocoEstruturaPromptJecr(especie as EspeciePecaJecr);
  } else if (kitDaArea(areaId)) {
    base = blocoEstruturaKit(areaId, especie);
  } else {
    base = blocoEstruturaPrompt(especie as EspeciePecaJec);
  }
  const qual = extrasQualificacaoEstruturaPrompt(areaId, especie);
  return qual.length ? `${base}\n${qual.join("\n")}` : base;
}

export function metaEspecieDaArea(areaId: string, especie: string) {
  if (areaId === "consumidor") return metaEspecieConsumidor(especie);
  if (areaId === "civil") return metaEspecieCivil(especie);
  if (areaId === "trabalhista") return metaEspecieTrabalhista(especie);
  if (areaId === "familia") return metaEspecieFamilia(especie);
  if (areaId === "imobiliario") return metaEspecieImobiliario(especie);
  if (areaId === "jecr") return metaEspecieJecr(especie);
  if (kitDaArea(areaId)) return metaEspecieKit(areaId, especie);
  return metaEspecie(especie as EspeciePecaJec);
}

export function pecaUsaEmFaceDeReu(
  conectivoPartes: string | null | undefined
): boolean {
  const c = String(conectivoPartes ?? "").trim();
  if (!c) return true;
  if (
    /^(impetrando|interpondo|oferecendo|apresentando|opondo|requerendo)\b/i.test(
      c
    )
  ) {
    return false;
  }
  return true;
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
  if (kitDaArea(areaId)) {
    return tituloPecaKit(areaId, especie, tipoSugerido);
  }
  return tituloPecaCabivel(especie as EspeciePecaJec, tipoSugerido, contexto);
}

export function especieParaScaffoldJec(
  areaId: string,
  especie: string
): string {
  if (areaId === "criminal") {
    switch (especie) {
      case "habeas-corpus":
      case "revisao-criminal":
        return "peticao-inicial";
      case "resposta-acusacao":
        return "contestacao";
      case "defesa-preliminar":
        return "defesa-preliminar";
      case "alegacoes-finais":
        return "replica";
      case "apelacao":
      case "recurso-sentido-estrito":
      case "agravo-execucao":
        return "recurso";
      case "embargos-declaracao":
        return "embargos";
      default:
        return especie;
    }
  }
  if (areaId === "tributario") {
    switch (especie) {
      case "embargos-execucao-fiscal":
      case "excecao-pre-executividade":
        return "contestacao";
      case "mandado-seguranca":
        return "peticao-inicial";
      case "apelacao":
        return "recurso";
      case "embargos-declaracao":
        return "embargos";
      default:
        return especie;
    }
  }
  if (areaId === "eleitoral") {
    switch (especie) {
      case "defesa":
        return "contestacao";
      case "recurso-eleitoral":
        return "recurso";
      default:
        return "peticao-inicial";
    }
  }
  if (areaId === "constitucional") {
    switch (especie) {
      case "recurso-extraordinario":
      case "agravo-recurso-extraordinario":
      case "recurso-ordinario-constitucional":
      case "agravo-regimental":
      case "contrarrazoes-recurso-extraordinario":
      case "contrarrazoes-recurso-ordinario":
      case "apelacao":
        return "recurso";
      case "agravo-instrumento":
        return "agravo-instrumento";
      case "embargos-declaracao":
        return "embargos";
      case "informacoes-ms":
      case "contestacao-ms":
      case "contestacao-habeas-data":
      case "informacoes-mandado-injuncao":
      case "contestacao-reclamacao":
      case "contestacao-adi":
      case "contestacao-adpf":
      case "contestacao-adc":
      case "contestacao-ado":
      case "contestacao-acao-popular":
        return "contestacao";
      case "memorial":
        return "memorial";
      default:
        return "peticao-inicial";
    }
  }
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
        return "recurso-inominado";
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
    case "reconvencao":
      return "pedido-contraposto";
    case "inventario":
    case "despejo":
    case "usucapiao":
    case "consignacao":
    case "condominio":
    case "mandado-seguranca":
    case "notificacao-extrajudicial":
    case "acp-ambiental":
    case "defesa-infracao":
    case "abstencao-marca":
    case "homologacao":
      return "peticao-inicial";
    default:
      return especie;
  }
}

export function listaEspeciesDaArea(areaId: string) {
  const bruta =
    areaId === "jec"
      ? ESPECIES_PECA_JEC
      : areaId === "consumidor"
      ? ESPECIES_PECA_CONSUMIDOR
      : areaId === "civil"
        ? ESPECIES_PECA_CIVIL
        : areaId === "trabalhista"
          ? ESPECIES_PECA_TRABALHISTA
          : areaId === "familia"
            ? ESPECIES_PECA_FAMILIA
            : areaId === "imobiliario"
              ? ESPECIES_PECA_IMOBILIARIO
              : areaId === "jecr"
                ? ESPECIES_PECA_JECR
                : kitDaArea(areaId)?.especies ?? null;
  if (!bruta) return null;
  return bruta.filter(
    (e) => e.id !== "reconvencao" && e.id !== "pedido-contraposto"
  );
}

const AREAS_CHECKBOX_RECONVENCAO = [
  "jec",
  "civil",
  "consumidor",
  "familia",
  "imobiliario",
] as const;

/** Contestação + checkbox (não espécie no seletor). */
export function areaMostraCheckboxReconvencao(areaId: string): boolean {
  return (AREAS_CHECKBOX_RECONVENCAO as readonly string[]).includes(areaId);
}

export function rotuloCheckboxReconvencao(areaId: string): {
  titulo: string;
  ajuda: string;
} {
  if (areaId === "jec") {
    return {
      titulo: "Pedido contraposto",
      ajuda:
        "Lei 9.099/95, art. 31: o réu pede em seu favor na mesma contestação, com os mesmos fatos. Reconvenção do CPC não se admite no Juizado.",
    };
  }
  return {
    titulo: "Reconvenção",
    ajuda:
      "Art. 343 do CPC: o réu (reconvinte) formula pedido próprio contra o autor (reconvindo) na mesma peça da contestação.",
  };
}

/**
 * Contestação + checkbox vira espécie interna (esqueleto/prompt).
 * IDs internos no payload antigo também são aceitos.
 */
export function aplicarFlagReconvencao(
  areaId: string,
  especie: string,
  comReconvencao?: boolean
): string {
  const id = String(especie ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  if (id === "pedido-contraposto") return "pedido-contraposto";
  if (id === "reconvencao") {
    return areaId === "jec" ? "pedido-contraposto" : "reconvencao";
  }
  if (!comReconvencao || id !== "contestacao") return especie;
  if (areaId === "jec") return "pedido-contraposto";
  if (areaMostraCheckboxReconvencao(areaId)) return "reconvencao";
  return especie;
}

/** Seletor só mostra Contestação; o flag vai no checkbox. */
export function especiePublicaDoFormulario(especie: string): {
  especie: string;
  comReconvencao: boolean;
} {
  const id = String(especie ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  if (id === "pedido-contraposto" || id === "reconvencao") {
    return { especie: "contestacao", comReconvencao: true };
  }
  return { especie, comReconvencao: false };
}
