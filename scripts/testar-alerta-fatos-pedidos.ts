/**
 * Detector fatos × pedidos — casos determinísticos.
 * Uso: npx tsx scripts/testar-alerta-fatos-pedidos.ts
 */
import { detectarAlertasFatosPedidos } from "../src/lib/alerta-fatos-pedidos";
import { createSuite } from "./casos-ouro/suite";

function main() {
  const { assert, stats } = createSuite();

  const dm = detectarAlertasFatosPedidos({
    fatos: "O autor não sofreu dano moral relevante.",
    pedidos: ["Condenação em danos morais"],
  });
  assert(
    dm.some((a) => a.id === "dm-fatos-nega-pedido-pede"),
    "dano moral negado nos fatos + pedido"
  );

  const tutela = detectarAlertasFatosPedidos({
    fatos: "Contrato de prestação de serviços celebrado em 2020.",
    pedidos: ["Indenização"],
    tutelaUrgencia: true,
  });
  assert(
    tutela.some((a) => a.id === "tutela-sem-fato"),
    "tutela sem urgência nos fatos"
  );

  const tutelaEnergia = detectarAlertasFatosPedidos({
    fatos:
      "A Enel cortou o fornecimento de energia elétrica em 15/01/2026. A autora mora com filha menor.",
    pedidos: ["Tutela de urgência para religação"],
    tutelaUrgencia: true,
  });
  assert(
    !tutelaEnergia.some((a) => a.id === "tutela-sem-fato"),
    "corte de energia + menor nos fatos justifica tutela"
  );

  const tutelaAgua = detectarAlertasFatosPedidos({
    fatos:
      "A concessionária cortou o fornecimento de água na residência. Falta de água afetou a saúde da filha de 4 anos.",
    pedidos: ["Tutela de urgência para restabelecimento"],
    tutelaUrgencia: true,
  });
  assert(
    !tutelaAgua.some((a) => a.id === "tutela-sem-fato"),
    "corte/saúde nos fatos justifica tutela"
  );

  const jg = detectarAlertasFatosPedidos({
    fatos: "Autor possui alta renda mensal como empresário.",
    pedidos: ["Indenização"],
    pedirJusticaGratuita: true,
  });
  assert(jg.some((a) => a.id === "jg-renda"), "JG com renda alta nos fatos");

  const defesa = detectarAlertasFatosPedidos({
    fatos: "O réu nega os fatos.",
    pedidos: ["Procedência total da inicial"],
    especiePeca: "contestacao",
  });
  assert(
    defesa.some((a) => a.id === "defesa-favorece-autor"),
    "contestação pedindo procedência do autor"
  );

  const ok = detectarAlertasFatosPedidos({
    fatos: "Houve dano moral e urgência imediata.",
    pedidos: ["Danos morais"],
    tutelaUrgencia: true,
  });
  assert(ok.length === 0, "caso coerente sem alertas");

  const { oks, falhas } = stats();
  console.log(`\nAlerta fatos×pedidos: ${oks} ok, ${falhas} falha(s).`);
  if (falhas > 0) process.exit(1);
}

main();
