/**
 * Smoke do chat — todas as áreas Fase 1 (0 tokens, pipeline local).
 * Simula: inferência → organizarCasoLocal → polo → plano → payload.
 * Uso: npx tsx scripts/testar-smoke-chat-areas.ts
 */
import {
  aplicarInferenciaAreaAoEstado,
  aplicarOrganizacaoAoEstadoChat,
  areasChatMinutaDisponiveis,
  chatMinutaAreaHabilitada,
  confirmarPoloAdvogadoChat,
  estadoCasoChatVazio,
  inferirAreaChat,
  montarPayloadGeracaoChat,
  podeMontarPlanoChat,
  precisaConfirmarPoloAdvogado,
  reajustarEspeciePoloChat,
  sincronizarPoloAutomaticoChat,
  validarPoloEspecieChat,
  type EstadoCasoChat,
} from "../src/lib/chat-minuta";
import { organizarCasoLocal } from "../src/lib/organizar-caso-local";
import type { AreaIdMinuta } from "../src/lib/minuta-modulo";
import { listaEspeciesDaArea } from "../src/lib/peca-especie-area";
import { createSuite } from "./casos-ouro/suite";

type CenarioArea = {
  relato: string;
  /** Área esperada após organização (pode divergir da URL se remédio cabível). */
  areaEsperada?: AreaIdMinuta;
  /** Fragmento esperado em especiePeca ou tipoAcao. */
  especieContem?: string;
  polo?: "ativo" | "passivo";
};

const CENARIOS: Record<AreaIdMinuta, CenarioArea> = {
  jec: {
    relato:
      "Autor João contra Enel. Corte de energia indevido. Tutela de urgência e danos morais no Juizado Especial Cível de Campinas.",
    areaEsperada: "jec",
    especieContem: "peticao",
    polo: "ativo",
  },
  consumidor: {
    relato:
      "Consumidor Maria contra operadora de telefonia. Cobrança indevida e negativação no Serasa. CDC art. 42. Petição inicial com danos morais.",
    areaEsperada: "consumidor",
    especieContem: "peticao",
    polo: "ativo",
  },
  civil: {
    relato:
      "Cobrança de R$ 45.000 por inadimplemento contratual. Autor Pedro contra construtora. Obrigação de fazer e indenização na Vara Cível.",
    areaEsperada: "civil",
    especieContem: "peticao",
    polo: "ativo",
  },
  familia: {
    relato:
      "Ação de alimentos. Genitora Ana requer pensão alimentícia do genitor em favor do filho menor. Guarda compartilhada.",
    areaEsperada: "familia",
    especieContem: "peticao",
    polo: "ativo",
  },
  trabalhista: {
    relato:
      "Reclamação trabalhista. Reclamante Carlos contra Empresa XYZ Ltda. Horas extras, FGTS e verbas rescisórias não pagas.",
    areaEsperada: "trabalhista",
    especieContem: "reclam",
    polo: "ativo",
  },
  imobiliario: {
    relato:
      "Ação de despejo por falta de pagamento. Locador contra locatário. Contrato de locação residencial Lei 8.245.",
    areaEsperada: "imobiliario",
    especieContem: "despejo",
    polo: "ativo",
  },
  previdenciario: {
    relato:
      "Benefício BPC LOAS indeferido pelo INSS. Autor menor representado pela mãe. Petição inicial para concessão do benefício.",
    areaEsperada: "previdenciario",
    especieContem: "peticao",
    polo: "ativo",
  },
  tributario: {
    relato:
      "Embargos à execução fiscal. Executado impugna CDA e exigência de ICMS. Lei 6.830. Pedido de suspensão da exigibilidade.",
    areaEsperada: "tributario",
    especieContem: "embarg",
    polo: "passivo",
  },
  administrativo: {
    relato:
      "Mandado de segurança contra ato do Secretário da Fazenda que negou restituição de tributo. Direito líquido e certo.",
    areaEsperada: "constitucional",
    especieContem: "mandado",
    polo: "ativo",
  },
  digital: {
    relato:
      "Ação de indenização por vazamento de dados pessoais. LGPD art. 42. Autor teve CPF e endereço expostos por plataforma digital.",
    areaEsperada: "digital",
    especieContem: "peticao",
    polo: "ativo",
  },
  empresarial: {
    relato:
      "Pedido de recuperação judicial. Devedor empresarial com plano de pagamento a credores. Lei 11.101.",
    areaEsperada: "empresarial",
    especieContem: "recuper",
    polo: "ativo",
  },
  ambiental: {
    relato:
      "Ação civil pública ambiental. Ministério Público contra empresa por desmatamento ilegal e dano ao bioma.",
    areaEsperada: "ambiental",
    especieContem: "acp",
    polo: "ativo",
  },
  "propriedade-intelectual": {
    relato:
      "Ação de abstenção de uso de marca registrada. Titular da marca contra concorrente. Lei 9.279.",
    areaEsperada: "propriedade-intelectual",
    especieContem: "marca",
    polo: "ativo",
  },
  medico: {
    relato:
      "Erro médico em cirurgia. Paciente sofreu sequelas permanentes. Indenização por responsabilidade civil do hospital.",
    areaEsperada: "medico",
    especieContem: "peticao",
    polo: "ativo",
  },
  internacional: {
    relato:
      "Homologação de sentença estrangeira de divórcio. Autor residente no Brasil requer reconhecimento da decisão estrangeira.",
    areaEsperada: "internacional",
    especieContem: "homolog",
    polo: "ativo",
  },
  agrario: {
    relato:
      "Ação de usucapião rural. Posse mansa e pacífica por mais de 15 anos. Estatuto da Terra.",
    areaEsperada: "agrario",
    especieContem: "peticao",
    polo: "ativo",
  },
  criminal: {
    relato:
      "Habeas corpus com pedido liminar. Paciente preso preventivamente sem fundamentação idônea. CPP art. 647.",
    areaEsperada: "criminal",
    especieContem: "habeas",
    polo: "ativo",
  },
  constitucional: {
    relato:
      "Mandado de segurança contra ato de autoridade pública que violou direito líquido e certo constitucional.",
    areaEsperada: "constitucional",
    especieContem: "mandado",
    polo: "ativo",
  },
  jecr: {
    relato:
      "Queixa-crime no Juizado Especial Criminal. Infração de menor potencial ofensivo. Lei 9.099 criminal.",
    areaEsperada: "jecr",
    especieContem: "queixa",
    polo: "ativo",
  },
  eleitoral: {
    relato:
      "Representação por propaganda eleitoral antecipada. Lei 9.504. Candidato contra adversário no TRE.",
    areaEsperada: "eleitoral",
    especieContem: "represent",
    polo: "ativo",
  },
};

