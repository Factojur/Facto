# Pendências de produto (FACTO)

Lista viva — itens alinhados em conversa, ainda sem implementação fechada ou só parcialmente feitos.

Fila de melhorias inspirada no MinutaIA (ordem de aplicação, sem misturar seed/ops): [`MELHORIAS.md`](./MELHORIAS.md).

**Juris / seed:** depois de cada lote ou dia de cota, atualizar a seção **Lacunas da base (áreas falhas)** abaixo — tribunal errado, 0 insert, ou API sem aquele tribunal. Não deixar falha só no chat.

## Retomar quando voltar (24/08)

### Sequência agora (competir com MinutaIA sem dispersar)

Ordem fechada 24/08: **receita + lastro + confiança na peça** antes de marketing pesado. Manus e Obsidian **adiados** (ver P3 / decisões abaixo).

1. **Compra real MP** ponta a ponta (JEC ou Completo) — webhook + e-mail + convite só sem perfil + login upgrade.
2. **Vercel** — `ANTHROPIC_API_KEY` + Gemini **paygo**; conferir `MERCADOPAGO_WEBHOOK_SECRET` e `CRON_SECRET`.
3. **Seed** — `proximoLote` **329** / `ate` **683** (reconciliado 24/08; drift 366 sem evidência). `npm run seed:juris-diario` na próxima cota; **sem lotes novos** até 683; TRE/TSE = 2ª API depois.
4. **Smoke live** — `npm run test:smoke-areas-lastro` + 1 peça real Constitucional e 1 Previdenciário com “Buscar na base FACTO”.
5. **Diferenciação P1 (próximas features de código):** (a) histórico de minutas na nuvem (todas as áreas); (b) réplica a partir da contestação anexada; (c) alerta fatos × pedidos; (d) checklist de protocolo por tribunal.
6. **LGPD** — aviso memória local; termo antes de sync nuvem (cliente / histórico).
7. **Escritório / Asaas** — só depois de seats + gateway; até lá = fale conosco.

**Adiado de propósito (não abrir agora):**
- **Manus** — sem conta no produto; sem insert em juris. Se um dia usar: só ops (termos de lote / briefing 2ª API), nunca lastro nem peça. Playbook no repo só quando a fila de lacunas doer de verdade.
- **Obsidian** — sem sync, sem export vault no app. Spec já em `docs/obsidian-sync-spec.md`. Entrar só quando curadoria manual doer (P3).

### Feito 24/08 — checkup + Escritório off

- [x] Flag `ESCRITORIO_VENDA_ATIVA` — aba/checkout Escritório ocultos (código preservado)
- [x] Landing Escritório = **fale conosco** (mailto + `/suporte?motivo=escritorio`)
- [x] Híbrido/reserva: **não** injeta Lei 9.099 fora do JEC
- [x] Sem Sonnet/Gemini/modelo na UI Equipe FACTO / payload cliente
- [x] Auth/Google/transcrição/ajuste: erros sem jargão de admin/provedor
- [x] Copy: peças (não minutas no trial), Entrada do caso, acervo FACTO sem “Admin → Base”
- [x] Cadastro: `/cadastro` sem token → trial; convite só pós-compra **sem** perfil; e-mail financeiro distingue `temConta`
- [x] Empresarial: espécies **recuperação judicial** + **falência** (Lei 11.101)
- [x] Eleitoral permanece aberto; TRE/TSE via Datajud depois do lastro Juris.ai
- [x] Script `test:smoke-areas-lastro`
- [x] Decisão: **Manus + Obsidian adiados** (ops/curadoria depois; zero código agora)
- [x] Seed: estado **329** reconciliado (366 era drift); PENDENCIAS seed atualizadas
- [x] Testes peça: lote diário **04h** scaffold (0 tokens) — `FACTO-testes-pecas-04h` · 40/dia · `tmp/testes-pecas-scaffold/`

## Testes de peça (scaffold 04h) — 24/08

