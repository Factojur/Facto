/**
 * Geração Tier-1 com Chain of Thought em duas fases (Gemini):
 * 1) Análise estratégica estruturada
 * 2) Redação da peça condicionada ao brief
 */

import {
  buscarConhecimentoRelacionado,
  montarContextoConhecimento,
  type TrechoConhecimento,
} from "@/lib/base-conhecimento";
import {
  montarSystemPromptAnaliseEstrategica,
  montarSystemPromptRedacaoTier1,
  type BlocoLeiMunicipal,
} from "@/lib/ia/assistente-facto-prompt";
import { gerarTextoComGemini, geminiConfigurado } from "@/lib/ia/gemini-client";
import {
  contarMarcadoresNaoEncontrado,
  verificarCitacoes,
  type CitacaoVerificada,
} from "@/lib/ia/verificacao-citacoes";

export type InstrucoesDeterministicas = {
  enderecamento?: string;
  valorCausa?: string;
  tutelaUrgencia?: boolean;
  autorNome?: string;
  autorOab?: string;
  localFechamento?: string;
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

export type ResultadoPecaIA =
  | {
      ok: true;
      textoGerado: string;
      modelo: string;
      contextoUtilizado: { titulo: string; categoria: string }[];
      citacoes: CitacaoVerificada[];
      marcadoresNaoEncontrado: number;
      itensConhecimento: TrechoConhecimento[];
      analiseEstrategica?: AnaliseEstrategica;
    }
  | {
      ok: false;
      erro: string;
    };

function extrairJsonObjeto(texto: string): string | null {
  const fenced = texto.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidato = (fenced?.[1] ?? texto).trim();
  const inicio = candidato.indexOf("{");
  const fim = candidato.lastIndexOf("}");
  if (inicio < 0 || fim <= inicio) return null;
  return candidato.slice(inicio, fim + 1);
}

function parseAnaliseEstrategica(texto: string): AnaliseEstrategica {
  const json = extrairJsonObjeto(texto);
  if (!json) {
    return { bruto: texto.trim() };
  }
  try {
    const obj = JSON.parse(json) as AnaliseEstrategica;
    return { ...obj, bruto: texto.trim() };
  } catch {
    return { bruto: texto.trim() };
  }
}

function formatarBriefAnalise(analise: AnaliseEstrategica): string {
  if (!analise.tesePrincipal && analise.bruto && !analise.nomeAcao) {
    return analise.bruto;
  }
  return [
    `Tese principal: ${analise.tesePrincipal ?? "(não informada)"}`,
    `Natureza da relação: ${analise.naturezaRelacao ?? "(não informada)"}`,
    `Direitos violados: ${(analise.direitosViolados ?? []).join("; ") || "(não informados)"}`,
    `Nome técnico da ação: ${analise.nomeAcao ?? "(definir pelos fatos)"}`,
    `Tutela de urgência (análise): ${analise.tutelaUrgencia === true ? "Sim" : analise.tutelaUrgencia === false ? "Não" : "avaliar"}`,
    `Justiça gratuita (análise): ${analise.justicaGratuita === true ? "Sim" : analise.justicaGratuita === false ? "Não" : "avaliar"}`,
    `Princípios: ${(analise.principios ?? []).join("; ") || "—"}`,
    `Súmulas consolidadas a invocar: ${(analise.sumulasConsolidadas ?? []).join("; ") || "—"}`,
    `Artigos-chave: ${(analise.artigosChave ?? []).join("; ") || "—"}`,
    `Tópicos planejados: ${(analise.topicosPlanejados ?? []).join(" | ") || "—"}`,
    `Pedidos essenciais: ${(analise.pedidosEssenciais ?? []).join(" | ") || "—"}`,
    `Riscos/lacunas: ${(analise.riscosOuLacunas ?? []).join("; ") || "—"}`,
  ].join("\n");
}

function montarUserPromptAnalise(params: {
  tipoAcao: string;
  fatos: string;
  tutelaUrgencia?: boolean;
  casoReal: boolean;
}): string {
  return [
    "Analise estrategicamente o caso abaixo e devolva APENAS o JSON solicitado no system prompt.",
    "",
    `Indicação do formulário (pista): ${params.tipoAcao}`,
    params.tutelaUrgencia != null
      ? `Tutela marcada no formulário: ${params.tutelaUrgencia ? "Sim" : "Não"}`
      : null,
    "",
    params.casoReal
      ? "<RELATO_BRUTO_DO_USUARIO>"
      : "<RELATO_BRUTO_DO_USUARIO> (TESTE fictício)",
    params.fatos.trim(),
    "</RELATO_BRUTO_DO_USUARIO>",
  ]
    .filter((p): p is string => p != null)
    .join("\n");
}

function montarUserPromptRedacao(params: {
  tipoAcao: string;
  fatos: string;
  instrucoes?: InstrucoesDeterministicas;
  casoReal: boolean;
  briefAnalise: string;
}): string {
  const partes = [
    "TAREFA: redija a PEÇA COMPLETA (Tier-1) seguindo o system prompt e o brief abaixo.",
    "NÃO devolva JSON. NÃO copie o relato bruto. Use storytelling jurídico e fundamentação densa com subsunção.",
    "",
    "<ANALISE_ESTRATEGICA_PREVIA>",
    params.briefAnalise,
    "</ANALISE_ESTRATEGICA_PREVIA>",
    "",
    `Indicação do formulário (pista): ${params.tipoAcao}`,
    params.instrucoes?.tutelaUrgencia != null
      ? `Tutela no formulário: ${params.instrucoes.tutelaUrgencia ? "Sim — incluir se confirmada na análise/fatos" : "Não — só se os fatos revelarem urgência manifesta"}`
      : null,
    "",
    params.casoReal
      ? "<RELATO_BRUTO_DO_USUARIO> (insumo — reescrever, nunca colar):"
      : "<RELATO_BRUTO_DO_USUARIO> (TESTE fictício — reescrever, nunca colar):",
    params.fatos.trim(),
    "</RELATO_BRUTO_DO_USUARIO>",
  ].filter((p): p is string => p != null);

  if (params.instrucoes?.enderecamento?.trim()) {
    partes.push(
      "",
      "ENDEREÇAMENTO DETERMINÍSTICO (usar literalmente no início):",
      params.instrucoes.enderecamento.trim()
    );
  }

  if (params.instrucoes?.valorCausa?.trim()) {
    partes.push(
      "",
      "VALOR DA CAUSA DETERMINÍSTICO (reproduzir literalmente):",
      params.instrucoes.valorCausa.trim()
    );
  }

  if (params.instrucoes?.autorNome || params.instrucoes?.autorOab) {
    partes.push(
      "",
      "Advogado subscritor:",
      `Nome: ${params.instrucoes.autorNome ?? "[NOME DO(A) ADVOGADO(A)]"}`,
      `OAB: ${params.instrucoes.autorOab ?? "[Nº OAB/UF]"}`
    );
  }

  if (params.instrucoes?.localFechamento) {
    partes.push(
      "",
      `Local/data sugeridos: ${params.instrucoes.localFechamento}, ${new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}.`
    );
  }

  return partes.join("\n");
}

function removerVazamentoDeAnalise(texto: string): string {
  return texto
    .replace(/```json[\s\S]*?```/gi, "")
    .replace(/<ANALISE_ESTRATEGICA_PREVIA>[\s\S]*?<\/ANALISE_ESTRATEGICA_PREVIA>/gi, "")
    .replace(/^\s*\{[\s\S]*?"tesePrincipal"[\s\S]*?\}\s*/m, "")
    .trim();
}

/** @deprecated Use normalizarPecaGerada */
export { normalizarPecaGerada as markdownLeveParaTexto } from "@/lib/ia/normalizar-peca-gerada";

export async function gerarPecaComIA(params: {
  tipoAcao: string;
  fatos: string;
  itensConhecimento?: TrechoConhecimento[];
  leiMunicipal?: BlocoLeiMunicipal | null;
  instrucoes?: InstrucoesDeterministicas;
  casoReal?: boolean;
}): Promise<ResultadoPecaIA> {
  if (!geminiConfigurado()) {
    return {
      ok: false,
      erro: "GEMINI_API_KEY não configurada. Adicione a chave no ambiente do servidor.",
    };
  }

  const casoReal = params.casoReal ?? true;
  const itens =
    params.itensConhecimento ??
    (await buscarConhecimentoRelacionado(params.tipoAcao, 6, params.fatos));

  const contextoBase = montarContextoConhecimento(itens);
  const leiMunicipal = params.leiMunicipal?.texto?.trim()
    ? {
        nome: params.leiMunicipal.nome || "Lei municipal anexada",
        texto: params.leiMunicipal.texto.trim(),
      }
    : null;

  // —— Fase 1: Chain of Thought / análise estratégica ——
  const analiseRes = await gerarTextoComGemini({
    systemPrompt: montarSystemPromptAnaliseEstrategica(
      contextoBase,
      leiMunicipal
    ),
    userPrompt: montarUserPromptAnalise({
      tipoAcao: params.tipoAcao,
      fatos: params.fatos,
      tutelaUrgencia: params.instrucoes?.tutelaUrgencia,
      casoReal,
    }),
    temperature: 0.25,
    maxOutputTokens: 4096,
  });

  if (!analiseRes.ok) {
    return { ok: false, erro: `Falha na análise estratégica: ${analiseRes.erro}` };
  }

  const analiseEstrategica = parseAnaliseEstrategica(analiseRes.texto);
  const briefAnalise = formatarBriefAnalise(analiseEstrategica);

  // Amplia RAG com o nome da ação / tese descobertos na análise
  const queryExtra = [
    analiseEstrategica.nomeAcao,
    analiseEstrategica.tesePrincipal,
    ...(analiseEstrategica.artigosChave ?? []),
  ]
    .filter(Boolean)
    .join(" ");

  let itensFinais = itens;
  if (queryExtra.trim()) {
    const reforco = await buscarConhecimentoRelacionado(
      queryExtra,
      6,
      params.fatos
    );
    const vistos = new Set(
      itens.map((i) => `${i.categoria}|${i.titulo}|${i.texto.slice(0, 80)}`)
    );
    for (const r of reforco) {
      const k = `${r.categoria}|${r.titulo}|${r.texto.slice(0, 80)}`;
      if (!vistos.has(k)) {
        itensFinais = [...itensFinais, r];
        vistos.add(k);
      }
    }
    itensFinais = itensFinais.slice(0, 10);
  }

  const contextoRedacao = montarContextoConhecimento(itensFinais);

  // —— Fase 2: redação Tier-1 ——
  const redacaoRes = await gerarTextoComGemini({
    systemPrompt: montarSystemPromptRedacaoTier1(contextoRedacao, leiMunicipal),
    userPrompt: montarUserPromptRedacao({
      tipoAcao: analiseEstrategica.nomeAcao || params.tipoAcao,
      fatos: params.fatos,
      instrucoes: params.instrucoes,
      casoReal,
      briefAnalise,
    }),
    temperature: 0.4,
    maxOutputTokens: 8192,
  });

  if (!redacaoRes.ok) {
    return { ok: false, erro: `Falha na redação: ${redacaoRes.erro}` };
  }

  const textoGerado = removerVazamentoDeAnalise(redacaoRes.texto);
  if (!textoGerado || textoGerado.length < 200) {
    return {
      ok: false,
      erro: "A redação da IA retornou texto insuficiente.",
    };
  }

  const contextoParaVerificacao = [
    contextoRedacao,
    leiMunicipal
      ? `[Lei municipal] ${leiMunicipal.nome}\n${leiMunicipal.texto}`
      : "",
    // Súmulas do brief entram como lastro informativo na checagem de "lei"
    (analiseEstrategica.sumulasConsolidadas ?? []).join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n---\n\n");

  return {
    ok: true,
    textoGerado,
    modelo: `${analiseRes.modelo} → ${redacaoRes.modelo}`,
    contextoUtilizado: itensFinais.map((item) => ({
      titulo: item.titulo,
      categoria: item.categoria,
    })),
    citacoes: verificarCitacoes(textoGerado, contextoParaVerificacao),
    marcadoresNaoEncontrado: contarMarcadoresNaoEncontrado(textoGerado),
    itensConhecimento: itensFinais,
    analiseEstrategica,
  };
}
