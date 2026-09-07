/**
 * Regenera só o caso família (truncado) + reexporta PDF/DOCX.
 */
import { mkdirSync, writeFileSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { config } from "dotenv";
import {
  aplicarPreenchimentoAoEstado,
  estadoCasoChatVazio,
  montarPayloadGeracaoChat,
} from "../src/lib/chat-minuta";
import { gerarPecaDocxBuffer } from "../src/lib/exportar-peca-docx";
import { gerarPecaPdfBuffer } from "../src/lib/exportar-peca-pdf";
import { organizarCasoLocal } from "../src/lib/organizar-caso-local";
import {
  canonizarEspecieDaArea,
  tituloPecaDaArea,
} from "../src/lib/peca-especie-area";
import { normalizarPecaGerada } from "../src/lib/ia/normalizar-peca-gerada";

config({ path: resolve(process.cwd(), ".env.local") });

const OUT = resolve(process.cwd(), "testes-e2e-07-09", "01-familia-alimentos");

const relato = [
  "Atuo pela requerente Ana Beatriz Souza, brasileira, solteira, professora, CPF 390.533.447-05,",
  "RG 22.333.444-5 SSP/SP, residente na Rua das Hortênsias, 45, Jardim América, Ribeirão Preto/SP,",
  "CEP 14020-100, e-mail ana.beatriz@email.com, celular (16) 98877-6655.",
  "O requerido é Lucas Ferreira Mendes, brasileiro, comerciante, CPF 529.982.247-25,",
  "residente na Av. Independência, 1200, Centro, Ribeirão Preto/SP.",
  "Tiveram um filho, Miguel Souza Mendes, nascido em 12/03/2020. Desde a separação de fato em",
  "janeiro/2026 o pai paga irregularmente valores inferiores a R$ 400,00, sem acordo formal.",
  "A mãe arca com escola, plano de saúde e moradia. Quero petição inicial de alimentos na Vara",
  "de Família de Ribeirão Preto/SP, pedindo pensão de 30% dos rendimentos líquidos do requerido",
  "(ou piso de 1 salário mínimo), guarda unilateral da mãe, visitas quinzenais supervisionadas",
  "no início, e justiça gratuita. Advogada: Dra. Carla Nogueira, OAB/SP 250.111,",
  "escritório na Rua São Sebastião, 200, Centro, Ribeirão Preto/SP.",
].join(" ");

async function main() {
  mkdirSync(OUT, { recursive: true });
  const areaId = "familia";
  const org = organizarCasoLocal({ relato, areaId });
  let estado = aplicarPreenchimentoAoEstado(
    estadoCasoChatVazio(areaId),
    org.preenchimento
  );
  const especie = canonizarEspecieDaArea(areaId, "peticao-inicial");
  const titulo =
    tituloPecaDaArea(areaId, especie, "Ação de Alimentos") ||
    "Ação de Alimentos c/c Guarda e Convivência";

  const payload = montarPayloadGeracaoChat(
    {
      ...estado,
      especiePeca: especie,
      fatos: relato,
      tipoAcao: titulo,
    },
    { atuarLeigo: false }
  );

  const { gerarPecaComIA } = await import("../src/lib/ia/gerar-peca-com-ia");
  console.log("Regenerando família (esforço detalhada/fundo)…");
  const out = await gerarPecaComIA({
    tipoAcao: titulo,
    fatos: relato,
    especiePeca: especie,
    areaId,
    casoReal: true,
    atuarLeigo: false,
    poloAdvocacia: "ativo",
    esforcoRedacao: "detalhada",
    instrucoes: {
      pedirJusticaGratuita: true,
      nomePeca: titulo,
      partesJaQualificadas: false,
      qualificacaoAutor: payload.instrucoes?.qualificacaoAutor,
      qualificacaoReus: payload.instrucoes?.qualificacaoReus,
      enderecamento: payload.instrucoes?.enderecamento,
    },
    roteamento: { userId: "e2e-07-09-retry", plano: "pro" },
  });

  if (!out.ok) throw new Error(out.erro);
  let peca = normalizarPecaGerada(out.textoGerado);
  writeFileSync(join(OUT, "peca.txt"), peca, "utf8");

  const avisos: string[] = [];
  if (!/Nestes termos|pede deferimento/i.test(peca)) {
    avisos.push("sem fechamento");
  }
  if (!/em face de/i.test(peca)) avisos.push("sem em face de");
  if (/A manutenção das\[\[\/JURIS\]\]/.test(peca) || /\[\[JURIS\]\][^\[]*$/.test(peca)) {
    avisos.push("citação truncada?");
  }

  writeFileSync(
    join(OUT, "checklist.txt"),
    [
      `Área: familia (regenerada)`,
      `Data: ${new Date().toISOString()}`,
      `Modelo: ${out.modelo}`,
      `Chars: ${peca.length}`,
      avisos.length ? avisos.join("\n") : "OK estrutural",
      "",
    ].join("\n"),
    "utf8"
  );

  const [pdf, docx] = await Promise.all([
    gerarPecaPdfBuffer(peca),
    gerarPecaDocxBuffer(peca),
  ]);
  writeFileSync(join(OUT, "peca.pdf"), pdf);
  writeFileSync(join(OUT, "peca.docx"), docx);
  console.log(`OK ${peca.length} chars · avisos=${avisos.join("; ") || "nenhum"}`);
  console.log(`Salvo em ${OUT}`);

  // também reexporta imobiliário com normalizar (já completo)
  const imobDir = resolve(process.cwd(), "testes-e2e-07-09", "02-imobiliario-despejo");
  const imob = normalizarPecaGerada(readFileSync(join(imobDir, "peca.txt"), "utf8"));
  writeFileSync(join(imobDir, "peca.txt"), imob, "utf8");
  const [pdf2, docx2] = await Promise.all([
    gerarPecaPdfBuffer(imob),
    gerarPecaDocxBuffer(imob),
  ]);
  writeFileSync(join(imobDir, "peca.pdf"), pdf2);
  writeFileSync(join(imobDir, "peca.docx"), docx2);
  writeFileSync(
    join(imobDir, "checklist.txt"),
    [
      "Área: imobiliario",
      `Data: ${new Date().toISOString()}`,
      /Nestes termos/i.test(imob) ? "OK estrutural" : "FALTA fechamento",
      "Marcadores [[ESPACO]] no .txt são internos — PDF/DOCX expandem.",
      "",
    ].join("\n"),
    "utf8"
  );
  console.log("Imobiliário reexportado.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
