# Pendências de produto (FACTO)

Lista viva — itens alinhados em conversa, ainda sem implementação fechada ou só parcialmente feitos.

**Juris / seed:** depois de cada lote ou dia de cota, atualizar a seção **Lacunas da base (áreas falhas)** abaixo — tribunal errado, 0 insert, ou API sem aquele tribunal. Não deixar falha só no chat.

## Alerta — seed automático 01h (16/08)

Tarefa Windows `FACTO-seed-juris-01h` reinstalada (`npx --yes`). Próxima: **17/08/2026 01:00**.

**Vencimento Jurisprudências.ai: 13/09/2026.** Pausa automática a partir de **06/09** (última semana para pontos fracos). Inflação: madrugadas **17/08–05/09**.

Fila: lotes **84–646**. Cada madrugada usa as **7 contas** até 429 e reindexa.

PC ligado, sem dormir; se for notebook, **na tomada** (a tarefa não inicia em bateria).

Tribunais da API: `stf stj tst trf3 trf4 tjce tjgo tjma tjmg tjmt tjpr tjrj tjrs tjsc tjsp carf`. Sem TSE, TRE, TRF1/2/5/6, TNU.

### Códigos e leis na base (decisão 15/08; confirmado 16/08)

**Não manter “Lei” no mesmo saco da peça.** A categoria Lei no admin da `base_conhecimento` é inútil como lastro de citação: o retrieve mistura artigo com acórdão e o modelo cola lei. Já houve CF inteira vazando em busca genérica. Contagem 16/08: **0** itens em Lei; súmula e juris são o que a minuta usa.

**Agora:** Gemini interpreta CPC, CC, CLT, CPP, CDC (e o rito em `area-rito.ts`). Não criar a “outra página” de códigos ainda.

**Futuro (não é a fila):** canal separado — página admin tipo biblioteca de normas / `<NORMA_DE_CONSULTA>` — só cérebro (calibrar tese, **não transcrever** na peça, **não** ir para `juris_verificacao`). Distinto de Súmula + Jurisprudência.

**UI (16/08):** categoria **Lei** retirada do admin e do retrieve da peça. Gemini + `area-rito.ts` cobrem o código. **Não é certeza** criar a biblioteca depois.

### Depois de 97–200

- Segunda API: TRE/TSE (eleitoral) e TRF1/2/5/6 / TNU se previdenciário ainda falhar.
- Scrape TJSP: só com Supabase Pro e validador; não promover cache bruto.

---

## Skills Cursor (15/08)

Só para o agente no Cursor — **o cliente não vê**.

- [x] `facto-peca` — minuta, abas, já qualificado, JG/MLE, provas, justificado (regras gerais + JEC hoje).
- [x] `facto-juris-seed` — lotes, 429, reindex, o que não commitar.
- [x] Regra Cursor `jec-base-dashboard` — mudança genérica na dashboard JEC replica nas outras áreas.
- [ ] **`facto-ship`** (quando fizer falta): o que entra no `main`/Vercel, copy PT-BR, convite pós-pagamento, cotas, não misturar seed/diag no deploy. Não implementar agora.

## Feito nesta sessão (15/08) — dashboard / minuta

- [x] Menu do usuário: ícones 2D traço dourado (não emoji); sair em vermelho.
- [x] Ilustrações das áreas: traço fino, um objeto por rito (JECRIM ≠ JEC).
- [x] Contrato compartilhado da minuta (`minuta-modulo.ts`, checklist de protocolo base, já qualificado com IDs de inicial por área). JEC passou a usar o contrato.
- [x] Sequência de abertura das demais áreas na pendência + `abertura-areas.ts` (ainda **não** implementar Consumidor).
- [x] Preview interno só `admin@facto.com` e `factoassessoria.jur@gmail.com` (`/dashboard/preview/<id>`). Catálogo público continua `available: false` (exceto JEC).

## Abertura de áreas (auditoria 15/08) — **não estão prontas para ligar**

Hoje **só o JEC** tem produto: rota `/dashboard/jec`, formulário, espécies, teto leigo, análise de autos, Assistente, lastro no fluxo real.

