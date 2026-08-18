/** Transcrição de voz para o campo de texto — sem gravar arquivo e sem cota de análise. */

export const DURACAO_MAX_AUDIO_SEGUNDOS = 180;
export const LIMITE_AUDIO_TRANSCRICAO_BYTES = 3_500_000;

const MIMES_AUDIO = [
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/mp3",
  "audio/ogg",
  "audio/wav",
  "audio/flac",
  "audio/aac",
  "audio/x-m4a",
] as const;

export function mimeAudioPermitido(raw: string): string | null {
  const m = String(raw ?? "")
    .trim()
    .toLowerCase()
    .split(";")[0]
    ?.trim();
  if (!m) return null;
  if ((MIMES_AUDIO as readonly string[]).includes(m)) return m;
  if (m === "audio/wave") return "audio/wav";
  return null;
}

/** Acrescenta a transcrição ao que já está no campo. */
export function juntarTranscricao(atual: string, novo: string): string {
  const a = atual.replace(/\s+$/, "");
  const n = novo.trim();
  if (!n) return atual;
  if (!a.trim()) return n;
  return `${a}\n\n${n}`;
}
