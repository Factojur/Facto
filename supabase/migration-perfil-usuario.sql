-- Dados de perfil estendidos (foto, telefone, endereço)
alter table public.profiles
  add column if not exists foto_base64 text,
  add column if not exists telefone text,
  add column if not exists endereco text,
  add column if not exists numero text,
  add column if not exists complemento text,
  add column if not exists bairro text,
  add column if not exists cidade text,
  add column if not exists uf text,
  add column if not exists cep text;
