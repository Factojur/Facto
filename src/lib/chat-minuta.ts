/**
 * Chat FACTO — estado do caso, roteamento de área e payload compartilhado.
 */

import type { ComarcaInfo } from "@/lib/endereco-comarca";
import type {
  PreenchimentoEntradaCaso,
  ReplicaContestacaoResumo,
} from "@/lib/entrada-caso-types";
import {
  extrairPartesDoRelato,
  mesclarPartesExtraidas,
} from "@/lib/extrair-partes-relato";
import {
  aplicarQualificacaoExtraidaRelato,
  extrairQualificacaoDoRelato,
  ufDaQualificacao,
  type QualificacaoExtraida,
} from "@/lib/extrair-qualificacao-relato";
import {
  analisarJanelaRelato,
  resumoLeituraRelato,
} from "@/lib/peca-cabivel-autos";
import { extrasOrganizacaoLocal } from "@/lib/organizar-caso-local";
import {
  MAX_TRIBUNAIS_POR_BUSCA,
  normalizarTribunaisEscolhidos,
  tribunaisPadraoPorUf,
} from "@/lib/juris-provedores/tribunais-opcoes";
import type { OpcoesBuscaConhecimento } from "@/lib/base-conhecimento";
import { inferirPoloDoRelato, resolverPoloGeracao, especieCompativelComPolo, type PoloAdvocacia } from "@/lib/polo-advocacia";
import { ajustarEspecieCabivel, rotulosEpigrafePeca } from "@/lib/peca-cabivel-autos";
import { tituloPecaDaArea } from "@/lib/peca-especie-area";
import {
  areaUsaPoloAdvocacia,
  inferirPoloPorEspecie,
  ladoPoloDaEspecie,
} from "@/lib/polo-especies-por-area";
import type { JurisCasoItem, JurisCasoPayload } from "@/lib/juris-caso-types";
import { jurisCasoTemConteudo } from "@/lib/juris-caso-types";
import type { ProvaTextoCaso } from "@/lib/provas-caso-texto";
import type { CategoriaValorId, ItemValor } from "@/lib/valores-causa";
import { formularioValoresEstaVazio } from "@/lib/valores-causa";
import type { GerarPecaJecInput } from "@/lib/gerar-peca-jec";
import type { AutorValue } from "@/lib/autor-types";
import type { ReuValue } from "@/lib/reu-types";
import {
  normalizarAreaIdMinuta,
  type AreaIdMinuta,
  moduloDaArea,
} from "@/lib/minuta-modulo";
import {
  autoresAPartirDosNomes,
  reusAPartirDosNomes,
  parecePessoaJuridica,
} from "@/lib/partes-ja-qualificadas";
import { inferirEspecieDaArea, especieUsaTutelaUrgenciaCpc } from "@/lib/peca-especie-area";
import { getAreaById } from "@/lib/areas-atuacao";

/** Áreas no chat — Fase 1 + rollout Fase 3 (exc. Criminal, Const, JECR até smoke dedicado). */
export const CHAT_MINUTA_AREAS_FASE1: AreaIdMinuta[] = [
  "jec",
  "consumidor",
  "civil",
  "familia",
  "trabalhista",
  "imobiliario",
  "previdenciario",
  "tributario",
  "administrativo",
  "digital",
  "empresarial",
  "ambiental",
  "propriedade-intelectual",
  "medico",
  "internacional",
  "agrario",
  "criminal",
  "constitucional",
  "jecr",
  "eleitoral",
];

/** @deprecated use CHAT_MINUTA_AREAS_FASE1 — mantido para docs. */
export const CHAT_MINUTA_AREAS_PENDENTES: AreaIdMinuta[] = [];

export function chatMinutaAreaHabilitada(areaId: string): boolean {
  const id = normalizarAreaIdMinuta(areaId);
  if (process.env.CHAT_MINUTA_TODAS_AREAS === "1") return true;
  return CHAT_MINUTA_AREAS_FASE1.includes(id);
}

/** Lista ordenada para seletor de área no chat. */
export function areasChatMinutaDisponiveis(): AreaIdMinuta[] {
  return [...CHAT_MINUTA_AREAS_FASE1];
}

export type JurisCasoChat = JurisCasoItem & {
  arquivo?: { nome: string; mimeType: string; base64: string } | null;
};

export type ValoresCausaChat = Record<CategoriaValorId, ItemValor[]>;

export type MensagemChat = {
  id: string;
  papel: "usuario" | "assistente" | "sistema";
  texto: string;
  ts: number;
};

