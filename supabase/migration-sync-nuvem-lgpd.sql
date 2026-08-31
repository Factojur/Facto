-- Sync opcional na nuvem (LGPD): histórico de minutas + memória de cliente.
-- Execute no Supabase SQL Editor quando for habilitar sync para clientes pagantes.
--
-- Pré-requisito: profiles + RLS padrão FACTO.

alter table public.profiles
  add column if not exists sync_nuvem_opt_in boolean not null default false,
  add column if not exists sync_nuvem_opt_in_em timestamptz,
  add column if not exists sync_nuvem_versao text;

create table if not exists public.minutas_historico (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  area_id text not null,
  titulo text not null,
  especie_peca text,
  tipo_acao text,
  foro text,
  numero_processo text,
  resumo text,
  peca_texto text,
  peca_html text,
  gerado_por_ia boolean not null default true,
  origem text not null default 'chat'
    check (origem in ('chat', 'formulario')),
  sessao_id text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.memoria_clientes_nuvem (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  chave text not null,
  rotulo text not null,
  dados jsonb not null,
  atualizado_em timestamptz not null default now(),
  unique (profile_id, chave)
);

create index if not exists minutas_historico_profile_idx
  on public.minutas_historico (profile_id, atualizado_em desc);

create index if not exists memoria_clientes_profile_idx
  on public.memoria_clientes_nuvem (profile_id, atualizado_em desc);

alter table public.minutas_historico enable row level security;
alter table public.memoria_clientes_nuvem enable row level security;

drop policy if exists minutas_historico_select_own on public.minutas_historico;
create policy minutas_historico_select_own on public.minutas_historico
  for select using (auth.uid() = profile_id);

drop policy if exists minutas_historico_insert_own on public.minutas_historico;
create policy minutas_historico_insert_own on public.minutas_historico
  for insert with check (auth.uid() = profile_id);

drop policy if exists minutas_historico_update_own on public.minutas_historico;
create policy minutas_historico_update_own on public.minutas_historico
  for update using (auth.uid() = profile_id);

drop policy if exists minutas_historico_delete_own on public.minutas_historico;
create policy minutas_historico_delete_own on public.minutas_historico
  for delete using (auth.uid() = profile_id);

drop policy if exists memoria_clientes_select_own on public.memoria_clientes_nuvem;
create policy memoria_clientes_select_own on public.memoria_clientes_nuvem
  for select using (auth.uid() = profile_id);

drop policy if exists memoria_clientes_insert_own on public.memoria_clientes_nuvem;
create policy memoria_clientes_insert_own on public.memoria_clientes_nuvem
  for insert with check (auth.uid() = profile_id);

drop policy if exists memoria_clientes_update_own on public.memoria_clientes_nuvem;
create policy memoria_clientes_update_own on public.memoria_clientes_nuvem
  for update using (auth.uid() = profile_id);

drop policy if exists memoria_clientes_delete_own on public.memoria_clientes_nuvem;
create policy memoria_clientes_delete_own on public.memoria_clientes_nuvem
  for delete using (auth.uid() = profile_id);
