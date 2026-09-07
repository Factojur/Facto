/**
 * Esclarecimento mínimo (peça + polo) — 0 tokens.
 * Uso: npx tsx scripts/testar-chat-esclarecimento.ts
 */
import { estadoCasoChatVazio } from "../src/lib/chat-minuta";
import {
  mensagemEsclarecimentoChat,
  precisaEsclarecimentoMinimoChat,
  opcoesEspecieEsclarecimentoChat,
} from "../src/lib/chat-esclarecimento-peca";
import { createSuite } from "./casos-ouro/suite";

function main() {
  const { assert, stats } = createSuite();
  const vazio = estadoCasoChatVazio("civil");
  assert(precisaEsclarecimentoMinimoChat(vazio), "vazio precisa esclarecer");
  assert(/peça|polo/i.test(mensagemEsclarecimentoChat(vazio)), "mensagem cobre peça/polo");

  const comEspecie = {
    ...vazio,
    especiePeca: "agravo-instrumento",
    tipoAcao: "Agravo de instrumento",
  };
  assert(precisaEsclarecimentoMinimoChat(comEspecie), "só espécie ainda pede polo");

  const completo = {
    ...comEspecie,
    poloAdvocacia: "ativo" as const,
    poloConfirmado: true,
  };
  assert(!precisaEsclarecimentoMinimoChat(completo), "peça+polo ok");

  const ops = opcoesEspecieEsclarecimentoChat(comEspecie);
  assert(ops[0]?.id === "agravo-instrumento", "espécie atual no topo das opções");
  assert(ops.length >= 8, "lista mínima de remédios");

  const { oks, falhas } = stats();
  console.log(`\n${oks} ok, ${falhas} falhas`);
  if (falhas > 0) process.exit(1);
}

main();
