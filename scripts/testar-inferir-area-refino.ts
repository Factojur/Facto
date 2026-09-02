/**
 * Interpretação IA — sempre preferida; local = pista.
 * Uso: npx tsx scripts/testar-inferir-area-refino.ts
 */
import {
  inferirAreaChatDetalhado,
  type InferenciaAreaDetalhada,
} from "../src/lib/chat-minuta";
import {
  candidatasParaRefinoArea,
  motivoAreaAposOrganizacao,
  precisaInterpretacaoCasoIa,
} from "../src/lib/inferir-area-refino";
import { createSuite } from "./casos-ouro/suite";

function main() {
  const { assert, stats } = createSuite();

  const claro = inferirAreaChatDetalhado({
    texto:
      "Reclamação trabalhista. Reclamante contra Empresa XYZ. Horas extras e FGTS.",
  });
  assert(claro.inferencia.areaId === "trabalhista", "trabalhista claro");
  assert(
    precisaInterpretacaoCasoIa(claro),
    "mesmo claro: IA interpreta (MinutaIA-style)"
  );

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
  assert(precisaInterpretacaoCasoIa(ambiguo), "empate pede IA");
  assert(
    candidatasParaRefinoArea(ambiguo).includes("consumidor"),
    "candidatas incluem top"
  );
  assert(
    candidatasParaRefinoArea(ambiguo).length >= 5,
    "candidatas amplas (todas as áreas fase 1)"
  );

  const motivo = motivoAreaAposOrganizacao({
    areaInferida: "jec",
    areaResolvida: "civil",
    especiePeca: "agravo-instrumento",
    ultimoAto: "Decisão sobre astreintes",
  });
  assert(Boolean(motivo?.includes("agravo")), "motivo remédio agravo");

  const { oks, falhas } = stats();
  console.log(`\nInferir área refino: ${oks} ok · ${falhas} falha(s)`);
  if (falhas > 0) process.exit(1);
}

main();
