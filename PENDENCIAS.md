# Pendências de produto (FACTO)

Lista viva — itens alinhados em conversa, ainda sem implementação fechada ou só parcialmente feitos.

**Regra do agente (29/08):** a cada alteração fechada no produto/código/ops, **atualizar esta lista no mesmo turno** (feito, em andamento, próximo passo). Regra Cursor: `.cursor/rules/pendencias-sync.mdc`.

Fila de melhorias inspirada no MinutaIA (ordem de aplicação, sem misturar seed/ops): [`MELHORIAS.md`](./MELHORIAS.md).

## Decisão produto (01/09 noite) — paridade funcional MinutaIA no chat

**Jefferson:** o chat FACTO deve funcionar **igual ao MinutaIA em tudo, exceto layout e cores**. O usuário **não** deve precisar microgerenciar polo, espécie, área e detalhes do caso. **Formatação e entrega da peça pronta** ficam para **depois** de fechar este épico.

### Decisão (02/09) — chat livre; áreas manuais desacopladas

**Produto principal = chat.** Dashboards manuais por área (`/dashboard/jec`, etc.) **permanecem** (rito, espécies, formulário 3 etapas) mas **não travam** o chat: sem chip obrigatório de área/polo, sem bloqueio de Redigir por incoerência leve, IA interpreta o caso como no MinutaIA.

| Camada | Papel |
|--------|--------|
| **Chat** | Intake + interpretação + plano + redação (sensação MinutaIA) |
| **Áreas / módulos** | Catálogo de acesso + esqueleto de rito **depois** da IA escolher; allowlist de produto |
| **Únicas diferenças vs MinutaIA** | Lastro (base FACTO + anexos, sem inventar acórdão) e aparência (glass FACTO) |

Foco de aperfeiçoamento: lastro rastreável, memória de anexo, calibração remédio — pontos em que o MinutaIA falha ou inventa.

### Checklist paridade (chat = MinutaIA; visual = FACTO)

| Dimensão | MinutaIA (referência) | FACTO hoje | Alvo |
|----------|----------------------|------------|------|
| **Entendimento autônomo** | Lê PDF, infere partes, polo, remédio | IA-first + chat livre (sem travas de área/polo) | P0 — manter; calibrar remédio |
| **Conversa fluida** | Poucas perguntas; plano direcionado | Thread enxuto; área/polo auto; avisos só banner | P0 — um fluxo: relato/anexo → entendimento → plano → redigir |
| **Confiança no texto** | Ícones `fls.` no corpo; ✓ em lei/juris | `TextoJuridicoInline` + visualizador PDF na folha (`ChatVisualizadorAnexo`) | P0 — rastreio visível antes de gastar cota |
| **Sidebar de fontes** | Badges (anexos, juris, plugins) | `ChatFontesFlutuante` — tooltips, ativo, pulse, lei municipal | P1 — validar em browser |
| **Memória de anexo** | Não reexplica PDF a cada turno | Memória sessão (commit `3bc7641`); validar em prod | P0 — smoke 2º turno com mesmo PDF |
| **Modos** | Instantâneo / Planejado | Toggle no ar | Manter |
| **Redação** | Streaming no documento | NDJSON `/api/gerar-peca` (`stream: true`) | **Feito** (02/09) |
| **Layout/cores** | UI azul MinutaIA | Glass FACTO | **Não copiar** — só comportamento |

### Fases (ordem fechada)

1. **A — Entendimento e segurança (P0)** — IA interpreta; avisos soft (não bloqueiam); remédio por último ato; área/polo auto; reteste 0006509.
2. **B — Rastreabilidade visível (P0)** — citações `fls.` e ✓ lei inline no plano e na prévia (reusar `pagina-anexo-pdf` + base FACTO); “o que li do PDF” em 1 balão após anexo.
3. **C — Fluidez e fontes (P1)** — streaming turno/plano; coluna fontes (anexos, juris do caso, teses); menos chips no header, mais no fluxo natural do chat.
4. **D — Formatação/entrega da peça** — **adiado** por decisão Jefferson (protocolo, Word/PDF, tipografia final).

**Não fazer neste épico:** clone visual, skills 2k, juris live, reprocessar PDF inteiro a cada turno (margem 35–40%). **Não** religar confirmação obrigatória de área/polo no chat.

### Em andamento (épico paridade)

