# Pendências de produto (FACTO)

Lista viva — itens alinhados em conversa, ainda sem implementação fechada ou só parcialmente feitos.

## Prioridade sugerida (próximos passos)

1. **[P0] Qualidade da peça JEC (lastro + anti-alucinação)** — _parcial_
   - [x] Anotar jurisprudência sem lastro com `[NÃO ENCONTRADO NA BASE]`
   - [x] Conferência de citações reforçada
   - [x] Suite casos-ouro JEC (`npm run test:casos-ouro` — 6 temas, 0 tokens)
   - [ ] Ampliar casos-ouro (mais temas / asserts) conforme surgirem regressões

2. **[P0] Embeddings / busca semântica** — _feito_
   - [x] Migration + reindex + retrieve híbrido + deploy

3. **[P1] Leitura de autos → peça + teses** — _código em prod; falta validar_
   - [x] Modo **Analisar processo** + ficha + peça + confirmação
   - [x] Coluna Análises em `/admin/uso-pecas`
   - [x] Rodar `migration-cota-analises.sql` + `migration-admin-avisos.sql` no Supabase
   - [ ] **Teste manual (você):** PDF real no JEC (sentença ou inicial+sentença) → confirmar peça → gerar em produção
   - [ ] Chunking fino / OCR / Map-Reduce / demais áreas (depois)

4. **[P1] Admin — avisos e e-mails** — _código em prod_
   - [x] Banner disco + compras desde último acesso (**`/admin`**)
   - [x] Rodar `migration-admin-avisos.sql`
   - [x] Teste de e-mails pós-compra sem cobrança (**`/admin/emails`** → “compra falsa”)
   - [ ] Você dispara o teste com um e-mail seu e confere caixa + log
   - [ ] `SUPABASE_PLAN=pro` no Vercel **somente depois** de assinar Pro

5. **[P1] TJSP scraper confiável em produção** — _parcial_
   - [x] Cache por termo + hook worker + `fonteTjsp`
   - [x] Migration scrape-cache + aquecer 15/15 termos JEC
   - [ ] Worker Chromium + `SCRAPER_TJSP_WORKER_URL` (temas frios em prod)

6. **[P1] Tribunais na busca de juris (UX)** — _feito (MVP)_
   - [x] Multiseleção: TJ do foro + STJ + STF (+ outros TJs), máx. 3, mín. 1; nenhum pré-marcado (usuário escolhe a cota)
7. **[P1] Segundo tribunal (STJ) em produção** (scraper/cache dedicado; API já busca STJ via seletor)  
8. **[P2] Política CDC / cota-teste 7 dias**  
9. **[P2] Expandir áreas**  
10. **[P3]** Chat multi-turno, Word add-in, contratos  

---

## Supabase Free vs Pro

| Quando assinar **Pro** (~US$ 25/mês) | Por quê |
|--------------------------------------|---------|
| Produto no ar com **clientes pagantes** | Free **pausa** o projeto por inatividade → site cai |
| ~**50+ usuários ativos**/mês com uso diário | Uptime + folga de disco/egress |
| Database > ~**200–300 MB** ou Storage apertando | Free trava em **500 MB** (read-only) |

- Disco hoje é folgado para várias áreas; Pro não é “por milhares de usuários”.
- Banner `/admin` assume Free (500 MB) até existir `SUPABASE_PLAN=pro` (ou `SUPABASE_DB_LIMIT_MB`).
- **Não** definir `SUPABASE_PLAN=pro` na Vercel enquanto o projeto ainda for Free (alerta falso).

---

## Assinatura / CDC (art. 49)

- [ ] Definir política dos **7 dias de arrependimento** vs uso de cota (A/B/C).

## Jurisprudência

- [x] Migration scrape-cache aplicada.
- [x] Aquecer cache JEC (`npm run aquecer:cache-tjsp`) — 15 termos.
- [x] Lote 1 juris na base (`npm run seed:juris-ai-lote`) — ~97 ementas TJSP (temas JEC).
- [x] Lote 2 balanceado autor×réu (`npm run seed:juris-ai-lote-2`) — +69 ementas; **parcial** (cota API esgotou).
- [ ] **Retomar lote 2** após reset da cota Jurisprudências.ai (`npm run seed:juris-ai-lote-2` + `npm run reindex:embeddings`).
- [ ] **Lotes multiárea** (não só JEC): trabalhista, família, criminal, tributário, administrativo, consumerista amplo, bancário, imobiliário, etc. — ~8–15 ementas/tema, pró-autor e pró-réu; STJ/STF onde couber.
- [ ] Reaquecer/limpar `juris_scrape_cache` (HTML inválido do e-SAJ) + scraper mais rígido.
- [ ] **7º token** Jurisprudências.ai.
- [ ] Provedor secundário STJ estável em prod.
- [x] UX: multiseleção de tribunais no “Sugerir juris” (mín. 1, máx. 3; nenhum pré-marcado; 1 cota API por tribunal).
- [x] Janela temporal de julgados no scraper TJSP: **manter 4 anos** (decisão alinhada).
- [x] Embeddings / leitura de autos MVP (falta teste PDF).
- [ ] Citação passage-level · chat multi-turno · Word · contratos.

## Scrapers

- [ ] STJ · TJRJ · TJMG · STF · TST · demais TJs

## Infra / ops

- [ ] Worker Chromium + observabilidade por tribunal.
- [x] Reindex embeddings.
- [x] `migration-juris-scrape-cache.sql` aplicada + cache aquecido (15 termos).
- [ ] Worker Chromium TJSP (temas frios em prod).
- [x] Teste de e-mails compra falsa em `/admin/emails` (validar manualmente).
