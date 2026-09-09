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
  montarLastroTopicoExibicao,
  montarLastroTopicoTexto,
} from "../src/lib/ia/plano-lastro-topico";
import type { ItemCoberturaTese } from "../src/lib/ia/cobertura-teses-peca";
import { scoreTrechoVsTopico, LIMIAR_SCORE_TOPICO } from "../src/lib/ia/rag-por-topico";
import type { TrechoConhecimento } from "../src/lib/base-conhecimento";

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

test("montarLastroTopicoExibicao — aviso amber sem ENCAIXE (F4 soft)", () => {
  const ex = montarLastroTopicoExibicao(
    {
      romano: "II",
      titulo: "DO DIREITO",
      subtitulos: [],
      lastro: [{ tipo: "juris", ref: "TJSP — CDC art. 14" }],
    },
    []
  );
  assert.equal(ex.avisoNivel, "amber");
  assert.match(ex.aviso ?? "", /ENCAIXE/);
  assert.equal(ex.lastroUtil, false);
});

test("montarLastroTopicoExibicao — lastro útil com ENCAIXE + juris", () => {
  const ex = montarLastroTopicoExibicao(
    {
      romano: "II",
      titulo: "DO DIREITO",
      subtitulos: [],
      encaixe: "Cobrança sem lastro contratual.",
      lastro: [{ tipo: "juris", ref: "TJSP — CDC art. 14" }],
    },
    []
  );
  assert.equal(ex.aviso, undefined);
  assert.equal(ex.lastroUtil, true);
});

test("scoreTrechoVsTopico — fatos demovem vizinho (F3 soft)", () => {
  const item: TrechoConhecimento = {
    titulo: "TJSP — contrato bancário genérico",
    categoria: "Jurisprudência",
    texto: "Empréstimo consignado e revisão de juros abusivos em contrato bancário.",
  };
  const topico = {
    romano: "II",
    titulo: "DO DANO MORAL",
    subtitulos: [],
    encaixe: "Negativação indevida por dívida inexistente",
  };
  const semFatos = scoreTrechoVsTopico(item, topico);
  const comFatos = scoreTrechoVsTopico(
    item,
    topico,
    "Negativação indevida no Serasa por cobrança de dívida já paga em 2023"
  );
  assert.ok(comFatos < semFatos || comFatos < LIMIAR_SCORE_TOPICO);
});

console.log(`\nLastro tópico A+B: ${ok} ok · ${fail} falha(s)`);
if (fail > 0) process.exit(1);
