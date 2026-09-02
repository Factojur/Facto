/**
 * Refino de área — casos determinísticos.
 * Uso: npx tsx scripts/testar-inferir-area-refino.ts
 */
import {
  inferirAreaChatDetalhado,
  type InferenciaAreaDetalhada,
} from "../src/lib/chat-minuta";
import {
  candidatasParaRefinoArea,
  motivoAreaAposOrganizacao,
  precisaRefinoAreaIa,
} from "../src/lib/inferir-area-refino";
import { createSuite } from "./casos-ouro/suite";

function main() {
  const { assert, stats } = createSuite();

  const claro = inferirAreaChatDetalhado({
    texto:
      "Reclamação trabalhista. Reclamante contra Empresa XYZ. Horas extras e FGTS.",
  });
  assert(claro.inferencia.areaId === "trabalhista", "trabalhista claro");
  assert(!precisaRefinoAreaIa(claro), "trabalhista claro não pede IA");

  const ambiguo: InferenciaAreaDetalhada = {
    inferencia: {
      areaId: "consumidor",
      confianca: "media",
      alternativas: ["civil"],
    },
    ordenado: [
      { areaId: "consumidor", score: 2 },
      { areaId: "civil", score: 2 },
    ],
  };
  assert(precisaRefinoAreaIa(ambiguo), "empate pede IA");
  assert(
    candidatasParaRefinoArea(ambiguo).includes("consumidor"),
    "candidatas incluem top"
  );

  const motivo = motivoAreaAposOrganizacao({
    areaInferida: "jec",
    areaResolvida: "constitucional",
    especiePeca: "mandado-seguranca",
    ultimoAto: "Decisão sobre astreintes",
  });
  assert(Boolean(motivo?.includes("mandado")), "motivo remédio MS");

  const { oks, falhas } = stats();
  console.log(`\nInferir área refino: ${oks} ok · ${falhas} falha(s)`);
  if (falhas > 0) process.exit(1);
}

main();
