/**
 * Testes — profundidade de lastro + estabilidade (0 tokens).
 */
import assert from "node:assert/strict";
import { blocoPlanoTopicosParaRedator } from "../src/lib/ia/plano-topicos-peca";
import { scoreTrechoVsTopico } from "../src/lib/ia/rag-por-topico";
import { resolverVinculosPeca } from "../src/lib/ia/skins-facto";
import { verificarCitacoes } from "../src/lib/ia/verificacao-citacoes";
import { auditarPecaGerada } from "../src/lib/ia/auditor-peca";

function main() {
  const bloco = blocoPlanoTopicosParaRedator([
    {
      romano: "III",
      titulo: "DO DIREITO",
      subtitulos: ["Alimentos"],
      encaixe: "Filha menor necessita pensão",
      lastro: [
        { tipo: "anexo", ref: "fls. 12" },
        { tipo: "juris", ref: "TJSP Apelação 1000" },
      ],
    },
  ]);
  assert(/ENCAIXE:/i.test(bloco), "encaixe no plano redator");
  assert(/LASTRO:/i.test(bloco), "lastro no plano redator");
  assert(/fls\. 12/i.test(bloco), "fls no lastro");

  const score = scoreTrechoVsTopico(
    {
      titulo: "Alimentos provisórios — filha menor",
      categoria: "julgado",
      texto: "Pensionamento em favor da filha…",
    },
    {
      romano: "III",
      titulo: "DO DIREITO — alimentos",
      subtitulos: [],
      encaixe: "filha menor",
    }
  );
  assert(score >= 0.2, `score topico esperado >=0.2 got ${score}`);

  const v = resolverVinculosPeca({
    areaId: "familia",
    especie: "apelacao",
    fatos:
      "SENTENÇA. JULGO PROCEDENTE o pedido de alimentos. Publique-se. Registre-se.",
  });
  assert(v.especie === "apelacao", "especie preservada");
  // Sentença de mérito sugere apelação — cabivel pode ser null se igual
  assert(
    v.cabivel == null || v.cabivelTitulo != null,
    "cabivel com titulo ou null"
  );

  const cnj = "1000011-77.2025.8.26.0279";
  const cits = verificarCitacoes(
    `Conforme Apelação ${cnj},…`,
    "contexto sem o número",
    [{ titulo: `TJSP Apelação ${cnj}`, texto: "ementa alimentos" }]
  );
  const juris = cits.find((c) => c.tipo === "jurisprudencia");
  assert(juris?.verificada, "CNJ casado com juris do caso");

  const aud = auditarPecaGerada({
    peca:
      "EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO\n\n" +
      "I - DOS FATOS\n" +
      "O autor alega.\n\n".repeat(40),
    areaId: "civil",
    especie: "peticao-inicial",
    fatos: "Cobrança contratual.",
  });
  assert(
    aud.achados.some((a) => a.id === "fechamento"),
    "auditor flag fechamento"
  );

  console.log("testar-lastro-estabilidade: ok");
}

main();
