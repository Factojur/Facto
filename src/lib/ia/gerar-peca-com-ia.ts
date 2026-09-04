/**
 * Workflow agentic da equipe FACTO (Pacote A) — Gemini:
 * Maestro (plano) → Analista+Estrategista → Pesquisa & súmulas (RAG curado)
 * → Redator → Auditor (espécie, forma, lacunas, pedidos, citações).
 */

import {
  buscarConhecimentoRelacionado,
  montarContextoConhecimento,
  type TrechoConhecimento,
} from "@/lib/base-conhecimento";
import { sanearNomeCidade, substituirEnderecamentoDeterministico, substituirNomePecaDeterministico } from "@/lib/endereco-comarca";
import {
  montarSystemPromptRedacaoTier1,
  type BlocoLeiMunicipal,
} from "@/lib/ia/assistente-facto-prompt";
import {
  provaVazia,
  type ProvaTextoCaso,
} from "@/lib/provas-caso-texto";
import { blocoInstrucaoInversaoOnus } from "@/lib/inversao-onus-prova";
import {
  gerarTextoComGemini,
  gerarTextoComGeminiStream,
  geminiConfigurado,
  modelosRedacao,
} from "@/lib/ia/gemini-client";
import { gerarTextoComAnthropic } from "@/lib/ia/anthropic-client";
import { decidirRedatorSonnet } from "@/lib/ia/roteador-redator";
import {
  blocoPromptAdesao,
  blocoModeloPecaCaso,
  normalizarAdesaoRedacao,
  normalizarEsforcoRedacao,
  tokensRedacaoPorEsforco,
  type AdesaoRedacao,
  type EsforcoRedacao,
} from "@/lib/chat-redacao-opcoes";
import {
  obterContagemSonnet,
  registrarUmaRedacaoSonnet,
} from "@/lib/cota-pecas-server";
import type { PlanoCota } from "@/lib/cota-pecas";
import { normalizarPecaGerada } from "@/lib/ia/normalizar-peca-gerada";
import {
  anotarJurisprudenciasSemLastro,
  contarMarcadoresNaoEncontrado,
  verificarCitacoes,
  type CitacaoVerificada,
} from "@/lib/ia/verificacao-citacoes";
import {
  auditarPecaGerada,
  mesclarEtapaAuditor,
  type ResultadoAuditorPeca,
} from "@/lib/ia/auditor-peca";
import type { EtapaEquipeFacto } from "@/lib/ia/agentes-facto";
import {
  blocoPecaCabivelPrompt,
  detalheAnalista,
  detalheEstrategista,
  detalhePesquisa,
  detalheRedator,
  montarEtapaMaestro,
  montarQueryPesquisa,
  reforcarEstrategiaParaRedator,
  resolverVinculosPeca,
} from "@/lib/ia/skins-facto";
import { blocoEstruturaDaArea } from "@/lib/peca-especie-area";
import {
  normalizarPoloAdvocacia,
  rotuloPoloAdvocacia,
  type PoloAdvocacia,
} from "@/lib/polo-advocacia";
import { moduloDaArea } from "@/lib/minuta-modulo";
import { blocoInstrucoesQualificacaoPrompt } from "@/lib/partes-ja-qualificadas";
import { formatarOabAssinatura } from "@/lib/formatar-oab";
import {
  contextoVerificacaoJurisCaso,
  type BlocoJurisCaso,
} from "@/lib/juris-caso-types";
import {
  blocoPromptTesesCanonicas,
  detectarTesesCanonicas,
} from "@/lib/teses-canonicas";
import { expandirQueryLastro } from "@/lib/expansao-query-lastro";
import type { BriefingCasoLivre } from "@/lib/ia/briefing-caso-livre";
import {
  enriquecerEstrategiaComPlano,
  extrairPlanoTopicos,
} from "@/lib/ia/plano-topicos-peca";
import { montarDossieCasoLivre } from "@/lib/ia/dossie-caso-livre";
import {
  blocoCoberturaTesesParaRedator,
  auditarTopicosNaPeca,
  type ItemCoberturaTese,
} from "@/lib/ia/cobertura-teses-peca";
import { buscarLastroPorTopicos } from "@/lib/ia/rag-por-topico";
import {
  executarTriagemCaso,
  montarContextoTriagem,
  parseEstrategiaJuridica,
  type TriagemPrecalculada,
  type AnaliseEstrategica,
} from "@/lib/ia/triagem-caso-peca";

