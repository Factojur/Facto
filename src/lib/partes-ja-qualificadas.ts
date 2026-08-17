/**
 * Qualificação das partes por espécie de peça.
 *
 * — Petição inicial (e equivalentes): qualificação completa do polo ativo +
 *   linha "em face de" com qualificação completa do polo passivo.
 * — Peças incidentais/respostas: só nomes ("já qualificado nos autos");
 *   quem abre o parágrafo é SEMPRE a parte que o advogado representa (polo escolhido).
 */

import type { AutorValue } from "@/lib/autor-types";
import { autorVazio, autoresTemDadosMinimos } from "@/lib/autor-types";
import type { ReuValue } from "@/lib/reu-types";
import { reuTemDadosMinimos, reuVazio } from "@/lib/reu-types";
import { MODULO_JEC, moduloDaArea } from "@/lib/minuta-modulo";
import {
  areaUsaPoloAdvocacia,
  inferirPoloPorEspecie,
  type PoloAdvocacia,
} from "@/lib/polo-especies-por-area";

/** Incidentais: só nome. Petição inicial: qualificação mínima. */
export function pecaUsaPartesJaQualificadas(
  especie: string | null | undefined,
  idsPeticaoInicial: readonly string[] = MODULO_JEC.idsPeticaoInicial
): boolean {
  if (!especie) return false;
  return !idsPeticaoInicial.includes(especie);
}

export function resolverPoloClienteQualificacao(
  areaId: string,
  especie: string,
  poloExplicito?: PoloAdvocacia | null
): PoloAdvocacia {
  if (poloExplicito === "ativo" || poloExplicito === "passivo") {
    return poloExplicito;
  }
  if (areaUsaPoloAdvocacia(areaId)) {
    const inferido = inferirPoloPorEspecie(areaId, especie);
    if (inferido) return inferido;
  }
  const id = String(especie ?? "").toLowerCase();
  if (
    id === "contestacao" ||
    id.startsWith("contestacao-") ||
    id === "defesa" ||
    id.startsWith("informacoes-")
  ) {
    return "passivo";
  }
  return "ativo";
}

function ehEspecieRecursalOuContrarrazoes(especie: string): boolean {
  const e = String(especie ?? "").toLowerCase();
  if (e.includes("contrarrazoes")) return true;
  return (
    e.includes("recurso") ||
    e.includes("agravo") ||
    e.includes("apelacao") ||
    e === "embargos" ||
    e === "embargos-declaracao"
  );
}

function ehRespostaProcessual(especie: string): boolean {
  const e = String(especie ?? "").toLowerCase();
  return (
    e === "contestacao" ||
    e.startsWith("contestacao-") ||
    e === "defesa" ||
    e === "replica" ||
    e === "manifestacao" ||
    e.startsWith("informacoes-")
  );
}

export function partirNomesPartes(texto: string | null | undefined): string[] {
  const t = String(texto ?? "").replace(/\s+/g, " ").trim();
  if (!t) return [];
  return t
    .split(/\s+e\s+|;\s+|\s+\/\s+/i)
    .map((s) => s.replace(/^e\s+/i, "").trim())
    .filter((s) => s.length >= 3);
}

export function autoresAPartirDosNomes(texto: string): AutorValue[] {
  return partirNomesPartes(texto).map((nome) =>
    autorVazio({ nomeCompleto: nome })
  );
}

function parecePessoaJuridica(nome: string): boolean {
  return /\b(ltda|s\/?a|s\.a\.|me\b|epp\b|eireli|ss\b|educacional|faculdade|universidade|banco|seguradora|associa[cç][aã]o|instituto)\b/i.test(
    nome
  );
}

export function reusAPartirDosNomes(texto: string): ReuValue[] {
  return partirNomesPartes(texto).map((nome) => {
    if (parecePessoaJuridica(nome)) {
      return reuVazio({ tipo: "pj", razaoSocial: nome });
    }
    return reuVazio({ tipo: "pf", nomeCompleto: nome });
  });
}

function txt(v: string | null | undefined): string {
  return String(v ?? "").trim();
}

export function nomesAutoresCurto(
  autores: AutorValue[] | null | undefined
): string {
  const nomes = (autores ?? [])
    .map((a) => txt(a.nomeCompleto))
    .filter((n) => n.length >= 3);
  if (nomes.length === 0) return "";
  if (nomes.length === 1) return nomes[0]!;
  const ultimo = nomes.pop()!;
  return `${nomes.join(", ")} e ${ultimo}`;
}

