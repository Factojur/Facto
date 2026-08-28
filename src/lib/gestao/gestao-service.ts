import {
  codigoConvite,
  novoId,
  tokenConvite,
} from "@/lib/gestao/gestao-local-store";
import {
  alterarGestaoStorePersistido,
  buscarConvitePorToken,
  criarEscritorioPersistido,
  inserirMembroPersistido,
  lerGestaoEscritorio,
  listarMembrosPersistidos,
  obterContextoGestaoPersistido,
  atualizarPapelMembroPersistido,
} from "@/lib/gestao/gestao-persistencia";
import { getSiteUrl } from "@/lib/site-url";
import { limiteColaboradores } from "@/lib/gestao/limites-colaboradores";
import type {
  AtividadeGestao,
  ClienteGestao,
  ConviteGestao,
  EscritorioGestao,
  EventoAgendaGestao,
  GestaoStore,
  MembroGestao,
  PlanoGestaoId,
  PrazoGestao,
  ProcessoGestao,
  StatusHonorarioGestao,
  TipoHonorarioGestao,
  PoloClienteGestao,
} from "@/lib/gestao/gestao-types";
import { processoGestaoPadrao } from "@/lib/gestao/gestao-types";

const DIAS_CONVITE = 14;

async function alterarEscritorio<T>(
  escritorioId: string,
  fn: (store: GestaoStore) => T
): Promise<T> {
  return alterarGestaoStorePersistido(escritorioId, fn);
}

export function escritorioDoUsuario(
  store: GestaoStore,
  userId: string
): EscritorioGestao | null {
  const membro = store.membros.find((m) => m.userId === userId);
  if (!membro) return null;
  return store.escritorios.find((e) => e.id === membro.escritorioId) ?? null;
}

export function membroDoUsuario(
  store: GestaoStore,
  userId: string
): MembroGestao | null {
  return store.membros.find((m) => m.userId === userId) ?? null;
}

export async function obterContextoGestao(userId: string) {
  return obterContextoGestaoPersistido(userId);
}

export async function criarEscritorioGestao(opcoes: {
  userId: string;
  email: string;
  nomeUsuario: string;
  nomeEscritorio: string;
  oabResponsavel: string;
  planoGestao?: PlanoGestaoId;
}): Promise<{ ok: true; escritorio: EscritorioGestao } | { ok: false; erro: string }> {
  const existente = await obterContextoGestao(opcoes.userId);
  if (existente.escritorio) {
    return { ok: true, escritorio: existente.escritorio };
  }

  const escritorio: EscritorioGestao = {
    id: novoId(),
    nome: opcoes.nomeEscritorio.trim(),
    adminUserId: opcoes.userId,
    adminEmail: opcoes.email,
    oabResponsavel: opcoes.oabResponsavel.trim(),
    planoGestao: opcoes.planoGestao ?? "intermediario",
    criadoEm: new Date().toISOString(),
  };

  const membro: MembroGestao = {
    escritorioId: escritorio.id,
    userId: opcoes.userId,
    email: opcoes.email,
    nome: opcoes.nomeUsuario,
    papel: "admin",
    criadoEm: new Date().toISOString(),
  };

  await criarEscritorioPersistido(escritorio, membro);

  return { ok: true, escritorio };
}

export async function criarConviteGestao(opcoes: {
  userId: string;
  email: string;
  baseUrl?: string;
}): Promise<
  | { ok: true; convite: ConviteGestao; link: string }
  | { ok: false; erro: string }
