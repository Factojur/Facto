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

  const hcTutela = detectarAlertasFatosPedidos({
    fatos:
      "Paciente preso em flagrante. Peço habeas corpus com liminar para relaxamento da prisão.",
    pedidos: ["Concessão da ordem de habeas corpus"],
    tutelaUrgencia: true,
    especiePeca: "habeas-corpus",
  });
  assert(
    !hcTutela.some((a) => a.id === "tutela-sem-fato"),
    "HC com liminar não gera alerta de tutela CPC"
  );

  const semPrejuizoDe = detectarAlertasFatosPedidos({
    fatos:
      "Decisão reduziu astreintes sem prejuízo de outras medidas. Multa diária de R$ 100.",
    pedidos: ["Concessão da ordem de mandado de segurança"],
    totalValorCentavos: 60_000,
    especiePeca: "mandado-seguranca",
  });
  assert(
    !semPrejuizoDe.some((a) => a.id === "valor-fatos-nega"),
    "sem prejuízo de (locução) + MS/astreintes não gera alerta"
  );

  const msAstreintes = detectarAlertasFatosPedidos({
    fatos:
      "Cumprimento de sentença. Juiz reduziu multa diária (astreintes) para R$ 600 no total.",
    pedidos: ["Concessão de mandado de segurança"],
    totalValorCentavos: 60_000,
    especiePeca: "mandado-seguranca",
  });
  assert(
    !msAstreintes.some((a) => a.id === "valor-fatos-nega"),
    "MS com astreintes não gera alerta indenizatório"
  );

  const valorReal = detectarAlertasFatosPedidos({
    fatos: "O autor não sofreu prejuízo material.",
    pedidos: ["Condenação em danos materiais de R$ 5.000"],
    totalValorCentavos: 500_000,
    especiePeca: "peticao-inicial",
  });
  assert(
    valorReal.some((a) => a.id === "valor-fatos-nega"),
    "contradição real de prejuízo material ainda alerta"
  );

  const { oks, falhas } = stats();
  console.log(`\nAlerta fatos×pedidos: ${oks} ok, ${falhas} falha(s).`);
  if (falhas > 0) process.exit(1);
}

main();