export function nomesReusCurto(reus: ReuValue[] | null | undefined): string {
  const nomes = (reus ?? [])
    .map((r) =>
      r.tipo === "pj"
        ? txt(r.razaoSocial) || txt(r.nomeFantasia)
        : txt(r.nomeCompleto)
    )
    .filter((n) => n.length >= 2);
  if (nomes.length === 0) return "";
  if (nomes.length === 1) return nomes[0]!;
  const ultimo = nomes.pop()!;
  return `${nomes.join(", ")} e ${ultimo}`;
}

/** Petição inicial: qualificação mínima. Peça incidental: só o nome nos autos. */
export function autorOkParaChecklist(
  autores: AutorValue[] | null | undefined,
  jaQualificadas: boolean,
  nomeNosAutos?: string | null
): boolean {
  if (jaQualificadas) {
    return (
      nomesAutoresCurto(autores).length >= 3 ||
      String(nomeNosAutos ?? "").trim().length >= 3
    );
  }
  return autoresTemDadosMinimos(autores);
}

export function reuOkParaChecklist(
  reus: ReuValue[] | null | undefined,
  jaQualificadas: boolean,
  nomeNosAutos?: string | null
): boolean {
  if (jaQualificadas) {
    return (
      nomesReusCurto(reus).length >= 2 ||
      String(nomeNosAutos ?? "").trim().length >= 2
    );
  }
  return (reus ?? []).some(reuTemDadosMinimos);
}

export function fraseAnteSentenca(
  especie: string | null | undefined,
  dispositivo: string | null | undefined
): string | null {
  if (
    especie === "contestacao" ||
    especie === "replica" ||
    especie === "defesa" ||
    especie === "manifestacao"
  ) {
    return null;
  }
  const d = String(dispositivo ?? "").replace(/\s+/g, " ").trim();
  if (!d) return null;
  const low = d.toLowerCase();
  if (low.includes("parcial")) {
    return "ante a r. sentença que julgou parcialmente procedentes os pedidos iniciais";
  }
  if (low.includes("improced")) {
    return "ante a r. sentença que julgou improcedentes os pedidos iniciais";
  }
  if (low.includes("extint")) {
    return "ante a r. sentença que julgou extinto o processo";
  }
  if (low.includes("proced")) {
    return "ante a r. sentença que julgou procedentes os pedidos iniciais";
  }
  return `ante a r. sentença (${d})`;
}

function contarPartesCliente(
  polo: PoloAdvocacia,
  autores: AutorValue[] | null | undefined,
  reus: ReuValue[] | null | undefined
): number {
  if (polo === "passivo") {
    return (reus ?? []).filter((r) => {
      const n =
        r.tipo === "pj"
          ? txt(r.razaoSocial) || txt(r.nomeFantasia)
          : txt(r.nomeCompleto);
      return n.length >= 2;
    }).length;
  }
  return (autores ?? []).filter((a) => txt(a.nomeCompleto).length >= 3).length;
}

/** Trecho inicial do parágrafo (parte + adversário), antes do advogado. */
function montarTrechoPartesIntro(
  cliente: string,
  adversario: string,
  polo: PoloAdvocacia,
  rotuloAtivo: string,
  rotuloPassivo: string,
  especie: string,
  trechoAnte: string
): string {
  const e = String(especie ?? "").toLowerCase();

  if (ehEspecieRecursalOuContrarrazoes(e)) {
    return `${cliente}, já qualificado no processo em epígrafe${trechoAnte}`;
  }

  if (polo === "passivo" && ehRespostaProcessual(e)) {
    return (
      `${cliente}, já qualificado no processo em epígrafe, em face de ${adversario}, ` +
      `${rotuloAtivo} na presente ação, igualmente já qualificado${trechoAnte}`
    );
  }

  if (polo === "ativo" && (e === "replica" || e === "manifestacao")) {
    return (
      `${cliente}, já qualificado no processo em epígrafe, ${rotuloAtivo} na presente ação, ` +
      `em face de ${adversario}, ${rotuloPassivo} na presente demanda, igualmente já qualificado${trechoAnte}`
    );
  }

  if (polo === "passivo") {
    return (
      `${cliente}, já qualificado no processo em epígrafe, em face de ${adversario}, ` +
      `${rotuloAtivo} na presente ação, igualmente já qualificado${trechoAnte}`
    );
  }

  return (
    `${cliente}, já qualificado no processo em epígrafe, movido em face de ${adversario}, ` +
    `igualmente já qualificado${trechoAnte}`
  );
}

