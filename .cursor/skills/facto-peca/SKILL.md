---
name: facto-peca
description: >-
  Regras de produto da minuta FACTO (peça jurídica). Use when editing JEC or
  future area modules, piece generation, formatting, checklist, JG/MLE, proofs,
  already-qualified parties, tabs, or dashboard piece UI. Does not change
  client-facing copy unless the user asked.
---

# FACTO — minuta (todas as áreas)

Não redesenhar o que já fechamos. Skill só para o agente no Cursor; o cliente não vê isto.

Módulo aberto hoje: **todas as áreas com dashboard** (`available: true`), salvo **Contratual** (fora da grade; litígio no Civil; Contratos em breve). Inclui **Constitucional**. Plano JEC e parte sem OAB: só JEC. Completo/Pro + OAB: demais. Eleitoral aberto no catálogo, lastro TRE/TSE ainda fraco.

Preview admin (`/dashboard/preview/<id>`) permanece para e-mails internos.

Se alterar a dashboard JEC e **não** for específico do JEC, extrair/atualizar o compartilhado (e replicar nas áreas que já tiverem rota). Não duplicar só no `jec-form`.

## Sempre

- Minuta para **revisar e protocolar fora** do FACTO. Não enviar arquivo ao juízo.
- **JG e MLE:** checkbox na aba Pedidos; só inclui o **pedido no texto**. MLE não aparece em Penal, JECRIM, Eleitoral nem Constitucional. Declaração e docs do MLE o usuário junta no protocolo.
- **Pedido contraposto / reconvenção:** checkbox na **Contestação** (aba Pedidos), não espécie no seletor. JEC = art. 31 da Lei 9.099 (mesmos fatos; reconvenção do CPC não cabe). Justiça comum (Civil, Consumidor, Família, Imobiliário) = art. 343 do CPC. Danos morais e tutela, se o réu também pedir, continuam c/c **dentro** desse pedido.
- **Provas do fato:** insumos para a IA (contrato, print, nota). Não confundir com checklist de protocolo.
- **Já qualificado:** peças incidentais = só nome; petição inicial = qualificação mínima.
- **Polo ativo/passivo:** seletor em **todas** as áreas com dashboard. Contestação/defesa = polo passivo; inicial/réplica/remédio = polo ativo; recursos = ambos. O seletor lista **todas** as peças, agrupadas por polo — contestação não some no polo ativo. Ao escolher a peça, o polo é ajustado. Penal: HC/revisão no paciente; resposta à acusação no acusado (não é contestação). JECRIM: queixa no querelante; defesa no acusado. Eleitoral: representação/AIJE no autor; defesa no representado (`registro-candidatura` nos dois).
- **Corpo justificado:** fatos/direito em parágrafos de 2–3 períodos. Uma frase por linha parece alinhada à esquerda.
- Endereçamento, nome da ação, títulos, pedidos/provas e fechamento já têm regra própria — não unificar com o corpo.
- Três etapas de formulário (identificação → fatos → pedidos). **Entrada única** no topo preenche as abas (PDF/autos inclusive); Gerar só na aba Pedidos. Campo incerto fica vazio — não gerar “sem contexto”. Identificação: só **Assistente FACTO** e **Digitar o nome** — sem rádio “Analisar processo”. Depois do preenchimento: **chips de conferência** (espécie, polo, JG, teses, vazios) e trecho do que o PDF/OCR leu.
- **Falar:** botão na Entrada do caso e na aba Fatos. Transcreve (~3 min, Gemini Flash-Lite) para o textarea; o usuário lê e edita. Falar na Entrada replica o mesmo texto na aba Fatos (sem segunda chamada). Falar em Fatos é opcional — anexa mais. **Não** dispara “Preencher as três abas”, **não** consome cota de peça, **não** grava o arquivo de áudio. Em campo já preenchido, anexa o texto.
- **Entrada do caso:** preenche as 3 abas; **não consome cota**. Só **Gerar peça** = 1 peça.
- **Redator:** Flash padrão. Claude Sonnet só Completo (teto 12%) / Pro (22%) com gatilho (espécie complexa, relato longo, tutela no Pro) + `ANTHROPIC_API_KEY`. JEC = Flash.
- **Peça cabível:** a entrada interpreta o **último ato** dos autos (não o nome do incidente já aberto). Cumprimento/execução já instaurado + decisão posterior (astreintes, penhora, tutela) → embargos ou agravo — nunca reabrir o incidente.
- **Teto de leitura da triagem:** `LIMITE_RELATO_TRIAGEM_CHARS` (180 mil) em `peca-cabivel-autos.ts`. PDF maior: capa + decisões do miolo + fim. Não voltar a 24 mil.
- Epígrafe em peça incidental: Processo nº + polos do rito (Autor/Réu; Apelante/Apelado; Recorrente/Recorrido; Agravante/Agravado; Embargante/Embargado; Exequente/Executado; Reclamante/Reclamado; Reconvinte/Reconvindo). Em rótulo recursal, a 1ª linha é quem protocola (polo do advogado). PDF e DOCX desenham as 3 linhas no bloco de 6. Endereçamento usa foro/comarca; incidental sem vara não leva `___`. Alvo do recurso (r. sentença/decisão) fica no parágrafo introdutório (`ante a r. sentença…`), não em segundo `em face de` após o título.
- **JG e MLE** e **pedido contraposto / reconvenção:** checkboxes na aba Pedidos.
- **Auditor:** regras, sem Gemini. Confere espécie vs último ato, endereçamento/epígrafe, lacunas (`___`, endereço, OAB), JG/MLE/pedidos e citações com lastro. Achados visíveis na minuta; não cria skin nova.
- **Skins visíveis:** Maestro, Analista, Pesquisa & súmulas, Estrategista, Redator, Auditor. Sem 7ª skin. Sem chamada Gemini extra. Maestro monta o plano (espécie, polo, teses, JG/MLE, último ato). Pesquisa busca na base FACTO **casos semelhantes aos fatos** e **julgados favoráveis ao polo da peça** (ativo = procedência/condenação; passivo = improcedência). Ementa contrária ao polo não entra no lastro. Estrategista injeta `<VINCULOS_FACTO>` na estratégia antes do Redator. Analista/Redator recebem a peça cabível (não reabrir cumprimento). Pesquisador/Sumulista continuam ocultos.
- **Juris do caso vs lei municipal:** campos distintos. Juris/súmula anexada = citação nesta peça + fila `juris_verificacao` (admin pode incluir na base). Lei municipal = só este município/caso; **nunca** `base_conhecimento` nem `juris_verificacao`. Não misturar os uploads.

## JEC (módulo vivo)

- Lei 9.099/95. Leigo: teto 20 SM. Espécies em `jec-especie-peca.ts`.
- Formatação: `formatacao-forense.ts`, `tipografia-peca.ts`, `peca-paragrafos.ts`.
- Preview HTML: margens A4 no desktop; no celular reduzir recuo (não coluna de 2 palavras).
- Não exigir CPF/endereço em recurso, contestação, embargos, execução.

## Próximas áreas

Seed de juris **independente** da implementação da dashboard: não esperar a base inteira; lastro da área da vez antes de `available` para o cliente.

Cada área tem **rito, espécies, polos, prazos, leis/códigos e endereçamento próprios**. Reusar a **estrutura** do JEC (3 etapas, já qualificado, JG quando couber, provas ≠ protocolo, justificado, timbre/Gerar no fim). **Não** copiar a lista de peças do JEC nem o MLE. Ex.: penal = resposta à acusação (não contestação); trabalhista = reclamação (não petição inicial do Juizado).

Não ligar `available` só no catálogo. Preencher `AreaModuloConfig` + tabela de espécies da área.