- **Estimativa IA real (paygo):** 1 peça/área ~**R$ 2** · todas ~183 espécies ~**R$ 20** Flash / ~**R$ 70** com ~15% Sonnet.
- **Agora (sem paygo):** só **scaffold** determinístico — estrutura/rito/polo, **não** qualidade de fundamentação IA.
- Estado: `scripts/testes-pecas-estado.json` · `modo: scaffold` · `porDia: 40` (~5 noites p/ 183) · saída **PDF** forense.
- Tarefa: `FACTO-testes-pecas-04h` · log `scripts/testes-pecas-diario.log`.
- Rodar agora: `npm run test:pecas-diario` · instalar: `powershell -ExecutionPolicy Bypass -File scripts\instalar-tarefa-testes-pecas.ps1`
- Pasta: `tmp/testes-pecas-scaffold/<data>/` — abrir os `.pdf` (Times 12, margens do app).
- Modo IA depois do Gemini paygo: `TESTES_PECAS_MODO=ia` (ainda não gera peça real no script — amostragem manual primeiro).

## Marca INPI (FACTO / FACTOIA) — 24/08

### Já feito
| Marca | Processo | Protocolo | Classe | Status pePI (24/08) |
|-------|----------|-----------|--------|---------------------|
| **FACTO** | **944677347** | **850260390405** | 42 nominativa | **Consta** na base; ficha/RPI ainda sem detalhe público (pré-publicação). Base até 18/08 · RPI 2902 |
| **FACTOIA** | *(nº no recibo — informar)* | **850260430578** | 42 nominativa | Protocolo **não** busca no pePI (só nº de processo). Marca exata 42 ainda **0** (normal se depositado hoje) |

Titular: PF Jefferson · GRU 389 · especificação SaaS/TI. Comprovante FACTO: `…\PROJETO FACTO\INPI\29409172362117530.pdf`

### Situação pePI (consulta 24/08 ~11:05)
- **FACTO 944677347:** pedido **consta**; acompanhar RPI + Meus pedidos (logado).
- **Protocolo 850260430578** (FACTOIA): pePI por “nº processo” → **nenhum resultado** (protocolo ≠ processo).
- Busca exata **FACTOIA** / classe 42 → **0** (ainda não indexado).
- Interpretação: ambos **depositados / em fila**; sem indeferimento visível.

### Próximos registros — ordem
1. Acompanhar **FACTO** + **FACTOIA** (RPI terças; Meus pedidos).
2. Classe **9** — **adiada** (sem app).
3. Logo mista — depois.
4. Classe **45** — evitar (Fatho); se um dia, preferir FACTOIA.
5. Cessão PF → PJ quando houver empresa.

### Pendências marca
- [ ] Anotar **nº do processo FACTOIA** do recibo e-Marcas (não só o protocolo)
- [ ] Logado: Meus pedidos para **944677347** + processo FACTOIA
- [ ] Conferir RPI nas terças até 1ª publicação
- [x] FACTOIA 42 depositado (protocolo 850260430578) — 24/08

## Retomar quando voltar (20/08 — noite)

1. **Supabase** — rodar `migration-sonnet-redacoes.sql` + Google OAuth (`migration-google-oauth-profile.sql` se pendente).
2. **Vercel** — configurar `ANTHROPIC_API_KEY` (e opcional `ANTHROPIC_MODELO_REDACAO=claude-sonnet-4-5`). Sem a chave, Redator fica 100% Flash.
3. **Links MP estáticos** — atualizar Completo/Pro/anuais para R$ 139,90 / 279,90 / 1.399 / 2.799 (checkout API já usa catálogo).
4. **Seed** — lote **222+**.
5. **Compra real MP** ponta a ponta.

### Feito nesta rodada (20/08 — cotas + multi-IA)

- [x] Entrada do caso **sem cota**; só Gerar = 1 peça; pack +10 análises fora do produto
- [x] Preços: Completo **139,90/100** · Pro **279,90/200** · anuais **10×** · extras +50/+100 mantidos
- [x] Juris externa no app = **0** (só base curada)
- [x] Roteador Redator: Flash padrão; Sonnet Completo **12%** / Pro **22%** / JEC **0%** (gatilhos + teto)
- [x] Botão Google na paleta FACTO