/** Parágrafo único até "Vossa Excelência" (sem CPF/endereço das partes). */
export function formatarBlocoPartesJaQualificadas(opcoes: {
  autores?: AutorValue[] | null;
  reus?: ReuValue[] | null;
  advogadoNome: string;
  oabQualificacao: string;
  enderecoAdvogado?: string | null;
  especie?: string | null;
  dispositivoSentenca?: string | null;
  rotuloPoloAtivo?: string;
  rotuloPoloPassivo?: string;
  areaId?: string;
  poloAdvocacia?: PoloAdvocacia | null;
}): string {
  const ativo = opcoes.rotuloPoloAtivo ?? "autor";
  const passivo = opcoes.rotuloPoloPassivo ?? "réu";
  const especie = opcoes.especie ?? "";
  const polo = resolverPoloClienteQualificacao(
    opcoes.areaId ?? "jec",
    especie,
    opcoes.poloAdvocacia
  );

  const nomeAtivo =
    nomesAutoresCurto(opcoes.autores) || `[NOME DO(A) ${ativo.toUpperCase()}]`;
  const nomePassivo =
    nomesReusCurto(opcoes.reus) || `[NOME DO(A) ${passivo.toUpperCase()}]`;
  const cliente = polo === "passivo" ? nomePassivo : nomeAtivo;
  const adversario = polo === "passivo" ? nomeAtivo : nomePassivo;

  const ante = fraseAnteSentenca(especie, opcoes.dispositivoSentenca);
  const trechoAnte = ante ? `, ${ante}` : "";

  const qtd = contarPartesCliente(polo, opcoes.autores, opcoes.reus);
  const pronomeAdv = qtd > 1 ? "seu advogado comum" : "seu advogado";
  const adv = txt(opcoes.advogadoNome) || "[NOME DO(A) ADVOGADO(A)]";
  const oab = txt(opcoes.oabQualificacao) || "OAB/[UF] [Número]";
  const endAdv = txt(opcoes.enderecoAdvogado) || "[endereço do advogado]";

  const intro = montarTrechoPartesIntro(
    cliente,
    adversario,
    polo,
    ativo,
    passivo,
    especie,
    trechoAnte
  );

  return (
    `${intro}, por ${pronomeAdv} que esta subscreve ` +
    `(procuração anexa), ${adv}, inscrito na ${oab}, ` +
    `com escritório profissional na ${endAdv}, onde recebe intimações, ` +
    "vem, respeitosamente, à presença de Vossa Excelência"
  );
}

/** Texto curto para o formulário (ajuda ao advogado). */
export function textoAjudaQualificacaoPeca(
  areaId: string,
  especie: string,
  polo: PoloAdvocacia,
  rotuloAtivo: string,
  rotuloPassivo: string
): string | null {
  const idsInicial = moduloDaArea(areaId).idsPeticaoInicial;
  if (pecaUsaPartesJaQualificadas(especie, idsInicial)) {
    const lado = polo === "ativo" ? rotuloAtivo : rotuloPassivo;
    const outro = polo === "ativo" ? rotuloPassivo : rotuloAtivo;
    const e = String(especie).toLowerCase();
    if (ehEspecieRecursalOuContrarrazoes(e)) {
      return `Nesta peça use apenas o nome do ${lado} (já qualificado nos autos). Não repita CPF, endereço nem qualificação completa. O recorrente/recorrido é quem você representa (${lado}).`;
    }
    if (polo === "passivo" && ehRespostaProcessual(e)) {
      return `A abertura começa pelo ${lado} (seu cliente), citando o ${outro} como já qualificado nos autos. Não inverta a ordem nem qualifique de novo com CPF/endereço.`;
    }
    return `Partes já nos autos: só nomes. O parágrafo introdutório abre pelo ${lado} que você representa e menciona o ${outro} como já qualificado.`;
  }
  return `Qualificação completa do ${rotuloAtivo}; depois do nome da ação, linha "em face de" com qualificação completa do ${rotuloPassivo}. Não use "já qualificado nos autos" na petição inicial.`;
}

