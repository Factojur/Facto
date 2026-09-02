/**
 * Chat FACTO — helpers de roteamento, payload e polo.
 * Uso: npx tsx scripts/testar-chat-minuta.ts
 */
import {
  aplicarInferenciaAreaAoEstado,
  aplicarPreenchimentoAoEstado,
  areaExigeConfirmacao,
  areaSugereConfirmacao,
  confirmarAreaChat,
  estadoCasoChatVazio,
  garantirAreaParaRedacao,
  hrefChatMinuta,
  inferirAreaChat,
  montarPayloadGeracaoChat,
  podeMontarPlanoChat,
  precisaEscolherTribunais,
  poloExigeConfirmacaoChat,
  sanitizarPartesPayloadChat,
  validarPoloChat,
} from "../src/lib/chat-minuta";
import { limiteAjustesPorPlano } from "../src/lib/ia/ajustar-trecho-peca";
import { sanitizarEstadoChat } from "../src/lib/chat-minuta-storage";
import {
  classificarIntencaoChat,
  respostaMetaLeiJuris,
} from "../src/lib/chat-minuta-intencao";
import { extrairPartesDoRelato } from "../src/lib/extrair-partes-relato";
import { detectarRelatoMistoAreas } from "../src/lib/chat-anti-contaminacao";
import { autoresAPartirDosNomes, reusAPartirDosNomes } from "../src/lib/partes-ja-qualificadas";
import { pecaUsaEmFaceDeReu } from "../src/lib/peca-especie-area";
import {
  extrairQualificacaoDoRelato,
  ufDaQualificacao,
} from "../src/lib/extrair-qualificacao-relato";
import { organizarCasoLocal } from "../src/lib/organizar-caso-local";
import { createSuite } from "./casos-ouro/suite";