## Retomar quando voltar (20/08 — tarde)

1. **Supabase — migrations** trial / tribunal / escritório (se ainda não rodou).
2. **Seed** — lote **222+**.
3. **Compra real MP** ponta a ponta.
4. **Escritório** — checkout MP + convites de assentos.

### Feito nesta rodada (20/08 — QA venda)

- [x] Previdenciário no mapa CPC de scaffold (`ehJusticaComumCpc`)
- [x] `"recurso"` scaffold genérico ≠ `"recurso-inominado"` (normalizador + meta + pedidos)
- [x] Pedidos/competência/fundamentos do scaffold por `areaId` (sem 9.099 fora do JEC)
- [x] `foroLegado` Fazenda / constitucional / STJ
- [x] `dicaEscolha` nas 5 áreas que faltavam
- [x] MS no kit ambiental + informações-MS no administrativo
- [x] Fallback de espécies: não derruba área para lista JEC

## Fila por prioridade — concorrência MinutaIA (19/08; ordem 24/08)

Ordem realista: **receita e lastro primeiro**; diferenciação visível em seguida; **Manus e Obsidian adiados** (não competem com MinutaIA agora).

**Como ganhar do MinutaIA no nosso molde (não clonando chat/skills/web):** peça protocolável + lastro curado + polo/rito corretos + histórico que não some + réplica inteligente + conferência (fatos×pedidos / protocolo). Evitar: gerar por chat, modo curto, busca web na minuta, 2.000 skills.

### P0 — Bloqueio comercial e confiança (fazer antes de escalar marketing)

| # | Item | Status | Por quê |
|---|------|--------|---------|
| 1 | **Compra real MP ponta a ponta** — webhook + e-mail + convite + cadastro + cancelamento CDC | Parcial | Único bloqueio comercial crítico |
| 2 | **Confirmar na Vercel** `MERCADOPAGO_WEBHOOK_SECRET` e `CRON_SECRET` | Falta conferir vars | Segurança já no código |
| 3 | **Seed / lastro** lotes **329–683** + lacunas vitrine + mapa `tribunal`/`area_tags` | Em curso (01h; retomar 329) | “Buscar na base FACTO” fraco = peça fraca |
| 4 | **Testes reais Constitucional + Previdenciário** após lastro | Pendente | Áreas abertas sem validação de usuário |
| 5 | **LGPD — memória de cliente** | Pendente | Aviso na UI: localStorage só no navegador; termo antes de sync na nuvem (ver item P1-2) |
| 6 | **Rodar migrations trial / tribunal / escritório no Supabase** | Pendente (ops) | Código já no repo |

### P1 — Diferenciação vs MinutaIA (impacto alto, escopo médio)

| # | Item | Status | Benefício |
|---|------|--------|-----------|
| 1 | **Perfil FACTO na nuvem** — tom + 2–3 peças modelo → resumo de estilo no prompt | Parcial (MVP em Perfil) | Interpreta estilo, não cola texto |
| 2 | **Memória de cliente na nuvem** (Supabase, opt-in) | Pendente | Mesmo cliente em outro PC; hoje só `localStorage` |
| 3 | **Histórico de minutas na nuvem** — todas as áreas, não só JEC local | Parcial (JEC local + versões sessão) | Não perder trabalho ao trocar máquina |
| 4 | **Réplica a partir da contestação anexada** — detectar argumentos do réu e pré-montar contra-argumentos | Pendente | Automatização forte; MinutaIA não faz bem |
| 5 | **Checklist de protocolo por tribunal** (TJSP, TRT, etc.) pós-geração | Pendente | Reduz erro de protocolo |
| 6 | **Alerta contradição fatos × pedidos** (valor, obrigação, parte) | Pendente | Conferência antes de gerar |
| 7 | **Citação rastreável** — distinguir base FACTO vs anexo no auditor | Parcial (página no anexo ok) | Credibilidade forense |
| 8 | **Prazo com feriados** (calendário BR por comarca/tribunal) | Pendente | Hoje só dias úteis seg–sex |
| 9 | **Polo enxuto** — radios só em “Ambos os polos” + inferência | Feito (`9daa804`) | Dashboard mais limpa |
| 10 | **Polo obrigatório** antes de Gerar quando espécie é ambígua | Feito | Evita recurso do réu sair como autor |
| 11 | **Trial grátis** — 1 área · 2 peças · 7 dias · watermark | Feito (MVP 20/08) | Conversão sem cartão |
| 12 | **Escritório S/M** — seats + pool + OAB admin | Parcial (catálogo + schema; checkout MP depois) | Multi-assento |

