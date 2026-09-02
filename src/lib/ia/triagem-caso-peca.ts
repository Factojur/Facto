/**
 * Triagem estratégica isolada — plano de tópicos + cobertura de teses.
 * Usada no preview antes da redação e reutilizada em gerar-peca-com-ia.
 */

import {
  montarContextoConhecimento,
  type TrechoConhecimento,
} from "@/lib/base-conhecimento";
import { montarSystemPromptAnaliseEstrategica } from "@/lib/ia/assistente-facto-prompt";
import type { BlocoLeiMunicipal } from "@/lib/ia/assistente-facto-prompt";
import {
  gerarTextoComGemini,
  MODELOS_TRIAGEM,
} from "@/lib/ia/gemini-client";
import { provaVazia, type ProvaTextoCaso } from "@/lib/provas-caso-texto";
import { blocoPromptTesesCanonicas, type TeseCanonica } from "@/lib/teses-canonicas";
import { moduloDaArea } from "@/lib/minuta-modulo";
import {
  normalizarPoloAdvocacia,
  rotuloPoloAdvocacia,
  type PoloAdvocacia,
} from "@/lib/polo-advocacia";
import { montarDossieCasoLivre } from "@/lib/ia/dossie-caso-livre";
import type { BriefingCasoLivre } from "@/lib/ia/briefing-caso-livre";
import {
  extrairPlanoTopicos,
  type TopicoPlanejado,
} from "@/lib/ia/plano-topicos-peca";
import {
  avaliarCoberturaNoPlano,
  type ItemCoberturaTese,
} from "@/lib/ia/cobertura-teses-peca";
import { complementarLastroTopicos } from "@/lib/ia/plano-lastro-topico";
import type { BlocoJurisCaso } from "@/lib/juris-caso-types";
import { topicosComoLista } from "@/lib/ia/plano-topicos-peca";

export type TriagemInstrucoes = {
  tutelaUrgencia?: boolean;
  pedidosUsuario?: string[];
  provasTexto?: { nome: string; texto: string; tipo?: string; sintese?: string }[];
};

export type AnaliseEstrategica = {
  tesePrincipal?: string;
  naturezaRelacao?: string;
  direitosViolados?: string[];
  nomeAcao?: string;
  tutelaUrgencia?: boolean;
  justicaGratuita?: boolean;
  principios?: string[];
  sumulasConsolidadas?: string[];
  artigosChave?: string[];
  topicosPlanejados?: string[];
  pedidosEssenciais?: string[];
  riscosOuLacunas?: string[];
  bruto?: string;
};

export type TriagemPrecalculada = {
  estrategiaJuridica: string;
  topicos: TopicoPlanejado[];
  cobertura: ItemCoberturaTese[];
  analiseEstrategica: AnaliseEstrategica;
  modelo: string;
};

export type ResultadoTriagemCaso =
  | ({ ok: true } & TriagemPrecalculada)
  | { ok: false; erro: string };

function linhaPoloUsuario(
  polo: PoloAdvocacia | null | undefined,
  areaId: string
): string | null {
  if (!polo) return null;
  const modulo = moduloDaArea(areaId);
  const lado = rotuloPoloAdvocacia(
    polo,
    modulo.rotuloPoloAtivo,
    modulo.rotuloPoloPassivo
  );
  return `Polo processual (formulário): ${polo} (${lado}) — fundamentar em favor deste polo.`;
}

function provasDoInstrucoes(
  instrucoes?: TriagemInstrucoes
): ProvaTextoCaso[] {
  const lista = instrucoes?.provasTexto ?? [];
  return lista.map((p) =>
    provaVazia({
      nome: p.nome,
      texto: p.texto ?? "",
      sintese: p.sintese,
      tipo:
        p.tipo === "imagem" || p.tipo === "midia" || p.tipo === "documento"
          ? p.tipo
          : "documento",
      origemTexto: (p.texto ?? "").trim().length >= 40 ? "nativo" : "nenhum",
    })
  );
}

