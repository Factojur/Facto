# Pendências de produto (FACTO)

Lista viva — itens alinhados em conversa, ainda sem implementação fechada ou só parcialmente feitos.

## Prioridade sugerida (próximos passos)

1. **[P0] Qualidade da peça JEC (lastro + anti-alucinação)** — _parcial_
   - [x] Anotar jurisprudência sem lastro com `[NÃO ENCONTRADO NA BASE]`
   - [x] Conferência de citações reforçada
   - [ ] Ampliar suite de casos-ouro JEC

2. **[P0] Embeddings / busca semântica** — _feito_
   - [x] Migration + reindex + retrieve híbrido + deploy

3. **[P1] Leitura de autos → peça + teses** — _código em prod; falta validar_
   - [x] Modo **Analisar processo** + ficha + peça + confirmação
   - [x] Coluna Análises em `/admin/uso-pecas`
   - [ ] Rodar `migration-cota-analises.sql` + `migration-admin-avisos.sql` no Supabase
   - [ ] **Teste manual (você):** PDF real no JEC (sentença ou inicial+sentença) → confirmar peça → gerar em produção
   - [ ] Chunking fino / OCR / Map-Reduce / demais áreas (depois)

4. **[P1] Admin — avisos operacionais** — _código em prod_
   - [x] Banner disco + compras desde último acesso + e-mails
   - [ ] Rodar `migration-admin-avisos.sql`
   - [ ] `SUPABASE_PLAN=pro` no Vercel **somente depois** de assinar Pro (hoje default Free no banner — não setar no escuro)

5. **[P1] TJSP scraper confiável em produção** — _em andamento_
   - [x] Cache por **termo de busca** (não texto inteiro do caso)
   - [x] Hook `SCRAPER_TJSP_WORKER_URL` (Chromium fora da Vercel)
   - [x] `fonteTjsp` na resposta de `/api/juris/sugerir`
   - [x] Script `npm run aquecer:cache-tjsp`
   - [ ] Confirmar `migration-juris-scrape-cache.sql` no Supabase prod
   - [ ] Aquecer cache localmente contra o Supabase de prod
   - [ ] Subir worker Chromium (Railway/Fly/VPS) e apontar `SCRAPER_TJSP_WORKER_URL` na Vercel

6. **[P1] Segundo tribunal (STJ)**  
7. **[P2] Política CDC / cota-teste 7 dias**  
8. **[P2] Expandir áreas**  
9. **[P3]** Chat multi-turno, Word add-in, contratos  

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

- [ ] **Worker TJSP em produção** (Chromium fora da Vercel) + env na Vercel.
- [ ] Migration scrape-cache (se falta): `migration-juris-scrape-cache.sql`.
- [ ] Aquecer cache JEC (`npm run aquecer:cache-tjsp`).
- [ ] **7º token** Jurisprudências.ai.
- [ ] Provedor secundário STJ.
- [x] Embeddings / leitura de autos MVP (falta teste PDF).
- [ ] Citação passage-level · chat multi-turno · Word · contratos.

## Scrapers

- [ ] STJ · TJRJ · TJMG · STF · TST · demais TJs

## Infra / ops

- [ ] Worker Chromium + observabilidade por tribunal.
- [x] Reindex embeddings.
- [ ] Migrations SQL pendentes: `cota-analises`, `admin-avisos`, `juris-scrape-cache` (conferir).
