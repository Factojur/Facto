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
- **Súmulas / OJs / PNs 03h:** `npm run seed:sumulas-diario` + `scripts/instalar-tarefa-seed-sumulas.ps1` (`FACTO-seed-sumulas-03h`). Estado `scripts/seed-sumulas-estado.json`. Fontes em `scripts/sumulas-fonte/`. Fila: TST OJs/PNs → TSE portal → TJSP → TRE skip → reindex final. **Cada noite** já chama `reindex:embeddings` após o upsert (só sem vetor; 429 = retoma depois). Categoria sempre **Súmula** (aba admin), nunca misturar com Jurisprudência.
- Pool: **sempre as 7 contas** (`JURISPRUDENCIAS_AI_API_KEY` + `JURISPRUDENCIAS_AI_API_KEYS`). Round-robin; abortar lote só se **todas** responderem 429.
- O diário queima do `proximoLote` até `LOTE_MAX` ou 429 (não corta em 16 lotes). `npx --yes` para não travar à noite.
- `vencimento` (YYYY-MM-DD) no estado: pausa 7 dias antes. Sem data, não pausa.
- Parou no 429: retomar **do lote que falhou**.
- Depois de cada dia: o diário já chama `reindex:embeddings`.
- API: `stf stj tst trf3 trf4 tjce tjgo tjma tjmg tjmt tjpr tjrj tjrs tjsc tjsp carf`. Sem TSE, TRE, TRF1/2/5/6, TNU.

## Estado (24/08 → madrugada 25/08)

- `proximoLote` **366** · `ate` / `LOTE_MAX` **683** · vencimento **2026-09-13** (pausa ~06/09).
- Diário 24/08: lotes **329–365** ok; parou no **366** por cota Jurisprudências.ai. Reindex parcial Gemini 429 — `reindex:embeddings` quando a cota voltar (também roda no fim do diário).
- **01h 25/08:** retomar do **366** (`FACTO-seed-juris-01h` / `seed:juris-diario`). PC ligado + sessão logada (tarefa Interactive).
- **03h 25/08:** `FACTO-seed-sumulas-03h` — estado `faseIndice` 0 / `offset` 200 (continua upsert TST/TSE no código, depois OJs).
- Tarefa juris: se Last Result `0x800710E0`, rodar `npm run seed:juris-diario` logado.
- **Não** criar lotes novos até esgotar 683; TRE/TSE julgados = 2ª API (súmulas TSE já no seed 03h).
- UI busca acervo: STF/STJ/**TST**/**TSE** + TJs 26+DF (máx. 3).

## Produto vs seed

- Deploy de UI/copy: **não** incluir seed, casos-ouro nem diag no mesmo commit, salvo o usuário pedir.
- “Buscar na base FACTO” não consome cota; “Buscar nos tribunais” = 1 cota **por tribunal** marcado (máx. 15/mês).
