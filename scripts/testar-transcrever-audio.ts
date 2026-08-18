/**
 * Transcrição de voz: mime e junção no campo (0 tokens).
 * Uso: npx tsx scripts/testar-transcrever-audio.ts
 */
import {
  juntarTranscricao,
  mimeAudioPermitido,
} from "../src/lib/transcrever-audio";
import { createSuite } from "./casos-ouro/suite";

function main() {
  const { assert, stats } = createSuite();

  assert(mimeAudioPermitido("audio/webm") === "audio/webm", "webm ok");
  assert(
    mimeAudioPermitido("audio/webm;codecs=opus") === "audio/webm",
    "descarta codec do mime"
  );
  assert(mimeAudioPermitido("audio/mp4") === "audio/mp4", "mp4 ok");
  assert(mimeAudioPermitido("audio/wave") === "audio/wav", "wave → wav");
  assert(mimeAudioPermitido("video/webm") === null, "vídeo recusado");
  assert(mimeAudioPermitido("application/pdf") === null, "pdf recusado");

  assert(
    juntarTranscricao("", "Cliente comprou notebook.") ===
      "Cliente comprou notebook.",
    "campo vazio recebe a transcrição"
  );
  assert(
    juntarTranscricao("Já havia um parágrafo.", "A loja recusou a devolução.") ===
      "Já havia um parágrafo.\n\nA loja recusou a devolução.",
    "campo preenchido anexa com linha em branco"
  );
  assert(
    juntarTranscricao("texto  \n", "") === "texto  \n",
    "transcrição vazia não altera o campo"
  );

  const { oks, falhas } = stats();
  console.log(`\n${oks} ok, ${falhas} falha(s)`);
  if (falhas > 0) process.exit(1);
}

main();
