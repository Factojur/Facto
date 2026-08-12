# Pendências de produto (FACTO)

Lista viva — itens alinhados em conversa, ainda sem implementação fechada ou só parcialmente feitos.

## Prioridade sugerida (próximos passos)

1. **[P0] Qualidade da peça JEC (lastro + anti-alucinação)** — _parcial_
   - [x] Anotar jurisprudência sem lastro com `[NÃO ENCONTRADO NA BASE]`
   - [x] Conferência de citações reforçada
   - [x] Suite casos-ouro (`npm run test:casos-ouro` — **33 casos + catálogo**, 0 tokens): 9 temas JEC inicial, 5 espécies JEC, **19 áreas** (incl. fechadas), asserts estruturais
   - [x] Lastro **não** usa a estratégia da triagem; CNJ/REsp batem número inteiro (não “sopa” de dígitos)
   - [ ] Ampliar casos-ouro com peças completas por área quando cada módulo abrir

2. **[P0] Embeddings / busca semântica** — _feito_
   - [x] Migration + reindex + retrieve híbrido + deploy

3. **[P0] Pós-compra: webhook / e-mail / alerta** — _urgente_
   - **Causa raiz (10/08):** zero webhooks reais em 36h — MP não entrega em `https://factoia.com.br/api/webhooks/mercadopago` (só simulações antigas). Sem webhook → sem e-mail/alerta automático.
   - `payer_email` no preapproval costuma vir vazio após cancelar; e-mail está no `/v1/payments`.
   - [x] Resolver e-mail via payment/fatura/search; não apagar e-mail local com null do MP
   - [x] Aviso admin lista assinaturas; alerta se webhook silencioso 24h
   - [x] Convite noreply **imediato** com financeiro (sem schedule 10 min) + labels admin (“Compra aprovada” / “Convite”)
   - [x] Alerta push **ntfy** (`NTFY_TOPIC=facto-MP-compra-notificacao`) + copy admin sem Twilio
   - [x] Migration `alerta_sms_compra` no Supabase (você)
   - [x] Cancelamento no perfil: MP + estorno CDC 7 dias (reforço: assinatura ativa preferida, preapproval já cancelada, pagamento local)
   - [ ] **Você (MP):** URL + tópicos `subscription_preapproval`, `subscription_authorized_payment`, `payment` na mesma app dos mpago.la; compra teste deve criar linha em `/admin/emails` → Webhooks **com ID real**
   - [ ] Enquanto webhook falhar: `/admin/emails` → **Sincronizar MP agora**
   - [ ] Validar push ntfy + e-mails + **cancelar assinatura** (CDC) em compra teste

4. **[P1] Cadastro — validação OAB real por UF** — _pendente_
   - Hoje: mock em `validate-oab.ts` (números de teste).
   - [ ] Consultar base oficial/API da OAB do estado (UF + número + nome/CPF) no cadastro de advogado
   - [ ] UX de erro clara quando OAB não conferir; manter fluxo leigo sem OAB

5. **[P1] Leitura de autos → peça + teses** — _código em prod; falta validar_
   - [x] Modo **Analisar processo** + ficha + peça + confirmação
   - [x] Coluna Análises em `/admin/uso-pecas`
   - [x] Rodar `migration-cota-analises.sql` + `migration-admin-avisos.sql` no Supabase
   - [ ] **Teste manual (você):** PDF real no JEC (sentença ou inicial+sentença) → confirmar peça → gerar em produção
   - [ ] Chunking fino / OCR / Map-Reduce / demais áreas (depois)

6. **[P1] Admin — avisos e e-mails** — _código em prod_
   - [x] Banner disco + compras desde último acesso (**`/admin`**)
   - [x] Rodar `migration-admin-avisos.sql`
   - [x] Teste de e-mails pós-compra sem cobrança (**`/admin/emails`** → “compra falsa”)
   - [x] Log Resend: `resendId` no evento + “Financeiro: ok” só se a API aceitou; reenvio com **forçar**
   - [ ] Validar manualmente caixa + log após conferir domínio no Resend (SPF/DKIM)
   - [ ] `SUPABASE_PLAN=pro` no Vercel **somente depois** de assinar Pro

7. **[P1] TJSP scraper confiável em produção** — _parcial_
   - [x] Cache por termo + hook worker + `fonteTjsp`
   - [x] Migration scrape-cache + aquecer 15/15 termos JEC
   - [x] Validador de ementa (CNJ + anti-HTML) na extração, cache e fila; limpeza 12/08: **255 lixo / 15 linhas**
   - [ ] Reaquecer cache (`npm run aquecer:cache-tjsp -- --force`) após a limpeza
   - [ ] Worker Chromium + `SCRAPER_TJSP_WORKER_URL` (temas frios em prod)

8. **[P1] Tribunais na busca de juris (UX)** — _feito (MVP)_
   - [x] Multiseleção: TJ do foro + STJ + STF (+ outros TJs), máx. 3, mín. 1; nenhum pré-marcado (usuário escolhe a cota)
   - [x] Copy UI: “busca externa” / cota — **sem** citar Jurisprudências.ai (advogado + avisos API)

9. **[P1] Copy JEC / comercial** — _feito (MVP)_
   - [x] Seções opcionais claras (valores, pedidos, juris do caso); JG/MLE sem FileField (anexar em Provas)
   - [x] Tom honesto na formatação (landing, SEO, home, fluxo): padrão forense + revise antes de protocolar
   - [x] Preços anuais redondos: Completo **R$ 1.890** · Pro **R$ 2.990**; custo ≈/peça em todos os planos
   - [x] Links Mercado Pago dos anuais atualizados para 1890,00 e 2990,00 (12/08)
   - [ ] Revisar copy restante (Réus, Fatos, Provas, checklist) se ainda parecer genérica — você olha depois

