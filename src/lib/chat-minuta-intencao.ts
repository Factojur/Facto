/**
 * Intenção de turno no chat — meta (ajuda/lei/juris) vs novo relato vs ajuste.
 * Determinístico, sem LLM: evita reprocessar o caso em perguntas de uso.
 */

export type IntencaoChatMinuta =
  | "meta_lei_juris"
  | "meta_ajuda"
  | "ajuste_peca"
  | "escolher_tribunal"
  | "relato";

const RE_LEI_JURIS =
  /\b(lei\s+municipal|jurisprud[eê]ncia|juris\b|ac[oó]rd[aã]o|s[uú]mula|ementa|consultar\s+(alguma\s+)?juris|encontrar\s+(a\s+)?(lei|juris)|onde\s+(subo|anexo|coloco)|como\s+(subo|anexo|envio|colo)|provas\s*\/\s*lei|upload\s+(da\s+)?lei)\b/i;

const RE_AJUDA =
  /\b(como\s+funciona|o\s+que\s+(fa[cç]o|fazer)|onde\s+(fica|est[aá])|n[aã]o\s+encontrei|n[aã]o\s+acho|ajuda|help|bot[aã]o)\b/i;

const RE_PARECÊ_RELATO =
  /\b(autor|r[eé]u|cliente|contrato|corte\s+de\s+[aá]gua|danos?\s+morais?|peti[cç][aã]o|contest[aã]o|processo\s+n|comarca|r\.\s*\$|valor\s+da\s+causa)\b/i;

const RE_AJUSTE_PECA =
  /\b(inclu(a|ir)|acrescente|mude|altere|reescrev|tire|remov|corrij|ajust|reforç|suaviz|enfatiz|troque|substitu|pedido|fundament|trecho|par[aá]grafo|tutela|liminar|valor|qualifica)\b/i;

const RE_TRIBUNAL =
  /\b(tjsp|tjrj|tjmg|tjrs|tjpr|stf|stj|tst|tse|trf|tj\s+de|tribunal|buscar\s+juris|prioriz)\b/i;

/**
 * Classifica o texto do usuário. Se já há caso organizado e a msg é curta
 * pedindo lei/juris/ajuda, trata como meta (sem nova chamada a entrada-caso).
 */
export function classificarIntencaoChat(input: {
  texto: string;
  casoJaOrganizado: boolean;
  pecaGerada?: boolean;
}): IntencaoChatMinuta {
  const t = input.texto.trim();
  if (!t) return "relato";

  const curto = t.length < 320;
  const temLeiJuris = RE_LEI_JURIS.test(t);
  const temAjuda = RE_AJUDA.test(t);
  const pareceRelato = RE_PARECÊ_RELATO.test(t) || t.length >= 400;
  const pareceAjuste = RE_AJUSTE_PECA.test(t);
  const pareceTribunal = RE_TRIBUNAL.test(t);

  if (input.pecaGerada && curto && pareceAjuste && !pareceRelato) {
    return "ajuste_peca";
  }

  if (
    input.casoJaOrganizado &&
    curto &&
    pareceTribunal &&
    !pareceRelato &&
    !temLeiJuris
  ) {
    return "escolher_tribunal";
  }

  if (input.casoJaOrganizado && curto && temLeiJuris && !pareceRelato) {
    return "meta_lei_juris";
  }
  if (input.casoJaOrganizado && curto && temAjuda && !pareceRelato && !temLeiJuris) {
    return "meta_ajuda";
  }
  return "relato";
}

export function respostaMetaLeiJuris(): string {
  return [
    "Não consulto a web nem invento ementa neste chat.",
    "Se você **já tem** a lei municipal ou um acórdão/súmula do caso, abra **Provas / lei e juris** (abaixo ou no menu) e cole/anexe — isso entra só nesta peça.",
    "Citar só o **número da lei** no chat ajuda a organizar o caso; o **texto integral** precisa ir em Provas / lei e juris para fundamentar a redação.",
    "Na **redação**, a base curada FACTO busca julgados semelhantes aos fatos e favoráveis ao polo. O preview à direita já monta a forma; a fundamentação completa vem ao confirmar **Redigir**.",
  ].join("\n\n");
}

export function respostaMetaAjuda(): string {
  return [
    "Fluxo rápido:",
    "1. Descreva o caso (ou anexe PDF) — o **Analista** organiza.",
    "2. A **pré-visualização** à direita atualiza sozinha (sem cota).",
    "3. Lei municipal / juris do caso → **Provas / lei e juris**.",
    "4. Escolha até **3 tribunais** para priorizar juris (ou informe a comarca/UF).",
    "5. Complemente do seu jeito no chat — pedidos, tutela, fatos extras.",
    "6. Quando estiver ok → **Redigir (1 peça)**; depois peça **ajustes** na conversa.",
  ].join("\n");
}

export function respostaEscolherTribunal(): string {
  return [
    "Para priorizar jurisprudência na redação, escolha **até 3 tribunais** abaixo (ex.: TJ do foro + STJ).",
    "Se informar **comarca/UF** no relato, o TJ local entra automaticamente.",
    "Superiores (STF, STJ, TST) continuam no acervo — só ganham peso extra quando marcados.",
  ].join("\n\n");
}
