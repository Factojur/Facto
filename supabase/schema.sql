-- Tabela de perfis vinculada ao auth.users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome_completo text not null,
  cpf text not null unique,
  email text not null,
  oab_numero text,
  tipo_usuario text not null default 'advogado'
    check (tipo_usuario in ('advogado', 'leigo')),
  termo_leigo_aceito_em timestamptz,
  termo_leigo_versao text,
  foto_base64 text,
  telefone text,
  endereco text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  uf text,
  cep text,
  areas_favoritas text[] not null default '{}',
  sessao_ativa_id uuid,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Usuário lê o próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuário insere o próprio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Usuário atualiza o próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger: cria perfil automaticamente no cadastro (evita erro de RLS)
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
