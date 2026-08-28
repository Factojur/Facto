---
name: facto-gestao
description: >-
  FACTO Gestão — MVP local (processos, clientes, prazos, agenda, honorários,
  equipe). Use when editing /gestao routes, gestao-* libs, login entry,
  middleware destino=gestao, or local store .data/gestao. Do not commit/deploy
  unless the user explicitly asks.
---

# FACTO Gestão (MVP local)

Módulo separado das minutas. **Não publicar** em deploy geral até pedido explícito do usuário.

## Flags

- `gestaoHabilitada()`: `NODE_ENV === "development"` ou `NEXT_PUBLIC_FACTO_GESTAO=1`.
- Produção sem flag: rotas `/gestao` → `/dashboard`; botão some no login.

## Acesso

- Landing pública: `/gestao/login` (`GestaoLoginLanding`) — middleware manda não autenticados para lá (exceto essa rota).
- CTA da landing → `/login?destino=gestao` (OAuth/bootstrap sem sessão única de peças).
- Card no login de minutas: `GestaoLoginEntry` → `/gestao/login` (nova aba).
- Painel autenticado: `src/app/gestao/(painel)/**` — layout redireciona sem auth para `/gestao/login`.
- Onboarding escritório: `/gestao/entrar?convite=…` (autenticado, sem escritório ainda).
- Google OAuth: propagar `destino=gestao` até `google-bootstrap` → redirect `/gestao` (sem exigir plano FACTO em dev).
- Colaborador pode usar só Gestão; minutas exigem plano FACTO.
- **Sessão única só para PEÇAS** (`facto_sessao` / `sessao_ativa_id`). Login ou OAuth com `destino=gestao` **não** chama `POST /api/auth/sessao` — não derruba o dashboard em outra máquina. Gestão aceita vários dispositivos simultâneos (só auth Supabase).

## Dados

- Dev: `.data/gestao/store.json` (gitignored).
- Store: `escritorios`, `membros`, `convites`, `clientes`, `processos`, `prazos`, `agenda`, `atividades`.
- APIs: `/api/gestao/escritorio`, `convites`, `clientes`, `processos`, `prazos`, `agenda`, `atividades`.

## Escopo produto (sem financeiro)

- **Inclui:** clientes, pastas (processos), prazos, agenda, equipe, **honorários** (proposta/contrato + sugestão por área/valor da causa).
- **Não inclui:** fluxo de caixa, parcelas, boletos, contas a pagar/receber.

## Honorários

- Lib: `gestao-honorarios.ts` — `sugerirHonorario`, `calcularHonorarioContratado`.
- UI: `/gestao/honorarios` + aba na pasta `/gestao/processos/[id]`.
- Status: `a_definir` | `proposta` | `contratado` (negociação, não pagamento).

## Limites colaboradores

- Ver `limites-colaboradores.ts` (3 / 10 / ilimitado por plano gestão).

## UI

- Landing: `gestao-login-landing.tsx` — marca FACTO + destaques do módulo gestão.
- Dashboard: `gestao-dashboard.tsx` + `gestao-dashboard-stats.ts` (KPIs, gráficos CSS, checklist do dia).
- Shell: `gestao-shell.tsx` — nav Início, Processos, Clientes, Prazos, Agenda, Honorários, Equipe.
- Detalhe de pasta: `gestao-processo-detalhe.tsx` + `processos/[id]/page.tsx`.
- Prazos/agenda: vínculo opcional com pasta (`GestaoSeletorProcesso`).
- Link “Minutas FACTO ↗” abre dashboard em nova aba.
- Topbar do dashboard: `BotaoGestaoTopbar` ao lado de `BotaoPlanoTopbar` (só se `gestaoHabilitada()`).

## Teste local

- `npm run test:gestao-local` — smoke do store (escritório, cliente, honorário %, convite).
