/**
 * Valida que os 8 grupos da home cobrem todas as áreas do catálogo.
 * Uso: npx tsx scripts/testar-grupos-areas.ts
 */
import { areasDoCatalogo } from "../src/lib/areas-atuacao";
import {
  GRUPOS_AREAS_DASHBOARD,
  sugerirAreaPorWizard,
  validarCoberturaGrupos,
} from "../src/lib/grupos-areas-dashboard";

const ids = areasDoCatalogo().map((a) => a.id);
const erros = validarCoberturaGrupos(ids);

if (erros.length > 0) {
  console.error("Cobertura de grupos inválida:", erros.join(", "));
  process.exit(1);
}

console.log(
  `OK — ${GRUPOS_AREAS_DASHBOARD.length} grupos cobrem ${ids.length} áreas.`
);

const jecConsumo = sugerirAreaPorWizard({
  assunto: "consumo",
  juizado: "sim",
});
if (jecConsumo.areaId !== "jec") {
  console.error("Wizard consumo+juizado deveria sugerir jec, obteve", jecConsumo);
  process.exit(1);
}

const civil = sugerirAreaPorWizard({ assunto: "outro", juizado: "nao" });
if (civil.areaId !== "civil") {
  console.error("Wizard padrão deveria sugerir civil, obteve", civil);
  process.exit(1);
}

console.log("OK — wizard de área (amostras).");