function main() {
  const { assert, stats } = createSuite();

  assert(
    hrefChatMinuta("jec") === "/dashboard?area=jec",
    "href chat com área"
  );
  assert(hrefChatMinuta() === "/dashboard", "href chat sem área");
  assert(
    hrefChatMinuta(undefined, { nova: true }) === "/dashboard?nova=1",
    "href chat nova conversa"
  );
  assert(
    hrefChatMinuta("jec", { nova: true }) === "/dashboard?area=jec&nova=1",
    "href chat área + nova"
  );

  const inferJec = inferirAreaChat({
    texto: "Caso no juizado especial cível Lei 9.099",
    leigo: true,
  });
  assert(inferJec.areaId === "jec", "inferência JEC");

  const inferTrab = inferirAreaChat({
    texto: "Reclamação trabalhista CLT verbas rescisórias",
  });
  assert(inferTrab.areaId === "trabalhista", "inferência trabalhista");

  const inferHc = inferirAreaChat({
    texto:
      "Meu cliente Ricardo Alves foi preso em flagrante por furto simples. Peço habeas corpus contra prisão preventiva. Tem moradia e família na cidade.",
  });
  assert(inferHc.areaId === "criminal", "HC + família na cidade → penal");

  let estado = estadoCasoChatVazio("jec");
  estado = aplicarPreenchimentoAoEstado(estado, {
    especiePeca: "peticao-inicial",
    tipoAcao: "Indenização por danos morais",
    fatos: "O autor comprou produto com vício e não foi reparado.",
    autoresNomes: ["João Silva"],
    reusNomes: ["Loja XYZ Ltda"],
    numeroProcesso: null,
    foro: "São Paulo",
    cidade: "São Paulo",
    uf: "SP",
    numeroVara: null,
    especieDoProcesso: null,
    ultimoAto: null,
    pedidos: ["Indenização por danos morais"],
    pedirJusticaGratuita: false,
    tutelaUrgencia: false,
    danosMorais: true,
    danosMateriais: false,
    tesesIds: [],
    camposIncertos: [],
    resumoConferencia: "Caso consumidor JEC.",
  });

  assert(estado.tipoAcao.includes("Indenização"), "preenchimento tipo ação");
  assert(estado.autoresNomes[0] === "João Silva", "preenchimento autor");

  const payload = montarPayloadGeracaoChat(estado);
  assert(payload.areaId === "jec", "payload areaId");
  assert(payload.fatos.length > 20, "payload fatos");
  assert((payload.pedidosUsuario?.length ?? 0) === 1, "payload pedidos");

  assert(
    !poloExigeConfirmacaoChat("jec", "peticao-inicial"),
    "inicial JEC não exige polo ambos"
  );
  assert(
    !poloExigeConfirmacaoChat("jec", "contestacao"),
    "contestação JEC é passivo — não exige chip ambos"
  );
  assert(
    poloExigeConfirmacaoChat("jec", "recurso-inominado"),
    "recurso inominado JEC exige polo ambos"
  );

  const semPolo = validarPoloChat({
    ...estado,
    especiePeca: "recurso-inominado",
    poloAdvocacia: null,
    poloConfirmado: false,
  });
  assert(Boolean(semPolo) && /polo/i.test(semPolo!), "sem polo: aviso (não bloqueio)");

  const comPolo = validarPoloChat({
    ...estado,
    especiePeca: "recurso-inominado",
    poloAdvocacia: "passivo",
    poloConfirmado: true,
  });
  assert(comPolo === null, "com polo confirmado: sem aviso");

  estado = {
    ...estado,
    linkNuvem: "https://drive.google.com/exemplo",
    leiMunicipalTitulo: "Lei 123/2020",
    leiMunicipalTexto: "Art. 1º Exemplo de norma municipal.",
    provasCaso: [
      {
        id: "p1",
        nome: "contrato.pdf",
        texto: "Texto da prova com mais de quarenta caracteres para a IA.",
        tipo: "documento",
      },
    ],
    jurisCaso: [
      {
        id: "j1",
        tipo: "acordao",
        titulo: "TJSP Apelação",
        texto: "Ementa de teste para juris do caso.",
        nomeArquivo: null,
      },
    ],
    valoresCausa: {
      danosMateriais: [
        {
          id: "v1",
          descricao: "Restituição",
          valor: "1.000,00",
        },
      ],
      danosMorais: [],
    },
  };

  const payloadExtra = montarPayloadGeracaoChat(estado);
  assert(Boolean(payloadExtra.linkNuvem?.includes("drive")), "payload link nuvem");
  assert((payloadExtra.provasTexto?.length ?? 0) === 1, "payload provas texto");
  assert(
    Boolean(payloadExtra.leiMunicipal?.texto?.includes("Art. 1")),
    "payload lei municipal"
  );
  assert((payloadExtra.jurisDoCaso?.length ?? 0) === 1, "payload juris do caso");
  assert(
    (payloadExtra.valoresCausa?.danosMateriais.length ?? 0) === 1,
    "payload valores causa"
  );

  assert(limiteAjustesPorPlano("jec", true) === 3, "ajustes leigo");
  assert(limiteAjustesPorPlano("pro", false) === 5, "ajustes pro");
  assert(limiteAjustesPorPlano("mensal", false) === 3, "ajustes completo");

  const comBase64 = sanitizarEstadoChat({
    ...estado,
    jurisCaso: [
      {
        id: "j1",
        tipo: "acordao",
        titulo: "Teste",
        texto: "",
        nomeArquivo: "doc.pdf",
        arquivo: { nome: "doc.pdf", mimeType: "application/pdf", base64: "abc" },
      },
    ],
  });
  assert(
    comBase64.jurisCaso[0]?.arquivo?.base64 === "",
    "sanitiza base64 juris"
  );

  assert(
    classificarIntencaoChat({
      texto: "não estou encontrando a jurisprudência e a lei, consegue consultar?",
      casoJaOrganizado: true,
    }) === "meta_lei_juris",
    "intenção lei/juris com caso aberto"
  );
  assert(
    classificarIntencaoChat({
      texto: "como funciona o assistente?",
      casoJaOrganizado: true,
    }) === "meta_ajuda",
    "intenção ajuda"
  );
  assert(
    classificarIntencaoChat({
      texto:
        "O autor João teve o corte de água em 10/01 e pede danos morais de R$ 5.000 contra a concessionária",
      casoJaOrganizado: false,
    }) === "relato",
    "intenção relato novo"
  );
  assert(
    respostaMetaLeiJuris().includes("Provas / lei e juris"),
    "resposta meta aponta complementos"
  );

  const inferPrev = inferirAreaChat({
    texto:
      "Pedi BPC/LOAS para meu filho. O INSS indeferiu. Renda familiar per capita R$ 180.",
  });
  assert(inferPrev.areaId === "previdenciario", "BPC/INSS → previdenciário");

  const partesBpc = extrairPartesDoRelato(
    "Sou João Silva, brasileiro, casado, pedreiro, CPF 123.456.789-09. Pedi BPC para meu filho Lucas. O INSS indeferiu."
  );
  assert(partesBpc.autoresNomes[0]?.includes("Lucas"), "BPC → beneficiário autor");
  assert(
    partesBpc.reusNomes.some((n) => /INSS/i.test(n)),
    "INSS como réu"
  );

  const partesEnel = extrairPartesDoRelato(
    "Sou Maria Santos, brasileira, CPF 529.982.247-25. A Enel São Paulo cortou a energia em 15/01/2026."
  );
  assert(partesEnel.reusNomes.some((n) => /Enel/i.test(n)), "Enel cortou → réu");

  const partesHc = extrairPartesDoRelato(
    "Meu cliente Ricardo Alves, brasileiro, CPF 111.444.777-35. Peço habeas corpus contra prisão preventiva."
  );
  assert(
    partesHc.autoresNomes[0]?.includes("Ricardo"),
    "meu cliente → paciente/autor"
  );
  assert(
    !partesHc.reusNomes.some((n) => /Ricardo/i.test(n)),
    "HC: paciente não é réu"
  );
  assert(
    pecaUsaEmFaceDeReu("impetrando o presente habeas corpus, pelos fundamentos a seguir.") ===
      false,
    "HC sem em face de"
  );

  const payloadEnel = montarPayloadGeracaoChat({
    ...estadoCasoChatVazio("jec"),
    fatos:
      "Sou Maria Santos, brasileira, CPF 529.982.247-25, Rua das Flores 100, São Paulo/SP. A Enel São Paulo cortou a energia em 15/01/2026. Pede tutela e danos morais R$ 8.000.",
    tipoAcao: "Petição inicial",
    pedidos: ["Tutela", "Danos morais"],
  });
  const reuEnel = payloadEnel.reus?.[0];
  assert(reuEnel?.tipo === "pj", "Enel → PJ no payload");
  assert(
    (payloadEnel.autores?.[0]?.cpf ?? "").includes("529"),
    "CPF fica só no autor"
  );

  const partesBpcOld = extrairPartesDoRelato(
    "Sou João Silva, brasileiro, casado, pedreiro, CPF 123.456.789-09. Pedi BPC para meu filho. O INSS indeferiu."
  );
  assert(partesBpcOld.autoresNomes[0]?.includes("João"), "BPC sem nome filho → representante");

  const partesCaso = extrairPartesDoRelato(
    "O autor João Silva teve corte de água em 10/01/2026 contra a Companhia de Saneamento Básico - Sabesp. Pede danos morais."
  );
  assert(partesCaso.autoresNomes[0] === "João Silva", "extrai autor do relato");
  assert(
    partesCaso.reusNomes.some((n) => /Sabesp|Companhia/i.test(n)),
    "extrai réu do relato"
  );

  const payloadPartes = montarPayloadGeracaoChat({
    ...estadoCasoChatVazio("jec"),
    fatos:
      "A autora Maria Santos, brasileira, teve corte indevido de água contra a Enel São Paulo. Pede tutela e danos morais.",
    tipoAcao: "Petição inicial",
    pedidos: ["Tutela", "Danos morais"],
  });
  assert(
    payloadPartes.autores?.[0]?.nomeCompleto === "Maria Santos",
    "payload preview inclui autor extraído"
  );
  assert(
    Boolean(
      payloadPartes.reus?.some((r) =>
        /Enel/i.test(r.tipo === "pj" ? r.razaoSocial : r.nomeCompleto)
      )
    ),
    "payload preview inclui réu extraído"
  );

  const casoAgua = organizarCasoLocal({
    areaId: "jec",
    relato:
      "O autor João Silva, professor, teve corte de água em 10/01/2026 contra a Companhia de Saneamento - Sabesp. Pede tutela de urgência, danos morais R$ 8.000,00 e justiça gratuita. Provas: print, nota. Lei Municipal nº 15.872/2018 (arts. 7 e 8).",
  }).preenchimento;
  assert(casoAgua.autoresNomes[0] === "João Silva", "local extrai autor");
  assert(casoAgua.tutelaUrgencia === true, "local detecta tutela");
  assert(casoAgua.pedirJusticaGratuita === true, "local detecta JG");
  assert(casoAgua.pedidos.length >= 2, "local extrai pedidos");

  const casoHc = organizarCasoLocal({
    areaId: "criminal",
    relato:
      "Meu cliente Ricardo Alves foi preso em flagrante por furto simples. Peço habeas corpus com liminar contra prisão preventiva.",
  }).preenchimento;
  assert(casoHc.tutelaUrgencia !== true, "HC: liminar não marca tutela CPC");

  const infHc = inferirAreaChat({
    texto:
      "Meu cliente Ricardo Alves foi preso em flagrante por furto simples. Peço habeas corpus com liminar.",
    leigo: false,
  });
  assert(infHc.areaId === "criminal" && infHc.confianca === "alta", "HC → criminal alta");
  const estadoHc = aplicarInferenciaAreaAoEstado(estadoCasoChatVazio("jec"), infHc);
  assert(estadoHc.areaConfirmada === true, "HC alta confirma área auto");

  const infAmb = inferirAreaChat({
    texto:
      "O casal discute guarda do filho e pensão alimentícia, mas há também cobrança de dívida entre ex-cônjuges.",
    leigo: false,
  });
  if (infAmb.confianca === "baixa") {
    assert(!areaExigeConfirmacao(infAmb), "baixa não exige chip (chat livre MinutaIA)");
    const estadoBaixa = aplicarInferenciaAreaAoEstado(estadoCasoChatVazio("jec"), infAmb);
    assert(estadoBaixa.areaConfirmada === true, "baixa auto-confirma para plano");
  }
  if (infAmb.confianca === "media") {
    assert(!areaSugereConfirmacao(infAmb, false), "média não exibe chip (auto)");
    const estadoMed = aplicarInferenciaAreaAoEstado(estadoCasoChatVazio("jec"), infAmb);
    assert(estadoMed.areaConfirmada === true, "média auto-confirma para plano");
  }
  assert(!podeMontarPlanoChat(estadoCasoChatVazio("jec")), "plano bloqueado sem fatos");
  const estadoComFatos = estadoCasoChatVazio("jec");
  estadoComFatos.fatos = "x".repeat(50);
  estadoComFatos.tipoAcao = "Ação";
  estadoComFatos.areaInferida = { areaId: "civil", confianca: "baixa", alternativas: [] };
  assert(podeMontarPlanoChat(estadoComFatos), "plano com área inferida sem confirmar");
  const redacao = garantirAreaParaRedacao(estadoComFatos);
  assert(redacao.areaConfirmada, "garantir área na redação");
  const confirmado = confirmarAreaChat(
    aplicarInferenciaAreaAoEstado(estadoCasoChatVazio("jec"), {
      areaId: "familia",
      confianca: "media",
      alternativas: ["civil"],
    }),
    "familia"
  );
  assert(confirmado.areaConfirmada && confirmado.areaId === "familia", "confirmar área");

  const estadoQual = estadoCasoChatVazio("jec");
  estadoQual.fatos =
    "João Silva, CPF 123.456.789-09, residente na Rua das Flores, 100, Campinas/SP, contra Loja ABC Ltda.";
  estadoQual.autoresNomes = ["João Silva"];
  estadoQual.reusNomes = ["Loja ABC Ltda"];
  estadoQual.tipoAcao = "Indenização";
  const payloadQual = montarPayloadGeracaoChat(estadoQual);
  assert(
    Boolean(payloadQual.autores?.[0]?.cpf?.includes("123")),
    "qualificação CPF no preview"
  );

  const estadoTrib = {
    ...estadoCasoChatVazio("jec"),
    comarca: { uf: "SP", foro: "São Paulo" },
    fatos: "x".repeat(50),
    tipoAcao: "Indenização",
  };
  const payloadTrib = montarPayloadGeracaoChat(estadoTrib);
  assert(
    (payloadTrib.tribunaisPreferidos ?? []).includes("tjsp"),
    "TJSP auto com UF SP"
  );

  assert(
    classificarIntencaoChat({
      texto: "inclua pedido de tutela de urgência",
      casoJaOrganizado: true,
      pecaGerada: true,
    }) === "ajuste_peca",
    "intenção ajuste pós-redação"
  );

  const estadoVelho = {
    ...estadoCasoChatVazio("jec"),
    fatos: "x".repeat(50),
    tipoAcao: "Indenização",
  };
  delete (estadoVelho as { tribunaisPreferidos?: string[] }).tribunaisPreferidos;
  const san = sanitizarEstadoChat(estadoVelho as never);
  assert(Array.isArray(san.tribunaisPreferidos), "sessão antiga: tribunais array");
  assert(
    precisaEscolherTribunais(san) === true,
    "sessão antiga: precisa escolher tribunais"
  );

  const endCompleto = extrairQualificacaoDoRelato(
    "Maria Silva, CPF 529.982.247-25, residente e domiciliada na Rua das Flores, nº 100, apto 12, bairro Centro, CEP 01310-100, São Paulo/SP, e-mail maria@teste.com, telefone (11) 98888-7777, contra Loja XYZ Ltda, CNPJ 11.222.333/0001-81, Av. Paulista, 1000, São Paulo/SP."
  );
  assert(Boolean(endCompleto.autor.cpf?.includes("529")), "endereço: CPF autor");
  assert(endCompleto.autor.cep === "01310-100", "endereço: CEP rotulado");
  assert(
    /Flores/i.test(endCompleto.autor.logradouro ?? ""),
    "endereço: logradouro residente"
  );
  assert(endCompleto.autor.numero === "100", "endereço: número");
  assert(/apto/i.test(endCompleto.autor.complemento ?? ""), "endereço: complemento");
  assert(endCompleto.autor.bairro === "Centro", "endereço: bairro");
  assert(endCompleto.autor.cidade === "São Paulo", "endereço: cidade");
  assert(endCompleto.autor.uf === "SP", "endereço: UF");
  assert(Boolean(endCompleto.autor.email?.includes("maria")), "endereço: e-mail");
  assert(ufDaQualificacao(endCompleto) === "SP", "UF da qualificação");
  assert(endCompleto.reu.cnpj?.length === 14, "endereço: CNPJ réu");

  const endSimples = extrairQualificacaoDoRelato(
    "O autor João, residente na Av. Brasil 500, Campinas-SP, contra Banco ABC."
  );
  assert(/Brasil/i.test(endSimples.autor.logradouro ?? ""), "endereço: Av sem n°");
  assert(endSimples.autor.uf === "SP", "endereço: Campinas-SP");

  const misto = detectarRelatoMistoAreas(
    "Enel cortou energia. Meu cliente preso em flagrante, habeas corpus."
  );
  assert(misto.misto, "detecta relato misto consumidor+penal");

  const hcPartes = sanitizarPartesPayloadChat(
    "criminal",
    "habeas-corpus",
    autoresAPartirDosNomes("Ricardo Alves"),
    reusAPartirDosNomes("Enel São Paulo")
  );
  assert(hcPartes.reus.length === 0, "HC remove Enel do payload");

  const { oks, falhas } = stats();
  console.log(`\n${oks} ok · ${falhas} falha(s)`);
  if (falhas > 0) process.exit(1);
}

main();
