# Pendências de produto (FACTO)

Lista viva — itens alinhados em conversa, ainda sem implementação fechada ou só parcialmente feitos.

## Prioridade sugerida (próximos passos)

Ordem recomendada para excelência de peça + caminho JEC → demais áreas, sem burn alto:

1. **[P0] Qualidade da peça JEC (lastro + anti-alucinação)** — _parcial_
   - [x] Anotar jurisprudência sem lastro com `[NÃO ENCONTRADO NA BASE]`
   - [x] Conferência de citações reforçada (dígitos de processo / súmulas)
   - [ ] Ampliar suite de casos-ouro JEC (regressão manual/automática)

2. **[P0] Embeddings / busca semântica na `base_conhecimento`** — _feito_
   - [x] Migration + reindex (`1436/1436`) + retrieve híbrido + deploy

3. **[P1] Leitura de autos → peça cabível + teses** — _MVP JEC no código; validar em prod_
   - [x] Modo **Analisar processo** (autos/seletivo) + ficha + peça + confirmação
   - [x] Coluna Análises + custo est. em `/admin/uso-pecas`
   - [ ] Rodar no Supabase: `migration-cota-analises.sql` + `migration-admin-avisos.sql`
   - [ ] **Próximo passo imediato:** teste manual com PDF real (sentença/autos) no JEC em produção
   - [ ] Chunking fino / OCR / Map-Reduce / demais áreas (depois)

4. **[P1] Admin — avisos operacionais** — _código pronto_
   - [x] Banner disco Supabase no `/admin`
   - [x] Compras desde o último acesso + status e-mail pgto/convite + “Marcar como vistas”
   - [ ] Rodar `migration-admin-avisos.sql` (e opcional `SUPABASE_PLAN=pro` no Vercel)

5. **[P1] TJSP scraper confiável em produção**  
6. **[P1] Segundo tribunal (STJ)**  
7. **[P2] Política CDC / cota-teste 7 dias**  
8. **[P2] Expandir áreas** (mesmo RAG semântico)  
9. **[P3]** Chat multi-turno, Word add-in, contratos  

### Supabase Free vs Pro (ops)

- Disco hoje é folgado para várias áreas; o motivo do **Pro** é sobretudo **uptime** (Free pausa) e teto de 500 MB a médio prazo.
- Assinar Pro quando: produto em produção com clientes pagantes **ou** ~**50+ usuários ativos**/mês com uso diário **ou** database > ~**200–300 MB** / Storage apertando. Não precisa esperar “milhares” de usuários.

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
- [x] **Embeddings / busca vetorial** na `base_conhecimento`.
- [x] **Leitura de autos (MVP JEC)** — validar com PDF real; expansões depois.
- [ ] **Citação com lastro passage-level**.
- [ ] **Chat jurídico multi-turno**.
- [ ] **Integração Word add-in**.
- [ ] **Análise de contratos / playbooks**.

## Scrapers de tribunais (após piloto TJSP)

- [ ] STJ · TJRJ · TJMG · STF · TST · demais TJs sob demanda

## Infra / ops

- [ ] Worker/ambiente com Chromium para scrape em produção.
- [ ] Observabilidade de sucesso/falha por tribunal (HTML/captcha).
- [x] Reindex embeddings: `npm run reindex:embeddings`.
- [ ] Migrations pendentes no SQL Editor: `cota-analises` + `admin-avisos`.
