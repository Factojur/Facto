/**
 * Réplica à contestação — detecção e extração de teses.
 * Uso: npx tsx scripts/testar-replica-contestacao.ts
 */
import {
  analisarReplicaContestacao,
  detectarContestacao,
  montarBriefingReplica,
} from "../src/lib/replica-contestacao";
import { createSuite } from "./casos-ouro/suite";

const AMOSTRA = `
CONTESTAÇÃO

Excelentíssimo Senhor Doutor Juiz de Direito...

I - PRELIMINARES

1) Incompetência absoluta do juízo, pois a matéria é de competência da Justiça Federal.

2) Ilegitimidade passiva do requerido, que não participou da relação jurídica narrada na inicial.

II - DO MÉRITO

3) No mérito, improcedem os pedidos autorais. Não houve falha na prestação do serviço.

4) Inexistência de dano moral indenizável — mero aborrecimento cotidiano.

DOS PEDIDOS

a) O acolhimento das preliminares com extinção sem resolução do mérito;
b) Subsidiariamente, a improcedência total dos pedidos;
c) Condenação do autor em custas e honorários.

Nestes termos, pede deferimento.
`;

function main() {
  const { assert, stats } = createSuite();

  assert(detectarContestacao(AMOSTRA), "detecta contestação na amostra");
  assert(
    !detectarContestacao("Petição inicial simples sem defesa."),
    "não detecta em texto neutro"
  );

  const analise = analisarReplicaContestacao({ texto: AMOSTRA });
  assert(Boolean(analise?.detectada), "análise marca detectada");
  assert(
    (analise?.teses.length ?? 0) >= 3,
    `extrai teses (${analise?.teses.length ?? 0})`
  );
  assert(
    Boolean(analise?.teses.some((t) => t.tipo === "preliminar")),
    "há preliminar"
  );
  assert(Boolean(analise?.teses.some((t) => t.tipo === "merito")), "há mérito");

  const briefing = montarBriefingReplica(analise?.teses ?? []);
  assert(briefing.includes("IMPUGNAÇÃO"), "briefing forense");
  assert(briefing.includes("PRELIMINARES"), "briefing com seção");

  const forcaReplica = analisarReplicaContestacao({
    texto: AMOSTRA,
    especiePeca: "replica",
  });
  assert(Boolean(forcaReplica?.detectada), "espécie réplica força análise");

  stats();
}

main();
