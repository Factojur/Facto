/**
 * ABNT / NBR 14724 — formatação geral da página (item 1).
 * Uso: npx tsx scripts/testar-formatacao-pagina-abnt.ts
 */
import {
  FORMATACAO_FORENSE,
  alturaLinhaCorpoMm,
  alturaLinhasMm,
  tamanhoPapelA4Twips,
} from "../src/lib/formatacao-forense";
import { createSuite } from "./casos-ouro/suite";

function main() {
  const { assert, stats } = createSuite();
  const f = FORMATACAO_FORENSE;

  assert(f.papelLarguraMm === 210, "A4 largura 210 mm");
  assert(f.papelAlturaMm === 297, "A4 altura 297 mm");
  assert(f.margemSuperiorCm === 3, "margem superior 3 cm");
  assert(f.margemEsquerdaCm === 3, "margem esquerda 3 cm");
  assert(f.margemInferiorCm === 2, "margem inferior 2 cm");
  assert(f.margemDireitaCm === 2, "margem direita 2 cm");
  assert(f.entrelinhas === 1.5, "entrelinha 1,5");

  const linha = alturaLinhaCorpoMm();
  assert(Math.abs(linha - 6.35) < 0.02, "altura linha ≈ 6,35 mm (12pt×1,5)");
  assert(
    Math.abs(alturaLinhasMm(2) - linha * 2) < 0.001,
    "alturaLinhasMm = N × linha"
  );

  const a4 = tamanhoPapelA4Twips();
  assert(a4.width === Math.round(21 * 567), "A4 width twips");
  assert(a4.height === Math.round(29.7 * 567), "A4 height twips");

  // Citação longa NBR 10520: recuo ~4 cm, fonte menor, entrelinha simples.
  assert(f.recuoCitacaoCm === 4, `recuo citação: esperado 4 cm, obtido ${f.recuoCitacaoCm}`);
  assert(f.tamanhoCitacaoPt === 10, `fonte citação: esperado 10 pt, obtido ${f.tamanhoCitacaoPt}`);
  assert(f.entrelinhasCitacao === 1, `entrelinha citação: esperado 1, obtido ${f.entrelinhasCitacao}`);
  assert(
    Math.abs(alturaLinhaCorpoMm(f.tamanhoCitacaoPt, f.entrelinhasCitacao) - 3.5278) < 0.01,
    "altura linha citação ~3,53 mm (10 pt × 1,0)"
  );

  const { oks, falhas } = stats();
  console.log(`\n${oks} ok, ${falhas} falhas`);
  if (falhas > 0) process.exit(1);
  console.log("OK — página ABNT (NBR 14724 + citação 10520) alinhada.");
}

main();
