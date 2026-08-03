-- Migration: log de e-mails transacionais (observabilidade + anti-spam do suporte)
-- Execute no Supabase SQL Editor.
--
-- Usado por:
-- - registro de envios/falhas (Resend)
-- - rate limit do formulário de suporte (máx. 5/hora por usuário)
-- - painel admin /admin/emails

create table if not exists public.email_eventos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (
    tipo in (
      'suporte',
      'convite',
      'financeiro_compra',
      'financeiro_cancelamento'
    )
  ),
  status text not null check (status in ('enviado', 'falha')),
  destinatario text,
  assunto text,
  erro text,
  user_id uuid,
  metadados jsonb,
  criado_em timestamptz not null default now()
);

create index if not exists email_eventos_criado_em_idx
  on public.email_eventos (criado_em desc);

create index if not exists email_eventos_user_tipo_idx
  on public.email_eventos (user_id, tipo, criado_em desc);

create index if not exists email_eventos_status_idx
  on public.email_eventos (status, criado_em desc);

alter table public.email_eventos enable row level security;

-- Sem policy: apenas service role (servidor / admin API).
