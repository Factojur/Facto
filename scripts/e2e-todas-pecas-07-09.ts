/**
 * E2E: todas as espécies da matriz por área (inaugurais + incidentais).
 * Salva txt/pdf/docx em testes-e2e-07-09-todas/<area>/<especie>/.
 *
 * Uso: npx tsx scripts/e2e-todas-pecas-07-09.ts
 * Retomável: pula pasta que já tem peca.pdf com ___ª (inaugural) ou Nestes termos.
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { config } from "dotenv";
import { formatarEnderecamentoPadrao } from "../src/lib/endereco-comarca";
import { gerarPecaDocxBuffer } from "../src/lib/exportar-peca-docx";
import { gerarPecaPdfBuffer } from "../src/lib/exportar-peca-pdf";
import {
  AREAS_COM_POLO_ADVOCACIA,
  MATRIZ_POLO_POR_AREA,
} from "../src/lib/polo-especies-por-area";
import {
  canonizarEspecieDaArea,
  idsPeticaoInicialDaArea,
  tituloPecaDaArea,
} from "../src/lib/peca-especie-area";
import { extrairAssinaturaDoTexto } from "../src/lib/ia/aplicar-assinatura-peca";

config({ path: resolve(process.cwd(), ".env.local") });

const OUT = resolve(process.cwd(), "testes-e2e-07-09-todas");

const COMARCA: Record<string, { cidade: string; uf: string }> = {
  jec: { cidade: "Campinas", uf: "SP" },
  civil: { cidade: "Campinas", uf: "SP" },
  consumidor: { cidade: "Santos", uf: "SP" },
  familia: { cidade: "Ribeirão Preto", uf: "SP" },
  imobiliario: { cidade: "São Paulo", uf: "SP" },
  constitucional: { cidade: "Brasília", uf: "DF" },
  administrativo: { cidade: "São Paulo", uf: "SP" },
  tributario: { cidade: "São Paulo", uf: "SP" },
  trabalhista: { cidade: "Campinas", uf: "SP" },
  jecr: { cidade: "Campinas", uf: "SP" },
  criminal: { cidade: "Campinas", uf: "SP" },
  previdenciario: { cidade: "Campinas", uf: "SP" },
  empresarial: { cidade: "São Paulo", uf: "SP" },
  digital: { cidade: "São Paulo", uf: "SP" },
  ambiental: { cidade: "Curitiba", uf: "PR" },
  "propriedade-intelectual": { cidade: "Rio de Janeiro", uf: "RJ" },
  internacional: { cidade: "Brasília", uf: "DF" },
  medico: { cidade: "Belo Horizonte", uf: "MG" },
  agrario: { cidade: "Goiânia", uf: "GO" },
  eleitoral: { cidade: "Campinas", uf: "SP" },
};

function relatoBase(areaId: string, especie: string, titulo: string): string {
  const c = COMARCA[areaId] ?? { cidade: "Campinas", uf: "SP" };
  const local = `${c.cidade}/${c.uf}`;
  const adv =
    "Advogado: Dr. Rafael Ito, OAB/SP 180220, escritório na Rua Augusta, 1500, São Paulo/SP.";

  const comuns: Record<string, string> = {
    jec: `Autor João Silva, CPF 111.222.333-44, Rua A 10, ${local}. Ré Empresa Luz SA, CNPJ 00.111.222/0001-33. Corte de energia indevido em jan/2026, fatura paga. Quero ${titulo} no Juizado Especial Cível de ${local}, justiça gratuita, danos morais R$ 5.000.`,
    civil: `Autor Maria Costa, CPF 222.333.444-55, ${local}. Réu Pedro Alves, CPF 333.444.555-66. Empréstimo R$ 12.000 não pago desde mar/2026. Quero ${titulo} na justiça comum de ${local}.`,
    consumidor: `Consumidora Ana Lima, CPF 444.555.666-77, ${local}. Ré Loja Tech Ltda, CNPJ 11.222.333/0001-44. Notebook com defeito, recusa de troca. Quero ${titulo} (CDC) em ${local}.`,
    familia: `Requerente Ana Beatriz Souza, professora, CPF 390.533.447-05, ${local}. Requerido Lucas Mendes, CPF 529.982.247-25. Filho Miguel 6 anos. Quero ${titulo} na Vara de Família de ${local}, alimentos 30% ou 1 SM, JG.`,
    imobiliario: `Autora Imobiliária Horizonte Ltda, CNPJ 11.222.333/0001-81, ${local}. Ré Juliana Prado, CPF 123.456.789-09. Locação apto 72, aluguel R$ 3.200, inadimplente desde mai/2026, notificada 20/07/2026. Quero ${titulo} em ${local}.`,
    trabalhista: `Reclamante Carlos Souza, CPF 555.666.777-88, ${local}. Reclamada Metalúrgica Alfa Ltda, CNPJ 22.333.444/0001-55. Demissão sem verbas; horas extras. Quero ${titulo} na JT de ${local}.`,
    jecr: `Querelante Paulo Dias, CPF 666.777.888-99, ${local}. Querelado Renato Cruz. Lesão corporal leve em briga de bar 01/08/2026. Quero ${titulo} no JECRIM de ${local}.`,
    criminal: `Paciente/acusado Marcos Vieira, CPF 777.888.999-00, ${local}. Prisão preventiva ou denúncia por furto. Quero ${titulo} no juízo criminal de ${local}. Processo nº 0001234-56.2026.8.26.0114.`,
    previdenciario: `Segurado José Ramos, CPF 888.999.000-11, NB 123.456.789-0, ${local}. INSS negou aposentadoria por invalidez. Quero ${titulo} contra o INSS no JEF de ${local}.`,
    administrativo: `Autor Sindicato Beta, CNPJ 33.444.555/0001-66, ${local}. Ato administrativo ilegal do Município. Quero ${titulo} em ${local}.`,
    tributario: `Contribuinte Empresa Gama Ltda, CNPJ 44.555.666/0001-77, ${local}. Cobrança indevida de ISS. Quero ${titulo} na Fazenda Pública de ${local}.`,
    constitucional: `Impetrante/autor Liga Cidadã, ${local}. Ato ilegal / omissão. Quero ${titulo}. Foro conforme a competência da peça.`,
    empresarial: `Autor Sócio A, CPF 999.000.111-22, ${local}. Conflito societário na Beta Comércio Ltda. Quero ${titulo} em ${local}.`,
    digital: `Autor Usuário X, CPF 101.202.303-44, ${local}. Vazamento de dados pela Plataforma Z. Quero ${titulo} (LGPD) em ${local}.`,
    ambiental: `Autor Ministério Público / associação, ${local}. Poluição de rio por indústria. Quero ${titulo} em ${local}.`,
    "propriedade-intelectual": `Autor Marca Aurora, CNPJ 55.666.777/0001-88, ${local}. Uso indevido da marca. Quero ${titulo} em ${local}.`,
    internacional: `Requerente Helena Borges, ${local}. Sentença estrangeira de divórcio a homologar / litígio internacional. Quero ${titulo}.`,
    medico: `Paciente Rita Nunes, CPF 121.314.151-66, ${local}. Erro médico em cirurgia 2025. Quero ${titulo} em ${local}.`,
    agrario: `Autor Produtor Rural, CPF 131.415.161-77, ${local}. Conflito de posse rural. Quero ${titulo} em ${local}.`,
    eleitoral: `Representante Partido Alfa, ${local}. Conduta vedada / propaganda irregular. Quero ${titulo} na Zona Eleitoral de ${local}.`,
  };

  let corpo = comuns[areaId] ?? `Caso em ${local}. Quero ${titulo}.`;

  // Incidentais: número de processo
  if (
    /contesta|defesa|replica|apelac|agravo|embargos|cumprimento|recurso|contrarraz|informa|impugna|alega|resposta|excecao|manifest/i.test(
      especie
    )
  ) {
    corpo += ` Processo nº 1001234-56.2025.8.26.0100 já em curso. Partes já qualificadas nos autos.`;
  }

  return `${corpo} ${adv}`;
}

function especiePassivoPadrao(areaId: string): string | null {
  const m = MATRIZ_POLO_POR_AREA[areaId as keyof typeof MATRIZ_POLO_POR_AREA];
  return m?.passivo[0] ?? null;
}

type Caso = {
  areaId: string;
  especie: string;
  pasta: string;
  inaugural: boolean;
};

function montarCasos(): Caso[] {
  const casos: Caso[] = [];
  const vistos = new Set<string>();
  for (const areaId of AREAS_COM_POLO_ADVOCACIA) {
    const m = MATRIZ_POLO_POR_AREA[areaId];
    const ids = new Set([...m.ativo, ...m.passivo, ...m.ambos]);
    const inaugurais = new Set(idsPeticaoInicialDaArea(areaId));
    for (const especieRaw of ids) {
      const especie = canonizarEspecieDaArea(areaId, especieRaw);
      const key = `${areaId}/${especie}`;
      if (vistos.has(key)) continue;
      vistos.add(key);
      casos.push({
        areaId,
        especie,
        pasta: join(areaId, especie),
        inaugural: inaugurais.has(especie) || inaugurais.has(especieRaw),
      });
    }
  }
  return casos;
}

function jaPronto(dir: string, inaugural: boolean): boolean {
  const pdf = join(dir, "peca.pdf");
  const txt = join(dir, "peca.txt");
  if (!existsSync(pdf) || !existsSync(txt)) return false;
  const t = readFileSync(txt, "utf8");
  if (!/Nestes termos|pede deferimento/i.test(t)) return false;
  if (inaugural && /UMA\s+DAS\s+VARAS/i.test(t)) return false;
  if (inaugural && /JUIZ|JUIZA|TRABALHO|FEDERAL|ELEITORAL/i.test(t.slice(0, 300))) {
    // Inaugural de 1ª instância deve ter ___ (exceto tribunal)
    if (
      !/TRIBUNAL|MINISTRO|DESEMBARGADOR|TURMA RECURSAL|SUPREMO|SUPERIOR|NOTIFICA/i.test(
        t.slice(0, 300)
      ) &&
      !/___/.test(t.slice(0, 400))
    ) {
      return false;
    }
  }
  return true;
}

async function gerarUm(caso: Caso): Promise<{ ok: boolean; msg: string }> {
  const dir = join(OUT, caso.pasta);
  mkdirSync(dir, { recursive: true });
  if (jaPronto(dir, caso.inaugural)) {
    return { ok: true, msg: "skip" };
  }

  const titulo =
    tituloPecaDaArea(caso.areaId, caso.especie) || caso.especie;
  const relato = relatoBase(caso.areaId, caso.especie, titulo);
  const comarca = COMARCA[caso.areaId] ?? { cidade: "Campinas", uf: "SP" };
  const enderecamento = formatarEnderecamentoPadrao({
    areaId: caso.areaId,
    especiePeca: caso.especie,
    varaEmBranco: caso.inaugural,
    comarca: {
      cidade: comarca.cidade,
      uf: comarca.uf,
      numeroJuizado: caso.inaugural ? undefined : "1",
    },
  });
  const ass = extrairAssinaturaDoTexto(relato);

  const { gerarPecaComIA } = await import("../src/lib/ia/gerar-peca-com-ia");
  const out = await gerarPecaComIA({
    tipoAcao: titulo,
    fatos: relato,
    especiePeca: caso.especie,
    areaId: caso.areaId,
    casoReal: true,
    atuarLeigo: false,
    poloAdvocacia: caso.inaugural
      ? "ativo"
      : especiePassivoPadrao(caso.areaId) === caso.especie
        ? "passivo"
        : "ativo",
    esforcoRedacao: "agil",
    instrucoes: {
      nomePeca: titulo,
      enderecamento,
      autorNome: ass.nome,
      autorOab: ass.oab,
      localFechamento: ass.local ?? `${comarca.cidade}/${comarca.uf}`,
      pedirJusticaGratuita: caso.inaugural,
      partesJaQualificadas: !caso.inaugural,
    },
    roteamento: { userId: "e2e-todas-07-09", plano: "pro" },
  });

  if (!out.ok) {
    writeFileSync(
      join(dir, "erro.txt"),
      `${new Date().toISOString()}\n${out.erro}\n`,
      "utf8"
    );
    return { ok: false, msg: out.erro };
  }

  const peca = out.textoGerado;
  const avisos: string[] = [];
  if (caso.inaugural && /UMA\s+DAS\s+VARAS/i.test(peca)) {
    avisos.push("ainda tem UMA DAS VARAS");
  }
  if (
    caso.inaugural &&
    !/TRIBUNAL|MINISTRO|DESEMBARGADOR|NOTIFICA/i.test(peca.slice(0, 350)) &&
    !/___/.test(peca.slice(0, 400))
  ) {
    avisos.push("inaugural sem ___ na linha de endereçamento");
  }

  writeFileSync(
    join(dir, "peca.txt"),
    [
      `Área: ${caso.areaId}`,
      `Espécie: ${caso.especie}`,
      `Título: ${titulo}`,
      `Inaugural: ${caso.inaugural}`,
      `Data: ${new Date().toISOString()}`,
      `Modelo: ${out.modelo}`,
      `Chars: ${peca.length}`,
      avisos.length ? `Avisos: ${avisos.join("; ")}` : "OK estrutural",
      "",
      peca,
    ].join("\n"),
    "utf8"
  );
  writeFileSync(join(dir, "peca.pdf"), await gerarPecaPdfBuffer(peca));
  writeFileSync(join(dir, "peca.docx"), await gerarPecaDocxBuffer(peca));
  writeFileSync(
    join(dir, "checklist.txt"),
    [
      `enderecamento: ${peca.split("\n")[0]}`,
      `___: ${/___/.test(peca.slice(0, 400))}`,
      `fechamento: ${/Nestes termos/i.test(peca)}`,
      ...avisos.map((a) => `AVISO: ${a}`),
    ].join("\n"),
    "utf8"
  );

  return {
    ok: avisos.length === 0,
    msg: avisos.length ? avisos.join("; ") : "ok",
  };
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const casos = montarCasos();
  console.log(
    `E2E todas peças → ${OUT}\nCasos: ${casos.length} (inaugurais: ${casos.filter((c) => c.inaugural).length})\n`
  );

  let ok = 0;
  let fail = 0;
  let skip = 0;
  const falhas: string[] = [];

  for (let i = 0; i < casos.length; i++) {
    const caso = casos[i]!;
    process.stdout.write(
      `[${i + 1}/${casos.length}] ${caso.areaId}/${caso.especie} … `
    );
    try {
      const r = await gerarUm(caso);
      if (r.msg === "skip") {
        skip++;
        console.log("skip");
      } else if (r.ok) {
        ok++;
        console.log(r.msg);
      } else {
        fail++;
        falhas.push(`${caso.pasta}: ${r.msg}`);
        console.log("FALHA", r.msg.slice(0, 120));
      }
    } catch (e) {
      fail++;
      const msg = e instanceof Error ? e.message : String(e);
      falhas.push(`${caso.pasta}: ${msg}`);
      console.log("EXC", msg.slice(0, 120));
      writeFileSync(
        join(OUT, caso.pasta, "erro.txt"),
        String(e),
        "utf8"
      );
    }
  }

  const resumo = [
    `ok=${ok} skip=${skip} fail=${fail} total=${casos.length}`,
    ...falhas,
  ].join("\n");
  writeFileSync(join(OUT, "_resumo.txt"), resumo, "utf8");
  console.log("\n" + resumo);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
