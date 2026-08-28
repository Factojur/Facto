/**
 * Teste 0 tokens: expansão de sinônimos na busca de lastro.
 * Uso: npm run test:expansao-lastro
 */
import { expandirQueryLastro } from "../src/lib/expansao-query-lastro";

type Caso = {
  area: string;
  fatos: string;
  grupos: string[];
};

const CASOS: Caso[] = [
  {
    area: "jec",
    fatos: "Cliente sofreu golpe da maquininha no comercio",
    grupos: ["golpe-maquininha"],
  },
  {
    area: "consumidor",
    fatos: "Golpe do motoboy — transferiu PIX para conta de terceiro",
    grupos: ["golpe-motoboy", "golpe-pix"],
  },
  {
    area: "civil",
    fatos: "Falsa central telefonica do banco pediu senha e houve transferencia",
    grupos: ["falsa-central"],
  },
  {
    area: "trabalhista",
    fatos: "Reclamante faz horas extras sem pagamento e sofreu assedio moral",
    grupos: ["horas-extras", "assedio-moral"],
  },
  {
    area: "previdenciario",
    fatos: "INSS negou aposentadoria por tempo de contribuicao",
    grupos: ["aposentadoria"],
  },
  {
    area: "tributario",
    fatos: "Embargos a execucao fiscal por CDA ilegitima",
    grupos: ["execucao-fiscal"],
  },
  {
    area: "eleitoral",
    fatos: "Representacao por propaganda eleitoral antecipada",
    grupos: ["eleitoral"],
  },
];

let ok = 0;
let falha = 0;

for (const c of CASOS) {
  const r = expandirQueryLastro(c.area, c.fatos);
  const hit = c.grupos.every((g) => r.gruposAtivos.includes(g));
  if (hit) {
    ok++;
    console.log(`✓ ${c.area}: ${r.gruposAtivos.join(", ")}`);
  } else {
    falha++;
    console.error(
      `✗ ${c.area}: esperado [${c.grupos.join(", ")}] obteve [${r.gruposAtivos.join(", ")}]`
    );
  }
}

console.log(`\n${ok} ok · ${falha} falha(s)`);
process.exit(falha > 0 ? 1 : 0);
