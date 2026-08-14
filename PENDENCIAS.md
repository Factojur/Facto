# Pendências de produto (FACTO)

Lista viva — itens alinhados em conversa, ainda sem implementação fechada ou só parcialmente feitos.

## Alerta — próximo lote (cota diária Juris.ai)

Quando pedir **“próximo lote”** (cota reset ~horário de Brasília):

1. **Seguir no lote 9** (`npm run seed:juris-ai -- 9` → pejotização/vínculo). Lotes 1–8 na base; 8 ficou sem o último termo JECRIM.
2. **Não misturar com e-SAJ.** Seed usa Jurisprudências.ai, **não** o scraper TJSP. Cota nova ≠ cache aquecido.
3. **e-SAJ (14/08):** `juris_scrape_cache` **vazio**. Reaquecer local: **0/15** (captcha/layout). Base curada **intacta**. Worker Chromium em prod é o refill — não bloquear o lote 9 por isso.

---

## Prioridade sugerida (próximos passos)

1. **[P0] Qualidade da peça JEC (lastro + anti-alucinação)** — _parcial_
   - [x] Anotar jurisprudência sem lastro com `[NÃO ENCONTRADO NA BASE]`
   - [x] Conferência de citações reforçada
   - [x] Suite casos-ouro (`npm run test:casos-ouro` — **33 casos + catálogo**, 0 tokens): 9 temas JEC inicial, 5 espécies JEC, **19 áreas** (incl. fechadas), asserts estruturais
   - [x] Lastro **não** usa a estratégia da triagem; CNJ/REsp batem número inteiro (não “sopa” de dígitos)
   - [ ] Ampliar casos-ouro com peças completas por área quando cada módulo abrir

2. **[P0] Embeddings / busca semântica** — _feito_
   - [x] Migration + reindex + retrieve híbrido + deploy

3. **[P0] Pós-compra: webhook / e-mail / alerta** — _parcial (fluxo admin ok; falta compra real MP)_
   - **Causa raiz (10/08):** zero webhooks reais em 36h — MP não entrega em `https://factoia.com.br/api/webhooks/mercadopago` (só simulações antigas). Sem webhook → sem e-mail/alerta automático.
   - `payer_email` no preapproval costuma vir vazio após cancelar; e-mail está no `/v1/payments`.
   - [x] Resolver e-mail via payment/fatura/search; não apagar e-mail local com null do MP
   - [x] Aviso admin lista assinaturas; alerta se webhook silencioso 24h
   - [x] Convite noreply **imediato** com financeiro (sem schedule 10 min) + labels admin (interno / cliente / convite / ntfy)
   - [x] Alerta push **ntfy** (`NTFY_TOPIC=facto-MP-compra-notificacao`) — fix header ASCII 12/08; **teste admin ok**
   - [x] Migration `alerta_sms_compra` no Supabase (você)
   - [x] Cancelamento no perfil: MP + estorno CDC 7 dias + **sync não reativa** `canceled` + confirma cancel preapproval via GET (12/08)
   - [x] **Teste admin (12/08):** compra falsa em `/admin/emails` — Resend **Delivered** (interno `financeiro@` + cliente + convite noreply); ntfy ok. Usar **e-mail válido** (bounce → supressão Resend ~14 dias).
   - [ ] **Você (MP):** URL + tópicos `subscription_preapproval`, `subscription_authorized_payment`, `payment` na mesma app dos mpago.la; **compra real** deve criar linha em `/admin/emails` → Webhooks **com ID real**
   - [ ] Enquanto webhook falhar: `/admin/emails` → **Sincronizar MP agora**
   - [ ] **Compra real MP** + validar webhook automático + **cancelar assinatura (CDC)** ponta a ponta

4. **[P1] Cadastro — validação OAB real por UF** — _pendente_
   - Hoje: mock em `validate-oab.ts` (números de teste).
   - [ ] Consultar base oficial/API da OAB do estado (UF + número + nome/CPF) no cadastro de advogado
   - [ ] UX de erro clara quando OAB não conferir; manter fluxo leigo sem OAB

