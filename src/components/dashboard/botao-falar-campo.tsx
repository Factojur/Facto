"use client";

import { useEffect, useRef, useState } from "react";
import { DURACAO_MAX_AUDIO_SEGUNDOS } from "@/lib/transcrever-audio";

type Props = {
  onTranscrito: (texto: string) => void;
  onErro?: (msg: string) => void;
  disabled?: boolean;
};

type Fase = "idle" | "gravando" | "enviando";

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

export function BotaoFalarCampo({ onTranscrito, onErro, disabled }: Props) {
  const [fase, setFase] = useState<Fase>("idle");
  const [segundos, setSegundos] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const limiteRef = useRef<number | null>(null);

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
      recorderRef.current?.state === "recording" && recorderRef.current.stop();
      limparStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só no unmount
  }, []);

  function emitirErro(msg: string) {
    setAviso(msg);
    onErro?.(msg);
  }

  async function enviarBlob(blob: Blob, mimeType: string) {
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
      setAviso(null);
      onTranscrito(data.texto.trim());
    } catch {
      emitirErro("Falha de rede ao transcrever.");
    } finally {
      setFase("idle");
      setSegundos(0);
    }
  }

  function pararGravacao() {
    limparTimers();
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") {
      rec.stop();
    } else {
      limparStream();
      setFase("idle");
    }
  }

  async function iniciarGravacao() {
    setAviso(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      emitirErro("Este navegador não permite microfone. Digite o relato.");
      return;
    }
    const mime = mimeGravacao();
    if (!mime && typeof MediaRecorder === "undefined") {
      emitirErro("Gravação de áudio não está disponível neste navegador.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const rec = new MediaRecorder(
        stream,
        mime ? { mimeType: mime, audioBitsPerSecond: 32_000 } : { audioBitsPerSecond: 32_000 }
      );
      recorderRef.current = rec;
      rec.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      rec.onstop = () => {
        const tipo = rec.mimeType || mime || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: tipo });
        chunksRef.current = [];
        recorderRef.current = null;
        limparStream();
        void enviarBlob(blob, tipo);
      };
      rec.start(250);
      setFase("gravando");
      setSegundos(0);
      timerRef.current = window.setInterval(() => {
        setSegundos((s) => s + 1);
      }, 1000);
      limiteRef.current = window.setTimeout(() => {
        pararGravacao();
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

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => {
          if (fase === "gravando") {
            pararGravacao();
            return;
          }
          if (fase === "idle") void iniciarGravacao();
        }}
        disabled={disabled || fase === "enviando"}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
          fase === "gravando"
            ? "border border-red-300 bg-red-50 text-red-800 hover:bg-red-100"
            : "border border-stone-600 bg-white text-stone-800 hover:bg-stone-50"
        }`}
      >
        {fase === "enviando"
          ? "Transcrevendo…"
          : fase === "gravando"
            ? `Parar · ${formatarSegundos(segundos)}`
            : "Falar"}
      </button>
      {fase === "gravando" ? (
        <span className="text-[11px] text-slate-500">
          Até {Math.floor(DURACAO_MAX_AUDIO_SEGUNDOS / 60)} min. O áudio não é
          gravado — só o texto.
        </span>
      ) : null}
      {aviso ? <span className="text-xs text-red-700">{aviso}</span> : null}
    </div>
  );
}
