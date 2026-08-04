-- Migration: cota mensal de peças + créditos extras
-- Execute no Supabase SQL Editor.
--
-- Usado por:
-- - GET /api/cota
-- - POST /api/gerar-peca (consome 1 crédito)
-- - webhook MP de pacotes extras (creditar extras) — próximo passo

create table if not exists public.cota_pecas_ciclo (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  ciclo text not null, -- 'YYYY-MM' no fuso America/Sao_Paulo
  usadas integer not null default 0 check (usadas >= 0),
  extras integer not null default 0 check (extras >= 0),
  atualizado_em timestamptz not null default now(),
  unique (user_id, ciclo)
);

create index if not exists cota_pecas_ciclo_user_idx
  on public.cota_pecas_ciclo (user_id);

alter table public.cota_pecas_ciclo enable row level security;

-- Sem policy: apenas service role (servidor).
