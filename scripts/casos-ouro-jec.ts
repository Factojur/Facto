/**
 * Suite casos-ouro JEC — regressão local sem Gemini (0 tokens).
 *
 * Valida, por tema típico:
 * - normalização forense da peça
 * - lastro de jurisprudência (com / sem marcador [NÃO ENCONTRADO NA BASE])
 * - híbrido (fatos IA + DO DIREITO de reserva) quando aplicável
 *
 * Uso: npm run test:casos-ouro
 */

import {
  garantirSecaoValorCausa,
  mesclarFatosIaComDireitoReserva,
} from "../src/lib/ia/mesclar-peca-hibrida";
import { normalizarPecaGerada } from "../src/lib/ia/normalizar-peca-gerada";
import {
  MARCADOR_NAO_ENCONTRADO,
  anotarJurisprudenciasSemLastro,
  contarMarcadoresNaoEncontrado,
  verificarCitacoes,
} from "../src/lib/ia/verificacao-citacoes";
import { CASOS_OURO_JEC, type CasoOuroJec } from "./casos-ouro/fixtures";

let falhas = 0;
let oks = 0;

function assert(cond: boolean, msg: string) {
  if (!cond) {
    falhas++;
    console.error(`  FAIL: ${msg}`);
    return;
  }
  oks++;
  console.log(`  OK: ${msg}`);
}

function soDigitos(s: string): string {
  return s.replace(/\D/g, "");
}

function rodarCaso(caso: CasoOuroJec) {
  console.log(`\n▸ ${caso.id} — ${caso.tema}`);

  const normalizada = normalizarPecaGerada(caso.pecaIaBruta);

  assert(
    /I\s*-\s*DOS FATOS/i.test(normalizada),
    "seção DOS FATOS presente"
  );
  assert(
    /II\s*-\s*DO DIREITO/i.test(normalizada),
    "seção DO DIREITO presente"
  );
  assert(
    /DOS PEDIDOS/i.test(normalizada),
    "seção DOS PEDIDOS presente"
  );
  assert(
    (normalizada.match(/\n/g)?.length ?? 0) > 8,
    "peça multilinha após normalização"
  );

  for (const chave of caso.fatosChave) {
    assert(
      new RegExp(chave.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(
        normalizada
      ),
      `preserva fato: “${chave}”`
    );
  }

  const citacoes = verificarCitacoes(normalizada, caso.contextoLastro);
  const anotada = anotarJurisprudenciasSemLastro(normalizada, citacoes);
  const marcadores = contarMarcadoresNaoEncontrado(anotada);

  for (const juris of caso.jurisComLastro) {
    const dig = soDigitos(juris);
    const hit = citacoes.find(
      (c) =>
        c.tipo === "jurisprudencia" &&
        (soDigitos(c.trecho).includes(dig) ||
          soDigitos(c.trecho) === dig ||
          dig.includes(soDigitos(c.trecho)))
    );
    assert(Boolean(hit), `detecta juris com lastro: ${juris}`);
    assert(Boolean(hit?.verificada), `lastro OK: ${juris}`);
    assert(
      !anotada.includes(`${hit?.trecho} ${MARCADOR_NAO_ENCONTRADO}`),
      `não marca juris lastreada: ${juris}`
    );
  }

  for (const juris of caso.jurisSemLastro) {
    const dig = soDigitos(juris);
    const hit = citacoes.find((c) => {
      if (c.tipo !== "jurisprudencia") return false;
      if (dig.length >= 6 && soDigitos(c.trecho).includes(dig)) return true;
      const trechoN = c.trecho.toLowerCase();
      const alvoN = juris.toLowerCase();
      return (
        trechoN.includes(alvoN.replace(/\s+/g, " ").slice(0, 12)) ||
        alvoN.includes(trechoN.slice(0, 12))
      );
    });
    assert(Boolean(hit), `detecta juris sem lastro: ${juris}`);
    assert(hit ? !hit.verificada : false, `sem lastro: ${juris}`);
    if (hit) {
      assert(
        anotada.includes(`${hit.trecho} ${MARCADOR_NAO_ENCONTRADO}`) ||
          anotada.includes(MARCADOR_NAO_ENCONTRADO),
        `marca ${MARCADOR_NAO_ENCONTRADO} após ${juris}`
      );
    }
  }

  assert(marcadores >= caso.jurisSemLastro.length, "marcadores ≥ juris inventadas");

  const comValor = garantirSecaoValorCausa(anotada, caso.valorCausaBloco);
  assert(/DO VALOR DA CAUSA/i.test(comValor), "garante DO VALOR DA CAUSA");

  const hibrida = mesclarFatosIaComDireitoReserva({
    pecaIa: normalizada,
    tipoAcao: caso.tipoAcao,
    fatos: caso.fatosChave.join(" "),
    tutelaUrgencia: Boolean(caso.tutelaUrgencia),
    blocoValorCausa: caso.valorCausaBloco,
  });
  assert(/DO VALOR DA CAUSA/i.test(hibrida), "híbrido: valor da causa");
  assert(
    caso.fatosChave.some((f) =>
      new RegExp(f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(hibrida)
    ),
    "híbrido: preserva ao menos um fato-chave"
  );
  if (caso.tutelaUrgencia) {
    assert(/tutela de urgência/i.test(hibrida), "híbrido: tutela de urgência");
  }
}

function main() {
  console.log(
    `Casos-ouro JEC: ${CASOS_OURO_JEC.length} temas (0 tokens Gemini)\n`
  );

  for (const caso of CASOS_OURO_JEC) {
    try {
      rodarCaso(caso);
    } catch (e) {
      falhas++;
      console.error(
        `  FAIL (exceção): ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  console.log(
    `\nResumo: ${oks} OK · ${falhas} FAIL · ${CASOS_OURO_JEC.length} casos`
  );
  if (falhas > 0) {
    process.exit(1);
  }
  console.log("Suite casos-ouro passou.");
}

main();
