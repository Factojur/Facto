/**
 * Skins visíveis (0 tokens extra).
 * Uso: npx tsx scripts/testar-skins-facto.ts
 */
import { detectarTesesCanonicas } from "../src/lib/teses-canonicas";
import {
  blocoPecaCabivelPrompt,
  montarEtapaMaestro,
  montarQueryPesquisa,
  nucleoFatosParaPesquisa,
  reforcarEstrategiaParaRedator,
  resolverVinculosPeca,
} from "../src/lib/ia/skins-facto";
import { createSuite } from "./casos-ouro/suite";

const AUTOS_ASTREINTES = `
CUMPRIMENTO DE SENTENÇA Nº 0006509-93.2023.8.26.0016
O incidente de cumprimento já está instaurado.
DECISÃO
este Juízo reconhece que houve erro material na fixação da multa diária.
`;

function main() {
  const { assert, stats } = createSuite();

  // Espécie = só a informada (IA/chips) — sem remap local.
  const vinculos = resolverVinculosPeca({
    areaId: "jec",
    especie: "embargos",
    tipoAcao: "Embargos de declaração",
    fatos: AUTOS_ASTREINTES,
  });
  assert(vinculos.especie === "embargos", "preserva espécie informada");
  assert(vinculos.incidenteAberto, "detecta incidente já aberto");
  assert(vinculos.cabivel === null, "sem remédio local (cabivel null)");
  assert(/opor os presentes/i.test(vinculos.prefixoNome), "conectivo de embargos");

  const teses = detectarTesesCanonicas("jec", AUTOS_ASTREINTES, []);
  const maestro = montarEtapaMaestro({
    areaId: "jec",
    vinculos,
    polo: "ativo",
    teses,
    pedirJusticaGratuita: true,
  });
  assert(maestro.id === "maestro", "etapa Maestro");
  assert(/embargos/i.test(maestro.detalhe ?? ""), "plano cita a peça");
  assert(/polo ativo/.test(maestro.detalhe ?? ""), "plano cita o polo");
  assert(/JG/.test(maestro.detalhe ?? ""), "plano cita JG");
  assert(maestro.status === "ok", "Maestro ok com peça+polo");

  const maestroSemPolo = montarEtapaMaestro({
    areaId: "jec",
    vinculos,
    polo: null,
    teses,
  });
  assert(maestroSemPolo.status === "parcial", "Maestro parcial sem polo");

  const bloco = blocoPecaCabivelPrompt(vinculos);
  assert(/PEÇA CONFIRMADA/i.test(bloco), "prompt nomeia a peça confirmada");
  assert(/opor os presentes/i.test(bloco), "prompt leva o conectivo");
  assert(/incidente/i.test(bloco), "prompt alerta incidente em curso");

  const query = montarQueryPesquisa({
    areaId: "jec",
    tipoAcao: "Embargos de declaração",
    vinculos,
    teses,
    fatos: AUTOS_ASTREINTES,
  });
  assert(/embargos/i.test(query), "Pesquisa busca pelo nome da peça");
  assert(query.length < 4000, "query da Pesquisa não despeja o PDF");

  const reforco = reforcarEstrategiaParaRedator({
    estrategia: "1. Tese jurídica principal: erro material nas astreintes.",
    vinculos,
    teses,
    pedidosUsuario: ["A imediata restauração das astreintes"],
    pedirJusticaGratuita: true,
    temMle: false,
  });
  assert(/<VINCULOS_FACTO>/.test(reforco), "Estrategista injeta vínculos");
  assert(/ESTRATEGISTA → REDATOR/i.test(reforco), "protocolo estrategista");
  assert(/restauração das astreintes/.test(reforco), "leva pedidos do formulário");
  assert(/NÃO pedir/.test(reforco), "MLE desligado vira vedação");
  assert(/Justiça gratuita: incluir/.test(reforco), "JG ligado vira obrigação");
  assert(reforco.includes("erro material nas astreintes"), "mantém a estratégia da triagem");

  const nucleo = nucleoFatosParaPesquisa(
    "Página 1 fls. 2. Houve corte indevido de energia. O autor pede tutela e danos morais. " +
      "A concessionária não restabeleceu o serviço."
  );
  assert(/tutela|danos|corte/i.test(nucleo), "núcleo pesquisa prioriza termos jurídicos");
  assert(!/fls\.\s*2/i.test(nucleo), "núcleo pesquisa remove fls. ruidoso");

  const inicial = resolverVinculosPeca({
    areaId: "jec",
    especie: "peticao-inicial",
    tipoAcao: "Indenização por falha do serviço",
    fatos: "O banco não devolveu o PIX. Quero dano moral e material.",
  });
  assert(inicial.especie === "peticao-inicial", "inicial permanece inicial");
  assert(!inicial.incidenteAberto, "sem incidente aberto");
  const blocoInicial = blocoPecaCabivelPrompt(inicial);
  assert(/PEÇA CONFIRMADA/i.test(blocoInicial), "inicial também confirmada");

  const semEspecie = resolverVinculosPeca({
    areaId: "civil",
    especie: "",
    fatos: AUTOS_ASTREINTES,
  });
  assert(
    /ainda sem espécie/i.test(blocoPecaCabivelPrompt(semEspecie)),
    "sem espécie: prompt pede escolha pelos autos"
  );

  const { oks, falhas } = stats();
  console.log(`\n${oks} ok, ${falhas} falhas`);
  if (falhas > 0) process.exit(1);
}

main();
