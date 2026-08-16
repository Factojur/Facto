---
name: facto-juris-seed
description: >-
  Seed and lastro of FACTO case law (Jurisprudências.ai, embeddings, TJSP
  cache, lotes). Use when running seed scripts, reindex, juris quota 429,
  PENDENCIAS lacunas, or mixing seed files with product deploys.
---

# FACTO — seed e lastro

Não muda a minuta sozinho. Alimenta a base que a Pesquisa usa.

## Como rodar

- Faixa: `npx tsx scripts/seed-juris-ai-faixa.ts <de> <ate>`
- Diário 01h (PC ligado): `npm run seed:juris-diario` + tarefa `scripts/instalar-tarefa-seed-juris.ps1`. Estado em `scripts/seed-juris-estado.json`.
- Pool: **sempre as 7 contas** (`JURISPRUDENCIAS_AI_API_KEY` + `JURISPRUDENCIAS_AI_API_KEYS`). Round-robin; abortar lote só se **todas** responderem 429.
- O diário queima do `proximoLote` até `LOTE_MAX` ou 429 (não corta em 16 lotes). `npx --yes` para não travar à noite.
- `vencimento` (YYYY-MM-DD) no estado: pausa 7 dias antes. Sem data, não pausa.
- Parou no 429: retomar **do lote que falhou**.
- Depois de cada dia: o diário já chama `reindex:embeddings`.
- API: `stf stj tst trf3 trf4 tjce tjgo tjma tjmg tjmt tjpr tjrj tjrs tjsc tjsp carf`. Sem TSE, TRE, TRF1/2/5/6, TNU.

## Estado (16/08)

- Na base até **83**. Próximo **84**. `LOTE_MAX` **646**. Vencimento **2026-09-13** → pausa automática **06/09**. Tarefa 01h: 17/08.

## Produto vs seed

- Deploy de UI/copy: **não** incluir seed, casos-ouro nem diag no mesmo commit, salvo o usuário pedir.
- “Buscar na base FACTO” não consome cota; “Buscar nos tribunais” = 1 cota **por tribunal** marcado (máx. 15/mês).
