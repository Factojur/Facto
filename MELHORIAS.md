# Melhorias FACTO — ordem de aplicação

Este arquivo **não** substitui `PENDENCIAS.md`. Pendências = seed, deploy, MP, lacunas da base. Aqui = o que aplicar **agora que a minuta mudou** (entrada única, Falar, auditor, lastro por polo), inspirado nos pontos fortes do MinutaIA **sem virar chat nem copiar o produto deles**.

Trava permanente: minuta para revisar e protocolar fora; rito/endereçamento/espécie no código; Gerar só em Pedidos; julgado só da base FACTO ou anexo do caso; sem web na peça; sem modo curto.

---

## 0. Já no produto (não refazer)

- Entrada única (relato/PDF → 3 abas; campo incerto vazio).
- Falar (transcreve; não gera peça; não gasta cota de análise). Falar na Entrada replica o texto em Fatos (sem segunda transcrição).
- Auditor determinístico + skins visíveis (sem 7ª skin).
- Lastro da Pesquisa favorável ao polo; ementa contrária fora.
- Contestação visível nos dois polos; contraposto/reconvenção = checkbox.
- **Polo no seletor em todas as áreas** do dashboard (JECRIM, Penal, Prev, Empresarial, Digital, Ambiental, PI, Internacional, Médico, Agrário, Eleitoral inclusive).
- Gate de plano na página **e** nas APIs da minuta (voz, entrada, assistente, juris, ajuste).
- Limite de transcrições por hora; cron de compras exige `CRON_SECRET` em produção.
- Webhook MP: produção **sem** `MERCADOPAGO_WEBHOOK_SECRET` ou HMAC inválido → 401 (não processa).
- Chips de conferência após Preencher + trecho do PDF/OCR na Entrada.
- Teses canônicas Trabalhista (horas extras, pejotização), Família (alimentos), Imobiliário (atraso de obra), Previdenciário (tempo especial).
- Ajuste pontual: trecho + pedido (teto 2). Citação do anexo com página se o PDF tiver marcador.
- Histórico JEC: reabrir / exportar / gerar de novo a peça vinculada (local).

---

## 1. Esta semana — qualidade visível e segurança do usuário

1. ~~**Conferência depois da entrada única**~~ — feito (18/08 noite, local; conferir no localhost).
2. ~~**O que o OCR/PDF leu**~~ — feito.
3. ~~**Teses canônicas além de JEC/CDC**~~ — feito.
4. **Confirmar na Vercel** `MERCADOPAGO_WEBHOOK_SECRET` e `CRON_SECRET`. O código já recusa webhook sem secret em produção; falta conferir as vars no painel.

## 2. Em seguida — rito nas áreas que ainda copiam pouco o JEC

5. ~~**Polo no seletor**~~ — feito nas 11 áreas que faltavam.
6. ~~**Casos-ouro / smoke**~~ — RE, ADI e resposta à acusação adicionados (MS e trabalhista defesa já existiam).
7. **Lastro da área** — deixar o seed 201–227 (STF, TRF prev, TST, CARF) correr às 01h; depois testar “Buscar na base FACTO” em Constitucional e Previdenciário. Eleitoral **não** inventa TRE/TSE.

## 3. Pré-lançamento — histórico e conferência (ideia MinutaIA, molde FACTO)

8. **Histórico de minutas** — JEC local: reabrir/exportar/gerar de novo. Ainda não estende a outras áreas nem nuvem para o cliente.
9. ~~**Ajuste pontual na preview**~~ — trecho + pedido.
10. **Citação rastreável ao PDF do caso** — página se o anexo tiver `--- página N ---` (extração no navegador). Sem URL. Distinguir base vs anexo no auditor fica para depois.
11. **Compra real ponta a ponta** — webhook + e-mail + convite + cadastro + cancelamento CDC. Único bloqueio comercial; está em `PENDENCIAS.md`.

## 4. Depois do lastro e da receita — crescimento, sem clone

12. **Estilo do escritório** — só o que já cabe no molde (timbre, vocativo, fecho). Não aprender sentença do usuário a ponto de soltar o esqueleto.
13. **Autos longos com qualidade** — janela 180 mil já existe; melhorar extração de “último ato” e número CNJ. Não prometer 6.000 páginas.
14. **Extensão PJe / e-SAJ** — só quando o MRR pagar o custo e o suporte. Até lá, PDF colado na entrada única.
15. **Manus + Obsidian** — **adiados (24/08)**. Não entram nesta fila de minuta. Manus só ops no futuro; Obsidian só export/sync quando curadoria doer (`PENDENCIAS` P3).

---

## Não aplicar (erros do MinutaIA / fora do FACTO)

- Gerar a peça a partir do chat ou da voz.
- “Continuar sem contexto” / modo curto / sentença truncada.
- Busca na web ou analogia solta na minuta.
- Skills editáveis pelo cliente (~2.000 pacotes).
- Biblioteca de lei no mesmo saco da jurisprudência.
- Produto para juiz, MP ou defensoria (sentença/parecer).
- Clonar preço, UI azul ou extensão Chrome agora.

---

## Auditoria das áreas (18/08 noite)

Rodado: `test:auditoria-pecas`, `test:polo-especies`, `test:qualificacao-partes` — conferir de novo após o polo nas 11 áreas. MLE oculto em Penal/JECRIM/Eleitoral/Constitucional.

O seletor “Estou atuando pelo…” passou a existir em todas as áreas do dashboard. Penal: HC/revisão no paciente; resposta à acusação no acusado (passivo). JECRIM: queixa no querelante; defesa no acusado.
