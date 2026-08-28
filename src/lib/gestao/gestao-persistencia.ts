import { compactarStoreGestao } from "@/lib/gestao/gestao-limites-dados";
import {
  alterarGestaoStore as alterarGestaoStoreLocal,
  lerGestaoStore as lerGestaoStoreLocal,
} from "@/lib/gestao/gestao-local-store";
import type {
  EscritorioGestao,
  GestaoStore,
  MembroGestao,
} from "@/lib/gestao/gestao-types";
import { createAdminClient } from "@/lib/supabase/admin";

export type GestaoPayload = Pick<
  GestaoStore,
  "clientes" | "processos" | "prazos" | "agenda" | "convites" | "atividades"
>;

const PAYLOAD_VAZIO: GestaoPayload = {
  clientes: [],
  processos: [],
  prazos: [],
  agenda: [],
  convites: [],
  atividades: [],
};

type EscritorioRow = {
  id: string;
  nome: string;
  admin_user_id: string;
  admin_email: string;
  oab_responsavel: string;
  plano_gestao: string;
  store_json: GestaoPayload | null;
  criado_em: string;
};

type MembroRow = {
  escritorio_id: string;
  user_id: string;
  email: string;
  nome: string;
  papel: MembroGestao["papel"];
  criado_em: string;
};

let supabaseGestaoDisponivel: boolean | null = null;

function gestaoSupabaseHabilitado(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function supabaseGestaoAtivo(): Promise<boolean> {
  if (!gestaoSupabaseHabilitado()) return false;
  if (supabaseGestaoDisponivel !== null) return supabaseGestaoDisponivel;
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("gestao_membros").select("user_id").limit(1);
    supabaseGestaoDisponivel = !error;
  } catch {
    supabaseGestaoDisponivel = false;
  }
  return supabaseGestaoDisponivel;
}

/** Em produção (Vercel), exige tabelas Gestão no Supabase — /tmp não persiste. */
export async function gestaoPersistenciaPronta(): Promise<
  { ok: true; modo: "supabase" | "local" } | { ok: false; mensagem: string }
> {
  if (await supabaseGestaoAtivo()) {
    return { ok: true, modo: "supabase" };
  }
  if (process.env.VERCEL) {
    return {
      ok: false,
      mensagem:
        "Gestão em manutenção: rode supabase/migration-gestao-mvp.sql no Supabase.",
    };
  }
  return { ok: true, modo: "local" };
}

function rowParaEscritorio(row: EscritorioRow): EscritorioGestao {
  return {
    id: row.id,
    nome: row.nome,
    adminUserId: row.admin_user_id,
    adminEmail: row.admin_email,
    oabResponsavel: row.oab_responsavel,
    planoGestao: row.plano_gestao as EscritorioGestao["planoGestao"],
    criadoEm: row.criado_em,
  };
}

function rowParaMembro(row: MembroRow): MembroGestao {
  return {
    escritorioId: row.escritorio_id,
    userId: row.user_id,
    email: row.email,
    nome: row.nome,
    papel: row.papel,
    criadoEm: row.criado_em,
  };
}

function montarStore(
  escritorio: EscritorioGestao,
  membros: MembroGestao[],
  payload: GestaoPayload
): GestaoStore {
  return {
    escritorios: [escritorio],
    membros,
    ...payload,
  };
}

async function carregarEscritorioSupabase(
  escritorioId: string
): Promise<{ escritorio: EscritorioGestao; payload: GestaoPayload; membros: MembroGestao[] } | null> {
  const admin = createAdminClient();
  const { data: esc, error } = await admin
    .from("gestao_escritorios")
    .select("*")
    .eq("id", escritorioId)
    .maybeSingle();
  if (error || !esc) return null;

  const { data: membrosRows } = await admin
    .from("gestao_membros")
    .select("*")
    .eq("escritorio_id", escritorioId);

  const escritorio = rowParaEscritorio(esc as EscritorioRow);
  const membros = (membrosRows ?? []).map((m) => rowParaMembro(m as MembroRow));
  const payload = { ...PAYLOAD_VAZIO, ...(esc.store_json as GestaoPayload) };
  return { escritorio, payload, membros };
}

