-- Migration: convites de acesso gerados após pagamento aprovado (Mercado Pago)
-- Execute no Supabase SQL Editor.
--
-- Quando o webhook recebe um pagamento aprovado, gera um token único aqui e
-- envia por e-mail um link de cadastro (/cadastro?token=...). O cadastro
-- deve validar esse token antes de liberar a criação da conta.

create table if not exists public.convites_pagos (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token text unique not null,
  status text not null default 'pendente' check (status in ('pendente', 'usado')),
  mp_payment_id text unique,
  criado_em timestamptz not null default now(),
  usado_em timestamptz
);

create index if not exists convites_pagos_email_idx on public.convites_pagos (email);

alter table public.convites_pagos enable row level security;

-- Sem policy de propósito: só a service role key (usada no servidor, pelo
-- webhook e futuramente pela validação em /cadastro) consegue ler/escrever.
