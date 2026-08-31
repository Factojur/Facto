import { createSuite } from "./casos-ouro/suite";
import {
  extrairDataReferenciaPrazo,
  sugerirPrazoDaPeca,
} from "../src/lib/prazo-intimacao";
import { somarDiasUteisComFeriados } from "../src/lib/feriados-br";

function main() {
  const { assert, stats } = createSuite();

  const ref = extrairDataReferenciaPrazo(
    "Fui intimado em 10/03/2026 para contestar no prazo legal."
  );
  assert(ref !== null, "extrai data com gatilho intimação");
  assert(ref!.getDate() === 10, "dia correto");

  const sem = extrairDataReferenciaPrazo("O contrato foi assinado em 10/03/2026.");
  assert(sem === null, "ignora data sem gatilho de prazo");

  const dica = sugerirPrazoDaPeca({
    fatos: "Publicação da citação em 01/08/2026.",
    especiePeca: "contestacao",
  });
  assert(dica !== null, "contestação gera dica");
  assert(dica!.diasUteis === 15, "contestação = 15 dias úteis");

  const carnaval = new Date(2026, 1, 16, 12, 0, 0);
  const limiteSp = somarDiasUteisComFeriados(carnaval, 5, "SP");
  assert(limiteSp.getMonth() === 1, "pula fim de semana/feriado em fev/2026");

  const { oks, falhas } = stats();
  console.log(`\n${oks} ok, ${falhas} falhas`);
  if (falhas > 0) process.exit(1);
}

main();
