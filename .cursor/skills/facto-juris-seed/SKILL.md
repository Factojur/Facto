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
- Parou no 429: retomar **do lote que falhou**, não do 1.
- Depois de cada dia de insert: `npm run reindex:embeddings` (senão a busca FACTO não acha).
- API: `stf stj tst trf3 trf4 tjce tjgo tjma tjmg tjmt tjpr tjrj tjrs tjsc tjsp carf`. Sem TSE, TRE, TRF1/2/5/6, TNU.
- `pub_from=2023-01-01` + lookup de ementa. Não é e-SAJ.
- Não commitar `_diag-*`, `_limpar-*`, `_w_autor*`, JSON avulso de diagnóstico.
- Atualizar **Lacunas da base** em `PENDENCIAS.md` se lote vier 0 insert ou tribunal errado.

## Estado (15/08)

- Lotes **1–55** fechados. **56** interrompido na cota. **57–64** pendentes.
- Amanhã: `npx tsx scripts/seed-juris-ai-faixa.ts 56 64` + reindex.

## Produto vs seed

- Deploy de UI/copy: **não** incluir seed, casos-ouro nem diag no mesmo commit, salvo o usuário pedir.
- “Buscar na base FACTO” não consome cota; “Buscar nos tribunais” = 1 cota **por tribunal** marcado (máx. 15/mês).
