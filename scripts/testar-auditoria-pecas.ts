/**
 * Auditoria cirúrgica de peças (0 tokens Gemini).
 * Percorre todas as áreas/espécies: endereçamento, título, qualificação,
 * polo, MLE, rito e scaffold.
 *
 * Uso: npx tsx scripts/testar-auditoria-pecas.ts
 */
import { AREAS_ATUACAO } from "../src/lib/areas-atuacao";
import {
  formatarEnderecamentoPadrao,
  rotuloAreaJudiciaria,
} from "../src/lib/endereco-comarca";
import { areaMostraMle, moduloDaArea } from "../src/lib/minuta-modulo";
import {
  listaEspeciesDaArea,
  tituloPecaDaArea,
  blocoEstruturaDaArea,
  metaEspecieDaArea,
} from "../src/lib/peca-especie-area";
import {
  pecaUsaPartesJaQualificadas,
  resolverPoloClienteQualificacao,
} from "../src/lib/partes-ja-qualificadas";
import {
  AREAS_COM_POLO_ADVOCACIA,
  especieCompativelComPolo,
  MATRIZ_POLO_POR_AREA,
} from "../src/lib/polo-especies-por-area";
import { createSuite } from "./casos-ouro/suite";

const COMARCA = { cidade: "Campinas", uf: "SP", numeroJuizado: "2" };

type Achado = {
  gravidade: "corrigido" | "bug" | "risco" | "ok";
  area: string;
  especie: string;
  tema: string;
  detalhe: string;
};

const achados: Achado[] = [];

function registrar(a: Achado) {
  achados.push(a);
}

function endereco(areaId: string, especie: string, foro?: string): string {
  return formatarEnderecamentoPadrao({
    comarca: { ...COMARCA, foro },
    areaJudiciaria: rotuloAreaJudiciaria(areaId),
    areaId,
    especiePeca: especie,
    varaEmBranco: moduloDaArea(areaId).idsPeticaoInicial.includes(especie),
  });
}

const { assert, stats } = createSuite();

console.log("Auditoria cirúrgica de peças FACTO (0 tokens)\n");

