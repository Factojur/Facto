# Comparativo FACTO × MinutaIA

Gerado: 2026-09-02T15:29:28.491Z

## FACTO (automático)

- [x] **0006509** — Cumprimento — exequente → MS constitucional
- [x] **hc-penal** — Habeas corpus — paciente
- [x] **bpc-prev** — BPC/INSS — previdenciário
- [x] **consumidor-enel** — Consumidor — corte de energia
- [x] **trabalhista** — Reclamação trabalhista
- [x] **jec-inicial** — JEC — petição inicial consumo
- [x] **contestacao** — Contestação — polo passivo
- [x] **lastro-topico** — Lastro A+B — parser LASTRO/ENCAIXE

## MinutaIA (manual — mesmo relato/PDF)

| ID | Critérios a conferir | FACTO | MinutaIA | Notas |
|----|----------------------|-------|----------|-------|
| 0006509 | Infere exequente (não executada) como polo | ✓ auto | ☐ | |
| 0006509 | Sugere MS (não agravo da executada) | ✓ auto | ☐ | |
| 0006509 | Área constitucional | ✓ auto | ☐ | |
| 0006509 | Plano com tópicos coerentes ao remédio | ✓ auto | ☐ | |
| hc-penal | Área penal/criminal | ✓ auto | ☐ | |
| hc-penal | Paciente não vira réu | ✓ auto | ☐ | |
| hc-penal | HC como espécie | ✓ auto | ☐ | |
| bpc-prev | Área previdenciária | ✓ auto | ☐ | |
| bpc-prev | INSS como réu | ✓ auto | ☐ | |
| bpc-prev | Pedido de benefício | ✓ auto | ☐ | |
| consumidor-enel | Área consumidor | ✓ auto | ☐ | |
| consumidor-enel | Réu concessionária | ✓ auto | ☐ | |
| consumidor-enel | Dano moral | ✓ auto | ☐ | |
| trabalhista | Área trabalhista | ✓ auto | ☐ | |
| trabalhista | Reclamante ativo | ✓ auto | ☐ | |
| trabalhista | Verbas rescisórias/FGTS | ✓ auto | ☐ | |
| jec-inicial | JEC ou consumidor | ✓ auto | ☐ | |
| jec-inicial | Pedido indenização/troca | ✓ auto | ☐ | |
| jec-inicial | Valor dentro do teto | ✓ auto | ☐ | |
| contestacao | Polo passivo | ✓ auto | ☐ | |
| contestacao | Espécie contestação | ✓ auto | ☐ | |
| contestacao | Não pede confirmação de área óbvia | ✓ auto | ☐ | |
| lastro-topico | Plano mostra de onde veio cada tópico | ✓ auto | ☐ | |
| lastro-topico | Cita fls. quando há autos | ✓ auto | ☐ | |

## Próximo passo (pós-comparativo)

- [ ] Juris/`fls.` clicáveis na peça redigida (se `[[JURIS]]` estável nos cenários com juris)
- [ ] Inspector lateral no ícone do plano (camada C)