> {
  const ctx = await obterContextoGestao(opcoes.userId);
  if (!ctx.membro || !ctx.escritorio) {
    return { ok: false, erro: "Escritório não encontrado." };
  }
  if (ctx.membro.papel !== "admin") {
    return { ok: false, erro: "Somente o administrador pode convidar." };
  }

  const resultado = await alterarEscritorio(ctx.escritorio.id, (store) => {
    const escritorio = store.escritorios.find((e) => e.id === ctx.escritorio!.id);
    if (!escritorio) {
      return { ok: false as const, erro: "Escritório não encontrado." };
    }

    const colaboradores = store.membros.filter(
      (m) => m.escritorioId === escritorio.id
    ).length;
    const limite = limiteColaboradores(escritorio.planoGestao);
    if (colaboradores >= limite) {
      return {
        ok: false as const,
        erro: `Limite de ${limite} membros atingido no plano atual.`,
      };
    }

    const convite: ConviteGestao = {
      id: novoId(),
      escritorioId: escritorio.id,
      token: tokenConvite(),
      codigo: codigoConvite(),
      criadoPorUserId: opcoes.userId,
      criadoEm: new Date().toISOString(),
      expiraEm: new Date(
        Date.now() + DIAS_CONVITE * 24 * 60 * 60 * 1000
      ).toISOString(),
      usadoEm: null,
      usadoPorUserId: null,
    };
    store.convites.push(convite);
    return { ok: true as const, convite };
  });

  if (!resultado.ok) return resultado;

  const base = (opcoes.baseUrl ?? getSiteUrl()).replace(/\/$/, "");
  const link = `${base}/gestao/entrar?convite=${resultado.convite.token}`;

  return { ok: true, convite: resultado.convite, link };
}

export async function aceitarConviteGestao(opcoes: {
  userId: string;
  email: string;
  nomeUsuario: string;
  token: string;
  codigo?: string;
}): Promise<{ ok: true; escritorio: EscritorioGestao } | { ok: false; erro: string }> {
  const ctx = await obterContextoGestao(opcoes.userId);
  if (ctx.escritorio) {
    return { ok: true, escritorio: ctx.escritorio };
  }

  const encontrado = await buscarConvitePorToken(opcoes.token);
  if (!encontrado) {
    return { ok: false, erro: "Convite inválido ou já utilizado." };
  }

  const { convite, escritorio } = encontrado;
  if (new Date(convite.expiraEm).getTime() < Date.now()) {
    return { ok: false, erro: "Convite expirado." };
  }
  if (convite.codigo && opcoes.codigo) {
    if (opcoes.codigo.toUpperCase() !== convite.codigo) {
      return { ok: false, erro: "Código do convite incorreto." };
    }
  }

  const membros = await listarMembrosPersistidos(escritorio.id);
  if (membros.length >= limiteColaboradores(escritorio.planoGestao)) {
    return { ok: false, erro: "Escritório sem vagas para novos membros." };
  }

  const membro: MembroGestao = {
    escritorioId: escritorio.id,
    userId: opcoes.userId,
    email: opcoes.email,
    nome: opcoes.nomeUsuario,
    papel: "colaborador",
    criadoEm: new Date().toISOString(),
  };

  await inserirMembroPersistido(membro);
  await alterarEscritorio(escritorio.id, (s) => {
    const c = s.convites.find((x) => x.id === convite.id);
    if (c) {
      c.usadoEm = new Date().toISOString();
      c.usadoPorUserId = opcoes.userId;
    }
  });

  return { ok: true, escritorio };
}

export async function listarMembrosEscritorio(escritorioId: string) {
  return listarMembrosPersistidos(escritorioId);
}

export async function listarConvitesAtivos(escritorioId: string) {
  const store = await lerGestaoEscritorio(escritorioId);
  if (!store) return [];
  const agora = Date.now();
  return store.convites.filter(
    (c) =>
      c.escritorioId === escritorioId &&
      !c.usadoEm &&
      new Date(c.expiraEm).getTime() > agora
  );
}

