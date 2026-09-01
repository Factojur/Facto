/**
 * Organização determinística do caso (0 tokens) — fallback quando entrada-caso
 * demora/falha ou para complementos no chat sem reprocessar tudo na IA.
 */

import type { PreenchimentoEntradaCaso } from "@/lib/entrada-caso-types";
import { extrairPartesDoRelato } from "@/lib/extrair-partes-relato";
import { extrairMetadadosAutos } from "@/lib/peca-cabivel-autos";
import {
  especieUsaTutelaUrgenciaCpc,
  inferirEspecieDaArea,
  tituloPecaDaArea,
} from "@/lib/peca-especie-area";
import { detectarTesesCanonicas } from "@/lib/teses-canonicas";

export type ExtrasOrganizacaoLocal = {
  leiMunicipalTitulo: string | null;
};

function norm(t: string): string {
  return t.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

export function extrairPedidosDoRelato(relato: string, especie: string): string[] {
  const pedidos: string[] = [];
  const n = norm(relato);

  const pedeTutelaCpc =
    /tutela\s+(de\s+)?urg[eê]ncia|antecipada|restabelecimento\s+imediato|restaurar\s+o\s+fornecimento|corte\s+indevido|implanta[cç][aã]o\s+imediata/.test(
      n
    ) ||
    (/liminar/.test(n) && especieUsaTutelaUrgenciaCpc(especie));
  if (pedeTutelaCpc) {
    pedidos.push(
      /implanta[cç][aã]o|benef[ií]cio|bpc|loas|inss/.test(n)
        ? "Tutela de urgência para implantação imediata do benefício"
        : "Tutela de urgência para restabelecimento imediato do serviço essencial"
    );
  }

  if (/\bbpc\b|\bloas\b|\binss\b/.test(n) && /indefer|anular|concess[aã]o do benef/i.test(n)) {
    if (/anular|indeferimento/.test(n)) {
      pedidos.push(
        "Anulação do indeferimento administrativo e concessão do benefício pleiteado"
      );
    }
    if (/desde a der|\bder\b|data de entrada/.test(n)) {
      pedidos.push(
        "Concessão do benefício desde a data de entrada do requerimento (DER)"
      );
    }
  }

  const moralVal = relato.match(
    /danos?\s*morais?(?:\s*(?:de|no\s+valor\s+(?:de|de\s+R\$))?)\s*(R\$\s*[\d.,]+)/i
  );
  if (/danos?\s*morais?/.test(n)) {
    pedidos.push(
      moralVal?.[1]
        ? `Condenação em danos morais no valor de ${moralVal[1].trim()}`
        : "Condenação em danos morais"
    );
  }

  if (/dano\s*material|danos\s*materiais|restitui[cç][aã]o/.test(n)) {
    const matVal = relato.match(
      /(?:danos?\s*materiais?|restitui[cç][aã]o)[^R$]{0,40}(R\$\s*[\d.,]+)/i
    );
    pedidos.push(
      matVal?.[1]
        ? `Condenação/restituição por danos materiais (${matVal[1].trim()})`
        : "Condenação por danos materiais ou restituição"
    );
  }

  if (/invers[aã]o\s+do\s+onus|responsabilidade\s+objetiva|cdc|fornecedor/.test(n)) {
    pedidos.push("Reconhecimento da responsabilidade objetiva do fornecedor");
  }

  if (/justi[cç]a\s+gratuita|gratuidade|hipossufici|jg\b|sem\s+condi[cç][oõ]es/.test(n)) {
    pedidos.push("Concessão dos benefícios da justiça gratuita");
  }

  if (/invers[aã]o\s+do\s+onus\s+da\s+prova|ônus\s+da\s+prova/.test(n)) {
    pedidos.push("Inversão do ônus da prova");
  }

  if (pedidos.length === 0 && /condena[cç][aã]o|proced[eê]ncia|indeniza[cç][aã]o/.test(n)) {
    pedidos.push("Procedência dos pedidos formulados");
  }

  return pedidos.slice(0, 8);
}

function extrairLeiMunicipalTitulo(relato: string): string | null {
  const m = relato.match(
    /\blei\s+municipal\s+n[º°.]?\s*([\d./]+)(?:\s*\([^)]*\))?/i
  );
  if (!m) return null;
  const arts = relato.match(/arts?\.?\s*[\dº°]+(?:\s*e\s*[\dº°]+)?/i);
  const base = `Lei Municipal nº ${m[1]!.trim()}`;
  return arts ? `${base} (${arts[0]!.trim()})` : base;
}

function narrativaFatos(relato: string): string {
  const linhas = relato.split(/\n+/);
  const out: string[] = [];
  for (const linha of linhas) {
    const l = linha.trim();
    if (!l) continue;
    if (/^(provas?|documentos?|anexos?)\s*:/i.test(l)) break;
    if (/^[-•*]\s*(print|nota|certid|ac[oó]rd|lei\s+municipal)/i.test(l)) continue;
    out.push(l);
  }
  const texto = out.join("\n").trim();
  return texto.length >= 40 ? texto : relato.trim();
}

/**
 * Preenche campos do caso a partir do relato, sem LLM.
 */
export function organizarCasoLocal(params: {
  relato: string;
  areaId: string;
}): PreenchimentoEntradaCaso {
  const relato = params.relato.trim();
  const meta = extrairMetadadosAutos(relato);
  const partes = extrairPartesDoRelato(relato);
  const especie =
    inferirEspecieDaArea(params.areaId, "Petição inicial", relato, null) ||
    "peticao-inicial";
  const tipoAcao =
    tituloPecaDaArea(params.areaId, especie, "Petição inicial") ||
    "Petição inicial";
  const teses = detectarTesesCanonicas(params.areaId, relato);
  const pedidos = extrairPedidosDoRelato(relato, especie);
  const n = norm(relato);

  return {
    especiePeca: especie,
    tipoAcao,
    fatos: narrativaFatos(relato),
    autoresNomes: partes.autoresNomes,
    reusNomes: partes.reusNomes,
    numeroProcesso: meta.numeroProcesso,
    foro: meta.foro,
    cidade: meta.cidade,
    uf: meta.uf,
    numeroVara: meta.numeroVara,
    especieDoProcesso: null,
    ultimoAto: null,
    pedidos,
    pedirJusticaGratuita: /justi[cç]a\s+gratuita|gratuidade|hipossufici|jg\b/.test(n)
      ? true
      : null,
    tutelaUrgencia:
      (/tutela\s+(de\s+)?urg[eê]ncia|restabelecimento\s+imediato|corte\s+indevido/.test(
        n
      ) ||
        (/liminar/.test(n) && especieUsaTutelaUrgenciaCpc(especie))) &&
      especieUsaTutelaUrgenciaCpc(especie)
        ? true
        : null,
    danosMorais: /danos?\s*morais?/.test(n) ? true : null,
    danosMateriais: /danos?\s*materiais|restitui[cç][aã]o/.test(n) ? true : null,
    tesesIds: teses.map((t) => t.id),
    camposIncertos: partes.autoresNomes.length ? [] : ["partes"],
    resumoConferencia:
      "Caso organizado em modo rápido — confira partes, pedidos e comarca antes de redigir.",
  };
}

export function extrasOrganizacaoLocal(relato: string): ExtrasOrganizacaoLocal {
  return {
    leiMunicipalTitulo: extrairLeiMunicipalTitulo(relato),
  };
}
