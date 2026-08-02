/**
 * Abre PDF/Word em nova aba para não tirar o usuário da dashboard de elaboração.
 * Não passa "noopener" no 3º argumento de window.open — isso faz o browser
 * retornar null e cair no fallback de download na mesma aba.
 */

export function abrirBlobEmNovaAba(blob: Blob, nomeArquivo: string): boolean {
  const url = URL.createObjectURL(blob);
  const aba = window.open(url, "_blank");

  if (!aba) {
    // Popup bloqueado: faz download sem navegar a aba atual.
    const a = document.createElement("a");
    a.href = url;
    a.download = nomeArquivo;
    a.rel = "noopener noreferrer";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return false;
  }

  try {
    aba.opener = null;
  } catch {
    /* ignore */
  }

  // Revoga depois que a aba teve tempo de carregar o blob.
  window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
  return true;
}

/** Abre preview HTML da peça em nova aba (útil para Word / leitura). */
export function abrirPreviewHtmlEmNovaAba(
  pecaHtml: string,
  titulo = "Peça FACTO — visualização"
): boolean {
  const aba = window.open("about:blank", "_blank");
  if (!aba) return false;

  try {
    aba.opener = null;
  } catch {
    /* ignore */
  }

  aba.document.open();
  aba.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${titulo.replace(/</g, "")}</title>
  <style>
    body { margin: 0; background: #f1f5f9; font-family: system-ui, sans-serif; }
    .barra {
      position: sticky; top: 0; z-index: 10;
      display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
      padding: 12px 16px; background: #1c1917; color: #fafaf9;
      font-size: 14px;
    }
    .barra strong { color: #fbbf24; }
    .barra span { opacity: 0.85; }
    .folha {
      max-width: 21cm; margin: 24px auto; background: #fff;
      box-shadow: 0 1px 8px rgba(0,0,0,.12); padding: 0;
    }
    @media print {
      body { background: #fff; }
      .barra { display: none !important; }
      .folha { box-shadow: none; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="barra">
    <strong>FACTO</strong>
    <span>Visualização da peça — a dashboard de elaboração permanece aberta na outra aba.</span>
    <button type="button" onclick="window.print()" style="margin-left:auto;padding:8px 12px;border:0;border-radius:8px;background:#fbbf24;color:#1c1917;font-weight:600;cursor:pointer">
      Imprimir / Salvar PDF do navegador
    </button>
  </div>
  <div class="folha">${pecaHtml}</div>
</body>
</html>`);
  aba.document.close();
  return true;
}