export async function obterContextoGestaoPersistido(userId: string): Promise<{
  store: GestaoStore;
  membro: MembroGestao | null;
  escritorio: EscritorioGestao | null;
}> {
  if (await supabaseGestaoAtivo()) {
    const admin = createAdminClient();
    const { data: membroRow } = await admin
      .from("gestao_membros")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!membroRow) {
      return {
        store: {
          escritorios: [],
          membros: [],
          clientes: [],
          processos: [],
          prazos: [],
          agenda: [],
          convites: [],
          atividades: [],
        },
        membro: null,
        escritorio: null,
      };
    }

    const carregado = await carregarEscritorioSupabase(membroRow.escritorio_id);
    if (!carregado) {
      return {
        store: {
          escritorios: [],
          membros: [],
          clientes: [],
          processos: [],
          prazos: [],
          agenda: [],
          convites: [],
          atividades: [],
        },
        membro: null,
        escritorio: null,
      };
    }

    const membro = rowParaMembro(membroRow as MembroRow);
    return {
      escritorio: carregado.escritorio,
      membro,
      store: montarStore(carregado.escritorio, carregado.membros, carregado.payload),
    };
  }

  const store = await lerGestaoStoreLocal();
  const membro = store.membros.find((m) => m.userId === userId) ?? null;
  const escritorio = membro
    ? (store.escritorios.find((e) => e.id === membro.escritorioId) ?? null)
    : null;
  return { store, membro, escritorio };
}

export async function alterarGestaoStorePersistido<T>(
  escritorioId: string,
  fn: (store: GestaoStore) => T
): Promise<T> {
  if (await supabaseGestaoAtivo()) {
    const carregado = await carregarEscritorioSupabase(escritorioId);
    if (!carregado) throw new Error("Escritório não encontrado.");

    const store = montarStore(
      carregado.escritorio,
      carregado.membros,
      carregado.payload
    );
    const result = fn(store);
    compactarStoreGestao(store);

    const admin = createAdminClient();
    await admin
      .from("gestao_escritorios")
      .update({
        store_json: {
          clientes: store.clientes,
          processos: store.processos,
          prazos: store.prazos,
          agenda: store.agenda,
          convites: store.convites,
          atividades: store.atividades,
        },
      })
      .eq("id", escritorioId);

    return result;
  }

  return alterarGestaoStoreLocal(fn);
}

export async function criarEscritorioPersistido(
  escritorio: EscritorioGestao,
  membro: MembroGestao
): Promise<void> {
  if (await supabaseGestaoAtivo()) {
    const admin = createAdminClient();
    const { error: escErr } = await admin.from("gestao_escritorios").insert({
      id: escritorio.id,
      nome: escritorio.nome,
      admin_user_id: escritorio.adminUserId,
      admin_email: escritorio.adminEmail,
      oab_responsavel: escritorio.oabResponsavel,
      plano_gestao: escritorio.planoGestao,
      store_json: PAYLOAD_VAZIO,
      criado_em: escritorio.criadoEm,
    });
    if (escErr) throw escErr;

    const { error: memErr } = await admin.from("gestao_membros").insert({
      escritorio_id: escritorio.id,
      user_id: membro.userId,
      email: membro.email,
      nome: membro.nome,
      papel: membro.papel,
      criado_em: membro.criadoEm,
    });
    if (memErr) throw memErr;
    return;
  }

  await alterarGestaoStoreLocal((store) => {
    store.escritorios.push(escritorio);
    store.membros.push(membro);
  });
}

export async function inserirMembroPersistido(membro: MembroGestao): Promise<void> {
  if (await supabaseGestaoAtivo()) {
    const admin = createAdminClient();
    const { error } = await admin.from("gestao_membros").insert({
      escritorio_id: membro.escritorioId,
      user_id: membro.userId,
      email: membro.email,
      nome: membro.nome,
      papel: membro.papel,
      criado_em: membro.criadoEm,
    });
    if (error) throw error;
    return;
  }

  await alterarGestaoStoreLocal((store) => {
    store.membros.push(membro);
  });
}

export async function atualizarPapelMembroPersistido(
  escritorioId: string,
  userId: string,
  papel: MembroGestao["papel"]
): Promise<void> {
  if (await supabaseGestaoAtivo()) {
    const admin = createAdminClient();
    const { error } = await admin
      .from("gestao_membros")
      .update({ papel })
      .eq("escritorio_id", escritorioId)
      .eq("user_id", userId);
    if (error) throw error;
    return;
  }

  await alterarGestaoStoreLocal((store) => {
    const m = store.membros.find(
      (x) => x.userId === userId && x.escritorioId === escritorioId
    );
    if (m) m.papel = papel;
  });
}

export async function listarMembrosPersistidos(
  escritorioId: string
): Promise<MembroGestao[]> {
  if (await supabaseGestaoAtivo()) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("gestao_membros")
      .select("*")
      .eq("escritorio_id", escritorioId);
    return (data ?? []).map((m) => rowParaMembro(m as MembroRow));
  }

  const store = await lerGestaoStoreLocal();
  return store.membros.filter((m) => m.escritorioId === escritorioId);
}

