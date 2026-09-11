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
- Agenda sugerida: **22h** testes · **01h** juris.ai · **02h** portal gaps (TSE…) · **03h** smoke lastro · **04h** súmulas (até zerar).
- Pool: **sempre as 7 contas** (`JURISPRUDENCIAS_AI_API_KEY` + `JURISPRUDENCIAS_AI_API_KEYS`). Round-robin; abortar lote só se **todas** responderem 429.
- Embeddings/reindex/smoke: **somente** `GEMINI_API_KEY_SEED` (free). Paygo (`GEMINI_API_KEY` / factoassessoria) **bloqueado** via `exigirGeminiApenasSeed`.
- O diário queima do `proximoLote` até `LOTE_MAX` ou 429 (não corta em 16 lotes). `npx --yes` para não travar à noite.
- **Sem pausa −7d:** `vencimento` no estado é só referência; o diário segue até a fila/cota ou até Jefferson mandar parar.
- Parou no 429: retomar **do lote que falhou**.
- Depois de cada dia: o diário já chama `reindex:embeddings`.
- API Juris.ai: `stf stj tst trf3 trf4 tjce tjgo tjma tjmg tjmt tjpr tjrj tjrs tjsc tjsp carf`. Sem TSE, TRE, TRF1/2/5/6, TNU.
- **SJUR TRE (P1a seguro):** um TRE por vez (`FILA_TRE_P1A`). Host `jurisprudencia.tre-{uf}.jus.br`. Diário 02h: **2 TSE + 2 temas do TRE atual**. Fecha 12 temas → próxima UF. Ao fim dos 27 → pausa até ok TNU.
- `npm run seed:juris-portal-diario` · tarefa `FACTO-seed-portal-02h`.
- **Jefferson:** PC ligado 01h–04h na tomada; SEED free + Juris.ai; sem paygo.
- Embeddings: **somente** `GEMINI_API_KEY_SEED` (free). Paygo bloqueado.

## Estado (09/09 noite)

- `proximoLote` **1030**, `ate` **1500**, vencimento **2026-09-13** (só referência).
- Catch-up 09/09: **967–1030** · **+2.732** juris.ai; cota no **1030**.
- Portal TSE: em curso (`temaIndice` **10**/20). **TRE-SP P1a:** `treSpTemaIndice` **1**/12 · smoke +12 (`fonte=tre-sp-portal`).
- Regra −7d **desligada**: diário 01h segue normalmente.
- Lacunas estruturais: TRE/TNU/TRF1/2/5/6/STM + **17 TJs** fora da API; **P0 TSE** no ar; P1a/P1b não iniciados.
- **P2 seed (fixado 09/09):** P2a = TRF1/2/5/6 · P2b = 17 TJs → **27 UFs de TJ**; abastecimento contínuo pós-venda.
- **Agora:** inflar base (todos os temas). **Pendência futura:** modo frescor ≤1 ano (PENDENCIAS).
- Reindex: catch-up paygo **feito** (`sem_embedding`≈0). **Próximos** = só `GEMINI_API_KEY_SEED` (`npm run reindex:embeddings` **sem** `--paygo-catchup`).
- **O8** ON em prod. Embeddings/smoke/seeds: **nunca** paygo.

## Produto vs seed

- Deploy de UI/copy: **não** incluir seed, casos-ouro nem diag no mesmo commit, salvo o usuário pedir.
- “Buscar na base FACTO” não consome cota; “Buscar nos tribunais” = 1 cota **por tribunal** marcado (máx. 15/mês).
