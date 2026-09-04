/**
 * Amostra densas Const/Prev/Trab via gerarPecaComIA (paygo + Sonnet se teto).
 * Não depende de /api (útil quando o next local não serve rotas).
 *
 * Uso: npx tsx scripts/smoke-amostra-densas.ts
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import { EMAIL_COMPLETO_TESTE } from "../src/lib/emails-acesso-livre";
import { gerarPecaComIA } from "../src/lib/ia/gerar-peca-com-ia";
import {
  posProcessarAntesQualificacao,
  posProcessarDepoisQualificacao,
} from "../src/lib/ia/pos-processar-peca-gerada";
import {
  especialidadeVaraDoTexto,
  numeroVaraDoTexto,
} from "../src/lib/peca-cabivel-autos";
import { formatarEnderecamentoPadrao } from "../src/lib/endereco-comarca";

config({ path: resolve(process.cwd(), ".env.local") });

type Caso = {
  id: string;
  areaId: string;
  especie: string;
  tipoAcao: string;
  fatos: string;
  checagens: RegExp[];
  proibidos?: RegExp[];
};

const CASOS: Caso[] = [
  {
    id: "constitucional-ms",
    areaId: "constitucional",
    especie: "mandado-seguranca",
    tipoAcao: "Mandado de segurança — concurso público",
    fatos: [
      "Impetrante MARIA APARECIDA SILVA, CPF 529.982.247-25, Rua da Consolação 1500, São Paulo/SP.",
      "Ato coator: Portaria nº 412/2025 da Secretária Municipal de Gestão de São Paulo que excluiu a",
      "impetrante da nomeação no concurso Edital 01/2023 (Analista Administrativo), apesar de aprovada",
      "em 3º lugar e havendo vagas após homologação de 10/11/2025. Direito líquido e certo à nomeação",
      "(CF art. 5º, LXIX; Lei 12.016/2009). Provas: edital, homologação, lista, portaria, certidão de vagas.",
      "Pedido: liminar suspendendo a Portaria 412/2025 e concessão da segurança para nomeação.",
      "Juízo: 1ª Vara da Fazenda Pública da Capital/SP. Não inventar outros atos nem outro cargo.",
    ].join(" "),
    checagens: [
      /MANDADO\s+DE\s+SEGURAN|SEGURAN[CÇ]A/i,
      /MARIA|IMPETRANT/i,
      /12\.016|LXIX|nomea/i,
      /Nestes termos|pede deferimento|Diante do exposto|Ante o exposto|Termos em que/i,
    ],
    proibidos: [/habeas\s+corpus/i, /BPC|LOAS/i, /reclama[cç][aã]o\s+trabalhista/i],
  },
  {
    id: "previdenciario-bpc",
    areaId: "previdenciario",
    especie: "peticao-inicial",
    tipoAcao: "Ação de concessão de BPC/LOAS",
    fatos: [
      "Autor PEDRO HENRIQUE COSTA, nascido em 15/03/2018, representado pela genitora Ana Costa,",
      "CPF 390.533.447-05, Rua das Palmeiras 45, Guarulhos/SP. BPC/LOAS indeferido pelo INSS em",
      "20/01/2026 (NB 712.345.678-0) por renda. Renda familiar per capita R$ 180,00. Criança com",
      "deficiência intelectual moderada (laudo CID F71, 05/12/2025, CRM/SP 123456). Pedido: conceder",
      "BPC desde a DER 10/11/2025, com tutela. Juizado Especial Federal de Guarulhos/SP. Lei 8.742/93",
      "e CF art. 203. Não inventar RMI, tempo de contribuição nem aposentadoria por invalidez.",
    ].join(" "),
    checagens: [
      /BPC|LOAS|8\.742|presta[cç][aã]o\s+continuada/i,
      /INSS|PEDRO|ANA/i,
      /benef[ií]cio|defici[eê]ncia|renda/i,
      /Nestes termos|pede deferimento|Diante do exposto|Ante o exposto|Termos em que/i,
    ],
    proibidos: [/horas\s+extras|FGTS|\bCLT\b/i, /mandado\s+de\s+seguran/i],
  },
  {
    id: "trabalhista-reclamacao",
    areaId: "trabalhista",
    especie: "reclamacao",
    tipoAcao: "Reclamação trabalhista — verbas e horas extras",
    fatos: [
      "Reclamante JOÃO SILVA, CPF 529.982.247-25, Rua Augusta 200, São Paulo/SP. Reclamada EMPRESA XYZ",
      "COMÉRCIO LTDA, CNPJ 12.345.678/0001-90, Av. Paulista 1000. Contrato 01/02/2020–15/01/2026,",
      "demissão sem justa causa, auxiliar administrativo. Laborava 08h–20h sem HE. FGTS a menor",
      "(~R$ 4.800). Pedidos: HE 50%/100% com reflexos, diferenças FGTS, multa 40%, aviso, férias+1/3,",
      "13º, dano moral R$ 5.000. 15ª Vara do Trabalho de São Paulo/SP. Não inventar acidente nem assédio.",
    ].join(" "),
    checagens: [
      /RECLAMA[CÇ]|TRABALH/i,
      /JO[AÃ]O|XYZ|RECLAMANTE/i,
      /horas?\s+extras?|FGTS|CLT/i,
      /Nestes termos|pede deferimento|Diante do exposto|Ante o exposto|Termos em que/i,
    ],
    proibidos: [/BPC|LOAS/i, /\bJEC\b|Juizado Especial C[ií]vel/i],
  },
];

async function userIdCompleto(): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (error) throw error;
  const u = data.users.find(
    (x) => x.email?.toLowerCase() === EMAIL_COMPLETO_TESTE.toLowerCase()
  );
  if (!u) throw new Error(`usuário ${EMAIL_COMPLETO_TESTE} não encontrado`);
  return u.id;
}

async function main() {
  const userId = await userIdCompleto();
  mkdirSync("tmp", { recursive: true });
  const resultados: { id: string; ok: boolean; detalhe: string }[] = [];

  console.log(`Amostra densas · user ${EMAIL_COMPLETO_TESTE} · Sonnet via Completo+fundo\n`);

  for (const caso of CASOS) {
    process.stdout.write(`▸ ${caso.id} … `);
    try {
      const nVara = numeroVaraDoTexto(caso.fatos) ?? "1";
      const esp = especialidadeVaraDoTexto(caso.fatos);
      const cidade =
        caso.areaId === "previdenciario"
          ? "Guarulhos"
          : /guarulhos/i.test(caso.fatos)
            ? "Guarulhos"
            : "São Paulo";
      const enderecamento = formatarEnderecamentoPadrao({
        areaId: caso.areaId,
        especiePeca: caso.especie,
        comarca: {
          cidade,
          uf: "SP",
          numeroJuizado: nVara,
          especialidadeVara: esp ?? undefined,
          foro: caso.fatos.slice(0, 400),
        },
      });
      console.log(`  end: ${enderecamento.slice(0, 100)}…`);

      const ia = await gerarPecaComIA({
        tipoAcao: caso.tipoAcao,
        fatos: caso.fatos,
        especiePeca: caso.especie,
        areaId: caso.areaId,
        casoReal: true,
        poloAdvocacia: "ativo",
        adesaoRedacao: "livre",
        esforcoRedacao: "fundo",
        roteamento: { userId, plano: "mensal" },
        instrucoes: {
          enderecamento,
          localFechamento: "São Paulo/SP",
          autorNome: "Advogado FACTO Teste",
          autorOab: "OAB/SP 147099",
        },
      });

      if (!ia.ok || !ia.textoGerado) {
        throw new Error(ia.ok === false ? ia.erro : "sem texto");
      }

      let peca = posProcessarAntesQualificacao(ia.textoGerado, {
        areaId: caso.areaId,
        especie: caso.especie,
        enderecamento,
        fatos: caso.fatos,
      });
      peca = posProcessarDepoisQualificacao(peca, {
        areaId: caso.areaId,
        especie: caso.especie,
        fatos: caso.fatos,
      });

      for (const re of caso.checagens) {
        if (!re.test(peca)) {
          throw new Error(`checagem ${re} · ${peca.slice(0, 240)}`);
        }
      }
      for (const re of caso.proibidos ?? []) {
        if (re.test(peca)) {
          throw new Error(`proibido ${re} · ${peca.match(re)?.[0]}`);
        }
      }

      const redator = ia.equipeEtapas?.find(
        (e) => e.id === "redator" || /redator/i.test(e.skin ?? "")
      );
      const detalhe = String(redator?.detalhe ?? ia.modelo ?? "");
      writeFileSync(`tmp/amostra-${caso.id}.txt`, peca, "utf8");
      console.log(`OK (${peca.length} chars)`);
      console.log(`  ${detalhe.slice(0, 160)}`);
      if (/VARA C[IÍ]VEL/i.test(peca) && !/vara\s+c[ií]vel/i.test(caso.fatos)) {
        console.log("  aviso: ainda cita VARA CÍVEL sem lastro");
      }
      resultados.push({ id: caso.id, ok: true, detalhe: `${peca.length} · ${detalhe}` });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log("FALHA");
      console.error(`  ${msg}`);
      resultados.push({ id: caso.id, ok: false, detalhe: msg });
    }
  }

  const ok = resultados.filter((r) => r.ok).length;
  console.log(`\nResumo: ${ok}/${resultados.length} ok`);
  writeFileSync(
    "tmp/amostra-densas-resumo.json",
    JSON.stringify(resultados, null, 2),
    "utf8"
  );
  if (ok < resultados.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
