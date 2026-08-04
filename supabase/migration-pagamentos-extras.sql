-- Migration: pagamentos de pacotes extras (compra avulsa Mercado Pago)
-- Execute no Supabase SQL Editor após migration-cota-pecas.sql.
--
-- Idempotência do webhook: cada mp_payment_id credita extras uma única vez.

create table if not exists public.pagamentos_extras (
  id uuid primary key default gen_random_uuid(),
  mp_payment_id text unique not null,
  user_id uuid references auth.users (id) on delete set null,
  email text,
  pacote_id text not null,
  pecas integer not null check (pecas > 0),
  valor numeric(10, 2),
  ciclo text not null,
  criado_em timestamptz not null default now()
);

create index if not exists pagamentos_extras_user_idx
  on public.pagamentos_extras (user_id);

create index if not exists pagamentos_extras_email_idx
  on public.pagamentos_extras (email);

alter table public.pagamentos_extras enable row level security;

-- Sem policy: apenas service role (webhook / admin).
