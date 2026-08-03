import { apenasDigitos, formatarCep } from "@/lib/mascaras-endereco";

export type TipoReu = "pj" | "pf";

export type ReuValue = {
  id: string;
  tipo: TipoReu;
  /** Pessoa jurídica */
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  /** Pessoa física */
  nomeCompleto: string;
  cpf: string;
  nacionalidade: string;
  estadoCivil: string;
  profissao: string;
  /** Endereço (comum) */
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  email: string;
  telefone: string;
  /** Nome do arquivo opcional (cartão CNPJ / doc) */
  documentoAnexoNome?: string | null;
};

export function reuVazio(parcial?: Partial<ReuValue>): ReuValue {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `reu-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tipo: "pj",
    cnpj: "",
    razaoSocial: "",
    nomeFantasia: "",
    nomeCompleto: "",
    cpf: "",
    nacionalidade: "brasileiro(a)",
    estadoCivil: "",
    profissao: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    email: "",
    telefone: "",
    documentoAnexoNome: null,
    ...parcial,
  };
}

export function formatarCnpj(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12)
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export function formatarCpf(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function cnpjValido(valor: string): boolean {
  return apenasDigitos(valor).length === 14;
}

function enderecoFormatado(r: ReuValue): string {
  const partes = [
    r.logradouro?.trim(),
    r.numero?.trim() ? `nº ${r.numero.trim()}` : null,
    r.complemento?.trim(),
    r.bairro?.trim(),
    r.cidade?.trim() && r.uf?.trim()
      ? `${r.cidade.trim()}/${r.uf.trim().toUpperCase()}`
      : r.cidade?.trim() || r.uf?.trim(),
    r.cep?.trim() ? `CEP ${formatarCep(r.cep)}` : null,
  ].filter(Boolean);
  return partes.join(", ");
}

export function reuTemDadosMinimos(r: ReuValue): boolean {
  if (r.tipo === "pj") {
    return Boolean(r.razaoSocial.trim() || cnpjValido(r.cnpj));
  }
  return Boolean(r.nomeCompleto.trim() || apenasDigitos(r.cpf).length === 11);
}

/** Linha curta para checklist (nome + documento + cidade). */
export function resumoReu(r: ReuValue): { titulo: string; detalhe: string } {
  if (r.tipo === "pj") {
    const titulo =
      r.razaoSocial.trim() ||
      r.nomeFantasia.trim() ||
      (cnpjValido(r.cnpj) ? formatarCnpj(r.cnpj) : "Pessoa jurídica");
    const partes = [
      cnpjValido(r.cnpj) ? `CNPJ ${formatarCnpj(r.cnpj)}` : null,
      r.cidade.trim() && r.uf.trim()
        ? `${r.cidade.trim()}/${r.uf.trim().toUpperCase()}`
        : r.cidade.trim() || null,
    ].filter(Boolean);
    return { titulo, detalhe: partes.join(" · ") };
  }

  const titulo = r.nomeCompleto.trim() || "Pessoa física";
  const partes = [
    apenasDigitos(r.cpf).length === 11 ? `CPF ${formatarCpf(r.cpf)}` : null,
    r.cidade.trim() && r.uf.trim()
      ? `${r.cidade.trim()}/${r.uf.trim().toUpperCase()}`
      : r.cidade.trim() || null,
  ].filter(Boolean);
  return { titulo, detalhe: partes.join(" · ") };
}

export function formatarUmReu(r: ReuValue): string {
  const end = enderecoFormatado(r);
  if (r.tipo === "pj") {
    const nome =
      r.razaoSocial.trim() ||
      r.nomeFantasia.trim() ||
      "[RAZÃO SOCIAL DO RÉU]";
    const cnpj = cnpjValido(r.cnpj)
      ? formatarCnpj(r.cnpj)
      : "[CNPJ]";
    const fantasia =
      r.nomeFantasia.trim() &&
      r.nomeFantasia.trim().toLowerCase() !== r.razaoSocial.trim().toLowerCase()
        ? `, nome fantasia ${r.nomeFantasia.trim()}`
        : "";
    const sede = end ? `, com sede na ${end}` : ", com sede em [endereço completo]";
    const contato = [
      r.email.trim() ? `e-mail ${r.email.trim()}` : null,
      r.telefone.trim() ? `telefone ${r.telefone.trim()}` : null,
    ]
      .filter(Boolean)
      .join(", ");
    return (
      `${nome}${fantasia}, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº ${cnpj}${sede}` +
      (contato ? `, ${contato}` : "")
    );
  }

  const nome = r.nomeCompleto.trim() || "[NOME COMPLETO DO(A) RÉU(RÉ)]";
  const cpf =
    apenasDigitos(r.cpf).length === 11
      ? formatarCpf(r.cpf)
      : "[CPF]";
  const nac = r.nacionalidade.trim() || "brasileiro(a)";
  const civil = r.estadoCivil.trim() || "[estado civil]";
  const prof = r.profissao.trim() || "[profissão]";
  const dom = end
    ? `residente e domiciliado(a) na ${end}`
    : "residente e domiciliado(a) na [endereço completo]";
  const contato = [
    r.email.trim() ? `e-mail ${r.email.trim()}` : null,
    r.telefone.trim() ? `telefone ${r.telefone.trim()}` : null,
  ]
    .filter(Boolean)
    .join(", ");
  return (
    `${nome}, ${nac}, ${civil}, ${prof}, inscrito(a) no CPF sob o nº ${cpf}, ${dom}` +
    (contato ? `, ${contato}` : "")
  );
}

/** Texto após "em face de" — um ou vários réus. */
export function formatarQualificacaoReus(reus: ReuValue[]): string | null {
  const validos = reus.filter(reuTemDadosMinimos);
  if (validos.length === 0) return null;
  if (validos.length === 1) return formatarUmReu(validos[0]!);
  const partes = validos.map(formatarUmReu);
  const ultimo = partes.pop()!;
  return `${partes.join("; ")}; e ${ultimo}`;
}

export type DadosCnpjApi = {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
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

/** Consulta pública BrasilAPI (Receita). */
export async function consultarCnpj(
  cnpjBruto: string
): Promise<DadosCnpjApi | null> {
  const cnpj = apenasDigitos(cnpjBruto);
  if (cnpj.length !== 14) return null;

  const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
  if (!res.ok) return null;
  const data = (await res.json()) as Record<string, unknown>;

  const tel = String(data.ddd_telefone_1 ?? "").trim();

  return {
    cnpj: formatarCnpj(cnpj),
    razaoSocial: String(data.razao_social ?? "").trim(),
    nomeFantasia: String(data.nome_fantasia ?? "").trim(),
    cep: formatarCep(String(data.cep ?? "")),
    logradouro: String(data.logradouro ?? "").trim(),
    numero: String(data.numero ?? "").trim(),
    complemento: String(data.complemento ?? "").trim(),
    bairro: String(data.bairro ?? "").trim(),
    cidade: String(data.municipio ?? "").trim(),
    uf: String(data.uf ?? "").trim().toUpperCase(),
    email: String(data.email ?? "").trim(),
    telefone: tel,
  };
}

/**
 * Substitui o trecho "em face de ..." pela qualificação determinística.
 */
export function injetarQualificacaoReus(
  peca: string,
  qualificacao: string | null
): string {
  if (!qualificacao?.trim()) return peca;
  const texto = peca.replace(/\r\n/g, "\n");
  const substituto = `em face de ${qualificacao.trim()}, pelos fatos e fundamentos jurídicos a seguir expostos.`;

  const comPlaceholder = texto.replace(
    /em face de\s+\[[^\]]+\][^\n]*/i,
    substituto
  );
  if (comPlaceholder !== texto) return comPlaceholder;

  // Sem flag `s`: casa até linha em branco ou início de "I - DOS FATOS".
  return texto.replace(
    /em face de\s+[\s\S]+?(?=\n\s*\n|\nI\s*[-—–.]\s*DOS FATOS)/i,
    `${substituto}\n`
  );
}
