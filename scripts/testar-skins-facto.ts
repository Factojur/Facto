/**
 * Skins visíveis (0 tokens extra).
 * Uso: npx tsx scripts/testar-skins-facto.ts
 */
import { detectarTesesCanonicas } from "../src/lib/teses-canonicas";
import {
  blocoPecaCabivelPrompt,
  montarEtapaMaestro,
  montarQueryPesquisa,
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

  const vinculos = resolverVinculosPeca({
    areaId: "jec",
    especie: "execucao",
    tipoAcao: "Cumprimento de sentença",
    fatos: AUTOS_ASTREINTES,
  });
  assert(vinculos.especie === "embargos", "Maestro troca execução por embargos");
  assert(vinculos.incidenteAberto, "detecta incidente já aberto");
  assert(vinculos.cabivel === "embargos", "último ato = embargos");
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
  assert(maestro.status === "ok", "espécie já alinhada ao último ato");

  const bloco = blocoPecaCabivelPrompt(vinculos);
  assert(/PEÇA A PROTOCOLAR AGORA/i.test(bloco), "prompt nomeia a peça");
  assert(/NÃO redija abertura/i.test(bloco), "proíbe reabrir cumprimento");
  assert(/opor os presentes/i.test(bloco), "prompt leva o conectivo");

  const query = montarQueryPesquisa({
    areaId: "jec",
    tipoAcao: "Cumprimento de sentença",
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
  assert(/restauração das astreintes/.test(reforco), "leva pedidos do formulário");
  assert(/NÃO pedir/.test(reforco), "MLE desligado vira vedação");
  assert(/Justiça gratuita: incluir/.test(reforco), "JG ligado vira obrigação");
  assert(reforco.includes("erro material nas astreintes"), "mantém a estratégia da triagem");

  const inicial = resolverVinculosPeca({
    areaId: "jec",
    especie: "peticao-inicial",
    tipoAcao: "Indenização por falha do serviço",
    fatos: "O banco não devolveu o PIX. Quero dano moral e material.",
  });
  assert(inicial.especie === "peticao-inicial", "inicial permanece inicial");
  assert(!inicial.incidenteAberto, "sem incidente aberto");
  const blocoInicial = blocoPecaCabivelPrompt(inicial);
  assert(
    !/NÃO redija abertura/i.test(blocoInicial),
    "inicial não leva vedação de cumprimento"
  );

  const { oks, falhas } = stats();
  console.log(`\n${oks} ok, ${falhas} falhas`);
  if (falhas > 0) process.exit(1);
}

main();
