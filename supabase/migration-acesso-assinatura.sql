-- Migration: controle de acesso por vencimento/cancelamento de assinatura
-- Execute no Supabase SQL Editor.
--
-- acesso_valido_ate marca até quando o assinante pode usar o FACTO,
-- considerando o que já foi efetivamente pago:
--   - É estendida a cada pagamento aprovado (webhook subscription_authorized_payment).
--   - Se o cliente cancelar dentro de 7 dias da contratação (direito de
--     arrependimento do CDC, art. 49), é zerada para o momento do
--     cancelamento — corte imediato.
--   - Se cancelar depois dos 7 dias, ou simplesmente não renovar, NÃO é
--     alterada: o acesso continua até o fim do ciclo já pago.

alter table public.assinaturas
  add column if not exists acesso_valido_ate timestamptz;

alter table public.assinaturas
  drop constraint if exists assinaturas_motivo_encerramento_check;

alter table public.assinaturas
  add constraint assinaturas_motivo_encerramento_check
  check (motivo_encerramento in ('cancelado_pelo_cliente', 'pagamento_recusado', 'arrependimento_cdc'));
