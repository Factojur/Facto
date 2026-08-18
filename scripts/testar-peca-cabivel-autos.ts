/**
 * Inferência da peça a protocolar a partir dos autos (0 tokens).
 * Uso: npx tsx scripts/testar-peca-cabivel-autos.ts
 */

import { ajustarEspecieCabivel, incidenteExecucaoJaAberto, pecaCabivelAposUltimoAto, rotulosEpigrafePeca, linhasEpigrafePeca, extrairMetadadosAutos, janelaRelatoParaTriagem, formatarEnderecoAdvogado, LIMITE_RELATO_TRIAGEM_CHARS } from "../src/lib/peca-cabivel-autos";
import { formatarEnderecamentoPadrao, rotuloAreaJudiciaria } from "../src/lib/endereco-comarca";
import { inferirEspecieDaArea } from "../src/lib/peca-especie-area";
import { formatarBlocoPartesJaQualificadas } from "../src/lib/partes-ja-qualificadas";
import { autorVazio } from "../src/lib/autor-types";
import { reuVazio } from "../src/lib/reu-types";
import { montarMarcadorEspaco6, parseMarcadorEspaco } from "../src/lib/formatacao-forense";
import { createSuite } from "./casos-ouro/suite";

const AUTOS_ASTREINTES = `
CUMPRIMENTO DE SENTENÇA Nº 0006509-93.2023.8.26.0016
Foro Central Juizados Especiais Cíveis
Juizado Especial Cível Anexo Mackenzie
São Paulo/SP
Exequente: JEFFERSON DA SILVA RIBEIRO
Executada: FACULDADES METROPOLITANAS UNIDAS EDUCACIONAIS LTDA
O incidente de cumprimento já está instaurado.
DECISÃO
Juiz de Direito: Dr. André Yukio Ogata
boletos para pagamento de mensalidades vincendas, sob pena de multa diária de R$100,00.
Contudo, este Juízo reconhece que houve erro material na fixação da multa diária, não em seu valor, na forma de aplicação,
fixando multa de R$100,00 por ato de descumprimento, no importe total de R$600,00.
`;

