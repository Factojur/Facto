/**
 * Estilo compartilhado da folha A4 — preview, editor e PDF usam as mesmas constantes.
 * Página: A4 · margens 3/2 cm · entrelinha 1,5 (NBR 14724 adaptada).
 */
import type { CSSProperties } from "react";
import { FORMATACAO_FORENSE } from "@/lib/formatacao-forense";

export const ESTILO_FOLHA_A4: CSSProperties = {
  fontFamily: `"${FORMATACAO_FORENSE.fonte}", Times, serif`,
  fontSize: `${FORMATACAO_FORENSE.tamanhoPt}pt`,
  lineHeight: FORMATACAO_FORENSE.entrelinhas,
  color: "#000",
  textAlign: "justify",
  boxSizing: "border-box",
  width: "100%",
  maxWidth: `${FORMATACAO_FORENSE.papelLarguraMm}mm`,
  minHeight: `${FORMATACAO_FORENSE.papelAlturaMm}mm`,
  padding: `${FORMATACAO_FORENSE.margemSuperiorCm}cm ${FORMATACAO_FORENSE.margemDireitaCm}cm ${FORMATACAO_FORENSE.margemInferiorCm}cm ${FORMATACAO_FORENSE.margemEsquerdaCm}cm`,
  background: "#fff",
};

export const ESTILO_EMENTA_A4: CSSProperties = {
  fontSize: `${FORMATACAO_FORENSE.tamanhoCitacaoPt}pt`,
  marginLeft: `${FORMATACAO_FORENSE.recuoCitacaoCm}cm`,
  textAlign: "justify",
  /** NBR 10520 / 14724: citação longa em espaço simples. */
  lineHeight: FORMATACAO_FORENSE.entrelinhasCitacao,
};