export async function atualizarPapelMembroGestao(opcoes: {
  adminUserId: string;
  alvoUserId: string;
  papel: "socio" | "colaborador";
}): Promise<{ ok: true } | { ok: false; erro: string }> {
  const ctx = await obterContextoGestao(opcoes.adminUserId);
  if (!ctx.membro || ctx.membro.papel !== "admin" || !ctx.escritorio) {
    return { ok: false, erro: "Somente o titular pode alterar papéis." };
  }
  if (opcoes.alvoUserId === opcoes.adminUserId) {
    return { ok: false, erro: "O titular não pode alterar o próprio papel." };
  }

  const membros = await listarMembrosPersistidos(ctx.escritorio.id);
  const alvo = membros.find((m) => m.userId === opcoes.alvoUserId);
  if (!alvo) {
    return { ok: false, erro: "Membro não encontrado." };
  }
  if (alvo.papel === "admin") {
    return { ok: false, erro: "Não é possível alterar o titular." };
  }

  await atualizarPapelMembroPersistido(
    ctx.escritorio.id,
    opcoes.alvoUserId,
    opcoes.papel
  );
  return { ok: true };
}

export async function criarClienteGestao(
  escritorioId: string,
  dados: Pick<ClienteGestao, "nome" | "email" | "telefone" | "documento" | "notas">
): Promise<ClienteGestao> {
  const agora = new Date().toISOString();
  const cliente: ClienteGestao = {
    id: novoId(),
    escritorioId,
    nome: dados.nome.trim(),
    email: dados.email.trim(),
    telefone: dados.telefone.trim(),
    documento: dados.documento.trim(),
    notas: dados.notas.trim(),
    criadoEm: agora,
    atualizadoEm: agora,
  };
  await alterarEscritorio(escritorioId, (s) => {
    s.clientes.push(cliente);
  });
  return cliente;
}

