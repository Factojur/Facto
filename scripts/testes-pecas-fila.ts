/**
 * Fila plana área × espécie (áreas available) para testes de peça.
 */
import { AREAS_ATUACAO } from "../src/lib/areas-atuacao";
import { listaEspeciesDaArea } from "../src/lib/peca-especie-area";

export type JobPecaTeste = {
  areaId: string;
  areaTitle: string;
  especieId: string;
  especieRotulo: string;
};

export function listarJobsPecaTeste(): JobPecaTeste[] {
  const jobs: JobPecaTeste[] = [];
  for (const area of AREAS_ATUACAO) {
    if (!area.available || area.listarNoCatalogo === false) continue;
    const especies = listaEspeciesDaArea(area.id) ?? [];
    for (const esp of especies) {
      jobs.push({
        areaId: area.id,
        areaTitle: area.title,
        especieId: esp.id,
        especieRotulo: esp.rotulo,
      });
    }
  }
  return jobs;
}