10. **[P1] Segundo tribunal (STJ) em produção** (scraper/cache dedicado; API já busca STJ via seletor)  
11. **[P2] Política CDC / cota-teste 7 dias**  
12. **[P2] Expandir áreas** — _parcial (seeds multiárea 3–4 na base; lote 5 pronto)_
13. **[P2] Obsidian → `base_conhecimento` (sync)** — _especificado; não implementar ainda_
    - Spec: `docs/obsidian-sync-spec.md` · template: `docs/obsidian-templates/exemplo-juris.md`
    - Agora: alimentar base via admin/seeds; Obsidian só como notas pessoais se quiser
    - Depois (quando curadoria doer): script `sync:obsidian` (só `status: aprovado`) + reindex
    - [ ] Implementar sync v1 (dry-run + `--write`)
    - [ ] (Opcional) export fila `juris_verificacao` → Markdown
14. **[P3]** Chat multi-turno, Word add-in, contratos  

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

## Preços (referência)

| Plano | Preço | Cota | ≈/peça |
|-------|-------|------|--------|
| JEC | R$ 79,90/mês | 40 | R$ 2,00 |
| Completo | R$ 189,90/mês | 100 | R$ 1,90 |
| Completo Anual | R$ 1.890/ano | 110/mês | R$ 1,43 |
| Pro | R$ 289,90/mês | 180 | R$ 1,61 |
| Pro Anual | R$ 2.990/ano | 200/mês | R$ 1,25 |
| Extra +50 / +100 | R$ 49,90 / 89,90 | — | R$ 1,00 / 0,90 |

- Legados (webhook): 1.819,04 · 2.956,98 · demais em `PRECOS_LEADOS`.

## Jurisprudência

- [x] Migration scrape-cache aplicada.
- [x] Aquecer cache JEC (`npm run aquecer:cache-tjsp`) — 15 termos.
- [x] Lote 1 juris na base (`npm run seed:juris-ai-lote`) — ~97 ementas TJSP (temas JEC).
- [x] Lote 2 balanceado autor×réu (`npm run seed:juris-ai-lote-2`) — **+49 insert / 74 update** (11/08); `reindex:embeddings` +49; alguns termos 0 úteis (veículo/juros/vício); 429 parcial no pool.
- [x] Lote 3 multiárea (`npm run seed:juris-ai-lote-3`, 12/08) — **+27 insert / 12 skip**; trabalhista, família, criminal, tributário, administrativo, consumerista, bancário, imobiliário; `reindex` +39.
- [x] Lote 4 multiárea (`npm run seed:juris-ai-lote-4`, 12/08) — **+14 insert**; previdenciário, recuperação, ambiental, saúde suplementar, PAD, erro médico, sucessões, arbitragem; `reindex` +14. STJ rendeu pouco (0 úteis / 429).
- [ ] Lote 5 multiárea **pronto, cota 12/08 esgotada** (`npm run seed:juris-ai-lote-5`) — improbidade, licitações, desapropriação, locação, usucapião, LGPD, societário, penhora/bem de família. Rodar amanhã.
- [ ] Lotes seguintes (6+): tributário fino, trabalhista complementar, família (guarda/união estável), penal econômico, condomínio, PI, execução.
- [ ] Reaquecer cache TJSP após limpeza de lixo (`npm run aquecer:cache-tjsp -- --force`).
- [ ] **7º token** Jurisprudências.ai.
- [ ] Provedor secundário STJ estável em prod.
- [x] UX: multiseleção de tribunais no “Sugerir juris” (mín. 1, máx. 3; nenhum pré-marcado; 1 cota API por tribunal).
- [x] UI sem nome do provedor externo (só “busca externa” / cota).
- [x] Janela temporal de julgados no scraper TJSP: **manter 4 anos** (decisão alinhada).
- [x] Embeddings / leitura de autos MVP (falta teste PDF).
- [ ] Citação passage-level · chat multi-turno · Word · contratos.
- [x] Spec Obsidian sync (sem código de sync): `docs/obsidian-sync-spec.md`.
- [x] Contagem admin: PostgREST cortava em **1000**; agora pagina + mostra total real no banco (~1663 em 11/08; +41 juris em 12/08).
- [x] Seeds juris: **não sobrescrevem** título já existente; limpeza de lixo só com `SEED_JURIS_LIMPAR_LIXO=1`.

## Scrapers

- [ ] STJ · TJRJ · TJMG · STF · TST · demais TJs

## Infra / ops

- [ ] Worker Chromium + observabilidade por tribunal.
- [x] Reindex embeddings.
- [x] `migration-juris-scrape-cache.sql` aplicada + cache aquecido (15 termos).
- [ ] Worker Chromium TJSP (temas frios em prod).
- [x] Teste de e-mails compra falsa em `/admin/emails` (código ok; conferir entrega no dashboard Resend pelo `resendId`).
- [x] Links MP anuais → **1890** e **2990** (painel MP, 12/08).
- [x] Alerta compra ntfy (`NTFY_TOPIC`) + migration `alerta_sms_compra`; validar push real após webhook.
- [x] Diagnóstico Resend (12/08): falso “ok” corrigido; aviso interno sai de `noreply@` (evita From=To); `resendId` no log; reenvio **forçar**. Falta você: domínio verificado + “compra falsa” e colar o id no Resend.
- [ ] Obsidian: implementar `sync:obsidian` só quando curadoria doer (ver item 13 e spec).