4b. **[P1] Cadastro só após pagamento** — _feito 14/08_
   - E-mail de boas-vindas (noreply) já levava `/cadastro?token=…` **único** por compra; agora o servidor **obriga** esse token + e-mail do pagador
   - [x] `/cadastro` exige token de `convites_pagos` (gerado no pós-compra MP)
   - [x] Conta criada só em `POST /api/cadastro` (e-mail = pagador; convite marcado usado)
   - [x] Dashboard: sem assinatura vigente = bloqueio, exceto `admin@facto.com`, `jec@facto.com`, `factoassessoria.jur@gmail.com`
   - [x] Sem linha em `assinaturas`, só libera se existir convite pago daquele e-mail (janela webhook)
   - [x] **Você (Supabase Auth, 14/08):** desligar **Allow new users to sign up** — não quebra login, reset de senha, contas livres nem `createUser` do servidor; só fecha `signUp` público residual

5. **[P1] Leitura de autos → peça + teses** — _código em prod; falta validar_
   - [x] Modo **Analisar processo** + ficha + peça + confirmação
   - [x] Coluna Análises em `/admin/uso-pecas`
   - [x] Rodar `migration-cota-analises.sql` + `migration-admin-avisos.sql` no Supabase
   - [x] **Cotas por plano (14/08):** JEC **10** · Completo **30** · Pro **50** (anuais = mensal). SQL: `migration-extras-analises.sql` (`extras_analises`)
   - [ ] **Teste manual (você):** PDF real no JEC (sentença ou inicial+sentença) → confirmar peça → gerar em produção
   - [ ] Chunking fino / OCR / Map-Reduce / demais áreas (depois)

6. **[P1] Admin — avisos e e-mails** — _teste admin ok; falta compra real_
   - [x] Banner disco + compras desde último acesso (**`/admin`**)
   - [x] Rodar `migration-admin-avisos.sql`
   - [x] Teste de e-mails pós-compra sem cobrança (**`/admin/emails`** → “compra falsa”)
   - [x] Log Resend: `resendId` no evento + “Financeiro: ok” só se a API aceitou; reenvio com **forçar**
   - [x] Domínio Resend **Verified** (SPF/DKIM) + entrega **Delivered** no teste admin (12/08). Admin “enviado” = API aceitou; entrega final = dashboard Resend.
   - [ ] `SUPABASE_PLAN=pro` no Vercel **somente depois** de assinar Pro

7. **[P1] TJSP scraper confiável em produção** — _parcial_
   - [x] Cache por termo + hook worker + `fonteTjsp`
   - [x] Migration scrape-cache + aquecer 15/15 termos JEC
   - [x] Validador de ementa (CNJ + anti-HTML) na extração, cache e fila; limpeza 12/08: **255 lixo / 15 linhas**
   - [ ] Reaquecer cache (`npm run aquecer:cache-tjsp`) — **14/08:** `juris_scrape_cache` estava **vazio** (limpeza sem refill). Tentativa: 0/15 (TJSP captcha/layout; Playwright ok). Base curada **não** foi tocada. Worker em prod continua o caminho.
   - [ ] Worker Chromium + `SCRAPER_TJSP_WORKER_URL` (temas frios em prod)
   - [ ] TTL / retenção do `juris_scrape_cache` (ver seção Supabase Free vs Pro)

8. **[P1] Tribunais na busca de juris (UX)** — _feito (MVP)_
   - [x] Multiseleção: TJ do foro + STJ + STF (+ outros TJs), máx. 3, mín. 1; nenhum pré-marcado (usuário escolhe a cota)
   - [x] Copy UI: “busca externa” / cota — **sem** citar Jurisprudências.ai (advogado + avisos API)

9. **[P1] Copy JEC / comercial** — _feito (MVP)_
   - [x] Seções opcionais claras (valores, pedidos, juris do caso); JG/MLE sem FileField (anexar em Provas)
   - [x] Tom honesto na formatação (landing, SEO, home, fluxo): padrão forense + revise antes de protocolar
   - [x] Preços anuais redondos (fase anterior): Completo **R$ 1.890** · Pro **R$ 2.990**
   - [x] **PLANO X (código 14/08):** Completo Anual **R$ 1.890** (mantido) · cotas anuais = mensais (100/180)
   - [x] Links MP anuais → 1890 / 2990 — Completo Anual **permanece R$ 1.890** (não precisa atualizar o link)
   - [ ] Revisar copy restante (Réus, Fatos, Provas, checklist) se ainda parecer genérica — você olha depois

