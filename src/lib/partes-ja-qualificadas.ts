/**
 * Peças incidentais (recurso, contestação, réplica, embargos, execução):
 * as partes já estão nos autos — o cabeçalho usa só os nomes.
 */

import type { AutorValue } from "@/lib/autor-types";
import { autorVazio, autoresTemDadosMinimos } from "@/lib/autor-types";
import type { ReuValue } from "@/lib/reu-types";
import { reuTemDadosMinimos, reuVazio } from "@/lib/reu-types";
import { MODULO_JEC } from "@/lib/minuta-modulo";

/** Incidentais: só nome. Petição inicial: qualificação mínima. */
export function pecaUsaPartesJaQualificadas(
  especie: string | null | undefined,
  idsPeticaoInicial: readonly string[] = MODULO_JEC.idsPeticaoInicial
): boolean {
  if (!especie) return false;
  return !idsPeticaoInicial.includes(especie);
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
  especie: EspeciePecaJec | string | null | undefined,
  dispositivo: string | null | undefined
): string | null {
  if (especie === "contestacao" || especie === "replica") return null;
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

/** Parágrafo único até "Vossa Excelência" (sem CPF/endereço). */
export function formatarBlocoPartesJaQualificadas(opcoes: {
  autores?: AutorValue[] | null;
  reus?: ReuValue[] | null;
  advogadoNome: string;
  oabQualificacao: string;
  enderecoAdvogado?: string | null;
  especie?: EspeciePecaJec | string | null;
  dispositivoSentenca?: string | null;
}): string {
  const autor =
    nomesAutoresCurto(opcoes.autores) || "[NOME DO(A) AUTOR(A)]";
  const reu = nomesReusCurto(opcoes.reus) || "[NOME DO(A) RÉU(RÉ)]";
  const ante = fraseAnteSentenca(
    opcoes.especie,
    opcoes.dispositivoSentenca
  );
  const trechoAnte = ante ? `, ${ante}` : "";
  const qtd = (opcoes.autores ?? []).filter(
    (a) => txt(a.nomeCompleto).length >= 3
  ).length;
  const pronomeAdv = qtd > 1 ? "seu advogado comum" : "seu advogado";
  const adv = txt(opcoes.advogadoNome) || "[NOME DO(A) ADVOGADO(A)]";
  const oab = txt(opcoes.oabQualificacao) || "OAB/[UF] [Número]";
  const endAdv =
    txt(opcoes.enderecoAdvogado) || "[endereço do advogado]";

  return (
    `${autor}, já qualificado no processo em epígrafe, movido em face de ${reu}, ` +
    `igualmente já qualificado${trechoAnte}, por ${pronomeAdv} que esta subscreve ` +
    `(procuração anexa), ${adv}, inscrito na ${oab}, ` +
    `com escritório profissional na ${endAdv}, onde recebe intimações, ` +
    "vem, respeitosamente, à presença de Vossa Excelência"
  );
}
