/**
 * Smoke estrutural das áreas sensíveis do chat (Criminal, Const, JECR, Eleitoral).
 * Uso: npx tsx scripts/testar-chat-areas-pendentes.ts
 */
import {
  montarPayloadGeracaoChat,
  estadoCasoChatVazio,
  chatMinutaAreaHabilitada,
} from "../src/lib/chat-minuta";
import { gerarPecaJec } from "../src/lib/gerar-peca-jec";
import { listaEspeciesDaArea } from "../src/lib/peca-especie-area";
import { areaUsaPoloAdvocacia } from "../src/lib/polo-especies-por-area";
import { createSuite } from "./casos-ouro/suite";

const AREAS_SENSIVEIS = [
  "criminal",
  "constitucional",
  "jecr",
  "eleitoral",
] as const;

const QUERIES: Record<string, string> = {
  criminal: "habeas corpus CPP prisão preventiva",
  constitucional: "mandado de segurança direito líquido e certo",
  jecr: "JECRIM infração penal Lei 9.099",
  eleitoral: "Lei 9.504 propaganda eleitoral TRE",
};

function main() {
  const { assert, stats } = createSuite();

  for (const areaId of AREAS_SENSIVEIS) {
    assert(chatMinutaAreaHabilitada(areaId), `${areaId}: habilitada no chat`);

    const especies = listaEspeciesDaArea(areaId) ?? [];
    assert(especies.length >= 3, `${areaId}: ≥3 espécies`);

    const especie = especies[0]!.id;
    const estado = estadoCasoChatVazio(areaId);
    estado.fatos = `Caso smoke ${areaId}: ${QUERIES[areaId] ?? areaId}. Partes fictícias para validação estrutural do assistente.`;
    estado.tipoAcao = especies[0]!.rotulo ?? "Petição";
    estado.especiePeca = especie;
    estado.autoresNomes = ["Maria Teste"];
    estado.reusNomes = ["Réu Smoke Ltda"];

    const payload = montarPayloadGeracaoChat(estado);
    assert(payload.areaId === areaId, `${areaId}: payload areaId`);

    const scaffold = gerarPecaJec({
      ...payload,
      documentos: payload.documentos ?? {},
      provas: payload.provas ?? [],
      fotos: payload.fotos ?? [],
      midias: payload.midias ?? [],
    });

    assert(scaffold.peca.length > 200, `${areaId}: scaffold gera peça`);

    if (areaId !== "jecr") {
      const vazou9099 = /Lei\s*n[ºo°]?\s*9\.?099/i.test(scaffold.peca);
      assert(!vazou9099, `${areaId}: sem Lei 9.099 indevida`);
    }

    assert(
      typeof areaUsaPoloAdvocacia(areaId) === "boolean",
      `${areaId}: matriz polo`
    );
  }

  const { oks, falhas } = stats();
  console.log(
    `\n${oks} ok · ${falhas} falha(s) · áreas: ${AREAS_SENSIVEIS.join(", ")}`
  );
  if (falhas > 0) process.exit(1);
}

main();
