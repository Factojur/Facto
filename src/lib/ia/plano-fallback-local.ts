/**
 * Plano estratégico local — quando a triagem Gemini falha ou está indisponível.
 * Mantém o painel útil (0 tokens) até a IA voltar.
 */

import type { PreviewTriagemData } from "@/components/dashboard/preview-triagem-peca";
import type { EstadoCasoChat } from "@/lib/chat-minuta";
import {
  estadoCasoChatVazio,
  especieResolvidaChat,
  montarResumoEntendimentoChat,
  rotuloAreaChat,
} from "@/lib/chat-minuta";
import { moduloDaArea, normalizarAreaIdMinuta } from "@/lib/minuta-modulo";
import { avaliarCoberturaNoPlano } from "@/lib/ia/cobertura-teses-peca";
import type { TopicoPlanejado } from "@/lib/ia/plano-topicos-peca";
import { detectarTesesCanonicas } from "@/lib/teses-canonicas";

function topicosPadrao(especie: string): TopicoPlanejado[] {
  const e = especie.toLowerCase();
  const titulo =
    e.includes("habeas") || e.includes("hc")
      ? "DA IMPETRAÇÃO"
      : e.includes("contest")
        ? "DA CONTESTAÇÃO"
        : e.includes("replica")
          ? "DA RÉPLICA"
          : "DOS FATOS";
  return [
    { romano: "I", titulo, subtitulos: [] },
    { romano: "II", titulo: "DO DIREITO", subtitulos: [] },
    { romano: "III", titulo: "DOS PEDIDOS", subtitulos: [] },
  ];
}

/** Monta triagem mínima a partir do payload de triagem/geração. */
export function montarPlanoFallbackTriagem(params: {
  areaId: string;
  tipoAcao: string;
  fatos: string;
  especiePeca?: string;
  pedidosUsuario?: string[];
  tesesIds?: string[];
  motivo?: string;
}): PreviewTriagemData {
  const areaId = normalizarAreaIdMinuta(params.areaId);
  const estado: EstadoCasoChat = {
    ...estadoCasoChatVazio(areaId),
    tipoAcao: params.tipoAcao,
    fatos: params.fatos,
    especiePeca: params.especiePeca ?? "",
    pedidos: params.pedidosUsuario ?? [],
    tesesIds: params.tesesIds ?? [],
    areaConfirmada: true,
  };
  return montarPlanoFallbackLocal(estado, params.motivo);
}

/** Monta triagem mínima a partir do estado do chat — sem chamar API. */
export function montarPlanoFallbackLocal(
  estado: EstadoCasoChat,
  motivo?: string
): PreviewTriagemData {
  const resumo = montarResumoEntendimentoChat(estado);
  const especie = especieResolvidaChat(estado);
  const modulo = moduloDaArea(estado.areaId);
  const teses = detectarTesesCanonicas(
    estado.areaId,
    estado.fatos,
    estado.tesesIds ?? []
  );
  const pedidos = estado.pedidos.filter(Boolean);
  const topicos = topicosPadrao(especie);

  const estrategiaJuridica = [
    `**Plano preliminar (organização local)** — ${rotuloAreaChat(estado.areaId)} · ${resumo.tipoAcao}.`,
    motivo ? `_(Triagem completa em segundo plano: ${motivo}.)_` : "",
    "",
    "**Tese principal (rascunho):** analisar os fatos narrados e o rito aplicável.",
    pedidos.length
      ? `**Pedidos identificados:** ${pedidos.join("; ")}.`
      : "**Pedidos:** a confirmar na conversa.",
    "",
    "Continue refinando à esquerda; o plano será enriquecido quando a análise estratégica concluir.",
  ]
    .filter(Boolean)
    .join("\n");

  const cobertura = avaliarCoberturaNoPlano({
    estrategia: estrategiaJuridica,
    topicos,
    teses,
    pedidosFormulario: pedidos,
  });
  const nOk = cobertura.filter((c) => c.noPlano).length;

  return {
    estrategiaJuridica,
    analiseEstrategica: {
      nomeAcao: resumo.tipoAcao,
      tesePrincipal: `Caso em ${rotuloAreaChat(estado.areaId)} — ${modulo.rotuloPoloAtivo}/${modulo.rotuloPoloPassivo}.`,
      pedidosEssenciais: pedidos,
      riscosOuLacunas: motivo
        ? ["Plano gerado localmente — confira tópicos antes de redigir."]
        : ["Confira partes, foro e pedidos antes de redigir."],
      topicosPlanejados: topicos.map((t) => t.titulo),
    },
    topicos,
    cobertura,
    coberturaResumo: `${nOk}/${cobertura.length}`,
    modelo: "local-fallback",
    pedidosFormulario: pedidos,
  };
}
