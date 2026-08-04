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
  dividirBlocosPeca,
  ehMarcadorEspacoEnderecamento,
} from "./formatacao-forense";

const FONTE = FORMATACAO_FORENSE.fonte;
const TAMANHO = FORMATACAO_FORENSE.tamanhoPt * 2; // half-points
const RECUO_PARAGRAFO = cmParaTwips(FORMATACAO_FORENSE.recuoPrimeiraLinhaCm);
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

function linhaParaParagrafo(
  linha: string,
  emFechamento = false
): Paragraph | Paragraph[] {
  const t = linha.trim();
  if (!t) {
    return new Paragraph({ spacing: { after: 40 } });
  }

  if (ehMarcadorEspacoEnderecamento(t)) {
    return Array.from({ length: FORMATACAO_FORENSE.linhasAposEnderecamento }, () =>
      new Paragraph({
        spacing: { after: 0, line: ESPACO_LINHA },
        children: [new TextRun({ text: "", font: FONTE, size: TAMANHO })],
      })
    );
  }

  const base = { font: FONTE, size: TAMANHO };

  function runsDeMarkdown(texto: string, forcarNegrito = false): TextRun[] {
    const partes = texto.split(/(\*\*[^*]+?\*\*|\*[^*]+?\*)/g).filter(Boolean);
    return partes.map((parte) => {
      if (/^\*\*([^*]+?)\*\*$/.test(parte)) {
        const limpo = parte.replace(/^\*\*([^*]+?)\*\*$/, "$1");
        return new TextRun({ ...base, text: limpo, bold: true });
      }
      if (/^\*([^*]+?)\*$/.test(parte)) {
        const limpo = parte.replace(/^\*([^*]+?)\*$/, "$1");
        return new TextRun({
          ...base,
          text: limpo,
          italics: true,
          bold: forcarNegrito,
        });
      }
      return new TextRun({ ...base, text: parte, bold: forcarNegrito });
    });
  }

  if (/^[IVXLCDM]+\s*[-—–]/i.test(t)) {
    return new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 200, after: 80, line: ESPACO_LINHA },
      children: runsDeMarkdown(t, true),
    });
  }

  if (
    /^EXCELENTÍSSIMO|^DA COMARCA|^JU[IÍ]ZO\s+DA/i.test(t) ||
    (/^(?:PETI[CÇ][AÃ]O|A[CÇ][AÃ]O|EXECU[CÇ][AÃ]O|EMBARGOS|RECURSO)/i.test(t) &&
      t.length < 140)
  ) {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 40, line: ESPACO_LINHA },
      children: runsDeMarkdown(t, true),
    });
  }

  if (
    emFechamento ||
    /^(Termos em que|Pede e espera deferimento|Pede deferimento)/.test(t) ||
    t.startsWith("OAB/")
  ) {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 40, line: ESPACO_LINHA },
      children: runsDeMarkdown(t),
    });
  }

  if (/^[a-z]\) /.test(t) || t.startsWith("- ")) {
    return new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      indent: { left: 567 },
      spacing: { before: 80, after: 80, line: ESPACO_LINHA },
      children: runsDeMarkdown(t),
    });
  }

  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: RECUO_PARAGRAFO },
    spacing: { after: 120, line: ESPACO_LINHA },
    children: runsDeMarkdown(t),
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
  let emFechamento = false;
  for (const bloco of dividirBlocosPeca(peca)) {
    if (/^(Termos em que|Pede e espera deferimento|Pede deferimento)/i.test(bloco)) {
      emFechamento = true;
    }
    const p = linhaParaParagrafo(bloco, emFechamento);
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
