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
import { substituirEnderecamentoDeterministico } from "@/lib/endereco-comarca";
import {
  montarSystemPromptAnaliseEstrategica,
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
  geminiConfigurado,
  modelosRedacao,
  MODELOS_TRIAGEM,
} from "@/lib/ia/gemini-client";
import { gerarTextoComAnthropic } from "@/lib/ia/anthropic-client";
import { decidirRedatorSonnet } from "@/lib/ia/roteador-redator";
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
import {
  inferirEspecieDaArea,
} from "@/lib/peca-especie-area";
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
      auditoria?: ResultadoAuditorPeca;
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
  const riscosMatch = bruto.match(
    /(?:riscos?\s*(?:ou\s+lacunas?)?|lacunas?)\s*[:\-–]?\s*([\s\S]*?)(?=\n\s*\d+\.|$)/i
  );
  const artigosMatch = bruto.match(
    /(?:s[uú]mulas?\/artigos|artigos?-chave|artigos?\s+chave)[^\n]*[:\-–]?\s*([\s\S]*?)(?=\n\s*\d+\.|$)/i
  );

  const lista = (bloco?: string) =>
    bloco
      ? bloco
          .split(/\n|;|•|-/)
          .map((p) => p.replace(/^\s*\d+[.)]\s*/, "").trim())
          .filter((p) => p.length > 3)
          .slice(0, 8)
      : undefined;

  const pedidosEssenciais = lista(pedidosMatch?.[1]);
  const riscosOuLacunas = lista(riscosMatch?.[1]);
  const artigosChave = lista(artigosMatch?.[1]);

  return {
    bruto,
    tesePrincipal: teseMatch?.[1]?.trim().slice(0, 500) || bruto.slice(0, 280),
    nomeAcao: acaoMatch?.[1]?.trim(),
    pedidosEssenciais,
    riscosOuLacunas,
    artigosChave,
  };
}

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

function montarUserPromptTriagem(params: {
  tipoAcao: string;
  fatos: string;
  tutelaUrgencia?: boolean;
  casoReal: boolean;
  especiePeca?: string;
  poloAdvocacia?: PoloAdvocacia | null;
  areaId?: string;
  vinculosPeca?: string | null;
}): string {
  return [
    "Processe o relato abaixo e devolva APENAS o resumo estruturado pedido no system prompt.",
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
  poloAdvocacia?: PoloAdvocacia | null;
  areaId?: string;
  vinculosPeca?: string | null;
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
      : params.instrucoes?.temMle === false
        ? "MLE: NÃO — checkbox desligado; não pedir Mandado de Levantamento Eletrônico."
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
  /** Roteamento Flash/Sonnet (Completo 12% · Pro 22%). */
  roteamento?: {
    userId: string;
    plano: PlanoCota;
  };
}): Promise<ResultadoPecaIA> {
  if (!geminiConfigurado()) {
    return {
      ok: false,
      erro: "GEMINI_API_KEY não configurada. Adicione a chave no ambiente do servidor.",
    };
  }

  const casoReal = params.casoReal ?? true;
  const areaId = params.areaId ?? "jec";
  const polo =
    params.poloAdvocacia != null
      ? normalizarPoloAdvocacia(params.poloAdvocacia)
      : null;
  const opcoesPolo =
    polo != null
      ? { polo, atuarLeigo: Boolean(params.atuarLeigo) }
      : undefined;
  const especie = inferirEspecieDaArea(
    areaId,
    params.tipoAcao,
    params.fatos,
    params.especiePeca
  );
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

  const contextoBase = [
    montarContextoConhecimento(itens),
    blocoPromptTesesCanonicas(teses),
  ]
    .filter(Boolean)
    .join("\n\n");
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

  // —— Analista Facto + Estrategista (uma chamada LLM barata/triagem) ——
  const triagemRes = await gerarTextoComGemini({
    systemPrompt: montarSystemPromptAnaliseEstrategica(
      contextoBase,
      leiMunicipal,
      jurisDoCaso,
      especieFinal,
      areaId,
      opcoesPolo,
      blocoVinculos,
      provasDoCaso
    ),
    userPrompt: montarUserPromptTriagem({
      tipoAcao: params.tipoAcao,
      fatos: params.fatos,
      tutelaUrgencia: params.instrucoes?.tutelaUrgencia,
      casoReal,
      especiePeca: especieFinal,
      poloAdvocacia: polo,
      areaId,
      vinculosPeca: blocoVinculos,
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
    status:
      vinculos.incidenteAberto &&
      vinculos.cabivel &&
      vinculos.especie !== vinculos.cabivel
        ? "parcial"
        : "ok",
    detalhe: detalheAnalista({
      nomeAcao: analiseEstrategica.nomeAcao,
      vinculos,
      riscos: analiseEstrategica.riscosOuLacunas,
    }),
    modelo: triagemRes.modelo,
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
    }),
    modelo: triagemRes.modelo,
  });

  const tesesPrompt = blocoPromptTesesCanonicas(teses);
  const contextoRedacao = [montarContextoConhecimento(itensFinais), tesesPrompt]
    .filter(Boolean)
    .join("\n\n");
  const estrategiaParaRedator = reforcarEstrategiaParaRedator({
    estrategia: estrategiaJuridica,
    vinculos,
    teses,
    pedidosUsuario: params.instrucoes?.pedidosUsuario,
    pedirJusticaGratuita: params.instrucoes?.pedirJusticaGratuita,
    temMle: params.instrucoes?.temMle,
    tutelaUrgencia: params.instrucoes?.tutelaUrgencia,
  });

  // —— Redator forense (Flash padrão; Sonnet se roteador autorizar) ——
  const systemRedacao = montarSystemPromptRedacaoTier1(
    contextoRedacao,
    leiMunicipal,
    jurisDoCaso,
    especieFinal,
    areaId,
    opcoesPolo,
    blocoVinculos,
    params.estiloEscritorio,
    provasDoCaso
  );
  const userRedacao = montarUserPromptRedacao({
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
    charsRelato: params.fatos.length,
    tutelaUrgencia: Boolean(params.instrucoes?.tutelaUrgencia),
    sonnetUsadas,
  });

  if (decisao.usarSonnet) {
    const sonnetRes = await gerarTextoComAnthropic({
      systemPrompt: systemRedacao,
      userPrompt: userRedacao,
      temperature: 0.35,
      maxOutputTokens: 8192,
    });
    if (sonnetRes.ok) {
      textoBrutoRedacao = sonnetRes.texto;
      redacaoModelo = sonnetRes.modelo;
      if (params.roteamento?.userId) {
        await registrarUmaRedacaoSonnet({ userId: params.roteamento.userId });
      }
    }
  }

  if (!textoBrutoRedacao) {
    const redacaoRes = await gerarTextoComGemini({
      systemPrompt: systemRedacao,
      userPrompt: userRedacao,
      modelos: modelosRedacao(),
      temperature: 0.35,
      maxOutputTokens: 8192,
    });
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
    detalhe: detalheRedator({
      caracteres: textoGerado.length,
      tituloPeca: vinculos.tituloPeca,
    }),
    modelo: redacaoModelo,
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
  });

  return {
    ok: true,
    textoGerado: textoComLastro,
    modelo: `${triagemRes.modelo} → ${redacaoModelo}`,
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