### P2 — Automação e polish (depois do P1)

| # | Item | Status |
|---|------|--------|
| 1 | **Consulta processual por CNJ** (MNI/Datajud quando disponível) — partes e andamentos | Pendente |
| 2 | **Jurisprudência com ementa expandível** no preview | Pendente |
| 3 | **Versão 2 da peça** — mesma espécie, fundamentação alternativa (2ª geração = cota) | Parcial (versões sessão leves; alternativa de tese ainda não) |
| 4 | **Modelo de honorários** sugerido por valor da causa e espécie | Pendente |
| 5 | **Histórico estendido** — export DOCX já existe; melhorar UX de reabrir em todas áreas | Parcial |
| 6 | **Validação OAB real por UF** | Mock até testes fecharem |
| 7 | **Análise de autos PDF** — smoke em produção JEC | Pendente |
| 8 | **Dual-track seed** histórico + rolling 30 dias | Adiado (~30–35k / pré-06/09) |

### P3 — Longo prazo (só com MRR / demanda clara) — **Manus e Obsidian aqui**

| # | Item | Nota |
|---|------|------|
| 1 | **Export “vault FACTO”** — pasta Markdown compatível com Obsidian | **Adiado 24/08.** Só quando curadoria doer; spec em `docs/obsidian-sync-spec.md` |
| 2 | **Plugin Obsidian** / sync `aprovado` → `base_conhecimento` | **Adiado 24/08.** Nunca misturar rascunho do vault com seed da API |
| 3 | **Manus (ops)** — playbook: termos de lote / briefing 2ª API | **Adiado 24/08.** Fora do app; sem insert de juris; sem peça de cliente |
| 4 | **Extensão PJe / e-SAJ** | Custo de suporte alto |
| 5 | **Segunda API juris** — TRE/TSE, TRF1/2/5/6, TNU | Depois do seed atual (Datajud) |
| 6 | **Biblioteca de normas** (canal separado de juris) | Decisão 15/08: não misturar com peça |
| 7 | **Recursos STJ/STF/ TST** — espécies superiores além do kit atual | Ver seção recursos superiores abaixo |
| 8 | **Produto para juiz / MP / defensoria** | Fora do escopo FACTO (advogado e causa própria JEC) |

### Feito nesta rodada (19/08 — noite, `9daa804`)

- [x] Polo condicional + badge informativo
- [x] Falar: ícone microfone, mín. 2 s, máx. 5 min
- [x] CNJ no relato → Comarca
- [x] Dica de prazo estimado (intimação + espécie)
- [x] Memória de cliente **local** (localStorage)


Tarefa Windows `FACTO-seed-juris-01h` · **Ready** · próxima **25/08/2026 01:00**.  
**24/08:** tarefa tentou ~05:51 e **falhou** (`0x800710E0` — sessão/elevação); log **não** atualizou.  
**23/08:** diário avançou até cota no **329** (log: lotes ~294–328 ok; 329 interrompido).  
**Estado reconciliado 24/08 manhã:** `proximoLote` **329** (havia drift local **366** sem headers 330–365 no log — **corrigido**; não pular). `ate` / `LOTE_MAX` **683**. Vencimento **2026-09-13** (pausa ~06/09). Pool: **7 contas**.

Retomar: `npm run seed:juris-diario` (na próxima cota) ou `npx tsx scripts/seed-juris-ai-faixa.ts 329 683`. **Não criar lotes novos** até esgotar 683; lacunas TRE/TSE → 2ª API depois.

