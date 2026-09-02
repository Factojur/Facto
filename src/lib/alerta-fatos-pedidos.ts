/**
 * Detector determinístico: contradições entre fatos, pedidos e opções do formulário.
 * Não bloqueia geração — só chips de conferência antes de redigir/protocolar.
 */

import { especieUsaTutelaUrgenciaCpc } from "@/lib/peca-especie-area";

export type AlertaFatosPedidos = {
  id: string;
  gravidade: "alerta" | "info";
  mensagem: string;
};

function norm(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Espécies em que valor/multa não é pedido indenizatório clássico. */
function especieDispensaAlertaIndenizatorio(especie: string): boolean {
  return /mandado-seguranca|habeas-corpus|cumprimento|execucao|embargos.*execucao|impugnacao.*cumprimento/.test(
    especie
  );
}

/** "Sem prejuízo de…" (locução jurídica) ≠ ausência de dano material. */
function negaPrejuizoMaterialNosFatos(fatos: string): boolean {
  return (
    /nao houve prejuizo|inexistencia de dano material|nao ha dano material|nao sofreu prejuizo/.test(
      fatos
    ) || /sem prejuizo(?! de\b)/.test(fatos)
  );
}

function fatosEnvolvemAstreintesOuMultaProcessual(fatos: string): boolean {
  return /astreint|multa diaria|multa por ato|cumprimento de sentenca|execucao de sentenca|titulo judicial/.test(
    fatos
  );
}

function pedidoIndenizatorioMaterial(pedidosTexto: string): boolean {
  return /dano material|danos materiais|indenizacao por dano|reparacao de dano|lucros cessantes/.test(
    pedidosTexto
  );
}

export function detectarAlertasFatosPedidos(input: {
  fatos: string;
  pedidos?: string[];
  tutelaUrgencia?: boolean;
  pedirJusticaGratuita?: boolean;
  totalValorCentavos?: number;
  especiePeca?: string;
}): AlertaFatosPedidos[] {
  const alertas: AlertaFatosPedidos[] = [];
  const fatos = norm(input.fatos.trim());
  const pedidosTexto = norm((input.pedidos ?? []).join(" "));
  const especie = norm(input.especiePeca ?? "");

  if (!fatos && !pedidosTexto) return alertas;

  if (
    /sem dano moral|nao houve dano moral|inexistencia de dano moral|nao ha dano moral|nao sofreu dano moral/.test(
      fatos
    ) &&
    /dano moral|danos morais/.test(pedidosTexto)
  ) {
    alertas.push({
      id: "dm-fatos-nega-pedido-pede",
      gravidade: "alerta",
      mensagem:
        "Os fatos negam ou minimizam dano moral, mas há pedido de danos morais — confira a coerência.",
    });
  }

  const dispensaIndenizatorio =
    especieDispensaAlertaIndenizatorio(especie) ||
    fatosEnvolvemAstreintesOuMultaProcessual(fatos);
  if (
    !dispensaIndenizatorio &&
    negaPrejuizoMaterialNosFatos(fatos) &&
    (pedidoIndenizatorioMaterial(pedidosTexto) ||
      ((input.totalValorCentavos ?? 0) > 0 &&
        /indenizacao|danos morais|dano moral/.test(pedidosTexto)))
  ) {
    alertas.push({
      id: "valor-fatos-nega",
      gravidade: "alerta",
      mensagem:
        "Os fatos sugerem ausência de prejuízo, mas há valor ou pedido indenizatório — confira o quantum.",
    });
  }

  const urgenciaNosFatos =
    /urgente|urgencia|perigo|risco|imediato|liminar|tutela|inegavel|gravame|corte|interrupc|suspensao (do )?fornecimento|falta de (agua|energia|luz)|energia eletrica|servico essencial|religa|menor|crianc|filh|abastecimento|constrangimento|periculum|fumus|essencial/.test(
      fatos
    ) ||
    /urgente|urgencia|perigo|risco|imediato|liminar|tutela|religa|restabelecimento/.test(
      pedidosTexto
    );
  if (input.tutelaUrgencia && !urgenciaNosFatos) {
    const esp = norm(input.especiePeca ?? "");
    if (especieUsaTutelaUrgenciaCpc(esp)) {
      alertas.push({
        id: "tutela-sem-fato",
        gravidade: "alerta",
        mensagem:
          "Tutela de urgência marcada, mas os fatos não descrevem urgência ou perigo — inclua na narrativa ou desmarque.",
      });
    }
  }

  if (
    input.pedirJusticaGratuita &&
    /alta renda|renda elevada|patrimonio significativo|empresario|socio administrador|proprietario de imoveis/.test(
      fatos
    ) &&
    !/hipossuficien|sem condicoes|baixa renda|desempregad|sem renda/.test(fatos)
  ) {
    alertas.push({
      id: "jg-renda",
      gravidade: "info",
      mensagem:
        "Justiça gratuita marcada — confira se os fatos não indicam capacidade financeira incompatível.",
    });
  }

  const ehDefesa =
    /contestacao|defesa|embargos|replica|contrarraz|informacoes|impugnacao/.test(
      especie
    );
  const ehInicial =
    /peticao-inicial|inicial|reclamacao|mandado-seguranca|queixa|acao popular|habeas/.test(
      especie
    ) && !ehDefesa;

  if (
    ehDefesa &&
    /procedencia total da inicial|procedencia da inicial|condenacao do autor|condenacao da parte autora/.test(
      pedidosTexto
    )
  ) {
    alertas.push({
      id: "defesa-favorece-autor",
      gravidade: "alerta",
      mensagem:
        "Peça de defesa com pedido que parece favorecer a parte autora — confira espécie e polo.",
    });
  }

  if (
    ehInicial &&
    /improcedencia|improcedente|extincao sem merito|absolvicao/.test(pedidosTexto)
  ) {
    alertas.push({
      id: "inicial-improcedencia",
      gravidade: "alerta",
      mensagem:
        "Petição inaugural com pedido típico de defesa (improcedência/absolvição) — confira espécie e polo.",
    });
  }

  if (
    fatos.includes("nao pagou") &&
    pedidosTexto.includes("declarar inexistencia") &&
    pedidosTexto.includes("condenar") &&
    pedidosTexto.includes("pagamento")
  ) {
    alertas.push({
      id: "inexigibilidade-e-cobranca",
      gravidade: "info",
      mensagem:
        "Há pedidos de inexigibilidade e de condenação ao pagamento — confira se não se excluem.",
    });
  }

  return alertas;
}
