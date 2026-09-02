"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PecaDocumentoView } from "@/components/dashboard/peca-documento";
import { CitacoesRastreaveisPanel } from "@/components/dashboard/citacoes-rastreaveis-panel";
import { ChatConfirmarArea } from "@/components/dashboard/chat-confirmar-area";
import { PlanoCasoPainel } from "@/components/dashboard/plano-caso-painel";
import { ChatIndicadorDigitando } from "@/components/dashboard/chat-indicador-digitando";
import { ChatAdicionarContexto } from "@/components/dashboard/chat-adicionar-contexto";
import { ChatAnexosBanner } from "@/components/dashboard/chat-anexos-banner";
import { ChatModoConversaToggle } from "@/components/dashboard/chat-modo-conversa-toggle";
import type { JurisCasoSalvo } from "@/components/dashboard/juris-caso-form";
import type { PreviewTriagemData } from "@/components/dashboard/preview-triagem-peca";
import { BotaoFalarCampo } from "@/components/dashboard/botao-falar-campo";
import { ReplicaContestacaoPainel } from "@/components/dashboard/replica-contestacao-painel";
import { ChatComplementosSection } from "@/components/dashboard/chat-complementos-section";
import {
  ChatEquipeTrabalhando,
  faseEquipeDeEstados,
} from "@/components/dashboard/chat-equipe-trabalhando";
import { ChatMensagemTexto } from "@/components/dashboard/chat-mensagem-texto";
import { ChatSessoesPainel } from "@/components/dashboard/chat-sessoes-painel";
import { ChatTribunaisPicker } from "@/components/dashboard/chat-tribunais-picker";
import {
  classificarIntencaoChat,
  respostaEscolherTribunal,
  respostaMetaAjuda,
  respostaMetaLeiJuris,
} from "@/lib/chat-minuta-intencao";
import {
  enriquecerPartesComViaCep,
  extrairQualificacaoDoRelato,
} from "@/lib/extrair-qualificacao-relato";
import { organizarCasoLocal } from "@/lib/organizar-caso-local";
import type { LeituraRelato } from "@/lib/entrada-caso-types";
import { formatarBalaoLeituraAnexo } from "@/lib/peca-cabivel-autos";
import { ChatConfirmacaoPolo } from "@/components/dashboard/chat-confirmacao-polo";
import { ChatVisualizadorAnexo } from "@/components/dashboard/chat-visualizador-anexo";
import {
  ChatFontesFlutuante,
  type AbaFontesChat,
} from "@/components/dashboard/chat-fontes-flutuante";
import {
  areasChatMinutaDisponiveis,
  aplicarInferenciaAreaAoEstado,
  confirmarPoloAdvogadoChat,
  precisaConfirmarPoloAdvogado,
  opcoesPoloAdvogadoChat,
  sincronizarPoloAutomaticoChat,
  reajustarEspeciePoloChat,
  validarPoloEspecieChat,
  aplicarPreenchimentoAoEstado,
  aplicarOrganizacaoAoEstadoChat,
  areaExigeConfirmacao,
  chatMinutaAreaHabilitada,
  casoChatTemConteudo,
  confirmarAreaChat,
  estadoCasoChatVazio,
  idMensagemChat,
  inferirAreaChat,
  montarPayloadGeracaoChat,
  podeMontarPlanoChat,
  poloExigeConfirmacaoChat,
  precisaEscolherTribunais,
  sincronizarComarcaDaQualificacao,
  sincronizarTribunaisComarca,
  rotuloAreaChat,
  especieResolvidaChat,
  validarPoloChat,
  type EstadoCasoChat,
  type MensagemChat,
} from "@/lib/chat-minuta";
import {
  configModoConversa,
  lerModoConversaStorage,
  salvarModoConversaStorage,
  type ModoConversaChat,
} from "@/lib/modo-conversa-chat";
import {
  deveChamarEntradaCaso,
  marcarAnexosEntradaProcessada,
  processarArquivosComMemoria,
  type AnexoMemoriaItem,
} from "@/lib/chat-anexos-memoria";
import {
  diffEstadoCasoChat,
  montarRespostaTurnoLocal,
  perguntaProativaLocal,
} from "@/lib/chat-resposta-turno";
import {
  detectarRelatoMistoAreas,
  deveResetarPorTrocaArea,
  mensagemTrocaArea,
  prepararEstadoTrocaArea,
} from "@/lib/chat-anti-contaminacao";
import {
  extrairPedidosComplemento,
  mesclarPedidosEstado,
  pareceComplementoSomentePedidos,
} from "@/lib/complemento-pedidos-chat";
import {
  registrarVersaoPlano,
  type VersaoPlanoChat,
} from "@/lib/chat-plano-versoes";
import {
  LIMITE_ARQUIVO_LOCAL_BYTES,
  MIN_CHARS_TEXTO_UTIL,
  extrairTextoArquivoLocal,
} from "@/lib/extrair-texto-cliente";
import {
  LIMITE_UPLOAD_ANALISE_BYTES,
  type ReplicaContestacaoResumo,
} from "@/lib/entrada-caso-types";
import { juntarTranscricao } from "@/lib/transcrever-audio";
import type { EscritorioConfig } from "@/lib/escritorio-types";
import { escritorioConfigVazio } from "@/lib/escritorio-types";
import {
  carregarEscritorioConfig,
  escritorioTemConteudoTimbre,
  salvarEscritorioConfig,
} from "@/lib/escritorio-storage";
import type { GerarPecaJecOutput } from "@/lib/gerar-peca-jec";
import { pedidoAjusteDeAuditoria } from "@/lib/ia/auditor-peca";
import { montarPlanoFallbackLocal } from "@/lib/ia/plano-fallback-local";
import { limiteAjustesPorPlano } from "@/lib/ia/ajustar-trecho-peca";
import { normalizarAreaIdMinuta, type AreaIdMinuta, hrefMinutaSeExistir, moduloDaArea } from "@/lib/minuta-modulo";
import type { PlanoId } from "@/lib/planos-facto";
import { rotuloPoloAdvocacia } from "@/lib/polo-advocacia";
import type { ResumoCota } from "@/lib/cota-pecas";
import {
  CHAT_MINUTA_TEMAS,
  alternarChatMinutaTema,
  lerChatMinutaTema,
  resolverTemaChatMinuta,
  type ChatMinutaTema,
} from "@/lib/chat-minuta-tema";
import {
  criarSessaoChatVazia,
  importarSessaoChatRemota,
  lerOptInSyncNuvemChat,
  lerSessaoAtivaId,
  obterSessaoChat,
  sanitizarEstadoChat,
  salvarOptInSyncNuvemChat,
  salvarSessaoChat,
  type ChatSessaoSalva,
  type ChatSessaoSnapshot,
} from "@/lib/chat-minuta-storage";
import {
  autoresAPartirDosNomes,
  reusAPartirDosNomes,
} from "@/lib/partes-ja-qualificadas";
import { salvarPerfilClienteComSync, hidratarMemoriaClientesDaNuvem } from "@/lib/memoria-cliente-sync";
import {
  fetchSyncNuvemStatus,
  obterSessaoChatNuvem,
  salvarMinutaNuvem,
  salvarSessaoChatNuvem,
} from "@/lib/sync-nuvem-client";
import { detectarAlertasFatosPedidos } from "@/lib/alerta-fatos-pedidos";
import { incluirItemCoberturaNoPlano } from "@/lib/ia/cobertura-teses-peca";
import { calcularResumoValorCausa } from "@/lib/valores-causa";
import type { CitacaoVerificada } from "@/lib/ia/verificacao-citacoes";
import { sugerirPrazoDaPeca } from "@/lib/prazo-intimacao";
import { MinutasHistoricoPainel } from "@/components/dashboard/minutas-historico-painel";
import { PainelLateralPortal } from "@/components/dashboard/painel-lateral-portal";
import {
  CHAT_PREVIEW_POPPED_KEY,
  publicarPreviewPeca,
} from "@/lib/chat-preview-broadcast";

type ArquivoEnvio = { nome: string; mimeType: string; base64: string };

type LastroRedacaoChat = {
  citacoes: CitacaoVerificada[];
  baseConhecimentoUtilizada: { titulo: string; categoria: string }[];
  marcadoresNaoEncontrado: number;
  leiMunicipalUtilizada: { nome: string } | null;
  jurisDoCasoUtilizada: { titulo: string }[];
};

async function arquivoParaBase64(file: File): Promise<ArquivoEnvio> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return {
    nome: file.name,
    mimeType: file.type || "application/pdf",
    base64: btoa(binary),
  };
}

const MSG_BOAS_VINDAS: MensagemChat = {
  id: "welcome",
  papel: "assistente",
  texto:
    "Conte o caso em linguagem natural. Monto o **plano estratégico** à direita e, quando você quiser, **redijo** a peça protocolável (1 crédito).",
  ts: Date.now(),
};

function fingerprintPlanoEstado(
  estado: EstadoCasoChat,
  usarTimbre: boolean
): string {
  return JSON.stringify({
    fatos: estado.fatos.trim(),
    tipoAcao: estado.tipoAcao.trim(),
    pedidos: estado.pedidos.filter(Boolean),
    areaId: estado.areaId,
    areaConfirmada: estado.areaConfirmada,
    especiePeca: estado.especiePeca,
    poloAdvocacia: estado.poloAdvocacia,
    poloConfirmado: estado.poloConfirmado,
    tutelaUrgencia: estado.tutelaUrgencia,
    pedirJusticaGratuita: estado.pedirJusticaGratuita,
    comarca: estado.comarca,
    tribunaisPreferidos: estado.tribunaisPreferidos ?? [],
    autoresNomes: estado.autoresNomes,
    reusNomes: estado.reusNomes,
    qualificacaoAutor: estado.qualificacaoAutor ?? {},
    qualificacaoReu: estado.qualificacaoReu ?? {},
    comReconvencao: estado.comReconvencao,
    leiMunicipalTexto: estado.leiMunicipalTexto?.trim(),
    jurisCaso: estado.jurisCaso,
    timbre: usarTimbre,
  });
}

/**
 * Alfinete clássico em contorno (ref. pushpin), espelhado à direita,
 * paleta FACTO + leve brilho — sem caixa de botão.
 */
function IconeFixarWorkspace({ fixado }: { fixado: boolean }) {
  const glow = fixado
    ? "drop-shadow-[0_1px_3px_rgba(144,139,106,0.55)] drop-shadow-[0_0_6px_rgba(196,191,154,0.45)]"
    : "drop-shadow-[0_1px_2px_rgba(144,139,106,0.35)]";
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-5 w-5 ${glow}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.45}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/*
        Contorno contínuo = cabeça retangular + haste + ombros + ponta longa.
        scale evita corte no viewBox após o giro; rotate(45) = espelho da foto.
      */}
      <g transform="translate(12 12) rotate(45) scale(0.9) translate(-12 -12)">
        <path d="M7.6 3.1h8.8c.66 0 1.2.54 1.2 1.2v1.9c0 .66-.54 1.2-1.2 1.2h-2.9v1.4h2.4l2 3.5H14L12 20.2 10 11.3H5.9l2-3.5h2.4V7.4H7.6c-.66 0-1.2-.54-1.2-1.2V4.3c0-.66.54-1.2 1.2-1.2z" />
      </g>
    </svg>
  );
}

function classeBotaoFixarTexto(fixado: boolean) {
  return `shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-facto-gold/40 ${
    fixado
      ? "border-facto-gold/50 bg-facto-gold/20 text-facto-gold"
      : "border-stone-600 bg-stone-800/90 text-stone-300 hover:border-facto-gold/45 hover:text-amber-50"
  }`;
}

function classeBotaoFixarIcone(fixado: boolean, fundoClaro: boolean) {
  return `inline-flex shrink-0 items-center justify-center bg-transparent p-1 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-facto-gold/40 disabled:opacity-50 ${
    fixado
      ? "text-facto-gold"
      : fundoClaro
        ? "text-stone-500 hover:text-stone-800"
        : "text-stone-400 hover:text-facto-gold"
  }`;
}

