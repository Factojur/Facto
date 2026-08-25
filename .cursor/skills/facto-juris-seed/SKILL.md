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
- Diário **01h** (PC ligado): `npm run seed:juris-diario` + `scripts/instalar-tarefa-seed-juris.ps1` (`FACTO-seed-juris-01h`). Estado em `scripts/seed-juris-estado.json`.
- **Súmulas / OJs / PNs 04h:** `npm run seed:sumulas-diario` + `scripts/instalar-tarefa-seed-sumulas.ps1` (`FACTO-seed-sumulas-04h`). Estado `scripts/seed-sumulas-estado.json`. Fontes em `scripts/sumulas-fonte/`. Fila: TST OJs/PNs → TSE portal → TJSP → TRE skip → reindex final. **Cada noite** já chama `reindex:embeddings` após o upsert (só sem vetor; 429 = retoma depois). Categoria sempre **Súmula** (aba admin), nunca misturar com Jurisprudência.
- **Testes peça scaffold 22h:** `npm run test:pecas-diario` + `scripts/instalar-tarefa-testes-pecas.ps1` (`FACTO-testes-pecas-22h`) · saída `tmp/testes-pecas-scaffold/` (PDF; 0 tokens redação).
- Agenda sugerida: **22h** testes · **01h** juris · **04h** súmulas (folga Gemini após o juris).
- Pool: **sempre as 7 contas** (`JURISPRUDENCIAS_AI_API_KEY` + `JURISPRUDENCIAS_AI_API_KEYS`). Round-robin; abortar lote só se **todas** responderem 429.
- O diário queima do `proximoLote` até `LOTE_MAX` ou 429 (não corta em 16 lotes). `npx --yes` para não travar à noite.
- `vencimento` (YYYY-MM-DD) no estado: pausa 7 dias antes. Sem data, não pausa.
- Parou no 429: retomar **do lote que falhou**.
- Depois de cada dia: o diário já chama `reindex:embeddings`.
- API: `stf stj tst trf3 trf4 tjce tjgo tjma tjmg tjmt tjpr tjrj tjrs tjsc tjsp carf`. Sem TSE, TRE, TRF1/2/5/6, TNU.

## Estado (25/08)

- `proximoLote` **400** · `ate` / `LOTE_MAX` **683** · vencimento **2026-09-13** (pausa ~06/09).
- Diário 25/08: lotes **366–399** ok (+1973 insert); parou no **400** por cota Juris.ai. Reindex Gemini 429.
- Súmulas: `faseIndice` **1** (próx. OJs TST); noite 25/08 fechou upsert código (+165 updates, 0 inserts).
- Tarefa juris: se Last Result `0x800710E0`, rodar `npm run seed:juris-diario` logado.
- **Não** criar lotes novos até esgotar 683; TRE/TSE julgados = 2ª API (súmulas TSE já no seed 04h).
- UI busca acervo: STF/STJ/**TST**/**TSE** + TJs 26+DF (máx. 3).
- PDFs de teste: `tmp/testes-pecas-scaffold/<runId>/` (não em `files/`).

## Produto vs seed

- Deploy de UI/copy: **não** incluir seed, casos-ouro nem diag no mesmo commit, salvo o usuário pedir.
- “Buscar na base FACTO” não consome cota; “Buscar nos tribunais” = 1 cota **por tribunal** marcado (máx. 15/mês).