10. **[P1] Segundo tribunal (STJ) em produção** — _exige Pro + cache com TTL_ (API já busca STJ via seletor)  
11. **[P2] Política CDC / cota-teste 7 dias**  
12. **[P2] Expandir áreas** — _parcial (seeds 1–8 na base; lotes **9–56 prontos**; ver estratégia na seção Supabase)_
13. **[P2] Obsidian → `base_conhecimento` (sync)** — _especificado; não implementar ainda_
    - Spec: `docs/obsidian-sync-spec.md` · template: `docs/obsidian-templates/exemplo-juris.md`
    - Agora: alimentar base via admin/seeds; Obsidian só como notas pessoais se quiser
    - Depois (quando curadoria doer): script `sync:obsidian` (só `status: aprovado`) + reindex
    - [ ] Implementar sync v1 (dry-run + `--write`)
    - [ ] (Opcional) export fila `juris_verificacao` → Markdown
14. **[P3]** Chat multi-turno, Word add-in, contratos  
15. **[P1] PLANO X** — _código 14/08_ — B 10/30/50 + saldo; E +10 análises R$ 29,90; G Completo Anual **R$ 1.890** (mantido) + H cotas 100/180; I copy JEC leigo; J 15 juris externa; **N botão só base curada**. SQL: `supabase/migration-extras-analises.sql`. A (Supabase Pro) só ao começar a vender.

---

## Supabase Free vs Pro — disco / base / multi-TJ

Decisão alinhada (12/08): **base curada = espinha dorsal**; **worker/scrape multi-TJ = complemento** (não substitui o retrieve). Sem Pro, multi-TJ sério **não** cabe com folga.

| Plano | Teto relevante | Efeito |
|-------|----------------|--------|
| **Free** | **500 MB** de *database size* (Postgres) | Acima → **read-only**; projeto **pausa** por inatividade |
| **Pro** (~US$ 25/mês) | **8 GB** disco (escala ~US$ 0,125/GB) | Adequado para dezenas de milhares de ementas + cache com TTL |

### Quando assinar Pro

| Gatilho | Por quê |
|---------|---------|
| Clientes pagantes / produto no ar | Free pausa → site cai |
| ~**50+** usuários ativos/mês | Uptime + egress |
| Database > ~**200–300 MB** | Free trava em **500 MB** |
| **Antes de ligar workers de vários TJs** (além de TJSP pontual) | Cache × tribunais + embeddings estoura Free |

- Banner `/admin` assume Free (500 MB) até existir `SUPABASE_PLAN=pro` (ou `SUPABASE_DB_LIMIT_MB`).
- **Não** definir `SUPABASE_PLAN=pro` na Vercel enquanto o projeto ainda for Free (alerta falso).
- [ ] Assinar Supabase **Pro** antes (ou no momento) de expandir scrape multi-TJ e alimentar lotes 5–56 em volume.

### O que mais come espaço

1. **`embedding vector(768)` + índice HNSW** — em geral pesa mais que o texto da ementa  
2. **`juris_scrape_cache`** por tribunal × termo (HTML/JSON gordo explode o disco)  
3. Índices e satélites (`juris_verificacao`, etc.)

Ordem de grandeza (com embedding): ~2–5 mil ementas → dezenas–centenas de MB; ~15–30 mil → facilmente **1–3 GB**. Cache multi-TJ **sem TTL** pode somar **GB** sozinho.

### Regras de escala (obrigatórias no roadmap)

- [ ] **Cache ≠ base curada:** scrape só sobe para `base_conhecimento` após validador / curadoria  
- [ ] **TTL** em `juris_scrape_cache` (ex. 30–90 dias); **nunca** guardar HTML bruto  
- [ ] Um cache por tribunal, mesma higiene do TJSP (ementa + CNJ)  
- [ ] Monitorar banner de disco no `/admin` a cada lote grande / novo tribunal  

### Estratégia de conteúdo

- Lotes **5–56** cobrem catálogo FACTO + reforço + recortes (marítimo, ECA, CVM, STF, etc.) — **prontos no código**; na base de verdade: lotes **1–8**.  
- Prioridade de seed quando a cota abrir: **5→6→7–10** (núcleo produto) → **31–40** (reforço) → **41–56** (recortes) conforme interesse.  
- Worker Chromium: ligar com **núcleo sólido** (não esperar “base completa”); papel = temas frios / atualização, não muleta do RAG.

---

## Assinatura / CDC (art. 49)

- [ ] Definir política dos **7 dias de arrependimento** vs uso de cota (A/B/C).

## PLANO X — pacote comercial + unit economics (fechado 14/08)

