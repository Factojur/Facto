/**
 * TSE — Lote 3: Súmulas 21 a 30.
 * Fonte: Portal TSE — Súmulas do TSE (codigo-eleitoral/sumulas)
 */

import { sumulaTse, type SumulaLoteItem } from "@/lib/sumulas/types";

export const SUMULAS_TSE_LOTE_03: SumulaLoteItem[] = [
  sumulaTse(
    21,
    "O prazo para ajuizamento da representação contra doação de campanha acima do limite legal é de 180 dias, contados da data da diplomação.",
    { status: "cancelada" }
  ),
  sumulaTse(
    22,
    "Não cabe mandado de segurança contra decisão judicial recorrível, salvo situações de teratologia ou manifestamente ilegais."
  ),
  sumulaTse(
    23,
    "Não cabe mandado de segurança contra decisão judicial transitada em julgado."
  ),
  sumulaTse(
    24,
    "Não cabe recurso especial eleitoral para simples reexame do conjunto fático-probatório."
  ),
  sumulaTse(
    25,
    "É indispensável o esgotamento das instâncias ordinárias para a interposição de recurso especial eleitoral."
  ),
  sumulaTse(
    26,
    "É inadmissível o recurso que deixa de impugnar especificamente fundamento da decisão recorrida que é, por si só, suficiente para a manutenção desta."
  ),
  sumulaTse(
    27,
    "É inadmissível recurso cuja deficiência de fundamentação impossibilite a compreensão da controvérsia."
  ),
  sumulaTse(
    28,
    "A divergência jurisprudencial que fundamenta o recurso especial interposto com base na alínea b do inciso I do art. 276 do Código Eleitoral somente estará demonstrada mediante a realização de cotejo analítico e a existência de similitude fática entre os acórdãos paradigma e o aresto recorrido."
  ),
  sumulaTse(
    29,
    "A divergência entre julgados do mesmo Tribunal não se presta a configurar dissídio jurisprudencial apto a fundamentar recurso especial eleitoral."
  ),
  sumulaTse(
    30,
    "Não se conhece de recurso especial eleitoral por dissídio jurisprudencial, quando a decisão recorrida estiver em conformidade com a jurisprudência do Tribunal Superior Eleitoral."
  ),
];
