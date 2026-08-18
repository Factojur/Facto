/**
 * Regressão de qualificação das partes (0 tokens) — polo ativo/passivo,
 * petição inicial vs incidentais, scaffold JEC e matriz por área.
 *
 * Uso: npm run test:qualificacao-partes
 */

import { autorVazio } from "../src/lib/autor-types";
import { formatarBlocoQualificacaoAutor } from "../src/lib/autor-types";
import { gerarPecaJec } from "../src/lib/gerar-peca-jec";
import { ESPECIES_PECA_JEC } from "../src/lib/jec-especie-peca";
import { moduloDaArea } from "../src/lib/minuta-modulo";
import {
  AREAS_COM_POLO_ADVOCACIA,
  especieCompativelComPolo,
  MATRIZ_POLO_POR_AREA,
  type PoloAdvocacia,
} from "../src/lib/polo-especies-por-area";
import { aplicarFlagReconvencao } from "../src/lib/peca-especie-area";
import {
  formatarBlocoPartesJaQualificadas,
  pecaUsaPartesJaQualificadas,
  resolverPoloClienteQualificacao,
} from "../src/lib/partes-ja-qualificadas";
import { reuVazio } from "../src/lib/reu-types";
import { createSuite, type SuiteStats } from "./casos-ouro/suite";

const NOME_AUTOR = "JOÃO CARLOS SILVA";
const NOME_REU = "LOJAS EXEMPLO LTDA";

const autores = [
  autorVazio({
    nomeCompleto: NOME_AUTOR,
    cpf: "111.222.333-44",
    estadoCivil: "solteiro",
    profissao: "comerciante",
    logradouro: "Rua Alfa",
    numero: "100",
    bairro: "Centro",
    cidade: "São Paulo",
    uf: "SP",
    cep: "01000-000",
  }),
];

const reus = [
  reuVazio({
    tipo: "pj",
    razaoSocial: NOME_REU,
    cnpj: "12.345.678/0001-99",
    logradouro: "Av. Beta",
    numero: "200",
    bairro: "Industrial",
    cidade: "São Paulo",
    uf: "SP",
    cep: "02000-000",
  }),
];

function ehRecursalOuContrarrazoes(especie: string): boolean {
  const e = especie.toLowerCase();
  return (
    e.includes("recurso") ||
    e.includes("agravo") ||
    e.includes("apelacao") ||
    e.includes("contrarrazoes") ||
    e === "embargos" ||
    e === "embargos-declaracao"
  );
}

function assertBlocoIncidental(
  assert: (c: boolean, m: string) => void,
  bloco: string,
  especie: string,
  polo: PoloAdvocacia,
  prefixo: string
) {
  const p = prefixo ? `${prefixo}: ` : "";
  assert(/já qualificado/i.test(bloco), `${p}usa \"já qualificado\"`);
  assert(
    !/\d{3}\.\d{3}\.\d{3}-\d{2}/.test(bloco),
    `${p}sem CPF no bloco incidental`
  );
  assert(
    !/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/.test(bloco),
    `${p}sem CNPJ no bloco incidental`
  );
  assert(
    bloco.includes("à presença de Vossa Excelência"),
    `${p}fecha em Vossa Excelência`
  );

  const cliente = polo === "passivo" ? NOME_REU : NOME_AUTOR;
  const adversario = polo === "passivo" ? NOME_AUTOR : NOME_REU;
  const idxCliente = bloco.indexOf(cliente);
  assert(idxCliente >= 0, `${p}nome do cliente presente`);
  assert(idxCliente < 120, `${p}cliente abre o parágrafo (${cliente})`);

  if (ehRecursalOuContrarrazoes(especie)) {
    assert(
      !/movido em face de/i.test(bloco),
      `${p}recursal/contrarrazões sem \"movido em face de\"`
    );
  } else if (polo === "passivo" && (especie === "contestacao" || especie === "pedido-contraposto")) {
    assert(
      bloco.includes(`em face de ${NOME_AUTOR}`),
      `${p}contestação cita autor em face de`
    );
    assert(
      !bloco.trimStart().startsWith(NOME_AUTOR),
      `${p}contestação não abre pelo autor`
    );
  } else if (polo === "ativo" && especie === "replica") {
    assert(
      bloco.includes(NOME_AUTOR) && bloco.includes(NOME_REU),
      `${p}réplica cita autor e réu`
    );
    assert(
      bloco.indexOf(NOME_AUTOR) < bloco.indexOf(NOME_REU),
      `${p}réplica: autor antes do réu`
    );
  }
  void adversario;
}