- [x] **Polo no thread** — `ChatConfirmacaoPolo` no corpo do chat; após confirmar → plano automático
- [x] **Espécie × polo** — calibração transversal (`calibracao-area-especie`, `peca-cabivel-autos`, `polo-advocacia`); MS antes de agravo; exequente ≠ agravo da executada
- [x] **Rastreio inline** — `TextoJuridicoInline` (fls. + ✓ lei) no chat e plano; clique em fls. abre painel de anexos
- [x] **Sidebar fontes** — `ChatFontesFlutuante`: tooltips com nomes, ícone ativo, pulse em novo anexo, lei municipal separada
- [x] **Testes automáticos** — `npm run test:calibracao` (17) + `test:chat-minuta` (77); `tsc --noEmit` ok
- [x] **Reteste 0006509** — `npm run test:caso-0006509 -- --browser` (11 pipeline + 6 checks browser); fix polo capa Exequente×Executada
- [x] **Smoke memória anexo** — `npm run test:smoke-memoria-anexo -- --browser` prod 4/4 (2º turno sem nova entrada-caso)
- [x] **Paridade P0 chat** — visualizador `fls.`; balão único leitura PDF; thread sem prazo/chip área/complementos; alerta fatos×pedidos refinado
- [x] **Deploy produção** — `8771fd4` no ar · fix polo exequente×executada (0006509) · [factoia.com.br](https://factoia.com.br)
- [x] **Reteste manual 0006509** — E2E browser prod 6/6 (Jefferson, exequente, MS, constitucional, sem agravo executada)
- [x] **Alerta fatos×pedidos (chat)** — removido do thread; só painel plano; regras MS/HC/cumprimento + “sem prejuízo de”
- [x] **Área auto ~95%** — refino Flash-Lite só em ambíguo (`inferir-area-refino`, `/api/inferir-area`, sem cota de peça); motivo no header; `test:inferir-area` 5/5
- [x] **Interpretação IA (MinutaIA-style)** — área + espécie via Flash-Lite em todo caso; local = pista/extração; cumprimento+interlocutória → agravo (não força MS); 0006509 recalibrado
- [x] **Lastro no plano (preview)** — `PlanoLastroHint` (ícone i dourado por tópico; hover desktop); texto derivado de cobertura + estratégia (`plano-lastro-hint.ts`)
- [x] **Lastro por tópico A+B** — `LASTRO:`/`ENCAIXE:` na triagem + parser (`plano-topicos-peca`); complemento local fls./lei/juris (`plano-lastro-topico.ts`); `test:plano-lastro` 6/6
- [x] **Comparativo FACTO (automático)** — `npm run test:comparativo-paridade` 8 cenários · relatório `scripts/comparativo-paridade-minutaia.md`
- [x] **Comparativo MinutaIA (manual/browser)** — 8 relatos em minutaia.com.br (conta FACTO); relatório `scripts/comparativo-paridade-minutaia.md` · interpretação ≈ paridade; lastro FACTO mais estruturado
- [ ] **Pontos finais (após ok Jefferson)** — inspector no ícone i (camada C)
- [x] **`fls.` clicáveis na peça redigida** — `PecaDocumentoView` + `TextoJuridicoInline` no painel documento (chat)
- [x] **Streaming redação no documento** — `stream: true` em `/api/gerar-peca` (NDJSON); redator Gemini com `onRedacaoDelta`; chat mostra texto crescendo
- [x] **Chat livre (desacoplado das travas de área)** — área/polo não bloqueiam; IA autoridade; payload com polo default; prompts conversa/inferência MinutaIA-style

### Feito nesta rodada (02/09 — sidebar fontes pacote 3)

- [x] **Tooltips** — nomes de anexos/juris/lei/teses no hover (não só contagem)
- [x] **Estado ativo** — ícone destacado quando painel/drawer correspondente aberto
- [x] **Pulse** — badge pulsa ao entrar novo arquivo ou item (anexos, juris, lei, teses)
- [x] **Lei municipal** — ícone próprio na coluna; abre complementos na seção lei

### Feito nesta rodada (02/09 — fluidez + E2E harness)

- [x] **Indicador digitando** — visível até o 1º token do stream (não some ao abrir conexão NDJSON)
- [x] **Debounce plano** — modo instantâneo 1400→600 ms (plano sobe mais cedo)
- [x] **Estilo no chat** — `estilo_resumo` do Perfil injetado em `/api/chat-conversa` e `/stream` (custo zero extra/turno)
- [x] **Smoke browser** — nova página por área (evita textarea sumir na 10ª área)
- [x] **0006509 browser** — relato pede agravo (não MS); timeout 120s
- [x] **Smoke browser prod pós-harness** — 20/20 áreas · 0006509 browser 6/6
- [x] **Deploy produção** — `8ef97f4` · `dpl_GW6p9CZpPJh51jAzcrLmUe46MgQx` · Ready · [factoia.com.br](https://factoia.com.br)

### Feito nesta rodada (02/09 — fls. na peça + streaming redação)

- [x] **`fls.` na peça** — `PecaDocumentoView` com `onAbrirFls` + `TextoJuridicoInline` (export Word/PDF inalterado)
- [x] **Streaming redação** — `gerarTextoComGeminiStream` + `onRedacaoDelta` no redator; `/api/gerar-peca` com `stream: true` (NDJSON `{t}` + `{done}`); chat atualiza painel direito em tempo real
- [x] **`tsc --noEmit`** ok
- [x] **Deploy produção** — `f8649de` · `dpl_78S9UgGpP4m5E3ZJzbADuj5vKwnR` · Ready · [factoia.com.br](https://factoia.com.br)

### Feito nesta rodada (02/09 — comparativo MinutaIA browser)

- [x] **8 cenários no MinutaIA** — 0006509 agravo; HC; BPC; Enel; trabalhista; JEC; contestação; lastro (texto)
- [x] **Veredito** — interpretação ≈ paridade FACTO×MinutaIA; lastro FACTO com UI estruturada (eles: inline sem badge/clique)
- [x] Relatório atualizado em `scripts/comparativo-paridade-minutaia.md`
- [x] **Deploy produção** — `27489ef` · `dpl_EGV2J3m6U6iSaWU7jagp7hKNzn7q` · Ready · [factoia.com.br](https://factoia.com.br)

### Feito nesta rodada (02/09 — chat livre MinutaIA)

- [x] **Sem trava de área/polo** — `areaExigeConfirmacao` / `precisaConfirmarPoloAdvogado` = false; Redigir segue com aviso âmbar
- [x] **IA autoridade** — espécie da inferência respeitada (`respeitarEspecieIa`); rito da área só orientação no prompt
- [x] **Payload** — polo ambíguo → relato ou default ativo (não 400 no chat)
- [x] **Decisão produto** — chat = produto principal; dashboards manuais desacoplados (não deletados)
- [x] **Testes** — `test:chat-minuta` 77; `test:calibracao` 19; `test:caso-0006509` 10; `tsc --noEmit` ok
- [x] **Deploy produção** — `1b61972` · `dpl_FfQA4Swq56GYuVk57YRWmEbvBFyA` · Ready · [factoia.com.br](https://factoia.com.br)

### Feito nesta rodada (02/09 — interpretação IA MinutaIA-style)

- [x] **IA na frente** — `/api/inferir-area` devolve área + espécie; chat chama em todo caso (não só ambíguo); local = pista
- [x] **0006509 → agravo** — MS só explícito; interlocutória em cumprimento = agravo; removido bloqueio “agravo só da executada”
- [x] **Testes** — calibracao 19; caso-0006509 10; peca-cabivel 37; chat-minuta 77; comparativo 8
- [x] **Deploy** — `bad7986` push · aguardar Vercel Ready

### Feito nesta rodada (02/09 — área auto + lastro plano)

- [x] **Refino área IA** — `inferir-area-refino.ts` + `/api/inferir-area` (Flash-Lite, ~R$0,01/turno ambíguo, sem cota de peça); motivo no header (`areaMotivo`)
- [x] **PlanoLastroHint** — ícone i dourado por tópico no plano; hover desktop
- [x] **Lastro tópico A+B** — prompt `LASTRO:`/`ENCAIXE:`; parser estruturado; hint com encaixe + fontes clicáveis (`fls.`)
- [x] **Testes** — `test:inferir-area` 5/5; `test:plano-lastro` 6/6; `test:comparativo-paridade` 8/8; `test:chat-minuta` 77/77; `tsc --noEmit` ok
- [x] **Deploy produção** — `6f027dd` · Vercel Ready · [factoia.com.br](https://factoia.com.br)

**Juris / seed:** depois de cada lote ou dia de cota, atualizar a seção **Lacunas da base (áreas falhas)** abaixo — tribunal errado, 0 insert, ou API sem aquele tribunal. Não deixar falha só no chat.

## Retomar quando voltar (30/08)

### Feito nesta rodada (30/08)

- [x] **Boost tribunal no retrieve** — `bonusAfinidadeUfComarca` + `bonusAfinidadeTribunais` em `buscarConhecimentoRelacionado`; superiores nunca excluídos
- [x] **Chat — tribunais (máx. 3)** — estado `tribunaisPreferidos`; TJ+STJ auto quando comarca tem UF; picker quando UF ausente; thread em preview/triagem/gerar
- [x] **Qualificação no preview (0 tokens)** — `extrair-qualificacao-relato.ts` (CPF, CEP, endereço do relato) no scaffold sem cota
- [x] **Chat conversacional** — complementos integrados ao preview; ajustes pós-redação pela conversa (`ajuste_peca`); meta lei/juris/ajuda local
- [x] **Seed juris 684–788** — lotes focados em const/prev/trab/trib/eleitoral/digital/internacional/conselhos/marítimo + volume 10 TJs · `ate` **788** (560/788 em curso)
- [x] **Endereço no preview (refino)** — padrões ricos (residente/domiciliado, nº, apto, bairro, CEP, cidade/UF) + ViaCEP gratuito p/ completar lacunas; UF do endereço vira comarca/TJ quando faltava
- [x] **Regra custo/escopo** — `.cursor/rules/custo-e-escopo.mdc` (implementar o grátis; pontuar o que gera custo; Gestão só sob pedido)
- [x] **Título Chat FACTO** — entre Diferencial e workspace; centralizado; wordmark oficial do logo; brilho + neurônios fracos convergindo; card glass no assistente
- [x] **Workspace unificado** — `/dashboard` = portal com assistente embutido; `/dashboard/chat` redireciona; preview idle; abas mobile; formulário/guia no rodapé do portal
- [x] **Sessões antigas** — `normalizarEstadoCasoChat` / sanitizar no load (tribunaisPreferidos etc.) — evita crash `length` de undefined
- [x] **Reiniciar chat / Novo caso** — botões no preview e no chat; gravam a sessão atual antes de limpar (Conversas / Meus casos)
- [x] **Chip Assistente FACTO** — no hero da home (layout portal); chip compacto `canto`/`barra` mantidos no componente para outros contextos
- [x] **Cabeçalho workspace** — topbar enxuta (logo, Meus casos, plano, avatar); cumprimento no hero; início em Área a definir
- [x] **Botão microfone (chat)** — tamanho fixo 34×34; erro vai para o banner do composer (sem expandir a barra branca)
- [x] **Como funciona (home)** — copy alinhada ao chat, prévia automática e redação com lastro
- [x] **Fixar assistente (home)** — ícone de pin no header; tela cheia via portal; Esc para sair
- [x] **CTA estilo (home)** — visível até upload do perfil; modal Ocultar (desta visita / não mostrar mais) + instruções no perfil
- [x] **Scroll home** — ao atualizar: topo se chat ocioso; ancora no `#assistente-workspace` se houver conversa ativa
- [x] **Ícone fixar** — contorno pushpin espelhado à direita, paleta + brilho, sem caixa
- [x] **Tooltips do assistente** — title/instruções no hover dos botões do header, composer e documento
- [x] **Remover Papel no workspace** — toggle de tema só fora da home; na home o visual glass + folha com peça basta
- [x] **Como funciona (copy)** — “Relate… Revise… Protocole.” + lastro sem sugerir acervo de lei municipal
- [x] **Fila IA documentada** — “Melhorar sem gastar mais” + “Melhorar com custo” + scorecard 30/08
- [ ] **Gemini paygo + Anthropic Sonnet (esta semana)** — paygo **ok 30/08** (R$ 60 Prepay + auto-reload, `factoassessoria`) · falta `ANTHROPIC_API_KEY` + 3–5 peças reais de teste
- [x] **Scaffold fora do JEC** — não cola mais placeholder interno nem ementa crua (“Com apoio no acervo FACTO…”) na peça de reserva
- [x] **Citações compartilhadas** — sem prefixo “Jurisprudência” no bloco; paráfrase fora do recuo de citação (`tipografia-peca`, `normalizar-peca-gerada`, prompt)
- [x] **Deploy produção 30/08** — `dpl_5dwS1uHrVMa3NjfkbudmTvfxnMJi` · [factoia.com.br](https://factoia.com.br) · paygo + citações no ar
- [x] **“Preencha manualmente” → formulário** — `preferirFormulario` no portal/home; chat no rodapé do card
- [x] **Checklist formulário JEC** — itens pendentes visíveis com botão Gerar desabilitado; tutela (corte/energia/menor) não bloqueia
- [x] **Inferência área BPC/INSS** — previdenciário > família; palavras com fronteira (`loas`, `der`, `indefer`)
- [x] **Partes/qualificação local** — `Sou João…`, INSS réu, réu ≠ CPF do autor; estado civil/profissão; INSS como PJ
- [x] **Preview scaffold (0 tokens)** — fatos/direito forenses em vez de eco do relato (`preview-fatos-scaffold`, `modoPreview`)
- [x] **Pós-IA determinístico** — `substituirNomePecaDeterministico` (JEC vs ordinária); art. 22 CDC perto de continuidade/fornecimento
- [x] **Romanos duplicados** — `renumerarTopicosRomanosDuplicados` em `normalizar-peca-gerada`
- [x] **Deploy produção (31/08 madrugada)** — `dpl_ANALA7Xt2jc2Yckd8tu1F71WRnSx` · Enel PJ, BPC autor, endereçamento, form qual, seeds SEED-only, catálogo manual
- [x] **Seeds só Gemini free** — `exigirGeminiApenasSeed()` obrigatório em `seed-juris-diario`, `seed-sumulas-diario`, `reindex-embeddings`, `testar-smoke-areas-lastro`; aborta sem `GEMINI_API_KEY_SEED` (nunca paygo)
- [x] **Qualificação Enel/concessionária** — `parecePessoaJuridica` (Enel, Sabesp…); split polo em “cortou”; réu PJ não herda CPF do autor
- [x] **BPC/LOAS autor** — beneficiário (filho) como autor único; INSS réu
- [x] **Endereçamento pós-IA** — `substituirEnderecamentoDeterministico` remove linhas extras (Vara Cível fantasma)
- [x] **Formulário manual** — `aplicarQualificacaoExtraidaRelato` ao aplicar entrada-caso; catálogo de áreas aberto por padrão; workspace chat `min(72dvh,720px)` para ver áreas abaixo
- [x] **Tipografia/juris** — `EXCELENTENTÍSSIMO`, `VARADO`, `[[/JURIS]]`; `injetarQualificacaoReus` mais agressivo
- [x] **Chat — plano estratégico (carro-chefe)** — coluna direita = plano IA (triagem), não scaffold; confirmação de área média/baixa; conversa até redigir; `PlanoCasoPainel` + `ChatConfirmarArea`
- [x] **Testes** — `testar-chat-minuta` 73 ok; `testar-alerta-fatos-pedidos` 8 ok; `tsc --noEmit` ok
- [x] **HC/Penal preview** — `pecaUsaEmFaceDeReu` (sem “em face de” no paciente); dedup autor=réu; inferência criminal > família (“família na cidade”)
- [x] **Deploy produção (31/08 tarde)** — `dpl_GPC9nW1TCvsvR3LeU1Lc3eP8AqjE` · commit `7b3908b` · tutela HC, 503 sem cota, typo endereçamento
- [x] **Deploy produção (31/08 manhã)** — `dpl_Am7KfYQoJYPxz5p6vzm6ZWyaSxiC` · commit `2c0a1d4` · HC + inferência criminal + chat minuta completo
- [x] **E2E 31/08** — 5 peças IA exportadas (`npx tsx scripts/exportar-e2e-31-08.ts --ia`); checklists preenchidos; browser Penal: preview+triagem ok; Prev manual: preenchimento+triagem ok; Redigir em prod falhou (Gemini)
- [x] **Fixes pós-E2E (31/08 tarde)** — `EXCELCELENTÍSSIMO` normalizado; HC/MS sem flag tutela CPC (`especieUsaTutelaUrgenciaCpc`); alerta tutela ignorado em HC; `/api/gerar-peca` retorna **503 sem debitar cota** em falha transitória Gemini
- [x] **E2E 5 peças (31/08)** — matriz Penal chat + Prev/Trab/Cons/Civil manual; exports IA em `testes-e2e-31-08/` (txt+pdf+docx+checklist); browser: preview/triagem ok, **Redigir prod** instável (Gemini sobrecarga / timeout 60s Vercel)

### Feito nesta rodada (01/09 tarde — formatação P0 + fluidez)

- [x] **Pipeline protocolo** — `pos-processar-peca-gerada.ts`: cabeçalho/epígrafe obrigatórios; strip préâmbulo IA; qualificação única; título antes do I; valor da causa em `finalizarTextoPeca`; placeholders limpos; `normalizarPecaGerada` pós-injeção
- [x] **HC / Penal** — sem `em face de` civil; remove Enel/energia/multa CPC; payload sem réu concessionária
- [x] **Anti-contaminação chat** — relato misto bloqueia; troca de área reinicia partes; **Novo caso** zera estado; complemento “também quero multa…” → pedidos (não qualificação)
- [x] **Testes** — `testar-formatacao-peca` ok; `testar-chat-minuta` 77 ok; `testar-chat-fluidez` ok; `tsc --noEmit` ok
- [ ] **Deploy produção** — APIs chat/anexos no ar (401, não 404) · confirmar commit `3bc7641` na Vercel · reteste E2E JEC + Penal chat (Novo caso)
- [x] **Smoke rápido prod (01/09 noite)** — login ok; toggle Instantâneo/Planejado; banner Anexos portal + Enviar; plano HC penal ativo; APIs 401 · memória anexo (2º turno PDF) pendente teste manual
- [x] **UX header chat** — removido botão Enviar/Continuar entre Entendimento e Timbre (redação fica no painel direito)

### Feito nesta rodada (01/09 tarde — chat Fase 1 + UX workspace)

- [x] **Chat Fase 1** — `chat-conversa-assistente.ts` + `/api/chat-conversa`; turno unificado; conversa não trava se Gemini cair
- [x] **Plano fallback local** — `plano-fallback-local.ts`; triagem retorna plano preliminar (sem erro vermelho); retry 3× no painel
- [x] **Gates → aviso âmbar** — polo/relato curto/misto não bloqueiam com faixa vermelha
- [x] **Workspace fixado** — botão **Fixar Área de Trabalho** (chat); wordmark FACTO semitransparente no documento quando fixado
- [x] **Script Anthropic** — `--no-sensitive` no `configurar-anthropic-vercel.ps1`
- [x] **Fase 2 intacta** — Redigir → `/api/gerar-peca` + formatação por área (sem mudança no pipeline)
- [x] **Banner nuvem** — `aviso-memoria-local` atualizado (opt-in Nuvem; some quando sync ativo)

### Feito nesta rodada (01/09 noite — chat MinutaIA-like + painel zerado)

- [x] **Painel zerado** — sem JEC/petição pré-preenchidos; `casoChatPainelVazio` + `ChatPainelContextoVazio`
- [x] **Estado vazio** — `especiePeca` vazio em `estadoCasoChatVazio`; resumo só após relato ≥40 chars
- [x] **Empty state chat** — tagline central “O futuro da minuta começa aqui” + chips (estilo MinutaIA, cara FACTO)
- [x] **Indicador digitando** — bolha animada durante turno `/api/chat-conversa`
- [x] **Conversa mais fluida** — prompt Fase 1 com 2–4 parágrafos; `maxOutputTokens` 2400
- [x] **Streaming redação** — feito 02/09; formatação/entrega peça (Fase D) segue em aberto
- [x] **Painel Anexos** — banner portal `z-[200]`; botão **Enviar** no rodapé (dispara o turno do chat); fecha ao enviar
- [x] **Modo Instantâneo / Planejado** — toggle no header; prompts/tokens distintos; Planejado força atualização do plano a cada turno
- [x] **Memória de anexo** — texto extraído por sessão; não re-OCR/reupload; `/api/entrada-caso` só com PDF novo

### Feito nesta rodada (01/09 noite — paridade chat, calibração)

- [x] **Calibração transversal** — `calibracao-area-especie.ts`; HC/MS/ADI/trab/prev/réplica/cumprimento; `resolverAreaEspecieOrganizacao` + polo
- [x] **Polo no thread** — `ChatConfirmacaoPolo` no corpo; `sincronizarPoloAutomaticoChat` + `reajustarEspeciePoloChat`
- [x] **Rastreio inline** — `TextoJuridicoInline` (fls. + ✓ lei) no chat e plano; clique abre painel de anexos
- [x] **Sidebar fontes** — `ChatFontesFlutuante` na coluna documento
- [x] **entrada-caso** — usa `areaIdResolvida` da organização local (não área bruta do relato)
- [x] **Testes** — `npm run test:calibracao` (17 ok) + `test:chat-minuta` (77 ok); `tsc --noEmit` limpo
- [x] **Smoke 20 áreas** — `npm run test:smoke-chat-areas` (240 ok); bugs corrigidos: família (partilha×compartilhada), ACP ambiental, eleitoral representação, previdenciário polo
- [x] **Smoke browser 20 áreas** — `npm run test:smoke-chat-browser` (20 ok local); auth OTP + plano visível por área
- [x] **Deploy produção (02/09)** — `dpl_DH8NhVYLLXrxBhYbz7p6rnBfnpaH` · commit `8c7076e` · paridade chat fase A+B
- [x] **Deploy produção (02/09 smoke)** — `dpl_BwsoGcNymnqUk2x7SD66WVFQbzRS` · commit `365799f` · smoke 20 áreas + fixes calibração · [factoia.com.br](https://factoia.com.br)
- [x] **Fix 0006509 polo capa** — `inferirPoloDoRelato` prioriza exequente sobre executada; `npm run test:caso-0006509` (11+6 browser); deploy `8771fd4`
- [x] **Alerta fatos×pedidos** — fora do thread do chat; regras afinadas (MS/HC/cumprimento, astreintes, “sem prejuízo de”)
- [x] **Smoke memória anexo prod** — `test:smoke-memoria-anexo --browser` · 2º turno sem re-OCR

### Feito nesta rodada (01/09 noite — melhorias objetivo)

- [x] **Último ato local** — `extrairUltimoAtoDoTexto` + `organizarCasoLocal` ajusta espécie (`ajustarEspecieCabivel`) e passa `ultimoAto` no payload do chat
- [x] **Prompts por área** — `blocoRitoArea` em triagem e redação (`assistente-facto-prompt.ts`)
- [x] **Log COGS** — `log-custo-ia.ts` + tokens Gemini/Anthropic em stdout (`[custo-ia]`)
- [x] **Auditor → ajuste** — `pedidoAjusteDeAuditoria` + sugestão no chat pós-Redigir
- [x] **Script Anthropic** — `scripts/configurar-anthropic-vercel.ps1` (local + Vercel Non-sensitive)
- [x] **Anthropic na Vercel** — `ANTHROPIC_API_KEY` + `ANTHROPIC_MODELO_REDACAO` (01/09) · redeploy `dpl_Cy95aDWa7Yw2PCsmfj5xri2Yxhm5`

- [x] **UX chat-first** — catálogo “Preencha manualmente” só com `previewAreas`; leigo → **Começar no assistente** (`/dashboard/chat?area=jec`); link **Formulário** no chat só `previewInterno` (QA)
- [x] **Rotas de área preservadas** — `/dashboard/jec`, `/dashboard/criminal`, etc. intactos; `moduloDaArea(areaId)` + espécies/kits por área no Redigir
- [x] **Comentário `minuta-modulo`** — JEC = laboratório de engenharia; produto segue rito da área escolhida no chat

### Decisão comercial — margem na carteira (01/09)

**Fechado:** meta **35–40% líquido** (após fixos + Gemini/Anthropic + MP), medida na **carteira mensal**, não por peça isolada.

| Regra | Detalhe |
|-------|---------|
| **Compensação** | Casos leves (Flash ~R$ 0,11) subsidiam pesados (Sonnet ~R$ 0,69) — mesmo modelo do MinutaIA na assinatura, com **1 peça = 1 débito** |
| **Peça pesada** | Margem variável menor (15–30%) **aceitável**; nunca negativa |
| **Peça extrema** | Após teto Sonnet do plano → Flash + pós-processo forte; sem “2 peças” por enquanto (matemática ainda não exige) |
| **Nunca vermelho** | Manter: teto Sonnet 12%/22%; JEC sem Sonnet; cap entrada 180k chars; chat sem reprocessar PDF/turno; seeds só `GEMINI_API_KEY_SEED`; **sem** juris ao vivo / GPT / auto-crítica sem ok |
| **Folga atual** | Stress 30 clientes cota cheia ~**53%** líquido (`PLANO X` 20/08) — espaço para **mais qualidade nos pesados** sem subir preço |

**COGS referência (paygo medido 01/09):** Flash **~R$ 0,11/peça** · Sonnet **~R$ 0,69/peça** · chat turno **~R$ 0,02–0,05** · entrada PDF **~R$ 0,03**. Saldo prepay: **R$ 56,72** (de R$ 60; **~R$ 3,28** gastos acumulados em testes).

### Feito nesta rodada (01/09 manhã)

- [x] **Cobertura clicável** — itens pendentes (!) no plano viram botão **+ Incluir no plano** (tese → subtópico do direito; pedido → DOS PEDIDOS), sem nova triagem/cota

### Feito nesta rodada (31/08 noite — fluidez chat)

- [x] **Camada 1 — fluidez** — gates suaves (área média auto-confirma + chip; polo inferido; tribunais sugestão); resposta rica no thread; highlight no plano; edição inline de pedidos; CTA único Continuar/Redigir; entrada-caso em complementos
- [x] **Camada 2 — conversa IA** — `POST /api/chat-refinar-plano` (Flash-Lite, sem cota peça); perguntas proativas locais; fallback determinístico
- [x] **Camada 3 — moat** — versões do plano; alertas fatos×pedidos no painel; lastro/cobertura já no `PlanoEstrategicoCorpo`
- [x] **Testes** — `testar-chat-minuta` 75 ok; `testar-chat-fluidez` ok; `tsc --noEmit` ok
- [x] **Seeds agendados** — `FACTO-seed-juris-01h` (01/09 01h, lote **599**) · `FACTO-seed-sumulas-04h` (01/09 04h) · contas free `GEMINI_API_KEY_SEED`
- [x] **Deploy produção (31/08 noite — fluidez)** — `dpl_GCLh3Jxa2VDVm61uvYEw8jUuyWRe` · commit `4818c43` · [factoia.com.br](https://factoia.com.br)

### Feito nesta rodada (31/08 noite)

- [x] **Chat plano vs scaffold** — preview forense substituído por plano estratégico automático (`/api/triagem-peca`); redação só após confirmar plano (1 peça)
- [x] **Confirmação de área** — inferência alta auto-confirma; média/baixa pede escolha antes de plano/redigir (nunca área errada como decisão)
- [x] **UX conversa** — mensagens orientam conversar até o plano ficar bom; botão Redigir confirma plano à direita
- [x] **Deploy produção (31/08 noite)** — `dpl_Bdgzw51WJFsmqHcPfhhAjrmJewGs` · commit `bac07fa` · [factoia.com.br](https://factoia.com.br) · chat plano estratégico no ar

### Feito nesta rodada (31/08)

| Run | Área | Canal | Resultado resumido |
|-----|------|-------|-------------------|
| 1A | JEC | Chat | ❌ Vara Cível + Ação Ordinária; réu Enel com CPF/endereço da autora; placeholders; valor `[VALOR DA CAUSA]` |
| 1B | JEC | Manual | ⚠️ Endereçamento/nome JEC ok; art. 22 CDC; R$ 8.000; qualificação toda placeholder |
| 2A | Prev | Chat | ⚠️ JEF ok; partes invertidas (Lucas autor c/ CPF João); `[[/JURIS]]`; erro na UI mas PDF gerado |
| 2B | Prev | Manual | ⚠️ Federal ok; placeholders; Lucas+João coautores; estrutura I Tempestividade |

**Próximo passo testes:** repetir matriz 1A–2B em [factoia.com.br](https://factoia.com.br) (deploy `dpl_ANALA7Xt2jc2Yckd8tu1F71WRnSx`).

**Custo observado (paygo):** ~R$ 0,11/peça Flash (5 peças E2E ≈ R$ 0,56); saldo **R$ 56,72** / R$ 60 (**~R$ 3,28** total em testes + triagens + chat) — seeds/reindex/smoke **não** devem usar essa conta.

### P0 aberto pós-PDF (corrigido em código local — aguarda deploy)

- [x] **Qualificação única + cabeçalho** — `pos-processar-peca-gerada` + `finalizarTextoPeca` (01/09)
- [x] **Valor da causa no chat** — `garantirSecaoValorCausa` dentro de `finalizarTextoPeca` (01/09)
- [x] **HC sem vazamento JEC** — sanitizar área + payload partes (01/09)
- [x] **Anti-contaminação sessão** — misto/troca área/Novo caso (01/09)
- [ ] **Reteste E2E** — Caso Enel (JEC) + HC Penal com **Novo caso** antes de redigir

### Melhorar sem gastar mais (IA / qualidade — implementar quando fizer sentido)

Ordem sugerida: lastro/prompts → autos/último ato → auditor→ajuste → paginação (após testes).

| # | Item | Benefício | Status |
|---|------|-----------|--------|
| G1 | **Lastro + seed** até meta / lacunas (TRE/TSE etc. em paralelo) | Fundamentação sentida; menos peça genérica | Em curso (560/788) |
| G2 | **Prompts por área** — rito, endereçamento, pedidos típicos mais duros | Qualidade sem +tokens | Feito 01/09 (`blocoRitoArea`) |
| G3 | **Último ato / espécie em autos longos** — extração CNJ e ato decisivo | Menos espécie errada | Feito 01/09 (`extrairUltimoAtoDoTexto`) |
| G4 | **Qualificação local** — regex/ViaCEP/partes (refino contínuo) | Menos buraco sem token | Parcial (30/08 noite: Enel PJ, BPC autor, split “cortou”; deploy pendente) |
| G5 | **Auditor → ajuste pontual** — amarrar achados a 1 reescrita focada | Menos lacuna na minuta | Feito 01/09 (`pedidoAjusteDeAuditoria`) |
| G6 | **Paginação do preview** (folha a folha) — após testes de UX | Melhor conferência humana | Aguardando testes |
| G7 | **Copy / tooltips / home** — clareza do fluxo (sem confundir base × anexo) | Menos erro de uso | Feito 30/08 (manter alinhado) |

### Melhorar com custo (só implementar com ok explícito)

| # | Melhoria | Custo | Benefício | Pri | Status |
|---|----------|-------|-----------|-----|--------|
| C1 | OCR Gemini em PDF de RG/comprovante só para endereço | Flash-Lite ~1–3k tokens/doc (fora da cota de peça, **API Gemini**) | Qualificação completa sem digitar | P2 | Aguardando ok |
| C2 | Claude Sonnet no Redator para mais áreas (hoje Completo/Pro c/ gatilho) | Anthropic + % teto plano | Peça mais densa em áreas complexas | P1 | **Esta semana** — chave + testes manuais; ampliar áreas só após ok |
| C3 | 2ª API juris (TRE/TSE, TRF1/2/5/6) | Assinatura nova (R$ a cotar) | Lastro eleitoral/federal fora do Juris.ai | P1 pós-788 | Aguardando ok |
| C4 | Auto-crítica pós-redação (1 pass leve Flash) | +tokens por peça | Menos erro de coerência | P2 | Aguardando ok |

### Roadmap — o que podemos fazer (01/09)

Ordem sugerida para o agente/Jefferson. **Grátis** = implementar quando fizer sentido; **custo** = só com ok explícito (regra `custo-e-escopo`).

#### Agora (P0 — bloqueia confiança no chat)

| # | Ação | Custo | Quem |
|---|------|-------|------|
| R1 | **Deploy** lote formatação P0 + chat-first (`47efe6e`+) | — | Agent |
| R2 | **Reteste E2E** Enel JEC + HC Penal (**Novo caso** entre eles) | ~R$ 0,22 | Jefferson |
| R3 | **`ANTHROPIC_API_KEY`** na Vercel + 1 peça Sonnet real | ~R$ 0,69/peça | Jefferson |
| R4 | **Commit/push** alterações locais chat-first (se ainda unstaged) | — | Agent |

#### Sem custo extra (ou custo já coberto) — qualidade e moat

| # | Melhoria | Impacto |
|---|----------|---------|
| R5 | **Streaming** da redação no painel (UX MinutaIA) | Sensação de fluidez | **Feito** (02/09) |
| R6 | **Prompts por área** — rito, endereçamento, pedidos típicos (`G2`) | Menos vazamento JEC→Penal |
| R7 | **Último ato / CNJ** em autos longos (`G3`) | Menos espécie errada (cumprimento vs ED) |
| R8 | **Auditor → 1 ajuste focado** (`G5`) | Fecha lacunas sem re-redigir tudo |
| R9 | **Paginação preview** folha a folha (`G6`) | Conferência antes de protocolar |
| R10 | **Polo + espécie** nas demais áreas (IA recebe “atuando pelo…”) | Paridade JEC |
| R11 | **Seed/lacunas** até 788 + reindex (`G1`) | Lastro sentido na peça |
| R12 | **Medição COGS real** — log tokens/request → dashboard interno | Precisão da margem 35–40% |
| R13 | **Spend cap** AI Studio + alerta saldo | Nunca vermelho operacional |

#### Com custo — só com ok (margem na carteira absorve se teto ok)

| # | Melhoria | COGS extra | Quando |
|---|----------|------------|--------|
| R14 | **Sonnet** ampliado (mais gatilhos/áreas) (`C2`) | ~R$ 0,58/peça vs Flash | Após chave + testes |
| R15 | **OCR RG/comprovante** só endereço (`C1`) | ~R$ 0,01–0,03/doc | P2 |
| R16 | **Auto-crítica** 1 pass Flash (`C4`) | ~R$ 0,05–0,10/peça | P2 |
| R17 | **2ª API juris** TRE/TSE/TRF (`C3`) | assinatura | Pós-788 |

#### Comercial / ops (não é código de peça)

| # | Item | Status |
|---|------|--------|
| R18 | **Compra real MP** ponta a ponta | Jefferson testando |
| R19 | **Links MP** alinhados 139,90 / 279,90 | Pendente |
| R20 | **Supabase Pro** ao começar a vender | Lembrete A |
| R21 | **Trial** 2 peças JEC 7 dias (teto ~R$ 1,34/user) | Decisão aberta |

#### vs MinutaIA — onde ainda perdemos (épico paridade chat — ver seção no topo)

| Gap MinutaIA | Resposta FACTO | Prioridade |
|--------------|----------------|------------|
| Entendimento sem microgerenciar | Calibrado (20 áreas + 0006509); chip área só confiança baixa | **P0** |
| `fls.` clicável abre PDF na página | Chat + plano + **peça redigida** (`PecaDocumentoView`) | **Feito** |
| Balão “o que li do PDF” após anexo | `formatarBalaoLeituraAnexo` — 1× no chat + painel plano | **Feito** |
| Thread sem ruído (prazo, chips, conferências) | Prazo/complementos no plano; área média auto; alerta só no plano | **Feito** |
| Memória de anexo (2º turno) | Smoke prod OK | **Feito** |
| Chat ultra-fluido / streaming turno | Stream ativo + typing até 1º token; debounce plano 600ms | **P1** — polish sidebar |
| Sidebar fontes do caso | Tooltips, estado ativo, pulse, ícone lei municipal | **Feito** (02/09) — validar visual em browser |
| Streaming redação no documento | NDJSON em `/api/gerar-peca` (`stream: true`) | **Feito** (02/09) |
| Comparativo lado a lado 5–10 casos | Não rodado | **P0** validação |
| Skills / modelo anexado | **Não clonar** — estilo escritório + peças modelo no Perfil | P2 |
| Juris ao vivo tribunais | **Diferencial:** base curada + anexos (sem custo live) | Manter |
| Processo 6k páginas | Cap 180k chars + último ato | R7 |
| Formatação/entrega peça | **Adiado** — depois do chat igual | Fase D |
| Histórico infinito | Meus casos + nuvem opt-in | Feito; polish R12 |

**Não fazer:** juris live, GPT em tudo, reprocessar PDF a cada turno, modo curto, web na peça — quebram margem 35–40%.

### Feito nesta rodada (29/08)

- [x] **Preview automático no chat** — dispara sozinho após organizar o caso (debounce 500 ms); balão “Analista organizando…” / “Montando pré-visualização…”; botões “Atualizar preview” removidos
- [x] **Equipe viva no chat** — balão progressivo Maestro/Analista/Estrategista/Redator/Auditor; meta lei/juris responde local (sem reprocessar entrada-caso); timeout 55s no intake
- [x] **Partes no preview** — fallback `extrairPartesDoRelato` (0 tokens) quando IA não preenche autor/réu; preview scaffold já mostra nome na qualificação
- [x] **Organização instantânea no chat** — `organizarCasoLocal` aplica preview na hora; IA refina em segundo plano; sem tela vermelha de timeout
- [x] **Copy comercial** — benefício unificado `Assistente + preview forense ao vivo (antes de gerar)` (`BENEFICIO_ASSISTENTE_PREVIEW` em `planos-facto.ts`); landing, trial, e-mails, dashboard
- [x] **Trial export** — preview/copiar texto liberados; Word/PDF bloqueados (`exportacaoBloqueada` trial) · copy landing/trial/planos
- [x] **Sync nuvem LGPD** — migration `migration-sync-nuvem-lgpd.sql` **rodada** (Jefferson) · APIs opt-in + minutas + memória · painel Nuvem no assistente · `/privacidade#sync-nuvem`
- [x] **Checklist protocolo por tribunal** — camada TJSP/TRT/JF/STF… em `docs-conferencia-protocolo.ts` + UI pós-geração
- [x] **Prazos com feriados BR** — `feriados-br.ts` + `sugerirPrazoDaPeca` com UF
- [x] **Testes automatizados chat/prazo** — `test:chat-minuta`, `test:chat-areas`, `test:prazo-intimacao` ok
- [x] **Alerta fatos × pedidos** — form + chat · `npm run test:alerta-fatos-pedidos`
- [x] **Citações rastreáveis** — `CitacoesRastreaveisPanel` form + chat
- [x] **Meus casos + sync sessões** — `/dashboard/meus-casos` · API `/api/chat/sessoes`
- [x] **Smoke scaffold 9.099** — offline 20/20

### Em andamento (Jefferson)

- [ ] **Compra real MP** — testando ponta a ponta
- [ ] **Seed juris** — lote **560** / **788** · meta **100k+** · lotes **684+** lacunas fracas até vencimento 13/09
- [x] **Gemini paygo + `ANTHROPIC_API_KEY`** — paygo ok · chave Anthropic na Vercel 01/09 · falta 1 peça Sonnet real em prod (HC Pro)
- [ ] **Testar gestão** em produção (`factoia.com.br/gestao`)
- [x] **Smoke lastro (embedding)** — 29/08: **20 ok · 0 fraco · 0 falhas** (Gemini 429 com retry; ok)
- [x] **Restaurar sessão nuvem** — GET `/api/chat/sessoes?sessaoId=` · Meus casos → Continuar · `?sessaoNuvem=` importa snapshot local
- [x] **Prazos no assistente** — dica determinística (`sugerirPrazoDaPeca` + feriados/UF) no chat
- [x] **Chat nova conversa** — CTA homepage/`hrefChatMinuta(..., { nova: true })` inicia caso limpo; sidebar Assistente retoma a sessão ativa; Conversas/Meus casos abrem a antiga
- [x] **Chat UX** — contraste do input; scroll (`h-dvh`); rótulo **Área a definir**; Anexar visível; Provas/lei e juris; citação súmula/juris estrito teor no prompt + wrap [[JURIS]]; alerta tutela reconhece corte/saúde; chip “sem lei/juris”
- [ ] **Peças reais** Const + Prev (manual) — **destravar com paygo** esta semana
- [ ] **Testar sync nuvem** — opt-in + 1 peça + sessão · rodar `migration-chat-sessoes-nuvem.sql`

**Checklist quando as chaves entrarem (Vercel Production + Preview):**
1. Gemini: billing paygo ativo (sem 429 de cota free em peça).
2. `ANTHROPIC_API_KEY` (+ opcional `ANTHROPIC_MODELO_REDACAO=claude-sonnet-4-5`).
3. Amostra manual: 1 JEC (Flash) · 1 Completo/Pro com gatilho Sonnet · 1 área densa (Const/Prev/Trab).
4. Conferir: lastro na peça, endereçamento, Auditor, export Word/PDF.
5. Anotar custo ~R$/peça no chat (Flash **~R$ 0,11** medido; Sonnet **~R$ 0,69**; ver **Decisão margem 01/09**).

### Scorecard FACTO vs MinutaIA (02/09 — pós lastro tópico A+B + área auto)

| Critério | MinutaIA | FACTO 30/08 | FACTO 02/09 | Δ vs Minuta |
|----------|----------|-------------|------------|-------------|
| Iteração (chat, versões) | 9,0 | 7,5 | **8,0** | −1,0 |
| Lastro / fundamentação | 7,0 | 5,2 | **6,4** | −0,6 |
| Formato forense e rito | 6,0 | 7,8 | **8,2** | +2,2 |
| Preço / custo por peça | 5,0 | 8,0 | **8,0** | +3,0 |
| Gestão + continuidade | 7,0 | 7,2 | **7,2** | +0,2 |

**O que subiu (02/09):**
- **Iteração +0,5** — thread enxuto; área auto ~95% (refino Flash-Lite só ambíguo); polo 0006509; memória anexo smoke OK.
- **Lastro +1,2** — `fls.` clicável; balão único PDF; **lastro por tópico** (encaixe + `LASTRO:` estruturado + fallback local fls./lei/juris); ícone i no plano.
- **Formato +0,4** — calibração MS/HC/cumprimento; espécie×polo; alerta fatos×pedidos só no painel.

**Ainda falta para lastro ≈ MinutaIA (−0,6):**
- Inspector lateral por fonte (badges → painel) — P1
- Juris do caso linkada linha a linha na peça redigida — P1
- Acervo 100k / seed 788 fechado — G1

**Generalista (pesos iguais):** FACTO **≈ 7,56** vs MinutaIA **≈ 6,80** (+0,22 vs scorecard 30/08).

### Scorecard FACTO vs MinutaIA (30/08 — pós-testes PDF)

Atualizado após testes espelhados chat/manual (Caso 1 JEC + Caso 2 Prev) e correções locais.

| Critério | MinutaIA | FACTO 29/08 | FACTO 30/08 (manhã) | FACTO 30/08 (noite testes) | Δ vs Minuta |
|----------|----------|-------------|---------------------|----------------------------|-------------|
| Iteração (chat, versões) | 9,0 | 7,0 | **7,8** | **7,5** | −1,5 |
| Lastro / fundamentação | 7,0 | 5,0 | **5,2** | **5,2** | −1,8 |
| Formato forense e rito | 6,0 | 9,5 | **9,5** | **7,8** | +1,8 |
| Preço / custo por peça | 5,0 | 8,0 | **8,0** | **8,0** | +3,0 |
| Gestão + continuidade | 7,0 | 7,0 | **7,2** | **7,2** | +0,2 |

**Por quê caiu Formato (noite):** chat JEC ainda saiu Vara Cível/Ordinária e réu=autor nos PDFs; manual com placeholders; prev com partes invertidas — corrigido em código, **não deployado** nesta sessão.

**Por quê Iteração −0,3:** erro “redigir peça” Caso 2 + navegação manual ainda confusa (catálogo fechado + chat tela cheia).

**Generalista (pesos iguais):** FACTO **≈ 7,34** vs MinutaIA **≈ 6,80** — ainda na frente no agregado; gap de **formato forense** é o risco principal antes de vender em escala.

**Regra seeds (30/08):** `GEMINI_API_KEY` = paygo (peças prod) · `GEMINI_API_KEY_SEED` = free (seed/reindex/smoke). Scripts abortam sem SEED.

**Próximo salto de score:**
1. Lastro → 100k / fechar 788 (+0,8–1,0 lastro) — G1  
2. **Peças reais com Gemini paygo + Sonnet** (esta semana) — mede qualidade de verdade (+iteração/lastro sentido)  
3. Prompts por área + último ato (G2/G3) (+0,3–0,5)  
4. Sonnet seletivo ampliado (C2) só após amostra — c/ ok  
5. Compra MP estável (receita)

Canvas (se existir): `canvases/facto-vs-minutaia-scorecard.canvas.tsx`.

## Retomar quando voltar (28/08)

### Feito nesta rodada (28/08)

- [x] **FACTO Gestão gratuita** — deploy `babce07`+ (`/gestao/cadastro`, 10 pessoas, sem honorários, admin `/admin/gestao`)
- [x] **Migration gestão** — `migration-gestao-mvp.sql` rodada no Supabase (Jefferson)
- [x] **Vercel** — `MERCADOPAGO_WEBHOOK_SECRET` já em Production; **`CRON_SECRET` adicionado** 28/08; `ANTHROPIC_API_KEY` **opcional** (sem ela = Redator 100% Flash)
- [x] **LGPD memória local** — aviso no dashboard (rascunhos/histórico JEC/memória cliente só no navegador)
- [x] **Smoke scaffold** — corrigido vazamento Lei 9.099 fora do JEC (`221239a`: qualificação CPC/CLT + placeholder + filtro lastro)
- [x] **Tarefa smoke diária** — `FACTO-smoke-lastro-06h` (06:00) · log `scripts/smoke-areas-lastro.log` · instalar: `scripts\instalar-tarefa-smoke-lastro.ps1`
- [x] **Reindex único** 28/08 — +811 embeddings (17 falhas cota Gemini 429)
- [x] **Réplica à contestação** — `replica-contestacao.ts` + painel Entrada + briefing triagem/redação
- [x] **Chat FACTO (MVP beta)** — `/dashboard/chat` · `POST /api/preview-scaffold` (0 cota) · intake → triagem → redação → ajuste · inferência de área · sidebar **Assistente**

### Em andamento (Jefferson)

- [ ] **Compra real MP** — testando ponta a ponta
- [ ] **Seed juris** — lote **488** / **683** · meta comercial **100k+** julgados na `base_conhecimento` para abertura de vendas (crescimento contínuo via APIs contratadas: Juris.ai seed + 2ª API pós-683)
- [ ] **Testar gestão** em produção (`factoia.com.br/gestao`)
- [ ] **Smoke** — revalidar após fix (`npm run test:smoke-areas-lastro` ou aguardar 06:00 de 29/08)
- [ ] **Peças reais** Const + Prev (manual, depois do lastro)

### P1 — o que fazer de verdade (decisões 28/08)

| Item | O que é | Próximo passo |
|------|---------|---------------|
| **Histórico minutas na nuvem** | Salvar peças no Supabase por usuário (todas as áreas) | **Feito** 29/08 — migration + API + opt-in + painel Nuvem + **Meus casos** global |
| **Réplica à contestação** | Anexar contestação → FACTO detecta argumentos do réu e pré-monta réplica | **Feito** 28/08 — `replica-contestacao.ts` + painel na Entrada + briefing no Redator. |
| **Chat FACTO** | 1 chat + N ritos (`areaId`); preview ao vivo; redação = 1 cota | **MVP beta** 28/08 · 20 áreas · copy preview 29/08 · trial export + alerta + citações 29/08 |
| **Alerta fatos × pedidos** | Antes de Gerar, avisar contradição (valor, obrigação, parte) | **Feito** 29/08 — detector + chips form + chat |
| **Checklist protocolo por tribunal** | Lista de docs para juntar no e-SAJ/PJe | **Feito** 29/08 — `docsConferenciaComTribunal` |
| **Sync memória cliente nuvem** | Opt-in LGPD | **Feito** 29/08 — API + sync após redação |

## Chat FACTO — próximos passos de implementação (28/08)

**Arquitetura fechada:** 1 chat · router infere `areaId` · mesmo motor das dashboards (`JecForm` / APIs) · preview scaffold **antes** da cota · ajuste só de trecho (Flash).

### Fase 2 — polish (código imediato)

| # | Item | Arquivo / nota |
|---|------|----------------|
| 1 | **Smoke helpers chat** — roteamento, payload, polo, ajustes | **Feito** 28/08 — `scripts/testar-chat-minuta.ts` · `npm run test:chat-minuta` |
| 2 | **CTA dashboard home** — “Nova peça no assistente” → `/dashboard/chat` | **Feito** 28/08 — hero, leigo, cards, wizard, fluxo |
| 3 | **Réplica no chat** — painel quando contestação detectada | **Feito** 28/08 — `replica-contestacao-painel.tsx` |
| 4 | **Paridade payload** — provas, juris, valores, lei municipal, link nuvem | **Feito** 28/08 — `montarPayloadGeracaoChat` + drawer Complementos |
| 5 | **Timbre** — toggle no header (já lê `escritorio-storage`) | **Feito** 28/08 — `chat-minuta-page.tsx` |
| 6 | **Ajustes por plano** — JEC 3 · Completo/Pro 5 | **Feito** 28/08 — `ajustar-trecho-peca.ts` |
| 7 | **Copy triagem** — “Voltar ao chat” (prop em `PreviewTriagemPeca`) | **Feito** 28/08 — `preview-triagem-peca.tsx` |
| 8 | **Polo obrigatório** — chip quando espécie ambígua (`ambos`) | **Feito** 28/08 — espelha matriz `polo-especies-por-area` |

### Fase 3 — rollout áreas — **feito** 28/08

- [x] Todas as 20 áreas abertas no chat (`CHAT_MINUTA_AREAS_FASE1`)
- [x] Smoke Criminal / Const / JECR / Eleitoral — `npm run test:chat-areas`
- [x] Link **“Continuar no assistente”** no formulário clássico
- [x] Inferência de área ampliada (criminal, const, jecr, eleitoral)
- `CHAT_MINUTA_TODAS_AREAS=1` — override dev (redundante com lista completa)

### Fase 4 — persistência local — **feito** 28/08

- [x] Sessões chat (`chat-minuta-storage.ts`) — auto-save, retomar, excluir
- [x] Painel **Conversas** + histórico de peças por sessão
- [x] Opt-in LGPD sync nuvem (preferência local + modal + API)
- [x] **Sync Supabase** — migration rodada 29/08 · APIs minutas/memória/sessões + painel Nuvem + `/dashboard/meus-casos`

### O que **não** fazer no chat

- Reprocessar PDF inteiro a cada mensagem (custo 3–10×)
- Sonnet no router (só na redação)
- Backpage sempre visível (drawer basta)

### Sequência P0 atualizada (28/08)

1. **Compra real MP** — em teste (Jefferson)
2. ~~Vercel `MERCADOPAGO_WEBHOOK_SECRET` + `CRON_SECRET`~~ — ok · `ANTHROPIC_API_KEY` quando quiser Sonnet
3. **Seed** — **527→683** · diário 01h · lacunas depois
4. **Smoke** — 29/08 **19/20** · const lastro 9.099 pendente curadoria
5. **P1 código** — ~~histórico nuvem~~ ~~checklist tribunal~~ ~~alerta fatos×pedidos~~ ~~citação rastreável UI~~ ~~Meus casos~~
6. ~~LGPD sync nuvem~~ — feito 29/08 (migration + termo)
7. **Gestão** — no ar; Jefferson testando

## Retomar quando voltar (24/08)

### Sequência agora (competir com MinutaIA sem dispersar)

Ordem fechada 24/08: **receita + lastro + confiança na peça** antes de marketing pesado. Manus e Obsidian **adiados** (ver P3 / decisões abaixo).

1. **Compra real MP** ponta a ponta (JEC ou Completo) — webhook + e-mail + convite só sem perfil + login upgrade.
2. **Vercel** — `ANTHROPIC_API_KEY` + Gemini **paygo**; conferir `MERCADOPAGO_WEBHOOK_SECRET` e `CRON_SECRET`.
3. **Seed** — `proximoLote` **488** / `ate` **683** (atualizado 28/08; era 329 em 24/08). `npm run seed:juris-diario` na próxima cota; **sem lotes novos** até 683; TRE/TSE = 2ª API depois.
4. **Smoke live** — `npm run test:smoke-areas-lastro` (tarefa `FACTO-smoke-lastro-06h`) + 1 peça real Constitucional e 1 Previdenciário com “Buscar na base FACTO”.
5. **Diferenciação P1 (próximas features de código):** (a) histórico de minutas na nuvem (todas as áreas); (b) ~~réplica a partir da contestação~~ **feito**; (c) alerta fatos × pedidos; (d) checklist de protocolo por tribunal; (e) **polish do Chat FACTO** (MVP no ar).
6. **LGPD** — aviso memória local **feito** (28/08); termo antes de sync nuvem (cliente / histórico) **pendente**.
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

## Smoke lastro (20 áreas) — 28/08

- **Comando:** `npm run test:smoke-areas-lastro` — 1 busca na base + scaffold por área (usa embedding Gemini, **não** gasta cota de peça).
- **Tarefa:** `FACTO-smoke-lastro-06h` (diária **06:00**, após seed 01h) · log `scripts/smoke-areas-lastro.log`
- **Instalar:** `powershell -ExecutionPolicy Bypass -File scripts\instalar-tarefa-smoke-lastro.ps1`
- **28/08:** execução manual **2 ok · 18 falhas** (Lei 9.099 no scaffold fora do JEC) — **corrigido** em `221239a`; revalidar na tarefa de 29/08 ou manual.

## Marca INPI (FACTO / FACTOIA) — 24/08

### Já feito
| Marca | Processo | Protocolo | Classe | Status pePI (25/08) |
|-------|----------|-----------|--------|---------------------|
| **FACTO** | **944677347** | **850260390405** | 42 nominativa | **Consta** na base; ficha/RPI ainda sem detalhe público (pré-publicação). Base até **25/08** · RPI **2903** |
| **FACTOIA** | *(nº no recibo — informar)* | **850260430578** | 42 nominativa | Protocolo **não** busca no pePI (só nº de processo). Marca exata 42 ainda **0** |

Titular: PF Jefferson · GRU 389 · especificação SaaS/TI. Comprovante FACTO: `…\PROJETO FACTO\INPI\29409172362117530.pdf`

### Situação pePI (consulta 24/08 ~11:05)
- **FACTO 944677347:** pedido **consta**; acompanhar RPI + Meus pedidos (logado).
- **Protocolo 850260430578** (FACTOIA): pePI por “nº processo” → **nenhum resultado** (protocolo ≠ processo).
- Busca exata **FACTOIA** / classe 42 → **0** (ainda não indexado).
- Interpretação: ambos **depositados / em fila**; sem indeferimento visível.

### RPI 2903 (25/08/2026 — consulta ~19:37)
- **XML Marcas** (`RM2903.zip`): **944677347** e **FACTOIA** **ausentes** (2902 também sem 944677347).
- **Comunicados2903.pdf:** sem menção aos processos.
- **Próxima checagem:** RPI **2904** (~**02/09/2026**, terça).
- Arquivos locais: `tmp/rpi-check/` (gitignored).

### Próximos registros — ordem
1. Acompanhar **FACTO** + **FACTOIA** (RPI terças; Meus pedidos).
2. Classe **9** — **adiada** (sem app).
3. Logo mista — depois.
4. Classe **45** — evitar (Fatho); se um dia, preferir FACTOIA.
5. Cessão PF → PJ quando houver empresa.

### Pendências marca
- [ ] Anotar **nº do processo FACTOIA** do recibo e-Marcas (não só o protocolo)
- [ ] Logado: Meus pedidos para **944677347** + processo FACTOIA
- [ ] Conferir **RPI 2904** (~02/09) até 1ª publicação
- [x] RPI 2903 conferida — sem publicação FACTO/FACTOIA (25/08)
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

**Como ganhar do MinutaIA no nosso molde (não clonando skills/web):** peça protocolável + lastro curado + polo/rito corretos + histórico que não some + réplica inteligente + conferência (fatos×pedidos / protocolo) + **chat com preview forense sem cota** (não reprocessar PDF inteiro a cada turno). Evitar: modo curto genérico, busca web na minuta, 2.000 skills, chat que inventa fato sem conferência.

### P0 — Bloqueio comercial e confiança (fazer antes de escalar marketing)

| # | Item | Status | Por quê |
|---|------|--------|---------|
| 1 | **Compra real MP ponta a ponta** — webhook + e-mail + convite + cadastro + cancelamento CDC | Parcial | Único bloqueio comercial crítico |
| 2 | **Confirmar na Vercel** `MERCADOPAGO_WEBHOOK_SECRET` e `CRON_SECRET` | **Ok 28/08** (`ANTHROPIC_API_KEY` opcional) | Segurança já no código |
| 3 | **Seed / lastro** lotes **488–683** + meta **100k+** juris na abertura + lacunas vitrine + mapa `tribunal`/`area_tags` | Em curso (488; retomar na cota) | “Buscar na base FACTO” fraco = peça fraca |
| 4 | **Testes reais Constitucional + Previdenciário** após lastro | Pendente | Áreas abertas sem validação de usuário |
| 5 | **LGPD — memória de cliente** | Parcial (aviso local 28/08) | Sync nuvem + termo opt-in pendente |
| 6 | **Rodar migrations trial / tribunal / escritório no Supabase** | Pendente (ops) | Código já no repo |

### P1 — Diferenciação vs MinutaIA (impacto alto, escopo médio)

| # | Item | Status | Benefício |
|---|------|--------|-----------|
| 1 | **Perfil FACTO na nuvem** — tom + 2–3 peças modelo → resumo de estilo no prompt | Parcial (MVP em Perfil) | Interpreta estilo, não cola texto |
| 2 | **Memória de cliente na nuvem** (Supabase, opt-in) | Pendente | Mesmo cliente em outro PC; hoje só `localStorage` |
| 3 | **Histórico de minutas na nuvem** — todas as áreas, não só JEC local | Parcial (JEC local + versões sessão) | Não perder trabalho ao trocar máquina |
| 4 | **Réplica a partir da contestação anexada** — detectar argumentos do réu e pré-montar contra-argumentos | **Feito** 28/08 (`replica-contestacao.ts`, painel Entrada, briefing triagem/redação) | Automatização forte; MinutaIA não faz bem |
| 4b | **Chat FACTO** — intake + preview scaffold + triagem/redação | **MVP beta** 28/08 (`/dashboard/chat`, `preview-scaffold`, `chat-minuta.ts`) | Iteração controlada; preview grátis diferencia do MinutaIA |
| 5 | **Checklist de protocolo por tribunal** (TJSP, TRT, etc.) pós-geração | **Feito** 29/08 | `docsConferenciaComTribunal` |
| 6 | **Alerta contradição fatos × pedidos** (valor, obrigação, parte) | Pendente | Conferência antes de gerar |
| 7 | **Citação rastreável** — distinguir base FACTO vs anexo no auditor | Parcial (página no anexo ok) | Credibilidade forense |
| 8 | **Prazo com feriados** (calendário BR por comarca/tribunal) | **Feito** 29/08 | `feriados-br.ts` · UF opcional |
| 9 | **Polo enxuto** — radios só em “Ambos os polos” + inferência | Feito (`9daa804`) | Dashboard mais limpa |
| 10 | **Polo obrigatório** antes de Gerar quando espécie é ambígua | Feito | Evita recurso do réu sair como autor |
| 11 | **Trial grátis** — 1 área · 2 peças · 7 dias · **export limpo** | Feito (atualizado 29/08) | Experiência completa protocolável |
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
| 4 | **Extensão PJe / e-SAJ** | **P2 positivo** — diferencial de captura (nº processo, andamentos, anexos) e pré-preenchimento; custo de manutenção alto (cada tribunal muda layout). Entrar **depois** de histórico nuvem + checklist protocolo; MVP = bookmarklet ou leitura de CNJ, não extensão full no P0. |
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
14. **[P1] Chat FACTO** — _MVP beta 28/08; polish em curso_
   - [x] `POST /api/preview-scaffold` — scaffold forense (`gerarPecaJec`), **0 cota** redação
   - [x] `/dashboard/chat` — UI split chat + preview; sidebar **Assistente**
   - [x] Fluxo: `entrada-caso` → preview loop → `triagem-peca` → `gerar-peca` → `ajustar-peca`
   - [x] Inferência `areaId` + chip “Trocar área” (Fase 1: JEC, Consumidor, Civil, Família, Trabalhista, Imobiliário)
   - [x] Drawer “Ver o que entendi” + aba **Complementos** (provas, juris, valores, lei municipal)
   - [x] **Fase 2 — polish** (completa 28/08)
   - [x] **Fase 3 — rollout** — 20 áreas · smoke · link formulário
   - [x] **Fase 4 — local** — sessões, histórico peças, opt-in nuvem, markdown
   - [ ] **Fase 4b — Supabase:** sync conversas/minutas (P1 histórico + termo)
   - **Regra de custo:** intake + preview = grátis; 1 peça na redação; ajuste = Flash por trecho (não reprocessar PDF a cada mensagem)
15. **[P3] Depois do núcleo da minuta** — _Add-in Word e contratos_
   - ~~**Chat multi-turno:**~~ **MVP beta** — ver item 14 acima; polish P1, não P3.
   - **Add-in Word:** melhoria de canal. Não implementar nesta fase.
   - **Contratos (minutas, não petição):** teaser na home (“Contratos — em breve”). **Decidir depois** quais modelos (poucos, de uso real: prestação de serviços, NDA, locação, distrato — não 40 templates genéricos). Canal apartado das áreas; Completo/Pro + OAB. Litígio de contrato permanece no Civil. Não implementar a biblioteca agora.
16. **[P1] PLANO X** — _código 14/08_ — B 10/30/50 + saldo; E +10 análises R$ 29,90; G Completo Anual **R$ 1.890** (mantido) + H cotas 100/180; I copy JEC leigo; J 15 juris externa; **N botão só base curada**. SQL: `supabase/migration-extras-analises.sql`. A (Supabase Pro) só ao começar a vender.

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

Contribuição média (sem fixo): receita − IA − MP ≈ **R$ 3.476** (~70%). Meta **35–40% líquido** — ver **Decisão margem na carteira (01/09)**; stress atual ~53% com folga para qualidade nos pesados.

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
- [ ] Lotes **560–788** — retomar diário / `npx tsx scripts/seed-juris-ai-faixa.ts 560 788`. **Estado 30/08:** `proximoLote` **560**. `LOTE_MAX` **788** (684+ lacunas fracas).
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
- [ ] Citação passage-level · ~~chat multi-turno~~ **chat MVP beta** (polish P1) · Word · contratos.
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
