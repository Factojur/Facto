export type PlanoGestaoId = "basico" | "intermediario" | "ilimitado";

export type PapelGestao = "admin" | "colaborador";

export type EscritorioGestao = {
  id: string;
  nome: string;
  adminUserId: string;
  adminEmail: string;
  oabResponsavel: string;
  planoGestao: PlanoGestaoId;
  criadoEm: string;
};

export type MembroGestao = {
  escritorioId: string;
  userId: string;
  email: string;
  nome: string;
  papel: PapelGestao;
  criadoEm: string;
};

export type ConviteGestao = {
  id: string;
  escritorioId: string;
  token: string;
  codigo: string;
  criadoPorUserId: string;
  criadoEm: string;
  expiraEm: string;
  usadoEm: string | null;
  usadoPorUserId: string | null;
};

export type ClienteGestao = {
  id: string;
  escritorioId: string;
  nome: string;
  email: string;
  telefone: string;
  documento: string;
  notas: string;
  criadoEm: string;
  atualizadoEm: string;
};

export type PoloClienteGestao = "ativo" | "passivo";

export type TipoHonorarioGestao =
  | "a_definir"
  | "fixo"
  | "percentual"
  | "mensal"
  | "pro_bono";

export type StatusHonorarioGestao =
  | "a_definir"
  | "proposta"
  | "contratado";

export type ProcessoGestao = {
  id: string;
  escritorioId: string;
  numero: string;
  cliente: string;
  clienteId: string | null;
  area: string;
  status: "ativo" | "arquivado";
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
  criadoEm: string;
  atualizadoEm: string;
};

export type PrazoGestao = {
  id: string;
  escritorioId: string;
  processoId: string | null;
  titulo: string;
  vencimento: string;
  responsavelUserId: string | null;
  concluido: boolean;
  criadoEm: string;
};

export type EventoAgendaGestao = {
  id: string;
  escritorioId: string;
  titulo: string;
  inicio: string;
  fim: string | null;
  local: string;
  processoId: string | null;
  responsavelUserId: string | null;
  criadoEm: string;
};

export type AtividadeGestao = {
  id: string;
  escritorioId: string;
  processoId: string | null;
  clienteId: string | null;
  titulo: string;
  conteudo: string;
  criadoPorUserId: string;
  criadoEm: string;
};

export type GestaoStore = {
  escritorios: EscritorioGestao[];
  membros: MembroGestao[];
  convites: ConviteGestao[];
  clientes: ClienteGestao[];
  processos: ProcessoGestao[];
  prazos: PrazoGestao[];
  agenda: EventoAgendaGestao[];
  atividades: AtividadeGestao[];
};

export function processoGestaoPadrao(
  parcial: Pick<
    ProcessoGestao,
    | "id"
    | "escritorioId"
    | "numero"
    | "cliente"
    | "area"
    | "responsavelUserId"
    | "criadoEm"
    | "atualizadoEm"
  > &
    Partial<ProcessoGestao>
): ProcessoGestao {
  return {
    clienteId: null,
    status: "ativo",
    vara: "",
    comarca: "",
    tribunal: "",
    valorCausaCentavos: null,
    poloCliente: null,
    honorarioTipo: "a_definir",
    honorarioValorCentavos: null,
    honorarioPercentual: null,
    honorarioStatus: "a_definir",
    honorarioObservacao: "",
    notas: "",
    ...parcial,
  };
}
