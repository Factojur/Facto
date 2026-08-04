import type { EscritorioConfig } from "./escritorio-types";
import {
  FORMATACAO_FORENSE,
  dividirBlocosPeca,
  parseMarcadorEspaco,
} from "./formatacao-forense";
import { normalizarTextoFatos } from "./peca-paragrafos";

/** Aplica normalização de parágrafos na seção DOS FATOS já presente na peça. */
export function aplicarFormatacaoTextoJuridico(pecaBruta: string): string {
  return pecaBruta.replace(
    /I\s*[-—–]\s*DOS FATOS\n+([\s\S]*?)(?=\n+II\s*[-—–]\s*DO DIREITO)/i,
    (_m, corpo: string) => `I - DOS FATOS\n${normalizarTextoFatos(String(corpo))}`
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

function htmlEspaco(linhas: 1 | 2 | 6, processo?: string): string {
  if (linhas !== 6) {
    return `<div class="espaco-linhas espaco-${linhas}" aria-hidden="true"></div>`;
  }

  const itens: string[] = [];
  for (let i = 1; i <= 6; i++) {
    if (i === 4 && processo) {
      itens.push(
        `<p class="numero-processo">${escapeHtml(processo)}</p>`
      );
    } else {
      itens.push(`<div class="espaco-linha" aria-hidden="true"></div>`);
    }
  }
  return `<div class="espaco-6-linhas">${itens.join("")}</div>`;
}

function blocoParaHtml(bloco: string): string {
  const paragrafos = dividirBlocosPeca(bloco);

  const titulosSecao = /^([IVXLCDM]+)\s*[-—–]\s+/i;
  const subtopico = /^(?:\*\*)?([a-z]\)|\d+\.\d*|\([a-z]\))\s+/i;
  const enderecamento =
    /^EXCELENTÍSSIMO|^DA COMARCA|^JU[IÍ]ZO\s+DA|^EXCELENTISSIMO/i;
  const inicioFechamento =
    /^(Nestes termos|Termos em que|Pede e espera deferimento|Pede deferimento|pede deferimento)/i;
  const nomeAcao =
    /^(?:PETI[CÇ][AÃ]O\s+INICIAL\s*[—–-]?\s*)?(?:A[CÇ][AÃ]O\s+|EXECU[CÇ][AÃ]O\s+|EMBARGOS\s+|RECURSO\s+|CONTESTA)/i;

  let emFechamento = false;

  return paragrafos
    .map((t) => {
      const marcador = parseMarcadorEspaco(t);
      if (marcador) {
        return htmlEspaco(marcador.linhas, marcador.processo);
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
        (t === t.toUpperCase() || t.length < 180)
      ) {
        return `<p class="nome-acao">${formatarInlineHtml(t)}</p>`;
      }
      if (
        !emFechamento &&
        t === t.toUpperCase() &&
        t.length < 100 &&
        !t.startsWith("-") &&
        !t.startsWith("[") &&
        !titulosSecao.test(t) &&
        !/^ADVOGADO$/i.test(t)
      ) {
        return `<p class="enderecamento">${formatarInlineHtml(t)}</p>`;
      }
      if (emFechamento || t.startsWith("OAB/") || /^Advogado$/i.test(t)) {
        return `<p class="fechamento">${formatarInlineHtml(t)}</p>`;
      }
      if (subtopico.test(t)) {
        return `<p class="subtopico">${formatarInlineHtml(t)}</p>`;
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
    .documento-juridico .espaco-enderecamento,
    .documento-juridico .espaco-linhas {
      width: 100%;
    }
    .documento-juridico .espaco-1 {
      height: calc(1.5em * 1);
    }
    .documento-juridico .espaco-2 {
      height: calc(1.5em * 2);
    }
    .documento-juridico .espaco-6-linhas {
      width: 100%;
      margin: 0;
      padding: 0;
    }
    .documento-juridico .espaco-6-linhas .espaco-linha {
      height: 1.5em;
      margin: 0;
      padding: 0;
    }
    .documento-juridico .numero-processo {
      text-align: left;
      text-indent: 0;
      font-weight: normal;
      margin: 0;
      min-height: 1.5em;
      line-height: 1.5;
    }
    .documento-juridico .enderecamento {
      text-align: center;
      font-weight: bold;
      text-indent: 0;
      text-transform: uppercase;
      margin: 0;
    }
    .documento-juridico .secao-titulo {
      font-weight: bold;
      text-align: left;
      text-indent: 0;
      /* Apenas respiro antes do tópico romano — sem “parágrafo duplo” */
      margin: 1.5em 0 0;
      padding: 0;
    }
    .documento-juridico p,
    .documento-juridico .paragrafo {
      text-align: justify;
      text-indent: 2cm;
      /* Entrelinha 1,5 já define o ritmo; sem margin extra entre parágrafos */
      margin: 0;
      padding: 0;
      white-space: normal;
    }
    .documento-juridico .secao-titulo,
    .documento-juridico .enderecamento,
    .documento-juridico .nome-acao,
    .documento-juridico .fechamento,
    .documento-juridico .numero-processo {
      text-indent: 0;
    }
    .documento-juridico .nome-acao {
      text-align: center;
      font-weight: bold;
      margin: 0;
      text-transform: uppercase;
    }
    .documento-juridico .subtopico {
      font-weight: bold;
      text-align: left;
      text-indent: 2cm;
      margin: 0;
      padding: 0;
    }
    .documento-juridico em {
      font-style: italic;
    }
    .documento-juridico .prova-item {
      text-align: justify;
      text-indent: 0;
      margin: 0;
      padding-left: 1cm;
    }
    .documento-juridico .fechamento {
      text-align: center;
      text-indent: 0;
      margin: 0;
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
      text-indent: 0;
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
    @media print {
      body { margin: 0; }
      .no-print { display: none !important; }
      /* Evita margem dupla: @page já aplica 3/2 cm */
      .documento-juridico {
        padding: 0;
        max-width: none;
        margin: 0;
      }
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
