/**
 * Qualificação da(s) parte(s) autora(s) (PF) no JEC — espelha o padrão do réu PF,
 * com RG + UF emissora. Lista com checklist compacta (como réus).
 */

import { apenasDigitos, formatarCep } from "@/lib/mascaras-endereco";
import { formatarCpf, cpfValido } from "@/lib/reu-types";

export const LISTA_UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export type UfBrasil = (typeof LISTA_UFS)[number];

export type AutorValue = {
  id: string;
  nomeCompleto: string;
  cpf: string;
  nacionalidade: string;
  estadoCivil: string;
  profissao: string;
  /** Número do RG (com ou sem pontuação). */
  rgNumero: string;
  /** UF emissora do RG (ex.: SP). */
  rgUf: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  email: string;
  telefone: string;
};

function novoIdAutor(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `autor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function autorVazio(parcial?: Partial<AutorValue>): AutorValue {
  const { id: idParcial, ...resto } = parcial ?? {};
  return {
    id: idParcial || novoIdAutor(),
    nomeCompleto: "",
    cpf: "",
    nacionalidade: "brasileiro(a)",
    estadoCivil: "",
    profissao: "",
    rgNumero: "",
    rgUf: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    email: "",
    telefone: "",
    ...resto,
  };
}

/** Aceita rascunhos antigos (objeto único) ou lista. */
export function normalizarAutores(
  valor: AutorValue | AutorValue[] | null | undefined
): AutorValue[] {
  if (!valor) return [];
  if (Array.isArray(valor)) {
    return valor.map((a) => autorVazio({ ...a, id: a.id || novoIdAutor() }));
  }
  return [autorVazio({ ...valor, id: valor.id || novoIdAutor() })];
}

/** Formata RG como 00.000.000-0 (aceita variações). */
export function formatarRgNumero(valor: string): string {
  const limpo = valor.replace(/[^0-9Xx]/g, "").toUpperCase().slice(0, 10);
  if (!limpo) return "";
  if (limpo.length === 1) return limpo;
  const d = limpo.slice(0, -1).replace(/\D/g, "");
  const dv = limpo.slice(-1);
  let out = d;
  if (d.length > 2) out = `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length > 5) out = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length > 8) out = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}`;
  return `${out}-${dv}`;
}

export function formatarRgComUf(numero: string, uf: string): string {
  const n = numero.trim() || "[RG]";
  const u = uf.trim().toUpperCase();
  if (!u) return n;
  return `${n}/${u}`;
}

function formatarEnderecoAutor(a: AutorValue): string | null {
  const log = String(a.logradouro ?? "").trim();
  const num = String(a.numero ?? "").trim();
  const comp = String(a.complemento ?? "").trim();
  const bairro = String(a.bairro ?? "").trim();
  const cidade = String(a.cidade ?? "").trim();
  const uf = String(a.uf ?? "").trim().toUpperCase();
  const cep = String(a.cep ?? "").trim() ? formatarCep(a.cep) : "";
  if (!log && !cidade) return null;
  const partes: string[] = [];
  if (log) {
    partes.push(num ? `${log}, nº ${num}` : log);
  }
  if (comp) partes.push(comp);
  if (bairro) partes.push(bairro);
  if (cidade && uf) partes.push(`${cidade}/${uf}`);
  else if (cidade) partes.push(cidade);
  if (cep) partes.push(`CEP ${cep}`);
  return partes.join(", ");
}

export function autorTemDadosMinimos(a: AutorValue | null | undefined): boolean {
  if (!a) return false;
  const nome = String(a.nomeCompleto ?? "").trim().length >= 5;
  const cpfOk = apenasDigitos(a.cpf ?? "").length === 11;
  return nome || cpfOk;
}

export function autoresTemDadosMinimos(
  autores: AutorValue[] | null | undefined
): boolean {
  return (autores ?? []).some(autorTemDadosMinimos);
}

/** Linha curta para checklist (nome + CPF + cidade). */
export function resumoAutor(a: AutorValue): { titulo: string; detalhe: string } {
  const titulo = a.nomeCompleto.trim() || "Pessoa física";
  const partes = [
    apenasDigitos(a.cpf).length === 11
      ? `CPF ${formatarCpf(a.cpf)}`
      : null,
    a.rgNumero.trim()
      ? `RG ${formatarRgComUf(formatarRgNumero(a.rgNumero), a.rgUf)}`
      : null,
    a.cidade.trim() && a.uf.trim()
      ? `${a.cidade.trim()}/${a.uf.trim().toUpperCase()}`
      : a.cidade.trim() || null,
  ].filter(Boolean);
  return { titulo, detalhe: partes.join(" · ") };
}

export { formatarCpf, cpfValido };

/**
 * Trecho de um autor (sem advogado).
 */
function t(v: string | null | undefined): string {
  return String(v ?? "").trim();
}

export function formatarUmAutor(a: AutorValue): string {
  const nome = t(a.nomeCompleto) || "[NOME COMPLETO DO(A) AUTOR(A)]";
  const nac = t(a.nacionalidade) || "brasileiro(a)";
  const civil = t(a.estadoCivil) || "[estado civil]";
  const prof = t(a.profissao) || "[profissão]";
  const cpf =
    apenasDigitos(a.cpf ?? "").length === 11 ? formatarCpf(a.cpf) : "[CPF]";
  const rg = formatarRgComUf(
    t(a.rgNumero) ? formatarRgNumero(a.rgNumero) : "[RG]",
    a.rgUf ?? ""
  );
  const end = formatarEnderecoAutor(a);
  const dom = end
    ? `residente e domiciliado(a) na ${end}`
    : "residente e domiciliado(a) na [endereço completo]";
  const emailTxt = t(a.email);
  const email = emailTxt
    ? `endereço eletrônico ${emailTxt}`
    : "endereço eletrônico [e-mail]";

  return (
    `${nome}, ${nac}, ${civil}, ${prof}, inscrito(a) no CPF sob nº ${cpf}, ` +
    `portador(a) do RG nº ${rg}, ${dom}, ${email}`
  );
}

/**
 * Trecho da(s) parte(s) autora(s) (sem advogado).
 */
export function formatarQualificacaoAutores(
  autores: AutorValue[] | null | undefined
): string | null {
  const validos = (autores ?? []).filter(autorTemDadosMinimos);
  if (validos.length === 0) return null;
  if (validos.length === 1) return formatarUmAutor(validos[0]!);
  const partes = validos.map(formatarUmAutor);
  const ultimo = partes.pop()!;
  return `${partes.join("; ")}; e ${ultimo}`;
}

/** @deprecated Preferir formatarQualificacaoAutores */
export function formatarQualificacaoAutorParte(
  a: AutorValue | null | undefined
): string | null {
  if (!a) return null;
  return formatarQualificacaoAutores([a]);
}

/** Parágrafo completo até "propor a presente". */
export function formatarBlocoQualificacaoAutor(opcoes: {
  autores?: AutorValue[] | null;
  /** Compat: um único autor. */
  autor?: AutorValue | null;
  advogadoNome: string;
  oabQualificacao: string;
  enderecoAdvogado?: string | null;
  fundamentoLei?: string;
}): string {
  const lista =
    opcoes.autores ??
    (opcoes.autor ? [opcoes.autor] : null);
  const parte =
    formatarQualificacaoAutores(lista) ??
    "[NOME COMPLETO DO(A) AUTOR(A)], [nacionalidade], [estado civil], [profissão], inscrito(a) no CPF sob nº [CPF], " +
      "portador(a) do RG nº [RG], residente e domiciliado(a) na [endereço completo], " +
      "endereço eletrônico [e-mail]";

  const qtd = (lista ?? []).filter(autorTemDadosMinimos).length;
  const pronomeAdv = qtd > 1 ? "seu advogado comum" : "seu advogado";

  const adv = t(opcoes.advogadoNome) || "[NOME DO(A) ADVOGADO(A)]";
  const oab = t(opcoes.oabQualificacao) || "OAB/[UF] [Número]";
  const endAdv =
    t(opcoes.enderecoAdvogado) || "[endereço do advogado]";

  const fundamento =
    t(opcoes.fundamentoLei) || "na Lei nº 9.099/95";

  return (
    `${parte}, por ${pronomeAdv} que esta subscreve ` +
    `(procuração anexa), ${adv}, inscrito na ${oab}, ` +
    `com escritório profissional na ${endAdv}, onde recebe intimações, ` +
    `vem, respeitosamente, à presença de Vossa Excelência, com fundamento ${fundamento}, ` +
    "propor a presente"
  );
}

/**
 * Substitui o bloco de qualificação do autor (até "propor a presente").
 */
export function injetarQualificacaoAutor(
  peca: string,
  bloco: string | null
): string {
  if (!bloco?.trim()) return peca;
  const texto = peca.replace(/\r\n/g, "\n");
  const substituto = bloco.trim();

  const comPlaceholder = texto.replace(
    /\[NOME COMPLETO DO\(A\) AUTOR\(A\)\][\s\S]*?propor a presente/i,
    substituto
  );
  if (comPlaceholder !== texto) return comPlaceholder;

  const jaQualificado = texto.replace(
    /^.+?já qualificado(?:a|os|as)? no processo em ep[ií]grafe[\s\S]*?à presença de Vossa Excelência(?:, [^\n]+)?/im,
    substituto
  );
  if (jaQualificado !== texto) return jaQualificado;

  const passivoPrimeiro = texto.replace(
    /^.+?em face de .+?na presente a[cç][aã]o, igualmente j[aá] qualificado[\s\S]*?à presença de Vossa Excelência(?:, [^\n]+)?/im,
    substituto
  );
  if (passivoPrimeiro !== texto) return passivoPrimeiro;

  return texto.replace(
    /^.+?por seu advogado(?: comum)? que esta subscreve[\s\S]*?propor a presente/im,
    substituto
  );
}
