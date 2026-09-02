/**
 * Testes — lastro por tópico (camadas A+B).
 */
import assert from "node:assert/strict";
import {
  extrairPlanoTopicos,
  parseLastroLinha,
} from "../src/lib/ia/plano-topicos-peca";
import {
  complementarLastroTopico,
  complementarLastroTopicos,
  extrairBlocoEstrategiaTopico,
  montarLastroTopicoTexto,
} from "../src/lib/ia/plano-lastro-topico";
import type { ItemCoberturaTese } from "../src/lib/ia/cobertura-teses-peca";

let ok = 0;
let fail = 0;

function test(nome: string, fn: () => void) {
  try {
    fn();
    console.log(`  OK: ${nome}`);
    ok++;
  } catch (e) {
    console.error(`  FALHA: ${nome}`, e);
    fail++;
  }
}

test("parseLastroLinha — pipe", () => {
  const itens = parseLastroLinha("LASTRO: relato | fls. 12 | tese dano moral | juris TJSP");
  assert.equal(itens.length, 4);
  assert.equal(itens[0]!.tipo, "relato");
  assert.equal(itens[1]!.tipo, "anexo");
  assert.equal(itens[1]!.ref, "fls. 12");
  assert.equal(itens[2]!.tipo, "tese");
  assert.equal(itens[3]!.tipo, "juris");
});

test("extrairPlanoTopicos — LASTRO e ENCAIXE", () => {
  const texto = `
6. PLANO DE TÓPICOS
I. DOS FATOS
LASTRO: relato | fls. 3
ENCAIXE: O autor foi cobrado indevidamente em 10/03/2024.
II. DO DIREITO
a) DA RESPONSABILIDADE OBJETIVA
LASTRO: CDC art. 14 | tese responsabilidade objetiva
`;
  const topicos = extrairPlanoTopicos(texto);
  assert.equal(topicos.length, 2);
  assert.equal(topicos[0]!.encaixe, "O autor foi cobrado indevidamente em 10/03/2024.");
  assert.ok(topicos[0]!.lastro?.some((l) => l.ref === "fls. 3"));
  assert.ok(topicos[1]!.lastro?.some((l) => l.tipo === "lei"));
});

test("extrairBlocoEstrategiaTopico — entre romanos", () => {
  const texto = `I. DOS FATOS\nNarrativa com fls. 8.\nII. DO DIREITO\nCDC art. 14.`;
  const bloco = extrairBlocoEstrategiaTopico(texto, "I", "II");
  assert.match(bloco, /fls\. 8/);
  assert.doesNotMatch(bloco, /CDC art/);
});

test("complementarLastroTopico — fls do bloco", () => {
  const topicos = [
    { romano: "I", titulo: "DOS FATOS", subtitulos: [] },
    { romano: "II", titulo: "DO DIREITO", subtitulos: [] },
  ];
  const estrategia = `I. DOS FATOS\nRelato do cliente na fls. 15.\nII. DO DIREITO`;
  const cobertura: ItemCoberturaTese[] = [];
  const t = complementarLastroTopico({
    topico: topicos[0]!,
    estrategiaJuridica: estrategia,
    todosTopicos: topicos,
    cobertura,
  });
  assert.ok(t.lastro?.some((l) => l.ref.includes("15")));
});

test("complementarLastroTopicos — juris por título", () => {
  const topicos = [
    {
      romano: "II",
      titulo: "DO DANO MORAL",
      subtitulos: ["DA INDENIZAÇÃO"],
      lastro: [],
    },
  ];
  const cobertura: ItemCoberturaTese[] = [];
  const enriquecidos = complementarLastroTopicos({
    topicos,
    estrategiaJuridica: "II. DO DANO MORAL",
    cobertura,
    jurisTitulos: ["TJSP — Dano moral por negativação"],
  });
  assert.ok(
    enriquecidos[0]!.lastro?.some((l) => l.tipo === "juris" && l.ref.includes("TJSP"))
  );
});

test("montarLastroTopicoTexto — encaixe + fontes", () => {
  const topico = {
    romano: "I",
    titulo: "DOS FATOS",
    subtitulos: [],
    encaixe: "Cobrança indevida.",
    lastro: [
      { tipo: "relato" as const, ref: "relato" },
      { tipo: "anexo" as const, ref: "fls. 3" },
    ],
  };
  const texto = montarLastroTopicoTexto(topico, []);
  assert.match(texto, /Encaixe: Cobrança indevida/);
  assert.match(texto, /Anexo: fls\. 3/);
});

console.log(`\nLastro tópico A+B: ${ok} ok · ${fail} falha(s)`);
if (fail > 0) process.exit(1);
