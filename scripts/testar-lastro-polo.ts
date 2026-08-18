/**
 * Desfecho da ementa × polo (0 tokens).
 * Uso: npx tsx scripts/testar-lastro-polo.ts
 */
import {
  bonusLastroPolo,
  inferirDesfechoPolo,
  lastroContrarioAoPolo,
  pistaQueryPolo,
} from "../src/lib/lastro-favoravel-polo";
import { createSuite } from "./casos-ouro/suite";

function main() {
  const { assert, stats } = createSuite();

  const ativoMantido = `
RECURSO INOMINADO. CONSUMIDOR. NEGATIVAÇÃO INDEVIDA. DANO MORAL IN RE IPSA.
SENTENÇA DE PROCEDÊNCIA MANTIDA. RECURSO DA RÉ IMPROVIDO.
`;
  assert(
    inferirDesfechoPolo(ativoMantido) === "ativo",
    "recurso da ré improvido + procedência → polo ativo"
  );
  assert(
    lastroContrarioAoPolo(ativoMantido, "Jurisprudência", "passivo"),
    "esse julgado não serve à contestação"
  );
  assert(
    !lastroContrarioAoPolo(ativoMantido, "Jurisprudência", "ativo"),
    "esse julgado serve à inicial"
  );

  const passivoMantido = `
RECURSO INOMINADO DO AUTOR. FALHA DO SERVIÇO NÃO COMPROVADA. MERO ABORRECIMENTO.
SENTENÇA DE IMPROCEDÊNCIA MANTIDA. RECURSO IMPROVIDO.
`;
  assert(
    inferirDesfechoPolo(passivoMantido) === "passivo",
    "improcedência mantida + recurso do autor improvido → polo passivo"
  );
  assert(
    lastroContrarioAoPolo(passivoMantido, "Jurisprudência", "ativo"),
    "improcedência não entra na inicial"
  );

  const autorProvido = `
RECURSO DO AUTOR PROVIDO. REFORMA DA SENTENÇA. CONDENAÇÃO EM DANOS MORAIS.
`;
  assert(
    inferirDesfechoPolo(autorProvido) === "ativo",
    "recurso do autor provido → polo ativo"
  );

  const reProvido = `
RECURSO DA RÉ PROVIDO. AÇÃO JULGADA IMPROCEDENTE. AFASTADA A CONDENAÇÃO.
`;
  assert(
    inferirDesfechoPolo(reProvido) === "passivo",
    "recurso da ré provido → polo passivo"
  );

  const neutro = "DECLÍNIO DE COMPETÊNCIA. REMESSA DOS AUTOS AO JUÍZO FEDERAL.";
  assert(inferirDesfechoPolo(neutro) === "neutro", "declínio sem mérito → neutro");
  assert(
    !lastroContrarioAoPolo(neutro, "Jurisprudência", "ativo"),
    "neutro não é excluído"
  );

  assert(
    !lastroContrarioAoPolo(ativoMantido, "Súmula", "passivo"),
    "súmula não é filtrada por polo"
  );
  assert(
    bonusLastroPolo(ativoMantido, "Jurisprudência", "ativo") > 0,
    "bônus quando o desfecho coincide"
  );
  assert(
    bonusLastroPolo(ativoMantido, "Jurisprudência", "passivo") < 0,
    "penalidade quando o desfecho é o polo contrário"
  );
  assert(/favorável ao autor/.test(pistaQueryPolo("ativo")), "pista do polo ativo");
  assert(/favorável ao réu/.test(pistaQueryPolo("passivo")), "pista do polo passivo");
  assert(pistaQueryPolo(null) === "", "sem polo não enviesa a query");

  const { oks, falhas } = stats();
  console.log(`\n${oks} ok, ${falhas} falhas`);
  if (falhas > 0) process.exit(1);
}

main();
