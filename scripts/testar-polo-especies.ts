/**
 * Matriz polo × espécie: toda peça do seletor visível e classificada.
 * Uso: npx tsx scripts/testar-polo-especies.ts
 */
import {
  AREAS_COM_POLO_ADVOCACIA,
  MATRIZ_POLO_POR_AREA,
  agruparEspeciesPorPolo,
  especieCompativelComPolo,
  filtrarEspeciesPorPolo,
  inferirPoloPorEspecie,
  ladoPoloDaEspecie,
} from "../src/lib/polo-advocacia";
import { listaEspeciesDaArea } from "../src/lib/peca-especie-area";
import { createSuite } from "./casos-ouro/suite";

const ALIASES_MATRIZ: Record<string, readonly string[]> = {
  jec: ["recurso", "contrarrazoes"],
};

const DEFESA_SO_PASSIVO: Record<string, string> = {
  jec: "contestacao",
  civil: "contestacao",
  consumidor: "contestacao",
  familia: "contestacao",
  imobiliario: "contestacao",
  administrativo: "contestacao",
  tributario: "contestacao",
  trabalhista: "defesa",
};

const INICIAL_SO_ATIVO: Record<string, string> = {
  jec: "peticao-inicial",
  civil: "peticao-inicial",
  consumidor: "peticao-inicial",
  familia: "peticao-inicial",
  imobiliario: "peticao-inicial",
  administrativo: "peticao-inicial",
  tributario: "peticao-inicial",
  trabalhista: "reclamacao",
  constitucional: "mandado-seguranca",
};

function main() {
  const { assert, stats } = createSuite();

  for (const areaId of AREAS_COM_POLO_ADVOCACIA) {
    const lista = listaEspeciesDaArea(areaId);
    assert(Boolean(lista?.length), `${areaId}: catálogo de espécies existe`);
    if (!lista) continue;

    const mat = MATRIZ_POLO_POR_AREA[areaId];
    const cobertos = new Set([...mat.ativo, ...mat.passivo, ...mat.ambos]);
    const idsSeletor = lista.map((e) => e.id);
    const grupos = agruparEspeciesPorPolo(areaId, lista);

    console.log(
      `\n▸ ${areaId} · ${lista.length} no seletor · ativo ${grupos.ativo.length} · passivo ${grupos.passivo.length} · ambos ${grupos.ambos.length}`
    );
    console.log(
      `  passivo: ${grupos.passivo.map((e) => e.id).join(", ") || "(nenhuma)"}`
    );

    for (const esp of lista) {
      assert(
        cobertos.has(esp.id),
        `${areaId}/${esp.id}: no seletor e na matriz de polo`
      );
      const lado = ladoPoloDaEspecie(areaId, esp.id);
      assert(
        lado === "ativo" || lado === "passivo" || lado === "ambos",
        `${areaId}/${esp.id}: classificada (${lado ?? "null"})`
      );
    }

    const noGrupo = [
      ...grupos.ativo,
      ...grupos.passivo,
      ...grupos.ambos,
    ].map((e) => e.id);
    assert(
      noGrupo.length === lista.length,
      `${areaId}: agrupamento cobre o seletor inteiro`
    );
    assert(
      new Set(noGrupo).size === noGrupo.length,
      `${areaId}: espécie não entra em dois grupos`
    );

    const aliases = new Set(ALIASES_MATRIZ[areaId] ?? []);
    for (const id of cobertos) {
      if (aliases.has(id)) continue;
      assert(
        idsSeletor.includes(id),
        `${areaId}/${id}: id da matriz existe no seletor`
      );
    }

    const defesa = DEFESA_SO_PASSIVO[areaId];
    if (defesa) {
      assert(
        especieCompativelComPolo(areaId, defesa, "passivo"),
        `${areaId}/${defesa}: disponível no polo passivo`
      );
      assert(
        !especieCompativelComPolo(areaId, defesa, "ativo"),
        `${areaId}/${defesa}: não é do polo ativo`
      );
      assert(
        grupos.passivo.some((e) => e.id === defesa),
        `${areaId}/${defesa}: visível no grupo Polo passivo`
      );
      assert(
        inferirPoloPorEspecie(areaId, defesa) === "passivo",
        `${areaId}/${defesa}: infere polo passivo`
      );
    }

    const inicial = INICIAL_SO_ATIVO[areaId];
    if (inicial) {
      assert(
        especieCompativelComPolo(areaId, inicial, "ativo"),
        `${areaId}/${inicial}: disponível no polo ativo`
      );
      assert(
        !especieCompativelComPolo(areaId, inicial, "passivo"),
        `${areaId}/${inicial}: não é do polo passivo`
      );
    }
  }

  const jec = listaEspeciesDaArea("jec") ?? [];
  assert(
    jec.some((e) => e.id === "contestacao"),
    "JEC: Contestação está no seletor (não some no polo ativo)"
  );
  const jecPassivo = filtrarEspeciesPorPolo("jec", jec, "passivo");
  assert(
    jecPassivo.some((e) => e.id === "contestacao"),
    "JEC: Contestação cabe no polo passivo (réu)"
  );
  const jecAtivo = filtrarEspeciesPorPolo("jec", jec, "ativo");
  assert(
    !jecAtivo.some((e) => e.id === "contestacao"),
    "JEC: Contestação não é peça do polo ativo"
  );
  assert(
    jecAtivo.some((e) => e.id === "peticao-inicial"),
    "JEC: Petição inicial no polo ativo"
  );
  assert(
    jecAtivo.some((e) => e.id === "replica"),
    "JEC: Réplica no polo ativo"
  );
  assert(
    especieCompativelComPolo("jec", "recurso-inominado", "ativo") &&
      especieCompativelComPolo("jec", "recurso-inominado", "passivo"),
    "JEC: recurso inominado nos dois polos"
  );

  assert(
    inferirPoloPorEspecie("tributario", "embargos-execucao-fiscal") ===
      "ativo",
    "Tributário: embargos à EF são do contribuinte (polo ativo)"
  );
  assert(
    inferirPoloPorEspecie("tributario", "excecao-pre-executividade") ===
      "ativo",
    "Tributário: EPE é do contribuinte (polo ativo)"
  );
  assert(
    inferirPoloPorEspecie("trabalhista", "defesa") === "passivo",
    "Trabalhista: defesa do reclamado"
  );
  assert(
    inferirPoloPorEspecie("constitucional", "contestacao-ms") === "passivo",
    "Constitucional: contestação em MS no polo passivo"
  );
  assert(
    especieCompativelComPolo("constitucional", "recurso-extraordinario", "passivo"),
    "Constitucional: RE cabe no polo passivo (réu/recorrido também recorre)"
  );

  const { oks, falhas } = stats();
  console.log(`\n${oks} ok, ${falhas} falhas`);
  if (falhas > 0) process.exit(1);
}

main();
