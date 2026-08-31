/**
 * Exporta pré-visualização (scaffold) dos 5 casos E2E 31/08 em PDF e Word.
 * Uso: npx tsx scripts/exportar-e2e-31-08.ts
 * IA completa: npx tsx scripts/exportar-e2e-31-08.ts --ia
 */
import { mkdirSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import { config } from "dotenv";
import {
  aplicarPreenchimentoAoEstado,
  estadoCasoChatVazio,
  inferirAreaChat,
  montarPayloadGeracaoChat,
} from "../src/lib/chat-minuta";
import { gerarPecaDocxBuffer } from "../src/lib/exportar-peca-docx";
import { gerarPecaPdfBuffer } from "../src/lib/exportar-peca-pdf";
import { gerarPecaJec } from "../src/lib/gerar-peca-jec";
import { organizarCasoLocal } from "../src/lib/organizar-caso-local";
import { inferirEspecieDaArea } from "../src/lib/peca-especie-area";

config({ path: resolve(process.cwd(), ".env.local") });

const OUT = resolve(process.cwd(), "testes-e2e-31-08");
const comIa = process.argv.includes("--ia");

const CASOS = [
  {
    pasta: "01-penal-chat",
    canal: "chat",
    relato:
      "Meu cliente Ricardo Alves, brasileiro, solteiro, motorista, CPF 111.444.777-35, RG 12.345.678-9 SSP/SP, residente na Rua Augusta, 500, apto 12, Consolação, São Paulo/SP, CEP 01305-000, e-mail ricardo@teste.com, telefone (11) 98888-7777. Foi preso em flagrante em 20/08/2026 por furto simples (art. 155 CP). O juiz converteu em prisão preventiva no dia 22/08/2026 no processo 1234567-89.2026.8.26.0100, 1ª Vara Criminal Central de São Paulo/SP. A prisão é ilegal: réu primário, bens de pequeno valor, emprego fixo, moradia e família na cidade. Peço habeas corpus com relaxamento da prisão ou liberdade provisória, sem fiança se possível, e justiça gratuita.",
  },
  {
    pasta: "02-prev-manual",
    canal: "manual",
    areaId: "previdenciario",
    relato:
      "A autora Helena Costa, brasileira, viúva, aposentada, CPF 390.533.447-05, residente na Rua das Palmeiras, 88, Boa Vista, Recife/PE, CEP 50070-200. Contribuiu por 28 anos como professora. Pediu aposentadoria por idade em 10/06/2026 e o INSS indeferiu alegando falta de carência. Tem CTPS e carnês. Pede concessão do benefício, pagamento dos atrasados desde o requerimento e justiça gratuita.",
  },
  {
    pasta: "03-trabalhista-manual",
    canal: "manual",
    areaId: "trabalhista",
    relato:
      "O reclamante Carlos Mendes, brasileiro, casado, ajudante geral, CPF 529.982.247-25, trabalhou na Construtora Alfa Ltda, CNPJ 11.222.333/0001-81, de 01/03/2022 a 15/07/2026, com jornada 07h–19h sem intervalo, sem registro completo de horas extras e sem pagamento de verbas rescisórias. Pede rescisão indireta, horas extras, FGTS com multa 40%, aviso prévio e justiça gratuita. Comarca Campinas/SP.",
  },
  {
    pasta: "04-consumidor-manual",
    canal: "manual",
    areaId: "consumidor",
    relato:
      "A autora Fernanda Lima, brasileira, solteira, CPF 123.456.789-09, comprou passagem aérea da Viajar Airlines para 05/07/2026. O voo foi cancelado sem realocação adequada, perdendo compromisso profissional. Pede indenização por danos morais R$ 10.000 e materiais R$ 2.500, tutela se necessário. Foro São Paulo/SP.",
  },
  {
    pasta: "05-civil-manual",
    canal: "manual",
    areaId: "civil",
    relato:
      "O autor Pedro Nogueira, brasileiro, empresário, CPF 111.444.777-35, celebrou contrato de prestação de serviços com a Beta Serviços Ltda, CNPJ 33.444.555/0001-99, em 01/01/2025. A ré cobrou R$ 45.000 indevidamente após rescisão amigável. Pede declaração de inexigibilidade, repetição do indébito e danos morais R$ 8.000. Comarca de Santos/SP.",
  },
] as const;

async function montarPeca(caso: (typeof CASOS)[number]): Promise<string> {
  const areaId =
    "areaId" in caso && caso.areaId
      ? caso.areaId
      : inferirAreaChat({ texto: caso.relato, leigo: true }).areaId;

  const org = organizarCasoLocal({ relato: caso.relato, areaId });
  let estado = aplicarPreenchimentoAoEstado(
    estadoCasoChatVazio(areaId),
    org
  );

  const especie =
    org.especiePeca ||
    inferirEspecieDaArea(areaId, org.tipoAcao ?? "Petição inicial", caso.relato, null);

  const payload = montarPayloadGeracaoChat(
    { ...estado, especiePeca: especie, fatos: caso.relato },
    { atuarLeigo: true }
  );

  if (comIa) {
    const { gerarPecaComIA } = await import("../src/lib/ia/gerar-peca-com-ia");
    const out = await gerarPecaComIA({
      tipoAcao: payload.tipoAcao,
      fatos: caso.relato,
      especiePeca: especie,
      areaId,
      casoReal: true,
      atuarLeigo: true,
      poloAdvocacia: payload.poloAdvocacia,
      tesesIds: payload.tesesIds,
      instrucoes: {
        pedirJusticaGratuita: payload.pedirJusticaGratuita,
        temMle: payload.temMle,
        tutelaUrgencia: payload.tutelaUrgencia,
      },
      roteamento: { userId: "e2e-export", plano: "pro" },
    });
    if (!out.ok) {
      throw new Error(out.erro);
    }
    return out.textoGerado;
  }

  const out = gerarPecaJec(payload);
  return out.peca ?? "";
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  console.log(`Export E2E → ${OUT} (${comIa ? "IA" : "scaffold"})\n`);

  for (const caso of CASOS) {
    const dir = join(OUT, caso.pasta);
    mkdirSync(dir, { recursive: true });
    process.stdout.write(`▸ ${caso.pasta} … `);
    try {
      const peca = await montarPeca(caso);
      const checklist: string[] = [];
      if (/em face de Ricardo Alves/i.test(peca)) {
        checklist.push("BUG: paciente como réu");
      }
      if (/\[RG\]|\[CPF\]|\[endereço completo\]|\[NOME COMPLETO/i.test(peca)) {
        checklist.push("ALERTA: placeholders");
      }
      if (/VARA DE FAMÍLIA/i.test(peca) && caso.pasta.includes("penal")) {
        checklist.push("BUG: área família no penal");
      }
      if (!/HABEAS CORPUS/i.test(peca) && caso.pasta.includes("penal")) {
        checklist.push("BUG: espécie não é HC");
      }

      writeFileSync(join(dir, "peca.txt"), peca, "utf8");
      writeFileSync(
        join(dir, "checklist.txt"),
        [
          `Canal: ${caso.canal}`,
          `Modo: ${comIa ? "IA" : "scaffold"}`,
          checklist.length ? checklist.join("\n") : "OK estrutural",
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

      console.log(checklist.length ? `avisos: ${checklist.join("; ")}` : "ok");
    } catch (e) {
      console.log(`ERRO: ${e instanceof Error ? e.message : e}`);
      writeFileSync(
        join(dir, "ERRO.txt"),
        String(e instanceof Error ? e.stack : e),
        "utf8"
      );
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