function rodarBlocosDeterministicos(): SuiteStats {
  const { assert, stats } = createSuite();
  console.log("\n▸ qualificação — blocos determinísticos JEC");

  const blocoInicial = formatarBlocoQualificacaoAutor({
    autores,
    advogadoNome: "Dra. Maria Advogada",
    oabQualificacao: "OAB/SP 147099",
    fundamentoLei: "na Lei nº 9.099/95",
  });
  assert(/propor a presente/i.test(blocoInicial), "inicial: propor a presente");
  assert(!/já qualificado/i.test(blocoInicial), "inicial: sem já qualificado");
  assert(blocoInicial.includes(NOME_AUTOR), "inicial: qualifica autor");

  for (const esp of ESPECIES_PECA_JEC) {
    if (esp.id === "defesa-preliminar") continue;
    const ja = pecaUsaPartesJaQualificadas(esp.id);
    if (!ja) {
      assert(
        !pecaUsaPartesJaQualificadas(esp.id),
        `${esp.id}: classificada como inaugural`
      );
      continue;
    }

    for (const polo of ["ativo", "passivo"] as const) {
      if (!especieCompativelComPolo("jec", esp.id, polo)) continue;
      const bloco = formatarBlocoPartesJaQualificadas({
        autores,
        reus,
        advogadoNome: "Dra. Maria Advogada",
        oabQualificacao: "OAB/SP 147099",
        especie: esp.id,
        areaId: "jec",
        poloAdvocacia: polo,
        rotuloPoloAtivo: "autor",
        rotuloPoloPassivo: "réu",
      });
      assertBlocoIncidental(assert, bloco, esp.id, polo, `${esp.id}/${polo}`);
    }
  }

  return stats();
}

function rodarScaffoldJec(): SuiteStats {
  const { assert, stats } = createSuite();
  console.log("\n▸ qualificação — scaffold gerarPecaJec");

  const baseInput = {
    tipoAcao: "Ação de indenização por danos morais",
    fatos:
      "Autor comprou produto defeituoso. Réu recusou troca. Pedido de indenização.",
    tutelaUrgencia: false,
    documentos: {},
    provas: [],
    fotos: [],
    midias: [],
    autores,
    reus,
    autorNome: "Dra. Maria Advogada",
    autorOab: "SP147099",
    comarca: { cidade: "São Paulo", uf: "SP", foro: "São Paulo/SP" },
  };

  const casos: { especie: string; polo: PoloAdvocacia }[] = [
    { especie: "peticao-inicial", polo: "ativo" },
    { especie: "contestacao", polo: "passivo" },
    { especie: "replica", polo: "ativo" },
    { especie: "recurso-inominado", polo: "passivo" },
    { especie: "recurso-inominado", polo: "ativo" },
    { especie: "contrarrazoes-inominado", polo: "passivo" },
    { especie: "agravo-instrumento", polo: "passivo" },
    { especie: "execucao", polo: "ativo" },
  ];

  for (const { especie, polo } of casos) {
    const out = gerarPecaJec({
      ...baseInput,
      especiePeca: especie as never,
      poloAdvocacia: polo,
      dispositivoSentenca:
        especie.includes("recurso") || especie.includes("contrarrazoes")
          ? "improcedentes os pedidos"
          : undefined,
    });
    const peca = out.peca.replace(/\r\n/g, "\n");
    assert(peca.length > 400, `${especie}/${polo}: peça com corpo`);
    assert(
      /Nestes termos,\npede deferimento\./.test(peca) ||
        /Termos em que,\nPede e espera deferimento\./.test(peca),
      `${especie}/${polo}: fechamento forense`
    );
    assert(/I\s*-\s*/i.test(peca), `${especie}/${polo}: tópico romano I`);

    const ja = pecaUsaPartesJaQualificadas(especie);
    if (ja) {
      assert(/já qualificado/i.test(peca), `${especie}/${polo}: já qualificado na peça`);
      const blocoIntro = peca.match(
        /[^\n]+, já qualificado[\s\S]*?à presença de Vossa Excelência/i
      )?.[0];
      assert(Boolean(blocoIntro), `${especie}/${polo}: bloco introdutório encontrado`);
      if (blocoIntro) {
        assertBlocoIncidental(
          assert,
          blocoIntro,
          especie,
          polo,
          `scaffold ${especie}/${polo}`
        );
      }
    } else {
      assert(/propor a presente/i.test(peca), `${especie}: propor a presente`);
      assert(/em face de/i.test(peca), `${especie}: em face de réu`);
    }
  }

  const contraposto = gerarPecaJec({
    ...baseInput,
    especiePeca: "contestacao",
    comReconvencao: true,
    poloAdvocacia: "passivo",
  });
  const pecaC = contraposto.peca.replace(/\r\n/g, "\n");
  assert(
    /PEDIDO CONTRAPOSTO/i.test(pecaC),
    "contestação + checkbox: seção do contraposto"
  );
  assert(/já qualificado/i.test(pecaC), "contraposto: partes já qualificadas");
  const introC =
    pecaC.split("\n").find((l) => /já qualificado/i.test(l)) ?? pecaC;
  assert(
    introC.includes(NOME_REU) &&
      introC.indexOf(NOME_REU) < introC.indexOf(NOME_AUTOR),
    "contraposto: réu abre o parágrafo"
  );

  return stats();
}

