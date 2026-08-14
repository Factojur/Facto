/**
 * Workflow agentic da equipe FACTO (Pacote A) — Gemini:
 * Maestro (plano) → Analista+Estrategista → Pesquisa & súmulas (RAG curado)
 * → Redator → Auditor (citações / regras).
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
import { normalizarPecaGerada } from "@/lib/ia/normalizar-peca-gerada";
import {
  anotarJurisprudenciasSemLastro,
  contarMarcadoresNaoEncontrado,
  verificarCitacoes,
  type CitacaoVerificada,
} from "@/lib/ia/verificacao-citacoes";
import {
  planoMaestroEquipe,
  type EtapaEquipeFacto,
} from "@/lib/ia/agentes-facto";
import {
  inferirEspeciePeca,
  type EspeciePecaJec,
} from "@/lib/jec-especie-peca";
import { formatarOabAssinatura } from "@/lib/formatar-oab";
import {
  contextoVerificacaoJurisCaso,
  type BlocoJurisCaso,
} from "@/lib/juris-caso-types";

export type InstrucoesDeterministicas = {
  enderecamento?: string;
  valorCausa?: string;
  tutelaUrgencia?: boolean;
  pedirJusticaGratuita?: boolean;
  temMle?: boolean;
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
  /** Bloco da parte autora até "propor a presente" ou "Vossa Excelência". */
  qualificacaoAutor?: string | null;
  partesJaQualificadas?: boolean;
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
      /** Contexto usado no auditor (sem a estratégia da triagem). */
      contextoVerificacao?: string;
      /** Etapas da equipe FACTO (skins) para UI / transparência. */
      equipeEtapas?: EtapaEquipeFacto[];
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
  especiePeca?: string;
}): string {
  return [
    "Processe o relato abaixo e devolva APENAS o resumo estruturado pedido no system prompt.",
    "",
    `Indicação do formulário (pista): ${params.tipoAcao}`,
    params.especiePeca
      ? `Espécie da peça (formulário): ${params.especiePeca}`
      : null,
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
  especiePeca?: string;
}): string {
  const partes = [
    "TAREFA: redija a PEÇA COMPLETA seguindo o system prompt e o resumo estratégico abaixo.",
    "NÃO devolva o resumo — só a peça em Markdown limpo.",
    "",
    "<ESTRATEGIA_JURIDICA>",
    params.estrategiaJuridica,
    "</ESTRATEGIA_JURIDICA>",
    "",
    `Indicação do formulário (pista): ${params.tipoAcao}`,
    params.especiePeca
      ? `Espécie da peça: ${params.especiePeca} — use exatamente a estrutura romana dessa espécie.`
      : null,
    params.instrucoes?.tutelaUrgencia != null
      ? `Tutela no formulário: ${params.instrucoes.tutelaUrgencia ? "Sim — incluir se confirmada na estratégia/fatos" : "Não — só se os fatos revelarem urgência manifesta"}`
      : null,
    params.instrucoes?.pedirJusticaGratuita
      ? "Justiça gratuita: SIM — incluir subtítulo no direito e pedido de JG; mencionar declaração de hipossuficiência."
      : null,
    params.instrucoes?.temMle
      ? "MLE: SIM — prever nos pedidos a expedição/utilização do Mandado de Levantamento Eletrônico, se cabível."
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

  if (params.instrucoes?.qualificacaoAutor?.trim()) {
    partes.push(
      "",
      params.instrucoes.partesJaQualificadas
        ? "INTRODUÇÃO DAS PARTES JÁ QUALIFICADAS (usar literalmente; NÃO acrescente CPF, RG, CNPJ, estado civil nem endereço das partes):"
        : "QUALIFICAÇÃO DA PARTE AUTORA DETERMINÍSTICA (usar literalmente após o endereçamento):",
      params.instrucoes.qualificacaoAutor.trim()
    );
  }

  if (
    !params.instrucoes?.partesJaQualificadas &&
    params.instrucoes?.qualificacaoReus?.trim()
  ) {
    partes.push(
      "",
      "QUALIFICAÇÃO DO(S) RÉU(S) DETERMINÍSTICA (após o nome da ação, usar literalmente):",
      `em face de ${params.instrucoes.qualificacaoReus.trim()}, pelos fatos e fundamentos jurídicos a seguir expostos.`
    );
  }

  if (params.instrucoes?.partesJaQualificadas) {
    partes.push(
      "",
      "Esta peça é INCIDENTAL (não é petição inicial). Depois do bloco de introdução, 1 linha em branco, NOME DA PEÇA em caixa alta, 2 linhas em branco, primeiro tópico romano. NÃO repita 'em face de' com qualificação completa."
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
    "Nestes termos,",
    "pede deferimento.",
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
  especiePeca?: EspeciePecaJec | string | null;
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
  const especie = inferirEspeciePeca(
    params.tipoAcao,
    params.fatos,
    params.especiePeca
  );
  const equipe: EtapaEquipeFacto[] = [...planoMaestroEquipe()];
  if (equipe[0]) {
    equipe[0] = {
      ...equipe[0],
      detalhe: `Espécie: ${especie} · Analista → Pesquisa & súmulas → Estrategista → Redator → Auditor`,
    };
  }

  const itens =
    params.itensConhecimento ??
    (await buscarConhecimentoRelacionado(params.tipoAcao, 8, params.fatos));

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

  const nJurisUpload = jurisDoCaso?.length ?? 0;
  const nSumulas = itens.filter((i) =>
    i.categoria.toLowerCase().includes("súmula") ||
    i.categoria.toLowerCase().includes("sumula")
  ).length;
  const nLeis = itens.filter((i) =>
    i.categoria.toLowerCase().includes("lei")
  ).length;

  // —— Analista Facto + Estrategista (uma chamada LLM barata/triagem) ——
  const triagemRes = await gerarTextoComGemini({
    systemPrompt: montarSystemPromptAnaliseEstrategica(
      contextoBase,
      leiMunicipal,
      jurisDoCaso,
      especie
    ),
    userPrompt: montarUserPromptTriagem({
      tipoAcao: params.tipoAcao,
      fatos: params.fatos,
      tutelaUrgencia: params.instrucoes?.tutelaUrgencia,
      casoReal,
      especiePeca: especie,
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

  equipe.push({
    id: "analista",
    skin: "Analista Facto",
    titulo: "Análise do caso",
    status: "ok",
    detalhe: analiseEstrategica.nomeAcao
      ? `Ação sugerida: ${analiseEstrategica.nomeAcao}`
      : "Caso analisado (tese e riscos).",
    modelo: triagemRes.modelo,
  });

  // Amplia RAG com tese / nome da ação (Pesquisa & súmulas)
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
      8,
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
    itensFinais = itensFinais.slice(0, 12);
  }

  const nSumulasF = itensFinais.filter((i) =>
    /s[uú]mula/i.test(i.categoria)
  ).length;
  const nLeisF = itensFinais.filter((i) => /lei/i.test(i.categoria)).length;

  equipe.push({
    id: "pesquisa_sumulas",
    skin: "Pesquisa & súmulas",
    titulo: "Fundamentos encontrados",
    status: itensFinais.length > 0 || nJurisUpload > 0 ? "ok" : "parcial",
    detalhe: [
      `${itensFinais.length} trecho(s) da base curada/admin`,
      nLeisF || nLeis ? `${nLeisF || nLeis} lei(s)` : null,
      nSumulasF || nSumulas ? `${nSumulasF || nSumulas} súmula(s)` : null,
      nJurisUpload ? `${nJurisUpload} juris do caso` : null,
    ]
      .filter(Boolean)
      .join(" · "),
  });

  equipe.push({
    id: "estrategista",
    skin: "Estrategista",
    titulo: "Tese e DO DIREITO",
    status: "ok",
    detalhe: analiseEstrategica.tesePrincipal
      ? analiseEstrategica.tesePrincipal.slice(0, 160)
      : "Estratégia jurídica montada.",
    modelo: triagemRes.modelo,
  });

  const contextoRedacao = montarContextoConhecimento(itensFinais);

  // —— Redator forense ——
  const redacaoRes = await gerarTextoComGemini({
    systemPrompt: montarSystemPromptRedacaoTier1(
      contextoRedacao,
      leiMunicipal,
      jurisDoCaso,
      especie
    ),
    userPrompt: montarUserPromptRedacao({
      tipoAcao: analiseEstrategica.nomeAcao || params.tipoAcao,
      fatos: params.fatos,
      instrucoes: params.instrucoes,
      casoReal,
      estrategiaJuridica,
      especiePeca: especie,
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

  equipe.push({
    id: "redator",
    skin: "Redator forense",
    titulo: "Redação da peça",
    status: "ok",
    detalhe: `Minuta gerada (${textoGerado.length.toLocaleString("pt-BR")} caracteres).`,
    modelo: redacaoRes.modelo,
  });

  const contextoParaVerificacao = [
    contextoRedacao,
    leiMunicipal
      ? `[Lei municipal] ${leiMunicipal.nome}\n${leiMunicipal.texto}`
      : "",
    contextoVerificacaoJurisCaso(jurisDoCaso),
  ]
    .filter(Boolean)
    .join("\n\n---\n\n");

  const textoNormalizado = normalizarPecaGerada(textoGerado);
  const citacoes = verificarCitacoes(textoNormalizado, contextoParaVerificacao);
  const textoComLastro = anotarJurisprudenciasSemLastro(
    textoNormalizado,
    citacoes
  );
  const marcadores = contarMarcadoresNaoEncontrado(textoComLastro);
  const citacoesOk = citacoes.filter((c) => c.verificada).length;
  const jurisSemLastro = citacoes.filter(
    (c) => c.tipo === "jurisprudencia" && !c.verificada
  ).length;

  equipe.push({
    id: "auditor",
    skin: "Auditor",
    titulo: "Revisão de citações",
    status: jurisSemLastro > 0 || marcadores > 0 ? "parcial" : "ok",
    detalhe:
      `${citacoesOk}/${citacoes.length} citações conferidas` +
      (jurisSemLastro > 0
        ? ` · ${jurisSemLastro} julgado(s) sem lastro (marcados)`
        : "") +
      (marcadores > 0 && jurisSemLastro === 0
        ? ` · ${marcadores} marcador(es)`
        : ""),
  });

  return {
    ok: true,
    textoGerado: textoComLastro,
    modelo: `${triagemRes.modelo} → ${redacaoRes.modelo}`,
    contextoUtilizado: itensFinais.map((item) => ({
      titulo: item.titulo,
      categoria: item.categoria,
    })),
    citacoes,
    marcadoresNaoEncontrado: marcadores,
    itensConhecimento: itensFinais,
    analiseEstrategica,
    contextoVerificacao: contextoParaVerificacao,
    equipeEtapas: equipe,
  };
}
