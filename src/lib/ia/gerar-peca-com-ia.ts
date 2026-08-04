/**
 * Workflow agentic sequencial (2 etapas) — Gemini:
 * 1) Paralegal triador → estrategiaJuridica
 * 2) Advogado sênior → peça final em Markdown
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
import {
  gerarTextoComGemini,
  geminiConfigurado,
  modelosRedacao,
  MODELOS_TRIAGEM,
} from "@/lib/ia/gemini-client";
import {
  contarMarcadoresNaoEncontrado,
  verificarCitacoes,
  type CitacaoVerificada,
} from "@/lib/ia/verificacao-citacoes";
import { formatarOabAssinatura } from "@/lib/formatar-oab";
import {
  contextoVerificacaoJurisCaso,
  type BlocoJurisCaso,
} from "@/lib/juris-caso-types";

export type InstrucoesDeterministicas = {
  enderecamento?: string;
  valorCausa?: string;
  tutelaUrgencia?: boolean;
  autorNome?: string;
  autorOab?: string;
  localFechamento?: string;
  /** Pedidos explícitos listados pelo advogado no formulário. */
  pedidosUsuario?: string[];
  linkNuvem?: string | null;
  provasArquivos?: string[];
  midiasArquivos?: string[];
  /** Qualificação completa após "em face de" (sem o prefixo). */
  qualificacaoReus?: string | null;
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
  /** Texto integral da Etapa 1 (estratégia jurídica). */
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

/** Extrai campos úteis do resumo textual do Paralegal (Etapa 1). */
function parseEstrategiaJuridica(texto: string): AnaliseEstrategica {
  const bruto = texto.trim();
  const teseMatch = bruto.match(
    /(?:tese\s+jur[ií]dica\s+principal|tese\s+principal)\s*[:\-–]?\s*([\s\S]*?)(?=\n\s*\d+\.|$)/i
  );
  const acaoMatch = bruto.match(
    /(?:nome\s+t[eé]cnico\s+da\s+a[cç][aã]o|a[cç][aã]o\s+cab[ií]vel)[^\n]*[:\-–]?\s*([^\n]+)/i
  );
  const pedidosMatch = bruto.match(
    /(?:pedidos\s+essenciais)[^\n]*[:\-–]?\s*([\s\S]*?)(?=\n\s*\d+\.|$)/i
  );

  const pedidosEssenciais = pedidosMatch?.[1]
    ? pedidosMatch[1]
        .split(/\n|;|•|-/)
        .map((p) => p.replace(/^\s*\d+[.)]\s*/, "").trim())
        .filter((p) => p.length > 3)
        .slice(0, 8)
    : undefined;

  return {
    bruto,
    tesePrincipal: teseMatch?.[1]?.trim().slice(0, 500) || bruto.slice(0, 280),
    nomeAcao: acaoMatch?.[1]?.trim(),
    pedidosEssenciais,
  };
}

