/**
 * Comarca editável no chat — avaliação e parse do foro.
 * Uso: npx tsx scripts/testar-comarca-chat.ts
 */
import {
  aplicarTextoForoAoComarca,
  avaliarComarcaChat,
  textoForoEditavel,
} from "../src/lib/comarca-chat";
import { createSuite } from "./casos-ouro/suite";

function main() {
  const { assert, stats } = createSuite();

  assert(
    avaliarComarcaChat({}).nivel === "vazia",
    "comarca vazia"
  );
  assert(
    avaliarComarcaChat({ cidade: "VARA DE ITARARÉ", uf: "SP" }).nivel === "ok",
    "VARA DE ITARARÉ sanea → município ok"
  );
  assert(
    avaliarComarcaChat({ foro: "Juízo da 1ª Vara", cidade: "", uf: "" }).nivel ===
      "suspeita",
    "foro sem município = suspeita"
  );
  assert(
    avaliarComarcaChat({ cidade: "Itararé", uf: "SP" }).nivel === "ok",
    "Itararé/SP ok"
  );

  const aplicado = aplicarTextoForoAoComarca("1ª Vara de Itararé/SP", {});
  assert(/Itarar/i.test(aplicado.cidade ?? ""), "extrai cidade Itararé");
  assert(aplicado.uf === "SP", "extrai UF SP");
  assert(aplicado.numeroJuizado === "1", "extrai vara 1");
  assert(/Itarar/i.test(aplicado.foro ?? ""), "mantém foro");

  const soCidade = aplicarTextoForoAoComarca("Campinas/SP", {});
  assert(soCidade.cidade === "Campinas", "Campinas");
  assert(soCidade.uf === "SP", "SP");

  assert(
    textoForoEditavel({ foro: "Foro de X/SP" }) === "Foro de X/SP",
    "texto editável prefer foro"
  );
  assert(
    textoForoEditavel({ cidade: "Itararé", uf: "SP" }) === "Itararé/SP",
    "fallback cidade/UF"
  );

  const { oks, falhas } = stats();
  console.log(`\n${oks} ok, ${falhas} falhas`);
  if (falhas > 0) process.exit(1);
}

main();
