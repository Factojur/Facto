/**
 * Smoke test do store local do FACTO Gestão (sem servidor).
 */
import {
  aceitarConviteGestao,
  criarClienteGestao,
  criarConviteGestao,
  criarEscritorioGestao,
  criarProcessoGestao,
  listarProcessosGestao,
  obterContextoGestao,
  atualizarProcessoGestao,
} from "../src/lib/gestao/gestao-service";
import { salvarGestaoStore } from "../src/lib/gestao/gestao-local-store";
import { calcularHonorarioContratado } from "../src/lib/gestao/gestao-honorarios";

async function main() {
  await salvarGestaoStore({
    escritorios: [],
    membros: [],
    convites: [],
    clientes: [],
    processos: [],
    prazos: [],
    agenda: [],
    atividades: [],
  });

  const adminId = "admin-test-uuid";
  const colabId = "colab-test-uuid";

  const criado = await criarEscritorioGestao({
    userId: adminId,
    email: "admin@teste.local",
    nomeUsuario: "Admin Teste",
    nomeEscritorio: "Escritório Teste",
    oabResponsavel: "SP 999999",
  });
  if (!criado.ok) throw new Error(criado.erro);

  const cliente = await criarClienteGestao(criado.escritorio.id, {
    nome: "Cliente Teste",
    email: "cliente@teste.local",
    telefone: "",
    documento: "",
    notas: "",
  });

  const processo = await criarProcessoGestao(criado.escritorio.id, {
    numero: "0000000-00.2026.8.26.0100",
    cliente: cliente.nome,
    clienteId: cliente.id,
    area: "Cível",
    valorCausaCentavos: 50_000_00,
    responsavelUserId: adminId,
  });

  await atualizarProcessoGestao(criado.escritorio.id, processo.id, {
    honorarioTipo: "percentual",
    honorarioPercentual: 15,
    honorarioStatus: "contratado",
  });

  const atualizado = await obterContextoGestao(adminId);
  const proc = (await listarProcessosGestao(criado.escritorio.id))[0];
  const honorario = calcularHonorarioContratado(proc);
  if (honorario !== 7_500_00) {
    throw new Error(`Honorário esperado 7500, got ${honorario}`);
  }

  const convite = await criarConviteGestao({
    userId: adminId,
    email: "admin@teste.local",
  });
  if (!convite.ok) throw new Error(convite.erro);

  const entrada = await aceitarConviteGestao({
    userId: colabId,
    email: "colab@teste.local",
    nomeUsuario: "Colaborador",
    token: convite.convite.token,
    codigo: convite.convite.codigo,
  });
  if (!entrada.ok) throw new Error(entrada.erro);

  const ctx = await obterContextoGestao(colabId);
  if (!ctx.escritorio) throw new Error("Colaborador sem escritório");

  console.log("OK: escritório, cliente, processo, honorário, convite");
  console.log("OK: link", convite.link);
  console.log("OK: processos", (await listarProcessosGestao(ctx.escritorio.id)).length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
