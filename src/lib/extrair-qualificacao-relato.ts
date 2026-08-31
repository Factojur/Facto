/**
 * Extração determinística de CPF, endereço e contato do relato (0 tokens).
 * Completa lacunas de endereço via ViaCEP (API pública, sem cota Gemini).
 */

import { LISTA_UFS } from "@/lib/autor-types";
import {
  apenasDigitos,
  buscarEnderecoPorCep,
  formatarCep,
  formatarTelefone,
} from "@/lib/mascaras-endereco";
import { formatarCpf, cpfValido } from "@/lib/reu-types";
import type { AutorValue } from "@/lib/autor-types";
import type { ReuValue } from "@/lib/reu-types";
import { reuVazio } from "@/lib/reu-types";
import { parecePessoaJuridica } from "@/lib/partes-ja-qualificadas";

export type QualificacaoExtraida = {
  cpf?: string;
  cnpj?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  email?: string;
  telefone?: string;
  rgNumero?: string;
  rgUf?: string;
  estadoCivil?: string;
  profissao?: string;
};

const UFS = new Set<string>(LISTA_UFS);

const RE_CPF = /\b(?:cpf\s*[:\s]*)?(\d{3}\.?\d{3}\.?\d{3}-?\d{2})\b/gi;
const RE_CNPJ =
  /\b(?:cnpj\s*[:\s]*)?(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})\b/gi;
const RE_CEP_ROTULADO =
  /\bcep\s*[:\s]*(\d{5}-?\d{3})\b/gi;
const RE_CEP_SOLTO = /\b(\d{5}-\d{3})\b/g;
const RE_RG =
  /\b(?:rg\s*[:\s]*)(\d{1,2}\.?\d{3}\.?\d{3}(?:-?[\dXx])?)\b(?:\s*(?:ssp|sspdgo|ssp\/?)\s*[-/]?\s*([A-Za-z]{2}))?/gi;
const RE_EMAIL = /\b([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})\b/gi;
const RE_TEL =
  /\b(?:tel(?:efone)?|celular|whatsapp|fone)\s*[:\s]*(\(?\d{2}\)?\s*9?\s*\d{4}[-\s]?\d{4})\b/gi;
const RE_TEL_SOLTO =
  /\b(\(?\d{2}\)?\s*9\s*\d{4}[-\s]?\d{4})\b/g;

const TIPO_LOG =
  "(?:Rua|R\\.|Av\\.?|Avenida|Travessa|Tv\\.|Alameda|Al\\.|Praça|Pç\\.?|Rodovia|Rod\\.|Estrada|Est\\.|Largo|Via|Boulevard|Beco|Viela|BR-\\d{2,3})";

const RE_ENDERECO_INTRO =
  /\b(?:residente(?:\s+e\s+domiciliad[oa])?|domiciliad[oa]|com\s+endere[cç]o|endere[cç]o|sito\s+[àa]|situad[oa]\s+[àaen]|estabelecid[oa]\s+[àaen]|localizad[oa]\s+[àaen]|sediado\s+[àaen])\s+(?:na\s+|no\s+|em\s+|à\s+|a\s+)?/gi;

const RE_LOGRADOURO_INICIO = new RegExp(`\\b${TIPO_LOG}\\b`, "gi");

const RE_COMPLEMENTO =
  /\b((?:apto?|apartamento|ap\.?|sala|sl\.?|bloco|bl\.?|casa|cs\.?|loja|conj(?:unto)?|andar|fundos?)\s*[\w./-]{1,20})\b/i;

