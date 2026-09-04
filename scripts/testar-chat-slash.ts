/**
 * Testes locais da paleta `/` (0 tokens).
 */
import {
  extrairSlashAtivo,
  filtrarSlashComandos,
  SLASH_COMANDOS_FACTO,
} from "../src/lib/chat-slash-comandos";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
  console.log(`  OK: ${msg}`);
}

assert(SLASH_COMANDOS_FACTO.length >= 10, "catálogo mínimo de comandos");
assert(
  filtrarSlashComandos("contesta")[0]?.especieId === "contestacao",
  "filtra contestação"
);
assert(filtrarSlashComandos("minuta")[0]?.acao === "criar_minuta", "atalho minuta");
assert(extrairSlashAtivo("olá /cont")?.query === "cont", "detecta slash no fim");
assert(extrairSlashAtivo("sem barra") === null, "sem slash → null");
assert(filtrarSlashComandos("zzzzinexistente").length === 0, "query vazia de match");

console.log("\nSlash OK");
