/**
 * Lote diário de testes de peça (22h) — retoma do estado.
 *
 * modo "scaffold" (padrão): 0 tokens de redação; porDia padrão 40 (~5 noites p/ 183).
 * modo "ia": reservado — só ativa com TESTES_PECAS_MODO=ia + Gemini paygo; porDia baixo.
 *
 * Uso: npm run test:pecas-diario
 * Estado: scripts/testes-pecas-estado.json
 * Saída: tmp/testes-pecas-scaffold/<run-id>/ (.pdf + .docx, mesma formatação do app)
 */
import { spawnSync } from "child_process";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { join, resolve } from "path";
import { config } from "dotenv";
import { gerarScaffoldJob } from "./gerar-scaffold-teste";
import { listarJobsPecaTeste } from "./testes-pecas-fila";
import { gerarPecaDocxBuffer } from "../src/lib/exportar-peca-docx";
import { gerarPecaPdfBuffer } from "../src/lib/exportar-peca-pdf";

config({ path: resolve(process.cwd(), ".env.local") });

const estadoPath = resolve(process.cwd(), "scripts/testes-pecas-estado.json");

type Estado = {
  modo: "scaffold" | "ia";
  proximoIndice: number;
  porDia: number;
  concluido: boolean;
  pastaRelativa: string;
  runId?: string;
};

function lerEstado(): Estado {
  try {
    const j = JSON.parse(readFileSync(estadoPath, "utf8")) as Estado;
    return {
      modo: j.modo === "ia" ? "ia" : "scaffold",
      proximoIndice: Math.max(0, Number(j.proximoIndice) || 0),
      porDia: Math.max(1, Number(j.porDia) || 40),
      concluido: Boolean(j.concluido),
      pastaRelativa: j.pastaRelativa || "tmp/testes-pecas-scaffold",
      runId: j.runId,
    };
  } catch {
    return {
      modo: "scaffold",
      proximoIndice: 0,
      porDia: 40,
      concluido: false,
      pastaRelativa: "tmp/testes-pecas-scaffold",
    };
  }
}

function gravarEstado(e: Estado) {
  writeFileSync(estadoPath, `${JSON.stringify(e, null, 2)}\n`, "utf8");
}

function main() {
  void mainAsync();
}

