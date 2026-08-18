/**
 * Auditor da minuta (0 tokens).
 * Uso: npx tsx scripts/testar-auditor-peca.ts
 */
import { auditarPecaGerada } from "../src/lib/ia/auditor-peca";
import { createSuite } from "./casos-ouro/suite";

const { assert, stats } = createSuite();

const pecaOk = `
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DO JUIZADO ESPECIAL CÍVEL DO FORO CENTRAL — ANEXO MACKENZIE DA COMARCA DE SÃO PAULO/SP

Processo nº: 0006509-93.2023.8.26.0016
Exequente: Jefferson da Silva Ribeiro
Executado: Faculdades Metropolitanas Unidas

JEFFERSON DA SILVA RIBEIRO, já qualificado no processo em epígrafe, movido em face de FACULDADES METROPOLITANAS UNIDAS, igualmente já qualificada, vem, por seu advogado, respeitosamente, à presença de Vossa Excelência, opor os presentes

EMBARGOS DE DECLARAÇÃO

I — DOS FATOS
Houve decisão que alterou as astreintes, invocando erro material.

II — DO DIREITO
Cabe o recurso para sanar omissão e erro material.

III — DOS PEDIDOS
a) O acolhimento dos embargos;
b) A concessão dos benefícios da justiça gratuita.

Nestes termos,
pede deferimento.
`.trim();

const rOk = auditarPecaGerada({
  peca: pecaOk,
  areaId: "jec",
  especie: "embargos",
  fatos:
    "Cumprimento de sentença já instaurado. Decisão alterou astreintes de R$ 100 por dia para R$ 100 por ato, invocando erro material.",
  numeroProcesso: "0006509-93.2023.8.26.0016",
  pecaInaugural: false,
  pedirJusticaGratuita: true,
  autores: [{ nomeCompleto: "Jefferson da Silva Ribeiro" } as never],
  reus: [{ nome: "Faculdades Metropolitanas Unidas" } as never],
});
assert(rOk.status === "ok" || rOk.achados.every((a) => a.gravidade === "info"), "peça boa não bloqueia");
assert(
  !rOk.achados.some((a) => a.id === "especie-cabivel" || a.id === "reabre-execucao"),
  "embargos após astreintes não é reabertura"
);

const pecaCumprimento = pecaOk.replace(
  "EMBARGOS DE DECLARAÇÃO",
  "CUMPRIMENTO DE SENTENÇA"
);
const rErrada = auditarPecaGerada({
  peca: pecaCumprimento,
  areaId: "jec",
  especie: "cumprimento-sentenca",
  tipoAcao: "Cumprimento de sentença",
  fatos:
    "Autos do cumprimento de sentença n. 0006509-93.2023.8.26.0016 já em curso. Decisão do juiz alterou as astreintes por erro material.",
  pecaInaugural: false,
});
assert(
  rErrada.achados.some((a) => a.gravidade === "bloqueante"),
  "reabrir cumprimento é bloqueante"
);

const rVara = auditarPecaGerada({
  peca: `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA ___ VARA DO JUIZADO ESPECIAL CÍVEL DA COMARCA DE SÃO PAULO/SP

${pecaOk}`,
  areaId: "jec",
  especie: "embargos",
  pecaInaugural: false,
});
assert(
  rVara.achados.some((a) => a.id === "vara-em-branco"),
  "___ VARA em incidental gera alerta"
);

const rEnd = auditarPecaGerada({
  peca: `${pecaOk}\n\nAdvogado, OAB/SP 147099, com escritório no [endereço do advogado].`,
  areaId: "jec",
  especie: "embargos",
  pecaInaugural: false,
});
assert(
  rEnd.achados.some((a) => a.id === "end-advogado"),
  "placeholder de endereço do advogado"
);

const rColado = auditarPecaGerada({
  peca: pecaOk.replace(
    "à presença de Vossa Excelência, opor os presentes",
    "à presença de Vossa Excelência EMBARGOS"
  ),
  areaId: "jec",
  especie: "embargos",
  pecaInaugural: false,
});
assert(
  rColado.achados.some((a) => a.id === "nome-colado"),
  "nome da peça colado após Vossa Excelência"
);

const rJg = auditarPecaGerada({
  peca: pecaOk.replace(
    "b) A concessão dos benefícios da justiça gratuita.",
    "b) A condenação em custas."
  ),
  areaId: "jec",
  especie: "embargos",
  pecaInaugural: false,
  pedirJusticaGratuita: true,
});
assert(
  rJg.achados.some((a) => a.id === "jg-ausente"),
  "JG marcada e ausente nos pedidos"
);

const rEpigrafe = auditarPecaGerada({
  peca: pecaOk.replace("Processo nº: 0006509-93.2023.8.26.0016\n", ""),
  areaId: "jec",
  especie: "embargos",
  pecaInaugural: false,
  numeroProcesso: "0006509-93.2023.8.26.0016",
});
assert(
  rEpigrafe.achados.some((a) => a.id === "epigrafe-processo"),
  "epígrafe sem o CNJ informado"
);

const rPedidos = auditarPecaGerada({
  peca: pecaOk,
  areaId: "jec",
  especie: "embargos",
  pecaInaugural: false,
  pedidosUsuario: ["A imediata restauração das astreintes no valor diário original"],
});
assert(
  rPedidos.achados.some((a) => a.id === "pedidos-usuario"),
  "pedido do formulário ausente na minuta"
);

const rLastro = auditarPecaGerada({
  peca: pecaOk,
  areaId: "jec",
  especie: "embargos",
  pecaInaugural: false,
  citacoes: [
    { trecho: "REsp 1.234.567", tipo: "jurisprudencia", verificada: false },
  ],
});
assert(
  rLastro.achados.some((a) => a.id === "juris-sem-lastro"),
  "julgado sem lastro vira alerta do Auditor"
);

const { oks, falhas } = stats();
console.log(`\n${oks} ok, ${falhas} falhas`);
if (falhas > 0) process.exit(1);
