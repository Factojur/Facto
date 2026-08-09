/**
 * Núcleo jurídico curado (JEC / consumo) — fallback quando a base admin
 * ainda está vazia ou para reforçar a busca. Não substitui a tabela
 * `base_conhecimento`; complementa o RAG do Pacote A.
 */

import type { TrechoConhecimento } from "@/lib/base-conhecimento";

export const CONHECIMENTO_CURADO_JEC: TrechoConhecimento[] = [
  {
    titulo: "Lei nº 9.099/95 — arts. 3º e 4º (competência e princípios)",
    categoria: "Lei",
    texto:
      "Art. 3º O Juizado Especial Cível tem competência para conciliação, processo e julgamento das causas cíveis de menor complexidade. Art. 4º É competente o Juizado do foro do domicílio do réu ou, a critério do autor, do local onde aquele exerça atividades profissionais ou econômicas ou mantenha estabelecimento, filial, agência, sucursal ou escritório.",
  },
  {
    titulo: "Lei nº 9.099/95 — arts. 5º a 9º (partes e representação)",
    categoria: "Lei",
    texto:
      "No Juizado Especial Cível, podem ser partes pessoas físicas capazes e microempresas/empresas de pequeno porte, nos termos da lei. É facultativa a assistência por advogado nas causas de valor até vinte salários mínimos; nas de valor superior, e no recurso, a assistência é obrigatória. O Ministério Público intervirá nos casos previstos em lei.",
  },
  {
    titulo: "Lei nº 9.099/95 — arts. 38 e 54–55 (custas e recursos)",
    categoria: "Lei",
    texto:
      "Art. 38. Não se pronunciará invalidade sem prejuízo. Nas causas de valor até vinte salários mínimos, as partes comparecerão pessoalmente, podendo ser assistidas por advogado; nas de valor superior, será obrigatória a assistência. Recursos: embargos de declaração e recurso inominado, observados os arts. 48 e seguintes e 41 e seguintes da Lei 9.099/95.",
  },
  {
    titulo: "CDC — arts. 2º, 3º e 6º (consumidor, fornecedor e direitos básicos)",
    categoria: "Lei",
    texto:
      "Art. 2º Consumidor é toda pessoa física ou jurídica que adquire ou utiliza produto ou serviço como destinatário final. Art. 3º Fornecedor é toda pessoa física ou jurídica que desenvolve atividade de produção, montagem, criação, construção, transformação, importação, exportação, distribuição ou comercialização de produtos ou prestação de serviços. Art. 6º São direitos básicos do consumidor a proteção da vida, saúde e segurança; a educação e divulgação; a informação adequada; a proteção contra publicidade enganosa e abusiva; a modificação de cláusulas abusivas; a efetiva prevenção e reparação de danos; o acesso aos órgãos judiciários; a facilitação da defesa, inclusive com inversão do ônus da prova a critério do juiz.",
  },
  {
    titulo: "CDC — art. 14 (responsabilidade pelo fato do serviço)",
    categoria: "Lei",
    texto:
      "Art. 14. O fornecedor de serviços responde, independentemente de culpa, pela reparação dos danos causados aos consumidores por defeitos relativos à prestação dos serviços, bem como por informações insuficientes ou inadequadas sobre sua fruição e riscos. O serviço é defeituoso quando não fornece a segurança que o consumidor dele pode esperar.",
  },
  {
    titulo: "CDC — art. 18 (vício do produto) e art. 20 (vício do serviço)",
    categoria: "Lei",
    texto:
      "Os fornecedores respondem solidariamente pelos vícios de qualidade ou quantidade que tornem os produtos/serviços impróprios ou inadequados ao consumo a que se destinam. No vício do serviço, o consumidor pode exigir a reexecução, a restituição da quantia paga ou o abatimento do preço, sem prejuízo de perdas e danos.",
  },
  {
    titulo: "Código Civil — arts. 186, 187 e 927 (ato ilícito e dever de indenizar)",
    categoria: "Lei",
    texto:
      "Art. 186. Aquele que, por ação ou omissão voluntária, negligência ou imprudência, violar direito e causar dano a outrem, ainda que exclusivamente moral, comete ato ilícito. Art. 187. Também comete ato ilícito o titular de um direito que, ao exercê-lo, excede manifestamente os limites impostos pelo seu fim econômico ou social, pela boa-fé ou pelos bons costumes. Art. 927. Aquele que, por ato ilícito, causar dano a outrem, fica obrigado a repará-lo.",
  },
  {
    titulo: "CPC — art. 300 (tutela de urgência)",
    categoria: "Lei",
    texto:
      "Art. 300. A tutela de urgência será concedida quando houver elementos que evidenciem a probabilidade do direito e o perigo de dano ou o risco ao resultado útil do processo. Para a concessão da tutela de urgência de natureza antecipada, o juiz pode exigir caução.",
  },
  {
    titulo: "CPC — art. 373 (ônus da prova)",
    categoria: "Lei",
    texto:
      "Art. 373. O ônus da prova incumbe ao autor, quanto ao fato constitutivo de seu direito, e ao réu, quanto à existência de fato impeditivo, modificativo ou extintivo do direito do autor. Nos casos previstos em lei ou diante de peculiaridades da causa, o juiz poderá atribuir o ônus de modo diverso.",
  },
  {
    titulo: "Súmula 297 do STJ",
    categoria: "Súmula",
    texto:
      "Súmula 297/STJ: O Código de Defesa do Consumidor é aplicável às instituições financeiras.",
  },
  {
    titulo: "Súmula 479 do STJ",
    categoria: "Súmula",
    texto:
      "Súmula 479/STJ: As instituições financeiras respondem objetivamente pelos danos gerados por fortuito interno relativo a fraudes e delitos praticados por terceiros no âmbito de operações bancárias.",
  },
  {
    titulo: "Súmula 54 do STJ",
    categoria: "Súmula",
    texto:
      "Súmula 54/STJ: Os juros moratórios fluem a partir do evento danoso, em caso de responsabilidade extracontratual.",
  },
  {
    titulo: "Súmula 37 do STJ",
    categoria: "Súmula",
    texto:
      "Súmula 37/STJ: São cumuláveis as indenizações por dano material e dano moral oriundos do mesmo fato.",
  },
  {
    titulo: "Súmula 227 do STJ",
    categoria: "Súmula",
    texto:
      "Súmula 227/STJ: A pessoa jurídica pode sofrer dano moral.",
  },
  {
    titulo: "Súmula 326 do STJ",
    categoria: "Súmula",
    texto:
      "Súmula 326/STJ: Na ação de indenização por dano moral, a condenação em montante inferior ao postulado na inicial não implica sucumbência recíproca.",
  },
];
