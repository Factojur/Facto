import type {
  ClienteGestao,
  EventoAgendaGestao,
  PrazoGestao,
  ProcessoGestao,
} from "@/lib/gestao/gestao-types";
import { calcularHonorarioContratado } from "@/lib/gestao/gestao-honorarios";

export type UrgenciaPrazo = "vencido" | "hoje" | "semana" | "futuro" | "concluido";

export type ResumoGestaoDashboard = {
  processosAtivos: number;
  processosArquivados: number;
  prazosAbertos: number;
  prazosVencidos: number;
  prazosHoje: number;
  prazosSemana: number;
  compromissosHoje: number;
  compromissosSemana: number;
  clientesAtivos: number;
  honorariosContratadosCentavos: number;
  processosSemHonorario: number;
  processosPorArea: { area: string; total: number }[];
  prazosPorUrgencia: { urgencia: UrgenciaPrazo; total: number }[];
  proximosPrazos: PrazoGestao[];
  proximosEventos: EventoAgendaGestao[];
  checklistDia: { id: string; rotulo: string; href: string; urgente: boolean }[];
};

function isoHoje(): string {
  return new Date().toISOString().slice(0, 10);
}

function inicioSemana(d = new Date()): Date {
  const x = new Date(d);
  const dia = x.getDay();
  const diff = dia === 0 ? -6 : 1 - dia;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function fimSemana(d = new Date()): Date {
  const ini = inicioSemana(d);
  const fim = new Date(ini);
  fim.setDate(fim.getDate() + 6);
  fim.setHours(23, 59, 59, 999);
  return fim;
}

export function urgenciaPrazo(
  prazo: Pick<PrazoGestao, "concluido" | "vencimento">,
  hoje = isoHoje()
): UrgenciaPrazo {
  if (prazo.concluido) return "concluido";
  if (prazo.vencimento < hoje) return "vencido";
  if (prazo.vencimento === hoje) return "hoje";
  const limite = new Date(hoje + "T12:00:00");
  limite.setDate(limite.getDate() + 7);
  const venc = new Date(prazo.vencimento + "T12:00:00");
  if (venc <= limite) return "semana";
  return "futuro";
}

export function montarResumoGestaoDashboard(params: {
  processos: ProcessoGestao[];
  prazos: PrazoGestao[];
  eventos: EventoAgendaGestao[];
  clientes?: ClienteGestao[];
  incluirHonorarios?: boolean;
}): ResumoGestaoDashboard {
  const incluirHonorarios = params.incluirHonorarios ?? true;
  const hoje = isoHoje();
  const iniSem = inicioSemana();
  const fimSem = fimSemana();

  const processosAtivos = params.processos.filter((p) => p.status === "ativo");
  const processosArquivados = params.processos.filter(
    (p) => p.status === "arquivado"
  );

  let honorariosContratadosCentavos = 0;
  let processosSemHonorario = 0;
  for (const p of processosAtivos) {
    if (p.honorarioStatus === "contratado" || p.honorarioTipo === "fixo" || p.honorarioTipo === "mensal" || p.honorarioTipo === "percentual") {
      const v = calcularHonorarioContratado(p);
      if (v != null && p.honorarioStatus === "contratado") {
        honorariosContratadosCentavos += v;
      }
    }
    if (p.honorarioTipo === "a_definir" || p.honorarioStatus === "a_definir") {
      processosSemHonorario++;
    }
  }

  const clientesAtivos = params.clientes?.length ?? 0;

  const prazosAbertos = params.prazos.filter((p) => !p.concluido);
  const prazosVencidos = prazosAbertos.filter((p) => p.vencimento < hoje);
  const prazosHoje = prazosAbertos.filter((p) => p.vencimento === hoje);

  const limiteSemana = new Date(hoje + "T12:00:00");
  limiteSemana.setDate(limiteSemana.getDate() + 7);
  const prazosSemana = prazosAbertos.filter((p) => {
    const v = new Date(p.vencimento + "T12:00:00");
    return v > new Date(hoje + "T12:00:00") && v <= limiteSemana;
  });

  const porArea = new Map<string, number>();
  for (const p of processosAtivos) {
    const area = p.area.trim() || "Sem área";
    porArea.set(area, (porArea.get(area) ?? 0) + 1);
  }
  const processosPorArea = [...porArea.entries()]
    .map(([area, total]) => ({ area, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const contagemUrgencia: Record<UrgenciaPrazo, number> = {
    vencido: 0,
    hoje: 0,
    semana: 0,
    futuro: 0,
    concluido: 0,
  };
  for (const p of params.prazos) {
    contagemUrgencia[urgenciaPrazo(p, hoje)]++;
  }
  const prazosPorUrgencia = (
    ["vencido", "hoje", "semana", "futuro", "concluido"] as UrgenciaPrazo[]
  ).map((urgencia) => ({ urgencia, total: contagemUrgencia[urgencia] }));

  const hojeDate = new Date();
  hojeDate.setHours(0, 0, 0, 0);
  const amanha = new Date(hojeDate);
  amanha.setDate(amanha.getDate() + 1);

  const compromissosHoje = params.eventos.filter((e) => {
    const d = new Date(e.inicio);
    return d >= hojeDate && d < amanha;
  }).length;

  const compromissosSemana = params.eventos.filter((e) => {
    const d = new Date(e.inicio);
    return d >= iniSem && d <= fimSem;
  }).length;

  const proximosPrazos = prazosAbertos
    .slice()
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento))
    .slice(0, 6);

  const agora = Date.now();
  const proximosEventos = params.eventos
    .filter((e) => new Date(e.inicio).getTime() >= agora - 60 * 60 * 1000)
    .slice(0, 6);

  const checklistDia: ResumoGestaoDashboard["checklistDia"] = [];
  if (prazosVencidos.length > 0) {
    checklistDia.push({
      id: "vencidos",
      rotulo: `${prazosVencidos.length} prazo(s) vencido(s) — prioridade máxima`,
      href: "/gestao/prazos",
      urgente: true,
    });
  }
  if (prazosHoje.length > 0) {
    checklistDia.push({
      id: "hoje",
      rotulo: `${prazosHoje.length} prazo(s) vence(m) hoje`,
      href: "/gestao/prazos",
      urgente: true,
    });
  }
  if (compromissosHoje > 0) {
    checklistDia.push({
      id: "agenda-hoje",
      rotulo: `${compromissosHoje} compromisso(s) hoje na agenda`,
      href: "/gestao/agenda",
      urgente: false,
    });
  }
  if (processosAtivos.length === 0) {
    checklistDia.push({
      id: "sem-processos",
      rotulo: "Cadastre o primeiro processo do escritório",
      href: "/gestao/processos",
      urgente: false,
    });
  }
  if (processosSemHonorario > 0 && processosAtivos.length > 0 && incluirHonorarios) {
    checklistDia.push({
      id: "sem-honorario",
      rotulo: `${processosSemHonorario} pasta(s) ativa(s) sem honorário definido`,
      href: "/gestao/honorarios",
      urgente: false,
    });
  }
  if (clientesAtivos === 0 && processosAtivos.length > 0) {
    checklistDia.push({
      id: "sem-clientes-cadastro",
      rotulo: "Cadastre clientes para organizar pastas e honorários",
      href: "/gestao/clientes",
      urgente: false,
    });
  }
  if (prazosAbertos.length === 0 && processosAtivos.length > 0) {
    checklistDia.push({
      id: "sem-prazos",
      rotulo: "Nenhum prazo em aberto — registre os próximos vencimentos",
      href: "/gestao/prazos",
      urgente: false,
    });
  }

  return {
    processosAtivos: processosAtivos.length,
    processosArquivados: processosArquivados.length,
    prazosAbertos: prazosAbertos.length,
    prazosVencidos: prazosVencidos.length,
    prazosHoje: prazosHoje.length,
    prazosSemana: prazosSemana.length,
    compromissosHoje,
    compromissosSemana,
    clientesAtivos,
    honorariosContratadosCentavos,
    processosSemHonorario,
    processosPorArea,
    prazosPorUrgencia,
    proximosPrazos,
    proximosEventos,
    checklistDia,
  };
}
