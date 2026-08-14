/**
 * Envia precedente escolhido pelo usuário à fila de verificação (admin).
 * Não grava direto em base_conhecimento.
 *
 * Duplicidade:
 * - exata → não sobe
 * - possível → sobe com aviso_duplicidade
 * - nenhuma → sobe pendente
 */

import { createAdminClient } from "@/lib/supabase/admin";
import {
  completarEmentaPorLookup,
  type PrecedenteInterno,
} from "@/lib/juris-provedores/jurisprudencia-service";
import {
  analisarDuplicidade,
  type ParComparacao,
} from "@/lib/juris-provedores/duplicidade";

export type ResultadoSalvarPrecedente = {
  inserido: boolean;
  jaExistia: boolean;
  /** Subiu com alerta de possível duplicata. */
  avisoDuplicidade?: boolean;
  motivo?: string;
  id?: string;
  erro?: string;
};

function tituloDedup(p: PrecedenteInterno): string {
  if (p.numeroProcesso?.trim()) {
    return `${p.tribunal} — ${p.numeroProcesso.trim()}`;
  }
  return p.titulo.trim();
}

function montarTexto(p: PrecedenteInterno): string {
  const partes = [p.ementa.trim()];
  if (p.relator) partes.push(`Relator(a): ${p.relator}`);
  if (p.data) partes.push(`Data: ${p.data}`);
  if (p.url) partes.push(`Fonte oficial: ${p.url}`);
  return partes.join("\n\n");
}

async function carregarExistentesParaDedupe(
  admin: ReturnType<typeof createAdminClient>
): Promise<ParComparacao[]> {
  const existentes: ParComparacao[] = [];

  const { data: base } = await admin
    .from("base_conhecimento")
    .select("id, titulo, texto")
    .eq("categoria", "Jurisprudência")
    .limit(800);

  for (const row of base ?? []) {
    existentes.push({
      id: row.id,
      titulo: row.titulo,
      texto: row.texto,
    });
  }

  const { data: fila } = await admin
    .from("juris_verificacao")
    .select("id, titulo, ementa, url, numero_processo")
    .in("status", ["pendente", "aprovado"])
    .limit(500);

  for (const row of fila ?? []) {
    existentes.push({
      id: row.id,
      titulo: row.titulo,
      texto: row.ementa,
      url: row.url,
      numeroProcesso: row.numero_processo,
    });
  }

  return existentes;
}

/**
 * Alias legado: confirmação do usuário → fila de verificação (não base definitiva).
 */
export async function salvarNaBaseAdmin(
  precedente: PrecedenteInterno,
  usuarioId: string
): Promise<ResultadoSalvarPrecedente> {
  return enviarParaVerificacao(precedente, usuarioId);
}

export async function enviarParaVerificacao(
  precedente: PrecedenteInterno,
  usuarioId: string
): Promise<ResultadoSalvarPrecedente> {
  const admin = createAdminClient();
  const titulo = tituloDedup(precedente);

  if (!titulo || !precedente.ementa.trim()) {
    return { inserido: false, jaExistia: false, erro: "Precedente incompleto." };
  }

  let hidratado = precedente;
  try {
    const hyd = await completarEmentaPorLookup(precedente);
    if (hyd.lookup) hidratado = hyd.precedente;
  } catch {
    /* lookup opcional — segue com a ementa da busca */
  }
  const ementa = montarTexto(hidratado);

  let existentes: ParComparacao[] = [];
  try {
    existentes = await carregarExistentesParaDedupe(admin);
  } catch {
    /* segue sem dedupe se tabela ainda não existe */
  }

  const dup = analisarDuplicidade(
    {
      titulo,
      ementa: hidratado.ementa,
      url: hidratado.url,
      numeroProcesso: hidratado.numeroProcesso,
    },
    existentes
  );

  if (dup.nivel === "exata") {
    return {
      inserido: false,
      jaExistia: true,
      motivo: dup.motivo ?? "Duplicata exata — não enviado à verificação.",
      id: dup.similar?.id,
    };
  }

  const { data, error } = await admin
    .from("juris_verificacao")
    .insert({
      titulo,
      ementa,
      tribunal: hidratado.tribunal,
      data_julgado: hidratado.data ?? null,
      url: hidratado.url ?? null,
      numero_processo: hidratado.numeroProcesso ?? null,
      relator: hidratado.relator ?? null,
      fonte:
        precedente.origem === "jurisprudencias_ai"
          ? "jurisprudencias.ai"
          : precedente.origem,
      status: "pendente",
      aviso_duplicidade: dup.nivel === "possivel",
      motivo_aviso: dup.nivel === "possivel" ? dup.motivo ?? null : null,
      similar_titulo: dup.similar?.titulo ?? null,
      similar_base_id: dup.similar?.id ?? null,
      usuario_origem: usuarioId,
      escolhido_usuario: true,
      prioridade: 100,
    })
    .select("id")
    .single();

  if (error) {
    // Fallback: se a fila ainda não existe, tenta insert antigo na base
    if (/juris_verificacao|relation|does not exist/i.test(error.message)) {
      return salvarDiretoNaBaseFallback(admin, hidratado, usuarioId, titulo, ementa);
    }
    return { inserido: false, jaExistia: false, erro: error.message };
  }

  return {
    inserido: true,
    jaExistia: false,
    avisoDuplicidade: dup.nivel === "possivel",
    motivo: dup.motivo,
    id: data?.id,
  };
}

