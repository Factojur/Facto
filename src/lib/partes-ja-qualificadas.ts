/**
 * Qualificação das partes — LAYOUT forense (não reescreve o mérito da IA).
 *
 * — Espécies com qualificação completa (idsPeticaoInicial / inaugurais do rito):
 *   polo ativo completo + nome da peça + "em face de" + polo passivo completo.
 * — Peças incidentais: só nomes ("já qualificado") + epígrafe com Processo nº quando houver.
 * Conteúdo (fatos, direito, pedidos) = liberdade da IA; aqui só tipografia do cabeçalho.
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

/**
 * Peça inaugural da área (= exige qualificação completa das partes).
 * O *nome* forense vem do módulo (reclamação, queixa, HC, MS, petição inicial…).
 * Alias `peticao-inicial` no chat ainda conta como inaugural p/ qualificação
 * (evita “já qualificado” errado); o título é corrigido por `canonizarEspecieDaArea`.
 */
export function especieEhPeticaoInaugural(
  especie: string | null | undefined,
  idsPeticaoInicial: readonly string[] = MODULO_JEC.idsPeticaoInicial
): boolean {
  if (!especie) return false;
  const e = String(especie)
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  if (idsPeticaoInicial.includes(e)) return true;
  if (
    idsPeticaoInicial.some(
      (id) =>
        id === e ||
        id.normalize("NFD").replace(/\p{M}/gu, "") === e
    )
  ) {
    return true;
  }
  // Alias genérico do chat — só modo de qualificação (não redefine o nome da peça)
  if (
    e === "peticao-inicial" ||
    e === "inicial" ||
    e === "reclamacao" ||
    e === "reclamacao-trabalhista" ||
    e === "reclamatoria" ||
    e === "queixa-crime" ||
    e === "queixa"
  ) {
    return true;
  }
  return false;
}

/** Incidentais: só nome. Petição inicial: qualificação mínima. */
export function pecaUsaPartesJaQualificadas(
  especie: string | null | undefined,
  idsPeticaoInicial: readonly string[] = MODULO_JEC.idsPeticaoInicial
): boolean {
  return !especieEhPeticaoInaugural(especie, idsPeticaoInicial);
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
    id === "pedido-contraposto" ||
    id === "reconvencao" ||
    id.startsWith("contestacao-") ||
    id === "defesa" ||
    id.includes("defesa") ||
    id === "resposta-acusacao" ||
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
    e === "pedido-contraposto" ||
    e === "reconvencao" ||
    e.startsWith("contestacao-") ||
    e === "defesa" ||
    e.includes("defesa") ||
    e === "resposta-acusacao" ||
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
  const n = String(nome ?? "").trim();
  if (!n) return false;
  return (
    /\b(ltda|s\/?a|s\.a\.|me\b|epp\b|eireli|ss\b|educacional|faculdade|universidade|banco|seguradora|associa[cç][aã]o|instituto|inss\b|autarquia|uni[aã]o|holding|comercio|comércio|servi[cç]os)\b/i.test(
      n
    ) ||
    /\b(enel|cpfl|cemig|light|equatorial|neoenergia|eletropaulo|aes\s+eletropaulo|sabesp|copasa|sanepar|celesc|celg|energisa|amazonas\s+energia)\b/i.test(
      n
    ) ||
    /\bconcession[aá]ri[ao]\b/i.test(n)
  );
}

export { parecePessoaJuridica };

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
    especie === "pedido-contraposto" ||
    especie === "reconvencao" ||
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