export async function listarClientesGestao(escritorioId: string) {
  const store = await lerGestaoEscritorio(escritorioId);
  if (!store) return [];
  return store.clientes
    .filter((c) => c.escritorioId === escritorioId)
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export async function obterClienteGestao(escritorioId: string, clienteId: string) {
  const store = await lerGestaoEscritorio(escritorioId);
  if (!store) return null;
  return (
    store.clientes.find(
      (c) => c.id === clienteId && c.escritorioId === escritorioId
    ) ?? null
  );
}

export async function atualizarClienteGestao(
  escritorioId: string,
  clienteId: string,
  patch: Partial<
    Pick<ClienteGestao, "nome" | "email" | "telefone" | "documento" | "notas">
  >
): Promise<ClienteGestao | null> {
  let atualizado: ClienteGestao | null = null;
  await alterarEscritorio(escritorioId, (s) => {
    const c = s.clientes.find(
      (x) => x.id === clienteId && x.escritorioId === escritorioId
    );
    if (!c) return;
    if (patch.nome !== undefined) c.nome = patch.nome.trim();
    if (patch.email !== undefined) c.email = patch.email.trim();
    if (patch.telefone !== undefined) c.telefone = patch.telefone.trim();
    if (patch.documento !== undefined) c.documento = patch.documento.trim();
    if (patch.notas !== undefined) c.notas = patch.notas.trim();
    c.atualizadoEm = new Date().toISOString();
    atualizado = { ...c };
  });
  return atualizado;
}

export async function criarProcessoGestao(
  escritorioId: string,
  dados: {
    numero: string;
    cliente: string;
    area: string;
    clienteId?: string | null;
    vara?: string;
    comarca?: string;
    tribunal?: string;
    valorCausaCentavos?: number | null;
    poloCliente?: PoloClienteGestao | null;
    responsavelUserId: string | null;
  }
): Promise<ProcessoGestao> {
  const agora = new Date().toISOString();
  let clienteNome = dados.cliente.trim();
  let clienteId = dados.clienteId ?? null;

  if (clienteId) {
    const store = await lerGestaoEscritorio(escritorioId);
    const cli = store?.clientes.find(
      (c) => c.id === clienteId && c.escritorioId === escritorioId
    );
    if (cli) clienteNome = cli.nome;
  }

  const processo = processoGestaoPadrao({
    id: novoId(),
    escritorioId,
    numero: dados.numero.trim(),
    cliente: clienteNome,
    clienteId,
    area: dados.area.trim(),
    vara: dados.vara?.trim() ?? "",
    comarca: dados.comarca?.trim() ?? "",
    tribunal: dados.tribunal?.trim() ?? "",
    valorCausaCentavos: dados.valorCausaCentavos ?? null,
    poloCliente: dados.poloCliente ?? null,
    responsavelUserId: dados.responsavelUserId,
    criadoEm: agora,
    atualizadoEm: agora,
  });
  await alterarEscritorio(escritorioId, (s) => {
    s.processos.push(processo);
  });
  return processo;
}

export async function listarProcessosGestao(escritorioId: string) {
  const store = await lerGestaoEscritorio(escritorioId);
  if (!store) return [];
  return store.processos
    .filter((p) => p.escritorioId === escritorioId)
    .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
}

export async function obterProcessoGestao(escritorioId: string, processoId: string) {
  const store = await lerGestaoEscritorio(escritorioId);
  if (!store) return null;
  return (
    store.processos.find(
      (p) => p.id === processoId && p.escritorioId === escritorioId
    ) ?? null
  );
}

export async function atualizarProcessoGestao(
  escritorioId: string,
  processoId: string,
  patch: Partial<{
    numero: string;
    cliente: string;
    clienteId: string | null;
    area: string;
    status: ProcessoGestao["status"];
    vara: string;
    comarca: string;
    tribunal: string;
    valorCausaCentavos: number | null;
    poloCliente: PoloClienteGestao | null;
    honorarioTipo: TipoHonorarioGestao;
    honorarioValorCentavos: number | null;
    honorarioPercentual: number | null;
    honorarioStatus: StatusHonorarioGestao;
    honorarioObservacao: string;
    notas: string;
    responsavelUserId: string | null;
  }>
): Promise<ProcessoGestao | null> {
  let atualizado: ProcessoGestao | null = null;
  await alterarEscritorio(escritorioId, (s) => {
    const p = s.processos.find(
      (x) => x.id === processoId && x.escritorioId === escritorioId
    );
    if (!p) return;

    if (patch.numero !== undefined) p.numero = patch.numero.trim();
    if (patch.cliente !== undefined) p.cliente = patch.cliente.trim();
    if (patch.clienteId !== undefined) {
      p.clienteId = patch.clienteId;
      if (patch.clienteId) {
        const cli = s.clientes.find(
          (c) => c.id === patch.clienteId && c.escritorioId === escritorioId
        );
        if (cli) p.cliente = cli.nome;
      }
    }
    if (patch.area !== undefined) p.area = patch.area.trim();
    if (patch.status !== undefined) p.status = patch.status;
    if (patch.vara !== undefined) p.vara = patch.vara.trim();
    if (patch.comarca !== undefined) p.comarca = patch.comarca.trim();
    if (patch.tribunal !== undefined) p.tribunal = patch.tribunal.trim();
    if (patch.valorCausaCentavos !== undefined) {
      p.valorCausaCentavos = patch.valorCausaCentavos;
    }
    if (patch.poloCliente !== undefined) p.poloCliente = patch.poloCliente;
    if (patch.honorarioTipo !== undefined) p.honorarioTipo = patch.honorarioTipo;
    if (patch.honorarioValorCentavos !== undefined) {
      p.honorarioValorCentavos = patch.honorarioValorCentavos;
    }
    if (patch.honorarioPercentual !== undefined) {
      p.honorarioPercentual = patch.honorarioPercentual;
    }
    if (patch.honorarioStatus !== undefined) {
      p.honorarioStatus = patch.honorarioStatus;
    }
    if (patch.honorarioObservacao !== undefined) {
      p.honorarioObservacao = patch.honorarioObservacao.trim();
    }
    if (patch.notas !== undefined) p.notas = patch.notas.trim();
    if (patch.responsavelUserId !== undefined) {
      p.responsavelUserId = patch.responsavelUserId;
    }
    p.atualizadoEm = new Date().toISOString();
    atualizado = { ...p };
  });
  return atualizado;
}

export async function criarPrazoGestao(
  escritorioId: string,
  dados: Pick<PrazoGestao, "titulo" | "vencimento" | "processoId" | "responsavelUserId">
): Promise<PrazoGestao> {
  const prazo: PrazoGestao = {
    id: novoId(),
    escritorioId,
    titulo: dados.titulo.trim(),
    vencimento: dados.vencimento,
    processoId: dados.processoId,
    responsavelUserId: dados.responsavelUserId,
    concluido: false,
    criadoEm: new Date().toISOString(),
  };
  await alterarEscritorio(escritorioId, (s) => {
    s.prazos.push(prazo);
  });
  return prazo;
}

export async function listarPrazosGestao(escritorioId: string) {
  const store = await lerGestaoEscritorio(escritorioId);
  if (!store) return [];
  return store.prazos
    .filter((p) => p.escritorioId === escritorioId)
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento));
}