function montarUserPromptTriagem(params: {
  dossieBloco: string;
  tipoAcao: string;
  tutelaUrgencia?: boolean;
  casoReal: boolean;
  especiePeca?: string;
  poloAdvocacia?: PoloAdvocacia | null;
  areaId?: string;
  vinculosPeca?: string | null;
}): string {
  return [
    "Processe o dossiê abaixo e devolva APENAS o resumo estruturado pedido no system prompt.",
    "Inclua a seção PLANO DE TÓPICOS com títulos romanos e subtítulos a)/b)/c) específicos ao caso.",
    "",
    params.casoReal ? params.dossieBloco : `${params.dossieBloco}\n(TESTE fictício)`,
    "",
    `Indicação do formulário (pista): ${params.tipoAcao}`,
    params.especiePeca
      ? `Espécie da peça (formulário): ${params.especiePeca}`
      : null,
    params.vinculosPeca,
    linhaPoloUsuario(params.poloAdvocacia, params.areaId ?? "jec"),
    params.tutelaUrgencia != null
      ? `Tutela marcada no formulário: ${params.tutelaUrgencia ? "Sim" : "Não"}`
      : null,
  ]
    .filter((p): p is string => p != null)
    .join("\n");
}

/** Extrai campos úteis do resumo textual da triagem. */
export function parseEstrategiaJuridica(texto: string): AnaliseEstrategica {
  const bruto = texto.trim();
  const teseMatch = bruto.match(
    /(?:tese\s+jur[ií]dica\s+principal|tese\s+principal)\s*[:\-–]?\s*([\s\S]*?)(?=\n\s*\d+\.|$)/i
  );
  const acaoMatch = bruto.match(
    /(?:nome\s+t[eé]cnico\s+da\s+a[cç][aã]o|a[cç][aã]o\s+cab[ií]vel)[^\n]*[:\-–]?\s*([^\n]+)/i
  );
  const pedidosMatch = bruto.match(
    /(?:pedidos\s+essenciais)[^\n]*[:\-–]?\s*([\s\S]*?)(?=\n\s*\d+\.|$|\n\s*(?:s[uú]mulas|artigos|riscos|valores|plano))/i
  );
  const riscosMatch = bruto.match(
    /(?:riscos?\s*(?:ou\s+lacunas?)?|lacunas?)\s*[:\-–]?\s*([\s\S]*?)(?=\n\s*\d+\.|$)/i
  );
  const artigosMatch = bruto.match(
    /(?:s[uú]mulas?\/artigos|artigos?-chave|artigos?\s+chave)[^\n]*[:\-–]?\s*([\s\S]*?)(?=\n\s*\d+\.|$)/i
  );
  const naturezaMatch = bruto.match(
    /(?:natureza\s+da\s+rela[cç][aã]o|rela[cç][aã]o\s+jur[ií]dica)\s*[:\-–]?\s*([^\n]+)/i
  );

  const lista = (bloco?: string) =>
    bloco
      ? bloco
          .split(/\n|;|•|-/)
          .map((p) => p.replace(/^\s*\d+[.)]\s*/, "").replace(/^[a-z]\)\s*/i, "").trim())
          .filter((p) => p.length > 3)
          .slice(0, 8)
      : undefined;

  const pedidosEssenciais = lista(pedidosMatch?.[1]);
  const riscosOuLacunas = lista(riscosMatch?.[1]);
  const artigosChave = lista(artigosMatch?.[1]);
  const topicosPlanejados = topicosComoLista(extrairPlanoTopicos(bruto));

  return {
    bruto,
    tesePrincipal: teseMatch?.[1]?.trim().slice(0, 500) || bruto.slice(0, 280),
    nomeAcao: acaoMatch?.[1]?.trim(),
    naturezaRelacao: naturezaMatch?.[1]?.trim(),
    pedidosEssenciais,
    riscosOuLacunas,
    artigosChave,
    topicosPlanejados: topicosPlanejados.length ? topicosPlanejados : undefined,
  };
}

