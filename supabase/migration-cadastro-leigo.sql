-- Migration: cadastro sem OAB (leigo), restrito ao Juizado Especial Cível
-- Execute no Supabase SQL Editor.
--
-- Permite que pessoas sem OAB se cadastrem (a Lei 9.099/95, art. 9º, permite
-- que a própria parte ajuíze ação no JEC em causas de até 20 salários
-- mínimos, sem exigência de advogado). O acesso desses usuários fica restrito
-- ao módulo do JEC no aplicativo.

alter table public.profiles
  alter column oab_numero drop not null;

alter table public.profiles
  add column if not exists tipo_usuario text not null default 'advogado'
    check (tipo_usuario in ('advogado', 'leigo'));

alter table public.profiles
  add column if not exists termo_leigo_aceito_em timestamptz;

alter table public.profiles
  add column if not exists termo_leigo_versao text;

-- Atualiza a trigger de criação automática de perfil para já gravar
-- tipo_usuario (e OAB nula, quando ausente) a partir do user_metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome_completo, cpf, email, oab_numero, tipo_usuario)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome_completo', ''),
    coalesce(new.raw_user_meta_data->>'cpf', ''),
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data->>'oab_numero', ''),
    coalesce(new.raw_user_meta_data->>'tipo_usuario', 'advogado')
  );
  return new;
end;
$$;
