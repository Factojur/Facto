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

## Estado (19/08 noite)

- Na base até **185** (+45 insert parcial no **186** antes do 429). Próximo **186** — **20/08 01h**. `LOTE_MAX` **673**. Vencimento **2026-09-13** → pausa **06/09**.
- Lotes **149–185** concluídos na madrugada 19/08 (imobiliário + prev TRF4). **186** = ambiental TRF4; retoma do termo que parou.
- Reindex da madrugada 19/08 pode ter sido cortado (`^C` / exit 3221225786). O diário reindexa no fim da próxima faixa.
- Tarefa `FACTO-seed-juris-01h` **Ready** · próxima **20/08 01:00**. Pool **7** contas confirmado.

## Produto vs seed

- Deploy de UI/copy: **não** incluir seed, casos-ouro nem diag no mesmo commit, salvo o usuário pedir.
- “Buscar na base FACTO” não consome cota; “Buscar nos tribunais” = 1 cota **por tribunal** marcado (máx. 15/mês).
