/**
 * Testes — resposta de turno e versões do plano no chat.
 */
import assert from "node:assert/strict";
import {
  diffEstadoCasoChat,
  montarRespostaTurnoLocal,
} from "../src/lib/chat-resposta-turno";
import { registrarVersaoPlano } from "../src/lib/chat-plano-versoes";
import { estadoCasoChatVazio } from "../src/lib/chat-minuta";
import type { PreviewTriagemData } from "../src/components/dashboard/preview-triagem-peca";
import { incluirItemCoberturaNoPlano } from "../src/lib/ia/cobertura-teses-peca";
import { montarPlanoFallbackLocal } from "../src/lib/ia/plano-fallback-local";

function triagemFake(): PreviewTriagemData {
  return {
    estrategiaJuridica: "Estratégia A",
    analiseEstrategica: {
      nomeAcao: "Ação",
      tesePrincipal: "Tese",
      pedidosEssenciais: [],
      riscosOuLacunas: [],
    },
    topicos: [{ romano: "I", titulo: "Fatos", subtitulos: [] }],
    cobertura: [],
  };
}

function main() {
  const a = estadoCasoChatVazio("jec");
  const b = { ...a, pedidos: ["Danos morais"], tutelaUrgencia: true };
  b.fatos = "x".repeat(50);
  b.tipoAcao = "Petição";

  const diff = diffEstadoCasoChat(a, b);
  assert(diff.pedidosNovos.includes("Danos morais"), "diff pedidos");
  assert(diff.tutelaLigada, "diff tutela");

  const resp = montarRespostaTurnoLocal({ diff, estado: b, primeiroRelato: false });
  assert(resp.includes("Danos morais"), "resposta menciona pedido");

  const v1 = registrarVersaoPlano([], triagemFake(), "v1");
  assert(v1.length === 1, "versão registrada");
  const v2 = registrarVersaoPlano(v1, triagemFake(), "dup");
  assert(v2.length === 1, "dedup versão igual");

  const triagemPendente: PreviewTriagemData = {
    ...triagemFake(),
    cobertura: [
      { id: "inexigibilidade-debito", rotulo: "Inexigibilidade de débito", noPlano: false, exigeSubtopico: true },
    ],
    topicos: [{ romano: "III", titulo: "DO DIREITO", subtitulos: ["CDC"] }],
  };
  const incluido = incluirItemCoberturaNoPlano(triagemPendente, "inexigibilidade-debito");
  assert(incluido?.cobertura[0]?.noPlano === true, "cobertura marcada ok");
  assert(
    incluido?.topicos[0]?.subtitulos.some((s) => /inexigibilidade/i.test(s)),
    "tese no subtópico"
  );

  const fb = montarPlanoFallbackLocal(b);
  assert(fb.topicos.length >= 3, "fallback tem topicos");
  assert(fb.modelo === "local-fallback", "fallback modelo");

  console.log("testar-chat-fluidez: ok");
}

main();
