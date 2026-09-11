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
- Agenda sugerida: **22h** testes · **23h** reindex embeddings (SEED) · **01h** juris.ai · **02h** portal TSE/TRE · **03h** smoke · **04h** súmulas · **a cada 3 h** TJs P2b e-SAJ (`FACTO-seed-tj-portal-3h`, paygo só `tj*-portal`).
- Pool: **sempre as 7 contas** (`JURISPRUDENCIAS_AI_API_KEY` + `JURISPRUDENCIAS_AI_API_KEYS`). Round-robin; abortar lote só se **todas** responderem 429.
- Embeddings/reindex/smoke **gerais:** `GEMINI_API_KEY_SEED` (free). **Exceção P2b:** `--paygo-portal-tj` só em `fonte LIKE tj%-portal` (não Juris.ai).
- O diário queima do `proximoLote` até `LOTE_MAX` ou 429 (não corta em 16 lotes). `npx --yes` para não travar à noite.
- **Sem pausa −7d:** `vencimento` no estado é só referência; o diário segue até a fila/cota ou até Jefferson mandar parar.
- Parou no 429: retomar **do lote que falhou**.
- Depois de cada seed: o diário já chama `reindex:embeddings` (pode falhar por 429/`^C`).
- **Garantia ≥1×/dia:** `FACTO-reindex-embeddings-23h` · `scripts/instalar-tarefa-reindex-embeddings.ps1` · log `reindex-embeddings-diario.log`.
- API Juris.ai: `stf stj tst trf3 trf4 tjce tjgo tjma tjmg tjmt tjpr tjrj tjrs tjsc tjsp carf`. Sem TSE, TRE, TRF1/2/5/6, TNU.
- **SJUR TRE (P1a rodízio):** 1 TRE/noite (`FILA_TRE_P1A`). Host `jurisprudencia.tre-{uf}.jus.br`. Diário 02h: **2 TSE + 2 temas do TRE da vez**. Tema por UF; cicla as 27 UFs.
- `npm run seed:juris-portal-diario` · tarefa `FACTO-seed-portal-02h`.
- **P2b TJs e-SAJ:** `npm run seed:juris-tj-portal-diario` · **a cada 3 h** · 1 TJ · 2 temas · **3 anos** · `fonte=tj{uf}-portal` · reindex `--paygo-portal-tj`. Fila BA→PE→… (DF fora — portal distinto). Instalar: `scripts/instalar-tarefa-seed-tj-portal.ps1`.
- **Jefferson:** PC ligado (seeds + TJ 3h); SEED free + Juris.ai; paygo **só** P2b TJ portal.
- Embeddings gerais: **somente** `GEMINI_API_KEY_SEED` (free). Paygo bloqueado exceto `--paygo-portal-tj` / catch-up explícito.

## Estado (11/09)

- `proximoLote` **1092**, `ate` **1500**, vencimento **2026-09-13** (só referência).
- Fila portal gaps: P0/P1a em curso · **P2b TJs a cada 3 h** (paygo filtrado) · P1b TNU / P2a TRFs / P2c TJM depois.
- Reindex: 23h SEED (Juris.ai residual) · P2b paygo `tj%-portal` · catch-up paygo geral **só com ok** se backlog Juris.ai explodir.
- **Prioridade:** TJs novos + hosts falhos · não misturar TRE/TJM na fila 3h.
- **O8** ON em prod.

## Produto vs seed

- Deploy de UI/copy: **não** incluir seed, casos-ouro nem diag no mesmo commit, salvo o usuário pedir.
- “Buscar na base FACTO” não consome cota; “Buscar nos tribunais” = 1 cota **por tribunal** marcado (máx. 15/mês).
