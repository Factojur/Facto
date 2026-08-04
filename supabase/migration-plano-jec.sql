-- Migration: incluir plano 'jec' em assinaturas
-- Execute no Supabase SQL Editor.

alter table public.assinaturas
  drop constraint if exists assinaturas_plano_check;

alter table public.assinaturas
  add constraint assinaturas_plano_check
  check (plano is null or plano in ('jec', 'mensal', 'anual'));
