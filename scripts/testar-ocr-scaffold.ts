/**
 * Testes: extração OCR → partes/comarca + checklist de conferência (0 tokens).
 */
import assert from "node:assert/strict";
import { extrairDadosOcr, mesclarDadosOcrNoEstado } from "../src/lib/extrair-dados-ocr";
import { conferirPecaAntesDeProtocolar } from "../src/lib/checklist-conferencia-peca";
import { ESTILO_FOLHA_A4 } from "../src/lib/estilo-folha-a4";
import { autoresAPartirDosNomes, reusAPartirDosNomes } from "../src/lib/partes-ja-qualificadas";

function testOcrCapaProcesso() {
  const texto = `
Processo nº 0006509-12.2024.8.26.0100
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA 2ª VARA CÍVEL
DA COMARCA DE SÃO PAULO

Autor: MARIA SILVA SANTOS
Réu: INSS

Valor da causa: R$ 15.000,00
Ante o exposto, INDEFIRO o pedido de tutela.
  `;
  const ocr = extrairDadosOcr(texto);
  assert.equal(ocr.numeroProcesso, "0006509-12.2024.8.26.0100");
  assert.ok(ocr.autores.some((a) => /maria silva/i.test(a)));
  assert.ok(ocr.reus.some((r) => /inss/i.test(r)));
  assert.ok(ocr.uf === "SP" || /paulo/i.test(ocr.foro ?? ""));
  assert.ok(!ocr.autores.some((a) => /considerando/i.test(a)));

  const autores = autoresAPartirDosNomes(ocr.autores.join("; "));
  const reus = reusAPartirDosNomes(ocr.reus.join("; "));
  assert.ok(autores[0]?.nomeCompleto);
  assert.ok(reus.length >= 1);

  const patch = mesclarDadosOcrNoEstado(
    {
      comarca: {} as { foro?: string; uf?: string; numeroProcesso?: string },
      autoresNomes: [] as string[],
      reusNomes: [] as string[],
      tipoAcao: "",
    },
    ocr
  );
  assert.ok(patch.autoresNomes?.length);
  assert.ok(
    (patch.comarca as { numeroProcesso?: string } | undefined)?.numeroProcesso
  );
  console.log("ok OCR capa + AutorValue");
}

function testChecklistPlaceholder() {
  const peca = `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO
[NOME COMPLETO DO(A) RÉU(RÉ)], [qualificação completa]
I - DOS FATOS
O autor alega o corte de energia.
II - DO DIREITO
Aplica-se o CDC.
III - DOS PEDIDOS
Requer a procedência.`;
  const itens = conferirPecaAntesDeProtocolar({
    peca,
    areaId: "jec",
    modoScaffold: true,
  });
  assert.ok(itens.some((i) => i.id === "placeholder"));
  console.log("ok checklist placeholder");
}

function testEstiloA4() {
  assert.equal(ESTILO_FOLHA_A4.fontSize, "12pt");
  assert.ok(String(ESTILO_FOLHA_A4.padding).includes("3cm"));
  assert.ok(String(ESTILO_FOLHA_A4.padding).includes("2cm"));
  console.log("ok estilo A4 = PDF");
}

testOcrCapaProcesso();
testChecklistPlaceholder();
testEstiloA4();
console.log("todos ok");
