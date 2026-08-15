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

Módulo aberto hoje: **JEC**. Regras gerais valem nas próximas áreas; o bloco JEC só se a tarefa for JEC.

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

Não ligar `available` só no catálogo. Cada área precisa de rito, espécies, prazos, endereçamento e rota próprios (ver PENDENCIAS — abertura de áreas). Reusar o que for comum (já qualificado, JG, provas, justificado).