export function ChatMinutaPage({
  leigo = false,
  plano = null,
  modoWorkspace = false,
  onWorkspaceFixadoChange,
  previewInterno = false,
}: {
  leigo?: boolean;
  plano?: PlanoId | null;
  /** Embutido na home `/dashboard` — URLs e header compactos. */
  modoWorkspace?: boolean;
  /** Home oculta o slot embutido enquanto o assistente está fixado em tela cheia. */
  onWorkspaceFixadoChange?: (fixado: boolean) => void;
  /** QA/admin: expõe atalho ao formulário da área (não é o fluxo do cliente). */
  previewInterno?: boolean;
}) {
  const searchParams = useSearchParams();
  const areaUrl = searchParams.get("area");

  const [mensagens, setMensagens] = useState<MensagemChat[]>([MSG_BOAS_VINDAS]);
  const [estado, setEstado] = useState<EstadoCasoChat>(() => {
    if (areaUrl) {
      const pref = normalizarAreaIdMinuta(areaUrl);
      const area = chatMinutaAreaHabilitada(pref) ? pref : "jec";
      return {
        ...estadoCasoChatVazio(area),
        areaConfirmada: true,
        areaInferida: { areaId: area, confianca: "alta", alternativas: [] },
      };
    }
    return estadoCasoChatVazio("jec");
  });
  const [areaManual, setAreaManual] = useState(Boolean(areaUrl));
  const [input, setInput] = useState("");
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [planoLoading, setPlanoLoading] = useState(false);
  const [redigindo, setRedigindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [avisos, setAvisos] = useState<string | null>(null);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [drawerAba, setDrawerAba] = useState<"resumo" | "complementos">("resumo");
  const [complementosFoco, setComplementosFoco] = useState<
    "provas" | "juris" | "lei" | null
  >(null);
  const [contextoPainelAberto, setContextoPainelAberto] = useState(false);
  const [modoConversa, setModoConversa] = useState<ModoConversaChat>(() =>
    lerModoConversaStorage()
  );
  const [anexosMemoria, setAnexosMemoria] = useState<AnexoMemoriaItem[]>([]);
  const anexosMemoriaRef = useRef<AnexoMemoriaItem[]>([]);
  const [leituraAnexoPainel, setLeituraAnexoPainel] = useState<string | null>(
    null
  );
  const leituraAnexoExibidaRef = useRef<string | null>(null);
  const [visualizadorAnexo, setVisualizadorAnexo] = useState<{
    pagina: number | null;
    trecho: string;
  } | null>(null);
  const [processandoDocumentos, setProcessandoDocumentos] = useState(false);
  const [sessaoId, setSessaoId] = useState<string | null>(null);
  const [mostrarSessoes, setMostrarSessoes] = useState(false);
  const [mostrarMinutasNuvem, setMostrarMinutasNuvem] = useState(false);
  const [syncNuvemOptIn, setSyncNuvemOptIn] = useState(false);
  const sessaoInicialCarregada = useRef(false);
  const [mostrarTrocarArea, setMostrarTrocarArea] = useState(false);
  const [workspaceFixado, setWorkspaceFixado] = useState(false);
  const [portalMontado, setPortalMontado] = useState(false);

  const [peca, setPeca] = useState("");
  const [pecaHtml, setPecaHtml] = useState("");
  const [geradoPorIA, setGeradoPorIA] = useState(false);
  const [avisoPreview, setAvisoPreview] = useState<string | null>(null);

  const [triagemPreview, setTriagemPreview] = useState<PreviewTriagemData | null>(
    null
  );
  const [versoesPlano, setVersoesPlano] = useState<VersaoPlanoChat[]>([]);
  const [planoHighlight, setPlanoHighlight] = useState(false);
  const [areaSugestaoDispensada, setAreaSugestaoDispensada] = useState(false);
  const [payloadPendente, setPayloadPendente] = useState<ReturnType<
    typeof montarPayloadGeracaoChat
  > | null>(null);

  const [escritorio, setEscritorio] = useState<EscritorioConfig>(
    () => escritorioConfigVazio
  );
  const [ajustesFeitos, setAjustesFeitos] = useState(0);
  const [pedidoAjuste, setPedidoAjuste] = useState("");
  const [ajustando, setAjustando] = useState(false);
  const entradaAbortRef = useRef<AbortController | null>(null);
  const [cota, setCota] = useState<ResumoCota | null>(null);
  const [lastroRedacao, setLastroRedacao] = useState<LastroRedacaoChat | null>(
    null
  );
  /** Sempre "papel" no SSR — localStorage só no client (evita hydration mismatch). */
  const [temaId, setTemaId] = useState<ChatMinutaTema>("papel");
  const [abaMobile, setAbaMobile] = useState<"chat" | "peca">("chat");
  const [previewDestacado, setPreviewDestacado] = useState(false);
  const pecaTelaRef = useRef<Window | null>(null);
  const basePath = "/dashboard";

  const fimChatRef = useRef<HTMLDivElement>(null);
  const persistirTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewAutoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const planoAbortRef = useRef<AbortController | null>(null);
  const planoUltimoFingerprintRef = useRef<string | null>(null);
  const estadoRef = useRef(estado);
  const estadoAnteriorRef = useRef(estado);
  const escritorioRef = useRef(escritorio);
  estadoRef.current = estado;
  escritorioRef.current = escritorio;
  const areasDisponiveis = areasChatMinutaDisponiveis();
  const limiteAjustes = limiteAjustesPorPlano(plano, leigo);
  const ajustesRestantes = Math.max(0, limiteAjustes - ajustesFeitos);
  const casoJaOrganizado = casoChatTemConteudo(estado);

  const provasUtilCount = useMemo(
    () =>
      estado.provasCaso.filter((p) => p.texto.trim().length >= 40).length,
    [estado.provasCaso]
  );

  const consultaJurisChat = useMemo(
    () => [estado.tipoAcao, estado.fatos].filter(Boolean).join("\n"),
    [estado.tipoAcao, estado.fatos]
  );

  const anexosItemCount = useMemo(
    () =>
      arquivos.length +
      provasUtilCount +
      estado.jurisCaso.length +
      (estado.leiMunicipalTexto?.trim() ? 1 : 0),
    [
      arquivos.length,
      provasUtilCount,
      estado.jurisCaso.length,
      estado.leiMunicipalTexto,
    ]
  );

  const fontesContagens = useMemo(
    () => ({
      anexos: arquivos.length + anexosMemoria.length,
      provas: provasUtilCount,
      juris: estado.jurisCaso.length,
      teses:
        estado.tesesIds.length +
        (estado.replicaContestacao?.detectada ? 1 : 0) +
        (triagemPreview?.cobertura?.length ?? 0),
    }),
    [
      arquivos.length,
      anexosMemoria.length,
      provasUtilCount,
      estado.jurisCaso.length,
      estado.tesesIds.length,
      estado.replicaContestacao?.detectada,
      triagemPreview?.cobertura?.length,
    ]
  );

  const abrirComplementos = useCallback(
    (foco: "provas" | "juris" | "lei") => {
      setDrawerAba("complementos");
      setDrawerAberto(true);
      setComplementosFoco(foco);
    },
    []
  );

  const abrirFontesChat = useCallback(
    (aba: AbaFontesChat) => {
      if (aba === "chat") {
        setAbaMobile("chat");
        document
          .querySelector("[data-chat-mensagens-scroll]")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (aba === "anexos") {
        setContextoPainelAberto(true);
        return;
      }
      if (aba === "juris") {
        abrirComplementos("juris");
        return;
      }
      abrirComplementos("provas");
    },
    [abrirComplementos]
  );

  const abrirFlsNoAnexo = useCallback((pagina: number | null, trecho: string) => {
    setVisualizadorAnexo({ pagina, trecho });
    setContextoPainelAberto(false);
  }, []);

  useEffect(() => {
    salvarModoConversaStorage(modoConversa);
  }, [modoConversa]);

  useEffect(() => {
    anexosMemoriaRef.current = anexosMemoria;
  }, [anexosMemoria]);

  useEffect(() => {
    if (!drawerAberto || drawerAba !== "complementos" || !complementosFoco) {
      return;
    }
    const id =
      complementosFoco === "provas"
        ? "secao-provas"
        : complementosFoco === "lei"
          ? "secao-lei-municipal"
          : "secao-juris-caso";
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(t);
  }, [drawerAberto, drawerAba, complementosFoco]);
  const tema = useMemo(
    () =>
      resolverTemaChatMinuta(temaId, {
        workspace: modoWorkspace,
        previewTemPeca:
          Boolean(pecaHtml.trim()) ||
          Boolean(triagemPreview) ||
          planoLoading ||
          (estado.areaConfirmada && casoJaOrganizado),
      }),
    [temaId, modoWorkspace, pecaHtml, triagemPreview, planoLoading, estado.areaConfirmada, casoJaOrganizado]
  );

  const pillBtn = modoWorkspace
    ? "rounded-full border border-white/15 bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-stone-300 backdrop-blur-sm transition hover:border-facto-gold/45 hover:bg-white/10 hover:text-amber-50"
    : "rounded-full border border-stone-600 bg-stone-800/90 px-2 py-0.5 text-[10px] font-medium text-stone-300 transition hover:border-facto-gold/45 hover:text-amber-50";

  const headerChatCls = modoWorkspace
    ? "border-white/10 bg-white/[0.04] backdrop-blur-md"
    : "border-stone-700/40 bg-facto-dark";
  const timbreConfigurado = escritorioTemConteudoTimbre(escritorio);
  const especieAtual = especieResolvidaChat(estado);
  const exigePolo = precisaConfirmarPoloAdvogado(estado);
  const opcoesPoloUi = opcoesPoloAdvogadoChat(estado);
  const exportacaoTrial = plano === "trial" || cota?.plano === "trial";
  const areaAindaIndefinida =
    !estado.fatos.trim() &&
    !estado.resumoEntrada &&
    !areaManual &&
    !areaUrl;

  const rotuloAreaCaso = areaAindaIndefinida
    ? "Área a definir"
    : !estado.areaConfirmada
      ? "Confirmar área"
      : especieAtual
        ? `${rotuloAreaChat(estado.areaId)} · ${especieAtual.replace(/-/g, " ")}`
        : rotuloAreaChat(estado.areaId);
  const precisaConfirmarArea =
    casoJaOrganizado &&
    !estado.areaConfirmada &&
    !areaSugestaoDispensada &&
    areaExigeConfirmacao(estado.areaInferida);

  const resumoValores = useMemo(
    () => calcularResumoValorCausa(estado.valoresCausa),
    [estado.valoresCausa]
  );

  const alertasFatosPedidos = useMemo(
    () =>
      detectarAlertasFatosPedidos({
        fatos: estado.fatos,
        pedidos: estado.pedidos.filter(Boolean),
        tutelaUrgencia: estado.tutelaUrgencia,
        pedirJusticaGratuita: estado.pedirJusticaGratuita,
        totalValorCentavos: resumoValores.totalCentavos,
        especiePeca: especieAtual,
      }),
    [
      estado.fatos,
      estado.pedidos,
      estado.tutelaUrgencia,
      estado.pedirJusticaGratuita,
      resumoValores.totalCentavos,
      especieAtual,
    ]
  );

  const dicaPrazo = useMemo(
    () =>
      sugerirPrazoDaPeca({
        fatos: estado.fatos,
        especiePeca: especieAtual,
        foro: estado.comarca.foro,
      }),
    [estado.fatos, especieAtual, estado.comarca.foro]
  );

  function sincronizarSessaoNuvem(salva: ReturnType<typeof salvarSessaoChat>) {
    if (!syncNuvemOptIn) return;
    void salvarSessaoChatNuvem({
      sessaoId: salva.id,
      titulo: salva.titulo,
      areaId: salva.areaId,
      snapshot: salva.snapshot,
      historicoPecas: salva.historicoPecas,
    });
  }

  useEffect(() => {
    setTemaId(lerChatMinutaTema());
    setEscritorio(carregarEscritorioConfig());
    setSyncNuvemOptIn(lerOptInSyncNuvemChat());
    try {
      setPreviewDestacado(sessionStorage.getItem(CHAT_PREVIEW_POPPED_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    publicarPreviewPeca({
      peca,
      pecaHtml,
      geradoPorIA,
      avisoPreview,
      titulo: geradoPorIA
        ? "Peça redigida"
        : pecaHtml
          ? "Peça redigida"
          : triagemPreview
            ? "Plano do caso"
            : "Documento FACTO",
      previewLoading: planoLoading,
      ts: Date.now(),
    });
  }, [peca, pecaHtml, geradoPorIA, avisoPreview, planoLoading, triagemPreview]);

  function abrirPecaEmOutraTela() {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(CHAT_PREVIEW_POPPED_KEY, "1");
    } catch {
      /* ignore */
    }
    publicarPreviewPeca({
      peca,
      pecaHtml,
      geradoPorIA,
      avisoPreview,
      titulo: geradoPorIA ? "Peça redigida" : "Plano FACTO",
      previewLoading: planoLoading,
      ts: Date.now(),
    });
    const w = window.open(
      "/dashboard/peca-tela",
      "facto-peca-tela",
      "noopener,noreferrer,width=920,height=1100"
    );
    pecaTelaRef.current = w;
    setPreviewDestacado(true);
    const check = window.setInterval(() => {
      if (w && w.closed) {
        window.clearInterval(check);
        setPreviewDestacado(false);
        pecaTelaRef.current = null;
        try {
          sessionStorage.removeItem(CHAT_PREVIEW_POPPED_KEY);
        } catch {
          /* ignore */
        }
      }
    }, 700);
  }

  function recolherPecaTela() {
    pecaTelaRef.current?.close();
    pecaTelaRef.current = null;
    setPreviewDestacado(false);
    try {
      sessionStorage.removeItem(CHAT_PREVIEW_POPPED_KEY);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    const recarregarTimbre = () =>
      setEscritorio(carregarEscritorioConfig());
    window.addEventListener("focus", recarregarTimbre);
    return () => window.removeEventListener("focus", recarregarTimbre);
  }, []);

  useEffect(() => {
    void fetchSyncNuvemStatus().then((st) => {
      if (!st) return;
      if (st.optIn) {
        setSyncNuvemOptIn(true);
        salvarOptInSyncNuvemChat(true);
        void hidratarMemoriaClientesDaNuvem();
      }
    });
  }, []);

  function handleSyncNuvemChange(v: boolean) {
    setSyncNuvemOptIn(v);
    salvarOptInSyncNuvemChat(v);
  }

  useEffect(() => {
    if (sessaoInicialCarregada.current) return;
    sessaoInicialCarregada.current = true;

    async function hidratarInicial() {
      const querNova = searchParams.get("nova") === "1";
      if (querNova) {
        const pref = areaUrl
          ? normalizarAreaIdMinuta(areaUrl)
          : undefined;
        const area =
          pref && chatMinutaAreaHabilitada(pref) ? pref : "jec";
        const nova = criarSessaoChatVazia(area);
        setSessaoId(nova.id);
        setMensagens([MSG_BOAS_VINDAS]);
        setEstado(estadoCasoChatVazio(area));
        setAreaManual(Boolean(pref));
        setPeca("");
        setPecaHtml("");
        setGeradoPorIA(false);
        setAvisoPreview(null);
        setAjustesFeitos(0);
        setTriagemPreview(null);
        setPayloadPendente(null);
        setErro(null);
        setAvisos(null);
        setLastroRedacao(null);
        setMostrarSessoes(false);
        planoUltimoFingerprintRef.current = null;
        try {
          const limpo = new URLSearchParams();
          if (pref && chatMinutaAreaHabilitada(pref)) {
            limpo.set("area", pref);
          }
          const qs = limpo.toString();
          window.history.replaceState(
            null,
            "",
            qs ? `${basePath}?${qs}` : basePath
          );
        } catch {
          /* ignore */
        }
        return;
      }

      const sessaoNuvemId = searchParams.get("sessaoNuvem");
      if (sessaoNuvemId) {
        const remota = await obterSessaoChatNuvem(sessaoNuvemId);
        const snap = remota?.snapshot as ChatSessaoSnapshot | null | undefined;
        if (remota && snap && snap.estado) {
          const salva = importarSessaoChatRemota({
            sessaoId: remota.sessaoId || sessaoNuvemId,
            titulo: remota.titulo,
            areaId: normalizarAreaIdMinuta(remota.areaId || snap.estado.areaId),
            snapshot: snap,
            historicoPecas: Array.isArray(remota.historicoPecas)
              ? (remota.historicoPecas as ChatSessaoSalva["historicoPecas"])
              : [],
            criadoEm: remota.criadoEm,
          });
          aplicarSnapshotSessao(salva);
          return;
        }
        setErro(
          "Não foi possível restaurar a sessão da nuvem. Confira o opt-in LGPD ou abra uma conversa local."
        );
      }

      const sessaoUrl = searchParams.get("sessao");
      if (sessaoUrl) {
        const salva = obterSessaoChat(sessaoUrl);
        if (salva) {
          aplicarSnapshotSessao(salva);
          return;
        }
      }
      const ativa = lerSessaoAtivaId();
      if (ativa) {
        const salva = obterSessaoChat(ativa);
        if (salva) aplicarSnapshotSessao(salva);
      }
    }

    void hidratarInicial();
  }, [searchParams]);

  function aplicarSnapshotSessao(sessao: ChatSessaoSalva) {
    const snap = sessao.snapshot;
    const estadoNorm = sanitizarEstadoChat(snap.estado);
    setSessaoId(sessao.id);
    setMensagens(
      snap.mensagens.length > 0 ? snap.mensagens : [MSG_BOAS_VINDAS]
    );
    setEstado(estadoNorm);
    setPeca(snap.peca);
    setPecaHtml(snap.pecaHtml);
    setGeradoPorIA(snap.geradoPorIA);
    setAjustesFeitos(snap.ajustesFeitos);
    setAvisoPreview(snap.avisoPreview);
    setTriagemPreview(null);
    setPayloadPendente(null);
    setErro(null);
    setAvisos(null);
    setLastroRedacao(null);
    setAnexosMemoria(snap.anexosMemoria ?? []);
    const temConteudo =
      Boolean(estadoNorm.fatos.trim()) ||
      Boolean(estadoNorm.resumoEntrada?.trim()) ||
      snap.mensagens.some((m) => m.papel === "usuario") ||
      Boolean(snap.peca.trim());
    // Sessão vazia: não “grudar” em JEC — UI fica em Área a definir.
    setAreaManual(Boolean(areaUrl) || temConteudo);
    planoUltimoFingerprintRef.current = fingerprintPlanoEstado(
      estadoNorm,
      escritorio.usarTimbre
    );
  }

  function sessaoTemTrabalho(): boolean {
    const temUsuario = mensagens.some((m) => m.papel === "usuario");
    return (
      temUsuario ||
      Boolean(estado.fatos.trim()) ||
      Boolean(estado.resumoEntrada?.trim()) ||
      Boolean(peca.trim()) ||
      Boolean(pecaHtml.trim())
    );
  }

  /** Grava na hora (Conversas / nuvem) antes de limpar a tela. */
  function persistirSessaoAtualAgora() {
    if (persistirTimerRef.current) {
      clearTimeout(persistirTimerRef.current);
      persistirTimerRef.current = null;
    }
    if (!sessaoTemTrabalho()) return;
    const id = sessaoId ?? criarSessaoChatVazia(estado.areaId).id;
    if (!sessaoId) setSessaoId(id);
    const salva = salvarSessaoChat({
      sessaoId: id,
      snapshot: {
        mensagens,
        estado,
        peca,
        pecaHtml,
        geradoPorIA,
        ajustesFeitos,
        avisoPreview,
        anexosMemoria,
      },
      novaPeca: null,
    });
    sincronizarSessaoNuvem(salva);
  }

  function limparWorkspaceChat(opcoes?: {
    areaPref?: AreaIdMinuta;
    manterArea?: boolean;
  }) {
    planoAbortRef.current?.abort();
    if (previewAutoTimerRef.current) {
      clearTimeout(previewAutoTimerRef.current);
      previewAutoTimerRef.current = null;
    }
    const area =
      opcoes?.areaPref ??
      (opcoes?.manterArea ? estado.areaId : "jec");
    const nova = criarSessaoChatVazia(area);
    setSessaoId(nova.id);
    setMensagens([MSG_BOAS_VINDAS]);
    const base = estadoCasoChatVazio(area);
    setEstado(
      Boolean(areaUrl) && chatMinutaAreaHabilitada(area)
        ? {
            ...base,
            areaConfirmada: true,
            areaInferida: { areaId: area, confianca: "alta", alternativas: [] },
          }
        : base
    );
    setAreaManual(Boolean(areaUrl) || Boolean(opcoes?.manterArea));
    setPeca("");
    setPecaHtml("");
    setGeradoPorIA(false);
    setAvisoPreview(null);
    setAjustesFeitos(0);
    setTriagemPreview(null);
    setPayloadPendente(null);
    setErro(null);
    setAvisos(null);
    setLastroRedacao(null);
    setMostrarSessoes(false);
    setInput("");
    setPedidoAjuste("");
    setAnexosMemoria([]);
    setLeituraAnexoPainel(null);
    leituraAnexoExibidaRef.current = null;
    setVisualizadorAnexo(null);
    planoUltimoFingerprintRef.current = null;
    setVersoesPlano([]);
    const estadoZerado = estadoCasoChatVazio(area);
    estadoRef.current = estadoZerado;
    estadoAnteriorRef.current = estadoZerado;
  }

  /** Limpa conversa e preview; grava o caso atual antes. Mantém a área se já estava definida. */
  function reiniciarChatAtual() {
    if (!sessaoTemTrabalho()) {
      setMensagens([{ ...MSG_BOAS_VINDAS, id: idMensagemChat(), ts: Date.now() }]);
      setErro(null);
    setAvisos(null);
      setInput("");
      return;
    }
    const manterArea =
      Boolean(areaUrl) || areaManual || !areaAindaIndefinida;
    const area = estado.areaId;
    persistirSessaoAtualAgora();
    limparWorkspaceChat({ areaPref: area, manterArea });
  }

  /** Novo caso em branco; o anterior fica em Conversas / Meus casos. */
  function iniciarNovoCaso() {
    if (!sessaoTemTrabalho()) {
      setMensagens([{ ...MSG_BOAS_VINDAS, id: idMensagemChat(), ts: Date.now() }]);
      setErro(null);
    setAvisos(null);
      setInput("");
      return;
    }
    persistirSessaoAtualAgora();
    limparWorkspaceChat({
      areaPref: areaUrl ? normalizarAreaIdMinuta(areaUrl) : "jec",
      manterArea: Boolean(areaUrl),
    });
  }

  /** Compat: limpa sem gravar (ex.: painel legado). Preferir iniciarNovoCaso. */
  function iniciarNovaConversa(areaPref?: AreaIdMinuta) {
    limparWorkspaceChat({ areaPref, manterArea: Boolean(areaUrl) });
  }

  function garantirSessaoId(): string {
    if (sessaoId) return sessaoId;
    const nova = criarSessaoChatVazia(estado.areaId);
    setSessaoId(nova.id);
    return nova.id;
  }

  useEffect(() => {
    if (!sessaoId) return;
    if (persistirTimerRef.current) clearTimeout(persistirTimerRef.current);
    persistirTimerRef.current = setTimeout(() => {
      const salva = salvarSessaoChat({
        sessaoId,
        snapshot: {
          mensagens,
          estado,
          peca,
          pecaHtml,
          geradoPorIA,
          ajustesFeitos,
          avisoPreview,
          anexosMemoria,
        },
        novaPeca: null,
      });
      sincronizarSessaoNuvem(salva);
    }, 900);
    return () => {
      if (persistirTimerRef.current) clearTimeout(persistirTimerRef.current);
    };
  }, [
    sessaoId,
    mensagens,
    estado,
    peca,
    pecaHtml,
    geradoPorIA,
    ajustesFeitos,
    avisoPreview,
    anexosMemoria,
    syncNuvemOptIn,
  ]);

  function alternarTimbreEscritorio() {
    const next = { ...escritorio, usarTimbre: !escritorio.usarTimbre };
    setEscritorio(next);
    salvarEscritorioConfig(next);
  }

  const hrefFormulario = hrefMinutaSeExistir(estado.areaId) ?? "/dashboard/jec";
  const podeMontarPlano = podeMontarPlanoChat(estado);
  const planoFingerprint = useMemo(
    () => fingerprintPlanoEstado(estado, escritorio.usarTimbre),
    [estado, escritorio.usarTimbre]
  );
  const precisaComplementosLastro =
    podeMontarPlano &&
    !estado.leiMunicipalTexto.trim() &&
    estado.jurisCaso.length === 0;
  const mostrarPickerTribunais = precisaEscolherTribunais(estado);
  const faseEquipe = faseEquipeDeEstados({
    enviando,
    previewLoading: planoLoading,
    triagemLoading: false,
    redigindo,
    ajustando,
  });

  useEffect(() => {
    const el = fimChatRef.current;
    if (!el) return;
    const scroller = el.closest("[data-chat-mensagens-scroll]") as HTMLElement | null;
    if (scroller) {
      scroller.scrollTop = scroller.scrollHeight;
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [mensagens, triagemPreview, faseEquipe]);

  useEffect(() => {
    if (pecaHtml || triagemPreview) setAbaMobile("peca");
  }, [pecaHtml, triagemPreview]);

  function destacarPlanoAtualizado() {
    setPlanoHighlight(true);
    window.setTimeout(() => setPlanoHighlight(false), 2500);
  }

  function garantirPolo(): boolean {
    const comPolo = sincronizarPoloAutomaticoChat(estadoRef.current);
    if (comPolo !== estadoRef.current) {
      setEstado(comPolo);
      estadoRef.current = comPolo;
    }
    const msg = validarPoloChat(comPolo);
    if (msg) {
      setAvisos(msg);
      return false;
    }
    return true;
  }

  function confirmarPolo(polo: "ativo" | "passivo", rotulo?: string) {
    const rotuloUi =
      rotulo ??
      opcoesPoloAdvogadoChat(estadoRef.current).find((o) => o.polo === polo)
        ?.rotulo ??
      polo;
    const next = reajustarEspeciePoloChat(
      confirmarPoloAdvogadoChat(estadoRef.current, polo)
    );
    setEstado(next);
    estadoRef.current = next;
    estadoAnteriorRef.current = next;
    planoUltimoFingerprintRef.current = null;
    setErro(null);
    setAvisos(null);
    adicionarMensagem(
      "sistema",
      `Polo confirmado: **${rotuloUi}**. Montando o plano direcionado…`
    );
    void executarPlano({ silencioso: false, forcar: true });
  }

  function aplicarEspecieReplica() {
    setEstado((e) => ({
      ...e,
      especiePeca: "replica",
    }));
    adicionarMensagem("sistema", "Espécie alterada para réplica à contestação.");
  }

  const adicionarMensagem = useCallback(
    (papel: MensagemChat["papel"], texto: string) => {
      setMensagens((m) => [
        ...m,
        { id: idMensagemChat(), papel, texto, ts: Date.now() },
      ]);
    },
    []
  );

  const [msgStreamId, setMsgStreamId] = useState<string | null>(null);

  const consumirStreamConversa = useCallback(
    async (payload: {
      mensagem: string;
      estado: EstadoCasoChat;
      estadoAnterior: EstadoCasoChat;
      triagem: PreviewTriagemData | null;
      mensagens: MensagemChat[];
      primeiroRelato: boolean;
      avisoExtra: string | null;
      modo: ModoConversaChat;
    }): Promise<string | null> => {
      const msgId = idMensagemChat();
      setMsgStreamId(msgId);
      setMensagens((m) => [
        ...m,
        { id: msgId, papel: "assistente", texto: "", ts: Date.now() },
      ]);

      try {
        const res = await fetch("/api/chat-conversa/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok || !res.body) {
          setMensagens((m) => m.filter((x) => x.id !== msgId));
          return null;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let texto = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const linhas = buffer.split("\n");
          buffer = linhas.pop() ?? "";
          for (const linha of linhas) {
            if (!linha.trim()) continue;
            const evt = JSON.parse(linha) as {
              t?: string;
              error?: string;
              done?: boolean;
            };
            if (evt.error) {
              setMensagens((m) => m.filter((x) => x.id !== msgId));
              return null;
            }
            if (evt.t) {
              texto += evt.t;
              const acumulado = texto;
              setMensagens((m) =>
                m.map((x) =>
                  x.id === msgId ? { ...x, texto: acumulado } : x
                )
              );
            }
          }
        }

        if (!texto.trim()) {
          setMensagens((m) => m.filter((x) => x.id !== msgId));
          return null;
        }
        return texto.trim();
      } catch {
        setMensagens((m) => m.filter((x) => x.id !== msgId));
        return null;
      } finally {
        setMsgStreamId(null);
      }
    },
    []
  );

  const aplicarTriagemNoPainel = useCallback(
    (
      triagemNova: PreviewTriagemData,
      payload: ReturnType<typeof montarPayloadGeracaoChat>,
      fp: string,
      opts?: { silencioso?: boolean; rotulo?: string }
    ): { triagem: PreviewTriagemData; payload: ReturnType<typeof montarPayloadGeracaoChat> } => {
      planoUltimoFingerprintRef.current = fp;
      setPayloadPendente(payload);
      setTriagemPreview(triagemNova);
      setVersoesPlano((v) =>
        registrarVersaoPlano(v, triagemNova, opts?.silencioso ? "auto" : "atualizado")
      );
      destacarPlanoAtualizado();
      setEstado((atual) => ({
        ...atual,
        planoVisto: true,
        previewVisto: true,
      }));
      if (!opts?.silencioso && opts?.rotulo) {
        adicionarMensagem("assistente", opts.rotulo);
      }
      return { triagem: triagemNova, payload };
    },
    [adicionarMensagem]
  );

  const executarPlano = useCallback(
    async (opts?: {
      silencioso?: boolean;
      forcar?: boolean;
    }): Promise<{
      triagem: PreviewTriagemData;
      payload: ReturnType<typeof montarPayloadGeracaoChat>;
    } | null> => {
      const e = estadoRef.current;
      const esc = escritorioRef.current;
      const fp = fingerprintPlanoEstado(e, esc.usarTimbre);

      if (!opts?.forcar && fp === planoUltimoFingerprintRef.current) {
        if (triagemPreview && payloadPendente) {
          return { triagem: triagemPreview, payload: payloadPendente };
        }
        return null;
      }

      if (!podeMontarPlanoChat(e)) return null;
      const ePolo = sincronizarPoloAutomaticoChat(e);
      if (validarPoloChat(ePolo)) return null;

      planoAbortRef.current?.abort();
      const ac = new AbortController();
      planoAbortRef.current = ac;

      setPlanoLoading(true);
      if (!opts?.silencioso) {
        setErro(null);
        setAvisos(null);
      }

      const payload = montarPayloadGeracaoChat(ePolo, { atuarLeigo: leigo });

      const aplicarFallbackLocal = (motivo: string) => {
        if (ac.signal.aborted) return null;
        const triagemNova = montarPlanoFallbackLocal(ePolo, motivo);
        return aplicarTriagemNoPainel(triagemNova, payload, fp, {
          silencioso: opts?.silencioso,
          rotulo: opts?.silencioso
            ? undefined
            : "Montei um **plano preliminar** à direita — a análise completa segue em segundo plano. Você já pode conversar e refinar.",
        });
      };

      try {
        for (let tentativa = 0; tentativa < 3; tentativa++) {
          if (tentativa > 0) {
            await new Promise((r) => setTimeout(r, 1500 * tentativa));
          }
          if (ac.signal.aborted) return null;

          const res = await fetch("/api/triagem-peca", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...payload,
              escritorio: esc.usarTimbre ? esc : undefined,
            }),
            signal: ac.signal,
          });
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
            ok?: boolean;
            fallbackLocal?: boolean;
          } & Partial<PreviewTriagemData>;

          if (ac.signal.aborted) return null;
          if (res.ok && data.ok && data.estrategiaJuridica) {
            const triagemNova: PreviewTriagemData = {
              estrategiaJuridica: data.estrategiaJuridica,
              analiseEstrategica: data.analiseEstrategica!,
              topicos: data.topicos ?? [],
              cobertura: data.cobertura ?? [],
              coberturaResumo: data.coberturaResumo,
              modelo: data.modelo,
              pedidosFormulario: payload.pedidosUsuario,
            };
            const aplicado = aplicarTriagemNoPainel(triagemNova, payload, fp, {
              silencioso: opts?.silencioso,
              rotulo: data.fallbackLocal
                ? undefined
                : "Plano estratégico atualizado à direita — revise tópicos e pedidos. Quando estiver bom, confirme a redação (1 peça).",
            });
            if (data.fallbackLocal && !opts?.silencioso) {
              setAvisos(
                "Plano preliminar no painel — a análise estratégica completa será atualizada quando o serviço responder."
              );
            }
            return aplicado;
          }

          if (!res.ok && tentativa < 2) continue;
        }

        const fb = aplicarFallbackLocal("rede ou serviço indisponível");
        if (!opts?.silencioso) {
          setAvisos(
            "Usei um plano preliminar local — você pode continuar conversando normalmente."
          );
        }
        return fb;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return null;
        const fb = aplicarFallbackLocal("falha de rede");
        if (!opts?.silencioso) {
          setAvisos("Plano preliminar ativo — tente **Atualizar plano** em instantes se quiser a versão completa.");
        }
        return fb;
      } finally {
        if (!ac.signal.aborted) setPlanoLoading(false);
      }
    },
    [adicionarMensagem, aplicarTriagemNoPainel, leigo, payloadPendente, triagemPreview]
  );

  useEffect(() => {
    if (geradoPorIA || enviando || redigindo) return;
    if (!podeMontarPlanoChat(estado)) return;
    if (precisaConfirmarPoloAdvogado(estado)) return;
    if (validarPoloChat(sincronizarPoloAutomaticoChat(estado))) return;

    if (previewAutoTimerRef.current) clearTimeout(previewAutoTimerRef.current);
    const debounceMs = configModoConversa(modoConversa).debouncePlanoMs;
    previewAutoTimerRef.current = setTimeout(() => {
      void executarPlano({ silencioso: true });
    }, debounceMs);

    return () => {
      if (previewAutoTimerRef.current) clearTimeout(previewAutoTimerRef.current);
    };
  }, [
    planoFingerprint,
    geradoPorIA,
    enviando,
    redigindo,
    executarPlano,
    estado,
    modoConversa,
  ]);

  async function processarArquivos(
    relatoBase: string,
    files: File[]
  ): Promise<{
    relato: string;
    arquivos: ArquivoEnvio[];
    memoria: AnexoMemoriaItem[];
    reutilizouCache: boolean;
    fingerprintsEnviadosServidor: string[];
  }> {
    const resultado = await processarArquivosComMemoria({
      relatoBase,
      files,
      memoria: anexosMemoriaRef.current,
      extrairTextoLocal: extrairTextoArquivoLocal,
      minCharsTextoUtil: MIN_CHARS_TEXTO_UTIL,
      limiteArquivoBytes: LIMITE_ARQUIVO_LOCAL_BYTES,
      limiteUploadBytes: LIMITE_UPLOAD_ANALISE_BYTES,
      arquivoParaBase64,
    });
    setAnexosMemoria(resultado.memoria);
    anexosMemoriaRef.current = resultado.memoria;
    return resultado;
  }

  async function handleEnviarMensagem() {
    const texto = input.trim();
    if (!texto && arquivos.length === 0) return;
    if (enviando) return;

    setErro(null);
    setAvisos(null);
    setContextoPainelAberto(false);
    garantirSessaoId();
    adicionarMensagem("usuario", texto || `[Anexo: ${arquivos.map((f) => f.name).join(", ")}]`);
    setInput("");
    const filesNow = arquivos;
    setArquivos([]);

    // Perguntas meta (lei/juris/ajuda) ou ajuste pós-redação — sem reprocessar o caso
    if (filesNow.length === 0 && texto) {
      const intencao = classificarIntencaoChat({
        texto,
        casoJaOrganizado,
        pecaGerada: geradoPorIA,
      });
      if (intencao === "ajuste_peca" && geradoPorIA && peca.trim()) {
        setEnviando(true);
        setAjustando(true);
        setErro(null);
        setAvisos(null);
        try {
          const res = await fetch("/api/ajustar-peca", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              peca,
              pedido: texto.trim(),
              ajustesJaFeitos: ajustesFeitos,
            }),
          });
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
            peca?: string;
            pecaHtml?: string;
          };
          if (!res.ok || !data.peca || !data.pecaHtml) {
            setErro(data.error ?? "Não foi possível ajustar a peça.");
            return;
          }
          setPeca(data.peca);
          setPecaHtml(data.pecaHtml);
          setAjustesFeitos((n) => n + 1);
          adicionarMensagem(
            "assistente",
            "Ajuste aplicado na peça à direita. Peça outro refinamento se precisar."
          );
        } catch {
          setErro("Falha de rede no ajuste.");
        } finally {
          setAjustando(false);
          setEnviando(false);
        }
        return;
      }
      if (intencao === "escolher_tribunal") {
        adicionarMensagem("assistente", respostaEscolherTribunal());
        return;
      }
      if (intencao === "meta_lei_juris") {
        adicionarMensagem("assistente", respostaMetaLeiJuris());
        setDrawerAba("complementos");
        setDrawerAberto(true);
        return;
      }
      if (intencao === "meta_ajuda") {
        adicionarMensagem("assistente", respostaMetaAjuda());
        return;
      }
    }

    if (
      filesNow.length === 0 &&
      texto &&
      casoJaOrganizado &&
      pareceComplementoSomentePedidos(texto, true)
    ) {
      const novosPedidos = extrairPedidosComplemento(
        texto,
        estado.areaId,
        estado.tipoAcao,
        estado.fatos
      );
      const pedidos = mesclarPedidosEstado(estado.pedidos, novosPedidos);
      const next: EstadoCasoChat = {
        ...estado,
        pedidos,
        planoVisto: false,
        previewVisto: false,
        pedirJusticaGratuita:
          estado.pedirJusticaGratuita ||
          /\bjusti[cç]a\s+gratuita\b|\bgratuidade\b/i.test(texto),
      };
      setEstado(next);
      estadoRef.current = next;
      estadoAnteriorRef.current = next;
      planoUltimoFingerprintRef.current = null;
      adicionarMensagem(
        "assistente",
        [
          `Incluí no plano: ${novosPedidos.map((p) => `“${p}”`).join(", ") || "pedido complementar"}.`,
          "O plano à direita será atualizado. Quando estiver bom, **Redigir (1 peça)**.",
        ].join("\n\n")
      );
      void executarPlano({ silencioso: false });
      return;
    }

    setEnviando(true);
    if (filesNow.length > 0) setProcessandoDocumentos(true);
    entradaAbortRef.current?.abort();
    const ac = new AbortController();
    entradaAbortRef.current = ac;

    try {
      const relatoAcumulado = [estado.fatos, texto].filter(Boolean).join("\n\n");

      const inferenciaTurno = inferirAreaChat({
        texto: texto || relatoAcumulado,
        preferida: areaUrl,
        leigo,
      });
      const trocaAreaProvavel =
        filesNow.length === 0 &&
        Boolean(texto) &&
        !areaManual &&
        deveResetarPorTrocaArea(estado, inferenciaTurno, false);

      const relatoParaProcessar =
        trocaAreaProvavel && texto ? texto : relatoAcumulado;

      const misto = detectarRelatoMistoAreas(
        trocaAreaProvavel && texto ? texto : relatoAcumulado
      );
      const avisoMisto =
        misto.misto && !trocaAreaProvavel
          ? (misto.mensagem ??
            "O relato mistura temas de áreas diferentes — use **Novo caso** para cada peça.")
          : null;
      if (avisoMisto) setAvisos(avisoMisto);

      const {
        relato,
        arquivos: payloadArquivos,
        reutilizouCache,
        fingerprintsEnviadosServidor,
      } = await processarArquivos(relatoParaProcessar, filesNow);

      if (reutilizouCache && filesNow.length > 0 && !avisoMisto) {
        setAvisos(
          "Usei o texto já lido deste anexo — não foi necessário reler o PDF."
        );
      }

      if (relato.length < 40 && payloadArquivos.length === 0) {
        adicionarMensagem(
          "assistente",
          "Para eu organizar o caso, conte um pouco mais — **fatos**, **partes** e o que você precisa na peça — ou **anexe um PDF**."
        );
        return;
      }

      let inferencia = inferirAreaChat({
        texto: relato,
        preferida: areaUrl,
        leigo,
      });
      const areaParaOrg = areaManual ? estado.areaId : inferencia.areaId;
      const estadoAntes = estadoAnteriorRef.current;
      const trocaArea =
        trocaAreaProvavel ||
        deveResetarPorTrocaArea(estadoAntes, inferencia, areaManual);
      const baseEstado = trocaArea
        ? prepararEstadoTrocaArea(inferencia, texto || relato)
        : estadoAntes;
      const orgLocal = organizarCasoLocal({
        relato,
        areaId: areaParaOrg,
        poloAdvocacia: baseEstado.poloAdvocacia,
      });
      const preenchimentoLocal = orgLocal.preenchimento;

      if (
        !areaManual &&
        orgLocal.areaIdResolvida !== areaParaOrg &&
        chatMinutaAreaHabilitada(orgLocal.areaIdResolvida as AreaIdMinuta)
      ) {
        inferencia = {
          areaId: orgLocal.areaIdResolvida as AreaIdMinuta,
          confianca: "alta",
          alternativas: [],
        };
      }

      let nextEstado = areaManual
        ? { ...baseEstado, areaConfirmada: true }
        : aplicarInferenciaAreaAoEstado(baseEstado, inferencia);
      nextEstado = aplicarOrganizacaoAoEstadoChat(nextEstado, preenchimentoLocal, {
        areaId: orgLocal.areaIdResolvida,
        relato,
      });
      nextEstado = sincronizarPoloAutomaticoChat(nextEstado, texto);
      nextEstado = reajustarEspeciePoloChat(nextEstado);
      nextEstado = { ...nextEstado, planoVisto: false, previewVisto: false };

      const primeiroRelato =
        !casoJaOrganizado || trocaArea || payloadArquivos.length > 0;

      if (primeiroRelato && (trocaArea || payloadArquivos.length > 0)) {
        setTriagemPreview(null);
        setPayloadPendente(null);
        setVersoesPlano([]);
        planoUltimoFingerprintRef.current = null;
      }

      setEstado(nextEstado);
      estadoRef.current = nextEstado;
      estadoAnteriorRef.current = nextEstado;
      if (primeiroRelato) planoUltimoFingerprintRef.current = null;

      void (async () => {
        try {
          const partes = extrairQualificacaoDoRelato(relato);
          if (!partes.autor.cep && !partes.reu.cep) return;
          const enriquecido = await enriquecerPartesComViaCep(partes);
          setEstado((atual) =>
            sincronizarTribunaisComarca(
              sincronizarComarcaDaQualificacao({
                ...atual,
                qualificacaoAutor: {
                  ...atual.qualificacaoAutor,
                  ...enriquecido.autor,
                },
                qualificacaoReu: {
                  ...atual.qualificacaoReu,
                  ...enriquecido.reu,
                },
              })
            )
          );
        } catch {
          /* ViaCEP indisponível */
        }
      })();

      let respostaAssist = montarRespostaTurnoLocal({
        diff: diffEstadoCasoChat(estadoAntes, nextEstado),
        estado: nextEstado,
        primeiroRelato,
      });

      const payloadConversa = {
        mensagem: texto || "Analise os documentos anexados e organize o caso.",
        estado: nextEstado,
        estadoAnterior: estadoAntes,
        triagem: triagemPreview,
        mensagens: [
          ...mensagens,
          {
            id: "tmp",
            papel: "usuario" as const,
            texto: texto || `[Anexo: ${filesNow.map((f) => f.name).join(", ")}]`,
            ts: Date.now(),
          },
        ],
        primeiroRelato,
        avisoExtra: avisoMisto,
        modo: modoConversa,
      };

      let usouStream = false;
      try {
        const streamed = await consumirStreamConversa(payloadConversa);
        if (streamed) {
          respostaAssist = streamed;
          usouStream = true;
        } else {
          const resConversa = await fetch("/api/chat-conversa", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payloadConversa),
          });
          const dataConversa = (await resConversa.json().catch(() => ({}))) as {
            ok?: boolean;
            resposta?: string;
            estado?: EstadoCasoChat;
          };
          if (resConversa.ok && dataConversa.ok && dataConversa.resposta) {
            respostaAssist = dataConversa.resposta;
            if (dataConversa.estado) {
              nextEstado = dataConversa.estado;
              setEstado(nextEstado);
              estadoRef.current = nextEstado;
              estadoAnteriorRef.current = nextEstado;
              planoUltimoFingerprintRef.current = null;
            }
          }
        }
      } catch {
        /* fallback local já em respostaAssist */
      }

      if (!usouStream) {
        adicionarMensagem("assistente", respostaAssist);
      }
      setErro(null);
      setAvisos(null);

      if (
        configModoConversa(modoConversa).forcarPlanoAposTurno &&
        podeMontarPlanoChat(estadoRef.current) &&
        !precisaConfirmarPoloAdvogado(estadoRef.current)
      ) {
        void executarPlano({ silencioso: false, forcar: true });
      }

      if (
        deveChamarEntradaCaso({
          arquivosParaServidor: payloadArquivos.length,
          casoJaOrganizado: casoChatTemConteudo(estadoRef.current),
        })
      ) {
        void fetch("/api/entrada-caso", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            relato,
            areaId: orgLocal.areaIdResolvida,
            arquivos: payloadArquivos,
          }),
        })
          .then((r) => r.json())
          .then(
            (data: {
              preenchimento?: Parameters<typeof aplicarPreenchimentoAoEstado>[1];
              replicaContestacao?: ReplicaContestacaoResumo | null;
              leituraRelato?: LeituraRelato;
            }) => {
              if (fingerprintsEnviadosServidor.length > 0) {
                setAnexosMemoria((atual) => {
                  const next = marcarAnexosEntradaProcessada(
                    atual,
                    fingerprintsEnviadosServidor
                  );
                  anexosMemoriaRef.current = next;
                  return next;
                });
              }
              if (!data.preenchimento) return;
              setEstado((atual) => {
                let merged = aplicarOrganizacaoAoEstadoChat(
                  atual,
                  data.preenchimento!,
                  {
                    areaId: orgLocal.areaIdResolvida,
                    relato,
                    replicaContestacao: data.replicaContestacao ?? undefined,
                  }
                );
                merged = sincronizarPoloAutomaticoChat(merged, relato);
                merged = reajustarEspeciePoloChat(merged);
                estadoRef.current = merged;
                estadoAnteriorRef.current = merged;
                return merged;
              });
              planoUltimoFingerprintRef.current = null;
              if (data.replicaContestacao?.detectada) {
                adicionarMensagem(
                  "assistente",
                  "Detectei **contestação** nos autos — espécie sugerida: réplica à contestação."
                );
              }
              if (data.leituraRelato) {
                const lr = data.leituraRelato;
                const balao = formatarBalaoLeituraAnexo(lr);
                setLeituraAnexoPainel(balao);
                const fpLeitura =
                  fingerprintsEnviadosServidor.join("|") || "relato";
                if (leituraAnexoExibidaRef.current !== fpLeitura) {
                  leituraAnexoExibidaRef.current = fpLeitura;
                  adicionarMensagem("sistema", balao);
                }
              }
            }
          )
          .catch(() => undefined);
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao processar mensagem.");
    } finally {
      setEnviando(false);
      setProcessandoDocumentos(false);
    }
  }

  async function confirmarRedacao(overrides?: {
    triagem?: PreviewTriagemData;
    payload?: ReturnType<typeof montarPayloadGeracaoChat>;
  }) {
    const triagem = overrides?.triagem ?? triagemPreview;
    const payload = overrides?.payload ?? payloadPendente;
    if (!triagem || !payload) return;

    const estadoAtual = estadoRef.current;
    const avisoPolo = validarPoloEspecieChat(estadoAtual);
    if (avisoPolo) {
      setAvisos(avisoPolo);
      return;
    }

    setRedigindo(true);
    setErro(null);
    setAvisos(null);
    try {
      const res = await fetch("/api/gerar-peca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          escritorio: escritorio.usarTimbre ? escritorio : undefined,
          triagemPrecalculada: {
            estrategiaJuridica: triagem.estrategiaJuridica,
            topicos: triagem.topicos,
            cobertura: triagem.cobertura,
            modelo: triagem.modelo ?? "triagem",
            analiseEstrategica: triagem.analiseEstrategica,
          },
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        codigo?: string;
        cota?: ResumoCota;
      } & Partial<GerarPecaJecOutput>;

      if (!res.ok) {
        if (data.codigo === "COTA_ESGOTADA" && data.cota) setCota(data.cota);
        setErro(data.error ?? "Erro ao redigir a peça.");
        return;
      }

      if (data.peca && data.pecaHtml) {
        let msgPosRedacao = exportacaoTrial
          ? "Peça redigida. Visualize completa à direita; Word/PDF nos planos pagos. Copie o texto para conferência ou peça ajustes abaixo."
          : "Peça redigida. Exporte Word/PDF à direita ou peça ajustes pontuais abaixo.";
        if (data.auditoria?.achados?.length) {
          const alertas = data.auditoria.achados
            .filter((a) => a.gravidade !== "info")
            .slice(0, 4)
            .map((a) => `• ${a.titulo}: ${a.detalhe}`)
            .join("\n");
          if (alertas) {
            msgPosRedacao += `\n\nAuditor — conferir antes de protocolar:\n${alertas}`;
          }
          const pedidoAuditor = pedidoAjusteDeAuditoria(data.auditoria);
          if (pedidoAuditor) {
            msgPosRedacao += `\n\nSugestão de ajuste (cole no chat): “${pedidoAuditor}”`;
          }
        }
        const msgRedacao: MensagemChat = {
          id: idMensagemChat(),
          papel: "assistente",
          texto: msgPosRedacao,
          ts: Date.now(),
        };
        const mensagensAtualizadas = [...mensagens, msgRedacao];
        setPeca(data.peca);
        setPecaHtml(data.pecaHtml);
        setGeradoPorIA(true);
        setLastroRedacao({
          citacoes: data.citacoes ?? [],
          baseConhecimentoUtilizada: data.baseConhecimentoUtilizada ?? [],
          marcadoresNaoEncontrado: data.marcadoresNaoEncontrado ?? 0,
          leiMunicipalUtilizada: data.leiMunicipalUtilizada ?? null,
          jurisDoCasoUtilizada: data.jurisDoCasoUtilizada ?? [],
        });
        setAvisoPreview(null);
        setAjustesFeitos(0);
        setTriagemPreview(null);
        setMensagens(mensagensAtualizadas);
        const salva = salvarSessaoChat({
          sessaoId: garantirSessaoId(),
          snapshot: {
            mensagens: mensagensAtualizadas,
            estado,
            peca: data.peca,
            pecaHtml: data.pecaHtml,
            geradoPorIA: true,
            ajustesFeitos: 0,
            avisoPreview: null,
            anexosMemoria,
          },
          novaPeca: {
            areaId: estado.areaId,
            tipoAcao: estado.tipoAcao,
            especiePeca: especieResolvidaChat(estado),
            geradoPorIA: true,
            peca: data.peca,
          },
        });
        sincronizarSessaoNuvem(salva);
        const autores = autoresAPartirDosNomes(estado.autoresNomes.join("; "));
        const reus = reusAPartirDosNomes(estado.reusNomes.join("; "));
        if (autores.length || reus.length) {
          salvarPerfilClienteComSync({
            autores,
            reus,
            polo: estado.poloAdvocacia ?? "ativo",
            syncNuvem: syncNuvemOptIn,
          });
        }
        if (syncNuvemOptIn) {
          void salvarMinutaNuvem({
            areaId: estado.areaId,
            titulo:
              estado.tipoAcao.trim() ||
              estado.fatos.replace(/\s+/g, " ").trim().slice(0, 72) ||
              "Minuta",
            especiePeca: especieResolvidaChat(estado),
            tipoAcao: estado.tipoAcao,
            foro: estado.comarca.foro,
            numeroProcesso: estado.comarca.numeroProcesso,
            pecaTexto: data.peca,
            pecaHtml: data.pecaHtml,
            geradoPorIA: true,
            origem: "chat",
            sessaoId: garantirSessaoId(),
          });
        }
      }
      if (data.cota) setCota(data.cota);
    } catch {
      setErro("Falha de rede na redação.");
    } finally {
      setRedigindo(false);
    }
  }

  async function handleAjustarTrecho() {
    if (pedidoAjuste.trim().length < 8) {
      setErro("Descreva o ajuste (mín. 8 caracteres).");
      return;
    }
    if (ajustesRestantes <= 0) {
      setErro("Limite de ajustes desta geração atingido.");
      return;
    }
    setAjustando(true);
    setErro(null);
    setAvisos(null);
    try {
      const res = await fetch("/api/ajustar-peca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          peca,
          pedido: pedidoAjuste.trim(),
          ajustesJaFeitos: ajustesFeitos,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        peca?: string;
        pecaHtml?: string;
      };
      if (!res.ok || !data.peca || !data.pecaHtml) {
        setErro(data.error ?? "Não foi possível ajustar.");
        return;
      }
      setPeca(data.peca);
      setPecaHtml(data.pecaHtml);
      setAjustesFeitos((n) => n + 1);
      setPedidoAjuste("");
      adicionarMensagem("sistema", "Trecho ajustado na peça.");
    } catch {
      setErro("Falha de rede no ajuste.");
    } finally {
      setAjustando(false);
    }
  }

  function confirmarArea(areaId: AreaIdMinuta) {
    if (!chatMinutaAreaHabilitada(areaId)) return;
    setAreaManual(true);
    setAreaSugestaoDispensada(false);
    setEstado((e) => confirmarAreaChat(e, areaId));
    planoUltimoFingerprintRef.current = null;
    setTriagemPreview(null);
    setPayloadPendente(null);
    setErro(null);
    setAvisos(null);
    adicionarMensagem(
      "sistema",
      `Área confirmada: **${rotuloAreaChat(areaId)}**. Montando o plano estratégico…`
    );
  }

  function handlePedidosPlano(pedidos: string[]) {
    setEstado((e) => ({ ...e, pedidos, planoVisto: false, previewVisto: false }));
    planoUltimoFingerprintRef.current = null;
  }

  function restaurarVersaoPlano(versao: VersaoPlanoChat) {
    setTriagemPreview(versao.triagem);
    setEstado((e) => ({ ...e, planoVisto: true, previewVisto: true }));
    destacarPlanoAtualizado();
    adicionarMensagem(
      "sistema",
      `Plano restaurado (${new Date(versao.ts).toLocaleString("pt-BR")}).`
    );
  }

  function incluirCoberturaNoPlano(itemId: string) {
    if (!triagemPreview) return;
    const next = incluirItemCoberturaNoPlano(triagemPreview, itemId);
    if (!next) return;
    const item = triagemPreview.cobertura.find((c) => c.id === itemId);
    setTriagemPreview(next);
    setVersoesPlano((v) => registrarVersaoPlano(v, next, item?.rotulo ?? "inclusão"));
    destacarPlanoAtualizado();
    if (next.pedidosFormulario?.length) {
      setEstado((e) => ({
        ...e,
        pedidos: next.pedidosFormulario ?? e.pedidos,
        planoVisto: true,
        previewVisto: true,
      }));
    }
    setPayloadPendente((p) =>
      p
        ? {
            ...p,
            pedidosUsuario: next.pedidosFormulario ?? p.pedidosUsuario,
          }
        : p
    );
    adicionarMensagem(
      "sistema",
      `Incluído no plano: **${item?.rotulo.replace(/^Pedido:\s*/i, "") ?? "item"}**.`
    );
  }

  function trocarArea(nova: AreaIdMinuta) {
    if (!chatMinutaAreaHabilitada(nova)) return;
    setAreaManual(true);
    setEstado((e) => confirmarAreaChat(e, nova));
    planoUltimoFingerprintRef.current = null;
    setTriagemPreview(null);
    setPayloadPendente(null);
    setMostrarTrocarArea(false);
    adicionarMensagem("sistema", `Área alterada para ${rotuloAreaChat(nova)}.`);
  }

  function patchEstado(patch: Partial<EstadoCasoChat>) {
    setEstado((e) => ({ ...e, ...patch }));
  }

  const resumoDrawer = useMemo(() => {
    const provasUtil = estado.provasCaso.filter((p) => p.texto.trim().length >= 40)
      .length;
    const linhas = [
      ["Área", rotuloAreaChat(estado.areaId)],
      ["Espécie", estado.especiePeca],
      ["Ação", estado.tipoAcao || "—"],
      ["Autores", estado.autoresNomes.join(", ") || "—"],
      ["Réus", estado.reusNomes.join(", ") || "—"],
      ["Foro", estado.comarca.foro || "—"],
      ["Pedidos", estado.pedidos.join("; ") || "—"],
      ["Provas do fato", provasUtil > 0 ? `${provasUtil} documento(s)` : "—"],
      [
        "Juris anexada",
        estado.jurisCaso.length > 0 ? `${estado.jurisCaso.length} fonte(s)` : "—",
      ],
      [
        "Link nuvem",
        estado.linkNuvem.trim() ? estado.linkNuvem.trim() : "—",
      ],
    ];
    return linhas;
  }, [estado]);

  const painelDireitoAtivo =
    Boolean(pecaHtml) ||
    Boolean(triagemPreview) ||
    planoLoading ||
    (estado.areaConfirmada && casoJaOrganizado);
  const previewTemPeca = painelDireitoAtivo;
  const previewColCls = previewTemPeca ? tema.previewCol : tema.previewIdleCol;
  const previewHeaderCls = previewTemPeca
    ? tema.previewHeader
    : tema.previewIdleHeader;
  const previewBodyCls = previewTemPeca
    ? tema.previewBody
    : tema.previewIdleBody;
  const previewEmptyCls = previewTemPeca
    ? tema.previewEmpty
    : tema.previewIdleEmpty;

  useEffect(() => {
    setPortalMontado(true);
  }, []);

  useEffect(() => {
    onWorkspaceFixadoChange?.(workspaceFixado);
  }, [workspaceFixado, onWorkspaceFixadoChange]);

  useEffect(() => {
    if (!modoWorkspace || !workspaceFixado) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setWorkspaceFixado(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [modoWorkspace, workspaceFixado]);

  const alternarWorkspaceFixado = useCallback(() => {
    setWorkspaceFixado((fixado) => !fixado);
  }, []);

  const shell = (
    <div
      className={`flex min-h-0 flex-1 flex-col gap-0 lg:flex-row ${workspaceFixado ? "h-dvh" : "h-full"} ${modoWorkspace ? "lg:divide-x lg:divide-white/10" : "lg:gap-px"} ${tema.shell}`}
    >
      {/* Mobile: abas Conversar | Peça */}
      <div
        className={`flex shrink-0 border-b lg:hidden ${modoWorkspace ? "border-white/10 bg-white/[0.04] backdrop-blur-md" : "border-stone-700/50 bg-facto-dark"}`}
      >
        {(
          [
            ["chat", "Conversar"],
            ["peca", previewTemPeca ? (geradoPorIA ? "Peça" : "Plano") : "Plano"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setAbaMobile(id)}
            title={
              id === "chat"
                ? "Aba Conversar: relato, anexos e envio ao assistente."
                : "Aba Peça/Preview: documento na forma do tribunal e exportação."
            }
            className={`relative flex-1 px-3 py-2 text-xs font-semibold transition ${
              abaMobile === id
                ? "text-facto-gold"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            {label}
            {id === "peca" && previewTemPeca && abaMobile !== "peca" && (
              <span className="absolute right-3 top-2 h-1.5 w-1.5 rounded-full bg-facto-gold" />
            )}
            {abaMobile === id && (
              <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-facto-gold" />
            )}
          </button>
        ))}
      </div>

      {/* Coluna chat */}
      <div
        className={`min-h-0 flex-col border-b lg:flex lg:min-h-0 lg:w-[58%] lg:max-w-none lg:flex-none lg:border-b-0 lg:border-r xl:w-[56%] ${tema.chatCol} ${
          abaMobile === "chat" ? "flex flex-1" : "hidden"
        }`}
      >
        <header className={`shrink-0 border-b px-3 py-2 text-stone-100 sm:px-4 ${headerChatCls}`}>
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              {!modoWorkspace && (
                <>
                  <h1 className="text-sm font-semibold tracking-tight sm:text-base">
                    Assistente
                  </h1>
                  <span className="rounded-full border border-facto-gold/40 bg-stone-800/80 px-1.5 py-0.5 text-[10px] text-facto-gold">
                    Beta
                  </span>
                </>
              )}
              <button
                type="button"
                onClick={() => setMostrarTrocarArea((v) => !v)}
                className="max-w-[min(100%,20rem)] truncate bg-transparent p-0 text-left text-xs font-semibold tracking-tight text-facto-gold sm:text-sm hover:text-[#c4bf9a] hover:underline hover:underline-offset-2"
                title="Área do caso. Clique para escolher ou mudar (JEC, Cível, Trabalhista…). Também pode deixar o assistente sugerir pela conversa."
              >
                {rotuloAreaCaso}
              </button>
              {estado.replicaContestacao?.detectada && (
                <span className="rounded-full border border-amber-600/50 bg-amber-950/40 px-2 py-0.5 text-[11px] text-amber-200">
                  Réplica
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <ChatModoConversaToggle
                modo={modoConversa}
                onModoChange={setModoConversa}
                modoWorkspace={modoWorkspace}
                compacto
              />
              {!modoWorkspace && (
                <button
                  type="button"
                  onClick={() => setTemaId((atual) => alternarChatMinutaTema(atual))}
                  title={tema.dica}
                  className={pillBtn}
                >
                  {tema.label}
                </button>
              )}
              <button
                type="button"
                onClick={() => setMostrarMinutasNuvem(true)}
                title="Nuvem: minutas e sessões sincronizadas na sua conta (opt-in LGPD). Use para retomar o trabalho em outro dispositivo."
                className={pillBtn}
              >
                Nuvem
              </button>
              <button
                type="button"
                onClick={() => setMostrarSessoes(true)}
                title="Conversas: histórico local neste navegador. Abra uma conversa anterior ou continue de onde parou."
                className={pillBtn}
              >
                Conversas
              </button>
              <Link
                href="/dashboard/meus-casos"
                title="Meus casos: lista de casos salvos no FACTO — abra, continue ou organize por área."
                className={pillBtn}
              >
                Meus casos
              </Link>
              <button
                type="button"
                onClick={() => {
                  setDrawerAba("resumo");
                  setDrawerAberto(true);
                }}
                title="O que entendi do caso"
                className={pillBtn}
              >
                Entendimento
              </button>
              {timbreConfigurado ? (
                <label
                  title="Timbre: liga ou desliga cabeçalho, rodapé e marca d'água do escritório na peça. Configure as imagens em Meu perfil."
                  className={`flex cursor-pointer items-center gap-1 ${pillBtn} has-[:checked]:border-facto-gold/45 has-[:checked]:text-amber-50`}
                >
                  <input
                    type="checkbox"
                    checked={escritorio.usarTimbre}
                    onChange={alternarTimbreEscritorio}
                    className="h-3 w-3 rounded border-stone-500 text-facto-gold focus:ring-0 focus:ring-offset-0"
                  />
                  Timbre
                </label>
              ) : (
                <Link
                  href="/dashboard/perfil#timbre-escritorio"
                  title="Timbre ainda não configurado. Abre o perfil para enviar cabeçalho, rodapé ou marca d'água do escritório."
                  className={
                    modoWorkspace
                      ? `${pillBtn} text-stone-400`
                      : "rounded-full border border-stone-600 bg-stone-800/90 px-2 py-0.5 text-[10px] font-medium text-stone-400 transition hover:border-facto-gold/45 hover:text-amber-50"
                  }
                >
                  Timbre
                </Link>
              )}
              {previewInterno && (
              <Link
                href={hrefFormulario}
                title={`Formulário completo da área ${rotuloAreaChat(estado.areaId)}: identificação, fatos e pedidos em três abas — útil se preferir preencher campo a campo em vez do chat.`}
                className={
                  modoWorkspace
                    ? "rounded-full px-2 py-0.5 text-[10px] text-stone-400 underline-offset-2 hover:text-facto-gold hover:underline"
                    : "rounded-full border border-stone-700 px-2 py-0.5 text-[10px] text-stone-400 underline-offset-2 hover:text-facto-gold hover:underline"
                }
              >
                Formulário
              </Link>
              )}
              {modoWorkspace && (
                <button
                  type="button"
                  onClick={alternarWorkspaceFixado}
                  title={
                    workspaceFixado
                      ? "Desfixar: volta o assistente ao lugar na home. Atalho: Esc."
                      : "Fixar: coloca o assistente em tela cheia (chat + documento), sem o restante da home."
                  }
                  aria-label={
                    workspaceFixado
                      ? "Desfixar área de trabalho"
                      : "Fixar área de trabalho em tela cheia"
                  }
                  aria-pressed={workspaceFixado}
                  className={classeBotaoFixarTexto(workspaceFixado)}
                >
                  {workspaceFixado ? "Desfixar Área de Trabalho" : "Fixar Área de Trabalho"}
                </button>
              )}
            </div>
          </div>
          {mostrarTrocarArea && (
            <div className="mt-1.5 flex max-h-24 flex-wrap gap-1 overflow-y-auto">
              {areasDisponiveis.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => trocarArea(id)}
                    className={`rounded-md px-2 py-0.5 text-[11px] ${
                    id === estado.areaId
                      ? "bg-facto-gold/25 text-amber-100 ring-1 ring-facto-gold/50"
                      : modoWorkspace
                        ? "bg-white/[0.08] text-stone-300 hover:bg-white/[0.12]"
                        : "bg-stone-800 text-stone-300 hover:bg-stone-700"
                  }`}
                >
                  {rotuloAreaChat(id)}
                </button>
              ))}
            </div>
          )}
          {exigePolo && (
            <div className="mt-1.5 rounded-lg border border-amber-600/25 bg-amber-950/20 px-2.5 py-1">
              <p className="text-[11px] text-amber-100/90">
                Confirme o polo no chat abaixo para montar o plano.
              </p>
            </div>
          )}
        </header>

        <div
          data-chat-mensagens-scroll
          className={`relative min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 ${tema.chatScroll}`}
        >
          <div className="mx-auto max-w-3xl space-y-3">
            {estado.replicaContestacao?.detectada ? (
              <ReplicaContestacaoPainel
                analise={estado.replicaContestacao}
                onAplicarEspecie={
                  estado.replicaContestacao.sugereEspecieReplica
                    ? aplicarEspecieReplica
                    : undefined
                }
              />
            ) : null}
            {mensagens
              .filter(
                (m) =>
                  !(
                    m.id === "welcome" &&
                    mensagens.length <= 1 &&
                    !casoJaOrganizado
                  )
              )
              .map((m) => (
              <div
                key={m.id}
                className={`flex ${m.papel === "usuario" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[94%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:text-[15px] sm:leading-relaxed ${
                    m.papel === "usuario"
                      ? tema.msgUsuario
                      : m.papel === "sistema"
                        ? tema.msgSistema
                        : tema.msgAssistente
                  }`}
                >
                  <ChatMensagemTexto texto={m.texto} onAbrirFls={abrirFlsNoAnexo} />
                </div>
              </div>
            ))}
            {enviando && !msgStreamId && (
              <ChatIndicadorDigitando temaAssistente={tema.msgAssistente} />
            )}
            {exigePolo && (
              <ChatConfirmacaoPolo
                estado={estado}
                modoWorkspace={modoWorkspace}
                onConfirmar={confirmarPolo}
              />
            )}
            {mensagens.length <= 1 && !casoJaOrganizado && (
              <div className="flex flex-col items-center px-2 py-6 text-center sm:py-10">
                <p
                  className={
                    modoWorkspace
                      ? "text-base font-semibold text-stone-200 sm:text-lg"
                      : "text-base font-semibold text-stone-800 sm:text-lg"
                  }
                >
                  O futuro do seu caso começa aqui
                </p>
                <p
                  className={
                    modoWorkspace
                      ? "mt-2 max-w-md text-xs text-stone-500 sm:text-sm"
                      : "mt-2 max-w-md text-xs text-stone-600 sm:text-sm"
                  }
                >
                  Descreva o caso, anexe documentos ou use uma sugestão.
                </p>
              </div>
            )}
            {mensagens.length <= 1 && !casoJaOrganizado && (
              <div className="flex flex-wrap gap-2 pt-1">
                {(
                  [
                    "Corte indevido de água/energia — peço tutela e danos morais",
                    "Rescisão trabalhista — verbas e FGTS",
                    "Réplica à contestação — processo já em andamento",
                  ] as const
                ).map((sugestao) => (
                  <button
                    key={sugestao}
                    type="button"
                    onClick={() => {
                      setInput(sugestao);
                    }}
                    className={
                      modoWorkspace
                        ? "rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-left text-[11px] text-stone-300 backdrop-blur-sm transition hover:border-facto-gold/40 hover:text-facto-gold"
                        : "rounded-full border border-stone-300 bg-white/80 px-3 py-1.5 text-left text-[11px] text-stone-600 transition hover:border-facto-gold/50 hover:text-stone-900"
                    }
                  >
                    {sugestao}
                  </button>
                ))}
              </div>
            )}
            {faseEquipe !== "idle" && !redigindo && (
                <ChatEquipeTrabalhando fase={faseEquipe} />
              )}
            {precisaConfirmarArea && (
              <div className="mt-2">
                <ChatConfirmarArea
                  inferencia={estado.areaInferida}
                  areaAtual={estado.areaId}
                  onConfirmar={confirmarArea}
                  compacto={modoWorkspace}
                />
              </div>
            )}
            <div ref={fimChatRef} />
          </div>
        </div>

        <div
          className={`max-h-[42vh] shrink-0 overflow-y-auto border-t px-3 py-2.5 sm:px-4 ${tema.chatComposer}`}
        >
          <div className="mx-auto max-w-3xl">
          {avisos && (
            <p className="mb-2 rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-1.5 text-sm text-amber-950">
              {avisos}
            </p>
          )}
          {erro && (
            <p className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-800">
              {erro}
            </p>
          )}
          {cota && (
            <p className="mb-1.5 text-[11px] text-stone-500">
              Cota: {cota.usoLabel}
            </p>
          )}

          {mostrarPickerTribunais && (
            <div className="mb-2">
              <ChatTribunaisPicker
                ufForo={estado.comarca.uf}
                selecionados={estado.tribunaisPreferidos ?? []}
                compacto
                onChange={(ids) => {
                  setEstado((e) => ({
                    ...e,
                    tribunaisPreferidos: ids,
                    tribunaisConfirmados: false,
                  }));
                  planoUltimoFingerprintRef.current = null;
                }}
                onConfirmar={() => {
                  setEstado((e) => ({
                    ...e,
                    tribunaisConfirmados: true,
                  }));
                  planoUltimoFingerprintRef.current = null;
                }}
                onDispensar={() => {
                  setEstado((e) => ({
                    ...e,
                    tribunaisDispensados: true,
                    tribunaisConfirmados: true,
                    tribunaisPreferidos: e.tribunaisPreferidos ?? [],
                  }));
                }}
              />
            </div>
          )}

          {geradoPorIA && ajustesRestantes > 0 && (
            <div
              className={`mb-2 rounded-lg border p-2.5 ${
                modoWorkspace
                  ? "border-white/10 bg-white/[0.04]"
                  : "border-stone-200 bg-stone-50"
              }`}
            >
              <p className="text-[11px] font-medium text-stone-400">
                Ajuste de trecho ({ajustesRestantes} restante
                {ajustesRestantes !== 1 ? "s" : ""})
              </p>
              <textarea
                rows={2}
                value={pedidoAjuste}
                onChange={(e) => setPedidoAjuste(e.target.value)}
                placeholder="Ex.: incluir pedido de tutela no item III"
                className="mt-1.5 w-full rounded-md border border-stone-600/40 bg-stone-900/40 px-2 py-1 text-sm text-stone-200"
              />
              <button
                type="button"
                disabled={ajustando}
                onClick={() => void handleAjustarTrecho()}
                className="mt-1.5 rounded-md bg-stone-700 px-2.5 py-1 text-[11px] font-medium text-white disabled:opacity-50"
              >
                {ajustando ? "Ajustando…" : "Aplicar ajuste"}
              </button>
            </div>
          )}

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const files = Array.from(e.dataTransfer.files ?? []).slice(0, 4);
              if (files.length) {
                setArquivos(files);
                setContextoPainelAberto(true);
              }
            }}
          >
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleEnviarMensagem();
              }
            }}
            placeholder="Descreva o caso, cole e-mail do cliente ou anexe PDF…"
            className={`w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 sm:text-[15px] ${tema.input}`}
          />
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <ChatAdicionarContexto
              modoWorkspace={modoWorkspace}
              aberto={contextoPainelAberto}
              onAbertoChange={setContextoPainelAberto}
              itemCount={anexosItemCount}
              processandoDocumentos={processandoDocumentos}
            />
            <BotaoFalarCampo
              disabled={enviando}
              areaId={estado.areaId}
              onIniciarGravacao={() => setErro(null)}
              onErro={setErro}
              onTranscrito={(texto) => {
                setErro(null);
        setAvisos(null);
                setInput((atual) => juntarTranscricao(atual, texto));
              }}
              className={
                modoWorkspace
                  ? "border-white/15 bg-white/[0.06] backdrop-blur-sm hover:bg-white/10"
                  : undefined
              }
            />
            <button
              type="button"
              disabled={enviando || planoLoading || redigindo}
              onClick={() => void handleEnviarMensagem()}
              title="Enviar: manda o relato ao assistente para organizar o caso e atualizar o plano. Não redige a peça final — isso é Redigir (1 peça)."
              className={
                modoWorkspace
                  ? "ml-auto rounded-lg bg-facto-gold px-3.5 py-1.5 text-sm font-semibold text-facto-dark transition hover:bg-[#a39a78] disabled:opacity-50"
                  : "ml-auto rounded-lg bg-stone-800 px-3.5 py-1.5 text-sm font-medium text-amber-50 hover:bg-stone-700 disabled:opacity-50"
              }
            >
              {enviando
                ? "Analista…"
                : planoLoading
                  ? "Plano…"
                  : redigindo
                    ? "Redigindo…"
                    : "Enviar"}
            </button>
          </div>
          </div>
        </div>
      </div>
      </div>

      {/* Coluna preview */}
      <div
        className={`relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex ${
          abaMobile === "peca" ? "flex" : "hidden lg:flex"
        } ${previewColCls}`}
      >
        <div className={`shrink-0 border-b px-4 py-2 sm:px-5 ${previewHeaderCls}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              className={`text-sm font-semibold ${
                previewTemPeca ? "text-stone-800" : "text-stone-100"
              }`}
            >
              {geradoPorIA
                ? "Peça redigida"
                : previewTemPeca
                  ? "Plano do caso"
                  : "Documento"}
            </h2>
            <div className="flex flex-wrap items-center gap-1.5">
              {planoLoading && !geradoPorIA && (
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
                    previewTemPeca ? "text-stone-500" : "text-stone-400"
                  }`}
                >
                  <span className="inline-flex gap-0.5" aria-hidden>
                    <span className="h-1 w-1 animate-pulse rounded-full bg-current opacity-60" />
                    <span className="h-1 w-1 animate-pulse rounded-full bg-current opacity-60 [animation-delay:200ms]" />
                    <span className="h-1 w-1 animate-pulse rounded-full bg-current opacity-60 [animation-delay:400ms]" />
                  </span>
                  Atualizando…
                </span>
              )}
              <button
                type="button"
                onClick={() => reiniciarChatAtual()}
                title="Reiniciar chat: grava o caso atual em Conversas e limpa a conversa e o preview nesta tela — útil para recomeçar o mesmo assunto do zero."
                className={
                  previewTemPeca
                    ? "rounded-full border border-stone-300 bg-white px-2.5 py-0.5 text-[10px] font-medium text-stone-700 transition hover:border-stone-400"
                    : "rounded-full border border-stone-600 bg-stone-800/90 px-2.5 py-0.5 text-[10px] font-medium text-stone-300 transition hover:border-facto-gold/45 hover:text-amber-50"
                }
              >
                Reiniciar chat
              </button>
              <button
                type="button"
                onClick={() => iniciarNovoCaso()}
                title="Novo caso: grava o atual e abre uma conversa em branco (área a definir). O anterior fica em Conversas / Meus casos."
                className={
                  previewTemPeca
                    ? "rounded-full border border-amber-700/40 bg-amber-50 px-2.5 py-0.5 text-[10px] font-medium text-amber-900 transition hover:bg-amber-100"
                    : "rounded-full border border-facto-gold/45 bg-facto-gold/15 px-2.5 py-0.5 text-[10px] font-medium text-facto-gold transition hover:bg-facto-gold/25"
                }
              >
                Novo caso
              </button>
              {modoWorkspace && (
                <button
                  type="button"
                  onClick={alternarWorkspaceFixado}
                  title={
                    workspaceFixado
                      ? "Desfixar: volta o assistente ao lugar na home. Atalho: Esc."
                      : "Fixar: coloca o assistente em tela cheia (chat + documento), sem o restante da home. Clique de novo ou Esc para sair."
                  }
                  aria-label={
                    workspaceFixado
                      ? "Sair da tela cheia"
                      : "Fixar assistente em tela cheia"
                  }
                  aria-pressed={workspaceFixado}
                  className={classeBotaoFixarIcone(workspaceFixado, previewTemPeca)}
                >
                  <IconeFixarWorkspace fixado={workspaceFixado} />
                </button>
              )}
            </div>
          </div>
          {avisoPreview && !geradoPorIA && previewTemPeca && (
            <p className="mt-0.5 text-[11px] text-stone-500">{avisoPreview}</p>
          )}
        </div>
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <ChatFontesFlutuante
            contagens={fontesContagens}
            onAbrir={abrirFontesChat}
            modoWorkspace={modoWorkspace}
          />
          {modoWorkspace && workspaceFixado && (
            <div
              className="pointer-events-none absolute bottom-4 right-4 z-30 sm:bottom-6 sm:right-6"
              aria-hidden
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/facto-wordmark.png"
                alt=""
                className="h-11 w-auto max-w-[min(44vw,12rem)] select-none opacity-[0.13] sm:h-14"
              />
            </div>
          )}
        <div className={`min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 ${previewBodyCls}`}>
          {geradoPorIA && pecaHtml ? (
            <div className="w-full space-y-4">
              <PecaDocumentoView
                peca={peca}
                pecaHtml={pecaHtml}
                escritorio={escritorio.usarTimbre ? escritorio : undefined}
                exportacaoBloqueada={exportacaoTrial}
                onCopiarTexto={() => {
                  void navigator.clipboard.writeText(peca);
                }}
              />
              {lastroRedacao && (
                <CitacoesRastreaveisPanel
                  fontes={lastroRedacao.baseConhecimentoUtilizada}
                  citacoes={lastroRedacao.citacoes}
                  jurisCaso={estado.jurisCaso}
                  marcadoresNaoEncontrado={lastroRedacao.marcadoresNaoEncontrado}
                  leiMunicipal={lastroRedacao.leiMunicipalUtilizada}
                  jurisDoCasoUtilizada={lastroRedacao.jurisDoCasoUtilizada}
                />
              )}
            </div>
          ) : (
            <PlanoCasoPainel
              estado={estado}
              triagem={triagemPreview}
              carregando={planoLoading}
              confirmando={redigindo}
              planoAtualizado={planoHighlight}
              versoes={versoesPlano}
              alertasFatosPedidos={alertasFatosPedidos}
              leituraAnexo={leituraAnexoPainel}
              dicaPrazo={dicaPrazo?.aviso ?? null}
              avisoComplementosLastro={
                precisaComplementosLastro
                  ? "Sem lei municipal nem jurisprudência do caso ainda. Use a coluna de fontes (ícones à direita) para anexar provas, lei ou juris. A base FACTO continua disponível na redação."
                  : null
              }
              onConfirmarRedacao={() => void confirmarRedacao()}
              onAtualizarPlano={() =>
                void executarPlano({ forcar: true, silencioso: false })
              }
              onPedidosChange={handlePedidosPlano}
              onRestaurarVersao={restaurarVersaoPlano}
              onIncluirCobertura={incluirCoberturaNoPlano}
              onAbrirFls={abrirFlsNoAnexo}
            />
          )}
        </div>
        </div>
      </div>

      {visualizadorAnexo && (
        <ChatVisualizadorAnexo
          arquivos={arquivos}
          anexosMemoria={anexosMemoria}
          pagina={visualizadorAnexo.pagina}
          trecho={visualizadorAnexo.trecho}
          modoWorkspace={modoWorkspace}
          onFechar={() => setVisualizadorAnexo(null)}
        />
      )}

      {contextoPainelAberto && (
        <ChatAnexosBanner
          modoWorkspace={modoWorkspace}
          onFechar={() => setContextoPainelAberto(false)}
          arquivos={arquivos}
          onArquivosChange={(files) => setArquivos(files.slice(0, 4))}
          provasUtil={provasUtilCount}
          jurisCount={estado.jurisCaso.length}
          temLeiMunicipal={Boolean(estado.leiMunicipalTexto?.trim())}
          processandoDocumentos={processandoDocumentos}
          consultaJuris={consultaJurisChat}
          areaId={estado.areaId}
          ufForo={estado.comarca.uf}
          jurisUploads={estado.jurisCaso as JurisCasoSalvo[]}
          onJurisAplicar={(itens) => {
            setEstado((prev) => {
              const ids = new Set(
                prev.jurisCaso.map((p) => p.titulo.toLowerCase())
              );
              const novos = itens.filter(
                (i) => !ids.has(i.titulo.toLowerCase())
              );
              const merged = {
                ...prev,
                jurisCaso: [...prev.jurisCaso, ...novos].slice(0, 5),
              };
              estadoRef.current = merged;
              estadoAnteriorRef.current = merged;
              return merged;
            });
            planoUltimoFingerprintRef.current = null;
          }}
          onAbrirComplementos={abrirComplementos}
          onEnviar={() => void handleEnviarMensagem()}
          enviando={enviando}
          envioDesabilitado={planoLoading || redigindo}
        />
      )}

      <MinutasHistoricoPainel
        aberto={mostrarMinutasNuvem}
        optIn={syncNuvemOptIn}
        onFechar={() => setMostrarMinutasNuvem(false)}
      />

      <ChatSessoesPainel
        aberto={mostrarSessoes}
        sessaoAtivaId={sessaoId}
        onFechar={() => setMostrarSessoes(false)}
        onNova={() => iniciarNovoCaso()}
        onAbrir={(s) => {
          aplicarSnapshotSessao(s);
          setMostrarSessoes(false);
        }}
      />

      <PainelLateralPortal
        aberto={drawerAberto}
        onFechar={() => setDrawerAberto(false)}
        ariaLabel={
          drawerAba === "resumo"
            ? "O que entendi"
            : "Provas e complementos"
        }
        maxWidthClass="max-w-lg"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold text-stone-900">
            {drawerAba === "resumo" ? "O que entendi" : "Provas e complementos"}
          </h3>
          <button
            type="button"
            onClick={() => setDrawerAberto(false)}
            className="text-stone-500 hover:text-stone-800"
          >
            Fechar
          </button>
        </div>
        <div className="flex gap-1 border-b px-4 py-2">
          <button
            type="button"
            onClick={() => setDrawerAba("resumo")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              drawerAba === "resumo"
                ? "bg-stone-800 text-amber-50"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            Resumo
          </button>
          <button
            type="button"
            onClick={() => setDrawerAba("complementos")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              drawerAba === "complementos"
                ? "bg-stone-800 text-amber-50"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            Complementos
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 text-sm">
          {drawerAba === "resumo" ? (
            <>
              <dl className="space-y-3">
                {resumoDrawer.map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                      {k}
                    </dt>
                    <dd className="mt-0.5 text-stone-800">{v}</dd>
                  </div>
                ))}
              </dl>
              {estado.fatos && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase text-stone-500">
                    Fatos
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-stone-700">
                    {estado.fatos}
                  </p>
                </div>
              )}
            </>
          ) : (
            <ChatComplementosSection
              estado={estado}
              onChange={patchEstado}
              leigo={leigo}
              syncNuvemOptIn={syncNuvemOptIn}
              onSyncNuvemOptInChange={handleSyncNuvemChange}
            />
          )}
        </div>
      </PainelLateralPortal>
    </div>
  );

  if (modoWorkspace && workspaceFixado && portalMontado) {
    return createPortal(
      <div
        className="fixed inset-0 z-[85] flex flex-col overflow-hidden border border-white/10 bg-stone-950/98 shadow-[0_28px_80px_-28px_rgba(0,0,0,0.95),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Assistente FACTO em tela cheia"
      >
        {shell}
      </div>,
      document.body
    );
  }

  return shell;
}
