/**
 * Dois casos aleatórios (áreas distintas das simulações anteriores JEC/trabalhista).
 * Gera peça com IA + exporta txt/pdf/docx para análise de formatação.
 *
 * Uso: npx tsx scripts/e2e-dois-casos-07-09.ts
 */
import { mkdirSync, writeFileSync } from "fs";
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
  inferirEspecieDaArea,
  tituloPecaDaArea,
} from "../src/lib/peca-especie-area";

config({ path: resolve(process.cwd(), ".env.local") });

const OUT = resolve(process.cwd(), "testes-e2e-07-09");

const CASOS = [
  {
    pasta: "01-familia-alimentos",
    areaId: "familia",
    especieHint: "peticao-inicial",
    relato: [
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
    ].join(" "),
    checagens: [
      /FAM[IÍ]LIA|ALIMENTOS|ANA BEATRIZ|LUCAS/i,
      /em face de/i,
      /DOS FATOS|DO DIREITO|DOS PEDIDOS/i,
      /Nestes termos|pede deferimento/i,
    ],
    proibidos: [/j[aá] qualificado no processo em ep[ií]grafe/i, /RECLAMA[CÇ][AÃ]O TRABALHISTA/i],
  },
  {
    pasta: "02-imobiliario-despejo",
    areaId: "imobiliario",
    especieHint: "despejo",
    relato: [
      "Atuo pelo autor Imobiliária Horizonte Ltda., CNPJ 11.222.333/0001-81, sede na Rua Augusta,",
      "1500, Consolação, São Paulo/SP, CEP 01304-001. A ré é Juliana Prado Campos, brasileira,",
      "solteira, designer, CPF 123.456.789-09, que locou o apto 72 do Edifício Aurora, Rua da Consolação,",
      "800, São Paulo/SP, pelo contrato de 01/02/2024 (Lei 8.245/91), aluguel R$ 3.200,00 + condomínio.",
      "Está inadimplente desde maio/2026 (aluguéis e encargos). Notificada extrajudicialmente em",
      "20/07/2026 (AR), sem purgação. Quero ação de despejo por falta de pagamento c/c cobrança",
      "dos aluguéis e encargos vencidos e vincendos até a desocupação, liminar se cabível,",
      "foro da Capital/SP. Advogado: Dr. Rafael Ito, OAB/SP 180.220, mesmo endereço do escritório",
      "na Rua Augusta, 1500.",
    ].join(" "),
    checagens: [
      /DESPEJO|LOCA[CÇ]|IMOBILI[AÁ]RIA|JULIANA/i,
      /em face de/i,
      /DOS FATOS|DO DIREITO|DOS PEDIDOS/i,
      /Nestes termos|pede deferimento/i,
    ],
    proibidos: [/j[aá] qualificado no processo em ep[ií]grafe/i, /Lei n[ºo°.]?\s*9\.099/i],
  },
] as const;