Nome interno do pacote alinhado em 12/08. **Código da leva B/E/G/H/I/J/N no repo (14/08).** A só quando avisar “vou começar a vender”.  
Rodar no SQL Editor: `supabase/migration-extras-analises.sql`. Completo Anual **permanece R$ 1.890** (link MP já está nesse valor).  
Posicionamento: **JEC = leigo/sem OAB**; motor de caixa = **Completo + Pro** (advogados).

**Lembrete A:** quando o usuário disser que vai **começar a vender**, lembrar de assinar **Supabase Pro** (e confirmar Gemini paygo / Resend / MP).

### Infra para vender (fixo ~R$ 600)

| Assinar agora | Adiar |
|---------------|--------|
| Supabase **Pro** (~US$ 25) **quando for vender**, Gemini **pay-as-you-go** (Flash), Resend, Mercado Pago, domínio | Worker multi-TJ dedicado, 2º LLM, Faixa C |
| Vercel: Hobby ok no início; Pro se limite doer | |

### Cotas e extras (PLANO X — fechado)

| Recurso | JEC | Completo | Pro |
|---------|-----|----------|-----|
| Peças/mês | 40 | 100 | 180 |
| Análises/mês | **10** | **30** | **50** |
| Juris **externa**/mês | 15 | 15 | 15 |
| Anuais | **100 / 180** (= mensal) | | |

- UI: saldo de peças **e** análises.
- Pacote **+10 análises: R$ 29,90**. Sem pacote +30 nesta leva.
- Peças extras: **manter** +50 R$ 49,90 (R$ 1,00) · +100 R$ 89,90 (R$ 0,90).
- Flash + base curada; **além do lote 56**, depois **outros TJs** no mesmo parâmetro (API/seed, não scrape cego).
- Análise de autos: Gemini Flash pago + cotas.

### Jurisprudências.ai (estratégia PLANO X)

1. **Fase seed:** assinar / usar cota para inflar `base_conhecimento` (lotes 5–56+ e TJs da API).  
2. **Depois:** cancelar plano cheio; **7 backups** só fallback.  
3. **Runtime:** retrieve na base primeiro; API externa só fallback (cota 15).  
4. **Botão “só base curada”** — **nesta leva:** juris/súmula/lei **sem** API externa nem scrape. **Não consome as 15.** Custo: embedding da query + Postgres. Sem teto comercial; rate-limit anti-abuso se martelar. Copy: não usa a cota de tribunais. Busca externa (até 3 TJs) continua gastando 1–3 da cota.

### Anuais (PLANO X)

| Plano | Preço | Peças/mês | Notas |
|-------|-------|-----------|--------|
| Completo Anual | **R$ 1.890/ano** | **100** | ≈ R$ 157,50/mês |
| Pro Anual | R$ 2.990/ano | **180** | |
| Parcelamento MP | **manter como está** | | |

### Checklist ok

| # | Item | Status |
|---|------|--------|
| A | Infra ~R$ 600 (Supabase Pro + Gemini + Resend + MP) | **ok quando for vender** (lembrar) |
| B | Análises 10/30/50 + saldo UI | **código 14/08** |
| C | Flash + base além do 56 + depois outros TJs | **ok** |
| D | Peças extras **manter** R$ 1,00 / R$ 0,90 | **ok** |
| E | +10 análises R$ 29,90 | **código 14/08** |
| F | +30 análises | **agora não** |
| G | Completo Anual **1.890** · Pro Anual 2.990 | **código** (1.990 revertido; MP já em 1.890) |
| H | Cotas anuais = mensais (100 / 180) | **código 14/08** |
| I | Copy JEC = leigo; destaque Completo/Pro | **código 14/08** |
| J | Juris 15/mês (fallback API) | **já estava + copy** |
| N | Botão busca **só base curada** (ilimitada vs cota 15) | **código 14/08** |
| K | Parcelamento anual: manter | **decidido** |
| L | Juris.ai: seed → cancelar; 7 backups fallback | **decidido** |
| M | Análise autos: Flash pago | **decidido** |

Implementação da leva: **feita 14/08** (B, E, G, H, I, J, N). A só quando avisar “vou começar a vender”. D/F/K/L/M já fechados (D = manter extras; F = sem +30).

---

## Preços (referência)

