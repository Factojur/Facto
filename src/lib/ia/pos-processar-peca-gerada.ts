/**
 * Pós-processamento determinístico antes/depois da injeção de qualificação.
 * Garante peça protocolável: cabeçalho, qualificação única, sem placeholders/markdown.
 */

import {
  MARCADOR_ESPACO_2,
  montarMarcadorEspaco6,
  parseMarcadorEspaco,
} from "@/lib/formatacao-forense";
import { garantirSecaoValorCausa } from "@/lib/ia/mesclar-peca-hibrida";
import { normalizarPecaGerada } from "@/lib/ia/normalizar-peca-gerada";
import {
  metaEspecieDaArea,
  pecaUsaEmFaceDeReu,
} from "@/lib/peca-especie-area";

function indicePrimeiroTopicoRomano(linhas: string[]): number {
  for (let i = 0; i < linhas.length; i++) {
    const t = linhas[i]!.trim();
    if (/^([IVXLCDM]+)\s*[-—–.]\s+\S/i.test(t)) return i;
    if (/^I\s*[-—–.]\s*DOS\s+FATOS/i.test(t)) return i;
  }
  return -1;
}

function fimBlocoEnderecamento(linhas: string[]): number {
  let ultimo = -1;
  for (let i = 0; i < linhas.length; i++) {
    const t = linhas[i]!.trim();
    if (!t || parseMarcadorEspaco(t)) continue;
    if (
      /^(EXCELENT|DA COMARCA|JU[IÍ]ZO|Processo\s+n[º°]|AUTOR|R[ÉE]U|APELANTE|AGRAVANTE|PACIENTE)/i.test(
        t
      )
    ) {
      ultimo = i;
    }
  }
  return ultimo;
}

