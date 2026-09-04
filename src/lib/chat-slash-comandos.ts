/**
 * Comandos `/` do chat FACTO — UX estilo paleta (não copia texto de terceiros).
 * Só inserem texto / preferência de espécie / atalho local — 0 tokens.
 */

export type SlashAcao =
  | "inserir"
  | "especie"
  | "criar_minuta"
  | "ajuste_prefill";

export type SlashComando = {
  id: string;
  /** O que o usuário digita após / (sem barra). */
  alias: string;
  rotulo: string;
  dica: string;
  acao: SlashAcao;
  /** Texto a colocar no composer (inserir / ajuste_prefill). */
  texto?: string;
  /** Preferência de espécie no estado (pista para a IA). */
  especieId?: string;
};

/** Espécies frequentes — pista, não trava. */
const ESPECIES: SlashComando[] = [
  {
    id: "sp-inicial",
    alias: "inicial",
    rotulo: "Petição inicial",
    dica: "Marca espécie inicial e sugere redigir",
    acao: "especie",
    especieId: "peticao-inicial",
    texto: "Redija a petição inicial completa com fatos, direito e pedidos.",
  },
  {
    id: "sp-contestacao",
    alias: "contestacao",
    rotulo: "Contestação",
    dica: "Defesa do réu — preliminares e mérito",
    acao: "especie",
    especieId: "contestacao",
    texto:
      "Redija a contestação completa, com preliminares cabíveis e impugnação específica.",
  },
  {
    id: "sp-replica",
    alias: "replica",
    rotulo: "Réplica",
    dica: "Resposta à contestação",
    acao: "especie",
    especieId: "replica",
    texto: "Redija a réplica à contestação, enfrentando os pontos da defesa.",
  },
  {
    id: "sp-apelacao",
    alias: "apelacao",
    rotulo: "Apelação",
    dica: "Recurso de apelação",
    acao: "especie",
    especieId: "apelacao",
    texto: "Redija a apelação com tempestividade, razões e pedidos recursais.",
  },
  {
    id: "sp-agravo",
    alias: "agravo",
    rotulo: "Agravo de instrumento",
    dica: "Contra decisão interlocutória",
    acao: "especie",
    especieId: "agravo-instrumento",
    texto:
      "Redija o agravo de instrumento contra a decisão interlocutória dos autos.",
  },
  {
    id: "sp-embargos",
    alias: "embargos",
    rotulo: "Embargos de declaração",
    dica: "Omissão, obscuridade ou contradição",
    acao: "especie",
    especieId: "embargos-declaracao",
    texto: "Redija embargos de declaração apontando o vício e o pedido de esclarecimento.",
  },
  {
    id: "sp-hc",
    alias: "hc",
    rotulo: "Habeas corpus",
    dica: "Remédio penal — paciente",
    acao: "especie",
    especieId: "habeas-corpus",
    texto: "Redija o habeas corpus com fatos, direito e pedidos de liminar cabíveis.",
  },
  {
    id: "sp-ms",
    alias: "ms",
    rotulo: "Mandado de segurança",
    dica: "Direito líquido e certo",
    acao: "especie",
    especieId: "mandado-seguranca",
    texto: "Redija o mandado de segurança com fatos, direito líquido e certo e pedidos.",
  },
  {
    id: "sp-reclamacao",
    alias: "reclamacao",
    rotulo: "Reclamação trabalhista",
    dica: "CLT — reclamante",
    acao: "especie",
    especieId: "reclamacao",
    texto:
      "Redija a reclamação trabalhista com fatos, verbas e pedidos rescisórios cabíveis.",
  },
];

const ACOES: SlashComando[] = [
  {
    id: "ac-minuta",
    alias: "minuta",
    rotulo: "Criar minuta",
    dica: "Gera a peça no preview (1 crédito)",
    acao: "criar_minuta",
  },
  {
    id: "ac-plano",
    alias: "plano",
    rotulo: "Só o plano",
    dica: "Pede entendimento e plano sem redigir ainda",
    acao: "inserir",
    texto:
      "Confirme em poucas linhas o entendimento (partes, juízo, espécie) e o plano de tópicos — ainda sem redigir a peça.",
  },
  {
    id: "ac-ajustar",
    alias: "ajustar",
    rotulo: "Ajustar trecho",
    dica: "Pós-peça: descreva a mudança (sem novo crédito de peça)",
    acao: "ajuste_prefill",
    texto: "Ajuste na peça: ",
  },
  {
    id: "ac-direito",
    alias: "direito",
    rotulo: "Reforçar DO DIREITO",
    dica: "Pós-peça: densificar mérito",
    acao: "ajuste_prefill",
    texto:
      "Reescreva só a seção DO DIREITO / DO MÉRITO com mais densidade e subsunção aos fatos, sem alterar fatos nem pedidos.",
  },
  {
    id: "ac-pedidos",
    alias: "pedidos",
    rotulo: "Ajustar pedidos",
    dica: "Pós-peça: pedidos",
    acao: "ajuste_prefill",
    texto: "Ajuste os DOS PEDIDOS conforme: ",
  },
  {
    id: "ac-tutela",
    alias: "tutela",
    rotulo: "Tutela de urgência",
    dica: "Incluir/refinar se estiver nos autos",
    acao: "ajuste_prefill",
    texto:
      "Inclua ou refine a tutela de urgência como subtópico do direito, só se os fatos dos autos sustentarem.",
  },
];

export const SLASH_COMANDOS_FACTO: SlashComando[] = [...ACOES, ...ESPECIES];

export function filtrarSlashComandos(
  query: string,
  limite = 8
): SlashComando[] {
  const q = query.trim().toLowerCase().replace(/^\//, "");
  if (!q) return SLASH_COMANDOS_FACTO.slice(0, limite);
  const scored = SLASH_COMANDOS_FACTO.map((c) => {
    const hay = `${c.alias} ${c.rotulo} ${c.dica}`.toLowerCase();
    let score = 0;
    if (c.alias.startsWith(q)) score += 30;
    if (c.rotulo.toLowerCase().startsWith(q)) score += 20;
    if (hay.includes(q)) score += 10;
    return { c, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limite).map((x) => x.c);
}

/** Detecta `/query` no fim do texto do composer. */
export function extrairSlashAtivo(texto: string): {
  prefixo: string;
  query: string;
} | null {
  const m = /(^|\s)\/([^\s]*)$/.exec(texto);
  if (!m) return null;
  return {
    prefixo: texto.slice(0, m.index! + m[1].length),
    query: m[2] ?? "",
  };
}