async function gerarCaso(caso: (typeof CASOS)[number]): Promise<string> {
  const org = organizarCasoLocal({ relato: caso.relato, areaId: caso.areaId });
  let estado = aplicarPreenchimentoAoEstado(
    estadoCasoChatVazio(caso.areaId),
    org.preenchimento
  );

  const especieRaw =
    org.preenchimento.especiePeca ||
    caso.especieHint ||
    inferirEspecieDaArea(
      caso.areaId,
      org.preenchimento.tipoAcao ?? "",
      caso.relato,
      caso.especieHint
    );
  const especie = canonizarEspecieDaArea(caso.areaId, especieRaw);
  const titulo = tituloPecaDaArea(
    caso.areaId,
    especie,
    org.preenchimento.tipoAcao
  );

  const payload = montarPayloadGeracaoChat(
    {
      ...estado,
      especiePeca: especie,
      fatos: caso.relato,
      tipoAcao: titulo || org.preenchimento.tipoAcao || "",
    },
    { atuarLeigo: false }
  );

  const { extrairAssinaturaDoTexto } = await import(
    "../src/lib/ia/aplicar-assinatura-peca"
  );
  const ass = extrairAssinaturaDoTexto(caso.relato);

  const { gerarPecaComIA } = await import("../src/lib/ia/gerar-peca-com-ia");
  const out = await gerarPecaComIA({
    tipoAcao: payload.tipoAcao || titulo,
    fatos: caso.relato,
    especiePeca: especie,
    areaId: caso.areaId,
    casoReal: true,
    atuarLeigo: false,
    poloAdvocacia: payload.poloAdvocacia ?? "ativo",
    tesesIds: payload.tesesIds,
    instrucoes: {
      pedirJusticaGratuita: payload.pedirJusticaGratuita,
      temMle: payload.temMle,
      tutelaUrgencia: payload.tutelaUrgencia,
      nomePeca: titulo,
      qualificacaoAutor: payload.instrucoes?.qualificacaoAutor,
      qualificacaoReus: payload.instrucoes?.qualificacaoReus,
      partesJaQualificadas: payload.instrucoes?.partesJaQualificadas,
      enderecamento: payload.instrucoes?.enderecamento,
      valorCausa: payload.instrucoes?.valorCausa,
      pedidosUsuario: payload.instrucoes?.pedidosUsuario,
      autorNome: ass.nome,
      autorOab: ass.oab,
      localFechamento: ass.local,
    },
    roteamento: { userId: "e2e-07-09", plano: "pro" },
  });

  if (!out.ok) throw new Error(out.erro);
  console.log(
    `  espécie=${especie} · título=${titulo} · modelo=${out.modelo} · ${out.textoGerado.length} chars`
  );
  return out.textoGerado;
}

function auditar(
  peca: string,
  caso: (typeof CASOS)[number]
): string[] {
  const avisos: string[] = [];
  for (const re of caso.checagens) {
    if (!re.test(peca)) avisos.push(`FALTA padrão: ${re}`);
  }
  for (const re of caso.proibidos) {
    if (re.test(peca)) avisos.push(`PROIBIDO: ${re} → ${peca.match(re)?.[0]}`);
  }
  if (/\[Cidade\s*\/\s*UF\]|\[Nome do Advogado\]|OAB\/\[UF\]/i.test(peca)) {
    avisos.push("Placeholders de assinatura");
  }
  // [[ESPACO_*]] no .txt é marcador interno (PDF/DOCX expandem) — não auditar como erro.
  if (/VALORDA\b/.test(peca)) avisos.push("VALORDA sem espaço");
  if (/Folha \d+ de \d+/i.test(peca)) {
    avisos.push("Texto ainda cita Folha X de Y (só no rodapé export)");
  }
  if (/\[RG\]|\[CPF\]|\[endereço completo\]|\[NOME COMPLETO/i.test(peca)) {
    avisos.push("Placeholders de qualificação");
  }
  return avisos;
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  console.log(`E2E 07/09 — 2 casos aleatórios → ${OUT}\n`);

  for (const caso of CASOS) {
    const dir = join(OUT, caso.pasta);
    mkdirSync(dir, { recursive: true });
    process.stdout.write(`▸ ${caso.pasta} (${caso.areaId}) …\n`);
    try {
      const peca = await gerarCaso(caso);
      const avisos = auditar(peca, caso);

      writeFileSync(join(dir, "peca.txt"), peca, "utf8");
      writeFileSync(
        join(dir, "checklist.txt"),
        [
          `Área: ${caso.areaId}`,
          `Data: ${new Date().toISOString()}`,
          avisos.length ? avisos.join("\n") : "OK estrutural (checagens locais)",
          "",
          "Relato (resumo):",
          caso.relato.slice(0, 400) + "…",
          "",
        ].join("\n"),
        "utf8"
      );

      const [pdf, docx] = await Promise.all([
        gerarPecaPdfBuffer(peca),
        gerarPecaDocxBuffer(peca),
      ]);
      writeFileSync(join(dir, "peca.pdf"), pdf);
      writeFileSync(join(dir, "peca.docx"), docx);

      console.log(
        avisos.length
          ? `  avisos: ${avisos.join("; ")}`
          : "  ok · txt/pdf/docx salvos"
      );
    } catch (e) {
      const msg = e instanceof Error ? e.stack ?? e.message : String(e);
      console.error(`  ERRO: ${msg}`);
      writeFileSync(join(dir, "ERRO.txt"), msg, "utf8");
    }
  }

  console.log(`\nPronto. Abra a pasta: ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
