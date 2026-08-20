import {
  avaliarInversaoOnusProva,
  injetarInversaoOnusProva,
} from "@/lib/inversao-onus-prova";

function ok(cond: boolean, msg: string) {
  console.log(cond ? `  ✓ ${msg}` : `  ✗ ${msg}`);
  return cond;
}

let pass = 0;
let fail = 0;

function test(name: string, fn: () => boolean) {
  console.log(`\n${name}`);
  if (fn()) pass++;
  else fail++;
}

test("CDC banco — cabível", () => {
  const r = avaliarInversaoOnusProva({
    areaId: "jec",
    fatos: "Golpe PIX. Autor é consumidor. Banco Santander não bloqueou.",
    tipoAcao: "Indenização por danos morais e materiais",
    especiePeca: "peticao-inicial",
    poloAdvocacia: "ativo",
  });
  return (
    ok(Boolean(r?.cabivel), "cabível") &&
    ok(r?.confianca === "alta" || r?.confianca === "media", "confiança") &&
    ok(Boolean(r?.subtitulo?.includes("inversão")), "subtítulo")
  );
});

test("Polo passivo — não cabe", () => {
  const r = avaliarInversaoOnusProva({
    areaId: "consumidor",
    fatos: "Relação de consumo com defeito no produto.",
    tipoAcao: "Contestação",
    especiePeca: "contestacao",
    poloAdvocacia: "passivo",
  });
  return ok(r === null, "null para passivo");
});

test("Civil entre particulares — não cabe", () => {
  const r = avaliarInversaoOnusProva({
    areaId: "civil",
    fatos: "Mútuo entre vizinhos. Empréstimo de R$ 5.000 não pago.",
    tipoAcao: "Ação de cobrança",
    especiePeca: "peticao-inicial",
    poloAdvocacia: "ativo",
  });
  return ok(r === null, "sem CDC");
});

test("Injeção quando IA omitiu", () => {
  const av = avaliarInversaoOnusProva({
    areaId: "consumidor",
    fatos: "Plano de saúde negou cirurgia. Operadora Unimed.",
    tipoAcao: "Obrigação de fazer",
    especiePeca: "peticao-inicial",
    poloAdvocacia: "ativo",
  });
  if (!av) return ok(false, "avaliação");
  const peca =
    "II - DO DIREITO\na) Da relação de consumo\nTexto.\n\nIII - DO VALOR DA CAUSA\nR$ 10.000,00";
  const out = injetarInversaoOnusProva(peca, av);
  return ok(/invers[aã]o do [ôo]nus da prova/i.test(out), "injetou subtópico");
});

console.log(`\n--- ${pass} ok, ${fail} falha(s) ---`);
process.exit(fail > 0 ? 1 : 0);
