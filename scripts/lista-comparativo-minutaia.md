# Lista de testes — FACTO × MinutaIA (04/09)

Use o **mesmo relato** nos dois produtos. Critérios = o que conferir.

| # | ID | Área / remédio esperado | Critérios |
|---|-----|-------------------------|-----------|
| 1 | `0006509` | Agravo (cumprimento / interlocutória) | Polo exequente; agravo; **não** MS |
| 2 | `hc-penal` | HC criminal | Área penal; paciente ≠ réu; espécie HC |
| 3 | `bpc-prev` | Previdenciário | Área prev; INSS réu; pedido benefício |
| 4 | `consumidor-enel` | Consumidor | Área consumidor; Enel ré; dano moral |
| 5 | `trabalhista` | Reclamação CLT | Área trabalhista; reclamante; FGTS/HE |
| 6 | `jec-inicial` | JEC / consumo | JEC ou consumidor; troca/indenização; teto |
| 7 | `contestacao` | Contestação | Polo passivo; espécie contestação |
| 8 | `lastro-topico` | (só FACTO parser) | LASTRO/ENCAIXE no plano |

---

## Relatos (copiar/colar)

### 1 — 0006509
```
Cumprimento de sentença nº 0006509. Exequente Jefferson. Executada FACULDADES METROPOLITANAS. Decisão ilegal do juiz que reduziu astreintes de R$ 22.200 para R$ 600. Quero agravar a decisão interlocutória.
```

### 2 — hc-penal
```
Meu cliente Ricardo Alves foi preso em flagrante por furto simples. Peço habeas corpus contra prisão preventiva. Tem moradia e família na cidade.
```

### 3 — bpc-prev
```
Pedi BPC/LOAS para meu filho. O INSS indeferiu. Renda familiar per capita R$ 180. Quero ação contra o INSS para conceder o benefício.
```

### 4 — consumidor-enel
```
Caso consumidor CDC. Sou Maria Santos, brasileira, CPF 529.982.247-25, residente em Campinas/SP. A Enel São Paulo cortou a energia em 15/01/2026 sem aviso. Pede religação, tutela e danos morais de R$ 8.000.
```

### 5 — trabalhista
```
Reclamação trabalhista CLT verbas rescisórias. Reclamante João Silva contra Empresa XYZ Ltda. Horas extras e FGTS não pagos após demissão sem justa causa em São Paulo/SP.
```

### 6 — jec-inicial
```
Petição inicial no juizado especial cível Lei 9.099. Autor comprou celular com defeito, loja recusou troca. Valor R$ 2.800. Quer troca ou restituição e danos morais.
```

### 7 — contestacao
```
Contestação. Réu banco X contesta ação de cobrança indevida. Impugna fatos e pedidos. Não reconhece a dívida.
```

### 8 — lastro-topico
(Automático no FACTO — não precisa colar no MinutaIA.)

---

## Como rodar no FACTO (agente)

```bash
npm run test:comparativo-paridade
npm run test:calibracao
npm run test:caso-0006509
```

Peça completa (1 crédito cada): `npx tsx scripts/smoke-api-dois-casos-peca.ts`
