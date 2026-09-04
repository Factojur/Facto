/**
 * Teses canônicas novas, chips de conferência e página do anexo.
 * Uso: npx tsx scripts/testar-entrada-conferencia.ts
 */
import { montarConferenciaEntrada } from "../src/lib/conferencia-entrada";
import type { PreenchimentoEntradaCaso } from "../src/lib/entrada-caso-types";
import {
  analisarJanelaRelato,
  LIMITE_RELATO_TRIAGEM_CHARS,
  resumoLeituraRelato,
} from "../src/lib/peca-cabivel-autos";
import { paginaDoTrechoNoTexto, rotuloCitacaoAnexo } from "../src/lib/pagina-anexo-pdf";
import { detectarTesesCanonicas } from "../src/lib/teses-canonicas";
import { createSuite } from "./casos-ouro/suite";

const VAZIO: PreenchimentoEntradaCaso = {
  especiePeca: null,
  tipoAcao: null,
  fatos: null,
  autoresNomes: [],
  reusNomes: [],
  numeroProcesso: null,
  foro: null,
  cidade: null,
  uf: null,
  numeroVara: null,
  especialidadeVara: null,
  especieDoProcesso: null,
  ultimoAto: null,
  pedidos: [],
  pedirJusticaGratuita: null,
  tutelaUrgencia: null,
  danosMorais: null,
  danosMateriais: null,
  tesesIds: [],
  camposIncertos: [],
  resumoConferencia: "Revise as três abas. Nada foi gerado ainda.",
};

function main() {
  const { assert, stats } = createSuite();

  const horas = detectarTesesCanonicas(
    "trabalhista",
    "Reclamante fez horas extras sem intervalo intrajornada."
  );
  assert(
    horas.some((t) => t.id === "clt-horas-extras"),
    "Trabalhista: horas extras liga tese CLT"
  );

  const pj = detectarTesesCanonicas(
    "trabalhista",
    "Contrataram por pejotização, emitindo nota fiscal de serviços sem carteira."
  );
  assert(
    pj.some((t) => t.id === "clt-pejotizacao"),
    "Trabalhista: pejotização liga tese de vínculo"
  );

  const alimentos = detectarTesesCanonicas(
    "familia",
    "Pedido de pensão alimentícia pelo binômio necessidade e possibilidade."
  );
  assert(
    alimentos.some((t) => t.id === "familia-alimentos"),
    "Família: alimentos liga tese CC 1.694"
  );

  const obra = detectarTesesCanonicas(
    "imobiliario",
    "Incorporadora com atraso na entrega do imóvel e habite-se."
  );
  assert(
    obra.some((t) => t.id === "imobiliario-atraso-obra"),
    "Imobiliário: atraso de obra liga tese"
  );

  const especial = detectarTesesCanonicas(
    "previdenciario",
    "Pedido de tempo especial por ruído, com PPP e LTCAT."
  );
  assert(
    especial.some((t) => t.id === "prev-tempo-especial"),
    "Previdenciário: tempo especial liga tese 8.213"
  );

  assert(
    detectarTesesCanonicas("jec", "horas extras pejotização").every(
      (t) => t.id === "juizado-9099" || t.areas.includes("jec")
    ),
    "JEC não herda tese trabalhista"
  );

  const conf = montarConferenciaEntrada(
    "criminal",
    {
      ...VAZIO,
      especiePeca: "resposta-acusacao",
      fatos: "Denúncia recebida.",
      autoresNomes: ["MP"],
      reusNomes: ["Acusado"],
      pedirJusticaGratuita: true,
    },
    []
  );
  assert(
    conf.chips.some((c) => c.chave === "polo" && c.preenchido),
    "Conferência: resposta à acusação infere polo (passivo)"
  );
  assert(
    conf.chips.some((c) => c.chave === "jg" && c.preenchido),
    "Conferência: JG preenchido"
  );
  assert(
    conf.chips.some((c) => c.chave === "teses" && !c.preenchido),
    "Conferência: sem tese do código"
  );

  const janela = analisarJanelaRelato(
    "A".repeat(LIMITE_RELATO_TRIAGEM_CHARS + 10_000) + " DECISÃO final último ato"
  );
  assert(janela.truncado, "PDF longo: janela truncada");
  assert(
    resumoLeituraRelato({
      truncado: true,
      encontrouDecisoes: true,
      fonte: "texto",
    }).includes("capa + decisões + fim"),
    "Resumo: capa + decisões + fim"
  );

  const anexo = `--- página 3 ---\nTJSP Apelação 1000. O tribunal negou provimento.`;
  assert(
    paginaDoTrechoNoTexto(anexo, "tribunal negou provimento") === 3,
    "Página do anexo a partir do marcador"
  );
  assert(
    rotuloCitacaoAnexo({ titulo: "TJSP Apelação 1000", pagina: 3 }).includes(
      "p. 3"
    ),
    "Rótulo de citação com página, sem URL"
  );

  const { oks, falhas } = stats();
  console.log(`\n${oks} ok, ${falhas} falhas`);
  if (falhas > 0) process.exit(1);
}

main();