export type { TriagemPrecalculada, AnaliseEstrategica };
export { parseEstrategiaJuridica };

function enriquecerQueryLastro(
  areaId: string,
  q: string,
  fatos?: string | null
): string {
  const map: Record<string, string> = {
    jec: "Juizado especial cível Lei 9.099 consumidor",
    civil: "Código Civil obrigações particulares",
    consumidor: "CDC consumidor fornecedor",
    tributario: "CTN execução fiscal CDA Lei 6.830",
    familia: "família alimentos guarda divórcio inventário",
    trabalhista: "CLT TST reclamação trabalhista",
    previdenciario: "INSS benefício Lei 8.213 previdenciário JEF",
    criminal: "CPP Código Penal habeas corpus",
    jecr: "JECRIM Lei 9.099 criminal transação penal",
    imobiliario: "Lei 8.245 despejo usucapião locação",
    empresarial: "sociedade Lei 6.404 societário",
    administrativo: "mandado de segurança Lei 12.016 Fazenda",
    digital: "LGPD dados pessoais",
    ambiental: "Lei 6.938 meio ambiente ACP",
    "propriedade-intelectual": "marca LPI direitos autorais",
    agrario: "Estatuto da Terra agrário",
    medico: "erro médico responsabilidade civil saúde",
    internacional: "homologação sentença estrangeira STJ",
    eleitoral: "Lei 9.504 eleitoral TRE TSE",
    constitucional: "Constituição Federal remédios RE ADPF ADI",
  };
  const extra = map[areaId];
  const expansao = expandirQueryLastro(areaId, q, fatos ?? undefined);
  return [q, extra, expansao.blocoSemantico].filter(Boolean).join(" ");
}

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
  nomePeca?: string | null;
  epigrafe?: string[] | null;
  /** Texto extraído de provas (PDF/DOCX) no cliente. */
  provasTexto?: { nome: string; texto: string; tipo?: string; sintese?: string }[];
  /** Subtópico determinístico de inversão do ônus da prova. */
  inversaoOnusProva?: {
    subtitulo: string;
    paragrafo: string;
    confianca: string;
  } | null;
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
      auditoria?: ResultadoAuditorPeca;
    }
  | {
      ok: false;
      erro: string;
    };

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
  instrucoes?: InstrucoesDeterministicas
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

