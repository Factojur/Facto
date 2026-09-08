/**
 * Ciência no cadastro quando a OAB não é informada (opcional no perfil).
 * Serve a advogados que preferem preencher depois e a não advogados.
 * Versão sobe quando o texto mudar (registro de aceite).
 */
export const TERMO_LEIGO_VERSAO = "v2-oab-opcional";

/** @deprecated use TEXTO_AVISO_OAB_OPCIONAL — mantido para imports antigos. */
export const TEXTO_TERMO_LEIGO = `A OAB no perfil é opcional e serve à assinatura da minuta (OAB/UF nº). Você pode informar ou completar depois em Meu perfil.

Se você não for advogado(a), declare que observará os limites legais de uso do FACTO (em especial causa própria no Juizado Especial e o teto de valor previsto na Lei nº 9.099/95, quando aplicável), revisará todo o conteúdo antes de protocolar e é o único responsável pela adequação e pelo uso do material gerado.

O FACTO é ferramenta de apoio à redação: não presta assessoria jurídica, não protocola peças e não substitui a orientação de um(a) advogado(a) quando a lei ou a praxe exigirem.`;

export const TEXTO_AVISO_OAB_OPCIONAL = TEXTO_TERMO_LEIGO;
