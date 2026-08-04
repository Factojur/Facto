import { ASSISTENTE_FACTO } from "@/lib/assistente-facto";

/** Placeholders didáticos da narração dos fatos, por tipo de ação. */
export function placeholderFatosPorTipo(tipoAcao: string): string {
  if (!tipoAcao || tipoAcao === ASSISTENTE_FACTO) {
    return (
      "Descreva em ordem cronológica: o que aconteceu, quando, com quem, " +
      "quais documentos existem e qual o prejuízo. Quanto mais concreto " +
      "(datas, valores, nomes), melhor a peça."
    );
  }

  const t = tipoAcao.toLowerCase();

  if (t.includes("cobrança") || t.includes("cobranca")) {
    return (
      "Ex.: Em __/__/____ o réu contratou/obrigou-se a ____ no valor de R$ ____. " +
      "O vencimento era __/__/____. Apesar de notificado em __/__/____, não pagou. " +
      "Peço a condenação ao pagamento de R$ ____, com correção e juros."
    );
  }
  if (t.includes("indeniza")) {
    return (
      "Ex.: Em __/__/____ ocorreu ____. O réu ____. Houve prejuízo material de R$ ____ " +
      "(comprovantes anexos) e dano moral consistente em ____. Peço indenização de R$ ____."
    );
  }
  if (t.includes("despejo") || t.includes("locação") || t.includes("locacao")) {
    return (
      "Ex.: Contrato de locação de __/__/____, aluguel R$ ____. Inadimplemento desde ____. " +
      "Notificação em ____. Peço rescisão, despejo e cobrança dos aluguéis em atraso."
    );
  }
  if (t.includes("execução") || t.includes("execucao")) {
    return (
      "Ex.: Título ____ emitido em ____ no valor de R$ ____, vencido em ____, " +
      "protestado/apresentado em ____. Peço citação para pagamento e atos executórios."
    );
  }
  if (t.includes("obrigação") || t.includes("obrigacao")) {
    return (
      "Ex.: O réu obrigou-se a ____ até ____ (contrato/mensagem anexa). Não cumpriu. " +
      "Peço condenação a cumprir a obrigação, sob pena de multa diária."
    );
  }

  return (
    "Narração cronológica dos fatos, com datas, valores, tentativas de solução " +
    "e o que se pede ao Juizado. Anexe as provas correspondentes."
  );
}