function montarUserPromptTriagem(params: {
  tipoAcao: string;
  fatos: string;
  tutelaUrgencia?: boolean;
  casoReal: boolean;
}): string {
  return [
    "Processe o relato abaixo e devolva APENAS o resumo estruturado pedido no system prompt.",
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
  estrategiaJuridica: string;
}): string {
  const partes = [
    "TAREFA: redija a PEÇA COMPLETA seguindo o system prompt e o resumo estratégico abaixo.",
    "NÃO devolva o resumo — só a petição em Markdown limpo.",
    "",
    "<ESTRATEGIA_JURIDICA>",
    params.estrategiaJuridica,
    "</ESTRATEGIA_JURIDICA>",
    "",
    `Indicação do formulário (pista): ${params.tipoAcao}`,
    params.instrucoes?.tutelaUrgencia != null
      ? `Tutela no formulário: ${params.instrucoes.tutelaUrgencia ? "Sim — incluir se confirmada na estratégia/fatos" : "Não — só se os fatos revelarem urgência manifesta"}`
      : null,
    "",
    params.casoReal
      ? "<RELATO_BRUTO_DO_USUARIO> (insumo complementar — reescrever, nunca colar):"
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

  if (params.instrucoes?.qualificacaoReus?.trim()) {
    partes.push(
      "",
      "QUALIFICAÇÃO DO(S) RÉU(S) DETERMINÍSTICA (após o nome da ação, usar literalmente):",
      `em face de ${params.instrucoes.qualificacaoReus.trim()}, pelos fatos e fundamentos jurídicos a seguir expostos.`
    );
  }

  if (params.instrucoes?.valorCausa?.trim()) {
    partes.push(
      "",
      "VALOR DA CAUSA DETERMINÍSTICO (reproduzir literalmente):",
      params.instrucoes.valorCausa.trim()
    );
  }

  if (params.instrucoes?.pedidosUsuario?.length) {
    partes.push(
      "",
      "PEDIDOS LISTADOS PELO ADVOGADO (incorporar em DOS PEDIDOS):",
      params.instrucoes.pedidosUsuario
        .map((p, i) => `${String.fromCharCode(97 + i)}) ${p}`)
        .join("\n")
    );
  }

  if (params.instrucoes?.linkNuvem?.trim()) {
    partes.push(
      "",
      "LINK DE NUVEM DETERMINÍSTICO (reproduzir literalmente):",
      params.instrucoes.linkNuvem.trim(),
      "Em DOS FATOS: uma frase breve no final sobre acesso digital.",
      "Em DAS PROVAS E ANEXOS: o link completo + lista dos arquivos informados."
    );
  }

  const arquivosProva = [
    ...(params.instrucoes?.provasArquivos ?? []),
    ...(params.instrucoes?.midiasArquivos ?? []),
  ];
  if (arquivosProva.length > 0) {
    partes.push(
      "",
      "ARQUIVOS INFORMADOS NO FORMULÁRIO (citar no tópico de provas):",
      arquivosProva.join(", ")
    );
  }

  const dataExtenso = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const cidadeUf =
    params.instrucoes?.localFechamento?.replace(/\s*-\s*/, "/") ??
    "[Cidade/UF]";
  const nomeAdv =
    params.instrucoes?.autorNome?.trim() || "[Nome do Advogado]";
  const ufFallback = cidadeUf.includes("/")
    ? cidadeUf.split("/").pop()?.trim().toUpperCase()
    : undefined;
  // Não prefixe com "OAB:" — a string já vem pronta: OAB/SP 147099
  const linhaOab = formatarOabAssinatura(
    params.instrucoes?.autorOab,
    ufFallback
  );

  partes.push(
    "",
    "ASSINATURA FINAL OBRIGATÓRIA (reproduzir ao final EXATAMENTE assim — sem as palavras \"Nome:\" ou \"OAB:\"):",
    "Termos em que,",
    "Pede e espera deferimento.",
    "",
    `${cidadeUf}, ${dataExtenso}.`,
    "",
    nomeAdv,
    linhaOab
  );

  return partes.join("\n");
}

function removerVazamentoDeAnalise(texto: string): string {
  return texto
    .replace(/```json[\s\S]*?```/gi, "")
    .replace(/<ESTRATEGIA_JURIDICA>[\s\S]*?<\/ESTRATEGIA_JURIDICA>/gi, "")
    .replace(/<ANALISE_ESTRATEGICA_PREVIA>[\s\S]*?<\/ANALISE_ESTRATEGICA_PREVIA>/gi, "")
    .trim();
}

/** @deprecated Use normalizarPecaGerada */
export { normalizarPecaGerada as markdownLeveParaTexto } from "@/lib/ia/normalizar-peca-gerada";

export async function gerarPecaComIA(params: {
  tipoAcao: string;
  fatos: string;
  itensConhecimento?: TrechoConhecimento[];
  leiMunicipal?: BlocoLeiMunicipal | null;
  jurisDoCaso?: BlocoJurisCaso[] | null;
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
  const jurisDoCaso =
    params.jurisDoCaso?.filter((j) => j.texto?.trim()).map((j) => ({
      titulo: j.titulo?.trim() || "Jurisprudência do caso",
      tipo: j.tipo,
      texto: j.texto.trim(),
    })) ?? null;

  // —— ETAPA 1: Paralegal Triador / Estrategista (Flash) ——
  const triagemRes = await gerarTextoComGemini({
    systemPrompt: montarSystemPromptAnaliseEstrategica(
      contextoBase,
      leiMunicipal,
      jurisDoCaso
    ),
    userPrompt: montarUserPromptTriagem({
      tipoAcao: params.tipoAcao,
      fatos: params.fatos,
      tutelaUrgencia: params.instrucoes?.tutelaUrgencia,
      casoReal,
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
    return {
      ok: false,
      erro: "A triagem da IA retornou resumo insuficiente.",
    };
  }

  const analiseEstrategica = parseEstrategiaJuridica(estrategiaJuridica);

  // Amplia RAG com tese / nome da ação descobertos na triagem
  const queryExtra = [
    analiseEstrategica.nomeAcao,
    analiseEstrategica.tesePrincipal,
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

  // —— ETAPA 2: Advogado Sênior Redator (Pro → Flash) ——
  const redacaoRes = await gerarTextoComGemini({
    systemPrompt: montarSystemPromptRedacaoTier1(
      contextoRedacao,
      leiMunicipal,
      jurisDoCaso
    ),
    userPrompt: montarUserPromptRedacao({
      tipoAcao: analiseEstrategica.nomeAcao || params.tipoAcao,
      fatos: params.fatos,
      instrucoes: params.instrucoes,
      casoReal,
      estrategiaJuridica,
    }),
    modelos: modelosRedacao(),
    temperature: 0.35,
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
    contextoVerificacaoJurisCaso(jurisDoCaso),
    estrategiaJuridica,
  ]
    .filter(Boolean)
    .join("\n\n---\n\n");

  return {
    ok: true,
    textoGerado,
    modelo: `${triagemRes.modelo} → ${redacaoRes.modelo}`,
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