function montarUserPromptRedacao(params: {
  dossieBloco: string;
  tipoAcao: string;
  fatos: string;
  instrucoes?: InstrucoesDeterministicas;
  casoReal: boolean;
  estrategiaJuridica: string;
  especiePeca?: string;
  poloAdvocacia?: PoloAdvocacia | null;
  areaId?: string;
  vinculosPeca?: string | null;
}): string {
  const partes = [
    "TAREFA: redija a PEÇA COMPLETA seguindo o system prompt e o resumo estratégico abaixo.",
    "NÃO devolva o resumo — só a peça em Markdown limpo.",
    "Se houver <PLANO_DE_TOPICOS> (ou legado OBRIGATORIO), use-o como guia de títulos da triagem.",
    "QUALIDADE: memorial de advogado sênior — argumente o caso concreto (expor, encaixar tese nos fatos, valorizar o polo, requerer). Não entregue só citações de lei/jurisprudência.",
    "",
    params.casoReal
      ? params.dossieBloco
      : `${params.dossieBloco}\n(TESTE fictício — reescrever, nunca colar)`,
    "",
    "<ESTRATEGIA_JURIDICA>",
    params.estrategiaJuridica,
    "</ESTRATEGIA_JURIDICA>",
    "",
    `Indicação do formulário (pista): ${params.tipoAcao}`,
    params.especiePeca
      ? `Espécie da peça: ${params.especiePeca} — use exatamente a estrutura romana dessa espécie.`
      : null,
    params.vinculosPeca,
    linhaPoloUsuario(params.poloAdvocacia, params.areaId ?? "jec"),
    params.instrucoes?.tutelaUrgencia != null
      ? `Tutela no formulário: ${params.instrucoes.tutelaUrgencia ? "Sim — incluir se confirmada na estratégia/fatos" : "Não — só se os fatos revelarem urgência manifesta"}`
      : null,
    params.instrucoes?.pedirJusticaGratuita === true
      ? "Justiça gratuita: SIM — incluir subtítulo no direito e pedido de JG; mencionar declaração de hipossuficiência."
      : params.instrucoes?.pedirJusticaGratuita === false
        ? "Justiça gratuita: NÃO — checkbox desligado; não incluir pedido de JG."
        : null,
    params.instrucoes?.temMle === true
      ? "MLE: SIM — prever nos pedidos a expedição/utilização do Mandado de Levantamento Eletrônico, se cabível."
      :     params.instrucoes?.temMle === false
        ? "MLE: NÃO — checkbox desligado; não pedir Mandado de Levantamento Eletrônico."
        : null,
  ].filter((p): p is string => p != null);

  if (params.instrucoes?.enderecamento?.trim()) {
    partes.push(
      "",
      "ENDEREÇAMENTO DETERMINÍSTICO (usar literalmente no início):",
      params.instrucoes.enderecamento.trim()
    );
  }

  if (params.instrucoes?.epigrafe?.length) {
    partes.push(
      "",
      "EPÍGRAFE DETERMINÍSTICA (após o endereçamento, alinhada à esquerda, nas linhas em branco; reproduzir literalmente):",
      params.instrucoes.epigrafe.join("\n")
    );
  }

  if (params.instrucoes?.nomePeca?.trim()) {
    partes.push(
      "",
      "NOME DA PEÇA DETERMINÍSTICO (caixa alta, sozinho na linha, após a introdução das partes):",
      params.instrucoes.nomePeca.trim().toUpperCase()
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

  if (
    params.instrucoes?.qualificacaoAutor?.trim() ||
    params.instrucoes?.partesJaQualificadas != null
  ) {
    const areaId = params.areaId ?? "jec";
    const modulo = moduloDaArea(areaId);
    partes.push(
      "",
      blocoInstrucoesQualificacaoPrompt({
        areaId,
        especie: params.especiePeca ?? "peticao-inicial",
        partesJaQualificadas: Boolean(params.instrucoes?.partesJaQualificadas),
        polo: params.poloAdvocacia,
        rotuloAtivo: modulo.rotuloPoloAtivo,
        rotuloPassivo: modulo.rotuloPoloPassivo,
      })
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

  if (params.instrucoes?.inversaoOnusProva) {
    const bloco = blocoInstrucaoInversaoOnus({
      cabivel: true,
      confianca: (params.instrucoes.inversaoOnusProva.confianca as "alta" | "media" | "baixa") || "media",
      subtitulo: params.instrucoes.inversaoOnusProva.subtitulo,
      paragrafo: params.instrucoes.inversaoOnusProva.paragrafo,
      basesLegais: [],
      motivo: "Determinístico do FACTO",
    });
    if (bloco) partes.push(bloco);
  }

  const dataExtenso = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const brutoLocal =
    params.instrucoes?.localFechamento?.replace(/\s*-\s*/, "/") ??
    "[Cidade/UF]";
  const cidadeUf = (() => {
    const m = /^(.+?)\s*([\/–-]\s*[A-Za-z]{2})\s*$/.exec(brutoLocal.trim());
    if (!m) return brutoLocal;
    const cidade = sanearNomeCidade(m[1]!) || m[1]!.trim();
    return `${cidade}${m[2]!.replace(/\s+/g, "")}`;
  })();
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
  especiePeca?: string | null;
  areaId?: string;
  itensConhecimento?: TrechoConhecimento[];
  leiMunicipal?: BlocoLeiMunicipal | null;
  jurisDoCaso?: BlocoJurisCaso[] | null;
  instrucoes?: InstrucoesDeterministicas;
  casoReal?: boolean;
  poloAdvocacia?: PoloAdvocacia | null;
  atuarLeigo?: boolean;
  tesesIds?: string[];
  estiloEscritorio?: string | null;
  /** Modelo de peça do advogado (só este caso) — forma. */
  modeloPeca?: { nome: string; texto: string } | null;
  /** Livre | Fiel | Recorte. */
  adesaoRedacao?: AdesaoRedacao | null;
  /** Expressa | Equilíbrio | Detalhada — tokens e Sonnet (ids: agil|padrao|fundo). */
  esforcoRedacao?: EsforcoRedacao | null;
  /** Roteamento Flash/Sonnet (Completo 20% · Pro 26%). */
  roteamento?: {
    userId: string;
    plano: PlanoCota;
  };
  /** Orientações do formulário — pistas, não barreiras. */
  briefingFormulario?: BriefingCasoLivre | null;
  /** Mapa ponto a ponto da contestação (réplica). */
  briefingReplica?: string | null;
  dispositivoSentenca?: string | null;
  /** Triagem já executada (preview) — pula nova chamada de triagem. */
  triagemPrecalculada?: TriagemPrecalculada | null;
  /** Delta da redação (stream) — texto acumulado do redator. */
  onRedacaoDelta?: (textoAcumulado: string) => void;
}): Promise<ResultadoPecaIA> {
  if (!geminiConfigurado()) {
    return {
      ok: false,
      erro: "GEMINI_API_KEY não configurada. Adicione a chave no ambiente do servidor.",
    };
  }

  const casoReal = params.casoReal ?? true;
  const areaId = params.areaId ?? "civil";
  const polo =
    params.poloAdvocacia != null
      ? normalizarPoloAdvocacia(params.poloAdvocacia)
      : null;
  const opcoesPolo =
    polo != null
      ? { polo, atuarLeigo: Boolean(params.atuarLeigo) }
      : undefined;
  // Só espécie explícita — sem kit/heurística local.
  const especie = String(params.especiePeca ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  const teses = detectarTesesCanonicas(
    areaId,
    params.fatos,
    params.tesesIds ?? []
  );
  const vinculos = resolverVinculosPeca({
    areaId,
    especie,
    tipoAcao: params.tipoAcao,
    fatos: params.fatos,
    confiarEspecie: true,
  });
  const especieFinal = vinculos.especie;
  const blocoVinculos = blocoPecaCabivelPrompt(vinculos);
  const equipe: EtapaEquipeFacto[] = [
    montarEtapaMaestro({
      areaId,
      vinculos,
      polo,
      teses,
      pedirJusticaGratuita: params.instrucoes?.pedirJusticaGratuita,
      temMle: params.instrucoes?.temMle,
    }),
  ];

  const opcoesLastro = { polo, especie: especieFinal };
  const itens =
    params.itensConhecimento ??
    (await buscarConhecimentoRelacionado(
      enriquecerQueryLastro(
        areaId,
        montarQueryPesquisa({
          areaId,
          tipoAcao: params.tipoAcao,
          vinculos,
          teses,
          fatos: params.fatos,
        })
      ),
      8,
      params.fatos,
      areaId,
      opcoesLastro
    ));

  const contextoBase = montarContextoTriagem(itens, teses);
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

  const provasDoCaso = provasDoInstrucoes(params.instrucoes);
  const dossie = montarDossieCasoLivre({
    fatos: params.fatos,
    briefingFormulario: params.briefingFormulario,
    briefingReplica: params.briefingReplica,
    dispositivoSentenca: params.dispositivoSentenca,
    provas: provasDoCaso,
  });

  let estrategiaJuridica: string;
  let analiseEstrategica: AnaliseEstrategica;
  let topicosExtraidos: ReturnType<typeof extrairPlanoTopicos>;
  let coberturaItens: ItemCoberturaTese[];
  let triagemModelo: string;

  if (params.triagemPrecalculada) {
    estrategiaJuridica = params.triagemPrecalculada.estrategiaJuridica;
    analiseEstrategica = params.triagemPrecalculada.analiseEstrategica;
    topicosExtraidos = params.triagemPrecalculada.topicos;
    coberturaItens = params.triagemPrecalculada.cobertura;
    triagemModelo = params.triagemPrecalculada.modelo;
  } else {
    const triagem = await executarTriagemCaso({
      tipoAcao: params.tipoAcao,
      fatos: params.fatos,
      especiePeca: especieFinal,
      areaId,
      contextoBase,
      leiMunicipal,
      jurisDoCaso,
      instrucoes: params.instrucoes,
      casoReal,
      poloAdvocacia: polo,
      teses,
      briefingFormulario: params.briefingFormulario,
      dispositivoSentenca: params.dispositivoSentenca,
      blocoVinculos,
      opcoesPolo,
    });
    if (!triagem.ok) {
      return { ok: false, erro: triagem.erro };
    }
    estrategiaJuridica = triagem.estrategiaJuridica;
    analiseEstrategica = triagem.analiseEstrategica;
    topicosExtraidos = triagem.topicos;
    coberturaItens = triagem.cobertura;
    triagemModelo = triagem.modelo;
  }

  const estruturaEspecie = blocoEstruturaDaArea(areaId, especieFinal);
  const blocoCobertura = blocoCoberturaTesesParaRedator(coberturaItens, teses);
  const nCoberturaOk = coberturaItens.filter((i) => i.noPlano).length;

  equipe.push({
    id: "analista",
    skin: "Analista Facto",
    titulo: "Análise do caso",
    status:
      vinculos.incidenteAberto &&
      vinculos.cabivel &&
      vinculos.especie !== vinculos.cabivel
        ? "parcial"
        : "ok",
    detalhe: [
      detalheAnalista({
        nomeAcao: analiseEstrategica.nomeAcao,
        vinculos,
        riscos: analiseEstrategica.riscosOuLacunas,
      }),
      topicosExtraidos.length
        ? `${topicosExtraidos.length} tópico(s) planejado(s)`
        : null,
      coberturaItens.length
        ? `cobertura ${nCoberturaOk}/${coberturaItens.length}`
        : null,
    ]
      .filter(Boolean)
      .join(" · "),
    modelo: triagemModelo,
  });

  // Amplia RAG com tese / nome da ação (Pesquisa & súmulas)
  const queryExtra = [
    vinculos.tituloPeca,
    analiseEstrategica.nomeAcao,
    analiseEstrategica.tesePrincipal,
    ...teses.map((t) => t.rotulo),
  ]
    .filter(Boolean)
    .join(" ");

  let itensFinais = itens;
  if (queryExtra.trim()) {
    const reforco = await buscarConhecimentoRelacionado(
      enriquecerQueryLastro(areaId, queryExtra, params.fatos),
      8,
      params.fatos,
      areaId,
      opcoesLastro
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

  if (topicosExtraidos.length > 0) {
    itensFinais = await buscarLastroPorTopicos({
      areaId,
      fatos: dossie.relato,
      topicos: topicosExtraidos,
      base: itensFinais,
      opcoesLastro: {
        polo: polo ?? undefined,
        especie: especieFinal,
      },
      enriquecerQuery: enriquecerQueryLastro,
      maxPorConsulta: 3,
      maxTotal: 16,
    });
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
    detalhe: detalhePesquisa({
      nBase: itensFinais.length,
      nLeis: nLeisF || nLeis,
      nSumulas: nSumulasF || nSumulas,
      nJurisCaso: nJurisUpload,
      nTeses: teses.length,
      polo: polo ?? undefined,
    }),
  });

  const nPedidosForm = (params.instrucoes?.pedidosUsuario ?? []).filter(
    (p) => p.trim().length > 0
  ).length;
  equipe.push({
    id: "estrategista",
    skin: "Estrategista",
    titulo: "Tese e DO DIREITO",
    status: "ok",
    detalhe: detalheEstrategista({
      tesePrincipal: analiseEstrategica.tesePrincipal,
      nPedidos: nPedidosForm,
      nTeses: teses.length,
      nTopicos: topicosExtraidos.length || undefined,
    }),
    modelo: triagemModelo,
  });

  const tesesPrompt = blocoPromptTesesCanonicas(teses);
  const contextoRedacao = [montarContextoConhecimento(itensFinais), tesesPrompt]
    .filter(Boolean)
    .join("\n\n");
  const estrategiaParaRedator = enriquecerEstrategiaComPlano({
    estrategia: reforcarEstrategiaParaRedator({
      estrategia: estrategiaJuridica,
      vinculos,
      teses,
      pedidosUsuario: params.instrucoes?.pedidosUsuario,
      pedirJusticaGratuita: params.instrucoes?.pedirJusticaGratuita,
      temMle: params.instrucoes?.temMle,
      tutelaUrgencia: params.instrucoes?.tutelaUrgencia,
    }),
    topicos: topicosExtraidos,
    pedidosEssenciais: analiseEstrategica.pedidosEssenciais,
    estruturaEspecie,
    coberturaTeses: blocoCobertura,
  });

  // —— Redator forense (Flash padrão; Sonnet se roteador autorizar) ——
  const adesao = normalizarAdesaoRedacao(params.adesaoRedacao);
  const esforco = normalizarEsforcoRedacao(params.esforcoRedacao);
  const maxTokensRedacao = tokensRedacaoPorEsforco(esforco);
  const temModeloCaso = Boolean(params.modeloPeca?.texto?.trim());
  const temEstiloOuModelo =
    temModeloCaso || Boolean(params.estiloEscritorio?.trim());

  const systemRedacao = [
    montarSystemPromptRedacaoTier1(
      contextoRedacao,
      leiMunicipal,
      jurisDoCaso,
      especieFinal,
      areaId,
      opcoesPolo,
      blocoVinculos,
      params.estiloEscritorio,
      provasDoCaso
    ),
    blocoModeloPecaCaso(params.modeloPeca),
    blocoPromptAdesao(adesao, temEstiloOuModelo),
    "FORMATAÇÃO: foque no conteúdo jurídico completo. Espaçamentos e tipografia forense finais serão aplicados por um passo separado — não deixe de redigir mérito por preocupação com margens.",
  ]
    .filter(Boolean)
    .join("\n\n");
  const userRedacao = montarUserPromptRedacao({
    dossieBloco: dossie.bloco,
    tipoAcao: analiseEstrategica.nomeAcao || params.tipoAcao,
    fatos: params.fatos,
    instrucoes: params.instrucoes,
    casoReal,
    estrategiaJuridica: estrategiaParaRedator,
    especiePeca: especieFinal,
    poloAdvocacia: polo,
    areaId,
    vinculosPeca: blocoVinculos,
  });

  let redacaoModelo = "";
  let textoBrutoRedacao = "";

  const sonnetUsadas = params.roteamento?.userId
    ? await obterContagemSonnet({ userId: params.roteamento.userId })
    : 0;
  const decisao = decidirRedatorSonnet({
    plano: params.roteamento?.plano ?? null,
    especie: especieFinal,
    areaId,
    charsRelato: params.fatos.length,
    tutelaUrgencia: Boolean(params.instrucoes?.tutelaUrgencia),
    sonnetUsadas,
    esforco,
  });

  if (decisao.usarSonnet) {
    const sonnetRes = await gerarTextoComAnthropic({
      systemPrompt: systemRedacao,
      userPrompt: userRedacao,
      temperature: 0.35,
      maxOutputTokens: maxTokensRedacao,
    });
    if (sonnetRes.ok) {
      textoBrutoRedacao = sonnetRes.texto;
      redacaoModelo = sonnetRes.modelo;
      params.onRedacaoDelta?.(textoBrutoRedacao);
      console.info(
        `[redator] ${decisao.detalhe} modelo=${sonnetRes.modelo}`
      );
      if (params.roteamento?.userId) {
        await registrarUmaRedacaoSonnet({ userId: params.roteamento.userId });
      }
    } else {
      console.warn(
        `[redator] Sonnet falhou (${decisao.motivo}): ${sonnetRes.erro} — fallback Flash.`
      );
    }
  }

  if (!textoBrutoRedacao) {
    const redacaoOpts = {
      systemPrompt: systemRedacao,
      userPrompt: userRedacao,
      modelos: modelosRedacao(),
      temperature: 0.35,
      maxOutputTokens: maxTokensRedacao,
    };
    const redacaoRes = params.onRedacaoDelta
      ? await gerarTextoComGeminiStream({
          ...redacaoOpts,
          onDelta: params.onRedacaoDelta,
        })
      : await gerarTextoComGemini(redacaoOpts);
    if (!redacaoRes.ok) {
      return { ok: false, erro: `Falha na redação: ${redacaoRes.erro}` };
    }
    textoBrutoRedacao = redacaoRes.texto;
    redacaoModelo = redacaoRes.modelo;
  }

  let textoGerado = removerVazamentoDeAnalise(textoBrutoRedacao);
  if (params.instrucoes?.enderecamento?.trim()) {
    textoGerado = substituirEnderecamentoDeterministico(
      textoGerado,
      params.instrucoes.enderecamento
    );
  }
  if (params.instrucoes?.nomePeca?.trim()) {
    textoGerado = substituirNomePecaDeterministico(
      textoGerado,
      params.instrucoes.nomePeca
    );
  }
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
    detalhe: [
      detalheRedator({
        caracteres: textoGerado.length,
        tituloPeca: vinculos.tituloPeca,
      }),
      decisao.detalhe,
    ]
      .filter(Boolean)
      .join(" · "),
    modelo: redacaoModelo,
  });

  // Formatação forense fica a cargo do Redator (liberdade da IA).
  // Passo Gemini de diagramação (formatarPecaForense) desligado — evita molde rígido.

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
  const auditoria = auditarPecaGerada({
    peca: textoComLastro,
    areaId,
    especie: especieFinal,
    tipoAcao: analiseEstrategica.nomeAcao || params.tipoAcao,
    fatos: params.fatos,
    pecaInaugural: moduloDaArea(areaId).idsPeticaoInicial.includes(especieFinal),
    pedirJusticaGratuita: params.instrucoes?.pedirJusticaGratuita,
    temMle: params.instrucoes?.temMle,
    pedidosUsuario: params.instrucoes?.pedidosUsuario,
    citacoes,
    marcadoresNaoEncontrado: marcadores,
    topicosPlanejados: topicosExtraidos,
  });

  return {
    ok: true,
    textoGerado: textoComLastro,
    modelo: `${triagemModelo} → ${redacaoModelo}`,
    contextoUtilizado: itensFinais.map((item) => ({
      titulo: item.titulo,
      categoria: item.categoria,
    })),
    citacoes,
    marcadoresNaoEncontrado: marcadores,
    itensConhecimento: itensFinais,
    analiseEstrategica,
    contextoVerificacao: contextoParaVerificacao,
    equipeEtapas: mesclarEtapaAuditor(equipe, auditoria),
    auditoria,
  };
}
