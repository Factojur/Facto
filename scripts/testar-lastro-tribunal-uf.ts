/**
 * Filtro de lastro por UF / tribunal + regra de citação (regressão).
 * Uso: npx tsx scripts/testar-lastro-tribunal-uf.ts
 */
import {
  inferirSlugTribunalDoTexto,
  lastroTribunalEstadualAlheio,
  bonusAfinidadeUfComarca,
} from "../src/lib/juris-provedores/tribunais-opcoes";
import { createSuite } from "./casos-ouro/suite";

function main() {
  const { assert, stats } = createSuite();

  assert(
    inferirSlugTribunalDoTexto("TJSP — Apelação", "Jurisprudência") === "tjsp",
    "infere TJSP"
  );
  assert(
    inferirSlugTribunalDoTexto("STJ", "Súmula", "Recurso Especial") === "stj",
    "infere STJ"
  );
  assert(
    inferirSlugTribunalDoTexto("TRF3", "Jurisprudência") === "trf3",
    "infere TRF3"
  );

  assert(
    lastroTribunalEstadualAlheio({
      titulo: "TJMG Apelação Cível",
      categoria: "Jurisprudência",
      texto: "EMENTA: …",
      ufComarca: "SP",
    }) === true,
    "TJMG é alheio a foro SP"
  );
  assert(
    lastroTribunalEstadualAlheio({
      titulo: "TJSP Apelação Cível",
      categoria: "Jurisprudência",
      texto: "EMENTA: …",
      ufComarca: "SP",
    }) === false,
    "TJSP ok em foro SP"
  );
  assert(
    lastroTribunalEstadualAlheio({
      titulo: "STJ REsp",
      categoria: "Jurisprudência",
      texto: "EMENTA: …",
      ufComarca: "SP",
    }) === false,
    "STJ ok em qualquer UF"
  );
  assert(
    lastroTribunalEstadualAlheio({
      titulo: "TJMG",
      categoria: "Jurisprudência",
      texto: "…",
      tribunais: ["tjsp", "stj"],
      ufComarca: "SP",
    }) === true,
    "seleção TJSP+STJ bloqueia TJMG"
  );
  assert(
    lastroTribunalEstadualAlheio({
      titulo: "TJBA",
      categoria: "Jurisprudência",
      texto: "…",
      ufComarca: null,
      tribunais: [],
    }) === false,
    "sem UF/tribunais: não descarta no escuro"
  );

  const bonusAlheio = bonusAfinidadeUfComarca({
    titulo: "TJPR",
    categoria: "Jurisprudência",
    texto: "…",
    ufComarca: "SP",
  });
  assert(bonusAlheio <= -40, "penalidade forte a TJ alheio");

  const s = stats();
  console.log(`\n${s.oks} ok, ${s.falhas} falhas`);
  process.exit(s.falhas ? 1 : 0);
}

main();
