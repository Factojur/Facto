import type { EscritorioConfig } from "./escritorio-types";
import {
  FORMATACAO_FORENSE,
  dividirBlocosPeca,
  ehMarcadorEspacoEnderecamento,
} from "./formatacao-forense";
import { normalizarTextoFatos } from "./peca-paragrafos";

/** Aplica regras de espaçamento entre seções da peça. */
export function aplicarFormatacaoTextoJuridico(pecaBruta: string, fatos: string): string {
  const fatosFormatados = normalizarTextoFatos(fatos);

  return pecaBruta.replace(
    /I\s*[-—–]\s*DOS FATOS\n+[\s\S]*?(?=\n+II\s*[-—–]\s*DO DIREITO)/i,
    `I - DOS FATOS\n${fatosFormatados}`
  );
}

function escapeHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Escapa HTML e converte **negrito** / *itálico* Markdown. */
function formatarInlineHtml(texto: string): string {
  const tokens = texto.split(/(\*\*[^*]+?\*\*|\*[^*]+?\*)/g).filter((t) => t.length > 0);

  return tokens
    .map((token) => {
      const negrito = /^\*\*([^*]+?)\*\*$/.exec(token);
      if (negrito) {
        return `<strong>${escapeHtml(negrito[1]!)}</strong>`;
      }
      const italico = /^\*([^*]+?)\*$/.exec(token);
      if (italico) {
        return `<em>${escapeHtml(italico[1]!)}</em>`;
      }
      return escapeHtml(token);
    })
    .join("");
}

function blocoParaHtml(bloco: string): string {
  // 1 linha = 1 parágrafo (espaçamento rígido: sem linha em branco interna).
  const paragrafos = dividirBlocosPeca(bloco);

  const titulosSecao = /^([IVXLCDM]+)\s*[-—–]\s+/i;
  const subtopico = /^([a-z]\)|\d+\.\d*|\([a-z]\))\s+/i;
  const enderecamento = /^EXCELENTÍSSIMO|^DA COMARCA|^JU[IÍ]ZO\s+DA/i;
  const inicioFechamento =
    /^(Termos em que|Pede e espera deferimento|Pede deferimento)/i;
  const pedido = /^[a-z]\)\s+/i;
  const nomeAcao =
    /^(?:PETI[CÇ][AÃ]O\s+INICIAL\s*[—–-]?\s*)?(?:A[CÇ][AÃ]O\s+DE\s+|EXECU[CÇ][AÃ]O\s+|EMBARGOS\s+|RECURSO\s+)/i;

  let emFechamento = false;

  return paragrafos
    .map((t) => {
      if (ehMarcadorEspacoEnderecamento(t)) {
        return `<div class="espaco-enderecamento" aria-hidden="true"></div>`;
      }
      if (inicioFechamento.test(t)) {
        emFechamento = true;
      }
      if (titulosSecao.test(t)) {
        return `<p class="secao-titulo">${formatarInlineHtml(t)}</p>`;
      }
      if (enderecamento.test(t)) {
        return `<p class="enderecamento">${formatarInlineHtml(t)}</p>`;
      }
      if (
        nomeAcao.test(t) &&
        (t === t.toUpperCase() || t.length < 140)
      ) {
        return `<p class="nome-acao">${formatarInlineHtml(t)}</p>`;
      }
      if (
        !emFechamento &&
        t === t.toUpperCase() &&
        t.length < 100 &&
        !t.startsWith("-") &&
        !t.startsWith("[") &&
        !titulosSecao.test(t)
      ) {
        return `<p class="enderecamento">${formatarInlineHtml(t)}</p>`;
      }
      if (emFechamento || t.startsWith("OAB/")) {
        return `<p class="fechamento">${formatarInlineHtml(t)}</p>`;
      }
      if (pedido.test(t) || subtopico.test(t)) {
        return `<p class="pedido">${formatarInlineHtml(t)}</p>`;
      }
      if (t.startsWith("- ")) {
        return `<p class="prova-item">${formatarInlineHtml(t)}</p>`;
      }
      return `<p class="paragrafo">${formatarInlineHtml(t)}</p>`;
    })
    .join("\n");
}

function gerarCabecalhoHtml(escritorio: EscritorioConfig): string {
  if (!escritorio.usarTimbre) return "";

  const linhas = [
    escritorio.nomeEscritorio,
    escritorio.endereco,
    escritorio.cidadeUf,
    [escritorio.telefone, escritorio.emailEscritorio].filter(Boolean).join(" · "),
    escritorio.site,
  ].filter((l): l is string => Boolean(l));

  const imagem = escritorio.cabecalhoBase64
    ? `<img src="${escritorio.cabecalhoBase64}" alt="Cabeçalho do escritório" class="timbre-cabecalho-img" />`
    : "";

  if (!imagem && linhas.length === 0) return "";

  return `
    <header class="timbre-cabecalho">
      ${imagem}
      <div class="timbre-texto">
        ${linhas.map((l) => `<p>${escapeHtml(l)}</p>`).join("")}
      </div>
      <hr class="timbre-linha" />
    </header>
  `;
}

function gerarRodapeHtml(escritorio: EscritorioConfig): string {
  if (!escritorio.usarTimbre || !escritorio.rodapeBase64) return "";

  return `
    <footer class="timbre-rodape">
      <img src="${escritorio.rodapeBase64}" alt="Rodapé do escritório" />
    </footer>
  `;
}

