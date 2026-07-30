import type { PerfilUsuario } from "./perfil-types";

/** Campos que existem na tabela profiles desde o schema inicial */
export const CAMPOS_PROFILES_BASE = [
  "nome_completo",
  "cpf",
  "oab_numero",
] as const;

/** Campos extras — profiles (se migration rodou) ou user_metadata.perfil_dados */
export const CAMPOS_PERFIL_EXTRA = [
  "foto_base64",
  "telefone",
  "endereco",
  "numero",
  "complemento",
  "bairro",
  "cidade",
  "uf",
  "cep",
] as const;

export type PerfilDadosExtra = Partial<
  Record<(typeof CAMPOS_PERFIL_EXTRA)[number], string | null>
>;

export function extrairPerfilDados(
  metadata: Record<string, unknown> | undefined
): PerfilDadosExtra {
  const raw = metadata?.perfil_dados;
  if (!raw || typeof raw !== "object") return {};
  // foto_base64 nunca deve ser lida do user_metadata: esse dado vai para o
  // cookie de sessão do Supabase e uma imagem ali estoura o limite de
  // cabeçalhos HTTP (erro 431), derrubando o site inteiro.
  const dados = { ...(raw as PerfilDadosExtra) };
  delete dados.foto_base64;
  return dados;
}

export function mesclarPerfil(
  userId: string,
  email: string,
  profile: Record<string, unknown> | null,
  metadata: Record<string, unknown> | undefined
): PerfilUsuario {
  const extra = extrairPerfilDados(metadata);

  return {
    id: userId,
    email: (profile?.email as string) ?? email,
    nome_completo:
      (profile?.nome_completo as string) ??
      (metadata?.nome_completo as string) ??
      "",
    cpf: (profile?.cpf as string) ?? (metadata?.cpf as string) ?? "",
    oab_numero:
      (profile?.oab_numero as string) ?? (metadata?.oab_numero as string) ?? "",
    foto_base64:
      (profile?.foto_base64 as string | null) ?? extra.foto_base64 ?? null,
    telefone: (profile?.telefone as string | null) ?? extra.telefone ?? null,
    endereco: (profile?.endereco as string | null) ?? extra.endereco ?? null,
    numero: (profile?.numero as string | null) ?? extra.numero ?? null,
    complemento:
      (profile?.complemento as string | null) ?? extra.complemento ?? null,
    bairro: (profile?.bairro as string | null) ?? extra.bairro ?? null,
    cidade: (profile?.cidade as string | null) ?? extra.cidade ?? null,
    uf: (profile?.uf as string | null) ?? extra.uf ?? null,
    cep: (profile?.cep as string | null) ?? extra.cep ?? null,
  };
}

export function separarAtualizacao(body: Record<string, unknown>) {
  const base: Record<string, string | null> = {};
  const extra: PerfilDadosExtra = {};

  for (const campo of CAMPOS_PROFILES_BASE) {
    if (campo in body && typeof body[campo] === "string") {
      base[campo] = body[campo].trim();
    }
  }

  for (const campo of CAMPOS_PERFIL_EXTRA) {
    if (campo in body) {
      const valor = body[campo];
      extra[campo] =
        valor === null || valor === undefined
          ? null
          : typeof valor === "string"
            ? valor.trim()
            : null;
    }
  }

  return { base, extra };
}

export function erroColunaAusente(mensagem: string): boolean {
  return /column|schema cache|does not exist/i.test(mensagem);
}

/**
 * Remove qualquer chave "foto_base64" em qualquer nível de user_metadata.
 * Versões antigas do app guardaram a foto tanto na raiz quanto dentro de
 * perfil_dados — esse dado nunca deve morar aqui, pois infla o cookie de
 * sessão do Supabase e pode travar o site com erro 431.
 */
export function limparFotoDeMetadata(
  metadata: Record<string, unknown> | undefined
): { limpo: Record<string, unknown>; removeu: boolean } {
  let removeu = false;

  function limparRecursivo(valor: unknown): unknown {
    if (Array.isArray(valor)) return valor.map(limparRecursivo);
    if (valor && typeof valor === "object") {
      const entradas = Object.entries(valor as Record<string, unknown>).filter(
        ([chave]) => chave !== "foto_base64"
      );
      if (entradas.length !== Object.keys(valor).length) removeu = true;
      return Object.fromEntries(
        entradas.map(([chave, val]) => [chave, limparRecursivo(val)])
      );
    }
    return valor;
  }

  const limpo = limparRecursivo(metadata ?? {}) as Record<string, unknown>;
  return { limpo, removeu };
}
