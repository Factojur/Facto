-- Migration: planos 'pro' e 'pro_anual' (execute no Supabase SQL Editor).
-- Assinantes nos preços antigos continuam válidos via planoPorValor (legado no código).

alter table public.assinaturas
  drop constraint if exists assinaturas_plano_check;

alter table public.assinaturas
  add constraint assinaturas_plano_check
  check (
    plano is null
    or plano in ('jec', 'mensal', 'pro', 'anual', 'pro_anual')
  );
