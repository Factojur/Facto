/**
 * Paginação preview A4 (ABNT residual) + tipografia.
 * Uso: npx tsx scripts/testar-peca-paginas-preview.ts
 */
import {
  dividirPecaEmPaginas,
  estimarLinhasBloco,
  LINHAS_POR_PAGINA,
} from "../src/lib/peca-paginas-preview";
import { MARCADOR_ESPACO_6 } from "../src/lib/formatacao-forense";
import { createSuite } from "./casos-ouro/suite";

function main() {
  const { assert, stats } = createSuite();

  assert(LINHAS_POR_PAGINA >= 28 && LINHAS_POR_PAGINA <= 42, "linhas/página na faixa A4");

  const titulo = "I - DOS FATOS";
  const corpo =
    "O autor relata os fatos com detalhe suficiente para ocupar várias linhas tipográficas na folha A4 com Times 12 e entrelinha 1,5, de modo a exercitar o estimador de linhas do preview paginado.";
  assert(estimarLinhasBloco(titulo) >= 1, "título ≥ 1 linha");
  assert(estimarLinhasBloco(corpo) >= 2, "parágrafo longo ≥ 2 linhas");
  assert(estimarLinhasBloco(MARCADOR_ESPACO_6) === 6, "marcador 6 linhas");

  // Título no fim da página não fica órfão: leva o próximo bloco
  const pecaCurta = [
    "A".repeat(80),
    "B".repeat(80),
    "C".repeat(80),
    "I - DOS FATOS",
    "Parágrafo imediatamente após o título romano.",
  ].join("\n\n");
  // Força página pequena para exercitar o anti-órfão
  const pags = dividirPecaEmPaginas(pecaCurta, 8);
  const paginaComTitulo = pags.find((p) => p.some((b) => /DOS FATOS/.test(b)));
  assert(Boolean(paginaComTitulo), "há página com DOS FATOS");
  const idx = paginaComTitulo!.findIndex((b) => /DOS FATOS/.test(b));
  assert(
    idx >= 0 && idx < paginaComTitulo!.length - 1,
    "título DOS FATOS não fica sozinho no fim da página"
  );
  assert(
    /Parágrafo imediatamente/.test(paginaComTitulo![idx + 1]!),
    "próximo parágrafo acompanha o título"
  );

  const pecaLonga = Array.from({ length: 40 }, (_, i) =>
    `Parágrafo ${i + 1}. ${"texto forense ".repeat(12)}`
  ).join("\n\n");
  const muitas = dividirPecaEmPaginas(pecaLonga);
  assert(muitas.length >= 2, "peça longa gera ≥ 2 folhas");
  assert(
    muitas.every((p) => p.length > 0),
    "nenhuma página vazia"
  );

  const { oks, falhas } = stats();
  console.log(`\n${oks} ok, ${falhas} falhas`);
  if (falhas > 0) process.exit(1);
}

main();
