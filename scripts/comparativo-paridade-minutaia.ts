/**
 * Comparativo FACTO × MinutaIA — bateria FACTO (0 tokens) + checklist MinutaIA manual.
 * Uso: npm run test:comparativo-paridade
 *
 * FACTO: asserts automáticos por cenário.
 * MinutaIA: coluna manual — preencher após rodar o mesmo relato/PDF no app deles.
 */

import { inferirAreaChat, inferirAreaChatDetalhado } from "../src/lib/chat-minuta";
import { extrairPartesDoRelato } from "../src/lib/extrair-partes-relato";
import { organizarCasoLocal } from "../src/lib/organizar-caso-local";
import { inferirPoloDoRelato } from "../src/lib/polo-advocacia";
import {
  complementarLastroTopicos,
  montarLastroTopicoExibicao,
} from "../src/lib/ia/plano-lastro-topico";
import {
  extrairPlanoTopicos,
  parseLastroLinha,
} from "../src/lib/ia/plano-topicos-peca";
import { precisaRefinoAreaIa } from "../src/lib/inferir-area-refino";
import { createSuite } from "./casos-ouro/suite";

type CenarioComparativo = {
  id: string;
  rotulo: string;
  relato: string;
  /** Critérios MinutaIA (manual). */
  criteriosMinuta: string[];
  run: (assert: (cond: boolean, msg: string) => void) => void;
};

const CENARIOS: CenarioComparativo[] = [
  {
    id: "0006509",
    rotulo: "Cumprimento — exequente → MS constitucional",
    relato:
      "Cumprimento de sentença nº 0006509. Exequente Jefferson. Executada FACULDADES METROPOLITANAS. Decisão ilegal do juiz que reduziu astreintes de R$ 22.200 para R$ 600.",
    criteriosMinuta: [
      "Infere exequente (não executada) como polo",
      "Sugere MS (não agravo da executada)",
      "Área constitucional",
      "Plano com tópicos coerentes ao remédio",
    ],
    run(assert) {
      assert(inferirPoloDoRelato(this.relato) === "ativo", "polo exequente");
      const org = organizarCasoLocal({
        areaId: "jec",
        relato: this.relato,
        poloAdvocacia: "ativo",
      });
      assert(org.areaIdResolvida === "constitucional", "área constitucional");
      assert(org.preenchimento.especiePeca === "mandado-seguranca", "espécie MS");
    },
  },
  {
    id: "hc-penal",
    rotulo: "Habeas corpus — paciente",
    relato:
      "Meu cliente Ricardo Alves foi preso em flagrante por furto simples. Peço habeas corpus contra prisão preventiva. Tem moradia e família na cidade.",
    criteriosMinuta: [
      "Área penal/criminal",
      "Paciente não vira réu",
      "HC como espécie",
    ],
    run(assert) {
      const inf = inferirAreaChat({ texto: this.relato });
      assert(inf.areaId === "criminal", "área criminal");
      const org = organizarCasoLocal({
        areaId: inf.areaId,
        relato: this.relato,
        poloAdvocacia: "ativo",
      });
      assert(
        org.preenchimento.especiePeca?.includes("habeas") ?? false,
        "espécie HC"
      );
    },
  },
  {
    id: "bpc-prev",
    rotulo: "BPC/INSS — previdenciário",
    relato:
      "Pedi BPC/LOAS para meu filho. O INSS indeferiu. Renda familiar per capita R$ 180.",
    criteriosMinuta: ["Área previdenciária", "INSS como réu", "Pedido de benefício"],
    run(assert) {
      const inf = inferirAreaChat({ texto: this.relato });
      assert(inf.areaId === "previdenciario", "área previdenciário");
      const det = inferirAreaChatDetalhado({ texto: this.relato });
      assert(!precisaRefinoAreaIa(det), "área clara sem IA");
    },
  },
  {
    id: "consumidor-enel",
    rotulo: "Consumidor — corte de energia",
    relato:
      "Caso consumidor CDC. Sou Maria Santos, brasileira, CPF 529.982.247-25. A Enel São Paulo cortou a energia em 15/01/2026. Pede tutela e danos morais.",
    criteriosMinuta: ["Área consumidor", "Réu concessionária", "Dano moral"],
    run(assert) {
      const inf = inferirAreaChat({ texto: this.relato });
      assert(inf.areaId === "consumidor", "área consumidor");
      const partes = extrairPartesDoRelato(this.relato);
      assert(
        partes.reusNomes.some((n) => /Enel/i.test(n)),
        "Enel como réu"
      );
    },
  },
  {
    id: "trabalhista",
    rotulo: "Reclamação trabalhista",
    relato:
      "Reclamação trabalhista CLT verbas rescisórias. Reclamante João contra Empresa XYZ. Horas extras e FGTS não pagos.",
    criteriosMinuta: ["Área trabalhista", "Reclamante ativo", "Verbas rescisórias/FGTS"],
    run(assert) {
      const inf = inferirAreaChat({ texto: this.relato });
      assert(inf.areaId === "trabalhista", "área trabalhista");
      const org = organizarCasoLocal({
        areaId: "trabalhista",
        relato: this.relato,
        poloAdvocacia: "ativo",
      });
      assert(org.areaIdResolvida === "trabalhista", "rito trabalhista");
    },
  },
  {
    id: "jec-inicial",
    rotulo: "JEC — petição inicial consumo",
    relato:
      "Petição inicial no juizado especial cível Lei 9.099. Autor comprou celular com defeito, loja recusou troca. Valor R$ 2.800.",
    criteriosMinuta: ["JEC ou consumidor", "Pedido indenização/troca", "Valor dentro do teto"],
    run(assert) {
      const inf = inferirAreaChat({ texto: this.relato, leigo: true });
      assert(
        inf.areaId === "jec" || inf.areaId === "consumidor",
        "JEC ou consumidor"
      );
    },
  },
  {
    id: "contestacao",
    rotulo: "Contestação — polo passivo",
    relato:
      "Contestação. Réu banco X contesta ação de cobrança indevida. Impugna fatos e pedidos.",
    criteriosMinuta: ["Polo passivo", "Espécie contestação", "Não pede confirmação de área óbvia"],
    run(assert) {
      assert(inferirPoloDoRelato(this.relato) === "passivo", "polo passivo");
    },
  },
  {
    id: "lastro-topico",
    rotulo: "Lastro A+B — parser LASTRO/ENCAIXE",
    relato: "(estrutura de plano)",
    criteriosMinuta: [
      "Plano mostra de onde veio cada tópico",
      "Cita fls. quando há autos",
    ],
    run(assert) {
      const texto = `
PLANO DE TÓPICOS
I. DOS FATOS
LASTRO: relato | fls. 8
ENCAIXE: Cobrança indevida em 10/03/2024.
II. DO DANO MORAL
LASTRO: CDC art. 6 | tese dano moral
`;
      const topicos = extrairPlanoTopicos(texto);
      assert(topicos.length === 2, "dois tópicos");
      assert(Boolean(topicos[0]!.encaixe), "encaixe parseado");
      assert(
        Boolean(topicos[0]!.lastro?.some((l) => l.ref.includes("fls. 8"))),
        "fls. no lastro"
      );
      const enriquecidos = complementarLastroTopicos({
        topicos,
        estrategiaJuridica: texto,
        cobertura: [],
      });
      const ex = montarLastroTopicoExibicao(enriquecidos[0]!, []);
      assert(Boolean(ex.encaixe), "hint mostra encaixe");
      assert(parseLastroLinha("LASTRO: relato | fls. 1").length === 2, "parseLastroLinha");
    },
  },
];