function pipelineChat(relato: string, areaInicial: AreaIdMinuta): EstadoCasoChat {
  const inferencia = inferirAreaChat({ texto: relato, preferida: areaInicial });
  let estado = aplicarInferenciaAreaAoEstado(estadoCasoChatVazio(areaInicial), inferencia);

  const org = organizarCasoLocal({
    relato,
    areaId: estado.areaId,
    poloAdvocacia: estado.poloAdvocacia,
  });

  if (org.areaIdResolvida !== estado.areaId && chatMinutaAreaHabilitada(org.areaIdResolvida)) {
    estado = aplicarInferenciaAreaAoEstado(
      { ...estado, areaId: org.areaIdResolvida },
      { areaId: org.areaIdResolvida, confianca: "alta", alternativas: [] }
    );
  }

  estado = aplicarOrganizacaoAoEstadoChat(estado, org.preenchimento, {
    areaId: org.areaIdResolvida,
    relato,
  });
  estado = sincronizarPoloAutomaticoChat(estado, relato);
  estado = reajustarEspeciePoloChat(estado);

  if (precisaConfirmarPoloAdvogado(estado)) {
    estado = confirmarPoloAdvogadoChat(estado, "ativo");
  }

  return estado;
}

function main() {
  const { assert, stats } = createSuite();
  const areas = areasChatMinutaDisponiveis();

  console.log(`Smoke chat · ${areas.length} áreas · ${new Date().toISOString()}\n`);

  for (const areaId of areas) {
    const cenario = CENARIOS[areaId];
    assert(Boolean(cenario), `${areaId}: cenário definido`);
    assert(chatMinutaAreaHabilitada(areaId), `${areaId}: habilitada`);

    const especies = listaEspeciesDaArea(areaId) ?? [];
    assert(especies.length >= 1, `${areaId}: ≥1 espécie`);

    const estado = pipelineChat(cenario.relato, areaId);

    assert(estado.fatos.trim().length >= 40, `${areaId}: fatos preenchidos`);
    assert(Boolean(estado.especiePeca || estado.tipoAcao), `${areaId}: espécie/tipo`);

    if (cenario.areaEsperada) {
      assert(
        estado.areaId === cenario.areaEsperada,
        `${areaId}: área ${estado.areaId} (esperado ${cenario.areaEsperada})`
      );
    }

    if (cenario.especieContem) {
      const blob = `${estado.especiePeca} ${estado.tipoAcao}`.toLowerCase();
      assert(
        blob.includes(cenario.especieContem.toLowerCase()),
        `${areaId}: espécie contém "${cenario.especieContem}" (${estado.especiePeca})`
      );
    }

    if (cenario.polo) {
      assert(estado.poloAdvocacia === cenario.polo, `${areaId}: polo ${cenario.polo}`);
    }

    assert(podeMontarPlanoChat(estado), `${areaId}: pode montar plano`);
    assert(validarPoloEspecieChat(estado) === null, `${areaId}: polo×espécie ok`);

    const payload = montarPayloadGeracaoChat(estado);
    assert(payload.areaId === estado.areaId, `${areaId}: payload areaId`);
    assert((payload.fatos ?? "").length >= 40, `${areaId}: payload fatos`);

    console.log(
      `  OK ${areaId.padEnd(24)} → ${estado.especiePeca || "—"} · ${estado.tipoAcao?.slice(0, 40) ?? "—"}`
    );
  }

  const { oks, falhas } = stats();
  console.log(`\nSmoke chat: ${oks} ok · ${falhas} falha(s) · ${areas.length} áreas`);
  if (falhas > 0) process.exit(1);
}

main();