**18/08 (noite):** pack imobiliário 149/157/165/173 e demais queries com lei/número ainda na fila 150+ foram enxugadas (lei/número zera a API). A partir de **201**: lacunas (STF constitucional, TRF prev, TST, CARF, retomas) **antes** do volume 10 TJs; **+10 packs vitrine** (JEC/digital/médico/JECR/amb/trab/fam/prev) após ~227.

**Vencimento Jurisprudências.ai: 13/09/2026.** Pausa automática a partir de **06/09** (última semana para pontos fracos). Inflação: madrugadas até **05/09**.

Fila: lotes **329–683**. Cada madrugada usa as **7 contas** até 429 e reindexa.

PC ligado, sem dormir. Notebook: o instalador da tarefa **permite** rodar na bateria; ainda assim prefira **na tomada** na madrugada. Se a tarefa falhar de novo com `0x800710E0`, rodar manual o diário logado.

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

## Feito nesta sessão (18/08 — noite)

- [x] Seed pronto para **19/08 01h**: `proximoLote` **149**, pool **7**, `LOTE_MAX` **673**, tarefa `FACTO-seed-juris-01h` (próxima 01:00; bateria liberada; PC sem suspender).
- [x] Queries com lei/número ainda na fila 150+ enxugadas (penal, improbidade, LC 64/116, distrato).
- [x] Reindex 18/08 noite tentado: Gemini embedding **429** — abortado para não competir com as 01h. O diário reindexa no fim.

## Feito nesta sessão (18/08 — manhã)

- [x] Seed 01h **18/08**: lote **149** (cota); próximo **149**. Reindex da madrugada pode ter sido cortado (`^C` no log).
- [x] Conferência de peças: `npm run test:pecas` (qualificação + casos-ouro + formatação).
- [x] **Reconvenção / pedido contraposto** como **checkbox na Contestação** (não espécie no seletor):
  - JEC: pedido contraposto, art. 31 da Lei 9.099/95.
  - Civil, Consumidor, Família, Imobiliário: reconvenção, art. 343 do CPC.
  - Danos morais / tutela continuam c/c, inclusive **dentro** do pedido do réu se ele também pedir.
- [x] Performance dashboard/base de conhecimento já em produção (`029c628`, 17/08 noite).

## Feito nesta sessão (17/08 — manhã)