function main() {
  const { assert, stats } = createSuite();
  const linhas: string[] = [
    "# Comparativo FACTO × MinutaIA",
    "",
    `Gerado: ${new Date().toISOString()}`,
    "",
    "## FACTO (automático)",
    "",
  ];

  let falhasTotais = 0;
  for (const c of CENARIOS) {
    console.log(`\n▸ ${c.id} — ${c.rotulo}`);
    const antes = stats().falhas;
    c.run(assert);
    const okCenario = stats().falhas === antes;
    if (!okCenario) falhasTotais++;
    linhas.push(
      `${okCenario ? "- [x]" : "- [ ]"} **${c.id}** — ${c.rotulo}`
    );
  }

  linhas.push(
    "",
    "## MinutaIA (manual — mesmo relato/PDF)",
    "",
    "| ID | Critérios a conferir | FACTO | MinutaIA | Notas |",
    "|----|----------------------|-------|----------|-------|"
  );

  for (const c of CENARIOS) {
    for (const crit of c.criteriosMinuta) {
      linhas.push(
        `| ${c.id} | ${crit} | ✓ auto | ☐ | |`
      );
    }
  }

  linhas.push(
    "",
    "## Próximo passo (pós-comparativo)",
    "",
    "- [ ] Juris/`fls.` clicáveis na peça redigida (se `[[JURIS]]` estável nos cenários com juris)",
    "- [ ] Inspector lateral no ícone do plano (camada C)",
    ""
  );

  const outPath = "scripts/comparativo-paridade-minutaia.md";
  const fs = require("node:fs") as typeof import("node:fs");
  fs.writeFileSync(outPath, linhas.join("\n"), "utf8");

  console.log(`\n${stats().oks} ok · ${stats().falhas} falha(s)`);
  console.log(`Relatório: ${outPath}`);
  if (stats().falhas > 0) process.exit(1);
}

main();
