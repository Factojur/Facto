# Comparativo FACTO × MinutaIA

Gerado: 2026-09-02T18:15:00.000Z  
Rodada MinutaIA: browser em [minutaia.com.br](https://www.minutaia.com.br/) (conta `admin.facto@gmail.com`, modo Chat, plano Gratuito).

## FACTO (automático)

- [x] **0006509** — Cumprimento — exequente → agravo (interlocutória)
- [x] **hc-penal** — Habeas corpus — paciente
- [x] **bpc-prev** — BPC/INSS — previdenciário
- [x] **consumidor-enel** — Consumidor — corte de energia
- [x] **trabalhista** — Reclamação trabalhista
- [x] **jec-inicial** — JEC — petição inicial consumo
- [x] **contestacao** — Contestação — polo passivo
- [x] **lastro-topico** — Lastro A+B — parser LASTRO/ENCAIXE

## MinutaIA (browser — mesmos relatos)

| ID | Critérios a conferir | FACTO | MinutaIA | Notas |
|----|----------------------|-------|----------|-------|
| 0006509 | Infere exequente (não executada) como polo | ✓ auto | ✓ | Agravante Jefferson |
| 0006509 | Sugere agravo de instrumento (interlocutória) | ✓ auto | ✓ | Art. 1.015, p.ú. CPC |
| 0006509 | Não força MS sem pedido explícito | ✓ auto | ✓ | Só agravo |
| 0006509 | Plano coerente ao remédio | ✓ auto | ✓ | Chat + “Criar minuta” |
| hc-penal | Área penal/criminal | ✓ auto | ✓ | Processual Penal |
| hc-penal | Paciente não vira réu | ✓ auto | ✓ | Paciente Ricardo Alves |
| hc-penal | HC como espécie | ✓ auto | ✓ | HC liberatório + liminar |
| bpc-prev | Área previdenciária | ✓ auto | ✓ | Seguridade / LOAS |
| bpc-prev | INSS como réu | ✓ auto | ✓ | Polo passivo INSS |
| bpc-prev | Pedido de benefício | ✓ auto | ✓ | BPC/LOAS + tutela |
| consumidor-enel | Área consumidor | ✓ auto | ✓ | CDC |
| consumidor-enel | Réu concessionária | ✓ auto | ✓ | Enel Distribuição SP |
| consumidor-enel | Dano moral | ✓ auto | ✓ | c/c obrigação de fazer |
| trabalhista | Área trabalhista | ✓ auto | ✓ | CLT |
| trabalhista | Reclamante ativo | ✓ auto | ✓ | João × Empresa XYZ |
| trabalhista | Verbas rescisórias/FGTS | ✓ auto | ✓ | HE + FGTS 40% |
| jec-inicial | JEC ou consumidor | ✓ auto | ✓ | JEC + CDC |
| jec-inicial | Pedido indenização/troca | ✓ auto | ✓ | Obrigação de fazer c/c DM |
| jec-inicial | Valor dentro do teto | ✓ auto | ✓ | R$ 2.800 — cabível |
| contestacao | Polo passivo | ✓ auto | ✓ | Réu Banco X |
| contestacao | Espécie contestação | ✓ auto | ✓ | Art. 335 CPC |
| contestacao | Não pede confirmação de área óbvia | ✓ auto | ✓ | Resposta direta |
| lastro-topico | Plano mostra de onde veio cada tópico | ✓ auto | ✓ parcial | MinutaIA: citação inline; sem badge/`i` |
| lastro-topico | Cita fls. quando há autos | ✓ auto | ✓ parcial | MinutaIA: `(fls. N)` em texto; sem fls. clicável |

## Veredito (02/09 — após browser)

**Interpretação (área/espécie/polo) nos 7 casos:** FACTO ≈ MinutaIA — **paridade**.

**Lastro/rastreio:** MinutaIA cita fonte/`fls.` em texto puro; FACTO tem lastro estruturado (LASTRO/ENCAIXE + ícone i). Diferencial FACTO, não gap.

**Ainda não “igual no uso”:** streaming da redação, fluidez Instantâneo/Planejado no chat (no plano gratuito MinutaIA os modos ficaram desabilitados no Chat), juris/`fls.` clicáveis na peça.

## Próximo passo (pós-comparativo)

- [ ] Juris/`fls.` clicáveis na peça redigida (se `[[JURIS]]` estável nos cenários com juris)
- [ ] Inspector lateral no ícone do plano (camada C)
- [ ] Streaming redação (P1 sensação MinutaIA)