export async function lerGestaoEscritorio(
  escritorioId: string
): Promise<GestaoStore | null> {
  if (await supabaseGestaoAtivo()) {
    const carregado = await carregarEscritorioSupabase(escritorioId);
    if (!carregado) return null;
    return montarStore(carregado.escritorio, carregado.membros, carregado.payload);
  }

  const store = await lerGestaoStoreLocal();
  const escritorio = store.escritorios.find((e) => e.id === escritorioId);
  if (!escritorio) return null;

  return {
    escritorios: [escritorio],
    membros: store.membros.filter((m) => m.escritorioId === escritorioId),
    clientes: store.clientes.filter((c) => c.escritorioId === escritorioId),
    processos: store.processos.filter((p) => p.escritorioId === escritorioId),
    prazos: store.prazos.filter((p) => p.escritorioId === escritorioId),
    agenda: store.agenda.filter((e) => e.escritorioId === escritorioId),
    convites: store.convites.filter((c) => c.escritorioId === escritorioId),
    atividades: store.atividades.filter((a) => a.escritorioId === escritorioId),
  };
}

export async function buscarConvitePorToken(token: string): Promise<{
  escritorio: EscritorioGestao;
  convite: GestaoStore["convites"][number];
} | null> {
  if (await supabaseGestaoAtivo()) {
    const admin = createAdminClient();
    const { data: rows } = await admin
      .from("gestao_escritorios")
      .select("id, nome, admin_user_id, admin_email, oab_responsavel, plano_gestao, store_json, criado_em");

    for (const row of rows ?? []) {
      const payload = {
        ...PAYLOAD_VAZIO,
        ...(row.store_json as GestaoPayload),
      };
      const convite = payload.convites.find(
        (c) => c.token === token && !c.usadoEm
      );
      if (convite) {
        return {
          escritorio: rowParaEscritorio(row as EscritorioRow),
          convite,
        };
      }
    }
    return null;
  }

  const store = await lerGestaoStoreLocal();
  const convite = store.convites.find((c) => c.token === token && !c.usadoEm);
  if (!convite) return null;
  const escritorio =
    store.escritorios.find((e) => e.id === convite.escritorioId) ?? null;
  if (!escritorio) return null;
  return { escritorio, convite };
}

export type GestaoEscritorioAdmin = {
  id: string;
  nome: string;
  adminEmail: string;
  oabResponsavel: string;
  criadoEm: string;
  membros: number;
  processos: number;
  clientes: number;
};

export async function listarPainelAdminGestao(): Promise<{
  escritorios: GestaoEscritorioAdmin[];
  totalMembros: number;
  totalEscritorios: number;
}> {
  if (await supabaseGestaoAtivo()) {
    const admin = createAdminClient();
    const { data: rows } = await admin
      .from("gestao_escritorios")
      .select("*")
      .order("criado_em", { ascending: false });
    const { data: membrosRows } = await admin.from("gestao_membros").select("*");

    const contagemMembros = new Map<string, number>();
    for (const m of membrosRows ?? []) {
      const id = m.escritorio_id as string;
      contagemMembros.set(id, (contagemMembros.get(id) ?? 0) + 1);
    }

    const escritorios: GestaoEscritorioAdmin[] = (rows ?? []).map((row) => {
      const payload = {
        ...PAYLOAD_VAZIO,
        ...(row.store_json as GestaoPayload),
      };
      return {
        id: row.id as string,
        nome: row.nome as string,
        adminEmail: row.admin_email as string,
        oabResponsavel: (row.oab_responsavel as string) || "—",
        criadoEm: row.criado_em as string,
        membros: contagemMembros.get(row.id as string) ?? 0,
        processos: payload.processos.length,
        clientes: payload.clientes.length,
      };
    });

    return {
      escritorios,
      totalEscritorios: escritorios.length,
      totalMembros: membrosRows?.length ?? 0,
    };
  }

  const store = await lerGestaoStoreLocal();
  const escritorios: GestaoEscritorioAdmin[] = store.escritorios.map((e) => ({
    id: e.id,
    nome: e.nome,
    adminEmail: e.adminEmail,
    oabResponsavel: e.oabResponsavel || "—",
    criadoEm: e.criadoEm,
    membros: store.membros.filter((m) => m.escritorioId === e.id).length,
    processos: store.processos.filter((p) => p.escritorioId === e.id).length,
    clientes: store.clientes.filter((c) => c.escritorioId === e.id).length,
  }));

  return {
    escritorios,
    totalEscritorios: escritorios.length,
    totalMembros: store.membros.length,
  };
}
