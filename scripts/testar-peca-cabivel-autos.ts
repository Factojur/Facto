/**
 * Inferência da peça a protocolar a partir dos autos (0 tokens).
 * Uso: npx tsx scripts/testar-peca-cabivel-autos.ts
 */

import { ajustarEspecieCabivel, incidenteExecucaoJaAberto, pecaCabivelAposUltimoAto, rotulosEpigrafePeca, linhasEpigrafePeca, extrairMetadadosAutos, extrairUltimoAtoDoTexto, janelaRelatoParaTriagem, analisarJanelaRelato, formatarEnderecoAdvogado, LIMITE_RELATO_TRIAGEM_CHARS } from "../src/lib/peca-cabivel-autos";
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
  const ultimo = extrairUltimoAtoDoTexto(AUTOS_ASTREINTES);
  assert(Boolean(ultimo?.includes("DECIS")), "extrai último ato (decisão)");
  assert(
    pecaCabivelAposUltimoAto("jec", AUTOS_ASTREINTES) === "agravo-instrumento",
    "JEC + decisão sobre astreintes → agravo (não reabre cumprimento)"
  );
  assert(
    pecaCabivelAposUltimoAto("civil", AUTOS_ASTREINTES) === "agravo-instrumento",
    "justiça comum + decisão sobre astreintes → agravo"
  );

  const ajustado = ajustarEspecieCabivel({
    areaId: "jec",
    especie: "execucao",
    tipoAcao: "Cumprimento de sentença",
    fatos: AUTOS_ASTREINTES,
  });
  assert(ajustado === "agravo-instrumento", "overlay troca execução por agravo");

  const inferido = ajustarEspecieCabivel({
    areaId: "jec",
    especie: "execucao",
    tipoAcao: "Cumprimento de sentença",
    fatos: AUTOS_ASTREINTES,
  });
  assert(inferido === "agravo-instrumento", "ajustarEspecieCabivel não reabre o incidente");

  // Pista explícita sem overlay de autos (inferirEspecieDaArea é pass-through).
  assert(
    inferirEspecieDaArea(
      "jec",
      "Cumprimento de sentença",
      AUTOS_ASTREINTES,
      "execucao"
    ) === "execucao",
    "inferirEspecieDaArea preserva a pista explícita (overlay fica em ajustarEspecieCabivel)"
  );

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

  const apel = rotulosEpigrafePeca("civil", "apelacao");
  assert(
    apel.ativo === "Apelante" && apel.passivo === "Apelado",
    "apelação Apelante/Apelado"
  );
  const recInom = rotulosEpigrafePeca("jec", "recurso-inominado");
  assert(
    recInom.ativo === "Recorrente" && recInom.passivo === "Recorrido",
    "recurso inominado Recorrente/Recorrido"
  );
  const agr = rotulosEpigrafePeca("civil", "agravo-instrumento");
  assert(
    agr.ativo === "Agravante" && agr.passivo === "Agravado",
    "agravo Agravante/Agravado"
  );
  const ed = rotulosEpigrafePeca("civil", "embargos-declaracao");
  assert(
    ed.ativo === "Embargante" && ed.passivo === "Embargado",
    "ED Embargante/Embargado"
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

  const epiApelPassivo = linhasEpigrafePeca({
    areaId: "civil",
    especie: "apelacao",
    numeroProcesso: "1000000-00.2024.8.26.0100",
    autores,
    reus,
    poloAdvocacia: "passivo",
  });
  assert(
    epiApelPassivo.some((l) =>
      /Apelante: FACULDADES METROPOLITANAS/.test(l)
    ),
    "apelação polo passivo: Apelante = réu"
  );
  assert(
    epiApelPassivo.some((l) => /Apelado: JEFFERSON/.test(l)),
    "apelação polo passivo: Apelado = autor"
  );

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
  const metaJanela = analisarJanelaRelato(
    "A".repeat(LIMITE_RELATO_TRIAGEM_CHARS + 50_000) + " último ato"
  );
  assert(metaJanela.truncado, "metadados: PDF longo truncado");
  assert(metaJanela.charsTotais > LIMITE_RELATO_TRIAGEM_CHARS, "metadados: chars totais");

  const AUTOS_SENTENCA_FAMILIA = `
TRIBUNAL DE JUSTIÇA DO ESTADO DE SÃO PAULO
COMARCA DE ITARARÉ
1ª VARA
Processo Digital nº: 1000011-77.2025.8.26.0279
Classe - Assunto Alimentos - Fixação
Requerente: Luisa de Almeida Herlemann
Requerido: Flávio Henrique de Oliveira Herlemann
SENTENÇA
Ante o exposto, JULGO PARCIALMENTE PROCEDENTE o pedido, com
resolução de mérito, com fundamento no artigo 487, I, do Código de Processo Civil, para:
A) RECONHECER e DISSOLVER a união estável;
G) CONDENAR o requerido ao pagamento de alimentos no valor equivalente a 1/3
dos seus rendimentos líquidos mensais.
P.I.C.
Itararé, 12 de dezembro de 2025.
`;
  assert(
    pecaCabivelAposUltimoAto("familia", AUTOS_SENTENCA_FAMILIA) === "apelacao",
    "família + sentença de mérito → apelação"
  );
  assert(
    pecaCabivelAposUltimoAto("jec", AUTOS_SENTENCA_FAMILIA) === "recurso-inominado",
    "JEC + sentença de mérito → recurso inominado"
  );
  assert(
    ajustarEspecieCabivel({
      areaId: "familia",
      especie: "",
      fatos: AUTOS_SENTENCA_FAMILIA,
      poloAdvocacia: "passivo",
    }) === "apelacao",
    "overlay vazio + sentença → apelação (polo passivo)"
  );
  assert(
    pecaCabivelAposUltimoAto("jec", AUTOS_ASTREINTES) === "agravo-instrumento",
    "cumprimento + decisão interlocutória não vira apelação"
  );

  const { oks, falhas } = stats();
  console.log(`\n${oks} ok, ${falhas} falhas`);
  if (falhas > 0) process.exit(1);
}

main();