/** Regras para o prompt do Redator (system/user). */
export function blocoInstrucoesQualificacaoPrompt(opcoes: {
  areaId: string;
  especie: string;
  partesJaQualificadas: boolean;
  polo?: PoloAdvocacia | null;
  rotuloAtivo?: string;
  rotuloPassivo?: string;
}): string {
  const ativo = opcoes.rotuloAtivo ?? "autor";
  const passivo = opcoes.rotuloPassivo ?? "réu";
  const polo = resolverPoloClienteQualificacao(
    opcoes.areaId,
    opcoes.especie,
    opcoes.polo
  );
  const cliente = polo === "ativo" ? ativo : passivo;
  const adversario = polo === "ativo" ? passivo : ativo;

  if (!opcoes.partesJaQualificadas) {
    return [
      "QUALIFICAÇÃO DAS PARTES — PEÇA INAUGURAL:",
      `1) Qualifique COMPLETAMENTE o ${ativo} (dados determinísticos do formulário).`,
      "2) Uma linha em branco → NOME DA AÇÃO/PEÇA em caixa alta.",
      `3) Linha própria iniciando com \"em face de\" + qualificação COMPLETA do ${passivo}, pelos fatos e fundamentos…`,
      "4) PROIBIDO \"já qualificado nos autos\", CPF/endereço inventados ou segundo bloco de qualificação completa.",
    ].join("\n");
  }

  const linhas = [
    "QUALIFICAÇÃO DAS PARTES — PEÇA INCIDENTAL / RESPOSTA:",
    `Polo do advogado: ${polo.toUpperCase()} (${cliente}).`,
    "Use LITERALMENTE o bloco determinístico de introdução (só nomes; partes já qualificadas nos autos).",
    "PROIBIDO repetir CPF, RG, CNPJ, estado civil ou endereço das partes.",
    "PROIBIDO segunda linha \"em face de\" com qualificação completa após o nome da peça.",
    `Quem abre o parágrafo é SEMPRE o ${cliente} (cliente), não o ${adversario}.`,
  ];

  const e = String(opcoes.especie).toLowerCase();
  if (ehEspecieRecursalOuContrarrazoes(e)) {
    linhas.push(
      "Recursos/contrarrazões: não use \"movido em face de\". O recorrente/recorrido é o cliente; a parte adversa não precisa de qualificação completa no cabeçalho."
    );
  } else if (polo === "passivo" && ehRespostaProcessual(e)) {
    linhas.push(
      `Contestação/defesa/informações: ${passivo} primeiro, ${ativo} como já qualificado nos autos (\"em face de [nome], ${ativo} na presente ação…\").`
    );
  } else if (e === "replica" || e === "manifestacao") {
    linhas.push(
      `Réplica/manifestação: ${ativo} na presente ação, em face do ${passivo} já qualificado — sem qualificação completa de nenhuma das partes.`
    );
  } else {
    linhas.push(
      "Demais incidentais: mantenha o padrão \"já qualificado no processo em epígrafe\" apenas com nomes."
    );
  }

  return linhas.join("\n");
}

/** Complemento no bloco de estrutura da espécie (prompt Redator). */
export function extrasQualificacaoEstruturaPrompt(
  areaId: string,
  especie: string
): string[] {
  const idsInicial = moduloDaArea(areaId).idsPeticaoInicial;
  if (!pecaUsaPartesJaQualificadas(especie, idsInicial)) {
    return [
      "   Qualificação: COMPLETA do polo ativo → nome da ação → \"em face de\" + qualificação COMPLETA do polo passivo.",
      "   Não use \"já qualificado nos autos\" nesta espécie.",
    ];
  }
  const e = String(especie).toLowerCase();
  const linhas = [
    "   Qualificação: SOMENTE nomes (\"já qualificado no processo em epígrafe\"). Não invente CPF/CNPJ/endereço.",
    "   Respeite o polo do advogado: quem abre o parágrafo é a parte representada (Estou atuando pelo…).",
  ];
  if (ehEspecieRecursalOuContrarrazoes(e)) {
    linhas.push(
      "   Recurso/contrarrazões: sem \"movido em face de\"; recorrente/recorrido = cliente do formulário."
    );
  } else if (e === "contestacao" || e.startsWith("contestacao-") || e === "defesa") {
    linhas.push(
      "   Contestação/defesa: polo passivo primeiro; polo ativo citado como já qualificado nos autos."
    );
  } else if (e === "replica" || e === "manifestacao") {
    linhas.push(
      "   Réplica/manifestação: polo ativo primeiro; polo passivo já qualificado nos autos."
    );
  }
  return linhas;
}