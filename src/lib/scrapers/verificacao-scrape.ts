/**
 * Enfileira julgados de scrape na juris_verificacao (todos, não só selecionados).
 * Seleção do usuário eleva prioridade via marcarEscolhidoNaVerificacao.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import {
  analisarDuplicidade,
  type ParComparacao,
} from "@/lib/juris-provedores/duplicidade";
import type { JulgadoScrape } from "@/lib/scrapers/types";

async function carregarExistentes(
  admin: ReturnType<typeof createAdminClient>
): Promise<ParComparacao[]> {
  const existentes: ParComparacao[] = [];
  const { data: base } = await admin
    .from("base_conhecimento")
    .select("id, titulo, texto")
    .eq("categoria", "Jurisprudência")
    .limit(600);
  for (const row of base ?? []) {
    existentes.push({ id: row.id, titulo: row.titulo, texto: row.texto });
  }
  const { data: fila } = await admin
    .from("juris_verificacao")
    .select("id, titulo, ementa, url, numero_processo")
    .in("status", ["pendente", "aprovado"])
    .limit(400);
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

/** Insere na fila todos os julgados novos do scrape (duplicata exata é pulada). */
export async function enfileirarScrapeNaVerificacao(
  julgados: JulgadoScrape[],
  opcoes?: { scrapeCacheId?: string; fonte?: string }
): Promise<{ inseridos: number; ignorados: number }> {
  const admin = createAdminClient();
  let existentes: ParComparacao[] = [];
  try {
    existentes = await carregarExistentes(admin);
  } catch {
    /* tabela pode não existir ainda */
  }

  let inseridos = 0;
  let ignorados = 0;
  const fonte = opcoes?.fonte ?? "tjsp_scraper";

  for (const j of julgados) {
    if (!j.ementa?.trim() || !j.titulo?.trim()) {
      ignorados++;
      continue;
    }
    if (!j.numeroProcesso?.match(/\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/)) {
      ignorados++;
      continue;
    }
    if (
      /esajCelula|escolhaBeta|suportesistemastjsp|Identificar-se|Peticionamento Eletr/i.test(
        j.ementa
      )
    ) {
      ignorados++;
      continue;
    }

    const dup = analisarDuplicidade(
      {
        titulo: j.titulo,
        ementa: j.ementa,
        url: j.url,
        numeroProcesso: j.numeroProcesso,
      },
      existentes
    );

    if (dup.nivel === "exata") {
      ignorados++;
      continue;
    }

    const { data, error } = await admin
      .from("juris_verificacao")
      .insert({
        titulo: j.titulo,
        ementa: j.ementa,
        tribunal: j.tribunal,
        data_julgado: j.data ?? null,
        url: j.url ?? null,
        numero_processo: j.numeroProcesso ?? null,
        relator: j.relator ?? null,
        fonte,
        status: "pendente",
        prioridade: 0,
        escolhido_usuario: false,
        aviso_duplicidade: dup.nivel === "possivel",
        motivo_aviso: dup.nivel === "possivel" ? dup.motivo ?? null : null,
        similar_titulo: dup.similar?.titulo ?? null,
        similar_base_id: dup.similar?.id ?? null,
        scrape_cache_id: opcoes?.scrapeCacheId ?? null,
      })
      .select("id, titulo, ementa, url, numero_processo")
      .single();

    if (error) {
      console.error("[enfileirar scrape]", error.message);
      ignorados++;
      continue;
    }

    if (data) {
      existentes.push({
        id: data.id,
        titulo: data.titulo,
        texto: data.ementa,
        url: data.url,
        numeroProcesso: data.numero_processo,
      });
      inseridos++;
    }
  }

  return { inseridos, ignorados };
}

/**
 * Marca na fila o(s) julgado(s) que o usuário escolheu na peça
 * (prioridade alta = 1ª conferência humana).
 */
export async function marcarEscolhidoNaVerificacao(
  candidato: {
    titulo: string;
    ementa: string;
    url?: string;
    numeroProcesso?: string;
    tribunal?: string;
    data?: string;
    relator?: string;
    fonte?: string;
  },
  usuarioId: string
): Promise<{ ok: boolean; id?: string }> {
  const admin = createAdminClient();

  // Tenta achar pendente pelo processo ou URL
  let rowId: string | undefined;

  if (candidato.numeroProcesso?.trim()) {
    const { data } = await admin
      .from("juris_verificacao")
      .select("id")
      .eq("status", "pendente")
      .eq("numero_processo", candidato.numeroProcesso.trim())
      .limit(1)
      .maybeSingle();
    rowId = data?.id;
  }

  if (!rowId && candidato.url) {
    const { data } = await admin
      .from("juris_verificacao")
      .select("id")
      .eq("status", "pendente")
      .eq("url", candidato.url)
      .limit(1)
      .maybeSingle();
    rowId = data?.id;
  }

  if (!rowId) {
    const titulo = candidato.titulo.trim();
    const { data } = await admin
      .from("juris_verificacao")
      .select("id")
      .eq("status", "pendente")
      .eq("titulo", titulo)
      .limit(1)
      .maybeSingle();
    rowId = data?.id;
  }

  if (rowId) {
    await admin
      .from("juris_verificacao")
      .update({
        escolhido_usuario: true,
        prioridade: 100,
        usuario_origem: usuarioId,
      })
      .eq("id", rowId);
    return { ok: true, id: rowId };
  }

  // Ainda não estava na fila (ex.: veio só do picker sem enqueue) — cria com prioridade
  const { data, error } = await admin
    .from("juris_verificacao")
    .insert({
      titulo: candidato.titulo.trim(),
      ementa: candidato.ementa.trim(),
      tribunal: candidato.tribunal ?? "TJSP",
      data_julgado: candidato.data ?? null,
      url: candidato.url ?? null,
      numero_processo: candidato.numeroProcesso ?? null,
      relator: candidato.relator ?? null,
      fonte: candidato.fonte ?? "tjsp_scraper",
      status: "pendente",
      prioridade: 100,
      escolhido_usuario: true,
      usuario_origem: usuarioId,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[marcarEscolhido]", error.message);
    return { ok: false };
  }
  return { ok: true, id: data?.id };
}
