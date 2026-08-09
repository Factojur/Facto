-- Cotas diárias de busca no Jurisprudências.ai (por usuário FACTO).
-- + metadados de precedentes validados por humanos na base_conhecimento.

create table if not exists public.juris_busca_cota (
  user_id uuid not null references auth.users (id) on delete cascade,
  dia date not null default ((timezone('America/Sao_Paulo', now()))::date),
  consultas integer not null default 0 check (consultas >= 0),
  primary key (user_id, dia)
);

create index if not exists juris_busca_cota_dia_idx
  on public.juris_busca_cota (dia desc);

alter table public.juris_busca_cota enable row level security;

-- Usuário só lê a própria cota; gravação via service role no backend.
drop policy if exists "juris_busca_cota_select_own" on public.juris_busca_cota;
create policy "juris_busca_cota_select_own"
  on public.juris_busca_cota
  for select
  to authenticated
  using (auth.uid() = user_id);

alter table public.base_conhecimento
  add column if not exists fonte text,
  add column if not exists status text,
  add column if not exists usuario_origem uuid references auth.users (id) on delete set null;

create index if not exists base_conhecimento_status_idx
  on public.base_conhecimento (status)
  where status is not null;

comment on column public.base_conhecimento.fonte is
  'Origem do registro (ex.: jurisprudencias.ai, upload, admin).';
comment on column public.base_conhecimento.status is
  'Ex.: validado — escolhido por humano em caso real.';
comment on column public.base_conhecimento.usuario_origem is
  'Usuário que selecionou/validou o precedente (pode diferir de criado_por).';