export async function atualizarPrazoGestao(
  escritorioId: string,
  prazoId: string,
  patch: { concluido?: boolean }
): Promise<PrazoGestao | null> {
  let atualizado: PrazoGestao | null = null;
  await alterarEscritorio(escritorioId, (s) => {
    const p = s.prazos.find(
      (x) => x.id === prazoId && x.escritorioId === escritorioId
    );
    if (!p) return;
    if (patch.concluido !== undefined) p.concluido = patch.concluido;
    atualizado = { ...p };
  });
  return atualizado;
}

export async function criarEventoAgendaGestao(
  escritorioId: string,
  dados: Pick<
    EventoAgendaGestao,
    "titulo" | "inicio" | "fim" | "local" | "processoId" | "responsavelUserId"
  >
): Promise<EventoAgendaGestao> {
  const evento: EventoAgendaGestao = {
    id: novoId(),
    escritorioId,
    titulo: dados.titulo.trim(),
    inicio: dados.inicio,
    fim: dados.fim,
    local: dados.local.trim(),
    processoId: dados.processoId,
    responsavelUserId: dados.responsavelUserId,
    criadoEm: new Date().toISOString(),
  };
  await alterarEscritorio(escritorioId, (s) => {
    s.agenda.push(evento);
  });
  return evento;
}

export async function listarAgendaGestao(escritorioId: string) {
  const store = await lerGestaoEscritorio(escritorioId);
  if (!store) return [];
  return store.agenda
    .filter((e) => e.escritorioId === escritorioId)
    .sort((a, b) => a.inicio.localeCompare(b.inicio));
}

export async function criarAtividadeGestao(
  escritorioId: string,
  dados: Pick<
    AtividadeGestao,
    "processoId" | "clienteId" | "titulo" | "conteudo" | "criadoPorUserId"
  >
): Promise<AtividadeGestao> {
  const atividade: AtividadeGestao = {
    id: novoId(),
    escritorioId,
    processoId: dados.processoId,
    clienteId: dados.clienteId,
    titulo: dados.titulo.trim(),
    conteudo: dados.conteudo.trim(),
    criadoPorUserId: dados.criadoPorUserId,
    criadoEm: new Date().toISOString(),
  };
  await alterarEscritorio(escritorioId, (s) => {
    s.atividades.push(atividade);
  });
  return atividade;
}

export async function listarAtividadesGestao(
  escritorioId: string,
  filtros?: { processoId?: string; clienteId?: string }
) {
  const store = await lerGestaoEscritorio(escritorioId);
  if (!store) return [];
  return store.atividades
    .filter((a) => {
      if (a.escritorioId !== escritorioId) return false;
      if (filtros?.processoId && a.processoId !== filtros.processoId) return false;
      if (filtros?.clienteId && a.clienteId !== filtros.clienteId) return false;
      return true;
    })
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}

export async function listarProcessosPorCliente(
  escritorioId: string,
  clienteId: string
) {
  const store = await lerGestaoEscritorio(escritorioId);
  if (!store) return [];
  return store.processos.filter(
    (p) => p.escritorioId === escritorioId && p.clienteId === clienteId
  );
}