O catálogo (`AREAS_ATUACAO`) + ilustração + tags + **casos-ouro** (teste de lastro, 0 tokens) **não** são módulo. Ligar `available: true` sem o restante gera Completo/Pro caindo num card morto (sem `href`, exceto JEC).

**Contrato compartilhado (15/08):** `src/lib/minuta-modulo.ts` + `docs-conferencia-protocolo.ts` + regra Cursor `jec-base-dashboard`. JEC continua a base; o genérico não fica só no `jec-form`.

**Reaproveitar do JEC (estrutura, todas as áreas):** já qualificado, JG/MLE só texto, provas do fato ≠ protocolo, 3 etapas, justificado, timbre/Gerar no fim, cotas, busca juris.

**Não reaproveitar cego (rito):** espécies 9.099, teto 20 SM, “Juiz de Direito” do Juizado, polos e prazos do JEC, prompt amarrado a `jec-especie-peca.ts`. Cada área ganha tabela própria de peças (ex. penal: resposta à acusação, HC — sem contestação cível). Incluir ou remover campos inúteis àquele rito. Pesquisar leis/códigos da área na implementação.

**Seed vs. dashboard:** independentes por enquanto. Upload/juris não trava o esqueleto; `available` para cliente espera lastro mínimo da área da vez.

Checklist **por área** antes de `available` + `href`:

1. Rota `/dashboard/<area>` + formulário na **estrutura** compartilhada (não clone cego do JEC).
2. Tabela de **espécies do rito** (não copiar contestação/embargos do JEC se o juízo não usa esses nomes).
3. **Endereçamento** certo (JT, JECRIM, JF, TRE, cartório, etc.).
4. **Prazos** no Assistente/checklist (alertar, não protocolar).
5. Polo/qualificação do rito (reclamante, querelante, impetrante, executado…).
6. Prompt + fundamentação (leis/códigos da área) + lastro no tribunal certo.
7. Gate: Completo/Pro + OAB; leigo continua só JEC.
8. Casos-ouro da área com endereçamento **real**.

### Recursos aos tribunais superiores (16/08) — **não implementar agora**

Observação de produto: a formatação de página já é a mesma; **faltam espécies** (esqueleto + endereçamento + título no classificador).

- **JEC:** não criar REsp (Súmula 203 do STJ — não cabe da Turma Recursal). **Sim** Recurso Extraordinário da Turma Recursal (Súmula 640 do STF): STF, prequestionamento, repercussão geral.
- **Justiça comum** (civil, consumidor, família, imobiliário e demais CPC): **REsp (STJ)** e **RE (STF)** depois da apelação. Esqueleto próprio (violação de lei federal / dissídio / prequestionamento; RE + repercussão geral). Endereçamento: Presidência do tribunal de origem (admissibilidade) ou STJ/STF — não vara.
- **Trabalhista:** equivalente é **recurso de revista (TST)**, depois RE. Não copiar REsp.
- **Penal:** RE/REsp excepcionais; kit já tem apelação CPP, RESE, agravo em execução, HC.

O detector de “nome da ação” hoje não trata REsp/RE/RR — se gerar sem isso, o título cai como parágrafo comum.

### Sequência de implementação (área a área)

Fonte viva também em `src/lib/abertura-areas.ts`. Trabalhar **uma de cada vez**; o compartilhado já está no contrato da minuta.

**Catálogo (16/08):** áreas com rota próprias `available: true` (Completo/Pro + OAB). **Contratual** continua fechado (use Civil). Plano JEC e leigo: só JEC. Eleitoral aberto; lastro TRE/TSE depois (Datajud ou manual).

**Preview interno** ainda existe em `/dashboard/preview/<id>` para e-mails admin.

**Varredura de produto (15/08, tarde):** rito, espécies, polos, endereçamento, JG/MLE, checklist e análise alinhados. Lastro de juris segue no seed diário.

**Testes de qualidade da peça (16/08):** o usuário vai gerar peças reais nas áreas recém-abertas. Anotar falhas de rito/endereçamento/formatação aqui — não tratar como “só lastro”.

