-- Migration: upload de arquivos (PDF/Word) na base de conhecimento
-- Execute no Supabase SQL Editor, depois de já ter rodado
-- migration-base-conhecimento.sql.
--
-- O texto continua sendo extraído automaticamente do arquivo no momento do
-- upload e salvo em "texto" (mesma coluna usada pela busca/injeção na peça).
-- Estas colunas novas só guardam a referência ao arquivo original, para o
-- admin poder baixar/conferir depois.

alter table public.base_conhecimento
  add column if not exists arquivo_nome text,
  add column if not exists arquivo_path text,
  add column if not exists arquivo_tipo text;

-- Bucket de Storage onde os arquivos originais (PDF/Word) ficam guardados.
-- Privado: só o backend (service role key) grava e gera links assinados
-- temporários para download — não é acessível publicamente.
insert into storage.buckets (id, name, public)
values ('base-conhecimento', 'base-conhecimento', false)
on conflict (id) do nothing;