export async function executarTriagemCaso(params: {
  tipoAcao: string;
  fatos: string;
  especiePeca: string;
  areaId: string;
  contextoBase: string;
  leiMunicipal?: BlocoLeiMunicipal | null;
  jurisDoCaso?: BlocoJurisCaso[] | null;
  instrucoes?: TriagemInstrucoes;
  casoReal?: boolean;
  poloAdvocacia?: PoloAdvocacia | null;
  teses: TeseCanonica[];
  briefingFormulario?: BriefingCasoLivre | null;
  briefingReplica?: string | null;
  dispositivoSentenca?: string | null;
  blocoVinculos?: string | null;
  opcoesPolo?: { polo: PoloAdvocacia; atuarLeigo: boolean };
}): Promise<ResultadoTriagemCaso> {
  const casoReal = params.casoReal ?? true;
  const provasDoCaso = provasDoInstrucoes(params.instrucoes);
  const dossie = montarDossieCasoLivre({
    fatos: params.fatos,
    briefingFormulario: params.briefingFormulario,
    briefingReplica: params.briefingReplica,
    dispositivoSentenca: params.dispositivoSentenca,
    provas: provasDoCaso,
  });

  const triagemRes = await gerarTextoComGemini({
    systemPrompt: montarSystemPromptAnaliseEstrategica(
      params.contextoBase,
      params.leiMunicipal,
      params.jurisDoCaso,
      params.especiePeca,
      params.areaId,
      params.opcoesPolo,
      params.blocoVinculos ?? undefined,
      provasDoCaso
    ),
    userPrompt: montarUserPromptTriagem({
      dossieBloco: dossie.bloco,
      tipoAcao: params.tipoAcao,
      tutelaUrgencia: params.instrucoes?.tutelaUrgencia,
      casoReal,
      especiePeca: params.especiePeca,
      poloAdvocacia: params.poloAdvocacia,
      areaId: params.areaId,
      vinculosPeca: params.blocoVinculos,
    }),
    modelos: MODELOS_TRIAGEM,
    temperature: 0.25,
    maxOutputTokens: 4096,
  });

  if (!triagemRes.ok) {
    return { ok: false, erro: `Falha na triagem estratégica: ${triagemRes.erro}` };
  }

  const estrategiaJuridica = triagemRes.texto.trim();
  if (!estrategiaJuridica || estrategiaJuridica.length < 40) {
    return { ok: false, erro: "A triagem da IA retornou resumo insuficiente." };
  }

  const analiseEstrategica = parseEstrategiaJuridica(estrategiaJuridica);
  const topicosBrutos = extrairPlanoTopicos(estrategiaJuridica);
  const cobertura = avaliarCoberturaNoPlano({
    estrategia: estrategiaJuridica,
    topicos: topicosBrutos,
    teses: params.teses,
    pedidosFormulario: params.instrucoes?.pedidosUsuario,
  });
  const topicos = complementarLastroTopicos({
    topicos: topicosBrutos,
    estrategiaJuridica,
    cobertura,
    jurisTitulos: params.jurisDoCaso?.map((j) => j.titulo ?? "").filter(Boolean),
  });

  return {
    ok: true,
    estrategiaJuridica,
    topicos,
    cobertura,
    analiseEstrategica,
    modelo: triagemRes.modelo,
  };
}

/** Monta contexto base inicial para triagem (RAG + teses). */
export function montarContextoTriagem(
  itens: TrechoConhecimento[],
  teses: TeseCanonica[]
): string {
  return [montarContextoConhecimento(itens), blocoPromptTesesCanonicas(teses)]
    .filter(Boolean)
    .join("\n\n");
}
