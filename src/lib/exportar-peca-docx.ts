import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HorizontalPositionAlign,
  HorizontalPositionRelativeFrom,
  ImageRun,
  Packer,
  Paragraph,
  TextRun,
  VerticalPositionAlign,
  VerticalPositionRelativeFrom,
} from "docx";
import { saveAs } from "file-saver";
import type { EscritorioConfig } from "./escritorio-types";
import {
  FORMATACAO_FORENSE,
  cmParaTwips,
  parseMarcadorEspaco,
} from "./formatacao-forense";
import { classificarPeca, parseMarkdownRuns } from "./tipografia-peca";

const FONTE = FORMATACAO_FORENSE.fonte;
const TAMANHO = FORMATACAO_FORENSE.tamanhoPt * 2; // half-points
const TAMANHO_CITACAO = FORMATACAO_FORENSE.tamanhoCitacaoPt * 2;
const RECUO_PARAGRAFO = cmParaTwips(FORMATACAO_FORENSE.recuoPrimeiraLinhaCm);
const RECUO_CITACAO = cmParaTwips(FORMATACAO_FORENSE.recuoCitacaoCm);
const ESPACO_LINHA = 360; // 1,5 entrelinhas
const ESPACO_LINHA_CITACAO = 300; // ~1,5 em 10pt

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

function carregarDimensoesImagem(
  dataUrl: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () =>
      resolve({
        width: img.naturalWidth || 200,
        height: img.naturalHeight || 80,
      });
    img.onerror = () => resolve({ width: 200, height: 80 });
    img.src = dataUrl;
  });
}

function ajustarDimensoes(
  largura: number,
  altura: number,
  maxLargura: number,
  maxAltura: number
): { width: number; height: number } {
  if (!largura || !altura) return { width: maxLargura, height: maxAltura };
  const escala = Math.min(maxLargura / largura, maxAltura / altura, 1);
  return {
    width: Math.max(1, Math.round(largura * escala)),
    height: Math.max(1, Math.round(altura * escala)),
  };
}

/** Reduz a opacidade de uma imagem via canvas, para uso como marca d'água. */
function esmaecerImagem(dataUrl: string, opacidade = 0.12): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.globalAlpha = opacidade;
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
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

function runsDeMarkdown(
  texto: string,
  opcoes?: { forcarNegrito?: boolean; tamanho?: number }
): TextRun[] {
  const tamanho = opcoes?.tamanho ?? TAMANHO;
  const forcarNegrito = opcoes?.forcarNegrito ?? false;
  return parseMarkdownRuns(texto).map(
    (run) =>
      new TextRun({
        text: run.text,
        font: FONTE,
        size: tamanho,
        bold: forcarNegrito || Boolean(run.bold),
        italics: Boolean(run.italic),
      })
  );
}

function blocoParaParagrafo(
  tipo: string,
  texto: string,
  marcador?: ReturnType<typeof parseMarcadorEspaco>
): Paragraph | Paragraph[] {
  if (tipo === "marcador" && marcador) {
    if (marcador.linhas === 6) {
      const linhas: Paragraph[] = [];
      for (let i = 1; i <= 6; i++) {
              const extra =
                marcador.epigrafe && marcador.epigrafe.length > 0
                  ? marcador.epigrafe
                  : marcador.processo
                    ? [marcador.processo]
                    : [];
              const inicio = extra.length >= 3 ? 2 : 4;
              const idx = i - inicio;
              if (idx >= 0 && idx < extra.length) {
                linhas.push(
                  new Paragraph({
                    alignment: AlignmentType.LEFT,
                    spacing: { after: 0, line: ESPACO_LINHA },
                    children: [
                      new TextRun({
                        text: extra[idx]!,
                        font: FONTE,
                        size: TAMANHO,
                      }),
                    ],
                  })
                );
              } else {
          linhas.push(
            new Paragraph({
              spacing: { after: 0, line: ESPACO_LINHA },
              children: [new TextRun({ text: "", font: FONTE, size: TAMANHO })],
            })
          );
        }
      }
      return linhas;
    }
    return Array.from({ length: marcador.linhas }, () =>
      new Paragraph({
        spacing: { after: 0, line: ESPACO_LINHA },
        children: [new TextRun({ text: "", font: FONTE, size: TAMANHO })],
      })
    );
  }

  if (tipo === "secao-titulo") {
    return new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 240, after: 0, line: ESPACO_LINHA },
      children: runsDeMarkdown(texto, { forcarNegrito: true }),
    });
  }

  if (tipo === "enderecamento" || tipo === "nome-acao") {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0, line: ESPACO_LINHA },
      children: runsDeMarkdown(texto, { forcarNegrito: true }),
    });
  }

  if (tipo === "fechamento") {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0, line: ESPACO_LINHA },
      children: runsDeMarkdown(texto),
    });
  }

  if (tipo === "subtopico") {
    return new Paragraph({
      alignment: AlignmentType.LEFT,
      indent: { firstLine: RECUO_PARAGRAFO },
      spacing: { before: 0, after: 0, line: ESPACO_LINHA },
      children: runsDeMarkdown(texto, { forcarNegrito: true }),
    });
  }

  if (tipo === "item-pedido") {
    return new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      indent: { firstLine: RECUO_PARAGRAFO },
      spacing: { before: 0, after: 0, line: ESPACO_LINHA },
      children: runsDeMarkdown(texto, { forcarNegrito: false }),
    });
  }

  if (tipo === "citacao-juris") {
    return new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      indent: { left: RECUO_CITACAO },
      spacing: { before: 0, after: 0, line: ESPACO_LINHA_CITACAO },
      children: runsDeMarkdown(texto, { tamanho: TAMANHO_CITACAO }),
    });
  }

  if (tipo === "prova-item") {
    return new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      indent: { left: 567 },
      spacing: { before: 0, after: 0, line: ESPACO_LINHA },
      children: runsDeMarkdown(texto),
    });
  }

  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: RECUO_PARAGRAFO },
    spacing: { before: 0, after: 0, line: ESPACO_LINHA },
    children: runsDeMarkdown(texto),
  });
}

