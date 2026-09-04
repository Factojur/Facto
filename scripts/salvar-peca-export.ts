/**
 * Gera PDF/Word a partir de texto de peça (stdout ou arquivo).
 * Uso: npx tsx scripts/salvar-peca-export.ts <pasta> < arquivo.txt
 */
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import { gerarPecaDocxBuffer } from "../src/lib/exportar-peca-docx";
import { gerarPecaPdfBuffer } from "../src/lib/exportar-peca-pdf";

async function main() {
  const pasta = resolve(process.argv[2] ?? "testes-e2e-31-08/out");
  const arquivo = process.argv[3];
  const peca = arquivo
    ? readFileSync(resolve(arquivo), "utf8")
    : readFileSync(0, "utf8");
  if (!peca.trim()) {
    console.error("Texto vazio");
    process.exit(1);
  }
  mkdirSync(pasta, { recursive: true });
  writeFileSync(join(pasta, "peca-redigida.txt"), peca, "utf8");
  const [pdf, docx] = await Promise.all([
    gerarPecaPdfBuffer(peca),
    gerarPecaDocxBuffer(peca),
  ]);
  writeFileSync(join(pasta, "peca-redigida.pdf"), pdf);
  writeFileSync(join(pasta, "peca-redigida.docx"), docx);
  console.log(`Salvo em ${pasta}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