function gerarMarcaDaguaHtml(escritorio: EscritorioConfig): string {
  if (!escritorio.usarTimbre || !escritorio.marcaDaguaBase64) return "";

  return `<img src="${escritorio.marcaDaguaBase64}" alt="" class="timbre-marca-dagua" aria-hidden="true" />`;
}

export function gerarDocumentoTimbrado(
  pecaTexto: string,
  escritorio?: EscritorioConfig
): { pecaHtml: string; cssImpressao: string } {
  const corpoHtml = blocoParaHtml(pecaTexto);
  const cabecalho = escritorio?.usarTimbre ? gerarCabecalhoHtml(escritorio) : "";
  const rodape = escritorio?.usarTimbre ? gerarRodapeHtml(escritorio) : "";
  const marcaDagua = escritorio?.usarTimbre ? gerarMarcaDaguaHtml(escritorio) : "";

  const cssImpressao = `
    @page {
      size: A4;
      margin: ${FORMATACAO_FORENSE.margemSuperiorCm}cm ${FORMATACAO_FORENSE.margemDireitaCm}cm ${FORMATACAO_FORENSE.margemInferiorCm}cm ${FORMATACAO_FORENSE.margemEsquerdaCm}cm;
    }
    .documento-juridico {
      position: relative;
      font-family: "${FORMATACAO_FORENSE.fonte}", Times, serif;
      font-size: ${FORMATACAO_FORENSE.tamanhoPt}pt;
      line-height: ${FORMATACAO_FORENSE.entrelinhas};
      color: #000;
      max-width: 21cm;
      margin: 0 auto;
      background: #fff;
      padding: ${FORMATACAO_FORENSE.margemSuperiorCm}cm ${FORMATACAO_FORENSE.margemDireitaCm}cm ${FORMATACAO_FORENSE.margemInferiorCm}cm ${FORMATACAO_FORENSE.margemEsquerdaCm}cm;
      box-sizing: border-box;
      text-align: justify;
    }
    .documento-juridico .espaco-enderecamento {
      /* 6 quebras com entrelinha 1,5 (praxe forense FACTO) */
      height: calc(1.5em * ${FORMATACAO_FORENSE.linhasAposEnderecamento});
      width: 100%;
    }
    .documento-juridico .documento-conteudo {
      position: relative;
      z-index: 1;
    }
    .documento-juridico .timbre-marca-dagua {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      max-width: 55%;
      max-height: 55%;
      object-fit: contain;
      opacity: 0.08;
      z-index: 0;
      pointer-events: none;
    }
    .documento-juridico .timbre-cabecalho {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .documento-juridico .timbre-cabecalho-img {
      max-height: 70px;
      max-width: 200px;
      object-fit: contain;
      margin-bottom: 0.5rem;
    }
    .documento-juridico .timbre-texto p {
      margin: 0.15rem 0;
      font-size: 10pt;
      text-align: center;
    }
    .documento-juridico .timbre-linha {
      border: none;
      border-top: 1px solid #333;
      margin-top: 0.75rem;
    }
    .documento-juridico .timbre-rodape {
      margin-top: 2rem;
      padding-top: 0.75rem;
      border-top: 1px solid #333;
      text-align: center;
    }
    .documento-juridico .timbre-rodape img {
      max-height: 60px;
      max-width: 100%;
      object-fit: contain;
    }
    .documento-juridico .minuta-aviso {
      text-align: center;
      text-indent: 0;
      font-size: 9pt;
      font-weight: bold;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #92400e;
      border: 1px solid #f59e0b;
      background: #fffbeb;
      padding: 0.35rem 0.5rem;
      margin: 0 0 1rem;
    }
    .documento-juridico .enderecamento {
      text-align: center;
      font-weight: bold;
      text-indent: 0;
      margin: 0.35rem 0 0.15rem;
    }
    .documento-juridico .secao-titulo {
      font-weight: bold;
      text-align: justify;
      text-indent: 0;
      margin: 1.1em 0 0.55em;
    }
    .documento-juridico p,
    .documento-juridico .paragrafo {
      text-align: justify;
      text-indent: 2cm;
      margin: 0 0 0.65em;
      white-space: normal;
    }
    .documento-juridico .secao-titulo,
    .documento-juridico .enderecamento,
    .documento-juridico .nome-acao,
    .documento-juridico .pedido,
    .documento-juridico .prova-item,
    .documento-juridico .fechamento {
      text-indent: 0;
    }
    .documento-juridico .nome-acao {
      text-align: center;
      font-weight: bold;
      margin: 0.5em 0 0;
      text-transform: uppercase;
    }
    .documento-juridico em {
      font-style: italic;
    }
    .documento-juridico .prova-item,
    .documento-juridico .pedido {
      text-align: justify;
      margin: 0.45em 0 0.45em 1cm;
    }
    .documento-juridico .fechamento {
      text-align: center;
      text-indent: 0;
      margin: 0.35rem 0 4px;
    }
    @media print {
      body { margin: 0; }
      .no-print { display: none !important; }
    }
  `;

  const pecaHtml = `
    <style>${cssImpressao}</style>
    <article class="documento-juridico">
      ${marcaDagua}
      <div class="documento-conteudo">
        <p class="minuta-aviso">Minuta FACTO — revise antes de protocolar</p>
        ${cabecalho}
        ${corpoHtml}
        ${rodape}
      </div>
    </article>
  `;

  return { pecaHtml, cssImpressao };
}