| Plano | Preço | Peças/mês | ≈/peça | Análises/mês |
|-------|-------|-----------|--------|----------------|
| JEC | R$ 79,90/mês | 40 | R$ 2,00 | **10** |
| Completo | R$ 189,90/mês | 100 | R$ 1,90 | **30** |
| Completo Anual | **R$ 1.890/ano** | **100** | ≈ R$ 1,58 | **30** |
| Pro | R$ 289,90/mês | 180 | R$ 1,61 | **50** |
| Pro Anual | R$ 2.990/ano | **180** | ≈ R$ 1,38 | **50** |
| Extra +50 / +100 | R$ 49,90 / 89,90 | — | R$ 1,00 / 0,90 | — |
| Extra +10 análises (meta) | R$ 29,90 | — | ≈ R$ 2,99/análise | — |

- Juris externa: **15/mês** por usuário (`JURIS_BUSCAS_POR_USUARIO_MES`); até 3 tribunais/busca (1 cota cada). Igual p/ todos os planos.
- Legados (webhook): 1.819,04 · 2.956,98 · demais em `PRECOS_LEADOS`.

## Unit economics (alinhado 12/08)

Precificação **ok** para Faixa A (Flash + base curada + cotas). Meta operacional: **≥40% lucro líquido** com escala — **não** “com qualquer nº de clientes” (fixo dilui só com volume).

### Premissas de custo

| Item | Valor |
|------|-------|
| Fixo Faixa A (piso) | **~R$ 800/mês** (Supabase/Vercel/worker/e-mail) |
| MP | **~5%** da receita |
| Peça (Gemini + buffer) | **~R$ 0,27** (`custo-gemini-pecas.ts` ~R$ 0,11 × ~2,5) |
| Análise PDF | **~R$ 0,80** (código ~R$ 0,07; PDF real bem maior) |
| Juris API | **~R$ 0,40**/chamada |
| Stress | peça ~R$ 0,43 · análise ~R$ 1,50 |

### Margem de contribuição (1 cliente; sem fixo)

*Realista* ≈ 50% peças/análises + 6 juris · *Cota cheia* = tetos 10/30/50 + 15 juris.

| Plano | Realista | Cota cheia | Stress |
|-------|----------|------------|--------|
| JEC | ~80% | ~64% | ~47% |
| Completo | ~80% | ~65% | ~45% |
| Pro | ~79% | ~62% | ~40% |

Se contribuição &lt; 40–50% (stress), **não** dá meta líquida em escala nenhuma.

### Lucro líquido — mix 50% JEC · 30% Completo · 20% Pro + fixo R$ 800

| Clientes | Realista | Cota cheia |
|----------|----------|------------|
| **5** | **vermelho** (~−R$ 70) — variável ok; **fixo não cobre** | vermelho (~−R$ 220) |
| **8–10** | **paga fixo + variável**; lucro ~R$ 220–430 · margem **~17–28%** (&lt;40%) | 10 clientes ainda no azul (~+R$ 190 · ~12%) |
| **~15** | **~47%** líquido (meta 40% ok) | ~31% |
| **~20–25** | &gt;50% | **~40%** na cota cheia |
| **50+** | ~69%+ | ~53%+ |

- **Só JEC:** 5 ou 10 assinaturas **não** pagam o fixo (~R$ 800); precisa mix Completo/Pro ou ~12+ JEC.
- Variável por peça/análise **não** é o problema em 5–10 — o gargalo é o **piso fixo**.
- Meta **50%** líquido: ~20 clientes uso realista / ~50 cota cheia. Meta **40%**: mais cedo (~15 realista / ~25 cheia).
- Faixa B/C (“quase Harvey”) **não** cabe neste preço — outro ticket/volume.

### Serviços / faixas (lembrete)

| Faixa | Escopo | Orçamento ordem |
|-------|--------|-----------------|
| **A** (agora) | Gemini Flash, Supabase, Resend, MP, worker TJSP pontual, juris com cota | fixo ~R$ 600–1.000 + variável |
| **B** | + multi-TJ sério, mais volume IA | sobe com clientes; exige Pro + TTL |
| **C** | multi-LLM / enterprise | **fora** da tabela atual |

## Jurisprudência

_Estratégia:_ base curada primeiro (lotes 5–56); worker multi-TJ como complemento — detalhes e disco na seção **Supabase Free vs Pro**.