async function paragrafosCabecalho(
  escritorio: EscritorioConfig
): Promise<Paragraph[]> {
  const blocos: Paragraph[] = [];

  if (escritorio.cabecalhoBase64) {
    const dimensoes = await carregarDimensoesImagem(escritorio.cabecalhoBase64);
    const transformation = ajustarDimensoes(
      dimensoes.width,
      dimensoes.height,
      200,
      70
    );
    blocos.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new ImageRun({
            type: tipoImagem(escritorio.cabecalhoBase64),
            data: dataUrlParaBytes(escritorio.cabecalhoBase64),
            transformation,
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

async function paragrafoRodape(rodapeBase64: string): Promise<Paragraph> {
  const dimensoes = await carregarDimensoesImagem(rodapeBase64);
  const transformation = ajustarDimensoes(dimensoes.width, dimensoes.height, 300, 60);

  return new Paragraph({
    alignment: AlignmentType.CENTER,
    border: {
      top: { style: BorderStyle.SINGLE, color: "333333", size: 6, space: 6 },
    },
    children: [
      new ImageRun({
        type: tipoImagem(rodapeBase64),
        data: dataUrlParaBytes(rodapeBase64),
        transformation,
      }),
    ],
  });
}

/** Marca d'água: imagem esmaecida, flutuante e atrás do texto, repetida em toda página via cabeçalho. */
async function paragrafoMarcaDagua(marcaDaguaBase64: string): Promise<Paragraph> {
  const esmaecida = await esmaecerImagem(marcaDaguaBase64, 0.12);
  const dimensoes = await carregarDimensoesImagem(esmaecida);
  const transformation = ajustarDimensoes(dimensoes.width, dimensoes.height, 320, 320);

  return new Paragraph({
    children: [
      new ImageRun({
        type: tipoImagem(esmaecida),
        data: dataUrlParaBytes(esmaecida),
        transformation,
        floating: {
          horizontalPosition: {
            relative: HorizontalPositionRelativeFrom.PAGE,
            align: HorizontalPositionAlign.CENTER,
          },
          verticalPosition: {
            relative: VerticalPositionRelativeFrom.PAGE,
            align: VerticalPositionAlign.CENTER,
          },
          behindDocument: true,
          allowOverlap: true,
        },
      }),
    ],
  });
}

export async function gerarPecaDocxBlob(
  peca: string,
  escritorio?: EscritorioConfig
): Promise<Blob> {
  const paragrafos: Paragraph[] = [];
  for (const bloco of classificarPeca(peca)) {
    const p = blocoParaParagrafo(bloco.tipo, bloco.texto, bloco.marcador);
    if (Array.isArray(p)) paragrafos.push(...p);
    else paragrafos.push(p);
  }

  const usarTimbre = Boolean(escritorio?.usarTimbre);
  const headerParagrafos: Paragraph[] = [];

  if (usarTimbre && escritorio?.marcaDaguaBase64) {
    headerParagrafos.push(await paragrafoMarcaDagua(escritorio.marcaDaguaBase64));
  }

  if (
    usarTimbre &&
    (escritorio?.cabecalhoBase64 ||
      escritorio?.nomeEscritorio ||
      escritorio?.endereco)
  ) {
    paragrafos.unshift(...(await paragrafosCabecalho(escritorio!)));
  }

  const footers =
    usarTimbre && escritorio?.rodapeBase64
      ? { default: new Footer({ children: [await paragrafoRodape(escritorio.rodapeBase64)] }) }
      : undefined;

  const headers =
    headerParagrafos.length > 0
      ? { default: new Header({ children: headerParagrafos }) }
      : undefined;

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: cmParaTwips(FORMATACAO_FORENSE.margemSuperiorCm),
              right: cmParaTwips(FORMATACAO_FORENSE.margemDireitaCm),
              bottom: cmParaTwips(FORMATACAO_FORENSE.margemInferiorCm),
              left: cmParaTwips(FORMATACAO_FORENSE.margemEsquerdaCm),
            },
          },
        },
        headers,
        footers,
        children: paragrafos,
      },
    ],
  });

  return Packer.toBlob(doc);
}

export async function baixarPecaDocx(
  peca: string,
  escritorio?: EscritorioConfig,
  nomeArquivo = "peca-facto.docx"
): Promise<Blob> {
  const blob = await gerarPecaDocxBlob(peca, escritorio);
  saveAs(blob, nomeArquivo);
  return blob;
}