async function salvarDiretoNaBaseFallback(
  admin: ReturnType<typeof createAdminClient>,
  precedente: PrecedenteInterno,
  usuarioId: string,
  titulo: string,
  ementa: string
): Promise<ResultadoSalvarPrecedente> {
  const { data: existente } = await admin
    .from("base_conhecimento")
    .select("id")
    .eq("titulo", titulo)
    .eq("categoria", "Jurisprudência")
    .maybeSingle();

  if (existente?.id) {
    return { inserido: false, jaExistia: true, id: existente.id };
  }

  const { data, error } = await admin
    .from("base_conhecimento")
    .insert({
      titulo,
      categoria: "Jurisprudência",
      texto: ementa,
      fonte:
        precedente.origem === "jurisprudencias_ai"
          ? "jurisprudencias.ai"
          : precedente.origem,
      status: "pendente_verificacao",
      criado_por: usuarioId,
      usuario_origem: usuarioId,
    })
    .select("id")
    .single();

  if (error) {
    if (/fonte|status|usuario_origem/i.test(error.message)) {
      const { data: dataMin, error: errMin } = await admin
        .from("base_conhecimento")
        .insert({
          titulo,
          categoria: "Jurisprudência",
          texto: ementa,
          criado_por: usuarioId,
        })
        .select("id")
        .single();
      if (errMin) {
        return { inserido: false, jaExistia: false, erro: errMin.message };
      }
      return { inserido: true, jaExistia: false, id: dataMin?.id };
    }
    return { inserido: false, jaExistia: false, erro: error.message };
  }

  return { inserido: true, jaExistia: false, id: data?.id };
}

/**
 * Admin promove item da fila → base_conhecimento definitiva (status validado).
 */
export async function aprovarVerificacao(
  verificacaoId: string,
  adminUserId: string
): Promise<{ ok: boolean; baseId?: string; erro?: string }> {
  const admin = createAdminClient();
  const { data: item, error } = await admin
    .from("juris_verificacao")
    .select("*")
    .eq("id", verificacaoId)
    .maybeSingle();

  if (error || !item) {
    return { ok: false, erro: error?.message ?? "Item não encontrado." };
  }

  if (item.status === "aprovado" && item.base_conhecimento_id) {
    return { ok: true, baseId: item.base_conhecimento_id };
  }

  // Dedupe final antes de gravar na definitiva
  const { data: ja } = await admin
    .from("base_conhecimento")
    .select("id")
    .eq("titulo", item.titulo)
    .eq("categoria", "Jurisprudência")
    .maybeSingle();

  if (ja?.id) {
    await admin
      .from("juris_verificacao")
      .update({
        status: "rejeitado",
        revisado_em: new Date().toISOString(),
        revisado_por: adminUserId,
        motivo_aviso: "Rejeitado na aprovação: já existia na base definitiva.",
        base_conhecimento_id: ja.id,
      })
      .eq("id", verificacaoId);
    return {
      ok: false,
      erro: "Já existe na base definitiva — marcado como rejeitado.",
      baseId: ja.id,
    };
  }

  const { data: criado, error: errIns } = await admin
    .from("base_conhecimento")
    .insert({
      titulo: item.titulo,
      categoria: "Jurisprudência",
      texto: item.ementa,
      fonte: item.fonte,
      status: "validado",
      criado_por: adminUserId,
      usuario_origem: item.usuario_origem,
    })
    .select("id")
    .single();

  if (errIns) {
    return { ok: false, erro: errIns.message };
  }

  await admin
    .from("juris_verificacao")
    .update({
      status: "aprovado",
      revisado_em: new Date().toISOString(),
      revisado_por: adminUserId,
      base_conhecimento_id: criado.id,
    })
    .eq("id", verificacaoId);

  void import("@/lib/ia/indexar-conhecimento").then(({ indexarConhecimentoPorId }) =>
    indexarConhecimentoPorId(criado.id)
  );

  return { ok: true, baseId: criado.id };
}

export async function rejeitarVerificacao(
  verificacaoId: string,
  adminUserId: string,
  motivo?: string
): Promise<{ ok: boolean; erro?: string }> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("juris_verificacao")
    .update({
      status: "rejeitado",
      revisado_em: new Date().toISOString(),
      revisado_por: adminUserId,
      motivo_aviso: motivo?.trim() || "Rejeitado pelo admin.",
    })
    .eq("id", verificacaoId)
    .eq("status", "pendente");

  if (error) return { ok: false, erro: error.message };
  return { ok: true };
}
