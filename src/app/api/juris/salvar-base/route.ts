import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enviarParaVerificacao } from "@/lib/juris-provedores/salvar-na-base";
import { marcarEscolhidoNaVerificacao } from "@/lib/scrapers/verificacao-scrape";
import type { PrecedenteInterno } from "@/lib/juris-provedores/jurisprudencia-service";

export const runtime = "nodejs";

type BodyItem = {
  titulo?: string;
  ementa?: string;
  tribunal?: string;
  data?: string;
  url?: string;
  numeroProcesso?: string;
  relator?: string;
  origem?: string;
  tipo?: "acordao" | "sumula" | "decisao" | "outro";
};

/**
 * Confirmação do usuário:
 * - jurisprudencias_ai → envia/atualiza fila de verificação
 * - tribunal_scraper → eleva prioridade (escolhido_usuario) na fila
 * Uploads/súmulas não entram aqui.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  let body: { precedentes?: BodyItem[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const lista = Array.isArray(body.precedentes) ? body.precedentes : [];
  if (!lista.length) {
    return NextResponse.json(
      { error: "Nenhum precedente para salvar." },
      { status: 400 }
    );
  }

  const resultados: {
    titulo: string;
    inserido: boolean;
    jaExistia: boolean;
    avisoDuplicidade?: boolean;
    motivo?: string;
    id?: string;
    erro?: string;
  }[] = [];

  for (const raw of lista.slice(0, 20)) {
    const ementa = String(raw.ementa ?? "").trim();
    const titulo = String(raw.titulo ?? "").trim();
    if (!ementa || !titulo) continue;

    if (raw.tipo === "sumula" || raw.origem === "sumula") continue;
    if (raw.origem === "upload_usuario") continue;
    if (raw.origem === "base_conhecimento") continue;

    if (raw.origem === "tribunal_scraper") {
      const r = await marcarEscolhidoNaVerificacao(
        {
          titulo,
          ementa,
          tribunal: raw.tribunal,
          data: raw.data,
          url: raw.url,
          numeroProcesso: raw.numeroProcesso,
          relator: raw.relator,
          fonte: "tjsp_scraper",
        },
        user.id
      );
      resultados.push({
        titulo,
        inserido: r.ok,
        jaExistia: false,
        id: r.id,
        motivo: r.ok
          ? "Priorizado na fila (escolhido pelo usuário)."
          : "Não foi possível priorizar na fila.",
      });
      continue;
    }

    if (raw.origem !== "jurisprudencias_ai") continue;

    const precedente: PrecedenteInterno = {
      origem: "jurisprudencias_ai",
      tribunal: String(raw.tribunal ?? "Tribunal").trim() || "Tribunal",
      titulo,
      ementa,
      numeroProcesso: raw.numeroProcesso,
      relator: raw.relator,
      data: raw.data,
      url: raw.url,
      tipo: raw.tipo === "decisao" ? "decisao" : "acordao",
    };

    const r = await enviarParaVerificacao(precedente, user.id);
    resultados.push({
      titulo,
      inserido: r.inserido,
      jaExistia: r.jaExistia,
      avisoDuplicidade: r.avisoDuplicidade,
      motivo: r.motivo,
      id: r.id,
      erro: r.erro,
    });
  }

  return NextResponse.json({
    ok: true,
    inseridos: resultados.filter((r) => r.inserido).length,
    existentes: resultados.filter((r) => r.jaExistia).length,
    comAviso: resultados.filter((r) => r.avisoDuplicidade).length,
    resultados,
  });
}
