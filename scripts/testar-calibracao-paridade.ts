/**
 * Calibração área × espécie × polo — paridade MinutaIA (0 tokens).
 * Uso: npx tsx scripts/testar-calibracao-paridade.ts
 */
import { areaIdParaEspecieCabivel, especieExplicitaNoRelato } from "../src/lib/calibracao-area-especie";
import { organizarCasoLocal } from "../src/lib/organizar-caso-local";
import {
  ajustarCabivelAoPolo,
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

  const cumprimentoMs =
    "Cumprimento de sentença nº 0006509. Exequente Jefferson. Decisão ilegal do juiz que reduziu astreintes de R$ 22.200 para R$ 600. Ato coator manifestamente ilegal.";
  assert(sugereMandadoSegurancaAutos(cumprimentoMs, "ativo"), "MS cumprimento exequente");
  const orgMs = organizarCasoLocal({
    areaId: "jec",
    relato: cumprimentoMs,
    poloAdvocacia: "ativo",
  });
  assert(orgMs.areaIdResolvida === "constitucional", "org MS → constitucional");
  assert(orgMs.preenchimento.especiePeca === "mandado-seguranca", "org MS espécie");

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
    cumprimentoMs
  );
  assert(agravoExec === "mandado-seguranca", "exequente não fica com agravo");

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
