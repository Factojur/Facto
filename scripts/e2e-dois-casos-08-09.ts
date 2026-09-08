/**
 * Dois casos aleatórios (áreas distintas das de 07/09: família/imobiliário).
 * Gera peça com IA + exporta txt/pdf/docx para análise.
 *
 * Uso: npx tsx scripts/e2e-dois-casos-08-09.ts
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

const OUT = resolve(process.cwd(), "testes-e2e-08-09");

const CASOS = [
  {
    pasta: "01-criminal-habeas-corpus",
    areaId: "criminal",
    especieHint: "habeas-corpus",
    relato: [
      "Atuo como impetrante em favor do paciente Marcos Vieira, brasileiro, solteiro,",
      "CPF 777.888.999-00, residente em Campinas/SP. Autoridade coatora: Juízo da Vara Criminal",
      "da Comarca de Campinas/SP, Processo-Crime nº 0001234-56.2026.8.26.0114.",
      "Foi decretada prisão preventiva por furto simples, sem violência ou grave ameaça,",
      "fundada só na gravidade abstrata do crime, sem risco concreto de fuga ou reiteração.",
      "Quero habeas corpus no TJSP pedindo liminar para soltura e, no mérito, concessão da ordem,",
      "com fundamentação no art. 5º, LXVIII, CF e arts. 647/648 e 312 do CPP.",
      "Advogado: Dr. Rafael Ito, OAB/SP 180.220, Rua Augusta, 1500, São Paulo/SP.",
    ].join(" "),
    checagens: [
      /HABEAS|PACIENTE|MARCOS/i,
      /TRIBUNAL|DESEMBARGADOR|TJ/i,
      /DOS FATOS|DO DIREITO|DOS PEDIDOS|DO CABIMENTO/i,
      /Nestes termos|pede deferimento/i,
    ],
    proibidos: [
      /PETICAO-INICIAL/i,
      /Lei n[ºo°.]?\s*9\.099/i,
      /RECLAMA[CÇ][AÃ]O TRABALHISTA/i,
      /DE\s+UMA\s+DAS\s+VARAS/i,
    ],
  },
  {
    pasta: "02-consumidor-danos-morais",
    areaId: "consumidor",
    especieHint: "peticao-inicial",
    relato: [
      "Atuo pelo autor Pedro Henrique Almeida, brasileiro, solteiro, analista de sistemas,",
      "CPF 111.222.333-44, residente na Rua XV de Novembro, 500, Centro, Santos/SP, CEP 11010-001.",
      "A ré é Loja Virtual MegaBuy Ltda., CNPJ 22.333.444/0001-55, sede em São Paulo/SP.",
      "Comprou notebook em 10/06/2026 por R$ 4.890,00; produto nunca entregue; protocolo de",
      "reclamação 998877 sem solução em 40 dias; cartão estornado só parcialmente (R$ 1.200).",
      "Quero ação de obrigação de fazer c/c restituição do valor pago e danos morais de R$ 8.000,00,",
      "com CDC, inversão do ônus e tutela para entrega ou estorno integral, foro de Santos/SP,",
      "justiça gratuita. Advogada: Dra. Marina Costa, OAB/SP 210.450, Av. Ana Costa, 100, Santos/SP.",
    ].join(" "),
    checagens: [
      /CONSUMIDOR|CDC|PEDRO|MEGABUY|OBRIGA[CÇ]|DANOS/i,
      /em face de/i,
      /DOS FATOS|DO DIREITO|DOS PEDIDOS/i,
      /Nestes termos|pede deferimento/i,
      /___\s*ª\s*VARA|___ª\s*VARA/i,
    ],
    proibidos: [
      /PETICAO-INICIAL/i,
      /j[aá] qualificado no processo em ep[ií]grafe/i,
      /DE\s+UMA\s+DAS\s+VARAS/i,
      /RECLAMA[CÇ][AÃ]O TRABALHISTA/i,
    ],
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
    roteamento: { userId: "e2e-08-09", plano: "pro" },
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
  if (/VALORDA\b/.test(peca)) avisos.push("VALORDA sem espaço");
  if (/Folha \d+ de \d+/i.test(peca)) {
    avisos.push("Texto ainda cita Folha X de Y");
  }
  if (/\[RG\]|\[CPF\]|\[endereço completo\]|\[NOME COMPLETO/i.test(peca)) {
    avisos.push("Placeholders de qualificação");
  }
  return avisos;
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  console.log(`E2E 08/09 — 2 casos aleatórios → ${OUT}\n`);

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
