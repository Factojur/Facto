import type { EscritorioConfig } from "./escritorio-types";

/** Formata parágrafos dos fatos com recuo de primeira linha (padrão forense). */
function formatarParagrafos(texto: string): string {
  return texto
    .trim()
    .split(/\n\s*\n/)
    .map((p) => p.trim().replace(/\s+/g, " "))
    .filter(Boolean)
    .map((p) => `\t${p}`)
    .join("\n\n");
}

/** Aplica regras de espaçamento entre seções da peça. */
export function aplicarFormatacaoTextoJuridico(pecaBruta: string, fatos: string): string {
  const fatosFormatados = formatarParagrafos(fatos);

  return pecaBruta.replace(
    /I — DOS FATOS\n\n[\s\S]*?(?=\n\nII — DO DIREITO)/,
    `I — DOS FATOS\n\n${fatosFormatados}`
  );
}

function escapeHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function blocoParaHtml(bloco: string): string {
  const linhas = bloco.split("\n");
  const titulosSecao = /^[IVX]+ — /;
  const enderecamento = /^EXCELENTÍSSIMO|^DA COMARCA/;
  const fechamento = /^(Termos em que|Pede deferimento|\[CIDADE)/;
  const pedido = /^[a-z]\) /;

  return linhas
    .map((linha) => {
      const t = linha.trim();
      if (!t) return "<br />";

      if (titulosSecao.test(t)) {
        return `<p class="secao-titulo">${escapeHtml(t)}</p>`;
      }
      if (enderecamento.test(t) || t === t.toUpperCase() && t.length < 80 && !t.startsWith("\t")) {
        return `<p class="enderecamento">${escapeHtml(t)}</p>`;
      }
      if (fechamento.test(t) || t.startsWith("OAB/")) {
        return `<p class="fechamento">${escapeHtml(t)}</p>`;
      }
      if (pedido.test(t)) {
        return `<p class="pedido">${escapeHtml(t)}</p>`;
      }
      if (linha.startsWith("\t")) {
        return `<p class="paragrafo">${escapeHtml(t)}</p>`;
      }
      if (t.startsWith("- ")) {
        return `<p class="prova-item">${escapeHtml(t)}</p>`;
      }
      return `<p class="paragrafo">${escapeHtml(t)}</p>`;
    })
    .join("\n");
}

function gerarTimbreHtml(escritorio: EscritorioConfig): string {
  if (!escritorio.usarTimbre) return "";

  const linhas = [
    escritorio.nomeEscritorio,
    escritorio.endereco,
    escritorio.cidadeUf,
    [escritorio.telefone, escritorio.emailEscritorio].filter(Boolean).join(" · "),
    escritorio.site,
  ].filter((l): l is string => Boolean(l));

  const logo = escritorio.logoBase64
    ? `<img src="${escritorio.logoBase64}" alt="Logo do escritório" class="timbre-logo" />`
    : "";

  return `
    <header class="timbre">
      ${logo}
      <div class="timbre-texto">
        ${linhas.map((l) => `<p>${escapeHtml(l)}</p>`).join("")}
      </div>
      <hr class="timbre-linha" />
    </header>
  `;
}

export function gerarDocumentoTimbrado(
  pecaTexto: string,
  escritorio?: EscritorioConfig
): { pecaHtml: string; cssImpressao: string } {
  const corpoHtml = blocoParaHtml(pecaTexto);
  const timbre = escritorio?.usarTimbre ? gerarTimbreHtml(escritorio) : "";

  const cssImpressao = `
    @page { size: A4; margin: 3cm 2cm 2cm 3cm; }
    .documento-juridico {
      font-family: "Times New Roman", Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #000;
      max-width: 21cm;
      margin: 0 auto;
      background: #fff;
    }
    .documento-juridico .timbre {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .documento-juridico .timbre-logo {
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
    .documento-juridico .enderecamento {
      text-align: center;
      font-weight: bold;
      text-indent: 0;
      margin: 1rem 0 0.5rem;
    }
    .documento-juridico .secao-titulo {
      font-weight: bold;
      text-align: left;
      text-indent: 0;
      margin: 1.25rem 0 0.75rem;
    }
    .documento-juridico .paragrafo {
      text-align: justify;
      text-indent: 2cm;
      margin: 0 0 0.75rem;
    }
    .documento-juridico .prova-item,
    .documento-juridico .pedido {
      text-align: justify;
      text-indent: 0;
      margin: 0 0 0.5rem 1cm;
    }
    .documento-juridico .fechamento {
      text-align: center;
      text-indent: 0;
      margin: 1.5rem 0 0.25rem;
    }
    @media print {
      body { margin: 0; }
      .no-print { display: none !important; }
    }
  `;

  const pecaHtml = `
    <style>${cssImpressao}</style>
    <article class="documento-juridico">
      ${timbre}
      ${corpoHtml}
    </article>
  `;

  return { pecaHtml, cssImpressao };
}
