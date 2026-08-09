-- Fila de verificação de julgados (antes da base_conhecimento definitiva).
-- Admin aprova/rejeita em /admin/juris-verificacao.

create table if not exists public.juris_verificacao (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  ementa text not null,
  tribunal text,
  data_julgado text,
  url text,
  numero_processo text,
  relator text,
  fonte text not null default 'jurisprudencias.ai',
  status text not null default 'pendente'
    check (status in ('pendente', 'aprovado', 'rejeitado')),
  aviso_duplicidade boolean not null default false,
  motivo_aviso text,
  similar_titulo text,
  similar_base_id uuid,
  usuario_origem uuid references auth.users (id) on delete set null,
  criado_em timestamptz not null default now(),
  revisado_em timestamptz,
  revisado_por uuid references auth.users (id) on delete set null,
  base_conhecimento_id uuid references public.base_conhecimento (id) on delete set null
);

create index if not exists juris_verificacao_status_idx
  on public.juris_verificacao (status, criado_em desc);

create index if not exists juris_verificacao_proc_idx
  on public.juris_verificacao (numero_processo)
  where numero_processo is not null;

alter table public.juris_verificacao enable row level security;

-- Leitura/gravação só via service role no backend (admin API).
-- Sem policies para authenticated: evita vazamento da fila.

comment on table public.juris_verificacao is
  'Julgados escolhidos por usuários; aguardam filtro do admin antes da base definitiva.';
comment on column public.juris_verificacao.aviso_duplicidade is
  'true quando há possível duplicata (não idêntica) na base ou na fila.';
