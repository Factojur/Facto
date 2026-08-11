# Spec: sync Obsidian → `base_conhecimento` (ainda **não** implementado)

Documento de desenho. **Não há script de sync em produção.**  
Obsidian pode ser usado agora só como bloco de notas; o sync entra quando a curadoria “doer”.

## Objetivo

Transformar notas Markdown **aprovadas** do vault em linhas de `base_conhecimento` + embedding, sem indexar rascunhos.

```
Vault (Obsidian) → filtro status:aprovado → upsert Supabase → reindex embeddings
                                                              ↓
                                                    busca / peça (runtime)
```

## Fora de escopo (v1)

- Plugin Obsidian em tempo real
- Sync bidirecional (admin → vault)
- Indexar o vault inteiro ou o grafo `[[wikilinks]]`
- Substituir `/admin/conhecimento` ou a fila `juris_verificacao`

## Frontmatter (contrato)

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| `id` | sim | ID estável (ex. `juris-tjsp-2024-pix-001`) — chave de upsert |
| `tipo` | sim | `Lei` \| `Súmula` \| `Jurisprudência` → coluna `categoria` |
| `status` | sim | `rascunho` \| `aprovado` \| `rejeitado` — só `aprovado` sincroniza |
| `tribunal` | não | TJSP, STJ, … |
| `tema` | não | lista YAML, ex. `[jec, golpe-pix]` |
| `lado` | não | `pro-autor` \| `pro-reu` \| `neutro` |
| `citavel` | não | se `true`, preferir seção `## Trecho citável` como `texto` |

### Exemplo de nota

```markdown
---
id: juris-tjsp-golpe-pix-001
tipo: Jurisprudência
tribunal: TJSP
tema: [jec, golpe-pix]
lado: pro-autor
status: aprovado
citavel: true
---

# Golpe PIX — falha de segurança

## Trecho citável
> Texto que pode ir na peça…

## Contexto
[[CDC art. 14]] · [[Súmula 479 STJ]]
```

O grafo `[[…]]` é só editorial; **não** vai para o vetor na v1.

## Mapeamento → `base_conhecimento`

| Nota | Coluna / comportamento |
|------|-------------------------|
| `id` | Guardar em metadado futuro **ou** prefixar `titulo` / tabela auxiliar — v1 sugerida: `fonte = obsidian:` + `id` no início do texto **ou** coluna `origem_externa` (migration opcional) |
| `tipo` | `categoria` |
| título H1 ou filename | `titulo` |
| Trecho citável ou corpo | `texto` |
| — | `fonte = obsidian` |
| — | `status = validado` (após sync) |
| — | embedding via `indexar-conhecimento` / `reindex:embeddings` |

**Upsert:** por `id` estável (preferível) ou por `titulo` igual ao seed atual (menos ideal).

## Comportamento do script (quando existir)

Nome sugerido: `npm run sync:obsidian` → `scripts/sync-obsidian-conhecimento.ts` (**não criado ainda**).

1. Ler `OBSIDIAN_VAULT_PATH` (env) ou `conhecimento/` no repo  
2. Parse Markdown + YAML (`gray-matter`)  
3. Filtrar `status === aprovado`  
4. Dry-run por default (`--write` para gravar)  
5. Upsert + log insert/update/skip  
6. Opcional: chamar reindex só dos IDs tocados  

## Estrutura sugerida do vault

```
conhecimento/           # ou pasta externa ao git
  jec/
  bancario/
  trabalhista/
  _templates/
  _rascunhos/
```

Casos-ouro e prompts de redação: **não** sincronizar para o RAG do cliente na v1 (pastas `_casos-ouro/`, `_prompts/` ignoradas).

## Critério para implementar

Só quando a curadoria no admin/scripts doer (duplicatas, multiárea, trechos citáveis, notas de aprovação). Até lá: vault opcional sem código.

## Checklist de implementação futura

- [ ] Decidir path do vault + se entra no Git  
- [ ] Migration opcional `origem_externa` / metadados JSON  
- [ ] Script dry-run + `--write`  
- [ ] Teste com 2–3 notas `aprovado`  
- [ ] Documentar no `PENDENCIAS` como feito  
- [ ] (Depois) export da fila `juris_verificacao` → Markdown  

## Relação com o pipeline atual

| Hoje | Depois do sync |
|------|----------------|
| Admin / seed Jurisprudências.ai / fila | Continuam |
| Obsidian | Editorial + (futuro) fonte alternativa de itens `aprovado` |

Não misturar rascunho do vault com seed automático da API.