export type EstadoCasoChat = {
  areaId: AreaIdMinuta;
  fatos: string;
  tipoAcao: string;
  especiePeca: string;
  poloAdvocacia: "ativo" | "passivo" | null;
  poloConfirmado: boolean;
  pedirJusticaGratuita: boolean;
  tutelaUrgencia: boolean;
  comReconvencao: boolean;
  autoresNomes: string[];
  reusNomes: string[];
  pedidos: string[];
  comarca: Partial<ComarcaInfo>;
  tesesIds: string[];
  resumoEntrada: string | null;
  /** Último ato detectado nos autos (organização local / entrada). */
  ultimoAto: string | null;
  replicaContestacao: ReplicaContestacaoResumo | null;
  /** Área confirmada (manual, URL ou inferência alta). */
  areaConfirmada: boolean;
  /** Última inferência automática — desambiguação no chat. */
  areaInferida: InferenciaAreaChat | null;
  /** Por que a área foi escolhida (IA ou remédio cabível). */
  areaMotivo: string | null;
  /** Plano estratégico (triagem) conferido pelo usuário. */
  planoVisto: boolean;
  /** @deprecated use planoVisto — mantido para sessões antigas. */
  previewVisto: boolean;
  provasCaso: ProvaTextoCaso[];
  linkNuvem: string;
  midiasNomes: string[];
  mostrarMidiasOpcionais: boolean;
  jurisCaso: JurisCasoChat[];
  leiMunicipalTitulo: string;
  leiMunicipalTexto: string;
  valoresCausa: ValoresCausaChat;
  /** Até 3 tribunais para priorizar lastro (TJ + superiores). */
  tribunaisPreferidos: string[];
  /** Usuário recusou escolher tribunais sem UF. */
  tribunaisDispensados: boolean;
  /** Tribunais escolhidos confirmados pelo usuário (picker). */
  tribunaisConfirmados: boolean;
  /** Qualificação extraída/ViaCEP (0 tokens) — cache para o preview. */
  qualificacaoAutor: QualificacaoExtraida;
  qualificacaoReu: QualificacaoExtraida;
};

export function estadoCasoChatVazio(
  areaId: AreaIdMinuta = "jec"
): EstadoCasoChat {
  return {
    areaId,
    fatos: "",
    tipoAcao: "",
    especiePeca: "",
    poloAdvocacia: "ativo",
    poloConfirmado: false,
    pedirJusticaGratuita: false,
    tutelaUrgencia: false,
    comReconvencao: false,
    autoresNomes: [],
    reusNomes: [],
    pedidos: [],
    comarca: {},
    tesesIds: [],
    resumoEntrada: null,
    ultimoAto: null,
    replicaContestacao: null,
    areaConfirmada: false,
    areaInferida: null,
    areaMotivo: null,
    planoVisto: false,
    previewVisto: false,
    provasCaso: [],
    linkNuvem: "",
    midiasNomes: [],
    mostrarMidiasOpcionais: false,
    jurisCaso: [],
    leiMunicipalTitulo: "",
    leiMunicipalTexto: "",
    valoresCausa: { danosMateriais: [], danosMorais: [] },
    tribunaisPreferidos: [],
    tribunaisDispensados: false,
    tribunaisConfirmados: false,
    qualificacaoAutor: {},
    qualificacaoReu: {},
  };
}

const REGRAS_AREA: { id: AreaIdMinuta; re: RegExp; peso: number }[] = [
  { id: "jec", re: /juizado|9\.099|jec\b|pequenas causas/i, peso: 3 },
  { id: "trabalhista", re: /trabalh|clt|reclamante|reclamad|tst\b|justiça do trabalho/i, peso: 3 },
  { id: "consumidor", re: /consumidor|cdc|fornecedor|vício do produto|propaganda enganosa/i, peso: 3 },
  {
    id: "familia",
    re: /\bfamília\b(?!\s+na\s+cidade)|\bfamilia\b(?!\s+na\s+cidade)|\balimentos\b|\bguarda\b|\bdivórcio\b|\bdivorcio\b|\binventário\b/i,
    peso: 3,
  },
  { id: "imobiliario", re: /imobili|locação|locacao|despejo|usucapião|condomínio/i, peso: 3 },
  {
    id: "previdenciario",
    re: /\bprevid|\binss\b|\bbenefício\b|\bbeneficio\b|\baposentadoria\b|\bbpc\b|\bloas\b|\bder\b|\bindefer/i,
    peso: 4,
  },
  { id: "criminal", re: /habeas\s+corpus|pris[aã]o\s+preventiva|flagrante|furto\s+simples|art\.?\s*155|convers[aã]o\s+em\s+pris[aã]o/i, peso: 6 },
  { id: "criminal", re: /criminal|penal|denúncia|habeas|cpp\b|acusad/i, peso: 3 },
  { id: "constitucional", re: /constitucional|adpf|adi|adc|adpf|mandado de segurança coletivo/i, peso: 3 },
  { id: "jecr", re: /jecrim|jecr\b|juizado criminal|9\.099.*penal/i, peso: 4 },
  { id: "eleitoral", re: /eleitoral|tse|tre\b|propaganda eleitoral|9\.504/i, peso: 3 },
  { id: "tributario", re: /tribut|fiscal|icms|iptu|execução fiscal/i, peso: 2 },
  { id: "civil", re: /cível|civil|cobrança|indenização|obrigação de fazer/i, peso: 1 },
];

export type InferenciaAreaChat = {
  areaId: AreaIdMinuta;
  confianca: "alta" | "media" | "baixa";
  alternativas: AreaIdMinuta[];
};

