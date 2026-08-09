-- JEC-2 (opcional / futuro): casos processuais na nuvem.
-- Hoje o MVP grava no localStorage do navegador (facto:jec-casos-v1).
-- Rode este script quando quiser sincronizar casos entre dispositivos.

create table if not exists public.jec_casos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  titulo text not null,
  numero_processo text,
  foro text,
  polo text not null default 'autor'
    check (polo in ('autor', 'reu')),
  fase_atual text not null default 'pre_acao',
  resumo_fatos text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.jec_caso_eventos (
  id uuid primary key default gen_random_uuid(),
  caso_id uuid not null references public.jec_casos (id) on delete cascade,
  fase text not null,
  nota text,
  especie_peca text,
  titulo_peca text,
  peca_texto text,
  criado_em timestamptz not null default now()
);

create index if not exists jec_casos_profile_idx on public.jec_casos (profile_id);
create index if not exists jec_caso_eventos_caso_idx on public.jec_caso_eventos (caso_id);

alter table public.jec_casos enable row level security;
alter table public.jec_caso_eventos enable row level security;

drop policy if exists jec_casos_select_own on public.jec_casos;
create policy jec_casos_select_own on public.jec_casos
  for select using (auth.uid() = profile_id);

drop policy if exists jec_casos_insert_own on public.jec_casos;
create policy jec_casos_insert_own on public.jec_casos
  for insert with check (auth.uid() = profile_id);

drop policy if exists jec_casos_update_own on public.jec_casos;
create policy jec_casos_update_own on public.jec_casos
  for update using (auth.uid() = profile_id);

drop policy if exists jec_casos_delete_own on public.jec_casos;
create policy jec_casos_delete_own on public.jec_casos
  for delete using (auth.uid() = profile_id);

drop policy if exists jec_eventos_select_own on public.jec_caso_eventos;
create policy jec_eventos_select_own on public.jec_caso_eventos
  for select using (
    exists (
      select 1 from public.jec_casos c
      where c.id = caso_id and c.profile_id = auth.uid()
    )
  );

drop policy if exists jec_eventos_insert_own on public.jec_caso_eventos;
create policy jec_eventos_insert_own on public.jec_caso_eventos
  for insert with check (
    exists (
      select 1 from public.jec_casos c
      where c.id = caso_id and c.profile_id = auth.uid()
    )
  );

drop policy if exists jec_eventos_delete_own on public.jec_caso_eventos;
create policy jec_eventos_delete_own on public.jec_caso_eventos
  for delete using (
    exists (
      select 1 from public.jec_casos c
      where c.id = caso_id and c.profile_id = auth.uid()
    )
  );
