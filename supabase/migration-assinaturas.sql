-- Migration: assinaturas e pagamentos (Mercado Pago)
-- Execute no Supabase SQL Editor.
--
-- Guarda o histórico de assinaturas (preapproval) e pagamentos recorrentes
-- recebidos via webhook do Mercado Pago, para alimentar o painel
-- administrativo de análise financeira (/admin).
--
-- Estas tabelas NÃO têm política de RLS liberando leitura: só são acessadas
-- pelo servidor usando a service role key (webhook e página /admin), nunca
-- diretamente pelo navegador do usuário.

create table if not exists public.assinaturas (
  id uuid primary key default gen_random_uuid(),
  mp_preapproval_id text unique not null,
  profile_id uuid references public.profiles(id) on delete set null,
  email text,
  plano text check (plano in ('mensal', 'anual')),
  valor numeric(10, 2),
  -- Valores espelham o status da preapproval no Mercado Pago (atenção: lá é
  -- "canceled", com um só "l", diferente do português).
  status text not null check (status in ('pending', 'authorized', 'paused', 'canceled')),
  motivo_encerramento text check (motivo_encerramento in ('cancelado_pelo_cliente', 'pagamento_recusado')),
  data_inicio timestamptz,
  data_cancelamento timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists assinaturas_status_idx on public.assinaturas (status);
create index if not exists assinaturas_email_idx on public.assinaturas (email);

create table if not exists public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  assinatura_id uuid references public.assinaturas(id) on delete set null,
  mp_payment_id text unique not null,
  valor numeric(10, 2),
  status text,
  metodo_pagamento text,
  pago_em timestamptz,
  criado_em timestamptz not null default now()
);

create index if not exists pagamentos_assinatura_idx on public.pagamentos (assinatura_id);
create index if not exists pagamentos_pago_em_idx on public.pagamentos (pago_em);

-- Log bruto de todo evento recebido do Mercado Pago, para auditoria e para
-- permitir reprocessar em caso de erro/mudança de regra de negócio.
create table if not exists public.webhook_eventos_mp (
  id uuid primary key default gen_random_uuid(),
  topico text,
  mp_id text,
  payload jsonb,
  processado boolean not null default false,
  erro text,
  recebido_em timestamptz not null default now()
);

alter table public.assinaturas enable row level security;
alter table public.pagamentos enable row level security;
alter table public.webhook_eventos_mp enable row level security;

-- Nenhuma policy é criada de propósito: sem policy + RLS ligado = acesso
-- negado por padrão para chamadas autenticadas com a anon key. Só a service
-- role key (usada no servidor) ignora RLS e consegue ler/escrever aqui.
