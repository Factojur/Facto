/**
 * Personas das contas internas (jec leigo vs Completo advogado vs admin).
 * npx tsx scripts/testar-acesso-contas.ts
 */
import { createSuite } from "./casos-ouro/suite";
import { areaAbertaParaCliente, areasPermitidas } from "../src/lib/acesso-areas";
import {
  isEmailAcessoLivre,
  resolverAcessoConta,
} from "../src/lib/emails-acesso-livre";
import { isAdminEmail } from "../src/lib/admin-auth";
import { isEmailPreviewAreas } from "../src/lib/emails-preview-areas";

const { assert, stats } = createSuite();

const jec = resolverAcessoConta("jec@facto.com", "mensal", "advogado");
assert(jec.leigo === true, "jec@ é leigo mesmo se o perfil disser advogado");
assert(jec.plano === "jec", "jec@ simula Plano JEC");
assert(jec.cotasIlimitadas === true, "jec@ cotas ilimitadas");
assert(
  areasPermitidas(jec) instanceof Set && (areasPermitidas(jec) as Set<string>).has("jec"),
  "jec@ só tem JEC no set"
);
assert(
  areaAbertaParaCliente("jec", jec) === true,
  "jec@ entra no módulo JEC"
);
assert(
  areaAbertaParaCliente("civil", jec) === false,
  "jec@ não entra em Civil"
);
assert(isAdminEmail("jec@facto.com") === false, "jec@ sem /admin");
assert(isEmailPreviewAreas("jec@facto.com") === false, "jec@ sem preview interno");

const adv = resolverAcessoConta(
  "factoassessoria.jur@gmail.com",
  null,
  "leigo"
);
assert(adv.leigo === false, "assessoria é advogado mesmo se o perfil disser leigo");
assert(adv.plano === "mensal", "assessoria simula Completo");
assert(areasPermitidas(adv) === "todas", "assessoria tem todas as áreas do plano");
assert(
  areaAbertaParaCliente("civil", adv) === true,
  "assessoria entra em Civil"
);
assert(
  isAdminEmail("factoassessoria.jur@gmail.com") === false,
  "assessoria sem /admin"
);
assert(
  isEmailPreviewAreas("factoassessoria.jur@gmail.com") === false,
  "assessoria vê catálogo de cliente, não preview interno"
);

const admin = resolverAcessoConta("admin@facto.com", null, "leigo");
assert(admin.leigo === false, "admin é advogado");
assert(admin.plano === "mensal", "admin simula Completo");
assert(isAdminEmail("admin@facto.com") === true, "admin tem /admin");
assert(isEmailPreviewAreas("admin@facto.com") === true, "admin tem preview");
assert(isEmailAcessoLivre("admin@facto.com"), "admin cotas livres");
assert(isEmailAcessoLivre("jec@facto.com"), "jec cotas livres");
assert(
  isEmailAcessoLivre("factoassessoria.jur@gmail.com"),
  "assessoria cotas livres"
);

const cliente = resolverAcessoConta("alguem@escritorio.com", "jec", "leigo");
assert(cliente.cotasIlimitadas === false, "cliente comum tem cota");
assert(cliente.leigo === true, "cliente JEC leigo");
assert(
  areaAbertaParaCliente("trabalhista", cliente) === false,
  "cliente JEC sem trabalhista"
);

if (stats().falhas > 0) {
  console.error(`Falhou: ${stats().falhas}`);
  process.exit(1);
}
console.log(`OK acesso contas: ${stats().oks} asserts`);