1. **Consumidor (justiça comum)** — _preview admin (15/08)_ — espécies CPC; Vara Cível; CDC+CPC; sem teto 20 SM e sem recurso inominado. Catálogo `available: false`.
2. **Civil (justiça comum)** — _preview admin (15/08)_ — `/dashboard/civil`; CC+CPC; sem CDC; sem teto 20 SM. Catálogo `available: false`.
3. **Trabalhista** — _preview admin (15/08)_ — `/dashboard/trabalhista`; CLT; reclamante/reclamado; RO 8d. Catálogo `available: false`.
4. **Família** — _preview admin (15/08)_ — `/dashboard/familia`; divórcio, guarda, alimentos, inventário; Vara de Família; segredo de justiça. Catálogo `available: false`.
5. **Imobiliário** — _preview admin (15/08)_ — `/dashboard/imobiliario`; despejo (8.245), usucapião, consignação de aluguéis, condomínio; Vara Cível. **Contratual** permanece tema no Civil. Catálogo `available: false`.
6. **JECRIM** — _preview admin (15/08)_ — `/dashboard/jecr`.
7. **Penal comum** — _preview admin (15/08)_ — `/dashboard/criminal`; HC, resposta à acusação, apelação CPP.
8. **Previdenciário** — _preview admin (15/08)_ — `/dashboard/previdenciario`; JEF/INSS.
9. **Tributário / administrativo** — _preview admin (15/08)_ — LEF/MS.
10. **Empresarial** — _preview admin (15/08)_ — notificação vs. ação.
11. **Digital, ambiental, PI, internacional, médico, agrário** — _preview admin (15/08)_.
12. **Eleitoral** — _aberto no catálogo 16/08_ — lastro TRE/TSE **depois** (consultar Datajud ou ingestão manual). API Jurisprudências.ai não tem TRE/TSE.

Sobreposição a resolver no produto (senão o advogado não sabe onde clicar): **consumidor × JEC × civil × médico**; **contratual × civil × empresarial**.

Prazos: o FACTO **não conta prazo processual sozinho** hoje. Abrir área implica pelo menos **avisar o prazo típico da espécie** (copy + Assistente), não um calendário jurídico completo na v1.

---

## Prioridade sugerida (próximos passos)

0. **[P0] Seed juris** — retomar `npx tsx scripts/seed-juris-ai-faixa.ts 56 64` + reindex. Atualizar **Lacunas da base** se algum lote vier vazio.

1. **[P0] Qualidade da peça JEC (lastro + anti-alucinação)** — _parcial_
   - [x] Anotar jurisprudência sem lastro com `[NÃO ENCONTRADO NA BASE]`
   - [x] Auditor: não marcar `socorre-se` como REsp (falso positivo `re` + hífen) — 14/08
   - [x] Conferência de citações reforçada
   - [x] Suite casos-ouro (`npm run test:casos-ouro` — **0 tokens**): JEC inicial + espécies + **peça completa em todas as áreas** (módulo aberto = JEC; fechadas já prontas)
   - [x] Lastro **não** usa a estratégia da triagem; CNJ/REsp batem número inteiro (não “sopa” de dígitos)
   - [x] Ampliar casos-ouro com peças completas por área (14/08). **Não** basta ligar `available`: falta rito/espécie/prazo/rota (ver **Abertura de áreas** abaixo).

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

4. **[P1] Cadastro — validação OAB real por UF** — _manter mock até o usuário terminar os testes_
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
12. **[P2] Expandir áreas** — _aberto 16/08_ no catálogo (exceto Contratual). Ver testes do usuário.
13. **[P2] Obsidian → `base_conhecimento` (sync)** — _especificado; não implementar ainda_
    - Spec: `docs/obsidian-sync-spec.md` · template: `docs/obsidian-templates/exemplo-juris.md`
    - Agora: alimentar base via admin/seeds; Obsidian só como notas pessoais se quiser
    - Depois (quando curadoria doer): script `sync:obsidian` (só `status: aprovado`) + reindex
    - [ ] Implementar sync v1 (dry-run + `--write`)
    - [ ] (Opcional) export fila `juris_verificacao` → Markdown
