/**
 * Calibração área × espécie × polo — pista local fraca; remédio por interpretação do caso.
 * Uso: npx tsx scripts/testar-calibracao-paridade.ts
 */
import { areaIdParaEspecieCabivel, especieExplicitaNoRelato } from "../src/lib/calibracao-area-especie";
import { organizarCasoLocal } from "../src/lib/organizar-caso-local";
import {
  ajustarCabivelAoPolo,
  pecaCabivelAposUltimoAto,
  resolverAreaEspecieOrganizacao,
  sugereMandadoSegurancaAutos,
} from "../src/lib/peca-cabivel-autos";
import { inferirPoloDoRelato } from "../src/lib/polo-advocacia";
import { createSuite } from "./casos-ouro/suite";

function main() {
  const { assert, stats } = createSuite();

  assert(
    especieExplicitaNoRelato("Peço habeas corpus com liminar") === "habeas-corpus",
    "HC explícito"
  );
  assert(
    areaIdParaEspecieCabivel("jec", "habeas-corpus") === "criminal",
    "HC → área criminal"
  );

  assert(
    especieExplicitaNoRelato("Mandado de segurança contra ato do juiz") ===
      "mandado-seguranca",
    "MS explícito"
  );
  assert(
    areaIdParaEspecieCabivel("jec", "mandado-seguranca") === "constitucional",
    "MS → constitucional"
  );

  const cumprimentoInterloc =
    "Cumprimento de sentença nº 0006509. Exequente Jefferson. Decisão ilegal do juiz que reduziu astreintes de R$ 22.200 para R$ 600.";
  assert(
    !sugereMandadoSegurancaAutos(cumprimentoInterloc, "ativo"),
    "interlocutória sem pedido explícito de MS → não força MS"
  );
  assert(
    pecaCabivelAposUltimoAto("jec", cumprimentoInterloc) === "agravo-instrumento",
    "cumprimento + interlocutória → agravo"
  );
  const orgAgravo = organizarCasoLocal({
    areaId: "jec",
    relato: cumprimentoInterloc,
    poloAdvocacia: "ativo",
  });
  assert(
    orgAgravo.preenchimento.especiePeca === "agravo-instrumento",
    `org espécie ${orgAgravo.preenchimento.especiePeca}`
  );

  const cumprimentoMsExplicito =
    cumprimentoInterloc + " Impetrar mandado de segurança contra ato do juiz.";
  assert(
    sugereMandadoSegurancaAutos(cumprimentoMsExplicito, "ativo"),
    "MS só com pedido explícito"
  );

  assert(
    inferirPoloDoRelato("Sou advogado da parte exequente Jefferson") === "ativo",
    "polo exequente no relato"
  );
  assert(
    inferirPoloDoRelato(
      "Exequente: JEFFERSON DA SILVA RIBEIRO\nExecutada: FACULDADES METROPOLITANAS UNIDAS"
    ) === "ativo",
    "capa 0006509: exequente antes de executada"
  );
  const agravoExec = ajustarCabivelAoPolo(
    "jec",
    "agravo-instrumento",
    "ativo",
    cumprimentoInterloc
  );
  assert(agravoExec === "agravo-instrumento", "exequente mantém agravo (não força MS)");

  assert(
    especieExplicitaNoRelato("Reclamação trabalhista verbas rescisórias", "trabalhista") ===
      "reclamacao",
    "reclamação trabalhista"
  );
  const orgTrab = organizarCasoLocal({
    areaId: "trabalhista",
    relato:
      "Reclamação trabalhista. Reclamante João contra Empresa XYZ. Horas extras e FGTS.",
    poloAdvocacia: "ativo",
  });
  assert(orgTrab.areaIdResolvida === "trabalhista", "trabalhista mantém área");

  assert(
    especieExplicitaNoRelato("Réplica à contestação da ré") === "replica",
    "réplica explícita"
  );

  const orgPrev = organizarCasoLocal({
    areaId: "previdenciario",
    relato:
      "Benefício BPC LOAS indeferido pelo INSS. Autor menor. Petição inicial para anular indeferimento.",
    poloAdvocacia: "ativo",
  });
  assert(
    Boolean(
      orgPrev.preenchimento.especiePeca?.includes("previdenci") ||
        orgPrev.preenchimento.tipoAcao?.toLowerCase().includes("petição")
    ),
    "previdenciário organiza espécie"
  );

  const resolvido = resolverAreaEspecieOrganizacao({
    areaId: "consumidor",
    relato: "Resposta à acusação. Acusado preso em flagrante.",
    especie: "peticao-inicial",
    poloAdvocacia: "passivo",
  });
  assert(resolvido.especie === "resposta-acusacao", "resposta à acusação");
  assert(resolvido.areaId === "criminal", "RA → criminal");

  const orgJec = organizarCasoLocal({
    areaId: "jec",
    relato:
      "Autor João contra Enel. Corte de energia. Tutela de urgência e danos morais.",
    poloAdvocacia: "ativo",
  });
  assert(orgJec.preenchimento.autoresNomes.length >= 1, "JEC extrai autor");
  assert(orgJec.preenchimento.tutelaUrgencia === true, "JEC tutela");

  const { oks, falhas } = stats();
  console.log(`\nCalibração: ${oks} ok · ${falhas} falha(s)`);
  if (falhas > 0) process.exit(1);
}

main();