export function inferirAreaChatDetalhado(params: {
  texto: string;
  preferida?: string | null;
  leigo?: boolean;
}): InferenciaAreaDetalhada {
  const pref = params.preferida?.trim()
    ? normalizarAreaIdMinuta(params.preferida)
    : null;
  if (pref && chatMinutaAreaHabilitada(pref)) {
    return {
      inferencia: { areaId: pref, confianca: "alta", alternativas: [] },
      ordenado: [{ areaId: pref, score: 99 }],
    };
  }

  const scores = new Map<AreaIdMinuta, number>();
  for (const regra of REGRAS_AREA) {
    if (!chatMinutaAreaHabilitada(regra.id)) continue;
    if (regra.re.test(params.texto)) {
      scores.set(regra.id, (scores.get(regra.id) ?? 0) + regra.peso);
    }
  }

  const ordenado = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([areaId, score]) => ({ areaId, score }));

  if (ordenado.length === 0) {
    const fallback: AreaIdMinuta = params.leigo ? "jec" : "civil";
    return {
      inferencia: {
        areaId: fallback,
        confianca: "baixa",
        alternativas: CHAT_MINUTA_AREAS_FASE1.filter((a) => a !== fallback).slice(
          0,
          3
        ),
      },
      ordenado: [],
    };
  }

  let topId = ordenado[0]!.areaId;
  let topScore = ordenado[0]!.score;
  const segundoId = ordenado[1]?.areaId;
  const segundo = ordenado[1]?.score ?? 0;

  if (
    topId === "familia" &&
    segundoId === "previdenciario" &&
    topScore <= segundo + 1 &&
    /\b(inss|bpc|loas|previd|beneficio|benefício|aposentadoria)\b/i.test(
      params.texto
    )
  ) {
    topId = "previdenciario";
    topScore = segundo;
  }

  if (
    topId === "familia" &&
    (scores.get("criminal") ?? 0) > 0 &&
    /\b(habeas|pris[aã]o\s+preventiva|flagrante|furto|cpp\b|art\.?\s*155|penal|criminal)\b/i.test(
      params.texto
    )
  ) {
    topId = "criminal";
    topScore = scores.get("criminal") ?? topScore;
  }

  const confianca: InferenciaAreaChat["confianca"] =
    topScore >= 3 && topScore > segundo + 1
      ? "alta"
      : topScore >= 2
        ? "media"
        : "baixa";

  return {
    inferencia: {
      areaId: topId,
      confianca,
      alternativas: ordenado.slice(1, 4).map((o) => o.areaId),
    },
    ordenado,
  };
}

export type InferenciaAreaDetalhada = {
  inferencia: InferenciaAreaChat;
  ordenado: { areaId: AreaIdMinuta; score: number }[];
};

export function inferirAreaChat(params: {
  texto: string;
  preferida?: string | null;
  leigo?: boolean;
}): InferenciaAreaChat {
  return inferirAreaChatDetalhado(params).inferencia;
}

/** MinutaIA-style: área segue automática — usuário troca no header se quiser. */
export function areaExigeConfirmacao(
  _inferencia: InferenciaAreaChat | null | undefined
): boolean {
  return false;
}

/** Chip de sugestão (média) — desligado: área média/alta segue automática (paridade MinutaIA). */
export function areaSugereConfirmacao(
  _inferencia: InferenciaAreaChat | null | undefined,
  _areaConfirmada: boolean
): boolean {
  return false;
}

export function opcoesAreaParaConfirmacao(
  inferencia: InferenciaAreaChat | null | undefined
): AreaIdMinuta[] {
  if (!inferencia) return [];
  const ids = [inferencia.areaId, ...inferencia.alternativas];
  return [...new Set(ids)]
    .filter((id) => chatMinutaAreaHabilitada(id))
    .slice(0, 4);
}

export function aplicarInferenciaAreaAoEstado(
  estado: EstadoCasoChat,
  inferencia: InferenciaAreaChat,
  opts?: { manual?: boolean; motivo?: string | null }
): EstadoCasoChat {
  return {
    ...estado,
    areaId: inferencia.areaId,
    areaInferida: inferencia,
    areaMotivo: opts?.motivo ?? estado.areaMotivo,
    areaConfirmada: true,
    planoVisto: false,
    previewVisto: false,
  };
}

export function confirmarAreaChat(
  estado: EstadoCasoChat,
  areaId: AreaIdMinuta
): EstadoCasoChat {
  return {
    ...estado,
    areaId,
    areaConfirmada: true,
    areaInferida: { areaId, confianca: "alta", alternativas: [] },
    planoVisto: false,
    previewVisto: false,
  };
}

/** Caso com relato mínimo para organizar plano e painel. */
export function casoChatTemConteudo(estado: EstadoCasoChat): boolean {
  return estado.fatos.trim().length >= 40;
}

/** Painel direito ainda sem relato — não mostrar JEC/petição pré-preenchidos. */
export function casoChatPainelVazio(estado: EstadoCasoChat): boolean {
  return !estado.fatos.trim();
}

export function podeMontarPlanoChat(estado: EstadoCasoChat): boolean {
  const temArea =
    estado.areaConfirmada ||
    Boolean(estado.areaInferida?.areaId) ||
    Boolean(estado.areaId);
  return (
    casoChatTemConteudo(estado) &&
    temArea
  );
}

/** Confirma área sugerida antes de redigir se ainda pendente (baixa confiança). */
export function garantirAreaParaRedacao(
  estado: EstadoCasoChat
): EstadoCasoChat {
  if (estado.areaConfirmada) return estado;
  const sugerida = estado.areaInferida?.areaId ?? estado.areaId;
  return confirmarAreaChat(estado, sugerida);
}

