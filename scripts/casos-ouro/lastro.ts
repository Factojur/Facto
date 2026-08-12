import {
  MARCADOR_NAO_ENCONTRADO,
  anotarJurisprudenciasSemLastro,
  contarMarcadoresNaoEncontrado,
  verificarCitacoes,
} from "../../src/lib/ia/verificacao-citacoes";
import type { SuiteStats } from "./suite";

function soDigitos(s: string): string {
  return s.replace(/\D/g, "");
}

function acharJuris(
  citacoes: ReturnType<typeof verificarCitacoes>,
  juris: string
) {
  const dig = soDigitos(juris);
  const alvo = juris.toLowerCase().replace(/\s+/g, " ");
  const hits = citacoes.filter((c) => {
    if (c.tipo !== "jurisprudencia") return false;
    const cd = soDigitos(c.trecho);
    if (dig.length === 20) return cd === dig || cd.endsWith(dig);
    if (cd === dig) return true;
    const trechoN = c.trecho.toLowerCase().replace(/\s+/g, " ");
    return (
      trechoN.includes(alvo.slice(0, 18)) || alvo.includes(trechoN.slice(0, 18))
    );
  });
  return hits.sort((a, b) => b.trecho.length - a.trecho.length)[0];
}

function normalizarLeiChave(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/n[ºo°.]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function acharLei(
  citacoes: ReturnType<typeof verificarCitacoes>,
  lei: string
) {
  const alvo = normalizarLeiChave(lei);
  const alvoNum = alvo.replace(/^lei\s*/, "");
  return citacoes.find((c) => {
    if (c.tipo !== "lei") return false;
    const trechoN = normalizarLeiChave(c.trecho);
    if (trechoN.includes(alvo) || alvo.includes(trechoN)) return true;
    if (alvoNum.length >= 4 && trechoN.includes(alvoNum)) return true;
    return false;
  });
}

type AssertFn = (cond: boolean, msg: string) => void;

export function rodarAssertsLastro(opts: {
  assert: AssertFn;
  texto: string;
  contextoLastro: string;
  jurisComLastro: string[];
  jurisSemLastro: string[];
  leisComLastro?: string[];
  prefixo?: string;
}) {
  const {
    assert,
    texto,
    contextoLastro,
    jurisComLastro,
    jurisSemLastro,
    leisComLastro = [],
    prefixo = "",
  } = opts;
  const p = prefixo ? `${prefixo}: ` : "";

  const citacoes = verificarCitacoes(texto, contextoLastro);
  const anotada = anotarJurisprudenciasSemLastro(texto, citacoes);
  const marcadores = contarMarcadoresNaoEncontrado(anotada);

  for (const juris of jurisComLastro) {
    const hit = acharJuris(citacoes, juris);
    assert(Boolean(hit), `${p}detecta juris com lastro: ${juris}`);
    assert(Boolean(hit?.verificada), `${p}lastro OK: ${juris}`);
    assert(
      !anotada.includes(`${hit?.trecho} ${MARCADOR_NAO_ENCONTRADO}`),
      `${p}não marca juris lastreada: ${juris}`
    );
  }

  for (const juris of jurisSemLastro) {
    const hit = acharJuris(citacoes, juris);
    assert(Boolean(hit), `${p}detecta juris sem lastro: ${juris}`);
    assert(hit ? !hit.verificada : false, `${p}sem lastro: ${juris}`);
    if (hit) {
      const ancora =
        hit.trecho.match(/\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/)?.[0] ||
        hit.trecho;
      const pos = anotada.indexOf(ancora);
      const janela =
        pos >= 0 ? anotada.slice(pos, pos + ancora.length + 80) : "";
      assert(
        janela.includes(MARCADOR_NAO_ENCONTRADO),
        `${p}marca ${MARCADOR_NAO_ENCONTRADO} após ${juris}`
      );
    }
  }

  for (const lei of leisComLastro) {
    const hit = acharLei(citacoes, lei);
    assert(Boolean(hit), `${p}detecta lei/súmula com lastro: ${lei}`);
    assert(Boolean(hit?.verificada), `${p}lastro lei OK: ${lei}`);
  }

  if (jurisSemLastro.length > 0) {
    assert(
      marcadores >= jurisSemLastro.length,
      `${p}marcadores ≥ juris inventadas (${marcadores})`
    );
  }

  return { citacoes, anotada };
}

export function mergeStats(...stats: SuiteStats[]): SuiteStats {
  return stats.reduce(
    (acc, s) => ({ oks: acc.oks + s.oks, falhas: acc.falhas + s.falhas }),
    { oks: 0, falhas: 0 }
  );
}