14. **[P3] Depois do núcleo da minuta** — _não neste deploy (16/08)_
   - **Chat multi-turno:** **sim, beneficia** o advogado (iterar tese sem recomeçar). **Não aplicar agora:** custa token, aumenta risco de inventar fato, e as áreas recém-abertas ainda vão ser testadas. Fica para depois do núcleo estável.
   - **Add-in Word / contratos:** mesmo — melhoria de canal, não do lastro. Não implementar nesta fase.  
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

_Estratégia:_ esgotar Jurisprudências.ai nos tribunais que ela tem; lacunas (TRE/TSE, TRFs ausentes, TNU…) → **outra API depois**, mesma `base_conhecimento`. Lookup (10 mil) = só ementa, não inteiro teor. Cliente na peça usa a base; lookup some se cancelar o plano.

### Lacunas da base (áreas falhas) — atualizar após cada seed

API **não tem:** TSE, TRE-SP (nem outro TRE), TRF1/2/5/6, TNU, STM. Listagem 14/08: `stf stj tst trf3 trf4 tjce tjgo tjma tjmg tjmt tjpr tjrj tjrs tjsc tjsp carf`.

| Área | Evidência | Status |
|------|-----------|--------|
| **Eleitoral** | Lote 22: **0** insert (TJSP). TRE/TSE fora da API. | Lote **63** pronto (STJ). Segunda API depois. |
| **Previdenciário** | Lote 7 STJ fraco (+5); lote 36 STJ: **0**. | Lotes **57–59** prontos (TRF3/TRF4). |
| **Trabalhista** | Lotes 9 e 32 no TJSP fracos (11+11); muitos termos 0 úteis. | Lotes **60–62** prontos (TST). |
| **Tributário** | Lote 12 +5 (STJ/municipal misturado). Lote **64** (CARF) rendeu pouco (temas de STJ/ITCMD). | Lotes **81** e **96** (CARF IRPJ/CSLL/PIS/multa/ágio). IPTU/ISS: lote **95**. |
| **Internacional** | Lote 24 +5. | Sem tribunal extra na API. Segunda fonte depois. |
| **Lote 56** | Cota 429 (15/08) após 1–55 ok. | Retomar `seed-juris-ai-faixa.ts 56 64`. |

Critério de “falha”: lote com **0** insert, ou &lt;10 insert em tema que deveria ter acórdão no tribunal usado, ou tribunal inexistente na API.

### Seed (progresso)

- [x] Lotes 1–8 (ver histórico abaixo).
- [x] Lotes **9–39** (14/08) — **+770 insert**; `reindex` +770.
- [x] Lotes **40–55** (15/08) — faixa original avançou; **56** 429.
- [x] Lotes **56–64** (16/08) — faixa + reindex; lote 63 (STJ eleitoral) 0 insert.
- [x] Lookup ementas curtas (14/08) — **696** completadas / 356 skip / 0 falha; reindex em seguida.
- [x] Lotes **40–55** (15/08) — faixa rodou; **~180 insert** até o 56 (cota 429 no lote 56). Vazios: 41, 43, 50, 54.
- [x] Lotes **65–80** (16/08) — **+277** insert; vazios/fracos: 74 (LGPD STJ), 77 (IPTU TJSP), 79 (conselhos STJ). Retomas em **94–95**.
- [x] Lotes **81–83** (16/08) — **+139** insert (CARF 55, TJCE 32, TJGO 52). Cota 429 no **84**.
- [ ] Lotes **84–96** — `npx tsx scripts/seed-juris-ai-faixa.ts 84 96`.
- [ ] Lotes **97–200** — prontos no código; depois de 96 o diário segue ou `npx tsx scripts/seed-juris-ai-faixa.ts 97 200` (~1248 consultas, vários dias).
- [ ] Após cada dia de seed: `npm run reindex:embeddings`.
- [ ] Segunda API quando 40–64 fechar: priorizar **eleitoral (TRE/TSE)** e o que ainda estiver na tabela de lacunas.
- [ ] Reaquecer cache TJSP (`npm run aquecer:cache-tjsp`) — 14/08 cache vazio; scrape 0/15 (captcha). Base_conhecimento intacta.
- [ ] **7º token** Jurisprudências.ai — menos urgente com plano pago no `.env.local` (não precisa ir à Vercel se o plano for cancelado pós-seed).
- [ ] Provedor secundário STJ estável em prod.

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