function main() {
  const { assert, stats } = createSuite();

  assert(incidenteExecucaoJaAberto(AUTOS_ASTREINTES), "detecta cumprimento já aberto");
  assert(
    pecaCabivelAposUltimoAto("jec", AUTOS_ASTREINTES) === "embargos",
    "JEC + erro material em astreintes → embargos (não reabre cumprimento)"
  );
  assert(
    pecaCabivelAposUltimoAto("civil", AUTOS_ASTREINTES) === "embargos-declaracao",
    "justiça comum + erro material → embargos de declaração"
  );

  const ajustado = ajustarEspecieCabivel({
    areaId: "jec",
    especie: "execucao",
    tipoAcao: "Cumprimento de sentença",
    fatos: AUTOS_ASTREINTES,
  });
  assert(ajustado === "embargos", "overlay troca execução por embargos");

  const inferido = inferirEspecieDaArea(
    "jec",
    "Cumprimento de sentença",
    AUTOS_ASTREINTES,
    "execucao"
  );
  assert(inferido === "embargos", "inferirEspecieDaArea não reabre o incidente");

  const meta = extrairMetadadosAutos(AUTOS_ASTREINTES);
  assert(meta.numeroProcesso === "0006509-93.2023.8.26.0016", "extrai CNJ");
  assert(/são paulo/i.test(meta.cidade ?? "") || meta.uf === "SP", "extrai comarca SP");
  assert(/ANEXO MACKENZIE/i.test(meta.complementoOrgao ?? ""), "extrai Anexo Mackenzie");

  const end = formatarEnderecamentoPadrao({
    comarca: {
      foro: "Juizado Especial Cível Anexo Mackenzie — Foro Central — São Paulo/SP",
      numeroProcesso: meta.numeroProcesso ?? undefined,
    },
    areaJudiciaria: rotuloAreaJudiciaria("jec"),
    areaId: "jec",
    especiePeca: "embargos",
    varaEmBranco: false,
  });
  assert(/ANEXO MACKENZIE/i.test(end), "endereçamento usa Anexo Mackenzie");
  assert(/SÃO PAULO\/SP/i.test(end), "endereçamento tem São Paulo/SP");
  assert(!/___/.test(end), "incidental sem vara em branco");
  assert(!/TURMA RECURSAL|TRIBUNAL DE JUSTIÇA/i.test(end), "ED endereça ao juiz do JEC");

  const agravoJec = formatarEnderecamentoPadrao({
    comarca: { cidade: "São Paulo", uf: "SP" },
    areaJudiciaria: rotuloAreaJudiciaria("jec"),
    areaId: "jec",
    especiePeca: "agravo-instrumento",
  });
  assert(/TURMA RECURSAL/i.test(agravoJec), "agravo JEC continua na Turma Recursal");

  const rotulos = rotulosEpigrafePeca("jec", "embargos", AUTOS_ASTREINTES);
  assert(rotulos.ativo === "Exequente", "epígrafe Exequente na fase de cumprimento");
  assert(rotulos.passivo === "Executado", "epígrafe Executado na fase de cumprimento");

  const rec = rotulosEpigrafePeca("trabalhista", "reclamacao");
  assert(rec.ativo === "Reclamante" && rec.passivo === "Reclamado", "trabalhista Reclamante/Reclamado");

  const reconv = rotulosEpigrafePeca("civil", "reconvencao");
  assert(
    reconv.ativo === "Reconvinte" && reconv.passivo === "Reconvindo",
    "reconvenção Reconvinte/Reconvindo"
  );

  const autores = [autorVazio({ nomeCompleto: "JEFFERSON DA SILVA RIBEIRO" })];
  const reus = [
    reuVazio({
      tipo: "pj",
      razaoSocial: "FACULDADES METROPOLITANAS UNIDAS EDUCACIONAIS LTDA",
    }),
  ];
  const epi = linhasEpigrafePeca({
    areaId: "jec",
    especie: "embargos",
    numeroProcesso: "0006509-93.2023.8.26.0016",
    autores,
    reus,
    fatos: AUTOS_ASTREINTES,
  });
  assert(epi.some((l) => /Processo nº:/.test(l)), "epígrafe tem Processo nº");
  assert(epi.some((l) => /Exequente:/.test(l)), "epígrafe tem Exequente");
  assert(epi.some((l) => /Executado:/.test(l)), "epígrafe tem Executado");

  const marcador = montarMarcadorEspaco6(null, epi);
  const parseado = parseMarcadorEspaco(marcador);
  assert((parseado?.epigrafe?.length ?? 0) >= 3, "marcador serializa as 3 linhas");

  const bloco = formatarBlocoPartesJaQualificadas({
    autores,
    reus,
    advogadoNome: "Maria Advogada",
    oabQualificacao: "OAB/SP 147099",
    enderecoAdvogado: "Rua da Consolação, 100, São Paulo/SP",
    especie: "embargos",
    areaId: "jec",
  });
  assert(/Rua da Consolação/.test(bloco), "usa endereço do advogado");
  assert(!/\[endereço do advogado\]/.test(bloco), "não deixa placeholder de endereço");
  assert(/opor os presentes/.test(bloco), "conectivo dos embargos após Vossa Excelência");

  const endAdv = formatarEnderecoAdvogado({
    escritorio: {
      usarTimbre: false,
      nomeEscritorio: "",
      endereco: "Av. Paulista, 1000",
      cidadeUf: "São Paulo/SP",
      telefone: "",
      emailEscritorio: "",
    },
  });
  assert(Boolean(endAdv?.includes("Av. Paulista")), "endereço do escritório");

  const autosMedios = "capa. ".repeat(20_000) + "último ato da decisão";
  assert(
    janelaRelatoParaTriagem(autosMedios) === autosMedios.trim(),
    "autos até o teto entram inteiros"
  );
  const janela = janelaRelatoParaTriagem(
    "A".repeat(LIMITE_RELATO_TRIAGEM_CHARS + 50_000) + " último ato"
  );
  assert(janela.includes("último ato"), "janela prioriza o fim do relato");
  assert(
    janela.length <= LIMITE_RELATO_TRIAGEM_CHARS + 200,
    "janela respeita o teto"
  );

  const { oks, falhas } = stats();
  console.log(`\n${oks} ok, ${falhas} falhas`);
  if (falhas > 0) process.exit(1);
}

main();
