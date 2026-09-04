/**
 * Testes — casamento ementa × juris do caso / base FACTO (0 tokens).
 */
import assert from "node:assert/strict";
import {
  casarEmentaComFontes,
  extrairCnjs,
} from "../src/lib/casar-juris-caso-peca";

function main() {
  assert.deepEqual(
    extrairCnjs("Proc. 1000011-77.2025.8.26.0279 e outro"),
    ["10000117720258260279"],
    "extrai CNJ"
  );

  const cnj = "1000011-77.2025.8.26.0279";
  const matchCnj = casarEmentaComFontes(
    `TJSP, Apelação ${cnj}. Ementa: alimentos.`,
    [
      {
        id: "1",
        titulo: `TJSP — Apelação ${cnj}`,
        texto: "Alimentos provisórios…",
      },
    ]
  );
  assert(matchCnj?.confianca === "alta", "CNJ = alta");
  assert(matchCnj?.origem === "juris_caso", "origem anexo");
  assert(matchCnj?.fonte.id === "1", "fonte certa");

  const matchTitulo = casarEmentaComFontes(
    "Súmula 479 do STJ: as instituições financeiras respondem…",
    [{ id: "s", titulo: "Súmula 479 STJ", texto: "instituições financeiras" }]
  );
  assert(matchTitulo, "casa por título/texto");
  assert(matchTitulo!.origem === "juris_caso", "anexo");

  const matchBase = casarEmentaComFontes(
    "Conforme Apelação Cível 1234567-89.2020.8.26.0100…",
    [],
    [
      {
        id: "b",
        titulo: "TJSP Apelação Cível 1234567-89.2020.8.26.0100",
        categoria: "julgado",
      },
    ]
  );
  assert(matchBase?.origem === "base_facto", "base FACTO");
  assert(matchBase?.confianca === "alta", "CNJ base alta");

  const sem = casarEmentaComFontes("Texto sem referência a julgado.", [
    { id: "x", titulo: "Outro acórdão", texto: "nada a ver" },
  ]);
  assert.equal(sem, null, "sem casamento");

  console.log("testar-casar-juris-caso: ok");
}

main();