export function montarResumoEntendimentoChat(estado: EstadoCasoChat): {
  fatosResumo: string;
  tipoAcao: string;
  especie: string;
  autores: string;
  reus: string;
  pedidos: string[];
  foro: string;
} {
  const fatos = estado.fatos.trim();
  const temConteudo = casoChatTemConteudo(estado);
  const especie = temConteudo
    ? inferirEspecieDaArea(
        estado.areaId,
        estado.tipoAcao || "Petição",
        fatos,
        estado.especiePeca || undefined
      )
    : "";
  return {
    fatosResumo: fatos.length
      ? fatos.length > 480
        ? `${fatos.slice(0, 480).trim()}…`
        : fatos
      : "",
    tipoAcao: estado.tipoAcao.trim() || "—",
    especie: temConteudo && especie ? especie.replace(/-/g, " ") : "—",
    autores: estado.autoresNomes.join(", ") || "—",
    reus: estado.reusNomes.join(", ") || "—",
    pedidos: estado.pedidos.filter(Boolean),
    foro: estado.comarca.foro?.trim() || estado.comarca.cidade?.trim() || "—",
  };
}

export function rotuloAreaChat(areaId: AreaIdMinuta): string {
  return getAreaById(areaId)?.title ?? moduloDaArea(areaId).tituloDashboard;
}

export type PayloadGeracaoChat = GerarPecaJecInput & {
  areaId: AreaIdMinuta;
  tesesIds?: string[];
  pedidosUsuario?: string[];
  resumoEntrada?: string | null;
  ultimoAto?: string | null;
  leituraRelato?: string | null;
  replicaContestacao?: ReplicaContestacaoResumo | null;
  tribunaisPreferidos?: string[];
  leiMunicipal?: {
    nome?: string;
    texto?: string;
    mimeType?: string;
    base64?: string;
  } | null;
  jurisDoCaso?: JurisCasoPayload[] | null;
};

function montarJurisDoCasoPayload(
  juris: JurisCasoChat[]
): JurisCasoPayload[] | null {
  const items = juris.filter(jurisCasoTemConteudo).map((j) => ({
    id: j.id,
    tipo: j.tipo,
    titulo: j.titulo,
    texto: j.texto.trim() || undefined,
    nomeArquivo: j.nomeArquivo ?? j.arquivo?.nome,
    mimeType: j.texto.trim() ? undefined : j.arquivo?.mimeType,
    base64: j.texto.trim() ? undefined : j.arquivo?.base64,
  }));
  return items.length > 0 ? items : null;
}

function montarLeiMunicipalPayload(
  titulo: string,
  texto: string
): PayloadGeracaoChat["leiMunicipal"] {
  const corpo = texto.trim();
  if (!corpo) return null;
  return {
    nome: titulo.trim() || "Lei municipal (texto colado)",
    texto: corpo,
  };
}