for (const area of AREAS_ATUACAO) {
  if (area.listarNoCatalogo === false) continue;
  const areaId = area.id;
  const lista = listaEspeciesDaArea(areaId);
  const modulo = moduloDaArea(areaId);

  assert(
    lista != null && lista.length > 0,
    `${areaId}: tem tabela de espécies`
  );
  if (!lista) continue;

  console.log(`\n▸ ${areaId} · ${lista.length} espécies`);

  const ids = new Set(lista.map((e) => e.id));
  for (const idInicial of modulo.idsPeticaoInicial) {
    if (idInicial === "peticao-inicial" && !ids.has("peticao-inicial")) {
      continue;
    }
    if (!ids.has(idInicial) && idInicial !== "peticao-inicial") {
      registrar({
        gravidade: "risco",
        area: areaId,
        especie: idInicial,
        tema: "idsPeticaoInicial órfão",
        detalhe: `idsPeticaoInicial cita ${idInicial}, ausente no seletor`,
      });
    }
  }

  if ((AREAS_COM_POLO_ADVOCACIA as readonly string[]).includes(areaId)) {
    const mat = MATRIZ_POLO_POR_AREA[areaId as keyof typeof MATRIZ_POLO_POR_AREA];
    const cobertos = new Set([...mat.ativo, ...mat.passivo, ...mat.ambos]);
    for (const esp of lista) {
      assert(
        cobertos.has(esp.id),
        `${areaId}/${esp.id}: espécie no seletor está na matriz de polo`
      );
      if (!cobertos.has(esp.id)) {
        registrar({
          gravidade: "bug",
          area: areaId,
          especie: esp.id,
          tema: "polo",
          detalhe: "espécie visível sem entrada na matriz de polo",
        });
      }
    }
  }

  for (const esp of lista) {
    const titulo = tituloPecaDaArea(
      areaId,
      esp.id,
      esp.id === "peticao-inicial" ? "Ação de cobrança" : undefined
    );
    assert(Boolean(titulo?.trim()), `${areaId}/${esp.id}: título não vazio`);
    assert(
      !/peti[cç][aã]o inicial\s*[—–-]/i.test(titulo),
      `${areaId}/${esp.id}: título sem prefixo PETIÇÃO INICIAL —`
    );

    const estrutura = blocoEstruturaDaArea(areaId, esp.id);
    const meta = metaEspecieDaArea(areaId, esp.id);
    if (esp.id !== "memorial" && esp.id !== "notificacao-extrajudicial") {
      assert(
        /pedido/i.test(estrutura),
        `${areaId}/${esp.id}: esqueleto tem seção de pedidos`
      );
    }
    if (
      esp.id !== "memorial" &&
      esp.id !== "notificacao-extrajudicial" &&
      esp.id !== "embargos-declaracao" &&
      esp.id !== "embargos"
    ) {
      assert(
        /fato|direito|m[eé]rito|raz[oõ]es|preliminar|hist[oó]rico|d[eé]bito|t[ií]tulo/i.test(
          estrutura
        ),
        `${areaId}/${esp.id}: esqueleto tem fundamentação (fatos/direito/razões)`
      );
    }
    assert(
      Boolean(meta?.conectivoPartes?.trim()),
      `${areaId}/${esp.id}: conectivo de qualificação definido`
    );

    const jaQual = pecaUsaPartesJaQualificadas(
      esp.id,
      modulo.idsPeticaoInicial
    );
    const polo = resolverPoloClienteQualificacao(areaId, esp.id);
    const end = endereco(areaId, esp.id);
    const endInc = formatarEnderecamentoPadrao({
      comarca: COMARCA,
      areaJudiciaria: rotuloAreaJudiciaria(areaId),
      areaId,
      especiePeca: esp.id,
      varaEmBranco: modulo.idsPeticaoInicial.includes(esp.id),
    });

    assert(
      /excelent[ií]ssim|notifica[cç][aã]o extrajudicial/i.test(end),
      `${areaId}/${esp.id}: endereçamento forense`
    );

    if (
      !modulo.idsPeticaoInicial.includes(esp.id) &&
      /___ VARA|___ VARA/i.test(endInc) &&
      !/TRIBUNAL|TURMA RECURSAL|SUPREMO|SUPERIOR|NOTIFICA/.test(endInc)
    ) {
      registrar({
        gravidade: "bug",
        area: areaId,
        especie: esp.id,
        tema: "vara em branco",
        detalhe: `peça incidental com vara ___: ${endInc}`,
      });
      assert(
        false,
        `${areaId}/${esp.id}: incidental não deve forçar vara em branco quando há nº da vara`
      );
    }

    if (areaId === "jec" && esp.id === "agravo-instrumento") {
      assert(
        /TURMA RECURSAL/i.test(end),
        "JEC agravo → Turma Recursal (não TJ estadual)"
      );
      assert(!/TRIBUNAL DE JUSTI[CÇ]A/i.test(end), "JEC agravo não vai ao TJ");
    }

    if (areaId === "trabalhista" && esp.id === "agravo-instrumento") {
      assert(/TRIBUNAL REGIONAL DO TRABALHO/i.test(end), "AI trabalhista → TRT");
      assert(
        especieCompativelComPolo(areaId, esp.id, "passivo"),
        "AI trabalhista cabe nos dois polos"
      );
    }

    if (areaId === "constitucional" && esp.id === "recurso-ordinario-constitucional") {
      const stj = endereco(areaId, esp.id, "STJ — ROC em habeas corpus");
      assert(/SUPERIOR TRIBUNAL DE JUSTI[CÇ]A/i.test(stj), "ROC com foro STJ");
    }

    if (areaId === "constitucional" && esp.id === "habeas-data") {
      assert(
        !/TRIBUNAL DE JUSTI[CÇ]A/i.test(end),
        "Habeas data não usa endereçamento de habeas corpus (TJ)"
      );
    }

    if (areaId === "constitucional" && esp.id === "contestacao-habeas-data") {
      assert(
        !/TRIBUNAL DE JUSTI[CÇ]A/i.test(end),
        "Contestação em habeas data não vai ao TJ como HC"
      );
    }

    if (areaId === "constitucional" && esp.id === "informacoes-mandado-injuncao") {
      assert(
        !/SUPREMO TRIBUNAL FEDERAL/i.test(end),
        "Informações em MI sem foro STF não forçam o STF"
      );
    }

    if (areaId === "internacional" && esp.id === "homologacao") {
      assert(/SUPERIOR TRIBUNAL DE JUSTI[CÇ]A/i.test(end), "Homologação → STJ");
    }
    if (
      areaId === "internacional" &&
      (esp.id === "apelacao" || esp.id === "cumprimento-sentenca")
    ) {
      assert(
        !/SUPERIOR TRIBUNAL DE JUSTI[CÇ]A/i.test(end),
        `internacional/${esp.id} não vai ao STJ (só homologação)`
      );
      assert(/VARA C[IÍ]VEL/i.test(end), `internacional/${esp.id} → vara cível`);
    }

    if (areaId === "criminal" && esp.id === "revisao-criminal") {
      assert(
        /TRIBUNAL DE JUSTI[CÇ]A/i.test(end),
        "Revisão criminal → tribunal (CPP 624), não vara de origem"
      );
    }

    if (areaId === "jecr" && esp.id === "defesa-jecrim") {
      assert(polo === "passivo", "Defesa JECRIM abre pelo polo passivo");
    }
    if (areaId === "criminal" && esp.id === "resposta-acusacao") {
      assert(polo === "passivo", "Resposta à acusação abre pelo polo passivo");
    }
    if (areaId === "ambiental" && esp.id === "defesa-infracao") {
      assert(polo === "passivo", "Defesa de auto de infração abre pelo polo passivo");
    }

    if (areaId === "criminal") {
      assert(esp.id !== "contestacao", "Penal não tem contestação cível");
      assert(!areaMostraMle(areaId), "Penal sem MLE");
    }

    if (
      areaId !== "jec" &&
      areaId !== "jecr" &&
      /9\.099|recurso inominado|turma recursal/i.test(
        `${esp.descricao} ${esp.rotulo}`
      ) &&
      !/n[aã]o (use|copie|aplique)|distinto|n[aã]o [eé]/i.test(esp.descricao)
    ) {
      registrar({
        gravidade: "risco",
        area: areaId,
        especie: esp.id,
        tema: "rito 9.099",
        detalhe: "descrição menciona Juizado fora do módulo JEC/JECRIM",
      });
    }

    const linha = jaQual ? "já qualificado" : "qualificação completa";
    console.log(
      `  ${esp.id.padEnd(36)} ${titulo.padEnd(42)} ${polo.padEnd(8)} ${linha}`
    );
    console.log(`    ${end}`);
  }
}

assert(!areaMostraMle("criminal"), "MLE oculto no Penal");
assert(!areaMostraMle("jecr"), "MLE oculto no JECRIM");
assert(!areaMostraMle("eleitoral"), "MLE oculto no Eleitoral");
assert(!areaMostraMle("constitucional"), "MLE oculto no Constitucional");
assert(areaMostraMle("jec"), "MLE visível no JEC");
assert(areaMostraMle("civil"), "MLE visível no Civil");

const contestacaoJec = endereco("jec", "contestacao");
assert(
  /2 VARA/.test(contestacaoJec) || /2ª/.test(contestacaoJec) || contestacaoJec.includes("2 "),
  "contestação JEC usa o nº da vara informado (não ___)"
);

const { oks, falhas } = stats();
console.log(`\nResumo asserts: ${oks} OK · ${falhas} FAIL`);
console.log(
  `Achados extras: ${achados.filter((a) => a.gravidade !== "ok").length}`
);
for (const a of achados) {
  console.log(`  [${a.gravidade}] ${a.area}/${a.especie} · ${a.tema}: ${a.detalhe}`);
}

if (falhas > 0) process.exit(1);
console.log("\nAuditoria cirúrgica passou.");
