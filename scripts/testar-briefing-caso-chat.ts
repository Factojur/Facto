/**
 * Teste — ponte Meus casos → assistente (briefing one-shot).
 */
import assert from "node:assert/strict";
import {
  BRIEFING_CASO_CHAT_KEY,
  consumirBriefingCasoChat,
  gravarBriefingCasoChat,
} from "../src/lib/briefing-caso-chat";

const mem = new Map<string, string>();
(globalThis as { sessionStorage?: Storage }).sessionStorage = {
  getItem: (k) => mem.get(k) ?? null,
  setItem: (k, v) => {
    mem.set(k, String(v));
  },
  removeItem: (k) => {
    mem.delete(k);
  },
  clear: () => mem.clear(),
  key: () => null,
  get length() {
    return mem.size;
  },
};

function main() {
  gravarBriefingCasoChat({
    origem: "jec_casos",
    titulo: "Caso teste",
    areaId: "jec",
    especie: "peticao-inicial",
    fatos: "Cliente cobrado indevidamente.",
  });
  assert(mem.has(BRIEFING_CASO_CHAT_KEY), "gravou");
  const b = consumirBriefingCasoChat();
  assert(b?.titulo === "Caso teste", "leu titulo");
  assert(b?.especie === "peticao-inicial", "leu especie");
  assert.equal(consumirBriefingCasoChat(), null, "one-shot");
  console.log("testar-briefing-caso-chat: ok");
}

main();