function normNomeParte(nome: string | undefined | null): string {
  return String(nome ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function nomeReu(r: ReuValue): string {
  return r.tipo === "pj"
    ? r.razaoSocial || r.nomeFantasia || ""
    : r.nomeCompleto || "";
}

const RE_CONSUMIDOR_REU =
  /\b(enel|sabesp|energia|concession[aá]ria|fornecedor|companhia\s+de\s+energia)\b/i;

/** Uma qualificação por polo; HC sem réu civil de outro caso. */
export function sanitizarPartesPayloadChat(
  areaId: AreaIdMinuta,
  especie: string,
  autores: AutorValue[],
  reus: ReuValue[]
): { autores: AutorValue[]; reus: ReuValue[] } {
  const autoresOut = autores.slice(0, 1);
  const nomesAutor = new Set(
    autoresOut.map((a) => normNomeParte(a.nomeCompleto)).filter(Boolean)
  );

  let reusOut = reus.filter((r) => {
    const n = normNomeParte(nomeReu(r));
    if (!n) return false;
    for (const a of nomesAutor) {
      if (a === n || n.includes(a) || a.includes(n)) return false;
    }
    return true;
  });

  if (areaId === "criminal" && especie === "habeas-corpus") {
    reusOut = reusOut.filter((r) => {
      const rotulo = nomeReu(r);
      if (RE_CONSUMIDOR_REU.test(rotulo)) return false;
      if (parecePessoaJuridica(rotulo) && /enel|sabesp|energia/i.test(rotulo)) {
        return false;
      }
      return true;
    });
  }

  return { autores: autoresOut, reus: reusOut.slice(0, 2) };
}

export function montarPayloadGeracaoChat(
  estado: EstadoCasoChat,
  extras?: {
    atuarLeigo?: boolean;
    replicaContestacao?: ReplicaContestacaoResumo | null;
  }
): PayloadGeracaoChat {
  const areaId = estado.areaId;
  const especie = inferirEspecieDaArea(
    areaId,
    estado.tipoAcao || "Petição",
    estado.fatos,
    estado.especiePeca
  );
  const pedidosUsuario = estado.pedidos.filter(Boolean);
  let polo = resolverPoloGeracao(areaId, especie, estado.poloAdvocacia);
  if (!polo) {
    // Ambíguo: relato → senão polo ativo (não bloqueia Redigir — paridade MinutaIA)
    polo = inferirPoloDoRelato(estado.fatos) ?? "ativo";
  }
  const valoresCausa = formularioValoresEstaVazio(estado.valoresCausa)
    ? undefined
    : estado.valoresCausa;

  let autoresNomes = estado.autoresNomes;
  let reusNomes = estado.reusNomes;
  if (!autoresNomes.length || !reusNomes.length) {
    const extraidas = extrairPartesDoRelato(estado.fatos);
    const mesclado = mesclarPartesExtraidas(
      { autoresNomes, reusNomes },
      extraidas
    );
    autoresNomes = mesclado.autoresNomes;
    reusNomes = mesclado.reusNomes;
  }

  let autores = autoresAPartirDosNomes(autoresNomes.join("; "));
  let reus = reusAPartirDosNomes(reusNomes.join("; "));
  const qual = aplicarQualificacaoExtraidaRelato(
    autores,
    reus,
    estado.fatos,
    {
      autor: estado.qualificacaoAutor,
      reu: estado.qualificacaoReu,
    }
  );
  autores = qual.autores;
  reus = qual.reus;
  const partesLimpas = sanitizarPartesPayloadChat(areaId, especie, autores, reus);
  autores = partesLimpas.autores;
  reus = partesLimpas.reus;

  const estadoSync = sincronizarTribunaisComarca(
    sincronizarComarcaDaQualificacao(estado)
  );
  const janelaRelato = analisarJanelaRelato(estado.fatos);

  return {
    areaId,
    tipoAcao: estado.tipoAcao.trim() || "Petição",
    especiePeca: especie,
    fatos: estado.fatos.trim(),
    tutelaUrgencia: estado.tutelaUrgencia,
    pedirJusticaGratuita: estado.pedirJusticaGratuita,
    comReconvencao: estado.comReconvencao,
    poloAdvocacia: polo ?? undefined,
    atuarLeigo: extras?.atuarLeigo,
    documentos: {
      declaracaoHipossuficiencia: [],
      mandadoLevantamentoEletronico: [],
    },
    provas: estado.provasCaso.map((p) => p.nome).filter(Boolean),
    fotos: [],
    midias: estado.midiasNomes,
    linkNuvem: estado.linkNuvem.trim() || null,
    provasTexto: estado.provasCaso.map((p) => ({
      nome: p.nome,
      texto: p.texto,
      tipo: p.tipo,
      sintese: p.sintese,
    })),
    autores,
    reus,
    comarca: {
      foro: estado.comarca.foro?.trim() || undefined,
      cidade: estado.comarca.cidade?.trim() || undefined,
      uf: estado.comarca.uf?.trim() || undefined,
      numeroJuizado: estado.comarca.numeroJuizado?.trim() || undefined,
      numeroProcesso: estado.comarca.numeroProcesso?.trim() || undefined,
    },
    valoresCausa,
    pedidosUsuario,
    tesesIds: estado.tesesIds,
    resumoEntrada: estado.resumoEntrada ?? undefined,
    ultimoAto: estado.ultimoAto?.trim() || null,
    leituraRelato: janelaRelato.truncado
      ? resumoLeituraRelato({
          truncado: true,
          encontrouDecisoes: janelaRelato.encontrouDecisoes,
          fonte: "relato",
        })
      : null,
    replicaContestacao:
      extras?.replicaContestacao ?? estado.replicaContestacao ?? undefined,
    leiMunicipal: montarLeiMunicipalPayload(
      estado.leiMunicipalTitulo,
      estado.leiMunicipalTexto
    ),
    jurisDoCaso: montarJurisDoCasoPayload(estado.jurisCaso),
    tribunaisPreferidos: estadoSync.tribunaisPreferidos,
  };
}

/** Completa campos novos em sessões antigas do localStorage/nuvem. */
export function normalizarEstadoCasoChat(
  bruto: Partial<EstadoCasoChat> | null | undefined,
  areaFallback: AreaIdMinuta = "jec"
): EstadoCasoChat {
  const base = estadoCasoChatVazio(
    bruto?.areaId
      ? normalizarAreaIdMinuta(bruto.areaId)
      : areaFallback
  );
  if (!bruto) return base;
  return {
    ...base,
    ...bruto,
    areaId: bruto.areaId
      ? normalizarAreaIdMinuta(bruto.areaId)
      : base.areaId,
    comarca: { ...base.comarca, ...(bruto.comarca ?? {}) },
    valoresCausa: {
      ...base.valoresCausa,
      ...(bruto.valoresCausa ?? {}),
    },
    autoresNomes: Array.isArray(bruto.autoresNomes)
      ? bruto.autoresNomes
      : base.autoresNomes,
    reusNomes: Array.isArray(bruto.reusNomes)
      ? bruto.reusNomes
      : base.reusNomes,
    pedidos: Array.isArray(bruto.pedidos) ? bruto.pedidos : base.pedidos,
    tesesIds: Array.isArray(bruto.tesesIds) ? bruto.tesesIds : base.tesesIds,
    provasCaso: Array.isArray(bruto.provasCaso)
      ? bruto.provasCaso
      : base.provasCaso,
    midiasNomes: Array.isArray(bruto.midiasNomes)
      ? bruto.midiasNomes
      : base.midiasNomes,
    jurisCaso: Array.isArray(bruto.jurisCaso)
      ? bruto.jurisCaso
      : base.jurisCaso,
    tribunaisPreferidos: Array.isArray(bruto.tribunaisPreferidos)
      ? bruto.tribunaisPreferidos
      : [],
    tribunaisDispensados: Boolean(bruto.tribunaisDispensados),
    tribunaisConfirmados: Boolean(bruto.tribunaisConfirmados),
    qualificacaoAutor: bruto.qualificacaoAutor ?? {},
    qualificacaoReu: bruto.qualificacaoReu ?? {},
    ultimoAto:
      typeof bruto.ultimoAto === "string" ? bruto.ultimoAto : base.ultimoAto,
    areaConfirmada: Boolean(
      bruto.areaConfirmada ?? bruto.previewVisto ?? bruto.planoVisto
    ),
    areaInferida:
      bruto.areaInferida && typeof bruto.areaInferida === "object"
        ? (bruto.areaInferida as InferenciaAreaChat)
        : null,
    areaMotivo:
      typeof bruto.areaMotivo === "string" ? bruto.areaMotivo : base.areaMotivo,
    planoVisto: Boolean(bruto.planoVisto ?? bruto.previewVisto),
    previewVisto: Boolean(bruto.previewVisto ?? bruto.planoVisto),
  };
}

/** Preenche TJ+STJ quando a comarca traz UF e o usuário ainda não escolheu. */
export function sincronizarTribunaisComarca(
  estado: EstadoCasoChat
): EstadoCasoChat {
  const preferidos = estado.tribunaisPreferidos ?? [];
  if (preferidos.length > 0) {
    return preferidos === estado.tribunaisPreferidos
      ? estado
      : { ...estado, tribunaisPreferidos: preferidos };
  }
  const uf = estado.comarca?.uf?.trim();
  if (!uf) {
    return estado.tribunaisPreferidos
      ? estado
      : { ...estado, tribunaisPreferidos: [] };
  }
  const padrao = tribunaisPadraoPorUf(uf);
  if (!padrao.length) {
    return { ...estado, tribunaisPreferidos: preferidos };
  }
  return {
    ...estado,
    tribunaisPreferidos: padrao.slice(0, MAX_TRIBUNAIS_POR_BUSCA),
  };
}

export function opcoesLastroChat(
  estado: EstadoCasoChat,
  especie?: string | null
): OpcoesBuscaConhecimento {
  const esp =
    especie ??
    inferirEspecieDaArea(
      estado.areaId,
      estado.tipoAcao || "Petição",
      estado.fatos,
      estado.especiePeca
    );
  const polo = resolverPoloGeracao(estado.areaId, esp, estado.poloAdvocacia);
  const sync = sincronizarTribunaisComarca(estado);
  const tribunais = sync.tribunaisPreferidos ?? [];
  return {
    polo,
    especie: esp,
    tribunais: tribunais.length ? tribunais : undefined,
    ufComarca:
      tribunais.length === 0 && sync.comarca?.uf?.trim()
        ? sync.comarca.uf.trim()
        : undefined,
  };
}

export function precisaEscolherTribunais(estado: EstadoCasoChat): boolean {
  if (estado.tribunaisDispensados) return false;
  if (estado.tribunaisConfirmados) return false;
  if (estado.comarca?.uf?.trim()) return false;
  return (estado.fatos ?? "").trim().length >= 40;
}

export function definirTribunaisChat(
  estado: EstadoCasoChat,
  ids: string[]
): EstadoCasoChat | { erro: string } {
  const norm = normalizarTribunaisEscolhidos(ids);
  if (!norm.ok) return { erro: norm.erro };
  return { ...estado, tribunaisPreferidos: norm.ids };
}

/** Opções de lastro a partir do payload das APIs (chat e JEC). */
export function opcoesLastroFromPayload(input: {
  areaId: string;
  tipoAcao: string;
  fatos: string;
  especiePeca: string;
  poloAdvocacia?: "ativo" | "passivo" | null;
  tribunaisPreferidos?: string[];
  comarca?: { uf?: string };
}): OpcoesBuscaConhecimento {
  const areaId = normalizarAreaIdMinuta(input.areaId);
  const base = estadoCasoChatVazio(areaId);
  const estado = sincronizarTribunaisComarca({
    ...base,
    tipoAcao: input.tipoAcao,
    fatos: input.fatos,
    especiePeca: input.especiePeca,
    poloAdvocacia: input.poloAdvocacia ?? null,
    tribunaisPreferidos: input.tribunaisPreferidos ?? [],
    comarca: { uf: input.comarca?.uf?.trim() },
  });
  return opcoesLastroChat(estado, input.especiePeca);
}

/** Workspace do assistente — `/dashboard` (chat embutido; `/dashboard/chat` redireciona). */
export function hrefChatMinuta(
  areaId?: string,
  opcoes?: { nova?: boolean }
): string {
  const params = new URLSearchParams();
  if (areaId?.trim()) {
    params.set("area", normalizarAreaIdMinuta(areaId));
  }
  if (opcoes?.nova) params.set("nova", "1");
  const q = params.toString();
  return q ? `/dashboard?${q}` : "/dashboard";
}

export function idMensagemChat(): string {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function aplicarPreenchimentoAoEstado(
  estado: EstadoCasoChat,
  preenchimento: PreenchimentoEntradaCaso,
  areaId?: AreaIdMinuta
): EstadoCasoChat {
  const next: EstadoCasoChat = {
    ...estado,
    areaId: areaId ?? estado.areaId,
    resumoEntrada: preenchimento.resumoConferencia || estado.resumoEntrada,
    tesesIds: preenchimento.tesesIds?.length
      ? preenchimento.tesesIds
      : estado.tesesIds,
  };

  if (preenchimento.fatos?.trim()) next.fatos = preenchimento.fatos.trim();
  if (preenchimento.tipoAcao?.trim()) next.tipoAcao = preenchimento.tipoAcao.trim();
  if (preenchimento.especiePeca?.trim()) {
    next.especiePeca = preenchimento.especiePeca.trim();
    const lado = ladoPoloDaEspecie(next.areaId, next.especiePeca);
    if (lado === "ativo" || lado === "passivo") {
      next.poloAdvocacia = lado;
      next.poloConfirmado = true;
    } else if (lado === "ambos" && !next.poloConfirmado) {
      const inferido = inferirPoloDoRelato(
        [
          preenchimento.fatos,
          preenchimento.tipoAcao,
          preenchimento.resumoConferencia,
        ]
          .filter(Boolean)
          .join("\n")
      );
      if (inferido) {
        next.poloAdvocacia = inferido;
        next.poloConfirmado = true;
      }
    }
  }
  if (preenchimento.autoresNomes.length) {
    next.autoresNomes = preenchimento.autoresNomes;
  }
  if (preenchimento.reusNomes.length) {
    next.reusNomes = preenchimento.reusNomes;
  }

  if (!next.autoresNomes.length || !next.reusNomes.length) {
    const fonte = [preenchimento.fatos, next.fatos, preenchimento.resumoConferencia]
      .filter(Boolean)
      .join("\n");
    const extraidas = extrairPartesDoRelato(fonte);
    const mesclado = mesclarPartesExtraidas(
      { autoresNomes: next.autoresNomes, reusNomes: next.reusNomes },
      extraidas
    );
    next.autoresNomes = mesclado.autoresNomes;
    next.reusNomes = mesclado.reusNomes;
  }

  if (
    preenchimento.foro ||
    preenchimento.numeroProcesso ||
    preenchimento.cidade
  ) {
    next.comarca = {
      ...next.comarca,
      foro: preenchimento.foro?.trim() || next.comarca.foro,
      numeroProcesso:
        preenchimento.numeroProcesso?.trim() || next.comarca.numeroProcesso,
      cidade: preenchimento.cidade?.trim() || next.comarca.cidade,
      uf: preenchimento.uf?.trim() || next.comarca.uf,
      numeroJuizado:
        preenchimento.numeroVara?.trim() || next.comarca.numeroJuizado,
    };
  }
  if (preenchimento.pedidos.length) {
    next.pedidos = preenchimento.pedidos;
  }
  if (preenchimento.pedirJusticaGratuita != null) {
    next.pedirJusticaGratuita = preenchimento.pedirJusticaGratuita;
  }
  if (preenchimento.tutelaUrgencia != null) {
    next.tutelaUrgencia = preenchimento.tutelaUrgencia;
  }
  if (preenchimento.ultimoAto?.trim()) {
    next.ultimoAto = preenchimento.ultimoAto.trim();
  }

  const areaResolvida = areaId ?? next.areaId;
  const especie = inferirEspecieDaArea(
    areaResolvida,
    next.tipoAcao || "Petição",
    next.fatos,
    next.especiePeca
  );
  if (!especieUsaTutelaUrgenciaCpc(especie)) {
    next.tutelaUrgencia = false;
  }

  return next;
}

/** Aplica preenchimento + extras locais (lei municipal detectada no relato). */
export function aplicarOrganizacaoAoEstadoChat(
  estado: EstadoCasoChat,
  preenchimento: PreenchimentoEntradaCaso,
  opcoes?: {
    areaId?: AreaIdMinuta;
    relato?: string;
    replicaContestacao?: ReplicaContestacaoResumo | null;
  }
): EstadoCasoChat {
  let next = aplicarPreenchimentoAoEstado(
    normalizarEstadoCasoChat(estado),
    preenchimento,
    opcoes?.areaId
  );
  if (opcoes?.replicaContestacao) {
    next = { ...next, replicaContestacao: opcoes.replicaContestacao };
  }
  const extras = opcoes?.relato ? extrasOrganizacaoLocal(opcoes.relato) : null;
  if (extras?.leiMunicipalTitulo && !next.leiMunicipalTitulo.trim()) {
    next = { ...next, leiMunicipalTitulo: extras.leiMunicipalTitulo };
  }
  const relato = opcoes?.relato ?? next.fatos;
  if (relato?.trim()) {
    const partes = extrairQualificacaoDoRelato(relato);
    next = {
      ...next,
      qualificacaoAutor: { ...next.qualificacaoAutor, ...partes.autor },
      qualificacaoReu: { ...next.qualificacaoReu, ...partes.reu },
    };
  }
  return sincronizarTribunaisComarca(sincronizarComarcaDaQualificacao(next));
}

/** Preenche comarca.uf a partir do endereço da parte (0 tokens). */
export function sincronizarComarcaDaQualificacao(
  estado: EstadoCasoChat
): EstadoCasoChat {
  if (estado.comarca.uf?.trim()) return estado;
  const uf =
    ufDaQualificacao({
      autor: estado.qualificacaoAutor,
      reu: estado.qualificacaoReu,
    }) ?? null;
  if (!uf) return estado;
  const cidade =
    estado.comarca.cidade?.trim() ||
    estado.qualificacaoAutor.cidade ||
    estado.qualificacaoReu.cidade ||
    undefined;
  return {
    ...estado,
    comarca: {
      ...estado.comarca,
      uf,
      cidade: cidade || estado.comarca.cidade,
      foro:
        estado.comarca.foro?.trim() ||
        (cidade ? `${cidade}/${uf}` : undefined),
    },
  };
}

export function especieResolvidaChat(estado: EstadoCasoChat): string {
  return inferirEspecieDaArea(
    estado.areaId,
    estado.tipoAcao || "Petição",
    estado.fatos,
    estado.especiePeca
  );
}

export function poloExigeConfirmacaoChat(
  areaId: AreaIdMinuta,
  especiePeca: string
): boolean {
  if (!areaUsaPoloAdvocacia(areaId)) return false;
  return ladoPoloDaEspecie(areaId, especiePeca) === "ambos";
}

/** Infere polo do relato quando a espécie aceita ambos os lados. */
export function aplicarPoloInferidoChat(
  estado: EstadoCasoChat,
  textoExtra?: string | null
): EstadoCasoChat {
  const blob = [estado.fatos, textoExtra].filter(Boolean).join("\n\n");
  const inferido = inferirPoloDoRelato(blob);
  if (!inferido) return estado;

  const especie = especieResolvidaChat(estado);
  const exigeEscolha = poloExigeConfirmacaoChat(estado.areaId, especie);

  if (textoExtra?.trim() && inferirPoloDoRelato(textoExtra)) {
    return {
      ...estado,
      poloAdvocacia: inferido,
      poloConfirmado: true,
    };
  }

  if (!exigeEscolha && estado.poloConfirmado && estado.poloAdvocacia) {
    return estado;
  }
  if (estado.poloConfirmado && estado.poloAdvocacia === inferido) return estado;

  return {
    ...estado,
    poloAdvocacia: inferido,
    poloConfirmado: true,
  };
}

/**
 * Reajusta espécie após polo — só quando a IA ainda não fixou o remédio.
 * Com `respeitarEspecieIa`, não sobrescreve a interpretação.
 */
export function reajustarEspeciePoloChat(
  estado: EstadoCasoChat,
  opts?: { respeitarEspecieIa?: boolean }
): EstadoCasoChat {
  if (opts?.respeitarEspecieIa && estado.especiePeca?.trim()) {
    return estado;
  }
  const especieAtual = especieResolvidaChat(estado);
  const ajustada = ajustarEspecieCabivel({
    areaId: estado.areaId,
    especie: especieAtual,
    tipoAcao: estado.tipoAcao,
    fatos: estado.fatos,
    poloAdvocacia: estado.poloAdvocacia,
  });
  if (ajustada === especieAtual && ajustada === estado.especiePeca) return estado;
  const tipoAcao =
    tituloPecaDaArea(estado.areaId, ajustada, estado.tipoAcao) || estado.tipoAcao;
  return { ...estado, especiePeca: ajustada, tipoAcao };
}

/**
 * Aviso de conferência (não bloqueia Redigir — paridade MinutaIA).
 * Retorna texto para banner âmbar; null se ok.
 */
export function avisosPoloEspecieChat(estado: EstadoCasoChat): string | null {
  const especie = especieResolvidaChat(estado);
  if (
    poloExigeConfirmacaoChat(estado.areaId, especie) &&
    !estado.poloAdvocacia
  ) {
    return "Confirme o polo no chat se puder — a peça seguirá com a melhor leitura do caso.";
  }

  const polo = resolverPoloGeracao(estado.areaId, especie, estado.poloAdvocacia);
  if (
    polo &&
    !especieCompativelComPolo(estado.areaId, especie, polo)
  ) {
    return `Conferência: a espécie sugerida pode não combinar com o polo ${polo === "ativo" ? "ativo" : "passivo"}. Ajuste no entendimento se necessário — a redação não fica bloqueada.`;
  }
  return null;
}

/** @deprecated Preferir avisosPoloEspecieChat — não bloqueia mais. */
export function validarPoloEspecieChat(estado: EstadoCasoChat): string | null {
  return avisosPoloEspecieChat(estado);
}

/** @deprecated Preferir avisos — polo não bloqueia plano. */
export function validarPoloChat(estado: EstadoCasoChat): string | null {
  return avisosPoloEspecieChat(estado);
}

export type OpcaoPoloAdvogado = {
  polo: PoloAdvocacia;
  rotulo: string;
};

export function opcoesPoloAdvogadoChat(
  estado: EstadoCasoChat
): OpcaoPoloAdvogado[] {
  const rotulos = rotulosEpigrafePeca(
    estado.areaId,
    especieResolvidaChat(estado),
    estado.fatos
  );
  return [
    { polo: "ativo", rotulo: rotulos.ativo },
    { polo: "passivo", rotulo: rotulos.passivo },
  ];
}

export function mensagemConfirmacaoPoloChat(): string {
  return "Analisei o material do caso. **Você é advogado(a) de qual parte?** Isso direciona o plano e a peça.";
}

/**
 * MinutaIA-style: polo não trava o fluxo.
 * Continua disponível para chips opcionais; preferir avisosPoloEspecieChat.
 */
export function precisaConfirmarPoloAdvogado(
  _estado: EstadoCasoChat
): boolean {
  return false;
}

export function sincronizarPoloAutomaticoChat(
  estado: EstadoCasoChat,
  textoExtra?: string | null
): EstadoCasoChat {
  let next = aplicarPoloInferidoChat(estado, textoExtra);

  if (!next.poloConfirmado || !next.poloAdvocacia) {
    const especie = especieResolvidaChat(next);
    const lado =
      inferirPoloPorEspecie(next.areaId, especie) ??
      (ladoPoloDaEspecie(next.areaId, especie) !== "ambos"
        ? ladoPoloDaEspecie(next.areaId, especie)
        : null);
    if (lado === "ativo" || lado === "passivo") {
      next = { ...next, poloAdvocacia: lado, poloConfirmado: true };
    }
  }

  return reajustarEspeciePoloChat(next);
}

export function confirmarPoloAdvogadoChat(
  estado: EstadoCasoChat,
  polo: PoloAdvocacia
): EstadoCasoChat {
  return reajustarEspeciePoloChat({
    ...estado,
    poloAdvocacia: polo,
    poloConfirmado: true,
  });
}
