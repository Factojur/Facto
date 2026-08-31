"use client";

import { useEffect, useRef, useState } from "react";
import {
  DURACAO_MAX_AUDIO_SEGUNDOS,
  DURACAO_MIN_AUDIO_SEGUNDOS,
} from "@/lib/transcrever-audio";

type Props = {
  onTranscrito: (texto: string) => void;
  onErro?: (msg: string) => void;
  /** Chamado ao iniciar nova gravação (ex.: limpar aviso anterior no pai). */
  onIniciarGravacao?: () => void;
  disabled?: boolean;
  areaId?: string;
  className?: string;
};

type Fase = "idle" | "gravando" | "enviando";

/** Mínimo de bytes no blob antes de enviar (cabeçalho WebM/M4A vazio ≈ poucos bytes). */
const MIN_BLOB_BYTES = 800;

function mimeGravacao(): string {
  const tipos = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  if (typeof MediaRecorder === "undefined") return "";
  return tipos.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

function formatarSegundos(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function IconeMicrofone({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function IconeParar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function IconeCarregando({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${className ?? ""}`}
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/** Garante que o último chunk do MediaRecorder entre antes de montar o Blob. */
function blobAoParar(rec: MediaRecorder, mimeFallback: string): Promise<Blob> {
  return new Promise((resolve) => {
    const chunks: Blob[] = [];
    const onData = (ev: BlobEvent) => {
      if (ev.data?.size) chunks.push(ev.data);
    };
    rec.addEventListener("dataavailable", onData);
    rec.addEventListener(
      "stop",
      () => {
        rec.removeEventListener("dataavailable", onData);
        const tipo = rec.mimeType || mimeFallback || "audio/webm";
        window.setTimeout(() => {
          resolve(new Blob(chunks, { type: tipo }));
        }, 120);
      },
      { once: true }
    );
    try {
      if (rec.state === "recording") rec.requestData();
    } catch {
      /* requestData nem sempre existe */
    }
    rec.stop();
  });
}

export function BotaoFalarCampo({
  onTranscrito,
  onErro,
  onIniciarGravacao,
  disabled,
  areaId,
  className,
}: Props) {
  const [fase, setFase] = useState<Fase>("idle");
  const [segundos, setSegundos] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const limiteRef = useRef<number | null>(null);
  const segundosRef = useRef(0);
  const mimeRef = useRef("");
  const parandoRef = useRef(false);

  function limparStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function limparTimers() {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (limiteRef.current != null) {
      window.clearTimeout(limiteRef.current);
      limiteRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      limparTimers();
      if (recorderRef.current?.state === "recording") {
        try {
          recorderRef.current.stop();
        } catch {
          /* unmount */
        }
      }
      limparStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só no unmount
  }, []);

  function emitirErro(msg: string) {
    onErro?.(msg);
  }

  async function enviarBlob(blob: Blob, mimeType: string) {
    if (blob.size < MIN_BLOB_BYTES) {
      emitirErro(
        "O microfone não captou áudio (arquivo vazio). Confira o dispositivo de entrada nas configurações do Windows/navegador e tente de novo."
      );
      return;
    }
    setFase("enviando");
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => {
          const s = String(r.result ?? "");
          resolve(s.replace(/^data:[^;]+;base64,/, ""));
        };
        r.onerror = () => reject(new Error("Falha ao ler o áudio."));
        r.readAsDataURL(blob);
      });
      const res = await fetch("/api/transcrever-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mimeType: mimeType.split(";")[0] || "audio/webm",
          base64,
          areaId,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        texto?: string;
        error?: string;
      };
      if (!res.ok || !data.texto?.trim()) {
        emitirErro(data.error ?? "Não foi possível transcrever.");
        return;
      }
      onTranscrito(data.texto.trim());
    } catch {
      emitirErro("Falha de rede ao transcrever.");
    } finally {
      setFase("idle");
      setSegundos(0);
      segundosRef.current = 0;
    }
  }

  async function pararGravacao() {
    if (parandoRef.current) return;
    parandoRef.current = true;
    limparTimers();
    const rec = recorderRef.current;
    const duracao = segundosRef.current;
    const mime = mimeRef.current;

    if (!rec || rec.state === "inactive") {
      limparStream();
      setFase("idle");
      parandoRef.current = false;
      return;
    }

    setFase("enviando");
    try {
      const blob = await blobAoParar(rec, mime);
      recorderRef.current = null;
      limparStream();

      if (duracao < DURACAO_MIN_AUDIO_SEGUNDOS) {
        emitirErro(
          `Fale pelo menos ${DURACAO_MIN_AUDIO_SEGUNDOS} segundos antes de parar.`
        );
        setFase("idle");
        setSegundos(0);
        segundosRef.current = 0;
        return;
      }

      const tipo = blob.type || mime || "audio/webm";
      await enviarBlob(blob, tipo);
    } catch {
      emitirErro("Não foi possível finalizar a gravação.");
      setFase("idle");
      setSegundos(0);
      segundosRef.current = 0;
    } finally {
      parandoRef.current = false;
    }
  }

  async function iniciarGravacao() {
    onIniciarGravacao?.();
    parandoRef.current = false;
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      emitirErro("Este navegador não permite microfone. Digite o relato.");
      return;
    }
    const mime = mimeGravacao();
    if (!mime && typeof MediaRecorder === "undefined") {
      emitirErro("Gravação de áudio não disponível neste navegador.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;
      mimeRef.current = mime;
      const rec = new MediaRecorder(
        stream,
        mime ? { mimeType: mime, audioBitsPerSecond: 64_000 } : undefined
      );
      recorderRef.current = rec;
      /* Sem timeslice: um blob completo no stop — mais confiável no Edge/Chrome Windows. */
      rec.start();
      setFase("gravando");
      setSegundos(0);
      segundosRef.current = 0;
      timerRef.current = window.setInterval(() => {
        segundosRef.current += 1;
        setSegundos((s) => s + 1);
      }, 1000);
      limiteRef.current = window.setTimeout(() => {
        void pararGravacao();
      }, DURACAO_MAX_AUDIO_SEGUNDOS * 1000);
    } catch (erro) {
      limparStream();
      const nome = erro instanceof DOMException ? erro.name : "";
      if (nome === "NotAllowedError" || nome === "PermissionDeniedError") {
        emitirErro("Permita o microfone no navegador para falar o caso.");
        return;
      }
      emitirErro("Não foi possível abrir o microfone.");
    }
  }

  const labelParado =
    "Falar: dicte o caso no microfone. O FACTO transcreve para o campo de texto (não grava o áudio, não consome peça). Confira nomes e números antes de Enviar.";
  const labelGravando = `Parar gravação · ${formatarSegundos(segundos)}`;
  const labelGravandoDetalhe = `Até ${Math.floor(DURACAO_MAX_AUDIO_SEGUNDOS / 60)} min · mín. ${DURACAO_MIN_AUDIO_SEGUNDOS}s. O áudio não é gravado — só o texto.`;

  const estiloBase =
    "inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-60";
  const estiloFase =
    fase === "gravando"
      ? "border-red-300 bg-red-50 text-red-800 hover:bg-red-100"
      : fase === "enviando"
        ? "border-slate-200 bg-slate-50 text-slate-600"
        : "border-stone-600 bg-white hover:bg-stone-50";

  return (
    <button
      type="button"
      onClick={() => {
        if (fase === "gravando") {
          void pararGravacao();
          return;
        }
        if (fase === "idle") void iniciarGravacao();
      }}
      disabled={disabled || fase === "enviando"}
      aria-label={
        fase === "enviando"
          ? "Transcrevendo áudio"
          : fase === "gravando"
            ? labelGravando
            : labelParado
      }
      title={
        fase === "enviando"
          ? "Transcrevendo…"
          : fase === "gravando"
            ? `${labelGravando}\n${labelGravandoDetalhe}`
            : labelParado
      }
      className={`${estiloBase} ${estiloFase} ${className ?? ""}`}
    >
      {fase === "enviando" ? (
        <IconeCarregando className="h-4 w-4 shrink-0" />
      ) : fase === "gravando" ? (
        <IconeParar className="h-4 w-4 shrink-0" />
      ) : (
        <IconeMicrofone className="h-4 w-4 shrink-0 text-[#8a8466]" />
      )}
    </button>
  );
}
