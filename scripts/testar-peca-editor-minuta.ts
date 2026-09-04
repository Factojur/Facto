/**
 * Testes: filtro OCR + segmentação ementa/corpo (0 tokens).
 */
import assert from "node:assert/strict";
import { filtrarRuidoOcrRelato } from "../src/lib/filtrar-ruido-ocr-relato";
import {
  contarRefsPeca,
  reconstruirPecaDeSegmentos,
  segmentarPecaEditavel,
} from "../src/lib/peca-blocos-editaveis";

function testFiltroOcr() {
  const bruto = [
    "JEFFERSON DA SILVA RIBEIRO move cumprimento.",
    "De: cliente@outlook.com",
    "Assunto: docs",
    "Página 3 de 40",
    "O juiz fixou astreintes de R$ 100,00.",
    "[cid:image001.png]",
  ].join("\n");
  const limpo = filtrarRuidoOcrRelato(bruto);
  assert.ok(limpo.includes("JEFFERSON"));
  assert.ok(limpo.includes("astreintes"));
  assert.ok(!/Assunto:/i.test(limpo));
  assert.ok(!/Página 3/i.test(limpo));
  assert.ok(!/cid:/i.test(limpo));
  console.log("ok filtro OCR");
}

function testSegmentos() {
  const peca = [
    "EXCELENTÍSSIMO SENHOR DOUTOR JUIZ",
    "",
    "[[ESPACO_1_LINHA]]",
    "I - DO DIREITO",
    "",
    "A multa é devida.",
    "",
    "[[JURIS]]STJ, REsp 123: EMENTA — astreintes vencidas.[[/JURIS]]",
    "",
    "Assim, impõe-se o provimento (fls. 74).",
    "[[ESPACO_1_LINHA]]",
    "Nestes termos,",
    "pede deferimento.",
  ].join("\n");
  const segs = segmentarPecaEditavel(peca);
  assert.ok(segs.some((s) => s.tipo === "ementa" && s.locked));
  assert.ok(segs.some((s) => s.tipo === "corpo" && !s.locked));
  assert.ok(segs.some((s) => s.tipo === "espaco" && s.locked));
  const back = reconstruirPecaDeSegmentos(segs);
  assert.ok(back.includes("[[JURIS]]"));
  assert.ok(back.includes("[[ESPACO_1_LINHA]]"));
  assert.ok(back.includes("fls. 74"));
  assert.ok(back.includes("Nestes termos"));
  const refs = contarRefsPeca(peca);
  assert.equal(refs.fls, 1);
  assert.ok(refs.ementas >= 1);
  console.log("ok segmentos ementa/corpo/espaco");
}

testFiltroOcr();
testSegmentos();
console.log("todos ok");
