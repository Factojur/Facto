import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { saveAs } from "file-saver";
import type { EscritorioConfig } from "./escritorio-types";

const FONTE = "Times New Roman";
const TAMANHO = 24; // 12 pt em half-points
const RECUO_PARAGRAFO = 1134; // ~2 cm em twips
const ESPACO_LINHA = 360; // 1,5 entrelinhas

function dataUrlParaBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1];
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

function tipoImagem(dataUrl: string): "png" | "jpg" | "gif" | "bmp" {
  if (dataUrl.includes("image/png")) return "png";
  if (dataUrl.includes("image/gif")) return "gif";
  if (dataUrl.includes("image/bmp")) return "bmp";
  return "jpg";
}

function paragrafoTimbre(texto: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [
      new TextRun({ text: texto, font: FONTE, size: 20, color: "333333" }),
    ],
  });
}

function linhaParaParagrafo(linha: string): Paragraph {
  const t = linha.trim();
  if (!t) {
    return new Paragraph({ spacing: { after: 120 } });
  }

  const base = { font: FONTE, size: TAMANHO };

  if (/^[IVX]+ —/.test(t)) {
    return new Paragraph({
      spacing: { before: 280, after: 160, line: ESPACO_LINHA },
      children: [new TextRun({ ...base, text: t, bold: true })],
    });
  }

  if (
    /^EXCELENTÍSSIMO|^DA COMARCA/.test(t) ||
    (t === t.toUpperCase() && t.length < 90 && !linha.startsWith("\t"))
  ) {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 120, line: ESPACO_LINHA },
      children: [new TextRun({ ...base, text: t, bold: true })],
    });
  }

  if (/^(Termos em que|Pede deferimento)/.test(t) || t.startsWith("OAB/")) {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 80, line: ESPACO_LINHA },
      children: [new TextRun({ ...base, text: t })],
    });
  }

  if (/^[a-z]\) /.test(t) || t.startsWith("- ")) {
    return new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      indent: { left: 567 },
      spacing: { after: 120, line: ESPACO_LINHA },
      children: [new TextRun({ ...base, text: t })],
    });
  }

  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: RECUO_PARAGRAFO },
    spacing: { after: 200, line: ESPACO_LINHA },
    children: [new TextRun({ ...base, text: t })],
  });
}

function blocosTimbre(escritorio: EscritorioConfig): Paragraph[] {
  const blocos: Paragraph[] = [];

  if (escritorio.logoBase64) {
    blocos.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new ImageRun({
            type: tipoImagem(escritorio.logoBase64),
            data: dataUrlParaBytes(escritorio.logoBase64),
            transformation: { width: 160, height: 60 },
          }),
        ],
      })
    );
  }

  const linhas = [
    escritorio.nomeEscritorio,
    escritorio.endereco,
    escritorio.cidadeUf,
    [escritorio.telefone, escritorio.emailEscritorio].filter(Boolean).join(" · "),
    escritorio.site,
  ].filter((l): l is string => Boolean(l));

  linhas.forEach((l) => blocos.push(paragrafoTimbre(l)));

  blocos.push(
    new Paragraph({
      spacing: { before: 160, after: 280 },
      border: {
        bottom: { style: BorderStyle.SINGLE, color: "333333", size: 6, space: 1 },
      },
      children: [new TextRun("")],
    })
  );

  return blocos;
}

export async function baixarPecaDocx(
  peca: string,
  escritorio?: EscritorioConfig,
  nomeArquivo = "peca-facto.docx"
): Promise<void> {
  const paragrafos: Paragraph[] = [];

  if (escritorio?.usarTimbre) {
    paragrafos.push(...blocosTimbre(escritorio));
  }

  peca.split("\n").forEach((linha) => {
    paragrafos.push(linhaParaParagrafo(linha));
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1701,
              right: 1134,
              bottom: 1134,
              left: 1701,
            },
          },
        },
        children: paragrafos,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, nomeArquivo);
}
