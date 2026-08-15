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

Módulo aberto hoje: **JEC** — **base de desenvolvimento** da dashboard. Contrato compartilhado: `src/lib/minuta-modulo.ts` (`rotuloNav` no menu). Preview admin: Consumidor, Civil, Trabalhista, Família e Imobiliário (`available: false`). Contratual fica como tema no Civil.

Se alterar a dashboard JEC e **não** for específico do JEC, extrair/atualizar o compartilhado (e replicar nas áreas que já tiverem rota). Não duplicar só no `jec-form`.

## Sempre

- Minuta para **revisar e protocolar fora** do FACTO. Não enviar arquivo ao juízo.
- **JG e MLE:** checkbox só inclui o **pedido no texto**. Declaração e docs do MLE o usuário junta no protocolo.
- **Provas do fato:** insumos para a IA (contrato, print, nota). Não confundir com checklist de protocolo.
- **Já qualificado:** peças incidentais = só nome; petição inicial = qualificação mínima.
- **Corpo justificado:** fatos/direito em parágrafos de 2–3 períodos. Uma frase por linha parece alinhada à esquerda.
- Endereçamento, nome da ação, títulos, pedidos/provas e fechamento já têm regra própria — não unificar com o corpo.
- Três etapas de formulário (identificação → fatos → pedidos). Timbre + Gerar **só na aba Pedidos**.
- Copy em PT-BR. Não inventar tribunal, prazo ou rito de outra área no módulo JEC.

## JEC (módulo vivo)

- Lei 9.099/95. Leigo: teto 20 SM. Espécies em `jec-especie-peca.ts`.
- Formatação: `formatacao-forense.ts`, `tipografia-peca.ts`, `peca-paragrafos.ts`.
- Preview HTML: margens A4 no desktop; no celular reduzir recuo (não coluna de 2 palavras).
- Não exigir CPF/endereço em recurso, contestação, embargos, execução.

## Próximas áreas

Seed de juris **independente** da implementação da dashboard: não esperar a base inteira; lastro da área da vez antes de `available` para o cliente.

Cada área tem **rito, espécies, polos, prazos, leis/códigos e endereçamento próprios**. Reusar a **estrutura** do JEC (3 etapas, já qualificado, JG/MLE, provas ≠ protocolo, justificado, timbre/Gerar no fim). **Não** copiar a lista de peças do JEC. Ex.: penal = resposta à acusação (não contestação); trabalhista = reclamação (não petição inicial do Juizado). Incluir o que o rito usa; remover o que não cabe. Pesquisar o rito da área **antes** de fechar espécies e prompt.

Não ligar `available` só no catálogo. Preencher `AreaModuloConfig` + tabela de espécies da área.