/** Remove colchetes de lacuna que a IA inventou (CPF, estado civil, valor etc.). */
export function limparPlaceholdersQualificacao(texto: string): string {
  return texto
    .replace(/\[(?:estado civil|ESTADO CIVIL)\]/gi, "")
    .replace(/\[(?:cpf|CPF)[^\]]*\]/gi, "")
    .replace(/\[NOME COMPLETO[^\]]*\]/gi, "")
    .replace(/\[qualifica[cç][aã]o[^\]]*\]/gi, "")
    .replace(/\[endere[cç]o[^\]]*\]/gi, "")
    .replace(/\[VALOR DA CAUSA\]/gi, "")
    .replace(/\[Inserir[^\]]*\]/gi, "")
    .replace(/,\s*,/g, ",")
    .replace(/,\s*\./g, ".")
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Remove qualificação gerada pela IA antes de reinjetar bloco determinístico. */
export function prepararCorpoParaInjecaoQualificacao(peca: string): string {
  const linhas = peca.replace(/\r\n/g, "\n").split("\n");
  const idxTopico = indicePrimeiroTopicoRomano(linhas);
  if (idxTopico < 0) return peca;

  const fimEnd = fimBlocoEnderecamento(linhas);
  if (fimEnd >= 0 && idxTopico > fimEnd) {
    const antes = linhas.slice(0, fimEnd + 1);
    const depois = linhas.slice(idxTopico);
    return [...antes, "", ...depois].join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  return linhas.slice(idxTopico).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** Remove blocos repetidos de qualificação (2+ “propor a presente”). */
export function deduplicarBlocosQualificacao(peca: string): string {
  const ocorrencias = [...peca.matchAll(/\bpropor a presente\b/gi)];
  if (ocorrencias.length < 2) return peca;

  const linhas = peca.split("\n");
  const idxTopico = indicePrimeiroTopicoRomano(linhas);
  if (idxTopico < 0) return peca;

  const saida: string[] = [];
  let qualVistas = 0;
  for (let i = 0; i < linhas.length; i++) {
    const l = linhas[i]!;
    if (
      /propor a presente|impetrando o presente|vem,?\s+respeitosamente/i.test(l)
    ) {
      qualVistas++;
      if (qualVistas > 1 && i < idxTopico) continue;
    }
    if (qualVistas > 1 && i < idxTopico && /em face de\s+/i.test(l)) {
      continue;
    }
    saida.push(l);
  }
  return saida.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** Garante endereçamento + epígrafe quando a IA começa no meio do corpo. */
export function garantirEstruturaCabecalho(
  peca: string,
  cab: {
    enderecamento: string;
    epigrafe?: string[];
    numeroProcesso?: string | null;
  }
): string {
  const texto = peca.replace(/\r\n/g, "\n").trim();
  const linhas = texto.split("\n");
  const idxTopico = indicePrimeiroTopicoRomano(linhas);
  const temEndereco = /EXCELENT[IÍ]SSIM/i.test(texto);

  if (temEndereco && idxTopico !== 0) {
    return texto;
  }

  const corpo = idxTopico >= 0 ? linhas.slice(idxTopico).join("\n") : texto;
  const prefixo = [
    cab.enderecamento.trim(),
    montarMarcadorEspaco6(cab.numeroProcesso ?? null, cab.epigrafe),
  ].join("\n");

  return `${prefixo}\n\n${corpo.trim()}`.replace(/\n{3,}/g, "\n\n").trim();
}

/** Insere título da peça (caixa alta) antes do primeiro tópico romano, se ausente. */
export function garantirTituloPeca(peca: string, tituloPeca: string): string {
  const titulo = tituloPeca.trim().toUpperCase();
  if (!titulo) return peca;
  const esc = titulo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(esc).test(peca)) return peca;

  const linhas = peca.replace(/\r\n/g, "\n").split("\n");
  const idxTopico = indicePrimeiroTopicoRomano(linhas);
  if (idxTopico < 0) return peca;

  const bloco = ["", MARCADOR_ESPACO_2, titulo, MARCADOR_ESPACO_2, ""];
  linhas.splice(idxTopico, 0, ...bloco);
  return linhas.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

const SINAIS_CONSUMIDOR_HC =
  /\b(enel|sabesp|energia\s+el[eé]trica|fornecimento\s+de\s+energia|concession[aá]ria|corte\s+indevido|multa\s+di[aá]ria\s+de\s+r\$|art\.?\s*300\s+do\s+cpc)\b/i;

/** Travas por área/espécie — HC sem “em face de” civil nem vazamento JEC. */
export function sanitizarPecaPorArea(
  peca: string,
  opts: { areaId: string; especie: string }
): string {
  let t = peca.replace(/\r\n/g, "\n");
  const esp = String(opts.especie ?? "").toLowerCase();
  const meta = metaEspecieDaArea(opts.areaId, opts.especie);
  const usaEmFaceDe = pecaUsaEmFaceDeReu(meta.conectivoPartes);

  if (opts.areaId === "criminal" && esp.includes("habeas")) {
    if (!usaEmFaceDe) {
      t = t.replace(
        /\bem face de\s+[\s\S]+?(?=\n\s*\n|\n(?:I\s*[-—–.]|vem,?\s+respeitosamente))/gi,
        meta.conectivoPartes ? `${meta.conectivoPartes}\n` : ""
      );
      t = t.replace(/\bem face de\s+[^\n]+/gi, "");
    }

    t = t
      .split("\n")
      .filter((l) => {
        const n = l.trim();
        if (!n) return true;
        if (SINAIS_CONSUMIDOR_HC.test(n)) return false;
        if (/\bmulta\s+di[aá]ria\b|\bastreintes\b/i.test(n)) return false;
        if (/\bem face de\s+(enel|sabesp|companhia)/i.test(n)) return false;
        return true;
      })
      .join("\n");
  }

  return deduplicarBlocosQualificacao(t).replace(/\n{3,}/g, "\n\n").trim();
}

export type OpcoesPosProcessarPeca = {
  areaId: string;
  especie: string;
  enderecamento?: string;
  epigrafe?: string[];
  tituloPeca?: string;
  numeroProcesso?: string | null;
  reinjetarQualificacao?: boolean;
};

export function posProcessarAntesQualificacao(
  peca: string,
  opcoes: OpcoesPosProcessarPeca
): string {
  let t = limparPlaceholdersQualificacao(peca);
  t = sanitizarPecaPorArea(t, {
    areaId: opcoes.areaId,
    especie: opcoes.especie,
  });
  if (opcoes.reinjetarQualificacao !== false) {
    t = prepararCorpoParaInjecaoQualificacao(t);
  }
  if (opcoes.enderecamento?.trim()) {
    t = garantirEstruturaCabecalho(t, {
      enderecamento: opcoes.enderecamento,
      epigrafe: opcoes.epigrafe,
      numeroProcesso: opcoes.numeroProcesso,
    });
  }
  return t;
}

export type OpcoesPosProcessarDepois = {
  areaId: string;
  especie: string;
  tituloPeca?: string;
  blocoValorCausa?: string;
  tituloSecaoValor?: string;
  romanoSecaoValor?: string;
};

/** Passagem final: título, valor da causa, normalização forense completa. */
export function posProcessarDepoisQualificacao(
  peca: string,
  opcoes: OpcoesPosProcessarDepois
): string {
  let t = peca;
  if (opcoes.tituloPeca?.trim()) {
    t = garantirTituloPeca(t, opcoes.tituloPeca);
  }
  if (opcoes.blocoValorCausa?.trim()) {
    t = garantirSecaoValorCausa(t, opcoes.blocoValorCausa, {
      tituloSecao: opcoes.tituloSecaoValor,
      romano: opcoes.romanoSecaoValor,
    });
  }
  t = limparPlaceholdersQualificacao(t);
  t = sanitizarPecaPorArea(t, {
    areaId: opcoes.areaId,
    especie: opcoes.especie,
  });
  return normalizarPecaGerada(t);
}
