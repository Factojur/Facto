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
- **Sem pausa −7d:** `vencimento` no estado é só referência; o diário segue até a fila/cota ou até Jefferson mandar parar.
- Parou no 429: retomar **do lote que falhou**.
- Depois de cada dia: o diário já chama `reindex:embeddings`.
- API: `stf stj tst trf3 trf4 tjce tjgo tjma tjmg tjmt tjpr tjrj tjrs tjsc tjsp carf`. Sem TSE, TRE, TRF1/2/5/6, TNU.

## Estado (08/09)

- `proximoLote` **904**, `ate` **1500**, vencimento **2026-09-13** (só referência).
- 07/09 manual: **846–903** ok; cota no **904**.
- Regra −7d **desligada** (08/09): diário 01h segue normalmente.
- Lacunas estruturais: **Eleitoral** (sem TRE/TSE), 17 TJs + TRF1/2/5/6 + TNU + STM fora da API.

## Produto vs seed

- Deploy de UI/copy: **não** incluir seed, casos-ouro nem diag no mesmo commit, salvo o usuário pedir.
- “Buscar na base FACTO” não consome cota; “Buscar nos tribunais” = 1 cota **por tribunal** marcado (máx. 15/mês).