async function mainAsync() {
  const jobs = listarJobsPecaTeste();
  let estado = lerEstado();

  const modoEnv = process.env.TESTES_PECAS_MODO?.trim().toLowerCase();
  if (modoEnv === "ia" || modoEnv === "scaffold") {
    estado.modo = modoEnv;
  }

  console.log(
    `[testes-pecas-diario] ${new Date().toISOString()} modo=${estado.modo} índice=${estado.proximoIndice}/${jobs.length} porDia=${estado.porDia}`
  );

  if (estado.concluido || estado.proximoIndice >= jobs.length) {
    console.log("Fila concluída. Nada a fazer.");
    gravarEstado({ ...estado, concluido: true, proximoIndice: jobs.length });
    process.exit(0);
  }

  if (estado.modo === "ia") {
    console.log(
      "Modo IA ainda não gera peça real neste script (aguardando Gemini paygo). Use modo scaffold ou rode amostragem manual depois."
    );
    console.log(
      "Estimativa: 1/área ~R$2 · todas espécies ~R$20 Flash / ~R$70 com 15% Sonnet."
    );
    process.exit(0);
  }

  if (!estado.runId) {
    estado.runId = new Date().toISOString().slice(0, 10);
  }

  const outRoot = resolve(
    process.cwd(),
    estado.pastaRelativa,
    estado.runId
  );
  mkdirSync(outRoot, { recursive: true });

  const logPath = join(outRoot, "diario.log");
  const fim = Math.min(estado.proximoIndice + estado.porDia, jobs.length);
  let ok = 0;
  let falhas = 0;
  const linhasIndice: string[] = [];

  console.log(`Lote ${estado.proximoIndice}…${fim - 1} (PDF+Word) → ${outRoot}`);

  for (let i = estado.proximoIndice; i < fim; i++) {
    const job = jobs[i]!;
    const dirArea = join(outRoot, job.areaId);
    mkdirSync(dirArea, { recursive: true });
    const baseNome = `${String(i).padStart(3, "0")}-${job.especieId}`;
    const nomePdf = `${baseNome}.pdf`;
    const nomeDocx = `${baseNome}.docx`;

    try {
      const { peca, vazou9099 } = gerarScaffoldJob(job);
      const [pdf, docx] = await Promise.all([
        gerarPecaPdfBuffer(peca),
        gerarPecaDocxBuffer(peca),
      ]);
      writeFileSync(join(dirArea, nomePdf), pdf);
      writeFileSync(join(dirArea, nomeDocx), docx);
      writeFileSync(
        join(dirArea, `${baseNome}.meta.txt`),
        [
          `Índice fila: ${i}`,
          `Área: ${job.areaId} — ${job.areaTitle}`,
          `Espécie: ${job.especieId} — ${job.especieRotulo}`,
          `Gerado: scaffold PDF + Word (0 tokens redação)`,
          vazou9099
            ? `ALERTA: vazou Lei 9.099 fora do Juizado`
            : `Check 9.099: ok`,
          `Chars peça: ${peca.length}`,
          `PDF: ${nomePdf}`,
          `Word: ${nomeDocx}`,
          "",
        ].join("\n"),
        "utf8"
      );
      ok++;
      linhasIndice.push(
        `- [${i}] ${job.areaId}/${nomePdf} + ${nomeDocx}${vazou9099 ? " ⚠️ 9.099" : ""}`
      );
      process.stdout.write(".");
    } catch (erro) {
      falhas++;
      const msg = erro instanceof Error ? erro.message : String(erro);
      writeFileSync(
        join(dirArea, `${baseNome}.ERRO.txt`),
        `ERRO: ${msg}\n`,
        "utf8"
      );
      linhasIndice.push(`- [${i}] ${job.areaId}/${job.especieId} ERRO: ${msg}`);
      process.stdout.write("x");
    }
  }

  process.stdout.write("\n");

  appendFileSync(
    logPath,
    `\n[${new Date().toISOString()}] lote ${estado.proximoIndice}-${fim - 1} pdf+docx ok=${ok} falhas=${falhas}\n${linhasIndice.join("\n")}\n`,
    "utf8"
  );

  const readmePath = join(outRoot, "README.md");
  const prev = existsSync(readmePath)
    ? readFileSync(readmePath, "utf8")
    : `# Testes scaffold FACTO (${estado.runId})\n\nPDF + Word (mesma formatação do app). 0 tokens de redação.\n\n`;
  writeFileSync(
    readmePath,
    prev +
      `\n## Lote ${estado.proximoIndice}–${fim - 1} (PDF + Word)\n\n` +
      linhasIndice.join("\n") +
      "\n",
    "utf8"
  );

  const novoIndice = fim;
  const concluido = novoIndice >= jobs.length;
  gravarEstado({
    ...estado,
    proximoIndice: novoIndice,
    concluido,
  });

  console.log(
    `Resumo: ok=${ok} falhas=${falhas} · próximo índice ${novoIndice}/${jobs.length}` +
      (concluido ? " · FILA CONCLUÍDA" : "")
  );

  if (estado.proximoIndice === 0 || concluido) {
    console.log("Rodando test:auditoria-pecas…");
    const aud = spawnSync("npx", ["--yes", "tsx", "scripts/testar-auditoria-pecas.ts"], {
      encoding: "utf8",
      cwd: process.cwd(),
      shell: true,
      maxBuffer: 20 * 1024 * 1024,
    });
    writeFileSync(
      join(outRoot, "auditoria-pecas.txt"),
      `${aud.stdout ?? ""}\n${aud.stderr ?? ""}`,
      "utf8"
    );
  }

  if (falhas > 0) process.exit(1);
}

main();
