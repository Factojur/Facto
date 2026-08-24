/**
 * Smoke: 1 consulta de lastro curado por área aberta (+ scaffold sem Gemini).
 * Uso: npx tsx scripts/testar-smoke-areas-lastro.ts
 *
 * Não consome cota de peça. Usa embedding (GEMINI) + Supabase.
 * Falhas de lastro fraco = aviso (exit 0 se só avisos); exit 1 se erro duro.
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const { AREAS_ATUACAO } = await import("../src/lib/areas-atuacao");
  const { buscarConhecimentoRelacionado } = await import(
    "../src/lib/base-conhecimento"
  );
  const { gerarPecaJec } = await import("../src/lib/gerar-peca-jec");
  const { listaEspeciesDaArea } = await import("../src/lib/peca-especie-area");
  const { moduloDaArea } = await import("../src/lib/minuta-modulo");

  const abertas = AREAS_ATUACAO.filter((a) => a.available);
  console.log(
    `Smoke lastro · ${abertas.length} áreas · ${new Date().toISOString()}\n`
  );

  let ok = 0;
  let fraco = 0;
  let falhas = 0;

  const queries: Record<string, string> = {
    jec: "Juizado consumidor negativação indevida dano moral",
    civil: "obrigação de fazer inadimplemento contratual",
    consumidor: "CDC falha serviço negativação",
    trabalhista: "CLT horas extras verbas rescisórias",
    familia: "alimentos guarda divórcio",
    imobiliario: "despejo locação Lei 8.245",
    jecr: "JECRIM Lei 9.099 criminal",
    criminal: "habeas corpus CPP",
    constitucional: "mandado de segurança Constituição",
    tributario: "execução fiscal CDA Lei 6.830",
    previdenciario: "benefício INSS Lei 8.213",
    administrativo: "mandado de segurança Fazenda",
    empresarial: "recuperação judicial falência societário",
    ambiental: "dano ambiental ACP",
    "propriedade-intelectual": "marca LPI direitos autorais",
    internacional: "homologação sentença estrangeira",
    digital: "LGPD dados pessoais",
    medico: "erro médico responsabilidade civil",
    agrario: "Estatuto da Terra posse",
    eleitoral: "Lei 9.504 propaganda eleitoral",
  };

  for (const area of abertas) {
    const q = queries[area.id] ?? `${area.title} jurisprudência`;
    process.stdout.write(`▸ ${area.id.padEnd(22)} `);
    try {
      const trechos = await buscarConhecimentoRelacionado(q, 6, q, area.id);
      const n = trechos.length;
      const especies = listaEspeciesDaArea(area.id) ?? [];
      const especie = especies[0]?.id ?? "peticao-inicial";
      const modulo = moduloDaArea(area.id);

      const scaffold = gerarPecaJec({
        tipoAcao: especies[0]?.rotulo ?? "Petição",
        fatos: `Caso smoke ${area.title}: ${q}. Partes fictícias para teste estrutural.`,
        areaId: area.id,
        especiePeca: especie,
        provas: [],
        fotos: [],
        midias: [],
        documentos: {},
        baseConhecimento: trechos.slice(0, 4),
        tutelaUrgencia: false,
        pedirJusticaGratuita: false,
        temMle: false,
      });

      const peca = scaffold.peca ?? "";
      const vazou9099 =
        area.id !== "jec" &&
        area.id !== "jecr" &&
        /9\.?099/.test(peca) &&
        /Lei\s*n[ºo°]?\s*9\.?099/i.test(peca);

      if (vazou9099) {
        console.log(`FALHA · Lei 9.099 na peça (${n} lastro)`);
        falhas++;
        continue;
      }

      if (n === 0) {
        console.log(
          `FRACO · 0 lastro · ${especies.length} espécies · ${modulo.rotuloNav}`
        );
        fraco++;
      } else {
        console.log(
          `OK · ${n} lastro · scaffold ${peca.length} chars · ${especies.length} espécies`
        );
        ok++;
      }
    } catch (erro) {
      console.log(
        `ERRO · ${erro instanceof Error ? erro.message : String(erro)}`
      );
      falhas++;
    }
  }

  console.log(
    `\nResumo: ${ok} ok · ${fraco} lastro fraco · ${falhas} falhas (de ${abertas.length})`
  );
  if (falhas > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
