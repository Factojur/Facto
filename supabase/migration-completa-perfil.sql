-- Migration completa de perfil (execute no Supabase SQL Editor)
-- Corrige erro: coluna 'bairro' (e demais) não encontrada

alter table public.profiles
  add column if not exists foto_base64 text,
  add column if not exists telefone text,
  add column if not exists endereco text,
  add column if not exists numero text,
  add column if not exists complemento text,
  add column if not exists bairro text,
  add column if not exists cidade text,
  add column if not exists uf text,
  add column if not exists cep text,
  add column if not exists areas_favoritas text[] not null default '{}',
  add column if not exists sessao_ativa_id uuid;