/** Infinitivo após "Vossa Excelência", antes do nome da peça em caixa alta. */
export function prefixoAntesDoNomePeca(especie: string): string {
  const e = String(especie ?? "").toLowerCase();
  if (e.includes("embargos")) return "opor os presentes";
  if (
    e.includes("agravo") ||
    e.includes("apelacao") ||
    e.includes("recurso")
  ) {
    return "interpor o presente";
  }
  if (
    e.includes("contestacao") ||
    e.includes("defesa") ||
    e.includes("resposta")
  ) {
    return "apresentar a presente";
  }
  if (e.includes("replica") || e.includes("manifestacao")) {
    return "oferecer a presente";
  }
  if (
    e === "execucao" ||
    e === "cumprimento-sentenca" ||
    e === "cumprimento-alimentos" ||
    e === "execucao-titulo"
  ) {
    return "requerer o presente";
  }
  return "";
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
  const endRaw = txt(opcoes.enderecoAdvogado);
  const endAdv =
    endRaw && endRaw !== "," && endRaw.length >= 5
      ? endRaw
      : "[endereço do advogado]";

  const intro = montarTrechoPartesIntro(
    cliente,
    adversario,
    polo,
    ativo,
    passivo,
    especie,
    trechoAnte
  );

  const prefixo = prefixoAntesDoNomePeca(especie);
  return (
    `${intro}, por ${pronomeAdv} que esta subscreve ` +
    `(procuração anexa), ${adv}, inscrito na ${oab}, ` +
    `com escritório profissional na ${endAdv}, onde recebe intimações, ` +
    `vem, respeitosamente, à presença de Vossa Excelência` +
    (prefixo ? `, ${prefixo}` : "")
  );
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
      "FORMATAÇÃO — QUALIFICAÇÃO COMPLETA (modelo forense desta espécie):",
      "A IA redige com os dados do dossiê/cadastro; o sistema só espera este LAYOUT visual:",
      `1) Bloco com qualificação completa do ${ativo} (use o que houver nos fatos/formulário; não invente campos).`,
      "2) Linha em branco → NOME FORENSE DA PEÇA em caixa alta (o nome que a espécie/rito comportar).",
      `3) Linha própria: \"em face de\" + qualificação completa do ${passivo} (dados disponíveis), pelos fatos e fundamentos…`,
      "4) Nesta espécie NÃO use o atalho \"já qualificado nos autos\" — esse molde é de peça incidental.",
      "5) Conteúdo (fatos, direito, pedidos) = liberdade total da IA; aqui só a ordem tipográfica do cabeçalho.",
    ].join("\n");
  }

  const linhas = [
    "FORMATAÇÃO — PARTES JÁ QUALIFICADAS (modelo forense incidental):",
    `Polo do advogado: ${polo.toUpperCase()} (${cliente}).`,
    "LAYOUT: só nomes + \"já qualificado no processo em epígrafe\" (ou equivalente do rito).",
    "Não repita CPF/CNPJ/endereço das partes no cabeçalho.",
    "Epígrafe: se houver número de processo nos autos/dossiê, use Processo nº na forma forense (bloco de linhas após o endereçamento).",
    `Quem abre o parágrafo é o ${cliente} (parte representada).`,
    "Conteúdo da peça = liberdade da IA; aqui só o molde visual do cabeçalho.",
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
      "   Formatação do cabeçalho (qualificação completa): polo ativo → nome forense da peça → \"em face de\" + polo passivo.",
      "   Sem atalho \"já qualificado\" nesta espécie. Dados = dossiê/IA; layout = praxe forense.",
    ];
  }
  const e = String(especie).toLowerCase();
  const linhas = [
    "   Formatação do cabeçalho (incidental): só nomes + já qualificado; epígrafe com Processo nº se constar no dossiê.",
    "   Quem abre o parágrafo é a parte representada (polo do advogado).",
  ];
  if (ehEspecieRecursalOuContrarrazoes(e)) {
    linhas.push(
      "   Recurso/contrarrazões: sem \"movido em face de\"; recorrente/recorrido = cliente do formulário."
    );
  } else if (
    e === "contestacao" ||
    e === "pedido-contraposto" ||
    e === "reconvencao" ||
    e.startsWith("contestacao-") ||
    e === "defesa"
  ) {
    linhas.push(
      "   Contestação/defesa/reconvenção: polo passivo primeiro; polo ativo citado como já qualificado nos autos."
    );
  } else if (e === "replica" || e === "manifestacao") {
    linhas.push(
      "   Réplica/manifestação: polo ativo primeiro; polo passivo já qualificado nos autos."
    );
  }
  return linhas;
}