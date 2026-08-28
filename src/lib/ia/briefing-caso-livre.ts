/**
 * Contexto do formulário como ORIENTAÇÃO — não barreira.
 * A IA prioriza o relato (Fatos + Entrada); campos vazios não limitam a peça.
 */

export type BriefingCasoLivre = {
  texto: string;
};

const CABECALHO = [
  "================================================================================",
  "ORIENTAÇÕES DO FORMULÁRIO (NÃO SÃO BARREIRAS)",
  "================================================================================",
  "Use como pistas. A fonte primária é o <RELATO_BRUTO_DO_USUARIO> e as provas.",
  "Se um campo estiver vazio, incompleto ou em conflito com fatos mais ricos no relato,",
  "SIGA O RELATO — não omita tese, tópico ou pedido manifestamente cabível.",
  "",
].join("\n");

export function montarBriefingCasoLivre(params: {
  areaId?: string;
  tipoAcao?: string | null;
  especiePeca?: string | null;
  poloAdvocacia?: string | null;
  autoresNomes?: string[];
  reusNomes?: string[];
  numeroProcesso?: string | null;
  foro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  ultimoAto?: string | null;
  pedidosUsuario?: string[];
  pedirJusticaGratuita?: boolean | null;
  tutelaUrgencia?: boolean | null;
  danosMorais?: boolean | null;
  danosMateriais?: boolean | null;
  resumoEntrada?: string | null;
  leituraRelato?: string | null;
  tesesRotulos?: string[];
}): BriefingCasoLivre | null {
  const linhas: string[] = [CABECALHO];

  if (params.areaId) linhas.push(`Área/módulo: ${params.areaId}`);
  if (params.especiePeca) linhas.push(`Espécie indicada: ${params.especiePeca}`);
  if (params.tipoAcao?.trim())
    linhas.push(`Nome/tipo da ação (pista): ${params.tipoAcao.trim()}`);
  if (params.poloAdvocacia)
    linhas.push(`Polo da advocacia: ${params.poloAdvocacia}`);

  const autores = (params.autoresNomes ?? []).filter(Boolean);
  const reus = (params.reusNomes ?? []).filter(Boolean);
  if (autores.length) linhas.push(`Parte(s) ativa(s): ${autores.join("; ")}`);
  if (reus.length) linhas.push(`Parte(s) passiva(s): ${reus.join("; ")}`);

  if (params.numeroProcesso?.trim())
    linhas.push(`Processo nº (se houver): ${params.numeroProcesso.trim()}`);
  if (params.foro?.trim()) linhas.push(`Foro/comarca: ${params.foro.trim()}`);
  if (params.cidade?.trim() || params.uf?.trim()) {
    linhas.push(
      `Local: ${[params.cidade, params.uf].filter(Boolean).join("/")}`
    );
  }
  if (params.ultimoAto?.trim())
    linhas.push(`Último ato nos autos (entrada): ${params.ultimoAto.trim()}`);

  if (params.tutelaUrgencia === true) linhas.push("Tutela de urgência: marcada SIM");
  if (params.tutelaUrgencia === false)
    linhas.push(
      "Tutela de urgência: marcada NÃO (só incluir se fatos revelarem urgência)"
    );
  if (params.pedirJusticaGratuita === true)
    linhas.push("Justiça gratuita: marcada SIM");
  if (params.pedirJusticaGratuita === false)
    linhas.push("Justiça gratuita: marcada NÃO");
  if (params.danosMorais) linhas.push("Danos morais: indicados no formulário");
  if (params.danosMateriais)
    linhas.push("Danos materiais: indicados no formulário");

  const pedidos = (params.pedidosUsuario ?? [])
    .map((p) => p.trim())
    .filter(Boolean);
  if (pedidos.length) {
    linhas.push("", "Pedidos listados pelo advogado (incorporar em DOS PEDIDOS):");
    pedidos.forEach((p, i) => linhas.push(`${String.fromCharCode(97 + i)}) ${p}`));
  }

  if (params.tesesRotulos?.length) {
    linhas.push(
      "",
      `Teses canônicas detectadas: ${params.tesesRotulos.join("; ")}`
    );
  }

  if (params.resumoEntrada?.trim()) {
    linhas.push("", "Resumo da Entrada do caso (IA de triagem do PDF/relato):");
    linhas.push(params.resumoEntrada.trim().slice(0, 4000));
  }

  if (params.leituraRelato?.trim()) {
    linhas.push("", "Trecho lido na Entrada (OCR/PDF — não é a peça):");
    linhas.push(params.leituraRelato.trim().slice(0, 3000));
  }

  if (linhas.length <= CABECALHO.split("\n").length + 1) return null;

  return { texto: linhas.join("\n") };
}
