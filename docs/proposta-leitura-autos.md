# Proposta: leitura de autos → peça cabível + teses

**Status:** decisões fechadas — **implementação JEC passos 1–5 em código** (confirmação humana inclusa).  
**Canvas:** `proposta-leitura-autos`.

## Objetivo de produto

O advogado envia o **processo completo** *ou* **só as peças que escolher**. O FACTO:

1. Extrai o texto (PDF/DOCX).
2. Classifica documentos.
3. Monta a **ficha processual**.
4. Sugere a **peça cabível** com confiança.
5. **Exige confirmação humana** antes de liberar a geração.
6. Teses via RAG; juris externa só no botão **Sugerir jurisprudência**.
7. Gerar peça consome cota do plano.

## Decisões

| # | Decisão | Status |
|---|---------|--------|
| 1 | Autos completos | ✅ |
| 2 | Upload seletivo | ✅ |
| 3 | Confirmação humana | ✅ |
| 4 | Rótulo UX: **Analisar processo** | ✅ |
| 5 | Análise grátis p/ usuário; juris no botão; gerar = cota peça | ✅ |
| 5b | Coluna **Análises** + custo est. no admin `/admin/uso-pecas` | ✅ (observabilidade) |

## Implementado (JEC)

- UI: modo **Analisar processo** em `jec-form.tsx`
- API: `POST /api/analisar-processo`
- Lib: `analisar-processo-gemini.ts`, types
- Métrica: `cota_pecas_ciclo.analises` (`migration-cota-analises.sql`)
- Rate-limit anti-abuso: 60 análises/mês (não é cota cobrável)

## SQL pendente no Supabase

Rodar `supabase/migration-cota-analises.sql` para a coluna `analises` aparecer no admin.

## Depois

- Chunking fino + página X; OCR; Map-Reduce; demais áreas.
