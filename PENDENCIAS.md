# Pendências de produto (FACTO)

Lista viva — itens alinhados em conversa, ainda sem implementação fechada ou só parcialmente feitos.

## Prioridade sugerida (próximos passos)

Ordem recomendada para excelência de peça + caminho JEC → demais áreas, sem burn alto:

1. **[P0] Qualidade da peça JEC (lastro + anti-alucinação)** — _parcial_
   - [x] Anotar jurisprudência sem lastro com `[NÃO ENCONTRADO NA BASE]`
   - [x] Conferência de citações reforçada (dígitos de processo / súmulas)
   - [ ] Ampliar suite de casos-ouro JEC (regressão manual/automática)

2. **[P0] Embeddings / busca semântica na `base_conhecimento`** — _feito_
   - [x] Migration `migration-base-conhecimento-embeddings.sql` (pgvector + RPC)
   - [x] Retrieve híbrido (vetorial + keyword) em `buscarConhecimentoRelacionado`
   - [x] Indexação ao salvar no admin / ao aprovar verificação
   - [x] Migration rodada no Supabase + reindex completo (`1436/1436`, `gemini-embedding-001`)
   - [x] Deploy produção: commit `7a4a352` em `main` (RAG semântico + grounding)

3. **[P1] Leitura de autos → peça cabível + teses** — _proposta pronta, aguardando aprovação_
   - [x] Draft em `docs/proposta-leitura-autos.md` (+ canvas `proposta-leitura-autos`)
   - [ ] Review seu: escopo MVP, catálogo de peças, cota da análise, UX
   - [ ] Implementar só após ok explícito (não começar pelo chunking genérico)

4. **[P1] TJSP scraper confiável em produção**  
5. **[P1] Segundo tribunal (STJ)**  
6. **[P2] Política CDC / cota-teste 7 dias**  
7. **[P2] Expandir áreas** (mesmo RAG semântico)  
8. **[P3]** Chat multi-turno, Word add-in, contratos  

---

## Assinatura / CDC (art. 49)

- [ ] Definir política dos **7 dias de arrependimento** vs uso de cota:
  - Opção preferencial em discussão: **cota-teste limitada nos 7 dias**, depois liberar cota integral.
  - Reforço opcional: no arrependimento, reembolso **menos peças já geradas** (preço unitário público), com aceite destacado no checkout + aviso na 1ª peça.
  - Validar copy/termos com advogado consumerista antes de publicar.
  - Decisão: (A) só teste 7 dias · (B) só desconto por peça · (C) combinação.

## Jurisprudência — o que já existe em partes / falta fechar

- [ ] **Scraper TJSP em produção:** Chromium/worker fora da Vercel (hoje scrape live só local; prod = cache + fallback base FACTO).
- [ ] **Migration scrape/cache no Supabase** (se ainda não rodou em todos os ambientes): `migration-juris-scrape-cache.sql`.
- [ ] **7º token** Jurisprudências.ai no pool (`JURISPRUDENCIAS_AI_API_KEYS`).
- [ ] **Provedor secundário** além do TJSP (próximo: STJ).
- [x] **Embeddings / busca vetorial** na `base_conhecimento` (híbrido: pgvector + keyword; indexação Gemini 768d).
- [ ] **Citação com lastro passage-level** (hoje: checagem por string + marcadores; sem grafo cite→trecho).
- [ ] **Chat jurídico multi-turno** / pesquisa livre estilo assistant (hoje: formulário + assistente de classificação).
- [ ] **Integração Word add-in** (hoje: export DOCX, sem plugin Office).
- [ ] **Análise de contratos / playbooks** (não existe como superfície de produto).
- [ ] **Leitura de autos / classificador de peça** — ver proposta; depende de aprovação.

## Scrapers de tribunais (após piloto TJSP)

- [ ] STJ  
- [ ] TJRJ  
- [ ] TJMG  
- [ ] STF (além das súmulas já curadas)  
- [ ] TST (se o produto expandir)  
- [ ] Demais TJs sob demanda (PR, RS, BA, DF…)

## Infra / ops

- [ ] Worker/ambiente com Chromium para scrape em produção.
- [ ] Observabilidade de sucesso/falha por tribunal (HTML/captcha).
- [x] Reindex embeddings: `npm run reindex:embeddings` (lotes + backoff 429).
