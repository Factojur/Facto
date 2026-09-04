/**
 * Smoke qualidade 0006509 — gera 1 peça (Flash) e pontua vs falhas do erro.pdf.
 * Uso: npx tsx scripts/smoke-qualidade-0006509.ts
 * Custo ≈ R$ 0,11 (1 peça Flash).
 */
import { config } from "dotenv";
import { mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import { filtrarRuidoOcrRelato } from "../src/lib/filtrar-ruido-ocr-relato";
import { AUTOS_0006509 } from "./testar-caso-0006509";

config({ path: ".env.local" });

const RELATO_ADV =
  "Sou advogado do exequente Jefferson da Silva Ribeiro. A decisão do juiz André Yukio Ogata reduziu indevidamente as astreintes (de multa diária para R$ 100,00 por ato, teto R$ 600,00). Preciso de agravo de instrumento contra essa interlocutória no cumprimento 0006509-93.2023.8.26.0016, FMU.";

/** Simula lixo típico do erro.pdf misturado ao relato. */
const RUIDO_OCR = `
--- Mensagem original ---
De: IRACY FERREIRA DA SILVA
Assunto: boletos
[cid:image001.png]
Página 3 de 40
https://outlook.office.com/mail
fatos na redação definitiva
`;

type Check = { id: string; ok: boolean; detalhe: string };

function avaliar(peca: string): Check[] {
  const t = peca;
  return [
    {
      id: "nome-jefferson",
      ok: /jefferson\s+da\s+silva\s+ribeiro/i.test(t),
      detalhe: "Autor/agravante = Jefferson (não 'promoveu')",
    },
    {
      id: "sem-promoveu",
      ok: !/\bpromoveu\b/i.test(t),
      detalhe: "Sem verbo 'promoveu' no lugar do nome",
    },
    {
      id: "processo-cnj",
      ok: /0006509-93\.2023\.8\.26\.0016/.test(t),
      detalhe: "CNJ do cumprimento presente",
    },
    {
      id: "remedio-agravo",
      ok: /agravo\s+de\s+instrumento/i.test(t),
      detalhe: "Espécie agravo de instrumento",
    },
    {
      id: "tema-astreintes",
      ok: /astreinte|multa\s+di[aá]ria|art\.?\s*537/i.test(t),
      detalhe: "Tema astreintes/multa (não CDC genérico)",
    },
    {
      id: "sem-cdc-errado",
      ok: !/\bCDC\b|\bc[oó]digo de defesa do consumidor\b|s[uú]mula\s*479|LGPD/i.test(
        t
      ),
      detalhe: "Sem CDC/Súmula 479/LGPD (contaminação Enel)",
    },
    {
      id: "sem-outlook",
      ok: !/outlook\.office|cid:image|IRACY FERREIRA|Mensagem original/i.test(t),
      detalhe: "Sem lixo OCR/e-mail no corpo",
    },
    {
      id: "sem-scaffold",
      ok: !/reda[cç][aã]o definitiva|pr[eé]-?visualiza[cç][aã]o:|confira partes, pedidos/i.test(
        t
      ),
      detalhe: "Sem texto de scaffold no miolo",
    },
    {
      id: "fmu-parte",
      ok: /faculdades metropolitanas|fmu/i.test(t),
      detalhe: "FMU nomeada",
    },
    {
      id: "juiz-ou-decisao",
      ok: /ogata|erro material|interlocut[oó]ria|decis[aã]o agravada/i.test(t),
      detalhe: "Ataque à decisão/erro material",
    },
  ];
}

async function main() {
  console.log("=== Smoke qualidade 0006509 (1 peça Flash) ===\n");

  const bruto = `${AUTOS_0006509}\n${RUIDO_OCR}\n${RELATO_ADV}`;
  const limpo = filtrarRuidoOcrRelato(bruto);
  console.log(
    `Filtro OCR: ${bruto.length} → ${limpo.length} chars (removeu ${bruto.length - limpo.length})`
  );
  if (/outlook|cid:|IRACY|Página 3 de/i.test(limpo)) {
    console.warn("AVISO: filtro não removeu todo o ruído");
  } else {
    console.log("Filtro OCR: OK (sem Outlook/cid/página)");
  }

  const { gerarPecaComIA } = await import("../src/lib/ia/gerar-peca-com-ia");
  const out = await gerarPecaComIA({
    tipoAcao: "Agravo de instrumento",
    fatos: limpo,
    especiePeca: "agravo-instrumento",
    areaId: "jec",
    casoReal: true,
    atuarLeigo: false,
    poloAdvocacia: "ativo",
    instrucoes: {
      pedirJusticaGratuita: false,
      temMle: false,
      tutelaUrgencia: false,
    },
  });

  if (!out.ok) {
    console.error("Falha IA:", out.erro);
    process.exit(1);
  }

  const peca = out.textoGerado ?? "";
  const tmp = resolve(process.cwd(), ".tmp-smoke");
  mkdirSync(tmp, { recursive: true });
  const outPath = resolve(tmp, "qualidade-0006509-apos.txt");
  writeFileSync(outPath, peca, "utf8");
  console.log(`\nPeça salva: ${outPath} (${peca.length} chars)\n`);

  const checks = avaliar(peca);
  let ok = 0;
  for (const c of checks) {
    console.log(`${c.ok ? "OK  " : "FAIL"} ${c.id} — ${c.detalhe}`);
    if (c.ok) ok += 1;
  }
  const total = checks.length;
  const pct = Math.round((ok / total) * 100);
  console.log(`\nScore: ${ok}/${total} (${pct}%)`);
  console.log(
    "\nReferência erro.pdf antigo: nome 'promoveu', Outlook no miolo, CDC/LGPD, scaffold — score típico ~2/10."
  );

  if (ok < 7) {
    console.log("\nTrecho (800 chars):\n", peca.slice(0, 800));
    process.exit(1);
  }
  console.log("\nQualidade: melhorou vs erro.pdf (limiar ≥7/10).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