const RE_BAIRRO =
  /\b(?:bairro|jd\.?|jardim|vl\.?|vila|pq\.?|parque|conj(?:unto)?\.?\s+hab(?:itacional)?)\s+([A-Za-zÀ-ú0-9][A-Za-zÀ-ú0-9\s.'-]{1,40}?)(?=\s*,|\s+cep|\s+[A-Za-zÀ-ú]+\s*[\/\-]\s*[A-Za-z]{2}|\s*$)/i;

function ufValida(uf: string | undefined): string | undefined {
  if (!uf) return undefined;
  const u = uf.trim().toUpperCase();
  return UFS.has(u) ? u : undefined;
}

function normalizarCpf(bruto: string): string {
  const d = apenasDigitos(bruto);
  if (d.length !== 11 || !cpfValido(d)) return "";
  return formatarCpf(d);
}

function normalizarCnpj(bruto: string): string {
  const d = apenasDigitos(bruto);
  return d.length === 14 ? d : "";
}

function limparLogradouro(s: string): string {
  return s
    .replace(/\s+/g, " ")
    .replace(/[,\s]+$/, "")
    .replace(/\s+(?:bairro|cep)\b.*$/i, "")
    .trim();
}

function extrairCep(bloco: string): string | undefined {
  const rotulado = [...bloco.matchAll(RE_CEP_ROTULADO)][0]?.[1];
  if (rotulado && apenasDigitos(rotulado).length === 8) {
    return formatarCep(rotulado);
  }
  const solto = [...bloco.matchAll(RE_CEP_SOLTO)][0]?.[1];
  if (solto && apenasDigitos(solto).length === 8) {
    return formatarCep(solto);
  }
  return undefined;
}

function extrairCidadeUf(bloco: string): { cidade?: string; uf?: string } {
  const padroes = [
    /\b([A-Za-zÀ-ú][A-Za-zÀ-ú\s.'-]{1,45}?)\s*[\/\-]\s*([A-Za-z]{2})\b/,
    /\b(?:cidade|munic[ií]pio)\s+(?:de\s+)?([A-Za-zÀ-ú][A-Za-zÀ-ú\s.'-]{1,45}?)\s*[\/\-,]\s*([A-Za-z]{2})\b/i,
    /\b([A-Za-zÀ-ú][A-Za-zÀ-ú\s.'-]{1,40}?)\s*,\s*(?:estado\s+d[eo]\s+|UF\s+)?([A-Za-z]{2})\b/i,
  ];
  for (const re of padroes) {
    const m = bloco.match(re);
    if (!m?.[1] || !m[2]) continue;
    const uf = ufValida(m[2]);
    if (!uf) continue;
    const cidade = m[1]
      .replace(/\b(?:cidade|munic[ií]pio|estado)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    if (cidade.length < 2 || cidade.length > 50) continue;
    if (/^(rua|av|cep|bairro|nº|cpf|rg)$/i.test(cidade)) continue;
    return { cidade, uf };
  }
  return {};
}

function fatiaEndereco(bloco: string, inicio: number): string {
  const resto = bloco.slice(inicio);
  const corte = resto.search(
    /\b(?:cep\b|e-?mail\b|telefone\b|celular\b|cpf\b|cnpj\b|rg\b|contra\b|em\s+face)/i
  );
  const ate = corte >= 0 ? resto.slice(0, corte) : resto.slice(0, 160);
  return ate.replace(/\s+/g, " ").replace(/[.,;\s]+$/, "").trim();
}

function extrairLogradouroBloco(bloco: string): {
  logradouro?: string;
  numero?: string;
  complemento?: string;
} {
  let inicio = -1;
  for (const m of bloco.matchAll(RE_ENDERECO_INTRO)) {
    if (m.index != null) {
      inicio = m.index + m[0].length;
      break;
    }
  }
  if (inicio < 0) {
    for (const m of bloco.matchAll(RE_LOGRADOURO_INICIO)) {
      if (m.index != null) {
        inicio = m.index;
        break;
      }
    }
  }
  if (inicio < 0) return {};

  let linha = fatiaEndereco(bloco, inicio);
  if (linha.length < 5) return {};

  const complemento = linha.match(RE_COMPLEMENTO)?.[1]?.trim();
  if (complemento) {
    linha = linha.replace(complemento, " ").replace(/\s+/g, " ").trim();
  }

  const bairroInline = linha.match(RE_BAIRRO);
  if (bairroInline?.[0]) {
    linha = linha.replace(bairroInline[0], " ").replace(/\s+/g, " ").trim();
  }

  // remove cidade/UF do fim da fatia
  linha = linha
    .replace(
      /,?\s*[A-Za-zÀ-ú][A-Za-zÀ-ú\s.'-]{1,40}\s*[\/\-]\s*[A-Za-z]{2}\s*$/i,
      ""
    )
    .replace(/[,\s]+$/, "")
    .trim();

  const numM =
    linha.match(
      /(?:,\s*|\s+)(?:n[º°o.]?\s*|n[uú]m(?:ero)?\s+|n\.\s*)(\d{1,6}[A-Za-z]?)\b/i
    ) || linha.match(/,\s*(\d{1,6}[A-Za-z]?)\s*$/);

  let numero = numM?.[1];
  let logradouro = limparLogradouro(linha);

  if (numM && numM.index != null) {
    const antes = limparLogradouro(linha.slice(0, numM.index));
    if (antes.length >= 5) logradouro = antes;
  }

  if (!numero) {
    const fim = logradouro.match(/^(.+?)\s+(\d{1,6}[A-Za-z]?)$/);
    if (fim?.[1] && fim[2] && fim[1].length >= 5) {
      logradouro = limparLogradouro(fim[1]);
      numero = fim[2];
    }
  }

  return {
    logradouro: logradouro || undefined,
    numero: numero || undefined,
    complemento: complemento || undefined,
  };
}

function extrairDeBloco(bloco: string): QualificacaoExtraida {
  const out: QualificacaoExtraida = {};

  for (const m of bloco.matchAll(RE_CPF)) {
    const cpf = normalizarCpf(m[1] ?? "");
    if (cpf) {
      out.cpf = cpf;
      break;
    }
  }
  for (const m of bloco.matchAll(RE_CNPJ)) {
    const cnpj = normalizarCnpj(m[1] ?? "");
    if (cnpj) {
      out.cnpj = cnpj;
      break;
    }
  }

  out.cep = extrairCep(bloco);

  for (const m of bloco.matchAll(RE_RG)) {
    if (m[1]) {
      out.rgNumero = m[1].replace(/\s+/g, "");
      const uf = ufValida(m[2]);
      if (uf) out.rgUf = uf;
      break;
    }
  }

  const email = [...bloco.matchAll(RE_EMAIL)][0]?.[1];
  if (email) out.email = email.toLowerCase();

  let tel = [...bloco.matchAll(RE_TEL)][0]?.[1];
  if (!tel) tel = [...bloco.matchAll(RE_TEL_SOLTO)][0]?.[1];
  if (tel) {
    const d = apenasDigitos(tel);
    if (d.length >= 10 && d.length <= 11) {
      out.telefone = formatarTelefone(d);
    }
  }

  const end = extrairLogradouroBloco(bloco);
  if (end.logradouro) out.logradouro = end.logradouro;
  if (end.numero) out.numero = end.numero;
  if (end.complemento) out.complemento = end.complemento;

  const bairro = bloco.match(RE_BAIRRO)?.[1]?.trim();
  if (bairro && bairro.length >= 2) out.bairro = bairro.replace(/\s+/g, " ");

  // Complemento fora da linha do logradouro
  if (!out.complemento) {
    const comp = bloco.match(RE_COMPLEMENTO)?.[1]?.trim();
    if (
      comp &&
      !/^(casad[oa]|solteir[oa]|divorciad[oa]|viúv[oa]|viuv[oa]|separad[oa])$/i.test(
        comp
      )
    ) {
      out.complemento = comp;
    }
  }

  const cidadeUf = extrairCidadeUf(bloco);
  if (cidadeUf.cidade) out.cidade = cidadeUf.cidade;
  if (cidadeUf.uf) out.uf = cidadeUf.uf;

  const qualPessoal = bloco.match(
    /,\s*brasileir[oa]\s*,\s*(solteir[oa]|casad[oa]|divorciad[oa]|viúv[oa]|viuv[oa]|separad[oa]|uni[aã]o\s+est[aá]vel)\s*,\s*([^,]{2,60})\s*,/i
  );
  if (qualPessoal?.[1]) {
    out.estadoCivil = qualPessoal[1].trim();
  }
  if (qualPessoal?.[2]) {
    out.profissao = qualPessoal[2].trim();
  }

  return out;
}

function dividirPoloAutorReu(texto: string): { autor: string; reu: string } {
  const t = String(texto ?? "");
  const m = t.match(/\b(?:contra|em\s+face\s+de|versus|vs\.?)\s+/i);
  if (m && m.index != null) {
    return {
      autor: t.slice(0, m.index),
      reu: t.slice(m.index),
    };
  }
  const cortou = t.match(
    /\b(?:a\s+)?([A-ZÀ-Ü][A-Za-zÀ-ú0-9\s.'-]{2,60}?)\s+cortou\b/i
  );
  if (cortou && cortou.index != null && cortou.index > 15) {
    return {
      autor: t.slice(0, cortou.index),
      reu: t.slice(cortou.index),
    };
  }
  const inss = t.match(/\b(?:o\s+)?INSS\b/i);
  if (inss && inss.index != null && inss.index > 20) {
    return {
      autor: t.slice(0, inss.index),
      reu: t.slice(inss.index),
    };
  }
  const indeferiu = t.match(/\b(?:o\s+)?INSS\s+indeferiu\b/i);
  if (indeferiu && indeferiu.index != null && indeferiu.index > 20) {
    return {
      autor: t.slice(0, indeferiu.index),
      reu: t.slice(indeferiu.index),
    };
  }
  return { autor: t, reu: "" };
}

/** Extrai qualificação por polo a partir do relato completo. */
export function extrairQualificacaoDoRelato(texto: string): {
  autor: QualificacaoExtraida;
  reu: QualificacaoExtraida;
} {
  const t = String(texto ?? "").trim();
  if (t.length < 15) {
    return { autor: {}, reu: {} };
  }
  const { autor, reu } = dividirPoloAutorReu(t);
  return {
    autor: extrairDeBloco(autor),
    reu: reu.trim().length >= 8 ? extrairDeBloco(reu) : {},
  };
}

/** Completa logradouro/bairro/cidade/UF via ViaCEP quando há CEP (0 tokens). */
export async function enriquecerQualificacaoComViaCep(
  q: QualificacaoExtraida
): Promise<QualificacaoExtraida> {
  const digitos = apenasDigitos(q.cep ?? "");
  if (digitos.length !== 8) return q;
  if (q.logradouro && q.bairro && q.cidade && q.uf) return q;
  try {
    const end = await buscarEnderecoPorCep(digitos);
    if (!end) return q;
    return {
      ...q,
      cep: end.cep || q.cep,
      logradouro: q.logradouro || end.endereco || undefined,
      bairro: q.bairro || end.bairro || undefined,
      cidade: q.cidade || end.cidade || undefined,
      uf: q.uf || ufValida(end.uf) || undefined,
    };
  } catch {
    return q;
  }
}

export async function enriquecerPartesComViaCep(partes: {
  autor: QualificacaoExtraida;
  reu: QualificacaoExtraida;
}): Promise<{ autor: QualificacaoExtraida; reu: QualificacaoExtraida }> {
  const [autor, reu] = await Promise.all([
    enriquecerQualificacaoComViaCep(partes.autor),
    enriquecerQualificacaoComViaCep(partes.reu),
  ]);
  return { autor, reu };
}

function temDado(q: QualificacaoExtraida): boolean {
  return Boolean(
    q.cpf ||
      q.cnpj ||
      q.cep ||
      q.logradouro ||
      q.email ||
      q.rgNumero ||
      q.cidade
  );
}

function mesclarAutor(
  atual: AutorValue,
  extra: QualificacaoExtraida
): AutorValue {
  return {
    ...atual,
    cpf: atual.cpf || extra.cpf || "",
    rgNumero: atual.rgNumero || extra.rgNumero || "",
    rgUf: atual.rgUf || extra.rgUf || "",
    cep: atual.cep || extra.cep || "",
    logradouro: atual.logradouro || extra.logradouro || "",
    numero: atual.numero || extra.numero || "",
    complemento: atual.complemento || extra.complemento || "",
    bairro: atual.bairro || extra.bairro || "",
    cidade: atual.cidade || extra.cidade || "",
    uf: atual.uf || extra.uf || "",
    email: atual.email || extra.email || "",
    telefone: atual.telefone || extra.telefone || "",
    estadoCivil: atual.estadoCivil || extra.estadoCivil || "",
    profissao: atual.profissao || extra.profissao || "",
  };
}

function coerceReuPessoaJuridica(r: ReuValue): ReuValue {
  const nome =
    r.tipo === "pj"
      ? r.razaoSocial || r.nomeFantasia
      : r.nomeCompleto;
  if (r.tipo === "pj" || !parecePessoaJuridica(nome ?? "")) return r;
  return reuVazio({
    tipo: "pj",
    razaoSocial: nome ?? "",
    cep: r.cep,
    logradouro: r.logradouro,
    numero: r.numero,
    complemento: r.complemento,
    bairro: r.bairro,
    cidade: r.cidade,
    uf: r.uf,
    email: r.email,
    telefone: r.telefone,
    cnpj: r.cnpj,
  });
}

function mesclarReu(atual: ReuValue, extra: QualificacaoExtraida): ReuValue {
  const base = coerceReuPessoaJuridica(atual);
  if (base.tipo === "pj") {
    return {
      ...base,
      cnpj: base.cnpj || extra.cnpj || "",
      cep: base.cep || extra.cep || "",
      logradouro: base.logradouro || extra.logradouro || "",
      numero: base.numero || extra.numero || "",
      complemento: base.complemento || extra.complemento || "",
      bairro: base.bairro || extra.bairro || "",
      cidade: base.cidade || extra.cidade || "",
      uf: base.uf || extra.uf || "",
      email: base.email || extra.email || "",
      telefone: base.telefone || extra.telefone || "",
    };
  }
  return {
    ...base,
    cpf: base.cpf || extra.cpf || "",
    cep: base.cep || extra.cep || "",
    logradouro: base.logradouro || extra.logradouro || "",
    numero: base.numero || extra.numero || "",
    complemento: base.complemento || extra.complemento || "",
    bairro: base.bairro || extra.bairro || "",
    cidade: base.cidade || extra.cidade || "",
    uf: base.uf || extra.uf || "",
    email: base.email || extra.email || "",
    telefone: base.telefone || extra.telefone || "",
  };
}

/** Aplica dados extraídos do relato sem sobrescrever campos já preenchidos. */
export function aplicarQualificacaoExtraidaRelato(
  autores: AutorValue[],
  reus: ReuValue[],
  relato: string,
  cache?: { autor?: QualificacaoExtraida; reu?: QualificacaoExtraida } | null
): { autores: AutorValue[]; reus: ReuValue[] } {
  const doRelato = extrairQualificacaoDoRelato(relato);
  const autor = { ...doRelato.autor, ...(cache?.autor ?? {}) };
  const reu = { ...doRelato.reu, ...(cache?.reu ?? {}) };
  if (!temDado(autor) && !temDado(reu)) {
    return { autores, reus };
  }
  const autoresOut =
    autores.length > 0
      ? autores.map((a, i) => (i === 0 ? mesclarAutor(a, autor) : a))
      : autores;
  const reusOut =
    reus.length > 0
      ? reus.map((r, i) => {
          const base = coerceReuPessoaJuridica(r);
          return i === 0 ? mesclarReu(base, reu) : base;
        })
      : reus;
  return { autores: autoresOut, reus: reusOut };
}

/** UF útil para comarca/tribunais quando o relato só traz endereço da parte. */
export function ufDaQualificacao(partes: {
  autor: QualificacaoExtraida;
  reu: QualificacaoExtraida;
}): string | null {
  return ufValida(partes.autor.uf) ?? ufValida(partes.reu.uf) ?? null;
}
