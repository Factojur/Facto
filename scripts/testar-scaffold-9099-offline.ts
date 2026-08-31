/**
 * Smoke offline: scaffold por área sem embedding (valida vazamento Lei 9.099).
 */
import { gerarPecaJec } from "../src/lib/gerar-peca-jec";
import { AREAS_ATUACAO } from "../src/lib/areas-atuacao";
import { listaEspeciesDaArea } from "../src/lib/peca-especie-area";

const lastroJec = [
  {
    titulo: "JEC teste",
    categoria: "jurisprudencia",
    texto: "Aplica-se a Lei nº 9.099/95 ao caso concreto.",
  },
];

let falhas = 0;

for (const area of AREAS_ATUACAO.filter((a) => a.available)) {
  const especies = listaEspeciesDaArea(area.id) ?? [];
  const especie = especies[0];
  if (!especie) continue;

  const scaffold = gerarPecaJec({
    tipoAcao: especie.rotulo,
    fatos: `Caso offline ${area.title}.`,
    areaId: area.id,
    especiePeca: especie.id,
    provas: [],
    fotos: [],
    midias: [],
    documentos: {},
    baseConhecimento: lastroJec,
    tutelaUrgencia: false,
    pedirJusticaGratuita: false,
    temMle: false,
  });

  const peca = scaffold.peca ?? "";
  const vazou =
    area.id !== "jec" &&
    area.id !== "jecr" &&
    /9\.?099/.test(peca) &&
    /Lei\s*n[ºo°]?\s*9\.?099/i.test(peca);

  if (vazou) {
    console.log(`FALHA · ${area.id} · ${especie.id}`);
    falhas++;
  } else {
    console.log(`OK · ${area.id} · ${especie.id}`);
  }
}

console.log(`\n${falhas} falhas`);
if (falhas > 0) process.exit(1);
