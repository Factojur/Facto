-- Remove trigger se estiver causando conflito com insert duplicado.
-- Execute no Supabase → SQL Editor se já tiver rodado fix-profile-trigger.sql

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
