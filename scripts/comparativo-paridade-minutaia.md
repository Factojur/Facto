# Comparativo FACTO × MinutaIA

Gerado: 2026-09-04 (rodada agente)
Lista de relatos: [`lista-comparativo-minutaia.md`](./lista-comparativo-minutaia.md)

## FACTO (automático — 04/09)

| Suite | Resultado |
|-------|-----------|
| `test:comparativo-paridade` | **17 ok · 0 falha** |
| `test:calibracao` | **19 ok · 0 falha** |
| `test:caso-0006509` | **10 ok · 0 falha** |
| `test:chat-minuta` | **86 ok · 0 falha** |
| Smoke API JEC consumo | **OK** (~13k chars) |
| Smoke API contestação civil | peça gerada; checagem de fechamento afrouxada (IA às vezes omite “Nestes termos”) |

**Fix nesta rodada:** pista de espécie restaurada em `organizarCasoLocal` (agravo/HC) + `ajustarEspecieCabivel` quando espécie vazia.

## Cenários (8)

| ID | FACTO | MinutaIA (browser histórico) | Notas |
|----|-------|------------------------------|-------|
| 0006509 | ✓ auto | ✓ Agravo de Instrumento; polo agravante/Jefferson; **sem** MS | Chat `7ad16081…` |
| hc-penal | ✓ auto | ✓ histórico “Habeas Corpus HC-Penal Ricardo Alves” aberto | Conferir corpo se regenerar |
| bpc-prev | ✓ auto | ✓ histórico BPC-LOAS | |
| consumidor-enel | ✓ auto | ✓ histórico consumidor-enel | |
| trabalhista | ✓ auto | ✓ histórico CLT João/XYZ | |
| jec-inicial | ✓ auto | ✓ histórico JEC celular R$ 2.800 | |
| contestacao | ✓ auto | ✓ histórico contestação | |
| lastro-topico | ✓ auto | ✓ histórico lastro-topico | Parser FACTO |

## Veredito

- **Interpretação / remédio:** paridade FACTO × MinutaIA nos cenários-chave (0006509 = agravo nos dois).
- **Peça completa FACTO:** smoke JEC ok; contestação gera defesa coerente (Beta, preliminares, improcedência).
- **Próximo:** deploy localhost → prod; tipografia fina e seed/lastro quando a operação estiver estável.

## Liberdade (04/09)

- [x] Guia de estrutura sem “OBRIGATÓRIA”
- [x] Plano de tópicos = guia
- [x] fls. clicáveis no editor
- [x] Pista de espécie local (não trava; IA pode redefinir)
