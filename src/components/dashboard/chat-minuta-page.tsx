"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PecaDocumentoView } from "@/components/dashboard/peca-documento";
import { AlertaFatosPedidosChips } from "@/components/dashboard/alerta-fatos-pedidos-chips";
import { CitacoesRastreaveisPanel } from "@/components/dashboard/citacoes-rastreaveis-panel";
import {
  PreviewTriagemPeca,
  type PreviewTriagemData,
} from "@/components/dashboard/preview-triagem-peca";
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
import {
  areasChatMinutaDisponiveis,
  aplicarPreenchimentoAoEstado,
  aplicarOrganizacaoAoEstadoChat,
  chatMinutaAreaHabilitada,
  estadoCasoChatVazio,
  idMensagemChat,
  inferirAreaChat,
  montarPayloadGeracaoChat,
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
    "Conte o caso em linguagem natural — ou use uma sugestão abaixo. A pré-visualização à direita atualiza sozinha (sem cota). Em **Provas / lei e juris** você cola lei municipal e anexos. Só consumo 1 peça quando confirmar **Redigir**.",
  ts: Date.now(),
};

function fingerprintPreviewEstado(
  estado: EstadoCasoChat,
  usarTimbre: boolean
): string {
  return JSON.stringify({
    fatos: estado.fatos.trim(),
    tipoAcao: estado.tipoAcao.trim(),
    pedidos: estado.pedidos.filter(Boolean),
    areaId: estado.areaId,
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
}: {
  leigo?: boolean;
  plano?: PlanoId | null;
  /** Embutido na home `/dashboard` — URLs e header compactos. */
  modoWorkspace?: boolean;
  /** Home oculta o slot embutido enquanto o assistente está fixado em tela cheia. */
  onWorkspaceFixadoChange?: (fixado: boolean) => void;
}) {
  const searchParams = useSearchParams();
  const areaUrl = searchParams.get("area");

  const [mensagens, setMensagens] = useState<MensagemChat[]>([MSG_BOAS_VINDAS]);
  const [estado, setEstado] = useState<EstadoCasoChat>(() => {
    if (areaUrl) {
      const pref = normalizarAreaIdMinuta(areaUrl);
      return estadoCasoChatVazio(
        chatMinutaAreaHabilitada(pref) ? pref : "jec"
      );
    }
    // Workspace: área indefinida até o usuário escolher (UI "Área a definir").
    return estadoCasoChatVazio("jec");
  });
  const [areaManual, setAreaManual] = useState(Boolean(areaUrl));
  const [input, setInput] = useState("");
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [triagemLoading, setTriagemLoading] = useState(false);
  const [redigindo, setRedigindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [drawerAba, setDrawerAba] = useState<"resumo" | "complementos">("resumo");
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
  const previewAbortRef = useRef<AbortController | null>(null);
  const previewUltimoFingerprintRef = useRef<string | null>(null);
  const estadoRef = useRef(estado);
  const escritorioRef = useRef(escritorio);
  estadoRef.current = estado;
  escritorioRef.current = escritorio;
  const areasDisponiveis = areasChatMinutaDisponiveis();
  const limiteAjustes = limiteAjustesPorPlano(plano, leigo);
  const ajustesRestantes = Math.max(0, limiteAjustes - ajustesFeitos);
  const tema = useMemo(
    () =>
      resolverTemaChatMinuta(temaId, {
        workspace: modoWorkspace,
        previewTemPeca: Boolean(pecaHtml.trim()),
      }),
    [temaId, modoWorkspace, pecaHtml]
  );

  const pillBtn = modoWorkspace
    ? "rounded-full border border-white/15 bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-stone-300 backdrop-blur-sm transition hover:border-facto-gold/45 hover:bg-white/10 hover:text-amber-50"
    : "rounded-full border border-stone-600 bg-stone-800/90 px-2 py-0.5 text-[10px] font-medium text-stone-300 transition hover:border-facto-gold/45 hover:text-amber-50";

  const headerChatCls = modoWorkspace
    ? "border-white/10 bg-white/[0.04] backdrop-blur-md"
    : "border-stone-700/40 bg-facto-dark";
  const timbreConfigurado = escritorioTemConteudoTimbre(escritorio);
  const especieAtual = especieResolvidaChat(estado);
  const exigePolo = poloExigeConfirmacaoChat(estado.areaId, especieAtual);
  const moduloUi = moduloDaArea(estado.areaId);
  const exportacaoTrial = plano === "trial" || cota?.plano === "trial";
  const areaAindaIndefinida =
    !estado.fatos.trim() &&
    !estado.resumoEntrada &&
    !areaManual &&
    !areaUrl;

  const rotuloAreaCaso = areaAindaIndefinida
    ? "Área a definir"
    : especieAtual
      ? `${rotuloAreaChat(estado.areaId)} · ${especieAtual.replace(/-/g, " ")}`
      : rotuloAreaChat(estado.areaId);

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
          ? "Pré-visualização forense"
          : "Documento FACTO",
      previewLoading,
      ts: Date.now(),
    });
  }, [peca, pecaHtml, geradoPorIA, avisoPreview, previewLoading]);

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
      titulo: "Pré-visualização FACTO",
      previewLoading,
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
        setLastroRedacao(null);
        setMostrarSessoes(false);
        previewUltimoFingerprintRef.current = null;
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
    setLastroRedacao(null);
    const temConteudo =
      Boolean(estadoNorm.fatos.trim()) ||
      Boolean(estadoNorm.resumoEntrada?.trim()) ||
      snap.mensagens.some((m) => m.papel === "usuario") ||
      Boolean(snap.peca.trim());
    // Sessão vazia: não “grudar” em JEC — UI fica em Área a definir.
    setAreaManual(Boolean(areaUrl) || temConteudo);
    previewUltimoFingerprintRef.current = fingerprintPreviewEstado(
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
      },
      novaPeca: null,
    });
    sincronizarSessaoNuvem(salva);
  }

  function limparWorkspaceChat(opcoes?: {
    areaPref?: AreaIdMinuta;
    manterArea?: boolean;
  }) {
    previewAbortRef.current?.abort();
    if (previewAutoTimerRef.current) {
      clearTimeout(previewAutoTimerRef.current);
      previewAutoTimerRef.current = null;
    }
    const area = opcoes?.areaPref ?? estado.areaId;
    const nova = criarSessaoChatVazia(area);
    setSessaoId(nova.id);
    setMensagens([MSG_BOAS_VINDAS]);
    setEstado(estadoCasoChatVazio(area));
    setAreaManual(Boolean(areaUrl) || Boolean(opcoes?.manterArea));
    setPeca("");
    setPecaHtml("");
    setGeradoPorIA(false);
    setAvisoPreview(null);
    setAjustesFeitos(0);
    setTriagemPreview(null);
    setPayloadPendente(null);
    setErro(null);
    setLastroRedacao(null);
    setMostrarSessoes(false);
    setInput("");
    setPedidoAjuste("");
    previewUltimoFingerprintRef.current = null;
  }

  /** Limpa conversa e preview; grava o caso atual antes. Mantém a área se já estava definida. */
  function reiniciarChatAtual() {
    if (!sessaoTemTrabalho()) {
      setMensagens([{ ...MSG_BOAS_VINDAS, id: idMensagemChat(), ts: Date.now() }]);
      setErro(null);
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
      setInput("");
      return;
    }
    persistirSessaoAtualAgora();
    limparWorkspaceChat({
      areaPref: estado.areaId,
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
    syncNuvemOptIn,
  ]);

  function alternarTimbreEscritorio() {
    const next = { ...escritorio, usarTimbre: !escritorio.usarTimbre };
    setEscritorio(next);
    salvarEscritorioConfig(next);
  }

  const hrefFormulario = hrefMinutaSeExistir(estado.areaId) ?? "/dashboard/jec";

  const podePreview = estado.fatos.trim().length >= 40 && estado.tipoAcao.trim().length > 0;
  const previewFingerprint = useMemo(
    () => fingerprintPreviewEstado(estado, escritorio.usarTimbre),
    [estado, escritorio.usarTimbre]
  );
  const precisaComplementosLastro =
    podePreview &&
    !estado.leiMunicipalTexto.trim() &&
    estado.jurisCaso.length === 0;
  const mostrarPickerTribunais = precisaEscolherTribunais(estado);
  const casoJaOrganizado =
    estado.fatos.trim().length >= 40 && estado.tipoAcao.trim().length > 0;
  const faseEquipe = faseEquipeDeEstados({
    enviando,
    previewLoading,
    triagemLoading,
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
    if (pecaHtml) setAbaMobile("peca");
  }, [pecaHtml]);

  function garantirPolo(): boolean {
    const msg = validarPoloChat(estado);
    if (msg) {
      setErro(msg);
      return false;
    }
    return true;
  }

  function aplicarEspecieReplica() {
    setEstado((e) => ({
      ...e,
      especiePeca: "replica",
    }));
    adicionarMensagem("sistema", "Espécie alterada para réplica à contestação.");
  }

  function confirmarPolo(polo: "ativo" | "passivo") {
    setEstado((e) => ({
      ...e,
      poloAdvocacia: polo,
      poloConfirmado: true,
    }));
    setErro(null);
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

  const executarPreview = useCallback(
    async (opts?: { silencioso?: boolean; forcar?: boolean }) => {
      const e = estadoRef.current;
      const esc = escritorioRef.current;
      const fp = fingerprintPreviewEstado(e, esc.usarTimbre);

      if (!opts?.forcar && fp === previewUltimoFingerprintRef.current) return;

      const pode =
        e.fatos.trim().length >= 40 && e.tipoAcao.trim().length > 0;
      if (!pode) return;
      if (validarPoloChat(e)) return;

      previewAbortRef.current?.abort();
      const ac = new AbortController();
      previewAbortRef.current = ac;

      setPreviewLoading(true);
      if (!opts?.silencioso) setErro(null);

      try {
        const payload = montarPayloadGeracaoChat(e, { atuarLeigo: leigo });
        const res = await fetch("/api/preview-scaffold", {
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
          peca?: string;
          pecaHtml?: string;
          avisoPreview?: string;
        };
        if (ac.signal.aborted) return;
        if (!res.ok || !data.peca || !data.pecaHtml) {
          if (!opts?.silencioso) {
            setErro(data.error ?? "Falha na pré-visualização.");
          }
          return;
        }
        previewUltimoFingerprintRef.current = fp;
        setPeca(data.peca);
        setPecaHtml(data.pecaHtml);
        setGeradoPorIA(false);
        setLastroRedacao(null);
        setAvisoPreview(data.avisoPreview ?? null);
        setEstado((atual) => ({ ...atual, previewVisto: true }));
        if (!opts?.silencioso) {
          adicionarMensagem(
            "sistema",
            "Pré-visualização forense atualizada — estrutura e pedidos na forma final; fundamentação marcada para redação."
          );
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!opts?.silencioso) {
          setErro("Falha de rede na pré-visualização.");
        }
      } finally {
        if (!ac.signal.aborted) setPreviewLoading(false);
      }
    },
    [adicionarMensagem, leigo]
  );

  useEffect(() => {
    if (geradoPorIA || enviando || triagemLoading || redigindo) return;
    if (!podePreview) return;
    if (validarPoloChat(estado)) return;

    if (previewAutoTimerRef.current) clearTimeout(previewAutoTimerRef.current);
    previewAutoTimerRef.current = setTimeout(() => {
      void executarPreview({ silencioso: true });
    }, 500);

    return () => {
      if (previewAutoTimerRef.current) clearTimeout(previewAutoTimerRef.current);
    };
  }, [
    previewFingerprint,
    geradoPorIA,
    enviando,
    triagemLoading,
    redigindo,
    podePreview,
    executarPreview,
    estado,
  ]);

  async function processarArquivos(
    relatoBase: string,
    files: File[]
  ): Promise<{ relato: string; arquivos: ArquivoEnvio[] }> {
    let relatoMaisTexto = relatoBase.trim();
    const payloadArquivos: ArquivoEnvio[] = [];
    for (const file of files.slice(0, 4)) {
      if (file.size > LIMITE_ARQUIVO_LOCAL_BYTES) {
        throw new Error(`“${file.name}” passa de 40 MB.`);
      }
      try {
        const texto = await extrairTextoArquivoLocal(file);
        if (texto.length >= MIN_CHARS_TEXTO_UTIL) {
          relatoMaisTexto = [relatoMaisTexto, `--- ${file.name} ---\n${texto}`]
            .filter(Boolean)
            .join("\n\n");
          continue;
        }
      } catch {
        /* OCR no servidor */
      }
      if (file.size > LIMITE_UPLOAD_ANALISE_BYTES) {
        throw new Error(
          `“${file.name}” parece escaneado e é grande demais para leitura automática. Cole o texto ou envie um PDF mais leve.`
        );
      }
      payloadArquivos.push(await arquivoParaBase64(file));
    }
    return { relato: relatoMaisTexto, arquivos: payloadArquivos };
  }

  async function handleEnviarMensagem() {
    const texto = input.trim();
    if (!texto && arquivos.length === 0) return;
    if (enviando) return;

    setErro(null);
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

    setEnviando(true);
    entradaAbortRef.current?.abort();
    const ac = new AbortController();
    entradaAbortRef.current = ac;

    try {
      const relatoAcumulado = [estado.fatos, texto].filter(Boolean).join("\n\n");
      const { relato, arquivos: payloadArquivos } = await processarArquivos(
        relatoAcumulado,
        filesNow
      );

      if (relato.length < 40 && payloadArquivos.length === 0) {
        setErro("Descreva um pouco mais o caso (mín. ~40 caracteres) ou anexe um documento.");
        return;
      }

      let areaId = estado.areaId;
      if (!areaManual) {
        const inferencia = inferirAreaChat({
          texto: relato,
          preferida: areaUrl,
          leigo,
        });
        areaId = inferencia.areaId;
      }

      const areaFinal = areaManual ? estado.areaId : areaId;
      const preenchimentoLocal = organizarCasoLocal({
        relato,
        areaId: areaFinal,
      });

      setEstado((atual) =>
        aplicarOrganizacaoAoEstadoChat(atual, preenchimentoLocal, {
          areaId: areaFinal,
          relato,
        })
      );

      // ViaCEP gratuito — completa logradouro/bairro/cidade sem cota Gemini
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
          /* ViaCEP indisponível — preview segue com o que o relato trouxe */
        }
      })();

      const complementoSemAnexo =
        casoJaOrganizado && payloadArquivos.length === 0;

      if (complementoSemAnexo) {
        const linhas = [
          preenchimentoLocal.resumoConferencia,
          "*(Complemento integrado — preview atualizado à direita.)*",
          `Área: **${rotuloAreaChat(areaFinal)}**.`,
        ];
        const ufNova =
          preenchimentoLocal.uf?.trim() || estado.comarca.uf?.trim() || "";
        if (
          !ufNova &&
          (estado.tribunaisPreferidos ?? []).length === 0 &&
          !estado.tribunaisDispensados
        ) {
          linhas.push(
            "Sem comarca/UF identificada — escolha **até 3 tribunais** abaixo para priorizar juris na redação."
          );
        }
        adicionarMensagem("assistente", linhas.join("\n\n"));
        setTriagemPreview(null);
        setPayloadPendente(null);
        setErro(null);
        return;
      }

      adicionarMensagem(
        "assistente",
        [
          "Recebi o caso — a pré-visualização à direita já reflete o relato.",
          "O **Analista** está conferindo espécie, teses e pedidos em segundo plano…",
          `Área provável: **${rotuloAreaChat(areaFinal)}**.`,
        ].join("\n\n")
      );

      const timeoutId = window.setTimeout(() => ac.abort(), 90_000);
      try {
        const res = await fetch("/api/entrada-caso", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            relato,
            areaId: areaFinal,
            arquivos: payloadArquivos,
          }),
          signal: ac.signal,
        });
        const data = (await res.json().catch(() => ({}))) as {
          preenchimento?: Parameters<typeof aplicarPreenchimentoAoEstado>[1];
          replicaContestacao?: ReplicaContestacaoResumo | null;
        };

        if (res.ok && data.preenchimento) {
          setEstado((atual) =>
            aplicarOrganizacaoAoEstadoChat(atual, data.preenchimento!, {
              areaId: areaFinal,
              relato,
              replicaContestacao: data.replicaContestacao ?? undefined,
            })
          );
          const linhas = [
            data.preenchimento.resumoConferencia ||
              "Análise detalhada concluída — confira partes e pedidos.",
          ];
          if (data.replicaContestacao?.detectada) {
            linhas.push(
              "Detectei contestação nos autos — espécie sugerida: réplica à contestação."
            );
          }
          adicionarMensagem("assistente", linhas.join("\n\n"));
        } else {
          adicionarMensagem(
            "sistema",
            "Análise detalhada indisponível — o preview usa organização rápida local. Você pode redigir normalmente."
          );
        }
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          console.warn("[chat] entrada-caso:", e);
        }
        adicionarMensagem(
          "sistema",
          "Análise detalhada demorou — mantive a versão rápida do caso. O preview à direita continua válido."
        );
      } finally {
        window.clearTimeout(timeoutId);
      }

      setTriagemPreview(null);
      setPayloadPendente(null);
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao processar mensagem.");
    } finally {
      setEnviando(false);
    }
  }

  async function handleIniciarRedacao(skipTriagem = false) {
    if (!podePreview) {
      setErro("Organize o caso antes de redigir.");
      return;
    }
    if (!garantirPolo()) return;
    if (!estado.previewVisto && !pecaHtml && !skipTriagem) {
      setErro("Aguarde a pré-visualização ou use o link “redigir sem revisar”.");
      return;
    }

    const payload = montarPayloadGeracaoChat(estado, { atuarLeigo: leigo });
    setPayloadPendente(payload);
    setTriagemLoading(true);
    setErro(null);

    try {
      const res = await fetch("/api/triagem-peca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          escritorio: escritorio.usarTimbre ? escritorio : undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        ok?: boolean;
      } & Partial<PreviewTriagemData>;

      if (!res.ok || !data.ok) {
        setErro(data.error ?? "Erro na triagem estratégica.");
        return;
      }

      setTriagemPreview({
        estrategiaJuridica: data.estrategiaJuridica!,
        analiseEstrategica: data.analiseEstrategica!,
        topicos: data.topicos ?? [],
        cobertura: data.cobertura ?? [],
        coberturaResumo: data.coberturaResumo,
        modelo: data.modelo,
        pedidosFormulario: payload.pedidosUsuario,
      });
      adicionarMensagem(
        "assistente",
        "Triagem pronta — revise o plano abaixo e confirme para redigir (1 peça)."
      );
    } catch {
      setErro("Falha de rede na triagem.");
    } finally {
      setTriagemLoading(false);
    }
  }

  async function confirmarRedacao() {
    if (!triagemPreview || !payloadPendente) return;
    setRedigindo(true);
    setErro(null);
    try {
      const res = await fetch("/api/gerar-peca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payloadPendente,
          escritorio: escritorio.usarTimbre ? escritorio : undefined,
          triagemPrecalculada: {
            estrategiaJuridica: triagemPreview.estrategiaJuridica,
            topicos: triagemPreview.topicos,
            cobertura: triagemPreview.cobertura,
            modelo: triagemPreview.modelo ?? "triagem",
            analiseEstrategica: triagemPreview.analiseEstrategica,
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
        const msgPosRedacao = exportacaoTrial
          ? "Peça redigida. Visualize completa à direita; Word/PDF nos planos pagos. Copie o texto para conferência ou peça ajustes abaixo."
          : "Peça redigida. Exporte Word/PDF à direita ou peça ajustes pontuais abaixo.";
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

  function trocarArea(nova: AreaIdMinuta) {
    if (!chatMinutaAreaHabilitada(nova)) return;
    setAreaManual(true);
    setEstado((e) => ({ ...e, areaId: nova }));
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

  const previewTemPeca = Boolean(pecaHtml);
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
            ["peca", previewTemPeca ? "Peça" : "Preview"],
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
                  className={classeBotaoFixarIcone(workspaceFixado, false)}
                >
                  <IconeFixarWorkspace fixado={workspaceFixado} />
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
            <div className="mt-1.5 flex flex-wrap items-center gap-2 rounded-lg border border-amber-600/40 bg-amber-950/30 px-2.5 py-1.5">
              <p className="text-[11px] font-medium text-amber-100">
                Polo — {especieAtual.replace(/-/g, " ")}
              </p>
              {(["ativo", "passivo"] as const).map((polo) => (
                <button
                  key={polo}
                  type="button"
                  onClick={() => confirmarPolo(polo)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${
                    estado.poloConfirmado && estado.poloAdvocacia === polo
                      ? "bg-facto-gold/30 text-amber-50 ring-1 ring-facto-gold/50"
                      : "bg-stone-800 text-stone-200 hover:bg-stone-700"
                  }`}
                >
                  {rotuloPoloAdvocacia(
                    polo,
                    moduloUi.rotuloPoloAtivo,
                    moduloUi.rotuloPoloPassivo
                  )}
                </button>
              ))}
            </div>
          )}
        </header>

        <div
          data-chat-mensagens-scroll
          className={`min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 ${tema.chatScroll}`}
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
            {mensagens.map((m) => (
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
                  <ChatMensagemTexto texto={m.texto} />
                </div>
              </div>
            ))}
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
            {faseEquipe !== "idle" &&
              (!triagemPreview || redigindo || triagemLoading) && (
                <ChatEquipeTrabalhando fase={faseEquipe} />
              )}
            {triagemPreview && (
              <div className="mt-2">
                <PreviewTriagemPeca
                  triagem={triagemPreview}
                  confirmando={redigindo}
                  onConfirmar={() => void confirmarRedacao()}
                  onVoltar={() => setTriagemPreview(null)}
                  onReanalisar={() => void handleIniciarRedacao(true)}
                  rotuloVoltar="Voltar ao chat"
                />
              </div>
            )}
            {podePreview && alertasFatosPedidos.length > 0 && (
              <div className="mt-2">
                <AlertaFatosPedidosChips alertas={alertasFatosPedidos} />
              </div>
            )}
            {dicaPrazo && (
              <div className="mt-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-950">
                <p className="font-semibold">Prazo estimado (conferência)</p>
                <p className="mt-0.5 leading-relaxed">{dicaPrazo.aviso}</p>
              </div>
            )}
            {precisaComplementosLastro && (
              <div
                className={
                  modoWorkspace
                    ? "mt-2 rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-xs text-stone-400 backdrop-blur-sm"
                    : "mt-2 rounded-lg border border-stone-300 bg-white/90 px-3 py-2 text-xs text-stone-700"
                }
              >
                <p>
                  Sem lei municipal nem jurisprudência do caso ainda. Se tiver,
                  abra{" "}
                  <button
                    type="button"
                    className="font-semibold underline underline-offset-2"
                    onClick={() => {
                      setDrawerAba("complementos");
                      setDrawerAberto(true);
                    }}
                  >
                    Provas / lei e juris
                  </button>
                  . A base FACTO continua disponível na redação.
                </p>
              </div>
            )}
            <div ref={fimChatRef} />
          </div>
        </div>

        <div
          className={`max-h-[42vh] shrink-0 overflow-y-auto border-t px-3 py-2.5 sm:px-4 ${tema.chatComposer}`}
        >
          <div className="mx-auto max-w-3xl">
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
                  }));
                  previewUltimoFingerprintRef.current = null;
                }}
                onDispensar={() => {
                  setEstado((e) => ({
                    ...e,
                    tribunaisDispensados: true,
                    tribunaisPreferidos: e.tribunaisPreferidos ?? [],
                  }));
                }}
              />
            </div>
          )}

          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              disabled={triagemLoading || redigindo || !podePreview || previewLoading}
              onClick={() => void handleIniciarRedacao()}
              title="Redigir: inicia a triagem estratégica e gera a peça completa (consome 1 peça da cota). Confira a pré-visualização à direita antes de confirmar."
              className={
                modoWorkspace
                  ? "rounded-md border border-facto-gold/40 bg-facto-gold/20 px-2.5 py-1 text-[11px] font-semibold text-facto-gold transition hover:bg-facto-gold/30 disabled:opacity-50"
                  : "rounded-md bg-stone-800 px-2.5 py-1 text-[11px] font-semibold text-amber-50 hover:bg-stone-700 disabled:opacity-50"
              }
            >
              {triagemLoading ? "Triagem…" : "Redigir (1 peça)"}
            </button>
            <button
              type="button"
              onClick={() => {
                setDrawerAba("resumo");
                setDrawerAberto(true);
              }}
              title="O que entendi: resumo do que o assistente captou (área, partes, pedidos, foro). Revise aqui se algo estiver errado antes de redigir."
              className={
                modoWorkspace
                  ? "rounded-md px-2 py-1 text-[11px] text-stone-400 underline-offset-2 hover:text-facto-gold hover:underline"
                  : "rounded-md px-2 py-1 text-[11px] text-stone-500 underline-offset-2 hover:text-stone-800 hover:underline"
              }
            >
              O que entendi
            </button>
            <button
              type="button"
              onClick={() => {
                setDrawerAba("complementos");
                setDrawerAberto(true);
              }}
              className={
                modoWorkspace
                  ? "rounded-md px-2 py-1 text-[11px] text-stone-400 underline-offset-2 hover:text-facto-gold hover:underline"
                  : "rounded-md px-2 py-1 text-[11px] text-stone-500 underline-offset-2 hover:text-stone-800 hover:underline"
              }
              title="Provas / lei e juris: anexe provas do fato (contrato, print), lei municipal do município e acórdãos/súmulas do seu caso — insumos para a redação, distintos do protocolo."
            >
              Provas / lei e juris
            </button>
            {podePreview && !estado.previewVisto && !pecaHtml && !previewLoading && (
              <button
                type="button"
                onClick={() => void handleIniciarRedacao(true)}
                title="Redigir sem passar pela pré-visualização forense. Ainda consome 1 peça — use só se já conhecer o caso."
                className="text-[11px] text-stone-400 underline-offset-2 hover:underline"
              >
                redigir sem preview
              </button>
            )}
          </div>

          {geradoPorIA && ajustesRestantes > 0 && (
            <div className="mb-2 rounded-lg border border-stone-200 bg-stone-50 p-2.5">
              <p className="text-[11px] font-medium text-stone-700">
                Ajuste de trecho ({ajustesRestantes} restante
                {ajustesRestantes !== 1 ? "s" : ""})
              </p>
              <textarea
                rows={2}
                value={pedidoAjuste}
                onChange={(e) => setPedidoAjuste(e.target.value)}
                placeholder="Ex.: incluir pedido de tutela antecipada no item III"
                className="mt-1.5 w-full rounded-md border border-stone-200 px-2 py-1 text-sm"
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
            <label
              title="Anexar PDF ou Word (até 4 arquivos): e-mail do cliente, autos ou petição. O assistente lê o texto para organizar o caso — não consome cota de peça."
              className={
                modoWorkspace
                  ? "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.06] px-2.5 py-1.5 text-[12px] font-medium text-stone-200 backdrop-blur-sm hover:bg-white/10"
                  : "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-[12px] font-medium text-stone-800 shadow-sm hover:bg-stone-50"
              }
            >
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
                multiple
                className="sr-only"
                onChange={(e) =>
                  setArquivos(Array.from(e.target.files ?? []).slice(0, 4))
                }
              />
              <svg
                viewBox="0 0 24 24"
                className={`h-3.5 w-3.5 shrink-0 ${
                  modoWorkspace ? "text-facto-gold" : "text-stone-700"
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.44 11.05l-8.49 8.49a5.25 5.25 0 01-7.43-7.43l8.84-8.84a3.5 3.5 0 014.95 4.95l-8.84 8.84a1.75 1.75 0 01-2.47-2.47l8.13-8.14"
                />
              </svg>
              Anexar PDF/Word
            </label>
            <BotaoFalarCampo
              disabled={enviando}
              areaId={estado.areaId}
              onIniciarGravacao={() => setErro(null)}
              onErro={setErro}
              onTranscrito={(texto) => {
                setErro(null);
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
              disabled={enviando || previewLoading || triagemLoading || redigindo}
              onClick={() => void handleEnviarMensagem()}
              title="Enviar: manda o relato (e anexos) ao assistente para organizar o caso e montar a pré-visualização. Não redige a peça final — isso é Redigir (1 peça)."
              className={
                modoWorkspace
                  ? "ml-auto rounded-lg bg-facto-gold px-3.5 py-1.5 text-sm font-semibold text-facto-dark transition hover:bg-[#a39a78] disabled:opacity-50"
                  : "ml-auto rounded-lg bg-stone-800 px-3.5 py-1.5 text-sm font-medium text-amber-50 hover:bg-stone-700 disabled:opacity-50"
              }
            >
              {enviando
                ? "Analista…"
                : previewLoading
                  ? "Montando…"
                  : triagemLoading
                    ? "Triagem…"
                    : redigindo
                      ? "Redigindo…"
                      : "Enviar"}
            </button>
          </div>
          {arquivos.length > 0 && (
            <p className="mt-1 text-[11px] text-stone-600">
              Anexos prontos: {arquivos.map((f) => f.name).join(" · ")}
            </p>
          )}
          <p className="mt-1 text-[10px] text-stone-500">
            Lei municipal e acórdão do caso: use{" "}
            <button
              type="button"
              className="font-medium underline underline-offset-2"
              title="Abre o painel de complementos: provas do fato, lei municipal e jurisprudência anexada do caso."
              onClick={() => {
                setDrawerAba("complementos");
                setDrawerAberto(true);
              }}
            >
              Provas / lei e juris
            </button>
            .
          </p>
          </div>
        </div>
      </div>

      {/* Coluna preview */}
      <div
        className={`min-h-0 min-w-0 flex-1 flex-col lg:flex lg:min-h-0 ${previewColCls} ${
          abaMobile === "peca" ? "flex" : "hidden lg:flex"
        }`}
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
                  ? "Pré-visualização forense"
                  : "Documento"}
            </h2>
            <div className="flex flex-wrap items-center gap-1.5">
              {previewLoading && !geradoPorIA && (
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
        <div className={`min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 ${previewBodyCls}`}>
          {pecaHtml ? (
            <div
              className={`w-full space-y-4 transition-opacity duration-300 ${previewLoading && !geradoPorIA ? "opacity-80" : ""}`}
            >
              <PecaDocumentoView
                peca={peca}
                pecaHtml={pecaHtml}
                escritorio={escritorio.usarTimbre ? escritorio : undefined}
                exportacaoBloqueada={exportacaoTrial}
                onCopiarTexto={() => {
                  void navigator.clipboard.writeText(peca);
                }}
              />
              {geradoPorIA && lastroRedacao && (
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
          ) : previewLoading ? (
            <div
              className={`mx-auto flex h-full min-h-[280px] max-w-3xl flex-col justify-center gap-3 rounded-xl border border-dashed p-6 ${previewEmptyCls}`}
              aria-busy="true"
            >
              <div className="space-y-2">
                <div className="h-3 w-3/4 animate-pulse rounded bg-white/20" />
                <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-white/10" />
                <div className="mt-4 h-3 w-2/3 animate-pulse rounded bg-white/20" />
                <div className="h-3 w-full animate-pulse rounded bg-white/10" />
              </div>
              <p className="text-center text-xs text-stone-400">
                Montando estrutura e pedidos na forma do tribunal…
              </p>
            </div>
          ) : (
            <div
              className={`mx-auto flex h-full min-h-[280px] max-w-3xl flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center ${previewEmptyCls}`}
            >
              <p className="text-sm font-medium text-facto-gold">
                A peça aparece aqui na forma do tribunal
              </p>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-stone-400 sm:text-sm">
                Descreva o caso à esquerda — a forma da peça aparece aqui, sem
                consumir cota. Quando confirmar Redigir, a folha recebe a
                fundamentação completa.
              </p>
            </div>
          )}
        </div>
      </div>

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