- [x] Confirmado seed diário **01h** de 17/08: lotes **84–115** + reindex **+1607**; cota no **116**.
- [x] `scripts/seed-juris-estado.json` → `proximoLote: 116` commitado.
- [x] Build produção ok (`/dashboard/constitucional` e demais rotas).
- [x] Site [factoia.com.br](https://factoia.com.br) no ar (landing + planos JEC/Completo/Pro).
- [x] Push `main` **c07df56** (estado seed + pendências Constitucional). Constitucional já estava em **4ce5bd6**.

## Feito nesta sessão (15/08) — dashboard / minuta

- [x] Menu do usuário: ícones 2D traço dourado (não emoji); sair em vermelho.
- [x] Ilustrações das áreas: traço fino, um objeto por rito (JECRIM ≠ JEC).
- [x] Contrato compartilhado da minuta (`minuta-modulo.ts`, checklist de protocolo base, já qualificado com IDs de inicial por área). JEC passou a usar o contrato.
- [x] Sequência de abertura das demais áreas na pendência + `abertura-areas.ts` (ainda **não** implementar Consumidor).
- [x] Preview interno só `admin@facto.com` (`/dashboard/preview/<id>`). `jec@facto.com` vê só JEC leigo; `factoassessoria.jur@gmail.com` vê Completo de advogado. Cotas ilimitadas nas três; `/admin` só o admin.

## Abertura de áreas (atualizado 17/08)

**Parou em Constitucional (16/08):** módulo no ar com 30 espécies auditadas. Demais áreas do catálogo também estão **`available: true`** com rota `/dashboard/<area>` (exceto **Contratual**, fora da grade).

**O que ainda falta por área (não é “ligar card”):** lastro dedicado na base, casos-ouro/smoke, testes reais do usuário e espécies opcionais (ver Constitucional abaixo e recursos superiores).

**Preview interno** continua em `/dashboard/preview/<id>` para admins.

Checklist **por área** antes de considerar área “fechada” para cliente exigente:

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

**Catálogo (16/08):** áreas com rota próprias `available: true` (Completo/Pro + OAB). **Contratual** saiu da grade; teaser **Contratos — em breve** na home. Litígio de contrato: Civil. Plano JEC e leigo: só JEC. Eleitoral aberto; lastro TRE/TSE depois (Datajud ou manual).

**Preview interno** ainda existe em `/dashboard/preview/<id>` para e-mails admin.

**Varredura de produto (15/08, tarde):** rito, espécies, polos, endereçamento, JG/MLE, checklist e análise alinhados. Lastro de juris segue no seed diário.

**Testes de qualidade da peça (16/08+):** gerar peças reais nas áreas abertas. Anotar falhas de rito/endereçamento/formatação aqui — não tratar como “só lastro”. **Próximo foco:** Constitucional.

1. **Consumidor** — _produção 16/08+_ — `available: true`; falta lastro forte + testes reais.
2. **Civil** — _produção_ — idem.
3. **Trabalhista** — _produção_ — idem; lotes TST na fila seed.
4. **Família** — _produção_ — idem.
5. **Imobiliário** — _produção_ — idem.
6. **JECRIM** — _produção_.
7. **Penal comum** — _produção_.
8. **Previdenciário** — _produção_ — lastro TRF ainda fraco.
9. **Tributário / administrativo** — _produção_.
10. **Empresarial** — _produção_.
11. **Digital, ambiental, PI, internacional, médico, agrário** — _produção_.
12. **Eleitoral** — _produção_ — lastro TRE/TSE **depois** (API sem TRE/TSE).
13. **Constitucional** — _produção 16/08_ — **parada atual**; ver pendências abaixo.

### Constitucional — no ar vs. pendente (16/08)

**No ar (produção Ready):** rota `/dashboard/constitucional`; `available: true` (Completo/Pro + OAB); kit com **30** espécies (polo ativo + passivo); rito/endereçamento STF; sem MLE; auditoria Gemini das 30 ok.

**Ainda não está no ar / falta fechar:**

- [ ] **Lastro próprio da área** — lotes **201–205** (STF remédios/RE/ADI/ADPF + STJ MS/ROC) e **196** na fila seed; ainda não rodaram. Testar retrieve depois desses lotes.
- [ ] **Casos-ouro / smoke Constitucional** — suíte dedicada (MS, RE, ADI/ADPF, informações em MS, contrarrazões ao RE) além do genérico.
- [ ] **Espécies opcionais** (fora do kit atual de 30):
  - [ ] ADI / ADC / ADO **estadual** (controle concentrado no TJ)
  - [ ] Suspensão de liminar / suspensão de segurança (SL/SS)
  - [ ] Amicus curiae / memorial de terceiro
  - [ ] Contrarrazões ao **agravo em RE** (hoje há contrarrazões ao RE e ao ROC)
  - [ ] Informações em **habeas corpus** (autoridade coatora)
  - [ ] ACP com ênfase constitucional (hoje mais Ambiental/Administrativo)

Não misturar com “módulo morto”: a área **já gera minuta**. O que falta é lastro forte + espécies opcionais acima.

Sobreposição (dica nos cards 16/08): consumidor × JEC × civil × médico; empresarial × civil. Contratos (minutas) não competem com essas áreas.

Prazos: o FACTO **não conta prazo processual sozinho** hoje. Abrir área implica pelo menos **avisar o prazo típico da espécie** (copy + Assistente), não um calendário jurídico completo na v1.

---

## Prioridade sugerida (próximos passos)

0. **[P0] Seed juris** — _em dia 18/08 noite_ — até o lote **148** na base; retoma **149** em **19/08 01h**. Fila até **673**. Atualizar **Lacunas da base** se algum lote vier vazio.

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
12. **[P2] Expandir áreas** — _catálogo aberto 16/08_; **parada em Constitucional**. Próximo: lastro + testes reais + espécies opcionais (Constitucional) e lacunas da base.
13. **[P3] Obsidian → `base_conhecimento` (sync)** — _especificado; **adiado 24/08**_
    - Spec: `docs/obsidian-sync-spec.md` · template: `docs/obsidian-templates/exemplo-juris.md`
    - Agora: alimentar base via admin/seeds; Obsidian só como notas pessoais se quiser (sem sync)
    - Depois (quando curadoria doer): script `sync:obsidian` (só `status: aprovado`) + reindex
    - **Manus:** também adiado — ops (termos/lote) no máximo; nunca insert de juris nem peça
    - [ ] Implementar sync v1 (dry-run + `--write`)
    - [ ] (Opcional) export fila `juris_verificacao` → Markdown
14. **[P3] Depois do núcleo da minuta** — _não neste deploy (16/08)_
   - **Chat multi-turno:** **sim, beneficia** o advogado (iterar tese sem recomeçar). **Não aplicar agora:** custa token, aumenta risco de inventar fato, e as áreas recém-abertas ainda vão ser testadas. Fica para depois do núcleo estável.
   - **Add-in Word:** melhoria de canal. Não implementar nesta fase.
   - **Contratos (minutas, não petição):** teaser na home (“Contratos — em breve”). **Decidir depois** quais modelos (poucos, de uso real: prestação de serviços, NDA, locação, distrato — não 40 templates genéricos). Canal apartado das áreas; Completo/Pro + OAB. Litígio de contrato permanece no Civil. Não implementar a biblioteca agora.
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

## PLANO X — pacote comercial + unit economics (atualizado 20/08)

Nome interno do pacote alinhado em 12/08. **Revisão comercial 20/08** (código no repo):

| Plano | Preço | Peças/mês | ≈/peça | Análises | Sonnet Redator |
|-------|-------|-----------|--------|----------|----------------|
| JEC | R$ 79,90 | 40 | R$ 2,00 | **0** (Entrada livre) | **0%** |
| Completo | **R$ 139,90** | **100** | **R$ 1,40** | 0 | **até 12%** |
| Completo Anual | **R$ 1.399** (10×) | 100 | ≈ R$ 1,17 | 0 | 12% |
| Pro | **R$ 279,90** | **200** | **R$ 1,40** | 0 | **até 22%** |
| Pro Anual | **R$ 2.799** (10×) | 200 | ≈ R$ 1,17 | 0 | 22% |
| Extra +50 / +100 | R$ 49,90 / 89,90 | — | R$ 1,00 / 0,90 | — | Flash (mesmos gatilhos se plano elegível) |

- Unidade comercial: **peças** (não créditos / minutas).
- Entrada do caso **não consome cota**; só **Gerar peça**.
- Juris externa no produto: **desligada** (seed Jurisprudências.ai continua).
- Multi-IA: Analista Flash-Lite · Redator Flash padrão · Sonnet se gatilho + teto · sem GPT nesta leva.
- Extras **não acumulam** para o próximo mês (`ciclo` YYYY-MM).
- Migration: `supabase/migration-sonnet-redacoes.sql`.
- Ops: `ANTHROPIC_API_KEY` na Vercel (você cria a conta Anthropic Console e cola a chave — o agente não cria conta por você).

### Stress 30 clientes · cota cheia · mix 10/10/10 (20/08)

Premissas: peça Flash **R$ 0,27** · peça c/ Sonnet redator **R$ 0,90** (triagem Flash + Sonnet + buffer) · MP **5%** · fixo Faixa A **R$ 800** · Entrada livre no produto (custo Gemini da Entrada **não** incluso nesta tabela — se cada peça tiver 1 Entrada PDF ~R$ 0,40, some ~R$ 1.360).

| | Peças/mês | Sonnet máx. | Receita | Custo IA peças | MP 5% | Fixo | **Custo total** | **Lucro** | **Margem** |
|---|-----------|-------------|---------|----------------|-------|------|-----------------|-----------|------------|
| 10× JEC | 400 | 0 | 799,00 | 108,00 | | | | | |
| 10× Completo | 1.000 | 120 (12%) | 1.399,00 | 345,60 | | | | | |
| 10× Pro | 2.000 | 440 (22%) | 2.799,00 | 817,20 | | | | | |
| **Total** | **3.400** | **560** | **R$ 4.997,00** | **R$ 1.270,80** | **R$ 249,85** | **R$ 800** | **R$ 2.320,65** | **R$ 2.676,35** | **~53,6%** |

Contribuição média (sem fixo): receita − IA − MP ≈ **R$ 3.476** (~70%). Meta ≥40% líquido **ok** neste cenário de cota cheia.

---

## PLANO X — pacote comercial + unit economics (histórico 14/08)

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

### Jurisprudências.ai (estratégia — 19/08, fechada)

1. **Seed (01h):** assinatura Jurisprudências.ai alimenta `base_conhecimento` via scripts — **não** busca ao vivo no app do advogado.
2. **Runtime do usuário:** só **acervo FACTO** + anexos do caso (upload → fila de verificação se não existir na base).
3. **Sem cota de “consulta externa”** no produto — cotas restantes são peças/análises do plano.
4. **Futuro:** API B2B do acervo curado (ativo próprio), não proxy ao vivo.
5. Migration perfil estilo: `supabase/migration-perfil-estilo.sql`.

### Jurisprudências.ai (estratégia PLANO X — histórico)

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
| **Eleitoral** | Lote 22: **0** (TJSP). Lote **63** STJ: **0**. TRE/TSE fora da API. | Lote **207** (STJ REsp / LC 64) na fila **201+**. Segunda API depois. |
| **Constitucional** | Módulo no ar; lastro STF fraco. Lote **196** (STF HC) ainda na fila **177–200**. | Lotes **201–205** (STF remédios/RE/ADI/ADPF + STJ MS/ROC) entram logo após o 200. |
| **Previdenciário** | Lote 7 STJ fraco; lote 36 STJ: **0**. 57–59 e 181–185 na fila. | Reforço **213–216** (TRF3/TRF4, queries novas) em **201+**. |
| **Trabalhista** | Lotes 9 e 32 no TJSP fracos. 60–62 e 177–180 na fila. | Reforço **218–219** (TST) em **201+**. |
| **Tributário** | Lote 64 CARF fraco; lote 77 IPTU TJSP fraco. | **220–224** (CARF + IPTU TJSP/TJMG/TJRJ). LEF segue nos TJs 152/160/168/176. |
| **Digital / LGPD** | Lote 74 STJ fraco. | Lote **206** (STJ, queries curtas). |
| **Conselhos** | Lotes 50 e 79 fracos. | Lote **208**. |
| **Marítimo** | Lote 41 vazio; 78 retoma. | Lote **212**. |
| **Internacional** | Lote 24 +5. | Lote **209** (STJ homologação). Segunda fonte depois. |

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
- [x] Lotes **84–115** (17/08 madrugada) — seed diário 01h; cota 429 no **116**; `reindex` **+1607**.
- [x] Lotes **116–148** (18/08 01h) — diário até o 149; cota 429 no meio do **149** (TJRS imobiliário). Retoma o **149**.
- [x] Lotes **149–328** — avançados nas madrugadas 19–23/08 (ver log); **329** parou por cota **23/08**.
- [ ] Lotes **329–683** — retomar diário / `npx tsx scripts/seed-juris-ai-faixa.ts 329 683`. **Estado 24/08:** `proximoLote` **329** (drift 366 sem evidência — corrigido). `LOTE_MAX` **683**.
- [x] Após seed diário 17/08: `reindex:embeddings` (+1607).
- [ ] Conferir reindex após cada madrugada (diário já chama no fim).
- [ ] Segunda API (pós-683 ou lacunas): priorizar **eleitoral (TRE/TSE)** e TRF1/2/5/6 / TNU. **Não** criar lotes Juris.ai extras só por volume até esgotar 683.
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
- [ ] Obsidian / Manus: **adiados 24/08** — sync/export e playbook Manus só depois de receita + lastro; ver P3.