- [x] Migration scrape-cache aplicada.
- [x] Aquecer cache JEC (`npm run aquecer:cache-tjsp`) — 15 termos.
- [x] Lote 1 juris na base (`npm run seed:juris-ai-lote`) — ~97 ementas TJSP (temas JEC).
- [x] Lote 2 balanceado autor×réu (`npm run seed:juris-ai-lote-2`) — **+49 insert / 74 update** (11/08); `reindex:embeddings` +49; alguns termos 0 úteis (veículo/juros/vício); 429 parcial no pool.
- [x] Lote 3 multiárea (`npm run seed:juris-ai-lote-3`, 12/08) — **+27 insert / 12 skip**; trabalhista, família, criminal, tributário, administrativo, consumerista, bancário, imobiliário; `reindex` +39.
- [x] Lote 4 multiárea (`npm run seed:juris-ai-lote-4`, 12/08) — **+14 insert**; previdenciário, recuperação, ambiental, saúde suplementar, PAD, erro médico, sucessões, arbitragem; `reindex` +14. STJ rendeu pouco (0 úteis / 429).
- [x] Lote 5 multiárea (`npm run seed:juris-ai-lote-5`, 13/08) — **+44 insert / 0 skip**; improbidade (STJ), licitação, desapropriação, locação/despejo, usucapião, societário; LGPD e bem de família 0 úteis / 429 parcial no pool. `reindex:embeddings` +44.
- [x] Lote 6 multiárea (`npm run seed:juris-ai-lote-6`, 13/08) — **+12 insert / 0 skip**; assédio moral, guarda compartilhada, condomínio, marca; ICMS/lavagem/união estável 0 úteis; **execução 2 termos falharam** (pool 429 no fim). `reindex:embeddings` +12. Retomar execução quando a cota liberar.
- [x] Lote 7 previdenciário (`npm run seed:juris-ai -- 7`, 14/08) — **+5 insert / 0 skip**; STJ rendeu pouco (aposentadoria tempo, rural, pensão); BPC/revisão/auxílio/salário-maternidade 0 úteis; 429 parcial. `reindex:embeddings` +5.
- [x] Lote 8 JECRIM (`npm run seed:juris-ai -- 8`, 14/08) — **+13 insert / 0 skip**; lesão corporal leve e vias de fato; interrompido no último termo (recurso inominado) por 429. `reindex:embeddings` +13.
- [ ] Lotes **9–30 prontos** (`npm run seed:juris-ai -- <N>`). **Lote 9 tentado 14/08:** 0 insert — pool 429 (cota diária esgotada após o lote 8).
- [ ] Lotes **31–56 prontos** — reforço principais (31–40) + recortes (41–52: marítimo, aeronáutico, desportivo, urbanístico, militar, ECA, prev. complementar, CVM, energia/telecom, conselhos, processo do trabalho, STF) + reforço rasos (53–56).
- [ ] Após cada lote: `npm run reindex:embeddings`.
- [ ] Reaquecer cache TJSP (`npm run aquecer:cache-tjsp`) — 14/08 cache vazio; scrape 0/15 (captcha). Base_conhecimento intacta.
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

- [ ] STJ · TJRJ · TJMG · STF · TST · demais TJs — **só após Supabase Pro** + TTL de cache (ver seção acima)
- [ ] Não promover scrape bruto à `base_conhecimento` sem validador/curadoria

## Infra / ops

- [ ] Worker Chromium + observabilidade por tribunal (Pro + TTL).
- [x] Reindex embeddings.
- [x] `migration-juris-scrape-cache.sql` aplicada + cache aquecido (15 termos).
- [ ] Worker Chromium TJSP (temas frios em prod).
- [ ] TTL / limpeza periódica `juris_scrape_cache`.
- [ ] Assinar Supabase Pro antes de multi-TJ / volume grande de seeds (ver seção Free vs Pro).
- [x] Teste de e-mails compra falsa em `/admin/emails` — **ok 12/08** (Resend Delivered + ntfy; ver `resendId` no log).
- [x] Links MP anuais → **1890** e **2990** (painel MP, 12/08).
- [x] Alerta compra ntfy (`NTFY_TOPIC`) + migration `alerta_sms_compra`; **push ok** no teste admin (12/08).
- [x] Resend (12/08): domínio verificado; `resendId` no log; reenvio **forçar**; aviso interno de `noreply@`; labels interno/cliente no admin.
- [ ] Webhook Resend (bounce/delivery) → atualizar `email_eventos` (opcional; hoje conferir no dashboard Resend).
- [ ] Obsidian: implementar `sync:obsidian` só quando curadoria doer (ver item 13 e spec).
