/**
 * Limite em memória (0 tokens).
 * Uso: npx tsx scripts/testar-rate-limit-memoria.ts
 */
import {
  dentroDoLimite,
  limparLimiteMemoria,
} from "../src/lib/rate-limit-memoria";
import { createSuite } from "./casos-ouro/suite";

function main() {
  limparLimiteMemoria();
  const { assert, stats } = createSuite();

  assert(
    dentroDoLimite({ chave: "u1", max: 2, janelaMs: 60_000 }),
    "1ª chamada cabe"
  );
  assert(
    dentroDoLimite({ chave: "u1", max: 2, janelaMs: 60_000 }),
    "2ª chamada cabe"
  );
  assert(
    !dentroDoLimite({ chave: "u1", max: 2, janelaMs: 60_000 }),
    "3ª chamada na mesma janela é recusada"
  );
  assert(
    dentroDoLimite({ chave: "u2", max: 2, janelaMs: 60_000 }),
    "outro usuário não compartilha a janela"
  );

  const { oks, falhas } = stats();
  console.log(`\n${oks} ok, ${falhas} falha(s)`);
  if (falhas > 0) process.exit(1);
}

main();