function rodarMatrizPolos(): SuiteStats {
  const { assert, stats } = createSuite();
  console.log("\n▸ qualificação — matriz polo × espécie");

  for (const areaId of AREAS_COM_POLO_ADVOCACIA) {
    const mat = MATRIZ_POLO_POR_AREA[areaId];
    const todas = [...mat.ativo, ...mat.passivo, ...mat.ambos];
    for (const especie of todas) {
      const polos: PoloAdvocacia[] = [];
      if (mat.ativo.includes(especie) || mat.ambos.includes(especie)) {
        polos.push("ativo");
      }
      if (mat.passivo.includes(especie) || mat.ambos.includes(especie)) {
        polos.push("passivo");
      }
      for (const polo of polos) {
        assert(
          especieCompativelComPolo(areaId, especie, polo),
          `${areaId}/${especie} compatível com polo ${polo}`
        );
      }
    }

    assert(
      especieCompativelComPolo("jec", "recurso-inominado", "passivo"),
      "JEC: recurso inominado pelo réu"
    );
    assert(
      especieCompativelComPolo("jec", "contrarrazoes-inominado", "ativo"),
      "JEC: contrarrazões pelo autor"
    );
  }

  assert(
    resolverPoloClienteQualificacao("jec", "contestacao", null) === "passivo",
    "inferência: contestação → passivo"
  );
  assert(
    aplicarFlagReconvencao("jec", "contestacao", true) === "pedido-contraposto",
    "flag JEC: contestação + checkbox → contraposto"
  );
  assert(
    aplicarFlagReconvencao("civil", "contestacao", true) === "reconvencao",
    "flag Civil: contestação + checkbox → reconvenção"
  );
  assert(
    aplicarFlagReconvencao("jec", "contestacao", false) === "contestacao",
    "flag: sem checkbox permanece contestação"
  );
  assert(
    !especieCompativelComPolo("jec", "pedido-contraposto", "ativo"),
    "JEC: contraposto interno não cabe no polo ativo"
  );
  assert(
    resolverPoloClienteQualificacao("jec", "replica", null) === "ativo",
    "inferência: réplica → ativo"
  );

  const modTrab = moduloDaArea("trabalhista");
  assert(
    pecaUsaPartesJaQualificadas("defesa", modTrab.idsPeticaoInicial),
    "trabalhista: defesa é incidental"
  );
  assert(
    !pecaUsaPartesJaQualificadas("reclamacao", modTrab.idsPeticaoInicial),
    "trabalhista: reclamação é inaugural"
  );

  return stats();
}

function main() {
  console.log("Teste qualificação das partes FACTO (0 tokens)\n");

  const statsList = [
    rodarBlocosDeterministicos(),
    rodarScaffoldJec(),
    rodarMatrizPolos(),
  ];

  const oks = statsList.reduce((a, s) => a + s.oks, 0);
  const falhas = statsList.reduce((a, s) => a + s.falhas, 0);
  console.log(`\nResumo qualificação: ${oks} OK · ${falhas} FAIL`);
  if (falhas > 0) process.exit(1);
  console.log("Suite qualificação passou.");
}

main();
